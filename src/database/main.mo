import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";

import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Char "mo:base/Char";
import Float "mo:base/Float";
import Nat32 "mo:base/Nat32";
import Types "./types";

actor UserDatabase {
    
    // Import types
    type UserProfile = Types.UserProfile;
    type RegistrationData = Types.RegistrationData;
    type ProfileUpdate = Types.ProfileUpdate;
    type UserSearchResult = Types.UserSearchResult;
    type ApiResult<T> = Types.ApiResult<T>;
    type ApiError = Types.ApiError;

    // Stable storage for user profiles
    stable var _users: [(Principal, UserProfile)] = [];
    stable var _usernames: [(Text, Principal)] = []; // Username -> Principal mapping for uniqueness
    
    var users = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);
    var usernames = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);

    // On canister upgrade/downgrade, preserve data
    system func preupgrade() {
        _users := Iter.toArray(users.entries());
        _usernames := Iter.toArray(usernames.entries());
    };
    
    system func postupgrade() {
        users := HashMap.fromIter(_users.vals(), _users.size(), Principal.equal, Principal.hash);
        usernames := HashMap.fromIter(_usernames.vals(), _usernames.size(), Text.equal, Text.hash);
        _users := [];
        _usernames := [];
    };

    // Helper function to create default profile settings
    private func createDefaultProfile(caller: Principal, data: RegistrationData) : UserProfile {
        let now = Time.now();
        {
            // Basic Information
            username = data.username;
            displayName = data.displayName;
            bio = data.bio;
            email = data.email;
            location = null;
            
            // Account metadata
            createdAt = now;
            lastActiveAt = now;
            isVerified = false;
            
            // Wallet and identity
            wallet = {
                ethAddress = data.ethAddress;
                icpPrincipal = Principal.toText(caller);
                walletType = data.walletType;
                connectedAt = now;
            };
            
            // Social presence
            socialLinks = data.socialLinks;
            
            // Profile customization
            assets = {
                avatarUrl = null;
                bannerUrl = null;
                avatarPreset = data.avatarPreset;
            };
            
            // Privacy and preferences
            privacy = data.privacy;
            
            // Statistics and achievements
            portfolio = {
                totalValueEth = 0.0;
                totalValueUsd = 0.0;
                nftCount = 0;
                tokenCount = 0;
                nftPercentage = 0.0;
                tokenPercentage = 0.0;
                lastUpdated = now;
            };
            
            experience = {
                xp = 0;
                level = 1;
                badges = [];
                achievements = [];
            };
            
            // Activity tracking
            totalTransactions = 0;
            totalVolume = 0.0;
            followersCount = 0;
            followingCount = 0;
        }
    };

    // Validate username (alphanumeric, underscore, 3-20 chars)
    private func isValidUsername(username: Text) : Bool {
        let chars = Text.toIter(username);
        var length = 0;
        for (char in chars) {
            length += 1;
            let c = Nat32.toNat(Char.toNat32(char));
            // Allow a-z, A-Z, 0-9, underscore
            if (not ((c >= 97 and c <= 122) or (c >= 65 and c <= 90) or (c >= 48 and c <= 57) or c == 95)) {
                return false;
            };
        };
        length >= 3 and length <= 20
    };

    // Public API Functions

    // Register a new user
    public shared ({ caller }) func registerUser(data: RegistrationData) : async ApiResult<UserProfile> {
        // Check if user already exists
        switch (users.get(caller)) {
            case (?_) { return #err(#UserAlreadyExists); };
            case null {};
        };

        // Validate username
        if (not isValidUsername(data.username)) {
            return #err(#InvalidInput("Username must be 3-20 characters, alphanumeric and underscore only"));
        };

        // Check if username is taken
        switch (usernames.get(data.username)) {
            case (?_) { return #err(#InvalidInput("Username already taken")); };
            case null {};
        };

        // Create and store user profile
        let profile = createDefaultProfile(caller, data);
        users.put(caller, profile);
        usernames.put(data.username, caller);
        
        #ok(profile)
    };

    // Get current user's profile
    public query ({ caller }) func getMyProfile() : async ?UserProfile {
        users.get(caller)
    };

    // Get any user's profile by principal
    public query func getUserProfile(principal: Principal) : async ?UserProfile {
        users.get(principal)
    };

    // Get user profile by username
    public query func getUserByUsername(username: Text) : async ?UserProfile {
        switch (usernames.get(username)) {
            case (?principal) { users.get(principal) };
            case null { null };
        }
    };

    // Update user profile (partial update)
    public shared ({ caller }) func updateProfile(update: ProfileUpdate) : async ApiResult<UserProfile> {
        switch (users.get(caller)) {
            case null { return #err(#UserNotFound); };
            case (?currentProfile) {
                let updatedProfile: UserProfile = {
                    currentProfile with
                    displayName = switch (update.displayName) { case (?val) ?val; case null currentProfile.displayName };
                    bio = switch (update.bio) { case (?val) ?val; case null currentProfile.bio };
                    email = switch (update.email) { case (?val) ?val; case null currentProfile.email };
                    location = switch (update.location) { case (?val) ?val; case null currentProfile.location };
                    socialLinks = switch (update.socialLinks) { case (?val) val; case null currentProfile.socialLinks };
                    privacy = switch (update.privacy) { case (?val) val; case null currentProfile.privacy };
                    lastActiveAt = Time.now();
                    assets = {
                        currentProfile.assets with
                        avatarUrl = switch (update.avatarUrl) { case (?val) ?val; case null currentProfile.assets.avatarUrl };
                        bannerUrl = switch (update.bannerUrl) { case (?val) ?val; case null currentProfile.assets.bannerUrl };
                        avatarPreset = switch (update.avatarPreset) { case (?val) ?val; case null currentProfile.assets.avatarPreset };
                    };
                };
                users.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
        }
    };

    // Update portfolio statistics (called by marketplace/tracking services)
    public shared ({ caller }) func updatePortfolioStats(
        totalValueEth: Float,
        totalValueUsd: Float,
        nftCount: Nat,
        tokenCount: Nat
    ) : async ApiResult<Types.PortfolioStats> {
        switch (users.get(caller)) {
            case null { return #err(#UserNotFound); };
            case (?currentProfile) {
                let total = nftCount + tokenCount;
                let nftPercentage = if (total > 0) { Float.fromInt(nftCount) / Float.fromInt(total) * 100.0 } else { 0.0 };
                let tokenPercentage = if (total > 0) { Float.fromInt(tokenCount) / Float.fromInt(total) * 100.0 } else { 0.0 };
                
                let updatedStats = {
                    totalValueEth = totalValueEth;
                    totalValueUsd = totalValueUsd;
                    nftCount = nftCount;
                    tokenCount = tokenCount;
                    nftPercentage = nftPercentage;
                    tokenPercentage = tokenPercentage;
                    lastUpdated = Time.now();
                };
                
                let updatedProfile = {
                    currentProfile with
                    portfolio = updatedStats;
                    lastActiveAt = Time.now();
                };
                
                users.put(caller, updatedProfile);
                #ok(updatedStats)
            };
        }
    };

    // Search users by username (for discovery)
    public query func searchUsers(searchTerm: Text, limit: Nat) : async [UserSearchResult] {
        let results = Buffer.Buffer<UserSearchResult>(0);
        let maxResults = if (limit > 50) { 50 } else { limit }; // Cap at 50 results
        
        if (Text.size(searchTerm) < 2) {
            return Buffer.toArray(results);
        };
        
        label searchLoop for ((principal, profile) in users.entries()) {
            if (results.size() >= maxResults) {
                break searchLoop;
            };
            
            // Check if username or display name contains search term (case insensitive)
            let searchTermLower = Text.toLowercase(searchTerm);
            let usernameMatch = Text.contains(Text.toLowercase(profile.username), #text searchTermLower);
            let displayNameMatch = switch (profile.displayName) {
                case (?displayName) { Text.contains(Text.toLowercase(displayName), #text searchTermLower) };
                case null { false };
            };
            
            if (usernameMatch or displayNameMatch) {
                results.add({
                    principal = principal;
                    username = profile.username;
                    displayName = profile.displayName;
                    avatarUrl = profile.assets.avatarUrl;
                    avatarPreset = profile.assets.avatarPreset;
                    isVerified = profile.isVerified;
                    followersCount = profile.followersCount;
                });
            };
        };
        
        Buffer.toArray(results)
    };

    // Check if username is available
    public query func isUsernameAvailable(username: Text) : async Bool {
        if (not isValidUsername(username)) {
            return false;
        };
        Option.isNull(usernames.get(username))
    };

    // Get user count (for stats)
    public query func getUserCount() : async Nat {
        users.size()
    };

    // Get users by verification status (for admin)
    public query func getVerifiedUsers(limit: Nat) : async [UserSearchResult] {
        let results = Buffer.Buffer<UserSearchResult>(0);
        let maxResults = if (limit > 100) { 100 } else { limit };
        
        label verifiedLoop for ((principal, profile) in users.entries()) {
            if (results.size() >= maxResults) {
                break verifiedLoop;
            };
            
            if (profile.isVerified) {
                results.add({
                    principal = principal;
                    username = profile.username;
                    displayName = profile.displayName;
                    avatarUrl = profile.assets.avatarUrl;
                    avatarPreset = profile.assets.avatarPreset;
                    isVerified = profile.isVerified;
                    followersCount = profile.followersCount;
                });
            };
        };
        
        Buffer.toArray(results)
    };

    // Legacy compatibility - keep the old signup function for existing integrations
    public shared ({ caller }) func signup(username: Text) : async Result.Result<UserProfile, Text> {
        let defaultData: RegistrationData = {
            username = username;
            displayName = null;
            bio = null;
            email = null;
            ethAddress = null;
            walletType = "unknown";
            avatarPreset = ?1;
            socialLinks = {
                twitter = null;
                discord = null;
                instagram = null;
                website = null;
                telegram = null;
            };
            privacy = {
                profilePublic = true;
                showPortfolio = true;
                showActivity = true;
                showEmail = false;
            };
        };
        
        switch (await registerUser(defaultData)) {
            case (#ok(profile)) { #ok(profile) };
            case (#err(error)) {
                switch (error) {
                    case (#UserAlreadyExists) { #err("User already exists") };
                    case (#InvalidInput(msg)) { #err(msg) };
                    case (_) { #err("Registration failed") };
                }
            };
        }
    };

    // Legacy compatibility - keep the old getUser function
    public query ({ caller }) func getUser() : async ?UserProfile {
        users.get(caller)
    };
};