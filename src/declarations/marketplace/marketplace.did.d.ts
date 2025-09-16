import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

/**
 * ICRC-62: AMMs
 */
export interface AMMFeature { 'amm' : AMMParams }
export interface AMMParams {
  'max' : bigint,
  'min' : bigint,
  'decimals' : number,
  'token_1' : TokenSpec,
  'token_2' : TokenSpec,
}
export interface AMMUpdate { 'ask_id' : bigint, 'params' : AMMParams }
/**
 * ICRC-8 Compliant NFT Marketplace Candid Interface
 * Core ICRC-8 Types
 */
export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
/**
 * Ask Types
 */
export type AskFeature = {
    /**
     * ICRC-62: AMMs
     */
    'AMM' : AMMFeature
  } |
  {
    /**
     * ICRC-64: KYC
     */
    'KYC' : KYCFeature
  } |
  { 'BuyNow' : Array<Array<BuyNowReq>> } |
  { 'FeeSchema' : string } |
  { 'Ending' : EndingType } |
  { 'Memo' : Uint8Array | number[] } |
  { 'Broker' : Account } |
  { 'AllowList' : Array<Account> } |
  { 'UnsolicitedOffer' : Account } |
  {
    /**
     * ICRC-71: Notifications
     */
    'Notify' : NotifyFeature
  } |
  {
    /**
     * ICRC-63: Dutch Auctions
     */
    'Dutch' : DutchAuctionFeature
  } |
  { 'StartDate' : bigint } |
  { 'AskToken' : Array<[] | [TokenSpec]> } |
  {
    /**
     * ICRC-61: Standard Auctions
     */
    'Auction' : AuctionFeature
  } |
  { 'FeeAccounts' : Array<[string, TokenSpec, Account]> } |
  { 'BidPaysFees' : [] | [Array<string>] } |
  { 'CreatedAt' : bigint } |
  { 'AllowPartial' : null };
export interface AskInfoRecords {
  'eof' : boolean,
  'records' : Array<[] | [AskStatus]>,
  'count' : bigint,
}
export type AskInfoRequest = { 'History' : [bigint, bigint] } |
  { 'Status' : bigint } |
  { 'Active' : [] | [[[] | [bigint], [] | [bigint]]] };
export type AskInfoResponse = { 'History' : AskInfoRecords } |
  { 'Status' : [] | [AskStatus] } |
  { 'Active' : AskInfoRecords };
export interface AskStatus {
  'status' : AskStatusType,
  'participants' : Array<Account>,
  'auction_info' : [] | [AuctionInfo],
  'ask_id' : bigint,
  'seller' : Account,
  'allow_list' : [] | [Array<Account>],
  'current_broker_id' : [] | [Account],
  'config' : Array<AskFeature>,
  'original_broker_id' : [] | [Account],
  'settled_at' : [] | [[Principal, bigint]],
  'settlement' : [] | [SettlementInfo],
}
export type AskStatusType = { 'Open' : null } |
  { 'Closed' : null } |
  { 'Encumbered' : Array<EncumbranceDetail> } |
  { 'PartiallySettled' : null } |
  { 'NotStarted' : null };
/**
 * ICRC-61: Standard Auctions
 */
export interface AuctionFeature {
  'start_price' : bigint,
  'wait_for_quiet' : [] | [WaitQuietParams],
  'reserve' : bigint,
  'min_increase' : MinIncrease,
  'auction_token' : TokenSpec,
}
export interface AuctionInfo {
  'token' : TokenSpec,
  'current_bid_amount' : [] | [bigint],
  'end_date' : [] | [bigint],
  'start_date' : [] | [bigint],
  'wait_for_quiet_count' : [] | [bigint],
  'current_escrow' : [] | [EscrowRecord],
  'min_next_bid' : [] | [bigint],
}
export interface BalancePagination {
  'prev' : [] | [bigint],
  'take' : [] | [bigint],
}
export interface BalanceRecords {
  'eof' : boolean,
  'records' : Array<EscrowRecord>,
  'count' : bigint,
}
/**
 * Query Types
 */
export type BalanceRequest = { 'Escrow' : [] | [BalancePagination] } |
  { 'Nfts' : [] | [BalancePagination] } |
  { 'AskSettlements' : [] | [BalancePagination] } |
  { 'Offers' : [] | [BalancePagination] } |
  { 'Tokens' : null };
export type BalanceResult = { 'Escrow' : BalanceRecords } |
  { 'Nfts' : [] | [BalanceRecords] } |
  { 'AskSettlements' : BalanceRecords } |
  { 'Offers' : BalanceRecords } |
  { 'Tokens' : [] | [bigint] };
/**
 * Bid Types
 */
export type BidFeature = { 'Amm' : AMMParams } |
  { 'Escrow' : EscrowRecord } |
  { 'FeeSchema' : string } |
  { 'Broker' : Account } |
  { 'FeeAccount' : Array<[string, TokenSpec, Account]> };
export interface BuyNowReq { 'token' : TokenSpec, 'amount' : bigint }
export type DecayType = { 'flat' : bigint } |
  { 'percent' : number };
