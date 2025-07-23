<template>
  <div class="flex flex-col gap-6">
    <!-- Status (Event Type) -->
    <div>
      <div class="font-bold mb-2">Status</div>
      <div class="flex flex-wrap gap-2">
        <button v-for="status in statuses" :key="status" class="px-3 py-1 rounded-full border text-xs font-semibold" :class="selectedStatuses.includes(status) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'" @click="toggleStatus(status)">{{ status }}</button>
      </div>
    </div>
    <!-- Price Filter -->
    <div>
      <div class="font-bold mb-2">Price</div>
      <div class="flex gap-2 items-center mb-2">
        <select class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs">
          <option>USD</option>
          <option>ETH</option>
        </select>
        <input type="number" placeholder="Min" class="w-16 px-2 py-1 rounded border" />
        <span>-</span>
        <input type="number" placeholder="Max" class="w-16 px-2 py-1 rounded border" />
        <button class="px-3 py-1 rounded bg-primary-600 text-white text-xs">Apply</button>
      </div>
    </div>
    <!-- Marketplaces -->
    <div>
      <div class="font-bold mb-2">Marketplaces</div>
      <div class="flex flex-col gap-1">
        <label v-for="m in marketplaces" :key="m"><input type="checkbox" /> {{ m }}</label>
      </div>
    </div>
    <!-- Chains -->
    <div>
      <div class="font-bold mb-2">Chains</div>
      <input type="text" placeholder="Search chains..." class="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-2" />
      <div class="flex flex-wrap gap-2">
        <button v-for="chain in chains" :key="chain.label" class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border" :class="chain.color">
          <UIcon :name="chain.icon" class="text-base" /> {{ chain.label }}
        </button>
      </div>
    </div>
    <!-- Collections -->
    <div>
      <div class="font-bold mb-2">Collections</div>
      <input type="text" placeholder="Search for collections" class="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-2" />
      <div class="flex flex-col gap-1 max-h-40 overflow-y-auto">
        <label v-for="col in collections" :key="col.name" class="flex items-center gap-1">
          <input type="checkbox" />
          <span>{{ col.name }}</span>
          <UIcon v-if="col.verified" name="material-symbols:verified" class="text-primary-500 text-xs" />
        </label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const statuses = ['All', 'Sale', 'Mint', 'Transfer', 'Listing', 'Item Offer', 'Collection Offer', 'Trait Offer']
const selectedStatuses = ref(['All'])
function toggleStatus(status: string) {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status)
  } else {
    selectedStatuses.value.push(status)
  }
}
const marketplaces = ['OpenSea', 'Blur', 'MagicEden', 'CryptoPunks']
const chains = [
  { label: 'All', icon: 'logos:ethereum', color: 'bg-gray-200 dark:bg-gray-800' },
  { label: 'Ethereum', icon: 'logos:ethereum', color: 'bg-blue-100 dark:bg-blue-900' },
  { label: 'Solana', icon: 'token-branded:solana', color: 'bg-green-100 dark:bg-green-900' },
  { label: 'Arbitrum', icon: 'logos:arbitrum', color: 'bg-indigo-100 dark:bg-indigo-900' },
  { label: 'Polygon', icon: 'token-branded:polygon', color: 'bg-purple-100 dark:bg-purple-900' },
  { label: 'Base', icon: 'logos:base', color: 'bg-blue-200 dark:bg-blue-800' }
]
const collections = [
  { name: 'X FIGURES', verified: true },
  { name: 'CryptoPunks', verified: true },
  { name: 'Cool Cats', verified: false },
  { name: 'Bored Apes', verified: true },
  { name: 'Doodles', verified: false }
]
</script> 