<template>
  <div class="flex flex-col p-4">
    <div class="flex items-center gap-4 mb-4">
      <select class="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-950">
        <option>Most recent</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
      </select>
    </div>
    <div v-if="listings.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No listings found</div>
      <div class="text-gray-400 mb-4">You currently don't have any listings</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">View your items</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-5xl w-full text-sm">
        <thead>
          <tr class="bg-neutral-800">
            <th class="p-4 text-left font-medium text-gray-300 whitespace-nowrap">Listing</th>
            <th class="p-4 text-left font-medium text-gray-300 whitespace-nowrap">Status</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Price</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Top Offer</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Floor</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Qty</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Total</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Exp</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Time</th>
          </tr>
        </thead>
        <tr class="border-b border-gray-700 h-px"></tr>
        <tbody>
          <tr v-for="listing in listings" :key="listing.id" class="border-b border-gray-800 hover:bg-neutral-900/50 transition-colors">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="listing.image" alt="NFT" class="w-12 h-12 rounded-lg border border-gray-700 flex-shrink-0" />
                <div class="flex flex-col">
                  <span class="font-semibold text-white">{{ listing.name }}</span>
                  <span class="text-sm text-gray-400">#{{ listing.id }}</span>
                </div>
              </div>
            </td>
            <td class="p-4 text-left whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                    :class="{
                      'bg-green-900/20 text-green-400': listing.status === 'Active',
                      'bg-neutral-900/20 text-gray-400': listing.status === 'Inactive'
                    }">
                {{ listing.status }}
              </span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="font-medium text-white">{{ listing.price }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-green-400">{{ listing.topOffer }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ listing.floor }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ listing.qty }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="font-medium text-white">{{ listing.total }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-400 text-sm">{{ listing.exp }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-400 text-sm">{{ listing.time }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const listings = [
  {
    id: 1,
    name: 'CryptoPunk #1234',
    image: 'https://placehold.co/40x40?text=NFT',
    status: 'Active',
    price: '2.5 ETH',
    topOffer: '2.3 ETH',
    floor: '2.1 ETH',
    qty: 1,
    total: '2.5 ETH',
    exp: '2d',
    time: '2024-06-01'
  },
  {
    id: 2,
    name: 'Bored Ape #5678',
    image: 'https://placehold.co/40x40?text=NFT',
    status: 'Inactive',
    price: '8.0 ETH',
    topOffer: '7.8 ETH',
    floor: '7.5 ETH',
    qty: 1,
    total: '8.0 ETH',
    exp: '5d',
    time: '2024-05-20'
  }
]
</script> 