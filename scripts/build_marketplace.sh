#!/bin/bash

# Build Marketplace Canister and Generate Candid
echo "🔨 Building Marketplace Canister..."

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

echo "✅ Build completed successfully!"
echo "📋 Generated .did file at src/marketplace/marketplace.did"
echo "🚀 To deploy, run: ./deploy_marketplace.sh"
