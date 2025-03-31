<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { theme } from '$lib/stores/theme.store';
  
  export let name: string;
  export let image: string;
  export let price: number;
  export let currency: string = 'ICP';
  export let creator: string;
  export let blockchain: string;
  export let tokenId: string;
  export let collection: string;
  export let attributes: any = {};
  export let rarity: string = '';
  export let index: number = 0;
  export let liked: boolean = false;
  
  let cardVisible = false;
  let isHovering = false;
  let showDetails = false;
  let likeCount = Math.floor(Math.random() * 50) + 5;
  let likeAnimation = false;
  
  // Animation values
  const priceProgress = tweened(0, {
    duration: 1000,
    easing: cubicOut
  });
  
  onMount(() => {
    // Stagger the entry of cards for a cascading effect
    setTimeout(() => {
      cardVisible = true;
      
      // Animate price counter
      priceProgress.set(1);
    }, 100 + index * 50);
  });
  
  function toggleDetails() {
    showDetails = !showDetails;
  }
  
  function handleLike() {
    liked = !liked;
    if (liked) {
      likeCount++;
      likeAnimation = true;
      setTimeout(() => {
        likeAnimation = false;
      }, 1000);
    } else {
      likeCount--;
    }
  }
  
  // Get rarity color
  function getRarityColor(rarity: string): string {
    switch(rarity?.toLowerCase()) {
      case 'legendary':
        return 'var(--legendary-color, #FFA500)';
      case 'rare':
        return 'var(--rare-color, #8A2BE2)';
      case 'uncommon':
        return 'var(--uncommon-color, #32CD32)';
      case 'common':
        return 'var(--common-color, #87CEEB)';
      default:
        return 'var(--color-accent)';
    }
  }
  
  // Animation value for hover effect
  $: hoverTransform = isHovering 
    ? 'translateY(-10px) scale(1.03)' 
    : 'translateY(0) scale(1)';
    
  // Animated price value
  $: displayPrice = price * $priceProgress;
</script>

