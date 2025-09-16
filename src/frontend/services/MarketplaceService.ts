import { Actor, HttpAgent } from '@dfinity/agent'
import type { Identity } from '@dfinity/agent'
import { idlFactory } from '../../declarations/marketplace'
import type {
  _SERVICE,
  Account,
  ManageAskRequest,
  ManageBidRequest,
  AskInfoRequest,
  BalanceRequest,
  AskInfoResponse,
  BalanceResult,
  ManageAskResponse,
  ManageBidResponse,
  AskFeature,
  BidFeature,
  ICRC8Metadata,
  SupportedStandard,
  SettlementRetryInfo,
} from '../../declarations/marketplace/marketplace.did'

// Get marketplace canister ID from server endpoint
const getMarketplaceCanisterId = async (): Promise<string> => {
  try {
    const response = await fetch('/api/canister-ids')
    const data = await response.json()
    return data.marketplace
  } catch (error) {
    console.warn('Failed to fetch canister IDs from server, using fallback')
    // Fallback for development
    return 'u6s2n-gx777-77774-qaaba-cai'
  }
}

class MarketplaceService {
  private agent: HttpAgent | null = null
  private marketplaceActor: _SERVICE | null = null
  private identity: Identity | undefined = undefined
  private canisterId: string | null = null

  async initialize(identity?: Identity): Promise<void> {
    try {
      this.identity = identity
      this.canisterId = await getMarketplaceCanisterId()

      // Create HttpAgent with identity
      this.agent = new HttpAgent({
        host:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:4943'
            : 'https://ic0.app',
        identity: this.identity,
      })

      // Fetch root key for local development
      if (process.env.NODE_ENV === 'development') {
        await this.agent.fetchRootKey()
      }

      // Create Actor using generated IDL factory
      this.marketplaceActor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      })

      console.log('MarketplaceService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MarketplaceService:', error)
      throw error
    }
  }

  // Health check - returns string
  async healthCheck(): Promise<string> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace canister is not deployed or not initialized')
    }
    return await this.marketplaceActor.health_check()
  }

  // Get metadata - returns array of ICRC8Metadata
  async getMetadata(): Promise<ICRC8Metadata[]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace canister is not deployed or not initialized')
    }
    return await this.marketplaceActor.get_metadata()
  }

  // Get ICRC-8 metadata
  async getICRC8Metadata(): Promise<ICRC8Metadata[]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.icrc8_metadata()
  }

  // Get supported standards
  async getSupportedStandards(): Promise<SupportedStandard[]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.icrc10_supported_standards()
  }

  // Get approved tokens - returns Principal array or null
  async getApprovedTokens(): Promise<string[] | null> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    const result = await this.marketplaceActor.icrc8_approved_tokens()
    return result[0] ? result[0].map(principal => principal.toString()) : null
  }

  // Get settlement retry info
  async getSettlementRetryInfo(askId: bigint): Promise<SettlementRetryInfo | null> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.get_settlement_retry_info(askId)
  }

  // Get asks needing retry
  async getAsksNeedingRetry(): Promise<bigint[]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.get_asks_needing_retry()
  }

  // Retry settlement
  async retrySettlement(askId: bigint): Promise<{ Ok: any } | { Err: any }> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.retry_settlement(askId)
  }

  // Get debug state
  async getDebugState(): Promise<string> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }
    return await this.marketplaceActor.get_debug_state()
  }

  // ICRC-8 Ask operations
  async manageAsk(
    requests: ManageAskRequest[]
  ): Promise<[[] | [ManageAskRequest], [] | [ManageAskResponse]][]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }

    // Convert to optional array format expected by canister
    const optionalRequests = requests.map(req => [req] as [ManageAskRequest])
    return await this.marketplaceActor.icrc8_ask(optionalRequests)
  }

  // ICRC-8 Bid operations
  async manageBid(
    requests: ManageBidRequest[]
  ): Promise<[[] | [ManageBidRequest], [] | [ManageBidResponse]][]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }

    // Convert to optional array format expected by canister
    const optionalRequests = requests.map(req => [req] as [ManageBidRequest])
    return await this.marketplaceActor.icrc8_bid(optionalRequests)
  }

  // Get ask information
  async getAskInfo(
    requests: AskInfoRequest[]
  ): Promise<[[] | [AskInfoRequest], [] | [AskInfoResponse]][]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }

    // Convert to optional array format expected by canister
    const optionalRequests = requests.map(req => [req] as [AskInfoRequest])
    return await this.marketplaceActor.icrc8_ask_info(optionalRequests)
  }

  // Get balance information
  async getBalanceOf(
    accounts: [Account, BalanceRequest[] | null][]
  ): Promise<[Account, BalanceResult[]][]> {
    if (!this.marketplaceActor) {
      throw new Error('Marketplace actor not initialized')
    }

    // Convert to optional array format expected by canister
    const optionalRequests = accounts.map(
      ([account, requests]) =>
        [
          account,
          requests ? [requests.map(req => [req] as [BalanceRequest])] : [],
        ] as [Account, [] | [[BalanceRequest][]]]
    )

    return await this.marketplaceActor.icrc8_balance_of(optionalRequests)
  }

  // Helper method to create a new ask
  async createNewAsk(
    features: AskFeature[]
  ): Promise<ManageAskResponse | null> {
    const newAskRequest: ManageAskRequest = {
      NewAsk: { feature: features.map(f => [f] as [AskFeature]) },
    }
    const result = await this.manageAsk([newAskRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to end an ask
  async endAsk(askId: bigint): Promise<ManageAskResponse | null> {
    const endAskRequest: ManageAskRequest = { EndAsk: askId }
    const result = await this.manageAsk([endAskRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to create a new bid
  async createNewBid(
    askId: bigint,
    features: BidFeature[]
  ): Promise<ManageBidResponse | null> {
    const newBidRequest: ManageBidRequest = {
      NewBid: {
        ask_id: askId,
        feature: features.map(f => [f] as [BidFeature]),
      },
    }
    const result = await this.manageBid([newBidRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to withdraw escrow
  async withdrawEscrow(escrowRecord: any): Promise<ManageAskResponse | null> {
    const withdrawRequest: ManageAskRequest = { WithdrawEscrow: escrowRecord }
    const result = await this.manageAsk([withdrawRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to withdraw settlement
  async withdrawSettlement(escrowRecord: any): Promise<ManageAskResponse | null> {
    const withdrawRequest: ManageAskRequest = { WithdrawSettlement: escrowRecord }
    const result = await this.manageAsk([withdrawRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to distribute ask
  async distributeAsk(askId: bigint): Promise<ManageAskResponse | null> {
    const distributeRequest: ManageAskRequest = { DistributeAsk: askId }
    const result = await this.manageAsk([distributeRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }

  // Helper method to refresh offers
  async refreshOffers(account?: Account): Promise<ManageAskResponse | null> {
    const refreshRequest: ManageAskRequest = { RefreshOffers: account ? [account] : [] }
    const result = await this.manageAsk([refreshRequest])

    if (result[0] && result[0][1] && result[0][1][0]) {
      return result[0][1][0]
    }

    return null
  }
}

export const marketplaceService = new MarketplaceService()
