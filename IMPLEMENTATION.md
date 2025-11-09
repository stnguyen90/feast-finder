# Feast Finder - Implementation Summary

## Application Overview

Feast Finder is an interactive restaurant discovery application with two main pages:
1. **Landing Page** (`/`): Showcases restaurant week events and app features
2. **Restaurants Page** (`/restaurants`): Interactive map for exploring restaurants

Users can discover restaurant week events on the landing page and explore participating restaurants on the interactive map.

## Key Features Implemented

### 1. Landing Page (index.tsx)

**Purpose**: Introduce the app and display upcoming restaurant week events

- Hero section with app description and call-to-action
- Three feature highlights:
  - Interactive Map
  - Restaurant Week Events
  - Filter by Price
- Event listing section showing active and upcoming events:
  - Event name with "Active Now" badge for current events
  - Location and description
  - Start and end dates
  - Number of participating restaurants
  - Call-to-action button to view restaurants
- Fallback messaging when no events are available
- Auto-seeds event data on first load
- Footer with copyright notice
- Responsive layout using Chakra UI Container and Flex components

### 2. Restaurants Page (restaurants.tsx)

**Purpose**: Interactive map interface for exploring restaurants

- Full-screen map layout
- Shows "Feast Finder" title with fork/knife emoji
- Subtitle explaining the map interface
- Auto-seeds sample data on first load
- **Price Filter Panel**: Toggle button to show/hide price filters
- Renders map and handles restaurant selection
- URL state management for filters and map position

### 3. Interactive Map (RestaurantMap.tsx)

- Uses React Leaflet for map rendering
- Centered on San Francisco (37.7749, -122.4194)
- Displays restaurant markers at their exact coordinates
- Click markers to open detail modal
- Popup preview shows name, rating, and address

### 4. Restaurant Detail Modal (RestaurantDetail.tsx)

- Full-screen overlay modal
- Displays comprehensive restaurant information:
  - Name and rating with star emoji
  - Full address
  - Categories as blue tags
  - Meal times (Brunch/Lunch/Dinner) with prices as green tags
  - External links (Website, Yelp, OpenTable) with emojis
- Close button to dismiss
- Dark mode support

### 5. Backend (Convex)

#### Schema (schema.ts)

Defines restaurants table with:

- name (string)
- rating (number)
- latitude, longitude (numbers)
- address (string)
- websiteUrl, yelpUrl, openTableUrl (optional strings)
- categories (array of strings)
- hasBrunch, hasLunch, hasDinner (booleans)
- brunchPrice, lunchPrice, dinnerPrice (optional numbers)
- Index on name field

#### Geospatial Integration

- **Configuration** (convex.config.ts): Registers Convex Geospatial Component
- **Index Setup** (geospatial.ts): Creates geospatial index for restaurant locations
- **Geospatial Queries** (restaurantsGeo.ts):
  - **queryRestaurantsInBounds**: Query restaurants within map viewport (rectangle)
  - **queryNearestRestaurants**: Find nearest restaurants to a specific point
  - **syncRestaurantToIndex**: Internal mutation to sync restaurants to geospatial index
  - **syncAllRestaurantsToIndex**: Migration helper for existing data

#### Functions (restaurants.ts)

- **listRestaurants**: Query to get all restaurants
- **listRestaurantsWithPriceFilter**: Query to filter restaurants by price ranges
  - Accepts optional min/max prices for brunch, lunch, and dinner
  - Uses OR logic: restaurants matching ANY meal type criteria are returned
  - Only shows restaurants that have the specified meal type with prices in range
- **getRestaurant**: Query to get single restaurant by ID
- **addRestaurant**: Mutation to add new restaurant (auto-syncs to geospatial index)

#### Event Functions (events.ts)

- **listActiveEvents**: Query to get all active and upcoming restaurant week events
  - Filters events by end date (only future/current events)
  - Returns events sorted by start date
  - Includes restaurant count for each event
- **listEventsByCity**: Query to get events filtered by city
  - Accepts city parameter for location-specific filtering
  - Returns active events for the specified city
- **getEvent**: Query to get single event by ID
- **addEvent**: Mutation to add new restaurant week event

#### Seed Data (seedData.ts)

- **seedRestaurants**: Mutation to populate sample data (10 SF Bay Area restaurants, auto-syncs to geospatial index)
- **seedEvents**: Mutation to populate sample event data (5 restaurant week events in SF Bay Area)
  - Resolves restaurant IDs by name
  - Associates events with participating restaurants

### 6. Sample Data

**Restaurants**: 10 curated San Francisco Bay Area restaurants:

1. The French Laundry (Yountville) - French Fine Dining
2. Zuni Café - American/Mediterranean/Italian
3. State Bird Provisions - American/Contemporary/Dim Sum
4. Tartine Bakery - Bakery/Café/Breakfast
5. Gary Danko - French/American Fine Dining
6. Nopa - American/California Cuisine
7. La Taqueria - Mexican/Tacos/Burritos
8. Swan Oyster Depot - Seafood/Oyster Bar
9. Flour + Water - Italian/Pasta
10. Mama's on Washington Square - Breakfast/Brunch/American

**Restaurant Week Events**: 5 sample events:

