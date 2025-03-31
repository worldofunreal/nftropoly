<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { theme, toggleTheme } from '$lib/stores/theme.store';
  import { signIn, signOut } from '$lib/services/auth.services';
  import ThemeSwitch from './ThemeSwitch.svelte';
  
  export let currentPage: string = "/";
  export let isMobile: boolean = false;
  export let isTablet: boolean = false;
  export let isDesktop: boolean = false;
  export let sidebarOpen: boolean = false;
  
  let isLoading = false;
  const dispatch = createEventDispatcher();
  
  // Truncate principal for display
  function truncatePrincipal(principal: string): string {
    if (!principal) return '';
    if (principal.length <= 10) return principal;
    return `${principal.substring(0, 5)}...${principal.substring(principal.length - 3)}`;
  }
  
  // Handle wallet connect button click - use the same auth service as Wallet.svelte
  async function handleConnectWallet() {
    if ($authStore.identity) {
      isLoading = true;
      try {
        await signOut();
      } finally {
        isLoading = false;
      }
    } else {
      isLoading = true;
      try {
        const { success, err } = await signIn();
        if (success === 'error') {
          console.error(err);
        }
      } finally {
        isLoading = false;
      }
    }
  }
  
  function toggleSidebar() {
    dispatch('toggleSidebar');
  }
</script>

