import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Iter "mo:base/Iter";

actor {
    public type User = {
        username: Text;
        createdAt: Time.Time;
    };

    // Stable storage for users
    stable var _users: [(Principal, User)] = [];
    var users = HashMap.HashMap<Principal, User>(10, Principal.equal, Principal.hash);

    // On canister init/load, restore users from stable var
    system func preupgrade() {
        _users := Iter.toArray(users.entries());
    };
    
    system func postupgrade() {
        users := HashMap.fromIter(_users.vals(), _users.size(), Principal.equal, Principal.hash);
    };

    // Query the current caller's User data
    public query ({ caller }) func getUser() : async ?User {
        users.get(caller)
    };

    // Register a new user with a username
    public shared ({ caller }) func signup(username: Text) : async Result.Result<User, Text> {
        switch (users.get(caller)) {
            case (?_) { return #err("User already exists"); };
            case null {
                let user: User = {
                    username = username;
                    createdAt = Time.now();
                };
                users.put(caller, user);
                return #ok(user);
            }
        }
    };
}