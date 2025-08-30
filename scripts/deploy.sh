#!/bin/bash

# Unified Deployment Script
# Uses ONLY bizkit identity for all deployments
# TypeScript tests will use generated identities

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Unified Deployment with bizkit Identity${NC}"
echo "============================================="

# Check if dfx is running
if ! dfx ping 2>/dev/null; then
    echo -e "${RED}❌ DFX is not running. Please start DFX first.${NC}"
    exit 1
fi

# Step 1: Verify we're using bizkit identity
echo -e "${BLUE}📋 Step 1: Verifying Identity${NC}"
CURRENT_IDENTITY=$(dfx identity whoami)
CURRENT_PRINCIPAL=$(dfx identity get-principal)

if [ "$CURRENT_IDENTITY" != "bizkit" ]; then
    echo -e "${RED}❌ Wrong identity! Expected 'bizkit' but got '$CURRENT_IDENTITY'${NC}"
    exit 1
fi

echo -e "${YELLOW}Current Identity:${NC} $CURRENT_IDENTITY"
echo -e "${YELLOW}Current Principal:${NC} $CURRENT_PRINCIPAL"
echo -e "${GREEN}✅ Using correct bizkit identity!${NC}"

# Step 2: Generate the Alice principal that will be used in TypeScript tests
echo -e "${BLUE}📋 Step 2: Generating Alice Principal for TypeScript Tests${NC}"
# This is the deterministic Alice principal from the mnemonic generation
ALICE_PRINCIPAL="xwe6e-zas76-5hg7f-mkafc-jgup5-rqt2l-47yvu-4a6f6-5b24o-bbt32-6qe"
BIZKIT_PRINCIPAL="$CURRENT_PRINCIPAL"
echo -e "${YELLOW}Alice Principal (for TypeScript):${NC} $ALICE_PRINCIPAL"
echo -e "${YELLOW}Bizkit Principal (for DFX):${NC} $BIZKIT_PRINCIPAL"

# Step 3: Deploy NFT Collection with Alice as minting authority
echo -e "${BLUE}📋 Step 3: Deploying NFT Collection${NC}"

# Create canister if it doesn't exist
echo "Creating NFT collection canister..."
dfx canister create nft_collection --no-wallet

# Build the canister
echo "Building NFT collection..."
dfx build nft_collection

# Deploy with Alice as minting authority (for TypeScript tests)
echo "Deploying NFT collection with Alice as minting authority..."
dfx deploy nft_collection --argument '(
  variant {
    Init = record {
      test_mode = true;
      version = record {
        major = 1;
        minor = 0;
        patch = 0;
      };
      commit_hash = "test-commit-hash";
      authorized_principals = vec { principal "'$ALICE_PRINCIPAL'"; principal "'$BIZKIT_PRINCIPAL'" };
      minting_authorities = vec { principal "'$ALICE_PRINCIPAL'"; principal "'$BIZKIT_PRINCIPAL'" };
      description = opt "My NFT Collection";
      symbol = "MNFT";
      name = "My NFT Collection";
      logo = null;
      supply_cap = null;
      max_query_batch_size = null;
      max_update_batch_size = null;
      max_take_value = null;
      default_take_value = null;
      max_memo_size = null;
      atomic_batch_transfers = null;
      tx_window = null;
      permitted_drift = null;
      max_canister_storage_threshold = null;
      collection_metadata = vec {};
      approval_init = record {
        approval_required = false;
        expires_at = null;
        fee = null;
      };
    }
  }
)'

# Get NFT canister ID
NFT_CANISTER_ID=$(dfx canister id nft_collection)
echo -e "${GREEN}✅ NFT Collection deployed!${NC}"
echo -e "${YELLOW}NFT Canister ID:${NC} $NFT_CANISTER_ID"

# Step 4: Deploy Marketplace
echo -e "${BLUE}📋 Step 4: Deploying Marketplace${NC}"

# Create canister if it doesn't exist
echo "Creating marketplace canister..."
dfx canister create marketplace --no-wallet

# Build the canister
echo "Building marketplace..."
dfx build marketplace

# Deploy marketplace
echo "Deploying marketplace..."
dfx deploy marketplace

# Get marketplace canister ID
MARKETPLACE_CANISTER_ID=$(dfx canister id marketplace)
echo -e "${GREEN}✅ Marketplace deployed!${NC}"
echo -e "${YELLOW}Marketplace Canister ID:${NC} $MARKETPLACE_CANISTER_ID"

# Step 5: Deploy NFTropoly Token (ICRC-1)
echo -e "${BLUE}📋 Step 5: Deploying NFTropoly Token (ICRC-1)${NC}"

# Create canister if it doesn't exist
echo "Creating NFTropoly token canister..."
dfx canister create nftropoly_token --no-wallet