<!-- Mobile Header -->
{#if isMobile || isTablet}
  <header class={`responsive-header ${isTablet ? 'tablet-header' : 'mobile-header'}`}>
    <button class="menu-button" on:click={toggleSidebar} aria-label="Toggle menu">
      {#if sidebarOpen}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      {/if}
    </button>
    
    <div class="brand">
      <a href="/">
        <svg class="logo-svg" width={isTablet ? "36" : "30"} height={isTablet ? "36" : "30"} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="logo-path" d="M151.772 219.818L121.479 235.396L122.883 83.5168L256 24.3169L255.979 66.9016L228.367 77.3628L228.388 182.805L204.45 193.5V86.0492L153.155 109.251V134.981L187.057 117.7V150.083L153.133 168.944L151.772 219.818Z" />
          <path class="logo-path" d="M0 186.45V33.5312L39.3061 47.7996L84.6969 143V64L116.954 78.9228L115.54 235.476L87.0936 219.79L37.2689 125.333C34.7524 125.333 34.992 199.046 34.992 199.046L0 186.45Z" />
        </svg>
      </a>
    </div>
    
    {#if isTablet}
      <div class="tablet-search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search" />
      </div>
    {/if}
    
    <div class="header-actions">
      <ThemeSwitch />
      <button class="wallet-button" on:click={handleConnectWallet} aria-label="Connect or disconnect wallet">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M16 10h.01"></path>
          <path d="M19 12v4"></path>
          <path d="M16 16h3"></path>
        </svg>
      </button>
    </div>
  </header>
  
  <!-- Mobile/Tablet Sidebar -->
  <div class={`responsive-sidebar ${isTablet ? 'tablet-sidebar' : 'mobile-sidebar'}`} class:open={sidebarOpen}>
    <div class="sidebar-inner">
      {#if !isTablet}
        <div class="sidebar-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search" />
        </div>
      {/if}
      
      <nav class="sidebar-nav">
        <a href="/" class={currentPage === "/" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Marketplace</span>
        </a>
        <a href="/collections" class={currentPage === "/collections" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Collections</span>
        </a>
        <a href="/create" class={currentPage === "/create" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Create</span>
        </a>
        <a href="/api" class={currentPage === "/api" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>API</span>
        </a>
      </nav>
      
      {#if $authStore.identity}
        <div class="sidebar-user">
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-principal">{truncatePrincipal($authStore.identity.getPrincipal().toString())}</div>
          </div>
          <button class="logout-button" on:click={handleConnectWallet} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Log out'}
          </button>
        </div>
      {:else}
        <div class="sidebar-connect">
          <button class="connect-button" on:click={handleConnectWallet} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Connect Wallet'}
          </button>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Mobile/Tablet backdrop -->
  {#if sidebarOpen}
    <button class="responsive-backdrop" on:click={toggleSidebar} on:keydown={(e) => e.key === 'Escape' && toggleSidebar()} aria-label="Close menu" role="button"></button>
  {/if}
{:else}
  <!-- Desktop Navigation -->
  <nav class="desktop-nav">
    <div class="nav-left">
      <div class="brand">
        <a href="/">
          <svg class="logo-svg" width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="logo-path" d="M151.772 219.818L121.479 235.396L122.883 83.5168L256 24.3169L255.979 66.9016L228.367 77.3628L228.388 182.805L204.45 193.5V86.0492L153.155 109.251V134.981L187.057 117.7V150.083L153.133 168.944L151.772 219.818Z" />
            <path class="logo-path" d="M0 186.45V33.5312L39.3061 47.7996L84.6969 143V64L116.954 78.9228L115.54 235.476L87.0936 219.79L37.2689 125.333C34.7524 125.333 34.992 199.046 34.992 199.046L0 186.45Z" />
          </svg>
        </a>
      </div>
      
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search items, collections and accounts" />
      </div>
    </div>
  
    <div class="nav-links">
      <a href="/" class={currentPage === "/" ? "active" : ""}>Marketplace</a>
      <a href="/collections" class={currentPage === "/collections" ? "active" : ""}>Collections</a>
      <div class="dropdown">
        <button class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">Create <span class="arrow">▼</span></button>
        <div class="dropdown-menu">
          <a href="/create/nft">Create NFT</a>
          <a href="/create">Create Collection</a>
        </div>
      </div>
      <a href="/api" class={currentPage === "/api" ? "active" : ""}>API</a>
    </div>
  
    <div class="nav-right">
      <ThemeSwitch />
      
      <button class="connect-wallet" on:click={handleConnectWallet} disabled={isLoading}>
        {#if isLoading}
          <span>Loading...</span>
        {:else if $authStore.identity}
          <span class="wallet-address">{truncatePrincipal($authStore.identity.getPrincipal().toString())}</span>
        {:else}
          <span>Connect Wallet</span>
        {/if}
      </button>
    </div>
  </nav>
{/if}

<style>
  /* Shared Styles */
  .brand a {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s;
    position: relative;
    height: 40px;
  }
  
  .brand a:hover {
    transform: scale(1.05);
  }
  
  /* Logo SVG styling */
  .logo-svg {
    display: block;
  }
  
  .logo-path {
    fill: white;
  }
  
  /* In light theme, make the logo black */
  :global(.light) .logo-path {
    fill: #000000;
  }
  
  /* ======== DESKTOP STYLES ======== */
  .desktop-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    position: relative;
    background-color: var(--bg-secondary);
    box-shadow: var(--shadow-sm);
  }
  
  .nav-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-full);
    padding: 0.5rem 1rem;
    width: 320px;
    border: 1px solid var(--border-color);
  }
  
  .search-bar svg {
    margin-right: 0.5rem;
    color: var(--text-tertiary);
  }
  
  .search-bar input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    width: 100%;
    font-size: 0.9rem;
  }
  
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .nav-links a {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 1rem;
    position: relative;
  }
  
  .nav-links a.active::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--color-accent);
    border-radius: var(--radius-full);
  }
  
  .nav-links a:hover:not(.active) {
    color: var(--color-accent);
  }
  
  .dropdown {
    position: relative;
  }
  
  .dropdown-toggle {
    background: none;
    border: none;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
  }
  
  .dropdown-toggle:hover {
    color: var(--color-accent);
  }
  
  .dropdown-toggle .arrow {
    font-size: 0.7rem;
    margin-left: 0.25rem;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.75rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
    width: 180px;
    padding: 0.5rem;
    display: none;
    z-index: 100;
  }
  
  .dropdown-menu a {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
  }
  
  .dropdown-menu a:hover {
    background-color: var(--color-hover);
  }
  
  .dropdown:hover .dropdown-menu {
    display: block;
    animation: fadeIn 0.2s;
  }
  
  .nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .connect-wallet {
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    padding: 0.6rem 1.2rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .connect-wallet:hover:not(:disabled) {
    background-color: rgba(139, 92, 246, 0.8);
  }
  
  .connect-wallet:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .wallet-address {
    font-family: monospace;
  }

  /* ======== RESPONSIVE STYLES (TABLET & MOBILE) ======== */
  .responsive-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    position: relative;
    z-index: 20;
  }
  
  .tablet-header {
    padding: 1rem 1.5rem;
  }
  
  .menu-button {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .menu-button:hover {
    background-color: var(--color-hover);
  }
  
  .tablet-search {
    display: flex;
    align-items: center;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-full);
    padding: 0.4rem 0.8rem;
    width: 50%;
    max-width: 300px;
    border: 1px solid var(--border-color);
  }
  
  .tablet-search svg {
    margin-right: 0.5rem;
    color: var(--text-tertiary);
  }
  
  .tablet-search input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    width: 100%;
    font-size: 0.9rem;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .wallet-button {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  /* Responsive Sidebar */
  .responsive-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 85%;
    max-width: 320px;
    height: 100vh;
    background-color: var(--bg-secondary);
    z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-lg);
    overflow-y: auto;
    padding-top: 1rem;
  }
  
  .tablet-sidebar {
    max-width: 360px;
  }
  
  .responsive-sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
  }
  
  .sidebar-search {
    display: flex;
    align-items: center;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: 0.5rem 1rem;
    margin-bottom: 1.5rem;
    border: 1px solid var(--border-color);
  }
  
  .sidebar-search svg {
    margin-right: 0.5rem;
    color: var(--text-tertiary);
  }
  
  .sidebar-search input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    width: 100%;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }
  
  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: var(--text-primary);
    padding: 0.75rem;
    border-radius: var(--radius-md);
    transition: background-color 0.2s;
  }
  
  .sidebar-nav a:hover {
    background-color: var(--color-hover);
  }
  
  .sidebar-nav a.active {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    font-weight: 500;
  }
  
  .sidebar-user, .sidebar-connect {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background-color: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
  
  .user-principal {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .logout-button, .connect-button {
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.75rem;
    border-radius: var(--radius-md);
    width: 100%;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 500;
  }
  
  .connect-button {
    background-color: var(--color-accent);
    color: white;
    border: none;
  }
  
  .logout-button:hover, .connect-button:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
    filter: brightness(0.9);
  }
  
  .connect-button:hover:not(:disabled) {
    background-color: var(--color-accent);
    filter: brightness(0.9);
  }
  
  .logout-button:disabled, .connect-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  /* Backdrop for sidebar */
  .responsive-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 25;
    border: none;
    cursor: pointer;
  }
  
  /* Animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style> 