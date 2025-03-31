<script lang="ts">
  export let id: string;
  export let name: string;
  export let description: string;
  export let price: number;
  export let imageUrl: string;
  export let owner: string;
  export let blockchain: 'IC' | 'ETH' | 'SOL' | 'BTC' = 'IC';
  export let tokenId: string | undefined = undefined;
  export let collection: string | undefined = undefined;
  export let attributes: Record<string, string | number | boolean> | undefined = undefined;
  export let rarity: string | undefined = undefined;
  
  import { authStore } from '$lib/stores/auth.store';
  import { toastsShow } from '$lib/stores/toasts.store';
  import { theme } from '$lib/stores/theme.store';
  import { purchaseNFT } from '$lib/services/nft.services';
  
  // Blockchain display info
  const blockchainInfo = {
    IC: { name: 'Internet Computer', icon: '🌐', color: '#29ABE2' },
    ETH: { name: 'Ethereum', icon: '💎', color: '#627EEA' },
    SOL: { name: 'Solana', icon: '☀️', color: '#9945FF' },
    BTC: { name: 'Bitcoin', icon: '₿', color: '#F7931A' }
  };

  // Rarity display info with proper type definition
  type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  
  const rarityInfo: Record<RarityLevel, { color: string; label: string }> = {
    'common': { color: '#A0A0A0', label: 'Common' },
    'uncommon': { color: '#4CD964', label: 'Uncommon' },
    'rare': { color: '#5AC8FA', label: 'Rare' },
    'epic': { color: '#AF52DE', label: 'Epic' },
    'legendary': { color: '#FF9500', label: 'Legendary' },
    'mythic': { color: '#FF2D55', label: 'Mythic' }
  };

  // Use a default rarity if none provided
  const effectiveRarity = rarity ? rarity.toLowerCase() as RarityLevel : 'common';
  
  const handleBuy = async () => {
    if (!$authStore.identity) {
      toastsShow({ 
        text: 'Please connect your wallet first', 
        level: 'warn' 
      });
      return;
    }
    
    const success = await purchaseNFT(id);
    if (!success) {
      toastsShow({
        text: 'There was an error purchasing this NFT. Please try again.',
        level: 'error'
      });
    }
  };
  
  // Format the price based on blockchain
  const formatPrice = (value: number, chain: string) => {
    switch(chain) {
      case 'ETH':
        return `${value} ETH`;
      case 'SOL':
        return `${value} SOL`;
      case 'BTC':
        return `${value} BTC`;
      case 'IC':
      default:
        return `${value} ICP`;
    }
  };

  // Truncate description if too long
  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
</script>

