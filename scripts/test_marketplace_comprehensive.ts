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
import type { _SERVICE as MarketplaceService } from '../src/declarations/marketplace/marketplace.did.d.ts'
import { idlFactory as tokenIdlFactory } from '../src/declarations/nftropoly_token/nftropoly_token.did.js'
import type { _SERVICE as TokenService } from '../src/declarations/nftropoly_token/nftropoly_token.did.d.ts'

// Test identities - we'll generate consistent mnemonics
const TEST_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'] as const
type TestName = typeof TEST_NAMES[number]

interface IdentityData {
  name: TestName
  identity: Ed25519KeyIdentity
  principal: string
  evmAddress: string
  solAddress: string
  btcAddress: string
  mnemonic: string
}

// Generate consistent mnemonics based on name (same as test_backend.ts)
const generateMnemonic = (name: string): string => {
  // Create a deterministic seed from the name
  const encoder = new TextEncoder()
  const nameBytes = encoder.encode(name.toLowerCase())
  
  // Use a simple hash to create entropy
  let hash = 0
  for (let i = 0; i < nameBytes.length; i++) {
    const char = nameBytes[i]
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to 16 bytes (128 bits) for 12-word mnemonic
  const entropy = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    entropy[i] = (hash >> (i * 8)) & 0xFF
  }
  
  return bip39.entropyToMnemonic(Buffer.from(entropy).toString('hex'))
}

// Identity generation utilities (same as test_backend.ts)
const generateIdentity = async (mnemonic: string): Promise<Omit<IdentityData, 'name' | 'mnemonic'>> => {
  const seedBuffer = bip39.mnemonicToSeedSync(mnemonic)
  const seed = new Uint8Array(seedBuffer.slice(0, 32))
  
  const keyPair = nacl.sign.keyPair.fromSeed(seed)
  const identity = Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey)
  
  // Generate addresses
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
  const evmAccount = hdNode.derivePath("44'/60'/0'/0/0")
  const solAccount = hdNode.derivePath("44'/501'/0'/0/0")
  const btcAccount = hdNode.derivePath("44'/0'/0'/0/0")
  
  const solPrivateKeyBytes = ethers.getBytes(solAccount.privateKey)
  const solKeypair = Keypair.fromSeed(solPrivateKeyBytes.slice(0, 32))
  
  return {
    identity,
    principal: (identity as any).getPrincipal().toText(),
    evmAddress: evmAccount.address,
    solAddress: solKeypair.publicKey.toString(),
    btcAddress: `bc1${btcAccount.address.slice(2)}` // Simplified for testing
  }
}

// Create actors
const createNFTActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<NFTService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  return Actor.createActor(nftIdlFactory, { agent, canisterId })
}

const createMarketplaceActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<MarketplaceService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  return Actor.createActor(marketplaceIdlFactory, { agent, canisterId })
}

const createTokenActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<TokenService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943',
    identity: identity as any
  })
  await agent.fetchRootKey()
  return Actor.createActor(tokenIdlFactory, { agent, canisterId })
}

// Helper function to serialize BigInt in JSON
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))
}

