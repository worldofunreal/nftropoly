<script lang="ts">
  import type { BlockchainType } from '$lib/services/nft.services';
  import { createEventDispatcher } from 'svelte';
  import { theme } from '$lib/stores/theme.store';
  
  export let selected: BlockchainType | undefined = undefined;
  
  // All supported blockchains and their display info
  const blockchains: {
    id: BlockchainType;
    name: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: 'IC',
      name: 'Internet Computer',
      icon: '🌐',
      color: '#29ABE2'
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      icon: '💎',
      color: '#627EEA'
    },
    {
      id: 'SOL',
      name: 'Solana',
      icon: '☀️',
      color: '#9945FF'
    },
    {
      id: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      color: '#F7931A'
    }
  ];
  
  const dispatch = createEventDispatcher<{
    change: BlockchainType | undefined;
  }>();
  
  function handleSelect(blockchain?: BlockchainType) {
    // Toggle if selecting the already selected blockchain
    if (blockchain === selected) {
      selected = undefined;
    } else {
      selected = blockchain;
    }
    
    dispatch('change', selected);
  }
</script>

<div class="blockchain-selector">
  <div class="blockchain-buttons">
    <button 
      class="blockchain-button {selected === undefined ? 'active' : ''}"
      on:click={() => handleSelect(undefined)}
    >
      All
    </button>
    
    {#each blockchains as blockchain}
      <button 
        class="blockchain-button {selected === blockchain.id ? 'active' : ''}"
        style="--blockchain-color: {blockchain.color}"
        on:click={() => handleSelect(blockchain.id)}
      >
        <span class="blockchain-icon">{blockchain.icon}</span>
        {blockchain.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .blockchain-selector {
    margin: 0.5rem 0;
  }
  
  .blockchain-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .blockchain-button {
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--bg-tertiary);
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
  }
  
  .blockchain-button:hover {
    border-color: var(--blockchain-color, var(--color-accent));
    box-shadow: 0 0 0 1px var(--blockchain-color, var(--color-accent));
  }
  
  .blockchain-button.active {
    background-color: var(--blockchain-color, var(--color-accent));
    color: white;
    border-color: var(--blockchain-color, var(--color-accent));
  }
  
  .blockchain-icon {
    font-size: 1.25rem;
  }
</style> 