<template>
  <div class="amm-page">
    <div class="page-header mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        AMM Trading
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Trade tokens using Automated Market Maker pools
      </p>
    </div>

    <!-- Feature Flag Check -->
    <div v-if="!isAMMEnabled()" class="mb-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
        variant="soft"
        title="AMM Feature Disabled"
        description="AMM trading is currently disabled. Contact an administrator to enable this feature."
      />
    </div>

    <!-- AMM Content -->
    <div v-else class="space-y-8">
      <!-- Pool Overview -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Available Pools
            </h2>
            <UButton @click="refreshPools">
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
              Refresh
            </UButton>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="pool in pools"
            :key="pool.id"
            class="pool-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
            @click="selectPool(pool)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-medium">{{
                    pool.token1Symbol.charAt(0)
                  }}</span>
                </div>
                <div
                  class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center -ml-2"
                >
                  <span class="text-sm font-medium">{{
                    pool.token2Symbol.charAt(0)
                  }}</span>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ pool.token1Symbol }}/{{ pool.token2Symbol }}
                </span>
              </div>
              <UBadge
                :color="pool.status === 'active' ? 'green' : 'gray'"
                variant="soft"
              >
                {{ pool.status }}
              </UBadge>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Liquidity:</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >${{ pool.liquidity }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400"
                  >24h Volume:</span
                >
                <span class="font-medium text-gray-900 dark:text-white"
                  >${{ pool.volume24h }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Fee:</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >{{ pool.fee }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-if="pools.length === 0" class="text-center py-8">
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Pools Available
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            There are no AMM pools available for trading yet.
          </p>
          <UButton @click="createPool"> Create Pool </UButton>
        </div>
      </UCard>

      <!-- Selected Pool Trading Interface -->
      <div v-if="selectedPool">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Trade {{ selectedPool.token1Symbol }}/{{
                  selectedPool.token2Symbol
                }}
              </h2>
              <UButton variant="outline" @click="selectedPool = null">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-2" />
                Close
              </UButton>
            </div>
          </template>

          <AMMTradingInterface :pool="selectedPool" />
        </UCard>
      </div>

      <!-- Create Pool Section -->
      <UCard v-if="showCreatePool">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Pool
            </h2>
            <UButton variant="outline" @click="showCreatePool = false">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-2" />
              Cancel
            </UButton>
          </div>
        </template>

        <AMMConfigForm v-model="poolConfig" @submit="handleCreatePool" />
      </UCard>

      <!-- Pool Management -->
      <UCard v-if="userPools.length > 0">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Your Pools
          </h2>
        </template>

        <div class="space-y-4">
          <div
            v-for="pool in userPools"
            :key="pool.id"
            class="pool-management-item border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
                >
                  <span class="text-sm font-medium">{{
                    pool.token1Symbol.charAt(0)
                  }}</span>
                </div>
                <div
                  class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center -ml-2"
                >
                  <span class="text-sm font-medium">{{
                    pool.token2Symbol.charAt(0)
                  }}</span>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ pool.token1Symbol }}/{{ pool.token2Symbol }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <UBadge
                  :color="pool.status === 'active' ? 'green' : 'gray'"
                  variant="soft"
                >
                  {{ pool.status }}
                </UBadge>
                <UButton size="sm" variant="outline" @click="managePool(pool)">
                  Manage
                </UButton>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400"
                  >Your Liquidity:</span
                >
                <p class="font-medium text-gray-900 dark:text-white">
                  ${{ pool.yourLiquidity }}
                </p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">24h Fees:</span>
                <p class="font-medium text-gray-900 dark:text-white">
                  ${{ pool.fees24h }}
                </p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400"
                  >Total Fees:</span
                >
                <p class="font-medium text-gray-900 dark:text-white">
                  ${{ pool.totalFees }}
                </p>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">APR:</span>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ pool.apr }}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { isAMMEnabled } from '~/utils/feature-flags'
  import AMMTradingInterface from '~/components/marketplace/AMMTradingInterface.vue'
  import AMMConfigForm from '~/components/marketplace/AMMConfigForm.vue'

  interface Pool {
    id: string
    token1Symbol: string
    token2Symbol: string
    liquidity: string
    volume24h: string
    fee: string
    status: 'active' | 'inactive' | 'paused'
    yourLiquidity?: string
    fees24h?: string
    totalFees?: string
    apr?: string
  }

  interface PoolConfig {
    token1: string
    token2: string
    minPrice: string
    maxPrice: string
    initialLiquidity1: string
    initialLiquidity2: string
    tradingFee: string
    protocolFee: string
    slippageTolerance: string
    minTradeSize: string
    maxTradeSize: string
  }

  // State
  const pools = ref<Pool[]>([])
  const selectedPool = ref<Pool | null>(null)
  const showCreatePool = ref(false)
  const userPools = ref<Pool[]>([])
  const poolConfig = ref<PoolConfig>({
    token1: '',
    token2: '',
    minPrice: '',
    maxPrice: '',
    initialLiquidity1: '',
    initialLiquidity2: '',
    tradingFee: '0.30',
    protocolFee: '0.05',
    slippageTolerance: '0.5',
    minTradeSize: '0.01',
    maxTradeSize: '1000.00',
  })

  // Methods
  async function refreshPools() {
    try {
      // Mock data - in real app this would fetch from the backend
      pools.value = [
        {
          id: '1',
          token1Symbol: 'ICP',
          token2Symbol: 'NTP',
          liquidity: '50,000',
          volume24h: '5,000',
          fee: '0.30',
          status: 'active',
        },
        {
          id: '2',
          token1Symbol: 'ICP',
          token2Symbol: 'BTC',
          liquidity: '25,000',
          volume24h: '2,500',
          fee: '0.30',
          status: 'active',
        },
      ]
    } catch (error) {
      console.error('Failed to refresh pools:', error)
    }
  }

  function selectPool(pool: Pool) {
    selectedPool.value = pool
  }

  function createPool() {
    showCreatePool.value = true
  }

  async function handleCreatePool() {
    try {
      // Mock pool creation - in real app this would call the backend
      console.log('Creating pool with config:', poolConfig.value)

      // Reset form
      poolConfig.value = {
        token1: '',
        token2: '',
        minPrice: '',
        maxPrice: '',
        initialLiquidity1: '',
        initialLiquidity2: '',
        tradingFee: '0.30',
        protocolFee: '0.05',
        slippageTolerance: '0.5',
        minTradeSize: '0.01',
        maxTradeSize: '1000.00',
      }

      showCreatePool.value = false
      await refreshPools()
    } catch (error) {
      console.error('Failed to create pool:', error)
    }
  }

  function managePool(pool: Pool) {
    // Navigate to pool management page or open modal
    console.log('Managing pool:', pool)
  }

  onMounted(() => {
    refreshPools()

    // Load user pools
    userPools.value = [
      {
        id: '3',
        token1Symbol: 'ICP',
        token2Symbol: 'NTP',
        liquidity: '10,000',
        volume24h: '1,000',
        fee: '0.30',
        status: 'active',
        yourLiquidity: '5,000',
        fees24h: '25.50',
        totalFees: '150.75',
        apr: '12.5',
      },
    ]
  })
</script>

<style scoped>
  .amm-page {
    @apply max-w-7xl mx-auto p-6;
  }

  .pool-card {
    @apply transition-all duration-200;
  }

  .pool-card:hover {
    @apply shadow-md;
  }

  .pool-management-item {
    @apply transition-all duration-200;
  }
</style>
