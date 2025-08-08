import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Types "./types";

actor AssetCanister {
    
    type AssetType = Types.AssetType;
    type AssetUpload = Types.AssetUpload;
    type UploadResult = Types.UploadResult;
    type ApiResult<T> = Types.ApiResult<T>;

    // Asset metadata
    public type Asset = {
        id: Text;
        owner: Principal;
        contentType: Text;
        fileName: Text;
        size: Nat;
        data: Blob;
        assetType: AssetType;
        uploadedAt: Time.Time;
        lastAccessed: Time.Time;
    };

    // Stable storage for assets
    stable var _assets: [(Text, Asset)] = [];
    stable var _assetCounter: Nat = 0;
    
    var assets = HashMap.HashMap<Text, Asset>(100, Text.equal, Text.hash);
    var assetCounter = _assetCounter;

    // Maximum file sizes (in bytes)
    private let MAX_AVATAR_SIZE = 2_000_000; // 2MB
    private let MAX_BANNER_SIZE = 5_000_000; // 5MB
    
    // Allowed content types
    private let ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    system func preupgrade() {
        _assets := Iter.toArray(assets.entries());
        _assetCounter := assetCounter;
    };
    
    system func postupgrade() {
        assets := HashMap.fromIter(_assets.vals(), _assets.size(), Text.equal, Text.hash);
        assetCounter := _assetCounter;
        _assets := [];
    };

    // Helper functions
    private func generateAssetId(owner: Principal, assetType: AssetType) : Text {
        assetCounter += 1;
        let typeStr = switch (assetType) {
            case (#Avatar) { "avatar" };
            case (#Banner) { "banner" };
        };
        Principal.toText(owner) # "_" # typeStr # "_" # Int.toText(assetCounter)
    };

    private func isValidContentType(contentType: Text) : Bool {
        switch (Array.find<Text>(ALLOWED_IMAGE_TYPES, func(x) = x == contentType)) {
            case (?_) { true };
            case null { false };
        }
    };

    private func getMaxSize(assetType: AssetType) : Nat {
        switch (assetType) {
            case (#Avatar) { MAX_AVATAR_SIZE };
            case (#Banner) { MAX_BANNER_SIZE };
        }
    };

    // Upload an asset (avatar or banner)
    public shared ({ caller }) func uploadAsset(upload: AssetUpload) : async ApiResult<UploadResult> {
        // Validate content type
        if (not isValidContentType(upload.contentType)) {
            return #err(#InvalidInput("Invalid content type. Only JPEG, PNG, GIF, and WebP are allowed."));
        };

        // Validate file size
        let maxSize = getMaxSize(upload.assetType);
        if (Blob.toArray(upload.data).size() > maxSize) {
            return #err(#InvalidInput("File too large. Maximum size: " # Int.toText(maxSize) # " bytes"));
        };

        // Generate asset ID
        let assetId = generateAssetId(caller, upload.assetType);
        let now = Time.now();

        // Create asset record
        let asset: Asset = {
            id = assetId;
            owner = caller;
            contentType = upload.contentType;
            fileName = upload.fileName;
            size = Blob.toArray(upload.data).size();
            data = upload.data;
            assetType = upload.assetType;
            uploadedAt = now;
            lastAccessed = now;
        };

        // Remove any existing asset of the same type for this user
        switch (upload.assetType) {
            case (#Avatar) {
                // Remove old avatar
                for ((id, existingAsset) in assets.entries()) {
                    if (existingAsset.owner == caller and existingAsset.assetType == #Avatar) {
                        assets.delete(id);
                    };
                };
            };
            case (#Banner) {
                // Remove old banner
                for ((id, existingAsset) in assets.entries()) {
                    if (existingAsset.owner == caller and existingAsset.assetType == #Banner) {
                        assets.delete(id);
                    };
                };
            };
        };

        // Store the new asset
        assets.put(assetId, asset);

        // Generate public URL
        let publicUrl = "/assets/" # assetId;

        #ok({
            url = publicUrl;
            assetId = assetId;
            uploadedAt = now;
        })
    };

    // Get asset data (for serving)
    public query func getAsset(assetId: Text) : async ?Asset {
        switch (assets.get(assetId)) {
            case (?asset) {
                // Update last accessed time would require a update call
                ?asset
            };
            case null { null };
        }
    };

    // Get asset with access tracking (update call)
    public shared func getAssetWithTracking(assetId: Text) : async ?Asset {
        switch (assets.get(assetId)) {
            case (?asset) {
                let updatedAsset = {
                    asset with
                    lastAccessed = Time.now();
                };
                assets.put(assetId, updatedAsset);
                ?updatedAsset
            };
            case null { null };
        }
    };

    // Delete an asset (only by owner)
    public shared ({ caller }) func deleteAsset(assetId: Text) : async ApiResult<Bool> {
        switch (assets.get(assetId)) {
            case (?asset) {
                if (asset.owner != caller) {
                    return #err(#Unauthorized);
                };
                assets.delete(assetId);
                #ok(true)
            };
            case null { #err(#InvalidInput("Asset not found")) };
        }
    };

    // Get user's assets
    public query ({ caller }) func getMyAssets() : async [Asset] {
        let results = Buffer.Buffer<Asset>(0);
        for ((_, asset) in assets.entries()) {
            if (asset.owner == caller) {
                results.add(asset);
            };
        };
        Buffer.toArray(results)
    };

    // Get asset statistics
    public query func getAssetStats() : async {
        totalAssets: Nat;
        totalSize: Nat;
        avatarCount: Nat;
        bannerCount: Nat;
    } {
        var totalAssets = 0;
        var totalSize = 0;
        var avatarCount = 0;
        var bannerCount = 0;

        for ((_, asset) in assets.entries()) {
            totalAssets += 1;
            totalSize += asset.size;
            switch (asset.assetType) {
                case (#Avatar) { avatarCount += 1 };
                case (#Banner) { bannerCount += 1 };
            };
        };

        {
            totalAssets = totalAssets;
            totalSize = totalSize;
            avatarCount = avatarCount;
            bannerCount = bannerCount;
        }
    };

    // Clean up old unused assets (admin function)
    public shared ({ caller }) func cleanupOldAssets(daysSinceLastAccess: Nat) : async Nat {
        let cutoffTime = Time.now() - (daysSinceLastAccess * 24 * 60 * 60 * 1_000_000_000); // Convert days to nanoseconds
        var deletedCount = 0;

        let toDelete = Buffer.Buffer<Text>(0);
        for ((id, asset) in assets.entries()) {
            if (asset.lastAccessed < cutoffTime) {
                toDelete.add(id);
            };
        };

        for (id in toDelete.vals()) {
            assets.delete(id);
            deletedCount += 1;
        };

        deletedCount
    };

    // HTTP interface for serving assets (simplified)
    public query func http_request(request: {
        method: Text;
        url: Text;
        headers: [(Text, Text)];
        body: Blob;
    }) : async {
        status_code: Nat16;
        headers: [(Text, Text)];
        body: Blob;
    } {
        // Parse URL to extract asset ID
        let url = request.url;
        if (Text.startsWith(url, #text "/assets/")) {
            let assetId = Text.replace(url, #text "/assets/", "");
            switch (assets.get(assetId)) {
                case (?asset) {
                    {
                        status_code = 200;
                        headers = [
                            ("Content-Type", asset.contentType),
                            ("Content-Length", Int.toText(asset.size)),
                            ("Cache-Control", "public, max-age=86400"), // Cache for 1 day
                        ];
                        body = asset.data;
                    }
                };
                case null {
                    {
                        status_code = 404;
                        headers = [("Content-Type", "text/plain")];
                        body = Text.encodeUtf8("Asset not found");
                    }
                };
            }
        } else {
            {
                status_code = 404;
                headers = [("Content-Type", "text/plain")];
                body = Text.encodeUtf8("Not found");
            }
        }
    };
};
