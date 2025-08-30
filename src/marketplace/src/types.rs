//! ICRC-8 Compliant Data Types
//!
//! This module defines all the data types required for ICRC-8 compliance.

use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Serialize;
use std::borrow::Cow;

// Newtype wrapper for Vec<u64> to implement Storable
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct AskIds(pub Vec<u64>);

impl Storable for AskIds {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

// ============================================================================
// Core ICRC-8 Types
// ============================================================================

/// Account representation for token owners
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Serialize)]
pub struct Account {
    pub owner: Principal,
    pub sub_account: Option<Vec<u8>>,
}

impl Storable for Account {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

/// Token specification for identifying tokens in the marketplace
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct TokenSpec {
    pub canister: Principal,
    pub symbol: String,
    pub standards: Vec<ICRCStandards>,
}

impl Storable for TokenSpec {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

/// Supported ICRC standards
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum ICRCStandards {
    ICRC1(Option<ICRC1TokenSpecDetail>),
    ICRC2(Option<ICRC2TokenSpecDetail>),
    ICRC4(Option<ICRC4TokenSpecDetail>),
    ICRC7(Option<ICRC7TokenSpecDetail>),
    ICRC37(Option<ICRC37TokenSpecDetail>),
}

// ICRCStandards

/// ICRC-1 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC1TokenSpecDetail {
    pub amount: u64,
    pub fee: Option<u64>,
    pub decimals: u64,
}

// ICRC1TokenSpecDetail

/// ICRC-2 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC2TokenSpecDetail {
    pub amount: u64,
    pub approval_fee: Option<u64>,
    pub transfer_from_fee: Option<u64>,
    pub decimals: u64,
}

// ICRC2TokenSpecDetail

/// ICRC-4 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC4TokenSpecDetail {
    pub batch_fee: Option<u64>,
    pub decimals: u64,
}

// ICRC4TokenSpecDetail

/// ICRC-7 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC7TokenSpecDetail {
    pub fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

// ICRC7TokenSpecDetail

/// ICRC-37 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC37TokenSpecDetail {
    pub approval_fee: Option<TokenSpec>,
    pub transfer_from_fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

// ICRC37TokenSpecDetail

/// Token specification result for transaction outcomes
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct TokenSpecResult {
    pub canister: Principal,
    pub symbol: String,
    pub standards: Vec<ICRCStandards>,
    pub result: u64, // Transaction index
    pub sending_account: Account,
    pub receiving_account: Account,
    pub ask_id: Option<u64>,
}

// ============================================================================
// Escrow Types
// ============================================================================

/// Escrow record for managing assets during transactions
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EscrowRecord {
    pub escrow_type: EscrowType,
    pub buyer: Option<Account>,
    pub seller: Account,
    pub ask_id: Option<u64>,
    pub lock_to_date: Option<u64>,
}

impl Storable for EscrowRecord {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum EscrowType {
    Bid(Vec<Option<TokenSpec>>),
    Ask(Vec<Option<TokenSpec>>),
    Settlement(Vec<Option<TokenSpec>>),
}

// EscrowType

/// Encumbrance specification for multi-canister trades
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EncumbranceSpec {
    pub tokens: Vec<TokenSpec>,
    pub trustees: Vec<Principal>,
    pub timeout: u64,
}

/// Encumbrance details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EncumbranceDetail {
    pub spec: EncumbranceSpec,
    pub expires_at: u64,
}

// ============================================================================
// Ask Types
// ============================================================================

// ICRC-61: Standard Auctions for Ledger Native Markets
/// Auction feature for standard auctions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct AuctionFeature {
    pub auction_token: TokenSpec,
    pub wait_for_quiet: Option<WaitQuietParams>,
    pub reserve: u64,
    pub start_price: u64,
    pub min_increase: MinIncrease,
}

/// Wait for quiet parameters for auction extensions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct WaitQuietParams {
    pub window: u64,
    pub extension: u64,
    pub fade: f64,
    pub max: u64,
}

/// Minimum increase for auction bids
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum MinIncrease {
    Percentage(f64),
    Amount(u64),
}

