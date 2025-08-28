<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-950">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage your wallet addresses, theme preferences, and privacy settings
        </p>
      </div>

      <!-- Settings Tabs -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Wallet Management -->
          <div v-if="activeTab === 'wallets'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Wallet Addresses
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your connected wallet addresses for cross-chain functionality
              </p>
            </div>

            <!-- EVM Address -->
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-simple-icons-ethereum" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      Ethereum Address
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ userProfile?.evm_address?.[0] ? formatAddress(userProfile.evm_address[0]) : 'Not connected' }}
                    </p>
                  </div>
                </div>
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  @click="editWalletAddress('evm')"
                >
                  {{ userProfile?.evm_address?.[0] ? 'Update' : 'Connect' }}
                </UButton>
              </div>

              <!-- Bitcoin Address -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-simple-icons-bitcoin" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      Bitcoin Address
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ userProfile?.bitcoin_address?.[0] ? formatAddress(userProfile.bitcoin_address[0]) : 'Not connected' }}
                    </p>
                  </div>
                </div>
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  @click="editWalletAddress('bitcoin')"
                >
                  {{ userProfile?.bitcoin_address?.[0] ? 'Update' : 'Connect' }}
                </UButton>
              </div>

              <!-- Solana Address -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-simple-icons-solana" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      Solana Address
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ userProfile?.solana_address?.[0] ? formatAddress(userProfile.solana_address[0]) : 'Not connected' }}
                    </p>
                  </div>
                </div>
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  @click="editWalletAddress('solana')"
                >
                  {{ userProfile?.solana_address?.[0] ? 'Update' : 'Connect' }}
                </UButton>
              </div>

              <!-- ICP Principal -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <UIcon name="i-simple-icons-internetcomputer" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      ICP Principal
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ userProfile?.id ? formatAddress(userProfile.id.toText()) : 'Not connected' }}
                    </p>
                  </div>
                </div>
                <UButton
                  color="neutral"
                  variant="soft"
                  size="sm"
                  disabled
                >
                  Connected
                </UButton>
              </div>
            </div>
          </div>

          <!-- Theme Preferences -->
          <div v-if="activeTab === 'theme'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Theme Preferences
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Customize your visual experience with dark mode and color themes
              </p>
            </div>

            <!-- Dark Mode Toggle -->
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <UIcon 
                      :name="colorMode.value === 'dark' ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" 
                      class="w-6 h-6 text-gray-600 dark:text-gray-400" 
                    />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      Dark Mode
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <UButton
                  :color="colorMode.value === 'dark' ? 'primary' : 'neutral'"
                  variant="soft"
                  size="sm"
                  @click="toggleTheme"
                >
                  {{ colorMode.value === 'dark' ? 'Dark' : 'Light' }}
                </UButton>
              </div>

              <!-- Color Theme -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  Color Theme
                </h4>
                <div class="grid grid-cols-4 gap-3">
                  <button
                    v-for="theme in colorThemes"
                    :key="theme"
                    class="relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105"
                    :class="[
                      colorTheme === theme 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    ]"
                    @click="setColorTheme(theme)"
                  >
                    <div 
                      class="w-8 h-8 rounded-full mx-auto mb-2"
                      :class="`bg-${theme}-500`"
                    />
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {{ theme }}
                    </span>
                    <div 
                      v-if="colorTheme === theme"
                      class="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
                    >
                      <UIcon name="i-heroicons-check-20-solid" class="w-3 h-3 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div v-if="activeTab === 'privacy'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Privacy Settings
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Control your privacy and data sharing preferences
              </p>
            </div>

            <div class="space-y-4">
              <!-- Profile Visibility -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Profile Visibility
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your profile information
                  </p>
                </div>
                <USelect
                  v-model="privacySettings.profileVisibility"
                  :options="[
                    { label: 'Public', value: 'public' },
                    { label: 'Followers Only', value: 'followers' },
                    { label: 'Private', value: 'private' }
                  ]"
                  size="sm"
                  class="w-40"
                />
              </div>

              <!-- Activity Visibility -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Activity Visibility
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your activity and transactions
                  </p>
                </div>
                <USelect
                  v-model="privacySettings.activityVisibility"
                  :options="[
                    { label: 'Public', value: 'public' },
                    { label: 'Followers Only', value: 'followers' },
                    { label: 'Private', value: 'private' }
                  ]"
                  size="sm"
                  class="w-40"
                />
              </div>

              <!-- Wallet Address Visibility -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Wallet Address Visibility
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Control who can see your wallet addresses
                  </p>
                </div>
                <USelect
                  v-model="privacySettings.walletVisibility"
                  :options="[
                    { label: 'Public', value: 'public' },
                    { label: 'Followers Only', value: 'followers' },
                    { label: 'Private', value: 'private' }
                  ]"
                  size="sm"
                  class="w-40"
                />
              </div>

              <!-- Data Sharing -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                  Data Sharing Preferences
                </h4>
                
                <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div>
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white">
                      Analytics & Usage Data
                    </h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <UToggle v-model="privacySettings.analyticsEnabled" />
                </div>

                <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div>
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white">
                      Marketing Communications
                    </h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <UToggle v-model="privacySettings.marketingEnabled" />
                </div>

                <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div>
                    <h5 class="text-sm font-medium text-gray-900 dark:text-white">
                      Third-Party Integrations
                    </h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Allow data sharing with trusted third-party services
                    </p>
                  </div>
                  <UToggle v-model="privacySettings.thirdPartyEnabled" />
                </div>
              </div>
            </div>
          </div>

          <!-- Account Management -->
          <div v-if="activeTab === 'account'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Account Management
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your account settings and profile information
              </p>
            </div>

            <div class="space-y-4">
              <!-- Profile Management -->
              <div class="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-user-circle-20-solid" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                      Profile Information
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Edit your display name, bio, avatar, and other profile details
                    </p>
                  </div>
                </div>
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  @click="navigateToProfile"
                >
                  Edit Profile
                </UButton>
              </div>

              <!-- Account Deletion -->
              <div class="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-trash-20-solid" class="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-red-900 dark:text-red-100">
                      Delete Account
                    </h4>
                    <p class="text-sm text-red-700 dark:text-red-300">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <UButton
                  color="red"
                  variant="soft"
                  size="sm"
                  @click="showDeleteAccountModal = true"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="px-6 py-4 bg-neutral-50 dark:bg-neutral-700 rounded-b-lg">
          <div class="flex justify-between items-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ saveStatus }}
            </p>
            <div class="flex gap-3">
              <UButton
                v-if="hasUnsavedChanges"
                color="neutral"
                variant="soft"
                size="sm"
                @click="resetChanges"
              >
                Reset
              </UButton>
              <UButton
                v-if="hasUnsavedChanges"
                color="primary"
                size="sm"
                :loading="saving"
                @click="saveChanges"
              >
                Save Changes
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wallet Address Edit Modal -->
    <UModal v-model="showWalletModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :class="walletModalConfig.bgColor"
            >
              <UIcon :name="walletModalConfig.icon" class="w-5 h-5" :class="walletModalConfig.iconColor" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ walletModalConfig.title }}
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ walletModalConfig.label }}
            </label>
            <UInput
              v-model="walletAddress"
              :placeholder="walletModalConfig.placeholder"
              class="w-full"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ walletModalConfig.description }}
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="showWalletModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="updatingWallet"
              @click="updateWalletAddress"
            >
              {{ updatingWallet ? 'Updating...' : 'Update' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Account Confirmation Modal -->
    <UModal v-model="showDeleteAccountModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-red-900 dark:text-red-100">
              Delete Account
            </h3>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
          </p>
          <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>Your profile and all associated data</li>
            <li>Your wallet connections and preferences</li>
            <li>All your activity and transaction history</li>
            <li>Your followers and following relationships</li>
          </ul>
          <p class="text-sm text-red-600 dark:text-red-400 font-medium">
            This action is irreversible!
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="showDeleteAccountModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="deleteAccount"
            >
              Delete Account
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useColorMode } from '#imports'
  import { useAuthStore } from '@/stores/auth'
  import { useColorTheme } from '@/composables/useColorTheme'
  import { canisterService } from '@/services/CanisterService'
  import { useToast } from '#imports'

  // Authentication and user data
  const auth = useAuthStore()
  const userProfile = computed(() => auth.userProfile)

  // Theme management
  const colorMode = useColorMode()
  const { colorTheme, setColorTheme: setTheme, colorThemes } = useColorTheme()

  // UI state
  const activeTab = ref('wallets')
  const saving = ref(false)
  const updatingWallet = ref(false)
  const showWalletModal = ref(false)
  const showDeleteAccountModal = ref(false)
  const walletAddress = ref('')
  const currentWalletType = ref('')

  // Privacy settings (mock data for now)
  const privacySettings = ref({
    profileVisibility: 'public',
    activityVisibility: 'public',
    walletVisibility: 'public',
    analyticsEnabled: true,
    marketingEnabled: false,
    thirdPartyEnabled: false
  })

  // Tabs configuration
  const tabs = [
    { id: 'wallets', name: 'Wallets' },
    { id: 'theme', name: 'Theme' },
    { id: 'privacy', name: 'Privacy' },
    { id: 'account', name: 'Account' },
  ]

  // Wallet modal configuration
  const walletModalConfig = computed(() => {
    const configs = {
      evm: {
        title: 'Ethereum Address',
        label: 'Ethereum Address',
        placeholder: '0x...',
        description: 'Enter your Ethereum wallet address (0x format)',
        icon: 'i-simple-icons-ethereum',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      bitcoin: {
        title: 'Bitcoin Address',
        label: 'Bitcoin Address',
        placeholder: 'bc1...',
        description: 'Enter your Bitcoin wallet address',
        icon: 'i-simple-icons-bitcoin',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
        iconColor: 'text-orange-600 dark:text-orange-400'
      },
      solana: {
        title: 'Solana Address',
        label: 'Solana Address',
        placeholder: '...',
        description: 'Enter your Solana wallet address',
        icon: 'i-simple-icons-solana',
        bgColor: 'bg-purple-100 dark:bg-purple-900',
        iconColor: 'text-purple-600 dark:text-purple-400'
      }
    }
    return configs[currentWalletType.value as keyof typeof configs] || configs.evm
  })

  // Computed properties
  const hasUnsavedChanges = computed(() => {
    // For now, always return false since most changes are immediate
    // This can be enhanced when we add more complex form handling
    return false
  })

  const saveStatus = computed(() => {
    if (saving.value) return 'Saving changes...'
    if (hasUnsavedChanges.value) return 'You have unsaved changes'
    return 'All changes saved'
  })

  // Methods
  const toggleTheme = () => {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('nftropoly-theme', colorMode.value)
  }

  const editWalletAddress = (type: string) => {
    currentWalletType.value = type
    const addressMap = {
      evm: userProfile.value?.evm_address?.[0] || '',
      bitcoin: userProfile.value?.bitcoin_address?.[0] || '',
      solana: userProfile.value?.solana_address?.[0] || ''
    }
    walletAddress.value = addressMap[type as keyof typeof addressMap] || ''
    showWalletModal.value = true
  }

  const updateWalletAddress = async () => {
    if (!walletAddress.value.trim()) {
      const toast = useToast()
      toast.add({
        title: 'Invalid Address',
        description: 'Please enter a valid wallet address',
        color: 'error'
      })
      return
    }

    updatingWallet.value = true
    try {
      const updateMethod = {
        evm: () => canisterService.updateEvmAddress(walletAddress.value.trim()),
        bitcoin: () => canisterService.updateBitcoinAddress(walletAddress.value.trim()),
        solana: () => canisterService.updateSolanaAddress(walletAddress.value.trim())
      }[currentWalletType.value]

      if (updateMethod) {
        await updateMethod()
        await auth.refreshProfile()
        
        const toast = useToast()
        toast.add({
          title: 'Address Updated',
          description: `${walletModalConfig.value.title} has been updated successfully`,
          color: 'success'
        })
        
        showWalletModal.value = false
      }
    } catch (error) {
      console.error('Failed to update wallet address:', error)
      const toast = useToast()
      toast.add({
        title: 'Update Failed',
        description: 'Failed to update wallet address. Please try again.',
        color: 'error'
      })
    } finally {
      updatingWallet.value = false
    }
  }

  const navigateToProfile = () => {
    if (userProfile.value?.username) {
      navigateTo(`/@${userProfile.value.username}`)
    } else {
      navigateTo('/profile')
    }
  }

  const saveChanges = async () => {
    saving.value = true
    try {
      // Save privacy settings (mock implementation)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const toast = useToast()
      toast.add({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully',
        color: 'success'
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      const toast = useToast()
      toast.add({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        color: 'error'
      })
    } finally {
      saving.value = false
    }
  }

  const resetChanges = () => {
    // Reset privacy settings to defaults
    privacySettings.value = {
      profileVisibility: 'public',
      activityVisibility: 'public',
      walletVisibility: 'public',
      analyticsEnabled: true,
      marketingEnabled: false,
      thirdPartyEnabled: false
    }
  }

  const deleteAccount = async () => {
    // Mock implementation - would need backend support
    const toast = useToast()
    toast.add({
      title: 'Feature Coming Soon',
      description: 'Account deletion will be available in a future update',
      color: 'info'
    })
    showDeleteAccountModal.value = false
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    if (address.startsWith('bc1')) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    if (address.length > 20) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return address
  }

  // Lifecycle
  onMounted(() => {
    // Ensure user is authenticated
    if (!auth.authenticated) {
      navigateTo('/')
    }
  })
</script>
