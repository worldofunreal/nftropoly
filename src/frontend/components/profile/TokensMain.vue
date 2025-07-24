<template>
  <div class="flex flex-col h-full w-full">
    <div class="flex flex-wrap items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
      <input type="text" placeholder="Search for tokens" class="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" />
      <div class="flex gap-2">
        <button class="px-2 py-1 rounded bg-primary-600 text-white">List</button>
        <button class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-800">Grid</button>
      </div>
    </div>
    <div v-if="tokens.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=Token" alt="Token" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No results found</div>
      <div class="text-gray-400 mb-4">We've been searching the blockchain.</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Go to Discover</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-900">
            <th class="p-2 text-left">Token</th>
            <th class="p-2 text-left">Symbol</th>
            <th class="p-2 text-right">Price</th>
            <th class="p-2 text-right">Market Cap</th>
            <th class="p-2 text-right">24h Change</th>
            <th class="p-2 text-right">Volume</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in tokens" :key="token.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-2 flex items-center gap-2">
              <img :src="token.logo" alt="Token" class="w-8 h-8 rounded-full border" />
              <span class="font-semibold">{{ token.name }}</span>
            </td>
            <td class="p-2 text-left">{{ token.symbol }}</td>
            <td class="p-2 text-right">{{ token.price }}</td>
            <td class="p-2 text-right">{{ token.marketCap }}</td>
            <td class="p-2 text-right" :class="token.change.startsWith('+') ? 'text-green-600' : token.change.startsWith('-') ? 'text-red-600' : ''">{{ token.change }}</td>
            <td class="p-2 text-right">{{ token.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
const tokens = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'https://placehold.co/32x32?text=ETH',
    price: '$3,200',
    marketCap: '$380B',
    change: '+2.1%',
    volume: '$18B'
  },
  {
    id: 2,
    name: 'Solana',
    symbol: 'SOL',
    logo: 'https://placehold.co/32x32?text=SOL',
    price: '$150',
    marketCap: '$65B',
    change: '-1.3%',
    volume: '$2.5B'
  }
]
</script> 