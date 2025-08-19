<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">Create Your Profile</h2>
        <button class="text-gray-400 hover:text-gray-600" @click="close()">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Cross-Chain Addresses Display -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Your Cross-Chain Addresses</h3>
          <div class="space-y-3">
            <div class="p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-blue-800">ICP Principal</span>
                <span class="text-xs text-blue-600">{{ walletType === 'internet-identity' || walletType === 'plug' ? 'Native' : 'Generated' }}</span>
              </div>
              <div class="font-mono text-xs text-blue-700 mt-1 break-all">{{ principal }}</div>
            </div>
            
            <div class="p-3 bg-green-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-green-800">EVM Address</span>
                <span class="text-xs text-green-600">{{ walletType === 'metamask' || walletType === 'phantom' ? 'Native' : 'Generated' }}</span>
              </div>
              <div class="font-mono text-xs text-green-700 mt-1 break-all">{{ evmAddress }}</div>
            </div>
            
            <div class="p-3 bg-purple-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-purple-800">Solana Address</span>
                <span class="text-xs text-purple-600">{{ walletType === 'phantom' ? 'Native' : 'Generated' }}</span>
              </div>
              <div class="font-mono text-xs text-purple-700 mt-1 break-all">{{ solAddress }}</div>
            </div>
            
            <div class="p-3 bg-orange-50 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-orange-800">Bitcoin Address</span>
                <span class="text-xs text-orange-600">Generated</span>
              </div>
              <div class="font-mono text-xs text-orange-700 mt-1 break-all">{{ btcAddress }}</div>
            </div>
          </div>
        </div>

        <!-- Username Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Username *</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            required
            :disabled="loading"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            @input="checkUsernameAvailability"
          >
          <p
            v-if="usernameStatus"
            :class="[
              'text-xs mt-1',
              usernameStatus === 'available'
                ? 'text-green-600'
                : 'text-red-600',
            ]"
          >
            {{ usernameMessage }}
          </p>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            :disabled="loading"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="close"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="!canComplete || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleRegistration"
          >
            {{ loading ? 'Creating...' : 'Create Profile' }}
          </button>
        </div>

        <div v-if="error" class="mt-4 text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { canisterService } from '@/services/CanisterService'

  // Component state
  const show = ref(false)
  const loading = ref(false)
  const error = ref('')

  // Form data - simplified to just username
  const username = ref('')

  // Cross-chain addresses
  const principal = ref('')
  const evmAddress = ref('')
  const solAddress = ref('')
  const btcAddress = ref('')
  const walletType = ref('')

  // Username availability
  const usernameStatus = ref<'available' | 'taken' | 'checking' | null>(null)
  const usernameMessage = ref('')
  const usernameCheckTimeout = ref<NodeJS.Timeout | null>(null)

  const auth = useAuthStore()
  const toast = useToast()

  // Computed properties
  const canComplete = computed(() => {
    return (
      username.value.trim().length >= 3 &&
      usernameStatus.value === 'available'
    )
  })

  // Username availability check
  async function checkUsernameAvailability() {
    const usernameValue = username.value.trim()

    if (usernameValue.length < 3) {
      usernameStatus.value = null
      usernameMessage.value = ''
      return
    }

    // Clear previous timeout
    if (usernameCheckTimeout.value) {
      clearTimeout(usernameCheckTimeout.value)
    }

    // Set checking status
    usernameStatus.value = 'checking'
    usernameMessage.value = 'Checking availability...'

    // Debounce the check
    usernameCheckTimeout.value = setTimeout(async () => {
      try {
        // Call canister to check username availability
        const isAvailable = await canisterService.isUsernameAvailable(usernameValue)

        if (isAvailable) {
          usernameStatus.value = 'available'
          usernameMessage.value = 'Username is available'
        } else {
          usernameStatus.value = 'taken'
          usernameMessage.value = 'Username is already taken'
        }
      } catch (err) {
        console.error('Username availability check failed:', err)
        usernameStatus.value = null
        usernameMessage.value = 'Could not check availability'
      }
    }, 300)
  }

  // Public API
  const open = (
    principalValue: string,
    evmAddressValue: string,
    solAddressValue: string,
    btcAddressValue: string,
    walletTypeValue: string
  ) => {
    console.log('RegistrationModal.open() called with:', {
      principal: principalValue,
      evmAddress: evmAddressValue,
      solAddress: solAddressValue,
      btcAddress: btcAddressValue,
      walletType: walletTypeValue,
    })
    
    principal.value = principalValue
    evmAddress.value = evmAddressValue
    solAddress.value = solAddressValue
    btcAddress.value = btcAddressValue
    walletType.value = walletTypeValue
    
    show.value = true
    resetForm()
  }

  const close = () => {
    show.value = false
    resetForm()
  }

  function resetForm() {
    error.value = ''
    username.value = ''
    usernameStatus.value = null
    usernameMessage.value = ''
  }

  defineExpose({ open, close })

  // Main registration handler
  async function handleRegistration() {
    if (!canComplete.value) return

    loading.value = true
    error.value = ''

    try {
      // Prepare simplified registration data
      const registrationData = {
        username: username.value.trim(),
        displayName: null,
        bio: null,
        email: null,
        ethAddress: evmAddress.value,
        walletType: walletType.value,
        avatarPreset: BigInt(1), // Default avatar
        socialLinks: {
          twitter: null,
          discord: null,
          instagram: null,
          website: null,
          telegram: null,
        },
        privacy: {
          profilePublic: true,
          showPortfolio: true,
          showActivity: true,
          showEmail: false,
        },
      }

      console.log('Registration data (simplified):', registrationData)

      // Call canister registerUser method
      const result = await canisterService.registerUser(registrationData)

      if ('ok' in result) {
        // Registration successful
        const profile = result.ok
        console.log('Registration successful:', profile)

        // Update auth store with the new profile
        await auth.completeRegistration(profile)

        // Show success notification
        toast.add({
          title: 'Profile Created!',
          description: `Welcome to NFTropoly, ${profile.username}! Your profile has been created successfully.`,
          color: 'success',
        })

        show.value = false

        // Navigate to profile page
        await navigateTo('/profile')
      } else {
        // Registration failed
        const errorMsg = result.err
        console.error('Registration failed:', errorMsg)

        let errorText = 'Registration failed. Please try again.'
        if ('InvalidInput' in errorMsg && errorMsg.InvalidInput) {
          errorText = errorMsg.InvalidInput
        } else if ('UserAlreadyExists' in errorMsg) {
          errorText = 'User already exists'
        } else if ('InternalError' in errorMsg && errorMsg.InternalError) {
          errorText = errorMsg.InternalError
        }

        throw new Error(errorText)
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err?.message || 'Registration failed. Please try again.'

      toast.add({
        title: 'Registration Failed',
        description: error.value,
        color: 'error',
      })
    } finally {
      loading.value = false
    }
  }
</script>
