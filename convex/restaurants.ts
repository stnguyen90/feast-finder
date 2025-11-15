import { v } from 'convex/values'
import { internalMutation, internalQuery, mutation, query } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

// Query to get all restaurants
export const listRestaurants = query({
  args: {},
  returns: v.array(
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
    v.null(),
  ),
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)
    return restaurant
  },
})

// Internal query to get a single restaurant by ID (for internal use)
export const getRestaurantInternal = internalQuery({
  args: {
    id: v.id('restaurants'),
  },
  returns: v.union(
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

/**
 * Internal mutation to store scraped restaurants and menus
 * Uses deterministic IDs to prevent duplicates
 */
export const storeScrapedRestaurants = internalMutation({
  args: {
    eventId: v.id('events'),
    restaurants: v.array(
      v.object({
        key: v.string(), // MD5 hash generated by the calling action
        name: v.string(),
        menus: v.optional(
          v.array(
            v.object({
              price: v.optional(v.number()),
              meal: v.optional(v.string()),
              url: v.optional(v.string()),
            }),
          ),
        ),
        websiteUrl: v.optional(v.string()),
        openTableUrl: v.optional(v.string()),
        categories: v.optional(v.array(v.string())),
        address: v.optional(v.string()),
        yelpUrl: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        rating: v.optional(v.number()),
      }),
    ),
  },
  returns: v.object({
    restaurantsProcessed: v.number(),
    menusProcessed: v.number(),
  }),
  handler: async (ctx, args) => {
    let restaurantsProcessed = 0
    let menusProcessed = 0
    const syncTime = Date.now()

    for (const restaurantData of args.restaurants) {
      // Skip if no name
      if (!restaurantData.name) {
        console.warn('Skipping restaurant with no name')
        continue
      }

      // Use the key provided by the action (MD5 hash)
      const key = restaurantData.key

      // Check if restaurant already exists by key
      const existingRestaurant = await ctx.db
        .query('restaurants')
        .withIndex('by_key', (q) => q.eq('key', key))
        .first()

      let restaurantId: Id<'restaurants'>

      if (existingRestaurant) {
        // Update existing restaurant with new data
        restaurantId = existingRestaurant._id
        await ctx.db.patch(existingRestaurant._id, {
          websiteUrl:
            restaurantData.websiteUrl || existingRestaurant.websiteUrl,
          openTableUrl:
            restaurantData.openTableUrl || existingRestaurant.openTableUrl,
          yelpUrl: restaurantData.yelpUrl || existingRestaurant.yelpUrl,
          categories:
            restaurantData.categories && restaurantData.categories.length > 0
              ? restaurantData.categories
              : existingRestaurant.categories,
          address: restaurantData.address || existingRestaurant.address,
          latitude: restaurantData.latitude || existingRestaurant.latitude,
          longitude: restaurantData.longitude || existingRestaurant.longitude,
          rating: restaurantData.rating || existingRestaurant.rating,
        })
        console.log(`Updated existing restaurant: ${restaurantData.name}`)
      } else {
        // Create new restaurant
        restaurantId = await ctx.db.insert('restaurants', {
          key,
          name: restaurantData.name,
          address: restaurantData.address,
          websiteUrl: restaurantData.websiteUrl,
          openTableUrl: restaurantData.openTableUrl,
          yelpUrl: restaurantData.yelpUrl,
          categories: restaurantData.categories,
          latitude: restaurantData.latitude,
          longitude: restaurantData.longitude,
          rating: restaurantData.rating,
        })

        // Sync to geospatial index only if we have coordinates
        if (restaurantData.latitude && restaurantData.longitude) {
          await ctx.scheduler.runAfter(
            0,
            internal.restaurantsGeo.syncRestaurantToIndex,
            {
              restaurantId,
            },
          )
        }

        // Trigger AI enrichment for new restaurants
        await ctx.scheduler.runAfter(
          0,
          internal.restaurantEnrichment.enrichRestaurantData,
          {
            restaurantId,
          },
        )

        console.log(`Created new restaurant: ${restaurantData.name}`)
      }

      restaurantsProcessed++

      // Track prices from menus for updating the restaurant
      let brunchPrice: number | undefined
      let lunchPrice: number | undefined
      let dinnerPrice: number | undefined

      // Process menus for this restaurant
      if (restaurantData.menus && restaurantData.menus.length > 0) {
        for (const menuData of restaurantData.menus) {
          // Validate menu data
          if (!menuData.meal || !menuData.price) {
            console.warn(
              `Skipping menu for ${restaurantData.name}: missing meal type or price`,
            )
            continue
          }

          // Normalize meal type
          const mealType = menuData.meal.toLowerCase()
          if (!['brunch', 'lunch', 'dinner'].includes(mealType)) {
            console.warn(
              `Skipping menu for ${restaurantData.name}: invalid meal type "${menuData.meal}"`,
            )
            continue
          }

          // Track prices for updating restaurant
          if (mealType === 'brunch') {
            brunchPrice = menuData.price
          } else if (mealType === 'lunch') {
            lunchPrice = menuData.price
          } else if (mealType === 'dinner') {
            dinnerPrice = menuData.price
          }

          // Check if this menu already exists (deterministic check)
          const existingMenu = await ctx.db
            .query('menus')
            .withIndex('by_restaurant_and_event', (q) =>
              q.eq('restaurant', restaurantId).eq('event', args.eventId),
            )
            .filter((q) =>
              q.eq(
                q.field('meal'),
                mealType as 'brunch' | 'lunch' | 'dinner',
              ),
            )
            .first()

          if (existingMenu) {
            // Update existing menu
            await ctx.db.patch(existingMenu._id, {
              price: menuData.price,
              url: menuData.url || existingMenu.url,
              syncTime,
            })
            console.log(
              `Updated existing ${mealType} menu for ${restaurantData.name}`,
            )
          } else {
            // Create new menu
            await ctx.db.insert('menus', {
              restaurant: restaurantId,
              event: args.eventId,
              meal: mealType as 'brunch' | 'lunch' | 'dinner',
              price: menuData.price,
              url: menuData.url,
              syncTime,
            })
            console.log(
              `Created new ${mealType} menu for ${restaurantData.name}`,
            )
          }

          menusProcessed++
        }
      }

      // Update restaurant prices based on menu data
      if (brunchPrice !== undefined || lunchPrice !== undefined || dinnerPrice !== undefined) {
        const priceUpdates: {
          brunchPrice?: number
          lunchPrice?: number
          dinnerPrice?: number
        } = {}
        
        if (brunchPrice !== undefined) priceUpdates.brunchPrice = brunchPrice
        if (lunchPrice !== undefined) priceUpdates.lunchPrice = lunchPrice
        if (dinnerPrice !== undefined) priceUpdates.dinnerPrice = dinnerPrice
        
        await ctx.db.patch(restaurantId, priceUpdates)
        console.log(
          `Updated prices for ${restaurantData.name}: ${JSON.stringify(priceUpdates)}`,
        )
      }
    }

    console.log(
      `Processed ${restaurantsProcessed} restaurants and ${menusProcessed} menus`,
    )

    // Update event sync time
    await ctx.db.patch(args.eventId, {
      syncTime,
    })

    return {
      restaurantsProcessed,
      menusProcessed,
    }
  },
})

/**
 * Internal mutation to update restaurant from AI enrichment
 */
export const updateRestaurantFromEnrichment = internalMutation({
  args: {
    restaurantId: v.id('restaurants'),
    enrichedData: v.object({
      address: v.optional(v.string()),
      openTableUrl: v.optional(v.string()),
      websiteUrl: v.optional(v.string()),
      yelpUrl: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      rating: v.optional(v.number()),
      categories: v.optional(v.array(v.string())),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId)
    if (!restaurant) {
      console.error(`Restaurant ${args.restaurantId} not found`)
      return null
    }

    // Only update fields that are provided and not already set
    const updates: Record<string, any> = {}
    
    if (args.enrichedData.address) {
      updates.address = args.enrichedData.address
    }
    if (args.enrichedData.openTableUrl) {
      updates.openTableUrl = args.enrichedData.openTableUrl
    }
    if (args.enrichedData.websiteUrl) {
      updates.websiteUrl = args.enrichedData.websiteUrl
    }
    if (args.enrichedData.yelpUrl) {
      updates.yelpUrl = args.enrichedData.yelpUrl
    }
    if (args.enrichedData.latitude !== undefined) {
      updates.latitude = args.enrichedData.latitude
    }
    if (args.enrichedData.longitude !== undefined) {
      updates.longitude = args.enrichedData.longitude
    }
    if (args.enrichedData.rating !== undefined) {
      updates.rating = args.enrichedData.rating
    }
    if (args.enrichedData.categories && args.enrichedData.categories.length > 0) {
      updates.categories = args.enrichedData.categories
    }

    // Only patch if there are updates
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.restaurantId, updates)
      console.log(`Enriched restaurant ${restaurant.name} with: ${JSON.stringify(updates)}`)
      
      // If coordinates were added, sync to geospatial index
      if (updates.latitude !== undefined && updates.longitude !== undefined) {
        await ctx.scheduler.runAfter(
          0,
          internal.restaurantsGeo.syncRestaurantToIndex,
          {
            restaurantId: args.restaurantId,
          },
        )
      }
    } else {
      console.log(`No enrichment needed for restaurant ${restaurant.name}`)
    }

    return null
  },
})
