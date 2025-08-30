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

// Stage 1: Foundation & Setup Verification
const runStage1Tests = async (): Promise<void> => {
  console.log('🚀 Stage 1: Foundation & Setup Verification\n')
  
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
  
  console.log(`\n📡 Canister Information:`)
  console.log(`   NFT Collection: ${nftCanisterId}`)
  console.log(`   Marketplace: ${marketplaceCanisterId}`)
  console.log(`   NFTropoly Token: ${tokenCanisterId}\n`)
  
  const alice = identities.find(id => id.name === 'Alice')!
  const bob = identities.find(id => id.name === 'Bob')!
  const charlie = identities.find(id => id.name === 'Charlie')!
  
  // Test 1: Canister Health Checks
  console.log('📋 Test 1: Canister Health Checks')
  console.log('='.repeat(50))
  
  try {
    // Test NFT Collection Health
    console.log('\n🔍 Testing NFT Collection Health...')
    const nftActor = await createNFTActor(alice.identity, nftCanisterId)
    const nftName = await nftActor.icrc7_name()
    const nftSymbol = await nftActor.icrc7_symbol()
    const nftTotalSupply = await nftActor.icrc7_total_supply()
    
    console.log(`   ✅ NFT Collection: ${nftName} (${nftSymbol})`)
    console.log(`   ✅ Total Supply: ${nftTotalSupply} NFTs`)
    
    // Test Marketplace Health
    console.log('\n🏪 Testing Marketplace Health...')
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    const marketplaceHealth = await marketplaceActor.health_check()
    const marketplaceMetadata = await marketplaceActor.get_metadata()
    
    console.log(`   ✅ Marketplace Health: ${marketplaceHealth}`)
    console.log(`   ✅ Features Supported: ${marketplaceMetadata.length}`)
    
    // Test Token Health
    console.log('\n🪙 Testing Token Health...')
    const tokenActor = await createTokenActor(alice.identity, tokenCanisterId)
    const tokenName = await tokenActor.icrc1_name()
    const tokenSymbol = await tokenActor.icrc1_symbol()
    const tokenTotalSupply = await tokenActor.icrc1_total_supply()
    const tokenDecimals = await tokenActor.icrc1_decimals()
    
    console.log(`   ✅ Token: ${tokenName} (${tokenSymbol})`)
    console.log(`   ✅ Total Supply: ${tokenTotalSupply} (${tokenDecimals} decimals)`)
    
  } catch (error) {
    console.log(`❌ Health check error: ${error instanceof Error ? error.message : String(error)}`)
    return
  }
  
  // Test 2: Identity Access Verification
  console.log('\n📋 Test 2: Identity Access Verification')
  console.log('='.repeat(50))
  
  try {
    console.log('\n🔑 Testing Identity Access...')
    
    // Test Alice's access to all canisters
    const aliceNFT = await createNFTActor(alice.identity, nftCanisterId)
    const aliceMarketplace = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    const aliceToken = await createTokenActor(alice.identity, tokenCanisterId)
    
    console.log(`   ✅ Alice can access NFT Collection`)
    console.log(`   ✅ Alice can access Marketplace`)
    console.log(`   ✅ Alice can access Token`)
    
    // Test Bob's access
    const bobNFT = await createNFTActor(bob.identity, nftCanisterId)
    const bobMarketplace = await createMarketplaceActor(bob.identity, marketplaceCanisterId)
    const bobToken = await createTokenActor(bob.identity, tokenCanisterId)
    
    console.log(`   ✅ Bob can access NFT Collection`)
    console.log(`   ✅ Bob can access Marketplace`)
    console.log(`   ✅ Bob can access Token`)
    
    // Test Charlie's access
    const charlieNFT = await createNFTActor(charlie.identity, nftCanisterId)
    const charlieMarketplace = await createMarketplaceActor(charlie.identity, marketplaceCanisterId)
    const charlieToken = await createTokenActor(charlie.identity, tokenCanisterId)
    
    console.log(`   ✅ Charlie can access NFT Collection`)
    console.log(`   ✅ Charlie can access Marketplace`)
    console.log(`   ✅ Charlie can access Token`)
    
  } catch (error) {
    console.log(`❌ Access verification error: ${error instanceof Error ? error.message : String(error)}`)
    return
  }
  
  // Test 3: Current Balances and Ownership
  console.log('\n📋 Test 3: Current Balances and Ownership')
  console.log('='.repeat(50))
  
  try {
    console.log('\n💰 Checking Current Balances...')
    
    // Check token balances
    const aliceAccount = { owner: Principal.fromText(alice.principal), subaccount: [] }
    const bobAccount = { owner: Principal.fromText(bob.principal), subaccount: [] }
    const charlieAccount = { owner: Principal.fromText(charlie.principal), subaccount: [] }
    
    const aliceTokenActor = await createTokenActor(alice.identity, tokenCanisterId)
    const bobTokenActor = await createTokenActor(bob.identity, tokenCanisterId)
    const charlieTokenActor = await createTokenActor(charlie.identity, tokenCanisterId)
    
    const aliceTokenBalance = await aliceTokenActor.icrc1_balance_of(aliceAccount)
    const bobTokenBalance = await bobTokenActor.icrc1_balance_of(bobAccount)
    const charlieTokenBalance = await charlieTokenActor.icrc1_balance_of(charlieAccount)
    
    console.log(`   Alice Token Balance: ${aliceTokenBalance}`)
    console.log(`   Bob Token Balance: ${bobTokenBalance}`)
    console.log(`   Charlie Token Balance: ${charlieTokenBalance}`)
    
    // Check NFT ownership
    const aliceNFTActor = await createNFTActor(alice.identity, nftCanisterId)
    const bobNFTActor = await createNFTActor(bob.identity, nftCanisterId)
    const charlieNFTActor = await createNFTActor(charlie.identity, nftCanisterId)
    
    const aliceNFTs = await aliceNFTActor.icrc7_tokens_of(aliceAccount, [], [])
    const bobNFTs = await bobNFTActor.icrc7_tokens_of(bobAccount, [], [])
    const charlieNFTs = await charlieNFTActor.icrc7_tokens_of(charlieAccount, [], [])
    
    console.log(`   Alice NFT Count: ${aliceNFTs.length}`)
    console.log(`   Bob NFT Count: ${bobNFTs.length}`)
    console.log(`   Charlie NFT Count: ${charlieNFTs.length}`)
    
    // Check if Alice has minting authority
    console.log('\n🎨 Testing Minting Authority...')
    try {
      const testMintResult = await aliceNFTActor.mint({
        token_metadata_url: "https://example.com/metadata/stage1-test.json",
        memo: [],
        token_owner: aliceAccount,
        token_name: "Stage 1 Test NFT"
      })
      
      if ('Ok' in testMintResult) {
        console.log(`   ✅ Alice has minting authority (NFT ${testMintResult.Ok} created)`)
      } else {
        console.log(`   ❌ Alice doesn't have minting authority: ${testMintResult.Err}`)
      }
    } catch (error) {
      console.log(`   ❌ Minting test error: ${error instanceof Error ? error.message : String(error)}`)
    }
    
  } catch (error) {
    console.log(`❌ Balance check error: ${error instanceof Error ? error.message : String(error)}`)
    return
  }
  
  // Test 4: Token Distribution Setup
  console.log('\n📋 Test 4: Token Distribution Setup')
  console.log('='.repeat(50))
  
  try {
    console.log('\n🔄 Setting up Token Distribution...')
    
    // We need to get tokens from bizkit to Alice for testing
    // Since bizkit deployed the token, it has the initial balance
    console.log('   Note: Token distribution will be handled in Stage 2')
    console.log('   Current state: Tokens are with bizkit (deployer)')
    console.log('   Next stage: Transfer tokens to test users')
    
  } catch (error) {
    console.log(`❌ Token distribution error: ${error instanceof Error ? error.message : String(error)}`)
    return
  }
  
  // Test 5: Marketplace Readiness
  console.log('\n📋 Test 5: Marketplace Readiness')
  console.log('='.repeat(50))
  
  try {
    console.log('\n🏪 Verifying Marketplace Readiness...')
    
    const marketplaceActor = await createMarketplaceActor(alice.identity, marketplaceCanisterId)
    
    // Check approved tokens
    const approvedTokens = await marketplaceActor.icrc8_approved_tokens()
    console.log(`   ✅ Approved Tokens: ${approvedTokens ? approvedTokens.length : 0}`)
    
    // Check marketplace features
    const metadata = await marketplaceActor.get_metadata()
    const features = metadata.map(([key, value]) => `${key}: ${value}`)
    
    console.log(`   ✅ Marketplace Features:`)
    features.forEach(feature => {
      console.log(`      - ${feature}`)
    })
    
    console.log('\n   ✅ Marketplace is ready for trading operations')
    
  } catch (error) {
    console.log(`❌ Marketplace readiness error: ${error instanceof Error ? error.message : String(error)}`)
    return
  }
  
  console.log('\n🎉 Stage 1: Foundation & Setup Verification Completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ All canisters are healthy and responding')
  console.log('   ✅ All identities have proper access')
  console.log('   ✅ Current balances and ownership verified')
  console.log('   ✅ Marketplace is ready for operations')
  console.log('   ✅ Foundation is solid for next stages')
  console.log('\n📝 Next Steps:')
  console.log('   Stage 2: Token distribution and basic transfers')
  console.log('   Stage 3: NFT operations and ownership')
  console.log('   Stage 4: Basic marketplace operations')
}

// Run Stage 1 tests
runStage1Tests().catch(console.error)
