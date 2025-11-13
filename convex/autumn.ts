import { Autumn } from '@useautumn/convex'
import { components } from './_generated/api'
import { auth } from './auth'

/**
 * IMPORTANT: Before using Autumn integration, you must:
 * 1. Set AUTUMN_SECRET_KEY in Convex Dashboard → Settings → Environment Variables
 *    Get your key from: https://app.useautumn.com/sandbox/dev
 * 2. Run `npx convex dev` to generate the Autumn component types
 * 3. Run `npx convex codegen` to regenerate types
 */

// @ts-expect-error - autumn component will be available after running npx convex dev
export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? '',
  identify: async (ctx: any) => {
    const userId = await auth.getUserId(ctx)
    if (!userId) {
      return null
    }

    // Get user data from database
    const user = await ctx.db.get(userId)
    if (!user) {
      return null
    }

    return {
      customerId: userId,
      customerData: {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
      },
    }
  },
})

/**
 * These exports are required for our react hooks and components
 */
export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api()
