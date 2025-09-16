/**
 * Test setup for marketplace unit tests
 */

import { vi } from 'vitest'
import { Principal } from '@dfinity/principal'

// Mock @dfinity/agent
vi.mock('@dfinity/agent', () => ({
  HttpAgent: vi.fn().mockImplementation(() => ({
    fetchRootKey: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockResolvedValue({ Ok: 'success' }),
    query: vi.fn().mockResolvedValue({ Ok: 'success' }),
  })),
  Actor: {
    createActor: vi.fn().mockReturnValue({
      health_check: vi.fn().mockResolvedValue('healthy'),
      get_asks: vi.fn().mockResolvedValue([]),
      get_ask_info: vi.fn().mockResolvedValue({ Ok: { id: BigInt(1) } }),
      create_ask: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
      end_ask: vi.fn().mockResolvedValue({ Ok: undefined }),
      bid: vi.fn().mockResolvedValue({ Ok: BigInt(1) }),
      get_bids: vi.fn().mockResolvedValue([]),
      get_escrow: vi.fn().mockResolvedValue([]),
      get_settlements: vi.fn().mockResolvedValue([]),
      retry_settlement: vi.fn().mockResolvedValue({ Ok: undefined }),
      withdraw_escrow: vi.fn().mockResolvedValue({ Ok: undefined }),
      withdraw_settlement: vi.fn().mockResolvedValue({ Ok: undefined }),
      get_balances: vi.fn().mockResolvedValue([]),
      get_metadata: vi.fn().mockResolvedValue([]),
      get_supported_standards: vi.fn().mockResolvedValue([]),
    }),
  },
  Identity: vi.fn().mockImplementation(() => ({
    getPrincipal: vi
      .fn()
      .mockReturnValue(Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai')),
    sign: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  })),
}))

// Mock @dfinity/principal
vi.mock('@dfinity/principal', () => ({
  Principal: {
    fromText: vi.fn().mockImplementation((text: string) => ({
      toText: () => text,
      toUint8Array: () => new Uint8Array(0),
    })),
    anonymous: vi.fn().mockReturnValue({
      toText: () => '2vxsx-fae',
      toUint8Array: () => new Uint8Array(0),
    }),
  },
}))

// Mock fetch for canister ID resolution
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () =>
    Promise.resolve({
      nftCollection: 'uqqxf-5h777-77774-qaaaa-cai',
      marketplace: 'u6s2n-gx777-77774-qaaba-cai',
      nftropolyToken: 'uzt4z-lp777-77774-qaabq-cai',
      backend: 'bhhab-xyaaa-aaaap-qqchq-cai',
    }),
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock BigInt serialization
export const mockBigIntSerialization = {
  serialize: (value: bigint) => value.toString(),
  deserialize: (value: string) => BigInt(value),
}

// Mock Principal serialization
export const mockPrincipalSerialization = {
  serialize: (principal: Principal) => principal.toText(),
  deserialize: (text: string) => Principal.fromText(text),
}

// Test utilities
export const createMockIdentity = (
  principalText: string = 'rdmx6-jaaaa-aaaah-qcaiq-cai'
) => ({
  getPrincipal: () => Principal.fromText(principalText),
  sign: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
})

export const createMockAsk = (overrides: unknown = {}) => ({
  id: BigInt(1),
  seller: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
  nfts: [
    {
      canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
      token_id: BigInt(1),
    },
  ],
  payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
  ask_type: { BuyNow: { price: BigInt(100000000) } },
  status: { Active: null },
  created_at: BigInt(Date.now()),
  expires_at: BigInt(Date.now() + 86400000),
  ...overrides,
})

export const createMockBid = (overrides: unknown = {}) => ({
  id: BigInt(1),
  ask_id: BigInt(1),
  bidder: Principal.fromText('rdmx6-jaaaa-aaaah-qcaiq-cai'),
  amount: BigInt(100000000),
  created_at: BigInt(Date.now()),
  status: { Active: null },
  ...overrides,
})

export const createMockEscrow = (overrides: unknown = {}) => ({
  ask_id: BigInt(1),
  bid_id: BigInt(1),
  amount: BigInt(100000000),
  created_at: BigInt(Date.now()),
  status: { Pending: null },
  ...overrides,
})

export const createMockSettlement = (overrides: unknown = {}) => ({
  ask_id: BigInt(1),
  bid_id: BigInt(1),
  amount: BigInt(100000000),
  created_at: BigInt(Date.now()),
  status: { Completed: null },
  ...overrides,
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NFT_COLLECTION_CANISTER_ID = 'uqqxf-5h777-77774-qaaaa-cai'
process.env.MARKETPLACE_CANISTER_ID = 'u6s2n-gx777-77774-qaaba-cai'
process.env.NFTROPOLY_TOKEN_CANISTER_ID = 'uzt4z-lp777-77774-qaabq-cai'
process.env.BACKEND_CANISTER_ID = 'bhhab-xyaaa-aaaap-qqchq-cai'
