<template>
  <footer class="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 fixed bottom-0 left-0 z-30">
    <UContainer class="flex flex-col md:flex-row justify-between items-center py-2 px-2 md:px-6 gap-2 text-xs text-gray-500 dark:text-gray-400">
      <!-- Left Side -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Live Indicator -->
        <span class="flex items-center gap-1 font-semibold text-primary">
          <UIcon name="fluent:live-24-filled" class="text-lg animate-pulse" /> Live
        </span>
        <span class="hidden md:inline">|</span>
        <!-- Networks -->
        <UPopover>
          <UButton color="gray" variant="ghost" size="xs" class="flex items-center gap-1">
            <UIcon name="icon-park-solid:blockchain" class="text-base" /> Networks
          </UButton>
          <template #panel>
            <div class="flex flex-col gap-2 p-2">
              <span class="flex items-center gap-2"><UIcon name="logos:internet-computer-icon" /> ICP <UBadge color="primary" size="xs">Active</UBadge></span>
              <span class="flex items-center gap-2"><UIcon name="token-branded:solana" /> Solana</span>
              <span class="flex items-center gap-2"><UIcon name="logos:ethereum" /> Ethereum</span>
            </div>
          </template>
        </UPopover>
        <span class="hidden md:inline">|</span>
        <!-- Terms/Privacy -->
        <NuxtLink to="/terms" class="flex items-center gap-1 hover:text-primary transition-colors">
          <UIcon name="ri:contract-fill" /> Terms
        </NuxtLink>
        <span class="hidden md:inline">|</span>
        <NuxtLink to="/privacy" class="flex items-center gap-1 hover:text-primary transition-colors">
          <UIcon name="material-symbols:privacy-tip-rounded" /> Privacy
        </NuxtLink>
        <span class="hidden md:inline">|</span>
        <!-- Socials -->
        <a href="#" class="hover:text-primary"><UIcon name="ic:baseline-discord" class="text-lg" /></a>
        <a href="#" class="hover:text-primary"><UIcon name="line-md:twitter-x" class="text-lg" /></a>
      </div>
      <!-- Right Side -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- ICP Price -->
        <span class="flex items-center gap-1">
          <UIcon name="logos:internet-computer-icon" class="text-base" /> $12.34
        </span>
        <span class="hidden md:inline">|</span>
        <!-- Support -->
        <NuxtLink to="/support" class="flex items-center gap-1 hover:text-primary transition-colors">
          <UIcon name="ix:support" /> Support
        </NuxtLink>
        <span class="hidden md:inline">|</span>
        <!-- Theme Switcher -->
        <ClientOnly>
          <button @click="toggleTheme" aria-label="Toggle theme" class="flex items-center gap-1 px-2 py-1 rounded transition-colors border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <UIcon :name="colorMode.value === 'dark' ? 'ix:sun-filled' : 'tabler:moon-filled'" class="text-lg" />
          </button>
        </ClientOnly>
        <span class="hidden md:inline">|</span>
        <!-- Fiat/Crypto Switch -->
        <button @click="toggleFiat" class="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {{ showFiat ? 'USD' : 'Crypto' }}
        </button>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useColorMode } from '#imports'

const colorMode = useColorMode()
const showFiat = ref(false)

function toggleTheme() {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
function toggleFiat() {
  showFiat.value = !showFiat.value
}
</script>