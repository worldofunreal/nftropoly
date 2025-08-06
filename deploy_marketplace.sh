#!/bin/bash

# Deploy Marketplace Canister with Auto-Generated Candid
echo "🚀 Deploying Marketplace Canister..."

# Build the marketplace canister
echo "📦 Building marketplace canister..."
dfx build marketplace

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Generate .did file from Rust code
echo "🔧 Generating .did file from Rust code..."
candid-extractor target/wasm32-unknown-unknown/release/marketplace.wasm > src/marketplace/marketplace.did

# Check if candid generation was successful
if [ $? -ne 0 ]; then
    echo "❌ Candid generation failed!"
    exit 1
fi

echo "✅ Generated .did file at src/marketplace/marketplace.did"

# Deploy the canister
echo "🚀 Deploying marketplace canister..."
dfx deploy marketplace

# Check if deployment was successful
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Marketplace canister deployed successfully!"
echo "📋 Canister ID: $(dfx canister id marketplace)"
echo "🌐 Candid interface: src/marketplace/marketplace.did"
