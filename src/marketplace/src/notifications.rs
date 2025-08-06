//! Notification functionality for the NFT Marketplace
//! 
//! This module implements ICRC-71 compliant notification features for
//! real-time marketplace event notifications.

use candid::Principal;

use crate::types::*;
use crate::errors::{MarketplaceError, MarketplaceResult};

/// Notification manager for handling ICRC-71 compliant notifications
pub struct NotificationManager {
    // Storage for notification subscriptions
    subscriptions: std::collections::HashMap<Principal, Vec<NotificationType>>,
    // Storage for notification history
    notification_history: std::collections::HashMap<Principal, Vec<Notification>>,
    // Maximum notifications per user
    max_notifications_per_user: usize,
    // Maximum history retention time (in nanoseconds)
    max_history_age: u64,
}

impl NotificationManager {
    pub fn new() -> Self {
        Self {
            subscriptions: std::collections::HashMap::new(),
            notification_history: std::collections::HashMap::new(),
            max_notifications_per_user: 1000,
            max_history_age: 30 * 24 * 60 * 60 * 1_000_000_000, // 30 days
        }
    }
    
    /// Send a notification to a specific principal
    pub fn send_notification(
        &mut self,
        principal: Principal,
        notification: Notification,
    ) -> MarketplaceResult<()> {
        // Get or create history entry
        let history = self.notification_history.entry(principal).or_insert_with(Vec::new);
        
        // Clean old notifications first
        let current_time = ic_cdk::api::time();
        history.retain(|n| current_time - n.timestamp < self.max_history_age);
        
        // Add new notification
        history.push(notification);
        
        // Limit notifications per user
        if history.len() > self.max_notifications_per_user {
            history.remove(0); // Remove oldest notification
        }
        
        Ok(())
    }
    
    /// Send notifications to multiple principals
    pub fn send_notifications(
        &mut self,
        principals: Vec<Principal>,
        notification: Notification,
    ) -> MarketplaceResult<()> {
        for principal in principals {
            self.send_notification(principal, notification.clone())?;
        }
        
        Ok(())
    }
    
    /// Subscribe a principal to specific notification types
    pub fn subscribe(&mut self, principal: Principal, event_types: Vec<NotificationType>) -> MarketplaceResult<()> {
        // Validate event types
        if event_types.is_empty() {
            return Err(MarketplaceError::InvalidInput(
                "At least one event type must be specified".to_string()
            ));
        }
        
        // Store subscription
        self.subscriptions.insert(principal, event_types);
        
        Ok(())
    }
    
    /// Unsubscribe a principal from all notifications
    pub fn unsubscribe(&mut self, principal: Principal) -> MarketplaceResult<()> {
        self.subscriptions.remove(&principal);
        self.notification_history.remove(&principal);
        
        Ok(())
    }
    
    /// Get notifications for a principal
    pub fn get_notifications(&self, principal: Principal) -> MarketplaceResult<Vec<Notification>> {
        let history = self.notification_history.get(&principal)
            .cloned()
            .unwrap_or_default();
        
        Ok(history)
    }
    
    /// Get notifications for a principal with pagination
    pub fn get_notifications_paginated(
        &self,
        principal: Principal,
        offset: usize,
        limit: usize,
    ) -> MarketplaceResult<(Vec<Notification>, bool)> {
        let history = self.notification_history.get(&principal)
            .cloned()
            .unwrap_or_default();
        
        let total = history.len();
        let end = (offset + limit).min(total);
        let has_more = end < total;
        
        let notifications = if offset < total {
            history[offset..end].to_vec()
        } else {
            Vec::new()
        };
        
        Ok((notifications, has_more))
    }
    
    /// Check if a principal is subscribed to a specific notification type
    pub fn is_subscribed(&self, principal: Principal, notification_type: &NotificationType) -> bool {
        if let Some(subscriptions) = self.subscriptions.get(&principal) {
            subscriptions.contains(notification_type)
        } else {
            false
        }
    }
    
    /// Get all subscribers for a specific notification type
    pub fn get_subscribers(&self, notification_type: &NotificationType) -> Vec<Principal> {
        self.subscriptions
            .iter()
            .filter(|(_, subscriptions)| subscriptions.contains(notification_type))
            .map(|(principal, _)| *principal)
            .collect()
    }
    
