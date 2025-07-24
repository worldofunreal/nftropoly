<template>
  <div class="container mx-auto py-10">
    <h1 class="text-3xl font-bold mb-4">Token details for: {{ symbol }}</h1>
    <p class="text-gray-600">This is a placeholder page for token <span class="font-mono bg-gray-100 px-2 py-1 rounded">{{ symbol }}</span>.</p>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const symbol = route.params.symbol as string
</script> 