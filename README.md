# 🍽️ Feast Finder

**Discover amazing restaurants and restaurant week events in the San Francisco Bay Area**

Feast Finder is a modern web application built with React, Convex, and React Leaflet that helps users explore restaurant week events and discover dining experiences through an interactive map interface.

## Features

- 🎉 **Restaurant Week Events**: Browse upcoming restaurant week events with exclusive menus
- 🗺️ **Interactive Map**: Explore restaurants on an OpenStreetMap-powered interactive map
- 📍 **Location Markers**: Each restaurant is marked on the map with its exact coordinates
- 🔍 **Restaurant Details**: Click on any marker to view comprehensive restaurant information
- 💲 **Price Filtering**: Filter restaurants by price range for brunch, lunch, or dinner
- 🏷️ **Rich Metadata**: View ratings, categories, meal times, prices, and external links
- 🌙 **Dark Mode Support**: Built-in dark mode for comfortable viewing
- ⚡ **Real-time Updates**: Powered by Convex for real-time data synchronization
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌍 **Geospatial Indexing**: Efficient location-based queries using Convex Geospatial Component
- 🎯 **Viewport-Based Loading**: Dynamically fetches restaurants visible in the current map view

## Pages

### Landing Page (`/`)
The homepage showcases Feast Finder's purpose and features:
- Hero section describing the app's benefits
- Feature highlights (Interactive Map, Restaurant Week Events, Price Filtering)
- Upcoming restaurant week events with detailed descriptions
- Call-to-action buttons to explore restaurants
- Fallback messaging when no events are available

### Restaurants Page (`/restaurants`)
Interactive map interface for exploring restaurants:
- Full-screen map with restaurant markers
- Price filter panel for brunch, lunch, and dinner
- Restaurant detail modals with comprehensive information
- Geospatial viewport-based loading for performance

## Restaurant Data Model

Each restaurant includes:

- **Name**: Restaurant name
- **Rating**: Numerical rating (0-5)
- **Coordinates**: Latitude and longitude for map positioning
- **Address**: Full street address
- **Website URL**: Link to restaurant's official website
- **Yelp URL**: Link to restaurant's Yelp page
- **OpenTable URL**: Link to restaurant's OpenTable reservation page
- **Categories**: Array of cuisine/style tags (e.g., "Italian", "Fine Dining")
- **Meal Times**: Boolean flags for brunch, lunch, and dinner availability
- **Pricing**: Average prices for brunch, lunch, and dinner services

## Event Data Model

Each restaurant week event includes:

- **Name**: Event name
- **Description**: Detailed description of the event
- **Dates**: Start and end dates (ISO format)
- **Location**: Event location description
- **City**: City name for filtering
- **Coordinates**: Latitude and longitude for location-based features
- **Restaurant IDs**: Array of participating restaurant IDs
- **Image URL**: Optional event image

## Tech Stack

### Frontend

- **React 19**: Modern React with hooks
- **TanStack Router**: File-based routing with SSR support
- **TanStack Query**: Data fetching and caching
- **React Leaflet**: Interactive map component
- **Chakra UI v3**: Component library for UI
- **Tailwind CSS v4**: Utility-first styling

### Backend

- **Convex**: Serverless backend and database
- **Convex Geospatial Component**: Efficient spatial indexing and queries
- **TypeScript**: Type-safe code throughout

### Deployment

- **Netlify**: Serverless deployment with edge functions

## Getting Started

### Prerequisites

- Node.js v22 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm ci

# Start development server (requires Convex setup)
npm run dev

# Build for production
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

### Convex Setup

On first run, you'll need to set up Convex:

```bash
npx convex dev
```

This will:

1. Prompt you to create or log into a Convex account
2. Create a new Convex project
3. Generate a `.env.local` file with your Convex deployment URL
4. Start the Convex development server

The app automatically seeds sample restaurant and event data on first load.

## Project Structure

