import { ref, computed } from 'vue'

export interface PaginationConfig {
  pageSize: number
  maxPages?: number
  loadMore?: boolean
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
  loading: boolean
  error: string | null
}

export const usePagination = (config: PaginationConfig = { pageSize: 20 }) => {
  const state = ref<PaginationState>({
    page: 1,
    pageSize: config.pageSize,
    total: 0,
    hasMore: false,
    loading: false,
    error: null,
  })

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(state.value.total / state.value.pageSize)
  })

  const canGoNext = computed(() => {
    return state.value.page < totalPages.value && state.value.hasMore
  })

  const canGoPrev = computed(() => {
    return state.value.page > 1
  })

  const startIndex = computed(() => {
    return (state.value.page - 1) * state.value.pageSize
  })

  const endIndex = computed(() => {
    return Math.min(startIndex.value + state.value.pageSize, state.value.total)
  })

  const pageInfo = computed(() => {
    return {
      start: startIndex.value + 1,
      end: endIndex.value,
      total: state.value.total,
      page: state.value.page,
      totalPages: totalPages.value,
    }
  })

  // Actions
  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      state.value.page = page
      state.value.error = null
    }
  }

  const nextPage = () => {
    if (canGoNext.value) {
      setPage(state.value.page + 1)
    }
  }

  const prevPage = () => {
    if (canGoPrev.value) {
      setPage(state.value.page - 1)
    }
  }

  const firstPage = () => {
    setPage(1)
  }

  const lastPage = () => {
    setPage(totalPages.value)
  }

  const setPageSize = (pageSize: number) => {
    if (pageSize > 0) {
      state.value.pageSize = pageSize
      state.value.page = 1 // Reset to first page
      state.value.error = null
    }
  }

  const setTotal = (total: number) => {
    state.value.total = total
    state.value.error = null

    // Adjust current page if it's beyond the total pages
    if (state.value.page > totalPages.value && totalPages.value > 0) {
      state.value.page = totalPages.value
    }
  }

  const setHasMore = (hasMore: boolean) => {
    state.value.hasMore = hasMore
  }

  const setLoading = (loading: boolean) => {
    state.value.loading = loading
    if (loading) {
      state.value.error = null
    }
  }

  const setError = (error: string | null) => {
    state.value.error = error
    state.value.loading = false
  }

  const reset = () => {
    state.value = {
      page: 1,
      pageSize: config.pageSize,
      total: 0,
      hasMore: false,
      loading: false,
      error: null,
    }
  }

  // Load more functionality for infinite scroll
  const loadMore = () => {
    if (canGoNext.value && !state.value.loading) {
      nextPage()
    }
  }

  // Generate page numbers for pagination component
  const getPageNumbers = (maxVisible: number = 5) => {
    const pages: number[] = []
    const current = state.value.page
    const total = totalPages.value

    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Calculate start and end pages
      let start = Math.max(1, current - Math.floor(maxVisible / 2))
      const end = Math.min(total, start + maxVisible - 1)

      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      // Add pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  // Create pagination object for API calls
  const createPaginationParams = (
    direction: 'next' | 'prev' | 'current' = 'current'
  ) => {
    switch (direction) {
      case 'next':
        return {
          prev: state.value.page > 1 ? BigInt(state.value.page - 1) : undefined,
          take: BigInt(state.value.pageSize),
        }
      case 'prev':
        return {
          prev: state.value.page > 2 ? BigInt(state.value.page - 2) : undefined,
          take: BigInt(state.value.pageSize),
        }
      case 'current':
      default:
        return {
          prev: state.value.page > 1 ? BigInt(state.value.page - 1) : undefined,
          take: BigInt(state.value.pageSize),
        }
    }
  }

  return {
    // State
    state: readonly(state),
    totalPages,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
    pageInfo,

    // Actions
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    setTotal,
    setHasMore,
    setLoading,
    setError,
    reset,
    loadMore,
    getPageNumbers,
    createPaginationParams,
  }
}

// Specialized pagination for marketplace asks
export const useAskPagination = (
  config: PaginationConfig = { pageSize: 20 }
) => {
  const pagination = usePagination(config)

  // Marketplace-specific pagination logic
  const loadPage = async (
    page: number,
    loadFn: (pagination: unknown) => Promise<unknown>
  ) => {
    try {
      pagination.setLoading(true)
      pagination.setPage(page)

      const params = pagination.createPaginationParams()
      const result = await loadFn(params)

      // Update pagination state based on result
      if (result && typeof result === 'object') {
        if ('eof' in result) {
          pagination.setHasMore(!result.eof)
        }
        if ('count' in result) {
          pagination.setTotal(Number(result.count))
        }
      }

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load page'
      pagination.setError(errorMessage)
      throw error
    } finally {
      pagination.setLoading(false)
    }
  }

  return {
    ...pagination,
    loadPage,
  }
}

// Specialized pagination for balances
export const useBalancePagination = (
  config: PaginationConfig = { pageSize: 50 }
) => {
  const pagination = usePagination(config)

  // Balance-specific pagination logic
  const loadBalances = async (
    loadFn: (pagination: unknown) => Promise<unknown>
  ) => {
    try {
      pagination.setLoading(true)

      const params = pagination.createPaginationParams()
      const result = await loadFn(params)

      // Update pagination state based on result
      if (result && typeof result === 'object') {
        if ('eof' in result) {
          pagination.setHasMore(!result.eof)
        }
        if ('count' in result) {
          pagination.setTotal(Number(result.count))
        }
      }

      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load balances'
      pagination.setError(errorMessage)
      throw error
    } finally {
      pagination.setLoading(false)
    }
  }

  return {
    ...pagination,
    loadBalances,
  }
}
