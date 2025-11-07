import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { Box, Center, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
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
    <Flex direction="column" h="100vh" bg="gray.50">
      <Box
        flexShrink={0}
        p={4}
        bg="#a20000"
        boxShadow="sm"
        textAlign="center"
      >
        <Heading size="2xl" color="white">
          🍽️ Feast Finder
        </Heading>
        <Text color="red.100" fontSize="sm" mt={1}>
          Discover amazing restaurants on an interactive map
        </Text>
      </Box>

      {isSeeding ? (
        <Center flex={1} color="gray.600">
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" color="#a20000" />
            <Text>Loading restaurants...</Text>
          </Flex>
        </Center>
      ) : restaurants.length === 0 ? (
        <Center flex={1} color="gray.600">
          <Text>
            No restaurants found. Please wait while we load some sample data...
          </Text>
        </Center>
      ) : (
        <Box flex={1} position="relative">
          <RestaurantMap
            restaurants={restaurants}
            onSelectRestaurant={setSelectedRestaurant}
          />

          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        </Box>
      )}
    </Flex>
  )
}
