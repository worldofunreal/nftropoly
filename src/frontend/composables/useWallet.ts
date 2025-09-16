/**
 * Wallet composable for managing wallet connections and state
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  walletService,
  type WalletType,
  type WalletInfo,
  type WalletConnection,
} from '~/services/WalletService'

export function useWallet() {
  // State
  const connection = ref<WalletConnection | null>(null)
  const availableWallets = ref<WalletType[]>([])
  const connecting = ref(false)
  const disconnecting = ref(false)

  // Computed
  const isConnected = computed(() => connection.value !== null)
  const principal = computed(() => connection.value?.principal || null)
  const accountId = computed(() => connection.value?.accountId || '')
  const walletType = computed(() => connection.value?.walletType || null)

  const walletInfos = computed(() =>
    availableWallets.value.map(type => walletService.getWalletInfo(type))
  )

  const connectedWalletInfo = computed(() => {
    if (!walletType.value) return null
    return walletService.getWalletInfo(walletType.value)
  })

  // Methods
  async function loadAvailableWallets() {
    try {
      availableWallets.value = walletService.getAvailableWallets()
    } catch (error) {
      console.error('Failed to load available wallets:', error)
    }
  }

  async function connect(type: WalletType) {
    if (connecting.value) return

    connecting.value = true
    try {
      const newConnection = await walletService.connect(type)
      connection.value = newConnection

      // Store connection in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'wallet-connection',
          JSON.stringify({
            type: newConnection.walletType,
            principal: newConnection.principal.toText(),
            accountId: newConnection.accountId,
          })
        )
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      connecting.value = false
    }
  }

  async function disconnect() {
    if (disconnecting.value) return

    disconnecting.value = true
    try {
      await walletService.disconnect()
      connection.value = null

      // Clear stored connection
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-connection')
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    } finally {
      disconnecting.value = false
    }
  }

  async function reconnect() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('wallet-connection')
      if (stored) {
        const {
          type,
          principal: _principalText,
          accountId: _storedAccountId,
        } = JSON.parse(stored)

        // Verify the stored connection is still valid
        if (walletService.isWalletAvailable(type)) {
          await connect(type)
        } else {
          // Clear invalid stored connection
          localStorage.removeItem('wallet-connection')
        }
      }
    } catch (error) {
      console.error('Failed to reconnect wallet:', error)
      // Clear invalid stored connection
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wallet-connection')
      }
    }
  }

  function getWalletInfo(type: WalletType): WalletInfo {
    return walletService.getWalletInfo(type)
  }

  function isWalletAvailable(type: WalletType): boolean {
    return walletService.isWalletAvailable(type)
  }

  // Connection listener
  function handleConnectionChange(newConnection: WalletConnection | null) {
    connection.value = newConnection
  }

  // Lifecycle
  onMounted(() => {
    // Load available wallets
    loadAvailableWallets()

    // Add connection listener
    walletService.addConnectionListener(handleConnectionChange)

    // Try to reconnect if there's a stored connection
    reconnect()
  })

  onUnmounted(() => {
    // Remove connection listener
    walletService.removeConnectionListener(handleConnectionChange)
  })

  return {
    // State
    connection: readonly(connection),
    availableWallets: readonly(availableWallets),
    connecting: readonly(connecting),
    disconnecting: readonly(disconnecting),

    // Computed
    isConnected,
    principal,
    accountId,
    walletType,
    walletInfos,
    connectedWalletInfo,

    // Methods
    connect,
    disconnect,
    reconnect,
    getWalletInfo,
    isWalletAvailable,
    loadAvailableWallets,
  }
}

// Wallet connection status composable
export function useWalletStatus() {
  const { isConnected, principal, accountId, walletType, connectedWalletInfo } =
    useWallet()

  const status = computed(() => {
    if (!isConnected.value) {
      return {
        status: 'disconnected',
        message: 'No wallet connected',
        color: 'gray' as const,
      }
    }

    const wallet = connectedWalletInfo.value
    if (!wallet) {
      return {
        status: 'connected',
        message: 'Wallet connected',
        color: 'green' as const,
      }
    }

    return {
      status: 'connected',
      message: `Connected to ${wallet.name}`,
      color: 'green' as const,
    }
  })

  const shortAddress = computed(() => {
    if (!accountId.value) return ''

    const address = accountId.value
    if (address.length <= 10) return address

    return `${address.slice(0, 6)}...${address.slice(-4)}`
  })

  return {
    status,
    shortAddress,
    isConnected,
    principal,
    accountId,
    walletType,
    connectedWalletInfo,
  }
}

// Wallet selection composable
export function useWalletSelection() {
  const { availableWallets, walletInfos, connect, connecting } = useWallet()

  const selectWallet = async (type: WalletType) => {
    try {
      await connect(type)
      return true
    } catch (error) {
      console.error('Failed to select wallet:', error)
      return false
    }
  }

  const canConnect = (type: WalletType) => {
    return !connecting.value && walletService.isWalletAvailable(type)
  }

  return {
    availableWallets,
    walletInfos,
    selectWallet,
    canConnect,
    connecting,
  }
}
