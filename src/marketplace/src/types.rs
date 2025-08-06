//! ICRC-8 Compliant Data Types
//! 
//! This module defines all the data types required for ICRC-8 compliance.

use candid::{CandidType, Deserialize, Principal};
use serde::Serialize;
use ic_stable_structures::{Storable, storable::Bound};
use std::borrow::Cow;

// Newtype wrapper for Vec<u64> to implement Storable
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AskIds(pub Vec<u64>);

impl Storable for AskIds {
    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&(self.0.len() as u32).to_le_bytes());
        for item in &self.0 {
            bytes.extend_from_slice(&item.to_le_bytes());
        }
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&(self.0.len() as u32).to_le_bytes());
        for item in self.0 {
            bytes.extend_from_slice(&item.to_le_bytes());
        }
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 4 {
            return AskIds(Vec::new());
        }
        let len = u32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) as usize;
        let mut result = Vec::with_capacity(len);
        let mut pos = 4;
        for _ in 0..len {
            if pos + 8 <= bytes.len() {
                let item = u64::from_le_bytes([
                    bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3],
                    bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]
                ]);
                result.push(item);
                pos += 8;
            }
        }
        AskIds(result)
    }
}

// ============================================================================
// Core ICRC-8 Types
// ============================================================================

/// Account representation for token owners
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash, Serialize)]
pub struct Account {
    pub owner: Principal,
    pub sub_account: Option<Vec<u8>>,
}

impl Storable for Account {
    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.owner.as_slice());
        if let Some(sub) = &self.sub_account {
            bytes.push(1); // has subaccount
            bytes.extend_from_slice(sub);
        } else {
            bytes.push(0); // no subaccount
        }
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.owner.as_slice());
        if let Some(sub) = &self.sub_account {
            bytes.push(1); // has subaccount
            bytes.extend_from_slice(sub);
        } else {
            bytes.push(0); // no subaccount
        }
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 30 {
            panic!("Invalid account bytes");
        }
        let owner = Principal::from_slice(&bytes[..29]);
        let has_sub = bytes[29];
        let sub_account = if has_sub == 1 && bytes.len() > 30 {
            Some(bytes[30..].to_vec())
        } else {
            None
        };
        Self { owner, sub_account }
    }
}



/// Token specification for identifying tokens in the marketplace
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct TokenSpec {
    pub canister: Principal,
    pub symbol: String,
    pub standards: Vec<ICRCStandards>,
}

impl Storable for TokenSpec {
    const BOUND: Bound = Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.canister.as_slice());
        bytes.extend_from_slice(self.symbol.as_bytes());
        bytes.push(0); // null terminator for string
        bytes.extend_from_slice(&(self.standards.len() as u32).to_le_bytes());
        for standard in &self.standards {
            bytes.extend_from_slice(&standard.to_bytes());
        }
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.canister.as_slice());
        bytes.extend_from_slice(self.symbol.as_bytes());
        bytes.push(0); // null terminator for string
        bytes.extend_from_slice(&(self.standards.len() as u32).to_le_bytes());
        for standard in &self.standards {
            bytes.extend_from_slice(&standard.to_bytes());
        }
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 30 {
            panic!("Invalid token spec bytes");
        }
        let canister = Principal::from_slice(&bytes[..29]);
        let mut pos = 29;
        
        // Read symbol
        let symbol_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
        let symbol = String::from_utf8(bytes[pos..pos + symbol_end].to_vec()).unwrap();
        pos += symbol_end + 1;
        
        // Read standards
        let standards_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut standards = Vec::new();
        for _ in 0..standards_len {
            let (standard, consumed) = ICRCStandards::from_bytes(&bytes[pos..]);
            standards.push(standard);
            pos += consumed;
        }
        
        Self { canister, symbol, standards }
    }
}



/// Supported ICRC standards
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum ICRCStandards {
    ICRC1(Option<ICRC1TokenSpecDetail>),
    ICRC2(Option<ICRC2TokenSpecDetail>),
    ICRC4(Option<ICRC4TokenSpecDetail>),
    ICRC7(Option<ICRC7TokenSpecDetail>),
    ICRC37(Option<ICRC37TokenSpecDetail>),
}

impl ICRCStandards {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            ICRCStandards::ICRC1(detail) => {
                bytes.push(1);
                if let Some(detail) = detail {
                    bytes.push(1);
                    bytes.extend_from_slice(&detail.to_bytes());
                } else {
                    bytes.push(0);
                }
            }
            ICRCStandards::ICRC2(detail) => {
                bytes.push(2);
                if let Some(detail) = detail {
                    bytes.push(1);
                    bytes.extend_from_slice(&detail.to_bytes());
                } else {
                    bytes.push(0);
                }
            }
            ICRCStandards::ICRC4(detail) => {
                bytes.push(4);
                if let Some(detail) = detail {
                    bytes.push(1);
                    bytes.extend_from_slice(&detail.to_bytes());
                } else {
                    bytes.push(0);
                }
            }
            ICRCStandards::ICRC7(detail) => {
                bytes.push(7);
                if let Some(detail) = detail {
                    bytes.push(1);
                    bytes.extend_from_slice(&detail.to_bytes());
                } else {
                    bytes.push(0);
                }
            }
            ICRCStandards::ICRC37(detail) => {
                bytes.push(37);
                if let Some(detail) = detail {
                    bytes.push(1);
                    bytes.extend_from_slice(&detail.to_bytes());
                } else {
                    bytes.push(0);
                }
            }
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for ICRCStandards");
        }
        let standard_type = bytes[0];
        let mut pos = 1;
        
        let has_detail = bytes[pos] == 1;
        pos += 1;
        
        let standard = match standard_type {
            1 => {
                if has_detail {
                    let (detail, consumed) = ICRC1TokenSpecDetail::from_bytes(&bytes[pos..]);
                    pos += consumed;
                    ICRCStandards::ICRC1(Some(detail))
                } else {
                    ICRCStandards::ICRC1(None)
                }
            }
            2 => {
                if has_detail {
                    let (detail, consumed) = ICRC2TokenSpecDetail::from_bytes(&bytes[pos..]);
                    pos += consumed;
                    ICRCStandards::ICRC2(Some(detail))
                } else {
                    ICRCStandards::ICRC2(None)
                }
            }
            4 => {
                if has_detail {
                    let (detail, consumed) = ICRC4TokenSpecDetail::from_bytes(&bytes[pos..]);
                    pos += consumed;
                    ICRCStandards::ICRC4(Some(detail))
                } else {
                    ICRCStandards::ICRC4(None)
                }
            }
            7 => {
                if has_detail {
                    let (detail, consumed) = ICRC7TokenSpecDetail::from_bytes(&bytes[pos..]);
                    pos += consumed;
                    ICRCStandards::ICRC7(Some(detail))
                } else {
                    ICRCStandards::ICRC7(None)
                }
            }
            37 => {
                if has_detail {
                    let (detail, consumed) = ICRC37TokenSpecDetail::from_bytes(&bytes[pos..]);
                    pos += consumed;
                    ICRCStandards::ICRC37(Some(detail))
                } else {
                    ICRCStandards::ICRC37(None)
                }
            }
            _ => panic!("Unknown ICRC standard type: {}", standard_type),
        };
        
        (standard, pos)
    }
}

/// ICRC-1 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC1TokenSpecDetail {
    pub amount: u64,
    pub fee: Option<u64>,
    pub decimals: u64,
}

impl ICRC1TokenSpecDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.amount.to_le_bytes());
        if let Some(fee) = self.fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.decimals.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.len() < 17 {
            panic!("Invalid ICRC1TokenSpecDetail bytes");
        }
        let amount = u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]]);
        let has_fee = bytes[8] == 1;
        let mut pos = 9;
        let fee = if has_fee {
            let fee_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(fee_val)
        } else {
            None
        };
        let decimals = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        (Self { amount, fee, decimals }, pos)
    }
}

/// ICRC-2 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC2TokenSpecDetail {
    pub amount: u64,
    pub approval_fee: Option<u64>,
    pub transfer_from_fee: Option<u64>,
    pub decimals: u64,
}

