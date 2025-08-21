use candid::Principal;

use crate::errors::Error;
use crate::storage::Database;
use crate::types::{User, UserUpdate};

// Validation functions
fn validate_username(username: &str) -> Result<(), Error> {
    if username.len() < 3 || username.len() > 12 {
        return Err(Error::InvalidInput("Username must be between 3 and 12 characters".to_string()));
    }
    
    if !username.chars().all(|c| c.is_alphanumeric() || c == '_') {
        return Err(Error::InvalidInput("Username can only contain letters, numbers, and underscores".to_string()));
    }
    
    Ok(())
}

fn validate_display_name(display_name: &str) -> Result<(), Error> {
    if display_name.len() > 50 {
        return Err(Error::InvalidInput("Display name must be 50 characters or less".to_string()));
    }
    Ok(())
}

fn validate_bio(bio: &str) -> Result<(), Error> {
    if bio.len() > 160 {
        return Err(Error::InvalidInput("Bio must be 160 characters or less".to_string()));
    }
    Ok(())
}

fn validate_location(location: &str) -> Result<(), Error> {
    if location.len() > 30 {
        return Err(Error::InvalidInput("Location must be 30 characters or less".to_string()));
    }
    Ok(())
}

fn validate_website(website: &str) -> Result<(), Error> {
    if website.len() > 100 {
        return Err(Error::InvalidInput("Website must be 100 characters or less".to_string()));
    }
    
    if !website.starts_with("https://") {
        return Err(Error::InvalidInput("Website must start with https://".to_string()));
    }
    
    Ok(())
}

// Handler functions
pub async fn signup(caller: Principal, username: String) -> Result<User, Error> {
    // Validate username
    validate_username(&username)?;
    
    // Check if user already exists
    if let Some(_) = Database::get_user(caller) {
        return Err(Error::InvalidInput("User already exists".to_string()));
    }
    
    // Check if username is taken
    if Database::username_exists(&username) {
        return Err(Error::UsernameTaken);
    }
    
    // Create new user
    let user = User::new(caller, username);
    Database::insert_user(user.clone());
    
    Ok(user)
}

pub fn get_user(principal: Principal) -> Result<User, Error> {
    Database::get_user(principal)
        .ok_or(Error::UserNotFound)
}

pub fn get_user_by_username(username: String) -> Result<User, Error> {
    Database::get_user_by_username(&username)
        .ok_or(Error::UserNotFound)
}

pub async fn update_profile(caller: Principal, update: UserUpdate) -> Result<User, Error> {
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    // Validate individual fields if provided
    if let Some(ref display_name) = update.display_name {
        validate_display_name(display_name)?;
    }
    
    if let Some(ref bio) = update.bio {
        validate_bio(bio)?;
    }
    
    if let Some(ref location) = update.location {
        validate_location(location)?;
    }
    
    if let Some(ref website) = update.website {
        validate_website(website)?;
    }
    
    // Apply updates
    user.update(update);
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_display_name(caller: Principal, display_name: String) -> Result<User, Error> {
    validate_display_name(&display_name)?;
    
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.display_name = Some(display_name);
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_bio(caller: Principal, bio: String) -> Result<User, Error> {
    validate_bio(&bio)?;
    
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.bio = Some(bio);
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_avatar(caller: Principal, avatar_url: String) -> Result<User, Error> {
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.avatar_url = Some(avatar_url);
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_location(caller: Principal, location: String) -> Result<User, Error> {
    validate_location(&location)?;
    
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.location = Some(location);
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_website(caller: Principal, website: String) -> Result<User, Error> {
    validate_website(&website)?;
    
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.website = Some(website);
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub async fn update_wallet(caller: Principal, address: String, wallet_type: String) -> Result<User, Error> {
    let mut user = Database::get_user(caller)
        .ok_or(Error::UserNotFound)?;
    
    user.wallet_address = Some(address);
    user.wallet_type = wallet_type;
    user.updated_at = ic_cdk::api::time();
    Database::update_user(user.clone());
    
    Ok(user)
}

pub fn search_users(query: String, limit: u32) -> Result<Vec<User>, Error> {
    if query.len() < 2 {
        return Ok(Vec::new());
    }
    
    let max_limit = limit.min(50); // Cap at 50 results
    let results = Database::search_users(&query, max_limit);
    
    Ok(results)
}

pub fn is_username_available(username: String) -> bool {
    if let Err(_) = validate_username(&username) {
        return false;
    }
    
    !Database::username_exists(&username)
}

pub fn get_user_count() -> u64 {
    Database::get_user_count()
}
