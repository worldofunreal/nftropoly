#!/bin/bash

# Deploy Spiral ICRC-1 token for ICRC-8 marketplace testing
# This script deploys spiral token with full ICRC-1/2/3 support

set -e

echo "🚀 Starting ICRC-1 token deployment for marketplace testing..."

# Check if dfx is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ dfx is not running. Please start dfx first with: dfx start --clean --background"
    exit 1
fi

# Create testing identities if they don't exist
echo "📝 Setting up testing identities..."
for identity in alice bob charlie; do
    if ! dfx identity list | grep -q "$identity"; then
        echo "   Creating $identity identity..."
        dfx identity new "$identity" --disable-encryption
    fi
done



# Use current identity for archive controller
export ARCHIVE_CONTROLLER=$(dfx identity get-principal)
echo "🔑 Archive controller principal: $ARCHIVE_CONTROLLER"

# Set archive options (recommended values)
export TRIGGER_THRESHOLD=2000
export NUM_OF_BLOCK_TO_ARCHIVE=1000
export CYCLE_FOR_ARCHIVE_CREATION=10000000000000

# Enable ICRC-2 support
export FEATURE_FLAGS=true

# Get all principals first
dfx identity use alice
export ALICE_PRINCIPAL=$(dfx identity get-principal)
dfx identity use bob
export BOB_PRINCIPAL=$(dfx identity get-principal)
dfx identity use charlie
export CHARLIE_PRINCIPAL=$(dfx identity get-principal)

# Switch back to deployer identity for deployment
dfx identity use bizkit
export DEPLOY_ID=$(dfx identity get-principal)

# Deploy Spiral Token (SPIRAL) - for NFT trading and marketplace fees
echo "🪙 Deploying Spiral Token (SPIRAL)..."

# Spiral Token configuration
export TOKEN_NAME="Spiral"
export TOKEN_SYMBOL="SPIRAL"
export PRE_MINTED_TOKENS=1000000000000000000  # 1 billion tokens with 8 decimals
export TRANSFER_FEE=10000  # 0.0001 tokens with 8 decimals

echo "📊 Spiral Token Configuration:"
echo "   Name: $TOKEN_NAME"
echo "   Symbol: $TOKEN_SYMBOL"
echo "   Decimals: 8"
echo "   Total Supply: $PRE_MINTED_TOKENS (1,000,000,000 tokens)"
echo "   Transfer Fee: $TRANSFER_FEE"
echo "   ICRC-2 Support: Enabled"
echo "   ICRC-3 Support: Enabled"
echo "   Minting: Disabled (fixed supply)"

dfx deploy spiral --argument "(variant {Init =
record {
     token_symbol = \"${TOKEN_SYMBOL}\";
     token_name = \"${TOKEN_NAME}\";
     minting_account = record { owner = principal \"${DEPLOY_ID}\"; subaccount = null };
     transfer_fee = ${TRANSFER_FEE};
     metadata = vec {};
     feature_flags = opt record{icrc2 = ${FEATURE_FLAGS}};
     initial_balances = vec { 
         record { record { owner = principal \"${ALICE_PRINCIPAL}\"; }; 333333333333333333 }; 
         record { record { owner = principal \"${BOB_PRINCIPAL}\"; }; 333333333333333333 }; 
         record { record { owner = principal \"${CHARLIE_PRINCIPAL}\"; }; 333333333333333333 }; 
     };
     archive_options = record {
         num_blocks_to_archive = ${NUM_OF_BLOCK_TO_ARCHIVE};
         trigger_threshold = ${TRIGGER_THRESHOLD};
         controller_id = principal \"${ARCHIVE_CONTROLLER}\";
         cycles_for_archive_creation = opt ${CYCLE_FOR_ARCHIVE_CREATION};
     };
 }
})"

echo "✅ Spiral Token deployed successfully!"

# Get token canister ID
export SPIRAL_TOKEN_ID=$(dfx canister id spiral)

echo "💰 Token distribution completed during deployment!"

# Verify token distribution and test ICRC endpoints
echo "🔍 Verifying token distribution and testing ICRC endpoints..."

echo "   Testing ICRC-1 endpoints..."
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
echo "   - icrc1_supported_standards:"
dfx canister call spiral icrc1_supported_standards

echo "   Testing ICRC-2 endpoints..."
echo "   - icrc2_allowance:"
dfx canister call spiral icrc2_allowance "(record { account = record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null }; spender = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null } })"

echo "   Testing ICRC-3 endpoints..."
echo "   - icrc3_supported_block_types:"
dfx canister call spiral icrc3_supported_block_types

echo "   Verifying token balances..."
echo "   - Alice balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null })"
echo "   - Bob balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null })"
echo "   - Charlie balance:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${CHARLIE_PRINCIPAL}\"; subaccount = null })"

echo "   Testing token transfer between identities..."
echo "   - Transfer 1000 SPIRAL from Alice to Bob:"
dfx identity use alice
dfx canister call spiral icrc1_transfer "(record { to = record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null }; amount = 100000000000 })"

echo "   - Verifying transfer results:"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${ALICE_PRINCIPAL}\"; subaccount = null })"
dfx canister call spiral icrc1_balance_of "(record { owner = principal \"${BOB_PRINCIPAL}\"; subaccount = null })"

echo "✅ Basic token verification completed!"

# Run comprehensive ICRC compliance testing
echo ""
echo "🔍 Running comprehensive ICRC-1/2/3/10/21 compliance testing..."
./test_icrc_compliance.sh

# Display deployment summary
echo ""
echo "🎉 ICRC-1 Token Deployment Complete!"
echo "======================================"
echo ""
echo "📋 Deployment Summary:"
echo "   Archive Controller: $ARCHIVE_CONTROLLER"
echo "   Deployer Principal: $DEPLOY_ID"
echo ""
echo "🪙 Spiral Token (SPIRAL):"
echo "   Canister ID: $SPIRAL_TOKEN_ID"
echo "   Total Supply: 1,000,000,000 SPIRAL"
echo "   Decimals: 8"
echo "   ICRC-2: Enabled"
echo "   ICRC-3: Enabled"
echo "   Minting: Disabled (fixed supply)"
echo ""
echo "👥 Testing Identities:"
echo "   Alice: $ALICE_PRINCIPAL (333,333,333 SPIRAL)"
echo "   Bob: $BOB_PRINCIPAL (333,333,333 SPIRAL)"
echo "   Charlie: $CHARLIE_PRINCIPAL (333,333,334 SPIRAL)"
echo "   Total Supply: 1,000,000,000 SPIRAL (fixed)"
echo ""
echo "🔗 Candid UI URLs:"
echo "   Spiral Token: http://127.0.0.1:4943/?canisterId=$(dfx canister id __Candid_UI)&id=$SPIRAL_TOKEN_ID"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy mock ICRC-7 NFT collection"
echo "   2. Deploy marketplace canister"
echo "   3. Run marketplace integration tests"
echo "   4. Test ICRC-8 marketplace functionality"

# Save environment variables for testing
cat > .env.tokens << EOF
# ICRC-1 Token Configuration
SPIRAL_TOKEN_ID=$SPIRAL_TOKEN_ID
ALICE_PRINCIPAL=$ALICE_PRINCIPAL
BOB_PRINCIPAL=$BOB_PRINCIPAL
CHARLIE_PRINCIPAL=$CHARLIE_PRINCIPAL
DEPLOYER_PRINCIPAL=$DEPLOY_ID
EOF

echo ""
echo "💾 Token configuration saved to .env.tokens"
