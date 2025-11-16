# Firecrawl Integration Guide

## Overview

The Firecrawl integration enables automated extraction of restaurant and menu data from restaurant week websites. This feature uses the Firecrawl Node SDK to scrape websites with structured data extraction.

## Setup

### 1. Get a Firecrawl API Key

1. Sign up at [firecrawl.dev](https://www.firecrawl.dev/)
2. Navigate to your dashboard
3. Copy your API key

### 2. Configure Environment Variable

Add the API key to your Convex environment:

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add a new variable:
   - Name: `FIRECRAWL_API_KEY`
   - Value: Your Firecrawl API key

## Usage

### Security Note

The `crawlRestaurantWeekWebsite` function is **internal only** and uses privileged API credentials. It can only be called by:
- Backend processes
- Convex schedulers
- Other internal Convex functions

It **cannot** be called directly from the frontend for security reasons.

### From Convex Dashboard

1. Open your [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to Functions
3. Find the `firecrawl.ts` file
4. Select `crawlRestaurantWeekWebsite` action (listed under "Internal Actions")
5. Provide the eventId parameter
6. Click "Run"

Example parameters:
```json
{
  "eventId": "your_event_id_here"
}
```

### From Backend/Scheduled Functions

You can invoke this function from other internal Convex functions or scheduled tasks:

```typescript
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'

export const scheduledCrawl = internalAction({
  args: { eventId: v.id('events') },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Call the crawl function
    await ctx.runAction(internal.firecrawl.crawlRestaurantWeekWebsite, {
      eventId: args.eventId,
    })
    return null
  },
})
```

### ⚠️ Not Available from Frontend

The following code **will NOT work** because the function is internal:

```typescript
// ❌ This will fail - function is internal only
import { useAction } from 'convex/react'
import { api } from '../convex/_generated/api'

function CrawlEventButton({ eventId }: { eventId: Id<'events'> }) {
  // This will cause a TypeScript error - function not in api, only in internal
  const crawl = useAction(api.firecrawl.crawlRestaurantWeekWebsite)
  // ...
}
```

## How It Works

### 1. Scraping Process

The action performs the following steps:

1. **Fetch Event**: Retrieves the event details from the database
2. **Validate**: Checks that the event has a `websiteUrl`
3. **Initialize Firecrawl**: Creates a Firecrawl client with your API key
4. **Scrape**: Uses Firecrawl's `scrape` method with a structured JSON schema
5. **Store**: Saves the extracted data via internal mutation

### 2. Data Extraction Schema

The scraper extracts the following data structure:

```typescript
{
  restaurants: [
    {
      name: string              // Restaurant name
      address: string           // Full address
      categories: string[]      // Cuisine types (e.g., ["Italian", "Fine Dining"])
      websiteUrl: string        // Restaurant website
      yelpUrl: string           // Yelp page URL
      openTableUrl: string      // OpenTable reservation URL
      menus: [
        {
          meal: string          // "brunch", "lunch", or "dinner"
          price: number         // Price in dollars
          url: string           // Menu PDF/image URL
        }
      ]
    }
  ]
}
```

### 3. Storage Strategy

The system uses **deterministic storage** to prevent duplicates:

- **Restaurant Identification**: Uses restaurant name as the natural key
- **Existing Restaurant**: Updates URLs, categories, and address if restaurant already exists
- **New Restaurant**: Creates new entry with event location as fallback coordinates
- **Menu Handling**: Creates or updates menus linked to both restaurant and event
- **Geospatial Sync**: Automatically syncs new restaurants to the geospatial index

### 4. Data Updates

When re-running the crawler:

- **Restaurants**: Existing data is preserved, only new/missing fields are updated
- **Menus**: Prices and URLs are updated for existing meal types
- **No Duplicates**: Same restaurant name won't create duplicate entries

## Scraped Data Example

After crawling, the data is stored across two tables:

### Restaurants Table

```javascript
{
  _id: "jh7abc123...",
  name: "Zuni Café",
  rating: 0,  // Default, can be updated later
  latitude: 37.7749,  // From event location
  longitude: -122.4194,
  address: "1658 Market St, San Francisco, CA 94102",
  websiteUrl: "https://zunicafe.com",
  yelpUrl: "https://www.yelp.com/biz/zuni-cafe-san-francisco",
  openTableUrl: "https://www.opentable.com/zuni-cafe",
  categories: ["American", "Mediterranean", "Italian"],
  hasBrunch: true,
  hasLunch: true,
  hasDinner: true
}
```

### Menus Table

```javascript
{
  _id: "km8def456...",
  restaurant: "jh7abc123...",  // Link to restaurant
  event: "xy9ghi789...",        // Link to event
  meal: "lunch",
  price: 35,
  url: "https://example.com/menu.pdf",
  syncTime: 1704067200000
}
```

## Limitations

### Current Limitations

1. **Coordinates**: Uses event location as fallback for new restaurants (no geocoding yet)
2. **Ratings**: New restaurants get a default rating of 0
3. **Single Page**: Only scrapes the main event URL (no crawling of linked pages)

### Future Enhancements

- Geocode restaurant addresses to get accurate coordinates
- Support crawling mode to follow restaurant detail links
- Add rating extraction from review sites
- Support for extracting operating hours
- Phone number extraction
- Image extraction for restaurants

## Error Handling

The action includes comprehensive error handling:

- **Missing Event**: Throws error if eventId not found
- **No Website URL**: Throws error if event doesn't have a websiteUrl
- **Missing API Key**: Throws error if FIRECRAWL_API_KEY not configured
- **No Data**: Logs warning and exits gracefully if no restaurants found
- **Invalid Data**: Skips restaurants/menus with missing required fields

## Logging

The action logs progress at each stage:

```
Starting Firecrawl scrape for event: SF Restaurant Week at https://...
Firecrawl scrape completed. Processing 15 restaurants
Updated existing restaurant: Zuni Café
Created new restaurant: State Bird Provisions
Created new lunch menu for Zuni Café
Processed 15 restaurants and 32 menus
Successfully stored data for event: SF Restaurant Week
```

## Troubleshooting

### "FIRECRAWL_API_KEY environment variable is not set"

**Solution**: Add the API key to Convex environment variables (see Setup section)

### "Event does not have a websiteUrl to crawl"

**Solution**: Update the event in the database to include a websiteUrl field

### No restaurants extracted

**Possible causes**:
- Website structure doesn't match expected schema
- Website requires authentication
- Website blocks scrapers
- Data is loaded dynamically with JavaScript

**Solution**: Verify the website URL and structure, or contact Firecrawl support for help with specific websites

## Best Practices

1. **Test First**: Try crawling with a small limit to verify data structure
2. **Monitor Costs**: Firecrawl charges per page scraped
3. **Update Regularly**: Re-run crawler periodically to get latest menu updates
4. **Verify Data**: Check extracted data quality and update as needed
5. **Add Coordinates**: Manually update restaurant coordinates for accuracy

## API Reference

### Internal Action: `crawlRestaurantWeekWebsite`

**Visibility**: Internal only - can only be called from backend, schedulers, or other internal functions

**Parameters:**
- `eventId` (Id<'events'>): The ID of the event to crawl

**Returns:**
- `null` (data is stored in database)

**Throws:**
- Error if event not found
- Error if event has no websiteUrl
- Error if FIRECRAWL_API_KEY not set

**Security**: Uses privileged FIRECRAWL_API_KEY credentials and performs database writes

### Internal Query: `getEventForCrawl`

**Parameters:**
- `eventId` (Id<'events'>): The ID of the event

**Returns:**
- Event object with _id, name, websiteUrl, latitude, longitude
- `null` if event not found

### Internal Mutation: `storeScrapedRestaurants`

**Parameters:**
- `eventId` (Id<'events'>): The ID of the event
- `restaurants` (Array): Array of restaurant objects with menus

**Returns:**
- Object with `restaurantsProcessed` and `menusProcessed` counts

## Support

For issues or questions:
- Check [Firecrawl Documentation](https://docs.firecrawl.dev/)
- Review logs in Convex Dashboard
- Open an issue in the repository