impl ICRC2TokenSpecDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.amount.to_le_bytes());
        if let Some(fee) = self.approval_fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(fee) = self.transfer_from_fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.decimals.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.len() < 25 {
            panic!("Invalid ICRC2TokenSpecDetail bytes");
        }
        let amount = u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]]);
        let mut pos = 8;
        
        let approval_fee = if bytes[pos] == 1 {
            pos += 1;
            let fee_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(fee_val)
        } else {
            pos += 1;
            None
        };
        
        let transfer_from_fee = if bytes[pos] == 1 {
            pos += 1;
            let fee_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(fee_val)
        } else {
            pos += 1;
            None
        };
        
        let decimals = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        (Self { amount, approval_fee, transfer_from_fee, decimals }, pos)
    }
}

/// ICRC-4 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC4TokenSpecDetail {
    pub batch_fee: Option<u64>,
    pub decimals: u64,
}

impl ICRC4TokenSpecDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        if let Some(fee) = self.batch_fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.decimals.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.len() < 9 {
            panic!("Invalid ICRC4TokenSpecDetail bytes");
        }
        let has_fee = bytes[0] == 1;
        let mut pos = 1;
        let batch_fee = if has_fee {
            let fee_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(fee_val)
        } else {
            None
        };
        let decimals = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        (Self { batch_fee, decimals }, pos)
    }
}

/// ICRC-7 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC7TokenSpecDetail {
    pub fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

impl ICRC7TokenSpecDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        if let Some(fee) = &self.fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(token_id) = self.token_id {
            bytes.push(1);
            bytes.extend_from_slice(&token_id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for ICRC7TokenSpecDetail");
        }
        let mut pos = 0;
        
        let fee = if bytes[pos] == 1 {
            pos += 1;
            let fee_spec = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += fee_spec.to_bytes().len();
            Some(fee_spec)
        } else {
            pos += 1;
            None
        };
        
        let token_id = if bytes[pos] == 1 {
            pos += 1;
            if bytes.len() < pos + 8 {
                panic!("Invalid token_id bytes");
            }
            let token_id_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(token_id_val)
        } else {
            pos += 1;
            None
        };
        
        (Self { fee, token_id }, pos)
    }
}

/// ICRC-37 token specification details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ICRC37TokenSpecDetail {
    pub approval_fee: Option<TokenSpec>,
    pub transfer_from_fee: Option<TokenSpec>,
    pub token_id: Option<u64>,
}

impl ICRC37TokenSpecDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        if let Some(fee) = &self.approval_fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(fee) = &self.transfer_from_fee {
            bytes.push(1);
            bytes.extend_from_slice(&fee.to_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(token_id) = self.token_id {
            bytes.push(1);
            bytes.extend_from_slice(&token_id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for ICRC37TokenSpecDetail");
        }
        let mut pos = 0;
        
        let approval_fee = if bytes[pos] == 1 {
            pos += 1;
            let fee_spec = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += fee_spec.to_bytes().len();
            Some(fee_spec)
        } else {
            pos += 1;
            None
        };
        
        let transfer_from_fee = if bytes[pos] == 1 {
            pos += 1;
            let fee_spec = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += fee_spec.to_bytes().len();
            Some(fee_spec)
        } else {
            pos += 1;
            None
        };
        
        let token_id = if bytes[pos] == 1 {
            pos += 1;
            if bytes.len() < pos + 8 {
                panic!("Invalid token_id bytes");
            }
            let token_id_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(token_id_val)
        } else {
            pos += 1;
            None
        };
        
        (Self { approval_fee, transfer_from_fee, token_id }, pos)
    }
}

/// Token specification result for transaction outcomes
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct TokenSpecResult {
    pub canister: Principal,
    pub symbol: String,
    pub standards: Vec<ICRCStandards>,
    pub result: u64, // Transaction index
    pub sending_account: Account,
    pub receiving_account: Account,
    pub ask_id: Option<u64>,
}

// ============================================================================
// Escrow Types
// ============================================================================

/// Escrow record for managing assets during transactions
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EscrowRecord {
    pub type_: EscrowType,
    pub buyer: Option<Account>,
    pub seller: Account,
    pub ask_id: Option<u64>,
    pub lock_to_date: Option<u64>,
}

impl Storable for EscrowRecord {
    const BOUND: Bound = Bound::Bounded {
        max_size: 4096,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.type_.to_bytes());
        if let Some(buyer) = &self.buyer {
            bytes.push(1);
            bytes.extend_from_slice(&buyer.to_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.seller.to_bytes());
        if let Some(ask_id) = self.ask_id {
            bytes.push(1);
            bytes.extend_from_slice(&ask_id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(lock_date) = self.lock_to_date {
            bytes.push(1);
            bytes.extend_from_slice(&lock_date.to_le_bytes());
        } else {
            bytes.push(0);
        }
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.type_.to_bytes());
        if let Some(buyer) = &self.buyer {
            bytes.push(1);
            bytes.extend_from_slice(&buyer.clone().into_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.seller.into_bytes());
        if let Some(ask_id) = self.ask_id {
            bytes.push(1);
            bytes.extend_from_slice(&ask_id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(lock_date) = self.lock_to_date {
            bytes.push(1);
            bytes.extend_from_slice(&lock_date.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.is_empty() {
            panic!("Empty bytes for EscrowRecord");
        }
        let mut pos = 0;
        
        let (escrow_type, consumed) = EscrowType::from_bytes(&bytes[pos..]);
        pos += consumed;
        
        let buyer = if bytes[pos] == 1 {
            pos += 1;
            let buyer_account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += buyer_account.to_bytes().len();
            Some(buyer_account)
        } else {
            pos += 1;
            None
        };
        
        let seller = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
        pos += seller.to_bytes().len();
        
        let ask_id = if bytes[pos] == 1 {
            pos += 1;
            if bytes.len() < pos + 8 {
                panic!("Invalid ask_id bytes");
            }
            let ask_id_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(ask_id_val)
        } else {
            pos += 1;
            None
        };
        
        let lock_to_date = if bytes[pos] == 1 {
            pos += 1;
            if bytes.len() < pos + 8 {
                panic!("Invalid lock_to_date bytes");
            }
            let lock_date_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(lock_date_val)
        } else {
            pos += 1;
            None
        };
        
        Self { type_: escrow_type, buyer, seller, ask_id, lock_to_date }
    }
}



#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum EscrowType {
    Bid(Vec<Option<TokenSpec>>),
    Ask(Vec<Option<TokenSpec>>),
    Settlement(Vec<Option<TokenSpec>>),
}

impl EscrowType {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            EscrowType::Bid(tokens) => {
                bytes.push(0);
                bytes.extend_from_slice(&(tokens.len() as u32).to_le_bytes());
                for token in tokens {
                    if let Some(token) = token {
                        bytes.push(1);
                        bytes.extend_from_slice(&token.to_bytes());
                    } else {
                        bytes.push(0);
                    }
                }
            }
            EscrowType::Ask(tokens) => {
                bytes.push(1);
                bytes.extend_from_slice(&(tokens.len() as u32).to_le_bytes());
                for token in tokens {
                    if let Some(token) = token {
                        bytes.push(1);
                        bytes.extend_from_slice(&token.to_bytes());
                    } else {
                        bytes.push(0);
                    }
                }
            }
            EscrowType::Settlement(tokens) => {
                bytes.push(2);
                bytes.extend_from_slice(&(tokens.len() as u32).to_le_bytes());
                for token in tokens {
                    if let Some(token) = token {
                        bytes.push(1);
                        bytes.extend_from_slice(&token.to_bytes());
                    } else {
                        bytes.push(0);
                    }
                }
            }
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for EscrowType");
        }
        let escrow_type = bytes[0];
        let mut pos = 1;
        
        if bytes.len() < pos + 4 {
            panic!("Invalid EscrowType bytes");
        }
        let tokens_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        
        let mut tokens = Vec::new();
        for _ in 0..tokens_len {
            if bytes[pos] == 1 {
                pos += 1;
                let token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += token.to_bytes().len();
                tokens.push(Some(token));
            } else {
                pos += 1;
                tokens.push(None);
            }
        }
        
        let escrow_type = match escrow_type {
            0 => EscrowType::Bid(tokens),
            1 => EscrowType::Ask(tokens),
            2 => EscrowType::Settlement(tokens),
            _ => panic!("Unknown escrow type: {}", escrow_type),
        };
        
        (escrow_type, pos)
    }
}

/// Encumbrance specification for multi-canister trades
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EncumbranceSpec {
    pub tokens: Vec<TokenSpec>,
    pub trustees: Vec<Principal>,
    pub timeout: u64,
}

/// Encumbrance details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct EncumbranceDetail {
    pub spec: EncumbranceSpec,
    pub expires_at: u64,
}

// ============================================================================
// Ask Types
// ============================================================================

// ICRC-61: Standard Auctions for Ledger Native Markets
/// Auction feature for standard auctions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct AuctionFeature {
    pub auction_token: TokenSpec,
    pub wait_for_quiet: Option<WaitQuietParams>,
    pub reserve: u64,
    pub start_price: u64,
    pub min_increase: MinIncrease,
}

/// Wait for quiet parameters for auction extensions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct WaitQuietParams {
    pub window: u64,
    pub extension: u64,
    pub fade: f64,
    pub max: u64,
}

/// Minimum increase for auction bids
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum MinIncrease {
    Percentage(f64),
    Amount(u64),
}

// ICRC-63: Dutch Auctions for Ledger Native Markets
/// Time unit for Dutch auction decay
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum TimeUnit {
    Hour(u64),
    Minute(u64),
    Day(u64),
}

/// Decay type for Dutch auctions
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum DecayType {
    Flat(u64),
    Percent(f64),
}

/// Dutch auction parameters
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct DutchParams {
    pub time_unit: TimeUnit,
    pub decay_type: DecayType,
}

/// Dutch auction feature for ICRC-63
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct DutchAuctionFeature {
    pub dutch: DutchParams,
}

/// Ask features for marketplace asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub enum AskFeature {
    AllowPartial,
    UnsolicitedOffer(Account),
    BuyNow(Vec<Vec<BuyNowReq>>),
    AllowList(Vec<Account>),
    Broker(Account),
    StartDate(u64),
    Ending(EndingType),
    AskToken(Vec<Option<TokenSpec>>),
    FeeSchema(String),
    FeeAccounts(Vec<(String, TokenSpec, Account)>),
    BidPaysFees(Option<Vec<String>>),
    CreatedAt(u64),
    Memo(Vec<u8>),
    Auction(AuctionFeature),  // ← New ICRC-61 auction feature
    Dutch(DutchAuctionFeature),  // ← New ICRC-63 Dutch auction feature
}

