//! Main marketplace implementation
//!
//! This module implements the core ICRC-8 marketplace functionality.

use candid::Principal;
use ic_cdk::api::msg_caller;
use std::collections::HashMap;

use crate::amm::AMMManager;
use crate::auctions::AuctionManager;
use crate::errors::{MarketplaceError, MarketplaceResult};
use crate::escrow::EscrowManager;
use crate::fees::{FeeManager, FeeParty};
use crate::icrc_client::{pull_icrc2_tokens, pull_icrc37_nfts, push_icrc2_tokens, push_icrc7_nfts};
use crate::kyc::KYCManager;
use crate::notifications::NotificationManager;
use crate::storage::MarketplaceStorage;
use crate::types;
use crate::types::*;

/// Main marketplace implementation
pub struct Marketplace {
    storage: MarketplaceStorage,
    escrow_manager: EscrowManager,
    fee_manager: FeeManager,
    auction_manager: AuctionManager,
    amm_manager: AMMManager,
    kyc_manager: KYCManager,
    notification_manager: NotificationManager,
    metadata: HashMap<String, String>,
}

impl Marketplace {
    pub fn new() -> Self {
        let mut metadata = HashMap::new();
        metadata.insert(
            "icrc8:default_ask_timeout".to_string(),
            "86400000000000".to_string(),
        );
        metadata.insert(
            "icrc8:default_fee_schema".to_string(),
            "standard".to_string(),
        );
        metadata.insert("icrc8:supports_icrc_2".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_4".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_37".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_1".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_7".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_auctions".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_dutch_auctions".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_amm".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_kyc".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_notifications".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_escrow".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_settlements".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_fee_schemas".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_buy_now".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_bids".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_withdrawals".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_distributions".to_string(), "true".to_string());

        Self {
            storage: MarketplaceStorage::new(
                &ic_stable_structures::memory_manager::MemoryManager::init(
                    ic_stable_structures::DefaultMemoryImpl::default(),
                ),
            ),
            escrow_manager: EscrowManager::new(),
            fee_manager: FeeManager::new(),
            auction_manager: AuctionManager::new(),
            amm_manager: AMMManager::new(),
            kyc_manager: KYCManager::new(),
            notification_manager: NotificationManager::new(),
            metadata,
        }
    }

