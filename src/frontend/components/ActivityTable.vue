<template>
  <div class="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-900">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-800">
          <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-bold text-left select-none">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900 transition">
          <!-- Event -->
          <td class="px-4 py-2 flex items-center gap-2">
            <UIcon :name="row.eventIcon" class="text-lg" />
            <span>{{ row.eventType }}</span>
          </td>
          <!-- Item -->
          <td class="px-4 py-2 flex items-center gap-2 min-w-[180px]">
            <img :src="row.itemAvatar" alt="avatar" class="w-8 h-8 rounded border" />
            <div class="min-w-0">
              <div class="font-bold truncate">{{ row.itemName }}</div>
              <div class="flex items-center gap-1 text-xs text-gray-500">
                {{ row.collectionName }}
                <UIcon v-if="row.verified" name="material-symbols:verified" class="text-primary-500 text-xs" />
              </div>
            </div>
          </td>
          <!-- Price -->
          <td class="px-4 py-2 font-mono">{{ row.price }}</td>
          <!-- Rarity -->
          <td class="px-4 py-2">{{ row.rarity }}</td>
          <!-- Qty -->
          <td class="px-4 py-2">{{ row.qty }}</td>
          <!-- From -->
          <td class="px-4 py-2 font-mono">{{ row.from }}</td>
          <!-- To -->
          <td class="px-4 py-2 font-mono">{{ row.to }}</td>
          <!-- Time -->
          <td class="px-4 py-2 flex items-center gap-1">
            <span>{{ row.time }}</span>
            <a href="#" target="_blank"><UIcon name="i-heroicons-arrow-top-right-on-square-20-solid" class="text-xs" /></a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
const columns = [
  { key: 'event', label: 'Event' },
  { key: 'item', label: 'Item' },
  { key: 'price', label: 'Price' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'qty', label: 'Qty' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'time', label: 'Time' }
]
const rows = [
  {
    id: 1,
    eventIcon: 'i-heroicons-currency-dollar-solid', eventType: 'Sale',
    itemAvatar: 'https://placehold.co/40x40', itemName: 'Penguin #1234', collectionName: 'Pudgy Penguins', verified: true,
    price: '4.20 ETH', rarity: '#1,234', qty: 1, from: '0xA1...B2', to: '0xC3...D4', time: '13s ago'
  },
  {
    id: 2,
    eventIcon: 'i-heroicons-currency-dollar-solid', eventType: 'Sale',
    itemAvatar: 'https://placehold.co/40x40', itemName: 'Punk #5678', collectionName: 'CryptoPunks', verified: true,
    price: '55.00 ETH', rarity: '#5,678', qty: 1, from: '0xE5...F6', to: '0xG7...H8', time: '2m ago'
  },
  {
    id: 3,
    eventIcon: 'i-heroicons-currency-dollar-solid', eventType: 'Sale',
    itemAvatar: 'https://placehold.co/40x40', itemName: 'Fidenza #42', collectionName: 'Fidenza by Tyler Hobbs', verified: false,
    price: '120.00 ETH', rarity: '#42', qty: 1, from: '0xI9...J0', to: '0xK1...L2', time: '5m ago'
  },
  {
    id: 4,
    eventIcon: 'i-heroicons-currency-dollar-solid', eventType: 'Sale',
    itemAvatar: 'https://placehold.co/40x40', itemName: 'Doodle #99', collectionName: 'Doodles', verified: false,
    price: '2.50 ETH', rarity: '#99', qty: 1, from: '0xM3...N4', to: '0xO5...P6', time: '10m ago'
  }
]
</script> 