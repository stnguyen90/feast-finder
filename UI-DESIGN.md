# Feast Finder - UI Overview

## Visual Design Description

### Landing Page Layout (`/`)

The landing page is designed to introduce Feast Finder and showcase restaurant week events.

```
┌─────────────────────────────────────────────────────────────┐
│                     🍽️ Feast Finder                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
│                                                               │
│              Discover Your Next Culinary Adventure            │
│                                                               │
│    Feast Finder helps you explore restaurant week events     │
│    and discover amazing dining experiences in the SF Bay     │
│    Area. Find exclusive prix-fixe menus, special tastings,   │
│    and culinary events near you.                             │
│                                                               │
│         [Explore Restaurants on Map] (Blue button)           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                  Why Choose Feast Finder?                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │     🗺️       │  │     🎉       │  │     💲       │       │
│  │ Interactive  │  │ Restaurant   │  │ Filter by    │       │
│  │     Map      │  │ Week Events  │  │    Price     │       │
│  │              │  │              │  │              │       │
│  │ Explore on   │  │ Never miss   │  │ Find within  │       │
│  │ intuitive    │  │ special      │  │ your budget  │       │
│  │ interface    │  │ dining       │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│            Upcoming Restaurant Week Events                    │
│     Join special dining events featuring exclusive menus     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ SF Restaurant Week            [Active Now]            │   │
│  │ 📍 Various Locations in San Francisco                │   │
│  │                                                         │   │
│  │ Multi-course prix-fixe menus at special prices...     │   │
│  │                                                         │   │
│  │ 📅 Jan 15 - Jan 31, 2025    🍽️ 5 restaurants         │   │
│  │                                                         │   │
│  │         [View Participating Restaurants]                │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  [Additional event cards...]                                  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  © 2025 Feast Finder. Discover amazing restaurants in SF.   │
└─────────────────────────────────────────────────────────────┘
```

**Landing Page Features:**

- **Header**: Simple header with Feast Finder logo and dark mode toggle
- **Hero Section**: Large heading, descriptive text, prominent CTA button
- **Features Grid**: 3-column responsive grid (stacks on mobile)
- **Events Section**: Vertical stack of event cards
- **Event Cards**:
  - Event name with optional "Active Now" badge (green)
  - Location with emoji
  - Description text
  - Date range and restaurant count
  - Blue CTA button to view restaurants
  - Hover effect: elevated shadow and slight upward translation
- **Footer**: Copyright text with subtle background
- **Responsive**: Container max-width 1280px, stacks vertically on mobile

### Restaurants Page Layout (`/restaurants`)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    🍽️ Feast Finder                          │
│         Discover amazing restaurants on an interactive map   │
│                                                               │
│   Click on any marker to view restaurant details • Found 10  │
│                      restaurants                              │
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐│
│ │                                                             ││
│ │                    [Interactive Map]                        ││
│ │                                                             ││
│ │          📍 📍 📍                                           ││
│ │        📍       📍   📍                                     ││
│ │              📍                                             ││
│ │          📍     📍     📍                                   ││
│ │                                                             ││
│ │                San Francisco Bay Area                       ││
│ │                                                             ││
│ │  [Zoom Controls]                                            ││
│ │                                                             ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Map Features

- **Center**: San Francisco (37.7749, -122.4194)
- **Zoom Level**: 12 (city view)
- **Dimensions**: 600px height, full width
- **Style**: Rounded corners with shadow
- **Tiles**: OpenStreetMap (OSM)
- **Markers**: 10 red pins at restaurant locations
- **Interactive**: Pan, zoom, click markers

### Map Marker Popup (Quick Preview)

When hovering/clicking a marker:

```
┌────────────────────────┐
│ Zuni Café              │
│ ⭐ 4.5                 │
│ 1658 Market St, San... │
└────────────────────────┘
```

### Restaurant Detail Modal

When clicking on a marker again:

```
┌───────────────────────────────────────────────────────────┐
│ Background: Semi-transparent black overlay (50% opacity)  │
│                                                             │
│   ┌───────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │  Zuni Café                                    ×    │   │
│   │  ━━━━━━━━━━                                        │   │
│   │                                                     │   │
│   │  ⭐ 4.5                                            │   │
│   │                                                     │   │
│   │  Address                                            │   │
│   │  1658 Market St, San Francisco, CA 94102           │   │
│   │                                                     │   │
│   │  Categories                                         │   │
│   │  [American] [Mediterranean] [Italian]              │   │
│   │  (Blue tags with rounded corners)                  │   │
│   │                                                     │   │
│   │  Meal Times & Prices                                │   │
│   │  [Brunch ($45)] [Lunch ($35)] [Dinner ($55)]      │   │
│   │  (Green tags with rounded corners)                 │   │
│   │                                                     │   │
│   │  Links                                              │   │
│   │  🌐 Website                                        │   │
│   │  🔍 Yelp                                           │   │
│   │  🍽️ OpenTable                                     │   │
│   │  (Blue underlined links)                           │   │
│   │                                                     │   │
│   └───────────────────────────────────────────────────┘   │
│                                                             │
└───────────────────────────────────────────────────────────┘
```

