<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Bids</h1>
            <p class="mt-2 text-gray-600">
              Track your bids and purchases on the marketplace
            </p>
          </div>
          <UButton
            to="/marketplace"
            icon="i-heroicons-arrow-left"
            variant="outline"
            size="lg"
          >
            Browse Listings
          </UButton>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <UIcon
                name="i-heroicons-hand-raised"
                class="w-6 h-6 text-blue-600"
              />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ userActiveBids.length }}
              </div>
              <div class="text-sm text-gray-500">Active Bids</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <UIcon
                name="i-heroicons-check-circle"
                class="w-6 h-6 text-green-600"
              />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ successfulBids.length }}
              </div>
              <div class="text-sm text-gray-500">Won Auctions</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-gray-100 rounded-lg">
              <UIcon
                name="i-heroicons-x-circle"
                class="w-6 h-6 text-gray-600"
              />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ outbidBids.length }}
              </div>
              <div class="text-sm text-gray-500">Outbid</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <UIcon
                name="i-heroicons-currency-dollar"
                class="w-6 h-6 text-yellow-600"
              />
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">
                {{ totalBidAmount }}
              </div>
              <div class="text-sm text-gray-500">Total Bid Amount</div>
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
              class="py-4 px-1 border-b-2 font-medium text-sm"
              :class="
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="activeTab = tab.id"
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

        <div class="p-6">
          <!-- Loading State -->
          <div v-if="userBidsLoading" class="space-y-4">
            <div
              v-for="i in 3"
              :key="i"
              class="bg-gray-50 rounded-lg p-6 animate-pulse"
            >
              <div class="flex space-x-4">
                <div class="w-20 h-20 bg-gray-200 rounded-lg" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-3/4" />
                  <div class="h-3 bg-gray-200 rounded w-1/2" />
                  <div class="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div class="w-32 space-y-2">
                  <div class="h-4 bg-gray-200 rounded" />
                  <div class="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="userBidsError" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-12 h-12 mx-auto"
              />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Failed to load bids
            </h3>
            <p class="text-gray-600 mb-4">{{ userBidsError }}</p>
            <UButton variant="outline" @click="loadUserBids">
              Try Again
            </UButton>
          </div>

          <!-- Empty State -->
          <div v-else-if="getTabBids().length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <UIcon name="i-heroicons-hand-raised" class="w-12 h-12 mx-auto" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No {{ getTabName() }} bids
            </h3>
            <p class="text-gray-600 mb-4">
              {{ getEmptyMessage() }}
            </p>
            <UButton to="/marketplace" icon="i-heroicons-arrow-right">
              Browse Listings
            </UButton>
          </div>

          <!-- Bids -->
          <div v-else class="space-y-4">
            <div
              v-for="bid in getTabBids()"
              :key="bid.ask_id.toString()"
              class="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-photo"
                      class="w-8 h-8 text-gray-400"
                    />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      NFT #{{ bid.ask_id.toString() }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      {{ getStatusText(bid.status) }} •
                      {{ bid.participants.length }} participants
                    </p>
                    <p class="text-sm text-gray-500">
                      Bid placed {{ formatTimestamp(bid.ask_id) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <div class="text-lg font-semibold text-gray-900">
                      {{ formatPrice(bid) }}
                    </div>
                    <div class="text-sm text-gray-500">NTRP</div>
                  </div>

                  <div class="flex space-x-2">
                    <UButton
                      :to="`/marketplace/${bid.ask_id.toString()}`"
                      variant="outline"
                      size="sm"
                    >
                      View
                    </UButton>

                    <UButton
                      v-if="canWithdrawBid(bid)"
                      color="red"
                      variant="outline"
                      size="sm"
                      :loading="withdrawingBids.has(bid.ask_id.toString())"
                      @click="handleWithdrawBid(bid)"
                    >
                      Withdraw
                    </UButton>

                    <UButton
                      v-if="canClaim(bid)"
                      color="green"
                      variant="outline"
                      size="sm"
                      :loading="claimingBids.has(bid.ask_id.toString())"
                      @click="handleClaim(bid)"
                    >
                      Claim
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
    getBuyNowPrice,
  } from '~/utils/marketplace'

  // Meta
  definePageMeta({
    title: 'My Bids',
    description: 'Track your bids and purchases on the marketplace',
    middleware: 'auth',
  })

  // Composables
  const marketplace = useMarketplace()
  const authStore = useAuthStore()

  // State
  const activeTab = ref('active')
  const withdrawingBids = ref(new Set<string>())
  const claimingBids = ref(new Set<string>())

  const tabs = [
    { id: 'active', name: 'Active' },
    { id: 'won', name: 'Won' },
    { id: 'outbid', name: 'Outbid' },
    { id: 'all', name: 'All' },
  ]

  // Computed
  const isAuthenticated = computed(() => marketplace.isAuthenticated.value)
  const userBids = computed(() => marketplace.userBids.value)
  const userBidsLoading = computed(() => marketplace.userBidsLoading.value)
  const userBidsError = computed(() => marketplace.userBidsError.value)
  const userActiveBids = computed(() => marketplace.userActiveBids.value)

  const successfulBids = computed(() => {
    return userBids.value.filter(
      bid =>
        getAskStatusText(bid.status) === 'Closed' &&
        bid.settled_at &&
        bid.settled_at[0][0].toString() ===
          authStore.identity?.getPrincipal().toString()
    )
  })

  const outbidBids = computed(() => {
    return userBids.value.filter(
      bid =>
        getAskStatusText(bid.status) === 'Closed' &&
        (!bid.settled_at ||
          bid.settled_at[0][0].toString() !==
            authStore.identity?.getPrincipal().toString())
    )
  })

  const totalBidAmount = computed(() => {
    return userBids.value
      .reduce((total, bid) => {
        const price = getBuyNowPrice(bid.config)
        return total + (price ? Number(price) / 100000000 : 0) // Convert from smallest unit
      }, 0)
      .toFixed(2)
  })

  // Methods
  const loadUserBids = async () => {
    try {
      await marketplace.loadUserBids()
    } catch (error) {
      console.error('Failed to load user bids:', error)
    }
  }

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'active':
        return userActiveBids.value.length
      case 'won':
        return successfulBids.value.length
      case 'outbid':
        return outbidBids.value.length
      case 'all':
        return userBids.value.length
      default:
        return 0
    }
  }

  const getTabBids = () => {
    switch (activeTab.value) {
      case 'active':
        return userActiveBids.value
      case 'won':
        return successfulBids.value
      case 'outbid':
        return outbidBids.value
      case 'all':
        return userBids.value
      default:
        return []
    }
  }

  const getTabName = () => {
    return tabs.find(tab => tab.id === activeTab.value)?.name || 'bids'
  }

  const getEmptyMessage = () => {
    switch (activeTab.value) {
      case 'active':
        return "You don't have any active bids. Start bidding on listings!"
      case 'won':
        return "You haven't won any auctions yet."
      case 'outbid':
        return "You haven't been outbid on any auctions yet."
      case 'all':
        return "You haven't placed any bids yet."
      default:
        return 'No bids found.'
    }
  }

  const handleWithdrawBid = async (bid: AskStatus) => {
    try {
      withdrawingBids.value.add(bid.ask_id.toString())

      // This would need to be implemented with the marketplace service
      // For now, we'll simulate the withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000))

      await loadUserBids()
    } catch (error) {
      console.error('Failed to withdraw bid:', error)
    } finally {
      withdrawingBids.value.delete(bid.ask_id.toString())
    }
  }

  const handleClaim = async (bid: AskStatus) => {
    try {
      claimingBids.value.add(bid.ask_id.toString())

      // This would need to be implemented with the marketplace service
      // For now, we'll simulate the claim
      await new Promise(resolve => setTimeout(resolve, 2000))

      await loadUserBids()
    } catch (error) {
      console.error('Failed to claim NFT:', error)
    } finally {
      claimingBids.value.delete(bid.ask_id.toString())
    }
  }

  // Helper functions
  const getStatusText = (status: unknown) => getAskStatusText(status)

  const formatPrice = (bid: AskStatus) => {
    const price = getBuyNowPrice(bid.config)
    return price ? formatTokenAmount(price, 8) : 'N/A'
  }

  const canWithdrawBid = (bid: AskStatus) => {
    return getStatusText(bid.status) === 'Open'
  }

  const canClaim = (bid: AskStatus) => {
    return (
      getStatusText(bid.status) === 'Closed' &&
      bid.settled_at &&
      bid.settled_at[0][0].toString() ===
        authStore.identity?.getPrincipal().toString()
    )
  }

  // Lifecycle
  onMounted(() => {
    if (isAuthenticated.value) {
      loadUserBids()
    }
  })
</script>
