import { v } from 'convex/values'
import { action, internalMutation, query } from './_generated/server'
import { api } from './_generated/api'
import { restaurantsIndex } from './geospatial'
import { autumn } from './autumn'

/**
 * Query restaurants within a bounding box (map viewport) with optional price filtering
 * This efficiently retrieves only restaurants visible in the current map view that match price criteria
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
    // Price filter parameters
    minBrunchPrice: v.optional(v.number()),
    maxBrunchPrice: v.optional(v.number()),
    minLunchPrice: v.optional(v.number()),
    maxLunchPrice: v.optional(v.number()),
    minDinnerPrice: v.optional(v.number()),
    maxDinnerPrice: v.optional(v.number()),
    // Category filter parameter
    categories: v.optional(v.array(v.string())),
  },
  returns: v.object({
    results: v.array(
      v.object({
        _id: v.id('restaurants'),
        _creationTime: v.number(),
        key: v.optional(v.string()),
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
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const {
      bounds,
      limit = 100,
      cursor,
      minBrunchPrice,
      maxBrunchPrice,
      minLunchPrice,
      maxLunchPrice,
      minDinnerPrice,
      maxDinnerPrice,
      categories,
    } = args

    // Determine which price filters are active
    const hasBrunchFilter =
      minBrunchPrice !== undefined || maxBrunchPrice !== undefined
    const hasLunchFilter =
      minLunchPrice !== undefined || maxLunchPrice !== undefined
    const hasDinnerFilter =
      minDinnerPrice !== undefined || maxDinnerPrice !== undefined
    const hasPriceFilters = hasBrunchFilter || hasLunchFilter || hasDinnerFilter
    const hasCategoryFilter = categories !== undefined && categories.length > 0

    // Note: Server-side premium access validation cannot be done in queries
    // because autumn.check() uses fetch internally, which isn't allowed in queries.
    // Use the action-based queryRestaurantsInBoundsWithAuth for server-side validation.

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

    // Extract restaurant IDs from geospatial results
    const geoIds = geoResults.results.map((result) => result.key)

    // If no geospatial results, return empty
    if (geoIds.length === 0) {
      return {
        results: [],
        nextCursor: geoResults.nextCursor,
      }
    }

    // Query database with combined geospatial and price filtering
    let restaurantsQuery = ctx.db.query('restaurants')

    if (hasPriceFilters) {
      // Apply database-level filtering for both geospatial and price
      restaurantsQuery = restaurantsQuery.filter((q) => {
        // First, ensure restaurant is in geospatial results
        const inGeoBounds = q.or(
          ...geoIds.map((id) => q.eq(q.field('_id'), id)),
        )

        // Build price filter conditions
        const priceConditions = []

        // Brunch price filter - just check if price exists and is in range
        if (hasBrunchFilter) {
          let brunchCondition = q.neq(q.field('brunchPrice'), undefined)

          if (minBrunchPrice !== undefined) {
            brunchCondition = q.and(
              brunchCondition,
              q.gte(q.field('brunchPrice'), minBrunchPrice),
            )
          }

          if (maxBrunchPrice !== undefined) {
            brunchCondition = q.and(
              brunchCondition,
              q.lte(q.field('brunchPrice'), maxBrunchPrice),
            )
          }

          priceConditions.push(brunchCondition)
        }

        // Lunch price filter
        if (hasLunchFilter) {
          let lunchCondition = q.neq(q.field('lunchPrice'), undefined)

          if (minLunchPrice !== undefined) {
            lunchCondition = q.and(
              lunchCondition,
              q.gte(q.field('lunchPrice'), minLunchPrice),
            )
          }

          if (maxLunchPrice !== undefined) {
            lunchCondition = q.and(
              lunchCondition,
              q.lte(q.field('lunchPrice'), maxLunchPrice),
            )
          }

          priceConditions.push(lunchCondition)
        }

        // Dinner price filter
        if (hasDinnerFilter) {
          let dinnerCondition = q.neq(q.field('dinnerPrice'), undefined)

          if (minDinnerPrice !== undefined) {
            dinnerCondition = q.and(
              dinnerCondition,
              q.gte(q.field('dinnerPrice'), minDinnerPrice),
            )
          }

          if (maxDinnerPrice !== undefined) {
            dinnerCondition = q.and(
              dinnerCondition,
              q.lte(q.field('dinnerPrice'), maxDinnerPrice),
            )
          }

          priceConditions.push(dinnerCondition)
        }

        // Combine: must be in geo bounds AND match at least one price filter
        return q.and(inGeoBounds, q.or(...priceConditions))
      })
    } else {
      // No price filters, just filter by geospatial IDs
      restaurantsQuery = restaurantsQuery.filter((q) => {
        return q.or(...geoIds.map((id) => q.eq(q.field('_id'), id)))
      })
    }

    let restaurants = await restaurantsQuery.collect()

    // Apply category filtering in memory
    // This is efficient since we're only filtering a small subset from geospatial query
    if (hasCategoryFilter) {
      restaurants = restaurants.filter((restaurant) =>
        restaurant.categories?.some((category) => categories.includes(category)),
      )
    }

    return {
      results: restaurants,
      nextCursor: geoResults.nextCursor,
    }
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

    // Only insert into geospatial index if coordinates exist
    if (restaurant.latitude !== undefined && restaurant.longitude !== undefined) {
      await restaurantsIndex.insert(
        ctx,
        restaurant._id,
        { latitude: restaurant.latitude, longitude: restaurant.longitude },
        { categories: restaurant.categories || [] },
        restaurant.rating || 0, // Use rating as sort key, default to 0 if not set
      )
    }

    return null
  },
})

/**
 * Action to query restaurants with server-side premium access validation
 * This action validates filter usage against Autumn premium access before returning results
 */
