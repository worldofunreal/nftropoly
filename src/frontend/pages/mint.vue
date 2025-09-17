<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mint NFT</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Create your own NFT for {{ mintPrice }} {{ tokenSymbol }} tokens
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500 dark:text-gray-400">Your Balance</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ formatBalance(userBalance) }} {{ tokenSymbol }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <!-- Auth Status -->
        <div v-if="!auth.userProfile" class="text-center py-12">
          <UIcon name="i-heroicons-user-circle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign In Required</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">You need to sign in to mint NFTs</p>
          <UButton to="/auth/signin" size="lg">
            Sign In
          </UButton>
        </div>

        <!-- Mint Form -->
        <div v-else>
          <form @submit.prevent="handleMint" class="space-y-6">
            <!-- Token Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                NFT Name *
              </label>
              <UInput
                v-model="formData.tokenName"
                placeholder="Enter NFT name"
                size="lg"
                :disabled="isMinting"
                required
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <UTextarea
                v-model="formData.description"
                placeholder="Describe your NFT"
                :rows="4"
                :disabled="isMinting"
              />
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <UInput
                v-model="formData.imageUrl"
                placeholder="https://example.com/image.png"
                size="lg"
                :disabled="isMinting"
              />
            </div>

            <!-- Attributes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Attributes (Optional)
              </label>
              <div class="space-y-2">
                <div
                  v-for="(attr, index) in formData.attributes"
                  :key="index"
                  class="flex gap-2"
                >
                  <UInput
                    v-model="attr.key"
                    placeholder="Trait type"
                    :disabled="isMinting"
                  />
                  <UInput
                    v-model="attr.value"
                    placeholder="Value"
                    :disabled="isMinting"
                  />
                  <UButton
                    @click="removeAttribute(index)"
                    variant="ghost"
                    color="red"
                    icon="i-heroicons-trash"
                    :disabled="isMinting"
                  />
                </div>
                <UButton
                  @click="addAttribute"
                  variant="ghost"
                  icon="i-heroicons-plus"
                  :disabled="isMinting"
                >
                  Add Attribute
                </UButton>
              </div>
            </div>

            <!-- Cost Info -->
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium text-blue-900">Minting Cost</h3>
                  <p class="text-sm text-blue-700">
                    {{ mintPrice }} {{ tokenSymbol }} + network fees
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-blue-700">After minting</p>
                  <p class="font-medium text-blue-900">
                    {{ formatBalance(userBalance - BigInt(mintPrice * (10 ** 8))) }} {{ tokenSymbol }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Insufficient Balance Warning -->
            <UAlert
              v-if="userBalance < BigInt(mintPrice * (10 ** 8))"
              color="red"
              variant="soft"
              title="Insufficient Balance"
              description="You don't have enough tokens to mint this NFT. Please get more tokens from the faucet."
            />

            <!-- Action Button - ONE BUTTON ONLY -->
            <div class="flex gap-4">
              <UButton
                type="submit"
                :disabled="!canMint"
                :loading="isMinting"
                size="lg"
                class="flex-1"
              >
                {{ isMinting ? 'Minting...' : 'Mint NFT' }}
              </UButton>
            </div>

            <!-- Get Tokens Button -->
            <div v-if="userBalance < BigInt(mintPrice * (10 ** 8))" class="text-center">
              <UButton
                @click="handleFaucet"
                :loading="isGettingTokens"
                color="green"
                size="lg"
              >
                {{ isGettingTokens ? 'Getting Tokens...' : 'Get Free Tokens' }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <UModal v-model="showSuccessModal">
      <div class="p-6 text-center">
        <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">NFT Minted Successfully!</h3>
        <p class="text-gray-600 mb-4">
          Your NFT "{{ formData.tokenName }}" has been minted with ID: {{ mintedTokenId }}
        </p>
        <div class="flex gap-2 justify-center">
          <UButton @click="viewNFT" variant="outline">
            View NFT
          </UButton>
          <UButton @click="mintAnother">
            Mint Another
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Principal } from '@dfinity/principal'
import { useAuthStore } from '~/stores/auth'
import { canisterService } from '~/services/CanisterService'

// Page metadata
definePageMeta({
  title: 'Mint NFT',
  description: 'Create your own NFT on NFTropoly'
})

// Stores
const auth = useAuthStore()

// Reactive data
const userBalance = ref(0n)
const tokenSymbol = ref('NTP')
const mintPrice = ref(100) // 100 tokens

const isMinting = ref(false)
const isGettingTokens = ref(false)
const showSuccessModal = ref(false)
const mintedTokenId = ref<bigint | null>(null)

// Form data
const formData = ref({
  tokenName: '',
  description: '',
  imageUrl: '',
  attributes: [] as Array<{ key: string; value: string }>
})

// Computed properties
const canMint = computed(() => {
  return (
    auth.userProfile &&
    formData.value.tokenName.trim() !== '' &&
    userBalance.value >= BigInt(mintPrice.value * (10 ** 8)) &&
    !isMinting.value
  )
})

// Methods - simplified to use existing canister service pattern
const loadUserBalance = async () => {
  try {
    if (!auth.userProfile) return
    // TODO: Add token balance call to backend or use direct token canister call
    userBalance.value = 100000000000n // Mock 1000 tokens for now
  } catch (error) {
    console.error('Failed to load balance:', error)
  }
}


const handleMint = async () => {
  try {
    isMinting.value = true
    
    // Initialize canister service with user's identity
    await canisterService.initialize(auth.getIdentity())
    
    // Step 1: Approve tokens for backend using token module
    const backendCanisterId = canisterService.getCanisterId()
    console.log('Backend canister ID for approval:', backendCanisterId)
    const requiredAmount = BigInt(mintPrice.value * (10 ** 8))
    const fee = 10000n // Token fee 
    const approvalAmount = requiredAmount + fee
    
    console.log('Step 1: Approving tokens for backend...')
    const approveResult = await canisterService.token.approve(
      Principal.fromText(backendCanisterId),
      approvalAmount
    )
    
    if (!('Ok' in approveResult)) {
      throw new Error('Failed to approve tokens: ' + JSON.stringify(approveResult.Err))
    }
    
    console.log('Step 2: Calling mint_on_behalf...')
    
    // Step 2: Prepare attributes
    const attributes = formData.value.attributes
      .filter(attr => attr.key.trim() && attr.value.trim())
      .map(attr => [attr.key.trim(), attr.value.trim()] as [string, string])

    // Call backend mint_on_behalf using backend module
    const result = await canisterService.backend.mintOnBehalf(
      formData.value.tokenName,
      formData.value.description || undefined,
      formData.value.imageUrl || undefined,
      attributes.length > 0 ? attributes : undefined,
      BigInt(mintPrice.value * (10 ** 8))
    )

    if ('Ok' in result) {
      mintedTokenId.value = result.Ok
      showSuccessModal.value = true
      
      // Refresh balance
      await loadUserBalance()
      
      // Show success toast
      useToast().add({
        title: 'NFT Minted!',
        description: `Your NFT "${formData.value.tokenName}" has been minted successfully.`,
        color: 'success'
      })
    } else {
      console.error('Mint result error:', result)
      throw new Error(typeof result.Err === 'string' ? result.Err : JSON.stringify(result.Err) || 'Minting failed')
    }
  } catch (error) {
    console.error('Failed to mint NFT:', error)
    useToast().add({
      title: 'Minting Failed',
      description: error instanceof Error ? error.message : 'Failed to mint NFT',
      color: 'error'
    })
  } finally {
    isMinting.value = false
  }
}

const handleFaucet = async () => {
  try {
    isGettingTokens.value = true
    // Ensure backend is initialized with identity
    await canisterService.initialize(auth.getIdentity())
    const result = await canisterService.backend.faucetTokens() // Uses default 1000 tokens

    if ('Ok' in result) {
      await loadUserBalance()
      useToast().add({
        title: 'Tokens Received!',
        description: 'You received 1000 NTRP tokens.',
        color: 'success'
      })
    } else {
      throw new Error('Faucet failed')
    }
  } catch (error) {
    console.error('Failed to get tokens from faucet:', error)
    useToast().add({
      title: 'Faucet Failed',
      description: error instanceof Error ? error.message : 'Failed to get tokens',
      color: 'error'
    })
  } finally {
    isGettingTokens.value = false
  }
}

const addAttribute = () => {
  formData.value.attributes.push({ key: '', value: '' })
}

const removeAttribute = (index: number) => {
  formData.value.attributes.splice(index, 1)
}

const formatBalance = (balance: bigint): string => {
  const divisor = BigInt(10 ** 8) // 8 decimals
  const wholePart = balance / divisor
  const fractionalPart = balance % divisor
  
  if (fractionalPart === 0n) {
    return wholePart.toString()
  }
  
  const fractionalStr = fractionalPart.toString().padStart(8, '0').replace(/0+$/, '')
  return `${wholePart}.${fractionalStr}`
}

const viewNFT = () => {
  if (mintedTokenId.value) {
    navigateTo(`/nfts/${mintedTokenId.value}`)
  }
}

const mintAnother = () => {
  showSuccessModal.value = false
  formData.value = {
    tokenName: '',
    description: '',
    imageUrl: '',
    attributes: []
  }
}

// Lifecycle
onMounted(async () => {
  if (auth.userProfile) {
    await loadUserBalance()
  }
})
</script>
