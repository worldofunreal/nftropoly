<template>
  <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Left Sidebar: Filters -->
    <aside class="hidden lg:block w-80 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-950 overflow-y-auto">
      <ActivityFilterPanel />
    </aside>
    <!-- Main Display Area -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Top Filter Bar (Pills) -->
      <div class="p-4 flex-shrink-0">
        <ActivityTopFilterBar />
      </div>
      <!-- Activity Table -->
      <div class="flex-1 px-4 pb-8 overflow-auto">
        <ActivityTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActivityFilterPanel from '@/components/ActivityFilterPanel.vue'
import ActivityTopFilterBar from '@/components/ActivityTopFilterBar.vue'
import ActivityTable from '@/components/ActivityTable.vue'
</script> 