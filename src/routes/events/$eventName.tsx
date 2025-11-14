import { Link as TanStackLink, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaCalendar, FaUtensils } from 'react-icons/fa6'
import { useCustomer } from 'autumn-js/react'
import { api } from '../../../convex/_generated/api'
import type { Restaurant } from '~/components/RestaurantMap'
import type { PriceFilterState } from '~/components/PriceFilter'
import { Header } from '~/components/Header'
import { PriceFilter } from '~/components/PriceFilter'
import { CategoryFilter } from '~/components/CategoryFilter'
import { RestaurantDetail } from '~/components/RestaurantDetail'
import { RestaurantMap } from '~/components/RestaurantMap'
import { SignInModal } from '~/components/SignInModal'
import { PREMIUM_FEATURES } from '~/lib/premiumFeatures'

// Define search params schema for URL state
interface SearchParams {
  minBrunchPrice?: number
  maxBrunchPrice?: number
  minLunchPrice?: number
  maxLunchPrice?: number
  minDinnerPrice?: number
  maxDinnerPrice?: number
  categories?: Array<string>
}

export const Route = createFileRoute('/events/$eventName')({
  component: EventRestaurants,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      minBrunchPrice: search.minBrunchPrice
        ? Number(search.minBrunchPrice)
        : undefined,
      maxBrunchPrice: search.maxBrunchPrice
        ? Number(search.maxBrunchPrice)
        : undefined,
      minLunchPrice: search.minLunchPrice
        ? Number(search.minLunchPrice)
        : undefined,
      maxLunchPrice: search.maxLunchPrice
        ? Number(search.maxLunchPrice)
        : undefined,
      minDinnerPrice: search.minDinnerPrice
        ? Number(search.minDinnerPrice)
        : undefined,
      maxDinnerPrice: search.maxDinnerPrice
        ? Number(search.maxDinnerPrice)
        : undefined,
      categories: search.categories
        ? Array.isArray(search.categories)
          ? search.categories
          : [search.categories]
        : undefined,
    }
  },
})