## Color Palette

### Light Mode

- **Background**: Gray-50 (#F9FAFB)
- **Text Primary**: Gray-900 (#111827)
- **Text Secondary**: Gray-600 (#4B5563)
- **Category Tags**:
  - Background: Blue-100 (#DBEAFE)
  - Text: Blue-800 (#1E40AF)
- **Meal Time Tags**:
  - Background: Green-100 (#D1FAE5)
  - Text: Green-800 (#166534)
- **Links**: Blue-600 (#2563EB)
- **Rating Star**: Yellow-600 (#CA8A04)

### Dark Mode

- **Background**: Gray-950 (#030712)
- **Text Primary**: Gray-100 (#F3F4F6)
- **Text Secondary**: Gray-400 (#9CA3AF)
- **Category Tags**:
  - Background: Blue-900 (#1E3A8A)
  - Text: Blue-100 (#DBEAFE)
- **Meal Time Tags**:
  - Background: Green-900 (#14532D)
  - Text: Green-100 (#D1FAE5)
- **Links**: Blue-400 (#60A5FA)
- **Rating Star**: Yellow-500 (#EAB308)

## Typography

- **Title (Feast Finder)**: 5xl (3rem), Bold
- **Subtitle**: Large (1.125rem), Regular
- **Modal Restaurant Name**: 3xl (1.875rem), Bold
- **Rating**: XL (1.25rem), Semibold
- **Section Headers**: Small (0.875rem), Semibold
- **Body Text**: Base (1rem), Regular
- **Tags**: Small (0.875rem), Regular

## Spacing & Layout

- **Container**: Max-width with auto margins, 6 padding units (1.5rem)
- **Title Section**: 8 units margin bottom (2rem)
- **Map**: 6 units margin bottom (1.5rem)
- **Modal**: Centered with 4 units padding (1rem)
- **Modal Content**: 6 units padding (1.5rem)
- **Section Spacing**: 4 units gap (1rem)

## Interactive Elements

### Buttons

- **Modal Close (×)**:
  - Size: 2xl
  - Color: Gray-500 (hover: Gray-700)
  - Hover effect: Color change

### Map Interactions

- **Click Marker**: Opens detail modal
- **Hover Marker**: Shows popup preview
- **Pan**: Drag to move map
- **Zoom**: Scroll or use +/- controls

### Links

- **External Links**:
  - Color: Blue-600 (light) / Blue-400 (dark)
  - Underline on hover
  - Opens in new tab (rel="noopener noreferrer")

## Responsive Behavior

- **Mobile**: Full width, stacked layout
- **Tablet**: Optimized spacing
- **Desktop**: Max-width container (1280px)
- **Modal**: Max-width 2xl (672px), scrollable if needed

## Accessibility

- **Close Button**: aria-label="Close"
- **Links**: target="\_blank" with rel="noopener noreferrer"
- **Map**: Keyboard navigable via Leaflet defaults
- **Color Contrast**: WCAG AA compliant in both light and dark modes
- **Focus States**: Visible focus indicators
- **Readable Text**: All text must be legible in BOTH light and dark modes
  - Use semantic color tokens (e.g., `text-gray-900 dark:text-gray-100`)
  - Test color contrast ratios in both modes
  - Avoid hardcoded colors that only work in one theme

## Animation & Transitions

- **Modal**: Fade in/out (via React state)
- **Hover Effects**: Smooth color transitions
- **Map**: Smooth pan and zoom
- **Tag Hover**: Subtle transform/shadow (if added)

## Loading States

1. **Initial Load**: "Loading restaurants..."
2. **Empty State**: "No restaurants found. Please wait while we load some sample data..."
3. **Loaded**: Shows map with all restaurants

## Example Restaurant Entries

### 1. The French Laundry

- **Location**: Yountville (north of SF)
- **Rating**: 4.8
- **Categories**: French, Fine Dining, Contemporary
- **Meals**: Lunch ($350), Dinner ($350)

### 2. Tartine Bakery

- **Location**: Mission District, SF
- **Rating**: 4.4
- **Categories**: Bakery, Café, Breakfast
- **Meals**: Brunch ($20), Lunch ($25)

### 3. La Taqueria

- **Location**: Mission District, SF
- **Rating**: 4.3
- **Categories**: Mexican, Tacos, Burritos
- **Meals**: Lunch ($15), Dinner ($15)
- **Links**: Yelp only (no website or OpenTable)

## Map Distribution

Restaurants are distributed across:

- **Yountville** (wine country): The French Laundry
- **North Beach**: Gary Danko, Mama's on Washington Square
- **Fisherman's Wharf**: Swan Oyster Depot
- **Polk Gulch**: Swan Oyster Depot
- **Western Addition**: Nopa
- **Fillmore**: State Bird Provisions
- **Hayes Valley**: Zuni Café
- **Mission District**: Tartine, La Taqueria, Flour + Water

This creates a realistic spread across San Francisco's diverse neighborhoods!
