import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";

module {
    // Social media links structure
    public type SocialLinks = {
        twitter: ?Text;
        discord: ?Text;
        instagram: ?Text;
        website: ?Text;
        telegram: ?Text;
    };

    // Portfolio statistics
    public type PortfolioStats = {
        totalValueEth: Float;
        totalValueUsd: Float;
        nftCount: Nat;
        tokenCount: Nat;
        nftPercentage: Float;
        tokenPercentage: Float;
        lastUpdated: Time.Time;
    };

    // Profile privacy settings
    public type PrivacySettings = {
        profilePublic: Bool;
        showPortfolio: Bool;
        showActivity: Bool;
        showEmail: Bool;
    };

    // Wallet information
    public type WalletInfo = {
        ethAddress: ?Text;
        icpPrincipal: Text; // Always present as we use ICP for identity
        walletType: Text; // "metamask", "phantom", "plug", "internet-identity", etc.
        connectedAt: Time.Time;
    };

    // Asset URLs for profile images
    public type ProfileAssets = {
        avatarUrl: ?Text; // URL to profile picture in asset canister
        bannerUrl: ?Text; // URL to banner image in asset canister
        avatarPreset: ?Nat; // Fallback to preset avatar (1-12)
    };

    // Experience and achievements system
    public type UserExperience = {
        xp: Nat;
        level: Nat;
        badges: [Text]; // Array of earned badge IDs
        achievements: [Text]; // Array of achievement IDs
    };

    // Main user profile structure
    public type UserProfile = {
        // Basic Information
        username: Text;
        displayName: ?Text; // Optional display name different from username
        bio: ?Text;
        email: ?Text;
        location: ?Text;
        
        // Account metadata
        createdAt: Time.Time;
        lastActiveAt: Time.Time;
        isVerified: Bool;
        
        // Wallet and identity
        wallet: WalletInfo;
        
        // Social presence
        socialLinks: SocialLinks;
        
        // Profile customization
        assets: ProfileAssets;
        
        // Privacy and preferences
        privacy: PrivacySettings;
        
        // Statistics and achievements
        portfolio: PortfolioStats;
        experience: UserExperience;
        
        // Activity tracking
        totalTransactions: Nat;
        totalVolume: Float; // In ETH
        followersCount: Nat;
        followingCount: Nat;
    };

    // Registration input structure
    public type RegistrationData = {
        username: Text;
        displayName: ?Text;
        bio: ?Text;
        email: ?Text;
        ethAddress: ?Text;
        walletType: Text;
        avatarPreset: ?Nat;
        socialLinks: SocialLinks;
        privacy: PrivacySettings;
    };

    // Profile update structure (for partial updates)
    public type ProfileUpdate = {
        displayName: ?Text;
        bio: ?Text;
        email: ?Text;
        location: ?Text;
        socialLinks: ?SocialLinks;
        privacy: ?PrivacySettings;
        avatarUrl: ?Text;
        bannerUrl: ?Text;
        avatarPreset: ?Nat;
    };

    // Search and discovery
    public type UserSearchResult = {
        principal: Principal;
        username: Text;
        displayName: ?Text;
        avatarUrl: ?Text;
        avatarPreset: ?Nat;
        isVerified: Bool;
        followersCount: Nat;
    };

    // API Response types
    public type ApiResult<T> = Result.Result<T, ApiError>;
    
    public type ApiError = {
        #UserNotFound;
        #UserAlreadyExists;
        #InvalidInput: Text;
        #Unauthorized;
        #InternalError: Text;
        #AssetUploadFailed: Text;
        #RateLimited;
    };

    // Asset upload types
    public type AssetType = {
        #Avatar;
        #Banner;
    };

    public type AssetUpload = {
        data: Blob;
        contentType: Text;
        fileName: Text;
        assetType: AssetType;
    };

    public type UploadResult = {
        url: Text;
        assetId: Text;
        uploadedAt: Time.Time;
    };
}
