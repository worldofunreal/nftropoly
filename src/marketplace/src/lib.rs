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
    request: Vec<(Account, Option<BalanceRequest>)>,
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

// ICRC-10 Metadata (General Standards Support)
#[query]
pub async fn icrc10_supported_standards() -> Vec<SupportedStandard> {
    vec![
        SupportedStandard {
            name: "ICRC-1".to_string(),
            url: "https://github.com/dfinity/ICRC-1".to_string(),
        },
        SupportedStandard {
            name: "ICRC-2".to_string(),
            url: "https://github.com/dfinity/ICRC-2".to_string(),
        },
        SupportedStandard {
            name: "ICRC-4".to_string(),
            url: "https://github.com/dfinity/ICRC-4".to_string(),
        },
        SupportedStandard {
            name: "ICRC-7".to_string(),
            url: "https://github.com/dfinity/ICRC-7".to_string(),
        },
        SupportedStandard {
            name: "ICRC-37".to_string(),
            url: "https://github.com/dfinity/ICRC-37".to_string(),
        },
        SupportedStandard {
            name: "ICRC-8".to_string(),
            url: "https://github.com/dfinity/ICRC-8".to_string(),
        },
    ]
}

// ICRC-8 Metadata (Marketplace-Specific Configuration)
#[query]
pub async fn icrc8_metadata() -> Vec<ICRC8Metadata> {
    vec![
        ICRC8Metadata {
            key: "icrc8:approved_tokens".to_string(),
            value: "uqqxf-5h777-77774-qaaaa-cai,uzt4z-lp777-77774-qaabq-cai".to_string(), // NFT Collection, NTRP Token
        },
        ICRC8Metadata {
            key: "icrc8:supports_icrc_1".to_string(),
            value: "true".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:supports_icrc_2".to_string(),
            value: "true".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:supports_icrc_4".to_string(),
            value: "true".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:supports_icrc_7".to_string(),
            value: "true".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:supports_icrc_37".to_string(),
            value: "true".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:default_ask_timeout".to_string(),
            value: "86400000000000".to_string(), // 24 hours in nanoseconds
        },
        ICRC8Metadata {
            key: "icrc8:default_fee_schema".to_string(),
            value: "standard".to_string(),
        },
        ICRC8Metadata {
            key: "icrc8:default_auction_token".to_string(),
            value: "uzt4z-lp777-77774-qaabq-cai".to_string(), // NTRP Token as default auction currency
        },
        ICRC8Metadata {
            key: "icrc8:settlement_trustee".to_string(),
            value: "uqqxf-5h777-77774-qaaaa-cai".to_string(), // Marketplace canister as settlement trustee
        },
    ]
}

// Legacy Metadata Methods (for backward compatibility)
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
