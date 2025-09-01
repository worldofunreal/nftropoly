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

// Singleton memory manager to prevent stable storage overwrites
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
}

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different storage components
const ASKS_MEMORY_ID: MemoryId = MemoryId::new(0);
const ASK_HISTORY_MEMORY_ID: MemoryId = MemoryId::new(1);
const ESCROW_RECORDS_MEMORY_ID: MemoryId = MemoryId::new(2);
const RUNTIME_STATE_MEMORY_ID: MemoryId = MemoryId::new(3);
const OWNER_MEMORY_ID: MemoryId = MemoryId::new(4);
const FEE_PERCENTAGE_MEMORY_ID: MemoryId = MemoryId::new(5);
const USER_ASKS_MEMORY_ID: MemoryId = MemoryId::new(6);
const APPROVED_TOKENS_MEMORY_ID: MemoryId = MemoryId::new(7);
const SETTLEMENT_RETRY_INFO_MEMORY_ID: MemoryId = MemoryId::new(8);

// Stable storage instances
thread_local! {
    static ASKS: RefCell<StableBTreeMap<u64, AskStatus, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(ASKS_MEMORY_ID)))
    );

    static ASK_HISTORY: RefCell<StableBTreeMap<u64, AskStatus, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(ASK_HISTORY_MEMORY_ID)))
    );

    static ESCROW_RECORDS: RefCell<StableBTreeMap<u64, EscrowRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(ESCROW_RECORDS_MEMORY_ID)))
    );

    static RUNTIME_STATE: RefCell<StableCell<RuntimeState, Memory>> = RefCell::new(
        StableCell::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(RUNTIME_STATE_MEMORY_ID)), RuntimeState::default())
    );

    static OWNER: RefCell<StableCell<Principal, Memory>> = RefCell::new(
        StableCell::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(OWNER_MEMORY_ID)), Principal::anonymous())
    );

    static FEE_PERCENTAGE: RefCell<StableCell<u64, Memory>> = RefCell::new(
        StableCell::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(FEE_PERCENTAGE_MEMORY_ID)), 250) // 2.5% default
    );

    static USER_ASKS: RefCell<StableBTreeMap<Principal, AskIds, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(USER_ASKS_MEMORY_ID)))
    );

    static APPROVED_TOKENS: RefCell<StableVec<Principal, Memory>> = RefCell::new(
        StableVec::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(APPROVED_TOKENS_MEMORY_ID)))
    );

    static SETTLEMENT_RETRY_INFO: RefCell<StableBTreeMap<u64, SettlementRetryInfo, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(SETTLEMENT_RETRY_INFO_MEMORY_ID)))
    );
}

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
        match candid::decode_one(&bytes) {
            Ok(state) => state,
            Err(_) => {
                // If decoding fails, return default state (migration from old format)
                ic_cdk::println!("⚠️ Failed to decode RuntimeState, using default values");
                RuntimeState::default()
            }
        }
    }

    fn into_bytes(self) -> std::vec::Vec<u8> {
        candid::encode_one(&self).expect("Failed to encode RuntimeState")
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

/// Stable storage for the marketplace
pub struct MarketplaceStorage;

impl MarketplaceStorage {
    pub fn new() -> Self {
        Self
    }

    // ICRC-8 Methods
    pub fn get_ask(&self, ask_id: u64) -> Option<AskStatus> {
        ASKS.with(|asks| {
            asks.borrow().get(&ask_id)
        })
    }

    pub fn insert_ask(&mut self, ask_id: u64, ask: AskStatus) {
        ASKS.with(|asks| {
            asks.borrow_mut().insert(ask_id, ask.clone());
        });
    }

    pub fn remove_ask(&mut self, ask_id: u64) {
        ASKS.with(|asks| {
            asks.borrow_mut().remove(&ask_id);
        });
    }

    pub fn get_next_ask_id(&mut self) -> u64 {
        RUNTIME_STATE.with(|state| {
            let mut current_state = state.borrow().get().clone();
            let id = current_state.next_ask_id;
            current_state.next_ask_id += 1;
            state.borrow_mut().set(current_state);
            id
        })
    }

    pub fn get_escrow_record(&self, escrow_id: u64) -> Option<EscrowRecord> {
        ESCROW_RECORDS.with(|escrows| {
            escrows.borrow().get(&escrow_id)
        })
    }

    pub fn insert_escrow_record(&mut self, escrow_id: u64, escrow: EscrowRecord) {
        ESCROW_RECORDS.with(|escrows| {
            escrows.borrow_mut().insert(escrow_id, escrow.clone());
        });
    }

    pub fn get_next_escrow_id(&mut self) -> u64 {
        RUNTIME_STATE.with(|state| {
            let mut current_state = state.borrow().get().clone();
            let id = current_state.next_escrow_id;
            current_state.next_escrow_id += 1;
            state.borrow_mut().set(current_state);
            id
        })
    }

    pub fn get_user_asks(&self, user: Principal) -> Vec<u64> {
        USER_ASKS.with(|user_asks| {
            if let Some(asks) = user_asks.borrow().get(&user) {
                asks.0.clone()
            } else {
                Vec::new()
            }
        })
    }

    pub fn add_user_ask(&mut self, user: Principal, ask_id: u64) {
        USER_ASKS.with(|user_asks| {
            let mut current_asks = if let Some(asks) = user_asks.borrow().get(&user) {
                asks.0.clone()
            } else {
                Vec::new()
            };
            current_asks.push(ask_id);
            user_asks.borrow_mut().insert(user, AskIds(current_asks));
        });
    }

    pub fn remove_user_ask(&mut self, user: Principal, ask_id: u64) {
        USER_ASKS.with(|user_asks| {
            let mut current_asks = if let Some(asks) = user_asks.borrow().get(&user) {
                asks.0.clone()
            } else {
                Vec::new()
            };
            current_asks.retain(|&id| id != ask_id);
            if current_asks.is_empty() {
                user_asks.borrow_mut().remove(&user);
            } else {
                user_asks.borrow_mut().insert(user, AskIds(current_asks));
            }
        });
    }

    pub fn get_approved_tokens(&self) -> Vec<Principal> {
        APPROVED_TOKENS.with(|tokens| {
            tokens.borrow().iter().collect()
        })
    }

    pub fn add_approved_token(&mut self, token: Principal) {
        APPROVED_TOKENS.with(|tokens| {
            tokens.borrow_mut().push(&token);
        });
    }

    pub fn get_owner(&self) -> Principal {
        OWNER.with(|owner| {
            owner.borrow().get().clone()
        })
    }

    pub fn set_owner(&mut self, owner: Principal) {
        OWNER.with(|owner_cell| {
            owner_cell.borrow_mut().set(owner);
        });
    }

    pub fn get_fee_percentage(&self) -> u64 {
        FEE_PERCENTAGE.with(|fee| {
            *fee.borrow().get()
        })
    }

    pub fn set_fee_percentage(&mut self, fee_percentage: u64) {
        FEE_PERCENTAGE.with(|fee| {
            fee.borrow_mut().set(fee_percentage);
        });
    }

    pub fn add_ask_to_history(&mut self, ask_id: u64, ask: AskStatus) {
        ASK_HISTORY.with(|history| {
            history.borrow_mut().insert(ask_id, ask);
        });
    }

    pub fn get_ask_from_history(&self, ask_id: u64) -> Option<AskStatus> {
        ASK_HISTORY.with(|history| {
            history.borrow().get(&ask_id)
        })
    }

    pub fn get_all_active_asks(&self) -> Vec<AskStatus> {
        ASKS.with(|asks| {
            asks.borrow()
                .iter()
                .filter(|entry| matches!(entry.value().status, AskStatusType::Open))
                .map(|entry| entry.value().clone())
                .collect()
        })
    }

    pub fn get_all_ask_history(&self) -> Vec<AskStatus> {
        ASK_HISTORY.with(|history| {
            history.borrow()
                .iter()
                .map(|entry| entry.value().clone())
                .collect()
        })
    }

    /// Save runtime state to stable storage
    pub fn save_runtime_state(&self) {
        // Runtime state is automatically saved by stable structures
        // This method is called during pre_upgrade for explicit state persistence
        ic_cdk::println!("Runtime state saved to stable storage");
        RUNTIME_STATE.with(|state| {
            ic_cdk::println!("Current runtime state: {:?}", state.borrow().get());
        });
    }

    /// Load runtime state from stable storage
    pub fn load_runtime_state(&self) {
        // Runtime state is automatically loaded by stable structures
        // This method is called during post_upgrade for explicit state restoration
        ic_cdk::println!("Runtime state loaded from stable storage");
        RUNTIME_STATE.with(|state| {
            ic_cdk::println!("Loaded runtime state: {:?}", state.borrow().get());
        });
    }

    /// Get current runtime state for debugging
    pub fn get_runtime_state(&self) -> RuntimeState {
        RUNTIME_STATE.with(|state| {
            state.borrow().get().clone()
        })
    }

    /// Set runtime state (for testing and migration)
    pub fn set_runtime_state(&mut self, state: RuntimeState) {
        RUNTIME_STATE.with(|state_cell| {
            state_cell.borrow_mut().set(state);
        });
    }

    // Settlement retry management
    pub fn set_settlement_retry_info(&mut self, ask_id: u64, retry_info: SettlementRetryInfo) {
        SETTLEMENT_RETRY_INFO.with(|retry_map| {
            retry_map.borrow_mut().insert(ask_id, retry_info);
        });
    }

    pub fn get_settlement_retry_info(&self, ask_id: u64) -> Option<SettlementRetryInfo> {
        SETTLEMENT_RETRY_INFO.with(|retry_map| {
            retry_map.borrow().get(&ask_id)
        })
    }

    pub fn clear_settlement_retry_info(&mut self, ask_id: u64) {
        SETTLEMENT_RETRY_INFO.with(|retry_map| {
            retry_map.borrow_mut().remove(&ask_id);
        });
    }

    pub fn get_all_retry_info(&self) -> Vec<(u64, SettlementRetryInfo)> {
        SETTLEMENT_RETRY_INFO.with(|retry_map| {
            retry_map.borrow()
                .iter()
                .map(|entry| (*entry.key(), entry.value().clone()))
                .collect()
        })
    }
}

// Global storage instance
thread_local! {
    static STORAGE: RefCell<Option<MarketplaceStorage>> = RefCell::new(None);
}

pub fn init_storage() {
    let storage = MarketplaceStorage::new();
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
