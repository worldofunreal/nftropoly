import { Principal } from '@dfinity/principal'
import type { _SERVICE as TokenService } from '../../../declarations/nftropoly_token/nftropoly_token.did'
import type { 
  Account,
  ApproveArgs, 
  ApproveResult,
  AllowanceArgs,
  Allowance,
  TransferArg,
  TransferResult,
  TransferFromArgs,
  TransferFromResult
} from '../../../declarations/nftropoly_token/nftropoly_token.did'

export class TokenModule {
  constructor(private tokenActor: TokenService) {}

  // ICRC-1 Standard Methods
  async getName(): Promise<string> {
    return await this.tokenActor.icrc1_name()
  }

  async getSymbol(): Promise<string> {
    return await this.tokenActor.icrc1_symbol()
  }

  async getDecimals(): Promise<number> {
    return Number(await this.tokenActor.icrc1_decimals())
  }

  async getTotalSupply(): Promise<bigint> {
    return await this.tokenActor.icrc1_total_supply()
  }

  async getFee(): Promise<bigint> {
    return await this.tokenActor.icrc1_fee()
  }

  async getBalance(account: Principal): Promise<bigint> {
    const accountArg: Account = {
      owner: account,
      subaccount: [] as []
    }
    return await this.tokenActor.icrc1_balance_of(accountArg)
  }

  async transfer(to: Principal, amount: bigint, memo?: Uint8Array): Promise<TransferResult> {
    const transferArgs: TransferArg = {
      from_subaccount: [] as [],
      to: {
        owner: to,
        subaccount: [] as []
      },
      amount,
      fee: [] as [],
      memo: (memo ? [memo] : []) as [] | [Uint8Array],
      created_at_time: [] as []
    }
    return await this.tokenActor.icrc1_transfer(transferArgs)
  }

  // ICRC-2 Standard Methods  
  async approve(spender: Principal, amount: bigint, expiresAt?: bigint): Promise<ApproveResult> {
    const approveArgs: ApproveArgs = {
      from_subaccount: [] as [],
      spender: {
        owner: spender,
        subaccount: [] as []
      },
      amount,
      expected_allowance: [] as [],
      expires_at: (expiresAt ? [expiresAt] : []) as [] | [bigint],
      fee: [] as [],
      memo: [] as [],
      created_at_time: [] as []
    }
    return await this.tokenActor.icrc2_approve(approveArgs)
  }

  async getAllowance(account: Principal, spender: Principal): Promise<Allowance> {
    const allowanceArgs: AllowanceArgs = {
      account: {
        owner: account,
        subaccount: [] as []
      },
      spender: {
        owner: spender,
        subaccount: [] as []
      }
    }
    return await this.tokenActor.icrc2_allowance(allowanceArgs)
  }

  async transferFrom(from: Principal, to: Principal, amount: bigint): Promise<TransferFromResult> {
    const transferFromArgs: TransferFromArgs = {
      spender_subaccount: [] as [],
      from: {
        owner: from,
        subaccount: [] as []
      },
      to: {
        owner: to,
        subaccount: [] as []
      },
      amount,
      fee: [] as [],
      memo: [] as [],
      created_at_time: [] as []
    }
    return await this.tokenActor.icrc2_transfer_from(transferFromArgs)
  }

  // Helper methods
  formatTokenAmount(amount: bigint, decimals?: number): string {
    const tokenDecimals = decimals || 8
    const divisor = BigInt(10 ** tokenDecimals)
    const wholePart = amount / divisor
    const fractionalPart = amount % divisor
    
    if (fractionalPart === 0n) {
      return wholePart.toString()
    }
    
    const fractionalStr = fractionalPart.toString().padStart(tokenDecimals, '0').replace(/0+$/, '')
    return `${wholePart}.${fractionalStr}`
  }

  parseTokenAmount(amount: string, decimals?: number): bigint {
    const tokenDecimals = decimals || 8
    const [wholePart = '0', fractionalPart = '0'] = amount.split('.')
    
    const paddedFractional = fractionalPart.padEnd(tokenDecimals, '0').slice(0, tokenDecimals)
    return BigInt(wholePart) * BigInt(10 ** tokenDecimals) + BigInt(paddedFractional)
  }
}
