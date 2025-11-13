# Authentication UI Changes

This document describes the visual changes made to implement authentication across the Feast Finder application.

## Header Changes (All Pages)

### Before Authentication Implementation

- Header contained only the Feast Finder logo/title (centered) and Color Mode Toggle button (top right)

### After Authentication Implementation

#### When User is NOT Signed In (Unauthenticated State)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Brand Color Header]                                           │
│                                                                 │
│            🍽️ Feast Finder                [Sign In] [🌙]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elements:**

- **Sign In Button**: White outline button next to color mode toggle
  - Location: Top right corner
  - Style: Outlined with brand contrast color
  - Hover effect: Slight background opacity change
  - Action: Opens sign-in modal

#### When User IS Signed In (Authenticated State)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Brand Color Header]                                           │
│                                                                 │
│            🍽️ Feast Finder         [👤 John Doe ▼] [🌙]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elements:**

- **User Menu Button**: Shows user's name with user icon
  - Location: Top right corner (replaces Sign In button)
  - Style: Small outlined button
  - Icon: User icon (👤)
  - Text: User's name (or "User" if name not available)
  - Action: Opens dropdown menu

**User Menu Dropdown:**

```
┌─────────────────┐
│ 🚪 Sign Out     │
└─────────────────┘
```

- Single menu item with sign-out icon
- Action: Signs out user and returns to unauthenticated state

## Sign-In Modal

### Modal Appearance

- **Overlay**: Semi-transparent dark backdrop covering page content
- **Modal Size**: Medium-sized centered dialog
- **Design**: Clean, modern design matching app theme

### Sign-In Mode (Default)

```
┌───────────────────────────────────────┐
│  Sign In                          [×] │
├───────────────────────────────────────┤
│                                       │
│  Email                                │
│  [_____________________________]      │
│                                       │
│  Password                             │
│  [_____________________________]      │
│                                       │
│  [        Sign In        ]            │
│                                       │
│  Don't have an account? Sign up       │
│                                       │
└───────────────────────────────────────┘
```

**Form Fields:**

- **Email Input**
  - Type: email
  - Placeholder: "Enter your email"
  - Required: Yes
- **Password Input**
  - Type: password
  - Placeholder: "Enter your password"
  - Required: Yes

**Actions:**

- **Sign In Button**: Primary button with brand colors
  - Shows spinner when loading
  - Disabled during submission
- **Switch to Sign Up**: Text button at bottom
  - Toggles to sign-up mode

**Error Display:**

- Red error message text appears above sign-in button if authentication fails

### Sign-Up Mode (After Clicking "Sign up")

```
┌───────────────────────────────────────┐
│  Create Account                   [×] │
├───────────────────────────────────────┤
│                                       │
│  Name                                 │
│  [_____________________________]      │
│                                       │
│  Email                                │
│  [_____________________________]      │
│                                       │
│  Password                             │
│  [_____________________________]      │
│                                       │
│  [     Create Account     ]           │
│                                       │
│  Already have an account? Sign in     │
│                                       │
└───────────────────────────────────────┘
```

**Form Fields:**

- **Name Input** (Additional field in sign-up mode)
  - Type: text
  - Placeholder: "Enter your name"
  - Required: Yes
- **Email Input**
  - Same as sign-in mode
- **Password Input**
  - Same as sign-in mode

**Actions:**

- **Create Account Button**: Primary button with brand colors
  - Shows spinner when loading
  - Disabled during submission
- **Switch to Sign In**: Text button at bottom
  - Toggles back to sign-in mode

## Affected Pages

### 1. Landing Page (`/`)

- Header includes authentication UI
- Modal can be opened from header

### 2. Restaurants Page (`/restaurants`)

- Header includes authentication UI
- Modal can be opened from header
- Full-screen map view maintained

### 3. Event Pages (`/events/$eventName`)

- Header includes authentication UI on both:
  - Error state (event not found)
  - Success state (event found with map)
- Modal can be opened from header

## Visual Design Details

### Colors

- **Header Background**: Brand solid color (purple/blue)
- **Header Text**: Brand contrast color (white)
- **Sign In Button**: Outlined with brand contrast
- **Modal Background**: Surface background (adapts to light/dark mode)
- **Primary Buttons**: Brand solid background with contrast text
- **Error Text**: Red color (#E53E3E or similar)

### Spacing

- Header padding: 4 units (1rem)
- Modal padding: Standard dialog padding
- Form field spacing: 4 units between fields
- Button spacing: 2 units gap between buttons

### Typography

- User name: Small size
- Form labels: Small, medium weight
- Button text: Default size
- Error text: Small size

### Interactions

#### Sign In Button Hover

- Background: Semi-transparent white (rgba(255, 255, 255, 0.1))
- Smooth transition

#### User Menu Button Hover

- Standard button hover state

#### Modal Transitions

- Fade-in animation for backdrop
- Slide/fade-in for modal content

#### Form Submission States

1. **Idle**: All fields enabled, button shows text
2. **Loading**: Fields disabled, button shows spinner
3. **Success**: Modal closes, user menu appears
4. **Error**: Error message appears, fields re-enabled

## Responsive Behavior

### Desktop (>768px)

- Header elements positioned absolutely
- Sign In button / User Menu right-aligned with color toggle
- Modal centered on screen

### Mobile (<768px)

- Header elements stack or compress appropriately
- Modal takes up most of screen width
- Touch-friendly button sizes maintained

## Accessibility

### Keyboard Navigation

- Tab through all form fields
- Enter submits form
- Escape closes modal

### Screen Readers

- Proper ARIA labels on all interactive elements
- Form validation messages announced
- Modal focus management

### Visual Indicators

- Focus outlines on interactive elements
- Clear error states
- Loading states with spinner

## Dark Mode Support

All authentication UI components respect the app's color mode:

- **Light Mode**: Light backgrounds, dark text
- **Dark Mode**: Dark backgrounds, light text
- Proper contrast maintained in both modes

## Real-time Updates

When authentication state changes:

1. Header immediately updates (Sign In ↔ User Menu)
2. No page refresh required
3. Smooth transitions between states
4. Consistent across all browser tabs (via Convex real-time sync)
