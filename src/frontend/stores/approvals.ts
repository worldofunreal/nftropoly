import { defineStore } from 'pinia'
// import type { Principal } from '@dfinity/principal'
// import type { Account } from '../../declarations/marketplace/marketplace.did'

export interface NFTApproval {
  tokenId: bigint
  spender: string
  expiresAt?: bigint
  approvedAt: bigint
  canisterId: string
}

export interface TokenApproval {
  spender: string
  amount: bigint
  expiresAt?: bigint
  approvedAt: bigint
  canisterId: string
}

export interface ApprovalState {
  // NFT approvals (ICRC-37)
  nftApprovals: Map<string, NFTApproval[]>
  nftApprovalsLoading: Set<string>
  nftApprovalsError: Map<string, string>

  // Token approvals (ICRC-2)
  tokenApprovals: Map<string, TokenApproval[]>
  tokenApprovalsLoading: Set<string>
  tokenApprovalsError: Map<string, string>

  // Pending approvals
  pendingApprovals: Array<{
    id: string
    type: 'nft' | 'token'
    tokenId?: bigint
    spender: string
    amount?: bigint
    canisterId: string
    status: 'pending' | 'approved' | 'failed'
    timestamp: number
  }>

  // Marketplace approvals
  marketplaceApprovals: {
    nft: boolean
    token: boolean
  }
  marketplaceApprovalsLoading: boolean
  marketplaceApprovalsError: string | null
}

