<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out',
      scrolled
        ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm shadow-md'
        : 'bg-transparent',
      'border-b border-transparent',
      scrolled && 'border-gray-200/50 dark:border-gray-800/50'
    ]"
  >
    <UContainer class="flex justify-between items-center h-16">
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

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
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
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const route = useRoute()

const scrolled = ref(false)

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
</script>