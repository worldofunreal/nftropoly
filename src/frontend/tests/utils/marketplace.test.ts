/**
 * Unit tests for marketplace utilities
 */

import { describe, it, expect } from 'vitest'
import { Principal } from '@dfinity/principal'
import {
  serializeBigInt,
  deserializeBigInt,
  isAskStatus,
  isEscrowRecord,
  isTokenSpec,
} from '~/utils/marketplace'

describe('marketplace utilities', () => {
  describe('BigInt serialization', () => {
    it('should serialize BigInt to string', () => {
      const value = BigInt(123456789)
      const serialized = serializeBigInt(value)

      expect(serialized).toBe('123456789')
    })

    it('should deserialize string to BigInt', () => {
      const value = '123456789'
      const deserialized = deserializeBigInt(value)

      expect(deserialized).toBe(BigInt(123456789))
    })

    it('should handle zero values', () => {
      const zero = BigInt(0)
      const serialized = serializeBigInt(zero)
      const deserialized = deserializeBigInt(serialized)

      expect(serialized).toBe('0')
      expect(deserialized).toBe(BigInt(0))
    })

    it('should handle large values', () => {
      const largeValue = BigInt('123456789012345678901234567890')
      const serialized = serializeBigInt(largeValue)
      const deserialized = deserializeBigInt(serialized)

      expect(serialized).toBe('123456789012345678901234567890')
      expect(deserialized).toBe(largeValue)
    })

    it('should handle negative values', () => {
      const negativeValue = BigInt(-123456789)
      const serialized = serializeBigInt(negativeValue)
      const deserialized = deserializeBigInt(serialized)

      expect(serialized).toBe('-123456789')
      expect(deserialized).toBe(negativeValue)
    })
  })

  describe('type guards', () => {
    describe('isAskStatus', () => {
      it('should return true for valid AskStatus', () => {
        const validStatus = { Active: null }
        expect(isAskStatus(validStatus)).toBe(true)
      })

      it('should return true for other valid AskStatus variants', () => {
        const validStatus = { Completed: null }
        expect(isAskStatus(validStatus)).toBe(true)
      })

      it('should return false for invalid AskStatus', () => {
        const invalidStatus = { Invalid: null }
        expect(isAskStatus(invalidStatus)).toBe(false)
      })

      it('should return false for non-object values', () => {
        expect(isAskStatus('string')).toBe(false)
        expect(isAskStatus(123)).toBe(false)
        expect(isAskStatus(null)).toBe(false)
        expect(isAskStatus(undefined)).toBe(false)
      })
    })

    describe('isEscrowRecord', () => {
      it('should return true for valid EscrowRecord', () => {
        const validEscrow = {
          ask_id: BigInt(1),
          bid_id: BigInt(1),
          amount: BigInt(100000000),
          created_at: BigInt(Date.now()),
          status: { Pending: null },
        }
        expect(isEscrowRecord(validEscrow)).toBe(true)
      })

      it('should return false for invalid EscrowRecord', () => {
        const invalidEscrow = {
          ask_id: 'not-a-bigint',
          bid_id: BigInt(1),
          amount: BigInt(100000000),
          created_at: BigInt(Date.now()),
          status: { Pending: null },
        }
        expect(isEscrowRecord(invalidEscrow)).toBe(false)
      })

      it('should return false for non-object values', () => {
        expect(isEscrowRecord('string')).toBe(false)
        expect(isEscrowRecord(123)).toBe(false)
        expect(isEscrowRecord(null)).toBe(false)
        expect(isEscrowRecord(undefined)).toBe(false)
      })
    })

    describe('isTokenSpec', () => {
      it('should return true for valid TokenSpec', () => {
        const validTokenSpec = {
          canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
          fee: BigInt(1000),
          decimals: 8,
          symbol: 'NTP',
          name: 'NFTropoly Token',
        }
        expect(isTokenSpec(validTokenSpec)).toBe(true)
      })

      it('should return false for invalid TokenSpec', () => {
        const invalidTokenSpec = {
          canister: 'not-a-principal',
          fee: BigInt(1000),
          decimals: 8,
          symbol: 'NTP',
          name: 'NFTropoly Token',
        }
        expect(isTokenSpec(invalidTokenSpec)).toBe(false)
      })

      it('should return false for non-object values', () => {
        expect(isTokenSpec('string')).toBe(false)
        expect(isTokenSpec(123)).toBe(false)
        expect(isTokenSpec(null)).toBe(false)
        expect(isTokenSpec(undefined)).toBe(false)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty objects in type guards', () => {
      expect(isAskStatus({})).toBe(false)
      expect(isEscrowRecord({})).toBe(false)
      expect(isTokenSpec({})).toBe(false)
    })

    it('should handle objects with extra properties', () => {
      const validStatus = { Active: null, extra: 'property' }
      expect(isAskStatus(validStatus)).toBe(true)
    })

    it('should handle nested objects', () => {
      const complexObject = {
        ask_id: BigInt(1),
        bid_id: BigInt(1),
        amount: BigInt(100000000),
        created_at: BigInt(Date.now()),
        status: { Pending: null },
        metadata: { extra: 'data' },
      }
      expect(isEscrowRecord(complexObject)).toBe(true)
    })
  })
})
