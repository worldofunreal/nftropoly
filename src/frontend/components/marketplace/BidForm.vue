<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2"
        >Bid Amount (NTRP)</label
      >
      <UInput
        v-model="bidAmount"
        type="number"
        step="0.01"
        :min="minBid"
        placeholder="Enter bid amount"
      />
      <p class="text-xs text-gray-500 mt-1">Minimum bid: {{ minBid }} NTRP</p>
    </div>

    <UButton
      :loading="loading"
      :disabled="!isValidBid"
      color="green"
      size="lg"
      block
      icon="i-heroicons-hand-raised"
      @click="handleBid"
    >
      Place Bid
    </UButton>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  // import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
  import { parseTokenAmount } from '~/utils/marketplace'

  // interface Props {
  //   ask: AskStatus
  //   loading?: boolean
  // }

  // const props = defineProps<Props>()
  const emit = defineEmits<{
    bid: [amount: bigint]
  }>()

  const bidAmount = ref('')

  const minBid = computed(() => {
    // This would extract the minimum bid from auction info
    return '0.01'
  })

  const isValidBid = computed(() => {
    const amount = parseFloat(bidAmount.value)
    return amount > 0 && amount >= parseFloat(minBid.value)
  })

  const handleBid = () => {
    if (isValidBid.value) {
      const amount = parseTokenAmount(bidAmount.value, 8)
      emit('bid', amount)
    }
  }
</script>
