/**
 * Unit tests for useMarketplace composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/vue'
import { useMarketplace } from '~/composables/useMarketplace'
import { createMockIdentity, _createMockAsk, _createMockBid } from '../setup'

// Mock the MarketplaceService
vi.mock('~/services/MarketplaceService', () => ({
  MarketplaceService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    getAsks: vi.fn().mockResolvedValue([]),
    getAskInfo: vi.fn().mockResolvedValue({ Ok: createMockAsk() }),
    createAsk: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
    endAsk: vi.fn().mockResolvedValue({ Ok: undefined }),
    bid: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
    getBids: vi.fn().mockResolvedValue([]),
    getEscrow: vi.fn().mockResolvedValue([]),
    getSettlements: vi.fn().mockResolvedValue([]),
    retrySettlement: vi.fn().mockResolvedValue({ Ok: undefined }),
    withdrawEscrow: vi.fn().mockResolvedValue({ Ok: undefined }),
    withdrawSettlement: vi.fn().mockResolvedValue({ Ok: undefined }),
    getBalances: vi.fn().mockResolvedValue([]),
    healthCheck: vi.fn().mockResolvedValue('healthy'),
  })),
}))

describe('useMarketplace', () => {
  let mockIdentity: unknown

  beforeEach(() => {
    mockIdentity = createMockIdentity()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with identity', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      expect(result.current.initialized.value).toBe(true)
    })

    it('should handle initialization error', async () => {
      const { result } = renderHook(() => useMarketplace())

      // Mock service to throw error
      const mockService = vi.mocked(
        await import('~/services/MarketplaceService')
      ).MarketplaceService
      mockService.mockImplementationOnce(() => ({
        initialize: vi
          .fn()
          .mockRejectedValue(new Error('Initialization failed')),
      }))

      await act(async () => {
        try {
          await result.current.initialize(mockIdentity)
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })
    })
  })

  describe('ask management', () => {
    it('should load asks', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
        await result.current.loadAsks()
      })

      expect(result.current.asks.value).toBeDefined()
      expect(Array.isArray(result.current.asks.value)).toBe(true)
    })

    it('should create ask', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      const askData = {
        nfts: [
          {
            canister: 'uqqxf-5h777-77774-qaaaa-cai',
            token_id: BigInt(1),
          },
        ],
        payment_token: 'uzt4z-lp777-77774-qaabq-cai',
        ask_type: 'buynow',
        price: '100',
      }

      await act(async () => {
        const response = await result.current.createAsk(askData)
        expect(response).toBeDefined()
      })
    })

    it('should end ask', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      const askId = BigInt(1)

      await act(async () => {
        const response = await result.current.endAsk(askId)
        expect(response).toBeDefined()
      })
    })
  })

  describe('bid management', () => {
    it('should place bid', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      const bidData = {
        ask_id: BigInt(1),
        amount: '100',
      }

      await act(async () => {
        const response = await result.current.placeBid(bidData)
        expect(response).toBeDefined()
      })
    })

    it('should load bids', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
        await result.current.loadBids()
      })

      expect(result.current.bids.value).toBeDefined()
      expect(Array.isArray(result.current.bids.value)).toBe(true)
    })
  })

  describe('escrow management', () => {
    it('should load escrow', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
        await result.current.loadEscrow()
      })

      expect(result.current.escrow.value).toBeDefined()
      expect(Array.isArray(result.current.escrow.value)).toBe(true)
    })

    it('should retry settlement', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      const askId = BigInt(1)

      await act(async () => {
        const response = await result.current.retrySettlement(askId)
        expect(response).toBeDefined()
      })
    })
  })

  describe('balance management', () => {
    it('should load balances', async () => {
      const { result } = renderHook(() => useMarketplace())

      await act(async () => {
        await result.current.initialize(mockIdentity)
        await result.current.loadBalances()
      })

      expect(result.current.balances.value).toBeDefined()
      expect(Array.isArray(result.current.balances.value)).toBe(true)
    })
  })

  describe('loading states', () => {
    it('should track loading state', async () => {
      const { result } = renderHook(() => useMarketplace())

      expect(result.current.loading.value).toBe(false)

      await act(async () => {
        await result.current.initialize(mockIdentity)
      })

      expect(result.current.loading.value).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle service errors', async () => {
      const { result } = renderHook(() => useMarketplace())

      // Mock service to throw error
      const mockService = vi.mocked(
        await import('~/services/MarketplaceService')
      ).MarketplaceService
      mockService.mockImplementationOnce(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAsks: vi.fn().mockRejectedValue(new Error('Service error')),
      }))

      await act(async () => {
        await result.current.initialize(mockIdentity)
        try {
          await result.current.loadAsks()
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
        }
      })
    })
  })
})