/// Buy now requirements
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub struct BuyNowReq {
    pub token: TokenSpec,
    pub amount: u64,
}

/// Ending types for asks
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Serialize)]
pub enum EndingType {
    Perpetual,
    Date(u64),
    Timeout(u64),
}

/// Ask status type for tracking ask states
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize)]
pub enum AskStatusType {
    Open,
    Closed,
    Encumbered(Vec<EncumbranceDetail>),
    NotStarted,
}

/// Auction information for auction-based asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize, Serialize)]
pub struct AuctionInfo {
    pub token: TokenSpec,
    pub current_bid_amount: Option<u64>,
    pub end_date: Option<u64>,
    pub start_date: Option<u64>,
    pub min_next_bid: Option<u64>,
    pub wait_for_quiet_count: Option<u64>,
    pub current_escrow: Option<EscrowRecord>,
    // ICRC-61 Standard Auction fields
    pub reserve_price: u64,
    pub start_price: u64,
    pub min_increase: MinIncrease,
    pub wait_for_quiet: Option<WaitQuietParams>,
    pub current_winner: Option<Account>,
}

/// Settlement information for completed asks
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize)]
pub struct SettlementInfo {
    pub bid_tokens: Vec<Option<TokenSpecResult>>,
    pub ask_tokens: Vec<Option<TokenSpecResult>>,
    pub royalties: Vec<(Account, u64, String)>,
}

/// Ask status for tracking marketplace asks
#[derive(Debug, Clone, PartialEq, CandidType, Deserialize)]
pub struct AskStatus {
    pub ask_id: u64,
    pub original_broker_id: Option<Account>,
    pub current_broker_id: Option<Account>,
    pub config: Vec<AskFeature>,
    pub auction_info: Option<AuctionInfo>,
    pub settlement: Option<SettlementInfo>,
    pub allow_list: Option<Vec<Account>>,
    pub participants: Vec<Account>,
    pub settled_at: Option<(Principal, u64)>,
    pub status: AskStatusType,
    pub seller: Account,
}

impl Storable for AskStatus {
    const BOUND: Bound = Bound::Bounded {
        max_size: 8192,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.ask_id.to_le_bytes());
        
