<template>
  <div class="flex flex-col h-full w-full items-center justify-center">
    <div v-if="galleries.length === 0" class="flex flex-col items-center justify-center h-full w-full">
      <div class="mb-4">
        <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow" />
      </div>
      <div class="text-xl font-bold mb-2">Feature your favorites</div>
      <div class="text-gray-400 mb-4 text-center">Showcase your favorite NFTs with our new galleries section. This tab is publicly hidden until you add sections.</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Create a gallery</button>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full p-4">
      <div v-for="gallery in galleries" :key="gallery.id" class="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col">
        <div class="flex gap-2 mb-2">
          <img v-for="img in gallery.images" :key="img" :src="img" alt="Preview" class="w-12 h-12 rounded object-cover border" />
        </div>
        <div class="font-bold text-lg mb-1">{{ gallery.name }}</div>
        <div class="flex gap-2 mt-2">
          <button class="px-3 py-1 rounded bg-primary-600 text-white text-xs">View</button>
          <button class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-xs">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const galleries = [
  // Uncomment to test empty state: []
  {
    id: 1,
    name: 'CryptoPunks Collection',
    images: [
      'https://placehold.co/48x48?text=NFT',
      'https://placehold.co/48x48?text=NFT',
      'https://placehold.co/48x48?text=NFT'
    ]
  },
  {
    id: 2,
    name: 'Art Blocks',
    images: [
      'https://placehold.co/48x48?text=NFT',
      'https://placehold.co/48x48?text=NFT'
    ]
  }
]
</script> 