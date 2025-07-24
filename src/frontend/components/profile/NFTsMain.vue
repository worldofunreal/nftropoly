<template>
  <div class="flex flex-col h-full w-full">
    <div class="flex flex-wrap items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
      <input type="text" placeholder="Search for items" class="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
      <select class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <option>Recently received</option>
        <option>Recently listed</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
      </select>
      <div class="flex gap-2">
        <button class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">Grid</button>
        <button class="px-2 py-1 rounded bg-primary-600 text-white">List</button>
        <button class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">Compact</button>
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
          <tr class="bg-gray-100 dark:bg-gray-900">
            <th class="p-2"><input type="checkbox" /></th>
            <th class="p-2 text-left">Item</th>
            <th class="p-2 text-right">Listing Price</th>
            <th class="p-2 text-right">Rarity</th>
            <th class="p-2 text-right">Floor Price</th>
            <th class="p-2 text-right">Top Offer</th>
            <th class="p-2 text-right">Cost</th>
            <th class="p-2 text-right">Received</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nft in nfts" :key="nft.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2"><input type="checkbox" /></td>
            <td class="p-2 flex items-center gap-2">
              <img :src="nft.image" alt="NFT" class="w-10 h-10 rounded border" />
              <span class="font-semibold">{{ nft.name }}</span>
            </td>
            <td class="p-2 text-right">{{ nft.listingPrice }}</td>
            <td class="p-2 text-right">{{ nft.rarity }}</td>
            <td class="p-2 text-right">{{ nft.floorPrice }}</td>
            <td class="p-2 text-right">{{ nft.topOffer }}</td>
            <td class="p-2 text-right">{{ nft.cost }}</td>
            <td class="p-2 text-right">{{ nft.received }}</td>
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