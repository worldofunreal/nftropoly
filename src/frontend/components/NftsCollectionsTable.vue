<template>
  <div class="overflow-x-auto rounded-xl shadow bg-gray-900">
    <table class="min-w-full text-sm text-gray-200">
      <thead>
        <tr class="border-b border-gray-800">
          <th v-for="col in columns" :key="col.key" class="px-4 py-3 font-bold text-left select-none">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-b border-gray-800 hover:bg-gray-800 transition">
          <!-- Collection -->
          <td class="px-4 py-2 flex items-center gap-2 min-w-[200px]">
            <button class="text-yellow-400"><UIcon name="i-heroicons-star-20-solid" /></button>
            <img :src="row.avatar" alt="avatar" class="w-8 h-8 rounded border" />
            <div class="min-w-0">
              <div class="flex items-center gap-1 font-bold truncate">
                {{ row.name }}
                <UIcon v-if="row.verified" name="material-symbols:verified" class="text-primary-500 text-xs" />
                <span v-if="row.isNew" class="ml-1 bg-green-600 text-white text-2xs font-semibold px-2 py-0.5 rounded-full">NEW</span>
              </div>
            </div>
          </td>
          <!-- Floor Price -->
          <td class="px-4 py-2 font-mono">{{ row.floorPrice }}</td>
          <!-- 1D Change -->
          <td class="px-4 py-2 font-mono" :class="row.change1d > 0 ? 'text-green-400' : row.change1d < 0 ? 'text-red-400' : 'text-gray-400'">
            {{ row.change1d > 0 ? '+' : '' }}{{ row.change1d }}%
          </td>
          <!-- Top Offer -->
          <td class="px-4 py-2 font-mono">{{ row.topOffer }}</td>
          <!-- 1D Vol -->
          <td class="px-4 py-2 font-mono">{{ row.vol1d }}</td>
          <!-- 1D Sales -->
          <td class="px-4 py-2 font-mono">{{ row.sales1d }}</td>
          <!-- Owners -->
          <td class="px-4 py-2 font-mono">{{ row.owners }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
const columns = [
  { key: 'collection', label: 'Collection' },
  { key: 'floorPrice', label: 'Floor Price' },
  { key: 'change1d', label: '1D Change' },
  { key: 'topOffer', label: 'Top Offer' },
  { key: 'vol1d', label: '1D Vol' },
  { key: 'sales1d', label: '1D Sales' },
  { key: 'owners', label: 'Owners' }
]
const rows = [
  {
    id: 1,
    avatar: 'https://placehold.co/40x40',
    name: 'Pudgy Penguins',
    verified: true,
    isNew: true,
    floorPrice: '16.07 ETH',
    change1d: 4.8,
    topOffer: '15.16 WETH',
    vol1d: '962.41 ETH',
    sales1d: 61,
    owners: 4948
  },
  {
    id: 2,
    avatar: 'https://placehold.co/40x40',
    name: 'CryptoPunks',
    verified: true,
    isNew: false,
    floorPrice: '45.00 ETH',
    change1d: 0.0,
    topOffer: '44.50 WETH',
    vol1d: '1,200.00 ETH',
    sales1d: 12,
    owners: 10000
  },
  {
    id: 3,
    avatar: 'https://placehold.co/40x40',
    name: 'Fidenza by Tyler Hobbs',
    verified: false,
    isNew: false,
    floorPrice: '80.00 ETH',
    change1d: -1.2,
    topOffer: '79.00 WETH',
    vol1d: '500.00 ETH',
    sales1d: 3,
    owners: 300
  },
  {
    id: 4,
    avatar: 'https://placehold.co/40x40',
    name: 'Doodles',
    verified: false,
    isNew: true,
    floorPrice: '2.50 ETH',
    change1d: 2.1,
    topOffer: '2.40 WETH',
    vol1d: '100.00 ETH',
    sales1d: 20,
    owners: 5000
  }
]
</script> 