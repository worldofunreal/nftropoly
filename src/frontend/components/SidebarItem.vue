<template>
  <div>
    <hr v-if="hr" class="my-2 border-gray-200 dark:border-gray-800" />
    <NuxtLink
      v-else
      :to="to"
      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-700 dark:text-gray-200 font-medium"
      :class="collapsed ? 'justify-center' : ''"
      active-class="bg-primary/10 dark:bg-primary/20 text-primary"
    >
      <UIcon :name="icon" class="text-2xl" />
      <span v-if="!collapsed" class="truncate">{{ label }}</span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  icon: String,
  label: String,
  to: String,
  collapsed: Boolean,
  hr: Boolean
})
</script> 