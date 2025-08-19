import type { WalletAdapter, CrossChainAuthResult } from '../types'
import { CrossChainSeedService } from '../../CrossChainSeedService'

declare global {
  interface Window {
    ic?: {
      plug?: {
        requestConnect: (options?: { whitelist?: string[], host?: string }) => Promise<{ principal: string }>
        isConnected: () => Promise<boolean>
        getPrincipal: () => Promise<string>
        agent?: any
        principalId?: string
        accountId?: string
      }
    }
  }
}

export class PlugAdapter implements WalletAdapter {
  type = 'plug' as const
  capabilities = { icp: true, evm: false, sol: false }

  private async isPlugInstalled(): Promise<boolean> {
    const hasPlug = !!(window.ic && window.ic.plug)
    console.log('Plug detection:', { 
      hasWindowIc: !!window.ic, 
      hasPlug: !!window.ic?.plug, 
      plugMethods: window.ic?.plug ? Object.keys(window.ic.plug) : []
    })
    return hasPlug
  }

  private async connectPlug(): Promise<string> {
    if (!(await this.isPlugInstalled())) {
      throw new Error('Plug wallet is not installed')
    }

    try {
      // First check if already connected
      const isConnected = await window.ic?.plug?.isConnected()
      
      if (!isConnected) {
        // Request connection - this will show the Plug popup
        console.log('Requesting Plug connection...')
        await window.ic?.plug?.requestConnect()
        
        // Wait a bit for the connection to be established
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Get the principal from the connected session
      const principal = await window.ic?.plug?.getPrincipal()
      if (!principal) {
        throw new Error('Could not get Plug principal after connection')
      }
      
      console.log('Plug connected successfully, principal:', principal)
      return principal
    } catch (error) {
      console.error('Plug connection error:', error)
      throw new Error(`Could not connect to Plug Wallet: ${error}`)
    }
  }

  async authenticate(): Promise<CrossChainAuthResult> {
    try {
      console.log('Starting Plug authentication...')
      
      // 1. Get ICP principal (native) via Plug connection
      const principal = await this.connectPlug()
      console.log('Got Plug principal:', principal)

      // 2. Generate seed from principal (Plug is ICP native)
      const seed = await CrossChainSeedService.fromPrincipal(principal)
      console.log('Generated seed from principal')

      // 3. Generate EVM and SOL addresses from ICP principal
      const [evmAddress, solAddress] = await Promise.all([
        CrossChainSeedService.toEvmAddress(seed),
        CrossChainSeedService.toSolAddress(seed)
      ])
      console.log('Generated cross-chain addresses:', { evmAddress, solAddress })

      return {
        principal, // Native ICP principal from Plug
        evmAddress, // Generated from ICP principal
        solAddress, // Generated from ICP principal
        nativeWallet: 'plug',
        signature: `plug_principal_${principal}` // Use principal as signature for Plug
      }
    } catch (error) {
      console.error('Plug authentication error:', error)
      throw new Error(`Plug authentication failed: ${error}`)
    }
  }
}
