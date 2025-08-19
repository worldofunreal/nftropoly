import type { WalletAdapter, CrossChainAuthResult } from '../types'
import { CrossChainSeedService } from '../../CrossChainSeedService'

declare global {
  interface Window {
    solana?: any
  }
}

export class PhantomAdapter implements WalletAdapter {
  type = 'phantom' as const
  capabilities = { icp: false, evm: true, sol: true }

  private async isPhantomInstalled(): Promise<boolean> {
    return !!(window.solana && window.solana.isPhantom)
  }

  private async connectWallet(): Promise<string> {
    if (!(await this.isPhantomInstalled())) {
      throw new Error('Phantom wallet is not installed')
    }

    try {
      const response = await window.solana.connect()
      return response.publicKey.toString()
    } catch {
      throw new Error('Could not connect to Phantom Wallet')
    }
  }

  private async signMessage(message: string): Promise<Uint8Array> {
    if (!window.solana || !window.solana.isConnected) {
      await this.connectWallet()
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8')
      return signedMessage.signature
    } catch {
      throw new Error('Error signing message with Phantom Wallet')
    }
  }

  private async getEvmAddress(): Promise<string | null> {
    try {
      // Phantom supports EVM through their API
      if (window.solana && window.solana.evm) {
        const evmAddress = await window.solana.evm.getAddress()
        return evmAddress
      }
      return null
    } catch {
      return null
    }
  }

  async authenticate(): Promise<CrossChainAuthResult> {
    try {
      // 1. Get SOL address (native)
      const solAddress = await this.connectWallet()

      // 2. Get EVM address (if available)
      const evmAddress = await this.getEvmAddress()

      // 3. Sign a deterministic message
      const message = `Login to NFTropoly - ${Date.now()}`
      const signature = await this.signMessage(message)

      // 4. Generate seed from signature
      const seed = await CrossChainSeedService.fromSignature(signature.toString())

      // 5. Generate only ICP principal (Phantom handles SOL/EVM natively)
      const principal = await CrossChainSeedService.toIcpPrincipal(seed)

      return {
        principal,
        evmAddress: evmAddress || undefined, // Native EVM address if available
        solAddress, // Native SOL address
        nativeWallet: 'phantom',
        signature: signature.toString()
      }
    } catch (error) {
      throw new Error(`Phantom authentication failed: ${error}`)
    }
  }
}
