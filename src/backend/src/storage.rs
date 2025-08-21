use candid::Principal;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use std::cell::RefCell;

use crate::types::User;

type Memory = VirtualMemory<DefaultMemoryImpl>;

const USERS_MEMORY_ID: MemoryId = MemoryId::new(0);
const USERNAMES_MEMORY_ID: MemoryId = MemoryId::new(1);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(USERS_MEMORY_ID)))
    );

    static USERNAMES: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(USERNAMES_MEMORY_ID)))
    );
}

pub struct Database;

impl Database {
    pub fn new() -> Self {
        Self
    }

    pub fn init(&mut self) {
        // Database is initialized automatically by thread_local!
    }

    pub fn pre_upgrade(&self) {
        // Stable structures handle persistence automatically
    }

    pub fn post_upgrade(&mut self) {
        // Stable structures handle restoration automatically
    }

    // User operations
    pub fn insert_user(user: User) {
        USERS.with(|users| {
            users.borrow_mut().insert(user.id, user.clone());
        });
        USERNAMES.with(|usernames| {
            usernames.borrow_mut().insert(user.username.clone(), user.id);
        });
    }

    pub fn get_user(principal: Principal) -> Option<User> {
        USERS.with(|users| {
            users.borrow().get(&principal)
        })
    }

    pub fn get_user_by_username(username: &str) -> Option<User> {
        USERNAMES.with(|usernames| {
            if let Some(principal) = usernames.borrow().get(&username.to_string()) {
                USERS.with(|users| {
                    users.borrow().get(&principal)
                })
            } else {
                None
            }
        })
    }

    pub fn update_user(user: User) {
        USERS.with(|users| {
            users.borrow_mut().insert(user.id, user);
        });
    }

    pub fn username_exists(username: &str) -> bool {
        USERNAMES.with(|usernames| {
            usernames.borrow().contains_key(&username.to_string())
        })
    }

    pub fn get_user_count() -> u64 {
        USERS.with(|users| {
            users.borrow().len() as u64
        })
    }

    pub fn search_users(query: &str, limit: u32) -> Vec<User> {
        let query_lower = query.to_lowercase();
        let mut results = Vec::new();
        let mut count = 0;

        USERS.with(|users| {
            for entry in users.borrow().iter() {
                if count >= limit {
                    break;
                }

                let user = entry.value();
                let username_match = user.username.to_lowercase().contains(&query_lower);
                let display_name_match = user.display_name
                    .as_ref()
                    .map(|name| name.to_lowercase().contains(&query_lower))
                    .unwrap_or(false);

                if username_match || display_name_match {
                    results.push(user.clone());
                    count += 1;
                }
            }
        });

        results
    }
}