        // original_broker_id
        if let Some(broker) = &self.original_broker_id {
            bytes.push(1);
            bytes.extend_from_slice(&broker.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // current_broker_id
        if let Some(broker) = &self.current_broker_id {
            bytes.push(1);
            bytes.extend_from_slice(&broker.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // config
        bytes.extend_from_slice(&(self.config.len() as u32).to_le_bytes());
        for feature in &self.config {
            bytes.extend_from_slice(&feature.to_bytes());
        }
        
        // auction_info
        if let Some(info) = &self.auction_info {
            bytes.push(1);
            bytes.extend_from_slice(&info.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // settlement
        if let Some(settlement) = &self.settlement {
            bytes.push(1);
            bytes.extend_from_slice(&settlement.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // allow_list
        if let Some(allow_list) = &self.allow_list {
            bytes.push(1);
            bytes.extend_from_slice(&(allow_list.len() as u32).to_le_bytes());
            for account in allow_list {
                bytes.extend_from_slice(&account.to_bytes());
            }
        } else {
            bytes.push(0);
        }
        
        // participants
        bytes.extend_from_slice(&(self.participants.len() as u32).to_le_bytes());
        for account in &self.participants {
            bytes.extend_from_slice(&account.to_bytes());
        }
        
        // settled_at
        if let Some((principal, id)) = self.settled_at {
            bytes.push(1);
            bytes.extend_from_slice(&principal.as_slice());
            bytes.extend_from_slice(&id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        
        // status
        bytes.extend_from_slice(&self.status.to_bytes());
        
        // seller
        bytes.extend_from_slice(&self.seller.to_bytes());
        
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.ask_id.to_le_bytes());
        
        // original_broker_id
        if let Some(broker) = &self.original_broker_id {
            bytes.push(1);
            bytes.extend_from_slice(&broker.clone().into_bytes());
        } else {
            bytes.push(0);
        }
        
        // current_broker_id
        if let Some(broker) = &self.current_broker_id {
            bytes.push(1);
            bytes.extend_from_slice(&broker.clone().into_bytes());
        } else {
            bytes.push(0);
        }
        
        // config
        bytes.extend_from_slice(&(self.config.len() as u32).to_le_bytes());
        for feature in &self.config {
            bytes.extend_from_slice(&feature.to_bytes());
        }
        
        // auction_info
        if let Some(info) = &self.auction_info {
            bytes.push(1);
            bytes.extend_from_slice(&info.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // settlement
        if let Some(settlement) = &self.settlement {
            bytes.push(1);
            bytes.extend_from_slice(&settlement.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // allow_list
        if let Some(allow_list) = &self.allow_list {
            bytes.push(1);
            bytes.extend_from_slice(&(allow_list.len() as u32).to_le_bytes());
            for account in allow_list {
                bytes.extend_from_slice(&account.clone().into_bytes());
            }
        } else {
            bytes.push(0);
        }
        
        // participants
        bytes.extend_from_slice(&(self.participants.len() as u32).to_le_bytes());
        for account in &self.participants {
            bytes.extend_from_slice(&account.clone().into_bytes());
        }
        
        // settled_at
        if let Some((principal, id)) = self.settled_at {
            bytes.push(1);
            bytes.extend_from_slice(&principal.as_slice());
            bytes.extend_from_slice(&id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        
        // status
        bytes.extend_from_slice(&self.status.to_bytes());
        
        // seller
        bytes.extend_from_slice(&self.seller.clone().into_bytes());
        
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 8 {
            panic!("Invalid AskStatus bytes");
        }
        let mut pos = 0;
        
        let ask_id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        // original_broker_id
        let original_broker_id = if bytes[pos] == 1 {
            pos += 1;
            let broker = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += broker.to_bytes().len();
            Some(broker)
        } else {
            pos += 1;
            None
        };
        
        // current_broker_id
        let current_broker_id = if bytes[pos] == 1 {
            pos += 1;
            let broker = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += broker.to_bytes().len();
            Some(broker)
        } else {
            pos += 1;
            None
        };
        
        // config
        let config_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut config = Vec::new();
        for _ in 0..config_len {
            let (feature, consumed) = AskFeature::from_bytes(&bytes[pos..]);
            config.push(feature);
            pos += consumed;
        }
        
        // auction_info
        let auction_info = if bytes[pos] == 1 {
            pos += 1;
            let (info, consumed) = AuctionInfo::from_bytes(&bytes[pos..]);
            pos += consumed;
            Some(info)
        } else {
            pos += 1;
            None
        };
        
        // settlement
        let settlement = if bytes[pos] == 1 {
            pos += 1;
            let (settlement, consumed) = SettlementInfo::from_bytes(&bytes[pos..]);
            pos += consumed;
            Some(settlement)
        } else {
            pos += 1;
            None
        };
        
        // allow_list
        let allow_list = if bytes[pos] == 1 {
            pos += 1;
            let allow_list_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
            pos += 4;
            let mut allow_list = Vec::new();
            for _ in 0..allow_list_len {
                let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += account.to_bytes().len();
                allow_list.push(account);
            }
            Some(allow_list)
        } else {
            pos += 1;
            None
        };
        
        // participants
        let participants_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut participants = Vec::new();
        for _ in 0..participants_len {
            let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += account.to_bytes().len();
            participants.push(account);
        }
        
        // settled_at
        let settled_at = if bytes[pos] == 1 {
            pos += 1;
            if bytes.len() < pos + 37 {
                panic!("Invalid settled_at bytes");
            }
            let principal = Principal::from_slice(&bytes[pos..pos+29]);
            pos += 29;
            let id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some((principal, id))
        } else {
            pos += 1;
            None
        };
        
        // status
        let (status, consumed) = AskStatusType::from_bytes(&bytes[pos..]);
        pos += consumed;
        
        // seller
        let seller = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
        
        Self {
            ask_id,
            original_broker_id,
            current_broker_id,
            config,
            auction_info,
            settlement,
            allow_list,
            participants,
            settled_at,
            status,
            seller,
        }
    }
}



impl AskFeature {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            AskFeature::AllowPartial => {
                bytes.push(0);
            }
            AskFeature::UnsolicitedOffer(account) => {
                bytes.push(1);
                bytes.extend_from_slice(&account.to_bytes());
            }
            AskFeature::BuyNow(buy_now_options) => {
                bytes.push(2);
                bytes.extend_from_slice(&(buy_now_options.len() as u32).to_le_bytes());
                for option in buy_now_options {
                    bytes.extend_from_slice(&(option.len() as u32).to_le_bytes());
                    for req in option {
                        bytes.extend_from_slice(&req.to_bytes());
                    }
                }
            }
            AskFeature::AllowList(accounts) => {
                bytes.push(3);
                bytes.extend_from_slice(&(accounts.len() as u32).to_le_bytes());
                for account in accounts {
                    bytes.extend_from_slice(&account.to_bytes());
                }
            }
            AskFeature::Broker(account) => {
                bytes.push(4);
                bytes.extend_from_slice(&account.to_bytes());
            }
            AskFeature::StartDate(date) => {
                bytes.push(5);
                bytes.extend_from_slice(&date.to_le_bytes());
            }
            AskFeature::Ending(ending) => {
                bytes.push(6);
                bytes.extend_from_slice(&ending.to_bytes());
            }
            AskFeature::AskToken(tokens) => {
                bytes.push(7);
                bytes.extend_from_slice(&(tokens.len() as u32).to_le_bytes());
                for token in tokens {
                    if let Some(token) = token {
                        bytes.push(1);
                        bytes.extend_from_slice(&token.to_bytes());
                    } else {
                        bytes.push(0);
                    }
                }
            }
            AskFeature::FeeSchema(schema) => {
                bytes.push(8);
                bytes.extend_from_slice(schema.as_bytes());
                bytes.push(0); // null terminator
            }
            AskFeature::FeeAccounts(accounts) => {
                bytes.push(9);
                bytes.extend_from_slice(&(accounts.len() as u32).to_le_bytes());
                for (name, token, account) in accounts {
                    bytes.extend_from_slice(name.as_bytes());
                    bytes.push(0); // null terminator
                    bytes.extend_from_slice(&token.to_bytes());
                    bytes.extend_from_slice(&account.to_bytes());
                }
            }
            AskFeature::BidPaysFees(fees) => {
                bytes.push(10);
                if let Some(fees) = fees {
                    bytes.push(1);
                    bytes.extend_from_slice(&(fees.len() as u32).to_le_bytes());
                    for fee in fees {
                        bytes.extend_from_slice(fee.as_bytes());
                        bytes.push(0); // null terminator
                    }
                } else {
                    bytes.push(0);
                }
            }
            AskFeature::CreatedAt(timestamp) => {
                bytes.push(11);
                bytes.extend_from_slice(&timestamp.to_le_bytes());
            }
            AskFeature::Memo(data) => {
                bytes.push(12);
                bytes.extend_from_slice(&(data.len() as u32).to_le_bytes());
                bytes.extend_from_slice(data);
            }
            AskFeature::Auction(feature) => {
                bytes.push(13);
                bytes.extend_from_slice(&feature.to_bytes());
            }
            AskFeature::Dutch(feature) => {
                bytes.push(14);
                bytes.extend_from_slice(&feature.to_bytes());
            }
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for AskFeature");
        }
        let feature_type = bytes[0];
        let mut pos = 1;
        
        let feature = match feature_type {
            0 => AskFeature::AllowPartial,
            1 => {
                let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += account.to_bytes().len();
                AskFeature::UnsolicitedOffer(account)
            }
            2 => {
                let options_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let mut buy_now_options = Vec::new();
                for _ in 0..options_len {
                    let reqs_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                    pos += 4;
                    let mut reqs = Vec::new();
                    for _ in 0..reqs_len {
                        let (req, consumed) = BuyNowReq::from_bytes(&bytes[pos..]);
                        reqs.push(req);
                        pos += consumed;
                    }
                    buy_now_options.push(reqs);
                }
                AskFeature::BuyNow(buy_now_options)
            }
            3 => {
                let accounts_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let mut accounts = Vec::new();
                for _ in 0..accounts_len {
                    let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
                    pos += account.to_bytes().len();
                    accounts.push(account);
                }
                AskFeature::AllowList(accounts)
            }
            4 => {
                let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += account.to_bytes().len();
                AskFeature::Broker(account)
            }
            5 => {
                let date = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
                pos += 8;
                AskFeature::StartDate(date)
            }
            6 => {
                let (ending, consumed) = EndingType::from_bytes(&bytes[pos..]);
                pos += consumed;
                AskFeature::Ending(ending)
            }
            7 => {
                let tokens_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let mut tokens = Vec::new();
                for _ in 0..tokens_len {
                    if bytes[pos] == 1 {
                        pos += 1;
                        let token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
                        pos += token.to_bytes().len();
                        tokens.push(Some(token));
                    } else {
                        pos += 1;
                        tokens.push(None);
                    }
                }
                AskFeature::AskToken(tokens)
            }
            8 => {
                let schema_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
                let schema = String::from_utf8(bytes[pos..pos + schema_end].to_vec()).unwrap();
                pos += schema_end + 1;
                AskFeature::FeeSchema(schema)
            }
            9 => {
                let accounts_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let mut accounts = Vec::new();
                for _ in 0..accounts_len {
                    let name_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
                    let name = String::from_utf8(bytes[pos..pos + name_end].to_vec()).unwrap();
                    pos += name_end + 1;
                    let token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
                    pos += token.to_bytes().len();
                    let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
                    pos += account.to_bytes().len();
                    accounts.push((name, token, account));
                }
                AskFeature::FeeAccounts(accounts)
            }
            10 => {
                let has_fees = bytes[pos] == 1;
                pos += 1;
                let fees = if has_fees {
                    let fees_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                    pos += 4;
                    let mut fees = Vec::new();
                    for _ in 0..fees_len {
                        let fee_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
                        let fee = String::from_utf8(bytes[pos..pos + fee_end].to_vec()).unwrap();
                        pos += fee_end + 1;
                        fees.push(fee);
                    }
                    Some(fees)
                } else {
                    None
                };
                AskFeature::BidPaysFees(fees)
            }
            11 => {
                let timestamp = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
                pos += 8;
                AskFeature::CreatedAt(timestamp)
            }
            12 => {
                let data_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let data = bytes[pos..pos + data_len].to_vec();
                pos += data_len;
                AskFeature::Memo(data)
            }
            13 => {
                let feature = AuctionFeature::from_bytes(&bytes[pos..]);
                pos += feature.to_bytes().len();
                AskFeature::Auction(feature)
            }
            14 => {
                let feature = DutchAuctionFeature::from_bytes(&bytes[pos..]);
                pos += feature.to_bytes().len();
                AskFeature::Dutch(feature)
            }
            _ => panic!("Unknown AskFeature type: {}", feature_type),
        };
        
        (feature, pos)
    }
}

impl BuyNowReq {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.token.to_bytes());
        bytes.extend_from_slice(&self.amount.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        let token = TokenSpec::from_bytes(Cow::Borrowed(bytes));
        let mut pos = token.to_bytes().len();
        let amount = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        (Self { token, amount }, pos)
    }
}

impl EndingType {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            EndingType::Perpetual => {
                bytes.push(0);
            }
            EndingType::Date(date) => {
                bytes.push(1);
                bytes.extend_from_slice(&date.to_le_bytes());
            }
            EndingType::Timeout(timeout) => {
                bytes.push(2);
                bytes.extend_from_slice(&timeout.to_le_bytes());
            }
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for EndingType");
        }
        let ending_type = bytes[0];
        let mut pos = 1;
        
        let ending = match ending_type {
            0 => EndingType::Perpetual,
            1 => {
                let date = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
                pos += 8;
                EndingType::Date(date)
            }
            2 => {
                let timeout = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
                pos += 8;
                EndingType::Timeout(timeout)
            }
            _ => panic!("Unknown EndingType: {}", ending_type),
        };
        
        (ending, pos)
    }
}

impl AskStatusType {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            AskStatusType::Open => {
                bytes.push(0);
            }
            AskStatusType::Closed => {
                bytes.push(1);
            }
            AskStatusType::Encumbered(details) => {
                bytes.push(2);
                bytes.extend_from_slice(&(details.len() as u32).to_le_bytes());
                for detail in details {
                    bytes.extend_from_slice(&detail.to_bytes());
                }
            }
            AskStatusType::NotStarted => {
                bytes.push(3);
            }
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        if bytes.is_empty() {
            panic!("Empty bytes for AskStatusType");
        }
        let status_type = bytes[0];
        let mut pos = 1;
        
        let status = match status_type {
            0 => AskStatusType::Open,
            1 => AskStatusType::Closed,
            2 => {
                let details_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
                pos += 4;
                let mut details = Vec::new();
                for _ in 0..details_len {
                    let detail = EncumbranceDetail::from_bytes(Cow::Borrowed(&bytes[pos..]));
                    pos += detail.to_bytes().len();
                    details.push(detail);
                }
                AskStatusType::Encumbered(details)
            }
            3 => AskStatusType::NotStarted,
            _ => panic!("Unknown AskStatusType: {}", status_type),
        };
        
        (status, pos)
    }
}

impl EncumbranceDetail {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.spec.to_bytes());
        bytes.extend_from_slice(&self.expires_at.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 8 {
            panic!("Invalid EncumbranceDetail bytes");
        }
        let spec = EncumbranceSpec::from_bytes(Cow::Borrowed(&bytes[..bytes.len()-8]));
        let expires_at = u64::from_le_bytes([bytes[bytes.len()-8], bytes[bytes.len()-7], bytes[bytes.len()-6], bytes[bytes.len()-5], bytes[bytes.len()-4], bytes[bytes.len()-3], bytes[bytes.len()-2], bytes[bytes.len()-1]]);
        Self { spec, expires_at }
    }
}

impl EncumbranceSpec {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&(self.tokens.len() as u32).to_le_bytes());
        for token in &self.tokens {
            bytes.extend_from_slice(&token.to_bytes());
        }
        bytes.extend_from_slice(&(self.trustees.len() as u32).to_le_bytes());
        for trustee in &self.trustees {
            bytes.extend_from_slice(&trustee.as_slice());
        }
        bytes.extend_from_slice(&self.timeout.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 12 {
            panic!("Invalid EncumbranceSpec bytes");
        }
        let mut pos = 0;
        
        let tokens_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut tokens = Vec::new();
        for _ in 0..tokens_len {
            let token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += token.to_bytes().len();
            tokens.push(token);
        }
        
        let trustees_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut trustees = Vec::new();
        for _ in 0..trustees_len {
            if bytes.len() < pos + 29 {
                panic!("Invalid trustee bytes");
            }
            let trustee = Principal::from_slice(&bytes[pos..pos+29]);
            pos += 29;
            trustees.push(trustee);
        }
        
        let timeout = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        
        Self { tokens, trustees, timeout }
    }
}

impl AuctionInfo {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.token.to_bytes());
        if let Some(amount) = self.current_bid_amount {
            bytes.push(1);
            bytes.extend_from_slice(&amount.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(date) = self.end_date {
            bytes.push(1);
            bytes.extend_from_slice(&date.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(date) = self.start_date {
            bytes.push(1);
            bytes.extend_from_slice(&date.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(amount) = self.min_next_bid {
            bytes.push(1);
            bytes.extend_from_slice(&amount.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(count) = self.wait_for_quiet_count {
            bytes.push(1);
            bytes.extend_from_slice(&count.to_le_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(escrow) = &self.current_escrow {
            bytes.push(1);
            bytes.extend_from_slice(&escrow.to_bytes());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.reserve_price.to_le_bytes());
        bytes.extend_from_slice(&self.start_price.to_le_bytes());
        bytes.extend_from_slice(&self.min_increase.to_bytes());
        if let Some(wait) = &self.wait_for_quiet {
            bytes.push(1);
            bytes.extend_from_slice(&wait.to_bytes());
        } else {
            bytes.push(0);
        }
        if let Some(winner) = &self.current_winner {
            bytes.push(1);
            bytes.extend_from_slice(&winner.to_bytes());
        } else {
            bytes.push(0);
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        let mut pos = 0;
        
        let token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
        pos += token.to_bytes().len();
        
        let current_bid_amount = if bytes[pos] == 1 {
            pos += 1;
            let amount = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(amount)
        } else {
            pos += 1;
            None
        };
        
        let end_date = if bytes[pos] == 1 {
            pos += 1;
            let date = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(date)
        } else {
            pos += 1;
            None
        };
        
        let start_date = if bytes[pos] == 1 {
            pos += 1;
            let date = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(date)
        } else {
            pos += 1;
            None
        };
        
        let min_next_bid = if bytes[pos] == 1 {
            pos += 1;
            let amount = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(amount)
        } else {
            pos += 1;
            None
        };
        
        let wait_for_quiet_count = if bytes[pos] == 1 {
            pos += 1;
            let count = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(count)
        } else {
            pos += 1;
            None
        };
        
        let current_escrow = if bytes[pos] == 1 {
            pos += 1;
            let escrow = EscrowRecord::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += escrow.to_bytes().len();
            Some(escrow)
        } else {
            pos += 1;
            None
        };
        
        let reserve_price = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let start_price = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let min_increase = MinIncrease::from_bytes(&bytes[pos..]);
        pos += min_increase.to_bytes().len();
        
        let wait_for_quiet = if bytes[pos] == 1 {
            pos += 1;
            let wait = WaitQuietParams::from_bytes(&bytes[pos..]);
            pos += wait.to_bytes().len();
            Some(wait)
        } else {
            pos += 1;
            None
        };
        
        let current_winner = if bytes[pos] == 1 {
            pos += 1;
            let winner = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += winner.to_bytes().len();
            Some(winner)
        } else {
            pos += 1;
            None
        };
        
        (Self {
            token,
            current_bid_amount,
            end_date,
            start_date,
            min_next_bid,
            wait_for_quiet_count,
            current_escrow,
            reserve_price,
            start_price,
            min_increase,
            wait_for_quiet,
            current_winner,
        }, pos)
    }
}

impl SettlementInfo {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&(self.bid_tokens.len() as u32).to_le_bytes());
        for token in &self.bid_tokens {
            if let Some(token) = token {
                bytes.push(1);
                bytes.extend_from_slice(&token.to_bytes());
            } else {
                bytes.push(0);
            }
        }
        bytes.extend_from_slice(&(self.ask_tokens.len() as u32).to_le_bytes());
        for token in &self.ask_tokens {
            if let Some(token) = token {
                bytes.push(1);
                bytes.extend_from_slice(&token.to_bytes());
            } else {
                bytes.push(0);
            }
        }
        bytes.extend_from_slice(&(self.royalties.len() as u32).to_le_bytes());
        for (account, amount, tag) in &self.royalties {
            bytes.extend_from_slice(&account.to_bytes());
            bytes.extend_from_slice(&amount.to_le_bytes());
            bytes.extend_from_slice(tag.as_bytes());
            bytes.push(0); // null terminator
        }
        bytes
    }

    fn from_bytes(bytes: &[u8]) -> (Self, usize) {
        let mut pos = 0;
        
        let bid_tokens_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut bid_tokens = Vec::new();
        for _ in 0..bid_tokens_len {
            if bytes[pos] == 1 {
                pos += 1;
                let token = TokenSpecResult::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += token.to_bytes().len();
                bid_tokens.push(Some(token));
            } else {
                pos += 1;
                bid_tokens.push(None);
            }
        }
        
        let ask_tokens_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut ask_tokens = Vec::new();
        for _ in 0..ask_tokens_len {
            if bytes[pos] == 1 {
                pos += 1;
                let token = TokenSpecResult::from_bytes(Cow::Borrowed(&bytes[pos..]));
                pos += token.to_bytes().len();
                ask_tokens.push(Some(token));
            } else {
                pos += 1;
                ask_tokens.push(None);
            }
        }
        
        let royalties_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut royalties = Vec::new();
        for _ in 0..royalties_len {
            let account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
            pos += account.to_bytes().len();
            let amount = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            let tag_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
            let tag = String::from_utf8(bytes[pos..pos + tag_end].to_vec()).unwrap();
            pos += tag_end + 1;
            royalties.push((account, amount, tag));
        }
        
        (Self { bid_tokens, ask_tokens, royalties }, pos)
    }
}

impl TokenSpecResult {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.canister.as_slice());
        bytes.extend_from_slice(self.symbol.as_bytes());
        bytes.push(0); // null terminator
        bytes.extend_from_slice(&(self.standards.len() as u32).to_le_bytes());
        for standard in &self.standards {
            bytes.extend_from_slice(&standard.to_bytes());
        }
        bytes.extend_from_slice(&self.result.to_le_bytes());
        bytes.extend_from_slice(&self.sending_account.to_bytes());
        bytes.extend_from_slice(&self.receiving_account.to_bytes());
        if let Some(ask_id) = self.ask_id {
            bytes.push(1);
            bytes.extend_from_slice(&ask_id.to_le_bytes());
        } else {
            bytes.push(0);
        }
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 30 {
            panic!("Invalid TokenSpecResult bytes");
        }
        let mut pos = 0;
        
        let canister = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let symbol_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
        let symbol = String::from_utf8(bytes[pos..pos + symbol_end].to_vec()).unwrap();
        pos += symbol_end + 1;
        
        let standards_len = u32::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3]]) as usize;
        pos += 4;
        let mut standards = Vec::new();
        for _ in 0..standards_len {
            let (standard, consumed) = ICRCStandards::from_bytes(&bytes[pos..]);
            standards.push(standard);
            pos += consumed;
        }
        
        let result = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let sending_account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
        pos += sending_account.to_bytes().len();
        
        let receiving_account = Account::from_bytes(Cow::Borrowed(&bytes[pos..]));
        pos += receiving_account.to_bytes().len();
        
        let ask_id = if bytes[pos] == 1 {
            pos += 1;
            let ask_id_val = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
            pos += 8;
            Some(ask_id_val)
        } else {
            pos += 1;
            None
        };
        
        Self {
            canister,
            symbol,
            standards,
            result,
            sending_account,
            receiving_account,
            ask_id,
        }
    }
}

// ============================================================================
// Bid Types
// ============================================================================

/// Bid features for buyer offers
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BidFeature {
    Broker(Account),
    Escrow(EscrowRecord),
    FeeSchema(String),
    FeeAccount(Vec<(String, TokenSpec, Account)>),
    Amm(AMMParams),
}

/// AMM parameters
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AMMParams {
    pub token_1: TokenSpec,
    pub token_2: TokenSpec,
    pub max: u64,
    pub min: u64,
    pub decimals: u8,
}

/// Engine match for multi-canister trades
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatch {
    pub leader: Option<Principal>,
    pub asks: Vec<EngineMatchAsk>,
}

/// Engine match ask details
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchAsk {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpec>>>,
}

// ============================================================================
// Request/Response Types
// ============================================================================

/// Manage ask request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ManageAskRequest {
    NewAsk(Vec<Option<AskFeature>>),
    EndAsk(u64),
    RefreshOffers(Option<Account>),
    WithdrawSettlement(EscrowRecord),
    WithdrawEscrow(EscrowRecord),
    RejectOffer(u64),
    DistributeAsk(u64),
    UpdateAmm(AMMUpdate),
    LockAsk(LockAsk),
    Unencumber(u64),
}

/// Manage bid request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidRequest {
    NewBid(NewBidRequest),
    EngineMatch(EngineMatch),
    WithdrawEscrow(EscrowRecord),
}

/// New bid request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidRequest {
    pub ask_id: u64,
    pub feature: Vec<Option<BidFeature>>,
}

/// Manage ask response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ManageAskResponse {
    NewAsk(Result<NewAskResult, GenericError>),
    EndAsk(Result<u64, GenericError>),
    RefreshOffers(Result<RefreshOffersResult, GenericError>),
    WithdrawSettlement(Result<WithdrawResult, GenericError>),
    DistributeAsk(Result<Vec<DistributionResult>, GenericError>),
    LockAsk(Result<Vec<TokenSpecResult>, GenericError>),
}

/// Manage bid response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageBidResponse {
    NewBid(Result<NewBidResult, GenericError>),
    EngineMatch(Result<Vec<EngineMatchResult>, GenericError>),
    WithdrawEscrow(Result<WithdrawResult, GenericError>),
}

/// New ask result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewAskResult {
    pub ask_id: u64,
    pub escrow: EscrowRecord,
}

/// New bid result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct NewBidResult {
    pub escrow: EscrowRecord,
    pub result: u64,
}

/// Refresh offers result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct RefreshOffersResult {
    pub records: Vec<(Vec<u8>, Option<AskStatus>)>,
    pub eof: bool,
    pub count: u64,
}

