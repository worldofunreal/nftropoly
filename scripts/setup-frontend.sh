#!/bin/bash

# Frontend Setup Script for Nftropoly
# This script automates the setup of the frontend configuration

set -e

echo "🚀 Setting up Nftropoly Frontend Configuration..."

# Check if dfx is available
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx is not installed or not in PATH"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    echo "❌ Error: dfx.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Step 1: Generating canister declarations..."

# Generate declarations for all canisters
dfx generate

echo "✅ Canister declarations generated successfully!"

echo "📋 Step 2: Checking .env file for canister IDs..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Make sure to run 'dfx start' and deploy canisters first."
    echo "   You can create a .env file by running: dfx start --clean --background"
    exit 1
fi

# Extract and display canister IDs
echo "📊 Found canister IDs:"
grep "CANISTER_ID_" .env | while read line; do
    if [[ $line =~ CANISTER_ID_([A-Z_]+)='([^']+)' ]]; then
        canister_name="${BASH_REMATCH[1]}"
        canister_id="${BASH_REMATCH[2]}"
        echo "   - ${canister_name,,}: $canister_id"
    fi
done

echo "📋 Step 3: Starting frontend development server..."

# Navigate to frontend directory and start dev server
cd src/frontend

echo "🌐 Frontend will be available at: http://localhost:3000"
echo "📝 The configuration will automatically read canister IDs from the .env file"
echo ""
echo "🎉 Setup complete! Your frontend is now configured with:"
echo "   ✅ Dynamic canister ID loading from .env"
echo "   ✅ Generated TypeScript declarations"
echo "   ✅ Automatic configuration updates"

# Start the development server
npm run dev
