<template>
  <div class="relative profile-settings-icon">
    <div
      class="flex items-center gap-2 cursor-pointer"
      @click="toggleUserMenu"
    >
      <!-- Avatar with Wallet Icon Overlay -->
      <div class="relative">
        <UAvatar
          :src="userAvatar"
          size="md"
          class="hover:opacity-80 transition-opacity"
          :alt="authStore.userProfile?.username || 'User profile'"
        >
          <template #fallback>
            <div
              class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm"
            >
              {{ authStore.userProfile?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
          </template>
        </UAvatar>
        <!-- Wallet Icon Overlay -->
        <div
          class="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-neutral-800 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center"
        >
          <UIcon
            :name="getWalletIcon(authStore.nativeWallet)"
            class="w-3 h-3 text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>

      <!-- Username and Arrow -->
      <div class="flex items-center gap-1">
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ authStore.player?.username || 'User' }}
        </span>
        <UIcon
          :name="showUserMenu ? 'bxs:up-arrow' : 'bxs:down-arrow'"
          class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform"
        />
      </div>
    </div>

    <!-- User Menu Dropdown -->
    <div
      v-if="showUserMenu"
      class="absolute right-0 mt-2 w-96 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div class="p-4">
        <!-- User Info -->
        <div class="flex items-center gap-3 mb-4">
          <UAvatar
            :src="userAvatar"
            size="lg"
            :alt="authStore.userProfile?.username || 'User profile'"
          >
            <template #fallback>
              <div
                class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg"
              >
                {{ authStore.userProfile?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </template>
          </UAvatar>
          <div class="flex-1 min-w-0">
            <div
              class="font-semibold text-gray-900 dark:text-white truncate"
            >
              {{ authStore.userProfile?.username || 'User' }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ authStore.nativeWallet.toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Cross-Chain Addresses Section -->
        <div class="mb-4">
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Cross-Chain Addresses
          </div>
          
          <!-- ICP Principal -->
          <div v-if="authStore.principal" class="mb-3">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="token-branded:icp" class="w-4 h-4 text-orange-500" />
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">ICP</span>
            </div>
            <div
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md"
            >
              <span
                class="text-sm font-mono text-gray-900 dark:text-white truncate"
              >
                {{ authStore.principal }}
              </span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                @click="copyToClipboard(authStore.principal, 'ICP')"
              />
            </div>
          </div>

          <!-- EVM Address -->
          <div v-if="authStore.evmAddress" class="mb-3">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="cryptocurrency:eth" class="w-4 h-4 text-blue-500" />
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">EVM</span>
            </div>
            <div
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md"
            >
              <span
                class="text-sm font-mono text-gray-900 dark:text-white truncate"
              >
                {{ authStore.evmAddress }}
              </span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                @click="copyToClipboard(authStore.evmAddress, 'EVM')"
              />
            </div>
          </div>

          <!-- Solana Address -->
          <div v-if="authStore.solAddress" class="mb-3">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="cryptocurrency:sol" class="w-4 h-4 text-purple-500" />
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">SOL</span>
            </div>
            <div
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md"
            >
              <span
                class="text-sm font-mono text-gray-900 dark:text-white truncate"
              >
                {{ authStore.solAddress }}
              </span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                @click="copyToClipboard(authStore.solAddress, 'Solana')"
              />
            </div>
          </div>

          <!-- Bitcoin Address -->
          <div v-if="authStore.btcAddress" class="mb-3">
            <div class="flex items-center gap-2 mb-1">
              <UIcon name="cryptocurrency:btc" class="w-4 h-4 text-orange-400" />
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">BTC</span>
            </div>
            <div
              class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md"
            >
              <span
                class="text-sm font-mono text-gray-900 dark:text-white truncate"
              >
                {{ authStore.btcAddress }}
              </span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0"
                @click="copyToClipboard(authStore.btcAddress, 'Bitcoin')"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
          <UButton
            block
            color="error"
            variant="soft"
            icon="solar:logout-2-bold"
            @click="logout"
          >
            Logout
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useNuxtApp } from '#imports'
  import { useAuthStore } from '@/stores/auth'
  import { canisterService } from '@/services/CanisterService'

  defineOptions({
    name: 'HeaderProfile',
  })

  const authStore = useAuthStore()
  const { $trackInteraction, $trackButtonClick } = useNuxtApp()

  // Avatar URL - convert file paths to full URLs with cache busting
  const userAvatar = computed(() => {
    const avatarPath = authStore.userProfile?.avatar_url?.[0]
    if (!avatarPath) return ''
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) {
      return avatarPath
    }
    
    // Convert file path to full URL with cache busting
    const baseUrl = canisterService.getAssetUrl(avatarPath)
    const timestamp = Date.now()
    return `${baseUrl}?t=${timestamp}`
  })
  const showUserMenu = ref(false)

  onMounted(() => {
    // Close menu when clicking outside
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  function toggleUserMenu() {
    showUserMenu.value = !showUserMenu.value
    $trackButtonClick('User Menu Toggle', {
      isOpen: showUserMenu.value,
      username: authStore.player?.username,
    })
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  }

  function copyToClipboard(text: string, walletType: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const toast = useToast()
        toast.add({
          title: `${walletType} Address Copied`,
          description: text,
          color: 'success',
        })
        $trackButtonClick('Copy to Clipboard', {
          textType: text.includes('icp') ? 'ICP Principal' : 'Wallet Address',
          textLength: text.length,
        })
      })
      .catch(err => {
        console.error('Failed to copy to clipboard:', err)
        const toast = useToast()
        toast.add({
          title: `${walletType} Copy Failed`,
          description: 'Failed to copy address to clipboard.',
          color: 'error',
        })
        $trackInteraction('Error', {
          error: 'Copy to clipboard failed',
          textType: text.includes('icp') ? 'ICP Principal' : 'Wallet Address',
        })
      })
  }

  function logout() {
    showUserMenu.value = false
    $trackButtonClick('Logout', {
      username: authStore.player?.username,
      walletType: authStore.nativeWallet,
    })
    authStore.logout()
  }

  function getWalletIcon(walletType?: string) {
    if (!walletType) return 'solar:wallet-bold'
    
    switch (walletType.toLowerCase()) {
      case 'metamask':
        return 'token-branded:metamask'
      case 'phantom':
        return 'token-branded:phantom'
      case 'plug':
        return 'fa6-solid:plug'
      case 'google':
        return 'logos:google-icon'
      case 'internetidentity':
      case 'icp':
        return 'token-branded:icp'
      default:
        return 'solar:wallet-bold'
    }
  }
</script>