/// Withdraw result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct WithdrawResult {
    pub withdraw_result: u64,
    pub token_results: Vec<TokenResult>,
}

/// Token result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct TokenResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Distribution result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct DistributionResult {
    pub token: TokenSpec,
    pub result: Result<u64, GenericError>,
}

/// Engine match result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct EngineMatchResult {
    pub ask_canister: Option<Principal>,
    pub ask_id: u64,
    pub token: Option<Vec<Option<TokenSpecResult>>>,
}

// ============================================================================
// Query Types
// ============================================================================

/// Balance request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceRequest {
    Nfts(Option<BalancePagination>),
    Tokens,
    Escrow(Option<BalancePagination>),
    AskSettlements(Option<BalancePagination>),
    Offers(Option<BalancePagination>),
}

/// Balance pagination
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalancePagination {
    pub prev: Option<u64>,
    pub take: Option<u64>,
}

/// Balance result
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum BalanceResult {
    Nfts(Option<BalanceRecords>),
    Tokens(Option<u64>),
    Escrow(BalanceRecords),
    AskSettlements(BalanceRecords),
    Offers(BalanceRecords),
}

/// Balance records
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct BalanceRecords {
    pub records: Vec<EscrowRecord>,
    pub count: u64,
    pub eof: bool,
}

