<template>
  <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">The user "@{{ username }}" could not be found.</p>
        <UButton @click="$router.push('/')" color="primary">
          Go Home
        </UButton>
      </div>
    </div>
    
    <!-- Profile Content -->
    <div v-else-if="userProfile" class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 flex-col">
      <!-- Top User Info Header -->
      <UserProfileHeader 
        :user-profile="userProfile" 
        :is-own-profile="isOwnProfile"
        @tab-change="activeTab = $event" 
      />
      <!-- Navigation Tabs -->
      <div class="px-4 mt-4">
        <ProfileTabs v-model="activeTab" />
      </div>
      <!-- Bottom Section: Tabbed Content -->
      <div class="flex-1 flex w-full min-h-0">
        <!-- Sidebar (except Following/Followers tabs) - Hidden on mobile -->
        <component
          :is="sidebarComponent"
          v-if="!['Following', 'Followers'].includes(activeTab)"
          :tab="activeTab"
          class="hidden md:block"
        />
        <!-- Main Content Area -->
        <div class="w-0 flex-1 min-h-0">
          <component :is="tabComponent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { canisterService } from '@/services/CanisterService'
  import UserProfileHeader from '~/components/profile/UserProfileHeader.vue'
  import ProfileTabs from '~/components/profile/ProfileTabs.vue'
  
  // Sidebar components for each tab
  import NFTsSidebar from '@/components/profile/NFTsSidebar.vue'
  import TokensSidebar from '@/components/profile/TokensSidebar.vue'
  import ListingsSidebar from '@/components/profile/ListingsSidebar.vue'
  import OffersSidebar from '@/components/profile/OffersSidebar.vue'
  import PortfolioSidebar from '@/components/profile/PortfolioSidebar.vue'
  import CreatedSidebar from '@/components/profile/CreatedSidebar.vue'
  import ActivitySidebar from '@/components/profile/ActivitySidebar.vue'
  
  // Main area components for each tab
  import NFTsMain from '@/components/profile/NFTsMain.vue'
  import TokensMain from '@/components/profile/TokensMain.vue'
  import ListingsMain from '@/components/profile/ListingsMain.vue'
  import OffersMain from '@/components/profile/OffersMain.vue'
  import PortfolioMain from '@/components/profile/PortfolioMain.vue'
  import CreatedMain from '@/components/profile/CreatedMain.vue'
  import FollowingMain from '@/components/profile/FollowingMain.vue'
  import FollowersMain from '@/components/profile/FollowersMain.vue'
  import ActivityMain from '@/components/profile/ActivityMain.vue'

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  
  const loading = ref(true)
  const error = ref(false)
  const userProfile = ref<any>(null)
  const activeTab = ref('NFTs')

  // Extract username from route (remove @ symbol)
  const username = computed(() => {
    const routeUsername = route.params.username as string
    return routeUsername.startsWith('@') ? routeUsername.slice(1) : routeUsername
  })

  // SSR: Fetch profile data on server-side (optional, falls back to client-side)
  const { data: ssrProfile } = await useFetch(`/api/profile/${username.value}`, {
    key: `profile-${username.value}`,
    default: () => null,
    server: true,
    // Don't fail if SSR API is not available
    onResponseError: () => {
      console.log('SSR API not available, will use client-side fetching')
    }
  })

  // If SSR data is available and valid, use it immediately
  if (ssrProfile.value && ssrProfile.value.success !== false) {
    userProfile.value = ssrProfile.value
    loading.value = false
  }

  // Check if this is the current user's profile
  const isOwnProfile = computed(() => {
    if (!userProfile.value || !auth.userProfile) return false
    return userProfile.value.id?.toText() === auth.userProfile.id?.toText()
  })

  const tabComponent = computed(() => {
    switch (activeTab.value) {
      case 'NFTs':
        return NFTsMain
      case 'Tokens':
        return TokensMain
      case 'Listings':
        return ListingsMain
      case 'Offers':
        return OffersMain
      case 'Portfolio':
        return PortfolioMain
      case 'Created':
        return CreatedMain
      case 'Following':
        return FollowingMain
      case 'Followers':
        return FollowersMain
      case 'Activity':
        return ActivityMain
      default:
        return NFTsMain
    }
  })

  const sidebarComponent = computed(() => {
    switch (activeTab.value) {
      case 'NFTs':
        return NFTsSidebar
      case 'Tokens':
        return TokensSidebar
      case 'Listings':
        return ListingsSidebar
      case 'Offers':
        return OffersSidebar
      case 'Portfolio':
        return PortfolioSidebar
      case 'Created':
        return CreatedSidebar
      case 'Activity':
        return ActivitySidebar
      default:
        return NFTsSidebar
    }
  })

  // Load user profile (fallback for when SSR fails)
  const loadUserProfile = async () => {
    // Skip if we already have SSR data
    if (userProfile.value) {
      return
    }
    
    loading.value = true
    error.value = false
    
    try {
      // Initialize canister service if needed (works for both authenticated and public access)
      if (!canisterService.isInitialized()) {
        await canisterService.initializeAnonymous()
      }
      
      // Get user profile by username (works for both authenticated and public access)
      const profile = await canisterService.getPublicProfile(username.value)
      
      if (profile) {
        userProfile.value = profile
      } else {
        error.value = true
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    // Always ensure we have data, fall back to client-side if SSR failed
    if (!userProfile.value) {
      loadUserProfile()
    } else {
      // SSR data is available, we're done loading
      loading.value = false
    }
  })

  // Watch for route changes
  watch(() => route.params.username, () => {
    // Reset and reload for new username
    userProfile.value = null
    loadUserProfile()
  })
</script>
