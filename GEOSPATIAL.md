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

Efficiently retrieves only restaurants visible in the current map viewport.

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
- Returns structured data with restaurant objects and optional nextCursor

#### Query Nearest Restaurants

**Function:** `api.restaurantsGeo.queryNearestRestaurants`

Finds restaurants closest to a specific point, useful for "find restaurants near me" functionality.

**Usage:**

```typescript
const { data: nearbyRestaurants } = useSuspenseQuery(
  convexQuery(api.restaurantsGeo.queryNearestRestaurants, {
    latitude: 37.7749,
    longitude: -122.4194,
    maxResults: 10, // optional, defaults to 10
    maxDistanceMeters: 5000, // optional, limits search radius
  }),
)

// Each restaurant includes a 'distance' field in meters
```

**Implementation Details:**

- Uses geospatial index nearest neighbor search
- Returns restaurants sorted by distance
- Each result includes distance in meters from query point
- Optional maxDistanceMeters parameter improves performance

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

**Function:** `internal.restaurantsGeo.syncAllRestaurantsToIndex`

**Visibility**: Internal only - can only be called from backend, Convex dashboard, or other internal functions

For migrating existing restaurants to the geospatial index:

**From Convex Dashboard:**

1. Open [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to Functions → restaurantsGeo.ts
3. Find `syncAllRestaurantsToIndex` (listed under "Internal Mutations")
4. Click "Run" with empty parameters: `{}`
5. Check the result: `{ "synced": <number> }`

**From Backend/Scheduled Functions:**

```typescript
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const migrateRestaurants = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const result = await ctx.runMutation(
      internal.restaurantsGeo.syncAllRestaurantsToIndex,
      {},
    )
    console.log(`Synced ${result.synced} restaurants`)
    return null
  },
})
```

**Security**: This is an internal-only function because it performs bulk database migration and should not be exposed to the frontend.

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

**File:** `src/routes/index.tsx`

The homepage dynamically fetches restaurants based on the current map viewport:

```typescript
function Home() {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)

  // Fetch all restaurants (for seeding check)
  const { data: allRestaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.listRestaurants, {}),
  )

  // Fetch geospatial results when bounds are available
  const { data: geoRestaurantsResult } = useSuspenseQuery(
    convexQuery(api.restaurantsGeo.queryRestaurantsInBounds, {
      bounds: mapBounds ?? { north: 0, south: 0, east: 0, west: 0 },
    }),
  )

  // Use geospatial results if bounds are set
  const restaurants = mapBounds !== null
    ? geoRestaurantsResult.results
    : allRestaurants

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  return (
    <RestaurantMap
      restaurants={restaurants}
      onBoundsChange={handleBoundsChange}
    />
  )
}
```

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

On first load with existing data:

1. Application checks for existing restaurants
2. If restaurants exist but not in geospatial index, runs one-time sync
3. Uses localStorage to track if sync has completed
4. All future restaurant additions automatically sync

### Troubleshooting

If restaurants don't appear:

1. Check browser console for sync status logs
2. Verify Convex deployment has the geospatial component installed
3. Manually call `syncAllRestaurantsToIndex()` from Convex dashboard (under Internal Mutations)
4. Check that restaurants have valid latitude/longitude values

## Performance Considerations

1. **Index Query Limits**: Default limit is 100 restaurants per query
2. **S2 Cell Configuration**: Uses default settings (minLevel: 4, maxLevel: 16)
3. **Sort Key**: Uses restaurant rating for result ordering
4. **Filter Keys**: Categories array available for future filtering features

## Future Enhancements

Potential improvements:

1. Add category filtering to viewport queries
2. Implement clustering for large numbers of nearby restaurants
3. Add distance-based search radius UI control
4. Cache geospatial queries on client side
5. Add search by address/place name with geocoding
