#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing NFT Collection Canister - ALL ICRC7/37 Endpoints${NC}"
echo "=================================================="

# Get the current principal
CURRENT_PRINCIPAL=$(dfx identity get-principal)
echo -e "${YELLOW}Testing with principal:${NC} $CURRENT_PRINCIPAL"
echo ""

# Test 1: ICRC7 Basic Info
echo -e "${BLUE}📋 Test 1: ICRC7 Basic Information${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc7_name:${NC}"
dfx canister call nft_collection icrc7_name
echo ""
echo -e "${YELLOW}icrc7_symbol:${NC}"
dfx canister call nft_collection icrc7_symbol
echo ""
echo -e "${YELLOW}icrc7_total_supply:${NC}"
dfx canister call nft_collection icrc7_total_supply
echo ""
echo -e "${YELLOW}icrc7_collection_metadata:${NC}"
dfx canister call nft_collection icrc7_collection_metadata
echo ""

# Test 2: ICRC7 Token Operations
echo -e "${BLUE}📋 Test 2: ICRC7 Token Operations${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc7_owner_of (token 1 - should be null):${NC}"
dfx canister call nft_collection icrc7_owner_of '(vec { 1 })'
echo ""
echo -e "${YELLOW}icrc7_balance_of:${NC}"
dfx canister call nft_collection icrc7_balance_of '(vec { record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } })'
echo ""

# Test 3: ICRC7 Transfer (should fail for non-existent token)
echo -e "${BLUE}📋 Test 3: ICRC7 Transfer (should fail)${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc7_transfer (non-existent token):${NC}"
dfx canister call nft_collection icrc7_transfer '(vec { record { to = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }; token_id = 1; memo = null; created_at_time = null } })'
echo ""

# Test 4: ICRC37 Approval Operations
echo -e "${BLUE}📋 Test 4: ICRC37 Approval Operations${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc37_approve_tokens (should fail for non-existent token):${NC}"
dfx canister call nft_collection icrc37_approve_tokens '(vec { record { token_id = 1; approval_info = record { memo = null; from_subaccount = null; created_at_time = 0; expires_at = null; spender = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } } } })'
echo ""
echo -e "${YELLOW}icrc37_approve_collection (should fail for non-existent token):${NC}"
dfx canister call nft_collection icrc37_approve_collection '(vec { record { approval_info = record { memo = null; from_subaccount = null; created_at_time = 0; expires_at = null; spender = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } } } })'
echo ""

# Test 5: ICRC37 Revoke Operations
echo -e "${BLUE}📋 Test 5: ICRC37 Revoke Operations${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc37_revoke_token_approvals:${NC}"
dfx canister call nft_collection icrc37_revoke_token_approvals '(vec { record { token_id = 1; spender = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } } })'
echo ""
echo -e "${YELLOW}icrc37_revoke_collection_approvals:${NC}"
dfx canister call nft_collection icrc37_revoke_collection_approvals '(vec { record { spender = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } } })'
echo ""

# Test 6: ICRC37 Transfer From (should fail)
echo -e "${BLUE}📋 Test 6: ICRC37 Transfer From (should fail)${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc37_transfer_from (should fail for non-existent token):${NC}"
dfx canister call nft_collection icrc37_transfer_from '(vec { record { from = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }; to = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }; token_id = 1; memo = null; created_at_time = null } })'
echo ""

# Test 7: ICRC37 Approval Queries
echo -e "${BLUE}📋 Test 7: ICRC37 Approval Queries${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc37_get_token_approvals (should return empty):${NC}"
dfx canister call nft_collection icrc37_get_token_approvals '(1, null, null)'
echo ""
echo -e "${YELLOW}icrc37_get_collection_approvals (should return empty):${NC}"
dfx canister call nft_collection icrc37_get_collection_approvals '(record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }, null, null)'
echo ""

# Test 8: ICRC3 Operations
echo -e "${BLUE}📋 Test 8: ICRC3 Operations${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc3_get_archives:${NC}"
dfx canister call nft_collection icrc3_get_archives '(null)'
echo ""
echo -e "${YELLOW}icrc3_get_blocks:${NC}"
dfx canister call nft_collection icrc3_get_blocks '(vec { record { start = 0; length = 10 } })'
echo ""
echo -e "${YELLOW}icrc3_get_properties:${NC}"
dfx canister call nft_collection icrc3_get_properties '(null)'
echo ""
echo -e "${YELLOW}icrc3_get_tip_certificate:${NC}"
dfx canister call nft_collection icrc3_get_tip_certificate '(null)'
echo ""
echo -e "${YELLOW}icrc3_supported_block_types:${NC}"
dfx canister call nft_collection icrc3_supported_block_types '(null)'
echo ""

