import { ClientOnly } from '@tanstack/react-router'
import RestaurantMapClient from './RestaurantMapClient'
import 'leaflet/dist/leaflet.css'
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css'

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

export function RestaurantMap({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapProps) {
  return (
    <ClientOnly
      fallback={
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      }
    >
      <RestaurantMapClient
        restaurants={restaurants}
        onSelectRestaurant={onSelectRestaurant}
      />
    </ClientOnly>
  )
}