<template>
  <UApp>
    <!-- Google Tag Manager (noscript) -->
    <ClientOnly>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-MGJCRHQ3"
          height="0"
          width="0"
          style="display: none; visibility: hidden"
        />
      </noscript>
    </ClientOnly>
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
    <!-- Temporarily disabled for performance optimization -->
    <!-- <ClientOnly>
      <DisclaimerModal ref="disclaimerModalRef" @close="onDisclaimerClose" />
    </ClientOnly> -->
    <!-- <ClientOnly>
      <OnboardingTour ref="onboardingTourRef" />
    </ClientOnly> -->
    <!-- <ClientOnly>
      <OnboardingTrigger />
    </ClientOnly> -->
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
  // import DisclaimerModal from './components/DisclaimerModal.vue'
  // import OnboardingTour from './components/onBoardingTour/OnboardingTour.vue'
  // import OnboardingTrigger from './components/onBoardingTour/OnboardingTrigger.vue'

  const loginPanelRef = ref<{ open: () => void } | null>(null)
  const mobileSidebarOpen = ref(false)
  const { $trackInteraction } = useNuxtApp()
  // const { startTour } = useOnboarding()

  provide('loginPanelRef', loginPanelRef)

  // Handle disclaimer close event
  // const onDisclaimerClose = () => {
  //   setTimeout(() => {
  //     startTour('registration')
  //   }, 500) // Small delay to ensure smooth transition
  // }

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
  /* Temporarily disabled for performance optimization */
  /* @import 'intro.js/minified/introjs.min.css'; */
</style>
