/**
 * Unit tests for WalletService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
// import { Principal } from '@dfinity/principal'
import { walletService, type WalletType } from '~/services/WalletService'
import { createMockIdentity } from '../setup'

// Mock window object
const mockWindow = {
  ic: {
    identityProvider: {
      createIdentity: vi.fn().mockResolvedValue(createMockIdentity()),
    },
    plug: {
      requestConnect: vi.fn().mockResolvedValue(true),
      createAgent: vi.fn().mockResolvedValue(createMockIdentity()),
      disconnect: vi.fn().mockResolvedValue(undefined),
    },
  },
  ethereum: {
    request: vi.fn().mockResolvedValue(['0x1234567890abcdef']),
  },
  phantom: {
    connect: vi
      .fn()
      .mockResolvedValue({ publicKey: { toString: () => 'phantom123' } }),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}

Object.defineProperty(window, 'window', {
  value: mockWindow,
  writable: true,
})

describe('WalletService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('wallet detection', () => {
    it('should detect Internet Identity', () => {
      expect(walletService.isWalletAvailable('internet-identity')).toBe(true)
    })

    it('should detect Plug wallet', () => {
      expect(walletService.isWalletAvailable('plug')).toBe(true)
    })

    it('should detect MetaMask', () => {
      expect(walletService.isWalletAvailable('metamask')).toBe(true)
    })

    it('should detect Phantom', () => {
      expect(walletService.isWalletAvailable('phantom')).toBe(true)
    })

    it('should return false for unsupported wallet', () => {
      expect(walletService.isWalletAvailable('unsupported' as WalletType)).toBe(
        false
      )
    })
  })

  describe('available wallets', () => {
    it('should return available wallets', () => {
      const wallets = walletService.getAvailableWallets()

      expect(Array.isArray(wallets)).toBe(true)
      expect(wallets).toContain('internet-identity')
      expect(wallets).toContain('plug')
      expect(wallets).toContain('metamask')
      expect(wallets).toContain('phantom')
    })
  })

  describe('wallet info', () => {
    it('should get Internet Identity info', () => {
      const info = walletService.getWalletInfo('internet-identity')

      expect(info.type).toBe('internet-identity')
      expect(info.name).toBe('Internet Identity')
      expect(info.icon).toBe('i-heroicons-identification')
    })

    it('should get Plug wallet info', () => {
      const info = walletService.getWalletInfo('plug')

      expect(info.type).toBe('plug')
      expect(info.name).toBe('Plug Wallet')
      expect(info.icon).toBe('i-heroicons-plug')
    })

    it('should get MetaMask info', () => {
      const info = walletService.getWalletInfo('metamask')

      expect(info.type).toBe('metamask')
      expect(info.name).toBe('MetaMask')
      expect(info.icon).toBe('i-heroicons-wallet')
    })

    it('should get Phantom info', () => {
      const info = walletService.getWalletInfo('phantom')

      expect(info.type).toBe('phantom')
      expect(info.name).toBe('Phantom')
      expect(info.icon).toBe('i-heroicons-sparkles')
    })
  })

  describe('connection management', () => {
    it('should connect to Internet Identity', async () => {
      const connection = await walletService.connect('internet-identity')

      expect(connection.walletType).toBe('internet-identity')
      expect(connection.principal).toBeDefined()
      expect(connection.accountId).toBeDefined()
    })

    it('should connect to Plug wallet', async () => {
      const connection = await walletService.connect('plug')

      expect(connection.walletType).toBe('plug')
      expect(connection.principal).toBeDefined()
      expect(connection.accountId).toBeDefined()
    })

    it('should connect to MetaMask', async () => {
      const connection = await walletService.connect('metamask')

      expect(connection.walletType).toBe('metamask')
      expect(connection.principal).toBeDefined()
      expect(connection.accountId).toBeDefined()
    })

    it('should connect to Phantom', async () => {
      const connection = await walletService.connect('phantom')

      expect(connection.walletType).toBe('phantom')
      expect(connection.principal).toBeDefined()
      expect(connection.accountId).toBeDefined()
    })

    it('should throw error for unsupported wallet', async () => {
      await expect(
        walletService.connect('unsupported' as WalletType)
      ).rejects.toThrow('Unsupported wallet type')
    })

    it('should disconnect wallet', async () => {
      await walletService.connect('internet-identity')
      await walletService.disconnect()

      expect(walletService.getCurrentConnection()).toBeNull()
    })

    it('should get current connection', async () => {
      const connection = await walletService.connect('internet-identity')
      const current = walletService.getCurrentConnection()

      expect(current).toEqual(connection)
    })

    it('should check if connected', async () => {
      expect(walletService.isConnected()).toBe(false)

      await walletService.connect('internet-identity')
      expect(walletService.isConnected()).toBe(true)

      await walletService.disconnect()
      expect(walletService.isConnected()).toBe(false)
    })
  })

  describe('connection listeners', () => {
    it('should add and remove connection listeners', () => {
      const listener = vi.fn()

      walletService.addConnectionListener(listener)
      walletService.removeConnectionListener(listener)

      // Listener should not be called after removal
      expect(listener).not.toHaveBeenCalled()
    })

    it('should notify listeners on connection change', async () => {
      const listener = vi.fn()
      walletService.addConnectionListener(listener)

      await walletService.connect('internet-identity')

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          walletType: 'internet-identity',
        })
      )

      walletService.removeConnectionListener(listener)
    })
  })

  describe('error handling', () => {
    it('should handle connection errors', async () => {
      // Mock Internet Identity to throw error
      mockWindow.ic.identityProvider.createIdentity = vi
        .fn()
        .mockRejectedValue(new Error('Connection failed'))

      await expect(walletService.connect('internet-identity')).rejects.toThrow(
        'Connection failed'
      )
    })

    it('should handle disconnect errors', async () => {
      // Mock Plug to throw error on disconnect
      mockWindow.ic.plug.disconnect = vi
        .fn()
        .mockRejectedValue(new Error('Disconnect failed'))

      await walletService.connect('plug')
      await expect(walletService.disconnect()).rejects.toThrow(
        'Disconnect failed'
      )
    })
  })
})
