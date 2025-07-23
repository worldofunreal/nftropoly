### 👤 **User Profile Page Layout (Desktop View)**

---

### **1. Hero & Profile Header Section**


#### 📊 **Stats Section Layout (Top Banner Right-Aligned Block)**

  * ✅ **Container Positioning**

    * Located on the **top right** of the user banner.
    * Right-aligned, vertically stacked, sits over the blurred header background.
    * Minimal and clean spacing, likely using `flex flex-col items-end` (for right alignment).

---

  * 🔢 **Individual Stat Blocks**

    Each stat appears to follow this format:

    [Label (uppercase, small font)]  
    [Value (bold, large)]

---

  * 📄 **Detailed Breakdown**

  | **Label**         | **Value**  | **Description**                        |
  | ----------------- | ---------- | -------------------------------------- |
  | `PORTFOLIO VALUE` | `0.00 ETH` | Total value of user’s assets in ETH    |
  | `USD VALUE`       | `$0.00`    | Equivalent fiat value of the portfolio |
  | `NFTs`            | `0%`       | Percentage share of total NFTs owned   |
  | `TOKENS`          | `0%`       | Percentage share of total tokens held  |

---

  * 💡 **Styling Details**

    * **Font weight & size**:

      * Labels: Uppercase, light font, small (e.g., `text-xs text-gray-400`)
      * Values: Bold or semi-bold, slightly larger (e.g., `text-base font-medium`)
    * **Spacing**:

      * Small vertical spacing between label and value (`gap-1`)
      * Horizontal spacing between stat columns (`space-x-6` or `gap-x-8`)
    * **Optional**: An eye icon (`👁`) next to `PORTFOLIO VALUE` – likely a visibility toggle.

---



### **3. Navigation Tabs (Centered Below Banner)**

Horizontal scrollable tabs:

* `Galleries`
* `NFTs` (selected)
* `Tokens`
* `Listings`
* `Offers`
* `Portfolio`
* `Created`
* `Watchlist`
* `Favorites`
* `Activity`

---

### **4. Filters Sidebar (Left Column)**

#### a. **Status**

* Filter chips:

  * `All`
  * `Listed`
  * `Not Listed`
  * `Hidden`

#### b. **Chains**

* Search bar
* Chain filters (tagged pills):

  * `All`, `Ethereum`, `Abstract`, `ApeChain`, `Arbitrum`, `Avalanche`, `Base`, etc.
  * Colored icons for chain identification

#### c. **Collections**

* Search bar for collections

---

### **5. Item Table / NFT Display Area (Main Column)**

#### a. **Search & Sorting**

* Search bar for item names
* Sort dropdown (e.g., `Recently received`)
* View toggle: Grid / Table / Compact view (right-aligned)

#### b. **Table Columns** *(visible even with no items)*

* Listing Price
* Rarity
* Floor Price
* Top Offer
* Cost
* Received

#### c. **Empty State**

* Illustration
* Message: `No items found`
* Subtext: `Discover new collections on OS2`
* Button: `Go to Discover`

---

### **6. Footer Actions (Sticky Bottom Bar)**

* `List items` (blue button)
* `Cancel listings`
* `Accept offers`

---

### ✅ Suggested Nuxt Component Tree

```bash
components/
├── UserProfileHeader.vue          # Banner, avatar, wallet info
├── ProfileStats.vue               # ETH value, NFTs %, etc.
├── ProfileTabs.vue                # Navigation bar (NFTs, Tokens, etc.)
├── ProfileSidebar.vue             # Filters: status, chains, collections
├── NftItemTable.vue               # Table-style NFT display
├── NftItemRow.vue                 # For each NFT (used when not empty)
├── EmptyState.vue                 # "No items found" display
├── ProfileFooterActions.vue       # List/Cancel/Accept buttons
```