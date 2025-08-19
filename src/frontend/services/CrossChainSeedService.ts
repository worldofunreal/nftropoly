import { Ed25519KeyIdentity } from '@dfinity/identity'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'
import { Keypair } from '@solana/web3.js'

export const CrossChainSeedService = {
  // Generate deterministic 32-byte seed from any input
  async fromSignature(signature: string): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const encodedSignature = encoder.encode(signature)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedSignature)
    return new Uint8Array(hashBuffer.slice(0, 32))
  },

  async fromPrincipal(principal: string): Promise<Uint8Array> {
    const encoder = new TextEncoder()
    const encodedPrincipal = encoder.encode(principal)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedPrincipal)
    return new Uint8Array(hashBuffer.slice(0, 32))
  },

  // Generate BIP39 mnemonic from seed
  seedToMnemonic(seed: Uint8Array): string {
    const seedHex = Array.from(seed)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return bip39.entropyToMnemonic(seedHex)
  },

  // Generate Ed25519 identity for ICP canister calls
  async toIdentity(seed: Uint8Array): Promise<Ed25519KeyIdentity> {
    const keyPair = nacl.sign.keyPair.fromSeed(seed)
    return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey)
  },

  // Generate ICP principal from seed
  async toIcpPrincipal(seed: Uint8Array): Promise<string> {
    const identity = await this.toIdentity(seed)
    return identity.getPrincipal().toText()
  },

  // Generate EVM address from seed using BIP44 derivation
  async toEvmAddress(seed: Uint8Array): Promise<string> {
    const mnemonic = this.seedToMnemonic(seed)
    
    // Use ethers to create HD wallet from mnemonic
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
    const account = hdNode.derivePath("44'/60'/0'/0/0")
    
    return account.address
  },

  // Generate Solana address from seed using BIP44 derivation
  async toSolAddress(seed: Uint8Array): Promise<string> {
    const mnemonic = this.seedToMnemonic(seed)
    
    // Use ethers to create HD wallet from mnemonic
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
    const account = hdNode.derivePath("44'/501'/0'/0/0")
    
    // Convert to Solana keypair format
    const privateKeyBytes = ethers.getBytes(account.privateKey)
    const keypair = Keypair.fromSeed(privateKeyBytes.slice(0, 32))
    return keypair.publicKey.toString()
  },

  // Validate mnemonic
  isValidMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic)
  },

  // Recover all addresses from mnemonic
  async fromMnemonic(mnemonic: string): Promise<{
    principal: string
    evmAddress: string
    solAddress: string
    identity: Ed25519KeyIdentity
  }> {
    if (!this.isValidMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic')
    }

    const seedBuffer = bip39.mnemonicToSeedSync(mnemonic)
    const seed = new Uint8Array(seedBuffer.slice(0, 32))

    const [principal, evmAddress, solAddress, identity] = await Promise.all([
      this.toIcpPrincipal(seed),
      this.toEvmAddress(seed),
      this.toSolAddress(seed),
      this.toIdentity(seed)
    ])

    return {
      principal,
      evmAddress,
      solAddress,
      identity
    }
  }
}
