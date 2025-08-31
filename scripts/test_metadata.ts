import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory as marketplaceIdlFactory } from '../src/declarations/marketplace/marketplace.did.js';
import type { _SERVICE as MarketplaceService } from '../src/declarations/marketplace/marketplace.did.d.ts';

// Canister IDs
const CANISTER_IDS = {
  marketplace: 'u6s2n-gx777-77774-qaaba-cai',
};

// Initialize agent and actor
async function createMarketplaceActor(): Promise<MarketplaceService> {
  const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });
  await agent.fetchRootKey();

  return Actor.createActor<MarketplaceService>(marketplaceIdlFactory, {
    agent,
    canisterId: CANISTER_IDS.marketplace,
  });
}

async function testMetadata() {
  console.log('🧪 Testing Marketplace Metadata Compliance...\n');

  const marketplaceActor = await createMarketplaceActor();

  try {
    // Test ICRC-10 Supported Standards
    console.log('📋 Testing ICRC-10 Supported Standards:');
    const supportedStandards = await marketplaceActor.icrc10_supported_standards();
    console.log(`   Found ${supportedStandards.length} supported standards:`);
    supportedStandards.forEach(standard => {
      console.log(`   - ${standard.name}: ${standard.url}`);
    });
    console.log('');

    // Test ICRC-8 Metadata
    console.log('🏪 Testing ICRC-8 Marketplace Metadata:');
    const icrc8Metadata = await marketplaceActor.icrc8_metadata();
    console.log(`   Found ${icrc8Metadata.length} metadata fields:`);
    icrc8Metadata.forEach(metadata => {
      console.log(`   - ${metadata.key}: ${metadata.value}`);
    });
    console.log('');

    // Test Legacy Metadata (for backward compatibility)
    console.log('🔄 Testing Legacy Metadata:');
    const legacyMetadata = await marketplaceActor.get_metadata();
    console.log(`   Found ${legacyMetadata.length} legacy metadata fields:`);
    legacyMetadata.forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    console.log('');

    // Test Approved Tokens
    console.log('✅ Testing Approved Tokens:');
    const approvedTokens = await marketplaceActor.icrc8_approved_tokens();
    if (approvedTokens.length > 0) {
      console.log(`   Found ${approvedTokens.length} approved tokens:`);
      approvedTokens.forEach(token => {
        console.log(`   - ${token}`);
      });
    } else {
      console.log('   No approved tokens found');
    }
    console.log('');

    // Test Health Check
    console.log('🏥 Testing Health Check:');
    const healthStatus = await marketplaceActor.health_check();
    console.log(`   Health Status: ${healthStatus}`);
    console.log('');

    console.log('✅ All metadata tests passed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ICRC-10 Standards: ${supportedStandards.length}`);
    console.log(`   - ICRC-8 Metadata Fields: ${icrc8Metadata.length}`);
    console.log(`   - Legacy Metadata Fields: ${legacyMetadata.length}`);
    console.log(`   - Approved Tokens: ${approvedTokens.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error testing metadata:', error);
    throw error;
  }
}

// Run the test
(async () => {
  await testMetadata();
})().catch(console.error);
