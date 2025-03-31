<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { theme, toggleTheme } from '$lib/stores/theme.store';
  import { signIn, signOut } from '$lib/services/auth.services';
  import ThemeSwitch from './ThemeSwitch.svelte';
  
  export let currentPage: string = "/";
  export let isMobile: boolean = false;
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
{#if isMobile}
  <header class="mobile-header">
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
        <svg class="logo-svg" width="30" height="30" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="logo-path" d="M151.772 219.818L121.479 235.396L122.883 83.5168L256 24.3169L255.979 66.9016L228.367 77.3628L228.388 182.805L204.45 193.5V86.0492L153.155 109.251V134.981L187.057 117.7V150.083L153.133 168.944L151.772 219.818Z" />
          <path class="logo-path" d="M0 186.45V33.5312L39.3061 47.7996L84.6969 143V64L116.954 78.9228L115.54 235.476L87.0936 219.79L37.2689 125.333C34.7524 125.333 34.992 199.046 34.992 199.046L0 186.45Z" />
        </svg>
      </a>
    </div>
    
    <div class="header-actions">
      <ThemeSwitch />
      <button class="wallet-button" on:click={handleConnectWallet} aria-label="Connect wallet">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M16 10h.01"></path>
          <path d="M19 12v4"></path>
          <path d="M16 16h3"></path>
        </svg>
      </button>
    </div>
  </header>
  
  <!-- Mobile Sidebar -->
  <div class="mobile-sidebar" class:open={sidebarOpen}>
    <div class="sidebar-inner">
      <div class="sidebar-search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search" />
      </div>
      
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
        <a href="/integration" class={currentPage === "/integration" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16.5 9.4l-9-5.19"></path>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <span>Integration</span>
        </a>
        <a href="/api" class={currentPage === "/api" ? "active" : ""}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
          <span>API Docs</span>
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
  
  <!-- Mobile backdrop -->
  {#if sidebarOpen}
    <div class="mobile-backdrop" on:click={toggleSidebar}></div>
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
        <a href="#" class="dropdown-toggle">Create <span class="arrow">▼</span></a>
        <div class="dropdown-menu">
          <a href="/create/nft">Create NFT</a>
          <a href="/collections">Create Collection</a>
        </div>
      </div>
      <a href="/integration" class={currentPage === "/integration" ? "active" : ""}>Integration</a>
      <a href="/api" class={currentPage === "/api" ? "active" : ""}>API Docs</a>
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
  
  /* Desktop Navigation */
  .desktop-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
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
    position: relative;
    width: 300px;
  }
  
  .search-bar svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
  
  .search-bar input {
    width: 100%;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.65rem 1rem 0.65rem 2.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s;
  }
  
  .search-bar input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-accent-light);
  }
  
  .search-bar input::placeholder {
    color: var(--text-tertiary);
  }
  
  .nav-links {
    display: flex;
    gap: 1.25rem;
    align-items: center;
  }
  
  .nav-links a {
    text-decoration: none;
    color: var(--text-secondary);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    transition: all 0.3s;
    font-weight: 500;
    position: relative;
  }
  
  .nav-links a:hover {
    color: var(--text-primary);
    background-color: var(--color-hover);
    transform: translateY(-2px);
  }
  
  .nav-links a.active {
    color: var(--color-accent);
    font-weight: 600;
  }
  
  .nav-links a.active:before {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    border-radius: 2px;
  }
  
  .dropdown {
    position: relative;
  }
  
  .dropdown-toggle {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .arrow {
    font-size: 0.6rem;
    transition: transform 0.2s;
  }
  
  .dropdown:hover .arrow {
    transform: rotate(180deg);
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    min-width: 180px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    display: none;
    z-index: 100;
    overflow: hidden;
    padding: 0.5rem 0;
  }
  
  .dropdown-menu a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    transition: all 0.2s;
    border-radius: 0;
  }
  
  .dropdown-menu a:hover {
    background-color: var(--color-hover);
    color: var(--text-primary);
    transform: none;
  }
  
  .dropdown:hover .dropdown-menu {
    display: block;
    animation: fadeIn 0.2s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .connect-wallet {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #ff2a6d, #d300c5, #652ec7);
    color: white;
    border: none;
    padding: 0.65rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(102, 45, 145, 0.2);
  }
  
  .connect-wallet:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 45, 145, 0.3);
  }
  
  .wallet-address {
    font-family: monospace;
  }
  
  /* Mobile Header */
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--bg-secondary);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
  }
  
  .menu-button {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: background-color 0.3s;
  }
  
  .menu-button:hover {
    background-color: var(--color-hover);
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .wallet-button {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: background-color 0.3s;
  }
  
  .wallet-button:hover {
    background-color: var(--color-hover);
  }
  
  /* Mobile Sidebar */
  .mobile-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background-color: var(--bg-secondary);
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-lg);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .mobile-sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-inner {
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .sidebar-search {
    position: relative;
    margin-bottom: 1.5rem;
  }
  
  .sidebar-search svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
  
  .sidebar-search input {
    width: 100%;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s;
  }
  
  .sidebar-search input:focus {
    outline: none;
    border-color: var(--color-accent);
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .sidebar-nav a:hover {
    background-color: var(--color-hover);
    color: var(--text-primary);
  }
  
  .sidebar-nav a.active {
    background-color: var(--bg-tertiary);
    color: var(--color-accent);
    font-weight: 600;
  }
  
  .sidebar-user {
    margin-top: auto;
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
    border-radius: 50%;
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
  
  .logout-button {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .logout-button:hover {
    background-color: var(--color-hover);
  }
  
  .sidebar-connect {
    margin-top: auto;
    padding-top: 1.5rem;
  }
  
  .connect-button {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(90deg, #ff2a6d, #d300c5, #652ec7);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .connect-button:hover {
    opacity: 0.9;
  }
  
  .mobile-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 150;
    animation: fadeIn 0.3s ease;
  }
</style> 