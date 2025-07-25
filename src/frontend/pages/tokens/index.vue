<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Left Sidebar: Filters -->
    <aside class="hidden lg:block w-80 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <TokenFilterSection />
    </aside>
    <!-- Main Display Area -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Top Controls -->
      <div class="px-4 pt-6 pb-2 flex-shrink-0">
        <TokenListHeaderControls />
      </div>
      <!-- Token Data Table -->
      <div class="flex-1 px-4 pb-8 overflow-auto">
        <TokenDataTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TokenFilterSection from '@/components/TokenFilterSection.vue'
import TokenListHeaderControls from '@/components/TokenListHeaderControls.vue'
import TokenDataTable from '@/components/TokenDataTable.vue'
</script>
