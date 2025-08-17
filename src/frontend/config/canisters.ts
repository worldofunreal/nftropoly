// Canister configuration for the frontend
// These values should be set at build time or runtime, not read from process.env directly

// Development canister IDs (local network)
const DEV_CANISTER_IDS = {
  DATABASE: 'uxrrr-q7777-77774-qaaaq-cai',
  MARKETPLACE: 'u6s2n-gx777-77774-qaaba-cai',
  SPIRAL: 'uzt4z-lp777-77774-qaabq-cai',
} as const;

// Production canister IDs (mainnet) - replace with actual mainnet IDs
const PROD_CANISTER_IDS = {
  DATABASE: 'your-mainnet-database-id',
  MARKETPLACE: 'your-mainnet-marketplace-id',
  SPIRAL: 'your-mainnet-spiral-id',
} as const;

// Runtime configuration
const RUNTIME_CONFIG = {
  // This can be set via window.__CANISTER_IDS__ or similar
  canisterIds: null as typeof DEV_CANISTER_IDS | null,
  network: 'local' as 'local' | 'mainnet',
};

// Function to set runtime configuration (call this early in your app)
export function setRuntimeConfig(config: {
  canisterIds?: typeof DEV_CANISTER_IDS;
  network?: 'local' | 'mainnet';
}) {
  if (config.canisterIds) {
    RUNTIME_CONFIG.canisterIds = config.canisterIds;
  }
  if (config.network) {
    RUNTIME_CONFIG.network = config.network;
  }
}

// Get canister ID based on current configuration
export const getCanisterId = (canisterName: keyof typeof DEV_CANISTER_IDS): string => {
  // Use runtime config if available
  if (RUNTIME_CONFIG.canisterIds) {
    return RUNTIME_CONFIG.canisterIds[canisterName];
  }
  
  // Fallback based on network
  if (RUNTIME_CONFIG.network === 'mainnet') {
    return PROD_CANISTER_IDS[canisterName];
  }
  
  // Default to development
  return DEV_CANISTER_IDS[canisterName];
};

// Network configuration
export const getNetworkHost = (): string => {
  if (RUNTIME_CONFIG.network === 'mainnet') {
    return 'https://ic0.app';
  }
  return 'http://localhost:4943';
};

// Export constants for reference
export const CANISTER_IDS = DEV_CANISTER_IDS;
export const PRODUCTION_CANISTER_IDS = PROD_CANISTER_IDS;
