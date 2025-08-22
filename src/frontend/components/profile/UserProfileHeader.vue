<template>
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8">
    <!-- Banner Section -->
    <div class="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
      <img
        v-if="bannerUrl"
        :src="bannerUrl"
        alt="Banner"
        class="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
        crossorigin="anonymous"
        @click="openImageModal(bannerUrl, 'Banner')"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-white text-4xl font-bold">RUSH</span>
      </div>
    </div>
    
    <!-- Profile Info Section -->
    <div class="px-6 pb-6">
      <!-- Avatar Section -->
      <div class="flex justify-between items-start -mt-16 mb-4">
        <div class="relative">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Avatar"
            class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg bg-white object-cover cursor-pointer hover:opacity-90 transition-opacity"
            crossorigin="anonymous"
            @click="openImageModal(avatarUrl, 'Avatar')"
          />
          <div
            v-else
            class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-5xl">{{ avatarInitial }}</span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-3 mt-4 relative z-10">
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
              color="primary"
              variant="solid"
              @click="editProfile"
              class="edit-profile-btn"
            >
              <UIcon name="i-heroicons-pencil-square-20-solid" class="w-4 h-4 mr-2" />
              Edit Profile
            </UButton>
        </div>
      </div>
      
      <!-- User Info -->
      <div class="space-y-6">
        <!-- Row 1: Name/Username/Bio + Wallet Addresses -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- Name, Username, and Bio -->
          <div class="space-y-4 text-left justify-self-start">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ displayName }}
                </h1>
                <span v-if="userProfile?.is_verified" class="text-blue-500">
                  <UIcon name="i-heroicons-check-badge-20-solid" class="w-5 h-5" />
                </span>
              </div>
              <div
                v-if="userProfile?.username && displayName !== userProfile.username"
                class="text-gray-600 dark:text-gray-400"
              >
                @{{ userProfile.username }}
              </div>
            </div>
            
            <!-- Bio -->
            <div v-if="bio" class="text-gray-900 dark:text-white">
              {{ bio }}
            </div>
          </div>

          <!-- Wallet Addresses -->
          <div class="grid grid-cols-2 gap-3 justify-self-end">
            <!-- EVM Address -->
            <div v-if="userProfile?.evm_address?.[0]" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">EVM</span>
              <span class="truncate flex-1">{{ formatAddress(userProfile.evm_address[0]) }}</span>
                              <UIcon
                  name="i-heroicons-document-duplicate-20-solid"
                  class="cursor-pointer hover:text-gray-900 dark:hover:text-white transition flex-shrink-0"
                  @click="copyToClipboard(userProfile.evm_address[0], 'EVM')"
                />
            </div>

            <!-- Bitcoin Address -->
            <div v-if="userProfile?.bitcoin_address?.[0]" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-semibold px-2 py-1 rounded-full">BTC</span>
              <span class="truncate flex-1">{{ formatAddress(userProfile.bitcoin_address[0]) }}</span>
                              <UIcon
                  name="i-heroicons-document-duplicate-20-solid"
                  class="cursor-pointer hover:text-gray-900 dark:hover:text-white transition flex-shrink-0"
                  @click="copyToClipboard(userProfile.bitcoin_address[0], 'Bitcoin')"
                />
            </div>

            <!-- Solana Address -->
            <div v-if="userProfile?.solana_address?.[0]" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">SOL</span>
              <span class="truncate flex-1">{{ formatAddress(userProfile.solana_address[0]) }}</span>
                              <UIcon
                  name="i-heroicons-document-duplicate-20-solid"
                  class="cursor-pointer hover:text-gray-900 dark:hover:text-white transition flex-shrink-0"
                  @click="copyToClipboard(userProfile.solana_address[0], 'Solana')"
                />
            </div>

            <!-- ICP Principal -->
            <div v-if="userProfile?.id" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-2 py-1 rounded-full">ICP</span>
              <span class="truncate flex-1">{{ formatAddress(userProfile.id.toText()) }}</span>
                              <UIcon
                  name="i-heroicons-document-duplicate-20-solid"
                  class="cursor-pointer hover:text-gray-900 dark:hover:text-white transition flex-shrink-0"
                  @click="copyToClipboard(userProfile.id.toText(), 'ICP')"
                />
            </div>
          </div>
        </div>

        <!-- Row 2: Location/Website/Follow Stats + Portfolio Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- Location, Website, Follow Stats -->
          <div class="space-y-4 text-left justify-self-start">
            <!-- Location & Website -->
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div v-if="location" class="flex items-center gap-1">
                <UIcon name="i-heroicons-map-pin-20-solid" class="w-4 h-4" />
                <span>{{ location }}</span>
              </div>
              <div v-if="website" class="flex items-center gap-1">
                <UIcon name="i-heroicons-link-20-solid" class="w-4 h-4" />
                <a :href="website" target="_blank" class="hover:text-blue-500 transition">
                  {{ formatWebsite(website) }}
                </a>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar-20-solid" class="w-4 h-4" />
                <span>Joined {{ userProfile?.created_at ? formatDate(userProfile.created_at) : '' }}</span>
              </div>
            </div>

            <!-- Follow Stats -->
            <div class="flex items-center gap-6 text-sm">
              <button 
                class="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                @click="$emit('tabChange', 'Following')"
              >
                <span class="font-semibold text-gray-900 dark:text-white">{{ userProfile?.following_count || 0 }}</span>
                <span class="text-gray-600 dark:text-gray-400">Following</span>
              </button>
              <button 
                class="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                @click="$emit('tabChange', 'Followers')"
              >
                <span class="font-semibold text-gray-900 dark:text-white">{{ userProfile?.followers_count || 0 }}</span>
                <span class="text-gray-600 dark:text-gray-400">Followers</span>
              </button>
            </div>
          </div>

          <!-- Portfolio Overview -->
          <div class="flex items-center gap-6 text-sm justify-self-end self-end">
            <div class="flex items-center gap-1">
              <span class="text-gray-600 dark:text-gray-400">Portfolio:</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ portfolioValueEth }} ETH</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-600 dark:text-gray-400">NFTs:</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ nftPercentage }}%</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-gray-600 dark:text-gray-400">Tokens:</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ tokenPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Image Modal -->
  <div 
    v-if="imageModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    @click="imageModalOpen = false"
  >
    <div 
      class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl mx-4"
      @click.stop
    >
      <div class="text-center">
        <img
          v-if="selectedImage"
          :src="selectedImage"
          :alt="selectedImageTitle"
          class="max-w-full max-h-[80vh] object-contain rounded-lg"
          crossorigin="anonymous"
        />
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {{ selectedImageTitle }}
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

  // Props
  interface Props {
    userProfile?: any
    isOwnProfile?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    userProfile: undefined,
    isOwnProfile: undefined
  })

  const auth = useAuthStore()
  const route = useRoute()
  const followLoading = ref(false)
  const editProfileModalRef = ref<any>(null)

  // Use props if provided, otherwise fall back to computed logic
  const isOwnProfile = computed(() => {
    if (props.isOwnProfile !== undefined) {
      return props.isOwnProfile
    }
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

  // User profile data - use props if provided, otherwise use auth store
  const userProfile = computed(() => props.userProfile || auth.userProfile)

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
      // EVM: first 6, last 4
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    if (address.startsWith('bc1')) {
      // Bitcoin: first 4, last 4
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    if (address.length > 20) {
      // Solana and others: first 4, last 4
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return address
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
  const copyToClipboard = async (text: string, walletType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      const toast = useToast()
      toast.add({
        title: `${walletType} Address Copied`,
        description: text,
        color: 'success',
      })
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      const toast = useToast()
      toast.add({
        title: `${walletType} Copy Failed`,
        description: 'Failed to copy address to clipboard.',
        color: 'error',
      })
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

  // Image modal functionality
  const imageModalOpen = ref(false)
  const selectedImage = ref<string | null>(null)
  const selectedImageTitle = ref('')

  const openImageModal = (imageUrl: string, title: string) => {
    selectedImage.value = imageUrl
    selectedImageTitle.value = title
    imageModalOpen.value = true
  }

  // Define emits
  defineEmits<{
    tabChange: [tab: string]
  }>()
</script>
