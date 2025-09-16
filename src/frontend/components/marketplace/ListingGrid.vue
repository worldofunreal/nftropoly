<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ListingCard
      v-for="ask in asks"
      :key="ask.ask_id.toString()"
      :ask="ask"
      @click="$emit('ask-click', ask)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AskStatus } from '../../declarations/marketplace/marketplace.did'

interface Props {
  asks: AskStatus[]
  loading?: boolean
}

defineProps<Props>()
defineEmits<{
  'ask-click': [ask: AskStatus]
}>()
</script>
