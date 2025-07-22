<template>
  <aside
    class="fixed left-0 top-16 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform transition-transform duration-300 ease-in-out"
    :class="{ '-translate-x-full': !isOpen, 'translate-x-0': isOpen }"
  >
    <div class="p-6 flex flex-col items-center justify-center h-full">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4 animate-fade-in">Nftropoly Credits</h2>
      <p class="text-base text-slate-600 dark:text-slate-300 text-center animate-fade-in">
        Purchase Nftropoly Credits to access premium features, download digital files, obtain certifications, and acquire digital assets on our platform.
      </p>
      
      <!-- Quick Actions -->
      <div class="mt-8 w-full space-y-4">
        <button 
          @click="buyCredits"
          class="w-full btn-primary py-3 text-sm"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buy Credits
        </button>
        
        <button 
          @click="viewGallery"
          class="w-full btn-secondary py-3 text-sm"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Gallery
        </button>
        
        <button 
          @click="viewPricing"
          class="w-full btn-secondary py-3 text-sm"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          View Pricing
        </button>
      </div>
      
      <!-- Credit Info -->
      <div class="mt-8 w-full bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-2">How Credits Work</h3>
        <ul class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Use credits to access premium features</li>
          <li>• Download digital files and assets</li>
          <li>• Obtain certifications</li>
          <li>• Credits are non-transferable, for internal use only, and have no cash value</li>
        </ul>
      </div>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="isOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black/50 z-30 md:hidden"
  ></div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'filters-changed'])

// Methods
const closeSidebar = () => {
  emit('close')
}

const buyCredits = () => {
  // TODO: Navigate to credit purchase page
  console.log('Navigate to buy credits')
  closeSidebar()
}

const viewGallery = () => {
  // TODO: Navigate to gallery page
  console.log('Navigate to gallery')
  closeSidebar()
}

const viewPricing = () => {
  // TODO: Navigate to pricing page
  console.log('Navigate to pricing')
  closeSidebar()
}
</script> 