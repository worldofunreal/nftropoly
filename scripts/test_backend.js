const { Ed25519KeyIdentity } = require('@dfinity/identity')
const { Actor, HttpAgent } = require('@dfinity/agent')
const { Principal } = require('@dfinity/principal')
const nacl = require('tweetnacl')
const bip39 = require('bip39')
const { ethers } = require('ethers')
const { Keypair } = require('@solana/web3.js')

// Import the generated IDL factory
const { idlFactory } = require('../src/declarations/backend/backend.did.js')

// Test identities - we'll generate consistent mnemonics
const TEST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']

// Generate consistent mnemonics based on name
const generateMnemonic = (name) => {
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
const generateIdentity = async (mnemonic) => {
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
    principal: identity.getPrincipal().toText(),
    evmAddress: evmAccount.address,
    solAddress: solKeypair.publicKey.toString(),
    btcAddress: `bc1${btcAccount.address.slice(2)}` // Simplified for testing
  }
}

// Use the generated IDL factory from declarations

const createBackendActor = async (identity, canisterId) => {
  const agent = new HttpAgent({
    host: 'http://127.0.0.1:4943',
    identity
  })
  
  // Fetch root key for local development
  await agent.fetchRootKey()
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  })
}

// Test scenarios
const runTests = async () => {
  console.log('🚀 Starting Backend Testing with Multiple Identities\n')
  
  // Generate all identities
  const identities = []
  for (const name of TEST_NAMES) {
    const mnemonic = generateMnemonic(name)
    const identityData = await generateIdentity(mnemonic)
    identities.push({
      name,
      ...identityData
    })
    console.log(`✅ Generated ${name}: ${identityData.principal}`)
    console.log(`   Mnemonic: ${mnemonic}`)
  }
  
  // Get backend canister ID
  const backendCanisterId = 'uxrrr-q7777-77774-qaaaq-cai' // From dfx deploy output
  
  console.log(`\n📡 Connecting to backend canister: ${backendCanisterId}\n`)
  
  // Test 1: Signup all users
  console.log('📝 Test 1: User Registration')
  console.log('=' * 50)
  
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
      
      if (result.Ok) {
        console.log(`✅ ${identity.name} registered successfully`)
        console.log(`   Username: ${result.Ok.username}`)
        console.log(`   Following: ${result.Ok.following_count}, Followers: ${result.Ok.followers_count}`)
      } else {
        console.log(`❌ ${identity.name} registration failed:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ ${identity.name} registration error: ${error.message}`)
    }
  }
  
  // Test 2: Follow relationships
  console.log('\n👥 Test 2: Following Relationships')
  console.log('=' * 50)
  
  // Alice follows Bob and Charlie
  // Bob follows Charlie and Diana
  // Charlie follows Diana and Eve
  // Diana follows Eve
  // Eve follows Alice
  
  const followRelationships = [
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
    
    try {
      const actor = await createBackendActor(follower.identity, backendCanisterId)
      const result = await actor.follow_user(Principal.fromText(following.principal))
      
      if (result.Ok) {
        console.log(`✅ ${follower.name} is now following ${following.name}`)
      } else {
        console.log(`❌ ${follower.name} failed to follow ${following.name}:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ Error: ${follower.name} -> ${following.name}: ${error.message}`)
    }
  }
  
  // Test 3: Check following/followers counts
  console.log('\n📊 Test 3: Following/Followers Counts')
  console.log('=' * 50)
  
  for (const identity of identities) {
    try {
      const actor = await createBackendActor(identity.identity, backendCanisterId)
      const result = await actor.get_user(Principal.fromText(identity.principal))
      
      if (result.Ok) {
        console.log(`${identity.name}:`)
        console.log(`   Following: ${result.Ok.following_count}`)
        console.log(`   Followers: ${result.Ok.followers_count}`)
      } else {
        console.log(`❌ Failed to get ${identity.name}:`, result.Err)
      }
    } catch (error) {
      console.log(`❌ Error getting ${identity.name}: ${error.message}`)
    }
  }
  
  // Test 4: Get following lists
  console.log('\n📋 Test 4: Following Lists')
  console.log('=' * 50)
  
  for (const identity of identities) {
    try {
      const actor = await createBackendActor(identity.identity, backendCanisterId)
      const following = await actor.get_following(Principal.fromText(identity.principal))
      const followers = await actor.get_followers(Principal.fromText(identity.principal))
      
      console.log(`${identity.name}:`)
      console.log(`   Following: ${following.map(p => p.username).join(', ')}`)
      console.log(`   Followers: ${followers.map(p => p.username).join(', ')}`)
    } catch (error) {
      console.log(`❌ Error getting lists for ${identity.name}: ${error.message}`)
    }
  }
  
  // Test 5: Unfollow test
  console.log('\n🚫 Test 5: Unfollow Test')
  console.log('=' * 50)
  
  // Alice unfollows Bob
  const alice = identities.find(id => id.name === 'Alice')
  const bob = identities.find(id => id.name === 'Bob')
  
  try {
    const actor = await createBackendActor(alice.identity, backendCanisterId)
    const result = await actor.unfollow_user(Principal.fromText(bob.principal))
    
    if (result.Ok) {
      console.log(`✅ Alice unfollowed Bob`)
      
      // Check updated counts
      const aliceResult = await actor.get_user(Principal.fromText(alice.principal))
      const bobResult = await actor.get_user(Principal.fromText(bob.principal))
      
      if (aliceResult.Ok && bobResult.Ok) {
        console.log(`   Alice following: ${aliceResult.Ok.following_count}`)
        console.log(`   Bob followers: ${bobResult.Ok.followers_count}`)
      }
    } else {
      console.log(`❌ Alice failed to unfollow Bob:`, result.Err)
    }
  } catch (error) {
    console.log(`❌ Unfollow error: ${error.message}`)
  }
  
  console.log('\n🎉 Testing completed!')
}

// Run the tests
runTests().catch(console.error)
