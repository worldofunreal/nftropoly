<template>
  <header
    :class="[
      'sticky top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out',
      scrolled
        ? 'bg-white/70 dark:bg-neutral-950/70 backdrop-blur-sm shadow-md'
        : 'bg-transparent',
      'border-b border-gray-200 dark:border-gray-800'
    ]"
  >
    <div class="flex justify-between items-center h-14 mx-4 md:mx-4">
      <!-- Left: Logo and Search Bar -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Search Bar -->
        <div class="hidden md:flex items-center ml-2">
          <UInput
            v-model="search"
            placeholder="Search Nftropoly"
            size="lg"
            class="w-96 h-12 text-lg"
            icon="ri:search-line"
          />
        </div>
      </div>
      <!-- Right: Actions -->
      <div class="flex items-center gap-4 ml-auto">
        <!-- Theme Toggle Button - Client Only -->
        <ClientOnly>
          <button
            @click="toggleTheme"
            aria-label="Toggle theme"
            class="relative w-12.5 h-7.5 rounded-full transition-colors duration-300 focus:outline-none border border-gray-300 dark:border-gray-700 flex mr-2"
            :class="colorMode.value === 'dark' ? 'bg-pink-500' : 'bg-stone-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center"
              :class="colorMode.value === 'dark' ? 'translate-x-5' : 'translate-x-0'"
            >
              <UIcon
                :name="colorMode.value === 'dark' ? 'ix:sun-filled' : 'tabler:moon-filled'"
                class="w-5 h-5 transition-colors duration-300"
                :class="colorMode.value === 'dark' ? 'text-pink-500' : 'text-stone-600'"
              />
            </span>
          </button>
        </ClientOnly>
        <!-- Connect Wallet Button -->
        <UButton color="primary"  icon="solar:wallet-bold" class="hidden md:flex" @click="openLoginPanel" v-if="!authStore.authenticated">
          Connect Wallet
        </UButton>
        <!-- Profile Avatar with Dropdown -->
        <div v-if="authStore.authenticated" class="relative">
          <div class="flex items-center gap-2 cursor-pointer" @click="toggleUserMenu">
            <!-- Avatar with Wallet Icon Overlay -->
            <div class="relative">
              <UAvatar
                :src="userAvatar"
                size="md"
                class="hover:opacity-80 transition-opacity"
                :alt="authStore.player?.username || 'User profile'"
              >
                <template #fallback>
                  <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {{ authStore.player?.avatarId || 'U' }}
                  </div>
                </template>
              </UAvatar>
              <!-- Wallet Icon Overlay -->
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-neutral-800 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center">
                <UIcon 
                  :name="getWalletIcon(authStore.walletType)" 
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
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-4">
              <!-- User Info -->
              <div class="flex items-center gap-3 mb-4">
                <UAvatar
                  :src="userAvatar"
                  size="lg"
                  :alt="authStore.player?.username || 'User profile'"
                >
                  <template #fallback>
                    <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                      {{ authStore.player?.avatarId || 'U' }}
                    </div>
                  </template>
                </UAvatar>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-gray-900 dark:text-white truncate">
                    {{ authStore.player?.username || 'User' }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ authStore.walletType.toUpperCase() }}
                  </div>
                </div>
              </div>
              
              <!-- Wallet Address -->
              <div class="mb-3">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
                <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md">
                  <span class="text-sm font-mono text-gray-900 dark:text-white truncate">
                    {{ authStore.walletAddress }}
                  </span>
                  <UIcon 
                    name="i-heroicons-document-duplicate-20-solid" 
                    class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0" 
                    @click="copyToClipboard(authStore.walletAddress)"
                  />
                </div>
              </div>
              
              <!-- ICP Principal -->
              <div v-if="authStore.icpPrincipal" class="mb-4">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ICP Principal</div>
                <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 rounded-md">
                  <span class="text-sm font-mono text-gray-900 dark:text-white truncate">
                    {{ authStore.icpPrincipal }}
                  </span>
                  <UIcon 
                    name="i-heroicons-document-duplicate-20-solid" 
                    class="text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition flex-shrink-0" 
                    @click="copyToClipboard(authStore.icpPrincipal)"
                  />
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
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject } from 'vue'
import { useColorMode } from '#imports'
import { useAuthStore } from '@/stores/auth'

const colorMode = useColorMode()
const route = useRoute()
const authStore = useAuthStore()

const scrolled = ref(false)
const search = ref('')
const walletConnected = ref(false) // Stub: replace with real wallet logic
const userAvatar = ref('') // Stub: replace with real avatar URL
const showUserMenu = ref(false)

// Inject the login panel ref from the app
const loginPanelRef = inject('loginPanelRef') as any

const onScroll = () => {
  scrolled.value = window.scrollY > 10
}

function toggleTheme() {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

// --- LOGO LOGIC ---
const logoSrc = ref('/logo.svg')

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  onScroll() // Initialize scroll state
  // Set logo based on theme
  if (colorMode.value === 'light') {
    logoSrc.value = '/logo-dark.svg'
  } else {
    logoSrc.value = '/logo.svg'
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', handleClickOutside)
})

watch(() => colorMode.value, (val) => {
  logoSrc.value = val === 'light' ? '/logo-dark.svg' : '/logo.svg'
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', handleClickOutside)
})

function handleHomeClick(e: MouseEvent) {
  if (route.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    // Let Nuxt handle navigation
    return true
  }
}

function openLoginPanel() {
  console.log('openLoginPanel called');
  console.log('loginPanelRef:', loginPanelRef);
  loginPanelRef.value?.open()
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // You could add a toast notification here
    console.log('Copied to clipboard:', text)
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err)
  })
}

function logout() {
  showUserMenu.value = false
  authStore.logout()
}

function getWalletIcon(walletType: string) {
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