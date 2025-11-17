# Geospatial Integration Documentation

## Overview

Feast Finder uses the [Convex Geospatial Component](https://www.convex.dev/components/geospatial) to efficiently store and query restaurant locations. This enables fast queries for restaurants within a map viewport and finding nearby restaurants.

## Architecture

### Backend Components

#### 1. Geospatial Index Setup

**File:** `convex/geospatial.ts`

```typescript
import { GeospatialIndex } from '@convex-dev/geospatial'
import { components } from './_generated/api'
import type { Id } from './_generated/dataModel'

export const restaurantsIndex = new GeospatialIndex<
  Id<'restaurants'>,
  { categories: Array<string> }
>(components.geospatial)
```

The geospatial index is configured with:

- **Key**: Restaurant ID (`Id<'restaurants'>`)
- **Filters**: Categories array for filtering by cuisine type
- **Sort Key**: Restaurant rating (used for ordering results)

#### 2. Configuration

**File:** `convex/convex.config.ts`

```typescript
import { defineApp } from 'convex/server'
import geospatial from '@convex-dev/geospatial/convex.config'

const app = defineApp()
app.use(geospatial)

export default app
```

This registers the geospatial component with your Convex application.

### Available Queries

#### Query Restaurants in Map Bounds

**Function:** `api.restaurantsGeo.queryRestaurantsInBounds`

Efficiently retrieves only restaurants visible in the current map viewport with optional price and category filtering.

**Usage:**

```typescript
const { data: result } = useSuspenseQuery(
  convexQuery(api.restaurantsGeo.queryRestaurantsInBounds, {
    bounds: {
      north: 37.8,
      south: 37.7,
      east: -122.3,
      west: -122.5,
    },
    limit: 100, // optional, defaults to 100
    cursor: undefined, // optional, for pagination
    // Optional price filters (for premium users)
    minBrunchPrice: 20,
    maxBrunchPrice: 50,
    minLunchPrice: 15,
    maxLunchPrice: 40,
    minDinnerPrice: 30,
    maxDinnerPrice: 80,
    // Optional category filter
    categories: ['Italian', 'French'], // optional array of categories
  }),
)

// result contains:
// - results: Array of full restaurant objects
// - nextCursor: Optional cursor for pagination
```

**Implementation Details:**

- Uses geospatial index rectangle query for efficient spatial lookup
- Fetches full restaurant details for each ID returned by the index
- Supports pagination via cursor parameter
- Supports price range filtering for brunch, lunch, and dinner
- Supports category filtering by cuisine types
- Returns structured data with restaurant objects and optional nextCursor
- Price and category filters use OR logic (matches any criteria)

#### Query Restaurants with Authentication

**Function:** `api.restaurantsGeo.queryRestaurantsInBoundsWithAuth`

Action-based query that includes server-side premium feature validation. This ensures that advanced filtering features are properly gated.

**Usage:**

```typescript
const { data: result } = useSuspenseQuery(
  convexQuery(api.restaurantsGeo.queryRestaurantsInBoundsWithAuth, {
    bounds: { /* ... */ },
    // ... same parameters as queryRestaurantsInBounds
  }),
)
```

**Note**: This is an action (not a query) because it needs to perform external authentication checks via the Autumn API.

### Data Synchronization

#### Automatic Sync on Insert

**File:** `convex/restaurants.ts`

When restaurants are inserted (e.g., via scraped data from Firecrawl), they're automatically synced to the geospatial index:

```typescript
// From storeScrapedRestaurants internal mutation
if (restaurantData.latitude && restaurantData.longitude) {
  await ctx.scheduler.runAfter(
    0,
    internal.restaurantsGeo.syncRestaurantToIndex,
    {
      restaurantId,
    },
  )
}
```

#### Seeding Data

**File:** `convex/seedData.ts`

The seed function automatically syncs all seeded restaurants to the geospatial index:

```typescript
export const seedRestaurants = mutation({
  handler: async (ctx) => {
    // Insert restaurants
    const restaurantIds = []
    for (const restaurant of restaurants) {
      const id = await ctx.db.insert('restaurants', restaurant)
      restaurantIds.push(id)
    }

    // Sync all to geospatial index
    for (const id of restaurantIds) {
      await ctx.scheduler.runAfter(
        0,
        internal.restaurantsGeo.syncRestaurantToIndex,
        {
          restaurantId: id,
        },
      )
    }
  },
})
```

#### Manual Sync for Existing Data

For new restaurants added to the database, they are automatically synced to the geospatial index when created. However, if you need to manually sync a specific restaurant, you can use:

**Function:** `internal.restaurantsGeo.syncRestaurantToIndex`

**Visibility**: Internal only - can only be called from backend, Convex dashboard, or other internal functions

**From Convex Dashboard:**

1. Open [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to Functions → restaurantsGeo.ts
3. Find `syncRestaurantToIndex` (listed under "Internal Mutations")
4. Click "Run" with the restaurant ID: `{ "restaurantId": "<restaurant_id>" }`
5. Check the result to confirm successful sync

**From Backend/Scheduled Functions:**

```typescript
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const syncSpecificRestaurant = internalAction({
  args: { restaurantId: v.id('restaurants') },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.restaurantsGeo.syncRestaurantToIndex, {
      restaurantId: args.restaurantId,
    })
    console.log(`Synced restaurant ${args.restaurantId}`)
    return null
  },
})
```

**Security**: This is an internal-only function because it performs database operations and should not be exposed to the frontend.

**Note**: The old bulk sync function `syncAllRestaurantsToIndex` has been removed. All restaurants are now automatically synced when created via `seedRestaurants` or through the Firecrawl integration.

### Frontend Integration

#### Map Bounds Tracking

**File:** `src/components/RestaurantMap.tsx`

The map component tracks viewport changes and reports bounds to the parent:

```typescript
function MapEventsHandler() {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        })
      }
    },
  })

  // Set initial bounds on mount
  useEffect(() => {
    if (onBoundsChange) {
      const bounds = map.getBounds()
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
    }
  }, [map])

  return null
}
```

#### Dynamic Restaurant Loading

**File:** `src/routes/restaurants.tsx`

The restaurants page dynamically fetches restaurants based on the current map viewport with optional filters:

```typescript
function RestaurantsPage() {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const [priceFilters, setPriceFilters] = useState<PriceFilters>({})
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Fetch geospatial results with filters
  const { data: geoRestaurantsResult } = useSuspenseQuery(
    convexQuery(api.restaurantsGeo.queryRestaurantsInBounds, {
      bounds: mapBounds ?? { north: 0, south: 0, east: 0, west: 0 },
      minBrunchPrice: priceFilters.minBrunchPrice,
      maxBrunchPrice: priceFilters.maxBrunchPrice,
      minLunchPrice: priceFilters.minLunchPrice,
      maxLunchPrice: priceFilters.maxLunchPrice,
      minDinnerPrice: priceFilters.minDinnerPrice,
      maxDinnerPrice: priceFilters.maxDinnerPrice,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    }),
  )

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  return (
    <RestaurantMap
      restaurants={geoRestaurantsResult.results}
      onBoundsChange={handleBoundsChange}
    />
  )
}
```

**Key Features:**
- Viewport-based loading for performance
- Price range filtering (premium feature)
- Category filtering (premium feature)
- Real-time updates when filters or map bounds change

## Benefits

1. **Performance**: Only fetches restaurants visible in the current viewport
2. **Scalability**: Efficiently handles large numbers of restaurants
3. **Real-time**: Convex provides automatic reactivity - restaurant updates appear instantly
4. **Flexible Queries**: Supports both rectangle (viewport) and nearest-point queries
5. **Pagination**: Built-in support for paginating through large result sets

## Testing

### Test with Various Coordinates

The geospatial queries have been tested with:

1. **San Francisco Bay Area** (default view)
   - Latitude: 37.7749, Longitude: -122.4194
   - Includes all 10 sample restaurants

2. **Zoomed In** (small viewport)
   - Tests efficient filtering to smaller sets

3. **Panned Away** (no restaurants)
   - Tests empty result handling

4. **Nearest Restaurant Queries**
   - Various coordinates to validate distance calculations
   - Distance returned in meters for each result

## Migration Notes

### Data Format Changes

The geospatial integration maintains backward compatibility with the existing schema:

- No changes required to the `restaurants` table schema
- Latitude and longitude fields remain unchanged
- Geospatial index is a separate layer on top of existing data

### First-Time Setup

On first load:

1. Application checks for existing restaurants
2. If no restaurants exist, runs automatic seeding via `seedRestaurants`
3. All restaurants are automatically synced to geospatial index during seeding
4. Future restaurant additions (via Firecrawl or manual creation) automatically sync

### Troubleshooting

If restaurants don't appear:

1. Check browser console for sync status logs
2. Verify Convex deployment has the geospatial component installed
3. Check that restaurants have valid latitude/longitude values
4. Verify geospatial component is registered in `convex/convex.config.ts`
5. If needed, manually sync a specific restaurant using `syncRestaurantToIndex` from Convex dashboard

## Performance Considerations

1. **Index Query Limits**: Default limit is 100 restaurants per query
2. **S2 Cell Configuration**: Uses default settings for spatial indexing
3. **Category Filtering**: Available via categories array in restaurant data
4. **Price Filtering**: Supported via optional price parameters in query
5. **Authentication**: Premium feature validation handled via separate action for server-side checks

## Future Enhancements

Potential improvements:

1. Add category filtering to viewport queries
2. Implement clustering for large numbers of nearby restaurants
3. Add distance-based search radius UI control
4. Cache geospatial queries on client side
5. Add search by address/place name with geocoding
