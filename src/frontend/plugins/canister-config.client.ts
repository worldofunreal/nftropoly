import { setRuntimeConfig } from '~/config/canisters';

// Nuxt auto-imports these, but TypeScript needs the types
declare const defineNuxtPlugin: (plugin: () => void) => void;
declare const useRuntimeConfig: () => { 
  public: { 
    network: 'local' | 'mainnet'; 
    canisterIds: { 
      database: 'uxrrr-q7777-77774-qaaaq-cai'; 
      marketplace: 'u6s2n-gx777-77774-qaaba-cai'; 
      spiral: 'uzt4z-lp777-77774-qaabq-cai'; 
    } 
  } 
};

export default defineNuxtPlugin(() => {
  // Get runtime config from Nuxt
  const config = useRuntimeConfig();
  
  // Set the runtime configuration using Nuxt's runtime config
  setRuntimeConfig({
    network: config.public.network,
    canisterIds: {
      DATABASE: config.public.canisterIds.database,
      MARKETPLACE: config.public.canisterIds.marketplace,
      SPIRAL: config.public.canisterIds.spiral,
    }
  });
  
  console.log('Canister configuration initialized:', {
    network: config.public.network,
    canisterIds: config.public.canisterIds
  });
});
