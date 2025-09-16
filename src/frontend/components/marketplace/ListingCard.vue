<template>
  <div
    class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click', ask)"
  >
    <div class="p-4">
      <div class="flex space-x-4">
        <!-- NFT Image -->
        <div
          class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            NFT #{{ ask.ask_id.toString() }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Listed by {{ formatPrincipal(ask.seller.owner.toString()) }}
          </p>

          <!-- Status Badge -->
          <div class="mt-2">
            <UBadge
              :color="getStatusColor(ask.status)"
              variant="soft"
              size="sm"
            >
              {{ getStatusText(ask.status) }}
            </UBadge>
          </div>

          <!-- Features -->
          <div class="mt-2 flex space-x-2">
            <UBadge v-if="hasBuyNow" color="blue" variant="outline" size="xs">
              Buy Now
            </UBadge>
            <UBadge v-if="hasAuction" color="green" variant="outline" size="xs">
              Auction
            </UBadge>
            <UBadge v-if="hasDutch" color="purple" variant="outline" size="xs">
              Dutch
            </UBadge>
          </div>
        </div>

        <!-- Price and Actions -->
        <div class="text-right flex-shrink-0">
          <div class="text-xl font-bold text-gray-900">
            {{ formatPrice(ask) }}
          </div>
          <div class="text-sm text-gray-500">NTRP</div>

          <!-- Participants -->
          <div class="mt-2 text-xs text-gray-500">
            {{ ask.participants.length }} participants
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
  import {
    getAskStatusText,
    getAskStatusColor,
    formatTokenAmount,
    hasBuyNowFeature,
    hasAuctionFeature,
    hasDutchFeature,
    getBuyNowPrice,
  } from '~/utils/marketplace'

  interface Props {
    ask: AskStatus
  }

  defineProps<Props>()
  defineEmits<{
    click: [ask: AskStatus]
  }>()

  // Helper functions
  const getStatusText = (status: unknown) => getAskStatusText(status)
  const getStatusColor = (status: unknown) => getAskStatusColor(status)

  const formatPrice = (ask: AskStatus) => {
    const price = getBuyNowPrice(ask.config)
    return price ? formatTokenAmount(price, 8) : 'N/A'
  }

  const hasBuyNow = computed(() => hasBuyNowFeature(props.ask.config))
  const hasAuction = computed(() => hasAuctionFeature(props.ask.config))
  const hasDutch = computed(() => hasDutchFeature(props.ask.config))

  const formatPrincipal = (principal: string) => {
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`
  }
</script>
