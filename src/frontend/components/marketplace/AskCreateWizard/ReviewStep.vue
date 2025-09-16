<template>
  <div class="review-step">
    <div class="step-header mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        Review & Create
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Review your listing details before creating
      </p>
    </div>

    <div class="space-y-6">
      <!-- Selected NFTs -->
      <div class="selected-nfts">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Selected NFTs ({{ modelValue.selectedNFTs.length }})
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="nft in modelValue.selectedNFTs"
            :key="`${nft.canisterId}-${nft.tokenId}`"
            class="nft-preview-card"
          >
            <div class="nft-image">
              <img
                :src="(nft.metadata as any)?.image || '/placeholder-nft.png'"
                :alt="(nft.metadata as any)?.name || `NFT #${nft.tokenId}`"
                class="w-full h-32 object-cover rounded-t-lg"
              />
            </div>
            <div class="nft-info p-3">
              <h5 class="font-semibold text-gray-900 dark:text-white truncate">
                {{ (nft.metadata as any)?.name || `NFT #${nft.tokenId}` }}
              </h5>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Token ID: {{ nft.tokenId.toString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pricing Summary -->
      <div class="pricing-summary">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pricing
        </h4>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 dark:text-gray-400">Sale Type:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ askTypeLabel }}
            </span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-600 dark:text-gray-400">Payment Token:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ modelValue.paymentToken.symbol }}
            </span>
          </div>

          <!-- Buy Now -->
          <div
            v-if="modelValue.askType === 'buynow'"
            class="flex items-center justify-between"
          >
            <span class="text-gray-600 dark:text-gray-400">Price:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ modelValue.buyNowPrice }} {{ modelValue.paymentToken.symbol }}
            </span>
          </div>

          <!-- Auction -->
          <div v-else-if="modelValue.askType === 'auction'" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Starting Price:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.auction.startPrice }}
                {{ modelValue.paymentToken.symbol }}
              </span>
            </div>
            <div
              v-if="modelValue.auction.reservePrice"
              class="flex items-center justify-between"
            >
              <span class="text-gray-600 dark:text-gray-400"
                >Reserve Price:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.auction.reservePrice }}
                {{ modelValue.paymentToken.symbol }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Min Increase:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.auction.minIncrease.value }}
                {{
                  modelValue.auction.minIncrease.type === 'amount'
                    ? modelValue.paymentToken.symbol
                    : '%'
                }}
              </span>
            </div>
          </div>

          <!-- Dutch Auction -->
          <div v-else-if="modelValue.askType === 'dutch'" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Starting Price:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.dutch.startPrice }}
                {{ modelValue.paymentToken.symbol }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Ending Price:</span
              >
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.dutch.endPrice }}
                {{ modelValue.paymentToken.symbol }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Duration:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.dutch.timeValue }} {{ modelValue.dutch.timeUnit }}
              </span>
            </div>
          </div>

          <!-- AMM -->
          <div v-else-if="modelValue.askType === 'amm'" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Max Price:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.amm.max }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Min Price:</span>
              <span class="font-medium text-gray-900 dark:text-white">
                {{ modelValue.amm.min }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Options Summary -->
      <div class="options-summary">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Options
        </h4>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <div
            v-if="modelValue.expiresAt"
            class="flex items-center justify-between"
          >
            <span class="text-gray-600 dark:text-gray-400">Expires:</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ formatDate(modelValue.expiresAt) }}
            </span>
          </div>
          <div
            v-if="modelValue.description"
            class="flex items-start justify-between"
          >
            <span class="text-gray-600 dark:text-gray-400">Description:</span>
            <span
              class="font-medium text-gray-900 dark:text-white text-right max-w-xs"
            >
              {{ modelValue.description }}
            </span>
          </div>
          <div
            v-if="modelValue.tags.length > 0"
            class="flex items-start justify-between"
          >
            <span class="text-gray-600 dark:text-gray-400">Tags:</span>
            <div class="flex flex-wrap gap-1 max-w-xs">
              <UBadge
                v-for="tag in modelValue.tags"
                :key="tag"
                size="xs"
                color="gray"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="terms-section">
        <UCheckbox
          v-model="acceptTerms"
          label="I agree to the marketplace terms and conditions"
          class="mb-4"
        />
        <UCheckbox
          v-model="confirmOwnership"
          label="I confirm that I own these NFTs and have the right to list them"
          class="mb-4"
        />
      </div>

      <!-- Cost Breakdown -->
      <div class="cost-breakdown">
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Cost Breakdown
        </h4>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400">Listing Fee:</span>
            <span class="font-medium text-gray-900 dark:text-white">Free</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600 dark:text-gray-400"
              >Transaction Fee:</span
            >
            <span class="font-medium text-gray-900 dark:text-white"
              >2.5% on sale</span
            >
          </div>
          <div
            class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2"
          >
            <span class="font-medium text-gray-900 dark:text-white"
              >Total to pay now:</span
            >
            <span class="font-bold text-gray-900 dark:text-white"
              >0 {{ modelValue.paymentToken.symbol }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Step Actions -->
    <div class="step-actions flex justify-between mt-8">
      <UButton variant="outline" @click="$emit('prev')">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Back
      </UButton>
      <UButton :disabled="!canCreate" :loading="creating" @click="handleCreate">
        <UIcon name="i-heroicons-plus" class="mr-2" />
        Create Listing
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    modelValue: {
      selectedNFTs: Array<{
        canisterId: string
        tokenId: bigint
        metadata: unknown
      }>
      askType: 'buynow' | 'auction' | 'dutch' | 'amm'
      paymentToken: {
        canisterId: string
        symbol: string
        decimals: number
      }
      buyNowPrice: string
      auction: {
        startPrice: string
        reservePrice: string
        minIncrease: {
          type: 'amount' | 'percentage'
          value: string
        }
        waitForQuiet?: {
          window: string
          extension: string
          fade: string
          max: string
        }
      }
      dutch: {
        startPrice: string
        endPrice: string
        timeUnit: 'seconds' | 'minutes' | 'hours' | 'days'
        timeValue: string
        decayType: 'flat' | 'percent'
        decayValue: string
      }
      amm: {
        token1: string
        token2: string
        max: string
        min: string
        decimals: number
      }
      expiresAt?: string
      description: string
      tags: string[]
    }
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: Props['modelValue']]
    next: []
    prev: []
    complete: [askData: unknown]
  }>()

  // State
  const acceptTerms = ref(false)
  const confirmOwnership = ref(false)
  const creating = ref(false)

  const askTypeLabel = computed(() => {
    const labels = {
      buynow: 'Buy Now',
      auction: 'Auction',
      dutch: 'Dutch Auction',
      amm: 'AMM',
    }
    return labels[props.modelValue.askType]
  })

  const canCreate = computed(() => {
    return acceptTerms.value && confirmOwnership.value && !creating.value
  })

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function handleCreate() {
    if (!canCreate.value) return

    creating.value = true

    try {
      // Here you would call the actual marketplace service to create the ask
      // For now, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Emit the complete event with the ask data
      emit('complete', {
        askFeatures: [], // This would be built from the wizard data
        wizardData: props.modelValue,
      })
    } catch (error) {
      console.error('Failed to create listing:', error)
      // Handle error - could show a toast or error message
    } finally {
      creating.value = false
    }
  }
</script>

<style scoped>
  .review-step {
    @apply max-w-4xl mx-auto;
  }

  .nft-preview-card {
    @apply border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
  }

  .nft-image {
    @apply relative;
  }
</style>
