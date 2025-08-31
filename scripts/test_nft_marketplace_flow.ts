import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'
import { Keypair } from '@solana/web3.js'

// Import the generated TypeScript declarations
import { idlFactory as nftIdlFactory } from '../src/declarations/nft_collection/nft_collection.did.js'
import type { _SERVICE as NFTService } from '../src/declarations/nft_collection/nft_collection.did.d.ts'
import { idlFactory as marketplaceIdlFactory } from '../src/declarations/marketplace/marketplace.did.js'
import type { _SERVICE as MarketplaceService, TokenSpec, AskFeature, ManageAskRequest } from '../src/declarations/marketplace/marketplace.did.d.ts'
import { idlFactory as tokenIdlFactory } from '../src/declarations/nftropoly_token/nftropoly_token.did.js'
import type { _SERVICE as TokenService } from '../src/declarations/nftropoly_token/nftropoly_token.did.d.ts'

// Canister IDs
const CANISTER_IDS = {
  nftCollection: 'uqqxf-5h777-77774-qaaaa-cai',
  marketplace: 'u6s2n-gx777-77774-qaaba-cai',
  nftropolyToken: 'uzt4z-lp777-77774-qaabq-cai'
} as const

// Generate consistent identity for Alice (same as deploy script)
const generateAliceIdentity = async (): Promise<Ed25519KeyIdentity> => {
  // Use the same mnemonic generation as test_marketplace.ts
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
  
  const mnemonic = generateMnemonic('Alice')
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic)
  const seed = new Uint8Array(seedBuffer.slice(0, 32))
  
  const keyPair = nacl.sign.keyPair.fromSeed(seed)
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey)
}

// Create actors
const createNFTActor = async (identity: Ed25519KeyIdentity): Promise<NFTService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  
  return Actor.createActor(nftIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.nftCollection
  })
}

const createMarketplaceActor = async (identity: Ed25519KeyIdentity): Promise<MarketplaceService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  
  return Actor.createActor(marketplaceIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.marketplace
  })
}

const createTokenActor = async (identity: Ed25519KeyIdentity): Promise<TokenService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  
  return Actor.createActor(tokenIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.nftropolyToken
  })
}

// Helper function to serialize BigInt in JSON
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))
}

