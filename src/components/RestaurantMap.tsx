import { useEffect, useState } from 'react'

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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only render map on client side to avoid SSR issues with Leaflet
  if (!isClient) {
    return (
      <div
        className="rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height: '600px', width: '100%' }}
      >
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return <ClientOnlyMap restaurants={restaurants} onSelectRestaurant={onSelectRestaurant} />
}

function ClientOnlyMap({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      // Fix for default markers not showing in production build
      import('leaflet/dist/images/marker-icon-2x.png').then((markerIcon2x) => {
        import('leaflet/dist/images/marker-icon.png').then((markerIcon) => {
          import('leaflet/dist/images/marker-shadow.png').then((markerShadow) => {
            // Leaflet's default icon paths don't work with bundlers like Vite
            // This code explicitly sets the icon URLs to the imported assets
            // @ts-expect-error _getIconUrl is a private Leaflet property that we need to delete to set custom icons
            delete L.Icon.Default.prototype._getIconUrl
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: markerIcon2x.default,
              iconUrl: markerIcon.default,
              shadowUrl: markerShadow.default,
            })
            setMapLoaded(true)
          })
        })
      })
    })

    // Import CSS
    import('leaflet/dist/leaflet.css')
  }, [])

  if (!mapLoaded) {
    return (
      <div
        className="rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height: '600px', width: '100%' }}
      >
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return <MapComponent restaurants={restaurants} onSelectRestaurant={onSelectRestaurant} />
}

function MapComponent({
  restaurants,
  onSelectRestaurant,
}: RestaurantMapProps) {
  // Lazy load react-leaflet components
  const [ReactLeaflet, setReactLeaflet] = useState<any>(null)

  useEffect(() => {
    import('react-leaflet').then((module) => {
      setReactLeaflet(module)
    })
  }, [])

  if (!ReactLeaflet) {
    return (
      <div
        className="rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ height: '600px', width: '100%' }}
      >
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet

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
