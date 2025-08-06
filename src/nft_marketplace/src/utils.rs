//! Utility functions for the NFT Marketplace
//! 
//! This module provides common utility functions used throughout the marketplace.

use candid::{CandidType, Deserialize, Principal};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::collections::HashMap;

use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};

/// Generate a unique ID
pub fn generate_id() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

/// Validate principal format
pub fn validate_principal(principal_text: &str) -> MarketplaceResult<Principal> {
    Principal::from_text(principal_text).map_err(|_| {
        MarketplaceError::Internal(format!("Invalid principal format: {}", principal_text))
    })
}

/// Validate account format
pub fn validate_account(owner: Principal, sub_account: Option<Vec<u8>>) -> MarketplaceResult<Account> {
    Ok(Account {
        owner,
        sub_account,
    })
}

/// Extract token details from ask features
pub fn extract_token_details(ask: &AskStatus) -> MarketplaceResult<(Principal, Option<u64>, u64)> {
    let mut collection_id = Principal::anonymous();
    let mut token_id = None;
    let mut price = 0;
    
    for feature in &ask.config {
        match feature {
            AskFeature::AskToken(token_specs) => {
                if let Some(Some(spec)) = token_specs.first() {
                    collection_id = spec.canister;
                    
                    for standard in &spec.standards {
                        match standard {
                            ICRCStandards::ICRC7(Some(details)) => {
                                token_id = details.token_id;
                            }
                            _ => {}
                        }
                    }
                }
            }
            AskFeature::BuyNow(buy_now_options) => {
                if let Some(Some(buy_now)) = buy_now_options.first().and_then(|v| v.first()) {
                    price = buy_now.amount;
                }
            }
            _ => {}
        }
    }
    
    Ok((collection_id, token_id, price))
}

/// Create ask features for an NFT listing
pub fn create_ask_features(
    collection_id: Principal,
    token_id: u64,
    price: u64,
    broker: Option<Account>,
    allow_list: Option<Vec<Account>>,
    start_date: Option<u64>,
    ending: Option<EndingType>,
    fee_schema: Option<String>,
    memo: Option<Vec<u8>>,
) -> Vec<AskFeature> {
    let mut features = Vec::new();
    
    // Create NFT token specification
    let token_spec = TokenSpec {
        canister: collection_id,
        symbol: "NFT".to_string(),
        standards: vec![ICRCStandards::ICRC7(Some(ICRC7TokenSpecDetail {
            fee: None,
            token_id: Some(token_id),
        }))],
    };
    
    // Create buy now token specification (using ICP)
    let buy_now_req = BuyNowReq {
        token: TokenSpec {
            canister: Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap(), // ICP Ledger
            symbol: "ICP".to_string(),
            standards: vec![ICRCStandards::ICRC1(Some(ICRC1TokenSpecDetail {
                amount: price,
                fee: None,
                decimals: 8,
            }))],
        },
        amount: price,
    };
    
    // Add required features
    features.push(AskFeature::AskToken(vec![Some(token_spec)]));
    features.push(AskFeature::BuyNow(vec![vec![buy_now_req]]));
    features.push(AskFeature::CreatedAt(generate_id()));
    
    // Add optional features
    if let Some(broker) = broker {
        features.push(AskFeature::Broker(broker));
    }
    
    if let Some(allow_list) = allow_list {
        features.push(AskFeature::AllowList(allow_list));
    }
    
    if let Some(start_date) = start_date {
        features.push(AskFeature::StartDate(start_date));
    }
    
    // Add ending if provided, otherwise default timeout
    match ending {
        Some(ending_type) => {
            features.push(AskFeature::Ending(ending_type));
        }
        None => {
            features.push(AskFeature::Ending(EndingType::Timeout(
                7 * 24 * 60 * 60 * 1_000_000_000, // 7 days in nanoseconds
            )));
        }
    }
    
    // Add fee schema if provided, otherwise default
    features.push(AskFeature::FeeSchema(
        fee_schema.unwrap_or_else(|| "standard".to_string())
    ));
    
    // Add memo if provided
    if let Some(memo) = memo {
        features.push(AskFeature::Memo(memo));
    }
    
    features
}

/// Calculate hash for a token key
pub fn token_key_hash(collection_id: Principal, token_id: u64) -> u32 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    collection_id.hash(&mut hasher);
    token_id.hash(&mut hasher);
    
    hasher.finish() as u32
}

/// Validate price
pub fn validate_price(price: u64) -> MarketplaceResult<()> {
    if price == 0 {
        return Err(MarketplaceError::InvalidPrice("Price cannot be zero".to_string()));
    }
    Ok(())
}

/// Format price for display
pub fn format_price(price: u64, decimals: u8) -> String {
    let divisor = 10_u64.pow(decimals as u32);
    let whole = price / divisor;
    let fraction = price % divisor;
    
    if fraction == 0 {
        format!("{}", whole)
    } else {
        format!("{}.{:0width$}", whole, fraction, width = decimals as usize)
    }
}

/// Parse price from string
pub fn parse_price(price_str: &str, decimals: u8) -> MarketplaceResult<u64> {
    let parts: Vec<&str> = price_str.split('.').collect();
    
    match parts.as_slice() {
        [whole] => {
            let whole: u64 = whole.parse().map_err(|_| {
                MarketplaceError::InvalidPrice("Invalid price format".to_string())
            })?;
            Ok(whole * 10_u64.pow(decimals as u32))
        }
        [whole, fraction] => {
            let whole: u64 = whole.parse().map_err(|_| {
                MarketplaceError::InvalidPrice("Invalid price format".to_string())
            })?;
            
            if fraction.len() > decimals as usize {
                return Err(MarketplaceError::InvalidPrice("Too many decimal places".to_string()));
            }
            
            let fraction: u64 = format!("{:0<width$}", fraction, width = decimals as usize)
                .parse()
                .map_err(|_| {
                    MarketplaceError::InvalidPrice("Invalid price format".to_string())
                })?;
            
            Ok(whole * 10_u64.pow(decimals as u32) + fraction)
        }
        _ => Err(MarketplaceError::InvalidPrice("Invalid price format".to_string())),
    }
}

/// Check if a principal is authorized
pub fn is_authorized(caller: Principal, authorized: Principal) -> bool {
    caller == authorized
}

/// Check if a principal is in an allow list
pub fn is_in_allow_list(caller: Principal, allow_list: &[Account]) -> bool {
    allow_list.iter().any(|account| account.owner == caller)
}

/// Get current timestamp in nanoseconds
pub fn current_timestamp() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

/// Check if a timestamp is in the future
pub fn is_future_timestamp(timestamp: u64) -> bool {
    timestamp > current_timestamp()
}

/// Check if a timestamp has expired
pub fn is_expired_timestamp(timestamp: u64) -> bool {
    timestamp < current_timestamp()
}

/// Calculate time remaining until expiration
pub fn time_until_expiration(expiration_timestamp: u64) -> Option<u64> {
    let current = current_timestamp();
    if expiration_timestamp > current {
        Some(expiration_timestamp - current)
    } else {
        None
    }
}
