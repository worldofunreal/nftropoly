use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::canister_self;
use ic_cdk::call::Call;
use crate::errors::MarketplaceError;

// ============================================================================
// ICRC-2 TOKEN FUNCTIONS (Payment Tokens)
// ============================================================================

#[derive(CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize)]
pub struct TransferFromArgs {
    pub spender_subaccount: Option<Vec<u8>>,
    pub from: Account,
    pub to: Account,
    pub amount: u128,
    pub fee: Option<u128>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferFromResult {
    Ok(u128), // BlockIndex
    Err(TransferFromError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum TransferFromError {
    BadFee { expected_fee: u128 },
    BadBurn { min_burn_amount: u128 },
    InsufficientFunds { balance: u128 },
    InsufficientAllowance { allowance: u128 },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    TemporarilyUnavailable,
    Duplicate { duplicate_of: u64 },
    GenericError { error_code: u128, message: String },
}

/// Pull ICRC-2 tokens from user to marketplace escrow
pub async fn pull_icrc2_tokens(
    token_canister: Principal,
    from: Principal,
    amount: u128,
) -> Result<u128, MarketplaceError> {
    let marketplace_principal = canister_self();
    
    let transfer_from_args = TransferFromArgs {
        spender_subaccount: None,
        from: Account { owner: from, subaccount: None },
        to: Account { owner: marketplace_principal, subaccount: None },
        amount,
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let result: (TransferFromResult,) = Call::unbounded_wait(token_canister, "icrc2_transfer_from")
        .with_arg(transfer_from_args)
        .await
        .map_err(|e| MarketplaceError::TransferFailed(format!("ICRC-2 transfer failed: {:?}", e)))?
        .candid_tuple()
        .map_err(|e| MarketplaceError::TransferFailed(format!("Failed to decode response: {:?}", e)))?;
    
    match result.0 {
        TransferFromResult::Ok(block_index) => {
            ic_cdk::println!("✅ Successfully pulled {} ICRC-2 tokens from user {}", amount, from);
            Ok(block_index)
        }
        TransferFromResult::Err(TransferFromError::InsufficientAllowance { allowance }) => {
            Err(MarketplaceError::InsufficientApproval(
                format!("Insufficient ICRC-2 allowance. User must approve marketplace to spend tokens. Current allowance: {}", allowance)
            ))
        }
        TransferFromResult::Err(TransferFromError::InsufficientFunds { balance }) => {
            Err(MarketplaceError::InsufficientBalance(
                format!("Insufficient token balance. User balance: {}", balance)
            ))
        }
        TransferFromResult::Err(TransferFromError::GenericError { error_code, message }) => {
            Err(MarketplaceError::TransferFailed(
                format!("ICRC-2 transfer error {}: {}", error_code, message)
            ))
        }
        TransferFromResult::Err(e) => {
            Err(MarketplaceError::TransferFailed(
                format!("ICRC-2 transfer failed: {:?}", e)
            ))
        }
    }
}

/// Push ICRC-2 tokens from marketplace to user
pub async fn push_icrc2_tokens(
    token_canister: Principal,
    to: Principal,
    amount: u128,
) -> Result<u128, MarketplaceError> {
    let marketplace_principal = canister_self();
    
    let transfer_args = TransferFromArgs {
        spender_subaccount: None,
        from: Account { owner: marketplace_principal, subaccount: None },
        to: Account { owner: to, subaccount: None },
        amount,
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let result: (TransferFromResult,) = Call::unbounded_wait(token_canister, "icrc2_transfer_from")
        .with_arg(transfer_args)
        .await
        .map_err(|e| MarketplaceError::TransferFailed(format!("ICRC-2 transfer failed: {:?}", e)))?
        .candid_tuple()
        .map_err(|e| MarketplaceError::TransferFailed(format!("Failed to decode response: {:?}", e)))?;
    
    match result.0 {
        TransferFromResult::Ok(block_index) => {
            ic_cdk::println!("✅ Successfully pushed {} ICRC-2 tokens to user {}", amount, to);
            Ok(block_index)
        }
        TransferFromResult::Err(TransferFromError::InsufficientFunds { balance }) => {
            Err(MarketplaceError::InsufficientBalance(
                format!("Insufficient marketplace token balance. Balance: {}", balance)
            ))
        }
        TransferFromResult::Err(TransferFromError::GenericError { error_code, message }) => {
            Err(MarketplaceError::TransferFailed(
                format!("ICRC-2 transfer error {}: {}", error_code, message)
            ))
        }
        TransferFromResult::Err(e) => {
            Err(MarketplaceError::TransferFailed(
                format!("ICRC-2 transfer failed: {:?}", e)
            ))
        }
    }
}

// ============================================================================
// ICRC-37 NFT FUNCTIONS
// ============================================================================

// Use the same TransferFromArg as the NFT collection
#[derive(CandidType, Deserialize)]
pub struct TransferFromArg {
    pub to: Account,
    pub spender_subaccount: Option<Vec<u8>>,
    pub token_id: candid::Nat,
    pub from: Account,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ICRC37TransferFromResult {
    Ok(u128), // BlockIndex
    Err(ICRC37TransferFromError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ICRC37TransferFromError {
    BadFee { expected_fee: u128 },
    BadBurn { min_burn_amount: u128 },
    InsufficientFunds { balance: u128 },
    InsufficientAllowance { allowance: u128 },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    TemporarilyUnavailable,
    Duplicate { duplicate_of: u64 },
    GenericError { error_code: u128, message: String },
}

/// Pull ICRC-37 NFTs from user to marketplace escrow
pub async fn pull_icrc37_nfts(
    nft_canister: Principal,
    from: Principal,
    token_ids: Vec<u64>,
) -> Result<u128, MarketplaceError> {
    let marketplace_principal = canister_self();
    
    // Create a vector of transfer arguments (one per token)
    let mut transfer_args = Vec::new();
    for token_id in token_ids {
        let transfer_arg = TransferFromArg {
            to: Account { owner: marketplace_principal, subaccount: None },
            spender_subaccount: None,
            token_id: candid::Nat::from(token_id),
            from: Account { owner: from, subaccount: None },
            memo: None,
            created_at_time: None,
        };
        transfer_args.push(transfer_arg);
    }
    
    let result: (Result<Vec<Option<ICRC37TransferFromResult>>, ICRC37TransferFromError>,) = Call::unbounded_wait(nft_canister, "icrc37_transfer_from")
        .with_arg(transfer_args)
        .await
        .map_err(|e| MarketplaceError::TransferFailed(format!("ICRC-37 transfer failed: {:?}", e)))?
        .candid_tuple()
        .map_err(|e| MarketplaceError::TransferFailed(format!("Failed to decode response: {:?}", e)))?;
    
    // Handle the response which is Result<Vec<Option<TransferFromResult>>, TransferFromError>
    match result.0 {
        Ok(transfer_results) => {
            // Handle the vector of transfer results
            if let Some(response) = transfer_results.first() {
                if let Some(transfer_result) = response {
                    match transfer_result {
                        ICRC37TransferFromResult::Ok(block_index) => {
                            ic_cdk::println!("✅ Successfully pulled ICRC-37 NFTs from user {}", from);
                            Ok(*block_index)
                        }
                        ICRC37TransferFromResult::Err(ICRC37TransferFromError::InsufficientAllowance { allowance }) => {
                            Err(MarketplaceError::InsufficientApproval(
                                format!("Insufficient ICRC-37 allowance. User must approve marketplace to transfer NFTs. Current allowance: {}", allowance)
                            ))
                        }
                        ICRC37TransferFromResult::Err(ICRC37TransferFromError::InsufficientFunds { balance }) => {
                            Err(MarketplaceError::InsufficientBalance(
                                format!("Insufficient NFT balance. User balance: {}", balance)
                            ))
                        }
                        ICRC37TransferFromResult::Err(ICRC37TransferFromError::GenericError { error_code, message }) => {
                            Err(MarketplaceError::TransferFailed(
                                format!("ICRC-37 transfer error {}: {}", error_code, message)
                            ))
                        }
                        ICRC37TransferFromResult::Err(e) => {
                            Err(MarketplaceError::TransferFailed(
                                format!("ICRC-37 transfer failed: {:?}", e)
                            ))
                        }
                    }
                } else {
                    Err(MarketplaceError::TransferFailed("ICRC-37 transfer returned None".to_string()))
                }
            } else {
                Err(MarketplaceError::TransferFailed("ICRC-37 transfer returned empty response".to_string()))
            }
        }
        Err(transfer_error) => {
            Err(MarketplaceError::TransferFailed(
                format!("ICRC-37 transfer failed: {:?}", transfer_error)
            ))
        }
    }
}

/// Push ICRC-7 NFTs from marketplace to user
pub async fn push_icrc7_nfts(
    nft_canister: Principal,
    to: Principal,
    token_ids: Vec<u64>,
) -> Result<u128, MarketplaceError> {
    let _marketplace_principal = canister_self();
    
    // Create a vector of transfer arguments (one per token)
    let mut transfer_args = Vec::new();
    for token_id in token_ids {
        let transfer_arg = ICRC7TransferArg {
            to: Account { owner: to, subaccount: None },
            token_id: candid::Nat::from(token_id),
            memo: None,
            created_at_time: None,
        };
        transfer_args.push(transfer_arg);
    }
    
    let result: (Vec<Option<Result<candid::Nat, ICRC7TransferError>>>,) = Call::unbounded_wait(nft_canister, "icrc7_transfer")
        .with_arg(transfer_args)
        .await
        .map_err(|e| MarketplaceError::TransferFailed(format!("ICRC-7 transfer failed: {:?}", e)))?
        .candid_tuple()
        .map_err(|e| MarketplaceError::TransferFailed(format!("Failed to decode response: {:?}", e)))?;
    
    // Handle the response which is Vec<Option<Result<Nat, TransferError>>>
    if let Some(response) = result.0.first() {
        if let Some(transfer_result) = response {
            match transfer_result {
                Ok(block_index) => {
                    ic_cdk::println!("✅ Successfully pushed ICRC-7 NFTs to user {}", to);
                    Ok(u128::try_from(block_index.0.clone()).unwrap_or(0))
                }
                Err(ICRC7TransferError::InsufficientFunds { balance }) => {
                    Err(MarketplaceError::InsufficientBalance(
                        format!("Insufficient NFT balance. Marketplace balance: {}", balance)
                    ))
                }
                Err(ICRC7TransferError::GenericError { error_code, message }) => {
                    Err(MarketplaceError::TransferFailed(
                        format!("ICRC-7 transfer error {}: {}", error_code, message)
                    ))
                }
                Err(e) => {
                    Err(MarketplaceError::TransferFailed(
                        format!("ICRC-7 transfer failed: {:?}", e)
                    ))
                }
            }
        } else {
            Err(MarketplaceError::TransferFailed("ICRC-7 transfer returned None".to_string()))
        }
    } else {
        Err(MarketplaceError::TransferFailed("ICRC-7 transfer returned empty response".to_string()))
    }
}

// ICRC-7 transfer types
#[derive(CandidType, Deserialize)]
pub struct ICRC7TransferArg {
    pub to: Account,
    pub token_id: candid::Nat,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ICRC7TransferResult {
    Ok(u128), // BlockIndex
    Err(ICRC7TransferError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ICRC7TransferError {
    BadFee { expected_fee: u128 },
    BadBurn { min_burn_amount: u128 },
    InsufficientFunds { balance: u128 },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    TemporarilyUnavailable,
    Duplicate { duplicate_of: u128 },
    GenericError { error_code: u128, message: String },
}
