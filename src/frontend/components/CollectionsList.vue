<template>
  <div>
    <div class="mb-2 text-sm font-bold">Collections</div>
    <div class="flex flex-col gap-2">
      <div
        v-for="col in collections"
        :key="col.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500 transition cursor-pointer"
      >
        <UIcon :name="col.icon" class="text-2xl" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1 font-semibold truncate">
            <span class="truncate">{{ col.name }}</span>
            <UIcon v-if="col.verified" name="material-symbols:verified" class="text-sky-500 text-xl" />
          </div>
        </div>
        <div class="flex flex-col items-end min-w-[70px]">
          <span class="text-xs font-bold">{{ col.floorPrice }}</span>
          <span :class="col.change >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs">{{ col.change >= 0 ? '+' : '' }}{{ col.change }}%</span>
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
    icon: 'ri:nft-fill',
    floorPrice: '1.2 ICP',
    change: 12.5
  },
  {
    id: 2,
    name: 'Art Blocks',
    verified: true,
    icon: 'mdi:art',
    floorPrice: '3.5 ICP',
    change: -4.2
  },
  {
    id: 3,
    name: 'Music Legends',
    verified: false,
    icon: 'mdi:music',
    floorPrice: '0.7 ICP',
    change: 8.1
  },
  {
    id: 4,
    name: 'Photo Masters',
    verified: true,
    icon: 'mynaui:aperture-solid',
    floorPrice: '2.1 ICP',
    change: 2.3
  },
  {
    id: 5,
    name: 'Crypto Creatures',
    verified: false,
    icon: 'ic:baseline-generating-tokens',
    floorPrice: '0.9 ICP',
    change: 5.7
  },
  {
    id: 6,
    name: 'Rare Faces',
    verified: false,
    icon: 'mdi:face',
    floorPrice: '1.8 ICP',
    change: -1.3
  },
  {
    id: 7,
    name: 'SoundWaves',
    verified: true,
    icon: 'mdi:music',
    floorPrice: '2.7 ICP',
    change: 7.9
  },
  {
    id: 8,
    name: 'Generative Art',
    verified: true,
    icon: 'mdi:art',
    floorPrice: '4.2 ICP',
    change: 10.2
  },
  {
    id: 9,
    name: 'Metaverse Land',
    verified: false,
    icon: 'ri:nft-fill',
    floorPrice: '3.0 ICP',
    change: 3.3
  },
  {
    id: 10,
    name: 'AI Portraits',
    verified: true,
    icon: 'mdi:face',
    floorPrice: '2.2 ICP',
    change: 6.6
  },
  {
    id: 11,
    name: 'Chain Fusion',
    verified: false,
    icon: 'ic:baseline-generating-tokens',
    floorPrice: '1.1 ICP',
    change: 4.4
  },
  {
    id: 12,
    name: 'Pixel Pets',
    verified: true,
    icon: 'ri:nft-fill',
    floorPrice: '0.6 ICP',
    change: 9.9
  },
  {
    id: 13,
    name: 'Artistic Minds',
    verified: false,
    icon: 'mdi:art',
    floorPrice: '2.8 ICP',
    change: -2.2
  },
  {
    id: 14,
    name: 'Photo Drops',
    verified: true,
    icon: 'mynaui:aperture-solid',
    floorPrice: '1.5 ICP',
    change: 1.1
  },
  {
    id: 15,
    name: 'Music Boom',
    verified: false,
    icon: 'mdi:music',
    floorPrice: '0.8 ICP',
    change: 12.0
  }
]
</script> 