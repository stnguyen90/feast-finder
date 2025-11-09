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
  const [ReactLeaflet, setReactLeaflet] = useState<any>(null)
  const [customIcon, setCustomIcon] = useState<any>(null)

  // Lazy load Leaflet CSS, react-leaflet components and Leaflet library
  useEffect(() => {
    Promise.all([
      import('leaflet/dist/leaflet.css'),
      import('react-leaflet'),
      import('leaflet')
    ]).then(([_, reactLeafletModule, L]) => {
      setReactLeaflet(reactLeafletModule)
      
      // Create custom icon using the provided SVG
      const svgIcon = L.divIcon({
        html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 1.848.428 3.67 1.247 5.335L12.5 41l11.253-23.165C24.572 16.17 25 14.348 25 12.5 25 5.596 19.404 0 12.5 0z" fill="#a20000"/>
    <circle cx="12.5" cy="12.5" r="4" fill="white"/>
</svg>`,
        className: 'custom-marker-icon',
        iconSize: [25, 41],
        iconAnchor: [12.5, 41],
        popupAnchor: [0, -41],
      })
      
      setCustomIcon(svgIcon)
    })
  }, [])

  // Show loading state while initializing
  if (!ReactLeaflet || !customIcon) {
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
          icon={customIcon}
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
