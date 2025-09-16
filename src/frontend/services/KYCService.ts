/**
 * KYC Service for handling Know Your Customer compliance
 * Implements ICRC-64 and ICRC-71 standards
 */

import { Principal } from '@dfinity/principal'

export interface KYCStatus {
  principal: Principal
  status: 'pending' | 'approved' | 'rejected' | 'not_required'
  level: number
  verifiedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
}

export interface KYCRequirement {
  level: number
  name: string
  description: string
  required: boolean
  documents: string[]
}

export interface KYCDocument {
  id: string
  type: string
  name: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: Date
  reviewedAt?: Date
  url?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  marketing: boolean
}

export interface Notification {
  id: string
  type: 'kyc' | 'transaction' | 'marketplace' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
  metadata?: Record<string, unknown>
}

class KYCService {
  private kycStatus: Map<string, KYCStatus> = new Map()
  private notifications: Map<string, Notification[]> = new Map()

  // KYC Status Management
  async getKYCStatus(principal: Principal): Promise<KYCStatus | null> {
    const key = principal.toText()
    return this.kycStatus.get(key) || null
  }

  async updateKYCStatus(
    _principal: Principal,
    status: Partial<KYCStatus>
  ): Promise<void> {
    const key = _principal.toText()
    const current = this.kycStatus.get(key) || {
      principal: _principal,
      status: 'not_required',
      level: 0,
    }

    this.kycStatus.set(key, { ...current, ...status })
  }

  async submitKYCDocuments(
    principal: Principal,
    documents: KYCDocument[]
  ): Promise<void> {
    // Mock implementation - in real app this would call the backend
    console.log('Submitting KYC documents:', {
      principal: principal.toText(),
      documents,
    })

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update status to pending
    await this.updateKYCStatus(principal, {
      status: 'pending',
      level: 1,
    })
  }

  async getKYCRequirements(level: number): Promise<KYCRequirement[]> {
    // Mock requirements based on level
    const requirements: KYCRequirement[] = [
      {
        level: 1,
        name: 'Basic Identity Verification',
        description: 'Verify your identity with government-issued ID',
        required: true,
        documents: ['passport', 'drivers_license', 'national_id'],
      },
      {
        level: 2,
        name: 'Address Verification',
        description: 'Provide proof of address',
        required: true,
        documents: ['utility_bill', 'bank_statement', 'government_letter'],
      },
      {
        level: 3,
        name: 'Enhanced Due Diligence',
        description: 'Additional verification for high-value transactions',
        required: false,
        documents: [
          'source_of_funds',
          'employment_verification',
          'financial_statements',
        ],
      },
    ]

    return requirements.filter(req => req.level <= level)
  }

  // Notification Management
  async getNotifications(principal: Principal): Promise<Notification[]> {
    const key = principal.toText()
    return this.notifications.get(key) || []
  }

  async markNotificationAsRead(
    principal: Principal,
    notificationId: string
  ): Promise<void> {
    const key = principal.toText()
    const userNotifications = this.notifications.get(key) || []

    const notification = userNotifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  async markAllNotificationsAsRead(principal: Principal): Promise<void> {
    const key = principal.toText()
    const userNotifications = this.notifications.get(key) || []

    userNotifications.forEach(notification => {
      notification.read = true
    })
  }

  async createNotification(
    principal: Principal,
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<void> {
    const key = principal.toText()
    const userNotifications = this.notifications.get(key) || []

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    userNotifications.unshift(newNotification)
    this.notifications.set(key, userNotifications)
  }

  async updateNotificationPreferences(
    principal: Principal,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    // Mock implementation - in real app this would call the backend
    console.log('Updating notification preferences:', {
      principal: principal.toText(),
      preferences,
    })
  }

  async getNotificationPreferences(
    _principal: Principal
  ): Promise<NotificationPreferences> {
    // Mock preferences - in real app this would fetch from backend
    return {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      marketing: false,
    }
  }

  // Utility methods
  isKYCRequired(principal: Principal, transactionAmount?: bigint): boolean {
    const status = this.kycStatus.get(principal.toText())
    if (!status) return true

    // Mock logic - require KYC for transactions over 1000 tokens
    if (transactionAmount && transactionAmount > BigInt(1000)) {
      return status.level < 2
    }

    return status.status === 'not_required'
  }

  getKYCLevel(principal: Principal): number {
    const status = this.kycStatus.get(principal.toText())
    return status?.level || 0
  }

  isKYCApproved(principal: Principal): boolean {
    const status = this.kycStatus.get(principal.toText())
    return status?.status === 'approved'
  }

  // Mock data initialization
  initializeMockData(): void {
    // Add some mock KYC statuses
    const mockPrincipal1 = Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai')
    const mockPrincipal2 = Principal.fromText('rrkah-fqaaa-aaaah-qcaiq-cai')

    this.kycStatus.set(mockPrincipal1.toText(), {
      principal: mockPrincipal1,
      status: 'approved',
      level: 2,
      verifiedAt: new Date('2024-01-15'),
      expiresAt: new Date('2025-01-15'),
    })

    this.kycStatus.set(mockPrincipal2.toText(), {
      principal: mockPrincipal2,
      status: 'pending',
      level: 1,
      verifiedAt: new Date('2024-01-10'),
    })

    // Add some mock notifications
    this.notifications.set(mockPrincipal1.toText(), [
      {
        id: '1',
        type: 'kyc',
        title: 'KYC Verification Complete',
        message: 'Your identity has been successfully verified.',
        read: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        actionUrl: '/kyc/status',
      },
      {
        id: '2',
        type: 'transaction',
        title: 'Transaction Completed',
        message: 'Your NFT purchase has been completed successfully.',
        read: true,
        createdAt: new Date('2024-01-14T15:30:00Z'),
        actionUrl: '/marketplace/my/purchases',
      },
    ])
  }
}

// Export singleton instance
export const kycService = new KYCService()
export default kycService
