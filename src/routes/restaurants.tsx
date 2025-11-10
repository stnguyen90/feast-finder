import { Link, createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
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
  const [activeFilterTab, setActiveFilterTab] = useState<'price' | 'category'>(
    'price',
  )

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
      navigate({
        search: (prev) => ({
          ...prev,
          minBrunchPrice: filters.minBrunchPrice,
          maxBrunchPrice: filters.maxBrunchPrice,
          minLunchPrice: filters.minLunchPrice,
          maxLunchPrice: filters.maxLunchPrice,
          minDinnerPrice: filters.minDinnerPrice,
          maxDinnerPrice: filters.maxDinnerPrice,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const handleCategoryFilterChange = useCallback(
    (categories: Array<string>) => {
      navigate({
        search: (prev) => ({
          ...prev,
          categories: categories.length > 0 ? categories : undefined,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const handleClearFilters = useCallback(() => {
    navigate({
      search: (prev) => ({
        lat: prev.lat,
        lng: prev.lng,
        zoom: prev.zoom,
      }),
      replace: true,
    })
  }, [navigate])

  const handleClearCategoryFilters = useCallback(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        categories: undefined,
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
        <Box position="absolute" right={4}>
          <ColorModeToggle />
        </Box>
      </Flex>

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
              <Box>
                {/* Filter tabs */}
                <Box
                  bg="bg.surface"
                  borderRadius="md"
                  boxShadow="md"
                  mb={2}
                  p={2}
                >
                  <HStack gap={2}>
                    <Button
                      size="sm"
                      variant={activeFilterTab === 'price' ? 'solid' : 'ghost'}
                      onClick={() => setActiveFilterTab('price')}
                      bg={
                        activeFilterTab === 'price'
                          ? 'brand.solid'
                          : 'transparent'
                      }
                      color={
                        activeFilterTab === 'price'
                          ? 'brand.contrast'
                          : 'text.primary'
                      }
                    >
                      Price
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        activeFilterTab === 'category' ? 'solid' : 'ghost'
                      }
                      onClick={() => setActiveFilterTab('category')}
                      bg={
                        activeFilterTab === 'category'
                          ? 'brand.solid'
                          : 'transparent'
                      }
                      color={
                        activeFilterTab === 'category'
                          ? 'brand.contrast'
                          : 'text.primary'
                      }
                    >
                      Categories
                    </Button>
                  </HStack>
                </Box>

                {/* Active filter content */}
                {activeFilterTab === 'price' ? (
                  <PriceFilter
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    onApply={() => setShowFilters(false)}
                    initialValues={priceFilters}
                  />
                ) : (
                  <CategoryFilter
                    onFilterChange={handleCategoryFilterChange}
                    onClearFilters={handleClearCategoryFilters}
                    onApply={() => setShowFilters(false)}
                    initialValues={selectedCategories}
                  />
                )}

                <Box
                  mt={2}
                  bg="bg.surface"
                  p={2}
                  borderRadius="md"
                  boxShadow="md"
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => setShowFilters(false)}
                  _hover={{ bg: 'bg.subtle' }}
                >
                  <Text fontSize="sm" color="text.secondary">
                    Hide Filters
                  </Text>
                </Box>
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
