# Onboarding Tour System

This document explains how to use and customize the onboarding tour system for the NFT marketplace.

## Overview

The onboarding tour uses `intro.js` to create an interactive guided tour for first-time visitors. It highlights key UI elements and provides short, action-oriented instructions.

## Tour Flow

The tour follows this sequence:

1. **Disclaimer Modal**: Shows first when the page loads
2. **User Action**: User clicks "Accept & Continue" or clicks outside the modal
3. **Tour Start**: After disclaimer is closed, the onboarding tour automatically starts
4. **Tour Steps**: User progresses through the defined tour steps

## Current Implementation (Steps 1-3)

The tour currently implements the first 3 steps as defined in `Toursteps.md`:

### Step 1: Welcome & Introduction
- **Target**: Main page body
- **Text**: "Welcome to NFTropoly! Your gateway to the world of NFTs on the Internet Computer. Let's explore the key features together."
- **Position**: center
- **Styling**: Special gradient background with larger text

### Step 2: Wallet Connection
- **Target**: `.connect-wallet-btn` (Header)
- **Text**: "Start by connecting your wallet to browse, buy, and sell NFTs securely using Internet Identity, MetaMask, Phantom, Plug, or Google."
- **Position**: bottom
- **Styling**: Standard tooltip styling

### Step 3: Profile Registration (Conditional)
- **Target**: `.registration-modal` (RegistrationModal component)
- **Text**: "Complete your profile setup! Choose a username, customize your avatar, and set your privacy preferences to get started."
- **Position**: center
- **Styling**: Special gradient background with registration-specific styling
- **Behavior**: Only appears when registration modal is opened after wallet connection

## Components

### 1. `useOnboarding` Composable
Located in `composables/useOnboarding.ts`

**Features:**
- Manages onboarding state in localStorage
- Provides methods to check, complete, and reset onboarding
- Ensures tour only runs for first-time visitors

**Usage:**
```typescript
import { useOnboarding } from '@/composables/useOnboarding'

const { shouldShowOnboarding, completeOnboarding, resetOnboarding } = useOnboarding()
```

### 2. `OnboardingTour` Component
Located in `components/onBoardingTour/OnboardingTour.vue`

**Features:**
- Configurable tour steps
- Mobile-friendly design
- Custom styling that matches the app theme
- Event handling for completion and skipping
- Dynamic step addition for registration modal
- **No longer auto-starts** - waits for disclaimer to be closed

**Props:**
- `steps`: Array of custom tour steps (optional)
- `autoStart`: Whether to start tour automatically (default: true, but overridden by disclaimer flow)

**Events:**
- `complete`: Emitted when tour is completed
- `skip`: Emitted when tour is skipped
- `start`: Emitted when tour starts

**Methods:**
- `startTour()`: Start the tour (only if onboarding should be shown)
- `stopTour()`: Stop the tour
- `updateTourForRegistration()`: Add registration step when modal opens

### 3. `OnboardingTrigger` Component
Located in `components/OnboardingTrigger.vue`

**Features:**
- Manual trigger button for testing
- Resets onboarding state
- Positioned in bottom-right corner
- Can be used to restart the tour at any time

### 4. `DisclaimerModal` Component
Located in `components/DisclaimerModal.vue`

**Features:**
- Shows disclaimer on page load
- Emits 'close' event when dismissed
- Triggers tour start when closed

## Integration Flow

1. **Page Load**: DisclaimerModal shows automatically
2. **User Dismisses Disclaimer**: Clicks "Accept & Continue" or outside modal
3. **DisclaimerModal Emits 'close'**: Event is handled by app.vue
4. **Tour Starts**: OnboardingTour.startTour() is called with 500ms delay
5. **Tour Progress**: User goes through welcome, wallet connection, and registration steps

## CSS Classes Required

The following CSS classes must be present on elements for the tour to work:

- `.connect-wallet-btn` - Connect wallet button in header
- `.registration-modal` - Registration modal container

## Styling

The tour uses custom CSS that matches the app's design:

- **Welcome Tooltip**: Blue gradient background with larger text
- **Registration Tooltip**: Pink gradient background with registration-specific styling
- **Standard Tooltip**: Dark background with rounded corners
- **Buttons**: Primary blue color with hover effects
- **Highlight**: Blue glow around highlighted elements
- **Mobile**: Responsive design with adjusted sizing

## Integration with Login Flow

The tour integrates with the login flow through the `LoginPanel` component:

1. When a user connects their wallet, the login process checks if they're a new user
2. If new user, the registration modal opens
3. The `LoginPanel` triggers `updateTourForRegistration()` on the onboarding tour
4. The tour dynamically adds the registration step and navigates to it

## Testing

### Manual Testing:
1. **Normal Flow**: 
   - Load the page
   - Accept the disclaimer
   - Tour should start automatically
2. **Manual Trigger**: 
   - Click the "Start Tour" button in the bottom-right corner
   - This resets the onboarding state and starts the tour
3. **Registration Flow**: 
   - Connect a wallet to see the registration step

### Reset for Development:
```typescript
import { useOnboarding } from '@/composables/useOnboarding'
const { resetOnboarding } = useOnboarding()
resetOnboarding()
```

### Check localStorage:
```javascript
// Check if onboarding is completed
localStorage.getItem('nftropoly-onboarding-completed')

// Reset onboarding
localStorage.removeItem('nftropoly-onboarding-completed')
```

## Performance Considerations

- Tour only loads `intro.js` on the client side
- CSS is imported globally but minimal
- Tour state is stored in localStorage for persistence
- Tour starts only after disclaimer is closed (not on page load)
- Registration step is added dynamically only when needed

## Mobile Support

The tour is fully responsive and includes:
- Adjusted tooltip sizing for mobile screens
- Touch-friendly button interactions
- Proper positioning on small screens
- Scroll handling for off-screen elements

## Troubleshooting

### Tour not starting:
1. Check if disclaimer modal is being closed properly
2. Verify the 'close' event is being emitted
3. Check if elements with required CSS classes exist
4. Verify localStorage is not blocked
5. Check browser console for errors

### Elements not highlighting:
1. Ensure CSS classes are correctly applied
2. Check if elements are visible in the DOM
3. Verify no CSS conflicts with z-index

### Registration step not appearing:
1. Check if registration modal has the `.registration-modal` class
2. Verify the `updateTourForRegistration()` method is being called
3. Check browser console for errors

### Styling issues:
1. Check if intro.js CSS is properly imported
2. Verify custom CSS overrides are working
3. Test in both light and dark modes

## Future Steps

The next implementation phase will add steps 4-17 as defined in `Toursteps.md`, including:
- Search & Discovery
- Category Filters
- Featured Collections
- Navigation Sidebar
- And more...
