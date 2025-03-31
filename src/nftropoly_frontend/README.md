# NFTropoly Frontend

NFTropoly is a multichain, plug-and-play NFT marketplace that can be seamlessly integrated into any application, game, or platform. Built with Svelte and Internet Computer, it allows users to trade NFTs from ANY blockchain with zero gas fees and minimal configuration.

## Vision

NFTropoly aims to be the ultimate plug-and-play NFT marketplace - designed from the ground up to be embedded in any application, game, or dApp while maintaining a lightweight footprint. Whether you're developing a metaverse game, a social platform, or a blockchain application, NFTropoly provides immediate NFT trading capabilities with just a few lines of code.

## Business Model

- **3% Commission**: NFTropoly charges a small 3% commission on completed transactions (paid by the buyer), making the platform sustainable while keeping costs low for users.
- **No Gas Fees**: Transactions on NFTropoly are executed on the Internet Computer, eliminating gas fees typically associated with blockchain transactions.
- **Self-sustaining Ecosystem**: Commission fees support ongoing development, infrastructure, and feature enhancements.
- **Revenue Sharing**: For platforms that embed NFTropoly, revenue sharing options are available with custom splits of the commission fees.

## Key Features

- **Plug-and-Play Integration**: Add NFT marketplace functionality to any app with minimal code
- **Multichain Support**: Trade NFTs from Ethereum, Solana, Internet Computer, and more
- **No Gas Fees**: No gas fees for transactions - operations run on the Internet Computer
- **Multiple Payment Options**: 
  - Accept a wide variety of tokens as payment (cross-chain)
  - Fiat payment integration via Stripe (coming soon)
  - Additional fiat on/off-ramps planned
- **Flexible Trading Mechanisms**:
  - Standard listings
  - Auctions
  - Dutch auctions (declining price)
  - Atomic swaps (NFT for NFT)
  - Real-time swaps with tokens
- **Portable Deployment Options**: 
  - Component integration for React, Vue, Svelte apps
  - iFrame embedding for any website
  - JavaScript SDK for custom implementations
- **Internet Identity**: Secure authentication through Internet Computer's Identity service
- **Responsive Design**: Works on any device

## Prerequisites

- Node.js (v16 or higher)
- DFX (Internet Computer SDK)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd nftropoly
```

2. Install dependencies:

```bash
cd src/nftropoly_frontend
npm install
```

3. Start the Internet Computer local replica:

```bash
dfx start --background
```

4. Deploy the canisters:

```bash
dfx deploy
```

## Development

To start the development server:

```bash
npm run start
```

This will start a development server at `http://localhost:3000`.

## Building for Production

To build the frontend for production:

```bash
npm run build
```

## Integration Guide

NFTropoly is designed to be embedded in other applications, games, or platforms. To integrate it:

### Component Integration

```js
// Install the package (coming soon)
npm install nftropoly

// Import and use the component in your application
import { NFTropolyMarketplace } from 'nftropoly';

// Then in your component
<NFTropolyMarketplace 
  config={{
    chains: ['IC', 'ETH', 'SOL'],
    theme: 'light',
    showHeader: true,
    commissionRate: 0.03 // 3% commission
  }} 
/>
```

### iFrame Embedding

```html
<!-- Simple iFrame integration for any website -->
<iframe 
  src="https://nftropoly.ic0.app/embed?chains=IC,ETH&theme=light" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

### JavaScript SDK

```js
// Programmatic interaction with NFTropoly
import { NFTropolySDK } from 'nftropoly/sdk';

const sdk = new NFTropolySDK({
  apiKey: 'your-api-key'
});

// Fetch NFTs
const nfts = await sdk.getNFTs({ blockchain: 'ETH' });

// Purchase an NFT (3% commission applies)
const purchase = await sdk.purchaseNFT('nft-id-123');
```

## Project Structure

- `src/`: Source code for the frontend
  - `lib/`: Reusable components, services, and utilities
    - `components/`: Svelte components
    - `services/`: Service layer for API interactions
    - `stores/`: Svelte stores for state management
    - `types/`: TypeScript type definitions
  - `routes/`: SvelteKit routes
  - `index.scss`: Global styles

## Feature Status

### ✅ Completed
- Basic wallet connection with Internet Identity
- Simple NFT display components
- Multichain NFT display interface
- Blockchain filtering functionality
- Frontend embedding capabilities 
- Navigation component
- API documentation
- Integration guide

### 🔄 In Progress
- Backend canister for NFT storage
- NFT creation and minting functionality
- User profile management
- Basic listing and purchasing with 3% commission model
- Internet Computer NFT standard implementation
- Multi-payment token support
- Commission management system

### 📝 Planned Features

#### Core Infrastructure
- Transaction history tracking
- Seller dashboard
- Admin portal for marketplace management
- Revenue sharing implementation for partners

#### Multichain Support
- Ethereum NFT integration (ERC-721, ERC-1155)
- Solana NFT integration
- Cross-chain NFT viewing capabilities
- Multi-wallet support

#### Payment Options
- Multi-token payment support
- Cross-chain token payments
- Stripe integration for fiat payments
- Additional fiat on/off-ramps

#### Advanced Trading Features
- Auction system implementation
- Dutch auction capabilities
- NFT-for-NFT trading (atomic swaps)
- Bundle trading (multiple NFTs in one transaction)
- Offer/counter-offer system

#### Embedability & Extensibility
- Custom theming options
- Plugin architecture for extensibility
- Additional frontend framework support

#### Social and Discovery Features
- Social feeds for NFT activity
- Collection curation and discovery
- Follow artists and collectors
- Notifications for price changes and activity
- Featured collections and trending items

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 