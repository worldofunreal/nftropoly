//! Storage management for the NFT Marketplace
//! 
//! This module handles all state management including stable storage for upgrades.

use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell, StableVec,
};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;

use crate::types::*;
use crate::errors::MarketplaceError;

// Memory IDs for different storage areas
const METADATA_MEMORY_ID: MemoryId = MemoryId::new(0);
const ASKS_MEMORY_ID: MemoryId = MemoryId::new(1);
const ESCROW_MEMORY_ID: MemoryId = MemoryId::new(2);
const USER_ASKS_MEMORY_ID: MemoryId = MemoryId::new(3);
const APPROVED_TOKENS_MEMORY_ID: MemoryId = MemoryId::new(4);
const ASK_HISTORY_MEMORY_ID: MemoryId = MemoryId::new(5);
const COLLECTIONS_MEMORY_ID: MemoryId = MemoryId::new(6);
const TRANSACTIONS_MEMORY_ID: MemoryId = MemoryId::new(7);

// Stable storage types
type StableMemory = VirtualMemory<DefaultMemoryImpl>;

/// Main storage structure
pub struct MarketplaceStorage {
    // Metadata
    pub owner: StableCell<Principal, StableMemory>,
    pub marketplace_fee_percentage: StableCell<u64, StableMemory>,
    pub next_ask_id: StableCell<u64, StableMemory>,
    pub next_escrow_id: StableCell<u64, StableMemory>,
    
    // Core data
    pub asks: StableBTreeMap<u64, AskStatus, StableMemory>,
    pub escrow_records: StableBTreeMap<u64, EscrowRecord, StableMemory>,
    pub user_asks: StableBTreeMap<Principal, Vec<u64>, StableMemory>,
    pub approved_tokens: StableVec<Principal, StableMemory>,
    pub ask_history: StableBTreeMap<u64, AskStatus, StableMemory>,
    pub collections: StableBTreeMap<Principal, Collection, StableMemory>,
    pub transactions: StableBTreeMap<u64, TransactionRecord, StableMemory>,
    
    // Runtime caches for better performance
    pub asks_cache: RefCell<HashMap<u64, AskStatus>>,
    pub escrow_cache: RefCell<HashMap<u64, EscrowRecord>>,
    pub user_asks_cache: RefCell<HashMap<Principal, Vec<u64>>>,
    pub approved_tokens_cache: RefCell<Vec<Principal>>,
    pub collections_cache: RefCell<HashMap<Principal, Collection>>,
}

impl MarketplaceStorage {
    pub fn new(memory_manager: &MemoryManager<DefaultMemoryImpl>) -> Self {
        Self {
            owner: StableCell::new(
                memory_manager.get(METADATA_MEMORY_ID),
                Principal::from_text("7mwdg-w6cvy-faabk-parwb-e4xuk-vxzcv-33uj2-2izcp-5x2qo-5s4ar-wqe").unwrap(),
            ),
            marketplace_fee_percentage: StableCell::new(
                memory_manager.get(METADATA_MEMORY_ID),
                250, // 2.5%
            ),
            next_ask_id: StableCell::new(
                memory_manager.get(METADATA_MEMORY_ID),
                1,
            ),
            next_escrow_id: StableCell::new(
                memory_manager.get(METADATA_MEMORY_ID),
                1,
            ),
            
            asks: StableBTreeMap::new(memory_manager.get(ASKS_MEMORY_ID)),
            escrow_records: StableBTreeMap::new(memory_manager.get(ESCROW_MEMORY_ID)),
            user_asks: StableBTreeMap::new(memory_manager.get(USER_ASKS_MEMORY_ID)),
            approved_tokens: StableVec::new(memory_manager.get(APPROVED_TOKENS_MEMORY_ID)),
            ask_history: StableBTreeMap::new(memory_manager.get(ASK_HISTORY_MEMORY_ID)),
            collections: StableBTreeMap::new(memory_manager.get(COLLECTIONS_MEMORY_ID)),
            transactions: StableBTreeMap::new(memory_manager.get(TRANSACTIONS_MEMORY_ID)),
            
            asks_cache: RefCell::new(HashMap::new()),
            escrow_cache: RefCell::new(HashMap::new()),
            user_asks_cache: RefCell::new(HashMap::new()),
            approved_tokens_cache: RefCell::new(Vec::new()),
            collections_cache: RefCell::new(HashMap::new()),
        }
    }
    
