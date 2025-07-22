<template>
  <div class="min-h-screen flex flex-row bg-gray-50 dark:bg-gray-950">
    <!-- Left Column (Main Content) -->
    <div class="flex-1 md:w-2/3 max-w-4xl mx-auto py-8 px-2 md:px-6 overflow-y-auto">
      <FilterPills class="mb-6" />
      <DiscoverCarousel class="mb-8" />
      <FeaturedCollections class="mb-8" />
      <TrendingTokens class="mb-8" />
      <FeaturedDrops class="mb-8" />
      <TopMoversToday class="mb-8" />
      <NFT101 class="mb-8" />
    </div>
    <!-- Right Column (Stats/Rankings) -->
    <div class="hidden md:block w-1/3 max-w-sm h-[calc(100vh-64px-48px)] sticky top-16 right-0 overflow-y-auto scrollbar-hide px-2 py-8">
      <RankingFilters class="mb-4" />
      <CollectionsList />
    </div>
  </div>
</template>

<script setup lang="ts">
// Stub components for layout
import FilterPills from '@/components/FilterPills.vue'
import DiscoverCarousel from '@/components/DiscoverCarousel.vue'
import FeaturedCollections from '@/components/FeaturedCollections.vue'
import TrendingTokens from '@/components/TrendingTokens.vue'
import FeaturedDrops from '@/components/FeaturedDrops.vue'
import TopMoversToday from '@/components/TopMoversToday.vue'
import NFT101 from '@/components/NFT101.vue'
import RankingFilters from '@/components/RankingFilters.vue'
import CollectionsList from '@/components/CollectionsList.vue'
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