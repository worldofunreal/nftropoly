<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-6">
          <UButton
            to="/marketplace"
            icon="i-heroicons-arrow-left"
            variant="ghost"
            size="sm"
            class="mr-4"
          >
            Back to Marketplace
          </UButton>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Create Listing</h1>
            <p class="mt-2 text-gray-600">List your NFT for sale on the marketplace</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="flex items-center"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full border-2"
              :class="getStepClasses(index)"
            >
              <UIcon
                v-if="index < currentStep"
                name="i-heroicons-check"
                class="w-4 h-4"
              />
              <span v-else class="text-sm font-medium">{{ index + 1 }}</span>
            </div>
            <span
              class="ml-2 text-sm font-medium"
              :class="getStepTextClasses(index)"
            >
              {{ step.name }}
            </span>
            <div
              v-if="index < steps.length - 1"
              class="w-16 h-0.5 bg-gray-200 ml-4"
              :class="{ 'bg-blue-600': index < currentStep }"
            />
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="p-6">
          <!-- Step 1: Select Asset -->
          <AskCreateWizardAsset
            v-if="currentStep === 0"
            v-model:ask-token="askBuilder.state.value.askToken"
            v-model:payment-token="askBuilder.state.value.paymentToken"
            @next="nextStep"
          />

          <!-- Step 2: Pricing -->
          <AskCreateWizardPricing
            v-else-if="currentStep === 1"
            v-model:ask-type="askBuilder.state.value.askType"
            v-model:buy-now-price="askBuilder.state.value.buyNowPrice"
            v-model:auction="askBuilder.state.value.auction"
            v-model:dutch="askBuilder.state.value.dutch"
            v-model:amm="askBuilder.state.value.amm"
            :payment-token="askBuilder.state.value.paymentToken"
            @back="prevStep"
            @next="nextStep"
          />

          <!-- Step 3: Options -->
          <AskCreateWizardOptions
            v-else-if="currentStep === 2"
            v-model:options="askBuilder.state.value.options"
            @back="prevStep"
            @next="nextStep"
          />

          <!-- Step 4: Review -->
          <AskCreateWizardReview
            v-else-if="currentStep === 3"
            :ask-builder="askBuilder"
            :estimated-fees="askBuilder.estimatedFees.value"
            @back="prevStep"
            @create="createListing"
          />
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-6">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="soft"
          :title="error"
          :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
          @close="error = null"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAskBuilder } from '~/composables/useAskBuilder'
import { useMarketplace } from '~/composables/useMarketplace'
import { useApprovals } from '~/composables/useApprovals'
import { useAuthStore } from '~/stores/auth'

// Meta
definePageMeta({
  title: 'Create Listing',
  description: 'Create a new NFT listing on the marketplace',
  middleware: 'auth'
})

// Composables
const router = useRouter()
const askBuilder = useAskBuilder()
const marketplace = useMarketplace()
const approvals = useApprovals()
const authStore = useAuthStore()

// State
const currentStep = ref(0)
const error = ref<string | null>(null)
const creating = ref(false)

const steps = [
  { id: 'asset', name: 'Select Asset' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'options', name: 'Options' },
  { id: 'review', name: 'Review' }
]

// Computed
const isAuthenticated = computed(() => marketplace.isAuthenticated.value)

// Methods
const getStepClasses = (index: number) => {
  if (index < currentStep.value) {
    return 'border-blue-600 bg-blue-600 text-white'
  } else if (index === currentStep.value) {
    return 'border-blue-600 text-blue-600'
  } else {
    return 'border-gray-300 text-gray-500'
  }
}

const getStepTextClasses = (index: number) => {
  if (index <= currentStep.value) {
    return 'text-gray-900'
  } else {
    return 'text-gray-500'
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const createListing = async () => {
  if (!askBuilder.isValid.value) {
    error.value = 'Please complete all required fields'
    return
  }

  try {
    creating.value = true
    error.value = null

    // Check if marketplace is approved for the NFT
    if (askBuilder.state.value.askToken) {
      const isApproved = approvals.isMarketplaceApprovedForNFT(
        askBuilder.state.value.askToken.canisterId,
        askBuilder.state.value.askToken.tokenId!
      )

      if (!isApproved) {
        // Show approval modal
        error.value = 'Please approve the marketplace to transfer your NFT first'
        return
      }
    }

    // Build ask features
    const features = askBuilder.buildAskFeatures()

    // Create the ask
    const result = await marketplace.createAsk(features)

    if (result) {
      // Success - redirect to the created listing
      router.push('/marketplace/my/asks')
    } else {
      error.value = 'Failed to create listing. Please try again.'
    }
  } catch (err) {
    console.error('Failed to create listing:', err)
    error.value = err instanceof Error ? err.message : 'Failed to create listing'
  } finally {
    creating.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/marketplace')
  }
})
</script>
