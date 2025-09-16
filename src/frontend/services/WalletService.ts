/**
 * Wallet Service for managing different wallet connections
 * Supports Internet Identity, Plug, MetaMask, and Phantom
 */

import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'

export type WalletType = 'internet-identity' | 'plug' | 'metamask' | 'phantom'

export interface WalletInfo {
  type: WalletType
  principal: Principal
  accountId: string
  name: string
  icon: string
  connected: boolean
}

export interface WalletConnection {
  identity: Identity
  principal: Principal
  accountId: string
  walletType: WalletType
}

class WalletService {
  private currentConnection: WalletConnection | null = null
  private listeners: Array<(connection: WalletConnection | null) => void> = []

  // Wallet detection
  isWalletAvailable(type: WalletType): boolean {
    switch (type) {
      case 'internet-identity':
        return typeof window !== 'undefined' && 'ic' in window
      case 'plug':
        return (
          typeof window !== 'undefined' &&
          'ic' in window &&
          'plug' in (window as unknown as { ic: { plug: unknown } }).ic
        )
      case 'metamask':
        return typeof window !== 'undefined' && 'ethereum' in window
      case 'phantom':
        return typeof window !== 'undefined' && 'phantom' in window
      default:
        return false
    }
  }

  // Get available wallets
  getAvailableWallets(): WalletType[] {
    const wallets: WalletType[] = []

    if (this.isWalletAvailable('internet-identity')) {
      wallets.push('internet-identity')
    }
    if (this.isWalletAvailable('plug')) {
      wallets.push('plug')
    }
    if (this.isWalletAvailable('metamask')) {
      wallets.push('metamask')
    }
    if (this.isWalletAvailable('phantom')) {
      wallets.push('phantom')
    }

    return wallets
  }

  // Get wallet info
  getWalletInfo(type: WalletType): WalletInfo {
    const isConnected = this.currentConnection?.walletType === type

    switch (type) {
      case 'internet-identity':
        return {
          type,
          principal: this.currentConnection?.principal || Principal.anonymous(),
          accountId: this.currentConnection?.accountId || '',
          name: 'Internet Identity',
          icon: 'i-heroicons-identification',
          connected: isConnected,
        }
      case 'plug':
        return {
          type,
          principal: this.currentConnection?.principal || Principal.anonymous(),
          accountId: this.currentConnection?.accountId || '',
          name: 'Plug Wallet',
          icon: 'i-heroicons-plug',
          connected: isConnected,
        }
      case 'metamask':
        return {
          type,
          principal: this.currentConnection?.principal || Principal.anonymous(),
          accountId: this.currentConnection?.accountId || '',
          name: 'MetaMask',
          icon: 'i-heroicons-wallet',
          connected: isConnected,
        }
      case 'phantom':
        return {
          type,
          principal: this.currentConnection?.principal || Principal.anonymous(),
          accountId: this.currentConnection?.accountId || '',
          name: 'Phantom',
          icon: 'i-heroicons-sparkles',
          connected: isConnected,
        }
      default:
        throw new Error(`Unsupported wallet type: ${type}`)
    }
  }

  // Connect to wallet
  async connect(type: WalletType): Promise<WalletConnection> {
    try {
      let connection: WalletConnection

      switch (type) {
        case 'internet-identity':
          connection = await this.connectInternetIdentity()
          break
        case 'plug':
          connection = await this.connectPlug()
          break
        case 'metamask':
          connection = await this.connectMetaMask()
          break
        case 'phantom':
          connection = await this.connectPhantom()
          break
        default:
          throw new Error(`Unsupported wallet type: ${type}`)
      }

      this.currentConnection = connection
      this.notifyListeners()

      return connection
    } catch (error) {
      console.error(`Failed to connect to ${type}:`, error)
      throw error
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    try {
      if (this.currentConnection) {
        // Perform wallet-specific disconnect logic if needed
        switch (this.currentConnection.walletType) {
          case 'internet-identity':
            // Internet Identity doesn't need explicit disconnect
            break
          case 'plug':
            if (
              typeof window !== 'undefined' &&
              'ic' in window &&
              'plug' in
                (
                  window as unknown as {
                    ic: { plug: { disconnect: () => Promise<void> } }
                  }
                ).ic
            ) {
              await (
                window as unknown as {
                  ic: { plug: { disconnect: () => Promise<void> } }
                }
              ).ic.plug.disconnect()
            }
            break
          case 'metamask':
            // MetaMask doesn't have explicit disconnect
            break
          case 'phantom':
            if (typeof window !== 'undefined' && 'phantom' in window) {
              await (
                window as unknown as {
                  phantom: { disconnect: () => Promise<void> }
                }
              ).phantom.disconnect()
            }
            break
        }
      }

      this.currentConnection = null
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  // Get current connection
  getCurrentConnection(): WalletConnection | null {
    return this.currentConnection
  }

  // Check if connected
  isConnected(): boolean {
    return this.currentConnection !== null
  }

  // Add connection listener
  addConnectionListener(
    listener: (connection: WalletConnection | null) => void
  ): void {
    this.listeners.push(listener)
  }

  // Remove connection listener
  removeConnectionListener(
    listener: (connection: WalletConnection | null) => void
  ): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentConnection))
  }

