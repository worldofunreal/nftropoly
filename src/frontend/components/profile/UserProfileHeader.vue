<template>
  <div
    class="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl shadow-lg overflow-hidden mb-8 h-80"
  >
    <!-- Background Banner -->
    <div class="absolute inset-0 z-0">
      <img
        :src="bannerUrl || 'https://placehold.co/1200x240'"
        alt="Banner"
        class="w-full h-48 object-cover blur-sm opacity-60"
      >
    </div>
    <div
      class="relative h-full justify-end md:justify-between z-10 flex md:items-end flex-col md:flex-row gap-6 px-8 py-8"
    >
      <!-- Avatar & User Info -->
      <div class="flex items-center gap-6 min-w-0">
        <img
          :src="avatarUrl || 'https://placehold.co/96x96'"
          alt="Avatar"
          class="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg bg-white object-cover"
        >
        <div class="flex flex-col gap-2 min-w-0">
          <!-- Display Name / Username -->
          <div
            class="flex items-center gap-2 text-xl font-bold text-white truncate"
          >
            <span class="truncate">{{ displayName }}</span>
            <span v-if="userProfile?.isVerified" class="text-blue-400">✓</span>
          </div>

          <!-- Username -->
          <div
            v-if="userProfile?.username && displayName !== userProfile.username"
            class="text-sm text-gray-200"
          >
            @{{ userProfile.username }}
          </div>

          <!-- Bio -->
          <div v-if="bio" class="text-sm text-gray-200 max-w-md">
            {{ bio }}
          </div>

          <!-- Wallet Address (smaller, secondary) -->
          <div class="flex items-center gap-2 text-xs text-gray-300 truncate">
            <span class="truncate">{{ displayWalletAddress }}</span>
            <UIcon
              name="i-heroicons-document-duplicate-20-solid"
              class="text-gray-300 cursor-pointer hover:text-white transition"
              @click="copyToClipboard(auth.evmAddress || auth.principal)"
            />
            <span
              class="ml-2 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full"
              >{{ auth.nativeWallet?.toUpperCase() || 'WALLET' }}</span
            >
          </div>

          <!-- ICP Principal -->
          <div
            v-if="auth.principal"
            class="flex items-center gap-2 text-xs text-gray-300 truncate"
          >
            <span class="truncate">{{ displayIcpPrincipal }}</span>
            <UIcon
              name="i-heroicons-document-duplicate-20-solid"
              class="text-gray-300 cursor-pointer hover:text-white transition"
              @click="copyToClipboard(auth.principal)"
            />
            <span
              class="ml-2 bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full"
              >ICP</span
            >
          </div>
        </div>
      </div>
      <!-- Stats Block (Top Right, vertically stacked) -->
      <div class="flex gap-x-8 gap-y-2">
        <!-- Sell NFT Button -->
        <UButton
          color="primary"
          variant="solid"
          class="sell-nft-btn"
          icon="i-heroicons-arrow-up-tray"
        >
          Sell NFT
        </UButton>
        <div class="flex flex-col items-start gap-1">
          <span
            class="uppercase text-xs text-gray-200 font-light flex items-center gap-1"
            >Portfolio Value
            <UIcon
              name="i-heroicons-eye-20-solid"
              class="text-gray-200 text-xs"
          /></span>
          <span class="text-base font-semibold text-white"
            >{{ portfolioValueEth }} ETH</span
          >
        </div>
        <div class="flex flex-col items-start gap-1">
          <span class="uppercase text-xs text-gray-200 font-light"
            >USD Value</span
          >
          <span class="text-base font-semibold text-white"
            >${{ portfolioValueUsd }}</span
          >
        </div>
        <div class="flex flex-col items-start gap-1">
          <span class="uppercase text-xs text-gray-200 font-light">NFTs</span>
          <span class="text-base font-semibold text-white"
            >{{ nftPercentage }}%</span
          >
        </div>
        <div class="flex flex-col items-start gap-1">
          <span class="uppercase text-xs text-gray-200 font-light">Tokens</span>
          <span class="text-base font-semibold text-white"
            >{{ tokenPercentage }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const auth = useAuthStore()

  // User profile data
  const userProfile = computed(() => auth.userProfile)

  // Display name (prefer displayName, fallback to username)
  const displayName = computed(() => {
    if (!userProfile.value) return 'Anonymous User'
    // Handle array format from Candid
    const displayNameValue = Array.isArray(userProfile.value.displayName)
      ? userProfile.value.displayName[0]
      : userProfile.value.displayName
    return displayNameValue || userProfile.value.username || 'Anonymous User'
  })

  // Bio text
  const bio = computed(() => {
    if (!userProfile.value?.bio) return ''
    // Handle array format from Candid
    return Array.isArray(userProfile.value.bio)
      ? userProfile.value.bio[0]
      : userProfile.value.bio
  })

  // Avatar URL
  const avatarUrl = computed(() => {
    if (!userProfile.value?.assets) return null
    // Handle array format from Candid
    const url = Array.isArray(userProfile.value.assets.avatarUrl)
      ? userProfile.value.assets.avatarUrl[0]
      : userProfile.value.assets.avatarUrl
    return url || null
  })

  // Banner URL
  const bannerUrl = computed(() => {
    if (!userProfile.value?.assets) return null
    // Handle array format from Candid
    const url = Array.isArray(userProfile.value.assets.bannerUrl)
      ? userProfile.value.assets.bannerUrl[0]
      : userProfile.value.assets.bannerUrl
    return url || null
  })

  // Portfolio stats
  const portfolioValueEth = computed(() => {
    return userProfile.value?.portfolio?.totalValueEth?.toFixed(2) || '0.00'
  })

  const portfolioValueUsd = computed(() => {
    return userProfile.value?.portfolio?.totalValueUsd?.toFixed(2) || '0.00'
  })

  const nftPercentage = computed(() => {
    return userProfile.value?.portfolio?.nftPercentage?.toFixed(0) || '0'
  })

  const tokenPercentage = computed(() => {
    return userProfile.value?.portfolio?.tokenPercentage?.toFixed(0) || '0'
  })

  // Format wallet address for display
  const displayWalletAddress = computed(() => {
    const address = auth.evmAddress || auth.principal
    if (!address) return 'Not Connected'
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address.length > 20
      ? `${address.slice(0, 10)}...${address.slice(-8)}`
      : address
  })

  // Format ICP principal for display
  const displayIcpPrincipal = computed(() => {
    if (!auth.principal) return ''
    const principalStr = typeof auth.principal === 'string' ? auth.principal : String(auth.principal)
    return `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`
  })

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log('Copied to clipboard:', text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }
</script>