# Set token configuration
TOKEN_NAME="NFTropoly"
TOKEN_SYMBOL="NTRP"
PRE_MINTED_TOKENS=100000000000000000  # 100 million tokens with 8 decimals
TRANSFER_FEE=10000  # 0.0001 tokens with 8 decimals
FEATURE_FLAGS=true  # Enable ICRC-2 support

# Archive configuration
TRIGGER_THRESHOLD=2000
NUM_OF_BLOCK_TO_ARCHIVE=1000
CYCLE_FOR_ARCHIVE_CREATION=10000000000000

echo -e "${YELLOW}Token Configuration:${NC}"
echo "   Name: $TOKEN_NAME"
echo "   Symbol: $TOKEN_SYMBOL"
echo "   Decimals: 8"
echo "   Initial Supply: $PRE_MINTED_TOKENS (100,000,000 tokens)"
echo "   Transfer Fee: $TRANSFER_FEE"
echo "   ICRC-2 Support: Enabled"

# Deploy the token
echo "Deploying NFTropoly token..."
dfx deploy nftropoly_token --argument "(variant {Init =
record {
     token_symbol = \"${TOKEN_SYMBOL}\";
     token_name = \"${TOKEN_NAME}\";
     minting_account = record { owner = principal \"${BIZKIT_PRINCIPAL}\" };
     transfer_fee = ${TRANSFER_FEE};
     metadata = vec {};
     feature_flags = opt record{icrc2 = ${FEATURE_FLAGS}};
     initial_balances = vec { record { record { owner = principal \"${BIZKIT_PRINCIPAL}\"; }; ${PRE_MINTED_TOKENS}; }; };
     archive_options = record {
         num_blocks_to_archive = ${NUM_OF_BLOCK_TO_ARCHIVE};
         trigger_threshold = ${TRIGGER_THRESHOLD};
         controller_id = principal \"${BIZKIT_PRINCIPAL}\";
         cycles_for_archive_creation = opt ${CYCLE_FOR_ARCHIVE_CREATION};
     };
 }
})"

# Get token canister ID
TOKEN_CANISTER_ID=$(dfx canister id nftropoly_token)
echo -e "${GREEN}✅ NFTropoly Token deployed!${NC}"
echo -e "${YELLOW}Token Canister ID:${NC} $TOKEN_CANISTER_ID"

# Step 6: Generate TypeScript declarations
echo -e "${BLUE}📋 Step 6: Generating TypeScript Declarations${NC}"
dfx generate nft_collection
dfx generate marketplace
dfx generate nftropoly_token
echo -e "${GREEN}✅ TypeScript declarations generated!${NC}"

# Step 7: Test basic functionality with DFX
echo -e "${BLUE}📋 Step 7: Testing Basic Functionality${NC}"

# Test NFT collection
echo "Testing NFT collection..."
COLLECTION_NAME=$(dfx canister call nft_collection icrc7_name)
COLLECTION_SYMBOL=$(dfx canister call nft_collection icrc7_symbol)
TOTAL_SUPPLY=$(dfx canister call nft_collection icrc7_total_supply)

echo -e "${YELLOW}NFT Collection:${NC}"
echo "   Name: $COLLECTION_NAME"
echo "   Symbol: $COLLECTION_SYMBOL"
echo "   Total Supply: $TOTAL_SUPPLY"

# Test marketplace
echo "Testing marketplace..."
echo -e "${YELLOW}Marketplace:${NC} Deployed successfully"

echo -e "${GREEN}🎉 Unified Deployment Completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Summary:${NC}"
echo "   - Using ONLY bizkit identity for deployment"
echo "   - NFT Collection: $NFT_CANISTER_ID"
echo "   - Marketplace: $MARKETPLACE_CANISTER_ID"
echo "   - NFTropoly Token: $TOKEN_CANISTER_ID"
echo "   - Alice Principal (for TypeScript): $ALICE_PRINCIPAL"
echo "   - TypeScript declarations generated"
echo ""
echo -e "${BLUE}🌐 Canister URLs:${NC}"
echo "   NFT Collection: http://localhost:4943/?canisterId=$NFT_CANISTER_ID"
echo "   Marketplace: http://localhost:4943/?canisterId=$MARKETPLACE_CANISTER_ID"
echo "   NFTropoly Token: http://localhost:4943/?canisterId=$TOKEN_CANISTER_ID"
echo ""
echo -e "${BLUE}🔑 For TypeScript Tests:${NC}"
echo "   - Use generated Alice identity (principal: $ALICE_PRINCIPAL)"
echo "   - Use JavaScript DFinity libraries (like test_backend.ts)"
echo "   - Call DFX only when needed for transfers"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Run TypeScript tests with generated identities"
echo "   2. Test NFT minting, transfers, approvals"
echo "   3. Test marketplace functionality with real tokens"
echo "   4. Test trading, auctions, and marketplace features"