/// Ask info request
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum AskInfoRequest {
    Active(Option<(Option<u64>, Option<u64>)>),
    History(u64, u64),
    Status(u64),
}

/// Ask info response
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum AskInfoResponse {
    Active(AskInfoRecords),
    History(AskInfoRecords),
    Status(Option<AskStatus>),
}

/// Ask info records
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct AskInfoRecords {
    pub records: Vec<Option<AskStatus>>,
    pub eof: bool,
    pub count: u64,
}

// ============================================================================
// Utility Types
// ============================================================================

/// Generic error type
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct GenericError {
    pub code: u64,
    pub message: String,
}

/// AMM update
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct AMMUpdate {
    pub ask_id: u64,
    pub params: AMMParams,
}

/// Lock ask
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct LockAsk {
    pub ask_id: u64,
    pub lock_duration: u64,
    pub fee: TokenSpec,
}

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

/// Collection information
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct Collection {
    pub id: Principal,
    pub name: String,
    pub symbol: String,
    pub is_verified: bool,
    pub created_at: u64,
    pub manager: Principal,
}

impl Storable for Collection {
    const BOUND: Bound = Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.as_slice());
        bytes.extend_from_slice(self.name.as_bytes());
        bytes.push(0); // null terminator
        bytes.extend_from_slice(self.symbol.as_bytes());
        bytes.push(0); // null terminator
        bytes.push(if self.is_verified { 1 } else { 0 });
        bytes.extend_from_slice(&self.created_at.to_le_bytes());
        bytes.extend_from_slice(&self.manager.as_slice());
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.as_slice());
        bytes.extend_from_slice(self.name.as_bytes());
        bytes.push(0); // null terminator
        bytes.extend_from_slice(self.symbol.as_bytes());
        bytes.push(0); // null terminator
        bytes.push(if self.is_verified { 1 } else { 0 });
        bytes.extend_from_slice(&self.created_at.to_le_bytes());
        bytes.extend_from_slice(&self.manager.as_slice());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 59 {
            panic!("Invalid Collection bytes");
        }
        let mut pos = 0;
        
        let id = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let name_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
        let name = String::from_utf8(bytes[pos..pos + name_end].to_vec()).unwrap();
        pos += name_end + 1;
        
        let symbol_end = bytes[pos..].iter().position(|&b| b == 0).unwrap_or(bytes.len() - pos);
        let symbol = String::from_utf8(bytes[pos..pos + symbol_end].to_vec()).unwrap();
        pos += symbol_end + 1;
        
        let is_verified = bytes[pos] == 1;
        pos += 1;
        
        let created_at = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let manager = Principal::from_slice(&bytes[pos..pos+29]);
        
        Self {
            id,
            name,
            symbol,
            is_verified,
            created_at,
            manager,
        }
    }
}



