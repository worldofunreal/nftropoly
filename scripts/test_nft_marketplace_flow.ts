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
import type { _SERVICE as MarketplaceService, TokenSpec, AskFeature, ManageAskRequest, EscrowRecord, BidFeature, ManageBidRequest } from '../src/declarations/marketplace/marketplace.did.d.ts'
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

// Generate consistent identity for Bob
const generateBobIdentity = async (): Promise<Ed25519KeyIdentity> => {
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
  
  const mnemonic = generateMnemonic('Bob')
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
    
    // Extract the ask ID and NFT ID from the result
    const askId = askResult[0]?.[1]?.[0]?.NewAsk?.Ok?.ask_id
    const askNftId = askResult[0]?.[0]?.[0]?.NewAsk?.[0]?.[0]?.AskToken?.[0]?.[0]?.standards?.[0]?.ICRC37?.[0]?.token_id?.[0]
    if (!askId) {
      throw new Error('Failed to get ask ID from ask result')
    }
    if (!askNftId) {
      throw new Error('Failed to get NFT ID from ask result')
    }
    console.log(`   📋 Extracted Ask ID: ${askId}`)
    console.log(`   📋 Extracted NFT ID: ${askNftId}`)
    
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
    
    // Get marketplace balance info using the ICRC-8 standard structure
    const marketplaceBalanceResult = await aliceMarketplace.icrc8_balance_of([
      [
        { owner: Principal.fromText(CANISTER_IDS.marketplace), subaccount: [] },
        [{ 'Escrow': [] }]
      ]
    ])
    
    // Also check Alice's escrow (since she's the seller)
    const aliceBalanceResult = await aliceMarketplace.icrc8_balance_of([
      [
        { owner: Principal.fromText(alicePrincipal), subaccount: [] },
        [{ 'Escrow': [] }]
      ]
    ])
    
    console.log(`   Marketplace Escrow: ${JSON.stringify(serializeBigInt(marketplaceBalanceResult), null, 2)}`)
    console.log(`   Alice's Escrow: ${JSON.stringify(serializeBigInt(aliceBalanceResult), null, 2)}`)
    
    // Step 6: Bob buys Alice's NFT
    console.log('\n📋 Step 6: Bob Buys Alice\'s NFT')
    console.log('-'.repeat(40))
    
    // Generate Bob's identity
    const bobIdentity = await generateBobIdentity()
    const bobPrincipal = bobIdentity.getPrincipal().toText()
    console.log(`👤 Bob Principal: ${bobPrincipal}`)
    
    // Create Bob's actors
    const bobNFT = await createNFTActor(bobIdentity)
    const bobMarketplace = await createMarketplaceActor(bobIdentity)
    const bobToken = await createTokenActor(bobIdentity)
    
    // Check Bob's initial balances
    const bobInitialTokens = await bobToken.icrc1_balance_of({ owner: Principal.fromText(bobPrincipal), subaccount: [] })
    const bobInitialNFTs = await bobNFT.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipal), subaccount: [] }, [], [])
    
    console.log(`   Bob's initial NTRP balance: ${bobInitialTokens}`)
    console.log(`   Bob's initial NFTs: ${bobInitialNFTs.length}`)
    
    // Bob needs to have enough tokens to buy the NFT
    if (bobInitialTokens < BigInt(5000000000)) {
      console.log(`   ❌ Bob doesn't have enough tokens (needs 50 NTRP, has ${bobInitialTokens})`)
      console.log(`   💡 In a real scenario, Bob would need to acquire tokens first`)
      return
    }
    
    // Bob approves marketplace to spend his tokens
    console.log(`   🔐 Bob approves marketplace to spend his tokens...`)
    const bobApprovalResult = await bobToken.icrc2_approve({
      from_subaccount: [],
      spender: { owner: Principal.fromText(CANISTER_IDS.marketplace), subaccount: [] },
      amount: BigInt(5000000000),
      expected_allowance: [],
      expires_at: [],
      fee: [],
      memo: [],
      created_at_time: []
    })
    
    if ('Ok' in bobApprovalResult) {
      console.log(`   ✅ Bob's token approval successful!`)
    } else {
      console.log(`   ❌ Bob's token approval failed: ${JSON.stringify(bobApprovalResult)}`)
      return
    }
    
    // Bob places a bid to buy Alice's NFT
    console.log(`   🛒 Bob places bid to buy Alice's NFT for 50 NTRP...`)
    
    // Create Bob's account
    const bobAccount = { owner: Principal.fromText(bobPrincipal), subaccount: [] as [] }
    
    // Create escrow record for Bob's bid (the tokens he's offering)
    const bobEscrowRecord: EscrowRecord = {
      escrow_type: { Bid: [[{
        standards: [{ 
          ICRC1: [{ 
            amount: BigInt(5000000000), // 50 NTRP tokens
            fee: [BigInt(10000)], 
            decimals: 8 
          }] 
        }],
        canister: Principal.fromText(CANISTER_IDS.nftropolyToken),
        symbol: 'NTRP'
      }]] },
      buyer: [bobAccount], // This is wrong - should be opt Account
      seller: { owner: Principal.fromText(CANISTER_IDS.marketplace), subaccount: [] },
      ask_id: [askId], // This is wrong - should be opt nat64
      lock_to_date: []
    }
    
    // Create bid features
    const bidFeatures: BidFeature[] = [
      { Escrow: bobEscrowRecord }
    ]
    
    // Create the bid request
    const bidRequest: ManageBidRequest = {
      NewBid: {
        ask_id: BigInt(askId), // Use the actual ask ID from Alice's ask
        feature: bidFeatures.map(f => [f]) // This creates vec opt BidFeature
      }
    }
    
    console.log(`   🔍 Bid request structure: ${JSON.stringify(serializeBigInt(bidRequest), null, 2)}`)
    console.log(`   🔍 Bid request type: ${typeof bidRequest}`)
    console.log(`   🔍 NewBid type: ${typeof bidRequest.NewBid}`)
    console.log(`   🔍 ask_id type: ${typeof bidRequest.NewBid.ask_id}`)
    console.log(`   🔍 feature length: ${bidRequest.NewBid.feature.length}`)
    console.log(`   🔍 feature[0] type: ${typeof bidRequest.NewBid.feature[0]}`)
    console.log(`   🔍 feature[0] length: ${bidRequest.NewBid.feature[0].length}`)
    console.log(`   🔍 feature[0][0] type: ${typeof bidRequest.NewBid.feature[0][0]}`)
    
    const bidResult = await bobMarketplace.icrc8_bid([[bidRequest]])
    console.log(`   Bid Result: ${JSON.stringify(serializeBigInt(bidResult), null, 2)}`)
    
    // Step 7: Verify the purchase
    console.log('\n📋 Step 7: Verifying the Purchase')
    console.log('-'.repeat(40))
    
    // Check Bob's final balances
    const bobFinalTokens = await bobToken.icrc1_balance_of({ owner: Principal.fromText(bobPrincipal), subaccount: [] })
    const bobFinalNFTs = await bobNFT.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipal), subaccount: [] }, [], [])
    
    // Check Alice's final token balance
    const aliceFinalTokens = await aliceToken.icrc1_balance_of({ owner: Principal.fromText(alicePrincipal), subaccount: [] })
    
    console.log(`   Bob's final NTRP balance: ${bobFinalTokens}`)
    console.log(`   Bob's final NFTs: ${bobFinalNFTs.length}`)
    console.log(`   Alice's final NTRP balance: ${aliceFinalTokens}`)
    
    if (bobFinalNFTs.length > 0) {
      console.log(`   ✅ Bob successfully purchased Alice's NFT!`)
      console.log(`   Bob now owns NFT ID: ${bobFinalNFTs[0]}`)
       
      // Verify Bob actually owns the NFT by checking the collection directly
      console.log(`   🔍 Verifying Bob's NFT ownership in the collection...`)
      console.log(`   🔍 Checking ownership of NFT ID: ${askNftId} (the NFT Alice minted and sold)`)
      const bobNFTOwner = await bobNFT.icrc7_owner_of([BigInt(askNftId)])
      console.log(`   📋 Owner lookup result: ${JSON.stringify(serializeBigInt(bobNFTOwner), null, 2)}`)
      
      // The result structure is [[owner]] where owner is an Account
      // Looking at the JSON output, the structure is: [[{"owner": {"__principal__": "..."}}]]
      const ownerObject = bobNFTOwner[0]?.[0]?.owner
      const actualOwner = ownerObject?.['__principal__']
      const expectedOwner = bobPrincipal
      
      if (actualOwner === expectedOwner) {
        console.log(`   ✅ Collection confirms Bob owns NFT ID: ${askNftId}`)
      } else {
        console.log(`   ❌ Collection shows Bob does NOT own NFT ID: ${askNftId}`)
        console.log(`   📋 Actual owner: ${actualOwner}`)
        console.log(`   📋 Expected owner: ${expectedOwner}`)
      }
      
      // Also verify Alice no longer owns the NFT
      console.log(`   🔍 Verifying Alice no longer owns the NFT...`)
      const aliceNFTsAfterSale = await aliceNFT.icrc7_tokens_of({ owner: Principal.fromText(alicePrincipal), subaccount: [] }, [], [])
      const aliceStillOwnsNFT = aliceNFTsAfterSale.includes(BigInt(askNftId))
      
      if (!aliceStillOwnsNFT) {
        console.log(`   ✅ Alice no longer owns NFT ID: ${askNftId}`)
      } else {
        console.log(`   ❌ Alice still owns NFT ID: ${askNftId} - ownership transfer failed!`)
      }
      
    } else {
      console.log(`   ❌ Bob did not receive the NFT`)
    }
    
    if (aliceFinalTokens > BigInt(0)) {
      console.log(`   ✅ Alice received payment for her NFT!`)
    } else {
      console.log(`   ❌ Alice did not receive payment`)
    }
    
    console.log('\n🎉 Complete NFT Marketplace Flow Test Completed!')
    
  } catch (error) {
    console.log(`❌ Test error: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

// Run the test
testNFTMarketplaceFlow().catch(console.error)