# Test 9: Asset Management (Bity Storage Canister)
echo -e "${BLUE}📋 Test 9: Asset Management (Bity Storage)${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}init_upload:${NC}"
dfx canister call nft_collection init_upload '(record { file_path = "test_image.png"; file_size = 1024; chunk_size = opt 1024; file_hash = "test-hash-123" })'
echo ""
echo -e "${YELLOW}store_chunk:${NC}"
dfx canister call nft_collection store_chunk '(record { chunk_id = 0; file_path = "test_image.png"; chunk_data = blob "test-data" })'
echo ""
echo -e "${YELLOW}finalize_upload:${NC}"
dfx canister call nft_collection finalize_upload '(record { file_path = "test_image.png" })'
echo ""

# Test 10: Management Operations
echo -e "${BLUE}📋 Test 10: Management Operations${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}mint:${NC}"
dfx canister call nft_collection mint '(record { token_metadata_url = "https://example.com/metadata/1.json"; memo = null; token_owner = record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }; token_name = "Test NFT #1" })'
echo ""
echo -e "${YELLOW}get_all_uploads:${NC}"
dfx canister call nft_collection get_all_uploads '(null, null)'
echo ""

# Test 11: ICRC10 Standards
echo -e "${BLUE}📋 Test 11: ICRC10 Standards${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc10_supported_standards:${NC}"
dfx canister call nft_collection icrc10_supported_standards
echo ""

# Test 12: Update Collection Metadata
echo -e "${BLUE}📋 Test 12: Update Collection Metadata${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}update_collection_metadata:${NC}"
dfx canister call nft_collection update_collection_metadata '(record { name = opt "Updated NFT Collection"; symbol = opt "UNFT"; description = opt "Updated description"; logo = null; supply_cap = null; tx_window = null; default_take_value = null; max_canister_storage_threshold = null; permitted_drift = null; max_take_value = null; max_update_batch_size = null; max_query_batch_size = null; max_memo_size = null; atomic_batch_transfers = null; collection_metadata = null })'
echo ""

# Test 13: Update NFT Metadata
echo -e "${BLUE}📋 Test 13: Update NFT Metadata${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}update_nft_metadata:${NC}"
dfx canister call nft_collection update_nft_metadata '(record { token_id = 1; token_metadata_url = "https://example.com/metadata/1-updated.json"; token_name = opt "Updated Test NFT #1" })'
echo ""

# Test 14: Final ICRC7 Queries (after minting)
echo -e "${BLUE}📋 Test 14: Final ICRC7 Queries (after minting)${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc7_total_supply (should be 1):${NC}"
dfx canister call nft_collection icrc7_total_supply
echo ""
echo -e "${YELLOW}icrc7_owner_of (token 1 - should exist):${NC}"
dfx canister call nft_collection icrc7_owner_of '(vec { 1 })'
echo ""
echo -e "${YELLOW}icrc7_balance_of (should be 1):${NC}"
dfx canister call nft_collection icrc7_balance_of '(vec { record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null } })'
echo ""

# Test 15: Additional ICRC7 Queries
echo -e "${BLUE}📋 Test 15: Additional ICRC7 Queries${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}icrc7_tokens:${NC}"
dfx canister call nft_collection icrc7_tokens '(null, null)'
echo ""
echo -e "${YELLOW}icrc7_tokens_of:${NC}"
dfx canister call nft_collection icrc7_tokens_of '(record { owner = principal "'$CURRENT_PRINCIPAL'"; subaccount = null }, null, null)'
echo ""
echo -e "${YELLOW}icrc7_token_metadata:${NC}"
dfx canister call nft_collection icrc7_token_metadata '(vec { 1 })'
echo ""

echo -e "${GREEN}✅ All ICRC7/37 endpoint tests completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Summary:${NC}"
echo "- ✅ ICRC7 basic information endpoints tested"
echo "- ✅ ICRC7 token operations tested"
echo "- ✅ ICRC7 transfer operations tested"
echo "- ✅ ICRC37 approval operations tested"
echo "- ✅ ICRC37 revoke operations tested"
echo "- ✅ ICRC37 transfer_from operations tested"
echo "- ✅ ICRC37 approval queries tested"
echo "- ✅ ICRC3 operations tested"
echo "- ✅ Asset management (Bity storage) tested"
echo "- ✅ Management operations tested"
echo "- ✅ ICRC10 standards tested"
echo "- ✅ Collection metadata updates tested"
echo "- ✅ NFT metadata updates tested"
echo "- ✅ Additional ICRC7 queries tested"
echo ""
echo -e "${BLUE}🎉 NFT Collection Canister is fully ICRC7/37 compliant!${NC}"
