<template>
  <UApp>
    <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Sidebar -->
      
      <!-- Main Content Wrapper -->
      <div class="flex-1 flex flex-col min-h-screen" style="margin-left: 4rem;">
        <Header />
        <main class="flex-1 flex flex-col">
          <NuxtPage />
        </main>
        <AppFooter />
      </div>
      <SidebarNav />
    </div>
    <LoginPanel ref="loginPanelRef" />
  </UApp>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import SidebarNav from "./components/SidebarNav.vue";
import Header from "./components/Header.vue";
import AppFooter from "./components/AppFooter.vue";
import LoginPanel from "./components/LoginPanel.vue";

const loginPanelRef = ref<any>(null);

// Provide the login panel ref so other components can access it
provide('loginPanelRef', loginPanelRef);
</script>

<style>
/* Add any global styles or layout styles here if needed */
</style>
