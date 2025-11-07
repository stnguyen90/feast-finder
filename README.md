# 🍽️ Feast Finder

**Discover amazing restaurants on an interactive map**

Feast Finder is a modern web application built with React, Convex, and React Leaflet that helps users explore and discover restaurants in the San Francisco Bay Area through an interactive map interface.

## Features

- 🗺️ **Interactive Map**: Explore restaurants on an OpenStreetMap-powered interactive map
- 📍 **Location Markers**: Each restaurant is marked on the map with its exact coordinates
- 🔍 **Restaurant Details**: Click on any marker to view comprehensive restaurant information
- 🏷️ **Rich Metadata**: View ratings, categories, meal times, prices, and external links
- 🌙 **Dark Mode Support**: Built-in dark mode for comfortable viewing
- ⚡ **Real-time Updates**: Powered by Convex for real-time data synchronization
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

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

## Tech Stack

### Frontend
- **React 19**: Modern React with hooks
- **TanStack Router**: File-based routing with SSR support
- **TanStack Query**: Data fetching and caching
- **React Leaflet**: Interactive map component
- **Tailwind CSS v4**: Utility-first styling

### Backend
- **Convex**: Serverless backend and database
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

The app automatically seeds sample restaurant data on first load.

## Project Structure

```
feast-finder/
├── convex/
│   ├── myFunctions.ts       # Backend queries and mutations
│   ├── schema.ts            # Database schema definition
│   └── _generated/          # Auto-generated Convex types
├── src/
│   ├── components/
│   │   ├── RestaurantMap.tsx    # Interactive map component
│   │   └── RestaurantDetail.tsx # Restaurant detail modal
│   ├── routes/
│   │   ├── __root.tsx       # Root layout
│   │   └── index.tsx        # Homepage
│   └── styles/
│       └── app.css          # Global styles
└── public/                  # Static assets
```

## Sample Data

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
  name: "Restaurant Name",
  rating: 4.5,
  latitude: 37.7749,
  longitude: -122.4194,
  address: "123 Main St, San Francisco, CA",
  websiteUrl: "https://example.com",
  yelpUrl: "https://yelp.com/...",
  openTableUrl: "https://opentable.com/...",
  categories: ["Italian", "Fine Dining"],
  hasBrunch: true,
  hasLunch: true,
  hasDinner: true,
  brunchPrice: 40,
  lunchPrice: 35,
  dinnerPrice: 75,
})
```

## Contributing

This is a demonstration project. Feel free to fork and customize for your own use!

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Restaurant data is fictional/sample data for demonstration purposes
- Map tiles provided by OpenStreetMap contributors
- Built with the TanStack Start + Convex template
