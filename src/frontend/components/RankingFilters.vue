<template>
  <div class="flex flex-col gap-2">
    <!-- Ranking Filters -->
    <div class="flex gap-2">
      <button
        v-for="f in rankingFilters"
        :key="f.label"
        @click="selectedRanking = f.label"
        class="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold transition"
        :class="selectedRanking === f.label
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900'"
      >
        <UIcon :name="f.icon" class="text-base" />
        <span>{{ f.label }}</span>
      </button>
    </div>
    <!-- View Modes -->
    <div class="flex gap-2">
      <button
        v-for="v in viewModes"
        :key="v.label"
        @click="selectedView = v.label"
        class="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold transition"
        :class="selectedView === v.label
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900'"
      >
        <UIcon :name="v.icon" class="text-base" />
        <span>{{ v.label }}</span>
      </button>
    </div>
    <!-- Time Filters -->
    <div class="flex gap-2">
      <button
        v-for="t in timeFilters"
        :key="t"
        @click="selectedTime = t"
        class="px-3 py-1 rounded-full border text-xs font-semibold transition"
        :class="selectedTime === t
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900'"
      >
        {{ t }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const rankingFilters = [
  { label: 'Top', icon: 'mdi:medal' },
  { label: 'Trending', icon: 'streamline-plump:trending-content-solid' }
]
const viewModes = [
  { label: 'Table', icon: 'material-symbols:table' },
  { label: 'Compact', icon: 'teenyicons:table-solid' }
]
const timeFilters = ['5m', '15m', '1d', '30d', 'All']
const selectedRanking = ref('Top')
const selectedView = ref('Table')
const selectedTime = ref('1d')
</script> 