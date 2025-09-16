# Marketplace API Reference

## Overview

This document provides detailed API reference for the NFTropoly Marketplace frontend services and composables.

## Services

### MarketplaceService

The main service for interacting with the marketplace canister.

#### Constructor

```typescript
new MarketplaceService()
```

#### Methods

##### initialize(identity?: Identity)

Initialize the marketplace service with an identity.

**Parameters:**

- `identity` (optional): The identity to use for authentication

**Returns:** `Promise<void>`

**Example:**

```typescript
const service = new MarketplaceService()
await service.initialize(identity)
```

##### healthCheck()

Check the health of the marketplace canister.

**Returns:** `Promise<string>`

**Example:**

```typescript
const health = await service.healthCheck()
console.log(health) // "healthy"
```

##### getAsks(offset: number, limit: number)

Get paginated list of asks.

**Parameters:**

- `offset`: Starting index for pagination
- `limit`: Maximum number of asks to return

**Returns:** `Promise<Ask[]>`

**Example:**

```typescript
const asks = await service.getAsks(0, 10)
```

##### getAskInfo(askId: bigint)

Get detailed information about a specific ask.

**Parameters:**

- `askId`: The ID of the ask to retrieve

**Returns:** `Promise<AskInfoResponse>`

**Example:**

```typescript
const askInfo = await service.getAskInfo(BigInt(1))
```

##### createAsk(askData: CreateAskRequest)

Create a new ask (list an NFT for sale).

**Parameters:**

- `askData`: The ask data including NFTs, payment token, and ask type

**Returns:** `Promise<CreateAskResponse>`

**Example:**

```typescript
const askData = {
  nfts: [
    {
      canister: Principal.fromText('uqqxf-5h777-77774-qaaaa-cai'),
      token_id: BigInt(1),
    },
  ],
  payment_token: Principal.fromText('uzt4z-lp777-77774-qaabq-cai'),
  ask_type: { BuyNow: { price: BigInt(100000000) } },
  expires_at: BigInt(Date.now() + 86400000),
}

const result = await service.createAsk(askData)
```

##### endAsk(askId: bigint)

End an active ask.

**Parameters:**

- `askId`: The ID of the ask to end

**Returns:** `Promise<EndAskResponse>`

**Example:**

```typescript
await service.endAsk(BigInt(1))
```

##### bid(bidData: BidRequest)

Place a bid on an ask.

**Parameters:**

- `bidData`: The bid data including ask ID and amount

**Returns:** `Promise<BidResponse>`

**Example:**

```typescript
const bidData = {
  ask_id: BigInt(1),
  amount: BigInt(100000000),
}

const result = await service.bid(bidData)
```

##### getBids(offset: number, limit: number)

Get paginated list of bids.

**Parameters:**

- `offset`: Starting index for pagination
- `limit`: Maximum number of bids to return

**Returns:** `Promise<Bid[]>`

**Example:**

```typescript
const bids = await service.getBids(0, 10)
```

##### getEscrow(offset: number, limit: number)

Get paginated list of escrow records.

**Parameters:**

- `offset`: Starting index for pagination
- `limit`: Maximum number of escrow records to return

**Returns:** `Promise<EscrowRecord[]>`

**Example:**

```typescript
const escrow = await service.getEscrow(0, 10)
```

##### getSettlements(offset: number, limit: number)

Get paginated list of settlements.

**Parameters:**

- `offset`: Starting index for pagination
- `limit`: Maximum number of settlements to return

**Returns:** `Promise<SettlementRecord[]>`

**Example:**

```typescript
const settlements = await service.getSettlements(0, 10)
```

##### retrySettlement(askId: bigint)

Retry a failed settlement.

**Parameters:**

- `askId`: The ID of the ask to retry settlement for

**Returns:** `Promise<RetrySettlementResponse>`

**Example:**

```typescript
await service.retrySettlement(BigInt(1))
```

##### withdrawEscrow(escrowRecord: EscrowRecord)

Withdraw funds from escrow.

**Parameters:**

- `escrowRecord`: The escrow record to withdraw from

**Returns:** `Promise<WithdrawEscrowResponse>`

**Example:**