/// Transaction record for tracking marketplace activity
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
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

impl Storable for TransactionRecord {
    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.to_le_bytes());
        bytes.push(self.transaction_type.clone() as u8);
        bytes.extend_from_slice(&self.listing_id.to_le_bytes());
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        bytes.extend_from_slice(&self.seller.as_slice());
        if let Some(buyer) = self.buyer {
            bytes.push(1);
            bytes.extend_from_slice(&buyer.as_slice());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.price.to_le_bytes());
        bytes.extend_from_slice(&self.timestamp.to_le_bytes());
        bytes.extend_from_slice(&self.fee.to_le_bytes());
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.to_le_bytes());
        bytes.push(self.transaction_type.clone() as u8);
        bytes.extend_from_slice(&self.listing_id.to_le_bytes());
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        bytes.extend_from_slice(&self.seller.as_slice());
        if let Some(buyer) = self.buyer {
            bytes.push(1);
            bytes.extend_from_slice(&buyer.as_slice());
        } else {
            bytes.push(0);
        }
        bytes.extend_from_slice(&self.price.to_le_bytes());
        bytes.extend_from_slice(&self.timestamp.to_le_bytes());
        bytes.extend_from_slice(&self.fee.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 75 {
            panic!("Invalid TransactionRecord bytes");
        }
        let mut pos = 0;
        
        let id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let transaction_type = match bytes[pos] {
            0 => TransactionType::Sale,
            1 => TransactionType::Bid,
            2 => TransactionType::Ask,
            3 => TransactionType::CollectionRegistered,
            _ => panic!("Unknown transaction type: {}", bytes[pos]),
        };
        pos += 1;
        
        let listing_id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let collection_id = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let token_id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let seller = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let buyer = if bytes[pos] == 1 {
            pos += 1;
            let buyer_principal = Principal::from_slice(&bytes[pos..pos+29]);
            pos += 29;
            Some(buyer_principal)
        } else {
            pos += 1;
            None
        };
        
        let price = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let timestamp = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let fee = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        
        Self {
            id,
            transaction_type,
            listing_id,
            collection_id,
            token_id,
            seller,
            buyer,
            price,
            timestamp,
            fee,
        }
    }
}



/// Transaction types
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub enum TransactionType {
    Sale,
    Bid,
    Ask,
    CollectionRegistered,
}

/// Token key for identifying specific tokens
#[derive(Debug, Clone, PartialEq, Eq, Hash, CandidType, Deserialize, Serialize)]
pub struct TokenKey {
    pub collection_id: Principal,
    pub token_id: u64,
}

impl Storable for TokenKey {
    const BOUND: Bound = Bound::Bounded {
        max_size: 64,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 37 {
            panic!("Invalid TokenKey bytes");
        }
        let collection_id = Principal::from_slice(&bytes[..29]);
        let token_id = u64::from_le_bytes([bytes[29], bytes[30], bytes[31], bytes[32], bytes[33], bytes[34], bytes[35], bytes[36]]);
        Self { collection_id, token_id }
    }
}



/// Listing information
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct Listing {
    pub id: u64,
    pub collection_id: Principal,
    pub token_id: u64,
    pub seller: Principal,
    pub price: u64,
    pub expires: u64,
    pub created_at: u64,
}

impl Storable for Listing {
    const BOUND: Bound = Bound::Bounded {
        max_size: 128,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.to_le_bytes());
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        bytes.extend_from_slice(&self.seller.as_slice());
        bytes.extend_from_slice(&self.price.to_le_bytes());
        bytes.extend_from_slice(&self.expires.to_le_bytes());
        bytes.extend_from_slice(&self.created_at.to_le_bytes());
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.id.to_le_bytes());
        bytes.extend_from_slice(&self.collection_id.as_slice());
        bytes.extend_from_slice(&self.token_id.to_le_bytes());
        bytes.extend_from_slice(&self.seller.as_slice());
        bytes.extend_from_slice(&self.price.to_le_bytes());
        bytes.extend_from_slice(&self.expires.to_le_bytes());
        bytes.extend_from_slice(&self.created_at.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 75 {
            panic!("Invalid Listing bytes");
        }
        let mut pos = 0;
        
        let id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let collection_id = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let token_id = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let seller = Principal::from_slice(&bytes[pos..pos+29]);
        pos += 29;
        
        let price = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let expires = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let created_at = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        
        Self {
            id,
            collection_id,
            token_id,
            seller,
            price,
            expires,
            created_at,
        }
    }
}



