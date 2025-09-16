<template>
  <div class="amm-trading-interface">
    <div class="trading-header mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        AMM Trading
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Trade tokens in the automated market maker
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Trading Panel -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Feature Flag Warning -->
        <UAlert
          v-if="!isAMMEnabled()"
          icon="i-heroicons-exclamation-triangle"
          color="yellow"
          variant="soft"
          title="AMM Feature Disabled"
          description="AMM trading is currently disabled. Contact an administrator to enable this feature."
        />

        <!-- Trade Form -->
        <UCard v-if="isAMMEnabled()">
          <template #header>
            <div class="flex items-center justify-between">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white">
                Place Trade
              </h4>
              <UButton size="sm" variant="outline" @click="swapTokens">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-1" />
                Swap
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <!-- From Token -->
            <div class="from-token">
              <UFormGroup label="From" name="fromToken">
                <div class="flex items-center space-x-3">
                  <USelectMenu
                    v-model="trade.fromToken"
                    :options="availableTokens"
                    placeholder="Select token"
                    value-attribute="canisterId"
                    option-attribute="symbol"
                    class="flex-1"
                  >
                    <template #option="{ option: token }">
                      <div class="flex items-center space-x-2">
                        <div
                          class="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                        >
                          <span class="text-xs font-medium">{{
                            token.symbol.charAt(0)
                          }}</span>
                        </div>
                        <span>{{ token.symbol }}</span>
                      </div>
                    </template>
                  </USelectMenu>
                  <UInput
                    v-model="trade.fromAmount"
                    type="number"
                    :min="0"
                    :step="getTokenStep(trade.fromToken)"
                    placeholder="0.00"
                    class="w-32"
                  />
                </div>
              </UFormGroup>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center">
              <UButton size="sm" variant="outline" @click="swapTokens">
                <UIcon name="i-heroicons-arrow-down" class="w-4 h-4" />
              </UButton>
            </div>

            <!-- To Token -->
            <div class="to-token">
              <UFormGroup label="To" name="toToken">
                <div class="flex items-center space-x-3">
                  <USelectMenu
                    v-model="trade.toToken"
                    :options="availableTokens"
                    placeholder="Select token"
                    value-attribute="canisterId"
                    option-attribute="symbol"
                    class="flex-1"
                  >
                    <template #option="{ option: token }">
                      <div class="flex items-center space-x-2">
                        <div
                          class="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                        >
                          <span class="text-xs font-medium">{{
                            token.symbol.charAt(0)
                          }}</span>
                        </div>
                        <span>{{ token.symbol }}</span>
                      </div>
                    </template>
                  </USelectMenu>
                  <UInput
                    v-model="trade.toAmount"
                    type="number"
                    :min="0"
                    :step="getTokenStep(trade.toToken)"
                    placeholder="0.00"
                    class="w-32"
                    readonly
                  />
                </div>
              </UFormGroup>
            </div>

            <!-- Trade Details -->
            <div
              v-if="trade.fromAmount && trade.toAmount"
              class="trade-details"
            >
              <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Exchange Rate:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">
                    1 {{ getTokenSymbol(trade.fromToken) }} =
                    {{ exchangeRate }} {{ getTokenSymbol(trade.toToken) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Price Impact:</span
                  >
                  <span class="font-medium" :class="priceImpactClass">
                    {{ priceImpact }}%
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Trading Fee:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ tradingFee }} {{ getTokenSymbol(trade.fromToken) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400"
                    >Minimum Received:</span
                  >
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ minimumReceived }} {{ getTokenSymbol(trade.toToken) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Trade Button -->
            <UButton
              :disabled="!canTrade"
              :loading="trading"
              class="w-full"
              @click="executeTrade"
            >
              {{ trading ? 'Trading...' : 'Execute Trade' }}
            </UButton>
          </div>
        </UCard>

        <!-- Recent Trades -->
        <UCard>
          <template #header>
            <h4 class="text-md font-semibold text-gray-900 dark:text-white">
              Recent Trades
            </h4>
          </template>

          <div class="space-y-2">
            <div
              v-for="tradeItem in recentTrades"
              :key="tradeItem.id"
              class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-heroicons-arrow-path"
                    class="w-4 h-4 text-gray-600 dark:text-gray-400"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ tradeItem.fromAmount }} {{ tradeItem.fromSymbol }} →
                    {{ tradeItem.toAmount }} {{ tradeItem.toSymbol }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTime(tradeItem.timestamp) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  class="text-sm font-medium"
                  :class="
                    tradeItem.type === 'buy'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ tradeItem.type === 'buy' ? '+' : '-'
                  }}{{ tradeItem.price }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ tradeItem.status }}
                </p>
              </div>
            </div>

            <div v-if="recentTrades.length === 0" class="text-center py-8">
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <p class="text-gray-600 dark:text-gray-400">No recent trades</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Info Panel -->
      <div class="space-y-6">
        <!-- Pool Info -->
        <UCard>
          <template #header>
            <h4 class="text-md font-semibold text-gray-900 dark:text-white">
              Pool Information
            </h4>
          </template>

          <div class="space-y-4">
            <div class="pool-tokens">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >Token 1:</span
                >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ poolInfo.token1Amount }} {{ poolInfo.token1Symbol }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >Token 2:</span
                >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ poolInfo.token2Amount }} {{ poolInfo.token2Symbol }}
                </span>
              </div>
            </div>

            <div class="pool-stats">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >Total Liquidity:</span
                >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  ${{ poolInfo.totalLiquidity }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >24h Volume:</span
                >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  ${{ poolInfo.volume24h }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >Trading Fee:</span
                >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ poolInfo.tradingFee }}%
                </span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Price Chart Placeholder -->
        <UCard>
          <template #header>
            <h4 class="text-md font-semibold text-gray-900 dark:text-white">
              Price Chart
            </h4>
          </template>

          <div
            class="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="text-center">
              <UIcon
                name="i-heroicons-chart-bar"
                class="w-12 h-12 text-gray-400 mx-auto mb-2"
              />
              <p class="text-gray-600 dark:text-gray-400">Chart coming soon</p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { isAMMEnabled } from '~/utils/feature-flags'

  interface Token {
    canisterId: string
    name: string
    symbol: string
    decimals: number
  }

  interface Trade {
    fromToken: string
    toToken: string
    fromAmount: string
    toAmount: string
  }

  interface RecentTrade {
    id: string
    fromAmount: string
    fromSymbol: string
    toAmount: string
    toSymbol: string
    price: string
    type: 'buy' | 'sell'
    status: string
    timestamp: number
  }

  interface PoolInfo {
    token1Amount: string
    token1Symbol: string
    token2Amount: string
    token2Symbol: string
    totalLiquidity: string
    volume24h: string
    tradingFee: string
  }

  const availableTokens: Token[] = [
    {
      canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
      name: 'Internet Computer',
      symbol: 'ICP',
      decimals: 8,
    },
    {
      canisterId: 'uzt4z-lp777-77774-qaabq-cai',
      name: 'NFTropoly Token',
      symbol: 'NTP',
      decimals: 8,
    },
  ]

  // State
  const trade = ref<Trade>({
    fromToken: '',
    toToken: '',
    fromAmount: '',
    toAmount: '',
  })

  const trading = ref(false)
  const recentTrades = ref<RecentTrade[]>([])

  const poolInfo = ref<PoolInfo>({
    token1Amount: '1000.00',
    token1Symbol: 'ICP',
    token2Amount: '5000.00',
    token2Symbol: 'NTP',
    totalLiquidity: '10,000',
    volume24h: '2,500',
    tradingFee: '0.30',
  })

  // Computed
  const exchangeRate = computed(() => {
    if (!trade.value.fromAmount || !trade.value.toAmount) return '0.00'
    const rate =
      parseFloat(trade.value.toAmount) / parseFloat(trade.value.fromAmount)
    return rate.toFixed(6)
  })

  const priceImpact = computed(() => {
    // Mock calculation - in real app this would be calculated based on pool reserves
    if (!trade.value.fromAmount) return '0.00'
    const impact = Math.min(parseFloat(trade.value.fromAmount) * 0.01, 5.0)
    return impact.toFixed(2)
  })

  const priceImpactClass = computed(() => {
    const impact = parseFloat(priceImpact.value)
    if (impact < 1) return 'text-green-600 dark:text-green-400'
    if (impact < 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  })

  const tradingFee = computed(() => {
    if (!trade.value.fromAmount) return '0.00'
    const fee = parseFloat(trade.value.fromAmount) * 0.003 // 0.3% fee
    return fee.toFixed(6)
  })

  const minimumReceived = computed(() => {
    if (!trade.value.toAmount) return '0.00'
    const slippage = 0.5 // 0.5% slippage tolerance
    const min = parseFloat(trade.value.toAmount) * (1 - slippage / 100)
    return min.toFixed(6)
  })

  const canTrade = computed(() => {
    return (
      trade.value.fromToken &&
      trade.value.toToken &&
      trade.value.fromAmount &&
      parseFloat(trade.value.fromAmount) > 0 &&
      !trading.value
    )
  })

  // Methods
  function getTokenSymbol(canisterId: string): string {
    const token = availableTokens.find(t => t.canisterId === canisterId)
    return token?.symbol || 'UNK'
  }

  function getTokenStep(canisterId: string): string {
    const token = availableTokens.find(t => t.canisterId === canisterId)
    if (!token) return '0.00000001'
    return (1 / Math.pow(10, token.decimals)).toString()
  }

  function swapTokens() {
    const temp = trade.value.fromToken
    trade.value.fromToken = trade.value.toToken
    trade.value.toToken = temp

    const tempAmount = trade.value.fromAmount
    trade.value.fromAmount = trade.value.toAmount
    trade.value.toAmount = tempAmount
  }

  async function executeTrade() {
    if (!canTrade.value) return

    trading.value = true

    try {
      // Mock trade execution
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Add to recent trades
      const newTrade: RecentTrade = {
        id: Date.now().toString(),
        fromAmount: trade.value.fromAmount,
        fromSymbol: getTokenSymbol(trade.value.fromToken),
        toAmount: trade.value.toAmount,
        toSymbol: getTokenSymbol(trade.value.toToken),
        price: exchangeRate.value,
        type: 'buy', // Simplified
        status: 'Completed',
        timestamp: Date.now(),
      }

      recentTrades.value.unshift(newTrade)

      // Reset form
      trade.value.fromAmount = ''
      trade.value.toAmount = ''
    } catch (error) {
      console.error('Trade failed:', error)
      // Handle error - could show a toast
    } finally {
      trading.value = false
    }
  }

  function formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Watch for changes in from amount to calculate to amount
  watch(
    [
      () => trade.value.fromAmount,
      () => trade.value.fromToken,
      () => trade.value.toToken,
    ],
    () => {
      if (
        trade.value.fromAmount &&
        trade.value.fromToken &&
        trade.value.toToken
      ) {
        // Mock calculation - in real app this would call the AMM contract
        const amount = parseFloat(trade.value.fromAmount)
        const rate = 5.0 // Mock exchange rate
        trade.value.toAmount = (amount * rate).toFixed(6)
      } else {
        trade.value.toAmount = ''
      }
    }
  )

  onMounted(() => {
    // Load recent trades
    recentTrades.value = [
      {
        id: '1',
        fromAmount: '10.00',
        fromSymbol: 'ICP',
        toAmount: '50.00',
        toSymbol: 'NTP',
        price: '5.00',
        type: 'buy',
        status: 'Completed',
        timestamp: Date.now() - 300000, // 5 minutes ago
      },
      {
        id: '2',
        fromAmount: '25.00',
        fromSymbol: 'NTP',
        toAmount: '5.00',
        toSymbol: 'ICP',
        price: '0.20',
        type: 'sell',
        status: 'Completed',
        timestamp: Date.now() - 900000, // 15 minutes ago
      },
    ]
  })
</script>

<style scoped>
  .amm-trading-interface {
    @apply max-w-7xl mx-auto;
  }
</style>
