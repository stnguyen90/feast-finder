'use node'

import FirecrawlApp from '@mendable/firecrawl-js'
import { v } from 'convex/values'

import { action } from './_generated/server'
import { internal } from './_generated/api'

/**
 * Crawl a restaurant week website using Firecrawl and extract restaurant data
 */
export const crawlRestaurantWeekWebsite = action({
  args: {
    eventId: v.id('events'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get the event details
    const event = await ctx.runQuery(internal.firecrawlStorage.getEventForCrawl, {
      eventId: args.eventId,
    })

    if (!event) {
      throw new Error(`Event with ID ${args.eventId} not found`)
    }

    if (!event.websiteUrl) {
      throw new Error(
        `Event "${event.name}" does not have a websiteUrl to crawl`,
      )
    }

    // Initialize Firecrawl
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set')
    }

    const app = new FirecrawlApp({ apiKey })

    console.log(
      `Starting Firecrawl scrape for event: ${event.name} at ${event.websiteUrl}`,
    )

    // Use Firecrawl's scrape endpoint with structured data extraction
    const scrapeResult = await app.scrape(event.websiteUrl, {
      formats: ['json'],
      onlyMainContent: true,
      waitFor: 500,
      jsonOptions: {
        schema: {
          type: 'object',
          required: [],
          properties: {
            restaurants: {
              type: 'array',
              items: {
                type: 'object',
                required: [],
                properties: {
                  name: {
                    type: 'string',
                  },
                  menus: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [],
                      properties: {
                        price: {
                          type: 'number',
                        },
                        meal: {
                          type: 'string',
                        },
                        url: {
                          type: 'string',
                        },
                      },
                    },
                  },
                  websiteUrl: {
                    type: 'string',
                  },
                  openTableUrl: {
                    type: 'string',
                  },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  address: {
                    type: 'string',
                  },
                  yelpUrl: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        prompt: 'Extract all restaurants and their meal menus',
      },
    })

    console.log(
      `Firecrawl scrape completed. Processing ${(scrapeResult as any).json?.restaurants?.length || 0} restaurants`,
    )

    if (!(scrapeResult as any).json?.restaurants) {
      console.warn('No restaurants found in the scraped data')
      return null
    }

    // Store the extracted data
    await ctx.runMutation(internal.firecrawlStorage.storeScrapedRestaurants, {
      eventId: args.eventId,
      restaurants: (scrapeResult as any).json.restaurants as Array<{
        name: string
        menus?: Array<{
          price?: number
          meal?: string
          url?: string
        }>
        websiteUrl?: string
        openTableUrl?: string
        categories?: Array<string>
        address?: string
        yelpUrl?: string
      }>,
    })

    console.log(`Successfully stored data for event: ${event.name}`)
    return null
  },
})