export interface DistributionResult {
  'result' : { 'Ok' : bigint } |
    { 'Err' : GenericError },
  'token' : TokenSpec,
}
/**
 * ICRC-63: Dutch Auctions
 */
export interface DutchAuctionFeature { 'dutch' : DutchParams }
export interface DutchParams {
  'time_unit' : TimeUnit,
  'decay_type' : DecayType,
}
export interface EncumbranceDetail {
  'spec' : EncumbranceSpec,
  'expires_at' : bigint,
}
export interface EncumbranceSpec {
  'tokens' : Array<TokenSpec>,
  'trustees' : Array<Principal>,
  'timeout' : bigint,
}
export type EndingType = { 'Date' : bigint } |
  { 'Perpetual' : null } |
  { 'Timeout' : bigint };
export interface EngineMatch {
  'asks' : Array<EngineMatchAsk>,
  'leader' : [] | [Principal],
}
export interface EngineMatchAsk {
  'ask_canister' : [] | [Principal],
  'token' : [] | [Array<[] | [TokenSpec]>],
  'ask_id' : bigint,
}
export interface EngineMatchResult {
  'ask_canister' : [] | [Principal],
  'token' : [] | [Array<[] | [TokenSpecResult]>],
  'ask_id' : bigint,
}
/**
 * Escrow Types
 */
export interface EscrowRecord {
  'ask_id' : [] | [bigint],
  'seller' : Account,
  'lock_to_date' : [] | [bigint],
  'buyer' : [] | [Account],
  'escrow_type' : EscrowType,
}
export type EscrowType = { 'Ask' : Array<[] | [TokenSpec]> } |
  { 'Bid' : Array<[] | [TokenSpec]> } |
  { 'Settlement' : Array<[] | [TokenSpec]> };
export interface GenericError { 'code' : bigint, 'message' : string }
export interface ICRC1TokenSpecDetail {
  'fee' : [] | [bigint],
  'decimals' : bigint,
  'amount' : bigint,
}
export interface ICRC2TokenSpecDetail {
  'decimals' : bigint,
  'transfer_from_fee' : [] | [bigint],
  'approval_fee' : [] | [bigint],
  'amount' : bigint,
}
export interface ICRC37TokenSpecDetail {
  'transfer_from_fee' : [] | [TokenSpec],
  'token_id' : [] | [bigint],
  'approval_fee' : [] | [TokenSpec],
}
export interface ICRC4TokenSpecDetail {
  'decimals' : bigint,
  'batch_fee' : [] | [bigint],
}
export interface ICRC7TokenSpecDetail {
  'fee' : [] | [TokenSpec],
  'token_id' : [] | [bigint],
}
/**
 * ICRC-8 Metadata Types
 */
export interface ICRC8Metadata { 'key' : string, 'value' : string }
export type ICRCStandards = { 'ICRC1' : [] | [ICRC1TokenSpecDetail] } |
  { 'ICRC2' : [] | [ICRC2TokenSpecDetail] } |
  { 'ICRC4' : [] | [ICRC4TokenSpecDetail] } |
  { 'ICRC7' : [] | [ICRC7TokenSpecDetail] } |
  { 'ICRC37' : [] | [ICRC37TokenSpecDetail] };
/**
 * ICRC-64: KYC
 */
export interface KYCFeature { 'icrc17_kyc' : Principal }
export interface LockAsk {
  'fee' : TokenSpec,
  'ask_id' : bigint,
  'lock_duration' : bigint,
}
/**
 * Request/Response Types
 */
export type ManageAskRequest = { 'LockAsk' : LockAsk } |
  { 'WithdrawEscrow' : EscrowRecord } |
  { 'UpdateAmm' : AMMUpdate } |
  { 'Unencumber' : bigint } |
  { 'EndAsk' : bigint } |
  { 'RejectOffer' : bigint } |
  { 'WithdrawSettlement' : EscrowRecord } |
  { 'NewAsk' : NewAskRequest } |
  { 'RefreshOffers' : [] | [Account] } |
  { 'DistributeAsk' : bigint };
export type ManageAskResponse = {
    'LockAsk' : { 'Ok' : Array<TokenSpecResult> } |
      { 'Err' : GenericError }
  } |
  { 'EndAsk' : { 'Ok' : bigint } | { 'Err' : GenericError } } |
  {
    'WithdrawSettlement' : { 'Ok' : WithdrawResult } |
      { 'Err' : GenericError }
  } |
  { 'NewAsk' : { 'Ok' : NewAskResult } | { 'Err' : GenericError } } |
  {
    'RefreshOffers' : { 'Ok' : RefreshOffersResult } |
      { 'Err' : GenericError }
  } |
  {
    'DistributeAsk' : { 'Ok' : Array<DistributionResult> } |
      { 'Err' : GenericError }
  };
export type ManageBidRequest = { 'WithdrawEscrow' : EscrowRecord } |
  { 'EngineMatch' : EngineMatch } |
  { 'NewBid' : NewBidRequest };
