import { Suspense, lazy, useEffect } from 'react'
import { ClientOnly } from '@tanstack/react-router'

export interface Restaurant {
  _id: string
  _creationTime: number
  name: string
  rating: number
  latitude: number
  longitude: number
  address: string
  websiteUrl?: string
  yelpUrl?: string
  openTableUrl?: string
  categories: Array<string>
  hasBrunch: boolean
  hasLunch: boolean
  hasDinner: boolean
  brunchPrice?: number
  lunchPrice?: number
  dinnerPrice?: number
}

interface RestaurantMapProps {
  restaurants: Array<Restaurant>
  onSelectRestaurant: (restaurant: Restaurant) => void
}

// Loading fallback component
function MapLoading() {
  return (
    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  )
}

// Lazy load the actual map component (client-side only)
const LazyMapComponent = lazy(() =>
  import('./RestaurantMapClient').then((module) => ({
    default: module.RestaurantMapClient,
  })),
)

export function RestaurantMap({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapProps) {
  // Import Leaflet CSS once on mount
  useEffect(() => {
    import('leaflet/dist/leaflet.css')
  }, [])

  return (
    <ClientOnly fallback={<MapLoading />}>
      <Suspense fallback={<MapLoading />}>
        <LazyMapComponent
          restaurants={restaurants}
          onSelectRestaurant={onSelectRestaurant}
        />
      </Suspense>
    </ClientOnly>
  )
}
