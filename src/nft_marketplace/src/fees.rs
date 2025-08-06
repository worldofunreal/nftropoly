//! Fee management for the NFT Marketplace
//! 
//! This module handles fee calculations and fee distribution.

use candid::{CandidType, Deserialize, Principal};
use serde::{Deserialize as SerdeDeserialize, Serialize};
use std::collections::HashMap;

use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};

/// Fee schema types
#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub enum FeeSchema {
    Standard,
    Premium,
    Custom(HashMap<String, u64>),
}

/// Fee manager for handling fee calculations and distributions
pub struct FeeManager {
    fee_schemas: HashMap<String, FeeSchema>,
    default_schema: String,
    marketplace_fee_percentage: u64,
}

impl FeeManager {
    pub fn new() -> Self {
        let mut fee_schemas = HashMap::new();
        
        // Standard fee schema (2.5%)
        fee_schemas.insert("standard".to_string(), FeeSchema::Standard);
        
        // Premium fee schema (1.5%)
        fee_schemas.insert("premium".to_string(), FeeSchema::Premium);
        
        Self {
            fee_schemas,
            default_schema: "standard".to_string(),
            marketplace_fee_percentage: 250, // 2.5%
        }
    }
    
    /// Calculate fee for a transaction
    pub fn calculate_fee(&self, amount: u64, schema_name: Option<&str>) -> u64 {
        let schema_name = schema_name.unwrap_or(&self.default_schema);
        
        match self.fee_schemas.get(schema_name) {
            Some(FeeSchema::Standard) => {
                (amount * self.marketplace_fee_percentage) / 10000
            }
            Some(FeeSchema::Premium) => {
                (amount * 150) / 10000 // 1.5%
            }
            Some(FeeSchema::Custom(fees)) => {
                if let Some(fee_percentage) = fees.get("marketplace") {
                    (amount * fee_percentage) / 10000
                } else {
                    (amount * self.marketplace_fee_percentage) / 10000
                }
            }
            None => {
                // Default to standard if schema not found
                (amount * self.marketplace_fee_percentage) / 10000
            }
        }
    }
    
    /// Calculate fees for multiple parties
    pub fn calculate_fees(
        &self,
        amount: u64,
        schema_name: Option<&str>,
        parties: &[FeeParty],
    ) -> Vec<FeeDistribution> {
        let total_fee = self.calculate_fee(amount, schema_name);
        let mut distributions = Vec::new();
        
        for party in parties {
            let party_fee = match party.fee_type {
                FeeType::Percentage(percentage) => {
                    (total_fee * percentage) / 100
                }
                FeeType::Fixed(fixed_amount) => {
                    fixed_amount.min(total_fee)
                }
            };
            
            distributions.push(FeeDistribution {
                account: party.account.clone(),
                amount: party_fee,
                fee_type: party.fee_type.clone(),
            });
        }
        
        distributions
    }
    
    /// Add a new fee schema
    pub fn add_fee_schema(&mut self, name: String, schema: FeeSchema) -> MarketplaceResult<()> {
        if self.fee_schemas.contains_key(&name) {
            return Err(MarketplaceError::Internal("Fee schema already exists".to_string()));
        }
        
        self.fee_schemas.insert(name, schema);
        Ok(())
    }
    
    /// Update an existing fee schema
    pub fn update_fee_schema(&mut self, name: &str, schema: FeeSchema) -> MarketplaceResult<()> {
        if !self.fee_schemas.contains_key(name) {
            return Err(MarketplaceError::Internal("Fee schema not found".to_string()));
        }
        
        self.fee_schemas.insert(name.to_string(), schema);
        Ok(())
    }
    
    /// Remove a fee schema
    pub fn remove_fee_schema(&mut self, name: &str) -> MarketplaceResult<()> {
        if name == &self.default_schema {
            return Err(MarketplaceError::Internal("Cannot remove default fee schema".to_string()));
        }
        
        if self.fee_schemas.remove(name).is_some() {
            Ok(())
        } else {
            Err(MarketplaceError::Internal("Fee schema not found".to_string()))
        }
    }
    
    /// Set default fee schema
    pub fn set_default_schema(&mut self, name: &str) -> MarketplaceResult<()> {
        if self.fee_schemas.contains_key(name) {
            self.default_schema = name.to_string();
            Ok(())
        } else {
            Err(MarketplaceError::Internal("Fee schema not found".to_string()))
        }
    }
    
    /// Get default fee schema
    pub fn get_default_schema(&self) -> &str {
        &self.default_schema
    }
    
    /// Get all available fee schemas
    pub fn get_fee_schemas(&self) -> &HashMap<String, FeeSchema> {
        &self.fee_schemas
    }
    
    /// Set marketplace fee percentage
    pub fn set_marketplace_fee_percentage(&mut self, percentage: u64) -> MarketplaceResult<()> {
        if percentage > 3000 {
            return Err(MarketplaceError::InvalidFeePercentage);
        }
        
        self.marketplace_fee_percentage = percentage;
        Ok(())
    }
    
    /// Get marketplace fee percentage
    pub fn get_marketplace_fee_percentage(&self) -> u64 {
        self.marketplace_fee_percentage
    }
    
    /// Validate fee schema
    pub fn validate_fee_schema(&self, schema_name: &str) -> bool {
        self.fee_schemas.contains_key(schema_name)
    }
}

/// Fee party information
#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub struct FeeParty {
    pub account: Account,
    pub fee_type: FeeType,
}

/// Fee type
#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub enum FeeType {
    Percentage(u64), // Percentage of total fee
    Fixed(u64),      // Fixed amount
}

/// Fee distribution result
#[derive(Debug, Clone, CandidType, Deserialize, SerdeDeserialize, Serialize)]
pub struct FeeDistribution {
    pub account: Account,
    pub amount: u64,
    pub fee_type: FeeType,
}

impl FeeDistribution {
    pub fn new(account: Account, amount: u64, fee_type: FeeType) -> Self {
        Self {
            account,
            amount,
            fee_type,
        }
    }
}
