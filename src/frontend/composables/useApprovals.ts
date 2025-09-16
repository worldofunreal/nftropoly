import { ref, computed, watch } from 'vue'
import { useApprovalsStore } from '~/stores/approvals'
import { useAuthStore } from '~/stores/auth'
import { marketplaceService } from '~/services/MarketplaceService'
import type { Account, Principal } from '@dfinity/principal'
import { textToPrincipal, createUserKey, createTokenKey } from '~/utils/marketplace'

export const useApprovals = () => {
  const approvalsStore = useApprovalsStore()
  const authStore = useAuthStore()
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!authStore.identity)
  const currentUser = computed(() => authStore.identity?.getPrincipal().toString())
  const marketplaceCanisterId = computed(() => 'u6s2n-gx777-77774-qaaba-cai') // This should come from config

  // Load NFT approvals for a specific token
  const loadNFTApprovals = async (canisterId: string, tokenId: bigint) => {
    if (!isAuthenticated.value) return
    
    try {
      const tokenKey = createTokenKey(canisterId, tokenId)
      approvalsStore.setNFTApprovalsLoading(tokenKey, true)
      error.value = null
      
      // This would need to be implemented with the NFT collection service
      // For now, we'll use a placeholder
      const approvals: any[] = []
      approvalsStore.setNFTApprovals(tokenKey, approvals)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFT approvals'
      const tokenKey = createTokenKey(canisterId, tokenId)
      approvalsStore.setNFTApprovalsError(tokenKey, errorMessage)
      error.value = errorMessage
    } finally {
      const tokenKey = createTokenKey(canisterId, tokenId)
      approvalsStore.setNFTApprovalsLoading(tokenKey, false)
    }
  }

  // Load token approvals for a user
  const loadTokenApprovals = async (canisterId: string) => {
    if (!isAuthenticated.value || !currentUser.value) return
    
    try {
      const userKey = createUserKey(currentUser.value)
      approvalsStore.setTokenApprovalsLoading(userKey, true)
      error.value = null
      
      // This would need to be implemented with the token service
      // For now, we'll use a placeholder
      const approvals: any[] = []
      approvalsStore.setTokenApprovals(userKey, approvals)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load token approvals'
      const userKey = createUserKey(currentUser.value)
      approvalsStore.setTokenApprovalsError(userKey, errorMessage)
      error.value = errorMessage
    } finally {
      const userKey = createUserKey(currentUser.value)
      approvalsStore.setTokenApprovalsLoading(userKey, false)
    }
  }

  // Approve NFT for marketplace
  const approveNFTForMarketplace = async (
    canisterId: string, 
    tokenId: bigint, 
    expiresAt?: bigint
  ) => {
    if (!isAuthenticated.value || !currentUser.value) return null
    
    try {
      loading.value = true
      error.value = null
      
      const approvalId = `${Date.now()}-${Math.random()}`
      
      // Add to pending approvals
      approvalsStore.addPendingApproval({
        type: 'nft',
        tokenId,
        spender: marketplaceCanisterId.value,
        canisterId
      })
      
      // This would need to be implemented with the NFT collection service
      // For now, we'll simulate the approval
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update pending approval status
      approvalsStore.updatePendingApprovalStatus(approvalId, 'approved')
      
      // Add to approvals store
      const approval = {
        tokenId,
        spender: marketplaceCanisterId.value,
        expiresAt,
        approvedAt: BigInt(Date.now() * 1000000),
        canisterId
      }
      
      const tokenKey = createTokenKey(canisterId, tokenId)
      approvalsStore.addNFTApproval(tokenKey, approval)
      
      return approval
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve NFT'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Approve tokens for marketplace
  const approveTokensForMarketplace = async (
    canisterId: string, 
    amount: bigint, 
    expiresAt?: bigint
  ) => {
    if (!isAuthenticated.value || !currentUser.value) return null
    
    try {
      loading.value = true
      error.value = null
      
      const approvalId = `${Date.now()}-${Math.random()}`
      
      // Add to pending approvals
      approvalsStore.addPendingApproval({
        type: 'token',
        spender: marketplaceCanisterId.value,
        amount,
        canisterId
      })
      
      // This would need to be implemented with the token service
      // For now, we'll simulate the approval
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update pending approval status
      approvalsStore.updatePendingApprovalStatus(approvalId, 'approved')
      
      // Add to approvals store
      const approval = {
        spender: marketplaceCanisterId.value,
        amount,
        expiresAt,
        approvedAt: BigInt(Date.now() * 1000000),
        canisterId
      }
      
      const userKey = createUserKey(currentUser.value)
      approvalsStore.addTokenApproval(userKey, approval)
      
      return approval
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve tokens'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Revoke NFT approval
  const revokeNFTApproval = async (canisterId: string, tokenId: bigint) => {
    if (!isAuthenticated.value) return null
    
    try {
      loading.value = true
      error.value = null
      
      // This would need to be implemented with the NFT collection service
      // For now, we'll simulate the revocation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from approvals store
      const tokenKey = createTokenKey(canisterId, tokenId)
      approvalsStore.removeNFTApproval(tokenKey, marketplaceCanisterId.value)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke NFT approval'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Revoke token approval
  const revokeTokenApproval = async (canisterId: string) => {
    if (!isAuthenticated.value || !currentUser.value) return null
    
    try {
      loading.value = true
      error.value = null
      
      // This would need to be implemented with the token service
      // For now, we'll simulate the revocation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from approvals store
      const userKey = createUserKey(currentUser.value)
      approvalsStore.removeTokenApproval(userKey, marketplaceCanisterId.value)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke token approval'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Check if marketplace is approved for NFT
  const isMarketplaceApprovedForNFT = (canisterId: string, tokenId: bigint): boolean => {
    const tokenKey = createTokenKey(canisterId, tokenId)
    return approvalsStore.isMarketplaceApprovedForNFT(tokenKey, marketplaceCanisterId.value)
  }

  // Check if marketplace is approved for tokens
  const isMarketplaceApprovedForTokens = (canisterId: string, amount: bigint): boolean => {
    if (!currentUser.value) return false
    const userKey = createUserKey(currentUser.value)
    return approvalsStore.isMarketplaceApprovedForTokens(userKey, marketplaceCanisterId.value, amount)
  }

  // Get required approval amount for tokens
  const getRequiredTokenApprovalAmount = (canisterId: string, currentAmount: bigint, requiredAmount: bigint): bigint => {
    if (!currentUser.value) return requiredAmount
    const userKey = createUserKey(currentUser.value)
    const approvals = approvalsStore.getTokenApprovals(userKey)
    const marketplaceApproval = approvals.find(a => a.spender === marketplaceCanisterId.value && a.canisterId === canisterId)
    
    if (!marketplaceApproval) return requiredAmount
    
    const currentApproved = marketplaceApproval.amount
    if (currentApproved >= requiredAmount) return BigInt(0)
    
    return requiredAmount - currentApproved
  }

  // Load marketplace approvals status
  const loadMarketplaceApprovals = async () => {
    if (!isAuthenticated.value || !currentUser.value) return
    
    try {
      approvalsStore.setMarketplaceApprovalsLoading(true)
      error.value = null
      
      // This would check the current approval status
      // For now, we'll use placeholders
      const nftApproved = false
      const tokenApproved = false
      
      approvalsStore.setMarketplaceApprovals({
        nft: nftApproved,
        token: tokenApproved
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load marketplace approvals'
      approvalsStore.setMarketplaceApprovalsError(errorMessage)
      error.value = errorMessage
    } finally {
      approvalsStore.setMarketplaceApprovalsLoading(false)
    }
  }

  // Watch for authentication changes
  watch(isAuthenticated, (authenticated) => {
    if (authenticated) {
      loadMarketplaceApprovals()
    } else {
      approvalsStore.clearAllApprovals()
    }
  }, { immediate: true })

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    currentUser,
    marketplaceCanisterId,
    
    // Store getters
    pendingApprovals: computed(() => approvalsStore.getPendingApprovals),
    recentApprovals: computed(() => approvalsStore.getRecentApprovals),
    marketplaceApprovals: computed(() => approvalsStore.marketplaceApprovals),
    marketplaceApprovalsLoading: computed(() => approvalsStore.marketplaceApprovalsLoading),
    marketplaceApprovalsError: computed(() => approvalsStore.marketplaceApprovalsError),
    
    // Actions
    loadNFTApprovals,
    loadTokenApprovals,
    approveNFTForMarketplace,
    approveTokensForMarketplace,
    revokeNFTApproval,
    revokeTokenApproval,
    isMarketplaceApprovedForNFT,
    isMarketplaceApprovedForTokens,
    getRequiredTokenApprovalAmount,
    loadMarketplaceApprovals,
    
    // Store actions
    getNFTApprovalsForToken: approvalsStore.getNFTApprovalsForToken,
    getAllNFTApprovals: approvalsStore.getAllNFTApprovals,
    getTokenApprovals: approvalsStore.getTokenApprovals,
    removePendingApproval: approvalsStore.removePendingApproval
  }
}
