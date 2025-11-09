import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { restaurantsIndex } from './geospatial'

/**
 * Query restaurants within a bounding box (map viewport)
 * This efficiently retrieves only restaurants visible in the current map view
 */
export const queryRestaurantsInBounds = query({
  args: {
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    }),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    results: v.array(
      v.object({
        _id: v.id('restaurants'),
        _creationTime: v.number(),
        name: v.string(),
        rating: v.number(),
        latitude: v.number(),
        longitude: v.number(),
        address: v.string(),
        websiteUrl: v.optional(v.string()),
        yelpUrl: v.optional(v.string()),
        openTableUrl: v.optional(v.string()),
        categories: v.array(v.string()),
        hasBrunch: v.boolean(),
        hasLunch: v.boolean(),
        hasDinner: v.boolean(),
        brunchPrice: v.optional(v.number()),
        lunchPrice: v.optional(v.number()),
        dinnerPrice: v.optional(v.number()),
      }),
    ),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { bounds, limit = 100, cursor } = args

    // Query geospatial index for restaurant IDs in the bounding box
    const geoResults = await restaurantsIndex.query(
      ctx,
      {
        shape: {
          type: 'rectangle',
          rectangle: {
            west: bounds.west,
            south: bounds.south,
            east: bounds.east,
            north: bounds.north,
          },
        },
        limit,
      },
      cursor,
    )

    // Fetch full restaurant details for each ID
    const restaurants = []
    for (const result of geoResults.results) {
      const restaurant = await ctx.db.get(result.key)
      if (restaurant) {
        restaurants.push(restaurant)
      }
    }

    return {
      results: restaurants,
      nextCursor: geoResults.nextCursor,
    }
  },
})

/**
 * Query restaurants nearest to a specific point
 * Useful for "find restaurants near me" functionality
 */
export const queryNearestRestaurants = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    maxResults: v.optional(v.number()),
    maxDistanceMeters: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('restaurants'),
      _creationTime: v.number(),
      name: v.string(),
      rating: v.number(),
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
      websiteUrl: v.optional(v.string()),
      yelpUrl: v.optional(v.string()),
      openTableUrl: v.optional(v.string()),
      categories: v.array(v.string()),
      hasBrunch: v.boolean(),
      hasLunch: v.boolean(),
      hasDinner: v.boolean(),
      brunchPrice: v.optional(v.number()),
      lunchPrice: v.optional(v.number()),
      dinnerPrice: v.optional(v.number()),
      distance: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const { latitude, longitude, maxResults = 10, maxDistanceMeters } = args

    // Query geospatial index for nearest restaurants
    const geoResults = await restaurantsIndex.queryNearest(
      ctx,
      { latitude, longitude },
      maxResults,
      maxDistanceMeters,
    )

    // Fetch full restaurant details for each ID
    const restaurants = []
    for (const result of geoResults) {
      const restaurant = await ctx.db.get(result.key)
      if (restaurant) {
        restaurants.push({
          ...restaurant,
          distance: result.distance,
        })
      }
    }

    return restaurants
  },
})

/**
 * Internal mutation to sync a restaurant to the geospatial index
 * Called when a restaurant is added or updated
 */
export const syncRestaurantToIndex = internalMutation({
  args: {
    restaurantId: v.id('restaurants'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    // Insert or update in geospatial index
    await restaurantsIndex.insert(
      ctx,
      restaurant._id,
      { latitude: restaurant.latitude, longitude: restaurant.longitude },
      { categories: restaurant.categories },
      restaurant.rating, // Use rating as sort key for ordering results
    )

    return null
  },
})

/**
 * Internal mutation to remove a restaurant from the geospatial index
 */
export const removeRestaurantFromIndex = internalMutation({
  args: {
    restaurantId: v.id('restaurants'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await restaurantsIndex.remove(ctx, args.restaurantId)
    return null
  },
})

/**
 * Mutation to sync all existing restaurants to the geospatial index
 * This should be run once to migrate existing data
 */
export const syncAllRestaurantsToIndex = mutation({
  args: {},
  returns: v.object({
    synced: v.number(),
  }),
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()

    let synced = 0
    for (const restaurant of restaurants) {
      await restaurantsIndex.insert(
        ctx,
        restaurant._id,
        { latitude: restaurant.latitude, longitude: restaurant.longitude },
        { categories: restaurant.categories },
        restaurant.rating,
      )
      synced++
    }

    return { synced }
  },
})
