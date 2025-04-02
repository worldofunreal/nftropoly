<script lang="ts">
  import '../index.scss';
  import { onMount } from 'svelte';
  import { theme, initTheme } from '$lib/stores/theme.store';
  import { authStore } from '$lib/stores/auth.store';
  import { page } from '$app/stores';
  import Navigation from '$lib/components/Navigation.svelte';
  import SidebarDesktop from '$lib/components/SidebarDesktop.svelte';
  import HeaderDesktop from '$lib/components/HeaderDesktop.svelte';
  import FooterMinimal from '$lib/components/FooterMinimal.svelte';
  import Toasts from '$lib/components/Toasts.svelte';
  import { deviceType, initViewport, isDesktop, isMobile, isMobileOrTablet } from '$lib/utils/device';
  
  let sidebarOpen = false;
  let mounted = false;
  
  onMount(() => {
    // Add mounted flag to avoid client/server mismatches
    mounted = true;
    
    // Initialize theme with cleanup function
    const themeCleanup = initTheme();
    
    // Initialize auth store
    authStore.sync();
    
    // Initialize viewport detection
    const viewportCleanup = initViewport();
    
    // Clean up all listeners on unmount
    return () => {
      if (themeCleanup) themeCleanup();
      if (viewportCleanup) viewportCleanup();
    };
  });
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Get current page path for active menu highlighting
  $: currentPage = $page?.url?.pathname || '/';
  
  // Add theme and device classes
  $: appClasses = [
    'app-container',
    mounted ? $theme : 'initial-theme',
    mounted ? $deviceType : '',
    sidebarOpen ? 'sidebar-open' : ''
  ].filter(Boolean).join(' ');
</script>

<!-- Add theme color meta for mobile devices -->
<svelte:head>
  <meta name="theme-color" content={$theme === 'dark' ? '#0a0a0a' : '#ffffff'} />
  <meta name="color-scheme" content={$theme === 'dark' ? 'dark' : 'light'} />
</svelte:head>

