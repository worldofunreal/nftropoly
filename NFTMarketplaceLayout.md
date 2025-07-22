# NFT Marketplace Technical Layout Specification

This document provides a comprehensive, component-based technical specification for a responsive NFT Marketplace layout, designed for implementation with Nuxt and Nuxt UI components.

---

## Root Layout
**Description:**
Main container for the entire application. Manages the primary layout between the sidebar and the main content wrapper.

```
<RootLayout>
  ├── <Sidebar />
  ├── <MainContentWrapper>
  │     ├── <Header />
  │     ├── <MainContentArea />
  │     └── <Footer />
```

---

## Sidebar (Collapsible)
**Description:**
Fixed-position vertical navigation. Collapses to icon-only and expands on hover/focus to reveal text labels. The transition should be smooth.

**Menu Items:**
| Item      | Icon Name                        |
|-----------|----------------------------------|
| Discover  | iconamoon:discover-fill          |
| NFTs      | ri:nft-fill                      |
| Tokens    | ic:baseline-generating-tokens    |
| Activity  | fa-solid:list                    |
| Profile   | ix:user-profile-filled           |
| (hr)      | (Visual Separator)               |
| Settings  | iconamoon:settings-fill          |
| Support   | ix:support                       |

---

## Header (Sticky top, global)
**Description:**
Sits at the top of the main content wrapper and remains visible on scroll. Contains primary actions and navigation. Divided into left (search) and right (user actions) sections.

### Left Section
- **Search Bar**
  - Input field with placeholder: `"Search Nftropoly"`
  - Icon: `ri:search-line` (inside the bar)

### Right Section
- **Connect Wallet**
  - Primary action button
  - Icon: `solar:wallet-bold`
- **Profile Avatar**
  - Displays when wallet is connected
  - Clicking opens user menu
  - Uses Nuxt UI Avatar
  - Fallback: Profile Icon (`ix:user-profile-filled`)

---

## Main Content Area
**Description:**
Primary scrollable view. For the Discover (`/home`) page, this area is a responsive two-column grid (2/3 left, 1/3 right). The main browser scrollbar should only affect the left column.

### Left Column (2/3 width)
**Description:**
Primary content view, composed of multiple horizontally-scrolling sections.

#### Component Order (Top to Bottom):
1. **Filter Pill Tags**
   - Row of filter buttons
   - Right end: Icon button to toggle right column visibility
   - Icon: `ion:stats-chart`
   - **Categories:**
     - All (No Icon)
     - Gaming (`streamline-plump:controller-1-solid`)
     - Art (`mdi:art`)
     - PFPs (`mdi:face`)
     - Music (`mdi:music`)
     - Photography (`mynaui:aperture-solid`)
2. **Carousel**
   - Media: 16:9 aspect ratio image or video
   - Info Overlay:
     - Collection Name + Verified Icon (`material-symbols:verified`)
     - Creator Name ("By [Team Name]")
     - Standard Info Table: Floor Price, Items, Total Volume, Listed %
     - Minting Info Table: Status, Minting Price, Total Items
3. **Featured Collections**
   - Header: "Featured Collections" + subtitle "This Week's curated collections"
   - Content: Horizontally scrollable list of cards with navigation arrows
   - Card: 16:9 image, Collection Name + Verified Icon, Floor Price, % Change
4. **Trending Tokens**
   - Header: "Trending Tokens"
   - Content: Horizontally scrollable list
   - Card: Token Icon, Name, Symbol, Price, % Change (red/green), small line graph
5. **Featured Drops**
   - Header: "Featured Drops"
   - Content: Same as Featured Collections, but cards have a "MINTING NOW" tag
6. **Top Movers Today**
   - Header: "Top Movers Today"
   - Content: Same as Featured Collections, but highlights large daily % change (e.g., +400%)
7. **NFT 101**
   - Header: "NFT 101" + subtitle "Learn about NFTs, Web3 and more"
   - Content: Horizontally scrollable list of educational articles
   - Card: Each links to `/learn/[slug]` (e.g., "What is an NFT?")

### Right Column (1/3 width)
**Description:**
Supplementary stats and rankings column. Scrolls independently with a hidden scrollbar.

#### Component Order (Top to Bottom):
1. **Header & Filters**
   - Ranking Filters: Top (`mdi:medal`), Trending (`streamline-plump:trending-content-solid`)
   - View Modes: Table (`material-symbols:table`), Compact (`teenyicons:table-solid`)
   - Time Filters: 5m, 15m, 1d, 30d, All
2. **Collections List**
   - List Item: Collection Icon, Name + Verified Icon, Floor Price, % Change

---

## Footer (Sticky bottom, global)
**Description:**
Sits at the bottom of the main content wrapper. Two main sections: left-aligned (status/info links), right-aligned (controls/quick stats).

### Left Side Components
| Component         | Details                                             | Icon Name                          |
|-------------------|-----------------------------------------------------|------------------------------------|
| Live Indicator    | "Live" text with indicator icon                     | fluent:live-24-filled (primary)    |
| (Separator)       |                                                     |                                    |
| Networks          | Pop-up menu for available networks (ICP, Solana, Ethereum) with [Active] tag | icon-park-solid:blockchain         |
| (Separator)       |                                                     |                                    |
| Terms of Service  | Link to `/terms`                                    | ri:contract-fill                   |
| (Separator)       |                                                     |                                    |
| Privacy Policy    | Link to `/privacy`                                  | material-symbols:privacy-tip-rounded|
| Social Media      | Icon-only links to social profiles                   | ic:baseline-discord, line-md:twitter-x |

### Right Side Components (ordered right to left)
| Component         | Details                                             | Icon Name                          |
|-------------------|-----------------------------------------------------|------------------------------------|
| ICP Price         | Hardcoded price display for Internet Computer       | logos:internet-computer-icon       |
| (Separator)       |                                                     |                                    |
| Support           | Link to support page or modal                       | ix:support                         |
| (Separator)       |                                                     |                                    |
| Theme Switcher    | Toggles between light/dark themes (dark default)    | ix:sun-filled, tabler:moon-filled  |
| (Separator)       |                                                     |                                    |
| Fiat/Crypto Switch| Toggles all prices between crypto and USD           | (No icon specified, text toggle)   |

---

## Implementation Notes
- Use Nuxt UI components and composables for layout, transitions, and interactivity.
- All icons should use [Iconify](https://icon-sets.iconify.design/) or compatible Nuxt UI icon components.
- Ensure all scrollable areas are accessible and have smooth, performant scrolling.
- All sticky/fixed elements should respect safe-area insets for mobile devices.
- The layout must be fully responsive, supporting mobile, tablet, and desktop breakpoints.
- Use CSS variables or Nuxt UI theming for color and spacing consistency.

---

**End of Technical Layout Specification** 