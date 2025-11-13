/**
 * Premium feature IDs for Autumn access control
 */

export const PREMIUM_FEATURES = {
  ADVANCED_FILTERS: 'advanced-filters',
} as const

export type PremiumFeature =
  (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES]