<div class={appClasses}>
  {#if mounted && $isDesktop}
    <!-- Desktop Layout with Fixed Header, Sidebar, Footer -->
    <SidebarDesktop currentPage={currentPage} />
    <HeaderDesktop />
    
    <main class="main-desktop">
      <slot></slot>
    </main>
    
    <FooterMinimal />
  {:else if mounted}
    <!-- Mobile/Tablet Layout (Footer might need adjustment here too) -->
    <Navigation 
      isMobile={$isMobile} 
      isTablet={!$isDesktop && !$isMobile}
      isDesktop={false}
      sidebarOpen={sidebarOpen} 
      on:toggleSidebar={toggleSidebar} 
    />
    
    <main class="main-mobile-tablet">
      <slot></slot>
    </main>
    
    <!-- Standard Footer for mobile/tablet -->
    <footer class="standard-footer" class:mobile-footer={$isMobileOrTablet}>
      <div class="footer-content">
        <div class="footer-brand">
          <svg class="logo-svg" width="50" height="50" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="logo-path" d="M151.772 219.818L121.479 235.396L122.883 83.5168L256 24.3169L255.979 66.9016L228.367 77.3628L228.388 182.805L204.45 193.5V86.0492L153.155 109.251V134.981L187.057 117.7V150.083L153.133 168.944L151.772 219.818Z" />
            <path class="logo-path" d="M0 186.45V33.5312L39.3061 47.7996L84.6969 143V64L116.954 78.9228L115.54 235.476L87.0936 219.79L37.2689 125.333C34.7524 125.333 34.992 199.046 34.992 199.046L0 186.45Z" />
          </svg>
          <p class="tagline">The premier NFT marketplace on the Internet Computer</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-section">
            <h3>Marketplace</h3>
            <a href="/">Browse</a>
            <a href="/collections">Collections</a>
            <a href="/create">Create</a>
          </div>
          
          <div class="footer-section">
            <h3>Resources</h3>
            <a href="/api">API Docs</a>
            <a href="/faq">FAQ</a>
          </div>
          
          <div class="footer-section">
            <h3>Company</h3>
            <a href="/about">About</a>
            <a href="/careers">Careers</a>
            <a href="/blog">Blog</a>
          </div>
          
          <div class="footer-section">
            <h3>Legal</h3>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NFTropoly. All rights reserved.</p>
        <div class="social-links">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  {/if}
  
  <!-- Toast notifications (global) -->
  <Toasts />
</div>

<style>
  :global(:root) {
    /* Light theme variables */
    --light-bg-primary: #f8f9fc;
    --light-bg-secondary: #ffffff;
    --light-bg-tertiary: #f1f5f9;
    --light-text-primary: #1e293b;
    --light-text-secondary: #475569;
    --light-text-tertiary: #64748b;
    --light-border-color: #e2e8f0;
    --light-color-accent: #8b5cf6;
    --light-color-accent-light: rgba(139, 92, 246, 0.2);
    --light-color-hover: rgba(0, 0, 0, 0.05);
    --light-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --light-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --light-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    
    /* Dark theme variables */
    --dark-bg-primary: #0a0a0a;
    --dark-bg-secondary: #111111;
    --dark-bg-tertiary: #1a1a1a;
    --dark-text-primary: #f8f9fa;
    --dark-text-secondary: #e2e2e2;
    --dark-text-tertiary: #a0a0a0;
    --dark-border-color: rgba(255, 255, 255, 0.1);
    --dark-color-accent: #303030;
    --dark-color-accent-light: rgba(48, 48, 48, 0.2);
    --dark-color-hover: rgba(255, 255, 255, 0.05);
    --dark-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --dark-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
    --dark-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
    
    /* Dark theme gradient variables */
    --dark-gradient-primary: linear-gradient(145deg, #0a0a0a, #1a1a1a);
    --dark-gradient-secondary: linear-gradient(145deg, #111111, #222222);
    --dark-gradient-accent: linear-gradient(145deg, #202020, #303030);
    
    /* Shared variables */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* Define fixed element heights */
    --header-height: 72px;
    --footer-height: 64px; /* Adjust if FooterMinimal height changes */
    --sidebar-width: 70px; /* Collapsed width */
  }
  
  /* Initialize both theme values immediately to prevent FOUC */
  :global(.initial-theme) {
    --bg-primary: var(--dark-bg-primary);
    --bg-secondary: var(--dark-bg-secondary);
    --bg-tertiary: var(--dark-bg-tertiary);
    --text-primary: var(--dark-text-primary);
    --text-secondary: var(--dark-text-secondary);
    --text-tertiary: var(--dark-text-tertiary);
    --border-color: var(--dark-border-color);
    --color-accent: var(--dark-color-accent);
    --color-accent-light: var(--dark-color-accent-light);
    --color-hover: var(--dark-color-hover);
    --shadow-sm: var(--dark-shadow-sm);
    --shadow-md: var(--dark-shadow-md);
    --shadow-lg: var(--dark-shadow-lg);
    --table-hover: var(--dark-table-hover);
    --tab-active-border: var(--dark-tab-active-border);
    --favorite-color: var(--dark-favorite-color);
    --verified-badge: var(--dark-verified-badge);
    --gradient-primary: var(--dark-gradient-primary);
    --gradient-secondary: var(--dark-gradient-secondary);
    --gradient-accent: var(--dark-gradient-accent);
  }
  
  :global(.light) {
    --bg-primary: var(--light-bg-primary);
    --bg-secondary: var(--light-bg-secondary);
    --bg-tertiary: var(--light-bg-tertiary);
    --text-primary: var(--light-text-primary);
    --text-secondary: var(--light-text-secondary);
    --text-tertiary: var(--light-text-tertiary);
    --border-color: var(--light-border-color);
    --color-accent: var(--light-color-accent);
    --color-accent-light: var(--light-color-accent-light);
    --color-hover: var(--light-color-hover);
    --shadow-sm: var(--light-shadow-sm);
    --shadow-md: var(--light-shadow-md);
    --shadow-lg: var(--light-shadow-lg);
  }
  
  :global(.dark) {
    --bg-primary: var(--dark-bg-primary);
    --bg-secondary: var(--dark-bg-secondary);
    --bg-tertiary: var(--dark-bg-tertiary);
    --text-primary: var(--dark-text-primary);
    --text-secondary: var(--dark-text-secondary);
    --text-tertiary: var(--dark-text-tertiary);
    --border-color: var(--dark-border-color);
    --color-accent: var(--dark-color-accent);
    --color-accent-light: var(--dark-color-accent-light);
    --color-hover: var(--dark-color-hover);
    --shadow-sm: var(--dark-shadow-sm);
    --shadow-md: var(--dark-shadow-md);
    --shadow-lg: var(--dark-shadow-lg);
    --table-hover: var(--dark-table-hover);
    --tab-active-border: var(--dark-tab-active-border);
    --favorite-color: var(--dark-favorite-color);
    --verified-badge: var(--dark-verified-badge);
    --gradient-primary: var(--dark-gradient-primary);
    --gradient-secondary: var(--dark-gradient-secondary);
    --gradient-accent: var(--dark-gradient-accent);
  }
  
  /* Global styles */
  :global(html) {
    height: 100%;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    overflow: hidden; /* Prevent body scroll */
    height: 100%;
  }
  
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  
  .app-container {
    display: flex;
    height: 100vh; /* Full viewport height */
    overflow: hidden; /* Prevent scrolling on the container */
    contain: content; 
    position: relative; 
  }
  
  /* Desktop layout specific styles */
  .main-desktop {
    flex: 1; /* Allow main content to grow */
    padding-left: var(--sidebar-width); /* Space for fixed sidebar */
    padding-top: var(--header-height); /* Space for fixed header */
    padding-bottom: var(--footer-height); /* Space for fixed footer */
    height: 100vh; /* Full viewport height */
    overflow-y: auto; /* Make ONLY this element scrollable */
    transition: padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Match sidebar transition */
    
    /* Content padding */
    box-sizing: border-box; /* Ensure padding is included in height/width */
    padding: var(--header-height) 24px var(--footer-height) calc(var(--sidebar-width) + 24px);

    /* Improve rendering performance */
    contain: layout style paint;
    position: relative; 
    z-index: 1; 
  }
  
  /* When sidebar expands, adjust padding */
  .app-container.sidebar-expanded .main-desktop {
      padding-left: calc(240px + 24px); /* Expanded width + padding */
  }

  /* Mobile/Tablet layout styles */
  .main-mobile-tablet {
     flex: 1;
     padding: 1rem;
     overflow-y: auto; /* Allow scrolling */
     padding-top: 70px; /* Assuming mobile header height */
     padding-bottom: 70px; /* Assuming mobile footer height/space */
  }

  /* Styles for mobile/tablet standard footer */
  .standard-footer {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    padding: 3rem 1rem 1rem;
    margin-top: auto; /* Push to bottom if content is short */
    border-top: 1px solid var(--border-color);
    flex-shrink: 0; /* Prevent shrinking */
  }
  
  /* Mobile footer has simplified layout */
  .mobile-footer .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .mobile-footer .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .mobile-footer .footer-bottom {
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
  }
  
  .footer-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .logo-svg {
    display: block;
    margin-bottom: 1rem;
  }
  
  .logo-path {
    fill: var(--text-primary); /* Use theme variable */
  }
  
  .footer-brand .tagline {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  
  .footer-links {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
  
  .footer-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }
  
  .footer-section a {
    display: block;
    color: var(--text-secondary);
    text-decoration: none;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    transition: color 0.2s ease;
  }
  
  .footer-section a:hover {
    color: var(--color-accent);
  }
  
  .footer-bottom {
    max-width: 1200px;
    margin: 2rem auto 0;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-tertiary);
  }
  
  .social-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .social-links a {
    color: var(--text-tertiary);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .social-links a:hover {
    color: var(--color-accent);
  }
  
  /* Sidebar handling for mobile */
  .sidebar-open {
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    /* Adjust standard footer for smaller screens */
    .standard-footer .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .standard-footer .footer-links {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    
    .standard-footer .footer-bottom {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style> 