# UI Changes for Autumn Integration

## Filter Panel with Premium Badge

### Location
`/restaurants` page - Filter panel (accessed via 🔍 button in top-left)

### Changes

#### When User Does NOT Have Premium Access

The filter panel displays:

1. **Premium Badge Section** (NEW)
   - Yellow "⭐ Premium" badge
   - Text: "Advanced filters"
   - Blue "Upgrade" link on the right
   - Light background (brand.subtle color)
   - Rounded corners with padding

2. **Disabled Price Filter**
   - All input fields are greyed out
   - User cannot type in min/max prices
   - Visual indication that feature requires premium

3. **Disabled Category Filter**
   - Combobox dropdown is disabled
   - User cannot select categories
   - Consistent disabled styling

4. **Apply and Clear Buttons**
   - Still visible but filters remain empty
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

1. User clicks 🔍 filter button
2. Panel opens showing premium badge
3. User sees disabled price and category filters
4. User understands premium is required
5. User clicks "Upgrade" link (future: goes to pricing)
6. After subscribing, filters become enabled

### Technical Implementation

**Component**: `src/routes/restaurants.tsx`

**Premium Check:**
```typescript
const { check } = useCustomer()
const hasAdvancedFilters = useMemo(() => {
  const result = check({ featureId: PREMIUM_FEATURES.ADVANCED_FILTERS })
  return result.data.allowed
}, [check, customer])
```

**Badge Render:**
```typescript
{!hasAdvancedFilters && (
  <Flex align="center" justify="space-between" bg="brand.subtle" p={3} borderRadius="md">
    <HStack gap={2}>
      <Badge colorPalette="yellow" size="sm">⭐ Premium</Badge>
      <Text fontSize="sm" color="text.secondary">Advanced filters</Text>
    </HStack>
    <Link href="#" fontSize="sm" color="brand.solid" fontWeight="medium">
      Upgrade
    </Link>
  </Flex>
)}
```

**Disabled Props:**
```typescript
<PriceFilter disabled={!hasAdvancedFilters} ... />
<CategoryFilter disabled={!hasAdvancedFilters} ... />
```

## Benefits

### For Users
- Clear visual indication of premium features
- No confusion about why filters don't work
- Easy path to upgrade with visible link
- Non-intrusive premium prompt

### For Business
- Drives premium conversions
- Clear value proposition
- Professional implementation
- Matches modern SaaS patterns

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
