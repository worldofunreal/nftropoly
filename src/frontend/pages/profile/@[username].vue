<template>
  <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 flex-col">
    <!-- Loading State -->
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  onMounted(() => {
    // Extract username and redirect to the proper route
    const username = route.params.username as string
    router.replace(`/profile/${username}`)
  })
</script>
