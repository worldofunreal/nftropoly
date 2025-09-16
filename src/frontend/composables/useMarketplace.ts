import { ref, computed, watch } from 'vue'
import { useMarketplaceStore } from '~/stores/marketplace'
import { useApprovalsStore } from '~/stores/approvals'
import { marketplaceService } from '~/services/MarketplaceService'
import { useAuthStore } from '~/stores/auth'
import type {
  AskInfoRequest,
  AskStatus,
  BalanceRequest,
  Account,
  AskFeature,
  BidFeature,
} from '../../declarations/marketplace/marketplace.did'
import {
  createAccount,
  isSuccessResponse,
  getResponseError,
} from '~/utils/marketplace'

export const useMarketplace = () => {
  const marketplaceStore = useMarketplaceStore()
  const approvalsStore = useApprovalsStore()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!authStore.identity)
  const currentUser = computed(() =>
    authStore.identity?.getPrincipal().toString()
  )

  // Initialize marketplace service
  const initializeMarketplace = async () => {
    if (!authStore.identity) {
      throw new Error('User not authenticated')
    }

    try {
      await marketplaceService.initialize(authStore.identity)
    } catch (err) {
      console.error('Failed to initialize marketplace service:', err)
      throw err
    }
  }

  // Load active asks
  const loadActiveAsks = async (pagination?: {
    prev?: bigint
    take?: bigint
  }) => {
    if (!isAuthenticated.value) return

    try {
      marketplaceStore.setActiveAsksLoading(true)
      error.value = null

      const request: AskInfoRequest = {
        Active: pagination ? [pagination] : [],
      }

      const response = await marketplaceService.getAskInfo([request])

      if (response[0] && response[0][1] && response[0][1][0]) {
        const askInfoResponse = response[0][1][0]

        if ('Active' in askInfoResponse) {
          const asks = askInfoResponse.Active.records
            .filter(record => record[0] !== null)
            .map(record => record[0]!)

          marketplaceStore.setActiveAsks(asks)
          marketplaceStore.updatePagination({
            hasMore: !askInfoResponse.Active.eof,
            total: Number(askInfoResponse.Active.count),
          })
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load active asks'
      marketplaceStore.setActiveAsksError(errorMessage)
      error.value = errorMessage
    } finally {
      marketplaceStore.setActiveAsksLoading(false)
    }
  }

  // Load ask details
  const loadAskDetails = async (askId: string) => {
    if (!isAuthenticated.value) return

    try {
      marketplaceStore.setAskDetailsLoading(askId, true)
      error.value = null

      const request: AskInfoRequest = {
        Status: BigInt(askId),
      }

      const response = await marketplaceService.getAskInfo([request])

      if (response[0] && response[0][1] && response[0][1][0]) {
        const askInfoResponse = response[0][1][0]

        if ('Status' in askInfoResponse && askInfoResponse.Status[0]) {
          marketplaceStore.setAskDetails(askId, askInfoResponse.Status[0])
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load ask details'
      marketplaceStore.setAskDetailsError(askId, errorMessage)
      error.value = errorMessage
    } finally {
      marketplaceStore.setAskDetailsLoading(askId, false)
    }
  }

  // Load user's asks
  const loadUserAsks = async () => {
    if (!isAuthenticated.value || !currentUser.value) return

    try {
      marketplaceStore.setUserAsksLoading(true)
      error.value = null

      // This would need to be implemented based on how user asks are queried
      // For now, we'll use a placeholder
      const userAsks: AskStatus[] = []
      marketplaceStore.setUserAsks(userAsks)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load user asks'
      marketplaceStore.setUserAsksError(errorMessage)
      error.value = errorMessage
    } finally {
      marketplaceStore.setUserAsksLoading(false)
    }
  }

  // Load user's bids
  const loadUserBids = async () => {
    if (!isAuthenticated.value || !currentUser.value) return

    try {
      marketplaceStore.setUserBidsLoading(true)
      error.value = null

      // This would need to be implemented based on how user bids are queried
      // For now, we'll use a placeholder
      const userBids: AskStatus[] = []
      marketplaceStore.setUserBids(userBids)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load user bids'
      marketplaceStore.setUserBidsError(errorMessage)
      error.value = errorMessage
    } finally {
      marketplaceStore.setUserBidsLoading(false)
    }
  }

  // Load balances
  const loadBalances = async (account: Account, requests: BalanceRequest[]) => {
    if (!isAuthenticated.value) return

    try {
      const accountKey = `${account.owner.toString()}-${account.subaccount.length > 0 ? Array.from(account.subaccount[0]).join('') : ''}`
      marketplaceStore.setBalanceLoading(accountKey, true)
      error.value = null

      const response = await marketplaceService.getBalanceOf([
        [account, requests],
      ])

      if (response[0]) {
        const [, balances] = response[0]
        marketplaceStore.setBalances(accountKey, balances)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load balances'
      const accountKey = `${account.owner.toString()}-${account.subaccount.length > 0 ? Array.from(account.subaccount[0]).join('') : ''}`
      marketplaceStore.setBalanceError(accountKey, errorMessage)
      error.value = errorMessage
    } finally {
      const accountKey = `${account.owner.toString()}-${account.subaccount.length > 0 ? Array.from(account.subaccount[0]).join('') : ''}`
      marketplaceStore.setBalanceLoading(accountKey, false)
    }
  }

  // Create ask
  const createAsk = async (features: AskFeature[]) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.createNewAsk(features)

      if (response && isSuccessResponse(response)) {
        marketplaceStore.addRecentAction({
          type: 'ask_created',
          askId: '0', // Would need to extract from response
          details: { features },
        })

        // Reload active asks
        await loadActiveAsks()

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to create ask'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create ask'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // End ask
  const endAsk = async (askId: bigint) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.endAsk(askId)

      if (response && isSuccessResponse(response)) {
        marketplaceStore.addRecentAction({
          type: 'ask_ended',
          askId: askId.toString(),
          details: {},
        })

        // Reload user asks
        await loadUserAsks()

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to end ask'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to end ask'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Create bid
  const createBid = async (askId: bigint, features: BidFeature[]) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.createNewBid(askId, features)

      if (response && isSuccessResponse(response)) {
        marketplaceStore.addRecentAction({
          type: 'bid_placed',
          askId: askId.toString(),
          details: { features },
        })

        // Reload user bids
        await loadUserBids()

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to create bid'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create bid'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Withdraw escrow
  const withdrawEscrow = async (escrowRecord: unknown) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.withdrawEscrow(escrowRecord)

      if (response && isSuccessResponse(response)) {
        // Reload balances
        if (currentUser.value) {
          const account = createAccount(currentUser.value)
          await loadBalances(account, [{ Escrow: [] }])
        }

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to withdraw escrow'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to withdraw escrow'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Withdraw settlement
  const withdrawSettlement = async (escrowRecord: unknown) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.withdrawSettlement(escrowRecord)

      if (response && isSuccessResponse(response)) {
        marketplaceStore.addRecentAction({
          type: 'purchase_completed',
          askId: '0', // Would need to extract from response
          details: { escrowRecord },
        })

        // Reload balances and user asks
        if (currentUser.value) {
          const account = createAccount(currentUser.value)
          await loadBalances(account, [{ AskSettlements: [] }])
          await loadUserAsks()
        }

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to withdraw settlement'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to withdraw settlement'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Refresh offers
  const refreshOffers = async (account?: Account) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.refreshOffers(account)

      if (response && isSuccessResponse(response)) {
        // Reload active asks
        await loadActiveAsks()

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to refresh offers'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh offers'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Distribute ask
  const distributeAsk = async (askId: bigint) => {
    if (!isAuthenticated.value) return null

    try {
      loading.value = true
      error.value = null

      const response = await marketplaceService.distributeAsk(askId)

      if (response && isSuccessResponse(response)) {
        // Reload user asks
        await loadUserAsks()

        return response
      } else {
        const errorMessage = response
          ? getResponseError(response)
          : 'Failed to distribute ask'
        error.value = errorMessage
        return null
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to distribute ask'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Watch for authentication changes
  watch(
    isAuthenticated,
    authenticated => {
      if (authenticated) {
        initializeMarketplace()
      } else {
        marketplaceStore.clearUserData()
        approvalsStore.clearAllApprovals()
      }
    },
    { immediate: true }
  )

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    currentUser,

    // Store getters
    activeAsks: computed(() => marketplaceStore.filteredAsks),
    userAsks: computed(() => marketplaceStore.userAsks),
    userBids: computed(() => marketplaceStore.userBids),
    recentActions: computed(() => marketplaceStore.recentUserActions),

    // Loading states
    activeAsksLoading: computed(() => marketplaceStore.activeAsksLoading),
    userAsksLoading: computed(() => marketplaceStore.userAsksLoading),
    userBidsLoading: computed(() => marketplaceStore.userBidsLoading),

    // Error states
    activeAsksError: computed(() => marketplaceStore.activeAsksError),
    userAsksError: computed(() => marketplaceStore.userAsksError),
    userBidsError: computed(() => marketplaceStore.userBidsError),

    // Actions
    initializeMarketplace,
    loadActiveAsks,
    loadAskDetails,
    loadUserAsks,
    loadUserBids,
    loadBalances,
    createAsk,
    endAsk,
    createBid,
    withdrawEscrow,
    withdrawSettlement,
    refreshOffers,
    distributeAsk,

    // Store actions
    updateFilters: marketplaceStore.updateFilters,
    updatePagination: marketplaceStore.updatePagination,
    getAskById: marketplaceStore.getAskById,
    getBalanceForAccount: marketplaceStore.getBalanceForAccount,
  }
}
