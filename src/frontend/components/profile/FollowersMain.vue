<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Followers</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          People following you
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="followers.length === 0" class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500">
          <UIcon name="i-heroicons-user-group-20-solid" class="w-12 h-12 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No followers yet</h3>
          <p class="text-gray-500 dark:text-gray-400">
            When people follow you, they'll appear here.
          </p>
        </div>
      </div>

      <!-- Followers List -->
      <div v-else class="space-y-4">
        <CompactProfile
          v-for="user in followers"
          :key="user.id"
          :user="user"
          :show-follow-button="true"
          :clickable="true"
          @click="viewProfile"
          @follow="followUser"
        />
      </div>

      <!-- Load More -->
      <div v-if="hasMore && !loading" class="text-center mt-6">
        <UButton
          color="primary"
          variant="soft"
          @click="loadMore"
          :loading="loadingMore"
        >
          Load More
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { canisterService } from '@/services/CanisterService'
  import CompactProfile from '@/components/CompactProfile.vue'

  const auth = useAuthStore()
  const loading = ref(false)
  const loadingMore = ref(false)
  const followingUser = ref<string | null>(null)
  const followers = ref<any[]>([])
  const hasMore = ref(false)

  // Load followers list
  const loadFollowers = async () => {
    if (!auth.principal) return
    
    loading.value = true
    try {
      const result = await canisterService.getFollowers(auth.principal)
      followers.value = result
    } catch (error) {
      console.error('Failed to load followers:', error)
    } finally {
      loading.value = false
    }
  }

  // Load more followers
  const loadMore = async () => {
    if (loadingMore.value) return
    
    loadingMore.value = true
    try {
      // TODO: Implement pagination
      console.log('Loading more followers...')
    } catch (error) {
      console.error('Failed to load more followers:', error)
    } finally {
      loadingMore.value = false
    }
  }

  // Follow user
  const followUser = async (user: any) => {
    followingUser.value = user.id
    try {
      await canisterService.followUser(user.id.toText())
      
      // Update the user's following status
      const userIndex = followers.value.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        followers.value[userIndex].am_following_them = true
      }
    } catch (error) {
      console.error('Failed to follow user:', error)
    } finally {
      followingUser.value = null
    }
  }

  // View user profile
  const viewProfile = (user: any) => {
    navigateTo(`/profile/@${user.username}`)
  }

  onMounted(() => {
    loadFollowers()
  })
</script>
