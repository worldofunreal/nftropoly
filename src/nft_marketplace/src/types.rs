//! ICRC-8 Compliant Data Types
//! 
//! This module defines all the data types required for ICRC-8 compliance.

use candid::{CandidType, Deserialize, Principal};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// Core ICRC-8 Types
// ============================================================================

/// Account representation for token owners
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct Account {
    pub owner: Principal,
    pub sub_account: Option<Vec<u8>>,
}

/// Token specification for identifying tokens in the marketplace
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct TokenSpec {
    pub canister: Principal,
    pub symbol: String,
    pub standards: Vec<ICRCStandards>,
}

/// Supported ICRC standards
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ICRCStandards {
    ICRC1(Option<ICRC1TokenSpecDetail>),
    ICRC2(Option<ICRC2TokenSpecDetail>),
    ICRC4(Option<ICRC4TokenSpecDetail>),
    ICRC7(Option<ICRC7TokenSpecDetail>),
    ICRC37(Option<ICRC37TokenSpecDetail>),
}

/// ICRC-1 token specification details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ICRC1TokenSpecDetail {
    pub amount: u64,
    pub fee: Option<u64>,
    pub decimals: u8,
}

/// ICRC-2 token specification details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ICRC2TokenSpecDetail {
    pub amount: u64,
    pub approval_fee: Option<u64>,
    pub transfer_from_fee: Option<u64>,
    pub decimals: u8,
}

/// ICRC-4 token specification details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ICRC4TokenSpecDetail {
    pub batch_fee: Option<u64>,
    pub decimals: u8,
}

/// ICRC-7 token specification details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ICRC7TokenSpecDetail {
    pub fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

/// ICRC-37 token specification details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ICRC37TokenSpecDetail {
    pub approval_fee: Option<TokenSpec>,
    pub transfer_from_fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

/// Token specification result for transaction outcomes
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
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
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EscrowRecord {
    pub escrow_type: EscrowType,
    pub buyer: Option<Account>,
    pub seller: Account,
    pub ask_id: Option<u64>,
    pub lock_to_date: Option<u64>,
}

/// Types of escrow
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum EscrowType {
    Bid(Vec<Option<TokenSpec>>),
    Ask(Vec<Option<TokenSpec>>),
    Settlement(Vec<Option<TokenSpec>>),
}

/// Encumbrance specification for multi-canister trades
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EncumbranceSpec {
    pub tokens: Vec<TokenSpec>,
    pub trustees: Vec<Principal>,
    pub timeout: u64,
}

/// Encumbrance details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EncumbranceDetail {
    pub spec: EncumbranceSpec,
    pub expires_at: u64,
}

// ============================================================================
// Ask Types
// ============================================================================

/// Ask features for seller listings
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
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
}

/// Buy now requirements
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct BuyNowReq {
    pub token: TokenSpec,
    pub amount: u64,
}

/// Ending types for asks
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum EndingType {
    Perpetual,
    Date(u64),
    Timeout(u64),
}

/// Ask status information
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
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

/// Auction information
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct AuctionInfo {
    pub token: TokenSpec,
    pub current_bid_amount: Option<u64>,
    pub end_date: Option<u64>,
    pub start_date: Option<u64>,
    pub min_next_bid: Option<u64>,
    pub wait_for_quiet_count: Option<u64>,
    pub current_escrow: Option<EscrowRecord>,
}

/// Settlement information
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct SettlementInfo {
    pub bid_tokens: Vec<Option<TokenSpecResult>>,
    pub ask_tokens: Vec<Option<TokenSpecResult>>,
    pub royalties: Vec<(Account, u64, String)>,
}

/// Ask status types
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum AskStatusType {
    Open,
    Closed,
    Encumbered(Vec<EncumbranceDetail>),
    NotStarted,
}

// ============================================================================
// Bid Types
// ============================================================================

/// Bid features for buyer offers
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum BidFeature {
    Broker(Account),
    Escrow(EscrowRecord),
    FeeSchema(String),
    FeeAccount(Vec<(String, TokenSpec, Account)>),
    Amm(AMMParams),
}

