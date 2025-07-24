<template>
  <div class="flex flex-col h-full w-full p-4">
    <div v-if="activities.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No results found</div>
      <div class="text-gray-400 mb-4">Try removing some filters to view more results</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Clear filters</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900">
            <th class="p-2 text-left">Event</th>
            <th class="p-2 text-left">Item</th>
            <th class="p-2 text-right">Price</th>
            <th class="p-2 text-right">Rarity</th>
            <th class="p-2 text-right">Qty</th>
            <th class="p-2 text-right">From</th>
            <th class="p-2 text-right">To</th>
            <th class="p-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="act in activities" :key="act.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2 text-left">{{ act.event }}</td>
            <td class="p-2 flex items-center gap-2">
              <img :src="act.image" alt="NFT" class="w-10 h-10 rounded border" />
              <span class="font-semibold">{{ act.name }}</span>
            </td>
            <td class="p-2 text-right">{{ act.price }}</td>
            <td class="p-2 text-right">{{ act.rarity }}</td>
            <td class="p-2 text-right">{{ act.qty }}</td>
            <td class="p-2 text-right">{{ act.from }}</td>
            <td class="p-2 text-right">{{ act.to }}</td>
            <td class="p-2 text-right">{{ act.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const activities = [
  {
    id: 1,
    event: 'Sale',
    name: 'CryptoPunk #1234',
    image: 'https://placehold.co/40x40?text=NFT',
    price: '2.5 ETH',
    rarity: 'Rare',
    qty: 1,
    from: '0x123...abcd',
    to: '0x456...efgh',
    time: '2024-06-01 12:00'
  },
  {
    id: 2,
    event: 'Mint',
    name: 'Bored Ape #5678',
    image: 'https://placehold.co/40x40?text=NFT',
    price: '0 ETH',
    rarity: 'Epic',
    qty: 1,
    from: '0x000...0000',
    to: '0x456...efgh',
    time: '2024-05-20 09:30'
  }
]
</script> 