/// Marketplace statistics
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub struct MarketplaceStats {
    pub total_listings: u64,
    pub active_listings: u64,
    pub total_transactions: u64,
    pub total_volume: u64,
    pub fee_percentage: u64,
}

impl Storable for MarketplaceStats {
    const BOUND: Bound = Bound::Bounded {
        max_size: 64,
        is_fixed_size: true,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.total_listings.to_le_bytes());
        bytes.extend_from_slice(&self.active_listings.to_le_bytes());
        bytes.extend_from_slice(&self.total_transactions.to_le_bytes());
        bytes.extend_from_slice(&self.total_volume.to_le_bytes());
        bytes.extend_from_slice(&self.fee_percentage.to_le_bytes());
        Cow::Owned(bytes)
    }

    fn into_bytes(self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.total_listings.to_le_bytes());
        bytes.extend_from_slice(&self.active_listings.to_le_bytes());
        bytes.extend_from_slice(&self.total_transactions.to_le_bytes());
        bytes.extend_from_slice(&self.total_volume.to_le_bytes());
        bytes.extend_from_slice(&self.fee_percentage.to_le_bytes());
        bytes
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let bytes = bytes.as_ref();
        if bytes.len() < 40 {
            panic!("Invalid MarketplaceStats bytes");
        }
        let mut pos = 0;
        
        let total_listings = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let active_listings = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let total_transactions = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let total_volume = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        let fee_percentage = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        
        Self {
            total_listings,
            active_listings,
            total_transactions,
            total_volume,
            fee_percentage,
        }
    }
}



/// Error types for the marketplace
#[derive(Debug, Clone, PartialEq, Eq, CandidType, Deserialize, Serialize)]
pub enum Error {
    Unauthorized,
    InvalidPrice,
    InvalidFeePercentage,
    TokenSpecNotSupported,
    NotOwner,
    TokenNotFound,
    NotICRC7Compliant,
    ListingNotFound,
    AskNotActive,
    UnsupportedOperation,
    CannotBuyOwnNFT,
}

// Type aliases for backward compatibility
pub type ListingId = u64;
pub type TransactionId = u64;
pub type CollectionId = Principal;
pub type TokenId = u64;

// ============================================================================
// Implementations
// ============================================================================

impl Account {
    pub fn new(owner: Principal) -> Self {
        Self {
            owner,
            sub_account: None,
        }
    }

    pub fn with_subaccount(owner: Principal, sub_account: Vec<u8>) -> Self {
        Self {
            owner,
            sub_account: Some(sub_account),
        }
    }
}

impl TokenSpec {
    pub fn new(canister: Principal, symbol: String) -> Self {
        Self {
            canister,
            symbol,
            standards: Vec::new(),
        }
    }

    pub fn with_standard(mut self, standard: ICRCStandards) -> Self {
        self.standards.push(standard);
        self
    }
}

impl EscrowRecord {
    pub fn new(escrow_type: EscrowType, seller: Account) -> Self {
        Self {
            type_: escrow_type,
            buyer: None,
            seller,
            ask_id: None,
            lock_to_date: None,
        }
    }
}

impl AuctionFeature {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        
        // auction_token
        bytes.extend_from_slice(&self.auction_token.to_bytes());
        
        // wait_for_quiet
        if let Some(wait) = &self.wait_for_quiet {
            bytes.push(1);
            bytes.extend_from_slice(&wait.to_bytes());
        } else {
            bytes.push(0);
        }
        
        // reserve
        bytes.extend_from_slice(&self.reserve.to_le_bytes());
        
        // start_price
        bytes.extend_from_slice(&self.start_price.to_le_bytes());
        
        // min_increase
        bytes.extend_from_slice(&self.min_increase.to_bytes());
        
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        let mut pos = 0;
        
        // auction_token
        let auction_token = TokenSpec::from_bytes(Cow::Borrowed(&bytes[pos..]));
        pos += auction_token.to_bytes().len();
        
        // wait_for_quiet
        let wait_for_quiet = if bytes[pos] == 1 {
            pos += 1;
            let wait = WaitQuietParams::from_bytes(&bytes[pos..]);
            pos += wait.to_bytes().len();
            Some(wait)
        } else {
            pos += 1;
            None
        };
        
        // reserve
        let reserve = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        // start_price
        let start_price = u64::from_le_bytes([bytes[pos], bytes[pos+1], bytes[pos+2], bytes[pos+3], bytes[pos+4], bytes[pos+5], bytes[pos+6], bytes[pos+7]]);
        pos += 8;
        
        // min_increase
        let min_increase = MinIncrease::from_bytes(&bytes[pos..]);
        
        Self {
            auction_token,
            wait_for_quiet,
            reserve,
            start_price,
            min_increase,
        }
    }
}

impl WaitQuietParams {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.window.to_le_bytes());
        bytes.extend_from_slice(&self.extension.to_le_bytes());
        bytes.extend_from_slice(&self.fade.to_le_bytes());
        bytes.extend_from_slice(&self.max.to_le_bytes());
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        let window = u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]]);
        let extension = u64::from_le_bytes([bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]]);
        let fade = f64::from_le_bytes([bytes[16], bytes[17], bytes[18], bytes[19], bytes[20], bytes[21], bytes[22], bytes[23]]);
        let max = u64::from_le_bytes([bytes[24], bytes[25], bytes[26], bytes[27], bytes[28], bytes[29], bytes[30], bytes[31]]);
        
        Self {
            window,
            extension,
            fade,
            max,
        }
    }
}

impl MinIncrease {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            MinIncrease::Percentage(p) => {
                bytes.push(0);
                bytes.extend_from_slice(&p.to_le_bytes());
            }
            MinIncrease::Amount(a) => {
                bytes.push(1);
                bytes.extend_from_slice(&a.to_le_bytes());
            }
        }
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        match bytes[0] {
            0 => {
                let percentage = f64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]]);
                MinIncrease::Percentage(percentage)
            }
            1 => {
                let amount = u64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]]);
                MinIncrease::Amount(amount)
            }
            _ => panic!("Unknown MinIncrease type: {}", bytes[0]),
        }
    }
}

impl DutchAuctionFeature {
    fn to_bytes(&self) -> Vec<u8> {
        self.dutch.to_bytes()
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        let dutch = DutchParams::from_bytes(bytes);
        Self { dutch }
    }
}

impl DutchParams {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&self.time_unit.to_bytes());
        bytes.extend_from_slice(&self.decay_type.to_bytes());
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        let time_unit = TimeUnit::from_bytes(&bytes[0..9]);
        let decay_type = DecayType::from_bytes(&bytes[9..18]);
        
        Self {
            time_unit,
            decay_type,
        }
    }
}

impl TimeUnit {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            TimeUnit::Hour(hours) => {
                bytes.push(0);
                bytes.extend_from_slice(&hours.to_le_bytes());
            }
            TimeUnit::Minute(minutes) => {
                bytes.push(1);
                bytes.extend_from_slice(&minutes.to_le_bytes());
            }
            TimeUnit::Day(days) => {
                bytes.push(2);
                bytes.extend_from_slice(&days.to_le_bytes());
            }
        }
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        match bytes[0] {
            0 => TimeUnit::Hour(u64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]])),
            1 => TimeUnit::Minute(u64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]])),
            2 => TimeUnit::Day(u64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]])),
            _ => panic!("Unknown TimeUnit: {}", bytes[0]),
        }
    }
}

impl DecayType {
    fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        match self {
            DecayType::Flat(amount) => {
                bytes.push(0);
                bytes.extend_from_slice(&amount.to_le_bytes());
            }
            DecayType::Percent(percentage) => {
                bytes.push(1);
                bytes.extend_from_slice(&percentage.to_le_bytes());
            }
        }
        bytes
    }
    
    fn from_bytes(bytes: &[u8]) -> Self {
        match bytes[0] {
            0 => DecayType::Flat(u64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]])),
            1 => DecayType::Percent(f64::from_le_bytes([bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7], bytes[8]])),
            _ => panic!("Unknown DecayType: {}", bytes[0]),
        }
    }
}




