<script lang="ts">
  import { authStore } from '$lib/stores/auth.store';
  import { signIn, signOut } from '$lib/services/auth.services';
  
  let isLoading = false;
  
  // Handle wallet connect
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
  
  // Truncate principal for display
  function truncatePrincipal(principal: string): string {
    if (!principal) return '';
    if (principal.length <= 10) return principal;
    return `${principal.substring(0, 5)}...${principal.substring(principal.length - 3)}`;
  }
</script>

<header class="header">
  <div class="search-container">
    <div class="search-input">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" placeholder="Search NFTropoly" />
    </div>
  </div>
  
  <div class="wallet-container">
    <button class="wallet-button" on:click={handleConnectWallet} disabled={isLoading}>
      {#if isLoading}
        <span>Loading...</span>
      {:else if $authStore.identity}
        <span class="wallet-address">{truncatePrincipal($authStore.identity.getPrincipal().toString())}</span>
      {:else}
        <span>Connect Wallet</span>
      {/if}
    </button>
  </div>
</header>

<style>
  .header {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    position: fixed;
    top: 0;
    left: 70px; /* Matches the collapsed sidebar width */
    right: 0;
    z-index: 100; /* Higher z-index to ensure it stays on top */
    transition: left 0.25s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    width: calc(100% - 70px); /* Take full width minus sidebar */
    /* Hardware acceleration for smoother fixed positioning */
    transform: translateZ(0);
    backface-visibility: hidden;
  }
  
  .search-container {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .search-input {
    position: relative;
    width: 100%;
    max-width: 480px;
  }
  
  .search-input svg {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
  
  .search-input input {
    width: 100%;
    height: 44px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 99px;
    padding: 0 16px 0 42px;
    font-size: 16px;
    color: var(--text-primary);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  
  .search-input input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-accent-light);
  }
  
  .wallet-container {
    margin-left: 20px;
  }
  
  .wallet-button {
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 99px;
    height: 40px;
    padding: 0 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .wallet-button:hover:not(:disabled) {
    background-color: rgba(139, 92, 246, 0.85);
  }
  
  .wallet-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .wallet-address {
    font-family: monospace;
    font-size: 14px;
  }
</style> 