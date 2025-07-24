<template>
  <aside
    class="z-100 fixed top-0 left-0 h-screen z-40 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 overflow-hidden group"
    :style="{ width: collapsed ? '5rem' : '16rem', transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)' }"
    @mouseenter="collapsed = false"
    @mouseleave="collapsed = true"
  >
    <div class="flex items-center justify-center py-6 gap-2">
      <img
        :src="colorMode.value === 'light' ? '/logo-dark.svg' : '/logo.svg'"
        alt="Nftropoly Logo"
        class="h-10 w-auto transition-all duration-100"
      />
      <img
        v-show="!collapsed"
        :src="colorMode.value === 'light' ? '/logo-text-dark.svg' : '/logo-text.svg'"
        alt="Nftropoly Text Logo"
        class="h-8 w-auto transition-all duration-100"
      />
    </div>
    <nav class="flex-1 flex flex-col gap-2 py-6 px-2">
      <SidebarItem
        v-for="item in menuItems"
        :key="item.label || 'hr'"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
        :collapsed="collapsed"
        :hr="item.hr"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarItem from './SidebarItem.vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()

const collapsed = ref(true)

const menuItems = [
  { label: 'Discover', icon: 'iconamoon:discover-fill', to: '/' },
  { label: 'NFTs', icon: 'ri:nft-fill', to: '/nfts' },
  { label: 'Tokens', icon: 'ic:baseline-generating-tokens', to: '/tokens' },
  { label: 'Activity', icon: 'fa-solid:list', to: '/activity' },
  { label: 'Profile', icon: 'ix:user-profile-filled', to: '/profile' },
  { hr: true },
  { label: 'Settings', icon: 'iconamoon:settings-fill', to: '/settings' },
  { label: 'Support', icon: 'ix:support', to: '/support' },
]
</script>

<style scoped>
/* Hide on mobile, show on md+ */
@media (max-width: 767px) {
  aside {
    display: none;
  }
}
/* No extra styles needed for mask/width animation, handled inline */
</style> 