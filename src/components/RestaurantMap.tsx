import { Icon } from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers not showing in production build
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-expect-error Leaflet type issue
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export interface Restaurant {
  _id: string
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
  // Center on San Francisco
  const center: [number, number] = [37.7749, -122.4194]
  const zoom = 12

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '600px', width: '100%' }}
      className="rounded-lg shadow-lg"
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
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-base">{restaurant.name}</h3>
              <p className="text-yellow-600">⭐ {restaurant.rating}</p>
              <p className="text-xs text-gray-600">{restaurant.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