/// AMM parameters
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct AMMParams {
    pub token_1: TokenSpec,
    pub token_2: TokenSpec,
    pub max: u64,
    pub min: u64,
    pub decimals: u8,
}

/// Engine match for multi-canister trades
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatch {
    pub leader: Option<Principal>,
    pub asks: Vec<EngineMatchAsk>,
}

/// Engine match ask details
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchAsk {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpec>>>,
}

// ============================================================================
// Request/Response Types
// ============================================================================

/// Manage ask request
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
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
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidRequest {
    NewBid(NewBidRequest),
    EngineMatch(EngineMatch),
    WithdrawEscrow(EscrowRecord),
}

/// New bid request
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidRequest {
    pub ask_id: u64,
    pub feature: Vec<Option<BidFeature>>,
}

/// Manage ask response
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageAskResponse {
    NewAsk(Result<NewAskResult, GenericError>),
    EndAsk(Result<u64, GenericError>),
    RefreshOffers(Result<RefreshOffersResult, GenericError>),
    WithdrawSettlement(Result<WithdrawResult, GenericError>),
    DistributeAsk(Result<Vec<DistributionResult>, GenericError>),
    LockAsk(Result<Vec<TokenSpecResult>, GenericError>),
}

/// Manage bid response
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidResponse {
    NewBid(Result<NewBidResult, GenericError>),
    EngineMatch(Result<Vec<EngineMatchResult>, GenericError>),
    WithdrawEscrow(Result<WithdrawResult, GenericError>),
}

/// New ask result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewAskResult {
    pub ask_id: u64,
    pub escrow: EscrowRecord,
}

/// New bid result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidResult {
    pub escrow: EscrowRecord,
    pub result: u64,
}

/// Refresh offers result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct RefreshOffersResult {
    pub records: Vec<(Vec<u8>, Option<AskStatus>)>,
    pub eof: bool,
    pub count: u64,
}

/// Withdraw result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct WithdrawResult {
    pub withdraw_result: u64,
    pub token_results: Vec<TokenResult>,
}

/// Token result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct TokenResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Distribution result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct DistributionResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Engine match result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchResult {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpecResult>>>,
}

// ============================================================================
// Query Types
// ============================================================================

/// Balance request
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceRequest {
    Nfts(Option<BalancePagination>),
    Tokens,
    Escrow(Option<BalancePagination>),
    AskSettlements(Option<BalancePagination>),
    Offers(Option<BalancePagination>),
}

/// Balance pagination
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalancePagination {
    pub prev: Option<u64>,
    pub take: Option<u64>,
}

/// Balance result
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceResult {
    Nfts(Option<BalanceRecords>),
    Tokens(Option<u64>),
    Escrow(BalanceRecords),
    AskSettlements(BalanceRecords),
    Offers(BalanceRecords),
}

/// Balance records
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalanceRecords {
    pub records: Vec<EscrowRecord>,
    pub count: u64,
    pub eof: bool,
}

/// Ask info request
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum AskInfoRequest {
    Active(Option<(Option<u64>, Option<u64>)>),
    History(u64, u64),
    Status(u64),
}

/// Ask info response
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum AskInfoResponse {
    Active(AskInfoRecords),
    History(AskInfoRecords),
    Status(Option<AskStatus>),
}

/// Ask info records
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct AskInfoRecords {
    pub records: Vec<Option<AskStatus>>,
    pub eof: bool,
    pub count: u64,
}

// ============================================================================
// Utility Types
// ============================================================================

/// Generic error type
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct GenericError {
    pub code: u64,
    pub message: String,
}

/// AMM update
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct AMMUpdate {
    pub ask_id: u64,
    pub params: AMMParams,
}

/// Lock ask
#[derive(CandidType, Deserialize, SerdeDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct LockAsk {
    pub ask_id: u64,
    pub lock_duration: u64,
    pub fee: TokenSpec,
}

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
