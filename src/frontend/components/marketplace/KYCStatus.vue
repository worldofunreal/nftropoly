<template>
  <div class="kyc-status">
    <!-- KYC Status Badge -->
    <UBadge :color="status.color" variant="soft" size="sm" class="kyc-badge">
      <UIcon :name="getStatusIcon()" class="w-3 h-3 mr-1" />
      {{ status.message }}
    </UBadge>

    <!-- KYC Required Alert -->
    <UAlert
      v-if="isKYCRequired && !isKYCApproved"
      icon="i-heroicons-exclamation-triangle"
      color="yellow"
      variant="soft"
      title="KYC Verification Required"
      description="You need to complete KYC verification to access certain marketplace features."
      class="mt-2"
    >
      <template #actions>
        <UButton size="sm" @click="$emit('start-kyc')">
          Start Verification
        </UButton>
      </template>
    </UAlert>

    <!-- KYC Pending Alert -->
    <UAlert
      v-else-if="kycStatus?.status === 'pending'"
      icon="i-heroicons-clock"
      color="blue"
      variant="soft"
      title="KYC Verification Pending"
      description="Your KYC documents are being reviewed. This usually takes 1-3 business days."
      class="mt-2"
    >
      <template #actions>
        <UButton size="sm" variant="outline" @click="$emit('view-status')">
          View Status
        </UButton>
      </template>
    </UAlert>

    <!-- KYC Rejected Alert -->
    <UAlert
      v-else-if="kycStatus?.status === 'rejected'"
      icon="i-heroicons-x-circle"
      color="red"
      variant="soft"
      title="KYC Verification Rejected"
      description="Your KYC verification was rejected. Please review the requirements and resubmit your documents."
      class="mt-2"
    >
      <template #actions>
        <UButton size="sm" color="red" @click="$emit('resubmit-kyc')">
          Resubmit Documents
        </UButton>
      </template>
    </UAlert>

    <!-- KYC Approved Info -->
    <div v-else-if="isKYCApproved" class="kyc-approved-info mt-2">
      <div
        class="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300"
      >
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
        <span>KYC Level {{ kycLevel }} verified</span>
        <span
          v-if="kycStatus?.expiresAt"
          class="text-gray-500 dark:text-gray-400"
        >
          (expires {{ formatDate(kycStatus.expiresAt) }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useKYCStatus } from '~/composables/useKYC'

  const _emit = defineEmits<{
    'start-kyc': []
    'view-status': []
    'resubmit-kyc': []
  }>()

  const { status, kycStatus, isKYCRequired, isKYCApproved, kycLevel } =
    useKYCStatus()

  function getStatusIcon(): string {
    switch (status.value.status) {
      case 'approved':
        return 'i-heroicons-check-circle'
      case 'pending':
        return 'i-heroicons-clock'
      case 'rejected':
        return 'i-heroicons-x-circle'
      case 'loading':
        return 'i-heroicons-arrow-path'
      default:
        return 'i-heroicons-question-mark-circle'
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }
</script>

<style scoped>
  .kyc-status {
    @apply inline-block;
  }

  .kyc-badge {
    @apply inline-flex items-center;
  }

  .kyc-approved-info {
    @apply flex items-center space-x-2;
  }
</style>
