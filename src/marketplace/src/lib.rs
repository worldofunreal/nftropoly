//! NFT Marketplace Backend - ICRC-8 Compliant
//! 
//! This module provides a modular, ICRC-8 compliant NFT marketplace implementation
//! for the Internet Computer blockchain.

use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::*;
use std::collections::HashMap;

// Re-export main types for easy access
pub use types::*;
pub use marketplace::Marketplace;
pub use errors::MarketplaceError;

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

// Global state
static mut MARKETPLACE: Option<Marketplace> = None;

fn get_marketplace() -> &'static mut Marketplace {
    unsafe {
        if MARKETPLACE.is_none() {
            MARKETPLACE = Some(Marketplace::new());
        }
        MARKETPLACE.as_mut().unwrap()
    }
}

// ICRC-8 Interface Implementation

#[update]
pub async fn icrc8_ask(requests: Vec<Option<ManageAskRequest>>) -> Vec<(Option<ManageAskRequest>, Option<ManageAskResponse>)> {
    let marketplace = get_marketplace();
    marketplace.handle_ask_requests(requests).await
}

#[update]
pub async fn icrc8_bid(requests: Vec<Option<ManageBidRequest>>) -> Vec<(Option<ManageBidRequest>, Option<ManageBidResponse>)> {
    let marketplace = get_marketplace();
    marketplace.handle_bid_requests(requests).await
}

#[query]
pub async fn icrc8_balance_of(request: Vec<(Account, Option<Vec<Option<BalanceRequest>>>)>) -> Vec<(Account, Vec<BalanceResult>)> {
    let marketplace = get_marketplace();
    marketplace.get_balance_of(request).await
}

#[query]
pub async fn icrc8_ask_info(requests: Vec<Option<AskInfoRequest>>) -> Vec<(Option<AskInfoRequest>, Option<AskInfoResponse>)> {
    let marketplace = get_marketplace();
    marketplace.get_ask_info(requests).await
}

#[composite_query]
pub async fn icrc8_approved_tokens() -> Option<Vec<Principal>> {
    let marketplace = get_marketplace();
    marketplace.get_approved_tokens().await
}

// Metadata and configuration
#[query]
pub async fn get_metadata() -> Vec<(String, String)> {
    let marketplace = get_marketplace();
    marketplace.get_metadata().await
}

#[update]
pub async fn set_metadata(key: String, value: String) -> Result<(), MarketplaceError> {
    let marketplace = get_marketplace();
    marketplace.set_metadata(key, value).await
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
    marketplace.save_state();
}

// Post-upgrade hook for state restoration
#[post_upgrade]
pub fn post_upgrade() {
    // Restore state from stable memory
    let marketplace = get_marketplace();
    marketplace.load_state();
    ic_cdk::println!("NFT Marketplace state restored");
}

// Export candid interface
ic_cdk::export_candid!();
