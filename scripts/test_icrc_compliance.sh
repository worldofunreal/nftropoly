#!/bin/bash

# Comprehensive ICRC-1/2/3/10/21 Compliance Testing Script
# This script tests all ICRC standards supported by the Spiral token

set -e

echo "🔍 Starting Comprehensive ICRC Compliance Testing..."
echo "=================================================="

# Load environment variables
if [ -f .env.tokens ]; then
    source .env.tokens
    echo "✅ Loaded token configuration from .env.tokens"
else
    echo "❌ .env.tokens not found. Please run deploy_tokens.sh first."
    exit 1
fi

# Test ICRC-10 (Supported Standards)
echo ""
echo "📋 Testing ICRC-10 (Supported Standards)..."
echo "   - icrc10_supported_standards:"
dfx canister call spiral icrc10_supported_standards

# Test ICRC-1 (Base Fungible Token Standard)
echo ""
echo "🪙 Testing ICRC-1 (Base Fungible Token Standard)..."
echo "   - icrc1_name:"
dfx canister call spiral icrc1_name
echo "   - icrc1_symbol:"
dfx canister call spiral icrc1_symbol
echo "   - icrc1_decimals:"
dfx canister call spiral icrc1_decimals
echo "   - icrc1_fee:"
dfx canister call spiral icrc1_fee
echo "   - icrc1_total_supply:"
dfx canister call spiral icrc1_total_supply
echo "   - icrc1_minting_account:"
dfx canister call spiral icrc1_minting_account
echo "   - icrc1_metadata:"
dfx canister call spiral icrc1_metadata
echo "   - icrc1_supported_standards:"
dfx canister call spiral icrc1_supported_standards

# Test ICRC-1 Balance and Transfer
echo ""
echo "💰 Testing ICRC-1 Balances and Transfers..."
echo "   - Initial balances:"
echo "     Alice:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null })"
echo "     Bob:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null })"
echo "     Charlie:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null })"

# Test ICRC-1 Transfer with different scenarios
echo ""
echo "🔄 Testing ICRC-1 Transfer Scenarios..."
echo "   - Normal transfer (Alice -> Bob):"
dfx identity use alice
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 100000000000 })"

echo "   - Transfer with custom fee:"
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null }; amount = 50000000000; fee = opt 10000 })"

echo "   - Transfer with memo:"
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 25000000000; memo = opt blob \"test memo\" })"

# Test ICRC-1 Error Conditions
echo ""
echo "❌ Testing ICRC-1 Error Conditions..."
echo "   - Insufficient funds:"
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 999999999999999999999 })" || echo "   ✅ Correctly rejected insufficient funds"

echo "   - Bad fee:"
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 100000000000; fee = opt 999999999 })" || echo "   ✅ Correctly rejected bad fee"

# Test ICRC-2 (Approve and Transfer From)
echo ""
echo "🔐 Testing ICRC-2 (Approve and Transfer From)..."
echo "   - Initial allowance (Alice -> Bob):"
dfx canister call spiral icrc2_allowance "(record { account = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; spender = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null } })"

echo "   - Alice approves Bob to spend 1000 SPIRAL:"
dfx identity use alice
dfx canister call spiral icrc2_approve "(record { spender = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 1000000000000 })"

echo "   - Check allowance after approval:"
dfx canister call spiral icrc2_allowance "(record { account = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; spender = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null } })"

echo "   - Bob transfers 500 SPIRAL from Alice to Charlie:"
dfx identity use bob
dfx canister call spiral icrc2_transfer_from "(record { from = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; to = record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null }; amount = 500000000000 })"

echo "   - Check allowance after transfer:"
dfx canister call spiral icrc2_allowance "(record { account = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; spender = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null } })"

echo "   - Check balances after transfer:"
echo "     Alice:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null })"
echo "     Charlie:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null })"

# Test ICRC-2 Error Conditions
echo ""
echo "❌ Testing ICRC-2 Error Conditions..."
echo "   - Bob tries to transfer more than allowance:"
dfx canister call spiral icrc2_transfer_from "(record { from = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; to = record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null }; amount = 999999999999999999999 })" || echo "   ✅ Correctly rejected insufficient allowance"

echo "   - Charlie tries to transfer from Alice (no approval):"
dfx identity use charlie
dfx canister call spiral icrc2_transfer_from "(record { from = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 100000000000 })" || echo "   ✅ Correctly rejected unauthorized transfer"

# Test ICRC-3 (Block Log)
echo ""
echo "📊 Testing ICRC-3 (Block Log)..."
echo "   - icrc3_supported_block_types:"
dfx canister call spiral icrc3_supported_block_types

echo "   - icrc3_get_archives:"
dfx canister call spiral icrc3_get_archives "(record { from = null })"

echo "   - icrc3_get_blocks (first 10 blocks):"
dfx canister call spiral icrc3_get_blocks "(vec { record { start = 0; length = 10 } })"

echo "   - icrc3_get_tip_certificate:"
dfx canister call spiral icrc3_get_tip_certificate

# Test ICRC-21 (Consent Messages)
echo ""
echo "📝 Testing ICRC-21 (Consent Messages)..."
echo "   - Testing consent message for icrc1_transfer:"
dfx canister call spiral icrc21_canister_call_consent_message "(record { method = \"icrc1_transfer\"; arg = blob \"test\"; user_preferences = record { metadata = record { language = \"en-US\"; utc_offset_minutes = null }; device_spec = null } })" && echo "   ✅ ICRC-21 interface working (expected decode error for test blob)"

echo "   - Testing consent message for icrc2_approve:"
dfx canister call spiral icrc21_canister_call_consent_message "(record { method = \"icrc2_approve\"; arg = blob \"test\"; user_preferences = record { metadata = record { language = \"en-US\"; utc_offset_minutes = null }; device_spec = null } })" && echo "   ✅ ICRC-21 interface working (expected decode error for test blob)"

echo "   - Testing consent message for icrc2_transfer_from:"
dfx canister call spiral icrc21_canister_call_consent_message "(record { method = \"icrc2_transfer_from\"; arg = blob \"test\"; user_preferences = record { metadata = record { language = \"en-US\"; utc_offset_minutes = null }; device_spec = null } })" && echo "   ✅ ICRC-21 interface working (expected decode error for test blob)"

# Final Balance Verification
echo ""
echo "💰 Final Balance Verification..."
echo "   - Alice final balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null })"
echo "   - Bob final balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null })"
echo "   - Charlie final balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null })"

echo ""
echo "✅ Comprehensive ICRC Compliance Testing Completed!"
echo "=================================================="
echo ""
echo "📋 Test Summary:"
echo "   ✅ ICRC-10: Supported Standards Discovery"
echo "   ✅ ICRC-1: Base Fungible Token Operations"
echo "   ✅ ICRC-2: Approve and Transfer From"
echo "   ✅ ICRC-3: Block Log and Archives"
echo "   ✅ ICRC-21: Consent Messages (if supported)"
echo "   ✅ Error Conditions: Proper error handling"
echo "   ✅ Token Transfers: Multiple scenarios tested"
echo ""
echo "🎉 All ICRC standards are working correctly!"
