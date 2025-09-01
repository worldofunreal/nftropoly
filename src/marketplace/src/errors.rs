//! Error types for the NFT Marketplace
//!
//! This module defines all error types used throughout the marketplace.

use candid::{CandidType, Deserialize};
use serde::Serialize;
use thiserror::Error;

/// Main marketplace error type
#[derive(Error, Debug, Clone, CandidType, Deserialize, Serialize)]
pub enum MarketplaceError {
    #[error("Unauthorized access: {0}")]
    Unauthorized(String),

    #[error("Invalid price: {0}")]
    InvalidPrice(String),

    #[error("Token specification not supported")]
    TokenSpecNotSupported,

    #[error("Token not found")]
    TokenNotFound,

    #[error("Not the owner of the token")]
    NotOwner,

    #[error("Not ICRC-7 compliant")]
    NotICRC7Compliant,

    #[error("Ask not active")]
    AskNotActive,

    #[error("Unsupported operation")]
    UnsupportedOperation,

    #[error("Invalid fee percentage")]
    InvalidFeePercentage,

    #[error("Cannot buy own NFT")]
    CannotBuyOwnNFT,

    #[error("Ask not found")]
    AskNotFound,

    #[error("Ask is not in open state")]
    AskNotOpen,

    #[error("Only seller can end the ask")]
    OnlySellerCanEndAsk,

    #[error("Ask is not open for bids")]
    AskNotOpenForBids,

    #[error("Missing required token_id feature")]
    MissingTokenIdFeature,

    #[error("Missing required buy_now feature")]
    MissingBuyNowFeature,

    #[error("Invalid ask features")]
    InvalidAskFeatures,

    #[error("Escrow not found")]
    EscrowNotFound,

    #[error("Insufficient balance: {0}")]
    InsufficientBalance(String),

    #[error("Transfer failed: {0}")]
    TransferFailed(String),

    #[error("Insufficient approval: {0}")]
    InsufficientApproval(String),

    #[error("Settlement failed")]
    SettlementFailed,

    #[error("Engine match failed")]
    EngineMatchFailed,

    #[error("Encumbrance failed")]
    EncumbranceFailed,

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Invalid state: {0}")]
    InvalidState(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Partial settlement: {0}")]
    PartialSettlement(String),

    #[error("Max retries exceeded: {0}")]
    MaxRetriesExceeded(String),

    #[error("Retry too soon: {0}")]
    RetryTooSoon(String),
}

/// Generic error type for ICRC-8 compatibility
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct GenericError {
    pub code: u64,
    pub message: String,
}

impl From<MarketplaceError> for GenericError {
    fn from(error: MarketplaceError) -> Self {
        let (code, message) = match error {
            MarketplaceError::Unauthorized(_) => (401, "Unauthorized access"),
            MarketplaceError::InvalidPrice(_) => (400, "Invalid price"),
            MarketplaceError::TokenSpecNotSupported => (400, "Token specification not supported"),
            MarketplaceError::TokenNotFound => (404, "Token not found"),
            MarketplaceError::NotOwner => (403, "Not the owner of the token"),
            MarketplaceError::NotICRC7Compliant => (400, "Not ICRC-7 compliant"),
            MarketplaceError::AskNotActive => (400, "Ask not active"),
            MarketplaceError::UnsupportedOperation => (501, "Unsupported operation"),
            MarketplaceError::InvalidFeePercentage => (400, "Invalid fee percentage"),
            MarketplaceError::CannotBuyOwnNFT => (400, "Cannot buy own NFT"),
            MarketplaceError::AskNotFound => (404, "Ask not found"),
            MarketplaceError::AskNotOpen => (400, "Ask is not in open state"),
            MarketplaceError::OnlySellerCanEndAsk => (403, "Only seller can end the ask"),
            MarketplaceError::AskNotOpenForBids => (400, "Ask is not open for bids"),
            MarketplaceError::MissingTokenIdFeature => (400, "Missing required token_id feature"),
            MarketplaceError::MissingBuyNowFeature => (400, "Missing required buy_now feature"),
            MarketplaceError::InvalidAskFeatures => (400, "Invalid ask features"),
            MarketplaceError::EscrowNotFound => (404, "Escrow not found"),
            MarketplaceError::InsufficientBalance(_) => (400, "Insufficient balance"),
            MarketplaceError::TransferFailed(_) => (500, "Transfer failed"),
            MarketplaceError::InsufficientApproval(_) => (403, "Insufficient approval"),
            MarketplaceError::SettlementFailed => (500, "Settlement failed"),
            MarketplaceError::EngineMatchFailed => (500, "Engine match failed"),
            MarketplaceError::EncumbranceFailed => (500, "Encumbrance failed"),
            MarketplaceError::Internal(_) => (500, "Internal error"),
            MarketplaceError::InvalidInput(_) => (400, "Invalid input"),
            MarketplaceError::InvalidState(_) => (400, "Invalid state"),
            MarketplaceError::NotFound(_) => (404, "Not found"),
            MarketplaceError::PartialSettlement(_) => (500, "Partial settlement"),
            MarketplaceError::MaxRetriesExceeded(_) => (500, "Max retries exceeded"),
            MarketplaceError::RetryTooSoon(_) => (429, "Retry too soon"),
        };

        GenericError {
            code,
            message: message.to_string(),
        }
    }
}

/// Result type for marketplace operations
pub type MarketplaceResult<T> = Result<T, MarketplaceError>;

/// Result wrapper for compatibility with existing code
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub enum ResultWrapper<T, E> {
    Ok(T),
    Err(E),
}

impl<T, E> ResultWrapper<T, E> {
    pub fn ok(value: T) -> Self {
        ResultWrapper::Ok(value)
    }

    pub fn err(error: E) -> Self {
        ResultWrapper::Err(error)
    }

    pub fn is_ok(&self) -> bool {
        matches!(self, ResultWrapper::Ok(_))
    }

    pub fn is_err(&self) -> bool {
        matches!(self, ResultWrapper::Err(_))
    }

    pub fn unwrap(self) -> T {
        match self {
            ResultWrapper::Ok(value) => value,
            ResultWrapper::Err(_) => panic!("Called unwrap on an Err value"),
        }
    }

    pub fn unwrap_err(self) -> E {
        match self {
            ResultWrapper::Ok(_) => panic!("Called unwrap_err on an Ok value"),
            ResultWrapper::Err(error) => error,
        }
    }
}
