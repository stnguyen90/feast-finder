import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Center,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ColorModeToggle } from '~/components/ColorModeToggle'

// Type for event data
interface Event {
  _id: Id<'events'>
  _creationTime: number
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  city: string
  latitude: number
  longitude: number
  restaurantIds: Array<Id<'restaurants'>>
  imageUrl?: string
  restaurantCount: number
}

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  // Fetch active events
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listActiveEvents, {}),
  )

  const seedEvents = useMutation(api.seedData.seedEvents)
  const [isSeeding, setIsSeeding] = useState(false)

  // Auto-seed events on first load if no events exist
  useEffect(() => {
    if (events.length === 0 && !isSeeding) {
      setIsSeeding(true)
      seedEvents({})
        .then(() => {
          console.log('Events seeded successfully')
        })
        .catch((error) => {
          console.error('Error seeding events:', error)
        })
        .finally(() => {
          setIsSeeding(false)
        })
    }
  }, [events.length, seedEvents, isSeeding])

  return (
    <Flex direction="column" minH="100vh" bg="bg.page">
      {/* Header */}
      <Flex
        flexShrink={0}
        p={4}
        bg="brand.solid"
        boxShadow="sm"
        align="center"
        justify="space-between"
      >
        <Box flex={1} textAlign="center">
          <Heading size="2xl" color="brand.contrast">
            🍽️ Feast Finder
          </Heading>
        </Box>
        <Box position="absolute" right={4}>
          <ColorModeToggle />
        </Box>
      </Flex>

      <Container maxW="container.xl" py={12}>
        {/* Hero Section */}
        <Box textAlign="center" mb={16}>
          <Heading size="4xl" mb={6}>
            Discover Your Next Culinary Adventure
          </Heading>
          <Text
            fontSize="xl"
            color="text.secondary"
            mb={8}
            maxW="2xl"
            mx="auto"
          >
            Feast Finder helps you explore restaurant week events and discover
            amazing dining experiences in the San Francisco Bay Area. Find
            exclusive prix-fixe menus, special tastings, and culinary events
            near you.
          </Text>
          <Link to="/restaurants">
            <Box
              as="button"
              px={12}
              py={4}
              fontSize="xl"
              fontWeight="semibold"
              bg="blue.500"
              color="white"
              borderRadius="md"
              _hover={{ bg: 'blue.600', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              boxShadow="md"
            >
              Explore Restaurants on Map
            </Box>
          </Link>
        </Box>

        {/* Features Section */}
        <Box mb={16}>
          <Heading size="xl" textAlign="center" mb={8}>
            Why Choose Feast Finder?
          </Heading>
          <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
            <Box
              flex={1}
              p={6}
              bg="bg.surface"
              borderRadius="lg"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4}>
                🗺️
              </Text>
              <Heading size="lg" mb={4}>
                Interactive Map
              </Heading>
              <Text color="text.secondary">
                Explore restaurants on an intuitive map interface. Pan, zoom,
                and discover hidden culinary gems across the Bay Area.
              </Text>
            </Box>
            <Box
              flex={1}
              p={6}
              bg="bg.surface"
              borderRadius="lg"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4}>
                🎉
              </Text>
              <Heading size="lg" mb={4}>
                Restaurant Week Events
              </Heading>
              <Text color="text.secondary">
                Never miss a restaurant week event. Get notified about special
                dining experiences, prix-fixe menus, and exclusive tastings.
              </Text>
            </Box>
            <Box
              flex={1}
              p={6}
              bg="bg.surface"
              borderRadius="lg"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4}>
                💲
              </Text>
              <Heading size="lg" mb={4}>
                Filter by Price
              </Heading>
              <Text color="text.secondary">
                Find restaurants that fit your budget. Filter by price range for
                brunch, lunch, or dinner to plan the perfect meal.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Events Section */}
        <Box>
          <Heading size="xl" textAlign="center" mb={2}>
            Upcoming Restaurant Week Events
          </Heading>
          <Text textAlign="center" color="text.secondary" mb={8}>
            Join special dining events featuring exclusive menus and experiences
          </Text>

          {isSeeding ? (
            <Center py={12}>
              <Flex direction="column" align="center" gap={4}>
                <Spinner size="xl" color="brand.solid" />
                <Text color="text.secondary">Loading events...</Text>
              </Flex>
            </Center>
          ) : events.length === 0 ? (
            <Center py={12}>
              <Box textAlign="center">
                <Text fontSize="xl" color="text.secondary" mb={4}>
                  No upcoming events at this time
                </Text>
                <Text color="text.secondary">
                  Check back soon for new restaurant week events and special
                  dining experiences!
                </Text>
              </Box>
            </Center>
          ) : (
            <Flex direction="column" gap={6}>
              {(events as Array<Event>).map((event: Event) => {
                const startDate = new Date(event.startDate)
                const endDate = new Date(event.endDate)
                const isActive =
                  new Date() >= startDate && new Date() <= endDate

                return (
                  <Box
                    key={event._id}
                    p={6}
                    bg="bg.surface"
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      gap={6}
                      align="flex-start"
                    >
                      <Box flex={1}>
                        <Flex align="center" gap={3} mb={2}>
                          <Heading size="lg">{event.name}</Heading>
                          {isActive && (
                            <Badge
                              colorScheme="green"
                              fontSize="sm"
                              px={2}
                              py={1}
                            >
                              Active Now
                            </Badge>
                          )}
                        </Flex>
                        <Text color="text.secondary" mb={4}>
                          📍 {event.location}
                        </Text>
                        <Text mb={4}>{event.description}</Text>
                        <Flex
                          gap={4}
                          mb={4}
                          fontSize="sm"
                          color="text.secondary"
                        >
                          <Text>
                            📅{' '}
                            {startDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            -{' '}
                            {endDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                          <Text>
                            🍽️ {event.restaurantCount}{' '}
                            {event.restaurantCount === 1
                              ? 'restaurant'
                              : 'restaurants'}
                          </Text>
                        </Flex>
                        <Link to="/restaurants">
                          <Box
                            as="button"
                            px={6}
                            py={3}
                            fontSize="lg"
                            fontWeight="semibold"
                            bg="blue.500"
                            color="white"
                            borderRadius="md"
                            _hover={{ bg: 'blue.600' }}
                            transition="all 0.2s"
                          >
                            View Participating Restaurants
                          </Box>
                        </Link>
                      </Box>
                    </Flex>
                  </Box>
                )
              })}
            </Flex>
          )}
        </Box>
      </Container>

      {/* Footer */}
      <Box mt="auto" py={8} bg="bg.subtle" textAlign="center">
        <Text color="text.secondary">
          © 2025 Feast Finder. Discover amazing restaurants in the San
          Francisco Bay Area.
        </Text>
      </Box>
    </Flex>
  )
}