export const queryRestaurantsInBoundsWithAuth = action({
  args: {
    bounds: v.object({
      north: v.number(),
      south: v.number(),
      east: v.number(),
      west: v.number(),
    }),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    // Price filter parameters
    minBrunchPrice: v.optional(v.number()),
    maxBrunchPrice: v.optional(v.number()),
    minLunchPrice: v.optional(v.number()),
    maxLunchPrice: v.optional(v.number()),
    minDinnerPrice: v.optional(v.number()),
    maxDinnerPrice: v.optional(v.number()),
    // Category filter parameter
    categories: v.optional(v.array(v.string())),
  },
  returns: v.object({
    results: v.array(
      v.object({
        _id: v.id('restaurants'),
        _creationTime: v.number(),
        key: v.optional(v.string()),
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
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{
    results: Array<{
      _id: any
      _creationTime: number
      key?: string
      name: string
      rating?: number
      latitude?: number
      longitude?: number
      address?: string
      websiteUrl?: string
      yelpUrl?: string
      openTableUrl?: string
      categories?: Array<string>
      brunchPrice?: number
      lunchPrice?: number
      dinnerPrice?: number
    }>
    nextCursor?: string
  }> => {
    const {
      minBrunchPrice,
      maxBrunchPrice,
      minLunchPrice,
      maxLunchPrice,
      minDinnerPrice,
      maxDinnerPrice,
      categories,
    } = args

    // Determine which price filters are active
    const hasBrunchFilter =
      minBrunchPrice !== undefined || maxBrunchPrice !== undefined
    const hasLunchFilter =
      minLunchPrice !== undefined || maxLunchPrice !== undefined
    const hasDinnerFilter =
      minDinnerPrice !== undefined || maxDinnerPrice !== undefined
    const hasCategoryFilter = categories !== undefined && categories.length > 0

    // Count total active filters
    const priceFilterCount = [hasBrunchFilter, hasLunchFilter, hasDinnerFilter].filter(Boolean).length
    const categoryFilterCount = hasCategoryFilter ? 1 : 0
    const totalFilters = priceFilterCount + categoryFilterCount

    // Server-side check: If user is using multiple filters, verify premium access
    if (totalFilters > 1) {
      const result = await autumn.check(ctx, {
        featureId: 'advanced-filters',
      })

      if (result.error || !result.data?.allowed) {
        throw new Error(
          'Premium access required to use multiple filters. Please upgrade to continue.',
        )
      }
    }

    // Call the query to fetch restaurants
    return await ctx.runQuery(api.restaurantsGeo.queryRestaurantsInBounds, args)
  },
})
