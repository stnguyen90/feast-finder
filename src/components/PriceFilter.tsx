import { Box, Button, HStack, Heading, Input, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export interface PriceFilterState {
  minBrunchPrice?: number
  maxBrunchPrice?: number
  minLunchPrice?: number
  maxLunchPrice?: number
  minDinnerPrice?: number
  maxDinnerPrice?: number
}

interface PriceFilterProps {
  onFilterChange: (filters: PriceFilterState) => void
  onClearFilters: () => void
  onApply?: () => void
  initialValues?: PriceFilterState
  hideButtons?: boolean
  disabled?: boolean
}

export function PriceFilter({
  onFilterChange,
  onClearFilters,
  onApply,
  initialValues,
  hideButtons = false,
  disabled = false,
}: PriceFilterProps) {
  const [minBrunchPrice, setMinBrunchPrice] = useState<string>(
    initialValues?.minBrunchPrice?.toString() ?? '',
  )
  const [maxBrunchPrice, setMaxBrunchPrice] = useState<string>(
    initialValues?.maxBrunchPrice?.toString() ?? '',
  )
  const [minLunchPrice, setMinLunchPrice] = useState<string>(
    initialValues?.minLunchPrice?.toString() ?? '',
  )
  const [maxLunchPrice, setMaxLunchPrice] = useState<string>(
    initialValues?.maxLunchPrice?.toString() ?? '',
  )
  const [minDinnerPrice, setMinDinnerPrice] = useState<string>(
    initialValues?.minDinnerPrice?.toString() ?? '',
  )
  const [maxDinnerPrice, setMaxDinnerPrice] = useState<string>(
    initialValues?.maxDinnerPrice?.toString() ?? '',
  )

  // Update local state when initialValues change
  useEffect(() => {
    if (initialValues) {
      setMinBrunchPrice(initialValues.minBrunchPrice?.toString() ?? '')
      setMaxBrunchPrice(initialValues.maxBrunchPrice?.toString() ?? '')
      setMinLunchPrice(initialValues.minLunchPrice?.toString() ?? '')
      setMaxLunchPrice(initialValues.maxLunchPrice?.toString() ?? '')
      setMinDinnerPrice(initialValues.minDinnerPrice?.toString() ?? '')
      setMaxDinnerPrice(initialValues.maxDinnerPrice?.toString() ?? '')
    }
  }, [initialValues])

  // Notify parent component whenever price values change
  useEffect(() => {
    const filters: PriceFilterState = {}

    if (minBrunchPrice) filters.minBrunchPrice = parseFloat(minBrunchPrice)
    if (maxBrunchPrice) filters.maxBrunchPrice = parseFloat(maxBrunchPrice)
    if (minLunchPrice) filters.minLunchPrice = parseFloat(minLunchPrice)
    if (maxLunchPrice) filters.maxLunchPrice = parseFloat(maxLunchPrice)
    if (minDinnerPrice) filters.minDinnerPrice = parseFloat(minDinnerPrice)
    if (maxDinnerPrice) filters.maxDinnerPrice = parseFloat(maxDinnerPrice)

    onFilterChange(filters)
  }, [
    minBrunchPrice,
    maxBrunchPrice,
    minLunchPrice,
    maxLunchPrice,
    minDinnerPrice,
    maxDinnerPrice,
    onFilterChange,
  ])

  const handleApplyFilters = () => {
    const filters: PriceFilterState = {}

    if (minBrunchPrice) filters.minBrunchPrice = parseFloat(minBrunchPrice)
    if (maxBrunchPrice) filters.maxBrunchPrice = parseFloat(maxBrunchPrice)
    if (minLunchPrice) filters.minLunchPrice = parseFloat(minLunchPrice)
    if (maxLunchPrice) filters.maxLunchPrice = parseFloat(maxLunchPrice)
    if (minDinnerPrice) filters.minDinnerPrice = parseFloat(minDinnerPrice)
    if (maxDinnerPrice) filters.maxDinnerPrice = parseFloat(maxDinnerPrice)

    onFilterChange(filters)

    // Hide the filter panel after applying
    if (onApply) {
      onApply()
    }
  }

  const handleClearFilters = () => {
    setMinBrunchPrice('')
    setMaxBrunchPrice('')
    setMinLunchPrice('')
    setMaxLunchPrice('')
    setMinDinnerPrice('')
    setMaxDinnerPrice('')
    onClearFilters()
  }

  return (
    <Box w="100%" maxW="400px">
      <Heading size="md" mb={2} color="text.primary">
        Price
      </Heading>

      <VStack gap={3} align="stretch">
        {/* Brunch Price Filter */}
        <Box>
          <Heading size="sm" mb={2} color="text.secondary">
            Brunch ($)
          </Heading>
          <HStack>
            <Input
              placeholder="Min"
              type="number"
              min="0"
              value={minBrunchPrice}
              onChange={(e) => setMinBrunchPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
            <Box color="text.secondary">-</Box>
            <Input
              placeholder="Max"
              type="number"
              min="0"
              value={maxBrunchPrice}
              onChange={(e) => setMaxBrunchPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
          </HStack>
        </Box>

        {/* Lunch Price Filter */}
        <Box>
          <Heading size="sm" mb={2} color="text.secondary">
            Lunch ($)
          </Heading>
          <HStack>
            <Input
              placeholder="Min"
              type="number"
              min="0"
              value={minLunchPrice}
              onChange={(e) => setMinLunchPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
            <Box color="text.secondary">-</Box>
            <Input
              placeholder="Max"
              type="number"
              min="0"
              value={maxLunchPrice}
              onChange={(e) => setMaxLunchPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
          </HStack>
        </Box>

        {/* Dinner Price Filter */}
        <Box>
          <Heading size="sm" mb={2} color="text.secondary">
            Dinner ($)
          </Heading>
          <HStack>
            <Input
              placeholder="Min"
              type="number"
              min="0"
              value={minDinnerPrice}
              onChange={(e) => setMinDinnerPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
            <Box color="text.secondary">-</Box>
            <Input
              placeholder="Max"
              type="number"
              min="0"
              value={maxDinnerPrice}
              onChange={(e) => setMaxDinnerPrice(e.target.value)}
              size="sm"
              color="text.primary"
              disabled={disabled}
            />
          </HStack>
        </Box>

        {!hideButtons && (
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
        )}
      </VStack>
    </Box>
  )
}
