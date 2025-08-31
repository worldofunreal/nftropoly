//! NFT Marketplace Backend - ICRC-8 Compliant
//!
//! This module provides a modular, ICRC-8 compliant NFT marketplace implementation
//! for the Internet Computer blockchain.

use candid::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;

// Re-export main types for easy access
pub use errors::MarketplaceError;
pub use marketplace::Marketplace;
pub use types::*;

pub mod amm;
pub mod auctions;
pub mod errors;
pub mod escrow;
pub mod fees;
pub mod icrc_client;
pub mod kyc;
pub mod marketplace;
pub mod notifications;
pub mod storage;
pub mod types;
pub mod utils;

// Global state
thread_local! {
    static MARKETPLACE: RefCell<Option<Marketplace>> = RefCell::new(None);
}

// ICRC-8 Interface Implementation

#[update]
pub async fn icrc8_ask(
    requests: Vec<Option<ManageAskRequest>>,
) -> Vec<(Option<ManageAskRequest>, Option<ManageAskResponse>)> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let mut marketplace = marketplace.unwrap();
    let result = marketplace.handle_ask_requests(requests).await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

#[update]
pub async fn icrc8_bid(
    requests: Vec<Option<ManageBidRequest>>,
) -> Vec<(Option<ManageBidRequest>, Option<ManageBidResponse>)> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let mut marketplace = marketplace.unwrap();
    let result = marketplace.handle_bid_requests(requests).await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

#[query]
pub async fn icrc8_balance_of(
    request: Vec<(Account, Option<Vec<Option<BalanceRequest>>>)>,
) -> Vec<(Account, Vec<BalanceResult>)> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let marketplace = marketplace.unwrap();
    let result = marketplace.get_balance_of(request).await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

#[query]
pub async fn icrc8_ask_info(
    requests: Vec<Option<AskInfoRequest>>,
) -> Vec<(Option<AskInfoRequest>, Option<AskInfoResponse>)> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let marketplace = marketplace.unwrap();
    let result = marketplace.get_ask_info(requests).await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

#[query]
pub async fn icrc8_approved_tokens() -> Option<Vec<Principal>> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let marketplace = marketplace.unwrap();
    let result = marketplace.get_approved_tokens().await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

// Metadata and configuration
#[query]
pub async fn get_metadata() -> Vec<(String, String)> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let marketplace = marketplace.unwrap();
    let result = marketplace.get_metadata().await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
}

#[update]
pub async fn set_metadata(key: String, value: String) -> Result<(), MarketplaceError> {
    let mut marketplace = None;
    MARKETPLACE.with(|m| {
        let mut m = m.borrow_mut();
        if m.is_none() {
            *m = Some(Marketplace::new());
        }
        marketplace = m.take();
    });

    let mut marketplace = marketplace.unwrap();
    let result = marketplace.set_metadata(key, value).await;

    MARKETPLACE.with(|m| {
        *m.borrow_mut() = Some(marketplace);
    });

    result
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
    MARKETPLACE.with(|marketplace| {
        let marketplace = marketplace.borrow();
        let marketplace = marketplace.as_ref().expect("Marketplace not initialized");
        // Save state to stable memory
        marketplace.save_state();
    });
}

// Post-upgrade hook for state restoration
#[post_upgrade]
pub fn post_upgrade() {
    MARKETPLACE.with(|marketplace| {
        let mut marketplace = marketplace.borrow_mut();
        if marketplace.is_none() {
            *marketplace = Some(Marketplace::new());
        }
        let marketplace = marketplace.as_mut().unwrap();
        // Restore state from stable memory
        marketplace.load_state();
        ic_cdk::println!("NFT Marketplace state restored");
    });
}

// Export candid interface
ic_cdk::export_candid!();
