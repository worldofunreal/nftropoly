<template>
  <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 flex-col">
    <!-- Top User Info Header -->
    <UserProfileHeader @tab-change="activeTab = $event" />
    <!-- Navigation Tabs -->
    <div class="px-4 mt-4">
      <ProfileTabs v-model="activeTab" />
    </div>
    <!-- Bottom Section: Tabbed Content -->
    <div class="flex-1 flex w-full min-h-0">
      <!-- Sidebar (except Following/Followers tabs) - Hidden on mobile -->
      <component
        :is="sidebarComponent"
        v-if="!['Following', 'Followers'].includes(activeTab)"
        :tab="activeTab"
        class="hidden md:block"
      />
      <!-- Main Content Area -->
      <div class="w-0 flex-1 min-h-0">
        <component :is="tabComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import UserProfileHeader from '~/components/profile/UserProfileHeader.vue'
  import ProfileTabs from '~/components/profile/ProfileTabs.vue'
  // Sidebar components for each tab
  import NFTsSidebar from '@/components/profile/NFTsSidebar.vue'
  import TokensSidebar from '@/components/profile/TokensSidebar.vue'
  import ListingsSidebar from '@/components/profile/ListingsSidebar.vue'
  import OffersSidebar from '@/components/profile/OffersSidebar.vue'
  import PortfolioSidebar from '@/components/profile/PortfolioSidebar.vue'
  import CreatedSidebar from '@/components/profile/CreatedSidebar.vue'
  import ActivitySidebar from '@/components/profile/ActivitySidebar.vue'
  // Main area components for each tab
  import NFTsMain from '@/components/profile/NFTsMain.vue'
  import TokensMain from '@/components/profile/TokensMain.vue'
  import ListingsMain from '@/components/profile/ListingsMain.vue'
  import OffersMain from '@/components/profile/OffersMain.vue'
  import PortfolioMain from '@/components/profile/PortfolioMain.vue'
  import CreatedMain from '@/components/profile/CreatedMain.vue'
  import FollowingMain from '@/components/profile/FollowingMain.vue'
  import FollowersMain from '@/components/profile/FollowersMain.vue'
  import ActivityMain from '@/components/profile/ActivityMain.vue'

  const activeTab = ref('NFTs')

  const tabComponent = computed(() => {
    switch (activeTab.value) {
      case 'NFTs':
        return NFTsMain
      case 'Tokens':
        return TokensMain
      case 'Listings':
        return ListingsMain
      case 'Offers':
        return OffersMain
      case 'Portfolio':
        return PortfolioMain
      case 'Created':
        return CreatedMain
      case 'Following':
        return FollowingMain
      case 'Followers':
        return FollowersMain
      case 'Activity':
        return ActivityMain
      default:
        return NFTsMain
    }
  })

  const sidebarComponent = computed(() => {
    switch (activeTab.value) {
      case 'NFTs':
        return NFTsSidebar
      case 'Tokens':
        return TokensSidebar
      case 'Listings':
        return ListingsSidebar
      case 'Offers':
        return OffersSidebar
      case 'Portfolio':
        return PortfolioSidebar
      case 'Created':
        return CreatedSidebar
      case 'Activity':
        return ActivitySidebar
      default:
        return NFTsSidebar
    }
  })
</script>
