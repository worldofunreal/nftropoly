//! Automated Market Maker (AMM) functionality for the NFT Marketplace
//! 
//! This module implements ICRC-62 compliant AMM features for dynamic pricing
//! based on liquidity pools and trade volumes.

use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;

use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};

/// AMM manager for handling automated market making operations
pub struct AMMManager {
    // Storage for liquidity pools
    pools: std::collections::HashMap<u64, LiquidityPool>,
    next_pool_id: u64,
}

/// Liquidity pool for AMM operations
#[derive(Debug, Clone)]
pub struct LiquidityPool {
    pub pool_id: u64,
    pub token_1: TokenSpec,
    pub token_2: TokenSpec,
    pub token_1_reserve: u64,
    pub token_2_reserve: u64,
    pub liquidity_tokens: u64,
    pub decimals: u64,
    pub fee_rate: u64, // Fee rate in basis points (e.g., 30 = 0.3%)
}

impl AMMManager {
    pub fn new() -> Self {
        Self {
            pools: std::collections::HashMap::new(),
            next_pool_id: 1,
        }
    }
    
    /// Create a new liquidity pool
    pub fn create_pool(
        &mut self,
        token_1: TokenSpec,
        token_2: TokenSpec,
        initial_liquidity: u64,
        decimals: u64,
    ) -> MarketplaceResult<u64> {
        // Validate tokens are different
        if token_1.canister == token_2.canister && token_1.symbol == token_2.symbol {
            return Err(MarketplaceError::InvalidInput(
                "Cannot create pool with same token".to_string()
            ));
        }
        
        // Validate initial liquidity
        if initial_liquidity == 0 {
            return Err(MarketplaceError::InvalidInput(
                "Initial liquidity must be greater than 0".to_string()
            ));
        }
        
        let pool_id = self.next_pool_id;
        self.next_pool_id += 1;
        
        // Create pool with equal initial reserves
        let pool = LiquidityPool {
            pool_id,
            token_1: token_1.clone(),
            token_2: token_2.clone(),
            token_1_reserve: initial_liquidity,
            token_2_reserve: initial_liquidity,
            liquidity_tokens: initial_liquidity * 2, // Initial LP tokens
            decimals,
            fee_rate: 30, // Default 0.3% fee
        };
        
        self.pools.insert(pool_id, pool);
        
        Ok(pool_id)
    }
    
