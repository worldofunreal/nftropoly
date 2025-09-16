<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Escrow & Settlements</h1>
            <p class="mt-2 text-gray-600">Manage your escrowed assets and settlements</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Balance Tabs -->
      <BalanceTabs
        v-model:active-tab="activeTab"
        :loading="loading"
        :balances="balances"
        @tab-change="handleTabChange"
      />

      <!-- Content -->
      <div class="mt-6">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
          >
            <div class="flex space-x-4">
              <div class="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div class="w-32 space-y-2">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-600 mb-4">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load balances</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <UButton @click="loadBalances" variant="outline">
            Try Again
          </UButton>
        </div>

        <!-- Empty State -->
        <div v-else-if="getTabData().length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No {{ getTabName() }} found</h3>
          <p class="text-gray-600 mb-4">
            {{ getEmptyMessage() }}
          </p>
        </div>

        <!-- Data Tables -->
        <div v-else class="space-y-6">
          <!-- Escrow Table -->
          <EscrowTable
            v-if="activeTab === 'escrow'"
            :records="getTabData()"
            :loading="loading"
            @withdraw="handleWithdraw"
          />

          <!-- Settlement Table -->
          <SettlementTable
            v-if="activeTab === 'settlements'"
            :records="getTabData()"
            :loading="loading"
            @withdraw="handleWithdrawSettlement"
          />

          <!-- Offers Table -->
          <div v-if="activeTab === 'offers'" class="bg-white rounded-lg shadow-sm border">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Offers</h3>
              <div class="text-center py-8 text-gray-500">
                Offers functionality coming soon
              </div>
            </div>
          </div>

          <!-- NFTs Table -->
          <div v-if="activeTab === 'nfts'" class="bg-white rounded-lg shadow-sm border">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">NFTs</h3>
              <div class="text-center py-8 text-gray-500">
                NFT balances functionality coming soon
              </div>
            </div>
          </div>

          <!-- Tokens Table -->
          <div v-if="activeTab === 'tokens'" class="bg-white rounded-lg shadow-sm border">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Tokens</h3>
              <div class="text-center py-8 text-gray-500">
                Token balances functionality coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMarketplace } from '~/composables/useMarketplace'
import { useAuthStore } from '~/stores/auth'
import type { BalanceResult, EscrowRecord } from '../../declarations/marketplace/marketplace.did'
import { createAccount } from '~/utils/marketplace'

// Meta
definePageMeta({
  title: 'Escrow & Settlements',
  description: 'Manage your escrowed assets and settlements',
  middleware: 'auth'
})

// Composables
const marketplace = useMarketplace()
const authStore = useAuthStore()

// State
const activeTab = ref('escrow')
const loading = ref(false)
const error = ref<string | null>(null)
const balances = ref<BalanceResult[]>([])

const tabs = [
  { id: 'escrow', name: 'Escrow', count: 0 },
  { id: 'settlements', name: 'Settlements', count: 0 },
  { id: 'offers', name: 'Offers', count: 0 },
  { id: 'nfts', name: 'NFTs', count: 0 },
  { id: 'tokens', name: 'Tokens', count: 0 }
]

// Computed
const isAuthenticated = computed(() => marketplace.isAuthenticated.value)
const currentUser = computed(() => marketplace.currentUser.value)

// Methods
const loadBalances = async () => {
  if (!isAuthenticated.value || !currentUser.value) return
  
  try {
    loading.value = true
    error.value = null
    
    const account = createAccount(currentUser.value)
    const requests = [
      { Escrow: [] },
      { AskSettlements: [] },
      { Offers: [] },
      { Nfts: [] },
      { Tokens: null }
    ]
    
    await marketplace.loadBalances(account, requests)
    balances.value = marketplace.getBalanceForAccount(`${currentUser.value}-`)
  } catch (err) {
    console.error('Failed to load balances:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load balances'
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

const getTabData = () => {
  const balance = balances.value.find(b => {
    switch (activeTab.value) {
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
  
  if (!balance) return []
  
  switch (activeTab.value) {
    case 'escrow':
      return 'Escrow' in balance ? balance.Escrow.records : []
    case 'settlements':
      return 'AskSettlements' in balance ? balance.AskSettlements.records : []
    case 'offers':
      return 'Offers' in balance ? balance.Offers.records : []
    case 'nfts':
      return 'Nfts' in balance && balance.Nfts[0] ? balance.Nfts[0].records : []
    case 'tokens':
      return 'Tokens' in balance && balance.Tokens[0] ? [{ amount: balance.Tokens[0] }] : []
    default:
      return []
  }
}

const getTabName = () => {
  return tabs.find(tab => tab.id === activeTab.value)?.name || 'items'
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'escrow':
      return 'You don\'t have any escrowed assets.'
    case 'settlements':
      return 'You don\'t have any pending settlements.'
    case 'offers':
      return 'You don\'t have any offers.'
    case 'nfts':
      return 'You don\'t have any NFTs in escrow.'
    case 'tokens':
      return 'You don\'t have any tokens in escrow.'
    default:
      return 'No items found.'
  }
}

const handleWithdraw = async (record: EscrowRecord) => {
  try {
    const result = await marketplace.withdrawEscrow(record)
    if (result) {
      await loadBalances()
    }
  } catch (error) {
    console.error('Failed to withdraw escrow:', error)
  }
}

const handleWithdrawSettlement = async (record: EscrowRecord) => {
  try {
    const result = await marketplace.withdrawSettlement(record)
    if (result) {
      await loadBalances()
    }
  } catch (error) {
    console.error('Failed to withdraw settlement:', error)
  }
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    loadBalances()
  }
})
</script>
