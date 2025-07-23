<template>
  <div class="flex gap-2 items-center mb-2">
    <div v-for="filter in activeFilters" :key="filter" class="flex items-center gap-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 px-3 py-1 rounded-full text-xs font-semibold">
      {{ filter }}
      <button class="ml-1" @click="removeFilter(filter)"><UIcon name="i-heroicons-x-mark-20-solid" class="text-xs" /></button>
    </div>
    <button v-if="activeFilters.length" class="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs font-semibold" @click="clearFilters">Clear</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const activeFilters = ref(['Sale (x)'])
function removeFilter(filter: string) {
  activeFilters.value = activeFilters.value.filter(f => f !== filter)
}
function clearFilters() {
  activeFilters.value = []
}
</script> 