    // Ask management
    pub fn get_ask(&self, ask_id: u64) -> Option<AskStatus> {
        // Check cache first
        if let Some(ask) = self.asks_cache.borrow().get(&ask_id) {
            return Some(ask.clone());
        }
        
        // Check stable storage
        if let Some(ask) = self.asks.get(&ask_id) {
            self.asks_cache.borrow_mut().insert(ask_id, ask.clone());
            Some(ask)
        } else {
            None
        }
    }
    
    pub fn insert_ask(&self, ask_id: u64, ask: AskStatus) {
        self.asks.insert(ask_id, ask.clone());
        self.asks_cache.borrow_mut().insert(ask_id, ask);
    }
    
    pub fn remove_ask(&self, ask_id: u64) {
        self.asks.remove(&ask_id);
        self.asks_cache.borrow_mut().remove(&ask_id);
    }
    
    pub fn get_next_ask_id(&self) -> u64 {
        let id = self.next_ask_id.get();
        self.next_ask_id.set(id + 1);
        id
    }
    
    // Escrow management
    pub fn get_escrow(&self, escrow_id: u64) -> Option<EscrowRecord> {
        if let Some(escrow) = self.escrow_cache.borrow().get(&escrow_id) {
            return Some(escrow.clone());
        }
        
        if let Some(escrow) = self.escrow_records.get(&escrow_id) {
            self.escrow_cache.borrow_mut().insert(escrow_id, escrow.clone());
            Some(escrow)
        } else {
            None
        }
    }
    
    pub fn insert_escrow(&self, escrow_id: u64, escrow: EscrowRecord) {
        self.escrow_records.insert(escrow_id, escrow.clone());
        self.escrow_cache.borrow_mut().insert(escrow_id, escrow);
    }
    
    pub fn get_next_escrow_id(&self) -> u64 {
        let id = self.next_escrow_id.get();
        self.next_escrow_id.set(id + 1);
        id
    }
    
    // User asks management
    pub fn get_user_asks(&self, user: &Principal) -> Vec<u64> {
        if let Some(asks) = self.user_asks_cache.borrow().get(user) {
            return asks.clone();
        }
        
        if let Some(asks) = self.user_asks.get(user) {
            self.user_asks_cache.borrow_mut().insert(*user, asks.clone());
            asks
        } else {
            Vec::new()
        }
    }
    
    pub fn add_user_ask(&self, user: Principal, ask_id: u64) {
        let mut user_asks = self.get_user_asks(&user);
        user_asks.push(ask_id);
        self.user_asks.insert(user, user_asks.clone());
        self.user_asks_cache.borrow_mut().insert(user, user_asks);
    }
    
    pub fn remove_user_ask(&self, user: Principal, ask_id: u64) {
        let mut user_asks = self.get_user_asks(&user);
        user_asks.retain(|&id| id != ask_id);
        
        if user_asks.is_empty() {
            self.user_asks.remove(&user);
            self.user_asks_cache.borrow_mut().remove(&user);
        } else {
            self.user_asks.insert(user, user_asks.clone());
            self.user_asks_cache.borrow_mut().insert(user, user_asks);
        }
    }
    
    // Approved tokens management
    pub fn get_approved_tokens(&self) -> Vec<Principal> {
        if !self.approved_tokens_cache.borrow().is_empty() {
            return self.approved_tokens_cache.borrow().clone();
        }
        
        let tokens: Vec<Principal> = self.approved_tokens.iter().collect();
        self.approved_tokens_cache.borrow_mut().extend(tokens.clone());
        tokens
    }
    
    pub fn add_approved_token(&self, token: Principal) -> bool {
        let tokens = self.get_approved_tokens();
        if tokens.contains(&token) {
            return false;
        }
        
        self.approved_tokens.push(token);
        self.approved_tokens_cache.borrow_mut().push(token);
        true
    }
    
    pub fn is_token_approved(&self, token: &Principal) -> bool {
        self.get_approved_tokens().contains(token)
    }
    
