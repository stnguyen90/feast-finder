import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

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
 * Get a specific event by ID
 */
export const getEvent = query({
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

/**
 * Add a new menu
 */
export const addMenu = mutation({
  args: {
    restaurant: v.id('restaurants'),
    event: v.id('events'),
    meal: v.union(v.literal('brunch'), v.literal('lunch'), v.literal('dinner')),
    price: v.number(),
    url: v.optional(v.string()),
  },
  returns: v.id('menus'),
  handler: async (ctx, args) => {
    const syncTime = Date.now()
    return await ctx.db.insert('menus', {
      ...args,
      syncTime,
    })
  },
})
