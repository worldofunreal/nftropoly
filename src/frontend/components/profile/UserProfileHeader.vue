<template>
  <div
    class="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl shadow-lg overflow-hidden mb-8 h-80"
  >
    <!-- Background Banner -->
    <div class="absolute inset-0 z-0">
      <img
        v-if="bannerUrl"
        :src="bannerUrl"
        alt="Banner"
        class="w-full h-48 object-cover blur-sm opacity-60"
        crossorigin="anonymous"
      >
      <div v-else class="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
        <span class="text-white text-4xl font-bold">RUSH</span>
      </div>
    </div>
    <div
      class="relative h-full justify-end md:justify-between z-10 flex md:items-end flex-col md:flex-row gap-6 px-8 py-8"
    >
      <!-- Avatar & User Info -->
      <div class="flex items-center gap-6 min-w-0">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg bg-white object-cover"
          crossorigin="anonymous"
        >
        <div
          v-else
          class="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
        >
          <span class="text-white font-bold text-3xl">{{ avatarInitial }}</span>
        </div>
        <div class="flex flex-col gap-2 min-w-0">
          <!-- Display Name / Username -->
          <div
            class="flex items-center gap-2 text-xl font-bold text-white truncate"
          >
            <span class="truncate">{{ displayName }}</span>
            <span v-if="userProfile?.is_verified" class="text-blue-400">✓</span>
          </div>

          <!-- Username -->
          <div
            v-if="userProfile?.username && displayName !== userProfile.username"
            class="text-sm text-gray-200"
          >
            @{{ userProfile.username }}
          </div>

          <!-- Bio -->
          <div v-if="bio" class="text-sm text-gray-200 max-w-md">
            {{ bio }}
          </div>

          <!-- Location & Website -->
          <div class="flex items-center gap-4 text-xs text-gray-300">
            <div v-if="location" class="flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin-20-solid" class="w-3 h-3" />
              <span>{{ location }}</span>
            </div>
            <div v-if="website" class="flex items-center gap-1">
              <UIcon name="i-heroicons-link-20-solid" class="w-3 h-3" />
              <a :href="website" target="_blank" class="hover:text-white transition">{{ formatWebsite(website) }}</a>
            </div>
          </div>

          <!-- Follow Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-200">
            <div class="flex items-center gap-1">
              <span class="font-semibold">{{ userProfile?.following_count || 0 }}</span>
              <span class="text-gray-300">Following</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="font-semibold">{{ userProfile?.followers_count || 0 }}</span>
              <span class="text-gray-300">Followers</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-300">Joined</span>
              <span class="font-semibold">{{ userProfile?.created_at ? formatDate(userProfile.created_at) : '' }}</span>

            </div>
          </div>


        </div>
      </div>
      
              <!-- Action Buttons & Stats Block (Top Right) -->
        <div class="flex flex-col gap-4">
          <!-- Action Buttons -->
          <div class="flex gap-3">
            <!-- Follow/Unfollow Button (only for other users) -->
            <UButton
              v-if="!isOwnProfile"
              :color="isFollowing ? 'neutral' : 'primary'"
              :variant="isFollowing ? 'soft' : 'solid'"
              :loading="followLoading"
              @click="toggleFollow"
              class="follow-btn"
            >
              <UIcon 
                :name="isFollowing ? 'i-heroicons-user-minus-20-solid' : 'i-heroicons-user-plus-20-solid'" 
                class="w-4 h-4 mr-2" 
              />
              {{ isFollowing ? 'Unfollow' : 'Follow' }}
            </UButton>
            
            <!-- Edit Profile Button (own profile only) -->
            <UButton
              v-if="isOwnProfile"
              color="neutral"
              variant="soft"
              @click="editProfile"
              class="edit-profile-btn"
            >
              <UIcon name="i-heroicons-pencil-square-20-solid" class="w-4 h-4 mr-2" />
              Edit Profile
            </UButton>
          </div>
          
          <!-- Cross-Chain Addresses -->
          <div class="space-y-2">
            <!-- EVM Address -->
            <div v-if="userProfile?.evm_address?.[0]" class="flex items-center gap-2 text-xs text-gray-300 truncate">
              <span class="truncate">{{ formatAddress(userProfile.evm_address[0]) }}</span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-300 cursor-pointer hover:text-white transition flex-shrink-0"
                @click="copyToClipboard(userProfile.evm_address[0])"
              />
              <span class="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">EVM</span>
            </div>

            <!-- Bitcoin Address -->
            <div v-if="userProfile?.bitcoin_address?.[0]" class="flex items-center gap-2 text-xs text-gray-300 truncate">
              <span class="truncate">{{ formatAddress(userProfile.bitcoin_address[0]) }}</span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-300 cursor-pointer hover:text-white transition flex-shrink-0"
                @click="copyToClipboard(userProfile.bitcoin_address[0])"
              />
              <span class="bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-full">BTC</span>
            </div>

            <!-- Solana Address -->
            <div v-if="userProfile?.solana_address?.[0]" class="flex items-center gap-2 text-xs text-gray-300 truncate">
              <span class="truncate">{{ formatAddress(userProfile.solana_address[0]) }}</span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-300 cursor-pointer hover:text-white transition flex-shrink-0"
                @click="copyToClipboard(userProfile.solana_address[0])"
              />
              <span class="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">SOL</span>
            </div>

            <!-- ICP Principal -->
            <div v-if="userProfile?.id" class="flex items-center gap-2 text-xs text-gray-300 truncate">
              <span class="truncate">{{ formatAddress(userProfile.id.toText()) }}</span>
              <UIcon
                name="i-heroicons-document-duplicate-20-solid"
                class="text-gray-300 cursor-pointer hover:text-white transition flex-shrink-0"
                @click="copyToClipboard(userProfile.id.toText())"
              />
              <span class="bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-full">ICP</span>
            </div>
          </div>
          
          <!-- Stats Block -->
          <div class="flex gap-x-8 gap-y-2">
            <div class="flex flex-col items-start gap-1">
              <span
                class="uppercase text-xs text-gray-200 font-light flex items-center gap-1"
                >Portfolio Value
              <UIcon
                name="i-heroicons-eye-20-solid"
                class="text-gray-200 text-xs"
            /></span>
              <span class="text-base font-semibold text-white"
                >{{ portfolioValueEth }} ETH</span
              >
            </div>
            <div class="flex flex-col items-start gap-1">
              <span class="uppercase text-xs text-gray-200 font-light">NFTs</span>
              <span class="text-base font-semibold text-white"
                >{{ nftPercentage }}%</span
              >
            </div>
            <div class="flex flex-col items-start gap-1">
              <span class="uppercase text-xs text-gray-200 font-light">Tokens</span>
              <span class="text-base font-semibold text-white"
                >{{ tokenPercentage }}%</span
              >
            </div>
          </div>
        </div>
    </div>
  </div>
  
  <!-- Edit Profile Modal -->
  <EditProfileModal ref="editProfileModalRef" />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { canisterService } from '@/services/CanisterService'
  import { useRoute } from 'vue-router'
  import EditProfileModal from '../EditProfileModal.vue'

  const auth = useAuthStore()
  const route = useRoute()
  const followLoading = ref(false)
  const editProfileModalRef = ref<any>(null)

  // Check if viewing own profile or another user's profile
  const isOwnProfile = computed(() => {
    const currentPrincipal = auth.principal
    const profilePrincipal = userProfile.value?.id
    return currentPrincipal === profilePrincipal?.toText()
  })

  // Check if current user is following this profile
  const isFollowing = computed(() => {
    // TODO: Implement proper following check
    // For now, we'll assume false since we need to check against the current user's following list
    return false
  })

  // User profile data
  const userProfile = computed(() => auth.userProfile)

  // Avatar initial (first letter of username)
  const avatarInitial = computed(() => {
    if (!userProfile.value?.username) return 'U'
    return userProfile.value.username.charAt(0).toUpperCase()
  })

  // Display name (prefer display_name, fallback to username)
  const displayName = computed(() => {
    if (!userProfile.value) return 'Anonymous User'
    // Handle array format from Candid
    const displayNameValue = Array.isArray(userProfile.value.display_name)
      ? userProfile.value.display_name[0]
      : userProfile.value.display_name
    return displayNameValue || userProfile.value.username || 'Anonymous User'
  })

  // Bio text
  const bio = computed(() => {
    if (!userProfile.value?.bio) return ''
    // Handle array format from Candid
    return Array.isArray(userProfile.value.bio)
      ? userProfile.value.bio[0]
      : userProfile.value.bio
  })

  // Location
  const location = computed(() => {
    if (!userProfile.value?.location) return ''
    return Array.isArray(userProfile.value.location)
      ? userProfile.value.location[0]
      : userProfile.value.location
  })

  // Website
  const website = computed(() => {
    if (!userProfile.value?.website) return ''
    return Array.isArray(userProfile.value.website)
      ? userProfile.value.website[0]
      : userProfile.value.website
  })

  // Avatar URL - convert file paths to full URLs with cache busting
  const avatarUrl = computed(() => {
    const avatarPath = userProfile.value?.avatar_url?.[0]
    if (!avatarPath) return null
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) {
      return avatarPath
    }
    
    // Convert file path to full URL with cache busting
    const baseUrl = canisterService.getAssetUrl(avatarPath)
    const timestamp = Date.now()
    return `${baseUrl}?t=${timestamp}`
  })

  // Banner URL - convert file paths to full URLs with cache busting
  const bannerUrl = computed(() => {
    const bannerPath = userProfile.value?.banner_url?.[0]
    if (!bannerPath) return null
    
    // If it's already a full URL, return as is
    if (bannerPath.startsWith('http')) {
      return bannerPath
    }
    
    // Convert file path to full URL with cache busting
    const baseUrl = canisterService.getAssetUrl(bannerPath)
    const timestamp = Date.now()
    return `${baseUrl}?t=${timestamp}`
  })

  // Portfolio stats - using placeholder values for now
  const portfolioValueEth = computed(() => {
    return '0.00' // Portfolio data not available in current backend User type
  })

  const portfolioValueUsd = computed(() => {
    return '0.00' // Portfolio data not available in current backend User type
  })

  const nftPercentage = computed(() => {
    return '0' // Portfolio data not available in current backend User type
  })

  const tokenPercentage = computed(() => {
    return '0' // Portfolio data not available in current backend User type
  })



  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ''
    if (address.startsWith('0x')) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    if (address.startsWith('bc1')) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`
    }
    return address.length > 20
      ? `${address.slice(0, 10)}...${address.slice(-8)}`
      : address
  }

  // Format website URL for display
  const formatWebsite = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return url
    }
  }

  // Format date for display
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log('Copied to clipboard:', text)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Follow/Unfollow functionality
  const toggleFollow = async () => {
    if (!userProfile.value || isOwnProfile.value) return
    
    followLoading.value = true
    try {
      if (isFollowing.value) {
        await canisterService.unfollowUser(userProfile.value.id.toText())
      } else {
        await canisterService.followUser(userProfile.value.id.toText())
      }
      // Refresh profile data
      await canisterService.getMyProfile()
    } catch (error) {
      console.error('Follow/Unfollow failed:', error)
    } finally {
      followLoading.value = false
    }
  }

  // Edit profile function
  const editProfile = () => {
    if (editProfileModalRef.value) {
      editProfileModalRef.value.open()
    }
  }
</script>