// ICRC-63: Dutch Auctions for Ledger Native Markets
/// Time unit for Dutch auction decay
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum TimeUnit {
    Hour(u64),
    Minute(u64),
    Day(u64),
}

/// Decay type for Dutch auctions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum DecayType {
    Flat(u64),
    Percent(f64),
}

/// Dutch auction parameters
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct DutchParams {
    pub time_unit: TimeUnit,
    pub decay_type: DecayType,
}

/// Dutch auction feature for ICRC-63
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct DutchAuctionFeature {
    pub dutch: DutchParams,
}

// ICRC-62: AMMs for Ledger Native Markets
/// AMM parameters for automated market making
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct AMMParams {
    pub token_1: TokenSpec,
    pub token_2: TokenSpec,
    pub max: u64,
    pub min: u64,
    pub decimals: u64,
}

/// AMM feature for ICRC-62
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct AMMFeature {
    pub amm: AMMParams,
}

// ICRC-64: Elective KYC for Ledger Native Markets
/// KYC feature for ICRC-64
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct KYCFeature {
    pub icrc17_kyc: Principal,
}

// ICRC-17: Elective KYC Service Standard
/// KYC account types for ICRC-17
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum KYCAccount {
    Account(Vec<u8>),
    Extensible(CandyShared),
    ICRC1 {
        owner: Principal,
        subaccount: Option<Vec<u8>>,
    },
}

/// ICRC-17 token specification
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum ICTokenSpec {
    Extensible(CandyShared),
    IC(ICTokenSpecDetail),
}

/// ICRC-17 token specification details
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct ICTokenSpecDetail {
    pub canister: Principal,
    pub decimals: u64,
    pub fee: Option<u64>,
    pub id: Option<u64>,
    pub standard: ICTokenStandard,
    pub symbol: String,
}

/// ICRC-17 token standards
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum ICTokenStandard {
    DIP20,
    EXTFungible,
    ICRC1,
    Ledger,
    Other(CandyShared),
}

/// ICRC-17 KYC request
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct KYCCanisterRequest {
    pub amount: Option<u64>,
    pub counterparty: KYCAccount,
    pub token: Option<ICTokenSpec>,
}

/// ICRC-17 KYC notification
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct KYCNotification {
    pub amount: Option<u64>,
    pub counterparty: KYCAccount,
    pub token: Option<ICTokenSpec>,
}

/// ICRC-17 KYC result
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct KYCResult {
    pub aml: KYCStatus,
    pub amount: Option<u64>,
    pub kyc: KYCStatus,
    pub message: Option<String>,
    pub token: Option<ICTokenSpec>,
    pub timeout: Option<u64>,
}

/// KYC status enum
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum KYCStatus {
    Fail,
    NA,
    Pass,
}

/// CandyShared type for extensibility (simplified version)
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum CandyShared {
    Array(Vec<CandyShared>),
    Blob(Vec<u8>),
    Bool(bool),
    Bytes(Vec<u8>),
    Float(f64),
    Int(i64),
    Nat(u64),
    Option(Option<Box<CandyShared>>),
    Principal(Principal),
    Text(String),
}

/// Ask features for marketplace asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum AskFeature {
    AllowPartial,
    UnsolicitedOffer(Account),
    BuyNow(Vec<Vec<BuyNowReq>>),
    AllowList(Vec<Account>),
    Broker(Account),
    StartDate(u64),
    Ending(EndingType),
    AskToken(Vec<Option<TokenSpec>>),
    FeeSchema(String),
    FeeAccounts(Vec<(String, TokenSpec, Account)>),
    BidPaysFees(Option<Vec<String>>),
    CreatedAt(u64),
    Memo(Vec<u8>),
    Auction(AuctionFeature),    // ← New ICRC-61 auction feature
    Dutch(DutchAuctionFeature), // ← New ICRC-63 Dutch auction feature
    AMM(AMMFeature),            // ← New ICRC-62 AMM feature
    KYC(KYCFeature),            // ← New ICRC-64 KYC feature
    Notify(NotifyFeature),      // ← New ICRC-71 notification feature
}

