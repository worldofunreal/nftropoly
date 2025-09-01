//! Storage management for the NFT Marketplace
//!
//! This module handles all state management including stable storage for upgrades.

use candid::{CandidType, Deserialize, Principal};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, StableCell, StableVec, Storable,
};
use std::cell::RefCell;

use crate::types::*;

/// Runtime state that needs to be persisted across upgrades
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct RuntimeState {
    pub next_ask_id: u64,
    pub next_escrow_id: u64,
}

impl Default for RuntimeState {
    fn default() -> Self {
        Self {
            next_ask_id: 1,
            next_escrow_id: 1,
        }
    }
}

impl Storable for RuntimeState {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let bytes = candid::encode_one(self).expect("Failed to encode RuntimeState");
        std::borrow::Cow::Owned(bytes)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to decode RuntimeState")
    }

    fn into_bytes(self) -> std::vec::Vec<u8> {
        candid::encode_one(&self).expect("Failed to encode RuntimeState")
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

// Memory IDs for different storage areas
const ASKS_MEMORY_ID: MemoryId = MemoryId::new(0);
const ESCROW_RECORDS_MEMORY_ID: MemoryId = MemoryId::new(1);
const USER_ASKS_MEMORY_ID: MemoryId = MemoryId::new(2);
const APPROVED_TOKENS_MEMORY_ID: MemoryId = MemoryId::new(3);
const OWNER_MEMORY_ID: MemoryId = MemoryId::new(4);
const FEE_PERCENTAGE_MEMORY_ID: MemoryId = MemoryId::new(5);
const ASK_HISTORY_MEMORY_ID: MemoryId = MemoryId::new(6);
const RUNTIME_STATE_MEMORY_ID: MemoryId = MemoryId::new(7);

/// Stable storage for the marketplace
pub struct MarketplaceStorage {
    // ICRC-8 storage
    asks: StableBTreeMap<u64, AskStatus, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    escrow_records:
        StableBTreeMap<u64, EscrowRecord, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    user_asks:
        StableBTreeMap<Principal, AskIds, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    approved_tokens: StableVec<Principal, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    owner: StableCell<Principal, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    marketplace_fee_percentage:
        StableCell<u64, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    ask_history:
        StableBTreeMap<u64, AskStatus, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
    runtime_state: StableCell<RuntimeState, VirtualMemory<ic_stable_structures::DefaultMemoryImpl>>,
}

impl MarketplaceStorage {
    pub fn new(memory_manager: &MemoryManager<DefaultMemoryImpl>) -> Self {
        Self {
            asks: StableBTreeMap::new(memory_manager.get(ASKS_MEMORY_ID)),
            escrow_records: StableBTreeMap::new(memory_manager.get(ESCROW_RECORDS_MEMORY_ID)),
            user_asks: StableBTreeMap::new(memory_manager.get(USER_ASKS_MEMORY_ID)),
            approved_tokens: StableVec::new(memory_manager.get(APPROVED_TOKENS_MEMORY_ID)),
            owner: StableCell::new(memory_manager.get(OWNER_MEMORY_ID), Principal::anonymous()),
            marketplace_fee_percentage: StableCell::new(
                memory_manager.get(FEE_PERCENTAGE_MEMORY_ID),
                250,
            ), // 2.5%
            ask_history: StableBTreeMap::new(memory_manager.get(ASK_HISTORY_MEMORY_ID)),
            runtime_state: StableCell::new(memory_manager.get(RUNTIME_STATE_MEMORY_ID), RuntimeState::default()),
        }
    }

    // ICRC-8 Methods
    pub fn get_ask(&self, ask_id: u64) -> Option<AskStatus> {
        self.asks.get(&ask_id)
    }

    pub fn insert_ask(&mut self, ask_id: u64, ask: AskStatus) {
        self.asks.insert(ask_id, ask.clone());
    }

    pub fn remove_ask(&mut self, ask_id: u64) {
        self.asks.remove(&ask_id);
    }

    pub fn get_next_ask_id(&mut self) -> u64 {
        let mut state = self.runtime_state.get().clone();
        let id = state.next_ask_id;
        state.next_ask_id += 1;
        self.runtime_state.set(state);
        id
    }

    pub fn get_escrow_record(&self, escrow_id: u64) -> Option<EscrowRecord> {
        self.escrow_records.get(&escrow_id)
    }

    pub fn insert_escrow_record(&mut self, escrow_id: u64, escrow: EscrowRecord) {
        self.escrow_records.insert(escrow_id, escrow.clone());
    }

    pub fn get_next_escrow_id(&mut self) -> u64 {
        let mut state = self.runtime_state.get().clone();
        let id = state.next_escrow_id;
        state.next_escrow_id += 1;
        self.runtime_state.set(state);
        id
    }

    pub fn get_user_asks(&self, user: Principal) -> Vec<u64> {
        if let Some(asks) = self.user_asks.get(&user) {
            asks.0
        } else {
            Vec::new()
        }
    }

    pub fn add_user_ask(&mut self, user: Principal, ask_id: u64) {
        let mut user_asks = self.get_user_asks(user);
        user_asks.push(ask_id);
        self.user_asks.insert(user, AskIds(user_asks));
    }

    pub fn remove_user_ask(&mut self, user: Principal, ask_id: u64) {
        let mut user_asks = self.get_user_asks(user);
        user_asks.retain(|&id| id != ask_id);
        if user_asks.is_empty() {
            self.user_asks.remove(&user);
        } else {
            self.user_asks.insert(user, AskIds(user_asks));
        }
    }

    pub fn get_approved_tokens(&self) -> Vec<Principal> {
        let tokens: Vec<Principal> = self.approved_tokens.iter().collect();
        tokens
    }

    pub fn add_approved_token(&mut self, token: Principal) {
        self.approved_tokens.push(&token);
    }



    pub fn get_owner(&self) -> Principal {
        self.owner.get().clone()
    }

    pub fn set_owner(&mut self, owner: Principal) {
        self.owner.set(owner);
    }

    pub fn get_fee_percentage(&self) -> u64 {
        *self.marketplace_fee_percentage.get()
    }

    pub fn set_fee_percentage(&mut self, fee_percentage: u64) {
        self.marketplace_fee_percentage.set(fee_percentage);
    }

    pub fn add_ask_to_history(&mut self, ask_id: u64, ask: AskStatus) {
        self.ask_history.insert(ask_id, ask);
    }

    pub fn get_ask_from_history(&self, ask_id: u64) -> Option<AskStatus> {
        self.ask_history.get(&ask_id)
    }

    pub fn get_all_active_asks(&self) -> Vec<AskStatus> {
        self.asks
            .iter()
            .filter(|entry| matches!(entry.value().status, AskStatusType::Open))
            .map(|entry| entry.value().clone())
            .collect()
    }

    pub fn get_all_ask_history(&self) -> Vec<AskStatus> {
        self.ask_history
            .iter()
            .map(|entry| entry.value().clone())
            .collect()
    }

    /// Save runtime state to stable storage
    pub fn save_runtime_state(&self) {
        // Runtime state is automatically saved by stable structures
        // This method is called during pre_upgrade for explicit state persistence
        ic_cdk::println!("Runtime state saved to stable storage");
        ic_cdk::println!("Current runtime state: {:?}", self.runtime_state.get());
    }

    /// Load runtime state from stable storage
    pub fn load_runtime_state(&self) {
        // Runtime state is automatically loaded by stable structures
        // This method is called during post_upgrade for explicit state restoration
        ic_cdk::println!("Runtime state loaded from stable storage");
        ic_cdk::println!("Loaded runtime state: {:?}", self.runtime_state.get());
    }

    /// Get current runtime state for debugging
    pub fn get_runtime_state(&self) -> RuntimeState {
        self.runtime_state.get().clone()
    }

    /// Set runtime state (for testing and migration)
    pub fn set_runtime_state(&mut self, state: RuntimeState) {
        self.runtime_state.set(state);
    }
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