```
feast-finder/
├── convex/
│   ├── events.ts            # Event queries and mutations
│   ├── restaurants.ts       # Restaurant queries and mutations
│   ├── restaurantsGeo.ts    # Geospatial queries
│   ├── seedData.ts          # Sample data seeding
│   ├── schema.ts            # Database schema definition
│   └── _generated/          # Auto-generated Convex types
├── src/
│   ├── components/
│   │   ├── RestaurantMap.tsx    # Interactive map component
│   │   ├── RestaurantDetail.tsx # Restaurant detail modal
│   │   ├── PriceFilter.tsx      # Price filtering component
│   │   └── ColorModeToggle.tsx  # Dark mode toggle
│   ├── routes/
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Landing page with events
│   │   └── restaurants.tsx   # Interactive map page
│   └── styles/
│       └── app.css          # Global styles
└── public/                  # Static assets
```

## Sample Data

### Restaurants

The application includes 10 curated San Francisco Bay Area restaurants:

- The French Laundry (Yountville)
- Zuni Café
- State Bird Provisions
- Tartine Bakery
- Gary Danko
- Nopa
- La Taqueria
- Swan Oyster Depot
- Flour + Water
- Mama's on Washington Square

### Restaurant Week Events

The application includes 5 sample restaurant week events:

- **SF Restaurant Week** (Jan 15-31, 2025): Multi-course prix-fixe menus across SF
- **North Beach Italian Festival Week** (Feb 1-14, 2025): Italian cuisine celebration
- **Bay Area Seafood Week** (Feb 15-22, 2025): Fresh seafood and sustainable catches
- **Mission District Food Crawl** (Mar 1-15, 2025): Diverse Mission neighborhood flavors
- **Wine Country Fine Dining Week** (Mar 20-31, 2025): Michelin-starred experiences in Napa

## Development

### Available Commands

```bash
npm run dev         # Start dev server with Convex
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run TypeScript and ESLint checks
npm run format      # Format code with Prettier
```

### Adding New Restaurants

Use the `addRestaurant` mutation from the Convex dashboard or by calling:

```typescript
const addRestaurant = useMutation(api.myFunctions.addRestaurant)

addRestaurant({
  name: 'Restaurant Name',
  rating: 4.5,
  latitude: 37.7749,
  longitude: -122.4194,
  address: '123 Main St, San Francisco, CA',
  websiteUrl: 'https://example.com',
  yelpUrl: 'https://yelp.com/...',
  openTableUrl: 'https://opentable.com/...',
  categories: ['Italian', 'Fine Dining'],
  hasBrunch: true,
  hasLunch: true,
  hasDinner: true,
  brunchPrice: 40,
  lunchPrice: 35,
  dinnerPrice: 75,
})
```

### Filtering Restaurants by Price

The price filtering feature allows users to filter restaurants based on their meal prices:

1. Click the "💲 Filter by Price" button on the map
2. Enter min/max prices for any meal type (brunch, lunch, dinner)
3. Click "Apply Filters" to see restaurants matching your criteria
4. Click "Clear" to remove all filters

**How it works:**

- Restaurants matching ANY of the specified meal type criteria are displayed (OR logic)
- For example, filtering by "Brunch $20-$40" shows all restaurants with brunch prices between $20-$40
- You can filter by multiple meal types simultaneously - restaurants matching any of the criteria will be shown
- Price filtering works seamlessly with the map viewport filtering
- Only restaurants that serve the specified meal type and meet the price criteria are included

## Geospatial Integration

Feast Finder uses the Convex Geospatial Component for efficient location-based queries. This enables:

- Fast queries for restaurants within the current map viewport
- Finding nearest restaurants to any point
- Automatic data synchronization when adding new restaurants

For detailed documentation on the geospatial integration, see [GEOSPATIAL.md](./GEOSPATIAL.md).

## Contributing

This is a demonstration project. Feel free to fork and customize for your own use!

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Restaurant data is fictional/sample data for demonstration purposes
- Map tiles provided by OpenStreetMap contributors
- Built with the TanStack Start + Convex template
