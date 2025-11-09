import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { Restaurant } from './RestaurantMap'

interface RestaurantMapClientProps {
  restaurants: Array<Restaurant>
  onSelectRestaurant: (restaurant: Restaurant) => void
}

export function RestaurantMapClient({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapClientProps) {
  // Fix for default markers not showing in production build
  useEffect(() => {
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
