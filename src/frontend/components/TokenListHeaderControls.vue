<template>
  <div class="flex flex-wrap gap-2 items-center">
    <!-- Token Type Toggle -->
    <div class="flex gap-1">
      <button @click="type = 'NFTs'" class="px-3 py-2 rounded-l font-bold" :class="type === 'NFTs' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'">NFTs</button>
      <button @click="type = 'Tokens'" class="px-3 py-2 rounded-r font-bold" :class="type === 'Tokens' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'">Tokens</button>
    </div>
    <!-- Trending/Top/New Filters -->
    <div class="flex gap-1 ml-2">
      <button v-for="f in filters" :key="f" @click="selectedFilter = f" :class="selectedFilter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'" class="px-3 py-2 rounded font-bold">{{ f }}</button>
    </div>
    <!-- Time Period Selectors -->
    <div class="flex gap-1 ml-2">
      <button v-for="t in times" :key="t" @click="selectedTime = t" :class="selectedTime === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'" class="px-3 py-2 rounded font-bold">{{ t }}</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const type = ref('Tokens')
const filters = ['Trending', 'Top', 'New']
const selectedFilter = ref('Trending')
const times = ['1D', '7D', 'Last 7D']
const selectedTime = ref('1D')
</script> 