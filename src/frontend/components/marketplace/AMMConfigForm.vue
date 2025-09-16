<template>
  <div class="amm-config-form">
    <div class="form-header mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        AMM Configuration
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Configure your Automated Market Maker parameters
      </p>
    </div>

    <div class="space-y-6">
      <!-- Feature Flag Warning -->
      <UAlert
        v-if="!isAMMEnabled()"
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
        variant="soft"
        title="AMM Feature Disabled"
        description="AMM functionality is currently disabled. Contact an administrator to enable this feature."
      />

      <!-- Token Pair Selection -->
      <div class="token-pair-section">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Token Pair
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Token 1" name="token1">
            <USelectMenu
              v-model="config.token1"
              :options="availableTokens"
              placeholder="Select first token"
              value-attribute="canisterId"
              option-attribute="symbol"
              class="w-full"
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
                  <span>{{ token.name }} ({{ token.symbol }})</span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>

          <UFormGroup label="Token 2" name="token2">
            <USelectMenu
              v-model="config.token2"
              :options="availableTokens"
              placeholder="Select second token"
              value-attribute="canisterId"
              option-attribute="symbol"
              class="w-full"
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
                  <span>{{ token.name }} ({{ token.symbol }})</span>
                </div>
              </template>
            </USelectMenu>
          </UFormGroup>
        </div>

        <!-- Token Pair Info -->
        <div
          v-if="config.token1 && config.token2"
          class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div class="flex items-center space-x-2">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
            />
            <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
              Trading Pair: {{ getTokenSymbol(config.token1) }}/{{
                getTokenSymbol(config.token2)
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Price Range -->
      <div class="price-range-section">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Price Range
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Minimum Price" name="minPrice">
            <UInput
              v-model="config.minPrice"
              type="number"
              :min="0"
              :step="getPriceStep()"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ getTokenSymbol(config.token2) }}
                </span>
              </template>
            </UInput>
          </UFormGroup>

          <UFormGroup label="Maximum Price" name="maxPrice">
            <UInput
              v-model="config.maxPrice"
              type="number"
              :min="0"
              :step="getPriceStep()"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ getTokenSymbol(config.token2) }}
                </span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <!-- Price Range Visualization -->
        <div v-if="config.minPrice && config.maxPrice" class="mt-4">
          <div
            class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2"
          >
            <span>Price Range</span>
            <span
              >{{ config.minPrice }} - {{ config.maxPrice }}
              {{ getTokenSymbol(config.token2) }}</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      <!-- Liquidity Parameters -->
      <div class="liquidity-section">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Liquidity Parameters
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup
            label="Initial Liquidity (Token 1)"
            name="initialLiquidity1"
          >
            <UInput
              v-model="config.initialLiquidity1"
              type="number"
              :min="0"
              :step="getTokenStep(config.token1)"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ getTokenSymbol(config.token1) }}
                </span>
              </template>
            </UInput>
          </UFormGroup>

          <UFormGroup
            label="Initial Liquidity (Token 2)"
            name="initialLiquidity2"
          >
            <UInput
              v-model="config.initialLiquidity2"
              type="number"
              :min="0"
              :step="getTokenStep(config.token2)"
              placeholder="0.00"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ getTokenSymbol(config.token2) }}
                </span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <!-- Liquidity Balance Check -->
        <div
          v-if="config.initialLiquidity1 && config.initialLiquidity2"
          class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
        >
          <div class="flex items-center space-x-2">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-5 h-5 text-green-600 dark:text-green-400"
            />
            <span
              class="text-sm font-medium text-green-900 dark:text-green-100"
            >
              Liquidity Pool: {{ config.initialLiquidity1 }}
              {{ getTokenSymbol(config.token1) }} +
              {{ config.initialLiquidity2 }} {{ getTokenSymbol(config.token2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fee Configuration -->
      <div class="fee-section">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Fee Configuration
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Trading Fee (%)" name="tradingFee">
            <UInput
              v-model="config.tradingFee"
              type="number"
              :min="0"
              :max="10"
              :step="0.01"
              placeholder="0.30"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">%</span>
              </template>
            </UInput>
          </UFormGroup>

          <UFormGroup label="Protocol Fee (%)" name="protocolFee">
            <UInput
              v-model="config.protocolFee"
              type="number"
              :min="0"
              :max="5"
              :step="0.01"
              placeholder="0.05"
              class="w-full"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-sm">%</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <!-- Fee Summary -->
        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">Trading Fee:</span>
              <span class="font-medium text-gray-900 dark:text-white"
                >{{ config.tradingFee || '0.30' }}%</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400"
                >Protocol Fee:</span
              >
              <span class="font-medium text-gray-900 dark:text-white"
                >{{ config.protocolFee || '0.05' }}%</span
              >
            </div>
            <div
              class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2"
            >
              <span class="font-medium text-gray-900 dark:text-white"
                >Total Fee:</span
              >
              <span class="font-bold text-gray-900 dark:text-white">
                {{
                  (
                    parseFloat(config.tradingFee || '0.30') +
                    parseFloat(config.protocolFee || '0.05')
                  ).toFixed(2)
                }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="advanced-settings">
        <UAccordion :items="advancedItems">
          <template #default="{ item, open }">
            <UButton
              :color="open ? 'primary' : 'gray'"
              :variant="open ? 'solid' : 'ghost'"
              :ui="{ rounded: 'rounded-lg', padding: { sm: 'p-4' } }"
              class="w-full justify-between"
            >
              <span class="font-medium">{{ item.label }}</span>
              <UIcon
                :name="
                  open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
                "
                class="w-5 h-5 transition-transform duration-200"
                :class="open ? 'rotate-180' : ''"
              />
            </UButton>
          </template>

          <template #item>
            <div class="p-4 space-y-4">
              <UFormGroup
                label="Slippage Tolerance (%)"
                name="slippageTolerance"
              >
                <UInput
                  v-model="config.slippageTolerance"
                  type="number"
                  :min="0.1"
                  :max="50"
                  :step="0.1"
                  placeholder="0.5"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-sm"
                      >%</span
                    >
                  </template>
                </UInput>
              </UFormGroup>

              <UFormGroup label="Minimum Trade Size" name="minTradeSize">
                <UInput
                  v-model="config.minTradeSize"
                  type="number"
                  :min="0"
                  :step="getPriceStep()"
                  placeholder="0.01"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">
                      {{ getTokenSymbol(config.token2) }}
                    </span>
                  </template>
                </UInput>
              </UFormGroup>

              <UFormGroup label="Maximum Trade Size" name="maxTradeSize">
                <UInput
                  v-model="config.maxTradeSize"
                  type="number"
                  :min="0"
                  :step="getPriceStep()"
                  placeholder="1000.00"
                  class="w-full"
                >
                  <template #trailing>
                    <span class="text-gray-500 dark:text-gray-400 text-sm">
                      {{ getTokenSymbol(config.token2) }}
                    </span>
                  </template>
                </UInput>
              </UFormGroup>
            </div>
          </template>
        </UAccordion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { isAMMEnabled } from '~/utils/feature-flags'

  interface Token {
    canisterId: string
    name: string
    symbol: string
    decimals: number
  }

  interface AMMConfig {
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

  interface Props {
    modelValue: AMMConfig
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: AMMConfig]
  }>()

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

  const config = ref<AMMConfig>({
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
    ...props.modelValue,
  })

  const advancedItems = [
    {
      label: 'Advanced Settings',
      content: 'Advanced AMM configuration options',
    },
  ]

  // Watch for changes in config and emit updates
  watch(
    config,
    newConfig => {
      emit('update:modelValue', { ...newConfig })
    },
    { deep: true }
  )

  // Watch for changes in props
  watch(
    () => props.modelValue,
    newValue => {
      config.value = { ...newValue }
    },
    { deep: true }
  )

  function getTokenSymbol(canisterId: string): string {
    const token = availableTokens.find(t => t.canisterId === canisterId)
    return token?.symbol || 'UNK'
  }

  function getTokenStep(canisterId?: string): string {
    if (!canisterId) return '0.00000001'
    const token = availableTokens.find(t => t.canisterId === canisterId)
    if (!token) return '0.00000001'
    return (1 / Math.pow(10, token.decimals)).toString()
  }

  function getPriceStep(): string {
    // Default to 8 decimal places for price calculations
    return '0.00000001'
  }
</script>

<style scoped>
  .amm-config-form {
    @apply max-w-4xl mx-auto;
  }
</style>