```typescript
const escrowRecord = {
  /* escrow data */
}
await service.withdrawEscrow(escrowRecord)
```

##### withdrawSettlement(escrowRecord: EscrowRecord)

Withdraw funds from settlement.

**Parameters:**

- `escrowRecord`: The escrow record to withdraw from

**Returns:** `Promise<WithdrawSettlementResponse>`

**Example:**

```typescript
const escrowRecord = {
  /* escrow data */
}
await service.withdrawSettlement(escrowRecord)
```

##### getBalances()

Get user balances for all supported tokens.

**Returns:** `Promise<Balance[]>`

**Example:**

```typescript
const balances = await service.getBalances()
```

##### getMetadata()

Get marketplace canister metadata.

**Returns:** `Promise<ICRC8Metadata[]>`

**Example:**

```typescript
const metadata = await service.getMetadata()
```

##### getSupportedStandards()

Get list of supported standards.

**Returns:** `Promise<SupportedStandard[]>`

**Example:**

```typescript
const standards = await service.getSupportedStandards()
```

### WalletService

Service for managing wallet connections.

#### Methods

##### isWalletAvailable(type: WalletType)

Check if a specific wallet type is available.

**Parameters:**

- `type`: The wallet type to check

**Returns:** `boolean`

**Example:**

```typescript
const isAvailable = walletService.isWalletAvailable('internet-identity')
```

##### getAvailableWallets()

Get list of available wallet types.

**Returns:** `WalletType[]`

**Example:**

```typescript
const wallets = walletService.getAvailableWallets()
// ['internet-identity', 'plug', 'metamask', 'phantom']
```

##### connect(type: WalletType)

Connect to a specific wallet.

**Parameters:**

- `type`: The wallet type to connect to

**Returns:** `Promise<WalletConnection>`

**Example:**

```typescript
const connection = await walletService.connect('internet-identity')
```

##### disconnect()

Disconnect the current wallet.

**Returns:** `Promise<void>`

**Example:**

```typescript
await walletService.disconnect()
```

##### getCurrentConnection()

Get the current wallet connection.

**Returns:** `WalletConnection | null`

**Example:**

```typescript
const connection = walletService.getCurrentConnection()
```

##### isConnected()

Check if a wallet is currently connected.

**Returns:** `boolean`

**Example:**

```typescript
const connected = walletService.isConnected()
```

### KYCService

Service for managing KYC compliance and notifications.

#### Methods

##### getKYCStatus(principal: Principal)

Get KYC status for a principal.

**Parameters:**

- `principal`: The principal to check KYC status for

**Returns:** `Promise<KYCStatus | null>`

**Example:**

```typescript
const status = await kycService.getKYCStatus(principal)
```

##### submitKYCDocuments(principal: Principal, documents: KYCDocument[])

Submit KYC documents for verification.

**Parameters:**

- `principal`: The principal submitting documents
- `documents`: Array of KYC documents

**Returns:** `Promise<void>`

**Example:**

```typescript
const documents = [
  {
    id: 'doc1',
    type: 'passport',
    name: 'Passport',
    status: 'pending',
    uploadedAt: new Date(),
  },
]

await kycService.submitKYCDocuments(principal, documents)
```

##### getNotifications(principal: Principal)

Get notifications for a principal.

**Parameters:**

- `principal`: The principal to get notifications for

**Returns:** `Promise<Notification[]>`

**Example:**

```typescript
const notifications = await kycService.getNotifications(principal)
```

## Composables

### useMarketplace

Main composable for marketplace operations.

#### Returns

- `asks`: Reactive array of asks
- `bids`: Reactive array of bids
- `escrow`: Reactive array of escrow records
- `settlements`: Reactive array of settlements
- `balances`: Reactive array of balances
- `loading`: Reactive loading state
- `initialized`: Reactive initialization state

#### Methods

- `initialize(identity?: Identity)`: Initialize the marketplace
- `loadAsks()`: Load asks from the service
- `createAsk(askData)`: Create a new ask
- `endAsk(askId)`: End an ask
- `placeBid(bidData)`: Place a bid
- `loadBids()`: Load bids from the service
- `loadEscrow()`: Load escrow records
- `loadSettlements()`: Load settlements
- `loadBalances()`: Load balances
- `retrySettlement(askId)`: Retry settlement
- `withdrawEscrow(escrowRecord)`: Withdraw escrow
- `withdrawSettlement(escrowRecord)`: Withdraw settlement

