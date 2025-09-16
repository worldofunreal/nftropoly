<template>
  <div class="notification-center">
    <!-- Notification Bell -->
    <UDropdown :items="notificationItems" :popper="{ placement: 'bottom-end' }">
      <UButton variant="ghost" size="sm" class="notification-bell">
        <UIcon name="i-heroicons-bell" class="w-5 h-5" />
        <UBadge
          v-if="unreadCount > 0"
          :label="unreadCount > 99 ? '99+' : unreadCount.toString()"
          color="red"
          size="xs"
          class="notification-badge"
        />
      </UButton>
    </UDropdown>

    <!-- Notification Modal -->
    <UModal v-model="showModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div class="flex items-center space-x-2">
              <UButton
                v-if="unreadCount > 0"
                size="sm"
                variant="outline"
                @click="markAllAsRead"
              >
                Mark All Read
              </UButton>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="showModal = false"
              />
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Notifications List -->
          <div
            v-if="notifications.length > 0"
            class="space-y-2 max-h-96 overflow-y-auto"
          >
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{
                unread: !notification.read,
                read: notification.read,
              }"
              @click="handleNotificationClick(notification)"
            >
              <div
                class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div class="flex-shrink-0">
                  <UIcon
                    :name="getNotificationIcon(notification.type)"
                    class="w-5 h-5"
                    :class="getNotificationIconColor(notification.type)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ notification.title }}
                    </p>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatTime(notification.createdAt) }}
                      </span>
                      <div
                        v-if="!notification.read"
                        class="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <UIcon
              name="i-heroicons-bell-slash"
              class="w-12 h-12 text-gray-400 mx-auto mb-4"
            />
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Notifications
            </h4>
            <p class="text-gray-600 dark:text-gray-400">
              You don't have any notifications yet.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton variant="outline" @click="showPreferences = true">
              <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 mr-2" />
              Preferences
            </UButton>
            <UButton @click="showModal = false"> Close </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Preferences Modal -->
    <UModal v-model="showPreferences" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="showPreferences = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="space-y-3">
            <UFormGroup label="Email Notifications">
              <UToggle v-model="preferences.email" />
            </UFormGroup>
            <UFormGroup label="Push Notifications">
              <UToggle v-model="preferences.push" />
            </UFormGroup>
            <UFormGroup label="SMS Notifications">
              <UToggle v-model="preferences.sms" />
            </UFormGroup>
            <UFormGroup label="In-App Notifications">
              <UToggle v-model="preferences.inApp" />
            </UFormGroup>
            <UFormGroup label="Marketing Notifications">
              <UToggle v-model="preferences.marketing" />
            </UFormGroup>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end space-x-3">
            <UButton variant="outline" @click="showPreferences = false">
              Cancel
            </UButton>
            <UButton @click="savePreferences"> Save Preferences </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useNotifications } from '~/composables/useKYC'
  import type { Notification } from '~/services/KYCService'

  const emit = defineEmits<{
    'notification-click': [notification: Notification]
  }>()

  // Composables
  const {
    notifications,
    unreadCount,
    notificationPreferences,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationPreferences,
  } = useNotifications()

  // State
  const showModal = ref(false)
  const showPreferences = ref(false)
  const preferences = ref({ ...notificationPreferences.value })

  // Computed
  const notificationItems = computed(() => [
    [
      {
        label: 'Notifications',
        slot: 'header',
      },
    ],
    ...notifications.value.slice(0, 5).map(notification => ({
      label: notification.title,
      description: notification.message,
      icon: getNotificationIcon(notification.type),
      click: () => handleNotificationClick(notification),
    })),
    [
      {
        label: 'View All Notifications',
        icon: 'i-heroicons-eye',
        click: () => (showModal.value = true),
      },
    ],
  ])

  // Methods
  function getNotificationIcon(type: string): string {
    const icons = {
      kyc: 'i-heroicons-identification',
      transaction: 'i-heroicons-currency-dollar',
      marketplace: 'i-heroicons-shopping-bag',
      system: 'i-heroicons-cog-6-tooth',
    }
    return icons[type as keyof typeof icons] || 'i-heroicons-bell'
  }

  function getNotificationIconColor(type: string): string {
    const colors = {
      kyc: 'text-blue-500',
      transaction: 'text-green-500',
      marketplace: 'text-purple-500',
      system: 'text-gray-500',
    }
    return colors[type as keyof typeof colors] || 'text-gray-500'
  }

  function formatTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
    }

    emit('notification-click', notification)

    if (notification.actionUrl) {
      // Navigate to action URL
      await navigateTo(notification.actionUrl)
    }
  }

  async function markAllAsRead() {
    await markAllNotificationsAsRead()
  }

  async function savePreferences() {
    await updateNotificationPreferences(preferences.value)
    showPreferences.value = false
  }

  // Watch for changes in notification preferences
  watch(
    notificationPreferences,
    newPrefs => {
      preferences.value = { ...newPrefs }
    },
    { deep: true }
  )
</script>

<style scoped>
  .notification-center {
    @apply relative;
  }

  .notification-bell {
    @apply relative;
  }

  .notification-badge {
    @apply absolute -top-1 -right-1;
  }

  .notification-item {
    @apply transition-colors duration-200;
  }

  .notification-item.unread {
    @apply bg-blue-50 dark:bg-blue-900/20;
  }

  .notification-item.read {
    @apply bg-gray-50 dark:bg-gray-800;
  }
</style>
