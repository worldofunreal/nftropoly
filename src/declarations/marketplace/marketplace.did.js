export const idlFactory = ({ IDL }) => {
  const TokenSpec = IDL.Rec();
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const ICRC1TokenSpecDetail = IDL.Record({
    'fee' : IDL.Opt(IDL.Nat64),
    'decimals' : IDL.Nat64,
    'amount' : IDL.Nat64,
  });
  const ICRC2TokenSpecDetail = IDL.Record({
    'decimals' : IDL.Nat64,
    'transfer_from_fee' : IDL.Opt(IDL.Nat64),
    'approval_fee' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat64,
  });
  const ICRC4TokenSpecDetail = IDL.Record({
    'decimals' : IDL.Nat64,
    'batch_fee' : IDL.Opt(IDL.Nat),
  });
  const ICRC7TokenSpecDetail = IDL.Record({
    'fee' : IDL.Opt(TokenSpec),
    'token_id' : IDL.Opt(IDL.Nat),
  });
  const ICRC37TokenSpecDetail = IDL.Record({
    'transfer_from_fee' : IDL.Opt(TokenSpec),
    'token_id' : IDL.Opt(IDL.Nat64),
    'approval_fee' : IDL.Opt(TokenSpec),
  });
  const ICRCStandards = IDL.Variant({
    'ICRC1' : IDL.Opt(ICRC1TokenSpecDetail),
    'ICRC2' : IDL.Opt(ICRC2TokenSpecDetail),
    'ICRC4' : IDL.Opt(ICRC4TokenSpecDetail),
    'ICRC7' : IDL.Opt(ICRC7TokenSpecDetail),
    'ICRC37' : IDL.Opt(ICRC37TokenSpecDetail),
  });
  TokenSpec.fill(
    IDL.Record({
      'standards' : IDL.Vec(ICRCStandards),
      'canister' : IDL.Principal,
      'symbol' : IDL.Text,
    })
  );
  const EscrowType = IDL.Variant({
    'Ask' : IDL.Vec(IDL.Opt(TokenSpec)),
    'Bid' : IDL.Vec(IDL.Opt(TokenSpec)),
    'Settlement' : IDL.Vec(IDL.Opt(TokenSpec)),
  });
  const EscrowRecord = IDL.Record({
    'ask_id' : IDL.Opt(IDL.Nat64),
    'seller' : Account,
    'lock_to_date' : IDL.Opt(IDL.Nat64),
    'buyer' : IDL.Opt(Account),
    'escrow_type' : EscrowType,
  });
  const GenericError = IDL.Record({ 'code' : IDL.Nat64, 'message' : IDL.Text });
  const ICRC8Metadata = IDL.Record({ 'key' : IDL.Text, 'value' : IDL.Text });
  const SettlementRetryInfo = IDL.Record({
    'nft_transferred' : IDL.Bool,
    'retry_count' : IDL.Nat32,
    'ask_id' : IDL.Nat64,
    'buyer' : IDL.Principal,
    'max_retries' : IDL.Nat32,
    'amount' : IDL.Nat64,
    'token_transfer_failed' : IDL.Bool,
    'last_attempt' : IDL.Nat64,
  });
  const SupportedStandard = IDL.Record({ 'url' : IDL.Text, 'name' : IDL.Text });
  const LockAsk = IDL.Record({
    'fee' : TokenSpec,
    'ask_id' : IDL.Nat64,
    'lock_duration' : IDL.Nat64,
  });
  const AMMParams = IDL.Record({
    'max' : IDL.Nat,
    'min' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'token_1' : TokenSpec,
    'token_2' : TokenSpec,
  });
  const AMMUpdate = IDL.Record({ 'ask_id' : IDL.Nat64, 'params' : AMMParams });
  const AMMFeature = IDL.Record({ 'amm' : AMMParams });
  const KYCFeature = IDL.Record({ 'icrc17_kyc' : IDL.Principal });
  const BuyNowReq = IDL.Record({ 'token' : TokenSpec, 'amount' : IDL.Nat64 });
  const EndingType = IDL.Variant({
    'Date' : IDL.Nat64,
    'Perpetual' : IDL.Null,
    'Timeout' : IDL.Nat64,
  });
  const NotifyFeature = IDL.Record({ 'notify' : IDL.Vec(IDL.Principal) });
  const TimeUnit = IDL.Variant({
    'day' : IDL.Nat,
    'hour' : IDL.Nat,
    'minute' : IDL.Nat,
  });
  const DecayType = IDL.Variant({ 'flat' : IDL.Nat, 'percent' : IDL.Float64 });
  const DutchParams = IDL.Record({
    'time_unit' : TimeUnit,
    'decay_type' : DecayType,
  });
  const DutchAuctionFeature = IDL.Record({ 'dutch' : DutchParams });
  const WaitQuietParams = IDL.Record({
    'max' : IDL.Nat,
    'fade' : IDL.Float64,
    'window' : IDL.Nat64,
    'extension' : IDL.Nat64,
  });
  const MinIncrease = IDL.Variant({
    'amount' : IDL.Nat,
    'percentage' : IDL.Float64,
  });
  const AuctionFeature = IDL.Record({
    'start_price' : IDL.Nat,
    'wait_for_quiet' : IDL.Opt(WaitQuietParams),
    'reserve' : IDL.Nat,
    'min_increase' : MinIncrease,
    'auction_token' : TokenSpec,
  });
  const AskFeature = IDL.Variant({
    'AMM' : AMMFeature,
    'KYC' : KYCFeature,
    'BuyNow' : IDL.Vec(IDL.Vec(BuyNowReq)),
    'FeeSchema' : IDL.Text,
    'Ending' : EndingType,
    'Memo' : IDL.Vec(IDL.Nat8),
    'Broker' : Account,
    'AllowList' : IDL.Vec(Account),
    'UnsolicitedOffer' : Account,
    'Notify' : NotifyFeature,
    'Dutch' : DutchAuctionFeature,
    'StartDate' : IDL.Nat64,
    'AskToken' : IDL.Vec(IDL.Opt(TokenSpec)),
    'Auction' : AuctionFeature,
    'FeeAccounts' : IDL.Vec(IDL.Tuple(IDL.Text, TokenSpec, Account)),
    'BidPaysFees' : IDL.Opt(IDL.Vec(IDL.Text)),
    'CreatedAt' : IDL.Nat64,
    'AllowPartial' : IDL.Null,
  });
  const NewAskRequest = IDL.Record({
    'feature' : IDL.Vec(IDL.Opt(AskFeature)),
  });
  const ManageAskRequest = IDL.Variant({
    'LockAsk' : LockAsk,
    'WithdrawEscrow' : EscrowRecord,
    'UpdateAmm' : AMMUpdate,
    'Unencumber' : IDL.Nat,
    'EndAsk' : IDL.Nat,
    'RejectOffer' : IDL.Nat,
    'WithdrawSettlement' : EscrowRecord,
    'NewAsk' : NewAskRequest,
    'RefreshOffers' : IDL.Opt(Account),
    'DistributeAsk' : IDL.Nat,
  });
  const TokenSpecResult = IDL.Record({
    'result' : IDL.Nat64,
    'standards' : IDL.Vec(ICRCStandards),
    'ask_id' : IDL.Opt(IDL.Nat64),
    'receiving_account' : Account,
    'sending_account' : Account,
    'canister' : IDL.Principal,
    'symbol' : IDL.Text,
  });
  const TokenResult = IDL.Record({
    'result' : IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : GenericError }),
    'token' : TokenSpec,
  });
  const WithdrawResult = IDL.Record({
    'token_results' : IDL.Vec(TokenResult),
    'withdraw_result' : IDL.Nat64,
  });
  const NewAskResult = IDL.Record({
    'ask_id' : IDL.Nat64,
    'escrow' : EscrowRecord,
  });
  const EncumbranceSpec = IDL.Record({
    'tokens' : IDL.Vec(TokenSpec),
    'trustees' : IDL.Vec(IDL.Principal),
    'timeout' : IDL.Nat64,
  });
  const EncumbranceDetail = IDL.Record({
    'spec' : EncumbranceSpec,
    'expires_at' : IDL.Nat64,
  });
  const AskStatusType = IDL.Variant({
    'Open' : IDL.Null,
    'Closed' : IDL.Null,
    'Encumbered' : IDL.Vec(EncumbranceDetail),
    'PartiallySettled' : IDL.Null,
    'NotStarted' : IDL.Null,
  });
  const AuctionInfo = IDL.Record({
    'token' : TokenSpec,
    'current_bid_amount' : IDL.Opt(IDL.Nat),
    'end_date' : IDL.Opt(IDL.Nat64),
    'start_date' : IDL.Opt(IDL.Nat64),
    'wait_for_quiet_count' : IDL.Opt(IDL.Nat),
    'current_escrow' : IDL.Opt(EscrowRecord),
    'min_next_bid' : IDL.Opt(IDL.Nat),
  });
  const SettlementInfo = IDL.Record({
    'bid_tokens' : IDL.Vec(IDL.Opt(TokenSpecResult)),
    'ask_tokens' : IDL.Vec(IDL.Opt(TokenSpecResult)),
    'royalties' : IDL.Vec(IDL.Tuple(Account, IDL.Nat, IDL.Text)),
  });
  const AskStatus = IDL.Record({
    'status' : AskStatusType,
    'participants' : IDL.Vec(Account),
    'auction_info' : IDL.Opt(AuctionInfo),
    'ask_id' : IDL.Nat64,
    'seller' : Account,
    'allow_list' : IDL.Opt(IDL.Vec(Account)),
    'current_broker_id' : IDL.Opt(Account),
    'config' : IDL.Vec(AskFeature),
    'original_broker_id' : IDL.Opt(Account),
    'settled_at' : IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'settlement' : IDL.Opt(SettlementInfo),
  });
  const RefreshOffersResult = IDL.Record({
    'eof' : IDL.Bool,
    'records' : IDL.Vec(IDL.Tuple(IDL.Vec(IDL.Nat8), IDL.Opt(AskStatus))),
    'count' : IDL.Nat64,
  });
  const DistributionResult = IDL.Record({
    'result' : IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : GenericError }),
    'token' : TokenSpec,
  });
  const ManageAskResponse = IDL.Variant({
    'LockAsk' : IDL.Variant({
      'Ok' : IDL.Vec(TokenSpecResult),
      'Err' : GenericError,
    }),
    'EndAsk' : IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : GenericError }),
    'WithdrawSettlement' : IDL.Variant({
      'Ok' : WithdrawResult,
      'Err' : GenericError,
    }),
    'NewAsk' : IDL.Variant({ 'Ok' : NewAskResult, 'Err' : GenericError }),
    'RefreshOffers' : IDL.Variant({
      'Ok' : RefreshOffersResult,
      'Err' : GenericError,
    }),
    'DistributeAsk' : IDL.Variant({
      'Ok' : IDL.Vec(DistributionResult),
      'Err' : GenericError,
    }),
  });
  const AskInfoRequest = IDL.Variant({
    'History' : IDL.Tuple(IDL.Nat64, IDL.Nat64),
    'Status' : IDL.Nat64,
    'Active' : IDL.Opt(IDL.Tuple(IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64))),
  });
  const AskInfoRecords = IDL.Record({
    'eof' : IDL.Bool,
    'records' : IDL.Vec(IDL.Opt(AskStatus)),
    'count' : IDL.Nat64,
  });
  const AskInfoResponse = IDL.Variant({
    'History' : AskInfoRecords,
    'Status' : IDL.Opt(AskStatus),
    'Active' : AskInfoRecords,
  });
  const BalancePagination = IDL.Record({
    'prev' : IDL.Opt(IDL.Nat),
    'take' : IDL.Opt(IDL.Nat),
  });
  const BalanceRequest = IDL.Variant({
    'Escrow' : IDL.Opt(BalancePagination),
    'Nfts' : IDL.Opt(BalancePagination),
    'AskSettlements' : IDL.Opt(BalancePagination),
    'Offers' : IDL.Opt(BalancePagination),
    'Tokens' : IDL.Null,
  });
  const BalanceRecords = IDL.Record({
    'eof' : IDL.Bool,
    'records' : IDL.Vec(EscrowRecord),
    'count' : IDL.Nat64,
  });
  const BalanceResult = IDL.Variant({
    'Escrow' : BalanceRecords,
    'Nfts' : IDL.Opt(BalanceRecords),
    'AskSettlements' : BalanceRecords,
    'Offers' : BalanceRecords,
    'Tokens' : IDL.Opt(IDL.Nat),
  });
  const EngineMatchAsk = IDL.Record({
    'ask_canister' : IDL.Opt(IDL.Principal),
    'token' : IDL.Opt(IDL.Vec(IDL.Opt(TokenSpec))),
    'ask_id' : IDL.Nat64,
  });
  const EngineMatch = IDL.Record({
    'asks' : IDL.Vec(EngineMatchAsk),
    'leader' : IDL.Opt(IDL.Principal),
  });
  const BidFeature = IDL.Variant({
    'Amm' : AMMParams,
    'Escrow' : EscrowRecord,
    'FeeSchema' : IDL.Text,
    'Broker' : Account,
    'FeeAccount' : IDL.Vec(IDL.Tuple(IDL.Text, TokenSpec, Account)),
  });
  const NewBidRequest = IDL.Record({
    'feature' : IDL.Vec(IDL.Opt(BidFeature)),
    'ask_id' : IDL.Nat64,
  });
  const ManageBidRequest = IDL.Variant({
    'WithdrawEscrow' : EscrowRecord,
    'EngineMatch' : EngineMatch,
    'NewBid' : NewBidRequest,
  });
  const EngineMatchResult = IDL.Record({
    'ask_canister' : IDL.Opt(IDL.Principal),
    'token' : IDL.Opt(IDL.Vec(IDL.Opt(TokenSpecResult))),
    'ask_id' : IDL.Nat64,
  });
  const NewBidResult = IDL.Record({
    'result' : IDL.Nat64,
    'escrow' : EscrowRecord,
  });
  const ManageBidResponse = IDL.Variant({
    'WithdrawEscrow' : IDL.Variant({
      'Ok' : WithdrawResult,
      'Err' : GenericError,
    }),
    'EngineMatch' : IDL.Variant({
      'Ok' : IDL.Vec(EngineMatchResult),
      'Err' : GenericError,
    }),
    'NewBid' : IDL.Variant({ 'Ok' : NewBidResult, 'Err' : GenericError }),
  });
  return IDL.Service({
    'admin_get_all_escrows' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(IDL.Tuple(IDL.Nat64, EscrowRecord)),
            'Err' : GenericError,
          }),
        ],
        [],
      ),
    'admin_withdraw_escrow' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : EscrowRecord, 'Err' : GenericError })],
        [],
      ),
    'get_asks_needing_retry' : IDL.Func([], [IDL.Vec(IDL.Nat64)], ['query']),
    'get_debug_state' : IDL.Func([], [IDL.Text], ['query']),
    'get_metadata' : IDL.Func([], [IDL.Vec(ICRC8Metadata)], ['query']),
    'get_settlement_retry_info' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(SettlementRetryInfo)],
        ['query'],
      ),
    'health_check' : IDL.Func([], [IDL.Text], []),
    'icrc10_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(SupportedStandard)],
        ['query'],
      ),
    'icrc8_approved_tokens' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(IDL.Principal))],
        [],
      ),
    'icrc8_ask' : IDL.Func(
        [IDL.Vec(IDL.Opt(ManageAskRequest))],
        [
          IDL.Vec(
            IDL.Tuple(IDL.Opt(ManageAskRequest), IDL.Opt(ManageAskResponse))
          ),
        ],
        [],
      ),
    'icrc8_ask_info' : IDL.Func(
        [IDL.Vec(IDL.Opt(AskInfoRequest))],
        [IDL.Vec(IDL.Tuple(IDL.Opt(AskInfoRequest), IDL.Opt(AskInfoResponse)))],
        [],
      ),
    'icrc8_balance_of' : IDL.Func(
        [IDL.Vec(IDL.Tuple(Account, IDL.Opt(BalanceRequest)))],
        [IDL.Vec(IDL.Tuple(Account, IDL.Vec(BalanceResult)))],
        [],
      ),
    'icrc8_bid' : IDL.Func(
        [IDL.Vec(IDL.Opt(ManageBidRequest))],
        [
          IDL.Vec(
            IDL.Tuple(IDL.Opt(ManageBidRequest), IDL.Opt(ManageBidResponse))
          ),
        ],
        [],
      ),
    'icrc8_metadata' : IDL.Func([], [IDL.Vec(ICRC8Metadata)], ['query']),
    'retry_settlement' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : SettlementInfo, 'Err' : GenericError })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
