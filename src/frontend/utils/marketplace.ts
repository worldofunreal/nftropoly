import type { Principal } from '@dfinity/principal'
import type { 
  Account, 
  AskStatus, 
  AskStatusType, 
  EscrowRecord, 
  TokenSpec, 
  AskFeature,
  BidFeature,
  BalanceResult,
  AskInfoResponse,
  ManageAskResponse,
  ManageBidResponse
} from '../../declarations/marketplace/marketplace.did'

// BigInt serialization helpers
export const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))
}

export const deserializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj), (key, value) => {
    // Convert string numbers back to BigInt for specific fields
    if (typeof value === 'string' && /^\d+$/.test(value) && 
        (key.includes('id') || key.includes('amount') || key.includes('fee') || 
         key.includes('decimals') || key.includes('count') || key.includes('timestamp'))) {
      return BigInt(value)
    }
    return value
  })
}

// Principal helpers
export const principalToText = (principal: Principal): string => {
  return principal.toString()
}

export const textToPrincipal = (text: string): Principal => {
  return Principal.fromText(text)
}

// Account helpers
export const createAccount = (owner: string, subaccount?: Uint8Array): Account => {
  return {
    owner: textToPrincipal(owner),
    subaccount: subaccount ? [subaccount] : []
  }
}

export const accountToText = (account: Account): string => {
  return `${principalToText(account.owner)}${account.subaccount.length > 0 ? `-${Array.from(account.subaccount[0]).join('')}` : ''}`
}

// Ask status helpers
export const getAskStatusText = (status: AskStatusType): string => {
  if ('Open' in status) return 'Open'
  if ('Closed' in status) return 'Closed'
  if ('PartiallySettled' in status) return 'Partially Settled'
  if ('NotStarted' in status) return 'Not Started'
  if ('Encumbered' in status) return 'Encumbered'
  return 'Unknown'
}

export const getAskStatusColor = (status: AskStatusType): string => {
  if ('Open' in status) return 'green'
  if ('Closed' in status) return 'red'
  if ('PartiallySettled' in status) return 'yellow'
  if ('NotStarted' in status) return 'gray'
  if ('Encumbered' in status) return 'orange'
  return 'gray'
}

// Token spec helpers
export const formatTokenAmount = (amount: bigint, decimals: number = 8): string => {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const remainder = amount % divisor
  
  if (remainder === BigInt(0)) {
    return whole.toString()
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0')
  const trimmed = remainderStr.replace(/0+$/, '')
  
  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

export const parseTokenAmount = (amount: string, decimals: number = 8): bigint => {
  const [whole, fractional = ''] = amount.split('.')
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFractional)
}

// Ask feature helpers
export const hasBuyNowFeature = (features: AskFeature[]): boolean => {
  return features.some(f => 'BuyNow' in f)
}

export const hasAuctionFeature = (features: AskFeature[]): boolean => {
  return features.some(f => 'Auction' in f)
}

export const hasDutchFeature = (features: AskFeature[]): boolean => {
  return features.some(f => 'Dutch' in f)
}

export const hasAMMFeature = (features: AskFeature[]): boolean => {
  return features.some(f => 'AMM' in f)
}

export const getBuyNowPrice = (features: AskFeature[]): bigint | null => {
  const buyNowFeature = features.find(f => 'BuyNow' in f)
  if (buyNowFeature && 'BuyNow' in buyNowFeature) {
    return buyNowFeature.BuyNow[0]?.[0]?.amount || null
  }
  return null
}

// Escrow helpers
export const getEscrowType = (escrow: EscrowRecord): string => {
  if ('Ask' in escrow.escrow_type) return 'Ask'
  if ('Bid' in escrow.escrow_type) return 'Bid'
  if ('Settlement' in escrow.escrow_type) return 'Settlement'
  return 'Unknown'
}

export const getEscrowTokens = (escrow: EscrowRecord): TokenSpec[] => {
  if ('Ask' in escrow.escrow_type) {
    return escrow.escrow_type.Ask.filter(t => t !== null).map(t => t!)
  }
  if ('Bid' in escrow.escrow_type) {
    return escrow.escrow_type.Bid.filter(t => t !== null).map(t => t!)
  }
  if ('Settlement' in escrow.escrow_type) {
    return escrow.escrow_type.Settlement.filter(t => t !== null).map(t => t!)
  }
  return []
}

// Balance helpers
export const getBalanceType = (balance: BalanceResult): string => {
  if ('Nfts' in balance) return 'Nfts'
  if ('Tokens' in balance) return 'Tokens'
  if ('Escrow' in balance) return 'Escrow'
  if ('AskSettlements' in balance) return 'AskSettlements'
  if ('Offers' in balance) return 'Offers'
  return 'Unknown'
}

// Response helpers
export const isSuccessResponse = (response: ManageAskResponse | ManageBidResponse): boolean => {
  return Object.values(response).some(v => v && typeof v === 'object' && 'Ok' in v)
}

export const getResponseError = (response: ManageAskResponse | ManageBidResponse): string | null => {
  for (const [key, value] of Object.entries(response)) {
    if (value && typeof value === 'object' && 'Err' in value) {
      return value.Err.message || `Error in ${key}`
    }
  }
  return null
}

// Pagination helpers
export const createPagination = (prev?: bigint, take?: bigint) => {
  return {
    prev: prev ? [prev] : [],
    take: take ? [take] : []
  }
}

// Time helpers
export const formatTimestamp = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) / 1000000) // Convert from nanoseconds
  return date.toLocaleString()
}

export const getTimeRemaining = (endTime: bigint): string => {
  const now = BigInt(Date.now() * 1000000)
  const remaining = endTime - now
  
  if (remaining <= BigInt(0)) {
    return 'Expired'
  }
  
  const seconds = Number(remaining) / 1000000000
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${Math.floor(seconds % 60)}s`
  return `${Math.floor(seconds)}s`
}

// Validation helpers
export const validateAccount = (account: Account): boolean => {
  try {
    return account.owner.toString().length > 0
  } catch {
    return false
  }
}

export const validateTokenSpec = (tokenSpec: TokenSpec): boolean => {
  try {
    return tokenSpec.canister.toString().length > 0 && 
           tokenSpec.symbol.length > 0 && 
           tokenSpec.standards.length > 0
  } catch {
    return false
  }
}

// Type guards
export const isAskStatus = (obj: any): obj is AskStatus => {
  return obj && typeof obj === 'object' && 'ask_id' in obj && 'status' in obj
}

export const isEscrowRecord = (obj: any): obj is EscrowRecord => {
  return obj && typeof obj === 'object' && 'escrow_type' in obj && 'seller' in obj
}

export const isTokenSpec = (obj: any): obj is TokenSpec => {
  return obj && typeof obj === 'object' && 'canister' in obj && 'symbol' in obj && 'standards' in obj
}