    /// Create and send a marketplace event notification
    pub fn notify_marketplace_event(
        &mut self,
        notification_type: NotificationType,
        ask_id: Option<u64>,
        message: String,
        recipients: Vec<Principal>,
        data: Option<CandyShared>,
    ) -> MarketplaceResult<()> {
        let notification = Notification {
            notification_type,
            ask_id,
            message,
            timestamp: ic_cdk::api::time(),
            data,
        };
        
        // Filter recipients to only those subscribed to this notification type
        let subscribed_recipients: Vec<Principal> = recipients
            .into_iter()
            .filter(|principal| self.is_subscribed(*principal, &notification.notification_type))
            .collect();
        
        // Send notifications to subscribed recipients
        self.send_notifications(subscribed_recipients, notification)
    }
    
    /// Create notification for ask creation
    pub fn notify_ask_created(&mut self, ask_id: u64, seller: Principal, notify_principals: Vec<Principal>) -> MarketplaceResult<()> {
        let message = format!("New ask {} created by {}", ask_id, seller);
        
        self.notify_marketplace_event(
            NotificationType::AskCreated,
            Some(ask_id),
            message,
            notify_principals,
            None,
        )
    }
    
    /// Create notification for ask settlement
    pub fn notify_ask_settled(&mut self, ask_id: u64, buyer: Principal, seller: Principal, notify_principals: Vec<Principal>) -> MarketplaceResult<()> {
        let message = format!("Ask {} settled - Buyer: {}, Seller: {}", ask_id, buyer, seller);
        
        self.notify_marketplace_event(
            NotificationType::AskSettled,
            Some(ask_id),
            message,
            notify_principals,
            None,
        )
    }
    
    /// Create notification for bid placement
    pub fn notify_bid_placed(&mut self, ask_id: u64, bidder: Principal, amount: u64, notify_principals: Vec<Principal>) -> MarketplaceResult<()> {
        let message = format!("Bid placed on ask {} by {} for amount {}", ask_id, bidder, amount);
        
        let data = Some(CandyShared::Nat(amount));
        
        self.notify_marketplace_event(
            NotificationType::BidPlaced,
            Some(ask_id),
            message,
            notify_principals,
            data,
        )
    }
    
    /// Create notification for auction events
    pub fn notify_auction_event(
        &mut self,
        notification_type: NotificationType,
        ask_id: u64,
        message: String,
        notify_principals: Vec<Principal>,
    ) -> MarketplaceResult<()> {
        self.notify_marketplace_event(
            notification_type,
            Some(ask_id),
            message,
            notify_principals,
            None,
        )
    }
    
    /// Create notification for KYC requirement
    pub fn notify_kyc_required(&mut self, ask_id: u64, user: Principal, notify_principals: Vec<Principal>) -> MarketplaceResult<()> {
        let message = format!("KYC verification required for user {} on ask {}", user, ask_id);
        
        self.notify_marketplace_event(
            NotificationType::KYCRequired,
            Some(ask_id),
            message,
            notify_principals,
            None,
        )
    }
    
    /// Get notification statistics
    pub fn get_stats(&self) -> (usize, usize, usize) {
        let total_subscribers = self.subscriptions.len();
        let total_notifications = self.notification_history.values().map(|h| h.len()).sum();
        let total_history_entries = self.notification_history.len();
        
        (total_subscribers, total_notifications, total_history_entries)
    }
    
    /// Clear notification history for a principal
    pub fn clear_history(&mut self, principal: Principal) -> MarketplaceResult<()> {
        self.notification_history.remove(&principal);
        Ok(())
    }
    
    /// Clear all notification history
    pub fn clear_all_history(&mut self) -> MarketplaceResult<()> {
        self.notification_history.clear();
        Ok(())
    }
    
    /// Update notification settings
    pub fn update_settings(&mut self, max_notifications: usize, max_age: u64) -> MarketplaceResult<()> {
        if max_notifications == 0 {
            return Err(MarketplaceError::InvalidInput(
                "Max notifications must be greater than 0".to_string()
            ));
        }
        
        self.max_notifications_per_user = max_notifications;
        self.max_history_age = max_age;
        
        Ok(())
    }
}
