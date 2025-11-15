import { Autumn } from '@useautumn/convex'
import { components } from './_generated/api'

/**
 * IMPORTANT: Before using Autumn integration, you must:
 * 1. Set AUTUMN_SECRET_KEY in Convex Dashboard → Settings → Environment Variables
 *    Get your key from: https://app.useautumn.com/sandbox/dev
 * 2. Run `npx convex dev` to generate the Autumn component types
 * 3. Run `npx convex codegen` to regenerate types
 */

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? '',
  identify: async (ctx: any) => {
    const user = await ctx.auth.getUserIdentity()
    if (!user) return null

    // Extract userId from subject (format: "<userId>|<sessionId>")
    const userId = user.subject.split('|')[0]
    return {
      customerId: userId,
      customerData: {
        name: user.name as string,
        email: user.email as string,
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
