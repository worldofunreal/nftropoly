#!/bin/bash

# Test script to debug the mint flow step by step using dfx
echo "🔍 Testing Mint Flow with dfx"

# Load canister IDs
BACKEND_ID=$(dfx canister id backend)
TOKEN_ID=$(dfx canister id nftropoly_token)
NFT_ID=$(dfx canister id nft_collection)

echo "Backend: $BACKEND_ID"
echo "Token: $TOKEN_ID"
echo "NFT: $NFT_ID"

# Get a test principal (Alice)
ALICE_PRINCIPAL=$(dfx identity get-principal --identity alice)
echo "Alice Principal: $ALICE_PRINCIPAL"

echo ""
echo "📋 Step 1: Check NFT mint method signature by calling with wrong args"
echo "Expected to fail and show us the correct signature..."

dfx canister call nft_collection mint '(record { 
  token_name = "Test NFT";
  token_description = opt "Wrong field";
  token_owner = record { owner = principal "'$ALICE_PRINCIPAL'"; subaccount = null };
})' --identity alice || echo "Failed as expected - shows signature mismatch"

echo ""
echo "📋 Step 2: Try with correct NFT mint signature"
echo "Using token_metadata_url instead of token_description..."

dfx canister call nft_collection mint '(record { 
  token_metadata_url = "https://example.com/metadata.json";
  token_name = "Test NFT";
  memo = null;
  token_owner = record { owner = principal "'$ALICE_PRINCIPAL'"; subaccount = null };
})' --identity alice || echo "This should show us if the signature is correct"

echo ""
echo "💰 Step 3: Test token approval"
echo "Approving backend to spend tokens..."

dfx canister call nftropoly_token icrc2_approve '(record {
  from_subaccount = null;
  spender = record { owner = principal "'$BACKEND_ID'"; subaccount = null };
  amount = 10_000_000_000 : nat;
  expected_allowance = null;
  expires_at = null;
  fee = null;
  memo = null;
  created_at_time = null;
})' --identity alice

echo ""
echo "🎨 Step 4: Test backend mint call"
echo "Calling backend mint_on_behalf..."

dfx canister call backend mint_on_behalf '(
  "Test NFT",
  opt "Test Description", 
  opt "https://example.com/image.png",
  opt vec { record { "trait"; "value" } },
  10_000_000_000 : nat64
)' --identity alice

echo ""
echo "✅ Test completed - check the errors above to see what needs fixing"