    /// Add liquidity to an existing pool
    pub fn add_liquidity(
        &mut self,
        pool_id: u64,
        token_1_amount: u64,
        token_2_amount: u64,
    ) -> MarketplaceResult<u64> {
        let pool = self.pools.get_mut(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        // Calculate liquidity tokens to mint based on current reserves
        let liquidity_tokens = if pool.liquidity_tokens == 0 {
            // First liquidity provider
            (token_1_amount + token_2_amount) / 2
        } else {
            // Calculate based on proportional contribution
            let token_1_ratio = (token_1_amount as f64) / (pool.token_1_reserve as f64);
            let token_2_ratio = (token_2_amount as f64) / (pool.token_2_reserve as f64);
            let min_ratio = token_1_ratio.min(token_2_ratio);
            (min_ratio * pool.liquidity_tokens as f64) as u64
        };
        
        // Update reserves
        pool.token_1_reserve += token_1_amount;
        pool.token_2_reserve += token_2_amount;
        pool.liquidity_tokens += liquidity_tokens;
        
        Ok(liquidity_tokens)
    }
    
    /// Remove liquidity from a pool
    pub fn remove_liquidity(
        &mut self,
        pool_id: u64,
        liquidity_tokens: u64,
    ) -> MarketplaceResult<(u64, u64)> {
        let pool = self.pools.get_mut(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        if liquidity_tokens > pool.liquidity_tokens {
            return Err(MarketplaceError::InvalidInput(
                "Insufficient liquidity tokens".to_string()
            ));
        }
        
        // Calculate proportional amounts to return
        let ratio = liquidity_tokens as f64 / pool.liquidity_tokens as f64;
        let token_1_amount = (ratio * pool.token_1_reserve as f64) as u64;
        let token_2_amount = (ratio * pool.token_2_reserve as f64) as u64;
        
        // Update reserves
        pool.token_1_reserve -= token_1_amount;
        pool.token_2_reserve -= token_2_amount;
        pool.liquidity_tokens -= liquidity_tokens;
        
        Ok((token_1_amount, token_2_amount))
    }
    
    /// Swap tokens using AMM pricing
    pub fn swap(
        &mut self,
        pool_id: u64,
        token_in: TokenSpec,
        amount_in: u64,
        min_amount_out: u64,
    ) -> MarketplaceResult<u64> {
        let pool = self.pools.get_mut(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        // Determine which token is being swapped in
        let (reserve_in, reserve_out) = if token_in.canister == pool.token_1.canister && token_in.symbol == pool.token_1.symbol {
            (pool.token_1_reserve, pool.token_2_reserve)
        } else if token_in.canister == pool.token_2.canister && token_in.symbol == pool.token_2.symbol {
            (pool.token_2_reserve, pool.token_1_reserve)
        } else {
            return Err(MarketplaceError::InvalidInput(
                "Token not found in pool".to_string()
            ));
        };
        
        // Calculate swap amount using constant product formula
        let fee_amount = (amount_in * pool.fee_rate) / 10000; // Apply fee
        let amount_in_with_fee = amount_in - fee_amount;
        
        let amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee);
        
        // Check slippage protection
        if amount_out < min_amount_out {
            return Err(MarketplaceError::InvalidInput(
                "Insufficient output amount".to_string()
            ));
        }
        
        // Update reserves
        if token_in.canister == pool.token_1.canister && token_in.symbol == pool.token_1.symbol {
            pool.token_1_reserve += amount_in;
            pool.token_2_reserve -= amount_out;
        } else {
            pool.token_2_reserve += amount_in;
            pool.token_1_reserve -= amount_out;
        }
        
        Ok(amount_out)
    }
    
    /// Get pool information
    pub fn get_pool_info(&self, pool_id: u64) -> MarketplaceResult<AMMParams> {
        let pool = self.pools.get(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        Ok(AMMParams {
            token_1: pool.token_1.clone(),
            token_2: pool.token_2.clone(),
            max: pool.token_1_reserve.max(pool.token_2_reserve),
            min: pool.token_1_reserve.min(pool.token_2_reserve),
            decimals: pool.decimals as u64,
        })
    }
    
    /// Calculate price impact for a swap
    pub fn calculate_price_impact(
        &self,
        pool_id: u64,
        token_in: &TokenSpec,
        amount_in: u64,
    ) -> MarketplaceResult<f64> {
        let pool = self.pools.get(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        let (reserve_in, reserve_out) = if token_in.canister == pool.token_1.canister && token_in.symbol == pool.token_1.symbol {
            (pool.token_1_reserve, pool.token_2_reserve)
        } else if token_in.canister == pool.token_2.canister && token_in.symbol == pool.token_2.symbol {
            (pool.token_2_reserve, pool.token_1_reserve)
        } else {
            return Err(MarketplaceError::InvalidInput(
                "Token not found in pool".to_string()
            ));
        };
        
        // Calculate price before swap
        let price_before = reserve_out as f64 / reserve_in as f64;
        
        // Calculate price after swap
        let fee_amount = (amount_in * pool.fee_rate) / 10000;
        let amount_in_with_fee = amount_in - fee_amount;
        let new_reserve_in = reserve_in + amount_in_with_fee;
        let new_reserve_out = reserve_out - (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee);
        let price_after = new_reserve_out as f64 / new_reserve_in as f64;
        
        // Calculate price impact
        let price_impact = ((price_before - price_after) / price_before) * 100.0;
        
        Ok(price_impact)
    }
    
    /// Get all pools
    pub fn get_all_pools(&self) -> Vec<(u64, AMMParams)> {
        self.pools.iter()
            .map(|(pool_id, pool)| {
                (*pool_id, AMMParams {
                    token_1: pool.token_1.clone(),
                    token_2: pool.token_2.clone(),
                    max: pool.token_1_reserve.max(pool.token_2_reserve),
                    min: pool.token_1_reserve.min(pool.token_2_reserve),
                    decimals: pool.decimals as u64,
                })
            })
            .collect()
    }
    
    /// Get pool reserves
    pub fn get_pool_reserves(&self, pool_id: u64) -> MarketplaceResult<(u64, u64)> {
        let pool = self.pools.get(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        Ok((pool.token_1_reserve, pool.token_2_reserve))
    }
    
    /// Update pool fee rate
    pub fn update_fee_rate(&mut self, pool_id: u64, new_fee_rate: u64) -> MarketplaceResult<()> {
        let pool = self.pools.get_mut(&pool_id)
            .ok_or_else(|| MarketplaceError::InvalidInput("Pool not found".to_string()))?;
        
        if new_fee_rate > 1000 { // Max 10% fee
            return Err(MarketplaceError::InvalidInput(
                "Fee rate too high".to_string()
            ));
        }
        
        pool.fee_rate = new_fee_rate;
        Ok(())
    }
}
