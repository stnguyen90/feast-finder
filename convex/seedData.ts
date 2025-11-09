import { v } from 'convex/values'
import { mutation } from './_generated/server'
import { internal } from './_generated/api'

// Mutation to seed sample restaurant data
export const seedRestaurants = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if restaurants already exist
    const existing = await ctx.db.query('restaurants').first()
    if (existing) {
      console.log('Restaurants already seeded')
      return null
    }

    // Sample San Francisco Bay Area restaurants
    const restaurants = [
      {
        name: 'The French Laundry',
        rating: 4.8,
        latitude: 38.4036,
        longitude: -122.3644,
        address: '6640 Washington St, Yountville, CA 94599',
        websiteUrl: 'https://www.thomaskeller.com/tfl',
        yelpUrl: 'https://www.yelp.com/biz/the-french-laundry-yountville',
        openTableUrl: 'https://www.opentable.com/the-french-laundry',
        categories: ['French', 'Fine Dining', 'Contemporary'],
        hasBrunch: false,
        hasLunch: true,
        hasDinner: true,
        lunchPrice: 350,
        dinnerPrice: 350,
      },
      {
        name: 'Zuni Café',
        rating: 4.5,
        latitude: 37.7789,
        longitude: -122.4221,
        address: '1658 Market St, San Francisco, CA 94102',
        websiteUrl: 'https://zunicafe.com',
        yelpUrl: 'https://www.yelp.com/biz/zuni-cafe-san-francisco',
        openTableUrl: 'https://www.opentable.com/zuni-cafe',
        categories: ['American', 'Mediterranean', 'Italian'],
        hasBrunch: true,
        hasLunch: true,
        hasDinner: true,
        brunchPrice: 45,
        lunchPrice: 35,
        dinnerPrice: 55,
      },
      {
        name: 'State Bird Provisions',
        rating: 4.6,
        latitude: 37.7849,
        longitude: -122.4294,
        address: '1529 Fillmore St, San Francisco, CA 94115',
        websiteUrl: 'https://statebirdsf.com',
        yelpUrl: 'https://www.yelp.com/biz/state-bird-provisions-san-francisco',
        openTableUrl: 'https://www.opentable.com/state-bird-provisions',
        categories: ['American', 'Contemporary', 'Dim Sum'],
        hasBrunch: false,
        hasLunch: false,
        hasDinner: true,
        dinnerPrice: 75,
      },
      {
        name: 'Tartine Bakery',
        rating: 4.4,
        latitude: 37.7611,
        longitude: -122.4209,
        address: '600 Guerrero St, San Francisco, CA 94110',
        websiteUrl: 'https://www.tartinebakery.com',
        yelpUrl:
          'https://www.yelp.com/biz/tartine-bakery-and-cafe-san-francisco',
        categories: ['Bakery', 'Café', 'Breakfast'],
        hasBrunch: true,
        hasLunch: true,
        hasDinner: false,
        brunchPrice: 20,
        lunchPrice: 25,
      },
      {
        name: 'Gary Danko',
        rating: 4.7,
        latitude: 37.8057,
        longitude: -122.4189,
        address: '800 North Point St, San Francisco, CA 94109',
        websiteUrl: 'https://www.garydanko.com',
        yelpUrl: 'https://www.yelp.com/biz/gary-danko-san-francisco',
        openTableUrl: 'https://www.opentable.com/gary-danko',
        categories: ['French', 'American', 'Fine Dining'],
        hasBrunch: false,
        hasLunch: false,
        hasDinner: true,
        dinnerPrice: 150,
      },
      {
        name: 'Nopa',
        rating: 4.5,
        latitude: 37.7749,
        longitude: -122.4376,
        address: '560 Divisadero St, San Francisco, CA 94117',
        websiteUrl: 'https://www.nopasf.com',
        yelpUrl: 'https://www.yelp.com/biz/nopa-san-francisco',
        openTableUrl: 'https://www.opentable.com/nopa',
        categories: ['American', 'California Cuisine', 'Contemporary'],
        hasBrunch: true,
        hasLunch: false,
        hasDinner: true,
        brunchPrice: 35,
        dinnerPrice: 65,
      },
      {
        name: 'La Taqueria',
        rating: 4.3,
        latitude: 37.7488,
        longitude: -122.4189,
        address: '2889 Mission St, San Francisco, CA 94110',
        yelpUrl: 'https://www.yelp.com/biz/la-taqueria-san-francisco-2',
        categories: ['Mexican', 'Tacos', 'Burritos'],
        hasBrunch: false,
        hasLunch: true,
        hasDinner: true,
        lunchPrice: 15,
        dinnerPrice: 15,
      },
      {
        name: 'Swan Oyster Depot',
        rating: 4.6,
        latitude: 37.7919,
        longitude: -122.4206,
        address: '1517 Polk St, San Francisco, CA 94109',
        yelpUrl: 'https://www.yelp.com/biz/swan-oyster-depot-san-francisco',
        categories: ['Seafood', 'Oyster Bar', 'Casual'],
        hasBrunch: false,
        hasLunch: true,
        hasDinner: false,
        lunchPrice: 45,
      },
      {
        name: 'Flour + Water',
        rating: 4.5,
        latitude: 37.7617,
        longitude: -122.4094,
        address: '2401 Harrison St, San Francisco, CA 94110',
        websiteUrl: 'https://flourandwater.com',
        yelpUrl: 'https://www.yelp.com/biz/flour-water-san-francisco',
        openTableUrl: 'https://www.opentable.com/flour-water',
        categories: ['Italian', 'Pasta', 'Contemporary'],
        hasBrunch: false,
        hasLunch: false,
        hasDinner: true,
        dinnerPrice: 70,
      },
      {
        name: "Mama's on Washington Square",
        rating: 4.4,
        latitude: 37.8008,
        longitude: -122.4106,
        address: '1701 Stockton St, San Francisco, CA 94133',
        websiteUrl: 'https://www.mamas-sf.com',
        yelpUrl:
          'https://www.yelp.com/biz/mamas-on-washington-square-san-francisco',
        categories: ['Breakfast', 'Brunch', 'American'],
        hasBrunch: true,
        hasLunch: true,
        hasDinner: false,
        brunchPrice: 25,
        lunchPrice: 30,
      },
    ]

    // Insert restaurants and collect IDs
    const restaurantIds = []
    for (const restaurant of restaurants) {
      const id = await ctx.db.insert('restaurants', restaurant)
      restaurantIds.push(id)
    }

    // Sync all restaurants to geospatial index
    for (const id of restaurantIds) {
      await ctx.scheduler.runAfter(0, internal.restaurantsGeo.syncRestaurantToIndex, {
        restaurantId: id,
      })
    }

    console.log(`Seeded ${restaurants.length} restaurants`)
    return null
  },
})
