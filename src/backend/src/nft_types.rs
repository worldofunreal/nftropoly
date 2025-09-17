use candid::{CandidType, Deserialize, Principal};

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MintArgs {
    pub token_name: String,
    pub token_description: Option<String>,
    pub token_image_url: Option<String>,
    pub token_attributes: Option<Vec<(String, String)>>,
    pub token_owner: Account,
    pub memo: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MintError {
    Unauthorized,
    InvalidInput(String),
    TokenAlreadyExists,
    ExceedMaxAllowedSupplyCap,
    ConcurrentManagementCall,
    StorageCanisterError(String),
    InvalidMemo,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum MintResponse {
    Ok(u64),
    Err(MintError),
}
