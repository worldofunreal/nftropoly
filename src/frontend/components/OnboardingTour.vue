<template>
  <div v-if="isVisible">
    <!-- Intro.js will render the tour overlay here -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useOnboarding } from '@/composables/useOnboarding'

// Props for customizing the tour
interface Props {
  steps?: any[]
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  autoStart: true
})

// Emit events for parent components
const emit = defineEmits<{
  complete: []
  skip: []
  start: []
}>()

const { shouldShowOnboarding, completeOnboarding } = useOnboarding()

// Tour visibility state
const isVisible = ref(false)
const introInstance = ref<any>(null)

// Default tour steps - can be overridden via props
const defaultSteps = [
  {
    element: '.connect-wallet-btn',
    intro: 'Connect your wallet to start trading NFTs',
    position: 'bottom'
  },
  {
    element: '.search-nfts-section',
    intro: 'Browse and search for NFTs by collection or name',
    position: 'bottom'
  },
  {
    element: '.buy-nft-btn',
    intro: 'Click to buy NFTs directly from listings',
    position: 'top'
  },
  {
    element: '.sell-nft-btn',
    intro: 'List your NFTs for sale here',
    position: 'top'
  },
  {
    element: '.profile-settings-icon',
    intro: 'Access your profile and settings',
    position: 'left'
  }
]

// Use provided steps or default steps
const tourSteps = computed(() => props.steps.length > 0 ? props.steps : defaultSteps)

// Tour configuration
const tourConfig = {
  steps: tourSteps.value,
  showProgress: true,
  showBullets: true,
  showStepNumbers: true,
  exitOnOverlayClick: true,
  exitOnEsc: true,
  nextLabel: 'Next',
  prevLabel: 'Previous',
  skipLabel: 'Skip',
  doneLabel: 'Done',
  tooltipClass: 'custom-tooltip',
  highlightClass: 'custom-highlight',
  scrollToElement: true,
  scrollPadding: 50,
  overlayOpacity: 0.5,
  disableInteraction: false,
  helperElementPadding: 10
}

// Initialize intro.js
const initTour = async () => {
  if (import.meta.client) {
    const introJs = (await import('intro.js')).default
    
    introInstance.value = introJs()
    
    // Configure the tour
    introInstance.value.setOptions(tourConfig)
    
    // Event handlers
    introInstance.value.oncomplete(() => {
      completeOnboarding()
      emit('complete')
      isVisible.value = false
    })
    
    introInstance.value.onexit(() => {
      emit('skip')
      isVisible.value = false
    })
    
    introInstance.value.onstart(() => {
      emit('start')
    })
  }
}

// Start the tour
const startTour = () => {
  if (introInstance.value) {
    isVisible.value = true
    introInstance.value.start()
  }
}

// Stop the tour
const stopTour = () => {
  if (introInstance.value) {
    introInstance.value.exit()
    isVisible.value = false
  }
}

// Watch for changes in shouldShowOnboarding
watch(shouldShowOnboarding, (newValue) => {
  if (newValue && props.autoStart) {
    // Small delay to ensure DOM elements are ready
    setTimeout(() => {
      startTour()
    }, 1000)
  }
}, { immediate: true })

// Initialize on mount
onMounted(async () => {
  await initTour()
})

// Cleanup on unmount
onUnmounted(() => {
  if (introInstance.value) {
    introInstance.value.exit()
  }
})

// Expose methods for parent components
defineExpose({
  startTour,
  stopTour
})
</script>

<style scoped>
/* Custom styles for the tour */
:deep(.custom-tooltip) {
  background: #1f2937;
  color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.custom-highlight) {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  z-index: 1000;
}

:deep(.introjs-tooltip) {
  background: #1f2937 !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 16px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
  max-width: 300px !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

:deep(.introjs-button) {
  background: #3b82f6 !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  cursor: pointer !important;
  transition: background-color 0.2s !important;
}

:deep(.introjs-button:hover) {
  background: #2563eb !important;
}

:deep(.introjs-skipbutton) {
  background: #6b7280 !important;
}

:deep(.introjs-skipbutton:hover) {
  background: #4b5563 !important;
}

:deep(.introjs-arrow) {
  border-color: #1f2937 !important;
}

:deep(.introjs-arrow.top) {
  border-bottom-color: #1f2937 !important;
}

:deep(.introjs-arrow.bottom) {
  border-top-color: #1f2937 !important;
}

:deep(.introjs-arrow.left) {
  border-right-color: #1f2937 !important;
}

:deep(.introjs-arrow.right) {
  border-left-color: #1f2937 !important;
}

/* Mobile-friendly adjustments */
@media (max-width: 768px) {
  :deep(.introjs-tooltip) {
    max-width: 280px !important;
    margin: 10px !important;
  }
  
  :deep(.introjs-button) {
    padding: 10px 12px !important;
    font-size: 13px !important;
  }
}
</style>
