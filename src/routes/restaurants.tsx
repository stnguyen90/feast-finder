import { Link, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { Authenticated, Unauthenticated, useMutation } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  IconButton,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaUtensils } from 'react-icons/fa6'
import { api } from '../../convex/_generated/api'
import type { MapBounds, Restaurant } from '~/components/RestaurantMap'
import type { PriceFilterState } from '~/components/PriceFilter'
import { ColorModeToggle } from '~/components/ColorModeToggle'
import { PriceFilter } from '~/components/PriceFilter'
import { CategoryFilter } from '~/components/CategoryFilter'
import { RestaurantDetail } from '~/components/RestaurantDetail'
import { RestaurantMap } from '~/components/RestaurantMap'
import { SignInModal } from '~/components/SignInModal'
import { UserMenu } from '~/components/UserMenu'

// Define search params schema for URL state
interface SearchParams {
  minBrunchPrice?: number
  maxBrunchPrice?: number
  minLunchPrice?: number
  maxLunchPrice?: number
  minDinnerPrice?: number
  maxDinnerPrice?: number
  categories?: Array<string>
  lat?: number
  lng?: number
  zoom?: number
}

export const Route = createFileRoute('/restaurants')({
  component: Restaurants,
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
      lat: search.lat ? Number(search.lat) : undefined,
      lng: search.lng ? Number(search.lng) : undefined,
      zoom: search.zoom ? Number(search.zoom) : undefined,
    }
  },
})

function Restaurants() {
  const navigate = useNavigate({ from: '/restaurants' })
  const searchParams = useSearch({ from: '/restaurants' })

  // Track map bounds for geospatial queries
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  
  // Authentication modal state
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

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

  const [showFilters, setShowFilters] = useState(false)

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

  // Always fetch all restaurants for now (used for seeding check only)
  const { data: allRestaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.listRestaurants, {}),
  )

  // Fetch restaurants with both geospatial and price filtering in a single query
  // Use regular useQuery with placeholderData to prevent flickering
  const geoQueryArgs = mapBounds ?? { north: 0, south: 0, east: 0, west: 0 }
  const { data: geoRestaurantsResult } = useQuery({
    ...convexQuery(api.restaurantsGeo.queryRestaurantsInBounds, {
      bounds: geoQueryArgs,
      ...priceFilters, // Include all price filter parameters
      categories: selectedCategories.length > 0 ? selectedCategories : undefined, // Include category filter
    }),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })

  // Use geospatial results directly - filtering is done in database
  const restaurants = useMemo(() => {
    if (mapBounds !== null && geoRestaurantsResult) {
      return geoRestaurantsResult.results
    }
    return allRestaurants
  }, [mapBounds, geoRestaurantsResult, allRestaurants])

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)

  const seedRestaurants = useMutation(api.seedData.seedRestaurants)
  const syncAllToIndex = useMutation(
    api.restaurantsGeo.syncAllRestaurantsToIndex,
  )
  const [isSeeding, setIsSeeding] = useState(false)

  // Auto-seed on first load if no restaurants exist
  useEffect(() => {
    if (allRestaurants.length === 0 && !isSeeding) {
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
  }, [allRestaurants.length, seedRestaurants, isSeeding])

  // Sync existing restaurants to geospatial index on first load
  useEffect(() => {
    if (allRestaurants.length > 0 && !isSeeding) {
      // Only sync once - check if we've already synced
      const hasSynced = localStorage.getItem('geospatial-synced')
      if (!hasSynced) {
        console.log('Syncing restaurants to geospatial index...')
        syncAllToIndex({})
          .then((result) => {
            console.log(
              `Synced ${result.synced} restaurants to geospatial index`,
            )
            localStorage.setItem('geospatial-synced', 'true')
          })
          .catch((error) => {
            console.error('Error syncing to geospatial index:', error)
          })
      }
    }
  }, [allRestaurants.length, syncAllToIndex, isSeeding])

  const handleBoundsChange = useCallback(
    (
      bounds: MapBounds,
      center?: { lat: number; lng: number },
      zoom?: number,
    ) => {
      // Debounce bounds updates to prevent flickering during pan
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        setMapBounds(bounds)

        // Update URL with map position if provided
        if (center && zoom !== undefined) {
          navigate({
            search: (prev) => ({
              ...prev,
              lat: center.lat,
              lng: center.lng,
              zoom,
            }),
            replace: true,
          })
        }
      }, 300) // 300ms debounce
    },
    [navigate],
  )

  const handleFilterChange = useCallback(
    (filters: PriceFilterState) => {
      // Update pending state, don't navigate yet
      setPendingPriceFilters(filters)
    },
    [],
  )

  const handleCategoryFilterChange = useCallback(
    (categories: Array<string>) => {
      // Update pending state, don't navigate yet
      setPendingCategories(categories)
    },
    [],
  )

  const handleApplyFilters = useCallback(() => {
    // Apply all pending filters and close panel
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
    // Clear all filters
    setPendingPriceFilters({})
    setPendingCategories([])
    navigate({
      search: (prev) => ({
        lat: prev.lat,
        lng: prev.lng,
        zoom: prev.zoom,
      }),
      replace: true,
    })
  }, [navigate])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Click outside to close filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
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

      {isSeeding ? (
        <Center flex={1} color="text.secondary">
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" color="brand.solid" />
            <Text>Loading restaurants...</Text>
          </Flex>
        </Center>
      ) : allRestaurants.length === 0 ? (
        <Center flex={1} color="text.secondary">
          <Text>
            No restaurants found. Please wait while we load some sample data...
          </Text>
        </Center>
      ) : (
        <Box flex={1} position="relative">
          <RestaurantMap
            restaurants={restaurants}
            onSelectRestaurant={setSelectedRestaurant}
            onBoundsChange={handleBoundsChange}
            initialCenter={
              searchParams.lat && searchParams.lng
                ? { lat: searchParams.lat, lng: searchParams.lng }
                : undefined
            }
            initialZoom={searchParams.zoom}
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
                  {/* Price Filter */}
                  <PriceFilter
                    onFilterChange={handleFilterChange}
                    onClearFilters={() => setPendingPriceFilters({})}
                    initialValues={pendingPriceFilters}
                    hideButtons={true}
                  />

                  {/* Category Filter */}
                  <CategoryFilter
                    onFilterChange={handleCategoryFilterChange}
                    onClearFilters={() => setPendingCategories([])}
                    initialValues={pendingCategories}
                    hideButtons={true}
                  />

                  {/* Single set of buttons at the bottom */}
                  <HStack gap={2} pt={2}>
                    <Button
                      bg="brand.solid"
                      color="brand.contrast"
                      size="sm"
                      flex={1}
                      onClick={handleApplyFilters}
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
        </Box>
      )}
    </Flex>
  )
}

// Component to display authenticated user header
function AuthenticatedHeader() {
  // @ts-expect-error - api.users will be available after convex codegen is run
  const currentUser = useQuery(api.users?.getCurrentUser)
  
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!currentUser) {
    return null
  }

  return <UserMenu userName={(currentUser as any).name || 'User'} />
}
