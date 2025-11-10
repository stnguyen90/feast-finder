import {
  Box,
  Button,
  Combobox,
  HStack,
  Heading,
  createListCollection,
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

  // Create collection for combobox
  const collection = createListCollection({
    items: availableCategories.map((cat) => ({ label: cat, value: cat })),
  })

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
    <Box w="100%" maxW="400px">
      <Heading size="sm" mb={2} color="text.primary">
        Categories
      </Heading>

      <Combobox.Root
        collection={collection}
        multiple
        value={selectedCategories}
        onValueChange={(e) => setSelectedCategories(e.value)}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Select categories..."
            color="text.primary"
          />
          <Combobox.Trigger>
            <Combobox.IndicatorGroup>▼</Combobox.IndicatorGroup>
          </Combobox.Trigger>
        </Combobox.Control>
        <Combobox.Positioner>
          <Combobox.Content>
            {availableCategories.map((category) => (
              <Combobox.Item key={category} item={{ label: category, value: category }}>
                <Combobox.ItemText>{category}</Combobox.ItemText>
                <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Root>

      <HStack gap={2} pt={3}>
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
    </Box>
  )
}
