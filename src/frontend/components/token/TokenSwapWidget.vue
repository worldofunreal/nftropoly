<template>
  <div class="bg-neutral-900 rounded-lg p-6 space-y-6">
    <!-- Header Tabs -->
    <div class="flex items-center justify-between">
      <div class="flex space-x-6">
        <button
          class="text-white font-semibold border-b-2 border-blue-500 pb-2"
        >
          Swap
        </button>
        <button
          class="text-gray-400 font-semibold hover:text-white transition-colors"
        >
          Buy
        </button>
      </div>
      <UButton variant="ghost" color="neutral" size="sm">
        <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
      </UButton>
    </div>

    <!-- Sell Section -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-gray-300">Sell</label>
      <div class="space-y-2">
        <UInput
          v-model="sellAmount"
          type="number"
          placeholder="0"
          class="text-right"
        />
        <div class="text-sm text-gray-400 text-right">$0.00</div>
        <div class="flex items-center justify-between">
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            class="flex items-center space-x-2"
          >
            <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <span>ETH</span>
            <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
          </UButton>
          <div class="text-sm text-gray-400">
            <span>0.00 ETH</span>
            <UButton variant="ghost" color="primary" size="xs" class="ml-2">
              Max
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Swap Direction Icon -->
    <div class="flex justify-center">
      <div class="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
        <UIcon name="i-heroicons-arrow-down" class="w-5 h-5 text-gray-400" />
      </div>
    </div>

    <!-- Buy Section -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-gray-300">Buy</label>
      <div class="space-y-2">
        <UInput
          v-model="buyAmount"
          type="number"
          placeholder="0"
          class="text-right"
        />
        <div class="text-sm text-gray-400 text-right">$0.00</div>
        <div class="flex items-center justify-between">
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            class="flex items-center space-x-2"
          >
            <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              N
            </div>
            <span>NYM</span>
            <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
          </UButton>
          <div class="text-sm text-gray-400">
            <span>0.00 NYM</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <UButton
      color="primary"
      size="lg"
      class="w-full"
    >
      Connect Wallet
    </UButton>
  </div>
</template>

<script setup lang="ts">
const sellAmount = ref('')
const buyAmount = ref('')
</script> 