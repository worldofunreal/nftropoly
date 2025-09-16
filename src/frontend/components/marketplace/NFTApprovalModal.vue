<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Approve NFTs for Marketplace
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="space-y-6">
        <!-- Info Alert -->
        <UAlert
          icon="i-heroicons-information-circle"
          color="info"
          variant="soft"
          title="NFT Approval Required"
          description="You need to approve your NFTs for the marketplace before you can list them for sale. This allows the marketplace to transfer your NFTs when they are sold."
        />

        <!-- Selected NFTs -->
        <div v-if="selectedNFTs.length > 0">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Selected NFTs ({{ selectedNFTs.length }})
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="nft in selectedNFTs"
              :key="`${nft.canisterId}-${nft.tokenId}`"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <img
                    v-if="nft.metadata?.image"
                    :src="nft.metadata.image"
                    :alt="nft.metadata.name || `NFT #${nft.tokenId}`"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <UIcon
                    v-else
                    name="i-heroicons-photo"
                    class="w-6 h-6 text-gray-400"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ nft.metadata?.name || `NFT #${nft.tokenId}` }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Token ID: {{ nft.tokenId.toString() }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge
                  :color="getApprovalStatus(nft).color"
                  variant="soft"
                  size="sm"
                >
                  {{ getApprovalStatus(nft).text }}
                </UBadge>
                <UButton
                  v-if="!getApprovalStatus(nft).isApproved"
                  size="sm"
                  :loading="
                    approvingNFTs.has(`${nft.canisterId}-${nft.tokenId}`)
                  "
                  @click="approveNFT(nft)"
                >
                  Approve
                </UButton>
                <UButton
                  v-else
                  size="sm"
                  color="error"
                  variant="outline"
                  :loading="
                    revokingNFTs.has(`${nft.canisterId}-${nft.tokenId}`)
                  "
                  @click="revokeNFT(nft)"
                >
                  Revoke
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- All NFTs -->
        <div v-else>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Your NFTs
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="nft in userNFTs"
              :key="`${nft.canisterId}-${nft.tokenId}`"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
                >
                  <img
                    v-if="nft.metadata?.image"
                    :src="nft.metadata.image"
                    :alt="nft.metadata.name || `NFT #${nft.tokenId}`"
                    class="w-full h-full object-cover rounded-lg"
                  />
                  <UIcon
                    v-else
                    name="i-heroicons-photo"
                    class="w-6 h-6 text-gray-400"
                  />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ nft.metadata?.name || `NFT #${nft.tokenId}` }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Token ID: {{ nft.tokenId.toString() }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge
                  :color="getApprovalStatus(nft).color"
                  variant="soft"
                  size="sm"
                >
                  {{ getApprovalStatus(nft).text }}
                </UBadge>
                <UButton
                  v-if="!getApprovalStatus(nft).isApproved"
                  size="sm"
                  :loading="
                    approvingNFTs.has(`${nft.canisterId}-${nft.tokenId}`)
                  "
                  @click="approveNFT(nft)"
                >
                  Approve
                </UButton>
                <UButton
                  v-else
                  size="sm"
                  color="error"
                  variant="outline"
                  :loading="
                    revokingNFTs.has(`${nft.canisterId}-${nft.tokenId}`)
                  "
                  @click="revokeNFT(nft)"
                >
                  Revoke
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Batch Actions -->
        <div
          v-if="userNFTs.length > 0"
          class="border-t border-gray-200 dark:border-gray-700 pt-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <UCheckbox
                v-model="selectAll"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                Select all NFTs
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <UButton
                v-if="selectedNFTs.length > 0"
                size="sm"
                :loading="batchApproving"
                @click="approveSelected"
              >
                Approve Selected ({{ selectedNFTs.length }})
              </UButton>
              <UButton
                v-if="selectedNFTs.length > 0"
                size="sm"
                color="error"
                variant="outline"
                :loading="batchRevoking"
                @click="revokeSelected"
              >
                Revoke Selected ({{ selectedNFTs.length }})
              </UButton>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2"
          />
          <p class="text-gray-600 dark:text-gray-400">Loading your NFTs...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="userNFTs.length === 0" class="text-center py-8">
          <UIcon
            name="i-heroicons-photo"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No NFTs Found
          </h4>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You don't have any NFTs to approve yet.
          </p>
          <UButton @click="closeModal"> Close </UButton>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton variant="outline" @click="closeModal"> Close </UButton>
          <UButton
            v-if="selectedNFTs.length > 0"
            :loading="batchApproving || batchRevoking"
            @click="handleBatchAction"
          >
            {{
              batchApproving
                ? 'Approving...'
                : batchRevoking
                  ? 'Revoking...'
                  : 'Process Selected'
            }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useApprovals } from '~/composables/useApprovals'

  interface NFT {
    canisterId: string
    tokenId: bigint
    metadata?: {
      name?: string
      image?: string
      description?: string
    }
  }

  interface Props {
    modelValue: boolean
    selectedNFTs?: NFT[]
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedNFTs: () => [],
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'nft-approved': [nft: NFT]
    'nft-revoked': [nft: NFT]
    'batch-complete': [approved: NFT[], revoked: NFT[]]
  }>()

  // Composables
  const {
    getAllNFTApprovals: _nftApprovals,
    loadMarketplaceApprovals,
    approveNFTForMarketplace: approveNFTComposable,
    revokeNFTApproval: revokeNFTComposable,
    loading: _approvalsLoading,
  } = useApprovals()

  // State
  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const userNFTs = ref<NFT[]>([])
  const selectedNFTs = ref<NFT[]>(props.selectedNFTs || [])
  const selectAll = ref(false)
  const loading = ref(false)
  const approvingNFTs = ref(new Set<string>())
  const revokingNFTs = ref(new Set<string>())
  const batchApproving = ref(false)
  const batchRevoking = ref(false)

  const isIndeterminate = computed(() => {
    const selectedCount = selectedNFTs.value.length
    const totalCount = userNFTs.value.length
    return selectedCount > 0 && selectedCount < totalCount
  })

  // Watch for changes in selectedNFTs prop
  watch(
    () => props.selectedNFTs,
    newNFTs => {
      if (newNFTs) {
        selectedNFTs.value = [...newNFTs]
      }
    },
    { immediate: true }
  )

  // Load user NFTs when modal opens
  watch(isOpen, async open => {
    if (open) {
      await loadUserNFTs()
      await loadMarketplaceApprovals()
    }
  })

  async function loadUserNFTs() {
    loading.value = true
    try {
      // This would typically call a service to get user's NFTs
      // For now, we'll use mock data
      userNFTs.value = [
        {
          canisterId: 'uqqxf-5h777-77774-qaaaa-cai',
          tokenId: BigInt(1),
          metadata: {
            name: 'CryptoPunk #1',
            image: '/placeholder-nft.png',
            description: 'A rare CryptoPunk NFT',
          },
        },
        {
          canisterId: 'uqqxf-5h777-77774-qaaaa-cai',
          tokenId: BigInt(2),
          metadata: {
            name: 'CryptoPunk #2',
            image: '/placeholder-nft.png',
            description: 'Another rare CryptoPunk NFT',
          },
        },
      ]
    } catch (error) {
      console.error('Failed to load user NFTs:', error)
    } finally {
      loading.value = false
    }
  }

  function getApprovalStatus(_nft: NFT): {
    isApproved: boolean
    text: string
    color: 'success' | 'neutral'
  } {
    // For now, we'll assume no approvals since we don't have the user key
    // In a real implementation, this would need to be passed from the parent
    const isApproved = false

    return {
      isApproved,
      text: isApproved ? 'Approved' : 'Not Approved',
      color: isApproved ? 'success' : 'neutral',
    }
  }

  async function approveNFT(nft: NFT) {
    const key = `${nft.canisterId}-${nft.tokenId}`
    approvingNFTs.value.add(key)

    try {
      await approveNFTComposable(nft.canisterId, nft.tokenId, BigInt(1))
      emit('nft-approved', nft)
    } catch (error) {
      console.error('Failed to approve NFT:', error)
      // Handle error - could show a toast
    } finally {
      approvingNFTs.value.delete(key)
    }
  }

  async function revokeNFT(nft: NFT) {
    const key = `${nft.canisterId}-${nft.tokenId}`
    revokingNFTs.value.add(key)

    try {
      await revokeNFTComposable(nft.canisterId, nft.tokenId)
      emit('nft-revoked', nft)
    } catch (error) {
      console.error('Failed to revoke NFT:', error)
      // Handle error - could show a toast
    } finally {
      revokingNFTs.value.delete(key)
    }
  }

  function handleSelectAll() {
    if (selectAll.value) {
      selectedNFTs.value = [...userNFTs.value]
    } else {
      selectedNFTs.value = []
    }
  }

  async function approveSelected() {
    if (selectedNFTs.value.length === 0) return

    batchApproving.value = true
    const approved: NFT[] = []

    try {
      for (const nft of selectedNFTs.value) {
        if (!getApprovalStatus(nft).isApproved) {
          await approveNFT(nft)
          approved.push(nft)
        }
      }

      emit('batch-complete', approved, [])
    } catch (error) {
      console.error('Failed to approve selected NFTs:', error)
    } finally {
      batchApproving.value = false
    }
  }

  async function revokeSelected() {
    if (selectedNFTs.value.length === 0) return

    batchRevoking.value = true
    const revoked: NFT[] = []

    try {
      for (const nft of selectedNFTs.value) {
        if (getApprovalStatus(nft).isApproved) {
          await revokeNFT(nft)
          revoked.push(nft)
        }
      }

      emit('batch-complete', [], revoked)
    } catch (error) {
      console.error('Failed to revoke selected NFTs:', error)
    } finally {
      batchRevoking.value = false
    }
  }

  async function handleBatchAction() {
    const hasApproved = selectedNFTs.value.some(
      nft => getApprovalStatus(nft).isApproved
    )

    if (hasApproved) {
      await revokeSelected()
    } else {
      await approveSelected()
    }
  }

  function closeModal() {
    isOpen.value = false
    selectedNFTs.value = []
    selectAll.value = false
  }

  onMounted(() => {
    if (isOpen.value) {
      loadUserNFTs()
      loadMarketplaceApprovals()
    }
  })
</script>
