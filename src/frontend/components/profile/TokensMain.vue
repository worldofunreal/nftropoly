<template>
  <div class="flex flex-col gap-4 p-4 w-full">
    <div class="flex flex-wrap items-center gap-4 border-gray-200 dark:border-gray-800">
      <input type="text" placeholder="Search for tokens" class="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-950" />
      <div class="flex gap-2">
        <button class="px-2 py-1 rounded bg-primary-600 text-white">List</button>
        <button class="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">Grid</button>
      </div>
    </div>
    <div v-if="tokens.length === 0" class="flex flex-col items-center justify-center flex-1 py-16">
      <img src="https://placehold.co/96x96?text=Token" alt="Token" class="w-24 h-24 rounded-lg shadow mb-4" />
      <div class="text-xl font-bold mb-2">No results found</div>
      <div class="text-gray-400 mb-4">We've been searching the blockchain.</div>
      <button class="px-4 py-2 rounded bg-primary-600 text-white font-semibold">Go to Discover</button>
    </div>
    <div v-else class="overflow-x-auto flex-1">
      <table class="min-w-5xl w-full text-sm">
        <thead>
          <tr class="bg-neutral-800">
            <th class="p-4 text-left font-medium text-gray-300 whitespace-nowrap">Token</th>
            <th class="p-4 text-left font-medium text-gray-300 whitespace-nowrap">Symbol</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Price</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Market Cap</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">24h Change</th>
            <th class="p-4 text-right font-medium text-gray-300 whitespace-nowrap">Volume</th>
          </tr>
        </thead>
        <tr class="border-b border-gray-700 h-px"></tr>
        <tbody>
          <tr v-for="token in tokens" :key="token.id" class="border-b border-gray-800 hover:bg-neutral-900/50 transition-colors">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <img :src="token.logo" alt="Token" class="w-10 h-10 rounded-full border border-gray-700 flex-shrink-0" />
                <span class="font-semibold text-white">{{ token.name }}</span>
              </div>
            </td>
            <td class="p-4 text-left whitespace-nowrap">
              <span class="text-gray-300">{{ token.symbol }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="font-medium text-white">{{ token.price }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ token.marketCap }}</span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span :class="token.change.startsWith('+') ? 'text-green-400' : token.change.startsWith('-') ? 'text-red-400' : 'text-gray-300'">
                {{ token.change }}
              </span>
            </td>
            <td class="p-4 text-right whitespace-nowrap">
              <span class="text-gray-300">{{ token.volume }}</span>
            </td>
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