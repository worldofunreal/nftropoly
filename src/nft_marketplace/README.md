# NFT Marketplace - ICRC-8 Compliant Rust Backend

A modular, ICRC-8 compliant NFT marketplace implementation for the Internet Computer blockchain, written in Rust.

## Overview

This implementation provides a complete NFT marketplace backend that follows the ICRC-8 standard for ledger-native markets. The architecture is designed to be modular, extensible, and maintainable while providing full compliance with ICRC-8 specifications.

## Architecture

### Modular Design

The marketplace is built with a modular architecture that separates concerns and allows for easy extension:

```
src/nft_marketplace/
├── lib.rs              # Main library entry point
├── types.rs            # ICRC-8 data types and structures
├── storage.rs          # State management and stable storage
├── marketplace.rs      # Core marketplace logic
├── escrow.rs           # Escrow management
├── fees.rs             # Fee calculation and distribution
├── auctions.rs         # Auction functionality (ICRC-61)
├── amm.rs              # AMM functionality (ICRC-62)
├── kyc.rs              # KYC compliance (ICRC-64)
├── notifications.rs    # Notification system (ICRC-71)
├── errors.rs           # Error handling
└── utils.rs            # Utility functions
```

### Key Components

#### 1. **Types Module** (`types.rs`)
- Defines all ICRC-8 compliant data structures
- Includes `Account`, `TokenSpec`, `EscrowRecord`, `AskFeature`, etc.
- Provides type safety and serialization support

#### 2. **Storage Module** (`storage.rs`)
- Manages persistent state using stable storage
- Handles canister upgrades gracefully
- Provides caching for performance optimization
- Implements CRUD operations for all marketplace entities

#### 3. **Marketplace Module** (`marketplace.rs`)
- Implements core ICRC-8 methods (`icrc8_ask`, `icrc8_bid`, etc.)
- Handles ask/bid creation, validation, and settlement
- Manages transaction recording and state updates
- Provides query methods for marketplace data

#### 4. **Escrow Module** (`escrow.rs`)
- Manages escrow records for bids and asks
- Handles escrow locking and unlocking
- Provides escrow validation and lifecycle management

#### 5. **Fees Module** (`fees.rs`)
- Implements flexible fee calculation systems
- Supports multiple fee schemas (standard, premium, custom)
- Handles fee distribution to multiple parties
- Provides fee validation and management

#### 6. **Auction Module** (`auctions.rs`)
- Implements ICRC-61 standard auctions
- Supports Dutch auctions (ICRC-63)
- Handles auction bidding and settlement
- Manages auction timeouts and extensions

#### 7. **AMM Module** (`amm.rs`)
- Implements ICRC-62 AMM functionality
- Supports liquidity pools and token swaps
- Handles AMM-based pricing and trading
- Provides slippage protection

#### 8. **KYC Module** (`kyc.rs`)
- Implements ICRC-64 KYC compliance
- Supports elective KYC verification
- Handles KYC provider integration
- Manages KYC requirements for transactions

#### 9. **Notifications Module** (`notifications.rs`)
- Implements ICRC-71 notification system
- Supports real-time event notifications
- Handles subscription management
- Provides notification delivery

## ICRC-8 Compliance

### Core Methods Implemented

1. **`icrc8_ask`** - Manage seller listings
   - Create new asks with features
   - End existing asks
   - Withdraw settlements and escrow
   - Handle unsolicited offers

2. **`icrc8_bid`** - Manage buyer bids
   - Place new bids on asks
   - Handle engine matches
   - Withdraw bid escrow

3. **`icrc8_balance_of`** - Query account balances
   - NFT balances
   - Token balances
   - Escrow balances
   - Settlement balances

4. **`icrc8_ask_info`** - Query marketplace information
   - Active asks
   - Ask history
   - Individual ask status

5. **`icrc8_approved_tokens`** - Get supported tokens

### Supported ICRC Standards

- **ICRC-1**: Fungible tokens
- **ICRC-2**: Approvable fungible tokens
- **ICRC-4**: Batch operations
- **ICRC-7**: Non-fungible tokens
- **ICRC-37**: Multi-token standard

### Extended Standards Support

- **ICRC-61**: Standard auctions
- **ICRC-62**: AMM functionality
- **ICRC-63**: Dutch auctions
- **ICRC-64**: KYC compliance
- **ICRC-71**: Notifications

## Key Features

### 1. **Modular Architecture**
- Each component is self-contained and testable
- Easy to extend with new functionality
- Clear separation of concerns

### 2. **Stable Storage**
- Persistent state across canister upgrades
- Efficient memory management
- Automatic state serialization/deserialization

### 3. **Performance Optimization**
- In-memory caching for frequently accessed data
- Efficient data structures and algorithms
- Minimal cross-canister calls

### 4. **Security**
- Comprehensive input validation
- Access control and authorization
- Secure escrow management
- Protection against common attacks

### 5. **Extensibility**
- Plugin architecture for new features
- Configurable fee structures
- Support for multiple token standards
- Customizable auction types

## Usage Examples

### Creating an NFT Ask

```rust
use nft_marketplace::{types::*, utils::*};

// Create ask features for an NFT
let features = create_ask_features(
    collection_id,
    token_id,
    price,
    None, // broker
    None, // allow_list
    None, // start_date
    None, // ending
    Some("standard".to_string()), // fee_schema
    None, // memo
);

// Create the ask
let request = ManageAskRequest::NewAsk(features.into_iter().map(Some).collect());
let response = marketplace.icrc8_ask(vec![Some(request)]).await;
```

### Placing a Bid

```rust
// Create bid features
let bid_features = vec![
    Some(BidFeature::Escrow(escrow_record)),
    Some(BidFeature::FeeSchema("standard".to_string())),
];

// Place the bid
let bid_request = NewBidRequest {
    ask_id,
    feature: bid_features,
};
let request = ManageBidRequest::NewBid(bid_request);
let response = marketplace.icrc8_bid(vec![Some(request)]).await;
```

### Querying Marketplace Data

```rust
// Get active asks
let request = AskInfoRequest::Active(None);
let response = marketplace.icrc8_ask_info(vec![Some(request)]).await;

// Get account balance
let balance_request = vec![
    (account, Some(vec![Some(BalanceRequest::Nfts(None))]))
];
let balance = marketplace.icrc8_balance_of(balance_request).await;
```

## Development

### Prerequisites

- Rust 1.70+
- DFX 0.15+
- Internet Computer SDK

### Building

```bash
# Build the canister
dfx build nft_marketplace

# Deploy to local network
dfx deploy nft_marketplace

# Deploy to mainnet
dfx deploy --network ic nft_marketplace
```

### Testing

```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --test integration

# Run benchmarks
cargo bench
```

### Configuration

The marketplace can be configured through metadata:

```rust
// Set default fee percentage (2.5%)
marketplace.set_metadata("icrc8:default_fee_percentage", "250");

// Set default ask timeout (7 days)
marketplace.set_metadata("icrc8:default_ask_timeout", "604800000000000");

// Enable ICRC-2 support
marketplace.set_metadata("icrc8:supports_icrc_2", "true");
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

## Roadmap

- [ ] Full ICRC-61 auction implementation
- [ ] Complete AMM functionality (ICRC-62)
- [ ] Advanced KYC integration (ICRC-64)
- [ ] Real-time notifications (ICRC-71)
- [ ] Multi-canister settlement
- [ ] Advanced matching engine
- [ ] Performance optimizations
- [ ] Additional token standard support
