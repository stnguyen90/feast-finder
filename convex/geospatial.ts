import { GeospatialIndex } from '@convex-dev/geospatial'
import { components } from './_generated/api'
import type { Id } from './_generated/dataModel'

// Create a geospatial index for restaurants
// Key: Restaurant ID
// Filters: categories array for filtering by cuisine type
export const restaurantsIndex = new GeospatialIndex<
  Id<'restaurants'>,
  { categories: Array<string> }
>(components.geospatial)
