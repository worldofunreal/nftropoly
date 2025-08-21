use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::Serialize;
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Clone, Debug, Serialize)]
pub struct User {
    pub id: Principal,
    pub username: String,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub location: Option<String>,
    pub website: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub is_verified: bool,
    pub wallet_address: Option<String>,
    pub wallet_type: String,
}

impl Storable for User {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    
    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(&self).unwrap()
    }
    
    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserUpdate {
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub location: Option<String>,
    pub website: Option<String>,
    pub wallet_address: Option<String>,
    pub wallet_type: Option<String>,
}

impl User {
    pub fn new(id: Principal, username: String) -> Self {
        let now = ic_cdk::api::time();
        Self {
            id,
            username,
            display_name: None,
            bio: None,
            avatar_url: None,
            location: None,
            website: None,
            created_at: now,
            updated_at: now,
            is_verified: false,
            wallet_address: None,
            wallet_type: "unknown".to_string(),
        }
    }

    pub fn update(&mut self, update: UserUpdate) {
        if let Some(display_name) = update.display_name {
            self.display_name = Some(display_name);
        }
        if let Some(bio) = update.bio {
            self.bio = Some(bio);
        }
        if let Some(avatar_url) = update.avatar_url {
            self.avatar_url = Some(avatar_url);
        }
        if let Some(location) = update.location {
            self.location = Some(location);
        }
        if let Some(website) = update.website {
            self.website = Some(website);
        }
        if let Some(wallet_address) = update.wallet_address {
            self.wallet_address = Some(wallet_address);
        }
        if let Some(wallet_type) = update.wallet_type {
            self.wallet_type = wallet_type;
        }
        self.updated_at = ic_cdk::api::time();
    }
}
