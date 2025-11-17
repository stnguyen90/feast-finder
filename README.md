# 🍽️ Feast Finder

**Discover amazing restaurants and restaurant week events in the San Francisco Bay Area**

Feast Finder is a modern web application built with React, Convex, and React Leaflet that helps users explore restaurant week events and discover dining experiences through an interactive map interface.

## Built For TanStack Start Hackathon

Feast Finder was created for the [TanStack Start Hackathon](https://www.convex.dev/hackathons/tanstack), showcasing the power of modern web technologies and seamless integrations.

### Sponsors & Technologies

This project leverages cutting-edge tools and services provided by our generous hackathon sponsors:

- **[TanStack Start](https://tanstack.com/start)**: The core framework powering our full-stack application with server-side rendering, file-based routing, and seamless data fetching
- **[Convex](https://www.convex.dev/)**: Our serverless database platform providing real-time data synchronization, backend functions, and geospatial indexing
- **[CodeRabbit](https://coderabbit.ai/)**: AI-powered pull request review bot ensuring code quality and catching potential issues
- **[Firecrawl](https://www.firecrawl.dev/)**: Used to extract structured data from restaurant week websites to populate our Convex database
- **[Netlify](https://www.netlify.com/)**: Our web hosting platform with edge functions and continuous deployment
- **[Autumn](https://www.getautumn.com/)**: Payment processing for premium access features
- **[Sentry](https://sentry.io/)**: Integrated error tracking, performance monitoring, and user feedback for both client and server
- **[Cloudflare](https://www.cloudflare.com/)**: Proxy layer providing analytics, DDoS protection, and intelligent caching

## Features

### Free Features

- 🔐 **User Authentication**: Sign up and sign in to create a personalized experience
- 🎉 **Restaurant Week Events**: Browse upcoming restaurant week events with exclusive menus
- 🕷️ **Web Scraping Integration**: Automatically extract restaurant data from event websites using Firecrawl
- 🗺️ **Interactive Map**: Explore restaurants on an OpenStreetMap-powered interactive map
- 📍 **Location Markers**: Each restaurant is marked on the map with its exact coordinates
- 🔍 **Restaurant Details**: Click on any marker to view comprehensive restaurant information
- 📊 **Rich Metadata**: View ratings, categories, meal times, prices, and external links
- 🌙 **Dark Mode Support**: Built-in dark mode for comfortable viewing
- ⚡ **Real-time Updates**: Powered by Convex for real-time data synchronization
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌍 **Geospatial Indexing**: Efficient location-based queries using Convex Geospatial Component
- 🎯 **Viewport-Based Loading**: Dynamically fetches restaurants visible in the current map view

### Premium Features ⭐

**Free Tier:**
- 💲 **Single Filter**: Filter by ONE price range OR ONE category at a time
- 🏷️ **Basic Filtering**: Choose one cuisine type or one meal price range
- 🗺️ **Map Filtering**: Always available - filter by map viewport

**Premium Tier:**
- 💲 **Advanced Price Filtering**: Filter restaurants by multiple price ranges (brunch, lunch, and dinner) simultaneously
- 🏷️ **Multi-Category Filtering**: Filter by multiple cuisine types at once
- 🔀 **Combined Search**: Combine price and category filters for precise results
- 📊 **Unlimited Filters**: Use as many filters as you want together

Premium access is managed through [Autumn](https://docs.useautumn.com) for seamless subscription and payment handling.

## Pages

### Landing Page (`/`)

The homepage showcases Feast Finder's purpose and features:

- Hero section describing the app's benefits
- Feature highlights (Interactive Map, Restaurant Week Events, Price Filtering)
- Upcoming restaurant week events with detailed descriptions
- Call-to-action buttons to explore restaurants by event
- Fallback messaging when no events are available

### Event Pages (`/events/$eventName`)

Dynamic pages that show restaurants participating in specific events:

- Event information banner with dates and restaurant count
- Interactive map showing only restaurants in that event
- Full restaurant details via click-through modals
- Event-specific filtering based on menu participation

### Restaurants Page (`/restaurants`)

Interactive map interface for exploring all restaurants:

- Full-screen map with restaurant markers
- Price filter panel for brunch, lunch, and dinner
- Category filter panel to filter by cuisine types
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
- **Pricing**: Average prices for brunch, lunch, and dinner services (optional, meal availability is implied by presence of price)

## Event Data Model

Each restaurant week event includes:

- **Name**: Event name
- **Dates**: Start and end dates (ISO format)
- **Coordinates**: Latitude and longitude for location-based features
- **Website URL**: Link to event's official website (optional)
- **Sync Time**: Timestamp of last data synchronization

Events are linked to restaurants through the **menus** table, which stores:
- **Restaurant ID**: Reference to the restaurant
- **Event ID**: Reference to the event
- **Meal**: Type of meal (brunch, lunch, or dinner)
- **Price**: Price for this specific menu
- **Menu URL**: Link to menu PDF or image (optional)
- **Sync Time**: Timestamp of last update

## Tech Stack

### Frontend

- **React 19**: Modern React with hooks
- **TanStack Router**: File-based routing with SSR support
- **TanStack Query**: Data fetching and caching
- **React Leaflet**: Interactive map component
- **Chakra UI v3**: Component library for UI
- **Tailwind CSS v4**: Utility-first styling
- **Sentry**: Error tracking, performance monitoring, and user feedback

### Backend

- **Convex**: Serverless backend and database
- **Convex Geospatial Component**: Efficient spatial indexing and queries
- **TypeScript**: Type-safe code throughout
- **Sentry**: Server-side error tracking and logging

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

### Authentication Setup

Feast Finder uses Convex Auth for secure user authentication:

1. Generate JWT keys by running `node generateKeys.mjs` (see AUTHENTICATION.md for script)

2. After running `npx convex dev`, configure environment variables:
   - Go to your Convex dashboard at `https://dashboard.convex.dev`
   - Navigate to your project's Settings → Environment Variables
   - Add `JWT_PRIVATE_KEY` and `JWKS` from the generated output
   - Optionally add `SITE_URL` (only needed for OAuth, not for password auth)

3. Run `npx convex codegen` to regenerate types after setting up authentication

For complete setup instructions, see [AUTHENTICATION.md](./AUTHENTICATION.md).

**Authentication Features:**

- 🔐 Email and password sign-up and sign-in
- 👤 User profile display in header
- 🚪 Sign out functionality
- 🔄 Real-time authentication state updates
- 🔒 Secure password hashing and session management

### Autumn Setup (Premium Features)

Feast Finder uses [Autumn](https://docs.useautumn.com) for premium access management:

1. Sign up for Autumn at [app.useautumn.com](https://app.useautumn.com)

2. Get your API key from the Autumn Dashboard:
   - Navigate to Settings → API Keys
   - Copy your test secret key (starts with `am_sk_`)

3. Add to Convex Dashboard environment variables:
   - Go to `https://dashboard.convex.dev`
   - Navigate to your project's Settings → Environment Variables
   - Add `AUTUMN_SECRET_KEY` with your Autumn API key

4. Run `npx convex dev` and `npx convex codegen` to generate Autumn component types

5. Create products in Autumn Dashboard:
   - Create a "Free" tier (base product)
   - Create a "Premium" tier with feature: `advanced-filters`
   - Set pricing and connect Stripe

For complete setup instructions, see [AUTUMN_INTEGRATION.md](./AUTUMN_INTEGRATION.md).

**Premium Features:**

- ⭐ Advanced filtering by price and category
- 🔀 Multi-filter search capabilities
- 💳 Seamless Stripe payment integration
- 📊 Usage tracking and analytics

### Sentry Setup (Optional)

For error tracking and performance monitoring:

1. Create a free Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for TanStack Start/React
3. Copy your DSN from the project settings
4. Add to `.env.local`:

```bash
VITE_SENTRY_DSN=your_sentry_dsn_here
```

**Features enabled:**

- ✅ Error tracking (client & server)
- ✅ Performance monitoring
- ✅ Session replay (10% of sessions, 100% with errors)
- ✅ User feedback widget
- ✅ Console log capture (errors & warnings)

For production source map uploads, also add:

```bash
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

See `.env.local.example` for a complete template.

### Firecrawl Setup (Optional)

For automated restaurant data extraction from event websites:

1. Create a Firecrawl account at [firecrawl.dev](https://www.firecrawl.dev/)
2. Get your API key from the dashboard
3. Add to Convex environment variables:
   - Go to your Convex dashboard at `https://dashboard.convex.dev`
   - Navigate to your project's Settings → Environment Variables
   - Add `FIRECRAWL_API_KEY` with your API key

**Usage:**

You can trigger the crawler by calling the `crawlRestaurantWeekWebsite` action from the Convex dashboard or your frontend:

```typescript
const crawl = useAction(api.firecrawl.crawlRestaurantWeekWebsite)

// Crawl an event's website
await crawl({ eventId: eventId })
```

The crawler will:
- Extract restaurant names, addresses, categories, and URLs
- Extract menu information (meal types, prices, menu URLs)
- Store data in restaurants and menus tables
- Use deterministic IDs (based on restaurant names) to prevent duplicates
- Update existing restaurants or create new ones as needed

## Project Structure

```
feast-finder/
├── convex/
│   ├── events.ts            # Event queries and mutations
│   ├── restaurants.ts       # Restaurant queries and mutations
│   ├── restaurantsGeo.ts    # Geospatial queries
│   ├── restaurantEnrichment.ts # Restaurant data enrichment
│   ├── firecrawl.ts         # Firecrawl web scraping action
│   ├── seedData.ts          # Sample data seeding
│   ├── schema.ts            # Database schema definition
│   ├── auth.ts              # Authentication setup
│   ├── auth.config.ts       # Auth provider configuration
│   ├── autumn.ts            # Autumn premium access integration
│   ├── users.ts             # User queries
│   ├── http.ts              # HTTP endpoints
│   ├── geospatial.ts        # Geospatial index setup
│   └── _generated/          # Auto-generated Convex types
├── src/
│   ├── components/
│   │   ├── RestaurantMap.tsx    # Interactive map component
│   │   ├── RestaurantDetail.tsx # Restaurant detail modal
│   │   ├── PriceFilter.tsx      # Price filtering component
│   │   ├── CategoryFilter.tsx   # Category filtering component
│   │   ├── ColorModeToggle.tsx  # Dark mode toggle
│   │   ├── Header.tsx           # App header with auth
│   │   ├── SignInModal.tsx      # Sign in/sign up modal
│   │   └── UserMenu.tsx         # User menu dropdown
│   ├── routes/
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Landing page with events
│   │   ├── restaurants.tsx   # Interactive map page
│   │   └── events/
│   │       └── $eventName.tsx # Dynamic event page
│   ├── lib/
│   │   └── premiumFeatures.ts # Premium feature constants
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

Use the restaurant storage functions from the Convex dashboard. The system uses deterministic IDs based on restaurant name and address to prevent duplicates.

**Note**: Restaurants no longer use boolean flags for meal availability. Instead, meal availability is determined by the presence of price fields:
- If `brunchPrice` exists, the restaurant serves brunch
- If `lunchPrice` exists, the restaurant serves lunch
- If `dinnerPrice` exists, the restaurant serves dinner

Example structure (for reference):
```typescript
{
  name: 'Restaurant Name',
  rating: 4.5,
  latitude: 37.7749,
  longitude: -122.4194,
  address: '123 Main St, San Francisco, CA',
  websiteUrl: 'https://example.com',
  yelpUrl: 'https://yelp.com/...',
  openTableUrl: 'https://opentable.com/...',
  categories: ['Italian', 'Fine Dining'],
  brunchPrice: 40,
  lunchPrice: 35,
  dinnerPrice: 75,
}
```

### Filtering Restaurants by Price

The price filtering feature allows users to filter restaurants based on their meal prices:

1. Click the "🔍 Filter" button on the restaurants map page
2. Enter min/max prices for any meal type (brunch, lunch, dinner)
3. Click "Apply Filters" to see restaurants matching your criteria
4. Click "Clear" to remove all filters

**How it works:**

- Restaurants matching ANY of the specified meal type criteria are displayed (OR logic)
- For example, filtering by "Brunch $20-$40" shows all restaurants with brunch prices between $20-$40
- You can filter by multiple meal types simultaneously - restaurants matching any of the criteria will be shown
- Price filtering works seamlessly with the map viewport filtering
- Only restaurants with prices defined for the specified meal type and within the range are included

**Premium Feature**: Free users can use ONE filter at a time (one price range OR one category). Premium users can combine unlimited filters (multiple price ranges + multiple categories).

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
