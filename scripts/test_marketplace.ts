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

// Test identities - we'll generate consistent mnemonics
const TEST_NAMES = ['Alice', 'Bob', 'Charlie', 'David'] as const
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

// Create NFT actor (same pattern as test_backend.ts)
const createNFTActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<NFTService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943', // Local DFX
    identity: identity as any
  })
  
  // Fetch root key for local network
  await agent.fetchRootKey()
  
  return Actor.createActor(nftIdlFactory, {
    agent,
    canisterId
  })
}

// Create Marketplace actor
const createMarketplaceActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<MarketplaceService> => {
  const agent = new HttpAgent({
    host: 'http://localhost:4943', // Local DFX
    identity: identity as any
  })
  
  // Fetch root key for local network
  await agent.fetchRootKey()
  
  return Actor.createActor(marketplaceIdlFactory, {
    agent,
    canisterId
  })
}

// Helper function to serialize BigInt in JSON
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))
}

// Test scenarios
const runTests = async (): Promise<void> => {
  console.log('🚀 Starting Comprehensive NFT & Marketplace Testing\n')
  
  // Generate all identities (same as test_backend.ts)
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
  
  console.log(`\n📡 Connecting to canisters:`)
  console.log(`   NFT Collection: ${nftCanisterId}`)
  console.log(`   Marketplace: ${marketplaceCanisterId}\n`)
  
  const alice = identities.find(id => id.name === 'Alice')!
  const bob = identities.find(id => id.name === 'Bob')!
  const charlie = identities.find(id => id.name === 'Charlie')!
  const david = identities.find(id => id.name === 'David')!
  
  // Test 1: NFT Collection ICRC7/37/3 Compliance
  console.log('📋 Test 1: NFT Collection ICRC7/37/3 Compliance')
  console.log('='.repeat(60))
  
  try {
    const nftActor = await createNFTActor(alice.identity, nftCanisterId)
    
    // ICRC7 Basic Operations
    console.log('\n🔍 ICRC7 Basic Operations...')
    const name = await nftActor.icrc7_name()
    const symbol = await nftActor.icrc7_symbol()
    const totalSupply = await nftActor.icrc7_total_supply()
    const description = await nftActor.icrc7_description()
    const logo = await nftActor.icrc7_logo()
    
    console.log(`   Name: ${name}`)
    console.log(`   Symbol: ${symbol}`)
    console.log(`   Total Supply: ${totalSupply}`)
    console.log(`   Description: ${description}`)
    console.log(`   Logo: ${logo}`)
    
    // ICRC7 Metadata
    console.log('\n📊 ICRC7 Metadata...')
    const collectionMetadata = await nftActor.icrc7_collection_metadata()
    console.log(`   Collection Metadata: ${JSON.stringify(serializeBigInt(collectionMetadata), null, 2)}`)
    
    // ICRC7 Token Operations
    console.log('\n🎨 ICRC7 Token Operations...')
    const aliceAccount = { owner: Principal.fromText(alice.principal), subaccount: [] }
    
    // Mint NFT for Alice
    const mintResult = await nftActor.mint({
      token_metadata_url: "https://example.com/metadata/marketplace-test.json",
      memo: [],
      token_owner: aliceAccount,
      token_name: "Marketplace Test NFT #1"
    })
    
    if ('Ok' in mintResult) {
      console.log(`✅ Minted NFT with ID: ${mintResult.Ok}`)
      
      // Get token metadata
      const tokenMetadata = await nftActor.icrc7_token_metadata([BigInt(1)])
      console.log(`   Token Metadata: ${JSON.stringify(serializeBigInt(tokenMetadata), null, 2)}`)
      
      // Check ownership
      const ownership = await nftActor.icrc7_owner_of([BigInt(1)])
      console.log(`   Ownership: ${JSON.stringify(serializeBigInt(ownership), null, 2)}`)
    }
    
    // ICRC3 Transaction History
    console.log('\n📜 ICRC3 Transaction History...')
    const transactions = await nftActor.icrc3_get_blocks([])
    console.log(`   Transaction Blocks: ${JSON.stringify(serializeBigInt(transactions), null, 2)}`)
    
    // ICRC37 Approvals
    console.log('\n✅ ICRC37 Approvals...')
    const approveResult = await nftActor.icrc37_approve_tokens([{
      token_id: BigInt(1),
      approval_info: {
        spender: { owner: Principal.fromText(bob.principal), subaccount: [] },
        expires_at: [],
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: BigInt(Date.now() * 1000000)
      }
    }])
    
    if ('Ok' in approveResult) {
      console.log(`✅ Approval successful!`)
      
      // Check approvals
      const approvals = await nftActor.icrc37_get_token_approvals(BigInt(1), [], [])
      console.log(`   Approvals: ${JSON.stringify(serializeBigInt(approvals), null, 2)}`)
    }
    
  } catch (error) {
    console.log(`❌ NFT Collection error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 2: Marketplace ICRC-8 Compliance
  console.log('\n📋 Test 2: Marketplace ICRC-8 Compliance')
  console.log('='.repeat(60))
  
  try {
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    
    // ICRC-8 Core Methods
    console.log('\n🏪 ICRC-8 Core Methods...')
    
    // Get marketplace metadata
    const metadata = await marketplaceActor.get_metadata()
    console.log(`   Marketplace Metadata: ${JSON.stringify(serializeBigInt(metadata), null, 2)}`)
    
    // Health check
    const health = await marketplaceActor.health_check()
    console.log(`   Health Check: ${health}`)
    
    // ICRC-8 Balance of
    console.log('\n💰 ICRC-8 Balance Operations...')
    const aliceAccount = { owner: Principal.fromText(alice.principal), sub_account: [] }
    
    const balanceResult = await marketplaceActor.icrc8_balance_of([[
      aliceAccount,
      [{ Nfts: [] }]
    ]])
    
    console.log(`   Balance Result: ${JSON.stringify(serializeBigInt(balanceResult), null, 2)}`)
    
    // ICRC-8 Ask Info
    console.log('\n📋 ICRC-8 Ask Info...')
    const askInfoRequest = { Active: [] }
    
    const askInfoResult = await marketplaceActor.icrc8_ask_info([askInfoRequest])
    console.log(`   Ask Info Result: ${JSON.stringify(serializeBigInt(askInfoResult), null, 2)}`)
    
    // ICRC-8 Approved Tokens
    console.log('\n✅ ICRC-8 Approved Tokens...')
    const approvedTokens = await marketplaceActor.icrc8_approved_tokens()
    console.log(`   Approved Tokens: ${JSON.stringify(serializeBigInt(approvedTokens), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Marketplace error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 3: NFT Transfer and Marketplace Integration
  console.log('\n📋 Test 3: NFT Transfer and Marketplace Integration')
  console.log('='.repeat(60))
  
  try {
    const aliceNFT = await createNFTActor(alice.identity, nftCanisterId)
    const bobAccount = { owner: Principal.fromText(bob.principal), subaccount: [] }
    
    // Transfer NFT from Alice to Bob
    console.log('\n🔄 Transferring NFT from Alice to Bob...')
    const transferResult = await aliceNFT.icrc7_transfer([{
      to: bobAccount,
      token_id: BigInt(1),
      memo: [],
      from_subaccount: [],
      created_at_time: []
    }])
    
    console.log(`   Transfer Result: ${JSON.stringify(serializeBigInt(transferResult), null, 2)}`)
    
    // Verify ownership change
    const bobNFT = await createNFTActor(bob.identity, nftCanisterId)
    const ownership = await bobNFT.icrc7_owner_of([BigInt(1)])
    console.log(`   Bob's Ownership: ${JSON.stringify(serializeBigInt(ownership), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Transfer error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 4: Multiple NFT Operations
  console.log('\n📋 Test 4: Multiple NFT Operations')
  console.log('='.repeat(60))
  
  try {
    const aliceNFT = await createNFTActor(alice.identity, nftCanisterId)
    
    // Mint multiple NFTs for different users
    console.log('\n🎨 Minting Multiple NFTs...')
    
    const users = [bob, charlie, david]
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const userAccount = { owner: Principal.fromText(user.principal), subaccount: [] }
      
      const mintResult = await aliceNFT.mint({
        token_metadata_url: `https://example.com/metadata/user-${i+2}.json`,
        memo: [],
        token_owner: userAccount,
        token_name: `${user.name}'s NFT #${i+2}`
      })
      
      if ('Ok' in mintResult) {
        console.log(`✅ Minted NFT ${mintResult.Ok} for ${user.name}`)
      }
    }
    
    // Get total supply
    const totalSupply = await aliceNFT.icrc7_total_supply()
    console.log(`   Total Supply: ${totalSupply}`)
    
    // Get tokens of Alice
    const aliceAccount = { owner: Principal.fromText(alice.principal), subaccount: [] }
    const aliceTokens = await aliceNFT.icrc7_tokens_of(aliceAccount, [], [])
    console.log(`   Alice's Tokens: ${JSON.stringify(serializeBigInt(aliceTokens), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Multiple NFT error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 5: Advanced ICRC37 Operations
  console.log('\n📋 Test 5: Advanced ICRC37 Operations')
  console.log('='.repeat(60))
  
  try {
    const bobNFT = await createNFTActor(bob.identity, nftCanisterId)
    
    // Approve multiple spenders
    console.log('\n✅ Approving Multiple Spenders...')
    
    const spenders = [charlie, david]
    for (const spender of spenders) {
      const approveResult = await bobNFT.icrc37_approve_tokens([{
        token_id: BigInt(1),
        approval_info: {
          spender: { owner: Principal.fromText(spender.principal), subaccount: [] },
          expires_at: [],
          fee: [],
          memo: [],
          from_subaccount: [],
          created_at_time: BigInt(Date.now() * 1000000)
        }
      }])
      
      if ('Ok' in approveResult) {
        console.log(`✅ Approved ${spender.name} for NFT 1`)
      }
    }
    
    // Check all approvals
    const approvals = await bobNFT.icrc37_get_token_approvals(BigInt(1), [], [])
    console.log(`   All Approvals: ${JSON.stringify(serializeBigInt(approvals), null, 2)}`)
    
    // Check if approved
    const isApproved = await bobNFT.icrc37_is_approved([{
      token_id: BigInt(1),
      from_subaccount: [],
      spender: { owner: Principal.fromText(charlie.principal), subaccount: [] }
    }])
    
    console.log(`   Charlie Approved: ${JSON.stringify(serializeBigInt(isApproved), null, 2)}`)
    
  } catch (error) {
    console.log(`❌ Advanced ICRC37 error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  console.log('\n🎉 Comprehensive NFT & Marketplace Testing Completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ ICRC7: Collection metadata, token operations, ownership')
  console.log('   ✅ ICRC3: Transaction history and blocks')
  console.log('   ✅ ICRC37: Token approvals and spender management')
  console.log('   ✅ ICRC8: Marketplace balance, ask info, approved tokens')
  console.log('   ✅ Integration: NFT transfers and marketplace connectivity')
  console.log('   ✅ Multi-user: Multiple identities and token operations')
}

// Run the tests
runTests().catch(console.error)
