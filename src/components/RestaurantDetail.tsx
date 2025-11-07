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

  const mealTimes = []
  if (restaurant.hasBrunch) {
    mealTimes.push(
      `Brunch${restaurant.brunchPrice ? ` ($${restaurant.brunchPrice})` : ''}`,
    )
  }
  if (restaurant.hasLunch) {
    mealTimes.push(
      `Lunch${restaurant.lunchPrice ? ` ($${restaurant.lunchPrice})` : ''}`,
    )
  }
  if (restaurant.hasDinner) {
    mealTimes.push(
      `Dinner${restaurant.dinnerPrice ? ` ($${restaurant.dinnerPrice})` : ''}`,
    )
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
      <DialogContent maxW="2xl" maxH="90vh" overflowY="auto">
        <DialogHeader>
          <Heading size="2xl">{restaurant.name}</Heading>
        </DialogHeader>
        <DialogCloseTrigger />
        <DialogBody pb={6}>
          <VStack gap={4} align="stretch">
            <Flex align="center" gap={2}>
              <span style={{ fontSize: '1.25rem' }}>⭐</span>
              <Box fontSize="xl" fontWeight="semibold">
                {restaurant.rating}
              </Box>
            </Flex>

            <Box>
              <Heading size="sm" mb={1} color="gray.600">
                Address
              </Heading>
              <Box>{restaurant.address}</Box>
            </Box>

            <Box>
              <Heading size="sm" mb={1} color="gray.600">
                Categories
              </Heading>
              <HStack wrap="wrap" gap={2}>
                {restaurant.categories.map((category) => (
                  <Badge
                    key={category}
                    bg="#fecaca"
                    color="#7f1d1d"
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

            <Box>
              <Heading size="sm" mb={1} color="gray.600">
                Meal Times
              </Heading>
              <HStack wrap="wrap" gap={2}>
                {mealTimes.map((meal) => (
                  <Badge
                    key={meal}
                    bg="#fee2e2"
                    color="#991b1b"
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

            {(restaurant.websiteUrl ||
              restaurant.yelpUrl ||
              restaurant.openTableUrl) && (
              <Box>
                <Heading size="sm" mb={2} color="gray.600">
                  Links
                </Heading>
                <VStack align="stretch" gap={2}>
                  {restaurant.websiteUrl && (
                    <Link
                      href={restaurant.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="#a20000"
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
                      color="#a20000"
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
                      color="#a20000"
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