export type ManageBidResponse = {
    'WithdrawEscrow' : { 'Ok' : WithdrawResult } |
      { 'Err' : GenericError }
  } |
  {
    'EngineMatch' : { 'Ok' : Array<EngineMatchResult> } |
      { 'Err' : GenericError }
  } |
  { 'NewBid' : { 'Ok' : NewBidResult } | { 'Err' : GenericError } };
export type MinIncrease = { 'amount' : bigint } |
  { 'percentage' : number };
export interface NewAskRequest { 'feature' : Array<[] | [AskFeature]> }
export interface NewAskResult { 'ask_id' : bigint, 'escrow' : EscrowRecord }
export interface NewBidRequest {
  'feature' : Array<[] | [BidFeature]>,
  'ask_id' : bigint,
}
export interface NewBidResult { 'result' : bigint, 'escrow' : EscrowRecord }
/**
 * ICRC-71: Notifications
 */
export interface NotifyFeature { 'notify' : Array<Principal> }
export interface RefreshOffersResult {
  'eof' : boolean,
  'records' : Array<[Uint8Array | number[], [] | [AskStatus]]>,
  'count' : bigint,
}
export interface SettlementInfo {
  'bid_tokens' : Array<[] | [TokenSpecResult]>,
  'ask_tokens' : Array<[] | [TokenSpecResult]>,
  'royalties' : Array<[Account, bigint, string]>,
}
export interface SettlementRetryInfo {
  'nft_transferred' : boolean,
  'retry_count' : number,
  'ask_id' : bigint,
  'buyer' : Principal,
  'max_retries' : number,
  'amount' : bigint,
  'token_transfer_failed' : boolean,
  'last_attempt' : bigint,
}
/**
 * ICRC-10 Metadata Types
 */
export interface SupportedStandard { 'url' : string, 'name' : string }
export type TimeUnit = { 'day' : bigint } |
  { 'hour' : bigint } |
  { 'minute' : bigint };
export interface TokenResult {
  'result' : { 'Ok' : bigint } |
    { 'Err' : GenericError },
  'token' : TokenSpec,
}
export interface TokenSpec {
  'standards' : Array<ICRCStandards>,
  'canister' : Principal,
  'symbol' : string,
}
export interface TokenSpecResult {
  'result' : bigint,
  'standards' : Array<ICRCStandards>,
  'ask_id' : [] | [bigint],
  'receiving_account' : Account,
  'sending_account' : Account,
  'canister' : Principal,
  'symbol' : string,
}
export interface WaitQuietParams {
  'max' : bigint,
  'fade' : number,
  'window' : bigint,
  'extension' : bigint,
}
export interface WithdrawResult {
  'token_results' : Array<TokenResult>,
  'withdraw_result' : bigint,
}
/**
 * Main Service Interface
 */
export interface _SERVICE {
  'admin_get_all_escrows' : ActorMethod<
    [],
    { 'Ok' : Array<[bigint, EscrowRecord]> } |
      { 'Err' : GenericError }
  >,
  /**
   * Admin Methods (Admin Only)
   */
  'admin_withdraw_escrow' : ActorMethod<
    [bigint],
    { 'Ok' : EscrowRecord } |
      { 'Err' : GenericError }
  >,
  'get_asks_needing_retry' : ActorMethod<[], BigUint64Array | bigint[]>,
  /**
   * Debug Methods
   */
  'get_debug_state' : ActorMethod<[], string>,
  /**
   * General Metadata
   */
  'get_metadata' : ActorMethod<[], Array<ICRC8Metadata>>,
  'get_settlement_retry_info' : ActorMethod<
    [bigint],
    [] | [SettlementRetryInfo]
  >,
  /**
   * Health Check
   */
  'health_check' : ActorMethod<[], string>,
  /**
   * ICRC-10 Metadata (General Standards Support)
   */
  'icrc10_supported_standards' : ActorMethod<[], Array<SupportedStandard>>,
  'icrc8_approved_tokens' : ActorMethod<[], [] | [Array<Principal>]>,
  /**
   * ICRC-8 Core Methods
   */
  'icrc8_ask' : ActorMethod<
    [Array<[] | [ManageAskRequest]>],
    Array<[[] | [ManageAskRequest], [] | [ManageAskResponse]]>
  >,
  'icrc8_ask_info' : ActorMethod<
    [Array<[] | [AskInfoRequest]>],
    Array<[[] | [AskInfoRequest], [] | [AskInfoResponse]]>
  >,
  'icrc8_balance_of' : ActorMethod<
    [Array<[Account, [] | [BalanceRequest]]>],
    Array<[Account, Array<BalanceResult>]>
  >,
  'icrc8_bid' : ActorMethod<
    [Array<[] | [ManageBidRequest]>],
    Array<[[] | [ManageBidRequest], [] | [ManageBidResponse]]>
  >,
  /**
   * ICRC-8 Metadata (Marketplace-Specific Configuration)
   */
  'icrc8_metadata' : ActorMethod<[], Array<ICRC8Metadata>>,
  /**
   * Retry settlement methods
   */
  'retry_settlement' : ActorMethod<
    [bigint],
    { 'Ok' : SettlementInfo } |
      { 'Err' : GenericError }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
