import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Center, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { api } from '../../convex/_generated/api'
import type { PriceFilterState } from '~/components/PriceFilter'
import type { Restaurant } from '~/components/RestaurantMap'
import { ColorModeToggle } from '~/components/ColorModeToggle'
import { PriceFilter } from '~/components/PriceFilter'
import { RestaurantDetail } from '~/components/RestaurantDetail'
import { RestaurantMap } from '~/components/RestaurantMap'

export const Route = createFileRoute('/')({
  component: Home,
})

// Type for map bounds
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

function Home() {
  // Track map bounds for geospatial queries
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Track price filter state
  const [priceFilters, setPriceFilters] = useState<PriceFilterState>({})
  const [showFilters, setShowFilters] = useState(false)

  // Always fetch all restaurants for now (used for seeding check and fallback)
  const { data: allRestaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.listRestaurants, {}),
  )
  
  // Fetch filtered restaurants when price filters are applied
  const { data: filteredRestaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.listRestaurantsWithPriceFilter, priceFilters),
  )

  // Fetch geospatial results when bounds are available
  // Use regular useQuery with placeholderData to prevent flickering
  const geoQueryArgs = mapBounds ?? { north: 0, south: 0, east: 0, west: 0 }
  const { data: geoRestaurantsResult } = useQuery({
    ...convexQuery(api.restaurantsGeo.queryRestaurantsInBounds, {
      bounds: geoQueryArgs,
    }),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  })

  // Determine which restaurants to display based on filters and bounds
  const restaurants = useMemo(() => {
    // Start with price-filtered restaurants if any filters are active
    const hasPriceFilters = Object.keys(priceFilters).length > 0
    const baseRestaurants = hasPriceFilters ? filteredRestaurants : allRestaurants
    
    // Apply geospatial filtering on top of price filtering
    if (mapBounds !== null && geoRestaurantsResult) {
      const geoIds = new Set(geoRestaurantsResult.results.map((r) => r._id))
      return baseRestaurants.filter((r) => geoIds.has(r._id))
    }
    
    return baseRestaurants
  }, [mapBounds, geoRestaurantsResult, allRestaurants, filteredRestaurants, priceFilters])

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null)

  const seedRestaurants = useMutation(api.seedData.seedRestaurants)
  const syncAllToIndex = useMutation(api.restaurantsGeo.syncAllRestaurantsToIndex)
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
            console.log(`Synced ${result.synced} restaurants to geospatial index`)
            localStorage.setItem('geospatial-synced', 'true')
          })
          .catch((error) => {
            console.error('Error syncing to geospatial index:', error)
          })
      }
    }
  }, [allRestaurants.length, syncAllToIndex, isSeeding])

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    // Debounce bounds updates to prevent flickering during pan
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setMapBounds(bounds)
    }, 300) // 300ms debounce
  }, [])
  
  const handleFilterChange = useCallback((filters: PriceFilterState) => {
    setPriceFilters(filters)
  }, [])
  
  const handleClearFilters = useCallback(() => {
    setPriceFilters({})
  }, [])

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
          <Heading size="2xl" color="brand.contrast">
            🍽️ Feast Finder
          </Heading>
          <Text color="text.inverted" fontSize="sm" mt={1}>
            Discover amazing restaurants on an interactive map
          </Text>
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
          />
          
          {/* Price Filter Panel */}
          <Box 
            position="absolute" 
            top={4} 
            left={4} 
            zIndex={1000}
          >
            {!showFilters ? (
              <Box
                bg="bg.surface"
                p={3}
                borderRadius="md"
                boxShadow="md"
                cursor="pointer"
                onClick={() => setShowFilters(true)}
                _hover={{ bg: 'bg.subtle' }}
              >
                <Text fontWeight="semibold" color="text.primary">
                  💲 Filter by Price
                </Text>
              </Box>
            ) : (
              <Box>
                <PriceFilter 
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
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
