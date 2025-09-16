/**
 * KYC composable for managing Know Your Customer compliance
 */

import { ref, computed, onMounted } from 'vue'
// import { Principal } from '@dfinity/principal'
import {
  kycService,
  type KYCStatus,
  type KYCRequirement,
  type KYCDocument,
  type Notification,
  type NotificationPreferences,
} from '~/services/KYCService'
import { useWallet } from './useWallet'

export function useKYC() {
  const { principal } = useWallet()

  // State
  const kycStatus = ref<KYCStatus | null>(null)
  const kycRequirements = ref<KYCRequirement[]>([])
  const kycDocuments = ref<KYCDocument[]>([])
  const notifications = ref<Notification[]>([])
  const notificationPreferences = ref<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    marketing: false,
  })

  const loading = ref(false)
  const submitting = ref(false)

  // Computed
  const isKYCRequired = computed(() => {
    if (!principal.value) return false
    return kycService.isKYCRequired(principal.value)
  })

  const isKYCApproved = computed(() => {
    if (!principal.value) return false
    return kycService.isKYCApproved(principal.value)
  })

  const kycLevel = computed(() => {
    if (!principal.value) return 0
    return kycService.getKYCLevel(principal.value)
  })

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  const unreadCount = computed(() => unreadNotifications.value.length)

  // Methods
  async function loadKYCStatus() {
    if (!principal.value) return

    loading.value = true
    try {
      kycStatus.value = await kycService.getKYCStatus(principal.value)
    } catch (error) {
      console.error('Failed to load KYC status:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadKYCRequirements() {
    loading.value = true
    try {
      const level = kycLevel.value || 1
      kycRequirements.value = await kycService.getKYCRequirements(level)
    } catch (error) {
      console.error('Failed to load KYC requirements:', error)
    } finally {
      loading.value = false
    }
  }

  async function submitKYCDocuments(documents: KYCDocument[]) {
    if (!principal.value) throw new Error('No principal available')

    submitting.value = true
    try {
      await kycService.submitKYCDocuments(principal.value, documents)
      await loadKYCStatus()
    } catch (error) {
      console.error('Failed to submit KYC documents:', error)
      throw error
    } finally {
      submitting.value = false
    }
  }

  async function loadNotifications() {
    if (!principal.value) return

    loading.value = true
    try {
      notifications.value = await kycService.getNotifications(principal.value)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      loading.value = false
    }
  }

  async function markNotificationAsRead(notificationId: string) {
    if (!principal.value) return

    try {
      await kycService.markNotificationAsRead(principal.value, notificationId)
      await loadNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async function markAllNotificationsAsRead() {
    if (!principal.value) return

    try {
      await kycService.markAllNotificationsAsRead(principal.value)
      await loadNotifications()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  async function loadNotificationPreferences() {
    if (!principal.value) return

    try {
      notificationPreferences.value =
        await kycService.getNotificationPreferences(principal.value)
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
  }

  async function updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ) {
    if (!principal.value) return

    try {
      await kycService.updateNotificationPreferences(
        principal.value,
        preferences
      )
      notificationPreferences.value = {
        ...notificationPreferences.value,
        ...preferences,
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    }
  }

  async function createNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) {
    if (!principal.value) return

    try {
      await kycService.createNotification(principal.value, notification)
      await loadNotifications()
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  // Lifecycle
  onMounted(() => {
    if (principal.value) {
      loadKYCStatus()
      loadKYCRequirements()
      loadNotifications()
      loadNotificationPreferences()
    }
  })

  return {
    // State
    kycStatus: readonly(kycStatus),
    kycRequirements: readonly(kycRequirements),
    kycDocuments: readonly(kycDocuments),
    notifications: readonly(notifications),
    notificationPreferences: readonly(notificationPreferences),
    loading: readonly(loading),
    submitting: readonly(submitting),

    // Computed
    isKYCRequired,
    isKYCApproved,
    kycLevel,
    unreadNotifications,
    unreadCount,

    // Methods
    loadKYCStatus,
    loadKYCRequirements,
    submitKYCDocuments,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    loadNotificationPreferences,
    updateNotificationPreferences,
    createNotification,
  }
}

// KYC status composable
export function useKYCStatus() {
  const { kycStatus, isKYCRequired, isKYCApproved, kycLevel, loading } =
    useKYC()

  const status = computed(() => {
    if (loading.value) {
      return {
        status: 'loading',
        message: 'Loading KYC status...',
        color: 'gray' as const,
      }
    }

    if (!kycStatus.value) {
      return {
        status: 'not_required',
        message: 'KYC not required',
        color: 'gray' as const,
      }
    }

    switch (kycStatus.value.status) {
      case 'approved':
        return {
          status: 'approved',
          message: `KYC Level ${kycStatus.value.level} Approved`,
          color: 'green' as const,
        }
      case 'pending':
        return {
          status: 'pending',
          message: 'KYC verification pending',
          color: 'yellow' as const,
        }
      case 'rejected':
        return {
          status: 'rejected',
          message: 'KYC verification rejected',
          color: 'red' as const,
        }
      default:
        return {
          status: 'not_required',
          message: 'KYC not required',
          color: 'gray' as const,
        }
    }
  })

  return {
    status,
    kycStatus,
    isKYCRequired,
    isKYCApproved,
    kycLevel,
    loading,
  }
}

// Notifications composable
export function useNotifications() {
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    notificationPreferences,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationPreferences,
    createNotification,
  } = useKYC()

  const hasUnread = computed(() => unreadCount.value > 0)

  const notificationsByType = computed(() => {
    const grouped: Record<string, Notification[]> = {}
    notifications.value.forEach(notification => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = []
      }
      grouped[notification.type].push(notification)
    })
    return grouped
  })

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    hasUnread,
    notificationsByType,
    notificationPreferences,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateNotificationPreferences,
    createNotification,
  }
}
