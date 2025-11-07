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
    convexQuery(api.myFunctions.listRestaurants, {}),
  )

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)

  const seedRestaurants = useMutation(api.myFunctions.seedRestaurants)
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            🍽️ Feast Finder
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
            Discover amazing restaurants on an interactive map
          </p>
        </div>

        {isSeeding ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            Loading restaurants...
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            No restaurants found. Please wait while we load some sample data...
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Click on any marker to view restaurant details • Found{' '}
                {restaurants.length} restaurants
              </p>
            </div>

            <RestaurantMap
              restaurants={restaurants as Array<Restaurant>}
              onSelectRestaurant={setSelectedRestaurant}
            />

            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
            />
          </>
        )}
      </div>
    </main>
  )
}
