<template>
  <div class="flex flex-col h-full w-full p-4">
    <div v-if="collections.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No results found</div>
      <div class="text-gray-400 mb-4">No watchlist collections found. Add some to your watchlist.</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Clear filters</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900">
            <th class="p-2 text-left">Collection</th>
            <th class="p-2 text-right">Floor Price</th>
            <th class="p-2 text-right">Top Offer</th>
            <th class="p-2 text-right">Vol</th>
            <th class="p-2 text-right">Sales</th>
            <th class="p-2 text-right">Owners</th>
            <th class="p-2 text-right">Supply</th>
            <th class="p-2 text-right">Last 7D</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="col in collections" :key="col.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2 flex items-center gap-2">
              <img :src="col.logo" alt="Collection" class="w-8 h-8 rounded-full border" />
              <span class="font-semibold">{{ col.name }}</span>
            </td>
            <td class="p-2 text-right">{{ col.floorPrice }}</td>
            <td class="p-2 text-right">{{ col.topOffer }}</td>
            <td class="p-2 text-right">{{ col.vol }}</td>
            <td class="p-2 text-right">{{ col.sales }}</td>
            <td class="p-2 text-right">{{ col.owners }}</td>
            <td class="p-2 text-right">{{ col.supply }}</td>
            <td class="p-2 text-right">{{ col.last7d }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const collections = [
  {
    id: 1,
    name: 'CryptoPunks',
    logo: 'https://placehold.co/32x32?text=CP',
    floorPrice: '2.1 ETH',
    topOffer: '2.3 ETH',
    vol: '1.3M ETH',
    sales: 24000,
    owners: 3843,
    supply: 9994,
    last7d: '+5%'
  },
  {
    id: 2,
    name: 'Bored Ape Yacht Club',
    logo: 'https://placehold.co/32x32?text=BAYC',
    floorPrice: '7.5 ETH',
    topOffer: '7.8 ETH',
    vol: '1.1M ETH',
    sales: 122472,
    owners: 11866,
    supply: 10000,
    last7d: '-2%'
  }
]
</script> 