### useWallet

Composable for wallet management.

#### Returns

- `connection`: Reactive wallet connection
- `availableWallets`: Reactive array of available wallets
- `connecting`: Reactive connecting state
- `disconnecting`: Reactive disconnecting state
- `isConnected`: Reactive connection status
- `principal`: Reactive principal
- `accountId`: Reactive account ID
- `walletType`: Reactive wallet type

#### Methods

- `connect(type)`: Connect to a wallet
- `disconnect()`: Disconnect current wallet
- `reconnect()`: Reconnect to stored wallet
- `getWalletInfo(type)`: Get wallet information
- `isWalletAvailable(type)`: Check if wallet is available

### useKYC

Composable for KYC management.

#### Returns

- `kycStatus`: Reactive KYC status
- `kycRequirements`: Reactive KYC requirements
- `notifications`: Reactive notifications
- `notificationPreferences`: Reactive notification preferences
- `loading`: Reactive loading state
- `submitting`: Reactive submitting state
- `isKYCRequired`: Reactive KYC requirement status
- `isKYCApproved`: Reactive KYC approval status
- `kycLevel`: Reactive KYC level
- `unreadCount`: Reactive unread notification count

#### Methods

- `loadKYCStatus()`: Load KYC status
- `loadKYCRequirements()`: Load KYC requirements
- `submitKYCDocuments(documents)`: Submit KYC documents
- `loadNotifications()`: Load notifications
- `markNotificationAsRead(id)`: Mark notification as read
- `markAllNotificationsAsRead()`: Mark all notifications as read
- `loadNotificationPreferences()`: Load notification preferences
- `updateNotificationPreferences(preferences)`: Update notification preferences
- `createNotification(notification)`: Create a notification

## Types

### Core Types

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

interface Bid {
  id: bigint
  ask_id: bigint
  bidder: Principal
  amount: bigint
  created_at: bigint
  status: BidStatus
}

interface EscrowRecord {
  ask_id: bigint
  bid_id: bigint
  amount: bigint
  created_at: bigint
  status: EscrowStatus
}

interface Balance {
  token: Principal
  amount: bigint
  decimals: number
  symbol: string
  name: string
}
```

### Wallet Types

```typescript
type WalletType = 'internet-identity' | 'plug' | 'metamask' | 'phantom'

interface WalletConnection {
  identity: Identity
  principal: Principal
  accountId: string
  walletType: WalletType
}

interface WalletInfo {
  type: WalletType
  principal: Principal
  accountId: string
  name: string
  icon: string
  connected: boolean
}
```

### KYC Types

```typescript
interface KYCStatus {
  principal: Principal
  status: 'pending' | 'approved' | 'rejected' | 'not_required'
  level: number
  verifiedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
}

interface Notification {
  id: string
  type: 'kyc' | 'transaction' | 'marketplace' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  actionUrl?: string
  metadata?: Record<string, unknown>
}
```

## Error Handling

All services and composables include comprehensive error handling:

- **Service Errors**: Wrapped in try-catch blocks with meaningful error messages
- **Network Errors**: Handled with retry logic and user-friendly messages
- **Validation Errors**: Input validation with clear error feedback
- **Type Errors**: TypeScript type guards for runtime safety

## Examples

### Complete Flow Example

```typescript
import { useMarketplace } from '~/composables/useMarketplace'
import { useWallet } from '~/composables/useWallet'
import { useKYC } from '~/composables/useKYC'

export default {
  setup() {
    const { connect, isConnected, principal } = useWallet()
    const { initialize, createAsk, placeBid } = useMarketplace()
    const { isKYCRequired, isKYCApproved } = useKYC()

    const handleConnect = async () => {
      await connect('internet-identity')
      await initialize()
    }

    const handleCreateAsk = async () => {
      if (!isKYCRequired.value || isKYCApproved.value) {
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

        await createAsk(askData)
      }
    }

    return {
      isConnected,
      principal,
      handleConnect,
      handleCreateAsk,
    }
  },
}
```
