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
    <UContainer class="flex justify-between items-center h-16">
      <!-- Left: Search Bar -->
      <div class="flex items-center gap-4">
        <NuxtLink 
          to="/" 
          class="flex items-center group"
          aria-label="Home"
          @click.prevent="handleHomeClick"
        >
          <img 
            :src="logoSrc"
            alt="Nftropoly - The Multichain, Gasless NFT Marketplace" 
            class="h-8 md:h-8 transition-all duration-100 group-hover:scale-105" 
          />
        </NuxtLink>
        <!-- Search Bar -->
        <div class="hidden md:flex items-center ml-6">
          <UInput
            v-model="search"
            placeholder="Search Nftropoly"
            size="md"
            class="w-64"
            icon="ri:search-line"
            :ui="{ icon: { trailing: false } }"
          />
        </div>
      </div>
      <!-- Right: Actions -->
      <div class="flex items-center gap-4">
        <!-- Connect Wallet Button -->
        <UButton color="primary" icon="solar:wallet-bold" class="hidden md:flex" @click="connectWallet" v-if="!walletConnected">
          Connect Wallet
        </UButton>
        <!-- Profile Avatar -->
        <div v-if="walletConnected">
          <UAvatar
            :src="userAvatar"
            size="md"
            class="cursor-pointer"
            @click="openUserMenu"
            :alt="'User profile'"
          >
            <template #fallback>
              <UIcon name="ix:user-profile-filled" class="w-6 h-6 text-gray-400" />
            </template>
          </UAvatar>
        </div>
        <!-- Theme Toggle Button - Client Only -->
        <ClientOnly>
          <button
            @click="toggleTheme"
            aria-label="Toggle theme"
            class="relative w-12.5 h-7.5 rounded-full transition-colors duration-300 focus:outline-none border border-gray-300 dark:border-gray-700 flex"
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
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const route = useRoute()

const scrolled = ref(false)
const search = ref('')
const walletConnected = ref(false) // Stub: replace with real wallet logic
const userAvatar = ref('') // Stub: replace with real avatar URL

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

function connectWallet() {
  // Stub: implement wallet connect logic
  walletConnected.value = true
}

function openUserMenu() {
  // Stub: implement user menu logic
  alert('Open user menu (stub)')
}
</script>