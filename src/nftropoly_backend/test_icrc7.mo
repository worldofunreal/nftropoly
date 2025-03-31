import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Hash "mo:base/Hash";
import Buffer "mo:base/Buffer";

actor class TestICRC7() = this {
    
    // Type definitions
    public type TokenId = Nat;
    public type Account = {
        owner: Principal;
        subaccount: ?Blob;
    };
    
    public type Subaccount = Blob;
    
    // Basic token metadata structure
    public type Metadata = {
        name: Text;
        description: ?Text;
        image: ?Text;
        attributes: [(Text, Text)];
    };
    
    // Token metadata with owner information
    public type TokenMetadata = {
        tokenId: TokenId;
        owner: Account;
        metadata: Metadata;
    };
    
    // ICRC7 standard operation types
    public type TransferArgs = {
        spender_subaccount: ?Blob;
        from: ?Account;
        to: Account;
        token_ids: [TokenId];
        memo: ?Blob;
        created_at_time: ?Nat64;
        is_atomic: ?Bool;
    };
    
    public type TransferError = {
        #Unauthorized: { token_ids: [TokenId] };
        #TooOld;
        #CreatedInFuture: { ledger_time: Nat64 };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };
    
    public type ApprovalArgs = {
        from_subaccount: ?Blob;
        spender: Account;
        token_ids: ?[TokenId];
        expires_at: ?Nat64;
        memo: ?Blob;
        created_at_time: ?Nat64;
    };
    
    public type ApprovalError = {
        #Unauthorized: { token_ids: [TokenId] };
        #TooOld;
        #CreatedInFuture: { ledger_time: Nat64 };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };
    
    public type MetadataResult = Result.Result<Metadata, {#InvalidTokenId}>;
    public type OwnerResult = Result.Result<Account, {#InvalidTokenId}>;
    public type BalanceResult = Result.Result<Nat, {#InvalidAccount}>;
    public type TokensOfResult = Result.Result<[TokenId], {#InvalidAccount}>;
    public type TransferReceipt = Result.Result<Nat, TransferError>;
    public type ApprovalReceipt = Result.Result<Nat, ApprovalError>;
    
    public type MintArgs = {
        to: Account;
        token_id: TokenId;
        metadata: Metadata;
    };
    
    public type MintError = {
        #Unauthorized;
        #InvalidTokenId;
        #AlreadyExistTokenId;
        #SupplyCapOverflow;
        #InvalidRecipient;
        #GenericError;
    };
    
    public type MintReceipt = Result.Result<TokenId, MintError>;
    
    // Collection metadata
    private stable var name: Text = "Test ICRC7 Collection";
    private stable var symbol: Text = "TEST";
    private stable var royalties: ?Nat16 = ?250; // 2.5% in basis points
    private stable var description: ?Text = ?("Test NFT collection for NFTropoly marketplace");
    private stable var totalSupply: Nat = 0;
    private stable var supplyCap: ?Nat = ?1000;
    
    // Collection owner
    private stable var owner: Account = {
        owner = Principal.fromText("aaaaa-aa"); // Default to management canister as placeholder
        subaccount = null;
    };
    
    // Tracking counters
    private stable var nextTokenId: Nat = 1;
    private stable var transferSequentialIndex: Nat = 0;
    private stable var approvalSequentialIndex: Nat = 0;
    
    // Transaction window parameters
    private let PERMITTED_DRIFT: Nat64 = 2 * 60 * 1_000_000_000; // 2 minutes in nanoseconds
    private let TX_WINDOW: Nat64 = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
    
    // State storage
    private stable var tokensEntries: [(TokenId, TokenMetadata)] = [];
    private stable var ownersEntries: [(Text, [TokenId])] = [];
    private stable var balancesEntries: [(Text, Nat)] = [];
    private stable var tokenApprovalsEntries: [(TokenId, [(Account, ?Nat64)])] = [];
    
    // Runtime state
    private var tokens = HashMap.HashMap<TokenId, TokenMetadata>(10, Nat.equal, Hash.hash);
    private var owners = HashMap.HashMap<Text, [TokenId]>(10, Text.equal, Text.hash);
    private var balances = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);
    private var tokenApprovals = HashMap.HashMap<TokenId, [(Account, ?Nat64)]>(10, Nat.equal, Hash.hash);
    
    // System functions for stable storage
    system func preupgrade() {
        tokensEntries := Iter.toArray(tokens.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balancesEntries := Iter.toArray(balances.entries());
        tokenApprovalsEntries := Iter.toArray(tokenApprovals.entries());
    };
    
    system func postupgrade() {
        tokens := HashMap.fromIter<TokenId, TokenMetadata>(
            Iter.fromArray(tokensEntries),
            tokensEntries.size(),
            Nat.equal,
            Hash.hash
        );
        owners := HashMap.fromIter<Text, [TokenId]>(
            Iter.fromArray(ownersEntries),
            ownersEntries.size(),
            Text.equal,
            Text.hash
        );
        balances := HashMap.fromIter<Text, Nat>(
            Iter.fromArray(balancesEntries),
            balancesEntries.size(),
            Text.equal,
            Text.hash
        );
        tokenApprovals := HashMap.fromIter<TokenId, [(Account, ?Nat64)]>(
            Iter.fromArray(tokenApprovalsEntries),
            tokenApprovalsEntries.size(),
            Nat.equal,
            Hash.hash
        );
        
        tokensEntries := [];
        ownersEntries := [];
        balancesEntries := [];
        tokenApprovalsEntries := [];
    };
    
    // Helper functions
    private func accountToText(account: Account): Text {
        let owner_str = Principal.toText(account.owner);
        switch (account.subaccount) {
            case (null) { owner_str # "-default" };
            case (?blob) { owner_str # "-subaccount" };
        }
    };
    
    private func getDefaultSubaccount(): Blob {
        Blob.fromArray([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    };
    
    private func acceptAccount(account: Account): Account {
        let effectiveSubaccount: Blob = switch (account.subaccount) {
            case (null) getDefaultSubaccount();
            case (?blob) blob;
        };
        
        return {
            owner = account.owner;
            subaccount = ?effectiveSubaccount;
        };
    };
    
    private func isOwner(tokenId: TokenId, account: Account): Bool {
        switch (tokens.get(tokenId)) {
            case (null) false;
            case (?token) {
                account.owner == token.owner.owner and
                (account.subaccount == token.owner.subaccount or
                account.subaccount == null);
            };
        };
    };
    
    private func isApproved(tokenId: TokenId, account: Account, now: Nat64): Bool {
        switch (tokenApprovals.get(tokenId)) {
            case (null) false;
            case (?approvals) {
                for ((approved, expiresAt) in approvals.vals()) {
                    if (approved.owner == account.owner and 
                        (approved.subaccount == account.subaccount or account.subaccount == null)) {
                        switch (expiresAt) {
                            case (null) return true;
                            case (?expires) {
                                if (expires > now) {
                                    return true;
                                };
                            };
                        };
                    };
                };
                false;
            };
        };
    };
    
    private func isAuthorized(tokenId: TokenId, account: Account, now: Nat64): Bool {
        isOwner(tokenId, account) or isApproved(tokenId, account, now);
    };
    
    private func exists(tokenId: TokenId): Bool {
        switch (tokens.get(tokenId)) {
            case (null) false;
            case (_) true;
        };
    };
    
    private func addTokenToOwner(account: Account, tokenId: TokenId) {
        let accountText = accountToText(account);
        let userTokens = switch (owners.get(accountText)) {
            case (null) [];
            case (?tokens) tokens;
        };
        owners.put(accountText, Array.append(userTokens, [tokenId]));
    };
    
    private func removeTokenFromOwner(account: Account, tokenId: TokenId) {
        let accountText = accountToText(account);
        switch (owners.get(accountText)) {
            case (null) {};
            case (?userTokens) {
                let updatedTokens = Array.filter<TokenId>(
                    userTokens,
                    func(id) { id != tokenId }
                );
                if (updatedTokens.size() == 0) {
                    owners.delete(accountText);
                } else {
                    owners.put(accountText, updatedTokens);
                };
            };
        };
    };
    
    private func incrementBalance(account: Account) {
        let accountText = accountToText(account);
        let currentBalance = switch (balances.get(accountText)) {
            case (null) 0;
            case (?balance) balance;
        };
        balances.put(accountText, currentBalance + 1);
    };
    
    private func decrementBalance(account: Account) {
        let accountText = accountToText(account);
        switch (balances.get(accountText)) {
            case (null) {};
            case (?balance) {
                if (balance > 0) {
                    balances.put(accountText, balance - 1);
                };
            };
        };
    };
    
    private func incrementTransferIndex() {
        transferSequentialIndex += 1;
    };
    
    private func incrementApprovalIndex() {
        approvalSequentialIndex += 1;
    };
    
    private func deleteTokenApprovals(tokenId: TokenId) {
        tokenApprovals.delete(tokenId);
    };
    
    private func nullishCoalescing<T>(opt: ?T, default: T): T {
        switch (opt) {
            case (null) default;
            case (?val) val;
        };
    };
    
    // ICRC7 public API implementation
    public query func icrc7_name(): async Text {
        name;
    };
    
    public query func icrc7_symbol(): async Text {
        symbol;
    };
    
    public query func icrc7_royalties(): async ?Nat16 {
        royalties;
    };
    
    public query func icrc7_royalty_recipient(): async ?Account {
        ?owner;
    };
    
    public query func icrc7_description(): async ?Text {
        description;
    };
    
    public query func icrc7_total_supply(): async Nat {
        totalSupply;
    };
    
    public query func icrc7_supply_cap(): async ?Nat {
        supplyCap;
    };
    
    public query func icrc7_metadata(tokenId: TokenId): async MetadataResult {
        switch (tokens.get(tokenId)) {
            case (null) #err(#InvalidTokenId);
            case (?token) #ok(token.metadata);
        };
    };
    
    public query func icrc7_owner_of(tokenId: TokenId): async OwnerResult {
        switch (tokens.get(tokenId)) {
            case (null) #err(#InvalidTokenId);
            case (?token) #ok(token.owner);
        };
    };
    
    public query func icrc7_balance_of(account: Account): async BalanceResult {
        let acceptedAccount = acceptAccount(account);
        let accountText = accountToText(acceptedAccount);
        
        switch (balances.get(accountText)) {
            case (null) #ok(0);
            case (?balance) #ok(balance);
        };
    };
    
    public query func icrc7_tokens_of(account: Account): async TokensOfResult {
        let acceptedAccount = acceptAccount(account);
        let accountText = accountToText(acceptedAccount);
        
        switch (owners.get(accountText)) {
            case (null) #ok([]);
            case (?userTokens) #ok(userTokens);
        };
    };
    
    public shared({caller}) func icrc7_transfer(args: TransferArgs): async TransferReceipt {
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Validate created_at_time if provided
        switch (args.created_at_time) {
            case (?created_at_time) {
                if (created_at_time < now - TX_WINDOW - PERMITTED_DRIFT) {
                    return #err(#TooOld);
                };
                
                if (created_at_time > now + PERMITTED_DRIFT) {
                    return #err(#CreatedInFuture({ ledger_time = now }));
                };
            };
            case (null) {};
        };
        
        // Check if token_ids array is empty
        if (args.token_ids.size() == 0) {
            return #err(#GenericError({
                error_code = 0;
                message = "Empty token_ids array";
            }));
        };
        
        // Check for duplicates in token_ids
        let duplicateCheck = HashMap.HashMap<TokenId, Bool>(10, Nat.equal, Hash.hash);
        for (tokenId in args.token_ids.vals()) {
            switch (duplicateCheck.get(tokenId)) {
                case (?_) {
                    return #err(#GenericError({
                        error_code = 1;
                        message = "Duplicate token IDs";
                    }));
                };
                case (null) {
                    duplicateCheck.put(tokenId, true);
                };
            };
        };
        
        // Determine the from account
        let callerAccount = {
            owner = caller;
            subaccount = args.spender_subaccount;
        };
        let acceptedCaller = acceptAccount(callerAccount);
        
        let fromAccount = switch (args.from) {
            case (null) acceptedCaller;
            case (?account) acceptAccount(account);
        };
        
        // Determine the to account
        let toAccount = acceptAccount(args.to);
        
        // Determine if atomic transfer
        let isAtomic = nullishCoalescing<Bool>(args.is_atomic, true);
        
        if (isAtomic) {
            // For atomic transfers, check all permissions first
            for (tokenId in args.token_ids.vals()) {
                if (not exists(tokenId)) {
                    return #err(#Unauthorized({ token_ids = [tokenId] }));
                };
                
                if (not isAuthorized(tokenId, acceptedCaller, now)) {
                    return #err(#Unauthorized({ token_ids = [tokenId] }));
                };
                
                if (not isOwner(tokenId, fromAccount)) {
                    return #err(#Unauthorized({ token_ids = [tokenId] }));
                };
            };
            
            // Perform all transfers
            for (tokenId in args.token_ids.vals()) {
                // Get current token data
                switch (tokens.get(tokenId)) {
                    case (null) {}; // Should never happen as we checked existence
                    case (?token) {
                        // Remove from current owner
                        removeTokenFromOwner(token.owner, tokenId);
                        decrementBalance(token.owner);
                        
                        // Update token owner
                        let updatedToken = {
                            tokenId = token.tokenId;
                            owner = toAccount;
                            metadata = token.metadata;
                        };
                        tokens.put(tokenId, updatedToken);
                        
                        // Add to new owner
                        addTokenToOwner(toAccount, tokenId);
                        incrementBalance(toAccount);
                        
                        // Clear approvals
                        deleteTokenApprovals(tokenId);
                    };
                };
            };
        } else {
            // Non-atomic transfers
            let transferredTokens = Buffer.Buffer<TokenId>(0);
            let errors = Buffer.Buffer<TransferError>(0);
            
            for (tokenId in args.token_ids.vals()) {
                let canTransfer = exists(tokenId) and 
                                 isAuthorized(tokenId, acceptedCaller, now) and
                                 isOwner(tokenId, fromAccount);
                
                if (not exists(tokenId)) {
                    errors.add(#Unauthorized({ token_ids = [tokenId] }));
                } else if (not isAuthorized(tokenId, acceptedCaller, now)) {
                    errors.add(#Unauthorized({ token_ids = [tokenId] }));
                } else if (not isOwner(tokenId, fromAccount)) {
                    errors.add(#Unauthorized({ token_ids = [tokenId] }));
                } else {
                    // Get current token data
                    switch (tokens.get(tokenId)) {
                        case (null) {}; // Should never happen as we checked existence
                        case (?token) {
                            // Remove from current owner
                            removeTokenFromOwner(token.owner, tokenId);
                            decrementBalance(token.owner);
                            
                            // Update token owner
                            let updatedToken = {
                                tokenId = token.tokenId;
                                owner = toAccount;
                                metadata = token.metadata;
                            };
                            tokens.put(tokenId, updatedToken);
                            
                            // Add to new owner
                            addTokenToOwner(toAccount, tokenId);
                            incrementBalance(toAccount);
                            
                            // Clear approvals
                            deleteTokenApprovals(tokenId);
                            
                            transferredTokens.add(tokenId);
                        };
                    };
                };
            };
            
            if (errors.size() > 0) {
                return #err(errors.get(0));
            };
        };
        
        let txId = transferSequentialIndex;
        incrementTransferIndex();
        
        #ok(txId);
    };
    
    public shared({caller}) func icrc7_approve(args: ApprovalArgs): async ApprovalReceipt {
        let now = Nat64.fromNat(Int.abs(Time.now()));
        
        // Validate created_at_time if provided
        switch (args.created_at_time) {
            case (?created_at_time) {
                if (created_at_time < now - TX_WINDOW - PERMITTED_DRIFT) {
                    return #err(#TooOld);
                };
            };
            case (null) {};
        };
        
        // Check that caller isn't approving self
        let callerAccount = {
            owner = caller; 
            subaccount = args.from_subaccount;
        };
        let acceptedCaller = acceptAccount(callerAccount);
        let acceptedSpender = acceptAccount(args.spender);
        
        if (acceptedCaller.owner == acceptedSpender.owner and 
            acceptedCaller.subaccount == acceptedSpender.subaccount) {
            return #err(#GenericError({
                error_code = 0;
                message = "Self-approval not allowed";
            }));
        };
        
        // Handle token specific approvals
        let tokenIds = switch(args.token_ids) {
            case (null) [];
            case (?ids) ids;
        };
        
        // Check if caller owns all the tokens they're trying to approve
        let unauthorizedTokens = Buffer.Buffer<TokenId>(0);
        for (tokenId in tokenIds.vals()) {
            if (not exists(tokenId)) {
                unauthorizedTokens.add(tokenId);
            } else if (not isOwner(tokenId, acceptedCaller)) {
                unauthorizedTokens.add(tokenId);
            };
        };
        
        if (unauthorizedTokens.size() > 0) {
            return #err(#Unauthorized({ 
                token_ids = Buffer.toArray(unauthorizedTokens)
            }));
        };
        
        // Create the approvals
        for (tokenId in tokenIds.vals()) {
            let tokenApprovalList = switch (tokenApprovals.get(tokenId)) {
                case (null) [];
                case (?approvals) approvals;
            };
            
            // Remove any existing approval for this spender
            let filteredApprovals = Array.filter<(Account, ?Nat64)>(
                tokenApprovalList,
                func((account, _)) {
                    account.owner != acceptedSpender.owner or 
                    (account.subaccount != acceptedSpender.subaccount and acceptedSpender.subaccount != null)
                }
            );
            
            // Add the new approval
            let updatedApprovals = Array.append<(Account, ?Nat64)>(
                filteredApprovals, 
                [(acceptedSpender, args.expires_at)]
            );
            
            tokenApprovals.put(tokenId, updatedApprovals);
        };
        
        let approvalId = approvalSequentialIndex;
        incrementApprovalIndex();
        
        #ok(approvalId);
    };
    
    public query func icrc7_supported_standards(): async [{ name: Text; url: Text }] {
        [{ 
            name = "ICRC-7"; 
            url = "https://github.com/dfinity/ICRC/ICRCs/ICRC-7" 
        }];
    };
    
    // Minting functionality for testing
    public shared({caller}) func mint(args: MintArgs): async MintReceipt {
        // Only the owner can mint
        if (caller != owner.owner) {
            return #err(#Unauthorized);
        };
        
        // Check supply cap
        switch (supplyCap) {
            case (?cap) {
                if (totalSupply + 1 > cap) {
                    return #err(#SupplyCapOverflow);
                };
            };
            case (null) {};
        };
        
        // Check recipient
        let acceptedTo = acceptAccount(args.to);
        if (Principal.isAnonymous(acceptedTo.owner)) {
            return #err(#InvalidRecipient);
        };
        
        // Check token ID
        if (exists(args.token_id)) {
            return #err(#AlreadyExistTokenId);
        };
        
        // Create the token
        let newToken: TokenMetadata = {
            tokenId = args.token_id;
            owner = acceptedTo;
            metadata = args.metadata;
        };
        
        // Store the token
        tokens.put(args.token_id, newToken);
        
        // Update owner's token list and balance
        addTokenToOwner(acceptedTo, args.token_id);
        incrementBalance(acceptedTo);
        
        // Update total supply
        totalSupply += 1;
        
        // If mint uses custom ID, ensure nextTokenId is updated
        if (args.token_id >= nextTokenId) {
            nextTokenId := args.token_id + 1;
        };
        
        #ok(args.token_id);
    };
    
    // Simple mint without specifying token ID (auto-increments)
    public shared({caller}) func mint_nft(to: Account, name: Text, desc: Text, image: ?Text): async MintReceipt {
        let tokenId = nextTokenId;
        
        let metadata: Metadata = {
            name = name;
            description = ?desc;
            image = image;
            attributes = [];
        };
        
        let args: MintArgs = {
            to = to;
            token_id = tokenId;
            metadata = metadata;
        };
        
        let result = await mint(args);
        
        // If mint was successful, update nextTokenId
        switch (result) {
            case (#ok(_)) {
                nextTokenId += 1;
            };
            case (_) {};
        };
        
        result;
    };
    
    
    // Update collection owner
    public shared({caller}) func set_collection_owner(newOwner: Account): async Bool {
        if (caller != owner.owner) {
            return false;
        };
        
        owner := acceptAccount(newOwner);
        return true;
    };
} 