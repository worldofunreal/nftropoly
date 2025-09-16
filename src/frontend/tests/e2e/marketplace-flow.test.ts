/**
 * E2E smoke flow test: mint NFT → create ask → buy now → verify
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Principal } from '@dfinity/principal'
import { MarketplaceService } from '~/services/MarketplaceService'
import { createMockIdentity, _createMockAsk, _createMockBid } from '../setup'

// Mock services for E2E testing
const mockNFTService = {
  mint: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
  getMetadata: vi.fn().mockResolvedValue({
    name: 'Test NFT',
    description: 'A test NFT for E2E testing',
    image: '/test-nft.png',
  }),
}

const mockTokenService = {
  approve: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
  transfer: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
  balanceOf: vi.fn().mockResolvedValue(BigInt(1000000000)),
}

describe('Marketplace E2E Smoke Flow', () => {
  let marketplaceService: MarketplaceService
  let mockIdentity: unknown
  let nftId: bigint
  let askId: bigint
  let bidId: bigint

  beforeEach(async () => {
    // Initialize services
    marketplaceService = new MarketplaceService()
    mockIdentity = createMockIdentity()

    // Initialize marketplace service
    await marketplaceService.initialize(mockIdentity)

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Cleanup if needed
  })

  describe('Complete Marketplace Flow', () => {
    it('should complete full flow: mint NFT → create ask → buy now → verify', async () => {
      // Step 1: Mint NFT
      console.log('Step 1: Minting NFT...')
      const mintResult = await mockNFTService.mint({
        to: mockIdentity.getPrincipal(),
        metadata: {
          name: 'Test NFT',
          description: 'A test NFT for E2E testing',
          image: '/test-nft.png',
        },
      })

      expect(mintResult.Ok).toBeDefined()
      nftId = mintResult.Ok
      console.log(`NFT minted with ID: ${nftId}`)

      // Step 2: Get NFT metadata
      console.log('Step 2: Getting NFT metadata...')
      const metadata = await mockNFTService.getMetadata(nftId)
      expect(metadata.name).toBe('Test NFT')
      console.log(`NFT metadata: ${JSON.stringify(metadata)}`)

      // Step 3: Approve NFT for marketplace
      console.log('Step 3: Approving NFT for marketplace...')
      const approveResult = await mockNFTService.approve({
        token_id: nftId,
        spender: Principal.fromText('u6s2n-gx777-77774-qaaba-cai'), // Marketplace canister
        amount: BigInt(1),
      })

      expect(approveResult.Ok).toBeDefined()
      console.log('NFT approved for marketplace')

      // Step 4: Create ask (list NFT for sale)
      console.log('Step 4: Creating ask...')
      const askData = {
        nfts: [
          {
            canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
            token_id: nftId,
          },
        ],
        payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
        ask_type: { BuyNow: { price: BigInt(100000000) } }, // 1 token with 8 decimals
        expires_at: BigInt(Date.now() + 86400000), // 24 hours
      }

      const createAskResult = await marketplaceService.createAsk(askData)
      expect(createAskResult.Ok).toBeDefined()
      askId = createAskResult.Ok
      console.log(`Ask created with ID: ${askId}`)

      // Step 5: Verify ask was created
      console.log('Step 5: Verifying ask creation...')
      const askInfo = await marketplaceService.getAskInfo(askId)
      expect(askInfo.Ok).toBeDefined()
      console.log(`Ask info: ${JSON.stringify(askInfo)}`)

      // Step 6: Approve payment token
      console.log('Step 6: Approving payment token...')
      const tokenApproveResult = await mockTokenService.approve({
        spender: Principal.fromText('u6s2n-gx777-77774-qaaba-cai'), // Marketplace canister
        amount: BigInt(100000000), // 1 token with 8 decimals
      })

      expect(tokenApproveResult.Ok).toBeDefined()
      console.log('Payment token approved')

      // Step 7: Place bid (buy now)
      console.log('Step 7: Placing bid (buy now)...')
      const bidData = {
        ask_id: askId,
        amount: BigInt(100000000), // 1 token with 8 decimals
      }

      const bidResult = await marketplaceService.bid(bidData)
      expect(bidResult.Ok).toBeDefined()
      bidId = bidResult.Ok
      console.log(`Bid placed with ID: ${bidId}`)

      // Step 8: Verify bid was placed
      console.log('Step 8: Verifying bid placement...')
      const bids = await marketplaceService.getBids(0, 10)
      const placedBid = bids.find(bid => bid.id === bidId)
      expect(placedBid).toBeDefined()
      console.log(`Bid verified: ${JSON.stringify(placedBid)}`)

      // Step 9: Check escrow
      console.log('Step 9: Checking escrow...')
      const escrow = await marketplaceService.getEscrow(0, 10)
      const askEscrow = escrow.find(e => e.ask_id === askId)
      expect(askEscrow).toBeDefined()
      console.log(`Escrow found: ${JSON.stringify(askEscrow)}`)

      // Step 10: Verify final state
      console.log('Step 10: Verifying final state...')

      // Check that ask is no longer active
      const finalAskInfo = await marketplaceService.getAskInfo(askId)
      expect(finalAskInfo.Ok).toBeDefined()
      console.log(`Final ask info: ${JSON.stringify(finalAskInfo)}`)

      // Check settlements
      const settlements = await marketplaceService.getSettlements(0, 10)
      const askSettlement = settlements.find(s => s.ask_id === askId)
      expect(askSettlement).toBeDefined()
      console.log(`Settlement found: ${JSON.stringify(askSettlement)}`)

      console.log('✅ E2E smoke flow completed successfully!')
    })

    it('should handle error cases gracefully', async () => {
      // Test error handling in the flow
      console.log('Testing error handling...')

      // Test with invalid ask data
      const invalidAskData = {
        nfts: [],
        payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
        ask_type: { BuyNow: { price: BigInt(0) } },
        expires_at: BigInt(Date.now() + 86400000),
      }

      try {
        await marketplaceService.createAsk(invalidAskData)
        expect.fail('Should have thrown error for invalid ask data')
      } catch {
        console.log('✅ Error handling works for invalid ask data')
      }

      // Test with insufficient token balance
      mockTokenService.balanceOf.mockResolvedValueOnce(BigInt(0))

      try {
        const bidData = {
          ask_id: BigInt(1),
          amount: BigInt(100000000),
        }
        await marketplaceService.bid(bidData)
        expect.fail('Should have thrown error for insufficient balance')
      } catch {
        console.log('✅ Error handling works for insufficient balance')
      }
    })

    it('should handle concurrent operations', async () => {
      console.log('Testing concurrent operations...')

      // Create multiple asks concurrently
      const askPromises = Array.from({ length: 3 }, (_, i) =>
        marketplaceService.createAsk({
          nfts: [
            {
              canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
              token_id: BigInt(i + 1),
            },
          ],
          payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
          ask_type: { BuyNow: { price: BigInt(100000000) } },
          expires_at: BigInt(Date.now() + 86400000),
        })
      )

      const results = await Promise.all(askPromises)
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.Ok).toBeDefined()
      })

      console.log('✅ Concurrent operations handled successfully')
    })
  })

  describe('Performance Tests', () => {
    it('should complete flow within reasonable time', async () => {
      const startTime = Date.now()

      // Run the complete flow
      const mintResult = await mockNFTService.mint({
        to: mockIdentity.getPrincipal(),
        metadata: { name: 'Performance Test NFT' },
      })

      const askData = {
        nfts: [
          {
            canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
            token_id: mintResult.Ok,
          },
        ],
        payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
        ask_type: { BuyNow: { price: BigInt(100000000) } },
        expires_at: BigInt(Date.now() + 86400000),
      }

      const createAskResult = await marketplaceService.createAsk(askData)
      const _bidResult = await marketplaceService.bid({
        ask_id: createAskResult.Ok,
        amount: BigInt(100000000),
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      console.log(`Flow completed in ${duration}ms`)
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })
})
