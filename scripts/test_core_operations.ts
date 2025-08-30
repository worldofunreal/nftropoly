import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'

// Import the generated TypeScript declarations
import { idlFactory as marketplaceIdlFactory } from '../src/declarations/marketplace/marketplace.did.js'
import type { _SERVICE as MarketplaceService, TokenSpec, AskFeature, ManageAskRequest, ManageBidRequest, NewBidRequest, BidFeature } from '../src/declarations/marketplace/marketplace.did.d.ts'

// Canister IDs
const CANISTER_IDS = {
  nftCollection: 'uqqxf-5h777-77774-qaaaa-cai',
  marketplace: 'u6s2n-gx777-77774-qaaba-cai',
  nftropolyToken: 'uzt4z-lp777-77774-qaabq-cai'
} as const

// Generate consistent mnemonics based on name
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

// Identity generation utilities
const generateIdentity = async (mnemonic: string): Promise<Ed25519KeyIdentity> => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic)
  const seed = new Uint8Array(seedBuffer.slice(0, 32))
  
  const keyPair = nacl.sign.keyPair.fromSeed(seed)
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey)
}

// Create marketplace actor
const createMarketplaceActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<MarketplaceService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  return Actor.createActor(marketplaceIdlFactory, { agent, canisterId })
}

// Helper function to serialize BigInt in JSON
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))
}

// Test 1: Seller creates ask
const testSellerCreatesAsk = async (): Promise<{ success: boolean; askId?: string; error?: string }> => {
  console.log('\n🧪 Test 1: Seller Creates Ask')
  console.log('='.repeat(40))
  
  const aliceMnemonic = generateMnemonic('Alice')
  const aliceIdentity = await generateIdentity(aliceMnemonic)
  const aliceMarketplace = await createMarketplaceActor(aliceIdentity, CANISTER_IDS.marketplace)
  
  // Create TokenSpec for the NFT being sold (ICRC7 NFT)
  const nftTokenSpec: TokenSpec = {
    standards: [{ ICRC7: [] }],
    canister: Principal.fromText(CANISTER_IDS.nftCollection),
    symbol: 'NFT'
  }
  
  // Create TokenSpec for NTRP payment
  const ntrpTokenSpec: TokenSpec = {
    standards: [{ ICRC1: [] }],
    canister: Principal.fromText(CANISTER_IDS.nftropolyToken),
    symbol: 'NTRP'
  }
  
  // Create AskToken feature (the NFT being sold)
  const askTokenFeature: AskFeature = {
    AskToken: [[nftTokenSpec]]
  }
  
  // Create BuyNow feature (payment terms)
  const buyNowFeature: AskFeature = {
    BuyNow: [[{
      token: ntrpTokenSpec,
      amount: BigInt(1000000000) // 10 NTRP tokens
    }]]
  }
  
  // Create ask request with BOTH AskToken and BuyNow features
  // Following the TypeScript declarations: Array<[] | [AskFeature]> 
  // Each AskFeature must be wrapped in an array to represent Some(AskFeature)
  const askRequest: ManageAskRequest = {
    NewAsk: [[askTokenFeature], [buyNowFeature]]
  }
  
  console.log('   Creating ask with proper structure...')
  console.log(`   AskToken: ${JSON.stringify(serializeBigInt(askTokenFeature), null, 2)}`)
  console.log(`   BuyNow: ${JSON.stringify(serializeBigInt(buyNowFeature), null, 2)}`)
  
  try {
    const response = await aliceMarketplace.icrc8_ask([[askRequest]])
    console.log(`   ✅ SUCCESS! Ask created successfully!`)
    console.log(`   Response: ${JSON.stringify(serializeBigInt(response), null, 2)}`)
    
    // Parse the response to extract ask_id
    if (Array.isArray(response) && response.length > 0) {
      const firstResponse = response[0]
      if (Array.isArray(firstResponse) && firstResponse.length >= 2) {
        const manageAskResponse = firstResponse[1]
        if (Array.isArray(manageAskResponse) && manageAskResponse.length > 0) {
          const responseData = manageAskResponse[0]
          
          if (responseData && typeof responseData === 'object' && 'NewAsk' in responseData) {
            const newAskData = responseData.NewAsk
            
            if (newAskData && typeof newAskData === 'object' && 'Ok' in newAskData) {
              const okData = newAskData.Ok
              if (okData && typeof okData === 'object' && 'ask_id' in okData) {
                const askId = okData.ask_id.toString()
                console.log(`   Extracted ask_id: ${askId}`)
                return { success: true, askId }
              }
            } else if (newAskData && typeof newAskData === 'object' && 'Err' in newAskData) {
              const errData = newAskData.Err
              return { success: false, error: `Ask creation failed: ${JSON.stringify(errData)}` }
            }
          }
        }
      }
    }
    
    return { success: true } // Success but couldn't parse ask_id
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`   ❌ FAILED: ${errorMessage}`)
    console.log(`   Error type: ${typeof error}`)
    console.log(`   Error constructor: ${error?.constructor?.name}`)
    if (error instanceof Error) {
      console.log(`   Error stack: ${error.stack}`)
    }
    console.log(`   Full error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2)}`)
    return { success: false, error: errorMessage }
  }
}

