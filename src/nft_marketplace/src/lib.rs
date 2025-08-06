//! NFT Marketplace Backend - ICRC-8 Compliant
//! 
//! This module provides a modular, ICRC-8 compliant NFT marketplace implementation
//! for the Internet Computer blockchain.

pub mod types;
pub mod storage;
pub mod marketplace;
pub mod escrow;
pub mod fees;
pub mod auctions;
pub mod amm;
pub mod kyc;
pub mod notifications;
pub mod errors;
pub mod utils;

use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::*;
use std::collections::HashMap;

// Re-export main types for easy access
pub use types::*;
pub use marketplace::Marketplace;
pub use errors::MarketplaceError;

/// Main marketplace state
#[derive(Default)]
pub struct NFTMarketplace {
    pub marketplace: Marketplace,
    pub metadata: HashMap<String, String>,
}

impl NFTMarketplace {
    pub fn new() -> Self {
        Self {
            marketplace: Marketplace::new(),
            metadata: Self::default_metadata(),
        }
    }

    fn default_metadata() -> HashMap<String, String> {
        let mut metadata = HashMap::new();
        metadata.insert("icrc8:default_ask_timeout".to_string(), "86400000000000".to_string()); // 24 hours in nanoseconds
        metadata.insert("icrc8:default_fee_schema".to_string(), "standard".to_string());
        metadata.insert("icrc8:supports_icrc_2".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_4".to_string(), "true".to_string());
        metadata.insert("icrc8:supports_icrc_37".to_string(), "true".to_string());
        metadata
    }
}

// Global state
static mut MARKETPLACE: Option<NFTMarketplace> = None;

fn get_marketplace() -> &'static mut NFTMarketplace {
    unsafe {
        if MARKETPLACE.is_none() {
            MARKETPLACE = Some(NFTMarketplace::new());
        }
        MARKETPLACE.as_mut().unwrap()
    }
}

// ICRC-8 Interface Implementation

#[update]
pub async fn icrc8_ask(requests: Vec<Option<ManageAskRequest>>) -> Vec<(Option<ManageAskRequest>, Option<ManageAskResponse>)> {
    let marketplace = get_marketplace();
    marketplace.marketplace.handle_ask_requests(requests).await
}

#[update]
pub async fn icrc8_bid(requests: Vec<Option<ManageBidRequest>>) -> Vec<(Option<ManageBidRequest>, Option<ManageBidResponse>)> {
    let marketplace = get_marketplace();
    marketplace.marketplace.handle_bid_requests(requests).await
}

#[query]
pub async fn icrc8_balance_of(request: Vec<(Account, Option<BalanceRequest>)>) -> Vec<(Account, Vec<BalanceResult>)> {
    let marketplace = get_marketplace();
    marketplace.marketplace.get_balance_of(request).await
}

#[query]
pub async fn icrc8_ask_info(requests: Vec<Option<AskInfoRequest>>) -> Vec<(Option<AskInfoRequest>, Option<AskInfoResponse>)> {
    let marketplace = get_marketplace();
    marketplace.marketplace.get_ask_info(requests).await
}

#[composite_query]
pub async fn icrc8_approved_tokens() -> Option<Vec<Principal>> {
    let marketplace = get_marketplace();
    marketplace.marketplace.get_approved_tokens().await
}

// Metadata and configuration
#[query]
pub async fn get_metadata() -> Vec<(String, String)> {
    let marketplace = get_marketplace();
    marketplace.metadata.clone().into_iter().collect()
}

#[update]
pub async fn set_metadata(key: String, value: String) -> Result<(), MarketplaceError> {
    let marketplace = get_marketplace();
    marketplace.metadata.insert(key, value);
    Ok(())
}

// Health check
#[query]
pub async fn health_check() -> String {
    "NFT Marketplace is running".to_string()
}

// Initialize the canister
#[init]
pub fn init() {
    ic_cdk::println!("NFT Marketplace initialized");
}

// Pre-upgrade hook for state persistence
#[pre_upgrade]
pub fn pre_upgrade() {
    let marketplace = get_marketplace();
    // Save state to stable memory
    marketplace.marketplace.save_state();
}

// Post-upgrade hook for state restoration
#[post_upgrade]
pub fn post_upgrade() {
    // Restore state from stable memory
    let marketplace = get_marketplace();
    marketplace.marketplace.load_state();
    ic_cdk::println!("NFT Marketplace state restored");
}
