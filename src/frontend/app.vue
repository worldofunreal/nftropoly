<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <SidebarNav />
    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-h-screen">
      <Header />
      <main class="flex-1 flex flex-col">
        <NuxtPage />
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from "./components/SidebarNav.vue";
import Header from "./components/Header.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<style>
/* Add any global styles or layout styles here if needed */
</style>
