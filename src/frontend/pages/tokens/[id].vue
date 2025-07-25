<template>
  <div class="min-h-screen bg-neutral-950 text-white">
    <!-- Top Navigation Bar -->
    <div class="top-0 z-10 bg-neutral-900 border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Left Section - Token Identity -->
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <div>
              <h1 class="text-2xl font-bold">NYM</h1>
              <div class="flex items-center space-x-2 text-sm text-gray-400">
                <span>NYM</span>
                <UIcon name="i-heroicons-link" class="w-4 h-4" />
                <span>ETHEREUM</span>
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
                <span>TOKEN</span>
              </div>
            </div>
          </div>

          <!-- Right Section - Chart Controls & Settings -->
          <div class="flex items-center space-x-4">
            <!-- Timeframe Selection -->
            <div class="flex space-x-1">
              <UButton
                v-for="timeframe in timeframes"
                :key="timeframe"
                :variant="timeframe === '1d' ? 'solid' : 'ghost'"
                :color="timeframe === '1d' ? 'primary' : 'neutral'"
                size="sm"
                class="text-xs"
              >
                {{ timeframe }}
              </UButton>
            </div>

            <!-- Chart Type Toggle -->
            <div class="flex bg-neutral-800 rounded-lg p-1">
              <UButton
                variant="solid"
                color="primary"
                size="sm"
                class="text-xs"
              >
                <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
              </UButton>
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                class="text-xs"
              >
                <UIcon name="i-heroicons-chart-bar-square" class="w-4 h-4" />
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Token Information & Chart -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Price Header Section -->
          <div class="flex items-center space-x-4">
            <div class="text-4xl font-bold">$0.04752</div>
            <div class="flex items-center space-x-1 text-green-400">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-5 h-5" />
              <span class="text-lg font-semibold">8%</span>
            </div>
          </div>

          <!-- Price Chart -->
          <PriceChart />

          <!-- Key Metrics Bar -->
          <div class="grid grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-sm text-gray-400">CHAIN</div>
              <div class="font-semibold">ETHEREUM</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400">MARKET CAP</div>
              <div class="font-semibold">$6.5M</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400">1D VOLUME</div>
              <div class="font-semibold">$19.1K</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400">1D PRICE</div>
              <div class="font-semibold text-green-400">+9.3%</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400">1D MARKET CAP</div>
              <div class="font-semibold text-green-400">+9.3%</div>
            </div>
          </div>

          <!-- Attribution -->
          <div class="text-xs text-gray-500">
            Powered by CoinGecko API and Trading View.
          </div>
        </div>

        <!-- Right Column - Swap/Buy Widget -->
        <div class="lg:col-span-1">
          <TokenSwapWidget />
        </div>
      </div>
    </div>

    <!-- Bottom Section - Trending Tokens -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <TrendingTokens />
    </div>
  </div>
</template>

<script setup lang="ts">
import PriceChart from '~/components/token/PriceChart.vue'
import TokenSwapWidget from '~/components/token/TokenSwapWidget.vue'
import TrendingTokens from '~/components/token/TrendingTokens.vue'

const timeframes = ['All', '1y', '30d', '7d', '1d']
</script>
