export type WalletType = 'metamask' | 'phantom' | 'internet-identity' | 'plug'

export interface WalletCapabilities {
  icp: boolean    // Can sign ICP transactions
  evm: boolean    // Can sign EVM transactions  
  sol: boolean    // Can sign Solana transactions
}

export interface CrossChainAuthResult {
  principal: string        // ICP principal (always generated)
  evmAddress?: string      // 0x address (generated or native)
  solAddress?: string      // Solana address (generated or native)
  nativeWallet: string     // Which wallet was used for auth
  signature?: string       // Original signature for verification
}

export interface WalletAdapter {
  type: WalletType
  capabilities: WalletCapabilities
  authenticate(): Promise<CrossChainAuthResult>
}
