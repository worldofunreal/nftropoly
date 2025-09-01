//! Auction functionality for the NFT Marketplace
//!
//! This module handles various types of auctions including standard, Dutch, and AMM-based auctions.

use candid::Principal;
use ic_cdk::api::time;

use crate::errors::{MarketplaceError, MarketplaceResult};
use crate::types::*;

/// Auction manager for handling different auction types
pub struct AuctionManager {
    // TODO: Add auction-specific storage if needed
}

impl AuctionManager {
    pub fn new() -> Self {
        Self {}
    }

    /// Create a standard auction (ICRC-61 compliant)
    pub fn create_standard_auction(
        &self,
        _ask_id: u64,
        auction_feature: AuctionFeature,
        end_date: u64,
    ) -> MarketplaceResult<AuctionInfo> {
        // Validate auction parameters
        if auction_feature.start_price < auction_feature.reserve {
            return Err(MarketplaceError::InvalidInput(
                "Start price cannot be less than reserve price".to_string(),
            ));
        }

        if end_date <= time() {
            return Err(MarketplaceError::InvalidInput(
                "End date must be in the future".to_string(),
            ));
        }

        // Calculate minimum next bid based on start price and min_increase
        let min_next_bid =
            self.calculate_min_next_bid(auction_feature.start_price, &auction_feature.min_increase);

        // Create auction info
        let auction_info = AuctionInfo {
            token: auction_feature.auction_token,
            current_bid_amount: None,
            end_date: Some(end_date),
            start_date: Some(time()),
            min_next_bid: Some(min_next_bid),
            wait_for_quiet_count: Some(0),
            current_escrow: None,
            // ICRC-61 Standard Auction fields
            reserve_price: auction_feature.reserve,
            start_price: auction_feature.start_price,
            min_increase: auction_feature.min_increase,
            wait_for_quiet: auction_feature.wait_for_quiet,
            current_winner: None,
        };

        Ok(auction_info)
    }

    /// Create a Dutch auction (ICRC-63 compliant)
    pub fn create_dutch_auction(
        &self,
        _ask_id: u64,
        _dutch_feature: DutchAuctionFeature,
        start_price: u64,
        end_price: u64,
        duration: u64,
    ) -> MarketplaceResult<AuctionInfo> {
        if start_price <= end_price {
            return Err(MarketplaceError::InvalidInput(
                "Start price must be greater than end price for Dutch auctions".to_string(),
            ));
        }

        if duration == 0 {
            return Err(MarketplaceError::InvalidInput(
                "Duration must be greater than 0".to_string(),
            ));
        }

        let current_time = time();
        let end_date = current_time + duration;

        // Create auction info for Dutch auction
        let auction_info = AuctionInfo {
            token: TokenSpec::new(Principal::anonymous(), "ICP".to_string()), // Default token
            current_bid_amount: None,
            end_date: Some(end_date),
            start_date: Some(current_time),
            min_next_bid: Some(end_price), // Minimum bid is the end price
            wait_for_quiet_count: Some(0),
            current_escrow: None,
            // ICRC-61 Standard Auction fields (adapted for Dutch)
            reserve_price: end_price,
            start_price,
            min_increase: MinIncrease::Amount(0), // No minimum increase for Dutch auctions
            wait_for_quiet: None,
            current_winner: None,
        };

        Ok(auction_info)
    }

