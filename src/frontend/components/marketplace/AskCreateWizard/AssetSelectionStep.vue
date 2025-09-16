<template>
  <div class="asset-selection-step">
    <div class="step-header mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        Select NFTs to List
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Choose which NFTs you want to list on the marketplace
      </p>
    </div>

    <!-- NFT Selection Interface -->
    <div class="nft-selection">
      <!-- Search and Filter -->
      <div class="search-filters mb-6">
        <UInput
          v-model="searchQuery"
          placeholder="Search NFTs by name or token ID..."
          icon="i-heroicons-magnifying-glass"
          class="mb-4"
        />

        <div class="flex gap-4">
          <USelect
            v-model="selectedCollection"
            :options="collectionOptions"
            placeholder="All Collections"
            class="flex-1"
          />
          <USelect
            v-model="sortBy"
            :options="sortOptions"
            placeholder="Sort by"
            class="flex-1"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-primary-500 mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400">Loading your NFTs...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="text-4xl text-red-500 mb-4"
        />
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <UButton @click="loadNFTs"> Try Again </UButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNFTs.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-photo" class="text-4xl text-gray-400 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{
            searchQuery
              ? 'No NFTs found matching your search'
              : 'No NFTs available to list'
          }}
        </p>
        <UButton v-if="!searchQuery" variant="outline" @click="loadNFTs">
          Refresh
        </UButton>
      </div>

      <!-- NFT Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="nft in filteredNFTs"
          :key="`${nft.canisterId}-${nft.tokenId}`"
          class="nft-card"
          :class="{ selected: isSelected(nft) }"
          @click="toggleSelection(nft)"
        >
          <div class="nft-image">
            <img
              :src="nft.metadata?.image || '/placeholder-nft.png'"
              :alt="nft.metadata?.name || `NFT #${nft.tokenId}`"
              class="w-full h-48 object-cover rounded-t-lg"
            >
            <div class="nft-overlay">
              <UIcon
                :name="
                  isSelected(nft)
                    ? 'i-heroicons-check-circle-solid'
                    : 'i-heroicons-plus-circle'
                "
                class="text-2xl"
                :class="isSelected(nft) ? 'text-green-500' : 'text-white'"
              />
            </div>
          </div>

          <div class="nft-info p-4">
            <h4 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ nft.metadata?.name || `NFT #${nft.tokenId}` }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ nft.metadata?.description || 'No description' }}
            </p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs text-gray-500">
                Token ID: {{ nft.tokenId.toString() }}
              </span>
              <span class="text-xs text-gray-500">
                {{ nft.canisterId.slice(0, 8) }}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected NFTs Summary -->
    <div
      v-if="selectedNFTs.length > 0"
      class="selected-summary mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
    >
      <h4 class="font-semibold text-primary-900 dark:text-primary-100 mb-2">
        Selected NFTs ({{ selectedNFTs.length }})
      </h4>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="nft in selectedNFTs"
          :key="`${nft.canisterId}-${nft.tokenId}`"
          color="primary"
          variant="soft"
          class="cursor-pointer"
          @click="removeSelection(nft)"
        >
          {{ nft.metadata?.name || `#${nft.tokenId}` }}
          <UIcon name="i-heroicons-x-mark" class="ml-1 text-xs" />
        </UBadge>
      </div>
    </div>

    <!-- Step Actions -->
    <div class="step-actions flex justify-end mt-8">
      <UButton :disabled="selectedNFTs.length === 0" @click="$emit('next')">
        Continue with {{ selectedNFTs.length }} NFT{{
          selectedNFTs.length !== 1 ? 's' : ''
        }}
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useAuthStore } from '~/stores/auth'

  interface NFT {
    canisterId: string
    tokenId: bigint
    metadata: {
      name?: string
      description?: string
      image?: string
      attributes?: Array<{ trait_type: string; value: string }>
    }
  }

  interface Props {
    modelValue: {
      selectedNFTs: Array<{
        canisterId: string
        tokenId: bigint
        metadata: unknown
      }>
    }
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: Props['modelValue']]
    next: []
  }>()

  const authStore = useAuthStore()

  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCollection = ref('')
  const sortBy = ref('name')

  // Mock data - in real implementation, this would come from NFT collection service
  const allNFTs = ref<NFT[]>([])

  const collectionOptions = [
    { label: 'All Collections', value: '' },
    { label: 'NFTropoly Collection', value: 'uqqxf-5h777-77774-qaaaa-cai' },
  ]

  const sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Token ID', value: 'tokenId' },
    { label: 'Recently Added', value: 'recent' },
  ]

  const selectedNFTs = computed(() => props.modelValue.selectedNFTs)

  const filteredNFTs = computed(() => {
    let filtered = allNFTs.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        nft =>
          nft.metadata?.name?.toLowerCase().includes(query) ||
          nft.tokenId.toString().includes(query)
      )
    }

    // Filter by collection
    if (selectedCollection.value) {
      filtered = filtered.filter(
        nft => nft.canisterId === selectedCollection.value
      )
    }

    // Sort
    switch (sortBy.value) {
      case 'name':
        filtered.sort((a, b) =>
          (a.metadata?.name || '').localeCompare(b.metadata?.name || '')
        )
        break
      case 'tokenId':
        filtered.sort((a, b) => Number(a.tokenId - b.tokenId))
        break
      case 'recent':
        // Mock recent sorting
        break
    }

    return filtered
  })

  function isSelected(nft: NFT): boolean {
    return selectedNFTs.value.some(
      selected =>
        selected.canisterId === nft.canisterId &&
        selected.tokenId === nft.tokenId
    )
  }

  function toggleSelection(nft: NFT) {
    const current = [...selectedNFTs.value]
    const existingIndex = current.findIndex(
      selected =>
        selected.canisterId === nft.canisterId &&
        selected.tokenId === nft.tokenId
    )

    if (existingIndex >= 0) {
      current.splice(existingIndex, 1)
    } else {
      current.push({
        canisterId: nft.canisterId,
        tokenId: nft.tokenId,
        metadata: nft.metadata,
      })
    }

    emit('update:modelValue', {
      ...props.modelValue,
      selectedNFTs: current,
    })
  }

  function removeSelection(nft: NFT) {
    const current = [...selectedNFTs.value]
    const index = current.findIndex(
      selected =>
        selected.canisterId === nft.canisterId &&
        selected.tokenId === nft.tokenId
    )

    if (index >= 0) {
      current.splice(index, 1)
      emit('update:modelValue', {
        ...props.modelValue,
        selectedNFTs: current,
      })
    }
  }

  async function loadNFTs() {
    if (!authStore.identity) {
      error.value = 'Please connect your wallet first'
      return
    }

    loading.value = true
    error.value = null

    try {
      // Mock NFT data - in real implementation, this would fetch from NFT collection service
      await new Promise(resolve => setTimeout(resolve, 1000))

      allNFTs.value = [
        {
          canisterId: 'uqqxf-5h777-77774-qaaaa-cai',
          tokenId: BigInt(1),
          metadata: {
            name: 'NFTropoly #1',
            description: 'The first NFT in the NFTropoly collection',
            image: '/placeholder-nft.png',
            attributes: [
              { trait_type: 'Rarity', value: 'Legendary' },
              { trait_type: 'Color', value: 'Gold' },
            ],
          },
        },
        {
          canisterId: 'uqqxf-5h777-77774-qaaaa-cai',
          tokenId: BigInt(2),
          metadata: {
            name: 'NFTropoly #2',
            description: 'A unique digital asset',
            image: '/placeholder-nft.png',
            attributes: [
              { trait_type: 'Rarity', value: 'Rare' },
              { trait_type: 'Color', value: 'Blue' },
            ],
          },
        },
        {
          canisterId: 'uqqxf-5h777-77774-qaaaa-cai',
          tokenId: BigInt(3),
          metadata: {
            name: 'NFTropoly #3',
            description: 'Another amazing NFT',
            image: '/placeholder-nft.png',
            attributes: [
              { trait_type: 'Rarity', value: 'Common' },
              { trait_type: 'Color', value: 'Green' },
            ],
          },
        },
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load NFTs'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadNFTs()
  })
</script>

<style scoped>
  .nft-card {
    @apply border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg;
  }

  .nft-card.selected {
    @apply border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800;
  }

  .nft-image {
    @apply relative;
  }

  .nft-overlay {
    @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-200;
  }

  .nft-card:hover .nft-overlay {
    @apply opacity-100;
  }

  .nft-card.selected .nft-overlay {
    @apply opacity-100;
  }
</style>
