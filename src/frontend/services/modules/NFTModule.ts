import { Principal } from '@dfinity/principal'
import type { _SERVICE as NFTService } from '../../../declarations/nft_collection/nft_collection.did'
import type { 
  Account,
  TransferArg,
  Result_10 as TransferResult,
  Args_2 as MintArgs,
  Result_12 as MintResult
} from '../../../declarations/nft_collection/nft_collection.did'

export class NFTModule {
  constructor(private nftActor: NFTService) {}

  // ICRC-7 Standard Methods
  async getName(): Promise<string> {
    return await this.nftActor.icrc7_name()
  }

  async getSymbol(): Promise<string> {
    return await this.nftActor.icrc7_symbol()
  }

  async getTotalSupply(): Promise<bigint> {
    return await this.nftActor.icrc7_total_supply()
  }

  async getTokens(prev?: bigint, take?: bigint): Promise<bigint[]> {
    const prevArg = prev !== undefined ? [prev] : []
    const takeArg = take !== undefined ? [take] : []
    return await this.nftActor.icrc7_tokens(prevArg, takeArg)
  }

  async tokensOf(account: Account, prev?: bigint, take?: bigint): Promise<bigint[]> {
    const prevArg = prev !== undefined ? [prev] : []
    const takeArg = take !== undefined ? [take] : []
    return await this.nftActor.icrc7_tokens_of(account, prevArg, takeArg)
  }

  async balanceOf(accounts: Account[]): Promise<bigint[]> {
    return await this.nftActor.icrc7_balance_of(accounts)
  }

  async ownerOf(tokenIds: bigint[]): Promise<(Account | null)[]> {
    const results = await this.nftActor.icrc7_owner_of(tokenIds)
    return results.map(result => result.length > 0 ? result[0] : null)
  }

  async getTokenMetadata(tokenIds: bigint[]): Promise<(Array<[string, any]> | null)[]> {
    const results = await this.nftActor.icrc7_token_metadata(tokenIds)
    return results.map(result => result.length > 0 ? result[0] : null)
  }

  async transfer(transfers: TransferArg[]): Promise<(TransferResult | null)[]> {
    return await this.nftActor.icrc7_transfer(transfers)
  }

  // ICRC-37 Standard Methods (Approval extension)
  async approveTokens(approvals: any[]): Promise<any> {
    return await this.nftActor.icrc37_approve_tokens(approvals)
  }

  async approveCollection(approvals: any[]): Promise<any> {
    return await this.nftActor.icrc37_approve_collection(approvals)
  }

  async transferFrom(transfers: any[]): Promise<any> {
    return await this.nftActor.icrc37_transfer_from(transfers)
  }

  async isApproved(queries: any[]): Promise<boolean[]> {
    return await this.nftActor.icrc37_is_approved(queries)
  }

  // Custom mint method (not part of ICRC-7 standard)
  async mint(mintArgs: MintArgs): Promise<MintResult> {
    return await this.nftActor.mint(mintArgs)
  }

  // Helper methods
  createAccount(owner: Principal, subaccount?: Uint8Array): Account {
    return {
      owner,
      subaccount: subaccount ? [subaccount] : []
    }
  }

  async getUserTokens(userPrincipal: Principal): Promise<bigint[]> {
    const account = this.createAccount(userPrincipal)
    return await this.tokensOf(account)
  }

  async getUserBalance(userPrincipal: Principal): Promise<bigint> {
    const account = this.createAccount(userPrincipal)
    const balances = await this.balanceOf([account])
    return balances[0] || 0n
  }
}
