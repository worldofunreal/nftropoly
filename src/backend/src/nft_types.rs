use candid::{CandidType, Deserialize, Principal};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MintArgs {
    pub token_metadata_url: String,  // Required field for NFT canister
    pub memo: Option<Vec<u8>>,        // Must be blob, not String
    pub token_owner: Account,
    pub token_name: String,
}

// Use the exact types from the NFT canister declarations
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MintError {
    TokenAlreadyExists,
    StorageCanisterError(String),
    ExceedMaxAllowedSupplyCap,
    InvalidMemo,
    ConcurrentManagementCall,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MintResponse {
    Ok(candid::Nat),  // Returns token ID as nat (not u64!)
    Err(MintError),
}
