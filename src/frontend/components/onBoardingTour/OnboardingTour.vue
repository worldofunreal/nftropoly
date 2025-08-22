<template>
  <div>
    <!-- Intro.js will render the tour overlay here -->
  </div>
</template>

<script setup lang="ts">
  import { useOnboarding } from '@/composables/useOnboarding'
  const { stopTour } = useOnboarding()

  // Cleanup on unmount
  onUnmounted(() => {
    stopTour()
  })

  // Expose methods for parent components
  defineExpose({
    stopTour,
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

  :deep(.welcome-tooltip) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 24px !important;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
    max-width: 400px !important;
    font-size: 16px !important;
    line-height: 1.6 !important;
    text-align: center !important;
    font-weight: 500 !important;
  }

  :deep(.registration-tooltip) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 20px !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3) !important;
    max-width: 350px !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    text-align: center !important;
  }

  :deep(.login-panel-tooltip) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 20px !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3) !important;
    max-width: 350px !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    text-align: center !important;
  }

  :deep(.wallet-btn-tooltip) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  :deep(.registration-step-tooltip) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
    color: white !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
  }

  :deep(.create-profile-tooltip) {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    color: #333 !important;
    border-radius: 10px !important;
    padding: 16px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    max-width: 300px !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    text-align: center !important;
    font-weight: 600 !important;
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
