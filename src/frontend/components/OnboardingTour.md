# Onboarding Tour System

This document explains how to use and customize the onboarding tour system for the NFT marketplace.

## Overview

The onboarding tour uses `intro.js` to create an interactive guided tour for first-time visitors. It highlights key UI elements and provides short, action-oriented instructions.

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
Located in `components/OnboardingTour.vue`

**Features:**
- Configurable tour steps
- Mobile-friendly design
- Custom styling that matches the app theme
- Event handling for completion and skipping

**Props:**
- `steps`: Array of custom tour steps (optional)
- `autoStart`: Whether to start tour automatically (default: true)

**Events:**
- `complete`: Emitted when tour is completed
- `skip`: Emitted when tour is skipped
- `start`: Emitted when tour starts

### 3. `OnboardingTrigger` Component
Located in `components/OnboardingTrigger.vue`

**Features:**
- Manual trigger button for testing
- Resets onboarding state
- Positioned in bottom-right corner

## Default Tour Steps

The tour includes these default steps:

1. **Connect Wallet Button** (`.connect-wallet-btn`)
   - Text: "Connect your wallet to start trading NFTs"
   - Position: bottom

2. **Search NFTs Section** (`.search-nfts-section`)
   - Text: "Browse and search for NFTs by collection or name"
   - Position: bottom

3. **Buy NFT Button** (`.buy-nft-btn`)
   - Text: "Click to buy NFTs directly from listings"
   - Position: top

4. **Sell NFT Button** (`.sell-nft-btn`)
   - Text: "List your NFTs for sale here"
   - Position: top

5. **Profile/Settings Icon** (`.profile-settings-icon`)
   - Text: "Access your profile and settings"
   - Position: left

## Adding/Removing Steps

### To Add a New Step:

1. **Add the CSS class** to the target element:
```html
<UButton class="my-new-feature-btn">New Feature</UButton>
```

2. **Add the step** to the `defaultSteps` array in `OnboardingTour.vue`:
```typescript
const defaultSteps = [
  // ... existing steps
  {
    element: '.my-new-feature-btn',
    intro: 'This is your new feature description',
    position: 'bottom' // or 'top', 'left', 'right'
  }
]
```

### To Remove a Step:

1. **Remove the CSS class** from the target element
2. **Remove the step** from the `defaultSteps` array

### To Customize Steps for a Specific Page:

Pass custom steps as props:
```vue
<OnboardingTour 
  :steps="customSteps" 
  :auto-start="true" 
  @complete="handleComplete"
/>
```

## CSS Classes Required

The following CSS classes must be present on elements for the tour to work:

- `.connect-wallet-btn` - Connect wallet button
- `.search-nfts-section` - Search bar container
- `.buy-nft-btn` - Buy NFT buttons
- `.sell-nft-btn` - Sell NFT button
- `.profile-settings-icon` - Profile/settings area

## Styling

The tour uses custom CSS that matches the app's design:

- **Tooltip**: Dark background with rounded corners
- **Buttons**: Primary blue color with hover effects
- **Highlight**: Blue glow around highlighted elements
- **Mobile**: Responsive design with adjusted sizing

## Testing

### Manual Testing:
1. Click the "Start Tour" button in the bottom-right corner
2. This resets the onboarding state and starts the tour

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
- Tour automatically starts only for first-time visitors

## Mobile Support

The tour is fully responsive and includes:
- Adjusted tooltip sizing for mobile screens
- Touch-friendly button interactions
- Proper positioning on small screens
- Scroll handling for off-screen elements

## Troubleshooting

### Tour not starting:
1. Check if elements with required CSS classes exist
2. Verify localStorage is not blocked
3. Check browser console for errors

### Elements not highlighting:
1. Ensure CSS classes are correctly applied
2. Check if elements are visible in the DOM
3. Verify no CSS conflicts with z-index

### Styling issues:
1. Check if intro.js CSS is properly imported
2. Verify custom CSS overrides are working
3. Test in both light and dark modes
