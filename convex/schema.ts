import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  restaurants: defineTable({
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
  }).index('by_name', ['name']),

  events: defineTable({
    name: v.string(),
    startDate: v.string(), // ISO date string
    endDate: v.string(), // ISO date string
    latitude: v.number(),
    longitude: v.number(),
    websiteUrl: v.optional(v.string()),
    syncTime: v.number(), // Unix timestamp
  }).index('by_start_date', ['startDate']),

  menus: defineTable({
    restaurant: v.id('restaurants'),
    event: v.id('events'),
    meal: v.union(v.literal('brunch'), v.literal('lunch'), v.literal('dinner')),
    price: v.number(),
    url: v.optional(v.string()), // Link to image/PDF menu
    syncTime: v.number(), // Unix timestamp
  })
    .index('by_restaurant', ['restaurant'])
    .index('by_event', ['event'])
    .index('by_restaurant_and_event', ['restaurant', 'event']),
})
