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
    description: v.string(),
    startDate: v.string(), // ISO date string
    endDate: v.string(), // ISO date string
    location: v.string(),
    city: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    restaurantIds: v.array(v.id('restaurants')),
    imageUrl: v.optional(v.string()),
  })
    .index('by_city', ['city'])
    .index('by_start_date', ['startDate']),
})
