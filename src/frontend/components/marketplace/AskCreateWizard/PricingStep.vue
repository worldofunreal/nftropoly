<template>
  <div class="pricing-step">
    <div class="step-header mb-6">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        Set Pricing
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Choose how you want to sell your NFTs
      </p>
    </div>

    <!-- Ask Type Selection -->
    <div class="ask-type-selection mb-8">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Sale Type
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="type in askTypes"
          :key="type.value"
          class="ask-type-card"
          :class="{ selected: modelValue.askType === type.value }"
          @click="selectAskType(type.value)"
        >
          <UIcon :name="type.icon" class="text-2xl mb-2" />
          <h5 class="font-semibold text-gray-900 dark:text-white">
            {{ type.label }}
          </h5>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ type.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Payment Token Selection -->
    <div class="payment-token mb-8">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Payment Token
      </h4>
      <USelect
        :model-value="modelValue.paymentToken"
        :options="paymentTokenOptions"
        option-attribute="label"
        value-attribute="value"
        placeholder="Select payment token"
        @update:model-value="updatePaymentToken"
      />
    </div>

    <!-- Buy Now Pricing -->
    <div v-if="modelValue.askType === 'buynow'" class="buy-now-pricing">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Fixed Price
      </h4>
      <UInput
        :model-value="modelValue.buyNowPrice"
        type="number"
        step="0.00000001"
        placeholder="0.00"
        :suffix="modelValue.paymentToken.symbol"
        @update:model-value="updateBuyNowPrice"
      />
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Set a fixed price for immediate purchase
      </p>
    </div>

    <!-- Auction Pricing -->
    <div v-if="modelValue.askType === 'auction'" class="auction-pricing">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Auction Settings
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <UInput
          :model-value="modelValue.auction.startPrice"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Starting Price"
          :suffix="modelValue.paymentToken.symbol"
          @update:model-value="updateAuctionStartPrice"
        />
        <UInput
          :model-value="modelValue.auction.reservePrice"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Reserve Price (Optional)"
          :suffix="modelValue.paymentToken.symbol"
          @update:model-value="updateAuctionReservePrice"
        />
      </div>

      <div class="mb-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Minimum Bid Increase
        </label>
        <div class="flex gap-2">
          <USelect
            :model-value="modelValue.auction.minIncrease.type"
            :options="[
              { label: 'Fixed Amount', value: 'amount' },
              { label: 'Percentage', value: 'percentage' },
            ]"
            class="w-32"
            @update:model-value="updateAuctionMinIncreaseType"
          />
          <UInput
            :model-value="modelValue.auction.minIncrease.value"
            type="number"
            step="0.00000001"
            placeholder="0.00"
            :suffix="
              modelValue.auction.minIncrease.type === 'amount'
                ? modelValue.paymentToken.symbol
                : '%'
            "
            class="flex-1"
            @update:model-value="updateAuctionMinIncrease"
          />
        </div>
      </div>

      <UCheckbox
        :model-value="enableWaitForQuiet"
        label="Enable Wait for Quiet (Optional)"
        class="mb-4"
        @update:model-value="updateAuctionWaitForQuietEnabled"
      />

      <div
        v-if="enableWaitForQuiet"
        class="wait-for-quiet-settings grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <UInput
          :model-value="modelValue.auction.waitForQuiet.window"
          type="number"
          placeholder="300"
          label="Quiet Window (seconds)"
          @update:model-value="updateAuctionWaitForQuietWindow"
        />
        <UInput
          :model-value="modelValue.auction.waitForQuiet.extension"
          type="number"
          placeholder="60"
          label="Extension Time (seconds)"
          @update:model-value="updateAuctionWaitForQuietExtension"
        />
        <UInput
          :model-value="modelValue.auction.waitForQuiet.fade"
          type="number"
          step="0.01"
          placeholder="0.1"
          label="Fade Rate"
          @update:model-value="updateAuctionWaitForQuietFade"
        />
        <UInput
          :model-value="modelValue.auction.waitForQuiet.max"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Max Extension Price"
          :suffix="modelValue.paymentToken.symbol"
          @update:model-value="updateAuctionWaitForQuietMax"
        />
      </div>
    </div>

    <!-- Dutch Auction Pricing -->
    <div v-if="modelValue.askType === 'dutch'" class="dutch-pricing">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Dutch Auction Settings
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <UInput
          :model-value="modelValue.dutch.startPrice"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Starting Price"
          :suffix="modelValue.paymentToken.symbol"
          @update:model-value="updateDutchStartPrice"
        />
        <UInput
          :model-value="modelValue.dutch.endPrice"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Ending Price"
          :suffix="modelValue.paymentToken.symbol"
          @update:model-value="updateDutchEndPrice"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Duration
          </label>
          <div class="flex gap-2">
            <UInput
              :model-value="modelValue.dutch.timeValue"
              type="number"
              placeholder="24"
              class="flex-1"
              @update:model-value="updateDutchTimeValue"
            />
            <USelect
              :model-value="modelValue.dutch.timeUnit"
              :options="timeUnitOptions"
              class="w-24"
              @update:model-value="updateDutchTimeUnit"
            />
          </div>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Decay Type
          </label>
          <USelect
            :model-value="modelValue.dutch.decayType"
            :options="[
              { label: 'Fixed Amount', value: 'flat' },
              { label: 'Percentage', value: 'percent' },
            ]"
            @update:model-value="updateDutchDecayType"
          />
        </div>
      </div>

      <UInput
        :model-value="modelValue.dutch.decayValue"
        type="number"
        step="0.00000001"
        placeholder="0.00"
        label="Decay Value"
        :suffix="
          modelValue.dutch.decayType === 'flat'
            ? modelValue.paymentToken.symbol
            : '%'
        "
        @update:model-value="updateDutchDecayValue"
      />
    </div>

    <!-- AMM Pricing -->
    <div v-if="modelValue.askType === 'amm'" class="amm-pricing">
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        AMM Settings
      </h4>

      <UAlert
        v-if="!isAMMEnabled()"
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
        variant="soft"
        title="AMM Feature Disabled"
        description="AMM functionality is currently disabled. Contact an administrator to enable this feature."
        class="mb-4"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <USelect
          :model-value="modelValue.amm.token1"
          :options="paymentTokenOptions"
          option-attribute="label"
          value-attribute="value"
          label="Token 1"
          @update:model-value="updateAMMToken1"
        />
        <USelect
          :model-value="modelValue.amm.token2"
          :options="paymentTokenOptions"
          option-attribute="label"
          value-attribute="value"
          label="Token 2"
          @update:model-value="updateAMMToken2"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UInput
          :model-value="modelValue.amm.max"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Max Price"
          @update:model-value="updateAMMMax"
        />
        <UInput
          :model-value="modelValue.amm.min"
          type="number"
          step="0.00000001"
          placeholder="0.00"
          label="Min Price"
          @update:model-value="updateAMMMin"
        />
      </div>
    </div>

    <!-- Price Preview -->
    <div
      v-if="pricePreview"
      class="price-preview mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <h5 class="font-medium text-gray-900 dark:text-white mb-2">
        Price Preview
      </h5>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ pricePreview }}
      </div>
    </div>

    <!-- Step Actions -->
    <div class="step-actions flex justify-between mt-8">
      <UButton variant="outline" @click="$emit('prev')">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Back
      </UButton>
      <UButton :disabled="!canProceed" @click="$emit('next')">
        Continue
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { isAMMEnabled } from '~/utils/feature-flags'

  interface Props {
    modelValue: {
      askType: 'buynow' | 'auction' | 'dutch' | 'amm'
      paymentToken: {
        canisterId: string
        symbol: string
        decimals: number
      }
      buyNowPrice: string
      auction: {
        startPrice: string
        reservePrice: string
        minIncrease: {
          type: 'amount' | 'percentage'
          value: string
        }
        waitForQuiet?: {
          window: string
          extension: string
          fade: string
          max: string
        }
      }
      dutch: {
        startPrice: string
        endPrice: string
        timeUnit: 'seconds' | 'minutes' | 'hours' | 'days'
        timeValue: string
        decayType: 'flat' | 'percent'
        decayValue: string
      }
      amm: {
        token1: string
        token2: string
        max: string
        min: string
        decimals: number
      }
    }
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [value: Props['modelValue']]
    next: []
    prev: []
  }>()

  const enableWaitForQuiet = ref(false)

  const askTypes = [
    {
      value: 'buynow',
      label: 'Buy Now',
      description: 'Fixed price for immediate purchase',
      icon: 'i-heroicons-shopping-cart',
    },
    {
      value: 'auction',
      label: 'Auction',
      description: 'Bidding with time limit',
      icon: 'i-heroicons-gavel',
    },
    {
      value: 'dutch',
      label: 'Dutch Auction',
      description: 'Price decreases over time',
      icon: 'i-heroicons-arrow-trending-down',
    },
    {
      value: 'amm',
      label: 'AMM',
      description: 'Automated market maker',
      icon: 'i-heroicons-chart-bar',
    },
  ]

  const paymentTokenOptions = [
    {
      label: 'NFTropoly Token (NTP)',
      value: {
        canisterId: 'uzt4z-lp777-77774-qaabq-cai',
        symbol: 'NTP',
        decimals: 8,
      },
    },
    {
      label: 'Internet Computer (ICP)',
      value: {
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        symbol: 'ICP',
        decimals: 8,
      },
    },
  ]

  const timeUnitOptions = [
    { label: 'Seconds', value: 'seconds' },
    { label: 'Minutes', value: 'minutes' },
    { label: 'Hours', value: 'hours' },
    { label: 'Days', value: 'days' },
  ]

  const canProceed = computed(() => {
    const { askType, buyNowPrice, auction, dutch, amm } = props.modelValue

    switch (askType) {
      case 'buynow':
        return !!buyNowPrice && parseFloat(buyNowPrice) > 0
      case 'auction':
        return !!auction.startPrice && parseFloat(auction.startPrice) > 0
      case 'dutch':
        return (
          !!dutch.startPrice &&
          !!dutch.endPrice &&
          parseFloat(dutch.startPrice) > parseFloat(dutch.endPrice)
        )
      case 'amm':
        return (
          !!amm.max && !!amm.min && parseFloat(amm.max) > parseFloat(amm.min)
        )
      default:
        return false
    }
  })

  const pricePreview = computed(() => {
    const { askType, buyNowPrice, auction, dutch, amm, paymentToken } =
      props.modelValue

    switch (askType) {
      case 'buynow':
        return `Fixed price: ${buyNowPrice} ${paymentToken.symbol}`
      case 'auction':
        return `Starting at ${auction.startPrice} ${paymentToken.symbol}${auction.reservePrice ? ` (reserve: ${auction.reservePrice})` : ''}`
      case 'dutch':
        return `From ${dutch.startPrice} to ${dutch.endPrice} ${paymentToken.symbol} over ${dutch.timeValue} ${dutch.timeUnit}`
      case 'amm':
        return `AMM between ${amm.min} and ${amm.max}`
      default:
        return ''
    }
  })

  function updatePaymentToken(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      paymentToken: value,
    })
  }

  function updateBuyNowPrice(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      buyNowPrice: value,
    })
  }

  function updateAuctionStartPrice(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        startPrice: value,
      },
    })
  }

  function updateAuctionReservePrice(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        reservePrice: value,
      },
    })
  }

  function updateAuctionMinIncrease(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        minIncrease: {
          ...props.modelValue.auction.minIncrease,
          value: value,
        },
      },
    })
  }

  function updateAuctionMinIncreaseType(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        minIncrease: {
          ...props.modelValue.auction.minIncrease,
          type: value,
        },
      },
    })
  }

  function updateAuctionWaitForQuietEnabled(value: boolean) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        waitForQuiet: {
          ...props.modelValue.auction.waitForQuiet,
          enabled: value,
        },
      },
    })
  }

  function updateAuctionWaitForQuietWindow(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        waitForQuiet: {
          ...props.modelValue.auction.waitForQuiet,
          window: value,
        },
      },
    })
  }

  function updateAuctionWaitForQuietExtension(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        waitForQuiet: {
          ...props.modelValue.auction.waitForQuiet,
          extension: value,
        },
      },
    })
  }

  function updateAuctionWaitForQuietFade(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        waitForQuiet: {
          ...props.modelValue.auction.waitForQuiet,
          fade: value,
        },
      },
    })
  }

  function updateAuctionWaitForQuietMax(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      auction: {
        ...props.modelValue.auction,
        waitForQuiet: {
          ...props.modelValue.auction.waitForQuiet,
          max: value,
        },
      },
    })
  }

  function updateDutchStartPrice(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        startPrice: value,
      },
    })
  }

  function updateDutchEndPrice(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        endPrice: value,
      },
    })
  }

  function updateDutchDecayValue(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        decayValue: value,
      },
    })
  }

  function updateDutchDecayType(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        decayType: value,
      },
    })
  }

  function updateDutchTimeValue(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        timeValue: value,
      },
    })
  }

  function updateDutchTimeUnit(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      dutch: {
        ...props.modelValue.dutch,
        timeUnit: value,
      },
    })
  }

  function updateAMMMin(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      amm: {
        ...props.modelValue.amm,
        min: value,
      },
    })
  }

  function updateAMMMax(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      amm: {
        ...props.modelValue.amm,
        max: value,
      },
    })
  }

  function updateAMMToken1(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      amm: {
        ...props.modelValue.amm,
        token1: value,
      },
    })
  }

  function updateAMMToken2(value: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      amm: {
        ...props.modelValue.amm,
        token2: value,
      },
    })
  }

  function selectAskType(type: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      askType: type as 'buynow' | 'auction' | 'dutch' | 'amm',
    })
  }
</script>

<style scoped>
  .ask-type-card {
    @apply border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md;
  }

  .ask-type-card.selected {
    @apply border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 bg-primary-50 dark:bg-primary-900/20;
  }
</style>
