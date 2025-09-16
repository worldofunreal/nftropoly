<template>
  <div class="ask-create-wizard">
    <div class="wizard-header">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Create NFT Listing
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Step {{ currentStep + 1 }} of {{ totalSteps }}:
        {{ stepTitles[currentStep] }}
      </p>
    </div>

    <!-- Progress Bar -->
    <div class="wizard-progress mb-8">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in stepTitles"
          :key="index"
          class="flex items-center"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
            :class="getStepClasses(index)"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < totalSteps - 1"
            class="flex-1 h-0.5 mx-4"
            :class="
              index < currentStep
                ? 'bg-primary-500'
                : 'bg-gray-300 dark:bg-gray-600'
            "
          />
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <Transition name="step" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="currentStep"
          v-model="wizardData"
          @next="nextStep"
          @prev="prevStep"
          @complete="handleComplete"
        />
      </Transition>
    </div>

    <!-- Navigation -->
    <div class="wizard-navigation flex justify-between mt-8">
      <UButton v-if="currentStep > 0" variant="outline" @click="prevStep">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Previous
      </UButton>
      <div v-else />

      <UButton
        v-if="currentStep < totalSteps - 1"
        :disabled="!canProceed"
        @click="nextStep"
      >
        Next
        <UIcon name="i-heroicons-arrow-right" class="ml-2" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAskBuilder } from '~/composables/useAskBuilder'
  import AssetSelectionStep from './AssetSelectionStep.vue'
  import PricingStep from './PricingStep.vue'
  import OptionsStep from './OptionsStep.vue'
  import ReviewStep from './ReviewStep.vue'

  interface WizardData {
    // Asset selection
    selectedNFTs: Array<{
      canisterId: string
      tokenId: bigint
      metadata: unknown
    }>

    // Pricing
    askType: 'buynow' | 'auction' | 'dutch' | 'amm'
    paymentToken: {
      canisterId: string
      symbol: string
      decimals: number
    }

    // Ask type specific data
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

    // Options
    expiresAt?: string
    description: string
    tags: string[]
  }

  const emit = defineEmits<{
    complete: [askData: unknown]
    cancel: []
  }>()

  const askBuilder = useAskBuilder()

  // Wizard state
  const currentStep = ref(0)
  const wizardData = ref<WizardData>({
    selectedNFTs: [],
    askType: 'buynow',
    paymentToken: {
      canisterId: 'uzt4z-lp777-77774-qaabq-cai',
      symbol: 'NTP',
      decimals: 8,
    },
    buyNowPrice: '',
    auction: {
      startPrice: '',
      reservePrice: '',
      minIncrease: {
        type: 'amount',
        value: '',
      },
    },
    dutch: {
      startPrice: '',
      endPrice: '',
      timeUnit: 'hours',
      timeValue: '24',
      decayType: 'percent',
      decayValue: '5',
    },
    amm: {
      token1: 'uzt4z-lp777-77774-qaabq-cai',
      token2: 'uzt4z-lp777-77774-qaabq-cai',
      max: '',
      min: '',
      decimals: 8,
    },
    description: '',
    tags: [],
  })

  const stepTitles = [
    'Select Assets',
    'Set Pricing',
    'Configure Options',
    'Review & Create',
  ]

  const totalSteps = stepTitles.length

  const stepComponents = [
    AssetSelectionStep,
    PricingStep,
    OptionsStep,
    ReviewStep,
  ]

  const currentStepComponent = computed(() => stepComponents[currentStep.value])

  const canProceed = computed(() => {
    switch (currentStep.value) {
      case 0: // Asset selection
        return wizardData.value.selectedNFTs.length > 0
      case 1: // Pricing
        return validatePricingStep()
      case 2: // Options
        return true // Options are optional
      case 3: // Review
        return true
      default:
        return false
    }
  })

  function validatePricingStep(): boolean {
    const { askType, buyNowPrice, auction, dutch, amm } = wizardData.value

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
  }

  function getStepClasses(stepIndex: number) {
    if (stepIndex < currentStep.value) {
      return 'bg-primary-500 text-white'
    } else if (stepIndex === currentStep.value) {
      return 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
    } else {
      return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  function nextStep() {
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  async function handleComplete() {
    try {
      // Build the ask using the ask builder
      const askFeatures = askBuilder.buildAskFeatures(wizardData.value)

      // Emit the completed ask data
      emit('complete', {
        askFeatures,
        wizardData: wizardData.value,
      })
    } catch (error) {
      console.error('Failed to build ask:', error)
      // Handle error - could show a toast or error message
    }
  }
</script>

<style scoped>
  .ask-create-wizard {
    @apply max-w-4xl mx-auto p-6;
  }

  .wizard-header {
    @apply mb-8 text-center;
  }

  .wizard-progress {
    @apply mb-8;
  }

  .wizard-content {
    @apply min-h-96;
  }

  .step-enter-active,
  .step-leave-active {
    transition: all 0.3s ease;
  }

  .step-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .step-leave-to {
    opacity: 0;
    transform: translateX(-20px);
  }
</style>
