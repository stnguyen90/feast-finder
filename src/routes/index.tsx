import { Link as RouterLink, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Authenticated, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  Link,
  Spinner,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import { FaCalendar, FaFilter, FaGlobe, FaMapLocationDot, FaUser, FaUtensils } from 'react-icons/fa6'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ColorModeToggle } from '~/components/ColorModeToggle'
import { SignInModal } from '~/components/SignInModal'
import { UserMenu } from '~/components/UserMenu'

// Type for event data
interface Event {
  _id: Id<'events'>
  _creationTime: number
  name: string
  startDate: string
  endDate: string
  latitude: number
  longitude: number
  websiteUrl?: string
  syncTime: number
  menuCount: number
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
  const [hasAttemptedSeed, setHasAttemptedSeed] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  // Auto-seed events on first load if no events exist
  useEffect(() => {
    if (events.length === 0 && !isSeeding && !hasAttemptedSeed) {
      setIsSeeding(true)
      setHasAttemptedSeed(true)
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
  }, [events.length, seedEvents, isSeeding, hasAttemptedSeed])

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
          <Flex align="center" justify="center" gap={2}>
            <FaUtensils size={32} color="var(--chakra-colors-brand-contrast)" />
            <Heading size="2xl" color="brand.contrast">
              Feast Finder
            </Heading>
          </Flex>
        </Box>
        <Flex position="absolute" right={4} gap={2} align="center">
          <Authenticated>
            <AuthenticatedHeader />
          </Authenticated>
          <Unauthenticated>
            <IconButton
              aria-label="Sign In"
              variant="ghost"
              size="md"
              onClick={() => setIsSignInModalOpen(true)}
              color="brand.contrast"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaUser />
            </IconButton>
          </Unauthenticated>
          <ColorModeToggle />
        </Flex>
      </Flex>

      <Container maxW="container.xl" py={12}>
        {/* Hero Section */}
        <Box textAlign="center" mb={16} position="relative">
          <Heading size="5xl" mb={6} fontWeight="extrabold" color="text.primary">
            Discover Your Next
            <br />
            <Box
              as="span"
              bgGradient="to-r"
              gradientFrom="brand.solid"
              gradientTo="purple.500"
              bgClip="text"
            >
              Culinary Adventure
            </Box>
          </Heading>
          <Text
            fontSize="xl"
            color="text.secondary"
            mb={8}
            maxW="2xl"
            mx="auto"
            lineHeight="tall"
          >
            Feast Finder helps you explore restaurant week events and discover
            amazing dining experiences near you. Find exclusive prix-fixe menus,
            special tastings, and culinary events in your area.
          </Text>
          <Button asChild bg="brand.solid" color="brand.contrast" size="xl">
            <RouterLink to="/restaurants">Explore Restaurants</RouterLink>
          </Button>
        </Box>

        {/* Features Section */}
        <Box mb={16}>
          <VisuallyHidden>
            <Heading size="xl" textAlign="center" mb={8}>
              Why Choose Feast Finder?
            </Heading>
          </VisuallyHidden>
          <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
            <Box
              flex={1}
              p={6}
              bg="bg.surface"
              borderRadius="lg"
              boxShadow="md"
            >
              <Box fontSize="4xl" mb={4} color="brand.solid">
                <FaMapLocationDot />
              </Box>
              <Heading size="lg" mb={4} color="text.primary">
                Interactive Map
              </Heading>
              <Text color="text.secondary">
                Explore restaurants on an intuitive map interface. Pan, zoom,
                and discover hidden culinary gems in your area.
              </Text>
            </Box>
            <Box
              flex={1}
              p={6}
              bg="bg.surface"
              borderRadius="lg"
              boxShadow="md"
            >
              <Box fontSize="4xl" mb={4} color="brand.solid">
                <FaCalendar />
              </Box>
              <Heading size="lg" mb={4} color="text.primary">
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
              <Box fontSize="4xl" mb={4} color="brand.solid">
                <FaFilter />
              </Box>
              <Heading size="lg" mb={4} color="text.primary">
                Easy Filtering
              </Heading>
              <Text color="text.secondary">
                Filter restaurants by price, meal type, cuisine, and more to
                easily find exactly what you're looking for.
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Events Section */}
        <Box>
          <Heading size="xl" textAlign="center" mb={2} color="text.primary">
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
                        <Flex align="center" gap={3} mb={4}>
                          <Heading size="lg" color="text.primary">{event.name}</Heading>
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
                        <Flex
                          gap={4}
                          mb={4}
                          fontSize="sm"
                          color="text.secondary"
                          direction="column"
                          align="flex-start"
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
                              {event.restaurantCount === 1
                                ? 'restaurant'
                                : 'restaurants'}
                            </Text>
                          </Flex>
                        </Flex>
                        {event.websiteUrl && (
                          <Box mb={4}>
                            <Link
                              href={event.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="link.primary"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              <Flex align="center" gap={1}>
                                <FaGlobe />
                                <span>Event Website</span>
                              </Flex>
                            </Link>
                          </Box>
                        )}
                        <Button asChild bg="brand.solid" color="brand.contrast" size="lg">
                          <RouterLink 
                            to="/events/$eventName" 
                            params={{ eventName: encodeURIComponent(event.name) }}
                          >
                            View Restaurants
                          </RouterLink>
                        </Button>
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
          © 2025 Feast Finder. Discover amazing restaurants near you.
        </Text>
      </Box>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
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
