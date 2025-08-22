import { Ed25519KeyIdentity } from '@dfinity/identity'
import { Actor, HttpAgent } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import nacl from 'tweetnacl'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'
import { Keypair } from '@solana/web3.js'

// Import the generated TypeScript declarations
import { idlFactory } from '../src/declarations/backend/backend.did.js'
import type { _SERVICE as BackendService } from '../src/declarations/backend/backend.did.d.ts'

// Mainnet playground backend canister ID
const MAINNET_BACKEND_CANISTER_ID = '3z2ve-waaaa-aaaab-qacmq-cai'

// Generate a test identity
const generateTestIdentity = async (): Promise<{
  identity: Ed25519KeyIdentity
  principal: string
  evmAddress: string
  solAddress: string
  btcAddress: string
}> => {
  // Use a fixed mnemonic for consistent testing
  const mnemonic = 'test test test test test test test test test test test junk'
  
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
    btcAddress: `bc1${btcAccount.address.slice(2)}`
  }
}

// Create backend actor for mainnet
const createBackendActor = async (identity: Ed25519KeyIdentity): Promise<BackendService> => {
  const agent = new HttpAgent({
    host: 'https://icp0.io', // Mainnet
    identity: identity as any
  })
  
  // Fetch root key for mainnet
  await agent.fetchRootKey()
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: MAINNET_BACKEND_CANISTER_ID
  })
}

// Test image upload and retrieval
const testImageUpload = async (): Promise<void> => {
  console.log('🚀 Starting Mainnet Image Upload Test\n')
  
  try {
    // Generate test identity
    const identityData = await generateTestIdentity()
    console.log(`✅ Generated test identity: ${identityData.principal}`)
    
    // Create actor
    const actor = await createBackendActor(identityData.identity)
    console.log(`📡 Connected to mainnet backend: ${MAINNET_BACKEND_CANISTER_ID}`)
    
    // Register user first
    console.log('\n📝 Registering test user...')
    const signupResult = await actor.signup(
      'testuser',
      [identityData.evmAddress],
      [identityData.btcAddress],
      [identityData.solAddress]
    )
    
    if ('Err' in signupResult) {
      if (signupResult.Err.InvalidInput === 'User already exists') {
        console.log('✅ User already exists, continuing...')
      } else {
        console.log(`❌ Registration failed:`, signupResult.Err)
        return
      }
    } else {
      console.log('✅ User registered successfully')
    }
    
    // Read the actual logo.png file
    console.log('\n🖼️ Reading logo.png file...')
    const fs = require('fs')
    const path = require('path')
    const logoPath = path.join(__dirname, '..', 'src', 'frontend', 'public', 'logo.png')
    
    if (!fs.existsSync(logoPath)) {
      console.log('❌ Error: logo.png not found at', logoPath)
      return
    }
    
    const testImageData = fs.readFileSync(logoPath)
    const fileSize = testImageData.length
    const filePath = `/assets/avatar/${identityData.principal}.png`
    
    console.log(`📁 Uploading test image as ${filePath}`)
    console.log(`   File size: ${fileSize} bytes`)
    
    // Calculate SHA-256 hash
    const crypto = require('crypto')
    const fileHash = crypto.createHash('sha256').update(testImageData).digest('hex')
    
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
      const chunk = testImageData.slice(start, end)
      
      await actor.store_chunk(BigInt(i), Array.from(chunk), filePath)
      console.log(`   Chunk ${i + 1}/${totalChunks} uploaded`)
    }
    
    // Finalize upload
    console.log('✅ Finalizing upload...')
    const result = await actor.finalize_upload(filePath)
    
    if ('Ok' in result) {
      console.log(`🎉 Upload successful!`)
      console.log(`   File path: ${result.Ok}`)
      
      // Test the URL on mainnet
      const testUrl = `https://${MAINNET_BACKEND_CANISTER_ID}.raw.icp0.io${result.Ok}`
      console.log(`   Test URL: ${testUrl}`)
      
      // Try to fetch the image
      console.log('\n🔍 Testing image retrieval...')
      const response = await fetch(testUrl)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        const contentLength = response.headers.get('content-length')
        
        console.log(`✅ Image served successfully!`)
        console.log(`   Content-Type: ${contentType}`)
        console.log(`   Content-Length: ${contentLength}`)
        console.log(`   Status: ${response.status}`)
        
        // Check if it's actually an image
        if (contentType && contentType.startsWith('image/')) {
          console.log(`✅ Confirmed: Response is an image!`)
        } else {
          console.log(`⚠️ Warning: Response is not an image (${contentType})`)
        }
      } else {
        console.log(`❌ Failed to retrieve image: ${response.status} ${response.statusText}`)
        
        // Try to get response text for debugging
        try {
          const errorText = await response.text()
          console.log(`   Error response: ${errorText.substring(0, 200)}...`)
        } catch (e) {
          console.log(`   Could not read error response`)
        }
      }
      
    } else {
      console.log(`❌ Upload failed:`, result.Err)
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error instanceof Error ? error.message : String(error)}`)
    if (error instanceof Error && error.stack) {
      console.log(`   Stack trace: ${error.stack}`)
    }
  }
  
  console.log('\n🎉 Mainnet image test completed!')
}



// Run the test
testImageUpload().catch(console.error)