1. **SF Restaurant Week** (5 participating restaurants)
2. **North Beach Italian Festival Week** (2 participating restaurants)
3. **Bay Area Seafood Week** (3 participating restaurants)
4. **Mission District Food Crawl** (3 participating restaurants)
5. **Wine Country Fine Dining Week** (1 participating restaurant)

## User Flow

### Landing Page Flow

1. User visits the homepage (`/`)
2. Landing page displays hero section with app description
3. Three feature highlights explain the app's capabilities
4. If no events exist, app automatically seeds sample event data
5. Events section displays active and upcoming restaurant week events:
   - Event cards show name, location, dates, description
   - "Active Now" badge appears for current events
   - Restaurant count displayed for each event
   - Call-to-action button to view participating restaurants
6. User clicks "Explore Restaurants on Map" or event CTA to navigate to `/restaurants`
7. If no events are available, fallback message is displayed

### Restaurants Page Flow

1. User visits `/restaurants` (either directly or from landing page)
2. If no restaurants exist, app automatically seeds sample data
3. If restaurants exist but aren't in geospatial index, app automatically syncs them (one-time)
4. Map displays with restaurant markers in San Francisco
5. As user pans/zooms the map:
   - App detects viewport bounds changes
   - Queries geospatial index for restaurants in current viewport
   - Updates markers to show only visible restaurants (optimized performance)
6. User can:
   - Pan and zoom the map
   - Click any marker to open detailed modal
   - **Open price filter panel** to filter restaurants by meal prices
7. When using price filters:
   - Click "💲 Filter by Price" button to show filter panel
   - Enter min/max prices for desired meal types (brunch, lunch, dinner)
   - Click "Apply Filters" to update the map
   - Restaurants matching ANY of the price criteria are shown
   - Price filtering combines with viewport filtering
   - Click "Clear" to remove filters, or "Hide Filters" to collapse panel
8. In the modal, user sees:
   - Restaurant name and rating
   - Full address
   - Category tags (e.g., "Italian", "Fine Dining")
   - Available meal times with prices
   - Links to website, Yelp, and OpenTable
9. User clicks X or outside modal to close
10. User can select another restaurant

## Technical Highlights

- **Type Safety**: Full TypeScript with strict types
- **Real-time**: Convex provides real-time data synchronization
- **Responsive**: Chakra UI and Tailwind CSS ensure mobile-friendly design
- **SSR**: TanStack Start provides server-side rendering
- **Map Integration**: React Leaflet with OpenStreetMap tiles
- **Dark Mode**: Built-in support via Chakra UI
- **Auto-seeding**: Convenient sample data for testing
- **Geospatial Indexing**: Efficient location-based queries using S2 cell indexing
- **Viewport-Based Loading**: Dynamic restaurant fetching based on map bounds
- **Performance Optimized**: Only loads restaurants visible in current viewport

## Build & Deployment

- ✅ Passes TypeScript compilation
- ✅ Passes ESLint checks
- ✅ Builds successfully for production
- ✅ Generates optimized client and server bundles
- ✅ Ready for Netlify deployment

## Files Modified/Created

### Modified:

- `convex/schema.ts` - Added events table to restaurant data model
- `convex/restaurants.ts` - Backend queries and mutations (added geospatial sync)
- `convex/seedData.ts` - Seed functions (added event seeding and geospatial sync)
- `src/routes/index.tsx` - **Completely reimplemented as landing page** with event showcase
- `src/components/RestaurantMap.tsx` - Map component (moved MapBounds type here)
- `package.json` - Added geospatial component dependency
- `README.md` - Updated with landing page, events, and new page structure
- `IMPLEMENTATION.md` - Updated with event features and new user flow

### Created:

- `convex/events.ts` - Event query and mutation functions
- `src/routes/restaurants.tsx` - **New route** with interactive map (moved from index.tsx)
- `convex/convex.config.ts` - Convex app configuration with geospatial component
- `convex/geospatial.ts` - Geospatial index setup
- `convex/restaurantsGeo.ts` - Geospatial query functions
- `GEOSPATIAL.md` - Comprehensive geospatial integration documentation
- `src/components/RestaurantDetail.tsx` - Detail modal component
- `src/components/ColorModeToggle.tsx` - Theme toggle component
- `src/components/PriceFilter.tsx` - Price filtering component with min/max inputs

## Visual Design

### Color Scheme:

- Background: Light gray (light mode) / Dark gray (dark mode)
- Primary text: Gray-900 (light) / Gray-100 (dark)
- Categories: Blue tags (bg-blue-100/900)
- Meal times: Green tags (bg-green-100/900)
- Links: Blue-600 (light) / Blue-400 (dark)
- Rating: Yellow-500/600 with star emoji

### Layout:

- Full-width container with padding
- Centered title and subtitle
- 600px height map with rounded corners and shadow
- Modal: Centered overlay with max-width 2xl
- Responsive padding and spacing throughout

## Next Steps for Enhancement

Potential future improvements:

- ~~Add search/filter functionality~~ ✅ **Price filtering implemented**
- Add distance/radius filtering
- Add user authentication and favorites
- Add review system
- Add more restaurant data (hours, phone, photos)
- Add clustering for many restaurants
- Add directions/navigation integration
- Add restaurant comparison feature
- Add category/cuisine filtering
- Add rating filtering
