<template>
  <header
    :class="[
      'sticky z-50 top-0 left-0 w-full transition-all duration-500 ease-in-out',
      scrolled
        ? 'bg-white/70 dark:bg-neutral-950/70 backdrop-blur-sm shadow-md'
        : 'bg-transparent',
      'border-b border-gray-200 dark:border-gray-800',
    ]"
  >
    <div class="flex justify-between items-center h-14 mx-4 md:mx-4">
      <!-- Left: Mobile Menu Button and Search Bar -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle mobile menu"
          @click="toggleMobileSidebar"
        >
          <UIcon
            name="i-heroicons-bars-3-20-solid"
            class="w-6 h-6 text-gray-700 dark:text-gray-300"
          />
        </button>
        <!-- Search Bar -->
        <div class="hidden md:flex items-center ml-2 search-nfts-section">
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
            class="relative w-12.5 h-7.5 rounded-full transition-colors duration-300 focus:outline-none border border-gray-300 dark:border-gray-700 flex mr-2"
            :class="colorMode.value === 'dark' ? 'bg-pink-500' : 'bg-stone-600'"
            aria-label="Toggle theme"
            @click="toggleTheme"
          >
            <span
              class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center"
              :class="
                colorMode.value === 'dark' ? 'translate-x-5' : 'translate-x-0'
              "
            >
              <UIcon
                :name="
                  colorMode.value === 'dark'
                    ? 'ix:sun-filled'
                    : 'tabler:moon-filled'
                "
                class="w-5 h-5 transition-colors duration-300"
                :class="
                  colorMode.value === 'dark'
                    ? 'text-pink-500'
                    : 'text-stone-600'
                "
              />
            </span>
          </button>
        </ClientOnly>
        <!-- Connect Wallet Button -->
        <UButton
          v-if="!authStore.authenticated"
          color="primary"
          icon="solar:wallet-bold"
          class="hidden md:flex connect-wallet-btn"
          @click="openLoginPanel"
        >
          Connect Wallet
        </UButton>
        <!-- Profile Avatar with Dropdown -->
        <HeaderProfile v-if="authStore.authenticated" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch, inject, type Ref } from 'vue'
  import { useColorMode, useNuxtApp } from '#imports'
  import { useAuthStore } from '@/stores/auth'

  defineOptions({
    name: 'AppHeader',
  })

  const colorMode = useColorMode()
  const authStore = useAuthStore()
  const { $trackInteraction, $trackButtonClick } = useNuxtApp()

  const scrolled = ref(false)
  const search = ref('')

  // Inject the login panel ref from the app
  const loginPanelRef = inject('loginPanelRef') as Ref<{
    open: () => void
  }> | null

  const onScroll = () => {
    scrolled.value = window.scrollY > 10
  }

  function toggleTheme() {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
    $trackButtonClick('Theme Toggle', {
      newTheme: colorMode.value,
      location: 'header',
    })
  }

  function toggleMobileSidebar() {
    // Emit event to parent component to control mobile sidebar visibility
    emit('toggle-mobile-sidebar')
  }

  // Define emits
  const emit = defineEmits<{
    'toggle-mobile-sidebar': []
  }>()

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

  watch(
    () => colorMode.value,
    val => {
      logoSrc.value = val === 'light' ? '/logo-dark.svg' : '/logo.svg'
    }
  )

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  function openLoginPanel() {
    console.log('openLoginPanel called')
    console.log('loginPanelRef:', loginPanelRef)
    $trackButtonClick('Connect Wallet', {
      location: 'header',
      authenticated: authStore.authenticated,
    })
    loginPanelRef?.value?.open()
  }


</script>
