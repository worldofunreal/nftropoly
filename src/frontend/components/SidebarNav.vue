<template>
  <aside
    :class="[
      'sticky top-0 left-0 h-screen z-40 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
      collapsed ? 'w-20' : 'w-64',
    ]"
    @mouseenter="collapsed = false"
    @mouseleave="collapsed = true"
  >
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

const collapsed = ref(true)

const menuItems = [
  { label: 'Discover', icon: 'iconamoon:discover-fill', to: '/home' },
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
</style> 