// Test 2: Buyer purchases the ask
const testBuyerPurchasesAsk = async (askId: string): Promise<{ success: boolean; error?: string }> => {
  console.log('\n🧪 Test 2: Buyer Purchases Ask')
  console.log('='.repeat(40))
  
  const bobMnemonic = generateMnemonic('Bob')
  const bobIdentity = await generateIdentity(bobMnemonic)
  const bobMarketplace = await createMarketplaceActor(bobIdentity, CANISTER_IDS.marketplace)
  
  // Create TokenSpec for NTRP payment
  const ntrpTokenSpec: TokenSpec = {
    standards: [{ ICRC1: [] }],
    canister: Principal.fromText(CANISTER_IDS.nftropolyToken),
    symbol: 'NTRP'
  }
  
  // Create BidFeature for payment
  const bidFeature: BidFeature = {
    BuyNow: [[{
      token: ntrpTokenSpec,
      amount: BigInt(1000000000) // 10 NTRP tokens
    }]]
  }
  
  // Create bid request
  const newBidRequest: NewBidRequest = {
    ask_id: BigInt(askId),
    feature: [
      { Some: bidFeature }
    ]
  }
  
  const bidRequest: ManageBidRequest = {
    NewBid: newBidRequest
  }
  
  console.log(`   Purchasing ask ${askId}...`)
  console.log(`   BidFeature: ${JSON.stringify(serializeBigInt(bidFeature), null, 2)}`)
  
  try {
    const response = await bobMarketplace.icrc8_bid([[bidRequest]])
    console.log(`   ✅ SUCCESS! Purchase completed successfully!`)
    console.log(`   Response: ${JSON.stringify(serializeBigInt(response), null, 2)}`)
    return { success: true }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log(`   ❌ FAILED: ${errorMessage}`)
    return { success: false, error: errorMessage }
  }
}

// Main test runner
const testCoreOperations = async (): Promise<void> => {
  console.log('🚀 Testing Core Marketplace Operations\n')
  
  console.log(`📡 Canister IDs:`)
  console.log(`   NFT Collection: ${CANISTER_IDS.nftCollection}`)
  console.log(`   Marketplace: ${CANISTER_IDS.marketplace}`)
  console.log(`   NFTropoly Token: ${CANISTER_IDS.nftropolyToken}\n`)
  
  // Test 1: Seller creates ask
  const askResult = await testSellerCreatesAsk()
  
  if (!askResult.success) {
    console.log(`\n❌ Test 1 FAILED: ${askResult.error}`)
    return
  }
  
  if (!askResult.askId) {
    console.log(`\n❌ Test 1 FAILED: Could not extract ask_id from response`)
    return
  }
  
  console.log(`\n✅ Test 1 PASSED: Ask created with ID ${askResult.askId}`)
  
  // Test 2: Buyer purchases the ask
  const purchaseResult = await testBuyerPurchasesAsk(askResult.askId)
  
  if (!purchaseResult.success) {
    console.log(`\n❌ Test 2 FAILED: ${purchaseResult.error}`)
    return
  }
  
  console.log(`\n✅ Test 2 PASSED: Purchase completed successfully`)
  console.log(`\n🎉 ALL CORE OPERATIONS SUCCESSFUL!`)
  console.log(`   ✅ Seller created ask: ${askResult.askId}`)
  console.log(`   ✅ Buyer purchased ask: ${askResult.askId}`)
}

// Run the tests
testCoreOperations().catch(console.error)
