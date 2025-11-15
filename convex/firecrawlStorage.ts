import { v } from 'convex/values'
import { internalMutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

/**
 * Internal query to get event for crawling
 */
export const getEventForCrawl = internalQuery({
  args: {
    eventId: v.id('events'),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('events'),
      _creationTime: v.number(),
      name: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      websiteUrl: v.optional(v.string()),
      syncTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId)
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

      // Check if restaurant already exists by name
      const existingRestaurant = await ctx.db
        .query('restaurants')
        .withIndex('by_name', (q) => q.eq('name', restaurantData.name))
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
        })
        console.log(`Updated existing restaurant: ${restaurantData.name}`)
      } else {
        // Get event location for restaurant coordinates (fallback)
        const event = await ctx.db.get(args.eventId)
        if (!event) {
          throw new Error(`Event not found: ${args.eventId}`)
        }

        // Create new restaurant with default values
        restaurantId = await ctx.db.insert('restaurants', {
          name: restaurantData.name,
          rating: 0, // Default rating, can be updated later
          latitude: event.latitude, // Use event location as fallback
          longitude: event.longitude,
          address: restaurantData.address || 'Address not available',
          websiteUrl: restaurantData.websiteUrl,
          openTableUrl: restaurantData.openTableUrl,
          yelpUrl: restaurantData.yelpUrl,
          categories: restaurantData.categories || [],
          hasBrunch: false, // Will be set based on menus
          hasLunch: false,
          hasDinner: false,
        })

        // Sync to geospatial index
        await ctx.scheduler.runAfter(
          0,
          internal.restaurantsGeo.syncRestaurantToIndex,
          {
            restaurantId,
          },
        )

        console.log(`Created new restaurant: ${restaurantData.name}`)
      }

      restaurantsProcessed++

      // Process menus for this restaurant
      if (restaurantData.menus && restaurantData.menus.length > 0) {
        // Update restaurant meal availability flags
        const hasBrunch = restaurantData.menus.some(
          (m) => m.meal?.toLowerCase() === 'brunch',
        )
        const hasLunch = restaurantData.menus.some(
          (m) => m.meal?.toLowerCase() === 'lunch',
        )
        const hasDinner = restaurantData.menus.some(
          (m) => m.meal?.toLowerCase() === 'dinner',
        )

        // Get existing restaurant to preserve other meal flags
        const restaurant = await ctx.db.get(restaurantId)
        if (restaurant) {
          await ctx.db.patch(restaurantId, {
            hasBrunch: restaurant.hasBrunch || hasBrunch,
            hasLunch: restaurant.hasLunch || hasLunch,
            hasDinner: restaurant.hasDinner || hasDinner,
          })
        }

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
