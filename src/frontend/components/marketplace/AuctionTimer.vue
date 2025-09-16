<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium text-gray-900">Auction Ends</h4>
        <p class="text-lg font-semibold text-gray-900">{{ timeRemaining }}</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500">Current Bid</div>
        <div class="text-lg font-semibold text-gray-900">{{ currentBid }}</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-4">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Started</span>
        <span>{{ progressPercentage }}%</span>
        <span>Ends</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-1000"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import type { AuctionInfo } from '../../declarations/marketplace/marketplace.did'
  import { formatTokenAmount, getTimeRemaining } from '~/utils/marketplace'

  interface Props {
    auctionInfo: AuctionInfo
  }

  const props = defineProps<Props>()

  const now = ref(BigInt(Date.now() * 1000000))
  let interval: NodeJS.Timeout

  const timeRemaining = computed(() => {
    if (props.auctionInfo.end_date?.[0]) {
      return getTimeRemaining(props.auctionInfo.end_date[0])
    }
    return 'N/A'
  })

  const currentBid = computed(() => {
    if (props.auctionInfo.current_bid_amount?.[0]) {
      return formatTokenAmount(props.auctionInfo.current_bid_amount[0], 8)
    }
    return 'No bids'
  })

  const progressPercentage = computed(() => {
    if (
      !props.auctionInfo.start_date?.[0] ||
      !props.auctionInfo.end_date?.[0]
    ) {
      return 0
    }

    const start = props.auctionInfo.start_date[0]
    const end = props.auctionInfo.end_date[0]
    const current = now.value

    if (current <= start) return 0
    if (current >= end) return 100

    const total = end - start
    const elapsed = current - start

    return Math.min(100, Math.max(0, Number((elapsed * BigInt(100)) / total)))
  })

  onMounted(() => {
    interval = setInterval(() => {
      now.value = BigInt(Date.now() * 1000000)
    }, 1000)
  })

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
</script>
