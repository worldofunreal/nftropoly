use candid::Principal;
use ic_cdk::api::msg_caller;
use ic_cdk_macros::*;
use ic_stable_structures::{
    memory_manager::MemoryManager,
    DefaultMemoryImpl,
};
use std::cell::RefCell;

mod errors;
mod handlers;
mod storage;
mod types;

use errors::Error;
use storage::Database;
use types::*;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static DATABASE: RefCell<Database> = RefCell::new(Database::new());
}

// Canister lifecycle
#[init]
fn init() {
    // Initialize the database
    DATABASE.with(|db| {
        db.borrow_mut().init();
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    DATABASE.with(|db| {
        db.borrow().pre_upgrade();
    });
}

#[post_upgrade]
fn post_upgrade() {
    DATABASE.with(|db| {
        db.borrow_mut().post_upgrade();
    });
}

// Public API functions

#[update]
async fn signup(
    username: String, 
    evm_address: Option<String>, 
    bitcoin_address: Option<String>, 
    solana_address: Option<String>
) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::signup(caller, username, evm_address, bitcoin_address, solana_address).await
}

#[query]
fn get_user(principal: Principal) -> Result<User, Error> {
    handlers::get_user(principal)
}

#[query]
fn get_user_by_username(username: String) -> Result<User, Error> {
    handlers::get_user_by_username(username)
}

#[update]
async fn update_profile(update: UserUpdate) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_profile(caller, update).await
}

#[update]
async fn update_display_name(display_name: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_display_name(caller, display_name).await
}

#[update]
async fn update_bio(bio: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_bio(caller, bio).await
}

#[update]
async fn update_avatar(avatar_url: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_avatar(caller, avatar_url).await
}

#[update]
async fn update_location(location: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_location(caller, location).await
}

#[update]
async fn update_website(website: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_website(caller, website).await
}

#[update]
async fn update_evm_address(evm_address: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_evm_address(caller, evm_address).await
}

#[update]
async fn update_bitcoin_address(bitcoin_address: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_bitcoin_address(caller, bitcoin_address).await
}

#[update]
async fn update_solana_address(solana_address: String) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::update_solana_address(caller, solana_address).await
}

#[query]
fn search_users(query: String, limit: u32) -> Result<Vec<User>, Error> {
    handlers::search_users(query, limit)
}

#[query]
fn is_username_available(username: String) -> bool {
    handlers::is_username_available(username)
}

#[query]
fn get_user_count() -> u64 {
    handlers::get_user_count()
}

#[update]
async fn follow_user(target: Principal) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::follow_user(caller, target).await
}

#[update]
async fn unfollow_user(target: Principal) -> Result<User, Error> {
    let caller = msg_caller();
    if caller == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    
    handlers::unfollow_user(caller, target).await
}

#[query]
fn get_following(user: Principal) -> Vec<CompactProfile> {
    handlers::get_following(user)
}

#[query]
fn get_followers(user: Principal) -> Vec<CompactProfile> {
    handlers::get_followers(user)
}
