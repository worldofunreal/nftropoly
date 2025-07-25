<template>
  <!-- Simple Modal Overlay -->
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/90" @click="show = false"></div>
    <!-- Modal Content -->
    <div class="relative bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <!-- Logo Section -->
        <div class="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="NFTropoly Logo" class="w-12 h-12 mb-2" />
          <img src="/logo-text-dark.svg" alt="NFTropoly" class="h-6 dark:invert" />
        </div>

        <!-- Disclaimer Content -->
        <div class="text-center mb-6">
          <h2 class="text-lg font-bold mb-1">Disclaimer</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            WCHL 2025 participant, application is under construction using mock data for demonstration purposes.          </p>
        </div>

        <!-- Accept Button -->
        <div class="flex justify-center">
          <UButton 
            color="primary" 
            @click="acceptDisclaimer"
            class="px-6 py-2"
          >
            Accept & Continue
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const show = ref(false);

// Check if disclaimer has been accepted before
const hasAcceptedDisclaimer = () => {
  return localStorage.getItem('disclaimerAccepted') === 'true';
};

// Mark disclaimer as accepted
const acceptDisclaimer = () => {
  localStorage.setItem('disclaimerAccepted', 'true');
  show.value = false;
};

// Show disclaimer on mount if not accepted before
onMounted(() => {
  if (!hasAcceptedDisclaimer()) {
    show.value = true;
  }
});

defineExpose({ 
  open: () => { 
    show.value = true; 
  }, 
  close: () => { 
    show.value = false; 
  } 
});
</script> 