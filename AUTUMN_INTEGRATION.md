# Autumn Integration Guide

Feast Finder uses [Autumn](https://docs.useautumn.com) for premium access management and billing. Autumn handles subscription states, feature permissions, and payment flows through Stripe.

## Overview

Autumn acts as a database layer between your application and Stripe, providing:
- **Feature Gating**: Control access to premium features based on subscription
- **Payment Flows**: Handle upgrades, downgrades, and payment confirmation
- **Usage Tracking**: Monitor and meter feature usage
- **No Webhooks**: Autumn handles all Stripe webhooks automatically

## Architecture

### Backend (Convex)

#### Component Setup (`convex/convex.config.ts`)
The Autumn Convex component is registered alongside the geospatial component:

```typescript
import { defineApp } from 'convex/server'
import geospatial from '@convex-dev/geospatial/convex.config'
import autumn from '@useautumn/convex/convex.config'

const app = defineApp()
app.use(geospatial)
app.use(autumn)

export default app
```

#### Client Initialization (`convex/autumn.ts`)
The Autumn client is initialized with:
- **Secret Key**: From Convex environment variables
- **Identify Function**: Uses existing Convex Auth to identify customers
- **Customer Data**: Maps user ID to Autumn customer with name and email

The `identify` function integrates with the existing Convex Auth system:

```typescript
identify: async (ctx: any) => {
  const userId = await auth.getUserId(ctx)
  if (!userId) return null
  
  const user = await ctx.db.get(userId)
  if (!user) return null
  
  return {
    customerId: userId,
    customerData: {
      name: user.name ?? undefined,
      email: user.email ?? undefined,
    },
  }
}
```

### Frontend (React)

#### Provider Setup (`src/router.tsx`)
The `AutumnProvider` wraps the application inside `ConvexAuthProvider`:

```typescript
<ConvexProvider client={convexQueryClient.convexClient}>
  <ConvexAuthProvider client={convexQueryClient.convexClient}>
    <AutumnProvider>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </AutumnProvider>
  </ConvexAuthProvider>
</ConvexProvider>
```

#### Feature Access Checks (`src/routes/restaurants.tsx`)
Premium features are gated using the `useCustomer` hook:

```typescript
const { customer, check } = useCustomer()

const hasAdvancedFilters = useMemo(() => {
  const result = check({ featureId: PREMIUM_FEATURES.ADVANCED_FILTERS })
  return result.data.allowed
}, [check, customer])
```

## Premium Features

### Advanced Filters

**Feature ID**: `advanced-filters`

**Free Users**:
- Can view restaurants on map
- Can filter by map viewport (geospatial bounds)
- Can use ONE filter at a time (one price value OR one category)

**Premium Users**:
- All free features
- Filter by multiple price ranges (brunch, lunch, dinner) simultaneously
- Filter by multiple categories (cuisine types) at once
- Combine price and category filters together
- Use unlimited number of filters

### Implementation Details

The filter panel in `/restaurants` displays:
1. **Premium Badge**: Shows when user is using multiple filters without premium access
2. **Dynamic Message**: "Use multiple filters with premium" or "Multiple filters require premium"
3. **Upgrade Link**: Prompts non-premium users to upgrade
4. **Smart Disabling**: Filters become disabled only when user tries to use more than one
5. **Visual Feedback**: Uses Chakra UI's badge component with yellow color palette

## Setup Instructions

### 1. Get Autumn API Key

1. Sign up at [Autumn Dashboard](https://app.useautumn.com)
2. Navigate to your sandbox environment
3. Go to Settings → API Keys
4. Copy your test secret key (starts with `am_sk_`)

### 2. Configure Convex Environment

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your Feast Finder project
3. Navigate to Settings → Environment Variables
4. Add `AUTUMN_SECRET_KEY` with your Autumn API key

### 3. Generate Component Types

After adding the secret key, regenerate types:

```bash
# Start Convex dev server (if not already running)
npx convex dev

# Generate types
npx convex codegen
```

This will generate the `components.autumn` types needed by the integration.

### 4. Create Products in Autumn

1. In Autumn Dashboard, navigate to Products
2. Create a "Free" product (base tier)
3. Create a "Premium" product with:
   - Feature: `advanced-filters` (boolean feature)
   - Price: Set your desired monthly/yearly pricing
   - Stripe integration: Connect your Stripe account

### 5. Test Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Sign in to the application
3. Navigate to `/restaurants`
4. Open the filter panel (🔍 button)
5. Verify premium badge appears for free users
6. Test upgrade flow (if implemented)

## Using Autumn Features

### Check Feature Access

```typescript
import { useCustomer } from 'autumn-js/react'
import { PREMIUM_FEATURES } from '~/lib/premiumFeatures'

const { check } = useCustomer()
const result = check({ featureId: PREMIUM_FEATURES.ADVANCED_FILTERS })

if (result.data.allowed) {
  // User has access - show premium feature
} else {
  // User doesn't have access - show upgrade prompt
}
```

### Handle Upgrades

```typescript
import { useCustomer, CheckoutDialog } from 'autumn-js/react'

const { checkout } = useCustomer()

const handleUpgrade = async () => {
  await checkout({
    productId: 'premium',
    dialog: CheckoutDialog,
  })
}
```

### Track Usage (for metered features)

```typescript
import { useCustomer } from 'autumn-js/react'

const { track } = useCustomer()

await track({
  featureId: 'api-calls',
  value: 1, // Increment by 1
})
```

## Security Considerations

### Client-Side vs Server-Side Checks

**Current Implementation**: Client-side checks for UI/UX
- Filter UI is disabled based on Autumn check
- Premium badge is shown to non-premium users
- Good for user experience and preventing confusion

**Security Best Practice**: Always verify on server-side
- Client-side checks can be bypassed
- For production, add server-side feature checks in Convex functions
- Example:

```typescript
// convex/restaurantsGeo.ts
export const queryRestaurantsInBounds = query({
  args: { /* ... */, useAdvancedFilters: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.useAdvancedFilters) {
      // Server-side check using Autumn
      const { allowed } = await autumn.check(ctx, {
        featureId: 'advanced-filters'
      })
      
      if (!allowed) {
        throw new Error('Premium access required for advanced filters')
      }
    }
    // ... rest of function
  }
})
```

## Adding New Premium Features

### 1. Define Feature ID

Add to `src/lib/premiumFeatures.ts`:

```typescript
export const PREMIUM_FEATURES = {
  ADVANCED_FILTERS: 'advanced-filters',
  EXPORT_DATA: 'export-data', // New feature
} as const
```

### 2. Create Feature in Autumn

1. Go to Autumn Dashboard → Features
2. Click "Add Feature"
3. Set ID: `export-data`
4. Set Type: `boolean` or `metered`
5. Add to Premium product

### 3. Implement Feature Gating

```typescript
const { check } = useCustomer()
const hasExport = useMemo(() => {
  const result = check({ featureId: PREMIUM_FEATURES.EXPORT_DATA })
  return result.data.allowed
}, [check, customer])

// Use hasExport to gate feature
{hasExport && <ExportButton />}
```

### 4. Add Server-Side Enforcement

Protect the backend function:

```typescript
export const exportData = mutation({
  args: {},
  handler: async (ctx, args) => {
    const { allowed } = await autumn.check(ctx, {
      featureId: 'export-data'
    })
    
    if (!allowed) {
      throw new Error('Premium access required')
    }
    
    // Export logic
  }
})
```

## Troubleshooting

### "components.autumn does not exist" Error

**Cause**: Convex component types haven't been generated

**Solution**:
1. Ensure `AUTUMN_SECRET_KEY` is set in Convex Dashboard
2. Run `npx convex dev` to start the dev server
3. Run `npx convex codegen` to generate types
4. Restart your development server

### Premium Features Not Working

**Checklist**:
- [ ] `AUTUMN_SECRET_KEY` is set in Convex environment
- [ ] Feature ID matches exactly in code and Autumn dashboard
- [ ] Feature is added to the Premium product in Autumn
- [ ] User is authenticated (check with Convex Auth)
- [ ] Component types are generated (`npx convex codegen`)

### Customer Not Created in Autumn

**Cause**: User might not be signed in, or identify function failing

**Debug Steps**:
1. Check browser console for Autumn errors
2. Verify user is signed in (check Convex Auth)
3. Check Convex logs for identify function errors
4. Verify `auth.getUserId()` returns valid user ID

### Build/Type Errors with Autumn

**Temporary Solution**: The `@ts-expect-error` comment in `convex/autumn.ts` bypasses type checking until component types are generated. This is expected and safe.

**Permanent Solution**: Run `npx convex codegen` after setting up Autumn

## Resources

- [Autumn Documentation](https://docs.useautumn.com)
- [Autumn + Convex Guide](https://docs.useautumn.com/setup/convex)
- [Autumn Dashboard](https://app.useautumn.com)
- [Convex Auth Documentation](https://docs.convex.dev/auth/convex-auth)

## Future Enhancements

### Metered Features
Add usage-based features like:
- API call limits
- Map view limits
- Export limits

### Billing Portal
Add a billing page where users can:
- View current plan
- See usage statistics
- Update payment method
- Cancel subscription

### Team/Organization Plans
Implement entity-based billing for:
- Team workspaces
- Multiple users per subscription
- Seat-based pricing

### Trial Periods
Add free trial support:
- 14-day premium trial
- No credit card required
- Automatic downgrade after trial
