/**
 * Feature flags for the marketplace
 * These can be controlled via environment variables or runtime configuration
 */

interface FeatureFlags {
  amm: boolean
  kyc: boolean
  notifications: boolean
  advancedAnalytics: boolean
  batchOperations: boolean
}

const defaultFlags: FeatureFlags = {
  amm:
    process.env.NODE_ENV === 'development' || process.env.ENABLE_AMM === 'true',
  kyc: process.env.ENABLE_KYC === 'true',
  notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  advancedAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  batchOperations: true,
}

let cachedFlags: FeatureFlags | null = null

export function getFeatureFlags(): FeatureFlags {
  if (cachedFlags) {
    return cachedFlags
  }

  // In a real app, this might fetch from a remote config service
  cachedFlags = { ...defaultFlags }
  return cachedFlags
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[feature]
}

export function refreshFeatureFlags(): Promise<FeatureFlags> {
  // In a real app, this would fetch fresh flags from a remote service
  cachedFlags = null
  return Promise.resolve(getFeatureFlags())
}

// Individual feature flag helpers
export const isAMMEnabled = () => isFeatureEnabled('amm')
export const isKYCEnabled = () => isFeatureEnabled('kyc')
export const isNotificationsEnabled = () => isFeatureEnabled('notifications')
export const isAdvancedAnalyticsEnabled = () =>
  isFeatureEnabled('advancedAnalytics')
export const isBatchOperationsEnabled = () =>
  isFeatureEnabled('batchOperations')
