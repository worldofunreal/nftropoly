import { defineStore } from 'pinia'
import type {
  AskStatus,
  EscrowRecord,
  BalanceResult,
} from '../../declarations/marketplace/marketplace.did'

export interface MarketplaceFilters {
  status: string[]
  priceRange: { min: string; max: string }
  tokenTypes: string[]
  sortBy: 'price' | 'date' | 'popularity'
  sortOrder: 'asc' | 'desc'
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface MarketplaceState {
  // Active asks
  activeAsks: AskStatus[]
  activeAsksLoading: boolean
  activeAsksError: string | null

  // Ask details
  askDetails: Map<string, AskStatus>
  askDetailsLoading: Set<string>
  askDetailsError: Map<string, string>

  // User's asks
  userAsks: AskStatus[]
  userAsksLoading: boolean
  userAsksError: string | null

  // User's bids
  userBids: AskStatus[]
  userBidsLoading: boolean
  userBidsError: string | null

  // Balances
  balances: Map<string, BalanceResult[]>
  balancesLoading: Set<string>
  balancesError: Map<string, string>

  // Escrow records
  escrowRecords: EscrowRecord[]
  escrowLoading: boolean
  escrowError: string | null

  // Filters and pagination
  filters: MarketplaceFilters
  pagination: PaginationState

  // Recent actions
  recentActions: Array<{
    id: string
    type: 'ask_created' | 'ask_ended' | 'bid_placed' | 'purchase_completed'
    timestamp: number
    askId: string
    details: unknown
  }>
}

export const useMarketplaceStore = defineStore('marketplace', {
  state: (): MarketplaceState => ({
    activeAsks: [],
    activeAsksLoading: false,
    activeAsksError: null,

    askDetails: new Map(),
    askDetailsLoading: new Set(),
    askDetailsError: new Map(),

    userAsks: [],
    userAsksLoading: false,
    userAsksError: null,

    userBids: [],
    userBidsLoading: false,
    userBidsError: null,

    balances: new Map(),
    balancesLoading: new Set(),
    balancesError: new Map(),

    escrowRecords: [],
    escrowLoading: false,
    escrowError: null,

    filters: {
      status: ['Open'],
      priceRange: { min: '', max: '' },
      tokenTypes: [],
      sortBy: 'date',
      sortOrder: 'desc',
    },

    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: false,
    },

    recentActions: [],
  }),

  getters: {
    // Filtered and sorted asks
    filteredAsks: state => {
      let filtered = [...state.activeAsks]

      // Filter by status
      if (state.filters.status.length > 0) {
        filtered = filtered.filter(ask =>
          state.filters.status.includes(
            ask.status ? Object.keys(ask.status)[0] : ''
          )
        )
      }

      // Filter by price range
      if (state.filters.priceRange.min || state.filters.priceRange.max) {
        filtered = filtered.filter(_ask => {
          // This would need to extract price from ask features
          // For now, return true
          return true
        })
      }

      // Sort
      filtered.sort((a, b) => {
        const aValue = getSortValue(a, state.filters.sortBy)
        const bValue = getSortValue(b, state.filters.sortBy)

        if (state.filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      return filtered
    },

    // Paginated asks
    paginatedAsks: state => {
      const start = (state.pagination.page - 1) * state.pagination.pageSize
      const end = start + state.pagination.pageSize
      return state.activeAsks.slice(start, end)
    },

    // User's active asks
    userActiveAsks: state => {
      return state.userAsks.filter(ask => ask.status && 'Open' in ask.status)
    },

    // User's closed asks
    userClosedAsks: state => {
      return state.userAsks.filter(ask => ask.status && 'Closed' in ask.status)
    },

    // User's active bids
    userActiveBids: state => {
      return state.userBids.filter(ask => ask.status && 'Open' in ask.status)
    },

    // Get ask by ID
    getAskById: state => (askId: string) => {
      return (
        state.askDetails.get(askId) ||
        state.activeAsks.find(ask => ask.ask_id.toString() === askId) ||
        state.userAsks.find(ask => ask.ask_id.toString() === askId) ||
        state.userBids.find(ask => ask.ask_id.toString() === askId)
      )
    },

    // Get balance for account
    getBalanceForAccount: state => (accountKey: string) => {
      return state.balances.get(accountKey) || []
    },

    // Recent actions for user
    recentUserActions: state => {
      return state.recentActions.slice(0, 10)
    },
  },

  actions: {
    // Set loading states
    setActiveAsksLoading(loading: boolean) {
      this.activeAsksLoading = loading
      if (loading) this.activeAsksError = null
    },

    setUserAsksLoading(loading: boolean) {
      this.userAsksLoading = loading
      if (loading) this.userAsksError = null
    },

    setUserBidsLoading(loading: boolean) {
      this.userBidsLoading = loading
      if (loading) this.userBidsError = null
    },

    setEscrowLoading(loading: boolean) {
      this.escrowLoading = loading
      if (loading) this.escrowError = null
    },

    // Set ask details loading
    setAskDetailsLoading(askId: string, loading: boolean) {
      if (loading) {
        this.askDetailsLoading.add(askId)
        this.askDetailsError.delete(askId)
      } else {
        this.askDetailsLoading.delete(askId)
      }
    },

    // Set balance loading
    setBalanceLoading(accountKey: string, loading: boolean) {
      if (loading) {
        this.balancesLoading.add(accountKey)
        this.balancesError.delete(accountKey)
      } else {
        this.balancesLoading.delete(accountKey)
      }
    },

    // Set data
    setActiveAsks(asks: AskStatus[]) {
      this.activeAsks = asks
      this.activeAsksError = null
    },

    setUserAsks(asks: AskStatus[]) {
      this.userAsks = asks
      this.userAsksError = null
    },

    setUserBids(bids: AskStatus[]) {
      this.userBids = bids
      this.userBidsError = null
    },

    setAskDetails(askId: string, ask: AskStatus) {
      this.askDetails.set(askId, ask)
      this.askDetailsError.delete(askId)
    },

    setBalances(accountKey: string, balances: BalanceResult[]) {
      this.balances.set(accountKey, balances)
      this.balancesError.delete(accountKey)
    },

    setEscrowRecords(records: EscrowRecord[]) {
      this.escrowRecords = records
      this.escrowError = null
    },

    // Set errors
    setActiveAsksError(error: string) {
      this.activeAsksError = error
      this.activeAsksLoading = false
    },

    setUserAsksError(error: string) {
      this.userAsksError = error
      this.userAsksLoading = false
    },

    setUserBidsError(error: string) {
      this.userBidsError = error
      this.userBidsLoading = false
    },

    setAskDetailsError(askId: string, error: string) {
      this.askDetailsError.set(askId, error)
      this.askDetailsLoading.delete(askId)
    },

    setBalanceError(accountKey: string, error: string) {
      this.balancesError.set(accountKey, error)
      this.balancesLoading.delete(accountKey)
    },

    setEscrowError(error: string) {
      this.escrowError = error
      this.escrowLoading = false
    },

    // Update filters
    updateFilters(filters: Partial<MarketplaceFilters>) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.page = 1 // Reset to first page
    },

    // Update pagination
    updatePagination(pagination: Partial<PaginationState>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    // Add recent action
    addRecentAction(action: {
      type: 'ask_created' | 'ask_ended' | 'bid_placed' | 'purchase_completed'
      askId: string
      details: unknown
    }) {
      const newAction = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        ...action,
      }

      this.recentActions.unshift(newAction)

      // Keep only last 50 actions
      if (this.recentActions.length > 50) {
        this.recentActions = this.recentActions.slice(0, 50)
      }
    },

    // Clear data
    clearActiveAsks() {
      this.activeAsks = []
      this.activeAsksError = null
    },

    clearUserData() {
      this.userAsks = []
      this.userBids = []
      this.askDetails.clear()
      this.balances.clear()
      this.escrowRecords = []
      this.recentActions = []
    },

    // Reset store
    reset() {
      this.$reset()
    },
  },
})

// Helper function for sorting
function getSortValue(ask: AskStatus, sortBy: string): unknown {
  switch (sortBy) {
    case 'price':
      // Extract price from ask features - this would need proper implementation
      return 0
    case 'date':
      return ask.ask_id
    case 'popularity':
      return ask.participants.length
    default:
      return 0
  }
}