const testNFTMarketplaceFlow = async (): Promise<void> => {
  console.log('🚀 Testing Complete NFT Marketplace Flow')
  console.log('='.repeat(60))
  
  // Generate Alice's identity
  const aliceIdentity = await generateAliceIdentity()
  const alicePrincipal = aliceIdentity.getPrincipal().toText()
  console.log(`👤 Alice Principal: ${alicePrincipal}`)
  
  // Create actors
  const aliceNFT = await createNFTActor(aliceIdentity)
  const aliceMarketplace = await createMarketplaceActor(aliceIdentity)
  const aliceToken = await createTokenActor(aliceIdentity)
  
  const aliceAccount = { owner: Principal.fromText(alicePrincipal), subaccount: [] }
  const marketplaceAccount = { owner: Principal.fromText(CANISTER_IDS.marketplace), subaccount: [] }
  
  try {
    // Step 1: Check Alice's current NFT ownership
    console.log('\n📋 Step 1: Checking Alice\'s NFT Ownership')
    console.log('-'.repeat(40))
    
    const aliceTokens = await aliceNFT.icrc7_tokens_of(aliceAccount, [], [])
    console.log(`   Alice owns ${aliceTokens.length} NFTs`)
    
         if (aliceTokens.length === 0) {
       console.log('   ❌ Alice has no NFTs to sell. Creating one first...')
       
       // Mint an NFT for Alice
       const mintResult = await aliceNFT.mint({
         token_metadata_url: "https://example.com/metadata/marketplace-test.json",
         memo: [],
         token_owner: aliceAccount,
         token_name: "Marketplace Test NFT"
       })
       
       if ('Ok' in mintResult) {
         console.log(`   ✅ Minted NFT with ID: ${mintResult.Ok}`)
         // Update the token list
         const newTokens = await aliceNFT.icrc7_tokens_of(aliceAccount, [], [])
         console.log(`   Alice now owns ${newTokens.length} NFTs`)
       } else {
         console.log(`   ❌ Failed to mint NFT: ${JSON.stringify(serializeBigInt(mintResult), null, 2)}`)
         return
       }
            } else {
         // Check if Alice has NFT ID 1 (which the marketplace expects)
         const hasNFT1 = aliceTokens.some((token: bigint) => token === BigInt(1))
         if (!hasNFT1) {
           console.log('   ℹ️ Alice has NFTs but not ID 1. The marketplace is hardcoded to use token ID 1.')
           console.log('   Current NFTs:', aliceTokens.map((t: bigint) => t.toString()).join(', '))
           console.log('   For this test, we\'ll use the first available NFT and update the marketplace code later.')
         }
       }
    
    // Get the first NFT ID
    const aliceTokensUpdated = await aliceNFT.icrc7_tokens_of(aliceAccount, [], [])
    const nftId = aliceTokensUpdated[0]
    console.log(`   Using NFT ID: ${nftId}`)
    
    // Step 2: Alice approves marketplace to transfer her NFT
    console.log('\n📋 Step 2: Alice Approves Marketplace for NFT Transfer')
    console.log('-'.repeat(40))
    
    const approveResult = await aliceNFT.icrc37_approve_tokens([{
      token_id: nftId,
      approval_info: {
        spender: marketplaceAccount,
        expires_at: [],
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: BigInt(Date.now() * 1000000)
      }
    }])
    
    if ('Ok' in approveResult) {
      console.log('   ✅ Marketplace approval successful!')
      
      // Check the approval
      const approvals = await aliceNFT.icrc37_get_token_approvals(nftId, [], [])
      console.log(`   Approvals: ${JSON.stringify(serializeBigInt(approvals), null, 2)}`)
    } else {
      console.log(`   ❌ Approval failed: ${JSON.stringify(serializeBigInt(approveResult), null, 2)}`)
      return
    }
    
    // Step 3: Alice creates an ask on the marketplace
    console.log('\n📋 Step 3: Alice Creates Ask on Marketplace')
    console.log('-'.repeat(40))
    
    // Create TokenSpec for the NFT with ICRC-37 details including token ID
    // The marketplace expects Option<u64> which corresponds to opt nat in Candid
    const nftTokenSpec: TokenSpec = {
      standards: [{ 
        ICRC37: [{ 
          approval_fee: [], 
          transfer_from_fee: [], 
          token_id: [BigInt(nftId.toString())] 
        }] 
      }],
      canister: Principal.fromText(CANISTER_IDS.nftCollection),
      symbol: 'NFT'
    }
    
    // Create TokenSpec for the payment token (NTRP) with ICRC-1 details
    const ntrpTokenSpec: TokenSpec = {
      standards: [{ 
        ICRC1: [{ 
          amount: BigInt(5000000000), // 50 NTRP tokens
          fee: [BigInt(10000)], 
          decimals: 8 
        }] 
      }],
      canister: Principal.fromText(CANISTER_IDS.nftropolyToken),
      symbol: 'NTRP'
    }
    
    // Create AskToken feature (the NFT being sold)
    const askTokenFeature: AskFeature = {
      AskToken: [[nftTokenSpec]]
    }
    
    // Create BuyNow feature (the payment token and amount)
    const buyNowFeature: AskFeature = {
      BuyNow: [[{
        token: ntrpTokenSpec,
        amount: BigInt(5000000000) // 50 NTRP tokens
      }]]
    }
    
    // Create the ask request
    const askRequest: ManageAskRequest = {
      NewAsk: [[askTokenFeature], [buyNowFeature]]
    }
    
    console.log('   Creating ask for NFT with BuyNow price of 50 NTRP...')
    
    const askResult = await aliceMarketplace.icrc8_ask([[askRequest]])
    console.log(`   Ask Result: ${JSON.stringify(serializeBigInt(askResult), null, 2)}`)
    
    // Step 4: Verify the NFT was transferred to marketplace escrow
    console.log('\n📋 Step 4: Verifying NFT Transfer to Marketplace Escrow')
    console.log('-'.repeat(40))
    
    // Check Alice's NFT ownership
    const aliceTokensAfterAsk = await aliceNFT.icrc7_tokens_of(aliceAccount, [], [])
    console.log(`   Alice's NFTs after ask: ${aliceTokensAfterAsk.length}`)
    
    // Check marketplace's NFT ownership
    const marketplaceTokens = await aliceNFT.icrc7_tokens_of(marketplaceAccount, [], [])
    console.log(`   Marketplace's NFTs: ${marketplaceTokens.length}`)
    
    if (marketplaceTokens.length > 0) {
      console.log(`   ✅ NFT successfully transferred to marketplace escrow!`)
      console.log(`   Marketplace now owns NFT ID: ${marketplaceTokens[0]}`)
    } else {
      console.log(`   ❌ NFT was not transferred to marketplace`)
    }
    
    // Step 5: Check marketplace escrow
    console.log('\n📋 Step 5: Checking Marketplace Escrow')
    console.log('-'.repeat(40))
    
    // Get marketplace balance info
    const marketplaceBalanceRequest = { Escrow: [] }
    const marketplaceBalanceResult = await aliceMarketplace.icrc8_balance_of([{
      owner: Principal.fromText(CANISTER_IDS.marketplace),
      subaccount: []
    }, [[marketplaceBalanceRequest]]])
    console.log(`   Marketplace Escrow: ${JSON.stringify(serializeBigInt(marketplaceBalanceResult), null, 2)}`)
    
    console.log('\n🎉 NFT Marketplace Flow Test Completed!')
    
  } catch (error) {
    console.log(`❌ Test error: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

// Run the test
testNFTMarketplaceFlow().catch(console.error)
