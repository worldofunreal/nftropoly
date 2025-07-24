<template>
  <div class="flex flex-col h-full w-full p-4">
    <div class="flex items-center gap-4 mb-4">
      <select class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
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
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-950">
            <th class="p-2"><input type="checkbox" /></th>
            <th class="p-2 text-left">Listing</th>
            <th class="p-2 text-left">Status</th>
            <th class="p-2 text-right">Price</th>
            <th class="p-2 text-right">Top Offer</th>
            <th class="p-2 text-right">Floor</th>
            <th class="p-2 text-right">Qty</th>
            <th class="p-2 text-right">Total</th>
            <th class="p-2 text-right">Exp</th>
            <th class="p-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="listing in listings" :key="listing.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2"><input type="checkbox" /></td>
            <td class="p-2 flex items-center gap-2">
              <img :src="listing.image" alt="NFT" class="w-10 h-10 rounded border" />
              <span class="font-semibold">{{ listing.name }}</span>
            </td>
            <td class="p-2 text-left">{{ listing.status }}</td>
            <td class="p-2 text-right">{{ listing.price }}</td>
            <td class="p-2 text-right">{{ listing.topOffer }}</td>
            <td class="p-2 text-right">{{ listing.floor }}</td>
            <td class="p-2 text-right">{{ listing.qty }}</td>
            <td class="p-2 text-right">{{ listing.total }}</td>
            <td class="p-2 text-right">{{ listing.exp }}</td>
            <td class="p-2 text-right">{{ listing.time }}</td>
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