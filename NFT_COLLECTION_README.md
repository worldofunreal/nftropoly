# NFT Collection Canister

A complete ICRC7/ICRC37 compliant NFT collection implementation that integrates with your custom asset canister for file storage and management.

## Features

- ✅ **ICRC-7 Standard Compliance**: Full NFT standard implementation
- ✅ **ICRC-37 Standard Compliance**: Complete approval system
- ✅ **ICRC-3 Transaction History**: Full transaction tracking
- ✅ **Custom Asset Storage**: Uses your existing asset canister implementation
- ✅ **HTTP Asset Serving**: Certified asset serving via HTTP
- ✅ **Batch Operations**: Support for batch minting and transfers
- ✅ **Metadata Management**: Rich metadata support with attributes
- ✅ **Approval System**: Token and collection-level approvals
- ✅ **Stable Memory Storage**: Persistent data storage

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  NFT Collection  │    │   Asset Storage │
│   (Your App)    │◄──►│   Canister       │◄──►│   (Your lib.rs) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Stable Memory   │
                       │   (Database)     │
                       └──────────────────┘
```

## Quick Start

### 1. Prerequisites

```bash
# Install dfx
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install required tools
cargo install ic-wasm candid-extractor
export PATH="$HOME/.cargo/bin:$PATH"
```

### 2. Deploy Locally

```bash
# Start local IC
dfx start --background --clean

# Deploy NFT collection
chmod +x scripts/deploy_nft_collection.sh
./scripts/deploy_nft_collection.sh
```

### 3. Upload Assets

```bash
# Initialize upload
dfx canister call nft_collection init_upload \
  '("images/nft_001.png", 1024000, opt 1024000, "abc123hash")'

# Store chunks (simplified - you'll need to implement chunking)
dfx canister call nft_collection store_chunk \
  '(0, vec{1,2,3,4,5}, "images/nft_001.png")'

# Finalize upload
dfx canister call nft_collection finalize_upload \
  '("images/nft_001.png")'
```

### 4. Mint NFTs

```bash
# Mint single NFT
dfx canister call nft_collection mint_nft \
  '(principal "your-principal-id", vec{("icrc7:name", variant{Text="My First NFT"}), ("icrc7:image", variant{Text="http://canister-id.icp0.io/images/nft_001.png"})}, null)'

# Batch mint
dfx canister call nft_collection mint_batch_nfts \
  '(vec{record{owner=principal "your-principal-id"; metadata=vec{("icrc7:name", variant{Text="NFT #1"}), ("icrc7:image", variant{Text="http://canister-id.icp0.io/images/nft_001.png"})}; memo=null}})'
```

## API Reference

### ICRC-7 NFT Standard

#### Collection Information
```bash
# Get collection name
dfx canister call nft_collection icrc7_name

# Get collection symbol
dfx canister call nft_collection icrc7_symbol

# Get total supply
dfx canister call nft_collection icrc7_total_supply

# Get collection metadata
dfx canister call nft_collection icrc7_collection_metadata
```

#### Token Operations
```bash
# Get token owner
dfx canister call nft_collection icrc7_owner_of '(vec{1})'

# Get token metadata
dfx canister call nft_collection icrc7_token_metadata '(vec{1})'

# Get tokens owned by account
dfx canister call nft_collection icrc7_tokens_of '(record{owner=principal "your-principal"; subaccount=null}, null, null)'
```

### ICRC-37 Approval Standard

```bash
# Approve token
dfx canister call nft_collection approve_token \
  '(1, principal "spender-principal", null, null)'

# Check approval
dfx canister call nft_collection icrc37_is_approved \
  '(vec{record{token_id=1; from_subaccount=null; spender=record{owner=principal "spender-principal"; subaccount=null}}})'

# Revoke approval
dfx canister call nft_collection revoke_approval \
  '(1, principal "spender-principal")'
```

### Asset Management

```bash
# Initialize file upload
dfx canister call nft_collection init_upload \
  '("path/to/file.png", 1024000, opt 1024000, "file-hash")'

# Store file chunk
dfx canister call nft_collection store_chunk \
  '(chunk_id, chunk_data, "path/to/file.png")'

# Finalize upload
dfx canister call nft_collection finalize_upload \
  '("path/to/file.png")'
```

## Metadata Structure

### Standard NFT Metadata
```json
{
  "icrc7:name": "My NFT",
  "icrc7:description": "A unique NFT",
  "icrc7:image": "http://canister-id.icp0.io/images/nft_001.png",
  "icrc7:attributes": [
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Background",
      "value": "Blue"
    }
  ]
}
```

### Collection Metadata
```json
{
  "icrc7:name": "My Collection",
  "icrc7:symbol": "MNFT",
  "icrc7:description": "A unique collection",
  "icrc7:logo": "http://canister-id.icp0.io/images/logo.png"
}
```

## File Upload Process

### 1. Prepare Your Images
- **Format**: PNG, JPG, GIF, WebP
- **Size**: Max 1MB per file
- **Dimensions**: Recommended 1000x1000px or higher
- **Naming**: Use descriptive names like `nft_001.png`

### 2. Upload Process
```bash
# Step 1: Initialize upload
dfx canister call nft_collection init_upload \
  '("images/nft_001.png", 1024000, opt 1024000, "abc123hash")'

