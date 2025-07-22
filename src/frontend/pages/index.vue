<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <!-- Animated Background -->
      <div class="absolute inset-0 w-full h-full">
        <!-- Gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950"></div>
        <!-- Subtle pattern overlay -->
        <div class="absolute inset-0 opacity-30 dark:opacity-10" style="background-image: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);"></div>
      </div>
      
      <UContainer class="relative z-10 text-center">
        <div class="max-w-4xl mx-auto">
          <!-- Logo -->
          <div class="mb-8">
            <img
              :src="logoSrc"
              alt="Nftropoly - The Multichain, Gasless NFT Marketplace"
              class="w-48 md:w-64 mx-auto mb-6 animate-fade-in"
            />
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nftropoly
            </span>
          </h1>

          <!-- Tagline -->
          <h2 class="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            The Multichain, Gasless NFT Marketplace
          </h2>

          <!-- Subtitle -->
          <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Bring Your NFTs to Life—Across Any Chain!
          </p>

          <p class="text-lg text-gray-500 dark:text-gray-500 mb-12 max-w-2xl mx-auto">
            No gas fees. No barriers. 100% decentralized.
          </p>

          <!-- Key Features -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div class="text-4xl mb-4">🛠️</div>
              <h3 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Multi-Chain NFT Hub</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Supports EVM, Solana, and ICP NFTs in one place</p>
            </div>
            
            <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div class="text-4xl mb-4">⚡</div>
              <h3 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">Gasless Transactions</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Leverages ICP's speed and fee-less infrastructure</p>
            </div>
            
            <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div class="text-4xl mb-4">🤖</div>
              <h3 class="text-lg font-bold mb-2 text-gray-900 dark:text-white">AI-Powered Creation</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Generate NFT art and metadata instantly with AI</p>
            </div>
          </div>

          <!-- Tech Badges -->
          <div class="flex flex-wrap justify-center gap-3 mb-12">
            <UBadge color="primary" variant="soft" size="lg" class="text-sm font-semibold">
              <UIcon name="icon-park-solid:blockchain" class="mr-1" />
              Multi-Chain
            </UBadge>
            <UBadge color="secondary" variant="soft" size="lg" class="text-sm font-semibold">
              <UIcon name="material-symbols:speed" class="mr-1" />
              Gasless
            </UBadge>
            <UBadge color="info" variant="soft" size="lg" class="text-sm font-semibold">
              <UIcon name="i-fa6-solid-brain" class="mr-1" />
              AI-Powered
            </UBadge>
            <UBadge color="warning" variant="soft" size="lg" class="text-sm font-semibold">
              <UIcon name="material-symbols:lock-open" class="mr-1" />
              Decentralized
            </UBadge>
          </div>

          <!-- Under Construction Notice -->
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 max-w-2xl mx-auto">
            <div class="flex items-center justify-center gap-3 mb-3">
              <UIcon name="material-symbols:construction" class="text-2xl text-amber-600 dark:text-amber-400" />
              <h3 class="text-lg font-bold text-amber-800 dark:text-amber-200">Under Construction</h3>
            </div>
            <p class="text-amber-700 dark:text-amber-300 text-sm">
              We're building the future of NFT marketplaces. Stay tuned for the launch of true interoperability and gasless trading!
            </p>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()

// --- LOGO LOGIC ---
const logoSrc = ref('/logo.svg')

onMounted(() => {
  if (colorMode.value === 'light') {
    logoSrc.value = '/logo-dark.svg'
  } else {
    logoSrc.value = '/logo.svg'
  }
})

watch(() => colorMode.value, (val) => {
  logoSrc.value = val === 'light' ? '/logo-dark.svg' : '/logo.svg'
})

useHead({
  title: 'Nftropoly: The Multichain, Gasless NFT Marketplace',
  meta: [
    { name: 'description', content: 'Nftropoly is the multichain, gasless NFT marketplace. Bring your NFTs to life across any chain—EVM, Solana, and ICP. No gas fees. No barriers. 100% decentralized. AI-powered NFT creation and true on-chain interoperability.' },
    { name: 'keywords', content: 'NFT, Marketplace, Multichain, Gasless, EVM, Solana, ICP, AI, Generative Art, Decentralized, NFTropoly, NFT Trading, On-chain, Web3, Chain Fusion, NFT Minting' },
    { property: 'og:title', content: 'Nftropoly: The Multichain, Gasless NFT Marketplace' },
    { property: 'og:description', content: 'Nftropoly is the multichain, gasless NFT marketplace. Bring your NFTs to life across any chain—EVM, Solana, and ICP. No gas fees. No barriers. 100% decentralized. AI-powered NFT creation and true on-chain interoperability.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://nftropoly.com/' },
    { property: 'og:image', content: '/logo.svg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Nftropoly: The Multichain, Gasless NFT Marketplace' },
    { name: 'twitter:description', content: 'Nftropoly is the multichain, gasless NFT marketplace. Bring your NFTs to life across any chain—EVM, Solana, and ICP. No gas fees. No barriers. 100% decentralized. AI-powered NFT creation and true on-chain interoperability.' },
    { name: 'twitter:image', content: '/logo.svg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://nftropoly.com/' }
  ]
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}
</style> 