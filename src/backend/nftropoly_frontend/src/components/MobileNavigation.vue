<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-slate-200 dark:border-slate-700 mobile-nav">
    <div class="flex items-center justify-around px-2 py-2">
      <!-- Home -->
      <a
        href="#home"
        class="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
        :class="activeSection === 'home' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        @click="setActiveSection('home')"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs font-medium">Home</span>
      </a>

      <!-- Services -->
      <a
        href="#services"
        class="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
        :class="activeSection === 'services' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        @click="setActiveSection('services')"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class="text-xs font-medium">Services</span>
      </a>

      <!-- Buy Credits -->
      <a
        href="#pricing"
        class="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
        :class="activeSection === 'pricing' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        @click="setActiveSection('pricing')"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span class="text-xs font-medium">Credits</span>
      </a>

      <!-- Gallery -->
      <a
        href="#gallery"
        class="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
        :class="activeSection === 'gallery' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        @click="setActiveSection('gallery')"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-medium">Gallery</span>
      </a>

      <!-- Profile -->
      <a
        href="#profile"
        class="flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200"
        :class="activeSection === 'profile' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 active' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        @click="setActiveSection('profile')"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs font-medium">Profile</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  initialSection: {
    type: String,
    default: 'home'
  }
})

// Emits
const emit = defineEmits(['section-changed'])

// Reactive state
const activeSection = ref(props.initialSection)

// Methods
const setActiveSection = (section) => {
  activeSection.value = section
  emit('section-changed', section)
}
</script> 