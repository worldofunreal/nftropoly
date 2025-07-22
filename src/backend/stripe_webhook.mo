    // Stripe Webhook Motoko Canister
    // Handles Stripe webhook POST requests securely

    import JSON "mo:json";
    import HMAC "mo:hmac";
    import Sha256 "mo:sha2/Sha256";
    import Blob "mo:base/Blob";
    import Text "mo:base/Text";
    import Array "mo:base/Array";
    import Char "mo:base/Char";
    import Iter "mo:base/Iter";
    import Nat8 "mo:base/Nat8";
    import Nat64 "mo:base/Nat64";

    actor StripeWebhook {
        // HTTP response type for update calls
        type HttpResponse = {
            status_code : Nat16;
            headers : [(Text, Text)];
            body : Blob;
        };

        // Replace with your Stripe webhook secret (as bytes)
        let stripe_secret : [Nat8] = Blob.toArray(Text.encodeUtf8("sk_live_X"));

        // Helper: Parse Stripe-Signature header
        func parse_signature_header(header : Text) : (?Text, ?Text) {
            var t : ?Text = null;
            var v1 : ?Text = null;
            label parts_loop for (part in Text.split(header, #char ',')) {
                var i = 0;
                var key = "";
                var value = "";
                for (kv in Text.split(Text.trim(part, #char ' '), #char '=')) {
                    if (i == 0) key := kv;
                    if (i == 1) value := kv;
                    i += 1;
                };
                if (i == 2) {
                    if (key == "t") t := ?value;
                    if (key == "v1") v1 := ?value;
                }
            };
            (t, v1)
        };

        // Helper: Compute HMAC-SHA256 and hex encode
        func compute_signature(secret : [Nat8], message : Text) : Text {
            let hmac = HMAC.generate(
                secret,
                Iter.fromArray(Blob.toArray(Text.encodeUtf8(message))),
                #custom(func(msg) { Sha256.fromBlob(#sha256, Blob.fromArray(Iter.toArray(msg))) })
            );
            let hexChars : [Char] = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
            let bytes = Blob.toArray(hmac);
            var out = "";
            for (b in bytes.vals()) {
                out #= Char.toText(hexChars[Nat8.toNat((b >> 4) & 0xf)]);
                out #= Char.toText(hexChars[Nat8.toNat(b & 0xf)]);
            };
            out
        };

        // Public HTTP endpoint for Stripe webhooks
        public shared func http_request_update(req : {
            method : Text;
            url : Text;
            headers : [(Text, Text)];
            body : Blob;
        }) : async HttpResponse {
            if (req.method != "POST" or req.url != "/stripe-webhook") {
                return { status_code = 404; headers = []; body = Text.encodeUtf8("Not found") };
            };

            // 1. Get Stripe-Signature header
            let sig_header = Array.find<(Text, Text)>(
                req.headers,
                func(pair) { let (k, _) = pair; Text.toLowercase(k) == "stripe-signature" }
            );
            if (sig_header == null) {
                return { status_code = 400; headers = []; body = Text.encodeUtf8("Missing signature") };
            };
            let header_val = switch (sig_header) { case (?(_, v)) v; case _ "" };

            // 2. Parse t and v1
            let (t, v1) = parse_signature_header(header_val);
            let t_val = switch t { case (?val) val; case null { return { status_code = 400; headers = []; body = Text.encodeUtf8("Invalid signature header") }; } };
            let v1_val = switch v1 { case (?val) val; case null { return { status_code = 400; headers = []; body = Text.encodeUtf8("Invalid signature header") }; } };

            // 3. Compute expected signature
            let payload = switch (Text.decodeUtf8(req.body)) {
                case (?t) t;
                case null { return { status_code = 400; headers = []; body = Text.encodeUtf8("Invalid UTF8") }; }
            };
            let signed_payload = t_val # "." # payload;
            let expected_sig = compute_signature(stripe_secret, signed_payload);

            if (expected_sig != v1_val) {
                return { status_code = 401; headers = []; body = Text.encodeUtf8("Invalid signature") };
            };

            // 4. Parse JSON
            switch (JSON.parse(payload)) {
                case (#ok(json)) {
                    // Example: get event type and id
                    let event_type = JSON.getAsText(json, "type");
                    let payment_id = JSON.getAsText(json, "data.object.id");
                    // TODO: Add business logic for event_type/payment_id
                    // For now, just acknowledge
                    return { status_code = 200; headers = []; body = Text.encodeUtf8("OK") };
                };
                case _ {
                    return { status_code = 400; headers = []; body = Text.encodeUtf8("Invalid JSON") };
                }
            }
        }
    } 