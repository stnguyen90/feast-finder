# UI Changes for Autumn Integration

## Filter Panel with Premium Badge

### Location
`/restaurants` page - Filter panel (accessed via 🔍 button in top-left)

### Changes

#### When User Does NOT Have Premium Access

The filter panel behavior:

1. **No Filters Active** (Free user can start filtering)
   - Premium badge shows: "Use multiple filters with premium"
   - All filter inputs are enabled
   - User can select ONE price value OR ONE category
   - Filters remain enabled until user adds a second filter

2. **One Filter Active** (Free user using their allowed filter)
   - Premium badge shows: "Use multiple filters with premium"  
   - All filter inputs remain enabled
   - User can continue using their single filter
   - If user adds a second filter, filters become disabled

3. **Multiple Filters Active** (Free user exceeded limit)
   - Premium badge shows: "Multiple filters require premium"
   - All filter inputs become disabled (greyed out)
   - User must clear filters or upgrade to premium
   - Visual indication that premium is required

4. **Apply and Clear Buttons**
   - Always visible and functional
   - User can clear filters to re-enable inputs
   - Maintains consistent layout

#### When User HAS Premium Access

- No premium badge shown
- All filter inputs are enabled
- Full functionality as before
- Price ranges can be set
- Categories can be selected
- Multiple filters work together

### Visual Design

**Colors (Dark Mode Compatible):**
- Premium badge: Yellow with ⭐ icon
- Background: Adaptive (brand.subtle)
- Text: Secondary text color
- Upgrade link: Brand color (blue)

**Layout:**
- Premium badge appears at top of filter panel
- Horizontal flex layout with space-between
- Badge and text on left, link on right
- 12px padding all around
- Rounded md border radius

### User Experience Flow

**For Free Users:**

1. User clicks 🔍 filter button
2. Panel opens showing premium badge: "Use multiple filters with premium"
3. User sees enabled price and category filters
4. User selects one price range (e.g., "Brunch $20-$30")
5. Filters remain enabled - user has used their 1 free filter
6. User tries to add a category filter
7. Once second filter is added, inputs become disabled
8. Badge changes to: "Multiple filters require premium"
9. User must clear filters or upgrade to continue
10. User clicks "Upgrade" link (future: goes to pricing)

**For Premium Users:**

1. User clicks 🔍 filter button
2. Panel opens with no premium badge
3. User can select unlimited filters
4. Multiple price ranges + multiple categories work together
5. No restrictions on filter usage

### Technical Implementation

**Component**: `src/routes/restaurants.tsx`

**Premium Check:**
```typescript
const { check } = useCustomer()
const hasAdvancedFilters = useMemo(() => {
  const result = check({ featureId: PREMIUM_FEATURES.ADVANCED_FILTERS })
  return result.data.allowed
}, [check, customer])

// Count active filters
const isUsingMultipleFilters = useMemo(() => {
  const priceFilterCount = Object.values(priceFilters).filter(
    (v) => v !== undefined,
  ).length
  const categoryCount = selectedCategories.length
  return priceFilterCount + categoryCount > 1
}, [priceFilters, selectedCategories])

// Disable if free user has 2+ filters
const shouldDisableFilters = !hasAdvancedFilters && isUsingMultipleFilters

```

**Badge Render:**
```typescript
{!hasAdvancedFilters && (
  <Flex align="center" justify="space-between" bg="brand.subtle" p={3} borderRadius="md">
    <HStack gap={2}>
      <Badge colorPalette="yellow" size="sm">⭐ Premium</Badge>
      <Text fontSize="sm" color="text.secondary">
        {isUsingMultipleFilters
          ? 'Multiple filters require premium'
          : 'Use multiple filters with premium'}
      </Text>
    </HStack>
    <Link href="#" fontSize="sm" color="brand.solid" fontWeight="medium">
      Upgrade
    </Link>
  </Flex>
)}
```

**Disabled Props:**
```typescript
<PriceFilter disabled={shouldDisableFilters} ... />
<CategoryFilter disabled={shouldDisableFilters} ... />
```

## Benefits

### For Users
- Can try filtering for free (1 filter allowed)
- Clear visual indication when limit is reached
- No confusion about why filters become disabled
- Easy path to upgrade with visible link
- Non-intrusive premium prompt
- Gradual introduction to premium value

### For Business
- Higher conversion (users experience filtering first)
- Clear value proposition (users see what they're missing)
- Professional implementation
- Matches modern SaaS freemium patterns
- Reduces friction for new users

## Accessibility

- Color contrast meets WCAG AA standards
- Disabled state is clearly indicated
- Text is readable in light and dark modes
- Badge has emoji icon for visual emphasis

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

Uses standard Chakra UI components with built-in cross-browser support.
