<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Following</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          People you follow
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="following.length === 0" class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500">
          <UIcon name="i-heroicons-user-group-20-solid" class="w-12 h-12 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Not following anyone yet</h3>
          <p class="text-gray-500 dark:text-gray-400">
            When you follow people, they'll appear here.
          </p>
        </div>
      </div>

      <!-- Following List -->
      <div v-else class="space-y-4">
        <div
          v-for="user in following"
          :key="user.id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Avatar -->
              <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-user-20-solid" class="w-6 h-6 text-gray-500" />
              </div>
              
              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ user.display_name || user.username }}
                  </h3>
                  <span v-if="user.is_verified" class="text-blue-500">✓</span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{{ user.username }}
                </p>
                <p v-if="user.bio" class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {{ user.bio }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                @click="viewProfile(user.id)"
              >
                View Profile
              </UButton>
              <UButton
                size="sm"
                color="red"
                variant="soft"
                @click="unfollowUser(user.id)"
                :loading="unfollowingUser === user.id"
              >
                Unfollow
              </UButton>
            </div>
          </div>
        </div>
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

  const auth = useAuthStore()
  const loading = ref(false)
  const loadingMore = ref(false)
  const unfollowingUser = ref<string | null>(null)
  const following = ref<any[]>([])
  const hasMore = ref(false)

  // Load following list
  const loadFollowing = async () => {
    if (!auth.principal) return
    
    loading.value = true
    try {
      const result = await canisterService.getFollowing(auth.principal)
      following.value = result
    } catch (error) {
      console.error('Failed to load following:', error)
    } finally {
      loading.value = false
    }
  }

  // Load more following
  const loadMore = async () => {
    if (loadingMore.value) return
    
    loadingMore.value = true
    try {
      // TODO: Implement pagination
      console.log('Loading more following...')
    } catch (error) {
      console.error('Failed to load more following:', error)
    } finally {
      loadingMore.value = false
    }
  }

  // Unfollow user
  const unfollowUser = async (userId: string) => {
    unfollowingUser.value = userId
    try {
      await canisterService.unfollowUser(userId)
      
      // Remove from list
      following.value = following.value.filter(user => user.id !== userId)
    } catch (error) {
      console.error('Failed to unfollow user:', error)
    } finally {
      unfollowingUser.value = null
    }
  }

  // View user profile
  const viewProfile = (userId: string) => {
    // TODO: Navigate to user profile
    console.log('Viewing profile:', userId)
  }

  onMounted(() => {
    loadFollowing()
  })
</script>
