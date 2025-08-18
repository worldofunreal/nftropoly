<template>
  <UApp>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-MGJCRHQ3"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      />
    </noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div class="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <!-- Desktop Sidebar (hidden on mobile) -->
      <SidebarNav />

      <!-- Mobile Sidebar (hidden on desktop) -->
      <MobileSidebar
        :is-open="mobileSidebarOpen"
        @close="mobileSidebarOpen = false"
      />

      <!-- Main Content Wrapper -->
      <div class="flex-1 flex flex-col min-h-screen md:ml-16">
        <Header
          @toggle-mobile-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
        />
        <main class="flex-1 mb-16">
          <NuxtPage />
        </main>
        <AppFooter />
      </div>
    </div>
    <LoginPanel ref="loginPanelRef" />
    <DisclaimerModal ref="disclaimerModalRef" @close="onDisclaimerClose" />
    <OnboardingTour ref="onboardingTourRef" />
    <OnboardingTrigger />
  </UApp>
</template>

<script setup lang="ts">
  import { ref, provide, onMounted } from 'vue'
  import { useNuxtApp } from '#imports'
  import SidebarNav from './components/SidebarNav.vue'
  import MobileSidebar from './components/MobileSidebar.vue'
  import Header from './components/Header.vue'
  import AppFooter from './components/AppFooter.vue'
  import LoginPanel from './components/LoginPanel.vue'
  import DisclaimerModal from './components/DisclaimerModal.vue'
  import OnboardingTour from './components/onBoardingTour/OnboardingTour.vue'
  import OnboardingTrigger from './components/OnboardingTrigger.vue'

  const loginPanelRef = ref<{ open: () => void } | null>(null)
  const disclaimerModalRef = ref<{
    open: () => void
    close: () => void
  } | null>(null)
  const mobileSidebarOpen = ref(false)
  const { $trackInteraction } = useNuxtApp()
  const onboardingTourRef = ref<{
    startTour: () => void
    stopTour: () => void
    updateTourForRegistration: () => void
  } | null>(null)

  // Handle disclaimer close event
  const onDisclaimerClose = () => {
    // Start the onboarding tour after disclaimer is closed
    setTimeout(() => {
      if (onboardingTourRef?.value?.startTour) {
        onboardingTourRef.value.startTour()
      }
    }, 500) // Small delay to ensure smooth transition
  }

  // Provide the login panel ref so other components can access it
  provide('loginPanelRef', loginPanelRef)
  // Provide the onboarding tour ref for manual triggering
  provide('onboardingTourRef', onboardingTourRef)

  // Track app initialization and key metrics
  onMounted(() => {
    $trackInteraction('App Mounted', {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: Date.now(),
    })
  })
</script>

<style>
  /* Add any global styles or layout styles here if needed */
  @import 'intro.js/minified/introjs.min.css';
</style>
