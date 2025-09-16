<template>
  <UButton
    @click="$emit('buy')"
    :loading="loading"
    color="blue"
    size="lg"
    block
    icon="i-heroicons-shopping-cart"
  >
    Buy Now - {{ formatPrice(ask) }} NTRP
  </UButton>
</template>

<script setup lang="ts">
import type { AskStatus } from '../../declarations/marketplace/marketplace.did'
import { formatTokenAmount, getBuyNowPrice } from '~/utils/marketplace'

interface Props {
  ask: AskStatus
  loading?: boolean
}

defineProps<Props>()
defineEmits<{
  buy: []
}>()

const formatPrice = (ask: AskStatus) => {
  const price = getBuyNowPrice(ask.config)
  return price ? formatTokenAmount(price, 8) : 'N/A'
}
</script>
