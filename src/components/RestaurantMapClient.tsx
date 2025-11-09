import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import 'leaflet.awesome-markers'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { Restaurant } from './RestaurantMap'

interface RestaurantMapClientProps {
  restaurants: Array<Restaurant>
  onSelectRestaurant: (restaurant: Restaurant) => void
}

export default function RestaurantMapClient({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapClientProps) {
  const [redMarkerIcon, setRedMarkerIcon] = useState<L.AwesomeMarkers.Icon | null>(null)

  useEffect(() => {
    // Fix Leaflet's default icon paths for bundlers like Vite
    // @ts-expect-error _getIconUrl is a private Leaflet property
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    })

    // Make Leaflet globally available for awesome-markers
    if (typeof window !== 'undefined') {
      ;(window as any).L = L
    }

    // Create red marker icon using awesome-markers
    // Use 'fa' as prefix but empty icon to create solid colored marker without requiring Font Awesome
    const icon = L.AwesomeMarkers.icon({
      icon: '',
      markerColor: 'red',
      iconColor: 'white',
      prefix: 'fa',
    })
    setRedMarkerIcon(icon)
  }, [])

  if (!redMarkerIcon) {
    return (
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

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
          icon={redMarkerIcon}
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
