<template>
  <aside
    class="hidden md:block z-100 fixed top-0 left-0 h-screen bg-white/90 dark:bg-neutral-950/90 border-r border-gray-200 dark:border-gray-800 overflow-hidden group"
    :style="{
      width: collapsed ? '4rem' : '13rem',
      transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
    }"
    @mouseenter="collapsed = false"
    @mouseleave="collapsed = true"
  >
    <div class="flex items-center justify-center py-3 gap-1">
      <img
        :src="colorMode.value === 'light' ? '/logo-dark.svg' : '/logo.svg'"
        alt="Nftropoly Logo"
        class="h-7 w-7 transition-all duration-100"
      >
      <img
        v-show="!collapsed"
        :src="
          colorMode.value === 'light' ? '/logo-text-dark.svg' : '/logo-text.svg'
        "
        alt="Nftropoly Text Logo"
        class="h-6 w-auto transition-all duration-100"
      >
    </div>
    <nav class="flex-1 flex flex-col gap-1 py-2 px-1">
      <SidebarItem
        v-for="item in menuItems"
        :key="item.label || 'hr'"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
        :collapsed="collapsed"
        :hr="item.hr"
        icon-size="1.3rem"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import SidebarItem from './SidebarItem.vue'
  import { useColorMode } from '#imports'
  import { useAuthStore } from '@/stores/auth'

  const colorMode = useColorMode()
  const auth = useAuthStore()

  const collapsed = ref(true)

  const menuItems = computed(() => [
    { label: 'Discover', icon: 'eos-icons:compass', to: '/' },
    { label: 'NFTs', icon: 'icon-park-solid:game-ps', to: '/nfts' },
    { label: 'Tokens', icon: 'subway:coin', to: '/tokens' },
    { label: 'Activity', icon: 'tabler:activity', to: '/activity' },
    { 
      label: 'Profile', 
      icon: 'iconamoon:profile-fill', 
      to: auth.userProfile?.username ? `/profile/@${auth.userProfile.username}` : '/profile/' 
    },
    { hr: true },
    { label: 'Settings', icon: 'iconamoon:settings-fill', to: '/settings' },
    { label: 'Support', icon: 'ix:support', to: '/support' },
  ])
</script>

<style scoped>
  /* Remove the old media query styles that were conflicting */
</style>
