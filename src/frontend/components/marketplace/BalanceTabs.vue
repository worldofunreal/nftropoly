<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 px-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="py-4 px-1 border-b-2 font-medium text-sm"
          :class="
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          "
          @click="$emit('tab-change', tab.id)"
        >
          {{ tab.name }}
          <span
            class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs"
          >
            {{ getTabCount(tab.id) }}
          </span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { BalanceResult } from '../../declarations/marketplace/marketplace.did'

  interface Props {
    activeTab: string
    loading?: boolean
    balances: BalanceResult[]
  }

  const props = defineProps<Props>()
  defineEmits<{
    'tab-change': [tabId: string]
  }>()

  const tabs = [
    { id: 'escrow', name: 'Escrow' },
    { id: 'settlements', name: 'Settlements' },
    { id: 'offers', name: 'Offers' },
    { id: 'nfts', name: 'NFTs' },
    { id: 'tokens', name: 'Tokens' },
  ]

  const getTabCount = (tabId: string) => {
    const balance = props.balances.find(b => {
      switch (tabId) {
        case 'escrow':
          return 'Escrow' in b
        case 'settlements':
          return 'AskSettlements' in b
        case 'offers':
          return 'Offers' in b
        case 'nfts':
          return 'Nfts' in b
        case 'tokens':
          return 'Tokens' in b
        default:
          return false
      }
    })

    if (!balance) return 0

    switch (tabId) {
      case 'escrow':
        return 'Escrow' in balance ? balance.Escrow.records.length : 0
      case 'settlements':
        return 'AskSettlements' in balance
          ? balance.AskSettlements.records.length
          : 0
      case 'offers':
        return 'Offers' in balance ? balance.Offers.records.length : 0
      case 'nfts':
        return 'Nfts' in balance && balance.Nfts[0]
          ? balance.Nfts[0].records.length
          : 0
      case 'tokens':
        return 'Tokens' in balance && balance.Tokens[0] ? 1 : 0
      default:
        return 0
    }
  }
</script>
