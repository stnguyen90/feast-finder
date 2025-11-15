import {
  Badge,
  Box,
  Button,
  Combobox,
  HStack,
  Heading,
  Portal,
  Wrap,
  createListCollection,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

interface CategoryFilterProps {
  onFilterChange: (selectedCategories: Array<string>) => void
  onClearFilters: () => void
  onApply?: () => void
  initialValues?: Array<string>
  hideButtons?: boolean
  disabled?: boolean
}

export function CategoryFilter({
  onFilterChange,
  onClearFilters,
  onApply,
  initialValues = [],
  hideButtons = false,
  disabled = false,
}: CategoryFilterProps) {
  // Fetch all available categories from the database (use regular useQuery to prevent flicker)
  const { data: availableCategories = [] } = useQuery(
    convexQuery(api.restaurants.listCategories, {}),
  )

  const [selectedCategories, setSelectedCategories] =
    useState<Array<string>>(initialValues)
  const [searchValue, setSearchValue] = useState('')

  // Update local state when initialValues change
  useEffect(() => {
    setSelectedCategories(initialValues)
  }, [initialValues])

  // Filter categories based on search value
  const filteredCategories = useMemo(
    () =>
      availableCategories.filter((cat: string) =>
        cat.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [availableCategories, searchValue],
  )

  // Create collection for combobox
  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredCategories.map((cat: string) => ({ label: cat, value: cat })),
      }),
    [filteredCategories],
  )

  const handleValueChange = (details: { value: Array<string> }) => {
    setSelectedCategories(details.value)
    // Immediately update the parent component with new selection
    onFilterChange(details.value)
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    const newCategories = selectedCategories.filter(
      (cat) => cat !== categoryToRemove,
    )
    setSelectedCategories(newCategories)
    // Immediately update the parent component
    onFilterChange(newCategories)
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
        closeOnSelect
        value={selectedCategories}
        onValueChange={handleValueChange}
        onInputValueChange={(e) => setSearchValue(e.inputValue)}
        disabled={disabled}
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder="Select categories..."
            color="text.primary"
            disabled={disabled}
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
              {collection.items.map((item: { label: string; value: string }) => (
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

      {/* Show selected categories as badges */}
      {selectedCategories.length > 0 && (
        <Wrap gap={2} mt={2}>
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              bg="badge.category.bg"
              color="badge.category.text"
              borderRadius="full"
              px={2}
              py={1}
              cursor="pointer"
              onClick={() => handleRemoveCategory(category)}
              _hover={{ opacity: 0.8 }}
              display="flex"
              alignItems="center"
              gap={1}
            >
              {category}
              <Box as="span" fontSize="sm" fontWeight="bold">
                ×
              </Box>
            </Badge>
          ))}
        </Wrap>
      )}

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