# Step 2: Upload chunks (implement chunking logic)
for chunk_id in {0..total_chunks}; do
  dfx canister call nft_collection store_chunk \
    "($chunk_id, chunk_data, \"images/nft_001.png\")"
done

# Step 3: Finalize upload
dfx canister call nft_collection finalize_upload \
  '("images/nft_001.png")'
```

### 3. Generate Metadata
```bash
# Create metadata for NFT
metadata='[
  ("icrc7:name", variant{Text="NFT #1"}),
  ("icrc7:description", variant{Text="A unique NFT"}),
  ("icrc7:image", variant{Text="http://canister-id.icp0.io/images/nft_001.png"}),
  ("icrc7:attributes", variant{Array=vec{
    variant{Map=vec{("trait_type", variant{Text="Rarity"}), ("value", variant{Text="Legendary"})}},
    variant{Map=vec{("trait_type", variant{Text="Background"}), ("value", variant{Text="Blue"})}}
  }})
]'
```

## AI Integration for Metadata Generation

### Automated Metadata Creation
```bash
# Example: Generate metadata for a collection
for i in {1..100}; do
  # Generate AI-based attributes
  rarity=$(generate_rarity_ai)
  background=$(generate_background_ai)
  accessory=$(generate_accessory_ai)
  
  # Create metadata
  metadata="[
    (\"icrc7:name\", variant{Text=\"NFT #$i\"}),
    (\"icrc7:description\", variant{Text=\"AI-generated NFT #$i\"}),
    (\"icrc7:image\", variant{Text=\"http://canister-id.icp0.io/images/nft_$i.png\"}),
    (\"icrc7:attributes\", variant{Array=vec{
      variant{Map=vec{(\"trait_type\", variant{Text=\"Rarity\"}), (\"value\", variant{Text=\"$rarity\"})}},
      variant{Map=vec{(\"trait_type\", variant{Text=\"Background\"}), (\"value\", variant{Text=\"$background\"})}},
      variant{Map=vec{(\"trait_type\", variant{Text=\"Accessory\"}), (\"value\", variant{Text=\"$accessory\"})}}
    }})
  ]"
  
  # Mint NFT
  dfx canister call nft_collection mint_nft \
    "(principal \"your-principal-id\", $metadata, null)"
done
```

## Deployment to Mainnet

### 1. Prepare for Mainnet
```bash
# Set network to mainnet
export NETWORK="ic"

# Ensure you have cycles
dfx ledger balance

# Deploy to mainnet
./scripts/deploy_nft_collection.sh
```

### 2. Verify Deployment
```bash
# Check canister status
dfx canister status nft_collection --network ic

# Verify ICRC-7 compliance
dfx canister call nft_collection icrc7_name --network ic
dfx canister call nft_collection icrc7_symbol --network ic
```

## Integration with Your Frontend

### TypeScript Integration
```typescript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/nft_collection';

class NFTCollectionService {
  private actor: any;

  async initialize(canisterId: string) {
    const agent = new HttpAgent({ host: 'https://icp0.io' });
    await agent.fetchRootKey();
    
    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }

  async mintNFT(owner: string, metadata: any[]) {
    return await this.actor.mint_nft(owner, metadata, null);
  }

  async getTokenMetadata(tokenId: number) {
    return await this.actor.icrc7_token_metadata([tokenId]);
  }

  async uploadAsset(filePath: string, fileSize: number, fileHash: string) {
    await this.actor.init_upload(filePath, fileSize, null, fileHash);
    // Implement chunking logic
    await this.actor.finalize_upload(filePath);
  }
}
```

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (max 1MB)
   - Verify file hash matches
   - Ensure all chunks are uploaded

2. **Minting Fails**
   - Check if caller is authorized
   - Verify metadata format
   - Check supply cap

3. **Transfer Fails**
   - Verify token ownership
   - Check approval status
   - Ensure valid recipient

### Debug Commands
```bash
# Check canister status
dfx canister status nft_collection

# View canister logs
dfx canister call nft_collection get_collection_info

# Check transaction history
dfx canister call nft_collection icrc3_get_blocks '(vec{record{start=0; length=10}})'
```

## Performance Considerations

- **Batch Operations**: Use batch minting for large collections
- **Chunk Size**: Optimize chunk size for your use case (default 1MB)
- **Caching**: Implement frontend caching for frequently accessed data
- **Pagination**: Use pagination for large token lists

## Security Features

- **Authorization**: Only collection owner can mint
- **Approval System**: Secure token approvals with expiration
- **Input Validation**: Comprehensive input validation
- **Stable Memory**: Persistent and secure data storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the ICRC-7/ICRC-37 standards documentation
