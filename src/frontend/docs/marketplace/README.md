# NFTropoly Marketplace Frontend

A comprehensive NFT marketplace frontend built with Vue 3, Nuxt 3, and TypeScript for the Internet Computer ecosystem.

## Overview

The NFTropoly Marketplace provides a complete solution for trading NFTs with support for multiple sale types, wallet integration, and compliance features. It implements ICRC-8, ICRC-37, and other Internet Computer standards.

## Architecture

### Core Services

- **MarketplaceService**: Main service for interacting with the marketplace canister
- **WalletService**: Handles wallet connections (II, Plug, MetaMask, Phantom)
- **KYCService**: Manages Know Your Customer compliance and notifications

### State Management

- **Pinia Stores**: Centralized state management for marketplace data
  - `marketplace.ts`: Asks, bids, balances, filters, pagination
  - `approvals.ts`: NFT and token approvals

### Composables

- **useMarketplace**: Main marketplace operations orchestration
- **useAskBuilder**: Builds AskFeature arrays for different sale types
- **useApprovals**: Manages NFT and token approvals
- **usePagination**: Handles pagination for asks and balances
- **useWallet**: Wallet connection and management
- **useKYC**: KYC compliance and notifications

## Features

### Sale Types

1. **Buy Now**: Fixed price immediate purchase
2. **Auction**: Time-based bidding with reserve price
3. **Dutch Auction**: Price decreases over time
4. **AMM**: Automated Market Maker (feature flagged)

### Wallet Integration

- Internet Identity
- Plug Wallet
- MetaMask (Ethereum compatibility)
- Phantom (Solana compatibility)

### Compliance

- KYC verification (ICRC-64)
- Notification system (ICRC-71)
- Feature flags for controlled rollouts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Internet Computer development environment

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Canister IDs (for development)
NFT_COLLECTION_CANISTER_ID=uqqxf-5h777-77774-qaaaa-cai
MARKETPLACE_CANISTER_ID=u6s2n-gx777-77774-qaaba-cai
NFTROPOLY_TOKEN_CANISTER_ID=uzt4z-lp777-77774-qaabq-cai
BACKEND_CANISTER_ID=bhhab-xyaaa-aaaap-qqchq-cai

# Feature flags
ENABLE_AMM=true
ENABLE_KYC=true
ENABLE_NOTIFICATIONS=true
```

## Usage

### Basic Marketplace Operations

```typescript
import { useMarketplace } from '~/composables/useMarketplace'

const { initialize, createAsk, placeBid, loadAsks } = useMarketplace()

// Initialize with wallet
await initialize(identity)

// Create a buy now ask
const askData = {
  nfts: [
    {
      canister: 'uqqxf-5h777-77774-qaaaa-cai',
      token_id: BigInt(1),
    },
  ],
  payment_token: 'uzt4z-lp777-77774-qaabq-cai',
  ask_type: 'buynow',
  price: '100',
}

const result = await createAsk(askData)
```

### Wallet Connection

```typescript
import { useWallet } from '~/composables/useWallet'

const { connect, disconnect, isConnected, principal } = useWallet()

// Connect to Internet Identity
await connect('internet-identity')

// Check connection status
if (isConnected.value) {
  console.log('Connected as:', principal.value?.toText())
}
```

### KYC Integration

```typescript
import { useKYC } from '~/composables/useKYC'

const { isKYCRequired, isKYCApproved, submitKYCDocuments } = useKYC()

// Check KYC status
if (isKYCRequired.value && !isKYCApproved.value) {
  // Show KYC form
  await submitKYCDocuments(documents)
}
```

## Data Shapes

### Ask Types

```typescript
interface Ask {
  id: bigint
  seller: Principal
  nfts: Array<{
    canister: Principal
    token_id: bigint
  }>
  payment_token: Principal
  ask_type: AskType
  status: AskStatus
  created_at: bigint
  expires_at: bigint
}

type AskType =
  | { BuyNow: { price: bigint } }
  | { Auction: AuctionParams }
  | { Dutch: DutchParams }
  | { AMM: AMMParams }
```

### Bid Types

```typescript
interface Bid {
  id: bigint
  ask_id: bigint
  bidder: Principal
  amount: bigint
  created_at: bigint
  status: BidStatus
}
```

### Escrow Types

```typescript
interface EscrowRecord {
  ask_id: bigint
  bid_id: bigint
  amount: bigint
  created_at: bigint
  status: EscrowStatus
}
```

## API Reference

### MarketplaceService

#### Methods

- `initialize(identity?: Identity)`: Initialize the service
- `healthCheck()`: Check canister health
- `getAsks(offset: number, limit: number)`: Get paginated asks
- `getAskInfo(askId: bigint)`: Get specific ask details
- `createAsk(askData: CreateAskRequest)`: Create a new ask
- `endAsk(askId: bigint)`: End an active ask
- `bid(bidData: BidRequest)`: Place a bid
- `getBids(offset: number, limit: number)`: Get paginated bids
- `getEscrow(offset: number, limit: number)`: Get escrow records
- `getSettlements(offset: number, limit: number)`: Get settlements
- `retrySettlement(askId: bigint)`: Retry failed settlement
- `withdrawEscrow(escrowRecord: EscrowRecord)`: Withdraw escrow
- `withdrawSettlement(escrowRecord: EscrowRecord)`: Withdraw settlement
- `getBalances()`: Get user balances
- `getMetadata()`: Get canister metadata
- `getSupportedStandards()`: Get supported standards

### WalletService

#### Methods

- `isWalletAvailable(type: WalletType)`: Check if wallet is available
- `getAvailableWallets()`: Get list of available wallets
- `connect(type: WalletType)`: Connect to wallet
- `disconnect()`: Disconnect current wallet
- `getCurrentConnection()`: Get current connection
- `isConnected()`: Check if connected

### KYCService

#### Methods

- `getKYCStatus(principal: Principal)`: Get KYC status
- `submitKYCDocuments(principal: Principal, documents: KYCDocument[])`: Submit KYC documents
- `getNotifications(principal: Principal)`: Get notifications
- `createNotification(principal: Principal, notification: Notification)`: Create notification

## Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

### Test Structure

- `tests/setup.ts`: Test configuration and mocks
- `tests/services/`: Service unit tests
- `tests/composables/`: Composable unit tests
- `tests/utils/`: Utility function tests
- `tests/e2e/`: End-to-end flow tests

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

The application automatically detects the environment and configures canister IDs accordingly:

- **Development**: Uses `canister_ids.json` or environment variables
- **Production**: Uses environment variables or fallback defaults

### Canister ID Resolution

1. Check `canister_ids.json` for local development
2. Fall back to environment variables
3. Use hardcoded defaults as last resort

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure wallet is installed and unlocked
   - Check browser console for errors
   - Verify canister IDs are correct

2. **KYC Verification Issues**
   - Check if KYC is required for your transaction
   - Ensure all required documents are uploaded
   - Contact support if verification is stuck

3. **Transaction Failures**
   - Verify sufficient token balance
   - Check NFT/token approvals
   - Ensure canister is deployed and running

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

## Changelog

### v1.0.0

- Initial release
- Complete marketplace functionality
- Wallet integration
- KYC compliance
- AMM support (feature flagged)
- Comprehensive testing suite
