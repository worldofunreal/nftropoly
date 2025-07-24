<template>
  <div class="flex flex-col h-full w-full p-4">
    <div v-if="nfts.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=NFT" alt="NFT" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No favorites found</div>
      <div class="text-gray-400 mb-4">Discover new items on OS2</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Go to Discover</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900">
            <th class="p-2">♥</th>
            <th class="p-2 text-left">Item</th>
            <th class="p-2 text-right">Rarity</th>
            <th class="p-2 text-right">Price</th>
            <th class="p-2 text-right">Top Offer</th>
            <th class="p-2 text-right">Last Sale</th>
            <th class="p-2 text-right">Owner</th>
            <th class="p-2 text-right">Listed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nft in nfts" :key="nft.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2 text-center"><input type="checkbox" /></td>
            <td class="p-2 flex items-center gap-2">
              <img :src="nft.image" alt="NFT" class="w-10 h-10 rounded border" />
              <span class="font-semibold">{{ nft.name }}</span>
            </td>
            <td class="p-2 text-right">{{ nft.rarity }}</td>
            <td class="p-2 text-right">{{ nft.price }}</td>
            <td class="p-2 text-right">{{ nft.topOffer }}</td>
            <td class="p-2 text-right">{{ nft.lastSale }}</td>
            <td class="p-2 text-right">{{ nft.owner }}</td>
            <td class="p-2 text-right">{{ nft.listed }}</td>
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
    rarity: 'Rare',
    price: '2.5 ETH',
    topOffer: '2.3 ETH',
    lastSale: '2.2 ETH',
    owner: '0x123...abcd',
    listed: 'Yes'
  },
  {
    id: 2,
    name: 'Bored Ape #5678',
    image: 'https://placehold.co/40x40?text=NFT',
    rarity: 'Epic',
    price: '8.0 ETH',
    topOffer: '7.8 ETH',
    lastSale: '7.7 ETH',
    owner: '0x456...efgh',
    listed: 'No'
  }
]
</script> 