export const useApprovalsStore = defineStore('approvals', {
  state: (): ApprovalState => ({
    nftApprovals: new Map(),
    nftApprovalsLoading: new Set(),
    nftApprovalsError: new Map(),

    tokenApprovals: new Map(),
    tokenApprovalsLoading: new Set(),
    tokenApprovalsError: new Map(),

    pendingApprovals: [],

    marketplaceApprovals: {
      nft: false,
      token: false,
    },
    marketplaceApprovalsLoading: false,
    marketplaceApprovalsError: null,
  }),

  getters: {
    // Get NFT approvals for a specific token
    getNFTApprovalsForToken: state => (tokenId: string) => {
      return state.nftApprovals.get(tokenId) || []
    },

    // Get all NFT approvals for a user
    getAllNFTApprovals: state => (_userKey: string) => {
      const allApprovals: NFTApproval[] = []
      for (const approvals of state.nftApprovals.values()) {
        allApprovals.push(...approvals)
      }
      return allApprovals
    },

    // Get token approvals for a user
    getTokenApprovals: state => (userKey: string) => {
      return state.tokenApprovals.get(userKey) || []
    },

    // Check if marketplace is approved for NFT
    isMarketplaceApprovedForNFT:
      state => (tokenId: string, marketplaceCanisterId: string) => {
        const approvals = state.nftApprovals.get(tokenId) || []
        return approvals.some(
          approval =>
            approval.spender === marketplaceCanisterId &&
            (!approval.expiresAt ||
              approval.expiresAt > BigInt(Date.now() * 1000000))
        )
      },

    // Check if marketplace is approved for tokens
    isMarketplaceApprovedForTokens:
      state =>
      (userKey: string, marketplaceCanisterId: string, amount: bigint) => {
        const approvals = state.tokenApprovals.get(userKey) || []
        const approval = approvals.find(
          a => a.spender === marketplaceCanisterId
        )

        if (!approval) return false
        if (
          approval.expiresAt &&
          approval.expiresAt <= BigInt(Date.now() * 1000000)
        ) {
          return false
        }

        return approval.amount >= amount
      },

    // Get pending approvals
    getPendingApprovals: state => {
      return state.pendingApprovals.filter(p => p.status === 'pending')
    },

    // Get recent approvals
    getRecentApprovals: state => {
      return state.pendingApprovals
        .filter(p => p.status === 'approved')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
    },
  },

  actions: {
    // Set loading states
    setNFTApprovalsLoading(tokenId: string, loading: boolean) {
      if (loading) {
        this.nftApprovalsLoading.add(tokenId)
        this.nftApprovalsError.delete(tokenId)
      } else {
        this.nftApprovalsLoading.delete(tokenId)
      }
    },

    setTokenApprovalsLoading(userKey: string, loading: boolean) {
      if (loading) {
        this.tokenApprovalsLoading.add(userKey)
        this.tokenApprovalsError.delete(userKey)
      } else {
        this.tokenApprovalsLoading.delete(userKey)
      }
    },

    setMarketplaceApprovalsLoading(loading: boolean) {
      this.marketplaceApprovalsLoading = loading
      if (loading) this.marketplaceApprovalsError = null
    },

    // Set data
    setNFTApprovals(tokenId: string, approvals: NFTApproval[]) {
      this.nftApprovals.set(tokenId, approvals)
      this.nftApprovalsError.delete(tokenId)
    },

    setTokenApprovals(userKey: string, approvals: TokenApproval[]) {
      this.tokenApprovals.set(userKey, approvals)
      this.tokenApprovalsError.delete(userKey)
    },

    setMarketplaceApprovals(approvals: { nft: boolean; token: boolean }) {
      this.marketplaceApprovals = approvals
      this.marketplaceApprovalsError = null
    },

    // Set errors
    setNFTApprovalsError(tokenId: string, error: string) {
      this.nftApprovalsError.set(tokenId, error)
      this.nftApprovalsLoading.delete(tokenId)
    },

    setTokenApprovalsError(userKey: string, error: string) {
      this.tokenApprovalsError.set(userKey, error)
      this.tokenApprovalsLoading.delete(userKey)
    },

    setMarketplaceApprovalsError(error: string) {
      this.marketplaceApprovalsError = error
      this.marketplaceApprovalsLoading = false
    },

    // Add pending approval
    addPendingApproval(approval: {
      type: 'nft' | 'token'
      tokenId?: bigint
      spender: string
      amount?: bigint
      canisterId: string
    }) {
      const pendingApproval = {
        id: `${Date.now()}-${Math.random()}`,
        status: 'pending' as const,
        timestamp: Date.now(),
        ...approval,
      }

      this.pendingApprovals.unshift(pendingApproval)

      // Keep only last 100 pending approvals
      if (this.pendingApprovals.length > 100) {
        this.pendingApprovals = this.pendingApprovals.slice(0, 100)
      }
    },

    // Update pending approval status
    updatePendingApprovalStatus(id: string, status: 'approved' | 'failed') {
      const approval = this.pendingApprovals.find(p => p.id === id)
      if (approval) {
        approval.status = status
      }
    },

    // Remove pending approval
    removePendingApproval(id: string) {
      const index = this.pendingApprovals.findIndex(p => p.id === id)
      if (index !== -1) {
        this.pendingApprovals.splice(index, 1)
      }
    },

    // Add NFT approval
    addNFTApproval(tokenId: string, approval: NFTApproval) {
      const existing = this.nftApprovals.get(tokenId) || []
      const updated = [...existing, approval]
      this.nftApprovals.set(tokenId, updated)
    },

    // Remove NFT approval
    removeNFTApproval(tokenId: string, spender: string) {
      const existing = this.nftApprovals.get(tokenId) || []
      const updated = existing.filter(a => a.spender !== spender)
      this.nftApprovals.set(tokenId, updated)
    },

    // Add token approval
    addTokenApproval(userKey: string, approval: TokenApproval) {
      const existing = this.tokenApprovals.get(userKey) || []
      const updated = [...existing, approval]
      this.tokenApprovals.set(userKey, updated)
    },

    // Update token approval
    updateTokenApproval(userKey: string, spender: string, amount: bigint) {
      const existing = this.tokenApprovals.get(userKey) || []
      const updated = existing.map(a =>
        a.spender === spender ? { ...a, amount } : a
      )
      this.tokenApprovals.set(userKey, updated)
    },

    // Remove token approval
    removeTokenApproval(userKey: string, spender: string) {
      const existing = this.tokenApprovals.get(userKey) || []
      const updated = existing.filter(a => a.spender !== spender)
      this.tokenApprovals.set(userKey, updated)
    },

    // Clear data
    clearNFTApprovals(tokenId: string) {
      this.nftApprovals.delete(tokenId)
      this.nftApprovalsError.delete(tokenId)
    },

    clearTokenApprovals(userKey: string) {
      this.tokenApprovals.delete(userKey)
      this.tokenApprovalsError.delete(userKey)
    },

    clearAllApprovals() {
      this.nftApprovals.clear()
      this.tokenApprovals.clear()
      this.nftApprovalsError.clear()
      this.tokenApprovalsError.clear()
      this.pendingApprovals = []
      this.marketplaceApprovals = { nft: false, token: false }
    },

    // Reset store
    reset() {
      this.$reset()
    },
  },
})

// Helper function to create user key
export const createUserKey = (
  principal: string,
  subaccount?: Uint8Array
): string => {
  return subaccount
    ? `${principal}-${Array.from(subaccount).join('')}`
    : principal
}

// Helper function to create token key
export const createTokenKey = (canisterId: string, tokenId: bigint): string => {
  return `${canisterId}-${tokenId.toString()}`
}