/// Buy now requirements
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct BuyNowReq {
    pub token: TokenSpec,
    pub amount: u64,
}

/// Ending types for asks
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum EndingType {
    Perpetual,
    Date(u64),
    Timeout(u64),
}

/// Ask status type for tracking ask states
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize)]
pub enum AskStatusType {
    Open,
    Closed,
    Encumbered(Vec<EncumbranceDetail>),
    NotStarted,
}

/// Auction information for auction-based asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct AuctionInfo {
    pub token: TokenSpec,
    pub current_bid_amount: Option<u64>,
    pub end_date: Option<u64>,
    pub start_date: Option<u64>,
    pub min_next_bid: Option<u64>,
    pub wait_for_quiet_count: Option<u64>,
    pub current_escrow: Option<EscrowRecord>,
    // ICRC-61 Standard Auction fields
    pub reserve_price: u64,
    pub start_price: u64,
    pub min_increase: MinIncrease,
    pub wait_for_quiet: Option<WaitQuietParams>,
    pub current_winner: Option<Account>,
}

/// Settlement information for completed asks
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize)]
pub struct SettlementInfo {
    pub bid_tokens: Vec<Option<TokenSpecResult>>,
    pub ask_tokens: Vec<Option<TokenSpecResult>>,
    pub royalties: Vec<(Account, u64, String)>,
}

/// Ask status for tracking marketplace asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize)]
pub struct AskStatus {
    pub ask_id: u64,
    pub original_broker_id: Option<Account>,
    pub current_broker_id: Option<Account>,
    pub config: Vec<AskFeature>,
    pub auction_info: Option<AuctionInfo>,
    pub settlement: Option<SettlementInfo>,
    pub allow_list: Option<Vec<Account>>,
    pub participants: Vec<Account>,
    pub settled_at: Option<(Principal, u64)>,
    pub status: AskStatusType,
    pub seller: Account,
}

impl Storable for AskStatus {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

// ============================================================================
// Bid Types
// ============================================================================

/// Bid features for buyer offers
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BidFeature {
    Broker(Account),
    Escrow(EscrowRecord),
    FeeSchema(String),
    FeeAccount(Vec<(String, TokenSpec, Account)>),
    Amm(AMMParams),
}

/// Engine match for multi-canister trades
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatch {
    pub leader: Option<Principal>,
    pub asks: Vec<EngineMatchAsk>,
}

/// Engine match ask details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchAsk {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpec>>>,
}

// ============================================================================
// Request/Response Types
// ============================================================================

/// Manage ask request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ManageAskRequest {
    NewAsk(Vec<Option<AskFeature>>),
    EndAsk(u64),
    RefreshOffers(Option<Account>),
    WithdrawSettlement(EscrowRecord),
    WithdrawEscrow(EscrowRecord),
    RejectOffer(u64),
    DistributeAsk(u64),
    UpdateAmm(AMMUpdate),
    LockAsk(LockAsk),
    Unencumber(u64),
}

/// Manage bid request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidRequest {
    NewBid(NewBidRequest),
    EngineMatch(EngineMatch),
    WithdrawEscrow(EscrowRecord),
}

/// New bid request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidRequest {
    pub ask_id: u64,
    pub feature: Vec<Option<BidFeature>>,
}

/// Manage ask response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ManageAskResponse {
    NewAsk(Result<NewAskResult, GenericError>),
    EndAsk(Result<u64, GenericError>),
    RefreshOffers(Result<RefreshOffersResult, GenericError>),
    WithdrawSettlement(Result<WithdrawResult, GenericError>),
    DistributeAsk(Result<Vec<DistributionResult>, GenericError>),
    LockAsk(Result<Vec<TokenSpecResult>, GenericError>),
}

/// Manage bid response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidResponse {
    NewBid(Result<NewBidResult, GenericError>),
    EngineMatch(Result<Vec<EngineMatchResult>, GenericError>),
    WithdrawEscrow(Result<WithdrawResult, GenericError>),
}

/// New ask result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewAskResult {
    pub ask_id: u64,
    pub escrow: EscrowRecord,
}

