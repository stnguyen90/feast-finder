import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Restaurant } from '~/components/RestaurantMap'
import { RestaurantDetail } from '~/components/RestaurantDetail'
import { RestaurantMap } from '~/components/RestaurantMap'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: restaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.listRestaurants, {}),
  )

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)

  const seedRestaurants = useMutation(api.seedData.seedRestaurants)
  const [isSeeding, setIsSeeding] = useState(false)

  // Auto-seed on first load if no restaurants exist
  useEffect(() => {
    if (restaurants.length === 0 && !isSeeding) {
      setIsSeeding(true)
      seedRestaurants({})
        .then(() => {
          console.log('Restaurants seeded successfully')
        })
        .catch((error) => {
          console.error('Error seeding restaurants:', error)
        })
        .finally(() => {
          setIsSeeding(false)
        })
    }
  }, [restaurants.length, seedRestaurants, isSeeding])

  return (
    <main className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex-shrink-0 p-4 bg-white dark:bg-gray-900 shadow-sm">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          🍽️ Feast Finder
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-1">
          Discover amazing restaurants on an interactive map
        </p>
      </div>

      {isSeeding ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400">
          Loading restaurants...
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400">
          No restaurants found. Please wait while we load some sample data...
        </div>
      ) : (
        <div className="flex-1 relative">
          <RestaurantMap
            restaurants={restaurants}
            onSelectRestaurant={setSelectedRestaurant}
          />

          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        </div>
      )}
    </main>
  )
}
