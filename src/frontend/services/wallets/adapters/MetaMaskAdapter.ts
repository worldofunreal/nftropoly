import type { WalletAdapter, CrossChainAuthResult } from '../types'
import { CrossChainSeedService } from '../../CrossChainSeedService'

declare global {
  interface Window {
    ethereum?: any
  }
}

export class MetaMaskAdapter implements WalletAdapter {
  type = 'metamask' as const
  capabilities = { icp: false, evm: true, sol: false }

  private async isMetaMaskInstalled(): Promise<boolean> {
    return typeof window.ethereum !== 'undefined'
  }

  private async getEthereumAddress(): Promise<string> {
    if (!(await this.isMetaMaskInstalled())) {
      throw new Error('MetaMask is not installed')
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('MetaMask is locked or no accounts found')
    }

    return accounts[0]
  }

  private async signMessage(message: string, address: string): Promise<string> {
    if (!(await this.isMetaMaskInstalled())) {
      throw new Error('MetaMask is not installed')
    }

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    })

    return signature
  }

  async authenticate(): Promise<CrossChainAuthResult> {
    try {
      // 1. Get EVM address (native)
      const evmAddress = await this.getEthereumAddress()

      // 2. Sign a deterministic message
      const message = `Login to NFTropoly - ${Date.now()}`
      const signature = await this.signMessage(message, evmAddress)

      // 3. Generate seed from signature
      const seed = await CrossChainSeedService.fromSignature(signature)

      // 4. Generate only ICP principal (MetaMask is EVM native)
      const principal = await CrossChainSeedService.toIcpPrincipal(seed)

      return {
        principal,
        evmAddress, // Native EVM address
        solAddress: undefined, // MetaMask doesn't handle SOL
        nativeWallet: 'metamask',
        signature
      }
    } catch (error) {
      throw new Error(`MetaMask authentication failed: ${error}`)
    }
  }
}
