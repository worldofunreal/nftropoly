<template>
  <header
    :class="[
      'sticky top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out',
      scrolled
        ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm shadow-md'
        : 'bg-transparent',
      'border-b border-transparent',
      scrolled && 'border-gray-200/50 dark:border-gray-800/50'
    ]"
  >
    <div class="flex justify-between items-center h-16 mx-4 md:mx-4">
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
            :class="colorMode.value === 'dark' ? 'bg-amber-500' : 'bg-sky-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center"
              :class="colorMode.value === 'dark' ? 'translate-x-5' : 'translate-x-0'"
            >
              <UIcon
                :name="colorMode.value === 'dark' ? 'ix:sun-filled' : 'tabler:moon-filled'"
                class="w-5 h-5 transition-colors duration-300"
                :class="colorMode.value === 'dark' ? 'text-amber-500' : 'text-sky-600'"
              />
            </span>
          </button>
        </ClientOnly>
        <!-- Connect Wallet Button -->
        <UButton color="primary" icon="solar:wallet-bold" class="hidden md:flex" @click="openLoginPanel" v-if="!authStore.authenticated">
          Connect Wallet
        </UButton>
        <!-- Profile Avatar -->
        <div v-if="authStore.authenticated" class="flex items-center gap-3">
          <UAvatar
            :src="userAvatar"
            size="md"
            class="cursor-pointer"
            @click="openUserMenu"
            :alt="authStore.player?.username || 'User profile'"
          >
            <template #fallback>
              <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                {{ authStore.player?.avatarId || 'U' }}
              </div>
            </template>
          </UAvatar>
          <div class="hidden md:block">
            <div class="text-sm font-medium">{{ authStore.player?.username || 'User' }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.player?.ethAddress?.slice(0, 6) }}...{{ authStore.player?.ethAddress?.slice(-4) }}</div>
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            icon="solar:logout-2-bold"
            @click="logout"
            class="hidden md:flex"
          >
            Logout
          </UButton>
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
})

watch(() => colorMode.value, (val) => {
  logoSrc.value = val === 'light' ? '/logo-dark.svg' : '/logo.svg'
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
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

function openUserMenu() {
  // Stub: implement user menu logic
  alert('Open user menu (stub)')
}

function logout() {
  authStore.logout()
}
</script>