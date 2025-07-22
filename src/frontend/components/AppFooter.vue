<template>
  <footer class="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 relative overflow-hidden pt-12 pb-6">
    <!-- Decorative Particles -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="w-full h-full bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent opacity-60"></div>
    </div>
    <UContainer class="relative z-10">
      <div class="flex flex-col items-center gap-6">
        <!-- Brand -->
        <div class="flex flex-col items-center gap-4">
          <img
            :src="logoSrc"
            alt="Nftropoly - The Multichain, Gasless NFT Marketplace"
            class="h-8"
          />
          <p class="uppercase tracking-widest text-xs text-gray-500 dark:text-gray-400 font-semibold">The Multichain, Gasless NFT Marketplace</p>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 gap-2">
        <div>
          &copy; {{ new Date().getFullYear() }} Nftropoly
        </div>
        <div class="flex items-center gap-2">
          <span>Built on the</span>
          <a href="#" class="flex items-center gap-1 hover:text-primary transition-colors">
            <UIcon name="logos:internet-computer-icon" /> Internet Computer
          </a>
          <span>•</span>
          <span class="flex items-center gap-1">
            <UIcon name="hugeicons:ai-cloud" class="text-primary" />
            Made with AI
          </span>
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
import { useColorMode } from '#imports'
import { ref, onMounted, watch } from 'vue'

const colorMode = useColorMode()

// --- LOGO LOGIC ---
const logoSrc = ref('/logo.svg')

onMounted(() => {
  if (colorMode.value === 'light') {
    logoSrc.value = '/logo-dark.svg'
  } else {
    logoSrc.value = '/logo.svg'
  }
})

watch(() => colorMode.value, (val) => {
  logoSrc.value = val === 'light' ? '/logo-dark.svg' : '/logo.svg'
})
</script>