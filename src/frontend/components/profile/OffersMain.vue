<template>
  <div class="flex flex-col h-full w-full p-4">
    <div class="flex items-center gap-4 mb-4">
      <select class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <option>Most recent</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
      </select>
    </div>
    <div v-if="offers.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No offers found</div>
      <div class="text-gray-400 mb-4">You currently don't have any active or unfunded offers</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">View Trending Collections</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-950">
            <th class="p-2"><input type="checkbox" /></th>
            <th class="p-2 text-left">Offer</th>
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
          <tr v-for="offer in offers" :key="offer.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2"><input type="checkbox" /></td>
            <td class="p-2">{{ offer.name }}</td>
            <td class="p-2 text-left">{{ offer.status }}</td>
            <td class="p-2 text-right">{{ offer.price }}</td>
            <td class="p-2 text-right">{{ offer.topOffer }}</td>
            <td class="p-2 text-right">{{ offer.floor }}</td>
            <td class="p-2 text-right">{{ offer.qty }}</td>
            <td class="p-2 text-right">{{ offer.total }}</td>
            <td class="p-2 text-right">{{ offer.exp }}</td>
            <td class="p-2 text-right">{{ offer.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const offers = [
  {
    id: 1,
    name: 'CryptoPunk #1234',
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
    status: 'Unfunded',
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