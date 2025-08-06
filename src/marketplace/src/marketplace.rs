//! Main marketplace implementation
//! 
//! This module implements the core ICRC-8 marketplace functionality.

use candid::Principal;
use ic_cdk::api::msg_caller;
use std::collections::HashMap;

use crate::types;
use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};
use crate::storage::MarketplaceStorage;
use crate::escrow::EscrowManager;
use crate::fees::FeeManager;
use crate::auctions::AuctionManager;

/// Main marketplace implementation
pub struct Marketplace {
    storage: MarketplaceStorage,
    escrow_manager: EscrowManager,
    fee_manager: FeeManager,
    auction_manager: AuctionManager,
    metadata: HashMap<String, String>,
}

impl Marketplace {
    pub fn new() -> Self {
        let mut metadata = HashMap::new();
        metadata.insert("icrc8:default_ask_timeout".to_string(), "86400000000000".to_string());
        metadata.insert("icrc8:default_fee_schema".to_string(), "standard".to_string());
        metadata.insert("icrc8:supports_icrc_2".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_4".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_37".to_string(), "true".to_string());

        Self {
            storage: MarketplaceStorage::new(&ic_stable_structures::memory_manager::MemoryManager::init(
                ic_stable_structures::DefaultMemoryImpl::default()
            )),
            escrow_manager: EscrowManager::new(),
            fee_manager: FeeManager::new(),
            auction_manager: AuctionManager::new(),
            metadata,
        }
    }

