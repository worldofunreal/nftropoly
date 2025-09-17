import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'

// Import the generated TypeScript declarations
import { idlFactory as backendIdlFactory } from '../src/declarations/backend/backend.did.js'
import { idlFactory as tokenIdlFactory } from '../src/declarations/nftropoly_token/nftropoly_token.did.js'
import { idlFactory as nftIdlFactory } from '../src/declarations/nft_collection/nft_collection.did.js'

import type { _SERVICE as BackendService } from '../src/declarations/backend/backend.did.d.ts'
import type { _SERVICE as TokenService } from '../src/declarations/nftropoly_token/nftropoly_token.did.d.ts'
import type { _SERVICE as NFTService } from '../src/declarations/nft_collection/nft_collection.did.d.ts'

// Load canister IDs
import canisterIds from '../src/frontend/canister_ids.json'

const BACKEND_ID = canisterIds.backend.local
const TOKEN_ID = canisterIds.nftropoly_token.local
const NFT_ID = canisterIds.nft_collection.local

console.log('🔍 Testing Mint Flow with TypeScript')
console.log('Backend:', BACKEND_ID)
console.log('Token:', TOKEN_ID)
console.log('NFT:', NFT_ID)

// Generate consistent mnemonic for Alice
const generateMnemonic = (name: string): string => {
  const encoder = new TextEncoder()
  const nameBytes = encoder.encode(name.toLowerCase())
  
  let hash = 0
  for (let i = 0; i < nameBytes.length; i++) {
    const char = nameBytes[i]
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const entropy = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    entropy[i] = (hash >> (i * 8)) & 0xFF
  }
  
  return bip39.entropyToMnemonic(Buffer.from(entropy).toString('hex'))
}

// Generate identity from mnemonic
const generateIdentity = async (mnemonic: string): Promise<{
  identity: Ed25519KeyIdentity
  principal: string
}> => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic)
  const seed = new Uint8Array(seedBuffer.slice(0, 32))
  
  const keyPair = nacl.sign.keyPair.fromSeed(seed)
  const identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey)
  
  return {
    identity,
    principal: (identity as any).getPrincipal().toText()
  }
}

// Create actors
const createActors = async (identity: Ed25519KeyIdentity) => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943', // Local dfx
    identity: identity as any
  })
  
  // Fetch root key for local development
  await agent.fetchRootKey()
  
  const backendActor = Actor.createActor(backendIdlFactory, {
    agent,
    canisterId: BACKEND_ID
  }) as BackendService
  
  const tokenActor = Actor.createActor(tokenIdlFactory, {
    agent,
    canisterId: TOKEN_ID
  }) as TokenService
  
  const nftActor = Actor.createActor(nftIdlFactory, {
    agent,
    canisterId: NFT_ID
  }) as NFTService
  
  return { backendActor, tokenActor, nftActor }
}

// Main test function
const testMintFlow = async (): Promise<void> => {
  try {
    console.log('\n🎯 Starting Mint Flow Test\n')
    
    // Generate Alice identity
    const aliceMnemonic = generateMnemonic('Alice')
    const alice = await generateIdentity(aliceMnemonic)
    console.log('Alice Principal:', alice.principal)
    
    // Create actors
    const { backendActor, tokenActor, nftActor } = await createActors(alice.identity)
    
    // Step 1: Register Alice in backend
    console.log('\n👤 Step 1: Register Alice in backend')
    try {
      const signupResult = await backendActor.signup(
        'alice_test',  // username
        [],           // evm_address
        [],           // bitcoin_address  
        []            // solana_address
      )
      
      if ('Ok' in signupResult) {
        console.log('✅ Alice registered successfully!')
        console.log('User profile:', signupResult.Ok)
      } else {
        console.log('❌ Signup failed:', signupResult.Err)
        if (signupResult.Err && ('UsernameTaken' in signupResult.Err || 'InvalidInput' in signupResult.Err)) {
          console.log('✅ User already exists, continuing...')
        } else {
          return
        }
      }
    } catch (error) {
      console.log('❌ Signup error:', error)
      return
    }

    // Step 2: Check token balance and fee
    console.log('\n💰 Step 2: Check Alice token balance and transfer fee')
    try {
      const balance = await tokenActor.icrc1_balance_of({
        owner: Principal.fromText(alice.principal),
        subaccount: []
      })
      console.log('Alice token balance:', balance.toString())
      
      const fee = await tokenActor.icrc1_fee()
      console.log('Token transfer fee:', fee.toString())
    } catch (error) {
      console.log('Failed to get balance/fee:', error)
    }
    
    // Step 3: Approve tokens for backend
    console.log('\n🔐 Step 3: Approve tokens for backend')
    try {
      const approveResult = await tokenActor.icrc2_approve({
        from_subaccount: [],
        spender: {
          owner: Principal.fromText(BACKEND_ID),
          subaccount: []
        },
        amount: BigInt(10_000_000_000 + 10000), // 100 tokens + fee (10000)
        expected_allowance: [],
        expires_at: [],
        fee: [],
        memo: [],
        created_at_time: []
      })
      
      console.log('Approval result:', approveResult)
      
      if ('Ok' in approveResult) {
        console.log('✅ Tokens approved successfully!')
      } else {
        console.log('❌ Approval failed:', approveResult.Err)
        return
      }
    } catch (error) {
      console.log('❌ Approval error:', error)
      return
    }
    
    // Step 4: Check allowance
    console.log('\n🔍 Step 4: Check allowance')
    try {
      const allowance = await tokenActor.icrc2_allowance({
        account: {
          owner: Principal.fromText(alice.principal),
          subaccount: []
        },
        spender: {
          owner: Principal.fromText(BACKEND_ID),
          subaccount: []
        }
      })
      console.log('Allowance:', allowance.allowance.toString())
    } catch (error) {
      console.log('Failed to check allowance:', error)
    }
    
    // Step 5: Call backend mint_on_behalf
    console.log('\n🎨 Step 5: Call backend mint_on_behalf')
    try {
      const mintResult = await backendActor.mint_on_behalf(
        'Test NFT TypeScript',           // token_name
        ['Test Description'],            // token_description (optional)
        ['https://example.com/nft.json'], // token_image_url (optional)
        [[['trait', 'awesome']]],        // token_attributes (optional)
        BigInt(10_000_000_000)           // mint_price (100 tokens)
      )
      
      console.log('Mint result:', mintResult)
      
      if ('Ok' in mintResult) {
        console.log('🎉 NFT minted successfully! Token ID:', mintResult.Ok.toString())
        
        // Step 6: Check NFT ownership
        console.log('\n🔍 Step 6: Check NFT ownership')
        try {
          const tokens = await nftActor.icrc7_tokens_of({
            owner: Principal.fromText(alice.principal),
            subaccount: []
          }, [], [])
          
          console.log('Alice owns NFT tokens:', tokens.map(t => t.toString()))
        } catch (error) {
          console.log('Failed to check NFT ownership:', error)
        }
        
      } else {
        console.log('❌ Mint failed:', mintResult.Err)
      }
    } catch (error) {
      console.log('❌ Mint error:', error)
    }
    
    console.log('\n✅ Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testMintFlow().catch(console.error)
