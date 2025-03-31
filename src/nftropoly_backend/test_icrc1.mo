import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Hash "mo:base/Hash";

actor class TestICRC1() = this {
    // Types
    public type Account = {
        owner : Principal;
        subaccount : ?Blob;
    };

    public type Balance = Nat;

    public type TransferArgs = {
        from_subaccount : ?Blob;
        to : Account;
        amount : Balance;
        fee : ?Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type TransferError = {
        #BadFee : { expected_fee : Balance };
        #BadBurn : { min_burn_amount : Balance };
        #InsufficientFunds : { balance : Balance };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };

    public type TransferResult = Result.Result<Nat, TransferError>;

    public type Mint = {
        to : Account;
        amount : Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type BurnArgs = {
        from_subaccount : ?Blob;
        amount : Balance;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };

    public type TransactionType = {
        #mint;
        #burn;
        #transfer;
    };

    public type Transaction = {
        kind : TransactionType;
        mint : ?{
            to : Account;
            amount : Balance;
            memo : ?Blob;
        };
        burn : ?{
            from : Account;
            amount : Balance;
            memo : ?Blob;
        };
        transfer : ?{
            from : Account;
            to : Account;
            amount : Balance;
            fee : Balance;
            memo : ?Blob;
        };
        timestamp : Nat64;
        index : Nat;
    };

    public type GetTransactionsRequest = {
        start : ?Nat;
        length : ?Nat;
    };

    public type GetTransactionsResponse = {
        log_length : Nat;
        first_index : Nat;
        transactions : [Transaction];
    };

    public type MetaDatum = {
        name : Text;
        value : Text;
    };

    public type SupportedStandard = {
        name : Text;
        url : Text;
    };

    // Helper functions (defined before being used)
    private func blobEqual(a : ?Blob, b : ?Blob) : Bool {
        switch (a, b) {
            case (null, null) { true };
            case (?a_, ?b_) { a_ == b_ };
            case (_, _) { false };
        }
    };

    private func accountsEqual(a : Account, b : Account) : Bool {
        Principal.equal(a.owner, b.owner) and
        blobEqual(a.subaccount, b.subaccount)
    };

    private func accountsHash(account : Account) : Hash.Hash {
        let p = Principal.hash(account.owner);
        switch (account.subaccount) {
            case (null) { p };
            case (?blob) { p +% Blob.hash(blob) };
        }
    };

    private func getDefaultSubaccount() : Blob {
        Blob.fromArray([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
    };

    private func standardizeAccount(account : Account) : Account {
        let subaccount = switch (account.subaccount) {
            case (null) { getDefaultSubaccount() };
            case (?sub) { sub };
        };
        { owner = account.owner; subaccount = ?subaccount }
    };

    private func incrementCounter() : Nat {
        let current = transaction_counter;
        transaction_counter += 1;
        current
    };

    // State variables
    private stable var name_ : Text = "Test Token";
    private stable var symbol_ : Text = "TTK";
    private stable var decimals_ : Nat8 = 8;
    private stable var fee_ : Balance = 10_000; // 0.0001 token
    private stable var total_supply_ : Balance = 0;
    private stable var minting_account_ : Account = {
        owner = Principal.fromText("aaaaa-aa"); // Default to management canister
        subaccount = null;
    };
    private stable var transaction_counter : Nat = 0;
    private stable var burn_counter : Nat = 0;
    private stable var min_burn_amount_ : Nat = 10_000; // 0.0001 token

    // Balances
    private stable var balancesEntries : [(Account, Balance)] = [];
    private var balances = HashMap.HashMap<Account, Balance>(10, accountsEqual, accountsHash);

    // Transactions
    private stable var transactionsEntries : [(Nat, Transaction)] = [];
    private var transactions = HashMap.HashMap<Nat, Transaction>(10, Nat.equal, Hash.hash);

    // System functions
    system func preupgrade() {
        balancesEntries := Iter.toArray(balances.entries());
        transactionsEntries := Iter.toArray(transactions.entries());
    };

    system func postupgrade() {
        balances := HashMap.fromIter<Account, Balance>(
            Iter.fromArray(balancesEntries),
            balancesEntries.size(),
            accountsEqual,
            accountsHash
        );
        transactions := HashMap.fromIter<Nat, Transaction>(
            Iter.fromArray(transactionsEntries),
            transactionsEntries.size(),
            Nat.equal,
            Hash.hash
        );
        
        balancesEntries := [];
        transactionsEntries := [];
    };

    // Public API
    public query func icrc1_name() : async Text {
        name_
    };

    public query func icrc1_symbol() : async Text {
        symbol_
    };

    public query func icrc1_decimals() : async Nat8 {
        decimals_
    };

    public query func icrc1_fee() : async Balance {
        fee_
    };

    public query func icrc1_metadata() : async [MetaDatum] {
        [
            { name = "icrc1:name"; value = name_ },
            { name = "icrc1:symbol"; value = symbol_ },
            { name = "icrc1:decimals"; value = Nat8.toText(decimals_) },
            { name = "icrc1:fee"; value = Nat.toText(fee_) }
        ]
    };

    public query func icrc1_total_supply() : async Balance {
        total_supply_
    };

    public query func icrc1_minting_account() : async ?Account {
        ?minting_account_
    };

    public query func icrc1_balance_of(account : Account) : async Balance {
        let standardized = standardizeAccount(account);
        switch (balances.get(standardized)) {
            case (null) { 0 };
            case (?balance) { balance };
        }
    };

    public query func icrc1_supported_standards() : async [SupportedStandard] {
        [{ name = "ICRC-1"; url = "https://github.com/dfinity/ICRC-1" }]
    };

    public shared(msg) func icrc1_transfer(args : TransferArgs) : async TransferResult {
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Validate timestamp if provided
        switch (args.created_at_time) {
            case (?created_at_time) {
                // Check if too old (24 hours)
                if (created_at_time < now - 24 * 60 * 60 * 1_000_000_000) {
                    return #err(#TooOld);
                };
                
                // Check if in future (with 2 minute allowed drift)
                if (created_at_time > now + 2 * 60 * 1_000_000_000) {
                    return #err(#CreatedInFuture({ ledger_time = now }));
                };
            };
            case (null) {};
        };
        
        // Fee validation
        let effectiveFee = switch (args.fee) {
            case (null) { fee_ };
            case (?f) { f };
        };
        
        if (effectiveFee != fee_) {
            return #err(#BadFee({ expected_fee = fee_ }));
        };
        
        // Create standardized accounts
        let sender = {
            owner = msg.caller;
            subaccount = args.from_subaccount;
        };
        let standardizedFrom = standardizeAccount(sender);
        let standardizedTo = standardizeAccount(args.to);
        
        // Get sender balance
        let senderBalance = switch (balances.get(standardizedFrom)) {
            case (null) { 0 };
            case (?balance) { balance };
        };
        
        // Check sufficient funds (amount + fee)
        if (senderBalance < args.amount + effectiveFee) {
            return #err(#InsufficientFunds({ balance = senderBalance }));
        };
        
        // Update sender balance
        balances.put(standardizedFrom, senderBalance - args.amount - effectiveFee);
        
        // Update recipient balance
        let recipientBalance = switch (balances.get(standardizedTo)) {
            case (null) { 0 };
            case (?balance) { balance };
        };
        
        balances.put(standardizedTo, recipientBalance + args.amount);
        
        // Record transaction
        let txIndex = incrementCounter();
        let tx : Transaction = {
            kind = #transfer;
            mint = null;
            burn = null;
            transfer = ?{
                from = standardizedFrom;
                to = standardizedTo;
                amount = args.amount;
                fee = effectiveFee;
                memo = args.memo;
            };
            timestamp = now;
            index = txIndex;
        };
        
        transactions.put(txIndex, tx);
        
        #ok(txIndex)
    };

    public shared(msg) func mint(args : Mint) : async TransferResult {
        // Only allow the minting account to mint
        if (msg.caller != minting_account_.owner) {
            return #err(#GenericError({
                error_code = 401;
                message = "Unauthorized: Only the minting account can mint tokens";
            }));
        };
        
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Validate timestamp if provided
        switch (args.created_at_time) {
            case (?created_at_time) {
                // Check if too old (24 hours)
                if (created_at_time < now - 24 * 60 * 60 * 1_000_000_000) {
                    return #err(#TooOld);
                };
                
                // Check if in future (with 2 minute allowed drift)
                if (created_at_time > now + 2 * 60 * 1_000_000_000) {
                    return #err(#CreatedInFuture({ ledger_time = now }));
                };
            };
            case (null) {};
        };
        
        // Mint tokens
        let standardizedTo = standardizeAccount(args.to);
        
        // Update recipient balance
        let recipientBalance = switch (balances.get(standardizedTo)) {
            case (null) { 0 };
            case (?balance) { balance };
        };
        
        balances.put(standardizedTo, recipientBalance + args.amount);
        
        // Update total supply
        total_supply_ += args.amount;
        
        // Record transaction
        let txIndex = incrementCounter();
        let tx : Transaction = {
            kind = #mint;
            mint = ?{
                to = standardizedTo;
                amount = args.amount;
                memo = args.memo;
            };
            burn = null;
            transfer = null;
            timestamp = now;
            index = txIndex;
        };
        
        transactions.put(txIndex, tx);
        
        #ok(txIndex)
    };

    public shared(msg) func burn(args : BurnArgs) : async TransferResult {
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Validate timestamp if provided
        switch (args.created_at_time) {
            case (?created_at_time) {
                if (created_at_time < now - 24 * 60 * 60 * 1_000_000_000) {
                    return #err(#TooOld);
                };
                
                if (created_at_time > now + 2 * 60 * 1_000_000_000) {
                    return #err(#CreatedInFuture({ ledger_time = now }));
                };
            };
            case (null) {};
        };
        
        // Check minimum burn amount
        if (args.amount < min_burn_amount_) {
            return #err(#BadBurn({ min_burn_amount = min_burn_amount_ }));
        };
        
        // Create standardized account
        let sender = {
            owner = msg.caller;
            subaccount = args.from_subaccount;
        };
        let standardizedFrom = standardizeAccount(sender);
        
        // Get sender balance
        let senderBalance = switch (balances.get(standardizedFrom)) {
            case (null) { 0 };
            case (?balance) { balance };
        };
        
        // Check sufficient funds
        if (senderBalance < args.amount) {
            return #err(#InsufficientFunds({ balance = senderBalance }));
        };
        
        // Update sender balance
        balances.put(standardizedFrom, senderBalance - args.amount);
        
        // Update total supply
        total_supply_ -= args.amount;
        
        // Record transaction
        let txIndex = incrementCounter();
        let tx : Transaction = {
            kind = #burn;
            mint = null;
            burn = ?{
                from = standardizedFrom;
                amount = args.amount;
                memo = args.memo;
            };
            transfer = null;
            timestamp = now;
            index = txIndex;
        };
        
        transactions.put(txIndex, tx);
        
        burn_counter += 1;
        #ok(txIndex)
    };

    public query func get_transactions(req : GetTransactionsRequest) : async GetTransactionsResponse {
        let start = Option.get(req.start, 0);
        let length = Option.get(req.length, 10);
        
        let txs = Buffer.Buffer<Transaction>(length);
        var count = 0;
        var current_index = start;
        
        while (count < length and current_index < transaction_counter) {
            switch (transactions.get(current_index)) {
                case (?tx) {
                    txs.add(tx);
                    count += 1;
                };
                case (null) { /* Skip */ };
            };
            current_index += 1;
        };
        
        {
            log_length = transaction_counter;
            first_index = start;
            transactions = Buffer.toArray(txs);
        }
    };
    
    // Admin functions (for testing)
    public shared(msg) func set_minting_account(account : Account) : async Bool {
        if (msg.caller != minting_account_.owner) {
            return false;
        };
        minting_account_ := account;
        true
    };
    
    public shared(msg) func airdrop(to : Account, amount : Balance) : async TransferResult {
        // This is for testing - allow anyone to get test tokens
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Mint tokens
        let standardizedTo = standardizeAccount(to);
        
        // Update recipient balance
        let recipientBalance = switch (balances.get(standardizedTo)) {
            case (null) { 0 };
            case (?balance) { balance };
        };
        
        balances.put(standardizedTo, recipientBalance + amount);
        
        // Update total supply
        total_supply_ += amount;
        
        // Record transaction
        let txIndex = incrementCounter();
        let tx : Transaction = {
            kind = #mint;
            mint = ?{
                to = standardizedTo;
                amount = amount;
                memo = null;
            };
            burn = null;
            transfer = null;
            timestamp = now;
            index = txIndex;
        };
        
        transactions.put(txIndex, tx);
        
        #ok(txIndex)
    };
} 