    /// Handle ask requests (ICRC-8)
    pub async fn handle_ask_requests(&mut self, requests: Vec<Option<ManageAskRequest>>) -> Vec<(Option<ManageAskRequest>, Option<ManageAskResponse>)> {
        let mut results = Vec::new();
        
        for request in requests {
            match request {
                None => {
                    results.push((None, None));
                }
                Some(req) => {
                    let response = match &req {
                        ManageAskRequest::NewAsk(features) => {
                            match self.create_new_ask(msg_caller(), features.clone()).await {
                                Ok(result) => ManageAskResponse::NewAsk(Ok(result)),
                                Err(error) => ManageAskResponse::NewAsk(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
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
                        ManageAskRequest::WithdrawSettlement(_escrow_record) => {
                            ManageAskResponse::WithdrawSettlement(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::WithdrawEscrow(_escrow_record) => {
                            ManageAskResponse::WithdrawSettlement(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::RejectOffer(_ask_id) => {
                            ManageAskResponse::EndAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::DistributeAsk(_ask_id) => {
                            ManageAskResponse::DistributeAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::UpdateAmm(_amm_update) => {
                            ManageAskResponse::NewAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::LockAsk(_lock_ask) => {
                            ManageAskResponse::LockAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageAskRequest::Unencumber(_ask_id) => {
                            ManageAskResponse::EndAsk(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
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
    pub async fn handle_bid_requests(&mut self, requests: Vec<Option<ManageBidRequest>>) -> Vec<(Option<ManageBidRequest>, Option<ManageBidResponse>)> {
        let mut results = Vec::new();
        
        for request in requests {
            match request {
                None => {
                    results.push((None, None));
                }
                Some(req) => {
                    let response = match &req {
                        ManageBidRequest::NewBid(new_bid_request) => {
                            match self.create_new_bid(msg_caller(), new_bid_request.clone()).await {
                                Ok(result) => ManageBidResponse::NewBid(Ok(result)),
                                Err(error) => ManageBidResponse::NewBid(Err(types::GenericError {
                                    code: error.to_string().len() as u64,
                                    message: error.to_string(),
                                })),
                            }
                        }
                        ManageBidRequest::EngineMatch(_engine_match) => {
                            ManageBidResponse::EngineMatch(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                        ManageBidRequest::WithdrawEscrow(_escrow_record) => {
                            ManageBidResponse::WithdrawEscrow(Err(types::GenericError {
                                code: 501,
                                message: "Not implemented".to_string(),
                            }))
                        }
                    };
                    results.push((Some(req), Some(response)));
                }
            }
        }
        
        results
    }
    
    /// Create a new ask
    async fn create_new_ask(&mut self, caller: Principal, features: Vec<Option<AskFeature>>) -> MarketplaceResult<NewAskResult> {
        // Validate features
        let mut has_ask_token = false;
        let mut has_buy_now = false;
        let mut auction_feature = None;
        let mut dutch_feature = None;
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
                    AskFeature::Ending(EndingType::Date(date)) => {
                        end_date = Some(*date);
                    }
                    _ => {}
                }
            }
        }
        
        if !has_ask_token {
            return Err(MarketplaceError::InvalidInput("Missing required ask_token feature".to_string()));
        }
        
        // For auctions, we don't require buy_now
        if auction_feature.is_none() && dutch_feature.is_none() && !has_buy_now {
            return Err(MarketplaceError::InvalidInput("Missing required buy_now feature for non-auction asks".to_string()));
        }
        
        // Create ask
        let ask_id = self.storage.get_next_ask_id();
        let account = Account {
            owner: caller,
            sub_account: None,
        };
        
        // Handle auction creation if auction feature is present
        let auction_info = if let Some(auction) = auction_feature {
            if let Some(end_date) = end_date {
                match self.auction_manager.create_standard_auction(ask_id, auction, end_date) {
                    Ok(info) => Some(info),
                    Err(e) => return Err(e),
                }
            } else {
                return Err(MarketplaceError::InvalidInput("Auction requires an end date".to_string()));
            }
        } else if let Some(dutch) = dutch_feature {
            // For Dutch auctions, we need start_price, end_price, and duration
            // These would typically come from other features or be set as defaults
            let start_price = start_price.unwrap_or(1000); // Default start price
            let end_price = end_price.unwrap_or(100); // Default end price
            let duration = 24 * 60 * 60 * 1_000_000_000; // Default 24 hours in nanoseconds
            
            match self.auction_manager.create_dutch_auction(ask_id, dutch, start_price, end_price, duration) {
                Ok(info) => Some(info),
                Err(e) => return Err(e),
            }
        } else {
            None
        };
                
        let ask_status = AskStatus {
            ask_id,
            original_broker_id: None,
            current_broker_id: None,
            config: features.into_iter().filter_map(|f| f).collect(),
            auction_info,
            settlement: None,
            allow_list: None,
            participants: vec![account.clone()],
            settled_at: None,
            status: AskStatusType::Open,
            seller: account.clone(),
        };
                
        self.storage.insert_ask(ask_id, ask_status.clone());
        self.storage.add_user_ask(caller, ask_id);
                
        // Create escrow record
        let escrow_record = EscrowRecord {
            type_: EscrowType::Ask(vec![]), // Simplified for now
            buyer: None,
            seller: account,
            ask_id: Some(ask_id),
            lock_to_date: None,
        };
        
        let escrow_id = self.storage.get_next_escrow_id();
        self.storage.insert_escrow_record(escrow_id, escrow_record.clone());
        
        Ok(NewAskResult {
            ask_id,
            escrow: escrow_record,
        })
    }
    
    /// End an ask
    fn end_ask(&mut self, caller: Principal, ask_id: u64) -> MarketplaceResult<u64> {
        if let Some(mut ask_status) = self.storage.get_ask(ask_id) {
                if ask_status.seller.owner != caller {
                return Err(MarketplaceError::Unauthorized("Only the seller can end the ask".to_string()));
                }
                
                if !matches!(ask_status.status, AskStatusType::Open) {
                return Err(MarketplaceError::InvalidState("Ask is not in open state".to_string()));
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
    async fn create_new_bid(&mut self, caller: Principal, new_bid_request: NewBidRequest) -> MarketplaceResult<NewBidResult> {
        let ask_id = new_bid_request.ask_id;
        
        if let Some(mut ask_status) = self.storage.get_ask(ask_id) {
            if !matches!(ask_status.status, AskStatusType::Open) {
                return Err(MarketplaceError::InvalidState("Ask is not open for bids".to_string()));
            }
            
            // Check if this is an auction
            if let Some(mut auction_info) = ask_status.auction_info.clone() {
                // Handle auction bid
                // Extract bid amount from bid features
                let bid_amount = self.extract_bid_amount(&new_bid_request.feature)?;
                
                // Process the auction bid
                match self.auction_manager.place_auction_bid(&mut auction_info, caller, bid_amount) {
                    Ok(()) => {
                        // Update the auction info in the ask
                        ask_status.auction_info = Some(auction_info);
                        self.storage.insert_ask(ask_id, ask_status.clone());
                        
                        // Create escrow record for the bid
                        let buyer_account = Account {
                            owner: caller,
                            sub_account: None,
                        };
                        
                        let escrow_record = EscrowRecord {
                            type_: EscrowType::Bid(vec![]), // Simplified for now
                            buyer: Some(buyer_account.clone()),
                            seller: ask_status.seller.clone(),
                            ask_id: Some(ask_id),
                            lock_to_date: None,
                        };
                        
                        let escrow_id = self.storage.get_next_escrow_id();
                        self.storage.insert_escrow_record(escrow_id, escrow_record.clone());
                        
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
                    sub_account: None,
                };
                
                let escrow_record = EscrowRecord {
                    type_: EscrowType::Bid(vec![]), // Simplified for now
                    buyer: Some(buyer_account.clone()),
                    seller: ask_status.seller.clone(),
                    ask_id: Some(ask_id),
                    lock_to_date: None,
                };
                
                let escrow_id = self.storage.get_next_escrow_id();
                self.storage.insert_escrow_record(escrow_id, escrow_record.clone());
                
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
        } else {
            Err(MarketplaceError::NotFound("Ask not found".to_string()))
        }
    }
    
    /// Extract bid amount from bid features
    fn extract_bid_amount(&self, _features: &[Option<BidFeature>]) -> MarketplaceResult<u64> {
        // For now, we'll use a simplified approach
        // In a real implementation, you'd extract the actual bid amount from the features
        // This is a placeholder - you'd need to implement proper bid amount extraction
        Ok(1000) // Default bid amount for now
    }

    /// Get balance information
    pub async fn get_balance_of(&self, requests: Vec<(Account, Option<Vec<Option<BalanceRequest>>>)>) -> Vec<(Account, Vec<BalanceResult>)> {
        let mut results = Vec::new();
        
        for (account, request_opt) in requests {
            let balance_results = match request_opt {
                None => vec![],
                Some(requests) => {
                    let mut results = Vec::new();
                    for request in requests {
                        match request {
                            None => results.push(BalanceResult::Tokens(None)),
                            Some(BalanceRequest::Nfts(_pagination)) => {
                                results.push(BalanceResult::Nfts(None)); // Simplified
                            }
                            Some(BalanceRequest::Tokens) => {
                                results.push(BalanceResult::Tokens(Some(0))); // Simplified
                            }
                            Some(BalanceRequest::Escrow(_pagination)) => {
                                results.push(BalanceResult::Escrow(BalanceRecords {
                                    records: vec![],
            count: 0,
            eof: true,
                                }));
                            }
                            Some(BalanceRequest::AskSettlements(_pagination)) => {
                                results.push(BalanceResult::AskSettlements(BalanceRecords {
                                    records: vec![],
            count: 0,
            eof: true,
                                }));
                            }
                            Some(BalanceRequest::Offers(_pagination)) => {
                                results.push(BalanceResult::Offers(BalanceRecords {
                                    records: vec![],
            count: 0,
            eof: true,
                                }));
                            }
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
    pub async fn get_ask_info(&self, requests: Vec<Option<AskInfoRequest>>) -> Vec<(Option<AskInfoRequest>, Option<AskInfoResponse>)> {
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
        // State is automatically saved by stable structures
        ic_cdk::println!("State saved to stable memory");
    }

    /// Load state from stable memory
    pub fn load_state(&self) {
        // State is automatically loaded by stable structures
        ic_cdk::println!("State loaded from stable memory");
    }
}
