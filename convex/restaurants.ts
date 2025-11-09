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
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    return restaurants
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
  handler: async (ctx, args) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    
    // Determine which filters are active
    const hasBrunchFilter = args.minBrunchPrice !== undefined || args.maxBrunchPrice !== undefined
    const hasLunchFilter = args.minLunchPrice !== undefined || args.maxLunchPrice !== undefined
    const hasDinnerFilter = args.minDinnerPrice !== undefined || args.maxDinnerPrice !== undefined
    
    // If no filters are active, return all restaurants
    if (!hasBrunchFilter && !hasLunchFilter && !hasDinnerFilter) {
      return restaurants
    }
    
    // Filter restaurants based on price criteria (OR logic between meal types)
    return restaurants.filter((restaurant) => {
      let matchesAtLeastOne = false
      
      // Check brunch price filter
      if (hasBrunchFilter) {
        const hasBrunch = restaurant.hasBrunch && restaurant.brunchPrice !== undefined
        if (hasBrunch && restaurant.brunchPrice !== undefined) {
          const meetsMin = args.minBrunchPrice === undefined || restaurant.brunchPrice >= args.minBrunchPrice
          const meetsMax = args.maxBrunchPrice === undefined || restaurant.brunchPrice <= args.maxBrunchPrice
          if (meetsMin && meetsMax) {
            matchesAtLeastOne = true
          }
        }
      }
      
      // Check lunch price filter
      if (hasLunchFilter) {
        const hasLunch = restaurant.hasLunch && restaurant.lunchPrice !== undefined
        if (hasLunch && restaurant.lunchPrice !== undefined) {
          const meetsMin = args.minLunchPrice === undefined || restaurant.lunchPrice >= args.minLunchPrice
          const meetsMax = args.maxLunchPrice === undefined || restaurant.lunchPrice <= args.maxLunchPrice
          if (meetsMin && meetsMax) {
            matchesAtLeastOne = true
          }
        }
      }
      
      // Check dinner price filter
      if (hasDinnerFilter) {
        const hasDinner = restaurant.hasDinner && restaurant.dinnerPrice !== undefined
        if (hasDinner && restaurant.dinnerPrice !== undefined) {
          const meetsMin = args.minDinnerPrice === undefined || restaurant.dinnerPrice >= args.minDinnerPrice
          const meetsMax = args.maxDinnerPrice === undefined || restaurant.dinnerPrice <= args.maxDinnerPrice
          if (meetsMin && meetsMax) {
            matchesAtLeastOne = true
          }
        }
      }
      
      return matchesAtLeastOne
    })
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
  },
  returns: v.id('restaurants'),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('restaurants', args)
    // Sync to geospatial index
    await ctx.scheduler.runAfter(0, internal.restaurantsGeo.syncRestaurantToIndex, {
      restaurantId: id,
    })
    return id
  },
})
