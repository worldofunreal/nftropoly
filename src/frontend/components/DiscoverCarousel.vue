<template>
  <div class="relative w-full overflow-x-auto scrollbar-hide" style="scroll-snap-type: x mandatory; scroll-behavior: smooth;">
    <div class="flex gap-6 min-w-full">
      <div
        v-for="col in collections"
        :key="col.id"
        class="w-full flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl shadow p-4 flex flex-col gap-3"
        style="scroll-snap-align: start; min-width: 100%; max-width: 100%;"
      >
        <!-- Media -->
        <div class="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden mb-2">
          <img :src="col.image" :alt="col.name" class="object-cover w-full h-full" />
        </div>
        <!-- Collection Name + Verified -->
        <div class="flex items-center gap-2 text-lg font-bold">
          <span>{{ col.name }}</span>
          <UIcon v-if="col.verified" name="material-symbols:verified" class="text-primary-500 text-base" />
        </div>
        <!-- Creator Name -->
        <div class="text-xs text-gray-500 mb-2">By {{ col.creator }}</div>
        <!-- Info Table -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-gray-50 dark:bg-gray-800 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.floorPrice }}</span>
            <span class="text-gray-400">Floor</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.items }}</span>
            <span class="text-gray-400">Items</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.volume }}</span>
            <span class="text-gray-400">Volume</span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.listedPct }}%</span>
            <span class="text-gray-400">Listed</span>
          </div>
        </div>
        <!-- Minting Info Table -->
        <div class="grid grid-cols-3 gap-2 text-xs mt-2">
          <div class="bg-primary-50 dark:bg-primary-950 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.mintStatus }}</span>
            <span class="text-gray-400">Status</span>
          </div>
          <div class="bg-primary-50 dark:bg-primary-950 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.mintPrice }}</span>
            <span class="text-gray-400">Mint</span>
          </div>
          <div class="bg-primary-50 dark:bg-primary-950 rounded p-2 flex flex-col items-center">
            <span class="font-semibold">{{ col.mintTotal }}</span>
            <span class="text-gray-400">Total</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const collections = [
  {
    id: 1,
    name: 'Pixel Punks',
    verified: true,
    creator: 'Team Alpha',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    floorPrice: '1.2 ICP',
    items: 1000,
    volume: '12K ICP',
    listedPct: 15,
    mintStatus: 'Open',
    mintPrice: '0.8 ICP',
    mintTotal: 2000
  },
  {
    id: 2,
    name: 'Art Blocks',
    verified: true,
    creator: 'Art Collective',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    floorPrice: '3.5 ICP',
    items: 500,
    volume: '8K ICP',
    listedPct: 22,
    mintStatus: 'Closed',
    mintPrice: '3 ICP',
    mintTotal: 500
  },
  {
    id: 3,
    name: 'Music Legends',
    verified: false,
    creator: 'SoundWave',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    floorPrice: '0.7 ICP',
    items: 200,
    volume: '1.2K ICP',
    listedPct: 10,
    mintStatus: 'Open',
    mintPrice: '0.5 ICP',
    mintTotal: 300
  }
]
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.aspect-w-16 {
  aspect-ratio: 16/9;
}
</style> 