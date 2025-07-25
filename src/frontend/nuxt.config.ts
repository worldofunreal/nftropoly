// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
  
    modules: [
      '@nuxt/content',
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
          name: 'Inter',
          provider: 'google',
        }
      ]
    },
    css: [
      '~/assets/css/main.css'
    ],
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
      build: {
        rollupOptions: {
          external: [],
        },
      },
    },
    nitro: {
      experimental: {
        wasm: true,
      },
    },
    ui: {
      // Nuxt UI configuration
    },
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
    runtimeConfig: {
      public: {
        HF_TOKEN: process.env.HF_TOKEN
      }
    }
  })