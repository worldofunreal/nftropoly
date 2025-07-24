<template>
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4">Toast Test Component</h3>
    <div class="space-y-2">
      <UButton @click="showSuccessToast" color="success">
        Show Success Toast
      </UButton>
      <UButton @click="showErrorToast" color="error">
        Show Error Toast
      </UButton>
      <UButton @click="showInfoToast" color="info">
        Show Info Toast
      </UButton>
      <UButton @click="clearAllToasts" color="neutral">
        Clear All Toasts
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()

const showSuccessToast = () => {
  toast.add({
    title: 'Success!',
    description: 'This is a success toast notification',
    color: 'success'
  })
}

const showErrorToast = () => {
  toast.add({
    title: 'Error!',
    description: 'This is an error toast notification',
    color: 'error'
  })
}

const showInfoToast = () => {
  toast.add({
    title: 'Info',
    description: 'This is an info toast notification',
    color: 'info'
  })
}

const clearAllToasts = () => {
  toast.clear()
}
</script> 