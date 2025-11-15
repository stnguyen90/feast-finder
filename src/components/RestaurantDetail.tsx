import {
  Badge,
  Box,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  Flex,
  HStack,
  Heading,
  Link,
  VStack,
} from '@chakra-ui/react'
import type { Restaurant } from './RestaurantMap'

interface RestaurantDetailProps {
  restaurant: Restaurant | null
  onClose: () => void
}

export function RestaurantDetail({
  restaurant,
  onClose,
}: RestaurantDetailProps) {
  if (!restaurant) return null

  // Determine meal times from prices (meal availability is determined by presence of price)
  const mealTimes = []
  if (restaurant.brunchPrice !== undefined) {
    mealTimes.push(`Brunch ($${restaurant.brunchPrice})`)
  }
  if (restaurant.lunchPrice !== undefined) {
    mealTimes.push(`Lunch ($${restaurant.lunchPrice})`)
  }
  if (restaurant.dinnerPrice !== undefined) {
    mealTimes.push(`Dinner ($${restaurant.dinnerPrice})`)
  }

  return (
    <DialogRoot
      open={true}
      onOpenChange={(e) => {
        if (!e.open) onClose()
      }}
    >
      <DialogBackdrop
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <DialogContent maxW="2xl" maxH="90vh" overflowY="auto" bg="bg.surface">
        <DialogHeader>
          <Heading size="2xl" color="text.primary">
            {restaurant.name}
          </Heading>
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody pb={6}>
          <VStack gap={4} align="stretch">
            <Flex align="center" gap={2}>
              <span style={{ fontSize: '1.25rem' }}>⭐</span>
              <Box fontSize="xl" fontWeight="semibold" color="text.primary">
                {restaurant.rating ?? 'N/A'}
              </Box>
            </Flex>

            {restaurant.address && (
              <Box>
                <Heading size="sm" mb={1} color="text.secondary">
                  Address
                </Heading>
                <Box color="text.primary">{restaurant.address}</Box>
              </Box>
            )}

            {restaurant.categories && restaurant.categories.length > 0 && (
              <Box>
                <Heading size="sm" mb={1} color="text.secondary">
                  Categories
                </Heading>
                <HStack wrap="wrap" gap={2}>
                  {restaurant.categories.map((category) => (
                    <Badge
                      key={category}
                      bg="badge.category.bg"
                      color="badge.category.text"
                      size="md"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {category}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {mealTimes.length > 0 && (
              <Box>
                <Heading size="sm" mb={1} color="text.secondary">
                  Meal Times
                </Heading>
                <HStack wrap="wrap" gap={2}>
                  {mealTimes.map((meal) => (
                    <Badge
                      key={meal}
                      bg="badge.meal.bg"
                      color="badge.meal.text"
                      size="md"
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {meal}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {(restaurant.websiteUrl ||
              restaurant.yelpUrl ||
              restaurant.openTableUrl) && (
              <Box>
                <Heading size="sm" mb={2} color="text.secondary">
                  Links
                </Heading>
                <VStack align="stretch" gap={2}>
                  {restaurant.websiteUrl && (
                    <Link
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="link.primary"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      🌐 Website
                    </Link>
                  )}
                  {restaurant.yelpUrl && (
                    <Link
                      href={restaurant.yelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="link.primary"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      🔍 Yelp
                    </Link>
                  )}
                  {restaurant.openTableUrl && (
                    <Link
                      href={restaurant.openTableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="link.primary"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      🍽️ OpenTable
                    </Link>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
