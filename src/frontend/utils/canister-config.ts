// Canister configuration utility
export interface CanisterConfig {
  nftCollection: string
  marketplace: string
  nftropolyToken: string
  backend: string
  _meta?: {
    source: string
    environment: string
    timestamp: string
  }
}

export interface CanisterConfigOptions {
  fallbackToDefaults?: boolean
  throwOnError?: boolean
}

// Cache for canister IDs to avoid repeated API calls
let canisterConfigCache: CanisterConfig | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Clear cache immediately to force refresh
canisterConfigCache = null
cacheTimestamp = 0

/**
 * Get canister IDs from the server endpoint with caching
 */
export async function getCanisterConfig(
  options: CanisterConfigOptions = {}
): Promise<CanisterConfig> {
  const { fallbackToDefaults = true, throwOnError = false } = options

  // Return cached config if still valid
  if (canisterConfigCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return canisterConfigCache
  }

  try {
    const response = await fetch('/api/canister-ids')

    if (!response.ok) {
      throw new Error(
        `Failed to fetch canister IDs: ${response.status} ${response.statusText}`
      )
    }

    const config = (await response.json()) as CanisterConfig

    // Validate required canister IDs
    const requiredIds = [
      'nftCollection',
      'marketplace',
      'nftropolyToken',
      'backend',
    ]
    const missingIds = requiredIds.filter(id => !config[id])

    if (missingIds.length > 0) {
      throw new Error(`Missing required canister IDs: ${missingIds.join(', ')}`)
    }

    // Cache the config
    canisterConfigCache = config
    cacheTimestamp = Date.now()

    return config
  } catch (error) {
    console.error('Failed to fetch canister configuration:', error)

    if (throwOnError) {
      throw error
    }

    if (fallbackToDefaults) {
      console.warn('Using fallback canister configuration')
      return getFallbackCanisterConfig()
    }

    throw error
  }
}

/**
 * Get fallback canister configuration
 */
export function getFallbackCanisterConfig(): CanisterConfig {
  return {
    nftCollection: 'u6s2n-gx777-77774-qaaba-cai', // From deployment
    marketplace: 'uzt4z-lp777-77774-qaabq-cai',   // From deployment
    nftropolyToken: 'umunu-kh777-77774-qaaca-cai', // From deployment
    backend: 'uqqxf-5h777-77774-qaaaa-cai',        // From deployment
    _meta: {
      source: 'fallback',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Clear the canister config cache
 */
export function clearCanisterConfigCache(): void {
  canisterConfigCache = null
  cacheTimestamp = 0
}

/**
 * Get a specific canister ID
 */
export async function getCanisterId(
  canisterName: keyof Omit<CanisterConfig, '_meta'>
): Promise<string> {
  const config = await getCanisterConfig()
  return config[canisterName]
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get the appropriate IC host URL based on environment
 */
export function getICHost(): string {
  if (isDevelopment()) {
    return 'http://localhost:4943'
  }
  return 'https://ic0.app'
}

/**
 * Validate canister ID format
 */
export function isValidCanisterId(canisterId: string): boolean {
  // IC canister IDs are 27 characters long and contain only lowercase letters and hyphens
  const canisterIdRegex = /^[a-z0-9-]{27}$/
  return canisterIdRegex.test(canisterId)
}

/**
 * Get canister configuration for a specific environment
 */
export function getEnvironmentConfig(): {
  host: string
  isLocal: boolean
  isProduction: boolean
  isDevelopment: boolean
} {
  return {
    host: getICHost(),
    isLocal: isDevelopment(),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
  }
}