  // Internet Identity connection
  private async connectInternetIdentity(): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !('ic' in window)) {
      throw new Error('Internet Identity not available')
    }

    const ic = (
      window as unknown as {
        ic: { identityProvider: { createIdentity: () => Promise<Identity> } }
      }
    ).ic
    const identityProvider = ic.identityProvider

    if (!identityProvider) {
      throw new Error('Internet Identity provider not found')
    }

    const identity = await identityProvider.createIdentity()
    const principal = identity.getPrincipal()
    const accountId = principal.toText()

    return {
      identity,
      principal,
      accountId,
      walletType: 'internet-identity',
    }
  }

  // Plug wallet connection
  private async connectPlug(): Promise<WalletConnection> {
    if (
      typeof window === 'undefined' ||
      !('ic' in window) ||
      !('plug' in (window as unknown as { ic: { plug: unknown } }).ic)
    ) {
      throw new Error('Plug wallet not available')
    }

    const plug = (
      window as unknown as {
        ic: {
          plug: {
            requestConnect: () => Promise<boolean>
            createIdentity: () => Identity
          }
        }
      }
    ).ic.plug

    if (!plug) {
      throw new Error('Plug wallet not found')
    }

    // Request connection
    const connected = await plug.requestConnect()
    if (!connected) {
      throw new Error('Plug wallet connection rejected')
    }

    // Get identity
    const identity = await plug.createAgent()
    const principal = identity.getPrincipal()
    const accountId = principal.toText()

    return {
      identity,
      principal,
      accountId,
      walletType: 'plug',
    }
  }

  // MetaMask connection (for Ethereum compatibility)
  private async connectMetaMask(): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !('ethereum' in window)) {
      throw new Error('MetaMask not available')
    }

    const ethereum = (
      window as unknown as {
        ethereum: { request: (args: { method: string }) => Promise<string[]> }
      }
    ).ethereum

    if (!ethereum) {
      throw new Error('MetaMask not found')
    }

    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    if (!accounts || accounts.length === 0) {
      throw new Error('MetaMask connection rejected')
    }

    // For IC compatibility, we'd need to bridge Ethereum accounts to IC principals
    // This is a simplified implementation
    const accountId = accounts[0]
    const principal = Principal.fromText(accountId) // This is a simplified mapping

    // Create a mock identity for IC compatibility
    const identity = {
      getPrincipal: () => principal,
      sign: async () => {
        throw new Error('MetaMask signing not implemented for IC')
      },
    } as Identity

    return {
      identity,
      principal,
      accountId,
      walletType: 'metamask',
    }
  }

  // Phantom wallet connection (for Solana compatibility)
  private async connectPhantom(): Promise<WalletConnection> {
    if (typeof window === 'undefined' || !('phantom' in window)) {
      throw new Error('Phantom wallet not available')
    }

    const phantom = (
      window as unknown as { phantom: { connect: () => Promise<unknown> } }
    ).phantom

    if (!phantom) {
      throw new Error('Phantom wallet not found')
    }

    // Request connection
    const response = await phantom.connect()
    if (!response) {
      throw new Error('Phantom wallet connection rejected')
    }

    // For IC compatibility, we'd need to bridge Solana accounts to IC principals
    // This is a simplified implementation
    const accountId = response.publicKey.toString()
    const principal = Principal.fromText(accountId) // This is a simplified mapping

    // Create a mock identity for IC compatibility
    const identity = {
      getPrincipal: () => principal,
      sign: async () => {
        throw new Error('Phantom signing not implemented for IC')
      },
    } as Identity

    return {
      identity,
      principal,
      accountId,
      walletType: 'phantom',
    }
  }
}

// Export singleton instance
export const walletService = new WalletService()
export default walletService
