import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react'
import { FaCalendar, FaUtensils } from 'react-icons/fa6'
import { api } from '../../../convex/_generated/api'
import type { Restaurant } from '~/components/RestaurantMap'
import { ColorModeToggle } from '~/components/ColorModeToggle'
import { RestaurantDetail } from '~/components/RestaurantDetail'
import { RestaurantMap } from '~/components/RestaurantMap'
import { SignInModal } from '~/components/SignInModal'
import { UserMenu } from '~/components/UserMenu'

export const Route = createFileRoute('/events/$eventName')({
  component: EventRestaurants,
})

function EventRestaurants() {
  const { eventName } = Route.useParams()
  
  // Decode the event name from URL
  const decodedEventName = decodeURIComponent(eventName)

  // Fetch event details
  const { data: event } = useSuspenseQuery(
    convexQuery(api.events.getEventByName, { name: decodedEventName }),
  )

  // Fetch restaurants for this event
  const { data: restaurants } = useSuspenseQuery(
    convexQuery(api.events.getRestaurantsForEvent, { eventName: decodedEventName }),
  )

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)
  
  // Authentication modal state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  // If event not found, show error
  if (!event) {
    return (
      <Flex direction="column" h="100vh" bg="bg.page">
        <Flex
          flexShrink={0}
          p={4}
          bg="brand.solid"
          boxShadow="sm"
          align="center"
          justify="space-between"
        >
          <Box flex={1} textAlign="center">
            <Link to="/">
              <Flex align="center" justify="center" gap={2}>
                <FaUtensils size={32} color="var(--chakra-colors-brand-contrast)" />
                <Heading size="2xl" color="brand.contrast">
                  Feast Finder
                </Heading>
              </Flex>
            </Link>
          </Box>
          <Flex position="absolute" right={4} gap={2} align="center">
            <Authenticated>
              <AuthenticatedHeader />
            </Authenticated>
            <Unauthenticated>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSignInModalOpen(true)}
                color="brand.contrast"
                borderColor="brand.contrast"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              >
                Sign In
              </Button>
            </Unauthenticated>
            <ColorModeToggle />
          </Flex>
        </Flex>

        <Center flex={1}>
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="text.primary">
              Event Not Found
            </Heading>
            <Text color="text.secondary" mb={6}>
              The event "{decodedEventName}" could not be found.
            </Text>
            <Link to="/">
              <Text color="link.primary" textDecoration="underline">
                Go back to home
              </Text>
            </Link>
          </Box>
        </Center>
      </Flex>
    )
  }

  // Format dates
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isActive = new Date() >= startDate && new Date() <= endDate

  return (
    <Flex direction="column" h="100vh" bg="bg.page">
      <Flex
        flexShrink={0}
        p={4}
        bg="brand.solid"
        boxShadow="sm"
        align="center"
        justify="space-between"
      >
        <Box flex={1} textAlign="center">
          <Link to="/">
            <Flex align="center" justify="center" gap={2}>
              <FaUtensils size={32} color="var(--chakra-colors-brand-contrast)" />
              <Heading size="2xl" color="brand.contrast">
                Feast Finder
              </Heading>
            </Flex>
          </Link>
        </Box>
        <Flex position="absolute" right={4} gap={2} align="center">
          <Authenticated>
            <AuthenticatedHeader />
          </Authenticated>
          <Unauthenticated>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSignInModalOpen(true)}
              color="brand.contrast"
              borderColor="brand.contrast"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              Sign In
            </Button>
          </Unauthenticated>
          <ColorModeToggle />
        </Flex>
      </Flex>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />

      {/* Event Info Banner */}
      <Box bg="bg.surface" p={4} boxShadow="sm">
        <Flex align="center" justify="center" gap={3} mb={2}>
          <Heading size="lg" color="text.primary">
            {event.name}
          </Heading>
          {isActive && (
            <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
              Active Now
            </Badge>
          )}
        </Flex>
        <Flex
          justify="center"
          gap={4}
          fontSize="sm"
          color="text.secondary"
          wrap="wrap"
        >
          <Flex align="center" gap={1}>
            <FaCalendar />
            <Text>
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
          </Flex>
          <Flex align="center" gap={1}>
            <FaUtensils />
            <Text>
              {event.restaurantCount}{' '}
              {event.restaurantCount === 1 ? 'restaurant' : 'restaurants'}
            </Text>
          </Flex>
        </Flex>
      </Box>

      {restaurants.length === 0 ? (
        <Center flex={1} color="text.secondary">
          <Box textAlign="center">
            <Text fontSize="xl" mb={4}>
              No restaurants found for this event
            </Text>
            <Link to="/">
              <Text color="link.primary" textDecoration="underline">
                Go back to home
              </Text>
            </Link>
          </Box>
        </Center>
      ) : (
        <Box flex={1} position="relative">
          <RestaurantMap
            restaurants={restaurants}
            onSelectRestaurant={setSelectedRestaurant}
            onBoundsChange={() => {}}
            initialCenter={
              restaurants.length > 0
                ? {
                    lat: restaurants[0].latitude,
                    lng: restaurants[0].longitude,
                  }
                : { lat: event.latitude, lng: event.longitude }
            }
            initialZoom={13}
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

// Component to display authenticated user header
function AuthenticatedHeader() {
  const currentUser = useQuery(api.users.getCurrentUser)
  
  if (!currentUser) {
    return null
  }

  return <UserMenu userName={currentUser.name || 'User'} />
}
