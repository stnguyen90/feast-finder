import {
  Box,
  Button,
  Checkbox,
  HStack,
  Heading,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

interface CategoryFilterProps {
  onFilterChange: (selectedCategories: Array<string>) => void
  onClearFilters: () => void
  onApply?: () => void
  initialValues?: Array<string>
}

export function CategoryFilter({
  onFilterChange,
  onClearFilters,
  onApply,
  initialValues = [],
}: CategoryFilterProps) {
  // Fetch all available categories from the database
  const { data: availableCategories } = useSuspenseQuery(
    convexQuery(api.restaurants.listCategories, {}),
  )

  const [selectedCategories, setSelectedCategories] =
    useState<Array<string>>(initialValues)

  // Update local state when initialValues change
  useEffect(() => {
    setSelectedCategories(initialValues)
  }, [initialValues])

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const handleApplyFilters = () => {
    onFilterChange(selectedCategories)

    // Hide the filter panel after applying
    if (onApply) {
      onApply()
    }
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    onClearFilters()
  }

  return (
    <Box
      bg="bg.surface"
      p={4}
      borderRadius="md"
      boxShadow="md"
      w="100%"
      maxW="400px"
    >
      <Heading size="md" mb={4} color="text.primary">
        Categories
      </Heading>

      <VStack gap={4} align="stretch">
        {/* Category Checkboxes */}
        <Box maxH="300px" overflowY="auto">
          <VStack gap={2} align="stretch">
            {availableCategories.map((category) => (
              <Checkbox.Root
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleToggleCategory(category)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>{category}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </VStack>
        </Box>

        <HStack gap={2} pt={2}>
          <Button
            colorScheme="blue"
            size="sm"
            flex={1}
            onClick={handleApplyFilters}
          >
            Apply Filters
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
  )
}
