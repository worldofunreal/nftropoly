<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Listings</h1>
            <p class="mt-2 text-gray-600">Manage your NFT listings on the marketplace</p>
          </div>
          <UButton
            to="/marketplace/create"
            icon="i-heroicons-plus"
            size="lg"
          >
            Create Listing
          </UButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ userActiveAsks.length }}</div>
              <div class="text-sm text-gray-500">Active Listings</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-gray-100 rounded-lg">
              <UIcon name="i-heroicons-x-circle" class="w-6 h-6 text-gray-600" />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ userClosedAsks.length }}</div>
              <div class="text-sm text-gray-500">Closed Listings</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <UIcon name="i-heroicons-users" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalParticipants }}</div>
              <div class="text-sm text-gray-500">Total Bidders</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalVolume }}</div>
              <div class="text-sm text-gray-500">Total Volume</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 px-1 border-b-2 font-medium text-sm"
              :class="activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              {{ tab.name }}
              <span class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {{ getTabCount(tab.id) }}
              </span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Loading State -->
          <div v-if="userAsksLoading" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-gray-50 rounded-lg p-6 animate-pulse"
            >
              <div class="flex space-x-4">
                <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
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
          <div v-else-if="userAsksError" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load listings</h3>
            <p class="text-gray-600 mb-4">{{ userAsksError }}</p>
            <UButton @click="loadUserAsks" variant="outline">
              Try Again
            </UButton>
          </div>

          <!-- Empty State -->
          <div v-else-if="getTabAsks().length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No {{ getTabName() }} listings</h3>
            <p class="text-gray-600 mb-4">
              {{ getEmptyMessage() }}
            </p>
            <UButton
              v-if="activeTab === 'active'"
              to="/marketplace/create"
              icon="i-heroicons-plus"
            >
              Create First Listing
            </UButton>
          </div>

          <!-- Listings -->
          <div v-else class="space-y-4">
            <div
              v-for="ask in getTabAsks()"
              :key="ask.ask_id.toString()"
              class="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      NFT #{{ ask.ask_id.toString() }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ getStatusText(ask.status) }} • {{ ask.participants.length }} participants
                    </p>
                    <p class="text-sm text-gray-500">
                      Listed {{ formatTimestamp(ask.ask_id) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <div class="text-lg font-semibold text-gray-900">
                      {{ formatPrice(ask) }}
                    </div>
                    <div class="text-sm text-gray-500">NTRP</div>
                  </div>
                  
                  <div class="flex space-x-2">
                    <UButton
                      :to="`/marketplace/${ask.ask_id.toString()}`"
                      variant="outline"
                      size="sm"
                    >
                      View
                    </UButton>
                    
                    <UButton
                      v-if="canEndAsk(ask)"
                      @click="handleEndAsk(ask)"
                      color="red"
                      variant="outline"
                      size="sm"
                      :loading="endingAsks.has(ask.ask_id.toString())"
                    >
                      End
                    </UButton>
                    
                    <UButton
                      v-if="canDistribute(ask)"
                      @click="handleDistribute(ask)"
                      color="green"
                      variant="outline"
                      size="sm"
                      :loading="distributingAsks.has(ask.ask_id.toString())"
                    >
                      Distribute
                    </UButton>
                  </div>
                </div>
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
import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
import { 
  getAskStatusText, 
  formatTokenAmount, 
  formatTimestamp,
  getBuyNowPrice
} from '~/utils/marketplace'

// Meta
definePageMeta({
  title: 'My Listings',
  description: 'Manage your NFT listings on the marketplace',
  middleware: 'auth'
})

// Composables
const marketplace = useMarketplace()
const authStore = useAuthStore()

// State
const activeTab = ref('active')
const endingAsks = ref(new Set<string>())
const distributingAsks = ref(new Set<string>())

const tabs = [
  { id: 'active', name: 'Active' },
  { id: 'closed', name: 'Closed' },
  { id: 'all', name: 'All' }
]

// Computed
const isAuthenticated = computed(() => marketplace.isAuthenticated.value)
const userAsks = computed(() => marketplace.userAsks.value)
const userAsksLoading = computed(() => marketplace.userAsksLoading.value)
const userAsksError = computed(() => marketplace.userAsksError.value)
const userActiveAsks = computed(() => marketplace.userActiveAsks.value)
const userClosedAsks = computed(() => marketplace.userClosedAsks.value)

const totalParticipants = computed(() => {
  return userAsks.value.reduce((total, ask) => total + ask.participants.length, 0)
})

const totalVolume = computed(() => {
  return userAsks.value.reduce((total, ask) => {
    const price = getBuyNowPrice(ask.config)
    return total + (price ? Number(price) : 0)
  }, 0)
})

// Methods
const loadUserAsks = async () => {
  try {
    await marketplace.loadUserAsks()
  } catch (error) {
    console.error('Failed to load user asks:', error)
  }
}

const getTabCount = (tabId: string) => {
  switch (tabId) {
    case 'active':
      return userActiveAsks.value.length
    case 'closed':
      return userClosedAsks.value.length
    case 'all':
      return userAsks.value.length
    default:
      return 0
  }
}

const getTabAsks = () => {
  switch (activeTab.value) {
    case 'active':
      return userActiveAsks.value
    case 'closed':
      return userClosedAsks.value
    case 'all':
      return userAsks.value
    default:
      return []
  }
}

const getTabName = () => {
  return tabs.find(tab => tab.id === activeTab.value)?.name || 'listings'
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'active':
      return 'You don\'t have any active listings. Create one to get started!'
    case 'closed':
      return 'You don\'t have any closed listings yet.'
    case 'all':
      return 'You haven\'t created any listings yet.'
    default:
      return 'No listings found.'
  }
}

const handleEndAsk = async (ask: AskStatus) => {
  try {
    endingAsks.value.add(ask.ask_id.toString())
    
    const result = await marketplace.endAsk(ask.ask_id)
    
    if (result) {
      await loadUserAsks()
    }
  } catch (error) {
    console.error('Failed to end ask:', error)
  } finally {
    endingAsks.value.delete(ask.ask_id.toString())
  }
}

const handleDistribute = async (ask: AskStatus) => {
  try {
    distributingAsks.value.add(ask.ask_id.toString())
    
    const result = await marketplace.distributeAsk(ask.ask_id)
    
    if (result) {
      await loadUserAsks()
    }
  } catch (error) {
    console.error('Failed to distribute ask:', error)
  } finally {
    distributingAsks.value.delete(ask.ask_id.toString())
  }
}

// Helper functions
const getStatusText = (status: any) => getAskStatusText(status)

const formatPrice = (ask: AskStatus) => {
  const price = getBuyNowPrice(ask.config)
  return price ? formatTokenAmount(price, 8) : 'N/A'
}

const canEndAsk = (ask: AskStatus) => {
  return getStatusText(ask.status) === 'Open'
}

const canDistribute = (ask: AskStatus) => {
  return getStatusText(ask.status) === 'Closed'
}

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    loadUserAsks()
  }
})
</script>
