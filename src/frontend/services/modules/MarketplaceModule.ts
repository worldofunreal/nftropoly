import { Principal } from '@dfinity/principal'
import type { _SERVICE as MarketplaceService } from '../../../declarations/marketplace/marketplace.did'
import type {
  Account,
  ManageAskRequest,
  ManageAskResponse,
  ManageBidRequest,
  ManageBidResponse,
  BalanceRequest,
  BalanceResult,
  AskInfoRequest,
  AskInfoResponse,
  ICRC8Metadata,
  SupportedStandard
} from '../../../declarations/marketplace/marketplace.did'

export class MarketplaceModule {
  constructor(private marketplaceActor: MarketplaceService) {}

  // ICRC-8 Core Methods
  async ask(requests: (ManageAskRequest | null)[]): Promise<Array<{ 
    request: ManageAskRequest | null; 
    response: ManageAskResponse | null 
  }>> {
    const results = await this.marketplaceActor.icrc8_ask(requests)
    return results.map(([request, response]) => ({ request, response }))
  }

  async bid(requests: (ManageBidRequest | null)[]): Promise<Array<{
    request: ManageBidRequest | null;
    response: ManageBidResponse | null
  }>> {
    const results = await this.marketplaceActor.icrc8_bid(requests)
    return results.map(([request, response]) => ({ request, response }))
  }

  async balanceOf(queries: Array<{ account: Account; request?: BalanceRequest }>): Promise<Array<{
    account: Account;
    balances: BalanceResult[]
  }>> {
    const args = queries.map(q => [q.account, q.request ? [q.request] : []] as [Account, BalanceRequest[]])
    const results = await this.marketplaceActor.icrc8_balance_of(args)
    return results.map(([account, balances]) => ({ account, balances }))
  }

  async askInfo(requests: (AskInfoRequest | null)[]): Promise<Array<{
    request: AskInfoRequest | null;
    response: AskInfoResponse | null
  }>> {
    const results = await this.marketplaceActor.icrc8_ask_info(requests)
    return results.map(([request, response]) => ({ request, response }))
  }

  async getApprovedTokens(): Promise<Principal[] | null> {
    const result = await this.marketplaceActor.icrc8_approved_tokens()
    return result.length > 0 ? result[0] : null
  }

  // Metadata Methods
  async getMetadata(): Promise<ICRC8Metadata[]> {
    return await this.marketplaceActor.icrc8_metadata()
  }

  async getSupportedStandards(): Promise<SupportedStandard[]> {
    return await this.marketplaceActor.icrc10_supported_standards()
  }

  // Utility Methods
  async healthCheck(): Promise<string> {
    return await this.marketplaceActor.health_check()
  }

  async getDebugState(): Promise<string> {
    return await this.marketplaceActor.get_debug_state()
  }

  // Helper methods for common marketplace operations
  async createAsk(
    tokenCanister: Principal,
    tokenId: bigint,
    price: bigint,
    priceTokenCanister: Principal
  ): Promise<ManageAskResponse | null> {
    // This is a simplified helper - real implementation would need proper AskFeature construction
    const newAskRequest: ManageAskRequest = {
      NewAsk: {
        feature: [] // Would need to construct proper AskFeature array
      }
    }
    
    const results = await this.ask([newAskRequest])
    return results[0]?.response || null
  }

  async placeBid(
    askId: bigint,
    amount: bigint,
    tokenCanister: Principal
  ): Promise<ManageBidResponse | null> {
    // This is a simplified helper - real implementation would need proper BidFeature construction
    const newBidRequest: ManageBidRequest = {
      NewBid: {
        ask_id: askId,
        feature: [] // Would need to construct proper BidFeature array
      }
    }
    
    const results = await this.bid([newBidRequest])
    return results[0]?.response || null
  }

  async getUserNFTBalance(account: Account): Promise<BalanceResult[]> {
    const balanceRequest: BalanceRequest = { Nfts: [] }
    const results = await this.balanceOf([{ account, request: balanceRequest }])
    return results[0]?.balances || []
  }

  async getActiveAsks(startId?: bigint, limit?: bigint): Promise<AskInfoResponse | null> {
    const request: AskInfoRequest = { 
      Active: startId !== undefined && limit !== undefined ? [[startId], [limit]] : []
    }
    const results = await this.askInfo([request])
    return results[0]?.response || null
  }
}
