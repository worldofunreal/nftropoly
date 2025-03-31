<script lang="ts">
  import '../index.scss';
  import { onMount } from 'svelte';
  import { theme, initTheme } from '$lib/stores/theme.store';
  import { authStore } from '$lib/stores/auth.store';
  import Navigation from '$lib/components/Navigation.svelte';
  import Toasts from '$lib/components/Toasts.svelte';
  
  let isMobile = false;
  let sidebarOpen = false;
  
  onMount(() => {
    // Initialize theme
    initTheme();
    
    // Initialize auth store
    authStore.sync();
    
    // Check if mobile on mount
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });
  
  function checkMobile() {
    isMobile = window.innerWidth < 768;
    if (!isMobile) {
      sidebarOpen = false;
    }
  }
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<div class="app-container {$theme}" class:sidebar-open={sidebarOpen}>
  <Navigation 
    isMobile={isMobile} 
    sidebarOpen={sidebarOpen} 
    on:toggleSidebar={toggleSidebar} 
  />
  
  <main>
    <slot></slot>
  </main>
  
  <footer>
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
          <a href="/integration">Integration</a>
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
  
  <!-- We keep Toasts globally but remove Wallet since its functionality is now in the Navigation component -->
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
    --dark-bg-primary: #0f0f1a;
    --dark-bg-secondary: #151525;
    --dark-bg-tertiary: #1e1e35;
    --dark-text-primary: #f1f5f9;
    --dark-text-secondary: #cbd5e1;
    --dark-text-tertiary: #94a3b8;
    --dark-border-color: #2c2c44;
    --dark-color-accent: #8b5cf6;
    --dark-color-accent-light: rgba(139, 92, 246, 0.2);
    --dark-color-hover: rgba(255, 255, 255, 0.05);
    --dark-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
    --dark-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    --dark-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
    
    /* Shared variables */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;
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
  }
  
  /* Global styles */
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  main {
    flex: 1;
    padding: 0 1rem;
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
  }
  
  footer {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    padding: 3rem 1rem 1rem;
    margin-top: 3rem;
    border-top: 1px solid var(--border-color);
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
    fill: white;
  }
  
  /* In light theme, make the logo black */
  :global(.light) .logo-path {
    fill: #000000;
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
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  .footer-section a {
    display: block;
    color: var(--text-secondary);
    text-decoration: none;
    margin-bottom: 0.5rem;
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
    color: var(--text-tertiary);
    font-size: 0.9rem;
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
  
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .footer-links {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
</style> 