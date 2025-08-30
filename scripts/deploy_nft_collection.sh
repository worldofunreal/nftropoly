#!/bin/bash

# NFT Collection Deployment Script
# This script deploys the NFT collection canister with proper initialization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COLLECTION_NAME=${COLLECTION_NAME:-"My NFT Collection"}
COLLECTION_SYMBOL=${COLLECTION_SYMBOL:-"MNFT"}
COLLECTION_DESCRIPTION=${COLLECTION_DESCRIPTION:-"A unique NFT collection"}
SUPPLY_CAP=${SUPPLY_CAP:-"10000"}
NETWORK=${NETWORK:-"local"}

echo -e "${BLUE}🚀 Deploying NFT Collection Canister${NC}"
echo "=================================="

# Check if dfx is running
if ! dfx ping 2>/dev/null; then
    echo -e "${RED}❌ DFX is not running. Please start DFX first.${NC}"
    exit 1
fi

# Create canister if it doesn't exist
echo -e "${BLUE}📋 Creating canister...${NC}"
dfx canister create nft_collection --no-wallet

# Build the canister
echo -e "${BLUE}🔨 Building canister...${NC}"
dfx build nft_collection

# Deploy with initialization arguments
echo -e "${BLUE}🚀 Deploying canister with initialization arguments...${NC}"

# Get the current principal
CURRENT_PRINCIPAL=$(dfx identity get-principal)

# Deploy with all required arguments
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
      authorized_principals = vec { principal "'$CURRENT_PRINCIPAL'" };
      minting_authorities = vec { principal "'$CURRENT_PRINCIPAL'" };
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ NFT Collection deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Canister ID:${NC}"
    dfx canister id nft_collection
    echo ""
    echo -e "${YELLOW}🌐 Canister URL:${NC}"
    echo "http://localhost:4943/?canisterId=$(dfx canister id nft_collection)"
    echo ""
    echo -e "${BLUE}🎉 Ready to test!${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi
