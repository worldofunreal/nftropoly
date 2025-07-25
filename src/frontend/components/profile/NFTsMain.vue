<template>
  <div class="flex flex-col gap-4 p-4 h-full w-full">
    <div class="flex flex-wrap items-center gap-4 border-gray-200 dark:border-gray-800">
      <input type="text" placeholder="Search for items" class="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-950" />
      <select class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-950">
        <option>Recently received</option>
        <option>Recently listed</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
      </select>
      <div class="flex gap-2">
        <button class="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">Grid</button>
        <button class="px-2 py-1 rounded bg-primary-600 text-white">List</button>
        <button class="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">Compact</button>
      </div>
    </div>
    <div v-if="nfts.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No items found</div>
      <div class="text-gray-400 mb-4">Discover new collections on OS2</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Go to Discover</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-neutral-800">
            <th class="p-4 text-left font-medium text-gray-300 whitespace-nowrap">Item</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Listing Price</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Rarity</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Floor Price</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Top Offer</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Cost</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Received</th>
          </tr>
        </thead>
        <tr class="border-b border-gray-700 h-px"></tr>
        <tbody>
          <tr v-for="nft in nfts" :key="nft.id" class="border-b border-gray-800 hover:bg-neutral-900/50 transition-colors">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="nft.image" alt="NFT" class="w-12 h-12 rounded-lg border border-gray-700 flex-shrink-0" />
                <div class="flex flex-col">
                  <span class="font-semibold text-white">{{ nft.name }}</span>
                  <span class="text-sm text-gray-400">#{{ nft.id }}</span>
                </div>
              </div>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="font-medium text-white">{{ nft.listingPrice }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                    :class="{
                      'bg-green-900/20 text-green-400': nft.rarity === 'Rare',
                      'bg-purple-900/20 text-purple-400': nft.rarity === 'Epic',
                      'bg-blue-900/20 text-blue-400': nft.rarity === 'Common'
                    }">
                {{ nft.rarity }}
              </span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ nft.floorPrice }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-green-400">{{ nft.topOffer }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ nft.cost }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-400 text-sm">{{ nft.received }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const nfts = [
  {
    id: 1,
    name: 'CryptoPunk #1234',
    image: 'https://placehold.co/40x40?text=NFT',
    listingPrice: '2.5 ETH',
    rarity: 'Rare',
    floorPrice: '2.1 ETH',
    topOffer: '2.3 ETH',
    cost: '1.8 ETH',
    received: '2024-06-01'
  },
  {
    id: 2,
    name: 'Bored Ape #5678',
    image: 'https://placehold.co/40x40?text=NFT',
    listingPrice: '8.0 ETH',
    rarity: 'Epic',
    floorPrice: '7.5 ETH',
    topOffer: '7.8 ETH',
    cost: '6.9 ETH',
    received: '2024-05-20'
  }
]
</script> 