<template>
  <div class="flex flex-col gap-6">
    <!-- Search for Chains -->
    <div>
      <div class="font-bold mb-2">Search for Chains</div>
      <div class="relative">
        <input type="text" placeholder="Search chains..." class="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950" />
        <UIcon name="ri:search-line" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
    <!-- Chains Filter -->
    <div>
      <div class="font-bold mb-2">Chains</div>
      <div class="flex flex-col gap-1">
        <label v-for="chain in chains" :key="chain"><input type="checkbox" /> {{ chain }}</label>
      </div>
    </div>
    <!-- Market Cap Filter -->
    <div>
      <div class="font-bold mb-2">Market Cap</div>
      <div class="flex flex-wrap gap-2">
        <button v-for="cap in marketCaps" :key="cap" class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs">{{ cap }}</button>
      </div>
    </div>
    <!-- Category Filter (Collapsible) -->
    <div>
      <div class="font-bold mb-2">Category</div>
      <div v-for="cat in categories" :key="cat.label" class="mb-1">
        <button @click="cat.open = !cat.open" class="flex items-center gap-2 w-full text-left">
          <span>{{ cat.label }}</span>
          <UIcon :name="cat.open ? 'i-heroicons-chevron-down-20-solid' : 'i-heroicons-chevron-right-20-solid'" class="text-xs" />
        </button>
        <div v-if="cat.open" class="pl-4 mt-1 flex flex-col gap-1">
          <label v-for="opt in cat.options" :key="opt"><input type="checkbox" /> {{ opt }}</label>
        </div>
      </div>
    </div>
    <!-- Has NFT Toggle -->
    <div class="flex items-center gap-2">
      <input type="checkbox" id="has-nft" />
      <label for="has-nft">Has NFT</label>
    </div>
    <!-- Branded Token Page Toggle -->
    <div class="flex items-center gap-2">
      <input type="checkbox" id="branded-token" />
      <label for="branded-token">Branded Token Page</label>
    </div>
  </div>
</template>
<script setup lang="ts">
const chains = ['Ethereum', 'Solana', 'Arbitrum', 'Base', 'Optimism', 'Polygon']
const marketCaps = ['<$100K', '$100K - $500K', '$500K - $1M', '$1M - $10M', '$10M+']
const categories = [
  { label: 'All', open: true, options: ['All'] },
  { label: 'Layer 1', open: false, options: ['Ethereum', 'Solana'] },
  { label: 'Layer 2', open: false, options: ['Arbitrum', 'Optimism', 'Base'] },
  { label: 'Stablecoins', open: false, options: ['USDT', 'USDC', 'DAI'] },
  { label: 'Smart Contract Platform', open: false, options: ['Ethereum', 'Solana', 'Polygon'] },
  { label: 'DeFi', open: false, options: ['Uniswap', 'Aave'] },
  { label: 'Pump.fun', open: false, options: ['Pump.fun'] },
  { label: 'Dog Themed', open: false, options: ['DOGE', 'SHIB'] }
]
</script> 