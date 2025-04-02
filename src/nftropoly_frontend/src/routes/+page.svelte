<script lang="ts">
  import "../index.scss";
  import { backend } from "$lib/canisters";
  import Wallet from "$lib/components/Wallet.svelte";
  import Toasts from "$lib/components/Toasts.svelte";
  import NFTItem from "$lib/components/NFTItem.svelte";
  import BlockchainSelector from "$lib/components/BlockchainSelector.svelte";
  import Navigation from "$lib/components/Navigation.svelte";
  import { onMount } from "svelte";
  import { fetchNFTs, nftStore } from "$lib/services/nft.services";
  import type { BlockchainType } from "$lib/services/nft.services";

  let selectedBlockchain: BlockchainType | undefined = undefined;
  let searchQuery = '';
  let priceRange = [0, 10000]; // Min and max price
  let sortBy = 'newest';
  let selectedCollection: string | undefined = undefined;
  let timeframe = '24h'; // Default timeframe
  let trendingTimeframe = '7d'; // Default trending timeframe
  
  // Collections available in the marketplace
  const collections = [
    { id: 'nftropoly-genesis', name: 'NFTropoly Genesis' },
    { id: 'nftropoly-avatars', name: 'NFTropoly Avatars' },
    { id: 'nftropoly-lands', name: 'NFTropoly Lands' },
    { id: 'nftropoly-items', name: 'NFTropoly Items' }
  ];
  
  // Subscribe to the NFT store
  $: nfts = $nftStore.items;
  $: isLoading = $nftStore.loading;
  $: error = $nftStore.error;

  // Filter NFTs based on user selections
  $: filteredNFTs = nfts.filter(nft => {
    // Filter by blockchain
    if (selectedBlockchain && nft.blockchain !== selectedBlockchain) {
      return false;
    }
    
    // Filter by collection
    if (selectedCollection && nft.collection !== selectedCollection) {
      return false;
    }
    
    // Filter by price range
    if (nft.price < priceRange[0] || nft.price > priceRange[1]) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = nft.name.toLowerCase().includes(query);
      const matchesDescription = nft.description.toLowerCase().includes(query);
      const matchesCollection = nft.collection?.toLowerCase().includes(query);
      
      if (!(matchesName || matchesDescription || matchesCollection)) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Sort based on selection
    switch (sortBy) {
      case 'newest':
        return (b.createdAt || 0) - (a.createdAt || 0);
      case 'oldest':
        return (a.createdAt || 0) - (b.createdAt || 0);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  onMount(async () => {
    // Load NFTs when the component mounts
    await fetchNFTs();
  });

  // Handle blockchain filter change
  async function handleBlockchainChange(event: CustomEvent<BlockchainType | undefined>) {
    selectedBlockchain = event.detail;
    await fetchNFTs(selectedBlockchain);
  }
  
  function updatePriceRange(e: Event, index: number) {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (index === 0) {
      priceRange = [value, priceRange[1]];
    } else {
      priceRange = [priceRange[0], value];
    }
  }
  
  // Category tags for quick filtering
  const categoryTags = [
    'All', 'Avatars', 'Lands', 'Items', 'Collectibles', 'Art', 'Rare', 'Limited'
  ];
  
  let selectedCategory = 'All';
  
  function selectCategory(category: string) {
    selectedCategory = category;
    
    if (category === 'All') {
      selectedCollection = undefined;
    } else if (category === 'Avatars') {
      selectedCollection = 'nftropoly-avatars';
    } else if (category === 'Lands') {
      selectedCollection = 'nftropoly-lands';
    } else if (category === 'Items') {
      selectedCollection = 'nftropoly-items';
    } else {
      // Other categories can be implemented as needed
      selectedCollection = undefined;
    }
  }
</script>

<main>
  <div class="hero">
    <div class="hero-content">
      <h1>NFTropoly <span class="highlight">Marketplace</span></h1>
      <p class="tagline">Discover, collect, and trade unique digital assets on the Internet Computer</p>
      
      <div class="hero-buttons">
        <button class="cta-button create"><span>Create NFT</span></button>
        <button class="cta-button explore"><span>Explore</span></button>
      </div>
    </div>
  </div>
  
  <div class="content">
    <div class="categories-container">
      <div class="section-header">
        <h2>Browse by category</h2>
      </div>
      <div class="categories-scroll">
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/nft1/400/400" alt="All NFTs" />
          </div>
          <div class="category-name">All NFTs</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/art2/400/400" alt="Art" />
          </div>
          <div class="category-name">Art</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/gaming3/400/400" alt="Gaming" />
          </div>
          <div class="category-name">Gaming</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/membership4/400/400" alt="Memberships" />
          </div>
          <div class="category-name">Memberships</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/pfp5/400/400" alt="PFPs" />
          </div>
          <div class="category-name">PFPs</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/photography6/400/400" alt="Photography" />
          </div>
          <div class="category-name">Photography</div>
        </div>
        <div class="category-item">
          <div class="category-image">
            <img src="https://picsum.photos/seed/music7/400/400" alt="Music" />
          </div>
          <div class="category-name">Music</div>
        </div>
      </div>
    </div>
    
    <div class="featured-collections">
      <div class="section-header">
        <h2>Featured Collections</h2>
        <a href="/collections" class="view-all">View All</a>
      </div>
      <div class="collections-scroll">
        <div class="collection-card-mini">
          <div class="collection-image">
            <img src="https://picsum.photos/seed/genesis1/400/400" alt="NFTropoly Genesis" />
          </div>
          <div class="collection-info-mini">
            <h3>NFTropoly Genesis</h3>
            <p>Floor: 2.5 ICP</p>
          </div>
        </div>
        <div class="collection-card-mini">
          <div class="collection-image">
            <img src="https://picsum.photos/seed/avatars2/400/400" alt="NFTropoly Avatars" />
          </div>
          <div class="collection-info-mini">
            <h3>NFTropoly Avatars</h3>
            <p>Floor: 1.8 ICP</p>
          </div>
        </div>
        <div class="collection-card-mini">
          <div class="collection-image">
            <img src="https://picsum.photos/seed/lands3/400/400" alt="NFTropoly Lands" />
          </div>
          <div class="collection-info-mini">
            <h3>NFTropoly Lands</h3>
            <p>Floor: 3.0 ICP</p>
          </div>
        </div>
        <div class="collection-card-mini">
          <div class="collection-image">
            <img src="https://picsum.photos/seed/items4/400/400" alt="NFTropoly Items" />
          </div>
          <div class="collection-info-mini">
            <h3>NFTropoly Items</h3>
            <p>Floor: 0.8 ICP</p>
          </div>
        </div>
        <div class="collection-card-mini">
          <div class="collection-image">
            <img src="https://picsum.photos/seed/special5/400/400" alt="Special Edition" />
          </div>
          <div class="collection-info-mini">
            <h3>Special Edition</h3>
            <p>Floor: 5.0 ICP</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="search-bar-container">
      <div class="search-bar">
        <i class="search-icon">🔍</i>
        <input 
          type="text" 
          placeholder="Search NFTs, collections, or creators..."
          bind:value={searchQuery}
        />
      </div>
    </div>
    
    <div class="category-tags">
      {#each categoryTags as category}
        <button 
          class="category-tag" 
          class:active={selectedCategory === category}
          on:click={() => selectCategory(category)}
        >
          {category}
        </button>
      {/each}
    </div>
    
    <div class="marketplace-content">
      <div class="filters">
        <h2>Filters</h2>
        
        <div class="filter-section">
          <h3>Blockchain</h3>
          <BlockchainSelector selected={selectedBlockchain} on:change={handleBlockchainChange} />
        </div>
        
        <div class="filter-section">
          <h3>Collections</h3>
          <div class="collection-filters">
            {#each collections as collection}
              <label class="collection-option">
                <input 
                  type="radio" 
                  name="collection" 
                  value={collection.id} 
                  checked={selectedCollection === collection.id}
                  on:change={() => selectedCollection = collection.id}
                />
                <span class="collection-name">{collection.name}</span>
              </label>
            {/each}
            <label class="collection-option">
              <input 
                type="radio" 
                name="collection" 
                value={undefined} 
                checked={selectedCollection === undefined}
                on:change={() => selectedCollection = undefined}
              />
              <span class="collection-name">All Collections</span>
            </label>
          </div>
        </div>
        
        <div class="filter-section">
          <h3>Price Range</h3>
          <div class="price-range">
            <input 
              type="number" 
              min="0" 
              max={priceRange[1]} 
              step="0.1" 
              value={priceRange[0]} 
              on:input={(e) => updatePriceRange(e, 0)}
            />
            <span>to</span>
            <input 
              type="number" 
              min={priceRange[0]} 
              step="0.1" 
              value={priceRange[1]} 
              on:input={(e) => updatePriceRange(e, 1)}
            />
          </div>
        </div>
        
        <div class="filter-section">
          <h3>Sort By</h3>
          <select bind:value={sortBy} class="sort-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      <div class="nft-showcase">
        <div class="showcase-header">
          <div class="timeframe-filter">
            <button class:active={timeframe === '1h'} on:click={() => timeframe = '1h'}>1h</button>
            <button class:active={timeframe === '6h'} on:click={() => timeframe = '6h'}>6h</button>
            <button class:active={timeframe === '24h'} on:click={() => timeframe = '24h'}>24h</button>
            <button class:active={timeframe === '7d'} on:click={() => timeframe = '7d'}>7d</button>
            <button class:active={timeframe === 'all'} on:click={() => timeframe = 'all'}>All</button>
          </div>
          <div class="view-options">
            <button class="view-all-btn">View all</button>
          </div>
        </div>
        
        {#if isLoading}
          <div class="loading">
            <p>Loading NFTs...</p>
            <div class="spinner"></div>
          </div>
        {:else if error}
          <div class="error">
            <p>Error loading NFTs: {error}</p>
            <button on:click={() => fetchNFTs(selectedBlockchain)}>Try Again</button>
          </div>
        {:else if filteredNFTs.length === 0}
          <div class="empty">
            <p>No NFTs found matching your criteria. Try adjusting your filters or check back later.</p>
          </div>
        {:else}
          <div class="nft-grid">
            {#each filteredNFTs as nft (nft.id)}
              <NFTItem 
                id={nft.id}
                name={nft.name}
                description={nft.description}
                price={nft.price}
                imageUrl={nft.imageUrl}
                owner={nft.owner}
                blockchain={nft.blockchain}
                tokenId={nft.tokenId}
                collection={nft.collection}
                attributes={nft.attributes}
                rarity={nft.attributes?.rarity?.toString()}
              />
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <div class="trending-section">
      <div class="section-header">
        <h2>Trending</h2>
        <div class="tabs">
          <button class="tab active">Trending</button>
          <button class="tab">Top</button>
        </div>
        <div class="timeframe-filter small">
          <button class:active={trendingTimeframe === '1d'} on:click={() => trendingTimeframe = '1d'}>1d</button>
          <button class:active={trendingTimeframe === '7d'} on:click={() => trendingTimeframe = '7d'}>7d</button>
          <button class:active={trendingTimeframe === '30d'} on:click={() => trendingTimeframe = '30d'}>30d</button>
          <button class:active={trendingTimeframe === 'all'} on:click={() => trendingTimeframe = 'all'}>All</button>
        </div>
      </div>
      
      <div class="trending-table">
        <div class="table-header">
          <div class="col-rank">#</div>
          <div class="col-collection">Collection</div>
          <div class="col-volume">Volume</div>
        </div>
        
        <div class="table-row">
          <div class="col-rank">1</div>
          <div class="col-collection">
            <img src="https://picsum.photos/seed/trend1/64/64" alt="Collection avatar" />
            <span>NFTropoly Genesis</span>
          </div>
          <div class="col-volume">290 ICP</div>
        </div>
        
        <div class="table-row">
          <div class="col-rank">2</div>
          <div class="col-collection">
            <img src="https://picsum.photos/seed/trend2/64/64" alt="Collection avatar" />
            <span>NFTropoly Avatars</span>
          </div>
          <div class="col-volume">185 ICP</div>
        </div>
        
        <div class="table-row">
          <div class="col-rank">3</div>
          <div class="col-collection">
            <img src="https://picsum.photos/seed/trend3/64/64" alt="Collection avatar" />
            <span>NFTropoly Lands</span>
          </div>
          <div class="col-volume">120 ICP</div>
        </div>
        
        <div class="table-row">
          <div class="col-rank">4</div>
          <div class="col-collection">
            <img src="https://picsum.photos/seed/trend4/64/64" alt="Collection avatar" />
            <span>NFTropoly Items</span>
          </div>
          <div class="col-volume">95 ICP</div>
        </div>
        
        <div class="table-row">
          <div class="col-rank">5</div>
          <div class="col-collection">
            <img src="https://picsum.photos/seed/trend5/64/64" alt="Collection avatar" />
            <span>Special Edition</span>
          </div>
          <div class="col-volume">75 ICP</div>
        </div>
      </div>
    </div>
    
    <div class="coming-soon">
      <h2>Coming Soon</h2>
      <div class="features">
        <div class="feature">
          <h3>🔄 Auctions</h3>
          <p>Participate in timed auctions for rare NFTs</p>
        </div>
        <div class="feature">
          <h3>📉 Dutch Auctions</h3>
          <p>Watch prices decline until someone makes a purchase</p>
        </div>
        <div class="feature">
          <h3>⚛️ Atomic Swaps</h3>
          <p>Trade NFTs directly with other collectors</p>
        </div>
        <div class="feature">
          <h3>💰 Multi-Token Payments</h3>
          <p>Pay using your preferred cryptocurrency</p>
        </div>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  main {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
  
  .hero {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    margin-bottom: 2rem;
    padding: 3rem 2rem;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
  }
  
  .light .hero {
    background: linear-gradient(45deg, #ff2a6d, #d300c5, #652ec7, #33135c);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    border: none;
  }
  
  .dark .hero {
    background: linear-gradient(145deg, #111111, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    text-shadow: var(--shadow-md);
    letter-spacing: -1px;
  }
  
  .highlight {
    background: linear-gradient(90deg, #00f5a0, #00d9f5);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }
  
  .tagline {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
    color: var(--text-secondary);
  }
  
  .hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .cta-button {
    background: transparent;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    z-index: 1;
    box-shadow: var(--shadow-md);
  }
  
  .cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    transition: all 0.3s ease;
  }
  
  .cta-button.create::before {
    background: linear-gradient(90deg, #00f5a0, #00d9f5);
  }
  
  .cta-button.explore::before {
    background: linear-gradient(90deg, #f700ff, #7700ff);
  }
  
  .cta-button:hover::before {
    filter: brightness(1.2);
  }
  
  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  .content {
    margin-top: 2rem;
  }
  
  .categories-container {
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .view-all {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: 500;
  }
  
  .categories-scroll {
    display: flex;
    overflow-x: auto;
    gap: 1rem;
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--color-accent) transparent;
  }
  
  .categories-scroll::-webkit-scrollbar {
    height: 6px;
  }
  
  .categories-scroll::-webkit-scrollbar-thumb {
    background-color: var(--color-accent);
    border-radius: 6px;
  }
  
  .category-item {
    flex: 0 0 auto;
    width: 120px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s;
  }
  
  .category-item:hover {
    transform: translateY(-5px);
  }
  
  .category-image {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    margin-bottom: 0.5rem;
  }
  
  .category-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .category-item:hover .category-image img {
    transform: scale(1.1);
  }
  
  .category-name {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .featured-collections {
    margin-bottom: 2rem;
  }
  
  .collections-scroll {
    display: flex;
    overflow-x: auto;
    gap: 1rem;
    padding: 0.5rem 0;
    scrollbar-width: thin;
    scrollbar-color: var(--color-accent) transparent;
  }
  
  .collections-scroll::-webkit-scrollbar {
    height: 6px;
  }
  
  .collections-scroll::-webkit-scrollbar-thumb {
    background-color: var(--color-accent);
    border-radius: 6px;
  }
  
  .collection-card-mini {
    flex: 0 0 auto;
    width: 200px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid var(--border-color);
  }
  
  .collection-card-mini:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  
  .collection-image {
    width: 100%;
    height: 150px;
    overflow: hidden;
  }
  
  .collection-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .collection-card-mini:hover .collection-image img {
    transform: scale(1.1);
  }
  
  .collection-info-mini {
    padding: 1rem;
  }
  
  .collection-info-mini h3 {
    font-size: 1rem;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }
  
  .collection-info-mini p {
    font-size: 0.8rem;
    margin: 0;
    color: var(--text-tertiary);
  }
  
  .search-bar-container {
    margin-bottom: 1.5rem;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    background-color: var(--bg-secondary);
    border-radius: 30px;
    padding: 0.5rem 1rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }
  
  .search-icon {
    margin-right: 0.5rem;
    font-style: normal;
  }
  
  .search-bar input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: var(--text-primary);
    outline: none;
  }
  
  .search-bar input::placeholder {
    color: var(--text-tertiary);
  }
  
  .category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .category-tag {
    padding: 0.5rem 1rem;
    border-radius: 30px;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .category-tag:hover {
    box-shadow: var(--shadow-md);
  }
  
  .category-tag.active {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
    border-color: transparent;
  }
  
  .dark .category-tag.active {
    background: linear-gradient(145deg, #202020, #303030);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  .marketplace-content {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
  }
  
  .filters {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    height: fit-content;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .filters h2 {
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }
  
  .filter-section {
    margin-bottom: 1.5rem;
  }
  
  .filter-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }
  
  .collection-filters {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .collection-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
  }
  
  .collection-option input {
    accent-color: var(--color-accent);
  }
  
  .price-range {
    margin-bottom: 1rem;
  }
  
  .price-inputs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .price-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .price-input label {
    font-size: 0.8rem;
    color: var(--text-tertiary);
  }
  
  .price-input input {
    padding: 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 0.9rem;
  }
  
  .sort-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sort-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
  }
  
  .sort-option input {
    accent-color: var(--color-accent);
  }
  
  .nft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .empty-state, .loading-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: var(--text-tertiary);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-lg);
  }
  
  .trending-section {
    margin: 3rem 0;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .tabs {
    display: flex;
    gap: 0.5rem;
  }
  
  .tab {
    padding: 0.5rem 1rem;
    border-radius: var(--radius-lg);
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
  }
  
  .tab.active {
    background-color: var(--color-accent);
    color: white;
  }
  
  .timeframe-filter {
    display: flex;
    gap: 2px;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    padding: 2px;
  }
  
  .timeframe-filter.small {
    font-size: 0.8rem;
  }
  
  .timeframe-filter button {
    background: none;
    border: none;
    padding: 0.35rem 0.75rem;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  
  .timeframe-filter button.active {
    background-color: var(--color-accent);
    color: white;
  }
  
  .trending-table {
    margin-top: 1.5rem;
  }
  
  .table-header, .table-row {
    display: grid;
    grid-template-columns: 50px 1fr 100px;
    padding: 0.75rem 1rem;
    align-items: center;
  }
  
  .table-header {
    color: var(--text-tertiary);
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .table-row {
    border-top: 1px solid var(--border-color);
    transition: background-color 0.2s;
  }
  
  .table-row:hover {
    background-color: var(--bg-tertiary);
  }
  
  .col-rank {
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .col-collection {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .col-collection img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
  }
  
  .col-volume {
    font-weight: 600;
    color: var(--text-secondary);
    text-align: right;
  }
  
  .coming-soon {
    margin-top: 3rem;
    text-align: center;
    padding: 2rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .coming-soon h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    color: var(--text-primary);
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .feature {
    background-color: var(--bg-tertiary);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    text-align: left;
    border: 1px solid var(--border-color);
  }
  
  .feature h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-size: 1.1rem;
  }
  
  .feature p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .marketplace-content {
      grid-template-columns: 1fr;
    }
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .tabs, .timeframe-filter {
      align-self: center;
    }
    
    .trending-table {
      overflow-x: auto;
    }
    
    .table-row, .table-header {
      min-width: 400px;
    }
  }
</style>
