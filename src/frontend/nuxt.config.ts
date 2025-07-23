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
    app: {
      head: {
        title: 'Nftropoly - The Multichain, Gasless NFT Marketplace',
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
          { property: 'og:url', content: 'https://worldofunreal.com/' },
          { property: 'og:image', content: '/logo.svg' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { name: 'twitter:description', content: 'Nftropoly - The Multichain, Gasless NFT Marketplace' },
          { name: 'twitter:image', content: '/logo.svg' }
        ],
        link: [
          { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
          { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', crossorigin: 'anonymous', referrerpolicy: 'no-referrer' }
        ],
        script: [
          {
            type: 'application/ld+json',
            innerHTML: `\n            {\n              "@context": "https://schema.org/",\n              "@type": "WebSite",\n              "name": "Nftropoly - The Multichain, Gasless NFT Marketplace",\n              "url": "https://worldofunreal.com/",\n              "description": "Nftropoly - The Multichain, Gasless NFT Marketplace",\n              "keywords": "dApps, Games, CGI, Metaverse, World of Unreal, Unreal Studio, Game Development, CGI Animation, Decentralized Applications"\n            }\n          `
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