function EventRestaurants() {
  const { eventName } = Route.useParams()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchParams = useSearch({ from: Route.fullPath })

  // Decode the event name from URL
  const decodedEventName = decodeURIComponent(eventName)

  // Track price filter state from URL
  const priceFilters: PriceFilterState = useMemo(
    () => ({
      minBrunchPrice: searchParams.minBrunchPrice,
      maxBrunchPrice: searchParams.maxBrunchPrice,
      minLunchPrice: searchParams.minLunchPrice,
      maxLunchPrice: searchParams.maxLunchPrice,
      minDinnerPrice: searchParams.minDinnerPrice,
      maxDinnerPrice: searchParams.maxDinnerPrice,
    }),
    [searchParams],
  )

  // Track category filter state from URL
  const selectedCategories = useMemo(
    () => searchParams.categories ?? [],
    [searchParams.categories],
  )

  // Check premium access for advanced filters
  const { customer, check, checkout } = useCustomer()

  // Check if user has access to advanced filters
  const hasAdvancedFilters = useMemo(() => {
    const result = check({ featureId: PREMIUM_FEATURES.ADVANCED_FILTERS })
    return result.data.allowed
  }, [check, customer])

  // Check if free user is using any filters
  const isUsingAnyFilters = useMemo(() => {
    const priceFilterCount = Object.values(priceFilters).filter(
      (v) => v !== undefined,
    ).length
    const categoryCount = selectedCategories.length
    return priceFilterCount + categoryCount >= 1
  }, [priceFilters, selectedCategories])

  // Determine if filters should be disabled
  const shouldDisableFilters = !hasAdvancedFilters && isUsingAnyFilters

  const [showFilters, setShowFilters] = useState(false)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)

  // Local state for pending filter changes (not yet applied)
  const [pendingPriceFilters, setPendingPriceFilters] =
    useState<PriceFilterState>(priceFilters)
  const [pendingCategories, setPendingCategories] =
    useState<Array<string>>(selectedCategories)

  // Update pending filters when URL changes
  useEffect(() => {
    setPendingPriceFilters(priceFilters)
  }, [priceFilters])

  useEffect(() => {
    setPendingCategories(selectedCategories)
  }, [selectedCategories])

  // Fetch event details
  const { data: event } = useSuspenseQuery(
    convexQuery(api.events.getEventByName, { name: decodedEventName }),
  )

  // Fetch restaurants for this event (will be filtered)
  const { data: allRestaurants } = useSuspenseQuery(
    convexQuery(api.events.getRestaurantsForEvent, {
      eventName: decodedEventName,
    }),
  )

  // Apply filters in memory (since event page doesn't use geospatial query)
  const filteredRestaurants = useMemo(() => {
    let filtered = allRestaurants

    // Apply price filters
    const hasPriceFilters = Object.values(priceFilters).some(
      (v) => v !== undefined,
    )
    if (hasPriceFilters) {
      filtered = filtered.filter((restaurant) => {
        // Check brunch price
        if (
          priceFilters.minBrunchPrice !== undefined ||
          priceFilters.maxBrunchPrice !== undefined
        ) {
          if (
            restaurant.hasBrunch &&
            restaurant.brunchPrice !== undefined &&
            (priceFilters.minBrunchPrice === undefined ||
              restaurant.brunchPrice >= priceFilters.minBrunchPrice) &&
            (priceFilters.maxBrunchPrice === undefined ||
              restaurant.brunchPrice <= priceFilters.maxBrunchPrice)
          ) {
            return true
          }
        }

        // Check lunch price
        if (
          priceFilters.minLunchPrice !== undefined ||
          priceFilters.maxLunchPrice !== undefined
        ) {
          if (
            restaurant.hasLunch &&
            restaurant.lunchPrice !== undefined &&
            (priceFilters.minLunchPrice === undefined ||
              restaurant.lunchPrice >= priceFilters.minLunchPrice) &&
            (priceFilters.maxLunchPrice === undefined ||
              restaurant.lunchPrice <= priceFilters.maxLunchPrice)
          ) {
            return true
          }
        }

        // Check dinner price
        if (
          priceFilters.minDinnerPrice !== undefined ||
          priceFilters.maxDinnerPrice !== undefined
        ) {
          if (
            restaurant.hasDinner &&
            restaurant.dinnerPrice !== undefined &&
            (priceFilters.minDinnerPrice === undefined ||
              restaurant.dinnerPrice >= priceFilters.minDinnerPrice) &&
            (priceFilters.maxDinnerPrice === undefined ||
              restaurant.dinnerPrice <= priceFilters.maxDinnerPrice)
          ) {
            return true
          }
        }

        return false
      })
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((restaurant) =>
        restaurant.categories.some((category) =>
          selectedCategories.includes(category),
        ),
      )
    }

    return filtered
  }, [allRestaurants, priceFilters, selectedCategories])

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)

  // Authentication modal state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  const handleUpgrade = useCallback(async () => {
    await checkout({
      productId: 'premium',
    })
  }, [checkout])

  const handleFilterChange = useCallback((filters: PriceFilterState) => {
    setPendingPriceFilters(filters)
  }, [])

  const handleCategoryFilterChange = useCallback(
    (categories: Array<string>) => {
      setPendingCategories(categories)
    },
    [],
  )

  const handleApplyFilters = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        minBrunchPrice: pendingPriceFilters.minBrunchPrice,
        maxBrunchPrice: pendingPriceFilters.maxBrunchPrice,
        minLunchPrice: pendingPriceFilters.minLunchPrice,
        maxLunchPrice: pendingPriceFilters.maxLunchPrice,
        minDinnerPrice: pendingPriceFilters.minDinnerPrice,
        maxDinnerPrice: pendingPriceFilters.maxDinnerPrice,
        categories:
          pendingCategories.length > 0 ? pendingCategories : undefined,
      }),
      replace: true,
    })
    setShowFilters(false)
  }, [navigate, pendingPriceFilters, pendingCategories])

  const handleClearFilters = useCallback(() => {
    setPendingPriceFilters({})
    setPendingCategories([])
    navigate({
      search: () => ({}),
      replace: true,
    })
  }, [navigate])

  // Click outside to close filters
  useEffect(() => {
    const handleClickOutside = (mouseEvent: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(mouseEvent.target as Node) &&
        showFilters
      ) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFilters])

  // If event not found, show error
  if (!event) {
    return (
      <Flex direction="column" h="100vh" bg="bg.page">
        <Header onSignInClick={() => setIsSignInModalOpen(true)} />

        <Center flex={1}>
          <Box textAlign="center">
            <Heading size="xl" mb={4} color="text.primary">
              Event Not Found
            </Heading>
            <Text color="text.secondary" mb={6}>
              The event "{decodedEventName}" could not be found.
            </Text>
            <TanStackLink to="/">
              <Text color="link.primary" textDecoration="underline">
                Go back to home
              </Text>
            </TanStackLink>
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
      <Header onSignInClick={() => setIsSignInModalOpen(true)} />

      {/* Event Info Banner */}
      <Box bg="bg.surface" boxShadow="sm" flexShrink={0}>
        <Box p={4}>
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
      </Box>

      {filteredRestaurants.length === 0 ? (
        <Center flex={1} color="text.secondary">
          <Box textAlign="center">
            <Text fontSize="xl" mb={4}>
              {allRestaurants.length === 0
                ? 'No restaurants found for this event'
                : 'No restaurants match your filters'}
            </Text>
            {allRestaurants.length > 0 && (
              <Button
                onClick={handleClearFilters}
                colorScheme="blue"
                size="md"
                mb={4}
              >
                Clear Filters
              </Button>
            )}
            <TanStackLink to="/">
              <Text color="link.primary" textDecoration="underline">
                Go back to home
              </Text>
            </TanStackLink>
          </Box>
        </Center>
      ) : (
        <Box flex={1} position="relative">
          <RestaurantMap
            restaurants={filteredRestaurants}
            onSelectRestaurant={setSelectedRestaurant}
            onBoundsChange={() => {}}
            initialCenter={
              allRestaurants.length > 0
                ? {
                    lat: allRestaurants[0].latitude,
                    lng: allRestaurants[0].longitude,
                  }
                : { lat: event.latitude, lng: event.longitude }
            }
            initialZoom={13}
          />

          {/* Filter Panel */}
          <Box position="absolute" top={4} left={4} zIndex={1000}>
            {!showFilters ? (
              <IconButton
                aria-label="Filters"
                bg="bg.surface"
                borderRadius="md"
                boxShadow="md"
                onClick={() => setShowFilters(true)}
                _hover={{ bg: 'bg.subtle' }}
                size="lg"
              >
                🔍
              </IconButton>
            ) : (
              <Box
                ref={filterPanelRef}
                bg="bg.surface"
                p={4}
                borderRadius="md"
                boxShadow="lg"
                w="100%"
                maxW="400px"
              >
                <VStack gap={4} align="stretch">
                  {/* Premium Alert */}
                  {!hasAdvancedFilters && (
                    <Alert.Root status="info" variant="subtle">
                      <Alert.Content>
                        <Alert.Description>
                          Upgrade to use multiple filters
                        </Alert.Description>
                      </Alert.Content>
                      <Button
                        onClick={handleUpgrade}
                        variant="ghost"
                        size="sm"
                        colorPalette="blue"
                        _hover={{ bg: 'blue.100' }}
                      >
                        Upgrade
                      </Button>
                    </Alert.Root>
                  )}

                  {/* Price Filter */}
                  <PriceFilter
                    onFilterChange={handleFilterChange}
                    onClearFilters={() => setPendingPriceFilters({})}
                    initialValues={pendingPriceFilters}
                    hideButtons={true}
                    disabled={shouldDisableFilters}
                  />

                  {/* Category Filter */}
                  <CategoryFilter
                    onFilterChange={handleCategoryFilterChange}
                    onClearFilters={() => setPendingCategories([])}
                    initialValues={pendingCategories}
                    hideButtons={true}
                    disabled={shouldDisableFilters}
                  />

                  {/* Single set of buttons at the bottom */}
                  <HStack gap={2} pt={2}>
                    <Button
                      bg="brand.solid"
                      color="brand.contrast"
                      size="sm"
                      flex={1}
                      onClick={handleApplyFilters}
                      disabled={shouldDisableFilters}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      flex={1}
                      onClick={handleClearFilters}
                    >
                      Clear
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>

          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />

          <SignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
          />
        </Box>
      )}
    </Flex>
  )
}

// Component to display authenticated user header