    // Collections management
    pub fn get_collection(&self, collection_id: &Principal) -> Option<Collection> {
        if let Some(collection) = self.collections_cache.borrow().get(collection_id) {
            return Some(collection.clone());
        }
        
        if let Some(collection) = self.collections.get(collection_id) {
            self.collections_cache.borrow_mut().insert(*collection_id, collection.clone());
            Some(collection)
        } else {
            None
        }
    }
    
    pub fn insert_collection(&self, collection_id: Principal, collection: Collection) {
        self.collections.insert(collection_id, collection.clone());
        self.collections_cache.borrow_mut().insert(collection_id, collection);
    }
    
    pub fn get_all_collections(&self) -> Vec<Collection> {
        self.collections.iter().map(|(_, collection)| collection).collect()
    }
    
    // Transaction management
    pub fn insert_transaction(&self, transaction_id: u64, transaction: TransactionRecord) {
        self.transactions.insert(transaction_id, transaction);
    }
    
    // Metadata management
    pub fn get_owner(&self) -> Principal {
        self.owner.get()
    }
    
    pub fn set_owner(&self, owner: Principal) {
        self.owner.set(owner);
    }
    
    pub fn get_fee_percentage(&self) -> u64 {
        self.marketplace_fee_percentage.get()
    }
    
    pub fn set_fee_percentage(&self, fee_percentage: u64) {
        self.marketplace_fee_percentage.set(fee_percentage);
    }
    
    // Cache management
    pub fn clear_caches(&self) {
        self.asks_cache.borrow_mut().clear();
        self.escrow_cache.borrow_mut().clear();
        self.user_asks_cache.borrow_mut().clear();
        self.approved_tokens_cache.borrow_mut().clear();
        self.collections_cache.borrow_mut().clear();
    }
    
    // Ask history management
    pub fn add_to_history(&self, ask_id: u64, ask: AskStatus) {
        self.ask_history.insert(ask_id, ask);
    }
    
    pub fn get_from_history(&self, ask_id: u64) -> Option<AskStatus> {
        self.ask_history.get(&ask_id)
    }
    
    // Utility methods
    pub fn get_all_active_asks(&self) -> Vec<AskStatus> {
        self.asks
            .iter()
            .filter(|(_, ask)| matches!(ask.status, AskStatusType::Open))
            .map(|(_, ask)| ask)
            .collect()
    }
    
    pub fn get_user_ask_history(&self, user: &Principal) -> Vec<AskStatus> {
        self.ask_history
            .iter()
            .filter(|(_, ask)| ask.seller.owner == *user)
            .map(|(_, ask)| ask)
            .collect()
    }
}

// Additional types for storage
#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub struct Collection {
    pub id: Principal,
    pub name: String,
    pub symbol: String,
    pub is_verified: bool,
    pub created_at: u64,
    pub manager: Principal,
}

#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub struct TransactionRecord {
    pub id: u64,
    pub transaction_type: TransactionType,
    pub listing_id: u64,
    pub collection_id: Principal,
    pub token_id: u64,
    pub seller: Principal,
    pub buyer: Option<Principal>,
    pub price: u64,
    pub timestamp: u64,
    pub fee: u64,
}

#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub enum TransactionType {
    ListingCreated,
    ListingSold,
    ListingCancelled,
    CollectionRegistered,
    AskCreated,
    AskSettled,
    AskCancelled,
    BidPlaced,
    BidAccepted,
    BidCancelled,
}

// Global storage instance
thread_local! {
    static STORAGE: RefCell<Option<MarketplaceStorage>> = RefCell::new(None);
}

pub fn init_storage() {
    let memory_manager = MemoryManager::init(DefaultMemoryImpl::default());
    let storage = MarketplaceStorage::new(&memory_manager);
    STORAGE.with(|s| {
        *s.borrow_mut() = Some(storage);
    });
}

pub fn with_storage<F, R>(f: F) -> R
where
    F: FnOnce(&MarketplaceStorage) -> R,
{
    STORAGE.with(|storage| {
        let storage = storage.borrow();
        let storage = storage.as_ref().expect("Storage not initialized");
        f(storage)
    })
}

pub fn with_storage_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut MarketplaceStorage) -> R,
{
    STORAGE.with(|storage| {
        let mut storage = storage.borrow_mut();
        let storage = storage.as_mut().expect("Storage not initialized");
        f(storage)
    })
}
