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
const TEST_NAMES = ['Alice', 'Bob', 'Charlie'] as const
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

// Test scenarios
const runTests = async (): Promise<void> => {
  console.log('🚀 Starting Final NFT & Marketplace Testing\n')
  
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
  
  // Test 1: Basic NFT operations
  console.log('📋 Test 1: Basic NFT Operations')
  console.log('='.repeat(50))
  
  try {
    // Use Alice's identity (she is the minting authority)
    const nftActor = await createNFTActor(alice.identity, nftCanisterId)
    
    // Check initial state
    console.log('\n🔍 Checking initial state...')
    const name = await nftActor.icrc7_name()
    const symbol = await nftActor.icrc7_symbol()
    const totalSupply = await nftActor.icrc7_total_supply()
    
    console.log(`   Collection Name: ${name}`)
    console.log(`   Collection Symbol: ${symbol}`)
    console.log(`   Total Supply: ${totalSupply}`)
    
    // Mint NFT for Alice
    console.log('\n🎨 Minting NFT for Alice...')
    const aliceAccount = { owner: Principal.fromText(alice.principal), subaccount: [] }
    const mintResult = await nftActor.mint({
      token_metadata_url: "https://example.com/metadata/1.json",
      memo: [],
      token_owner: aliceAccount,
      token_name: "Alice's Test NFT #1"
    })
    
    if ('Ok' in mintResult) {
      console.log(`✅ Alice's NFT minted with ID: ${mintResult.Ok}`)
      
      // Verify ownership
      const aliceNFTs = await nftActor.icrc7_owner_of([BigInt(1)])
      console.log(`   Alice owns NFT 1: ${aliceNFTs[0] ? 'Yes' : 'No'}`)
      
      // Check total supply
      const newTotalSupply = await nftActor.icrc7_total_supply()
      console.log(`   New Total Supply: ${newTotalSupply}`)
      
    } else {
      console.log(`❌ Failed to mint Alice's NFT:`, mintResult.Err)
    }
    
  } catch (error) {
    console.log(`❌ NFT test error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 2: NFT Transfer (Alice -> Bob)
  console.log('\n📋 Test 2: NFT Transfer (Alice -> Bob)')
  console.log('='.repeat(50))
  
  try {
    const aliceActor = await createNFTActor(alice.identity, nftCanisterId)
    const bobAccount = { owner: Principal.fromText(bob.principal), subaccount: [] }
    
    console.log('\n🔄 Transferring NFT from Alice to Bob...')
    const transferResult = await aliceActor.icrc7_transfer([{
      to: bobAccount,
      token_id: BigInt(1),
      memo: [],
      from_subaccount: [],
      created_at_time: []
    }])
    
    if (transferResult[0] && 'Ok' in transferResult[0]) {
      console.log(`✅ Transfer successful!`)
      
      // Verify new ownership
      const bobActor = await createNFTActor(bob.identity, nftCanisterId)
      const bobNFTs = await bobActor.icrc7_owner_of([BigInt(1)])
      console.log(`   Bob owns NFT 1: ${bobNFTs[0] ? 'Yes' : 'No'}`)
      
      // Check Alice no longer owns it
      const aliceNFTs = await aliceActor.icrc7_owner_of([BigInt(1)])
      console.log(`   Alice owns NFT 1: ${aliceNFTs[0] ? 'Yes' : 'No'}`)
      
    } else {
      console.log(`❌ Transfer failed:`, transferResult[0])
    }
    
  } catch (error) {
    console.log(`❌ Transfer error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 3: Mint another NFT for Charlie
  console.log('\n📋 Test 3: Mint NFT for Charlie')
  console.log('='.repeat(50))
  
  try {
    const aliceActor = await createNFTActor(alice.identity, nftCanisterId)
    const charlieAccount = { owner: Principal.fromText(charlie.principal), subaccount: [] }
    
    console.log('\n🎨 Minting NFT for Charlie...')
    const mintResult = await aliceActor.mint({
      token_metadata_url: "https://example.com/metadata/2.json",
      memo: [],
      token_owner: charlieAccount,
      token_name: "Charlie's Test NFT #2"
    })
    
    if ('Ok' in mintResult) {
      console.log(`✅ Charlie's NFT minted with ID: ${mintResult.Ok}`)
      
      // Verify ownership
      const charlieActor = await createNFTActor(charlie.identity, nftCanisterId)
      const charlieNFTs = await charlieActor.icrc7_owner_of([BigInt(2)])
      console.log(`   Charlie owns NFT 2: ${charlieNFTs[0] ? 'Yes' : 'No'}`)
      
      // Check total supply
      const totalSupply = await aliceActor.icrc7_total_supply()
      console.log(`   Total Supply: ${totalSupply}`)
      
    } else {
      console.log(`❌ Failed to mint Charlie's NFT:`, mintResult.Err)
    }
    
  } catch (error) {
    console.log(`❌ Charlie minting error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 4: ICRC7 Metadata
  console.log('\n📋 Test 4: ICRC7 Metadata')
  console.log('='.repeat(50))
  
  try {
    const aliceActor = await createNFTActor(alice.identity, nftCanisterId)
    
    console.log('\n📊 Getting collection metadata...')
    const metadata = await aliceActor.icrc7_collection_metadata()
    console.log(`   Collection Metadata: ${JSON.stringify(metadata, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2)}`)
    
    console.log('\n🔍 Getting token metadata...')
    const tokenMetadata = await aliceActor.icrc7_token_metadata([BigInt(1), BigInt(2)])
    console.log(`   Token Metadata: ${JSON.stringify(tokenMetadata, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2)}`)
    
  } catch (error) {
    console.log(`❌ Metadata error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 5: ICRC3 Transaction History
  console.log('\n📋 Test 5: ICRC3 Transaction History')
  console.log('='.repeat(50))
  
  try {
    const aliceActor = await createNFTActor(alice.identity, nftCanisterId)
    
    console.log('\n📜 Getting transaction history...')
    const transactions = await aliceActor.icrc3_get_blocks([])
    
    console.log(`✅ Got transaction blocks`)
    console.log(`   Blocks: ${JSON.stringify(transactions, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2)}`)
    
  } catch (error) {
    console.log(`❌ Transaction history error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 6: ICRC37 Approval
  console.log('\n📋 Test 6: ICRC37 Approval')
  console.log('='.repeat(50))
  
  try {
    const bobActor = await createNFTActor(bob.identity, nftCanisterId)
    
    console.log('\n✅ Approving Charlie to transfer Bob\'s NFT...')
    const approveResult = await bobActor.icrc37_approve_tokens([{
      token_id: BigInt(1),
      approval_info: {
        spender: { owner: Principal.fromText(charlie.principal), subaccount: [] },
        expires_at: [],
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: BigInt(Date.now() * 1000000) // Convert to nanoseconds
      }
    }])
    
    if ('Ok' in approveResult) {
      console.log(`✅ Approval successful!`)
      
      // Check approval
      const approvals = await bobActor.icrc37_get_token_approvals(BigInt(1), [], [])
      console.log(`   Approvals: ${JSON.stringify(approvals, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value, 2)}`)
      
    } else {
      console.log(`❌ Approval failed:`, approveResult.Err)
    }
    
  } catch (error) {
    console.log(`❌ Approval error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 7: Marketplace Integration
  console.log('\n📋 Test 7: Marketplace Integration')
  console.log('='.repeat(50))
  
  try {
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    
    console.log('\n🏪 Testing marketplace endpoints...')
    
    // Test marketplace info
    console.log('   Testing marketplace info...')
    // Note: Add specific marketplace methods based on the generated declarations
    
  } catch (error) {
    console.log(`❌ Marketplace error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  console.log('\n🎉 Final NFT & Marketplace Testing Completed!')
}

// Run the tests
runTests().catch(console.error)
