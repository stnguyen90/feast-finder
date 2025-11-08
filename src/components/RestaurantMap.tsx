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
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
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
  const [redMarkerIcon, setRedMarkerIcon] = useState<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      // Make Leaflet available globally for awesome-markers
      if (typeof window !== 'undefined') {
        (window as any).L = L
      }
      
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
            
            // Now that Leaflet is loaded globally, import awesome-markers
            import('leaflet.awesome-markers').then(() => {
              // Access L from window to get the AwesomeMarkers extension
              const LeafletWithMarkers = (window as any).L
              // Create a red marker icon using the awesome-markers API
              // Use empty icon string to create a solid colored marker without requiring Font Awesome
              const icon = LeafletWithMarkers.AwesomeMarkers.icon({
                icon: '',
                markerColor: 'red',
                iconColor: 'white',
                prefix: ''
              })
              setRedMarkerIcon(icon)
              setMapLoaded(true)
            }).catch((error) => {
              console.error('Error loading awesome-markers:', error)
              // Fall back to default markers if awesome-markers fails
              setMapLoaded(true)
            })
          })
        })
      })
    })

    // Import CSS for Leaflet and awesome-markers
    import('leaflet/dist/leaflet.css')
    import('leaflet.awesome-markers/dist/leaflet.awesome-markers.css')
  }, [])

  if (!mapLoaded) {
    return (
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  return <MapComponent 
    restaurants={restaurants} 
    onSelectRestaurant={onSelectRestaurant}
    redMarkerIcon={redMarkerIcon}
  />
}

interface MapComponentProps extends RestaurantMapProps {
  redMarkerIcon?: any
}

function MapComponent({
  restaurants,
  onSelectRestaurant,
  redMarkerIcon,
}: MapComponentProps) {
  // Lazy load react-leaflet components
  const [ReactLeaflet, setReactLeaflet] = useState<any>(null)

  useEffect(() => {
    // Load react-leaflet
    import('react-leaflet').then((module) => {
      setReactLeaflet(module)
    }).catch((error) => {
      console.error('Error loading react-leaflet:', error)
    })
  }, [])

  if (!ReactLeaflet) {
    return (
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker } = ReactLeaflet

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
          {...(redMarkerIcon ? { icon: redMarkerIcon } : {})}
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
