import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get all active restaurant week events
 */
export const listActiveEvents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('events'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      location: v.string(),
      city: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      restaurantIds: v.array(v.id('restaurants')),
      imageUrl: v.optional(v.string()),
      restaurantCount: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const now = new Date().toISOString()
    const allEvents = await ctx.db.query('events').collect()

    // Filter active events (current or upcoming) and add restaurant count
    const activeEvents = allEvents
      .filter((event) => event.endDate >= now)
      .map((event) => ({
        ...event,
        restaurantCount: event.restaurantIds.length,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))

    return activeEvents
  },
})

/**
 * Get events by city
 */
export const listEventsByCity = query({
  args: { city: v.string() },
  returns: v.array(
    v.object({
      _id: v.id('events'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      location: v.string(),
      city: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      restaurantIds: v.array(v.id('restaurants')),
      imageUrl: v.optional(v.string()),
      restaurantCount: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const events = await ctx.db
      .query('events')
      .withIndex('by_city', (q) => q.eq('city', args.city))
      .collect()

    // Filter active events and add restaurant count
    const activeEvents = events
      .filter((event) => event.endDate >= now)
      .map((event) => ({
        ...event,
        restaurantCount: event.restaurantIds.length,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))

    return activeEvents
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
      description: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      location: v.string(),
      city: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      restaurantIds: v.array(v.id('restaurants')),
      imageUrl: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId)
  },
})

/**
 * Add a new event
 */
export const addEvent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    location: v.string(),
    city: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    restaurantIds: v.array(v.id('restaurants')),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id('events'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('events', args)
  },
})