<div class="nft-item" style="--rarity-color: {rarityInfo[effectiveRarity]?.color || '#A0A0A0'}">
  <div class="nft-image-container">
    <img src={imageUrl} alt={name} class="nft-image" />
    
    <div class="nft-overlay">
      <button class="buy-now-btn" on:click={handleBuy}>Buy Now</button>
      <div class="nft-details-btn">Details</div>
    </div>
    
    <div class="blockchain-badge" style="--blockchain-color: {blockchainInfo[blockchain].color}">
      <span class="blockchain-icon">{blockchainInfo[blockchain].icon}</span>
    </div>
    
    {#if rarity}
      <div class="rarity-badge" style="--rarity-color: {rarityInfo[effectiveRarity]?.color || '#A0A0A0'}">
        {rarityInfo[effectiveRarity]?.label || 'Common'}
      </div>
    {/if}
  </div>
  
  <div class="nft-content">
    <div class="nft-header">
      <h3 class="nft-name">{name}</h3>
      <div class="nft-price">{formatPrice(price, blockchain)}</div>
    </div>
    
    {#if collection}
      <div class="nft-collection">{collection}</div>
    {/if}
    
    <p class="nft-description">{truncateDescription(description)}</p>
    
    <div class="nft-footer">
      <div class="nft-owner">
        <span class="owner-label">Owner:</span>
        <span class="owner-address">{owner.substring(0, 5)}...{owner.substring(owner.length - 3)}</span>
      </div>
      
      {#if attributes && Object.keys(attributes).length > 0}
        <div class="nft-attributes">
          {#each Object.entries(attributes).slice(0, 2) as [key, value]}
            <span class="attribute">
              {key}: {value}
            </span>
          {/each}
          {#if Object.keys(attributes).length > 2}
            <span class="attribute more">+{Object.keys(attributes).length - 2}</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .nft-item {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    border: 2px solid var(--border-color);
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  .nft-item:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: var(--rarity-color);
  }
  
  .nft-image-container {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio */
    overflow: hidden;
  }
  
  .nft-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
    filter: brightness(0.95);
  }
  
  .nft-item:hover .nft-image {
    transform: scale(1.12);
    filter: brightness(1.1);
  }
  
  .nft-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent 70%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 1.2rem;
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    gap: 0.75rem;
  }
  
  .nft-item:hover .nft-overlay {
    opacity: 1;
  }
  
  .buy-now-btn {
    background: linear-gradient(90deg, #ff4d4d, #ff9d4d);
    color: white;
    border: none;
    border-radius: 25px;
    padding: 0.6rem 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    width: 85%;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 10px rgba(255, 77, 77, 0.3);
  }
  
  .buy-now-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 15px rgba(255, 77, 77, 0.5);
    background: linear-gradient(90deg, #ff3333, #ff8833);
  }
  
  .nft-details-btn {
    color: white;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    transition: all 0.2s;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  .nft-details-btn:hover {
    transform: scale(1.1);
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
  }
  
  .blockchain-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: var(--blockchain-color, #3182ce);
    color: white;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    box-shadow: var(--shadow-md);
    z-index: 5;
  }
  
  .blockchain-icon {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .rarity-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--rarity-color, #A0A0A0);
    color: white;
    border-radius: 15px;
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: var(--shadow-md);
    z-index: 5;
  }
  
  .nft-content {
    padding: 1.2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .nft-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }
  
  .nft-name {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }
  
  .nft-price {
    font-weight: 700;
    color: var(--color-accent);
    font-size: 1.1rem;
    white-space: nowrap;
  }
  
  .nft-collection {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    font-weight: 500;
    display: flex;
    align-items: center;
  }
  
  .nft-collection::before {
    content: '📚';
    margin-right: 0.4rem;
  }
  
  .nft-description {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0.5rem 0 1rem;
    flex: 1;
  }
  
  .nft-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin-top: auto;
    border-top: 1px solid var(--border-color);
    padding-top: 0.8rem;
  }
  
  .nft-owner {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .owner-label {
    opacity: 0.7;
  }
  
  .owner-address {
    font-family: monospace;
    background-color: var(--bg-tertiary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
  
  .nft-attributes {
    display: flex;
    gap: 0.4rem;
  }
  
  .attribute {
    background-color: var(--bg-tertiary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
  }
  
  .attribute.more {
    background-color: var(--color-accent);
    color: white;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .nft-item {
      border-radius: var(--radius-md);
    }
    
    .nft-content {
      padding: 1rem;
    }
    
    .nft-name {
      font-size: 1.1rem;
    }
    
    .nft-price {
      font-size: 1rem;
    }
    
    .buy-now-btn {
      padding: 0.5rem 1.2rem;
      font-size: 0.85rem;
    }
    
    .blockchain-badge, .rarity-badge {
      transform: scale(0.9);
    }
  }
  
  /* Modern, app-like styles */
  :global(.light) .nft-item {
    background-color: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }
  
  :global(.light) .nft-overlay {
    background: linear-gradient(to top, rgba(255, 255, 255, 0.9), transparent 70%);
  }
  
  :global(.light) .nft-details-btn {
    color: var(--color-accent);
    text-shadow: none;
  }
  
  :global(.light) .buy-now-btn {
    box-shadow: 0 5px 15px rgba(255, 77, 77, 0.2);
  }
</style> 