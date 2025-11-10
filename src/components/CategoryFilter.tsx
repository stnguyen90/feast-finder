import {
  Box,
  Button,
  Combobox,
  HStack,
  Heading,
  Portal,
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
  hideButtons?: boolean
}

export function CategoryFilter({
  onFilterChange,
  onClearFilters,
  onApply,
  initialValues = [],
  hideButtons = false,
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

  // Create collection for combobox with filtering
  const [collection, setCollection] = useState(
    createListCollection({
      items: availableCategories.map((cat) => ({ label: cat, value: cat })),
    }),
  )

  // Filter function for contains search
  const handleInputChange = (value: string) => {
    const filtered = availableCategories.filter((cat) =>
      cat.toLowerCase().includes(value.toLowerCase()),
    )
    setCollection(
      createListCollection({
        items: filtered.map((cat) => ({ label: cat, value: cat })),
      }),
    )
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
    <Box w="100%" maxW="400px">
      <Heading size="md" mb={2} color="text.primary">
        Categories
      </Heading>

      <Combobox.Root
        collection={collection}
        multiple
        value={selectedCategories}
        onValueChange={(e) => setSelectedCategories(e.value)}
        onInputValueChange={(e) => handleInputChange(e.inputValue)}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Select categories..."
            color="text.primary"
          />
          <Combobox.IndicatorGroup>
            <Combobox.ClearTrigger />
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.Empty>No items found</Combobox.Empty>
              {collection.items.map((item) => (
                <Combobox.Item key={item.value} item={item}>
                  <Combobox.ItemText color="text.primary">
                    {item.label}
                  </Combobox.ItemText>
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>

      {!hideButtons && (
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
      )}
    </Box>
  )
}
