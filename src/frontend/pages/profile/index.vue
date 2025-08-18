<template>
  <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 flex-col">
    <!-- Top User Info Header -->
    <UserProfileHeader />
    <!-- <div class="absolute right-8 top-8 z-10 hidden md:block">
      <ProfileStats />
    </div> -->
    <!-- Navigation Tabs -->
    <div class="px-4 mt-4">
      <ProfileTabs v-model="activeTab" />
    </div>
    <!-- Bottom Section: Tabbed Content -->
    <div class="flex-1 flex w-full min-h-0">
      <!-- Sidebar (except Galleries tab) - Hidden on mobile -->
      <component
        v-if="activeTab !== 'Galleries'"
        :is="sidebarComponent"
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
  import ProfileStats from '~/components/profile/ProfileStats.vue'
  import ProfileTabs from '~/components/profile/ProfileTabs.vue'
  // Sidebar components for each tab
  import NFTsSidebar from '@/components/profile/NFTsSidebar.vue'
  import TokensSidebar from '@/components/profile/TokensSidebar.vue'
  import ListingsSidebar from '@/components/profile/ListingsSidebar.vue'
  import OffersSidebar from '@/components/profile/OffersSidebar.vue'
  import PortfolioSidebar from '@/components/profile/PortfolioSidebar.vue'
  import CreatedSidebar from '@/components/profile/CreatedSidebar.vue'
  import WatchlistSidebar from '@/components/profile/WatchlistSidebar.vue'
  import FavoritesSidebar from '@/components/profile/FavoritesSidebar.vue'
  import ActivitySidebar from '@/components/profile/ActivitySidebar.vue'
  // Placeholder main area components for each tab
  import GalleriesMain from '@/components/profile/GalleriesMain.vue'
  import NFTsMain from '@/components/profile/NFTsMain.vue'
  import TokensMain from '@/components/profile/TokensMain.vue'
  import ListingsMain from '@/components/profile/ListingsMain.vue'
  import OffersMain from '@/components/profile/OffersMain.vue'
  import PortfolioMain from '@/components/profile/PortfolioMain.vue'
  import CreatedMain from '@/components/profile/CreatedMain.vue'
  import WatchlistMain from '@/components/profile/WatchlistMain.vue'
  import FavoritesMain from '@/components/profile/FavoritesMain.vue'
  import ActivityMain from '@/components/profile/ActivityMain.vue'

  const activeTab = ref('Galleries')

  const tabComponent = computed(() => {
    switch (activeTab.value) {
      case 'Galleries':
        return GalleriesMain
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
      case 'Watchlist':
        return WatchlistMain
      case 'Favorites':
        return FavoritesMain
      case 'Activity':
        return ActivityMain
      default:
        return GalleriesMain
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
      case 'Watchlist':
        return WatchlistSidebar
      case 'Favorites':
        return FavoritesSidebar
      case 'Activity':
        return ActivitySidebar
      default:
        return NFTsSidebar
    }
  })
</script>
