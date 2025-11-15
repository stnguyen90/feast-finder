'use node'

import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { v } from 'convex/values'
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'

/**
 * Internal action that enriches restaurant data using AI
 * This action is triggered after a restaurant is added
 */
export const enrichRestaurantData = internalAction({
  args: {
    restaurantId: v.id('restaurants'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get the restaurant data
    const restaurant = await ctx.runQuery(internal.restaurants.getRestaurantInternal, {
      id: args.restaurantId,
    })

    if (!restaurant) {
      console.error(`Restaurant ${args.restaurantId} not found`)
      return null
    }

    // Skip if restaurant has no name or address
    if (!restaurant.name) {
      console.warn('Skipping enrichment: restaurant has no name')
      return null
    }

    // Initialize AI provider using environment variables
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY
    const baseURL = process.env.AI_BASE_URL
    const model = process.env.AI_MODEL || 'gpt-4o-mini'

    if (!apiKey) {
      throw new Error('AI_API_KEY or OPENAI_API_KEY environment variable is not set')
    }

    const openai = createOpenAI({
      apiKey,
      baseURL,
    })

    console.log(`Enriching restaurant data for: ${restaurant.name}`)

    // Prepare restaurant data for AI
    const restaurantData = {
      _id: restaurant._id,
      _creationTime: restaurant._creationTime,
      name: restaurant.name,
      address: restaurant.address,
      categories: restaurant.categories,
      key: restaurant.key,
      openTableUrl: restaurant.openTableUrl,
      websiteUrl: restaurant.websiteUrl,
      yelpUrl: restaurant.yelpUrl,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      rating: restaurant.rating,
    }

    // Define the output schema using Zod
    const enrichmentSchema = z.object({
      address: z.string().optional(),
      openTableUrl: z.string().optional(),
      websiteUrl: z.string().optional(),
      yelpUrl: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      rating: z.number().optional(),
      categories: z.array(z.string()).optional(),
    })

    try {
      const { object: enrichedData } = await generateObject({
        model: openai(model),
        schema: enrichmentSchema,
        system: `Given the restaurant name and address, validate the address, openTableUrl, websiteUrl, yelpUrl, latitude, longitude, and rating are correct. If not, set it and then return the updated JSON and nothing else.`,
        prompt: JSON.stringify(restaurantData),
      })

      console.log('AI response:', enrichedData)

      // Update the restaurant with enriched data
      await ctx.runMutation(internal.restaurants.updateRestaurantFromEnrichment, {
        restaurantId: args.restaurantId,
        enrichedData: {
          address: enrichedData.address,
          openTableUrl: enrichedData.openTableUrl,
          websiteUrl: enrichedData.websiteUrl,
          yelpUrl: enrichedData.yelpUrl,
          latitude: enrichedData.latitude,
          longitude: enrichedData.longitude,
          rating: enrichedData.rating,
          categories: enrichedData.categories,
        },
      })

      console.log(`Successfully enriched restaurant: ${restaurant.name}`)
      return null
    } catch (error) {
      console.error(`Error enriching restaurant ${restaurant.name}:`, error)
      return null
    }
  },
})