{#if cardVisible}
  <div 
    class="nft-card"
    style="transform: {hoverTransform};"
    on:mouseenter={() => isHovering = true}
    on:mouseleave={() => isHovering = false}
    role="article"
    aria-label="NFT card for {name}"
  >
    <!-- Use transitions individually instead of with animate:flip which requires special parent context -->
    {#key showDetails}
      <div 
        class="image-container"
        in:fade={{ duration: 300 }}
      >
        <img 
          src={image} 
          alt={name}
          class:show-details={showDetails}
        />

        {#if rarity}
          <div 
            class="rarity-badge"
            style="background-color: {getRarityColor(rarity)};"
            in:scale={{ duration: 300, delay: 100 }}
          >
            {rarity}
          </div>
        {/if}
        
        <div class="card-actions">
          <button 
            class="action-button like-button" 
            class:liked={liked}
            on:click={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <svg 
              class:animate-like={likeAnimation}
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={liked ? "red" : "none"} 
              stroke={liked ? "red" : "white"} 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="like-count">{likeCount}</span>
          </button>
          
          <button 
            class="action-button detail-button" 
            on:click={toggleDetails}
            aria-label={showDetails ? "Hide details" : "Show details"}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              style="transform: rotate({showDetails ? '180deg' : '0deg'}); transition: transform 0.3s;"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    {/key}

    <div class="card-content">
      <div class="card-header">
        <h3 class="nft-name">{name}</h3>
        <div class="price-tag">
          <span class="price-value">{displayPrice.toFixed(2)}</span>
          <span class="currency">{currency}</span>
        </div>
      </div>
      
      <div class="creator">
        <span class="label">Creator:</span>
        <span class="value">{creator}</span>
      </div>
      
      <div class="blockchain">
        <span class="label">Chain:</span>
        <span class="blockchain-badge">{blockchain}</span>
      </div>
    </div>

    {#if showDetails}
      <div 
        class="details-panel"
        transition:fly={{ y: -20, duration: 300, easing: cubicOut }}
      >
        <div class="details-header">
          <h4>Properties</h4>
        </div>
        
        <div class="attributes-grid">
          {#if attributes && Object.keys(attributes).length > 0}
            {#each Object.entries(attributes) as [key, value]}
              {#if key !== 'rarity' && value}
                <div 
                  class="attribute"
                  in:scale={{ duration: 200, delay: 100 }}
                >
                  <span class="attribute-name">{key}</span>
                  <span class="attribute-value">{value}</span>
                </div>
              {/if}
            {/each}
          {:else}
            <div class="no-attributes">No properties found</div>
          {/if}
        </div>
        
        <div class="details-footer">
          <div class="collection-info">
            <span class="label">Collection:</span>
            <span class="value">{collection}</span>
          </div>
          
          <div class="token-info">
            <span class="label">Token ID:</span>
            <span class="value token-id">{tokenId}</span>
          </div>
        </div>
      </div>
    {/if}
    
    <div class="card-footer">
      <button class="buy-button">
        <span class="button-text">Buy Now</span>
      </button>
      <button class="offer-button">
        <span class="button-text">Make Offer</span>
      </button>
    </div>
  </div>
{:else}
  <!-- Initial entry animation for the card -->
  <div class="nft-card-placeholder" in:fade={{ duration: 200, delay: index * 75 }}></div>
{/if}

<style>
  .nft-card {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                box-shadow 0.5s ease,
                background-color 0.3s ease;
    position: relative;
    border: 1px solid var(--border-color);
  }
  
  .nft-card-placeholder {
    height: 450px;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    animation: pulse 1.5s infinite ease-in-out;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 0.8; }
    100% { opacity: 0.6; }
  }
  
  .nft-card:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--color-accent);
  }
  
  .image-container {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 Aspect Ratio */
    overflow: hidden;
  }
  
  .image-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .image-container:hover img:not(.show-details) {
    transform: scale(1.1);
  }
  
  .image-container img.show-details {
    transform: scale(1.05) translateY(-10px);
    filter: brightness(0.7) blur(2px);
  }
  
  .rarity-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--color-accent);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    z-index: 2;
  }
  
  .card-actions {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 0.5rem;
    z-index: 2;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .image-container:hover .card-actions {
    opacity: 1;
    transform: translateY(0);
  }
  
  .action-button {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    border: none;
    border-radius: var(--radius-full);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  
  .action-button:hover {
    background-color: rgba(0, 0, 0, 0.7);
    transform: translateY(-2px);
  }
  
  .like-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    width: auto;
    padding: 0 0.75rem;
  }
  
  .like-count {
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .animate-like {
    animation: heartbeat 1s ease;
  }
  
  @keyframes heartbeat {
    0% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(1); }
    75% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }
  
  .nft-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
  }
  
  .price-tag {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    font-weight: 600;
    color: white;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .price-value {
    margin-right: 0.25rem;
  }
  
  .creator, .blockchain {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  
  .label {
    color: var(--text-tertiary);
  }
  
  .value {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .blockchain-badge {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .details-panel {
    background-color: var(--bg-tertiary);
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  .details-header {
    margin-bottom: 0.75rem;
  }
  
  .details-header h4 {
    font-size: 0.9rem;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }
  
  .attributes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .attribute {
    background: linear-gradient(135deg, var(--bg-secondary), rgba(139, 92, 246, 0.1));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .attribute:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .attribute-name {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }
  
  .attribute-value {
    font-size: 0.85rem;
    color: var(--text-primary);
    font-weight: 600;
    word-break: break-word;
  }
  
  .no-attributes {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--text-tertiary);
    font-size: 0.85rem;
    padding: 1rem;
  }
  
  .details-footer {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }
  
  .collection-info, .token-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .token-id {
    font-family: monospace;
    font-size: 0.75rem;
  }
  
  .card-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  .buy-button, .offer-button {
    border: none;
    border-radius: var(--radius-md);
    padding: 0.6rem 0;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .buy-button {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
  }
  
  .offer-button {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  .buy-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(211, 0, 197, 0.3);
  }
  
  .offer-button:hover {
    background-color: var(--bg-primary);
    transform: translateY(-2px);
  }
  
  .button-text {
    position: relative;
    z-index: 1;
  }
  
  @keyframes glowing {
    0% { box-shadow: 0 0 5px rgba(211, 0, 197, 0.5); }
    50% { box-shadow: 0 0 20px rgba(211, 0, 197, 0.8); }
    100% { box-shadow: 0 0 5px rgba(211, 0, 197, 0.5); }
  }
</style> 