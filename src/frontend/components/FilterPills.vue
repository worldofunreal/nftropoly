<template>
  <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <button
      v-for="cat in categories"
      :key="cat.label"
      @click="selected = cat.label"
      class="flex items-center gap-1 px-4 py-2 rounded-full border transition font-semibold whitespace-nowrap"
      :class="selected === cat.label
        ? 'bg-primary-600 text-white border-primary-600'
        : 'bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900'"
    >
      <UIcon v-if="cat.icon" :name="cat.icon" class="text-lg" />
      <span>{{ cat.label }}</span>
    </button>
    <!-- Stats Icon Button -->
    <button class="ml-2 flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-primary-50 dark:hover:bg-primary-900 transition">
      <UIcon name="ion:stats-chart" class="text-xl text-primary-600" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const categories = [
  { label: 'All', icon: null },
  { label: 'Gaming', icon: 'streamline-plump:controller-1-solid' },
  { label: 'Art', icon: 'mdi:art' },
  { label: 'PFPs', icon: 'mdi:face' },
  { label: 'Music', icon: 'mdi:music' },
  { label: 'Photography', icon: 'mynaui:aperture-solid' },
]
const selected = ref('All')
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 