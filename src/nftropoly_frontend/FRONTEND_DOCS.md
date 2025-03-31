# NFTropoly Frontend Documentation

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Responsive Design](#responsive-design)
  - [Device Detection](#device-detection)
  - [Mobile Design](#mobile-design)
  - [Tablet Design](#tablet-design)
  - [Desktop Design](#desktop-design)
    - [Desktop Layout Components](#desktop-layout-components)
- [Core Scripts and Functionality](#core-scripts-and-functionality)
  - [Authentication System](#authentication-system)
  - [Theming System](#theming-system)
  - [Navigation System](#navigation-system)
  - [Animation System](#animation-system)
- [Pages and Routes](#pages-and-routes)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Build and Deployment](#build-and-deployment)

## Overview

NFTropoly is a multichain NFT marketplace built with SvelteKit running on the Internet Computer blockchain. The frontend provides a responsive, animated user interface for browsing, filtering, and interacting with NFTs across multiple blockchains.

## Project Structure

```
src/nftropoly_frontend/
├── src/
│   ├── lib/                    # Reusable components, services, and utilities
│   │   ├── components/         # Svelte components
│   │   ├── services/           # Backend service integrations
│   │   ├── stores/             # Svelte stores for state management
│   │   ├── utils/              # Utility functions and helpers
│   │   └── types/              # TypeScript type definitions
│   ├── routes/                 # SvelteKit routes (pages)
│   └── index.scss              # Global styles
├── static/                     # Static assets
└── app.html                    # HTML template
```

## Responsive Design

NFTropoly implements a responsive design strategy with distinct optimized experiences for mobile, tablet, and desktop devices. This approach ensures the best user experience across all device types.

### Device Detection

Device detection is handled through a utility that provides reactive stores for viewport dimensions and device type:

#### `src/lib/utils/device.ts`

```typescript
// Key functionality:
// - Detect device type (mobile, tablet, desktop)
// - Reactive stores for viewport dimensions
// - Helper functions for device-specific logic
```

The device utility includes:

- `BREAKPOINTS`: Constants defining width thresholds for different device types
- `viewport`: A reactive store tracking the current viewport dimensions
- `deviceType`: A derived store that determines the current device type
- `initViewport()`: Function to initialize and attach viewport change listeners
- Helper functions like `isDesktop`, `isMobile`, and `isTablet`

### Mobile Design

The mobile design is optimized for smaller screens (width < 640px) and touchscreen interaction:

**Key Features:**
- Streamlined navigation with a hamburger menu
- Slide-out sidebar for main navigation options
- Simplified layout with vertical stacking
- Touch-friendly UI elements (larger tap targets)
- Reduced animations to improve performance
- Condensed footer with essential links only

### Tablet Design

The tablet design targets medium-sized screens (640px-1024px) with a hybrid approach:

**Key Features:**
- Combines elements from both mobile and desktop designs
- Hamburger menu navigation with a wider sidebar
- Search bar in the header for quick access
- Two-column grid layouts for collections and NFTs
- Improved spacing and typography for legibility
- Moderately complex animations and effects

### Desktop Design

The desktop design (width > 1024px) offers a clean, focused interface inspired by modern NFT marketplaces:

**Key Features:**
- Vertical sidebar navigation with icon-only and expanded states
- Minimal top header with centered search bar
- Maximized content area for viewing NFTs
- Compact, informative footer with key metrics
- Clean separation of navigation and content
- Space-efficient layout for power users

#### Desktop Layout Components

The desktop layout consists of four main components:

1. **SidebarDesktop** (`src/lib/components/SidebarDesktop.svelte`):
   - Positioned on the left side of the screen
   - Shows only icons by default (collapsed state)
   - Expands on hover to show text labels
   - Contains main navigation options
   - Split into top section (main navigation) and bottom section (settings, user info)

2. **HeaderDesktop** (`src/lib/components/HeaderDesktop.svelte`):
   - Thin header with centered search bar
   - Wallet connection button on the right
   - Minimal design to maximize content area

3. **Main Content Area**:
   - Positioned to respect the sidebar and header
   - Adjusts margins automatically when sidebar state changes
   - Full-width display of content

4. **FooterMinimal** (`src/lib/components/FooterMinimal.svelte`):
   - Compact footer with key metrics (e.g., floor price, volume)
   - Essential links and social icons
   - Fixed at the bottom of the screen

## Core Scripts and Functionality

### Authentication System

#### `src/lib/stores/auth.store.ts`

```typescript
// Key functionality:
// - Reactive store for authentication state
// - Interface with Internet Identity
// - Principal management
// - Session persistence
```

The auth store manages the user's authentication state using Svelte's writable stores:

- `identity`: Stores the user's Internet Identity
- `isAuthenticated`: Derived store that indicates if a user is logged in
- `sync()`: Synchronizes the store with local storage to persist sessions
- `update()`: Updates the identity and triggers reactivity

#### `src/lib/services/auth.services.ts`

```typescript
// Key functionality:
// - Sign in with Internet Identity
// - Sign out function
// - Error handling for auth process
```

Authentication services handle the interaction with Internet Computer's identity service:

- `signIn()`: Opens the Internet Identity interface and handles the authentication flow
- `signOut()`: Clears the current identity and updates the auth store
- Error handling for cases like user cancellation or network issues

### Theming System

#### `src/lib/stores/theme.store.ts`

```typescript
// Key functionality:
// - Light/dark theme management
// - System preference detection
// - Theme persistence
// - Reactive updates
```

The theme store provides theme management with:

- `theme`: Writable store containing current theme ('light' or 'dark')
- `initTheme()`: Initializes theme based on system preference or stored preference
- `toggleTheme()`: Switches between light and dark modes
- `setTheme(theme)`: Sets a specific theme
- Theme is persisted in localStorage

### Navigation System

#### `src/lib/components/Navigation.svelte` (Mobile/Tablet)

```typescript
// Key functionality:
// - Mobile/tablet navigation with slide-out sidebar
// - Hamburger menu toggle
// - Current page highlighting
// - Wallet connection
```

The mobile/tablet navigation component handles:

- Hamburger menu with slide-out sidebar
- Mobile-optimized navigation options
- Current page highlighting
- Wallet connection interface

#### `src/lib/components/SidebarDesktop.svelte` (Desktop)

```typescript
// Key functionality:
// - Collapsible sidebar that expands on hover
// - Icon-only view when collapsed
// - Full text labels when expanded
// - Active page highlighting
```

The desktop sidebar component provides:

- Default collapsed state showing only icons
- Expanded state on hover showing text labels
- Organized sections for main navigation and settings
- Visual indication of active page
- User account information when authenticated

### Animation System

#### Multiple files, primarily in layout and page components

```typescript
// Key functionality:
// - Page transitions
// - Scroll-triggered animations
// - Hover effects
// - FLIP animations for lists
// - Loading state animations
```

The animation system leverages Svelte's built-in transitions and additional custom animations:

- `fade`, `fly`, `scale`, `slide` transitions from Svelte
- `flip` animations for smooth list reordering
- IntersectionObserver for scroll-triggered animations
- Custom keyframe animations for specific effects
- Loading skeleton animations for improved perceived performance

## Pages and Routes

### Main Layout (`src/routes/+layout.svelte`)

```typescript
// Key functionality:
// - Global layout structure
// - Device-specific layouts
// - Conditional rendering based on device type
// - Theme application
// - Navigation and footer inclusion
```

The layout handles:

- Conditional rendering of desktop or mobile/tablet layouts based on device type
- Device detection and specific classes for mobile, tablet, and desktop
- Theme class application based on the theme store
- Mobile sidebar state management
- Page transition animations
- Toast notifications system

### Homepage (`src/routes/+page.svelte`)

```typescript
// Key functionality:
// - Hero section with particles
// - Featured NFTs display
// - Category browsing
// - Statistics display
// - Platform introduction
// - Scroll animations
```

The homepage implements:

- Animated particle background system
- Featured NFTs with staggered animations
- Category cards with interactive hover effects
- Platform statistics with animated counters
- "How it works" section with step-by-step guide
- IntersectionObserver for revealing sections on scroll

### Collections Page (`src/routes/collections/+page.svelte`)

```typescript
// Key functionality:
// - Collection display
// - Advanced filtering system
// - Sorting options
// - NFT grid with animations
// - Loading states
```

The Collections page provides:

- Mock data for collections and NFTs (to be replaced with API calls)
- Filter system with multiple parameters (collection, rarity, price)
- Sorting capability (price high/low, name)
- Reactive filtering that updates as criteria change
- Animated transitions when filters are applied
- Loading skeleton placeholders while content loads

### API Documentation (`src/routes/api/+page.svelte`)

```typescript
// Key functionality:
// - API documentation display
// - Code examples with syntax highlighting
// - Special handling for Svelte template syntax
```

The API page offers:

- Documentation for integrating NFTropoly
- Code examples with proper syntax highlighting
- Special handler for displaying Svelte template code (escaping braces)
- Section navigation
- Responsive layout for different screen sizes

## Components

### NFT Item (`src/lib/components/NFTItem.svelte`)

```typescript
// Key functionality:
// - NFT display card
// - Hover animations
// - Rarity badge
// - Price and creator info
// - Accessibility support
```

The NFT Item component is the core display unit for NFTs:

- Displays NFT image, name, price in ETH
- Shows creator and collection information
- Applies different styles based on rarity
- Implements hover animations and transitions
- Uses ARIA attributes for accessibility
- Supports loading states

### Skeleton (`src/lib/components/Skeleton.svelte`)

```typescript
// Key functionality:
// - Loading placeholders
// - Customizable dimensions
// - Animated gradient effect
// - Theme-aware styling
```

The Skeleton component provides content loading indicators:

- Customizable width, height, and border radius
- Animation delay for staggered loading effects
- Gradient animation that respects the current theme
- Shimmer effect for better user experience during loading

### Theme Switch (`src/lib/components/ThemeSwitch.svelte`)

```typescript
// Key functionality:
// - Toggle between light/dark themes
// - Animated icon transition
// - Integration with theme store
```

The Theme Switch component offers:

- Visual toggle for theme switching
- Sun/moon icons that animate during transition
- Connects to theme store to trigger theme changes
- Keyboard accessible with proper ARIA attributes

### Toasts (`src/lib/components/Toasts.svelte`)

```typescript
// Key functionality:
// - Notification display
// - Multiple message types
// - Auto-dismiss functionality
// - Stacked notifications
```

The Toasts component handles notifications:

- Displays temporary messages (success, error, info)
- Auto-dismisses after configurable timeout
- Supports stacked notifications
- Animated entry and exit

## State Management

NFTropoly uses Svelte stores for reactive state management:

### Auth Store

```typescript
// Manages authentication state
import { writable, derived } from 'svelte/store';

export const authStore = writable({
  identity: null,
  // other auth properties
});

export const isAuthenticated = derived(
  authStore,
  $authStore => Boolean($authStore.identity)
);
```

### Theme Store

```typescript
// Manages theme state
import { writable } from 'svelte/store';

export const theme = writable('light');

export function toggleTheme() {
  theme.update(current => current === 'light' ? 'dark' : 'light');
  // Save to localStorage
}
```

### Device Store

```typescript
// Manages device/viewport state
import { writable, derived } from 'svelte/store';

export const viewport = writable({ width: 1200, height: 800 });

export const deviceType = derived(
  viewport,
  $vp => {
    if ($vp.width < 640) return 'mobile';
    if ($vp.width < 1024) return 'tablet';
    return 'desktop';
  }
);
```

## API Integration

The frontend integrates with the Internet Computer backend through:

### Actor Creation

```typescript
// Creates canister actors for backend communication
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../declarations/nftropoly_backend';

// Create an actor with the appropriate interface
export function createActor(canisterId, options = {}) {
  const agent = new HttpAgent({ ...options?.agentOptions });
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions
  });
}
```

### Canister Calls

```typescript
// Example of a canister call
async function fetchNFTs() {
  try {
    const actor = await getBackendActor();
    const nfts = await actor.getNFTs();
    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}
```

## Styling

The application uses a combination of:

### Global Variables

```scss
// CSS variables for theming
:root {
  --light-bg-primary: #f8f9fc;
  --light-text-primary: #1e293b;
  // More variables...
  
  --dark-bg-primary: #0f0f1a;
  --dark-text-primary: #f1f5f9;
  // More variables...
  
  --radius-sm: 4px;
  --radius-md: 8px;
  // More radius variables...
}

// Applied based on current theme
:global(.light) {
  --bg-primary: var(--light-bg-primary);
  // More theme mappings...
}

:global(.dark) {
  --bg-primary: var(--dark-bg-primary);
  // More theme mappings...
}
```

### Component-Scoped Styles

```scss
// Example of component styles in Svelte
<style>
  .nft-card {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    transition: transform 0.3s ease;
  }
  
  .nft-card:hover {
    transform: translateY(-5px);
  }
</style>
```

### Responsive Design Styles

```scss
// Example of responsive styles
.container {
  width: 100%;
  padding: 1rem;
}

/* Apply device-specific styles */
:global(.mobile) .container {
  padding: 0.5rem;
}

:global(.tablet) .container {
  padding: 1rem;
}

:global(.desktop) .container {
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;
}
```

## Build and Deployment

### Development Server

```bash
# Start development server
npm run dev

# Or with host exposed
npm run dev -- --host
```

The development server uses Vite for:
- Hot module replacement
- Fast refresh
- Environment variable handling

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The production build:
- Optimizes for bundle size
- Generates static assets
- Creates a production-ready distribution

### Internet Computer Deployment

```bash
# Deploy to Internet Computer
dfx deploy nftropoly_frontend
```

Deployment to IC involves:
- Compiling frontend assets
- Creating a Wasm module
- Uploading to the IC network
- Generating canister interfaces 