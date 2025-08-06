//! Escrow management for the NFT Marketplace
//! 
//! This module handles escrow operations for bids and asks.

use std::collections::HashMap;

use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};

/// Escrow manager for handling escrow operations
pub struct EscrowManager {
    escrow_records: HashMap<u64, EscrowRecord>,
    next_escrow_id: u64,
}

impl EscrowManager {
    pub fn new() -> Self {
        Self {
            escrow_records: HashMap::new(),
            next_escrow_id: 1,
        }
    }
    
    /// Create a new escrow record
    pub fn create_escrow(
        &mut self,
        escrow_type: EscrowType,
        buyer: Option<Account>,
        seller: Account,
        ask_id: Option<u64>,
        lock_to_date: Option<u64>,
    ) -> u64 {
        let escrow_id = self.next_escrow_id;
        self.next_escrow_id += 1;
        
        let escrow_record = EscrowRecord {
            type_: escrow_type,
            buyer,
            seller,
            ask_id,
            lock_to_date,
        };
        
        self.escrow_records.insert(escrow_id, escrow_record);
        escrow_id
    }
    
    /// Get an escrow record by ID
    pub fn get_escrow(&self, escrow_id: u64) -> Option<&EscrowRecord> {
        self.escrow_records.get(&escrow_id)
    }
    
    /// Get an escrow record by ID (mutable)
    pub fn get_escrow_mut(&mut self, escrow_id: u64) -> Option<&mut EscrowRecord> {
        self.escrow_records.get_mut(&escrow_id)
    }
    
    /// Remove an escrow record
    pub fn remove_escrow(&mut self, escrow_id: u64) -> Option<EscrowRecord> {
        self.escrow_records.remove(&escrow_id)
    }
    
    /// Check if escrow is locked
    pub fn is_locked(&self, escrow_id: u64, current_time: u64) -> MarketplaceResult<bool> {
        if let Some(escrow) = self.get_escrow(escrow_id) {
            if let Some(lock_date) = escrow.lock_to_date {
                Ok(current_time < lock_date)
            } else {
                Ok(false)
            }
        } else {
            Err(MarketplaceError::EscrowNotFound)
        }
    }
    
    /// Get all escrow records for an account
    pub fn get_account_escrows(&self, account: &Account) -> Vec<(u64, &EscrowRecord)> {
        self.escrow_records
            .iter()
            .filter(|(_, escrow)| {
                escrow.seller.owner == account.owner
                    || escrow.buyer.as_ref().map(|b| b.owner == account.owner).unwrap_or(false)
            })
            .map(|(id, escrow)| (*id, escrow))
            .collect()
    }
    
    /// Get escrow records by type
    pub fn get_escrows_by_type(&self, escrow_type: &EscrowType) -> Vec<(u64, &EscrowRecord)> {
        self.escrow_records
            .iter()
            .filter(|(_, escrow)| std::mem::discriminant(&escrow.type_) == std::mem::discriminant(escrow_type))
            .map(|(id, escrow)| (*id, escrow))
            .collect()
    }
    
    /// Update escrow record
    pub fn update_escrow(&mut self, escrow_id: u64, escrow: EscrowRecord) -> MarketplaceResult<()> {
        if self.escrow_records.contains_key(&escrow_id) {
            self.escrow_records.insert(escrow_id, escrow);
            Ok(())
        } else {
            Err(MarketplaceError::EscrowNotFound)
        }
    }
    
    /// Get next escrow ID
    pub fn get_next_escrow_id(&self) -> u64 {
        self.next_escrow_id
    }
    
    /// Set next escrow ID (for upgrades)
    pub fn set_next_escrow_id(&mut self, id: u64) {
        self.next_escrow_id = id;
    }
    
    /// Get all escrow records (for upgrades)
    pub fn get_all_escrows(&self) -> &HashMap<u64, EscrowRecord> {
        &self.escrow_records
    }
    
    /// Set all escrow records (for upgrades)
    pub fn set_all_escrows(&mut self, escrows: HashMap<u64, EscrowRecord>) {
        self.escrow_records = escrows;
    }
}
