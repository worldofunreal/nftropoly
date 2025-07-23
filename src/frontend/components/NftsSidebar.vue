<template>
  <div class="flex flex-col gap-6">
    <!-- Category -->
    <div>
      <div class="font-bold mb-2 text-white">Category</div>
      <div class="flex flex-wrap gap-2">
        <button v-for="cat in categories" :key="cat" class="px-3 py-1 rounded-full border text-xs font-semibold" :class="selectedCategory === cat ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-800 text-gray-200 border-gray-700'" @click="selectedCategory = cat">{{ cat }}</button>
      </div>
    </div>
    <!-- Chains -->
    <div>
      <div class="font-bold mb-2 text-white">Chains</div>
      <input type="text" placeholder="Search for chains" class="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-gray-200 mb-2" />
      <div class="flex flex-wrap gap-2">
        <button v-for="chain in chains" :key="chain.label" class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border" :class="selectedChain === chain.label ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-800 text-gray-200 border-gray-700'" @click="selectedChain = chain.label">
          <UIcon :name="chain.icon" class="text-base" /> {{ chain.label }}
        </button>
      </div>
    </div>
    <!-- Floor Price -->
    <div>
      <div class="font-bold mb-2 text-white">Floor Price</div>
      <div class="flex gap-2 items-center mb-2">
        <select class="px-2 py-1 rounded border border-gray-700 bg-gray-800 text-xs text-gray-200">
          <option>ETH</option>
        </select>
        <input type="number" placeholder="Min" class="w-16 px-2 py-1 rounded border border-gray-700 bg-gray-800 text-gray-200" />
        <span class="text-gray-400">to</span>
        <input type="number" placeholder="Max" class="w-16 px-2 py-1 rounded border border-gray-700 bg-gray-800 text-gray-200" />
        <button class="px-3 py-1 rounded bg-primary-600 text-white text-xs">Apply</button>
      </div>
    </div>
    <!-- Top Offer -->
    <div>
      <div class="font-bold mb-2 text-white">Top Offer</div>
      <div class="flex gap-2 items-center mb-2">
        <select class="px-2 py-1 rounded border border-gray-700 bg-gray-800 text-xs text-gray-200">
          <option>WETH</option>
        </select>
        <input type="number" placeholder="Min" class="w-16 px-2 py-1 rounded border border-gray-700 bg-gray-800 text-gray-200" />
        <span class="text-gray-400">to</span>
        <input type="number" placeholder="Max" class="w-16 px-2 py-1 rounded border border-gray-700 bg-gray-800 text-gray-200" />
        <button class="px-3 py-1 rounded bg-primary-600 text-white text-xs">Apply</button>
      </div>
    </div>
    <!-- Is Verified -->
    <div class="flex items-center gap-2 mt-4">
      <input type="checkbox" id="is-verified" class="accent-primary-600" v-model="isVerified" />
      <label for="is-verified" class="text-gray-200">Is Verified</label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const categories = ['All', 'Art', 'Gaming', 'Memberships', 'Music', 'PFPs', 'Photography', 'Domain Names', 'Sports Collectibles', 'Virtual Worlds']
const selectedCategory = ref('All')
const chains = [
  { label: 'All', icon: 'logos:ethereum' },
  { label: 'Ethereum', icon: 'logos:ethereum' },
  { label: 'Abstract', icon: 'logos:ethereum' },
  { label: 'ApeChain', icon: 'logos:ethereum' },
  { label: 'Arbitrum', icon: 'logos:arbitrum' },
  { label: 'Avalanche', icon: 'logos:avalanche' },
  { label: 'Base', icon: 'logos:base' },
  { label: 'Polygon', icon: 'logos:polygon' },
  { label: 'Ronin', icon: 'logos:ronin' },
  { label: 'Zora', icon: 'logos:zora' }
]
const selectedChain = ref('All')
const isVerified = ref(false)
</script> 