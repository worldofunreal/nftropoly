import { Actor, HttpAgent } from '@dfinity/agent'
import type { Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { idlFactory } from '../../declarations/nft_collection'
import type { _SERVICE } from '../../declarations/nft_collection/nft_collection.did'

import { getCanisterId, getEnvironmentConfig } from '~/utils/canister-config'

class NFTService {
  private agent: HttpAgent | null = null
  private nftActor: _SERVICE | null = null
  private identity: Identity | undefined = undefined
  private canisterId: string | null = null

  async initialize(identity?: Identity): Promise<void> {
    try {
      // Use provided identity
      this.identity = identity

      if (!this.identity) {
        throw new Error('No identity available. Please provide an identity.')
      }

      this.canisterId = await getCanisterId('nft_collection')

      // Get environment configuration
      const envConfig = getEnvironmentConfig()

      // Create HttpAgent with identity
      this.agent = new HttpAgent({
        host: envConfig.host,
        identity: this.identity,
      })

      // Fetch root key if in development
      if (envConfig.environment === 'development') {
        await this.agent.fetchRootKey()
      }

      // Create NFT collection actor
      this.nftActor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      })

      console.log('NFTService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize NFTService:', error)
      throw error
    }
  }

  // Collection info methods
  async getCollectionName(): Promise<string> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_name()
  }

  async getCollectionSymbol(): Promise<string> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_symbol()
  }

  async getTotalSupply(): Promise<bigint> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_total_supply()
  }

  // Token methods
  async getTokensOf(account: Principal, prev?: bigint, take?: bigint): Promise<bigint[]> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    
    const accountArg = {
      owner: account,
      subaccount: []
    }
    
    return await this.nftActor.icrc7_tokens_of(
      accountArg,
      prev ? [prev] : [],
      take ? [take] : []
    )
  }

  async getOwnerOf(tokenIds: bigint[]): Promise<Array<{ owner: Principal; subaccount: [] | [Uint8Array] } | null>> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_owner_of(tokenIds)
  }

  async getTokenMetadata(tokenIds: bigint[]): Promise<Array<Array<[string, any]> | null>> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_token_metadata(tokenIds)
  }

  async getBalanceOf(accounts: Array<{ owner: Principal; subaccount: [] | [Uint8Array] }>): Promise<bigint[]> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }
    return await this.nftActor.icrc7_balance_of(accounts)
  }

  // Get user's NFTs with metadata
  async getUserNFTs(userPrincipal: Principal): Promise<Array<{
    tokenId: bigint
    metadata: Array<[string, any]>
  }>> {
    const tokenIds = await this.getTokensOf(userPrincipal)
    
    if (tokenIds.length === 0) {
      return []
    }

    const metadataResults = await this.getTokenMetadata(tokenIds)
    
    return tokenIds.map((tokenId, index) => ({
      tokenId,
      metadata: metadataResults[index] || []
    }))
  }

  // Approve marketplace for NFT transfers
  async approveMarketplace(tokenId: bigint, marketplaceCanisterId: string): Promise<any> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }

    const approveArgs = {
      token_id: tokenId,
      approval_info: {
        from_subaccount: [],
        spender: {
          owner: Principal.fromText(marketplaceCanisterId),
          subaccount: []
        },
        memo: [],
        expires_at: [],
        created_at_time: []
      }
    }

    return await this.nftActor.icrc37_approve_tokens([approveArgs])
  }

  // Transfer NFT
  async transferNFT(tokenId: bigint, to: Principal): Promise<any> {
    if (!this.nftActor) {
      throw new Error('NFTService not initialized')
    }

    const transferArgs = {
      token_id: tokenId,
      from_subaccount: [],
      to: {
        owner: to,
        subaccount: []
      },
      memo: [],
      created_at_time: []
    }

    return await this.nftActor.icrc7_transfer([transferArgs])
  }

  // Check if initialized
  isInitialized(): boolean {
    return this.nftActor !== null
  }

  // Get canister ID
  getCanisterId(): string | null {
    return this.canisterId
  }
}

export const nftService = new NFTService()
export default nftService
