import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AMMParams {
  'max' : bigint,
  'min' : bigint,
  'decimals' : number,
  'token_1' : TokenSpec,
  'token_2' : TokenSpec,
}
export interface AMMUpdate { 'ask_id' : bigint, 'params' : AMMParams }
export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type AskFeature = { 'BuyNow' : Array<Array<BuyNowReq>> } |
  { 'FeeSchema' : string } |
  { 'Ending' : EndingType } |
  { 'Memo' : Uint8Array | number[] } |
  { 'Broker' : Account } |
  { 'AllowList' : Array<Account> } |
  { 'UnsolicitedOffer' : Account } |
  { 'StartDate' : bigint } |
  { 'AskToken' : Array<[] | [TokenSpec]> } |
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
  { 'NotStarted' : null };
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
export type BidFeature = { 'Amm' : AMMParams } |
  { 'Escrow' : EscrowRecord } |
  { 'FeeSchema' : string } |
  { 'Broker' : Account } |
  { 'FeeAccount' : Array<[string, TokenSpec, Account]> };
export interface BuyNowReq { 'token' : TokenSpec, 'amount' : bigint }
export interface DistributionResult {
  'result' : { 'Ok' : bigint } |
    { 'Err' : GenericError },
  'token' : TokenSpec,
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
  'decimals' : number,
  'amount' : bigint,
}
export interface ICRC2TokenSpecDetail {
  'decimals' : number,
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
  'decimals' : number,
  'batch_fee' : [] | [bigint],
}
export interface ICRC7TokenSpecDetail {
  'fee' : [] | [TokenSpec],
  'token_id' : [] | [bigint],
}
export interface ICRC8Metadata { 'key' : string, 'value' : string }
export type ICRCStandards = { 'ICRC1' : [] | [ICRC1TokenSpecDetail] } |
  { 'ICRC2' : [] | [ICRC2TokenSpecDetail] } |
  { 'ICRC4' : [] | [ICRC4TokenSpecDetail] } |
  { 'ICRC7' : [] | [ICRC7TokenSpecDetail] } |
  { 'ICRC37' : [] | [ICRC37TokenSpecDetail] };
export interface LockAsk {
  'fee' : TokenSpec,
  'ask_id' : bigint,
  'lock_duration' : bigint,
}
export type ManageAskRequest = { 'LockAsk' : LockAsk } |
  { 'WithdrawEscrow' : EscrowRecord } |
  { 'UpdateAmm' : AMMUpdate } |
  { 'Unencumber' : bigint } |
  { 'EndAsk' : bigint } |
  { 'RejectOffer' : bigint } |
  { 'WithdrawSettlement' : EscrowRecord } |
  { 'NewAsk' : Array<[] | [AskFeature]> } |
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
export interface NewAskResult { 'ask_id' : bigint, 'escrow' : EscrowRecord }
export interface NewBidRequest {
  'feature' : Array<[] | [BidFeature]>,
  'ask_id' : bigint,
}
export interface NewBidResult { 'result' : bigint, 'escrow' : EscrowRecord }
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
export interface SupportedStandard { 'url' : string, 'name' : string }
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
export interface WithdrawResult {
  'token_results' : Array<TokenResult>,
  'withdraw_result' : bigint,
}
export interface _SERVICE {
  'get_metadata' : ActorMethod<[], Array<[string, string]>>,
  'health_check' : ActorMethod<[], string>,
  'icrc10_supported_standards' : ActorMethod<[], Array<SupportedStandard>>,
  'icrc8_approved_tokens' : ActorMethod<[], [] | [Array<Principal>]>,
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
  'icrc8_metadata' : ActorMethod<[], Array<ICRC8Metadata>>,
  'set_metadata' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
