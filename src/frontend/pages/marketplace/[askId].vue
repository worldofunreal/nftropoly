<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-6">
          <UButton
            to="/marketplace"
            icon="i-heroicons-arrow-left"
            variant="ghost"
            size="sm"
            class="mr-4"
          >
            Back to Marketplace
          </UButton>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Listing Details</h1>
            <p class="mt-2 text-gray-600">Ask ID: {{ askId }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
          <div class="flex space-x-6">
            <div class="w-80 h-80 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-4">
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load listing</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <UButton @click="loadAskDetails" variant="outline">
          Try Again
        </UButton>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!ask" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Listing not found</h3>
        <p class="text-gray-600 mb-4">
          The listing you're looking for doesn't exist or has been removed.
        </p>
        <UButton to="/marketplace" variant="outline">
          Browse Listings
        </UButton>
      </div>

      <!-- Ask Details -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- NFT Image and Basic Info -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <div class="flex space-x-6">
                <div class="w-80 h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">
                    NFT #{{ ask.ask_id.toString() }}
                  </h2>
                  <p class="text-gray-600 mb-4">
                    Listed by {{ ask.seller.owner.toString() }}
                  </p>
                  
                  <!-- Status Badge -->
                  <div class="mb-4">
                    <UBadge
                      :color="getStatusColor(ask.status)"
                      variant="soft"
                      size="lg"
                    >
                      {{ getStatusText(ask.status) }}
                    </UBadge>
                  </div>

                  <!-- Price Information -->
                  <div class="space-y-2 mb-6">
                    <div class="text-3xl font-bold text-gray-900">
                      {{ formatPrice(ask) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ getPriceToken(ask) }}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="space-y-3">
                    <BuyNowButton
                      v-if="canBuyNow(ask)"
                      :ask="ask"
                      :loading="buying"
                      @buy="handleBuyNow"
                    />
                    
                    <BidForm
                      v-if="canBid(ask)"
                      :ask="ask"
                      :loading="bidding"
                      @bid="handleBid"
                    />
                    
                    <div v-if="isOwner(ask)" class="space-y-2">
                      <UButton
                        v-if="canEndAsk(ask)"
                        @click="handleEndAsk"
                        color="red"
                        variant="outline"
                        :loading="ending"
                        block
                      >
                        End Listing
                      </UButton>
                      
                      <UButton
                        v-if="canDistribute(ask)"
                        @click="handleDistribute"
                        color="green"
                        variant="outline"
                        :loading="distributing"
                        block
                      >
                        Distribute
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Auction Information -->
            <div v-if="hasAuction(ask)" class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Auction Details</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-500">Current Bid</label>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ getCurrentBid(ask) }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Minimum Bid</label>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ getMinBid(ask) }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">End Time</label>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ getEndTime(ask) }}
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-500">Bidders</label>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ ask.participants.length }}
                  </div>
                </div>
              </div>
              
              <AuctionTimer
                v-if="ask.auction_info"
                :auction-info="ask.auction_info"
                class="mt-4"
              />
            </div>

            <!-- Dutch Auction Information -->
            <div v-if="hasDutch(ask)" class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Dutch Auction</h3>
              <DutchPriceChart
                :ask="ask"
                class="mb-4"
              />
              <div class="text-sm text-gray-600">
                Price decreases over time until someone purchases or the auction ends.
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Seller Information -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Seller</h3>
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">
                    {{ formatPrincipal(ask.seller.owner.toString()) }}
                  </div>
                  <div class="text-sm text-gray-500">Seller</div>
                </div>
              </div>
            </div>

            <!-- Listing Information -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Listing Info</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Ask ID</span>
                  <span class="text-sm font-medium text-gray-900">{{ ask.ask_id.toString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Status</span>
                  <span class="text-sm font-medium text-gray-900">{{ getStatusText(ask.status) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">Participants</span>
                  <span class="text-sm font-medium text-gray-900">{{ ask.participants.length }}</span>
                </div>
                <div v-if="ask.settled_at" class="flex justify-between">
                  <span class="text-sm text-gray-500">Settled</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatTimestamp(ask.settled_at[0][1]) }}</span>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div class="space-y-3">
                <div v-for="participant in ask.participants.slice(0, 5)" :key="participant.owner.toString()" class="flex items-center space-x-3">
                  <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <UIcon name="i-heroicons-user" class="w-3 h-3 text-gray-600" />
                  </div>
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">
                      {{ formatPrincipal(participant.owner.toString()) }}
                    </div>
                    <div class="text-gray-500">Participant</div>
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
import { useRoute, useRouter } from 'vue-router'
import { useMarketplace } from '~/composables/useMarketplace'
import { useApprovals } from '~/composables/useApprovals'
import { useAuthStore } from '~/stores/auth'
import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
import { 
  getAskStatusText, 
  getAskStatusColor, 
  formatTokenAmount, 
  formatTimestamp,
  hasBuyNowFeature,
  hasAuctionFeature,
  hasDutchFeature,
  getBuyNowPrice
} from '~/utils/marketplace'

// Meta
definePageMeta({
  title: 'Listing Details',
  description: 'View detailed information about a marketplace listing'
})

// Composables
const route = useRoute()
const router = useRouter()
const marketplace = useMarketplace()
const approvals = useApprovals()
const authStore = useAuthStore()

// State
const askId = computed(() => route.params.askId as string)
const ask = ref<AskStatus | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const buying = ref(false)
const bidding = ref(false)
const ending = ref(false)
const distributing = ref(false)

// Computed
const isAuthenticated = computed(() => marketplace.isAuthenticated.value)
const currentUser = computed(() => marketplace.currentUser.value)

// Methods
const loadAskDetails = async () => {
  try {
    loading.value = true
    error.value = null
    
    await marketplace.loadAskDetails(askId.value)
    ask.value = marketplace.getAskById(askId.value)
  } catch (err) {
    console.error('Failed to load ask details:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load listing'
  } finally {
    loading.value = false
  }
}

const handleBuyNow = async () => {
  if (!ask.value || !isAuthenticated.value) return
  
  try {
    buying.value = true
    
    // Check if marketplace is approved for tokens
    const requiredAmount = getBuyNowPrice(ask.value.config) || BigInt(0)
    const isApproved = approvals.isMarketplaceApprovedForTokens(
      'uzt4z-lp777-77774-qaabq-cai', // NTRP token canister
      requiredAmount
    )
    
    if (!isApproved) {
      // Show approval modal
      error.value = 'Please approve the marketplace to spend your tokens first'
      return
    }
    
    // Create bid for buy now
    const bidFeatures = [{
      Escrow: {
        escrow_type: { Bid: [[{
          standards: [{ ICRC1: [{ amount: requiredAmount, fee: [], decimals: BigInt(8) }] }],
          canister: 'uzt4z-lp777-77774-qaabq-cai' as any,
          symbol: 'NTRP'
        }]] },
        buyer: [{ owner: currentUser.value as any, subaccount: [] }],
        seller: ask.value.seller,
        ask_id: [ask.value.ask_id],
        lock_to_date: []
      }
    }]
    
    const result = await marketplace.createBid(ask.value.ask_id, bidFeatures)
    
    if (result) {
      // Success - reload ask details
      await loadAskDetails()
    } else {
      error.value = 'Failed to purchase NFT. Please try again.'
    }
  } catch (err) {
    console.error('Failed to buy now:', err)
    error.value = err instanceof Error ? err.message : 'Failed to purchase NFT'
  } finally {
    buying.value = false
  }
}

const handleBid = async (bidAmount: bigint) => {
  if (!ask.value || !isAuthenticated.value) return
  
  try {
    bidding.value = true
    
    // Similar to buy now but with bid amount
    const bidFeatures = [{
      Escrow: {
        escrow_type: { Bid: [[{
          standards: [{ ICRC1: [{ amount: bidAmount, fee: [], decimals: BigInt(8) }] }],
          canister: 'uzt4z-lp777-77774-qaabq-cai' as any,
          symbol: 'NTRP'
        }]] },
        buyer: [{ owner: currentUser.value as any, subaccount: [] }],
        seller: ask.value.seller,
        ask_id: [ask.value.ask_id],
        lock_to_date: []
      }
    }]
    
    const result = await marketplace.createBid(ask.value.ask_id, bidFeatures)
    
    if (result) {
      await loadAskDetails()
    } else {
      error.value = 'Failed to place bid. Please try again.'
    }
  } catch (err) {
    console.error('Failed to place bid:', err)
    error.value = err instanceof Error ? err.message : 'Failed to place bid'
  } finally {
    bidding.value = false
  }
}

const handleEndAsk = async () => {
  if (!ask.value || !isAuthenticated.value) return
  
  try {
    ending.value = true
    
    const result = await marketplace.endAsk(ask.value.ask_id)
    
    if (result) {
      await loadAskDetails()
    } else {
      error.value = 'Failed to end listing. Please try again.'
    }
  } catch (err) {
    console.error('Failed to end ask:', err)
    error.value = err instanceof Error ? err.message : 'Failed to end listing'
  } finally {
    ending.value = false
  }
}

const handleDistribute = async () => {
  if (!ask.value || !isAuthenticated.value) return
  
  try {
    distributing.value = true
    
    const result = await marketplace.distributeAsk(ask.value.ask_id)
    
    if (result) {
      await loadAskDetails()
    } else {
      error.value = 'Failed to distribute. Please try again.'
    }
  } catch (err) {
    console.error('Failed to distribute:', err)
    error.value = err instanceof Error ? err.message : 'Failed to distribute'
  } finally {
    distributing.value = false
  }
}

// Helper functions
const getStatusText = (status: any) => getAskStatusText(status)
const getStatusColor = (status: any) => getAskStatusColor(status)

const formatPrice = (ask: AskStatus) => {
  const price = getBuyNowPrice(ask.config)
  return price ? formatTokenAmount(price, 8) : 'N/A'
}

const getPriceToken = (ask: AskStatus) => {
  return 'NTRP'
}

const canBuyNow = (ask: AskStatus) => {
  return isAuthenticated.value && 
         hasBuyNowFeature(ask.config) && 
         getStatusText(ask.status) === 'Open' &&
         !isOwner(ask)
}

const canBid = (ask: AskStatus) => {
  return isAuthenticated.value && 
         hasAuctionFeature(ask.config) && 
         getStatusText(ask.status) === 'Open' &&
         !isOwner(ask)
}

const isOwner = (ask: AskStatus) => {
  return currentUser.value === ask.seller.owner.toString()
}

const canEndAsk = (ask: AskStatus) => {
  return isOwner(ask) && getStatusText(ask.status) === 'Open'
}

const canDistribute = (ask: AskStatus) => {
  return isOwner(ask) && getStatusText(ask.status) === 'Closed'
}

const hasAuction = (ask: AskStatus) => {
  return hasAuctionFeature(ask.config)
}

const hasDutch = (ask: AskStatus) => {
  return hasDutchFeature(ask.config)
}

const getCurrentBid = (ask: AskStatus) => {
  return ask.auction_info?.[0]?.current_bid_amount?.[0] 
    ? formatTokenAmount(ask.auction_info[0].current_bid_amount[0], 8)
    : 'No bids'
}

const getMinBid = (ask: AskStatus) => {
  return ask.auction_info?.[0]?.min_next_bid?.[0]
    ? formatTokenAmount(ask.auction_info[0].min_next_bid[0], 8)
    : 'N/A'
}

const getEndTime = (ask: AskStatus) => {
  return ask.auction_info?.[0]?.end_date?.[0]
    ? formatTimestamp(ask.auction_info[0].end_date[0])
    : 'N/A'
}

const formatPrincipal = (principal: string) => {
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`
}

// Lifecycle
onMounted(() => {
  loadAskDetails()
})
</script>
