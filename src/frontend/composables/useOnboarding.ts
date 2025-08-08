import { ref, computed } from 'vue'

export const useOnboarding = () => {
  // Check if user has completed onboarding
  const hasCompletedOnboarding = ref(false)
  
  // Check if onboarding should be shown (first-time visitor)
  const shouldShowOnboarding = computed(() => {
    if (import.meta.client) {
      return !localStorage.getItem('nftropoly-onboarding-completed')
    }
    return false
  })
  
  // Mark onboarding as completed
  const completeOnboarding = () => {
    if (import.meta.client) {
      localStorage.setItem('nftropoly-onboarding-completed', 'true')
      hasCompletedOnboarding.value = true
    }
  }
  
  // Reset onboarding (for testing purposes)
  const resetOnboarding = () => {
    if (import.meta.client) {
      localStorage.removeItem('nftropoly-onboarding-completed')
      hasCompletedOnboarding.value = false
    }
  }
  
  // Initialize onboarding state
  const initOnboarding = () => {
    if (import.meta.client) {
      hasCompletedOnboarding.value = !!localStorage.getItem('nftropoly-onboarding-completed')
    }
  }
  
  return {
    hasCompletedOnboarding,
    shouldShowOnboarding,
    completeOnboarding,
    resetOnboarding,
    initOnboarding
  }
}
