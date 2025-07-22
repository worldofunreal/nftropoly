<template>
  <div class="app">
    <Header />
    <main class="main-content">
      <NuxtPage />
    </main>
        <UToaster />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue'
import AppFooter from '~/components/AppFooter.vue'
</script>

<style>
/* Add any global styles or layout styles here if needed */
</style>
