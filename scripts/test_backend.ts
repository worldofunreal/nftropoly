import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'
import { Keypair } from '@solana/web3.js'

// Import the generated TypeScript declarations
import { idlFactory } from '../src/declarations/backend/backend.did.js'
import type { _SERVICE as BackendService, User, CompactProfile, UserResult, Error } from '../src/declarations/backend/backend.did.d.ts'

// Test identities - we'll generate consistent mnemonics
const TEST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'] as const
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

// Generate consistent mnemonics based on name
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

// Identity generation utilities (same as CrossChainSeedService)
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

// Use the generated IDL factory from declarations
const createBackendActor = async (identity: Ed25519KeyIdentity, canisterId: string): Promise<BackendService> => {
  const agent = new HttpAgent({
    host: 'https://icp0.io',
    identity: identity as any
  })
  
  // Fetch root key for mainnet
  await agent.fetchRootKey()
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  })
}

// Test scenarios
const runTests = async (): Promise<void> => {
  console.log('🚀 Starting Backend Testing with Multiple Identities\n')
  
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
    console.log(`   Mnemonic: ${mnemonic}`)
  }
  
  // Get backend canister ID
  const backendCanisterId = 'bhhab-xyaaa-aaaap-qqchq-cai' // Mainnet canister ID
  
  console.log(`\n📡 Connecting to backend canister: ${backendCanisterId}\n`)
  
  // Test 1: Signup all users
  console.log('📝 Test 1: User Registration')
  console.log('='.repeat(50))
  
  for (const identity of identities) {
    try {
      const actor = await createBackendActor(identity.identity, backendCanisterId)
      
      const username = identity.name.toLowerCase()
      const result = await actor.signup(
        username,
        [identity.evmAddress],
        [identity.btcAddress], 
        [identity.solAddress]
      )
      
      if ('Ok' in result) {
        console.log(`✅ ${identity.name} registered successfully`)
        console.log(`   Username: ${result.Ok.username}`)
        console.log(`   Following: ${result.Ok.following_count}, Followers: ${result.Ok.followers_count}`)
      } else {
        console.log(`❌ ${identity.name} registration failed:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ ${identity.name} registration error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Test 2: Follow relationships
  console.log('\n👥 Test 2: Following Relationships')
  console.log('='.repeat(50))
  
  // Alice follows Bob and Charlie
  // Bob follows Charlie and Diana
  // Charlie follows Diana and Eve
  // Diana follows Eve
  // Eve follows Alice
  
  const followRelationships: Array<{ follower: TestName; following: TestName }> = [
    { follower: 'Alice', following: 'Bob' },
    { follower: 'Alice', following: 'Charlie' },
    { follower: 'Bob', following: 'Charlie' },
    { follower: 'Bob', following: 'Diana' },
    { follower: 'Charlie', following: 'Diana' },
    { follower: 'Charlie', following: 'Eve' },
    { follower: 'Diana', following: 'Eve' },
    { follower: 'Eve', following: 'Alice' }
  ]
  
  for (const relationship of followRelationships) {
    const follower = identities.find(id => id.name === relationship.follower)
    const following = identities.find(id => id.name === relationship.following)
    
    if (!follower || !following) {
      console.log(`❌ Error: Could not find identities for ${relationship.follower} or ${relationship.following}`)
      continue
    }
    
    try {
      const actor = await createBackendActor(follower.identity, backendCanisterId)
      const result = await actor.follow_user(Principal.fromText(following.principal))
      
      if ('Ok' in result) {
        console.log(`✅ ${follower.name} is now following ${following.name}`)
      } else {
        console.log(`❌ ${follower.name} failed to follow ${following.name}:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ Error: ${follower.name} -> ${following.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Test 3: Check following/followers counts
  console.log('\n📊 Test 3: Following/Followers Counts')
  console.log('='.repeat(50))
  
  for (const identity of identities) {
    try {
      const actor = await createBackendActor(identity.identity, backendCanisterId)
      const result = await actor.get_user(Principal.fromText(identity.principal))
      
      if ('Ok' in result) {
        console.log(`${identity.name}:`)
        console.log(`   Following: ${result.Ok.following_count}`)
        console.log(`   Followers: ${result.Ok.followers_count}`)
      } else {
        console.log(`❌ Failed to get ${identity.name}:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ Error getting ${identity.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Test 4: Get following lists
  console.log('\n📋 Test 4: Following Lists')
  console.log('='.repeat(50))
  
  for (const identity of identities) {
    try {
      const actor = await createBackendActor(identity.identity, backendCanisterId)
      const following = await actor.get_following(Principal.fromText(identity.principal))
      const followers = await actor.get_followers(Principal.fromText(identity.principal))
      
      console.log(`${identity.name}:`)
      console.log(`   Following: ${following.map((p: any) => p.username).join(', ')}`)
      console.log(`   Followers: ${followers.map((p: any) => p.username).join(', ')}`)
    } catch (error) {
      console.log(`❌ Error getting lists for ${identity.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Test 5: Unfollow test
  console.log('\n🚫 Test 5: Unfollow Test')
  console.log('='.repeat(50))
  
  // Alice unfollows Bob
  const aliceIdentity = identities.find(id => id.name === 'Alice')
  const bob = identities.find(id => id.name === 'Bob')
  
  if (!aliceIdentity || !bob) {
    console.log('❌ Error: Could not find Alice or Bob identities')
    return
  }
  
  try {
    const actor = await createBackendActor(aliceIdentity.identity, backendCanisterId)
    const result = await actor.unfollow_user(Principal.fromText(bob.principal))
    
    if ('Ok' in result) {
      console.log(`✅ Alice unfollowed Bob`)
      
      // Check updated counts
      const aliceResult = await actor.get_user(Principal.fromText(aliceIdentity.principal))
      const bobResult = await actor.get_user(Principal.fromText(bob.principal))
      
      if ('Ok' in aliceResult && 'Ok' in bobResult) {
        console.log(`   Alice following: ${aliceResult.Ok.following_count}`)
        console.log(`   Bob followers: ${bobResult.Ok.followers_count}`)
      }
    } else {
      console.log(`❌ Alice failed to unfollow Bob:`, result.Err)
    }
  } catch (error) {
    console.log(`❌ Unfollow error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 6: Image upload test
  console.log('\n🖼️ Test 6: Image Upload Test')
  console.log('='.repeat(50))
  
  // Use Alice for the upload test
  const aliceForUpload = identities.find(id => id.name === 'Alice')
  if (!aliceForUpload) {
    console.log('❌ Error: Could not find Alice identity')
    return
  }
  
  try {
    const actor = await createBackendActor(aliceForUpload.identity, backendCanisterId)
    
    // Read the logo.png file
    const fs = require('fs')
    const path = require('path')
    const logoPath = path.join(__dirname, '..', 'src', 'frontend', 'public', 'logo.png')
    
    if (!fs.existsSync(logoPath)) {
      console.log('❌ Error: logo.png not found at', logoPath)
      return
    }
    
    const fileData = fs.readFileSync(logoPath)
    const fileSize = fileData.length
    const filePath = `/assets/avatar/${aliceForUpload.principal}.png`
    
    console.log(`📁 Uploading logo.png as ${filePath}`)
    console.log(`   File size: ${fileSize} bytes`)
    
    // Calculate SHA-256 hash
    const crypto = require('crypto')
    const fileHash = crypto.createHash('sha256').update(fileData).digest('hex')
    
    // Initialize upload
    console.log('🔄 Initializing upload...')
    await actor.init_upload(filePath, BigInt(fileSize), [BigInt(1024 * 1024)], fileHash)
    
    // Upload in chunks
    const chunkSize = 1024 * 1024 // 1MB chunks
    const totalChunks = Math.ceil(fileSize / chunkSize)
    
    console.log(`📦 Uploading ${totalChunks} chunks...`)
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, fileSize)
      const chunk = fileData.slice(start, end)
      
      await actor.store_chunk(BigInt(i), Array.from(chunk), filePath)
      console.log(`   Chunk ${i + 1}/${totalChunks} uploaded`)
    }
    
    // Finalize upload
    console.log('✅ Finalizing upload...')
    const result = await actor.finalize_upload(filePath)
    
    if ('Ok' in result) {
      console.log(`🎉 Upload successful!`)
      console.log(`   File path: ${result.Ok}`)
      
      // Test the URL with correct format
      const testUrl = `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=${backendCanisterId}${result.Ok}`
      console.log(`   Test URL: ${testUrl}`)
      
      // Try to fetch the image
      console.log('🔍 Testing image retrieval...')
      const response = await fetch(testUrl)
      if (response.ok) {
        console.log(`✅ Image served successfully!`)
        console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        console.log(`   Content-Length: ${response.headers.get('content-length')}`)
      } else {
        console.log(`❌ Failed to retrieve image: ${response.status} ${response.statusText}`)
      }
    } else {
      console.log(`❌ Upload failed:`, result.Err)
    }
    
  } catch (error) {
    console.log(`❌ Upload error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Test 7: Personal endpoints test
  console.log('\n🔍 Test 7: Personal Endpoints Test')
  console.log('='.repeat(50))
  
  // Test search_users_personal
  console.log('\n📝 Testing search_users_personal...')
  
  const aliceForSearch = identities.find(id => id.name === 'Alice')
  if (!aliceForSearch) {
    console.log('❌ Error: Could not find Alice identity')
    return
  }
  
  try {
    const actor = await createBackendActor(aliceForSearch.identity, backendCanisterId)
    
    // Search for users with personal context
    const searchResult = await actor.search_users_personal('alice', 10, Principal.fromText(aliceForSearch.principal))
    
    if ('Ok' in searchResult) {
      console.log(`✅ Personal search successful!`)
      console.log(`   Found ${searchResult.Ok.length} users`)
      
      for (const profile of searchResult.Ok) {
        console.log(`   - ${profile.username} (${profile.display_name || 'No display name'})`)
        console.log(`     is_following_me: ${profile.is_following_me}`)
        console.log(`     am_following_them: ${profile.am_following_them}`)
      }
    } else {
      console.log(`❌ Personal search failed:`, searchResult.Err)
    }
    
    // Test get_user_personal
    console.log('\n👤 Testing get_user_personal...')
    
    const bobForPersonal = identities.find(id => id.name === 'Bob')
    if (!bobForPersonal) {
      console.log('❌ Error: Could not find Bob identity')
      return
    }
    
    const personalResult = await actor.get_user_personal(
      Principal.fromText(bobForPersonal.principal),
      Principal.fromText(aliceForSearch.principal)
    )
    
    if ('Ok' in personalResult) {
      console.log(`✅ Personal user lookup successful!`)
      console.log(`   User: ${personalResult.Ok.username} (${personalResult.Ok.display_name || 'No display name'})`)
      console.log(`   is_following_me: ${personalResult.Ok.is_following_me}`)
      console.log(`   am_following_them: ${personalResult.Ok.am_following_them}`)
      console.log(`   is_verified: ${personalResult.Ok.is_verified}`)
      console.log(`   bio: ${personalResult.Ok.bio || 'No bio'}`)
    } else {
      console.log(`❌ Personal user lookup failed:`, personalResult.Err)
    }
    
    // Test personal search with different caller
    console.log('\n🔄 Testing personal search with different caller...')
    
    const charlieForSearch = identities.find(id => id.name === 'Charlie')
    if (!charlieForSearch) {
      console.log('❌ Error: Could not find Charlie identity')
      return
    }
    
    const charlieActor = await createBackendActor(charlieForSearch.identity, backendCanisterId)
    const charlieSearchResult = await charlieActor.search_users_personal('alice', 5, Principal.fromText(charlieForSearch.principal))
    
    if ('Ok' in charlieSearchResult) {
      console.log(`✅ Charlie's personal search successful!`)
      console.log(`   Found ${charlieSearchResult.Ok.length} users`)
      
      for (const profile of charlieSearchResult.Ok) {
        console.log(`   - ${profile.username} (${profile.display_name || 'No display name'})`)
        console.log(`     is_following_me: ${profile.is_following_me}`)
        console.log(`     am_following_them: ${profile.am_following_them}`)
      }
    } else {
      console.log(`❌ Charlie's personal search failed:`, charlieSearchResult.Err)
    }
    
    // Test personal lookup of self
    console.log('\n🪞 Testing personal lookup of self...')
    
    const selfResult = await actor.get_user_personal(
      Principal.fromText(aliceForSearch.principal),
      Principal.fromText(aliceForSearch.principal)
    )
    
    if ('Ok' in selfResult) {
      console.log(`✅ Self lookup successful!`)
      console.log(`   User: ${selfResult.Ok.username} (${selfResult.Ok.display_name || 'No display name'})`)
      console.log(`   is_following_me: ${selfResult.Ok.is_following_me}`)
      console.log(`   am_following_them: ${selfResult.Ok.am_following_them}`)
    } else {
      console.log(`❌ Self lookup failed:`, selfResult.Err)
    }
    
    // Test 8: Full personal endpoints test
    console.log('\n🔍 Test 8: Full Personal Endpoints Test')
    console.log('='.repeat(50))
    
    // Test get_user_personal with full data
    console.log('\n👤 Testing get_user_personal with full data...')
    
    const fullPersonalResult = await actor.get_user_personal(
      Principal.fromText(bobForPersonal.principal),
      Principal.fromText(aliceForSearch.principal)
    )
    
    if ('Ok' in fullPersonalResult) {
      console.log(`✅ Full personal user lookup successful!`)
      console.log(`   User: ${fullPersonalResult.Ok.username} (${fullPersonalResult.Ok.display_name || 'No display name'})`)
      console.log(`   Avatar: ${fullPersonalResult.Ok.avatar_url || 'No avatar'}`)
      console.log(`   Banner: ${fullPersonalResult.Ok.banner_url || 'No banner'}`)
      console.log(`   Location: ${fullPersonalResult.Ok.location || 'No location'}`)
      console.log(`   Website: ${fullPersonalResult.Ok.website || 'No website'}`)
      console.log(`   Following: ${fullPersonalResult.Ok.following_count}, Followers: ${fullPersonalResult.Ok.followers_count}`)
      console.log(`   is_following_me: ${fullPersonalResult.Ok.is_following_me}`)
      console.log(`   am_following_them: ${fullPersonalResult.Ok.am_following_them}`)
      console.log(`   is_verified: ${fullPersonalResult.Ok.is_verified}`)
      console.log(`   bio: ${fullPersonalResult.Ok.bio || 'No bio'}`)
      console.log(`   EVM: ${fullPersonalResult.Ok.evm_address || 'No EVM'}`)
      console.log(`   Bitcoin: ${fullPersonalResult.Ok.bitcoin_address || 'No Bitcoin'}`)
      console.log(`   Solana: ${fullPersonalResult.Ok.solana_address || 'No Solana'}`)
      console.log(`   Created: ${new Date(Number(fullPersonalResult.Ok.created_at) / 1000000).toISOString()}`)
      console.log(`   Updated: ${new Date(Number(fullPersonalResult.Ok.updated_at) / 1000000).toISOString()}`)
    } else {
      console.log(`❌ Full personal user lookup failed:`, fullPersonalResult.Err)
    }
    
  } catch (error) {
    console.log(`❌ Personal endpoints error: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  console.log('\n🎉 Testing completed!')
}

// Run the tests
runTests().catch(console.error)
