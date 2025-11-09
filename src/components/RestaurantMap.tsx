import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

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
  // Fix for default markers not showing in production build
  useEffect(() => {
    // Import Leaflet CSS
    import('leaflet/dist/leaflet.css')

    // Leaflet's default icon paths don't work with bundlers like Vite
    // This code explicitly sets the icon URLs to the imported assets
    // @ts-expect-error _getIconUrl is a private Leaflet property that we need to delete to set custom icons
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    })
  }, [])

  // Center on San Francisco
  const center: [number, number] = [37.7749, -122.4194]
  const zoom = 12

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="absolute inset-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant._id}
          position={[restaurant.latitude, restaurant.longitude]}
          eventHandlers={{
            click: () => {
              onSelectRestaurant(restaurant)
            },
          }}
        />
      ))}
    </MapContainer>
  )
}