    /// Handle ask requests (ICRC-8)
    pub async fn handle_ask_requests(
        &mut self,
        requests: Vec<Option<ManageAskRequest>>,
    ) -> Vec<(Option<ManageAskRequest>, Option<ManageAskResponse>)> {
        let mut results = Vec::new();

        for request in requests {
            match request {
                None => {
                    results.push((None, None));
                }
                Some(req) => {
                    let response = match &req {
                        ManageAskRequest::NewAsk(new_ask_request) => {
                            ic_cdk::println!("Processing NewAsk request with {} features", new_ask_request.feature.len());
                            match self.create_new_ask(msg_caller(), new_ask_request.feature.clone()).await {
                                Ok(result) => {
                                    ic_cdk::println!("NewAsk successful: ask_id = {}", result.ask_id);
                                    ManageAskResponse::NewAsk(Ok(result))
                                }
                                Err(error) => {
                                    ic_cdk::println!("NewAsk failed: {}", error);
                                    ManageAskResponse::NewAsk(Err(types::GenericError {
                                        code: error.to_string().len() as u64,
                                        message: error.to_string(),
                                    }))
                                }
                            }
                        }
                        ManageAskRequest::EndAsk(ask_id) => {
                            match self.end_ask(msg_caller(), *ask_id) {
                                Ok(tx_id) => ManageAskResponse::EndAsk(Ok(tx_id)),
                                Err(error) => ManageAskResponse::EndAsk(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                        ManageAskRequest::RefreshOffers(_account) => {
                            ManageAskResponse::RefreshOffers(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::WithdrawSettlement(escrow_record) => {
                            match self.withdraw_settlement(msg_caller(), escrow_record.clone()) {
                                Ok(result) => ManageAskResponse::WithdrawSettlement(Ok(result)),
                                Err(error) => ManageAskResponse::WithdrawSettlement(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                        ManageAskRequest::WithdrawEscrow(escrow_record) => {
                            match self.withdraw_escrow(msg_caller(), escrow_record.clone()) {
                                Ok(result) => ManageAskResponse::WithdrawSettlement(Ok(result)),
                                Err(error) => ManageAskResponse::WithdrawSettlement(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                        ManageAskRequest::RejectOffer(_ask_id) => {
                            ManageAskResponse::EndAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::DistributeAsk(ask_id) => {
                            match self.distribute_ask(msg_caller(), *ask_id) {
                                Ok(result) => ManageAskResponse::DistributeAsk(Ok(result)),
                                Err(error) => ManageAskResponse::DistributeAsk(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                        ManageAskRequest::UpdateAmm(_amm_update) => {
                            ManageAskResponse::NewAsk(Err(types::GenericError {
                                code: 501,
                                message: "UpdateAmm not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::LockAsk(_lock_ask) => {
                            ManageAskResponse::LockAsk(Err(types::GenericError {
                                code: 501,
                                message: "LockAsk not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::Unencumber(_ask_id) => {
                            ManageAskResponse::EndAsk(Err(types::GenericError {
                                code: 501,
                                message: "Unencumber not implemented".to_string(),
                            }))
                        }
                    };
                    results.push((Some(req), Some(response)));
                }
            }
        }

        results
    }

    /// Handle bid requests (ICRC-8)
    pub async fn handle_bid_requests(
        &mut self,
        requests: Vec<Option<ManageBidRequest>>,
    ) -> Vec<(Option<ManageBidRequest>, Option<ManageBidResponse>)> {
        ic_cdk::println!("🎯 Processing {} bid requests", requests.len());
        ic_cdk::println!("🎯 Raw requests: {:?}", requests);
        let mut results = Vec::new();

        for (i, request) in requests.into_iter().enumerate() {
            ic_cdk::println!("🔍 Processing request {}: {:?}", i, request.is_some());
            match request {
                None => {
                    results.push((None, None));
                }
                Some(req) => {
                    let response = match &req {
                        ManageBidRequest::NewBid(new_bid_request) => {
                            ic_cdk::println!("🆕 Processing NewBid request for ask_id: {}", new_bid_request.ask_id);
                            ic_cdk::println!("🆕 Bid features: {:?}", new_bid_request.feature);
                            ic_cdk::println!("🆕 Caller: {}", msg_caller());
                            
                            match self.create_new_bid(msg_caller(), new_bid_request.clone()).await {
                                Ok(result) => {
                                    ic_cdk::println!("✅ NewBid successful: {:?}", result);
                                    ManageBidResponse::NewBid(Ok(result))
                                },
                                Err(error) => {
                                    ic_cdk::println!("❌ NewBid failed: {:?}", error);
                                    ManageBidResponse::NewBid(Err(types::GenericError {
                                        code: error.to_string().len() as u64,
                                        message: error.to_string(),
                                    }))
                                },
                            }
                        }
                        ManageBidRequest::EngineMatch(_engine_match) => {
                            ManageBidResponse::EngineMatch(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageBidRequest::WithdrawEscrow(escrow_record) => {
                            match self.withdraw_escrow(msg_caller(), escrow_record.clone()) {
                                Ok(result) => ManageBidResponse::WithdrawEscrow(Ok(result)),
                                Err(error) => ManageBidResponse::WithdrawEscrow(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                    };
                    results.push((Some(req), Some(response)));
                }
            }
        }

        results
    }

    /// Create a new ask
    async fn create_new_ask(
        &mut self,
        caller: Principal,
        features: Vec<Option<AskFeature>>,
    ) -> MarketplaceResult<NewAskResult> {
        // Validate features
        let mut has_ask_token = false;
        let mut has_buy_now = false;
        let mut auction_feature = None;
        let mut dutch_feature = None;
        let mut amm_feature = None;
        let mut kyc_feature = None;
        let mut notify_feature = None;
        let mut end_date = None;
        let start_price = None;
        let end_price = None;

        for feature in &features {
            if let Some(feature) = feature {
                match feature {
                    AskFeature::AskToken(_) => has_ask_token = true,
                    AskFeature::BuyNow(_) => has_buy_now = true,
                    AskFeature::Auction(auction) => {
                        auction_feature = Some(auction.clone());
                    }
                    AskFeature::Dutch(dutch) => {
                        dutch_feature = Some(dutch.clone());
                    }
                    AskFeature::AMM(amm) => {
                        amm_feature = Some(amm.clone());
                    }
                    AskFeature::KYC(kyc) => {
                        kyc_feature = Some(kyc.clone());
                    }
                    AskFeature::Notify(notify) => {
                        notify_feature = Some(notify.clone());
                    }
                    AskFeature::Ending(EndingType::Date(date)) => {
                        end_date = Some(*date);
                    }
                    _ => {}
                }
            }
        }

        if !has_ask_token {
            return Err(MarketplaceError::InvalidInput(
                "Missing required ask_token feature".to_string(),
            ));
        }

        // For auctions, AMMs, KYC, and notifications, we don't require buy_now
        if auction_feature.is_none()
            && dutch_feature.is_none()
            && amm_feature.is_none()
            && kyc_feature.is_none()
            && notify_feature.is_none()
            && !has_buy_now
        {
            return Err(MarketplaceError::InvalidInput(
                "Missing required buy_now feature for non-auction/non-AMM/non-KYC/non-notify asks"
                    .to_string(),
            ));
        }

        // Create ask
        let ask_id = self.storage.get_next_ask_id();
        let account = Account {
            owner: caller,
            subaccount: None,
        };

        // Handle auction creation if auction feature is present
        let auction_info = if let Some(auction) = auction_feature {
            if let Some(end_date) = end_date {
                match self
                    .auction_manager
                    .create_standard_auction(ask_id, auction, end_date)
                {
                    Ok(info) => Some(info),
                    Err(e) => return Err(e),
                }
            } else {
                return Err(MarketplaceError::InvalidInput(
                    "Auction requires an end date".to_string(),
                ));
            }
        } else if let Some(dutch) = dutch_feature {
            // For Dutch auctions, we need start_price, end_price, and duration
            // These would typically come from other features or be set as defaults
            let start_price = start_price.unwrap_or(1000); // Default start price
            let end_price = end_price.unwrap_or(100); // Default end price
            let duration = 24 * 60 * 60 * 1_000_000_000; // Default 24 hours in nanoseconds

            match self.auction_manager.create_dutch_auction(
                ask_id,
                dutch,
                start_price,
                end_price,
                duration,
            ) {
                Ok(info) => Some(info),
                Err(e) => return Err(e),
            }
        } else {
            None
        };

        // Handle AMM creation if AMM feature is present
        if let Some(amm) = amm_feature {
            // Create AMM pool for the ask
            match self.amm_manager.create_pool(
                amm.amm.token_1.clone(),
                amm.amm.token_2.clone(),
                amm.amm.max, // Use max as initial liquidity
                amm.amm.decimals,
            ) {
                Ok(pool_id) => {
                    // Store pool ID with the ask for future reference
                    // This could be stored in the ask status or a separate mapping
                    println!("Created AMM pool {} for ask {}", pool_id, ask_id);
                }
                Err(e) => return Err(e),
            }
        }

        // Handle KYC validation if KYC feature is present
        if let Some(kyc) = kyc_feature {
            // Validate that the KYC provider exists and is active
            let providers = self.kyc_manager.get_providers();
            let provider_exists = providers
                .iter()
                .any(|p| p.principal == kyc.icrc17_kyc && p.is_active);

            if !provider_exists {
                return Err(MarketplaceError::InvalidInput(format!(
                    "KYC provider {} is not registered or not active",
                    kyc.icrc17_kyc
                )));
            }

            println!(
                "KYC requirement enabled for ask {} with provider {}",
                ask_id, kyc.icrc17_kyc
            );
        }

        // Handle notifications if Notify feature is present
        if let Some(notify) = notify_feature {
            let notify_principals = notify.notify.clone();
            // Send notification to specified principals about the new ask
            if let Err(e) =
                self.notification_manager
                    .notify_ask_created(ask_id, caller, notify_principals)
            {
                println!("Failed to send notification for ask {}: {:?}", ask_id, e);
                // Don't fail the ask creation if notifications fail
            } else {
                println!(
                    "Notifications sent for ask {} to {} principals",
                    ask_id,
                    notify.notify.len()
                );
            }
        }

        let ask_status = AskStatus {
            ask_id,
            original_broker_id: None,
            current_broker_id: None,
            config: features.clone().into_iter().filter_map(|f| f).collect(),
            auction_info,
            settlement: None,
            allow_list: None,
            participants: vec![account.clone()],
            settled_at: None,
            status: AskStatusType::Open,
            seller: account.clone(),
        };

        // Extract and transfer NFTs from user to marketplace escrow
        let mut escrow_tokens = Vec::new();
        for feature in &features {
            if let Some(feature) = feature {
                match feature {
                    AskFeature::AskToken(tokens) => {
                        // Transfer NFTs to marketplace escrow
                        for token in tokens {
                            if let Some(token_spec) = token {
                                // Extract token IDs from ICRC-37 standard details
                                let mut token_ids = Vec::new();
                                
                                for standard in &token_spec.standards {
                                    if let ICRCStandards::ICRC37(details) = standard {
                                        if let Some(detail) = details {
                                            if let Some(token_id) = detail.token_id {
                                                token_ids.push(token_id);
                                            }
                                        }
                                    }
                                }
                                
                                if token_ids.is_empty() {
                                    return Err(MarketplaceError::InvalidInput(
                                        "No token IDs specified in ICRC-37 token spec".to_string()
                                    ));
                                }
                                
                                ic_cdk::println!("🔄 Transferring NFTs with IDs: {:?} from user {}", token_ids, caller);
                                
                                match pull_icrc37_nfts(
                                    token_spec.canister,
                                    caller,
                                    token_ids,
                                ).await {
                                    Ok(block_index) => {
                                        ic_cdk::println!("✅ Successfully transferred NFTs to escrow. Block: {}", block_index);
                                        escrow_tokens.push(Some(token_spec.clone()));
                                    }
                                    Err(e) => {
                                        ic_cdk::println!("❌ Failed to transfer NFTs: {}", e);
                                        return Err(e);
                                    }
                                }
                            }
                        }
                    }
                    AskFeature::BuyNow(buy_now_reqs) => {
                        for buy_now_req in buy_now_reqs {
                            for req in buy_now_req {
                                escrow_tokens.push(Some(req.token.clone()));
                            }
                        }
                    }
                    _ => {}
                }
            }
        }

        self.storage.insert_ask(ask_id, ask_status.clone());
        self.storage.add_user_ask(caller, ask_id);

        // Create escrow record using EscrowManager
        let escrow_id = self.escrow_manager.create_escrow(
            EscrowType::Ask(escrow_tokens),
            None, // No buyer yet
            account.clone(),
            Some(ask_id),
            None, // No lock date
        );

        // Get the escrow record from EscrowManager
        let escrow_record = self.escrow_manager.get_escrow(escrow_id)
            .ok_or_else(|| {
                ic_cdk::println!("Failed to retrieve escrow {} for ask {}", escrow_id, ask_id);
                MarketplaceError::Internal(format!("Failed to retrieve created escrow {}", escrow_id))
            })?
            .clone();

        ic_cdk::println!("Successfully created ask {} with escrow {}", ask_id, escrow_id);

        Ok(NewAskResult {
            ask_id,
            escrow: escrow_record,
        })
    }

    /// End an ask
    fn end_ask(&mut self, caller: Principal, ask_id: u64) -> MarketplaceResult<u64> {
        if let Some(mut ask_status) = self.storage.get_ask(ask_id) {
            if ask_status.seller.owner != caller {
                return Err(MarketplaceError::Unauthorized(
                    "Only the seller can end the ask".to_string(),
                ));
            }

            if !matches!(ask_status.status, AskStatusType::Open) {
                return Err(MarketplaceError::InvalidState(
                    "Ask is not in open state".to_string(),
                ));
            }

            // Update status
            ask_status.status = AskStatusType::Closed;
            self.storage.insert_ask(ask_id, ask_status.clone());
            self.storage.add_ask_to_history(ask_id, ask_status);
            self.storage.remove_user_ask(caller, ask_id);

            Ok(ask_id) // Use ask_id as transaction ID for simplicity
        } else {
            Err(MarketplaceError::NotFound("Ask not found".to_string()))
        }
    }

    /// Create a new bid
    async fn create_new_bid(
        &mut self,
        caller: Principal,
        new_bid_request: NewBidRequest,
    ) -> MarketplaceResult<NewBidResult> {
        ic_cdk::println!("🎯 create_new_bid called for ask_id: {}, caller: {}", new_bid_request.ask_id, caller);
        ic_cdk::println!("🎯 Bid request features: {:?}", new_bid_request.feature);
        let ask_id = new_bid_request.ask_id;

        ic_cdk::println!("🔍 Looking for ask_id: {}", ask_id);
        if let Some(mut ask_status) = self.storage.get_ask(ask_id) {
            ic_cdk::println!("✅ Found ask_id: {}", ask_id);
            if !matches!(ask_status.status, AskStatusType::Open) {
                return Err(MarketplaceError::InvalidState(
                    "Ask is not open for bids".to_string(),
                ));
            }

            // Check if this is an auction
            if let Some(mut auction_info) = ask_status.auction_info.clone() {
                // Handle auction bid
                // Extract bid amount from bid features
                let bid_amount = self.extract_bid_amount(&new_bid_request.feature)?;

                // Process the auction bid
                match self
                    .auction_manager
                    .place_auction_bid(&mut auction_info, caller, bid_amount)
                {
                    Ok(()) => {
                        // Update the auction info in the ask
                        ask_status.auction_info = Some(auction_info);
                        self.storage.insert_ask(ask_id, ask_status.clone());

                        // Create escrow record for the bid using EscrowManager
                        let buyer_account = Account {
                            owner: caller,
                            subaccount: None,
                        };

                        let escrow_id = self.escrow_manager.create_escrow(
                            EscrowType::Bid(vec![]), // Simplified for now
                            Some(buyer_account.clone()),
                            ask_status.seller.clone(),
                            Some(ask_id),
                            None, // No lock date
                        );

                        let escrow_record = self.escrow_manager.get_escrow(escrow_id)
                            .ok_or(MarketplaceError::Internal("Failed to retrieve created escrow".to_string()))?
                            .clone();

                        // Update ask participants
                        if !ask_status.participants.iter().any(|p| p.owner == caller) {
                            ask_status.participants.push(buyer_account);
                            self.storage.insert_ask(ask_id, ask_status);
                        }

                        Ok(NewBidResult {
                            escrow: escrow_record,
                            result: escrow_id,
                        })
                    }
                    Err(e) => Err(e),
                }
            } else {
                // Handle regular bid (non-auction)
                let buyer_account = Account {
                    owner: caller,
                    subaccount: None,
                };

                // Check if this is a buy_now bid (immediate settlement)
                let buy_now_amount = self.extract_buy_now_amount(&ask_status.config);
                ic_cdk::println!("🔍 Checking buy_now_amount: {:?}", buy_now_amount);
                
                // Check if the bid matches the buy_now requirements
                ic_cdk::println!("🔍 Extracting bid amount from features...");
                let bid_amount = match self.extract_bid_amount(&new_bid_request.feature) {
                    Ok(amount) => {
                        ic_cdk::println!("✅ Successfully extracted bid amount: {}", amount);
                        amount
                    },
                    Err(e) => {
                        ic_cdk::println!("❌ Failed to extract bid amount: {:?}", e);
                        return Err(e);
                    }
                };
                ic_cdk::println!("🔍 Bid amount: {}, Buy now amount: {:?}", bid_amount, buy_now_amount);
                
                if let Some(required_amount) = buy_now_amount {
                    if bid_amount >= required_amount {
                        ic_cdk::println!("✅ Bid matches buy_now requirements! Proceeding with settlement.");
                        let amount = required_amount; // Use the required amount for settlement
                        
                        // Extract payment token from ask features
                        ic_cdk::println!("🔍 Extracting payment token from ask config...");
                        let payment_token = match self.extract_payment_token(&ask_status.config) {
                            Ok(token) => {
                                ic_cdk::println!("✅ Successfully extracted payment token: {:?}", token);
                                token
                            },
                            Err(e) => {
                                ic_cdk::println!("❌ Failed to extract payment token: {:?}", e);
                                return Err(e);
                            }
                        };
                    
                    // Transfer payment tokens from buyer to marketplace escrow
                    match pull_icrc2_tokens(
                        payment_token.canister,
                        caller,
                        amount.into(),
                    ).await {
                        Ok(block_index) => {
                            ic_cdk::println!("✅ Successfully transferred payment tokens to escrow. Block: {}", block_index);
                        }
                        Err(e) => {
                            ic_cdk::println!("❌ Failed to transfer payment tokens: {}", e);
                            return Err(e);
                        }
                    }
                    
                    // Process immediate settlement
                    ic_cdk::println!("🔄 Processing settlement for ask_id: {}, buyer: {}, amount: {}", ask_id, caller, amount);
                    ic_cdk::println!("🔄 About to call process_settlement...");
                    match self.process_settlement(ask_id, caller, amount).await {
                        Ok(_settlement_info) => {
                          ic_cdk::println!("✅ Settlement successful, creating escrow record...");
                            // Create settlement escrow record
                            let escrow_id = self.escrow_manager.create_escrow(
                                EscrowType::Settlement(vec![]), // Would contain actual token specs
                                Some(buyer_account.clone()),
                                ask_status.seller.clone(),
                                Some(ask_id),
                                None, // No lock date
                            );

                            ic_cdk::println!("🔍 Created escrow_id: {}", escrow_id);
                            let escrow_record = match self.escrow_manager.get_escrow(escrow_id) {
                                Some(record) => {
                                    ic_cdk::println!("✅ Successfully retrieved escrow record");
                                    record.clone()
                                },
                                None => {
                                    ic_cdk::println!("❌ Failed to retrieve created escrow");
                                    return Err(MarketplaceError::Internal("Failed to retrieve created escrow".to_string()));
                                }
                            };

                            Ok(NewBidResult {
                                escrow: escrow_record,
                                result: escrow_id, // Use escrow_id as transaction ID
                            })
                        }
                        Err(e) => Err(e),
                    }
                } else {
                    // Bid doesn't match buy_now requirements, treat as regular bid
                    ic_cdk::println!("❌ Bid amount {} doesn't meet buy_now requirement {}", bid_amount, required_amount);
                    return Err(MarketplaceError::InvalidInput(format!("Bid amount {} doesn't meet buy_now requirement {}", bid_amount, required_amount)));
                }
            } else {
                // No buy_now requirement, treat as regular bid
                ic_cdk::println!("ℹ️ No buy_now requirement found, treating as regular bid");
                // Regular bid (not buy_now)
                    let escrow_id = self.escrow_manager.create_escrow(
                        EscrowType::Bid(vec![]), // Simplified for now
                        Some(buyer_account.clone()),
                        ask_status.seller.clone(),
                        Some(ask_id),
                        None, // No lock date
                    );

                    let escrow_record = self.escrow_manager.get_escrow(escrow_id)
                        .ok_or(MarketplaceError::Internal("Failed to retrieve created escrow".to_string()))?
                        .clone();

                    // Update ask participants
                    if !ask_status.participants.iter().any(|p| p.owner == caller) {
                        ask_status.participants.push(buyer_account);
                        self.storage.insert_ask(ask_id, ask_status);
                    }

                    Ok(NewBidResult {
                        escrow: escrow_record,
                        result: escrow_id, // Use escrow_id as transaction ID
                    })
                }
            }
        } else {
            Err(MarketplaceError::NotFound("Ask not found".to_string()))
        }
    }

    /// Extract bid amount from bid features
    fn extract_bid_amount(&self, features: &[Option<BidFeature>]) -> MarketplaceResult<u64> {
        ic_cdk::println!("🔍 extract_bid_amount called with {} features", features.len());
        for (i, feature) in features.iter().enumerate() {
            ic_cdk::println!("🔍 Processing feature {}: {:?}", i, feature.is_some());
            if let Some(feature) = feature {
                ic_cdk::println!("🔍 Feature {} type: {:?}", i, std::mem::discriminant(feature));
                match feature {
                    BidFeature::Escrow(escrow_record) => {
                        ic_cdk::println!("🔍 Found Escrow bid feature");
                        ic_cdk::println!("🔍 Escrow record: {:?}", escrow_record);
                        // Extract amount from escrow record
                        if let EscrowType::Bid(token_specs) = &escrow_record.escrow_type {
                            ic_cdk::println!("🔍 Found Bid escrow type with {} token specs", token_specs.len());
                            for (j, token_spec) in token_specs.iter().enumerate() {
                                ic_cdk::println!("🔍 Processing token spec {}: {:?}", j, token_spec.is_some());
                                if let Some(spec) = token_spec {
                                    ic_cdk::println!("🔍 Processing token spec: {:?}", spec);
                                    // Look for ICRC1 tokens (fungible tokens)
                                    for (k, standard) in spec.standards.iter().enumerate() {
                                        ic_cdk::println!("🔍 Processing standard {}: {:?}", k, std::mem::discriminant(standard));
                                        if let ICRCStandards::ICRC1(icrc1_spec) = standard {
                                            ic_cdk::println!("🔍 Found ICRC1 spec: {:?}", icrc1_spec.is_some());
                                            if let Some(icrc1_detail) = icrc1_spec {
                                                ic_cdk::println!("✅ Found ICRC1 amount: {}", icrc1_detail.amount);
                                                return Ok(icrc1_detail.amount);
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            ic_cdk::println!("❌ Escrow type is not Bid: {:?}", escrow_record.escrow_type);
                        }
                    }
                    _ => {}
                }
            }
        }
        Err(MarketplaceError::InvalidInput("No bid amount found in bid features".to_string()))
    }

    /// Get balance information
    pub async fn get_balance_of(
        &self,
        requests: Vec<(Account, Option<BalanceRequest>)>,
    ) -> Vec<(Account, Vec<BalanceResult>)> {
        let mut results = Vec::new();

        for (account, balance_request) in requests {
            let balance_results = match balance_request {
                None => vec![],
                Some(request) => {
                    let mut results = Vec::new();
                    match request {
                        BalanceRequest::Nfts(_pagination) => {
                            results.push(BalanceResult::Nfts(None)); // Simplified
                        }
                        BalanceRequest::Tokens => {
                            results.push(BalanceResult::Tokens(Some(0))); // Simplified
                        }
                        BalanceRequest::Escrow(_pagination) => {
                            // Get escrow records for this account
                            let account_escrows = self.escrow_manager.get_account_escrows(&account);
                            let escrow_records: Vec<EscrowRecord> = account_escrows
                                .into_iter()
                                .map(|(_, escrow)| escrow.clone())
                                .collect();
                            
                            let count = escrow_records.len() as u64;
                            results.push(BalanceResult::Escrow(BalanceRecords {
                                records: escrow_records,
                                count,
                                eof: true,
                            }));
                        }
                        BalanceRequest::AskSettlements(_pagination) => {
                            results.push(BalanceResult::AskSettlements(BalanceRecords {
                                records: vec![],
                                count: 0,
                                eof: true,
                            }));
                        }
                        BalanceRequest::Offers(_pagination) => {
                            results.push(BalanceResult::Offers(BalanceRecords {
                                records: vec![],
                                count: 0,
                                eof: true,
                            }));
                        }
                    }
                    results
                }
            };

            results.push((account, balance_results));
        }

        results
    }

    /// Get ask information
    pub async fn get_ask_info(
        &self,
        requests: Vec<Option<AskInfoRequest>>,
    ) -> Vec<(Option<AskInfoRequest>, Option<AskInfoResponse>)> {
        let mut results = Vec::new();

        for request in requests {
            match request {
                None => {
                    results.push((None, None));
                }
                Some(AskInfoRequest::Active(pagination)) => {
                    let active_asks = self.storage.get_all_active_asks();
                    let count = active_asks.len() as u64;
                    let response = AskInfoResponse::Active(AskInfoRecords {
                        records: active_asks.into_iter().map(Some).collect(),
                        eof: true,
                        count,
                    });
                    results.push((Some(AskInfoRequest::Active(pagination)), Some(response)));
                }
                Some(AskInfoRequest::History(offset, limit)) => {
                    let history = self.storage.get_all_ask_history();
                    let count = history.len() as u64;
                    let response = AskInfoResponse::History(AskInfoRecords {
                        records: history.into_iter().map(Some).collect(),
                        eof: true,
                        count,
                    });
                    results.push((Some(AskInfoRequest::History(offset, limit)), Some(response)));
                }
                Some(AskInfoRequest::Status(ask_id)) => {
                    let ask_status = self.storage.get_ask(ask_id);
                    let response = AskInfoResponse::Status(ask_status);
                    results.push((Some(AskInfoRequest::Status(ask_id)), Some(response)));
                }
            }
        }

        results
    }

    /// Get approved tokens
    pub async fn get_approved_tokens(&self) -> Option<Vec<Principal>> {
        Some(self.storage.get_approved_tokens())
    }

    /// Get metadata
    pub async fn get_metadata(&self) -> Vec<(String, String)> {
        self.metadata.clone().into_iter().collect()
    }

    /// Set metadata
    pub async fn set_metadata(&mut self, key: String, value: String) -> MarketplaceResult<()> {
        self.metadata.insert(key, value);
        Ok(())
    }

    /// Save state to stable memory
    pub fn save_state(&self) {
        ic_cdk::println!("🔄 Starting state save process...");
        
        // Save storage state
        self.storage.save_runtime_state();
        
        // Save escrow manager state
        self.escrow_manager.save_state();
        
        // Save fee manager state
        self.fee_manager.save_state();
        
        // Save auction manager state
        self.auction_manager.save_state();
        
        // Save AMM manager state
        self.amm_manager.save_state();
        
        // Save KYC manager state
        self.kyc_manager.save_state();
        
        // Save notification manager state
        self.notification_manager.save_state();
        
        ic_cdk::println!("✅ State save process completed successfully");
    }

    /// Load state from stable memory
    pub fn load_state(&self) {
        ic_cdk::println!("🔄 Starting state load process...");
        
        // Load storage state
        self.storage.load_runtime_state();
        
        // Load escrow manager state
        self.escrow_manager.load_state();
        
        // Load fee manager state
        self.fee_manager.load_state();
        
        // Load auction manager state
        self.auction_manager.load_state();
        
        // Load AMM manager state
        self.amm_manager.load_state();
        
        // Load KYC manager state
        self.kyc_manager.load_state();
        
        // Load notification manager state
        self.notification_manager.load_state();
        
        ic_cdk::println!("✅ State load process completed successfully");
    }

    /// Withdraw escrow funds
    fn withdraw_escrow(&mut self, caller: Principal, escrow_record: EscrowRecord) -> MarketplaceResult<WithdrawResult> {
        // Validate that the caller is authorized to withdraw from this escrow
        let _caller_account = Account {
            owner: caller,
            subaccount: None,
        };

        // Check if caller is the buyer or seller
        let is_authorized = escrow_record.seller.owner == caller
            || escrow_record.buyer.as_ref().map(|b| b.owner == caller).unwrap_or(false);

        if !is_authorized {
            return Err(MarketplaceError::Unauthorized(
                "Only buyer or seller can withdraw from escrow".to_string(),
            ));
        }

        // Check if escrow is locked
        let current_time = ic_cdk::api::time();
        if self.escrow_manager.is_locked(escrow_record.ask_id.unwrap_or(0), current_time)? {
            return Err(MarketplaceError::InvalidState(
                "Escrow is currently locked".to_string(),
            ));
        }

        // Find the escrow record in the manager
        let escrow_id = self.find_escrow_by_record(&escrow_record)?;
        
        // Remove the escrow record
        if let Some(_removed_escrow) = self.escrow_manager.remove_escrow(escrow_id) {
            Ok(WithdrawResult {
                withdraw_result: escrow_id,
                token_results: vec![], // Empty for now, would contain actual token transfer results
            })
        } else {
            Err(MarketplaceError::NotFound("Escrow record not found".to_string()))
        }
    }

    /// Withdraw settlement funds
    fn withdraw_settlement(&mut self, caller: Principal, escrow_record: EscrowRecord) -> MarketplaceResult<WithdrawResult> {
        // Validate that the caller is authorized to withdraw settlement
        let _caller_account = Account {
            owner: caller,
            subaccount: None,
        };

        // Check if caller is the seller (only seller can withdraw settlement)
        if escrow_record.seller.owner != caller {
            return Err(MarketplaceError::Unauthorized(
                "Only seller can withdraw settlement".to_string(),
            ));
        }

        // Check if there's an associated ask and it's settled
        if let Some(ask_id) = escrow_record.ask_id {
            if let Some(ask_status) = self.storage.get_ask(ask_id) {
                if ask_status.settled_at.is_none() {
                    return Err(MarketplaceError::InvalidState(
                        "Ask is not settled yet".to_string(),
                    ));
                }
            }
        }

        // Find the escrow record in the manager
        let escrow_id = self.find_escrow_by_record(&escrow_record)?;
        
        // Remove the escrow record
        if let Some(_removed_escrow) = self.escrow_manager.remove_escrow(escrow_id) {
            Ok(WithdrawResult {
                withdraw_result: escrow_id,
                token_results: vec![], // Empty for now, would contain actual token transfer results
            })
        } else {
            Err(MarketplaceError::NotFound("Escrow record not found".to_string()))
        }
    }

    /// Helper method to find escrow ID by escrow record
    fn find_escrow_by_record(&self, escrow_record: &EscrowRecord) -> MarketplaceResult<u64> {
        // This is a simplified implementation
        // In a real implementation, you'd have a more efficient way to find escrow by record
        let all_escrows = self.escrow_manager.get_all_escrows();
        
        for (escrow_id, record) in all_escrows {
            if record.ask_id == escrow_record.ask_id
                && record.seller.owner == escrow_record.seller.owner
                && record.buyer.as_ref().map(|b| b.owner) == escrow_record.buyer.as_ref().map(|b| b.owner)
            {
                return Ok(*escrow_id);
            }
        }
        
        Err(MarketplaceError::NotFound("Escrow record not found".to_string()))
    }

    /// Process settlement for an ask (integrated with FeeManager)
    async fn process_settlement(&mut self, ask_id: u64, buyer: Principal, amount: u64) -> MarketplaceResult<SettlementInfo> {
        ic_cdk::println!("🏁 Starting settlement process for ask_id: {}, buyer: {}, amount: {}", ask_id, buyer, amount);
        // Get the ask status
        let mut ask_status = self.storage.get_ask(ask_id)
            .ok_or(MarketplaceError::NotFound("Ask not found".to_string()))?;

        // Validate ask is open
        if !matches!(ask_status.status, AskStatusType::Open) {
            return Err(MarketplaceError::InvalidState("Ask is not open for settlement".to_string()));
        }

        // Calculate fees using FeeManager
        let fee_schema = self.extract_fee_schema(&ask_status.config);
        let _total_fee = self.fee_manager.calculate_fee(amount, fee_schema.as_deref());

        // Create fee distribution for marketplace
        let marketplace_account = Account {
            owner: ic_cdk::api::canister_self(), // Marketplace canister ID
            subaccount: None,
        };

        let fee_distributions = vec![
            FeeParty {
                account: marketplace_account,
                percentage: 100, // 100% of fees go to marketplace
                fixed_amount: None,
            }
        ];

        let _fee_results = self.fee_manager.calculate_fees(amount, fee_schema.as_deref(), &fee_distributions);

        // Extract NFT token IDs from the ask
        let nft_token_ids = self.extract_nft_token_ids(&ask_status.config)?;
        let payment_token = self.extract_payment_token(&ask_status.config)?;
        
        ic_cdk::println!("🔄 Processing settlement for ask {}: transferring {} NFTs to buyer {}", ask_id, nft_token_ids.len(), buyer);
        ic_cdk::println!("🔄 NFT token IDs to transfer: {:?}", nft_token_ids);
        
        // Transfer NFTs from marketplace to buyer
        let nft_canister = self.extract_nft_canister(&ask_status.config)?;
        ic_cdk::println!("🎨 Transferring NFTs from marketplace to buyer. NFT canister: {}, buyer: {}, token_ids: {:?}", nft_canister, buyer, nft_token_ids);
        
        // Check if marketplace actually owns these NFTs before trying to transfer
        ic_cdk::println!("🔍 Checking if marketplace owns the NFTs before transfer...");
        // This would be a good place to add ownership verification
        
        match push_icrc7_nfts(
            nft_canister, // Use the NFT canister
            buyer, // To buyer
            nft_token_ids.clone(),
        ).await {
            Ok(block_index) => {
                ic_cdk::println!("✅ Successfully transferred NFTs to buyer. Block: {}", block_index);
            }
            Err(e) => {
                ic_cdk::println!("❌ Failed to transfer NFTs to buyer: {}", e);
                return Err(e);
            }
        }
        
        // Transfer payment tokens from marketplace to seller
        // Calculate fee and deduct from seller amount
        let fee_schema = self.extract_fee_schema(&ask_status.config);
        let total_fee = self.fee_manager.calculate_fee(amount, fee_schema.as_deref());
        let seller_amount = amount - total_fee; // Seller gets amount minus fees
        match push_icrc2_tokens(
            payment_token.canister,
            ask_status.seller.owner,
            seller_amount.into(),
        ).await {
            Ok(block_index) => {
                ic_cdk::println!("✅ Successfully transferred payment to seller. Block: {}", block_index);
            }
            Err(e) => {
                ic_cdk::println!("❌ Failed to transfer payment to seller: {}", e);
                return Err(e);
            }
        }

        // Create settlement info
        let settlement_info = SettlementInfo {
            bid_tokens: vec![], // Would contain actual token transfer results
            ask_tokens: vec![], // Would contain actual token transfer results
            royalties: vec![], // Would contain royalty distributions
        };

        // Update ask status
        ask_status.settlement = Some(settlement_info.clone());
        ask_status.settled_at = Some((buyer, ic_cdk::api::time()));
        ask_status.status = AskStatusType::Closed;

        // Save updated ask status
        self.storage.insert_ask(ask_id, ask_status.clone());

        // Create settlement escrow record
        let buyer_account = Account {
            owner: buyer,
            subaccount: None,
        };

        let _settlement_escrow_id = self.escrow_manager.create_escrow(
            EscrowType::Settlement(vec![]), // Would contain actual token specs
            Some(buyer_account),
            ask_status.seller.clone(),
            Some(ask_id),
            None, // No lock date for settlements
        );

        // Send notification about settlement
        if let Err(e) = self.notification_manager.notify_ask_settled(
            ask_id,
            buyer,
            ask_status.seller.owner,
            vec![], // Empty notification list for now
        ) {
            println!("Failed to send settlement notification: {:?}", e);
        }

        Ok(settlement_info)
    }

    /// Extract fee schema from ask features
    fn extract_fee_schema(&self, features: &[AskFeature]) -> Option<String> {
        for feature in features {
            if let AskFeature::FeeSchema(schema) = feature {
                return Some(schema.clone());
            }
        }
        None
    }

    /// Get fee information for an ask
    pub fn get_fee_info(&self, ask_id: u64) -> MarketplaceResult<u64> {
        let ask_status = self.storage.get_ask(ask_id)
            .ok_or(MarketplaceError::NotFound("Ask not found".to_string()))?;

        // Extract buy_now amount for fee calculation
        let amount = self.extract_buy_now_amount(&ask_status.config)
            .unwrap_or(1000); // Default amount for fee calculation

        let fee_schema = self.extract_fee_schema(&ask_status.config);
        let fee = self.fee_manager.calculate_fee(amount, fee_schema.as_deref());

        Ok(fee)
    }

    /// Extract buy_now amount from ask features
    fn extract_buy_now_amount(&self, features: &[AskFeature]) -> Option<u64> {
        for feature in features {
            if let AskFeature::BuyNow(buy_now_options) = feature {
                if let Some(buy_now_vec) = buy_now_options.first() {
                    if let Some(buy_now) = buy_now_vec.first() {
                        return Some(buy_now.amount);
                    }
                }
            }
        }
        None
    }

    /// Extract payment token from ask features
    fn extract_payment_token(&self, features: &[AskFeature]) -> MarketplaceResult<TokenSpec> {
        for feature in features {
            if let AskFeature::BuyNow(buy_now_options) = feature {
                if let Some(buy_now_vec) = buy_now_options.first() {
                    if let Some(buy_now) = buy_now_vec.first() {
                        return Ok(buy_now.token.clone());
                    }
                }
            }
        }
        Err(MarketplaceError::InvalidInput("No payment token found in ask features".to_string()))
    }

    /// Distribute ask settlement funds
    fn distribute_ask(&mut self, caller: Principal, ask_id: u64) -> MarketplaceResult<Vec<DistributionResult>> {
        // Get the ask status
        let ask_status = self.storage.get_ask(ask_id)
            .ok_or(MarketplaceError::NotFound("Ask not found".to_string()))?;

        // Validate that the caller is the seller
        if ask_status.seller.owner != caller {
            return Err(MarketplaceError::Unauthorized(
                "Only seller can distribute ask funds".to_string(),
            ));
        }

        // Check if ask is settled
        if ask_status.settled_at.is_none() {
            return Err(MarketplaceError::InvalidState(
                "Ask is not settled yet".to_string(),
            ));
        }

        // Calculate distribution amounts using FeeManager
        let amount = self.extract_buy_now_amount(&ask_status.config)
            .unwrap_or(1000); // Default amount

        let fee_schema = self.extract_fee_schema(&ask_status.config);
        let total_fee = self.fee_manager.calculate_fee(amount, fee_schema.as_deref());

        // Calculate seller's share (amount minus fees)
        let seller_amount = amount - total_fee;

        // Create distribution results
        let mut distributions = Vec::new();

        // Seller distribution
        let seller_distribution = DistributionResult {
            token: TokenSpec::new(Principal::anonymous(), "ICP".to_string()), // Default token
            result: Ok(seller_amount),
        };
        distributions.push(seller_distribution);

        // Marketplace fee distribution
        let marketplace_distribution = DistributionResult {
            token: TokenSpec::new(Principal::anonymous(), "ICP".to_string()), // Default token
            result: Ok(total_fee),
        };
        distributions.push(marketplace_distribution);

        Ok(distributions)
    }

    /// Public method to trigger settlement
    pub async fn settle_ask(&mut self, ask_id: u64, buyer: Principal, amount: u64) -> MarketplaceResult<SettlementInfo> {
        self.process_settlement(ask_id, buyer, amount).await
    }

    /// Extract NFT token IDs from ask features
    fn extract_nft_token_ids(&self, features: &[AskFeature]) -> MarketplaceResult<Vec<u64>> {
        ic_cdk::println!("🔍 extract_nft_token_ids called with {} features", features.len());
        for (i, feature) in features.iter().enumerate() {
            ic_cdk::println!("🔍 Processing feature {}: {:?}", i, std::mem::discriminant(feature));
            if let AskFeature::AskToken(ask_token_options) = feature {
                ic_cdk::println!("🔍 Found AskToken feature with {} options", ask_token_options.len());
                if let Some(ask_token) = ask_token_options.first() {
                    ic_cdk::println!("🔍 Processing ask_token: {:?}", ask_token.is_some());
                    if let Some(token_spec) = ask_token {
                        ic_cdk::println!("🔍 Processing token_spec with {} standards", token_spec.standards.len());
                        // Extract token IDs from ICRC37 standards
                        for (j, standard) in token_spec.standards.iter().enumerate() {
                            ic_cdk::println!("🔍 Processing standard {}: {:?}", j, std::mem::discriminant(standard));
                            if let ICRCStandards::ICRC37(icrc37_spec) = standard {
                                ic_cdk::println!("🔍 Found ICRC37 spec: {:?}", icrc37_spec.is_some());
                                if let Some(icrc37_detail) = icrc37_spec {
                                    ic_cdk::println!("🔍 Found ICRC37 detail with token_id: {:?}", icrc37_detail.token_id);
                                    if let Some(token_id) = &icrc37_detail.token_id {
                                        ic_cdk::println!("✅ Extracted token ID: {}", token_id);
                                        return Ok(vec![*token_id]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Err(MarketplaceError::InvalidInput("No NFT token IDs found in ask features".to_string()))
    }

    /// Extract NFT canister from ask features
    fn extract_nft_canister(&self, features: &[AskFeature]) -> MarketplaceResult<Principal> {
        for feature in features {
            if let AskFeature::AskToken(ask_token_options) = feature {
                if let Some(ask_token) = ask_token_options.first() {
                    if let Some(token_spec) = ask_token {
                        return Ok(token_spec.canister);
                    }
                }
            }
        }
        Err(MarketplaceError::InvalidInput("No NFT canister found in ask features".to_string()))
    }

    /// Get current marketplace state for debugging
    pub fn get_debug_state(&self) -> String {
        let runtime_state = self.storage.get_runtime_state();
        let active_asks = self.storage.get_all_active_asks().len();
        let total_asks = self.storage.get_all_ask_history().len();
        let escrow_count = self.escrow_manager.get_all_escrows().len();
        
        format!(
            "Marketplace State:\n\
            - Next Ask ID: {}\n\
            - Next Escrow ID: {}\n\
            - Active Asks: {}\n\
            - Total Ask History: {}\n\
            - Escrow Records: {}\n\
            - Fee Schemas: {}\n\
            - Auctions: {}\n\
            - AMM Pools: {}\n\
            - KYC Providers: {}\n\
            - Notification Subscribers: {}",
            runtime_state.next_ask_id,
            runtime_state.next_escrow_id,
            active_asks,
            total_asks,
            escrow_count,
            self.fee_manager.get_fee_schemas().len(),
            self.auction_manager.get_all_auctions().len(),
            self.amm_manager.get_all_pools().len(),
            self.kyc_manager.get_providers().len(),
            self.notification_manager.get_stats().0
        )
    }
}
