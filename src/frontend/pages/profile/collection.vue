<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Collection</h1>
            <p class="mt-2 text-gray-600">
              {{ nfts.length }} NFT{{ nfts.length !== 1 ? 's' : '' }} owned
            </p>
          </div>
          <div class="flex gap-4">
            <UButton
              to="/mint"
              icon="i-heroicons-plus"
              size="lg"
            >
              Mint NFT
            </UButton>
            <UButton
              @click="refreshCollection"
              :loading="isLoading"
              variant="outline"
              icon="i-heroicons-arrow-path"
              size="lg"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Connection Status -->
      <div v-if="!isConnected" class="text-center py-12">
        <UIcon name="i-heroicons-wallet" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p class="text-gray-600 mb-6">You need to connect your wallet to view your collection</p>
        <UButton @click="connectWallet" size="lg">
          Connect Wallet
        </UButton>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p class="text-gray-600">Loading your collection...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="nfts.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h3>
        <p class="text-gray-600 mb-6">Start building your collection by minting your first NFT</p>
        <UButton to="/mint" size="lg">
          Mint Your First NFT
        </UButton>
      </div>

      <!-- NFT Grid -->
      <div v-else>
        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-blue-500" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total NFTs</p>
                <p class="text-2xl font-bold text-gray-900">{{ nfts.length }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-tag" class="w-8 h-8 text-green-500" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Listed for Sale</p>
                <p class="text-2xl font-bold text-gray-900">{{ listedCount }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-purple-500" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Est. Value</p>
                <p class="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        <!-- NFT Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="nft in nfts"
            :key="nft.tokenId.toString()"
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            @click="viewNFT(nft.tokenId)"
          >
            <!-- NFT Image -->
            <div class="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
              <img
                v-if="nft.imageUrl"
                :src="nft.imageUrl"
                :alt="nft.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-12 h-12 text-gray-400" />
              </div>
              
              <!-- Token ID Badge -->
              <div class="absolute top-2 left-2">
                <span class="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  #{{ nft.tokenId.toString() }}
                </span>
              </div>
            </div>

            <!-- NFT Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 truncate">
                {{ nft.name || `NFT #${nft.tokenId}` }}
              </h3>
              <p v-if="nft.description" class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ nft.description }}
              </p>

              <!-- Attributes -->
              <div v-if="nft.attributes.length > 0" class="mt-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="attr in nft.attributes.slice(0, 3)"
                    :key="attr.key"
                    class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {{ attr.key }}: {{ attr.value }}
                  </span>
                  <span
                    v-if="nft.attributes.length > 3"
                    class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    +{{ nft.attributes.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-4 flex gap-2">
                <UButton
                  @click.stop="listNFT(nft)"
                  size="sm"
                  variant="outline"
                  class="flex-1"
                >
                  List for Sale
                </UButton>
                <UButton
                  @click.stop="transferNFT(nft)"
                  size="sm"
                  variant="ghost"
                  icon="i-heroicons-arrow-right"
                />
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
import { Principal } from '@dfinity/principal'
import { walletService } from '~/services/WalletService'
import nftService from '~/services/NFTService'

// Page metadata
definePageMeta({
  title: 'My Collection',
  description: 'View and manage your NFT collection'
})

// Types
interface NFTMetadata {
  tokenId: bigint
  name: string
  description: string
  imageUrl: string
  attributes: Array<{ key: string; value: string }>
}

// Reactive data
const isConnected = ref(false)
const isLoading = ref(false)
const nfts = ref<NFTMetadata[]>([])
const listedCount = ref(0) // TODO: Get from marketplace

// Computed properties
// This would be calculated from marketplace data
const totalValue = computed(() => {
  // TODO: Calculate based on floor prices or last sales
  return 0
})

// Methods
const connectWallet = async () => {
  try {
    await walletService.connectWallet('plug') // or 'ii'
    await initializeServices()
  } catch (error) {
    console.error('Failed to connect wallet:', error)
  }
}

const initializeServices = async () => {
  try {
    const connection = walletService.getCurrentConnection()
    if (!connection) return

    isConnected.value = true
    
    // Initialize NFT service
    await nftService.initialize(connection.identity)
    
    // Load user's NFTs
    await loadUserNFTs()
  } catch (error) {
    console.error('Failed to initialize services:', error)
  }
}

const loadUserNFTs = async () => {
  try {
    isLoading.value = true
    
    const connection = walletService.getCurrentConnection()
    if (!connection) return

    const userPrincipal = connection.identity.getPrincipal()
    const userNFTs = await nftService.getUserNFTs(userPrincipal)
    
    // Parse metadata
    nfts.value = userNFTs.map(nft => {
      const metadata = parseNFTMetadata(nft.metadata)
      return {
        tokenId: nft.tokenId,
        name: metadata.name || `NFT #${nft.tokenId}`,
        description: metadata.description || '',
        imageUrl: metadata.image || '',
        attributes: metadata.attributes || []
      }
    })
  } catch (error) {
    console.error('Failed to load NFTs:', error)
  } finally {
    isLoading.value = false
  }
}

const parseNFTMetadata = (metadata: Array<[string, any]>) => {
  const parsed: any = {}
  
  for (const [key, value] of metadata) {
    switch (key.toLowerCase()) {
      case 'name':
      case 'token_name':
        parsed.name = typeof value === 'string' ? value : value.Text || ''
        break
      case 'description':
      case 'token_description':
        parsed.description = typeof value === 'string' ? value : value.Text || ''
        break
      case 'image':
      case 'image_url':
      case 'token_image_url':
        parsed.image = typeof value === 'string' ? value : value.Text || ''
        break
      case 'attributes':
      case 'token_attributes':
        if (Array.isArray(value)) {
          parsed.attributes = value.map(([k, v]: [string, string]) => ({
            key: k,
            value: v
          }))
        }
        break
    }
  }
  
  return parsed
}

const refreshCollection = async () => {
  await loadUserNFTs()
}

const viewNFT = (tokenId: bigint) => {
  navigateTo(`/nfts/${tokenId.toString()}`)
}

const listNFT = (nft: NFTMetadata) => {
  // Navigate to marketplace create listing with pre-filled NFT data
  navigateTo(`/marketplace/create?tokenId=${nft.tokenId.toString()}`)
}

const transferNFT = (nft: NFTMetadata) => {
  // TODO: Implement transfer modal
  console.log('Transfer NFT:', nft)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// Lifecycle
onMounted(async () => {
  const connection = walletService.getCurrentConnection()
  if (connection) {
    await initializeServices()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
