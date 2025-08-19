<template>
  <div class="fixed bottom-4 right-4 z-50">
    <UButton
      color="primary"
      variant="solid"
      size="sm"
      icon="i-heroicons-question-mark-circle"
      class="shadow-lg"
      @click="triggerOnboarding"
    >
      Start Tour
    </UButton>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue'
  import { useOnboarding } from '@/composables/useOnboarding'

  const { resetOnboarding } = useOnboarding()

  // Inject the onboarding tour ref from parent
  const onboardingTourRef = inject('onboardingTourRef') as any

  const triggerOnboarding = () => {
    // Reset onboarding state for testing
    resetOnboarding()

    // Trigger the tour
    if (onboardingTourRef?.value?.startTour) {
      onboardingTourRef.value.startTour()
    }
  }
</script>
