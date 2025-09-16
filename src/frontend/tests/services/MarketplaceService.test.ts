/**
 * Unit tests for MarketplaceService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Principal } from '@dfinity/principal'
import { MarketplaceService } from '~/services/MarketplaceService'
import { createMockIdentity, _createMockAsk, _createMockBid } from '../setup'

describe('MarketplaceService', () => {
  let service: MarketplaceService
  let mockIdentity: unknown

  beforeEach(() => {
    service = new MarketplaceService()
    mockIdentity = createMockIdentity()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with identity', async () => {
      await service.initialize(mockIdentity)

      expect(service).toBeDefined()
      // Additional assertions would depend on the service implementation
    })

    it('should throw error when no identity provided', async () => {
      await expect(service.initialize()).rejects.toThrow(
        'No identity available'
      )
    })
  })

  describe('health check', () => {
    it('should return health status', async () => {
      await service.initialize(mockIdentity)
      const result = await service.healthCheck()

      expect(result).toBe('healthy')
    })

    it('should throw error when not initialized', async () => {
      await expect(service.healthCheck()).rejects.toThrow()
    })
  })

  describe('ask management', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should get asks', async () => {
      const result = await service.getAsks(0, 10)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should get ask info', async () => {
      const askId = BigInt(1)
      const result = await service.getAskInfo(askId)

      expect(result).toBeDefined()
    })

    it('should create ask', async () => {
      const askData = {
        nfts: [
          {
            canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
            token_id: BigInt(1),
          },
        ],
        payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
        ask_type: { BuyNow: { price: BigInt(100000000) } },
        expires_at: BigInt(Date.now() + 86400000),
      }

      const result = await service.createAsk(askData)

      expect(result).toBeDefined()
    })

    it('should end ask', async () => {
      const askId = BigInt(1)
      const result = await service.endAsk(askId)

      expect(result).toBeDefined()
    })
  })

  describe('bid management', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should place bid', async () => {
      const bidData = {
        ask_id: BigInt(1),
        amount: BigInt(100000000),
      }

      const result = await service.bid(bidData)

      expect(result).toBeDefined()
    })

    it('should get bids', async () => {
      const result = await service.getBids(0, 10)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('escrow management', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should get escrow', async () => {
      const result = await service.getEscrow(0, 10)

      expect(Array.isArray(result)).toBe(true)
    })

    it('should retry settlement', async () => {
      const askId = BigInt(1)
      const result = await service.retrySettlement(askId)

      expect(result).toBeDefined()
    })

    it('should withdraw escrow', async () => {
      const escrowRecord = createMockEscrow()
      const result = await service.withdrawEscrow(escrowRecord)

      expect(result).toBeDefined()
    })

    it('should withdraw settlement', async () => {
      const escrowRecord = createMockEscrow()
      const result = await service.withdrawSettlement(escrowRecord)

      expect(result).toBeDefined()
    })
  })

  describe('balance management', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should get balances', async () => {
      const result = await service.getBalances()

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('metadata management', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should get metadata', async () => {
      const result = await service.getMetadata()

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('standards support', () => {
    beforeEach(async () => {
      await service.initialize(mockIdentity)
    })

    it('should get supported standards', async () => {
      const result = await service.getSupportedStandards()

      expect(Array.isArray(result)).toBe(true)
    })
  })
})