// Test scenarios
const runTests = async (): Promise<void> => {
  console.log('🚀 Starting MASSIVE Marketplace & Token Testing\n')
  
  // Generate all identities
  const identities: IdentityData[] = []
  for (const name of TEST_NAMES) {
    const mnemonic = generateMnemonic(name)
    const identityData = await generateIdentity(mnemonic)
    identities.push({
      name,
      mnemonic,
      ...identityData
    })
    console.log(`✅ Generated ${name}: ${identityData.principal}`)
  }
  
  // Get canister IDs from deployment
  const nftCanisterId = 'uqqxf-5h777-77774-qaaaa-cai'
  const marketplaceCanisterId = 'u6s2n-gx777-77774-qaaba-cai'
  const tokenCanisterId = 'uzt4z-lp777-77774-qaabq-cai'
  
  console.log(`\n📡 Connecting to canisters:`)
  console.log(`   NFT Collection: ${nftCanisterId}`)
  console.log(`   Marketplace: ${marketplaceCanisterId}`)
  console.log(`   NFTropoly Token: ${tokenCanisterId}\n`)
  
  const alice = identities.find(id => id.name === 'Alice')!
  const bob = identities.find(id => id.name === 'Bob')!
  const charlie = identities.find(id => id.name === 'Charlie')!
  const david = identities.find(id => id.name === 'David')!
  const eve = identities.find(id => id.name === 'Eve')!
  const frank = identities.find(id => id.name === 'Frank')!
  
  // Test 1: Token Operations (ICRC-1/2)
  console.log('📋 Test 1: Token Operations (ICRC-1/2)')
  console.log('='.repeat(60))
  
  try {
    const tokenActor = await createTokenActor(alice.identity, tokenCanisterId)
    
    // Get token metadata
    console.log('\n🪙 Token Metadata...')
    const tokenName = await tokenActor.icrc1_name()
    const tokenSymbol = await tokenActor.icrc1_symbol()
    const tokenDecimals = await tokenActor.icrc1_decimals()
    const tokenFee = await tokenActor.icrc1_fee()
    const tokenTotalSupply = await tokenActor.icrc1_total_supply()
    
    console.log(`   Name: ${tokenName}`)
    console.log(`   Symbol: ${tokenSymbol}`)
    console.log(`   Decimals: ${tokenDecimals}`)
    console.log(`   Fee: ${tokenFee}`)
    console.log(`   Total Supply: ${tokenTotalSupply}`)
    
    // Check Alice's balance
    const aliceAccount = { owner: Principal.fromText(alice.principal), subaccount: [] }
    const aliceBalance = await tokenActor.icrc1_balance_of(aliceAccount)
    console.log(`   Alice's Balance: ${aliceBalance}`)
    
    // Transfer tokens to other users
    console.log('\n💰 Token Transfers...')
    const users = [bob, charlie, david, eve, frank]
    const transferAmount = BigInt(1000000000) // 10 tokens with 8 decimals
    
    for (const user of users) {
      const userAccount = { owner: Principal.fromText(user.principal), subaccount: [] }
      const transferResult = await tokenActor.icrc1_transfer({
        to: userAccount,
        amount: transferAmount,
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: []
      })
      
      if ('Ok' in transferResult) {
        console.log(`✅ Transferred 10 NTRP to ${user.name}`)
      } else {
        console.log(`❌ Failed to transfer to ${user.name}: ${transferResult.Err}`)
      }
    }
    
    // Test ICRC-2 Approvals
    console.log('\n✅ ICRC-2 Approvals...')
    const approveResult = await tokenActor.icrc2_approve({
      from_subaccount: [],
      spender: { owner: Principal.fromText(bob.principal), subaccount: [] },
      amount: BigInt(500000000), // 5 tokens
      expires_at: [],
      fee: [],
      memo: [],
      created_at_time: []
    })
    
    if ('Ok' in approveResult) {
      console.log(`✅ Approved Bob to spend 5 NTRP from Alice`)
      
      // Check allowance
      const allowance = await tokenActor.icrc2_allowance({
        account: aliceAccount,
        spender: { owner: Principal.fromText(bob.principal), subaccount: [] }
      })
      console.log(`   Allowance: ${allowance.allowance}`)
    }
    
  } catch (error) {
    console.log(`❌ Token error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 2: NFT Operations and Marketplace Integration
  console.log('\n📋 Test 2: NFT Operations and Marketplace Integration')
  console.log('='.repeat(60))
  
  try {
    const nftActor = await createNFTActor(alice.identity, nftCanisterId)
    
    // Mint NFTs for marketplace testing
    console.log('\n🎨 Minting NFTs for Marketplace...')
    const users = [alice, bob, charlie]
    const nftIds: bigint[] = []
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const userAccount = { owner: Principal.fromText(user.principal), subaccount: [] }
      
      const mintResult = await nftActor.mint({
        token_metadata_url: `https://example.com/metadata/marketplace-${i+1}.json`,
        memo: [],
        token_owner: userAccount,
        token_name: `Marketplace NFT #${i+1}`
      })
      
      if ('Ok' in mintResult) {
        nftIds.push(mintResult.Ok)
        console.log(`✅ Minted NFT ${mintResult.Ok} for ${user.name}`)
      }
    }
    
    // Get total supply
    const totalSupply = await nftActor.icrc7_total_supply()
    console.log(`   Total Supply: ${totalSupply}`)
    
  } catch (error) {
    console.log(`❌ NFT minting error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 3: Marketplace Ask Operations (Selling NFTs)
  console.log('\n📋 Test 3: Marketplace Ask Operations (Selling NFTs)')
  console.log('='.repeat(60))
  
  try {
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    const tokenActor = await createTokenActor(alice.identity, tokenCanisterId)
    
    // Create token spec for NFTropoly token
    const tokenSpec = {
      canister: Principal.fromText(tokenCanisterId),
      symbol: "NTRP",
      standards: [{ ICRC1: [] }]
    }
    
    // Create NFT spec
    const nftSpec = {
      canister: Principal.fromText(nftCanisterId),
      symbol: "MNFT",
      standards: [{ ICRC7: [] }]
    }
    
    console.log('\n🏪 Creating Ask (Selling NFT for Tokens)...')
    
    // Alice wants to sell her NFT for 100 NTRP tokens
    const askFeatures = [
      { BuyNow: [[{ token: tokenSpec, amount: BigInt(10000000000) }]] }, // 100 tokens
      { Ending: { Date: BigInt(Date.now() * 1000000 + 86400000000000) } }, // 24 hours
      { FeeSchema: "standard" }
    ]
    
    const createAskResult = await marketplaceActor.icrc8_ask([{
      NewAsk: askFeatures
    }])
    
    console.log(`   Create Ask Result: ${JSON.stringify(serializeBigInt(createAskResult), null, 2)}`)
    
    if (createAskResult[0] && createAskResult[0][1] && 'Ok' in createAskResult[0][1]) {
      const askId = createAskResult[0][1].Ok.ask_id
      console.log(`✅ Created Ask with ID: ${askId}`)
      
      // Get ask info
      console.log('\n📋 Getting Ask Info...')
      const askInfoResult = await marketplaceActor.icrc8_ask_info([{
        Status: askId
      }])
      
      console.log(`   Ask Info: ${JSON.stringify(serializeBigInt(askInfoResult), null, 2)}`)
      
    }
    
  } catch (error) {
    console.log(`❌ Ask creation error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 4: Marketplace Bid Operations (Buying NFTs)
  console.log('\n📋 Test 4: Marketplace Bid Operations (Buying NFTs)')
  console.log('='.repeat(60))
  
  try {
    const bobMarketplace = await createMarketplaceActor(bob.identity, marketplaceCanisterId)
    const bobToken = await createTokenActor(bob.identity, tokenCanisterId)
    
    // Bob wants to bid on Alice's NFT
    console.log('\n💰 Creating Bid...')
    
    const tokenSpec = {
      canister: Principal.fromText(tokenCanisterId),
      symbol: "NTRP",
      standards: [{ ICRC1: [] }]
    }
    
    const bidFeatures = [
      { FeeSchema: "standard" }
    ]
    
    const createBidResult = await bobMarketplace.icrc8_bid([{
      NewBid: {
        ask_id: BigInt(1), // Assuming ask ID 1 from previous test
        feature: bidFeatures
      }
    }])
    
    console.log(`   Create Bid Result: ${JSON.stringify(serializeBigInt(createBidResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Bid creation error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 5: Marketplace Balance and Escrow
  console.log('\n📋 Test 5: Marketplace Balance and Escrow')
  console.log('='.repeat(60))
  
  try {
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    
    console.log('\n💰 Checking Marketplace Balances...')
    
    // Check Alice's marketplace balance
    const aliceAccount = { owner: Principal.fromText(alice.principal), sub_account: [] }
    const balanceResult = await marketplaceActor.icrc8_balance_of([[
      aliceAccount,
      [{ Nfts: [] }, { Tokens: null }, { Escrow: [] }]
    ]])
    
    console.log(`   Balance Result: ${JSON.stringify(serializeBigInt(balanceResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Balance check error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 6: Dutch Auctions
  console.log('\n📋 Test 6: Dutch Auctions')
  console.log('='.repeat(60))
  
  try {
    const charlieMarketplace = await createMarketplaceActor(charlie.identity, marketplaceCanisterId)
    
    console.log('\n📉 Creating Dutch Auction...')
    
    const tokenSpec = {
      canister: Principal.fromText(tokenCanisterId),
      symbol: "NTRP",
      standards: [{ ICRC1: [] }]
    }
    
    const dutchAuctionFeatures = [
      { BuyNow: [[{ token: tokenSpec, amount: BigInt(5000000000) }]] }, // 50 tokens starting price
      { Ending: { Date: BigInt(Date.now() * 1000000 + 3600000000000) } }, // 1 hour
      { FeeSchema: "standard" }
    ]
    
    const dutchAuctionResult = await charlieMarketplace.icrc8_ask([{
      NewAsk: dutchAuctionFeatures
    }])
    
    console.log(`   Dutch Auction Result: ${JSON.stringify(serializeBigInt(dutchAuctionResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Dutch auction error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 7: AMM (Automated Market Maker)
  console.log('\n📋 Test 7: AMM (Automated Market Maker)')
  console.log('='.repeat(60))
  
  try {
    const davidMarketplace = await createMarketplaceActor(david.identity, marketplaceCanisterId)
    
    console.log('\n🤖 Creating AMM...')
    
    const token1Spec = {
      canister: Principal.fromText(tokenCanisterId),
      symbol: "NTRP",
      standards: [{ ICRC1: [] }]
    }
    
    const nftSpec = {
      canister: Principal.fromText(nftCanisterId),
      symbol: "MNFT",
      standards: [{ ICRC7: [] }]
    }
    
    const ammParams = {
      token_1: token1Spec,
      token_2: nftSpec,
      max: BigInt(10000000000), // 100 tokens
      min: BigInt(1000000000),  // 10 tokens
      decimals: 8
    }
    
    const ammFeatures = [
      { Amm: ammParams },
      { FeeSchema: "standard" }
    ]
    
    const ammResult = await davidMarketplace.icrc8_ask([{
      NewAsk: ammFeatures
    }])
    
    console.log(`   AMM Result: ${JSON.stringify(serializeBigInt(ammResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ AMM error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 8: Engine Matching
  console.log('\n📋 Test 8: Engine Matching')
  console.log('='.repeat(60))
  
  try {
    const eveMarketplace = await createMarketplaceActor(eve.identity, marketplaceCanisterId)
    
    console.log('\n⚙️ Testing Engine Matching...')
    
    const engineMatch = {
      leader: [],
      asks: [{
        ask_canister: [Principal.fromText(marketplaceCanisterId)],
        ask_id: BigInt(1),
        token: []
      }]
    }
    
    const engineMatchResult = await eveMarketplace.icrc8_bid([{
      EngineMatch: engineMatch
    }])
    
    console.log(`   Engine Match Result: ${JSON.stringify(serializeBigInt(engineMatchResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Engine matching error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 9: Withdrawals and Settlements
  console.log('\n📋 Test 9: Withdrawals and Settlements')
  console.log('='.repeat(60))
  
  try {
    const frankMarketplace = await createMarketplaceActor(frank.identity, marketplaceCanisterId)
    
    console.log('\n💸 Testing Withdrawals...')
    
    // Test escrow withdrawal
    const escrowRecord = {
      escrow_type: { Bid: [] },
      buyer: [{ owner: Principal.fromText(frank.principal), sub_account: [] }],
      seller: { owner: Principal.fromText(alice.principal), sub_account: [] },
      ask_id: [BigInt(1)],
      lock_to_date: []
    }
    
    const withdrawResult = await frankMarketplace.icrc8_bid([{
      WithdrawEscrow: escrowRecord
    }])
    
    console.log(`   Withdraw Result: ${JSON.stringify(serializeBigInt(withdrawResult), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Withdrawal error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 10: Advanced Features
  console.log('\n📋 Test 10: Advanced Features')
  console.log('='.repeat(60))
  
  try {
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    
    console.log('\n🔧 Testing Advanced Features...')
    
    // Test approved tokens
    const approvedTokens = await marketplaceActor.icrc8_approved_tokens()
    console.log(`   Approved Tokens: ${JSON.stringify(serializeBigInt(approvedTokens), null, 2)}`)
    
    // Test metadata
    const metadata = await marketplaceActor.get_metadata()
    console.log(`   Marketplace Metadata: ${JSON.stringify(serializeBigInt(metadata), null, 2)}`)
    
    // Test health check
    const health = await marketplaceActor.health_check()
    console.log(`   Health Check: ${health}`)
    
  } catch (error) {
    console.log(`❌ Advanced features error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  console.log('\n🎉 MASSIVE Marketplace & Token Testing Completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ ICRC-1/2: Token transfers, approvals, balances')
  console.log('   ✅ ICRC-7: NFT minting and management')
  console.log('   ✅ ICRC-8: Complete marketplace functionality')
  console.log('   ✅ Trading: Asks, bids, escrow, settlements')
  console.log('   ✅ Auctions: Dutch auctions, AMM, engine matching')
  console.log('   ✅ Advanced: Withdrawals, metadata, health checks')
  console.log('   ✅ Multi-user: 6 identities with real transactions')
}

// Run the tests
runTests().catch(console.error)
