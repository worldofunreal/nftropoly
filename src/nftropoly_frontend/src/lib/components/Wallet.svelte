<script lang="ts">
  import { onMount } from 'svelte';
  import { signIn, signOut } from '$lib/services/auth.services';
  import { authStore } from '$lib/stores/auth.store';
  import { toasts } from '$lib/stores/toasts.store';
  
  let isLoading = false;
  let principal = '';
  
  onMount(() => {
    authStore.sync();
  });
  
  $: {
    if ($authStore.identity) {
      principal = $authStore.identity.getPrincipal().toString();
    } else {
      principal = '';
    }
  }
  
  const handleSignIn = async () => {
    isLoading = true;
    try {
      const { success, err } = await signIn();
      if (success === 'error') {
        console.error(err);
      }
    } finally {
      isLoading = false;
    }
  };
  
  const handleSignOut = async () => {
    isLoading = true;
    try {
      await signOut();
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="wallet-container">
  {#if $authStore.identity}
    <div class="wallet-info">
      <p class="wallet-principal">Principal: {principal.substring(0, 5)}...{principal.substring(principal.length - 3)}</p>
      <button disabled={isLoading} on:click={handleSignOut} class="wallet-button">
        {#if isLoading}
          Loading...
        {:else}
          Sign Out
        {/if}
      </button>
    </div>
  {:else}
    <button disabled={isLoading} on:click={handleSignIn} class="wallet-button">
      {#if isLoading}
        Loading...
      {:else}
        Connect Wallet
      {/if}
    </button>
  {/if}
</div>

<style>
  .wallet-container {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: #f9f9f9;
    margin-bottom: 1rem;
  }
  
  .wallet-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .wallet-principal {
    font-family: monospace;
    margin: 0;
  }
  
  .wallet-button {
    padding: 0.5rem 1rem;
    background-color: #3182ce;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .wallet-button:hover {
    background-color: #2c5282;
  }
  
  .wallet-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 