// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
  
    modules: [
      '@nuxt/eslint',
      '@nuxt/fonts',
      '@nuxt/icon',
      '@nuxt/image',
      '@nuxt/scripts',
      '@nuxt/test-utils',
      '@nuxt/ui',
      '@vueuse/motion/nuxt',
      '@pinia/nuxt'
    ],
    fonts: {
      families: [
        {
          name: 'Montserrat',
          provider: 'google',
        }
      ]
    },
    css: [
      '~/assets/css/main.css'
    ],
    app: {
      head: {
        title: 'Nftropoly',
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: 'theme-color', content: '#0a0c1b' },
          { name: 'description', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { name: 'keywords', content: 'Nftropoly, Multichain, Gasless, NFT Marketplace, NFT, Marketplace, Multichain, Gasless, NFT Marketplace, NFT, Marketplace' },
          { name: 'robots', content: 'index, follow' },
          { property: 'og:title', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { property: 'og:description', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: 'https://nftropoly.com/' },
          { property: 'og:image', content: '/logo.svg' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { name: 'twitter:description', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { name: 'twitter:image', content: '/logo.svg' }
        ],
        link: [
          { rel: 'icon', type: 'image/x-icon', href: '/logo.svg' },        ],
        script: [
          {
            type: 'application/ld+json',
          }
        ]
      }
    },
    vite: {
      define: {
        global: 'globalThis',
      },
      resolve: {
        alias: {
          buffer: 'buffer',
          process: 'process/browser',
          util: 'util',
        },
      },
      optimizeDeps: {
        include: ['buffer', 'process', 'util'],
      },
    },
    nitro: {
      experimental: {
        wasm: true,
      },
      rollupConfig: {
        external: [],
      },
      nodeModulesDirs: ['../../node_modules'],
      alias: {
        buffer: 'buffer',
        process: 'process',
        util: 'util',
      },
    },
    runtimeConfig: {
      public: {
        HF_TOKEN: process.env.NUXT_PUBLIC_HF_TOKEN,
        GA_MEASUREMENT_ID: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || 'G-9M4CYZTMME',
        GTM_ID: process.env.NUXT_PUBLIC_GTM_ID || 'GTM-MGJCRHQ3',
        CLARITY_PROJECT_ID: process.env.NUXT_PUBLIC_CLARITY_PROJECT_ID || 'stqeko2g9v',
        canisterIds: {
          database: 'uxrrr-q7777-77774-qaaaq-cai',
          // marketplace: 'u6s2n-gx777-77774-qaaba-cai', // Not deployed yet
          // spiral: 'uzt4z-lp777-77774-qaabq-cai' // Not deployed yet
        },
        network: 'local'
      }
    }
  })