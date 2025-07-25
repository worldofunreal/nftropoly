<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar (Left Panel) -->
    <aside class="hidden lg:block w-80 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <NftsSidebar />
    </aside>
    <!-- Main Table (Right Panel) -->
    <div class="flex-1 flex flex-col min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      <!-- Header Controls -->
      <div class="px-4 pt-6 pb-2 flex-shrink-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <NftsHeaderControls />
      </div>
      <!-- NFT Collections Table -->
      <div class="flex-1 px-4 pb-8 overflow-auto">
        <NftsCollectionsTable />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NftsSidebar from '@/components/NftsSidebar.vue'
import NftsHeaderControls from '@/components/NftsHeaderControls.vue'
import NftsCollectionsTable from '@/components/NftsCollectionsTable.vue'
</script>
