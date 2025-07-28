<template>
  <UApp>
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
        <Header @toggle-mobile-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />
        <main class="flex-1 mb-16">
          <NuxtPage />
        </main>
        <AppFooter />
      </div>
    </div>
    <LoginPanel ref="loginPanelRef" />
    <DisclaimerModal />
  </UApp>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import SidebarNav from "./components/SidebarNav.vue";
import MobileSidebar from "./components/MobileSidebar.vue";
import Header from "./components/Header.vue";
import AppFooter from "./components/AppFooter.vue";
import LoginPanel from "./components/LoginPanel.vue";
import DisclaimerModal from "./components/DisclaimerModal.vue";

const loginPanelRef = ref<{ open: () => void } | null>(null);
const mobileSidebarOpen = ref(false);

// Provide the login panel ref so other components can access it
provide('loginPanelRef', loginPanelRef);
</script>

<style>
/* Add any global styles or layout styles here if needed */
</style>
