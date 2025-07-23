<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Filters Sidebar (Left) -->
    <aside class="hidden lg:block w-72 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <ProfileSidebar />
    </aside>
    <!-- Main Content (Right) -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Hero & Profile Header -->
      <UserProfileHeader />
      <!-- Top Right Stats (overlapping header on desktop) -->
      <div class="absolute right-8 top-8 z-10 hidden lg:block">
        <ProfileStats />
      </div>
      <!-- Navigation Tabs -->
      <div class="px-4 mt-4">
        <ProfileTabs />
      </div>
      <!-- Main Item Table / NFT Display Area -->
      <div class="flex-1 px-4 py-6">
        <NftItemTable />
      </div>
      <!-- Sticky Footer Actions -->
      <div class="sticky bottom-0 left-0 w-full z-20">
        <ProfileFooterActions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserProfileHeader from '@/components/UserProfileHeader.vue'
import ProfileStats from '@/components/ProfileStats.vue'
import ProfileTabs from '@/components/ProfileTabs.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import NftItemTable from '@/components/NftItemTable.vue'
import ProfileFooterActions from '@/components/ProfileFooterActions.vue'
</script>