/// New bid result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidResult {
    pub escrow: EscrowRecord,
    pub result: u64,
}

/// Refresh offers result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct RefreshOffersResult {
    pub records: Vec<(Vec<u8>, Option<AskStatus>)>,
    pub eof: bool,
    pub count: u64,
}

/// Withdraw result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct WithdrawResult {
    pub withdraw_result: u64,
    pub token_results: Vec<TokenResult>,
}

/// Token result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct TokenResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Distribution result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct DistributionResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Engine match result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchResult {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpecResult>>>,
}

// ============================================================================
// Query Types
// ============================================================================

/// Balance request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceRequest {
    Nfts(Option<BalancePagination>),
    Tokens,
    Escrow(Option<BalancePagination>),
    AskSettlements(Option<BalancePagination>),
    Offers(Option<BalancePagination>),
}

/// Balance pagination
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalancePagination {
    pub prev: Option<u64>,
    pub take: Option<u64>,
}

/// Balance result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceResult {
    Nfts(Option<BalanceRecords>),
    Tokens(Option<u64>),
    Escrow(BalanceRecords),
    AskSettlements(BalanceRecords),
    Offers(BalanceRecords),
}

/// Balance records
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalanceRecords {
    pub records: Vec<EscrowRecord>,
    pub count: u64,
    pub eof: bool,
}

/// Ask info request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum AskInfoRequest {
    Active(Option<(Option<u64>, Option<u64>)>),
    History(u64, u64),
    Status(u64),
}

/// Ask info response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum AskInfoResponse {
    Active(AskInfoRecords),
    History(AskInfoRecords),
    Status(Option<AskStatus>),
}

/// Ask info records
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct AskInfoRecords {
    pub records: Vec<Option<AskStatus>>,
    pub eof: bool,
    pub count: u64,
}

// ============================================================================
// Utility Types
// ============================================================================

/// Generic error type
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct GenericError {
    pub code: u64,
    pub message: String,
}

/// AMM update
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AMMUpdate {
    pub ask_id: u64,
    pub params: AMMParams,
}

/// Lock ask
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct LockAsk {
    pub ask_id: u64,
    pub lock_duration: u64,
    pub fee: TokenSpec,
}

// ============================================================================
// Type Aliases
// ============================================================================

// Type aliases for convenience
pub type ListingId = u64;
pub type TransactionId = u64;
pub type CollectionId = Principal;
pub type TokenId = u64;

// ============================================================================
// Implementations
// ============================================================================

impl Account {
    pub fn new(owner: Principal) -> Self {
        Self {
            owner,
            sub_account: None,
        }
    }

    pub fn with_subaccount(owner: Principal, sub_account: Vec<u8>) -> Self {
        Self {
            owner,
            sub_account: Some(sub_account),
        }
    }
}

impl TokenSpec {
    pub fn new(canister: Principal, symbol: String) -> Self {
        Self {
            canister,
            symbol,
            standards: Vec::new(),
        }
    }

    pub fn with_standard(mut self, standard: ICRCStandards) -> Self {
        self.standards.push(standard);
        self
    }
}

impl EscrowRecord {
    pub fn new(escrow_type: EscrowType, seller: Account) -> Self {
        Self {
            escrow_type,
            buyer: None,
            seller,
            ask_id: None,
            lock_to_date: None,
        }
    }
}

// ICRC-71: Market Notifications
/// Notification feature for ICRC-71
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct NotifyFeature {
    pub notify: Vec<Principal>,
}

/// Notification types for marketplace events
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum NotificationType {
    AskCreated,
    AskSettled,
    AskCancelled,
    BidPlaced,
    BidAccepted,
    BidRejected,
    AuctionStarted,
    AuctionEnded,
    PriceChanged,
    KYCRequired,
    SettlementCompleted,
}

/// Notification message structure
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct Notification {
    pub notification_type: NotificationType,
    pub ask_id: Option<u64>,
    pub message: String,
    pub timestamp: u64,
    pub data: Option<CandyShared>, // Additional data for extensibility
}
