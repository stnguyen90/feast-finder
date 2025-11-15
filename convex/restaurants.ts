import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { internal } from './_generated/api'

// Query to get all restaurants
export const listRestaurants = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('restaurants'),
      _creationTime: v.number(),
      key: v.string(),
      name: v.string(),
      rating: v.optional(v.number()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      address: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      yelpUrl: v.optional(v.string()),
      openTableUrl: v.optional(v.string()),
      categories: v.optional(v.array(v.string())),
      brunchPrice: v.optional(v.number()),
      lunchPrice: v.optional(v.number()),
      dinnerPrice: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    return restaurants
  },
})

// Query to get all unique categories from restaurants
export const listCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()

    // Collect all categories from all restaurants
    const categorySet = new Set<string>()
    for (const restaurant of restaurants) {
      if (restaurant.categories) {
        for (const category of restaurant.categories) {
          categorySet.add(category)
        }
      }
    }

    // Return sorted array of unique categories
    return Array.from(categorySet).sort()
  },
})

// Query to filter restaurants by price ranges
export const listRestaurantsWithPriceFilter = query({
  args: {
    minBrunchPrice: v.optional(v.number()),
    maxBrunchPrice: v.optional(v.number()),
    minLunchPrice: v.optional(v.number()),
    maxLunchPrice: v.optional(v.number()),
    minDinnerPrice: v.optional(v.number()),
    maxDinnerPrice: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id('restaurants'),
      _creationTime: v.number(),
      key: v.string(),
      name: v.string(),
      rating: v.optional(v.number()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      address: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      yelpUrl: v.optional(v.string()),
      openTableUrl: v.optional(v.string()),
      categories: v.optional(v.array(v.string())),
      brunchPrice: v.optional(v.number()),
      lunchPrice: v.optional(v.number()),
      dinnerPrice: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    // Determine which filters are active
    const hasBrunchFilter =
      args.minBrunchPrice !== undefined || args.maxBrunchPrice !== undefined
    const hasLunchFilter =
      args.minLunchPrice !== undefined || args.maxLunchPrice !== undefined
    const hasDinnerFilter =
      args.minDinnerPrice !== undefined || args.maxDinnerPrice !== undefined

    // If no filters are active, return all restaurants
    if (!hasBrunchFilter && !hasLunchFilter && !hasDinnerFilter) {
      return await ctx.db.query('restaurants').collect()
    }

    // Use database-level filtering with .filter() for efficiency
    // This pushes the filtering logic to the database layer
    const restaurants = await ctx.db
      .query('restaurants')
      .filter((q) => {
        // Build OR conditions for meal types
        const conditions = []

        // Brunch price filter - only check if price exists and is in range
        if (hasBrunchFilter) {
          let brunchCondition = q.neq(q.field('brunchPrice'), undefined)

          if (args.minBrunchPrice !== undefined) {
            brunchCondition = q.and(
              brunchCondition,
              q.gte(q.field('brunchPrice'), args.minBrunchPrice),
            )
          }

          if (args.maxBrunchPrice !== undefined) {
            brunchCondition = q.and(
              brunchCondition,
              q.lte(q.field('brunchPrice'), args.maxBrunchPrice),
            )
          }

          conditions.push(brunchCondition)
        }

        // Lunch price filter
        if (hasLunchFilter) {
          let lunchCondition = q.neq(q.field('lunchPrice'), undefined)

          if (args.minLunchPrice !== undefined) {
            lunchCondition = q.and(
              lunchCondition,
              q.gte(q.field('lunchPrice'), args.minLunchPrice),
            )
          }

          if (args.maxLunchPrice !== undefined) {
            lunchCondition = q.and(
              lunchCondition,
              q.lte(q.field('lunchPrice'), args.maxLunchPrice),
            )
          }

          conditions.push(lunchCondition)
        }

        // Dinner price filter
        if (hasDinnerFilter) {
          let dinnerCondition = q.neq(q.field('dinnerPrice'), undefined)

          if (args.minDinnerPrice !== undefined) {
            dinnerCondition = q.and(
              dinnerCondition,
              q.gte(q.field('dinnerPrice'), args.minDinnerPrice),
            )
          }

          if (args.maxDinnerPrice !== undefined) {
            dinnerCondition = q.and(
              dinnerCondition,
              q.lte(q.field('dinnerPrice'), args.maxDinnerPrice),
            )
          }

          conditions.push(dinnerCondition)
        }

        // Return true if ANY condition matches (OR logic)
        return q.or(...conditions)
      })
      .collect()

    return restaurants
  },
})

// Query to get a single restaurant by ID
export const getRestaurant = query({
  args: {
    id: v.id('restaurants'),
  },
  returns: v.union(
    v.object({
      _id: v.id('restaurants'),
      _creationTime: v.number(),
      key: v.string(),
      name: v.string(),
      rating: v.optional(v.number()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      address: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      yelpUrl: v.optional(v.string()),
      openTableUrl: v.optional(v.string()),
      categories: v.optional(v.array(v.string())),
      brunchPrice: v.optional(v.number()),
      lunchPrice: v.optional(v.number()),
      dinnerPrice: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)
    return restaurant
  },
})

// Mutation to add a new restaurant
export const addRestaurant = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    rating: v.optional(v.number()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    yelpUrl: v.optional(v.string()),
    openTableUrl: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    brunchPrice: v.optional(v.number()),
    lunchPrice: v.optional(v.number()),
    dinnerPrice: v.optional(v.number()),
  },
  returns: v.id('restaurants'),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('restaurants', args)
    // Sync to geospatial index only if coordinates exist
    if (args.latitude !== undefined && args.longitude !== undefined) {
      await ctx.scheduler.runAfter(
        0,
        internal.restaurantsGeo.syncRestaurantToIndex,
        {
          restaurantId: id,
        },
      )
    }
    return id
  },
})
