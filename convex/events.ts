import { v } from 'convex/values'
import { internalQuery, mutation, query } from './_generated/server'

/**
 * Get all active restaurant week events with their menus
 */
export const listActiveEvents = query({
  args: {},
  returns: v.array(
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
      menuCount: v.number(),
      restaurantCount: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const now = new Date().toISOString()
    const allEvents = await ctx.db.query('events').collect()

    // Filter active events (current or upcoming)
    const activeEvents = allEvents.filter((event) => event.endDate >= now)

    // For each event, count menus and unique restaurants
    const eventsWithCounts = await Promise.all(
      activeEvents.map(async (event) => {
        const menus = await ctx.db
          .query('menus')
          .withIndex('by_event', (q) => q.eq('event', event._id))
          .collect()

        const uniqueRestaurants = new Set(menus.map((m) => m.restaurant))

        return {
          ...event,
          menuCount: menus.length,
          restaurantCount: uniqueRestaurants.size,
        }
      }),
    )

    // Sort by start date
    return eventsWithCounts.sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    )
  },
})

/**
 * Get a specific event by ID (internal only)
 */
export const getEvent = internalQuery({
  args: { eventId: v.id('events') },
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
 * Get a specific event by name
 */
export const getEventByName = query({
  args: { name: v.string() },
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
      menuCount: v.number(),
      restaurantCount: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const allEvents = await ctx.db.query('events').collect()
    const event = allEvents.find((e) => e.name === args.name)

    if (!event) {
      return null
    }

    // Count menus and unique restaurants
    const menus = await ctx.db
      .query('menus')
      .withIndex('by_event', (q) => q.eq('event', event._id))
      .collect()

    const uniqueRestaurants = new Set(menus.map((m) => m.restaurant))

    return {
      ...event,
      menuCount: menus.length,
      restaurantCount: uniqueRestaurants.size,
    }
  },
})

/**
 * Get restaurants for a specific event
 */
export const getRestaurantsForEvent = query({
  args: { eventName: v.string() },
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
    // Find the event by name
    const allEvents = await ctx.db.query('events').collect()
    const event = allEvents.find((e) => e.name === args.eventName)

    if (!event) {
      return []
    }

    // Get all menus for this event
    const menus = await ctx.db
      .query('menus')
      .withIndex('by_event', (q) => q.eq('event', event._id))
      .collect()

    // Get unique restaurant IDs
    const restaurantIds = [...new Set(menus.map((m) => m.restaurant))]

    // Fetch all restaurants
    const restaurants = await Promise.all(
      restaurantIds.map((id) => ctx.db.get(id)),
    )

    // Filter out any null values and return
    return restaurants.filter((r) => r !== null)
  },
})

/**
 * Get menus for a specific event
 */
export const getMenusForEvent = query({
  args: { eventId: v.id('events') },
  returns: v.array(
    v.object({
      _id: v.id('menus'),
      _creationTime: v.number(),
      restaurant: v.id('restaurants'),
      event: v.id('events'),
      meal: v.union(
        v.literal('brunch'),
        v.literal('lunch'),
        v.literal('dinner'),
      ),
      price: v.number(),
      url: v.optional(v.string()),
      syncTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('menus')
      .withIndex('by_event', (q) => q.eq('event', args.eventId))
      .collect()
  },
})

/**
 * Get menus for a specific restaurant
 */
export const getMenusForRestaurant = query({
  args: { restaurantId: v.id('restaurants') },
  returns: v.array(
    v.object({
      _id: v.id('menus'),
      _creationTime: v.number(),
      restaurant: v.id('restaurants'),
      event: v.id('events'),
      meal: v.union(
        v.literal('brunch'),
        v.literal('lunch'),
        v.literal('dinner'),
      ),
      price: v.number(),
      url: v.optional(v.string()),
      syncTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('menus')
      .withIndex('by_restaurant', (q) => q.eq('restaurant', args.restaurantId))
      .collect()
  },
})

/**
 * Add a new event
 */
export const addEvent = mutation({
  args: {
    name: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    websiteUrl: v.optional(v.string()),
  },
  returns: v.id('events'),
  handler: async (ctx, args) => {
    const syncTime = Date.now()
    return await ctx.db.insert('events', {
      ...args,
      syncTime,
    })
  },
})