    /// Place a bid in an auction
    pub fn place_auction_bid(
        &self,
        auction_info: &mut AuctionInfo,
        bidder: Principal,
        amount: u64,
    ) -> MarketplaceResult<()> {
        let current_time = time();

        // Check if auction is still active
        if let Some(end_date) = auction_info.end_date {
            if current_time >= end_date {
                return Err(MarketplaceError::InvalidState(
                    "Auction has ended".to_string(),
                ));
            }
        }

        // Check if bid meets reserve price
        if amount < auction_info.reserve_price {
            return Err(MarketplaceError::InvalidInput(format!(
                "Bid amount {} is below reserve price {}",
                amount, auction_info.reserve_price
            )));
        }

        // Check if bid meets minimum next bid requirement
        if let Some(min_next_bid) = auction_info.min_next_bid {
            if amount < min_next_bid {
                return Err(MarketplaceError::InvalidInput(format!(
                    "Bid amount {} is below minimum next bid {}",
                    amount, min_next_bid
                )));
            }
        }

        // Update auction state
        auction_info.current_bid_amount = Some(amount);
        auction_info.current_winner = Some(Account {
            owner: bidder,
            subaccount: None,
        });

        // Calculate new minimum next bid
        let new_min_next_bid = self.calculate_min_next_bid(amount, &auction_info.min_increase);
        auction_info.min_next_bid = Some(new_min_next_bid);

        // Handle wait-for-quiet extension if configured
        if let Some(wait_params) = &auction_info.wait_for_quiet {
            if let Some(end_date) = auction_info.end_date {
                let time_remaining = end_date.saturating_sub(current_time);

                // If bid is placed within the quiet window, extend the auction
                if time_remaining <= wait_params.window {
                    let extension = wait_params.extension;
                    let new_end_date = end_date + extension;

                    // Check if we haven't exceeded max extensions
                    if let Some(current_count) = auction_info.wait_for_quiet_count {
                        if current_count < wait_params.max {
                            auction_info.end_date = Some(new_end_date);
                            auction_info.wait_for_quiet_count = Some(current_count + 1);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// End an auction and determine the winner
    pub fn end_auction(&self, auction_info: &AuctionInfo) -> MarketplaceResult<Option<Principal>> {
        let current_time = time();

        // Check if auction has ended
        if let Some(end_date) = auction_info.end_date {
            if current_time < end_date {
                return Err(MarketplaceError::InvalidState(
                    "Auction has not ended yet".to_string(),
                ));
            }
        }

        // Return the winner if there is one
        if let Some(winner) = &auction_info.current_winner {
            Ok(Some(winner.owner))
        } else {
            Ok(None) // No winner, auction failed to meet reserve
        }
    }

    /// Calculate minimum next bid based on current bid and min_increase rules
    fn calculate_min_next_bid(&self, current_bid: u64, min_increase: &MinIncrease) -> u64 {
        match min_increase {
            MinIncrease::Percentage(percentage) => {
                let increase = (current_bid as f64 * percentage / 100.0) as u64;
                current_bid + increase
            }
            MinIncrease::Amount(amount) => current_bid + amount,
        }
    }

    /// Get current price for a Dutch auction (ICRC-63 compliant)
    pub fn get_dutch_auction_price(
        &self,
        auction_info: &AuctionInfo,
        dutch_params: &DutchParams,
    ) -> u64 {
        let current_time = time();

        if let (Some(start_date), Some(end_date)) = (auction_info.start_date, auction_info.end_date)
        {
            if current_time >= end_date {
                return auction_info.reserve_price; // Return end price if auction ended
            }

            let elapsed = current_time - start_date;
            let total_duration = end_date - start_date;

            if total_duration == 0 {
                return auction_info.start_price;
            }

            // Calculate time units based on ICRC-63 TimeUnit
            let time_units_elapsed = self.convert_to_time_units(elapsed, &dutch_params.time_unit);
            let total_time_units =
                self.convert_to_time_units(total_duration, &dutch_params.time_unit);

            if total_time_units == 0 {
                return auction_info.start_price;
            }

            let progress = time_units_elapsed as f64 / total_time_units as f64;
            let _price_difference = auction_info.start_price - auction_info.reserve_price;

            // Apply decay based on ICRC-63 DecayType
            let current_price = match &dutch_params.decay_type {
                DecayType::Flat(decay_amount) => {
                    let total_decay = (*decay_amount as f64 * progress) as u64;
                    auction_info.start_price.saturating_sub(total_decay)
                }
                DecayType::Percent(decay_percentage) => {
                    let decay_factor = 1.0 - (decay_percentage * progress);
                    let current_price = (auction_info.start_price as f64 * decay_factor) as u64;
                    current_price
                }
            };

            current_price.max(auction_info.reserve_price)
        } else {
            auction_info.start_price
        }
    }

    /// Convert nanoseconds to the specified time unit
    fn convert_to_time_units(&self, nanoseconds: u64, time_unit: &TimeUnit) -> u64 {
        match time_unit {
            TimeUnit::Hour(_) => nanoseconds / 3_600_000_000_000, // 1 hour = 3.6e12 nanoseconds
            TimeUnit::Minute(_) => nanoseconds / 60_000_000_000,  // 1 minute = 6e10 nanoseconds
            TimeUnit::Day(_) => nanoseconds / 86_400_000_000_000, // 1 day = 8.64e13 nanoseconds
        }
    }

    /// Accept current Dutch auction price
    pub fn accept_dutch_auction_price(
        &self,
        auction_info: &mut AuctionInfo,
        buyer: Principal,
        dutch_params: &DutchParams,
    ) -> MarketplaceResult<u64> {
        let current_price = self.get_dutch_auction_price(auction_info, dutch_params);

        // Update auction state
        auction_info.current_bid_amount = Some(current_price);
        auction_info.current_winner = Some(Account {
            owner: buyer,
            subaccount: None,
        });

        // For Dutch auctions, the accepted price becomes the final price
        auction_info.min_next_bid = Some(current_price);

        Ok(current_price)
    }

    /// Save state to stable storage
    pub fn save_state(&self) {
        ic_cdk::println!("Auction manager state saved (no persistent auctions)");
    }

    /// Load state from stable storage
    pub fn load_state(&self) {
        ic_cdk::println!("Auction manager state loaded (no persistent auctions)");
    }

    /// Get all auctions (placeholder - auctions are stored with asks)
    pub fn get_all_auctions(&self) -> Vec<AuctionInfo> {
        vec![] // Auctions are stored as part of AskStatus, not separately
    }
}
