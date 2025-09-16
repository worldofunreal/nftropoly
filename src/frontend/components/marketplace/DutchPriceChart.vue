<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h4 class="text-sm font-medium text-gray-900 mb-4">Dutch Auction Price</h4>

    <!-- Price Display -->
    <div class="text-center mb-4">
      <div class="text-2xl font-bold text-gray-900">{{ currentPrice }}</div>
      <div class="text-sm text-gray-500">Current Price (NTRP)</div>
    </div>

    <!-- Simple Chart -->
    <div class="relative h-32 bg-white rounded border">
      <svg
        class="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <!-- Price line -->
        <polyline
          :points="priceLinePoints"
          fill="none"
          stroke="#3B82F6"
          stroke-width="2"
        />

        <!-- Current price indicator -->
        <circle :cx="currentPriceX" :cy="currentPriceY" r="3" fill="#EF4444" />
      </svg>

      <!-- Labels -->
      <div class="absolute bottom-0 left-0 text-xs text-gray-500">
        {{ startPrice }} NTRP
      </div>
      <div class="absolute bottom-0 right-0 text-xs text-gray-500">
        {{ endPrice }} NTRP
      </div>
    </div>

    <!-- Time Info -->
    <div class="mt-4 text-center text-sm text-gray-500">
      <div>Time Remaining: {{ timeRemaining }}</div>
      <div>Price decreases every {{ decayInterval }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
  // import { formatTokenAmount, getTimeRemaining } from '~/utils/marketplace'

  interface Props {
    ask: AskStatus
  }

  const props = defineProps<Props>()

  // Extract Dutch auction parameters (simplified)
  const startPrice = computed(() => {
    // This would extract from ask.config Dutch feature
    return '100.00'
  })

  const endPrice = computed(() => {
    // This would extract from ask.config Dutch feature
    return '10.00'
  })

  const currentPrice = computed(() => {
    // This would calculate current price based on time and decay
    const now = Date.now()
    const start = Number(props.ask.ask_id) // Simplified
    const elapsed = now - start
    const totalTime = 24 * 60 * 60 * 1000 // 24 hours

    const startP = parseFloat(startPrice.value)
    const endP = parseFloat(endPrice.value)
    const progress = Math.min(1, elapsed / totalTime)

    return (startP - (startP - endP) * progress).toFixed(2)
  })

  const timeRemaining = computed(() => {
    // This would calculate based on actual auction end time
    return '18h 32m'
  })

  const decayInterval = computed(() => {
    // This would extract from ask.config Dutch feature
    return '1 hour'
  })

  // Chart points (simplified)
  const priceLinePoints = computed(() => {
    const startP = parseFloat(startPrice.value)
    const endP = parseFloat(endPrice.value)

    const points = []
    for (let i = 0; i <= 100; i += 10) {
      const x = i
      const y = 100 - (((startP - endP) * (i / 100)) / (startP - endP)) * 100
      points.push(`${x},${y}`)
    }

    return points.join(' ')
  })

  const currentPriceX = computed(() => {
    // Calculate X position based on current time
    return 50 // Simplified
  })

  const currentPriceY = computed(() => {
    // Calculate Y position based on current price
    const startP = parseFloat(startPrice.value)
    const endP = parseFloat(endPrice.value)
    const currentP = parseFloat(currentPrice.value)

    return 100 - ((currentP - endP) / (startP - endP)) * 100
  })
</script>
