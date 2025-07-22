<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <img src="/nft.svg" alt="Nftropoly Logo" class="w-8 h-8" />
            <span 
              class="brand-text brand-gradient-light dark:brand-gradient-dark"
            >
              NFTROPOLY
            </span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="#services" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium">
            Services
          </a>
          <a href="#pricing" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium">
            Pricing
          </a>
          <a href="#gallery" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium">
            Gallery
          </a>
          <a href="#support" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium">
            Support
          </a>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Search -->
          <div class="hidden lg:block relative">
            <input
              type="text"
              placeholder="Search designs..."
              class="input-field w-64 pl-10 pr-4"
            />
            <svg
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <!-- Mobile Search Button -->
          <button
            @click="toggleMobileSearch"
            class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Theme Toggle -->
          <ThemeToggle />

          <!-- User Avatar/Sign In -->
          <div v-if="user" class="relative group">
            <button class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <img :src="user.picture" alt="avatar" class="w-8 h-8 rounded-full border-2 border-blue-400 shadow" />
              <span class="hidden sm:inline font-semibold text-slate-900 dark:text-white">{{ user.name || user.email }}</span>
              <svg class="w-4 h-4 ml-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <div class="px-4 py-2 text-slate-700 dark:text-slate-300 text-sm truncate">{{ user.email }}</div>
              <button @click="handleSignOut" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-b-xl text-sm">Sign Out</button>
            </div>
          </div>
          <button
            v-else
            class="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2"
            @click="showSignIn = true"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="hidden sm:inline">Sign In</span>
            <span class="sm:hidden">Account</span>
          </button>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden glass-effect border-t border-slate-200 dark:border-slate-700"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <!-- Mobile Search -->
        <div v-if="isMobileSearchOpen" class="px-3 py-2">
          <input
            type="text"
            placeholder="Search designs..."
            class="input-field w-full pl-10 pr-4"
            v-model="searchQuery"
            @keyup.enter="performSearch"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <a
          href="#services"
          class="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
        >
          Services
        </a>
        <a
          href="#pricing"
          class="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
        >
          Pricing
        </a>
        <a
          href="#gallery"
          class="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
        >
          Gallery
        </a>
        <a
          href="#support"
          class="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
        >
          Support
        </a>
      </div>
    </div>

    <!-- Add SignInPanel modal -->
    <SignInPanel
      v-if="showSignIn"
      @close="handleSignInClose"
      @google-signin="handleGoogleSignIn"
      @email-signin="handleEmailSignIn"
    />
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import SignInPanel from './SignInPanel.vue'

const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const searchQuery = ref('')
const showSignIn = ref(false)

const user = ref(null)

const loadUser = () => {
  try {
    const u = localStorage.getItem('nftropoly_user')
    user.value = u ? JSON.parse(u) : null
  } catch (e) {
    user.value = null
  }
}

onMounted(() => {
  loadUser()
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

const handleSignInClose = () => {
  showSignIn.value = false
}
const handleGoogleSignIn = () => {
  // Build Google OAuth URL
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const redirectUri = `${window.location.origin}/api/auth/callback/google`
  const scope = 'openid email profile'
  const responseType = 'code'
  const state = Math.random().toString(36).substring(2) // simple random state
  const oauthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${encodeURIComponent(responseType)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`
  window.location.href = oauthUrl
}
const handleEmailSignIn = (payload) => {
  showSignIn.value = false
  console.log('Email sign in requested', payload)
}

const performSearch = () => {
  // Implement search functionality
  console.log('Performing search:', searchQuery.value)
}

const handleSignOut = () => {
  localStorage.removeItem('nftropoly_user')
  user.value = null
  window.location.reload()
}
</script> 