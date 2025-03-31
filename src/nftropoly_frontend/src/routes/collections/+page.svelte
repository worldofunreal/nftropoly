<script>
  import { onMount } from 'svelte';
  import ICRCCollection from '$lib/components/ICRCCollection.svelte';
  import { toastsShow } from '$lib/stores/toasts.store';
  import { theme } from '$lib/stores/theme.store';
  import { Principal } from '@dfinity/principal';
  
  let collections = [];
  let loading = true;
  
  // Form inputs for creating a new collection
  let name = '';
  let symbol = '';
  let royalty = 2.5;  // Default 2.5%
  let supplyCap = '';
  
  onMount(async () => {
    try {
      // In a real app, we would fetch collections from the backend
      // For now, we'll use these hardcoded collections
      collections = [
        {
          id: 'rdmx6-jaaaa-aaaaa-aaadq-cai', // This would be a real canister ID in production
          name: 'NFTropoly Genesis',
          symbol: 'NFTG',
          imageUrl: 'https://picsum.photos/seed/NFTropolyGenesis/400/400',
          floorPrice: 2.5,
          totalSupply: 1000,
          owners: 78
        },
        {
          id: 'renrk-eyaaa-aaaaa-aaada-cai',
          name: 'NFTropoly Avatars',
          symbol: 'NFTA',
          imageUrl: 'https://picsum.photos/seed/NFTropolyAvatars/400/400',
          floorPrice: 1.8,
          totalSupply: 500,
          owners: 123
        },
        {
          id: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
          name: 'NFTropoly Lands',
          symbol: 'NFTL',
          imageUrl: 'https://picsum.photos/seed/NFTropolyLands/400/400',
          floorPrice: 3.5,
          totalSupply: 250,
          owners: 45
        }
      ];
    } catch (error) {
      console.error('Error loading collections:', error);
      toastsShow({
        text: `Error loading collections: ${error.message}`,
        level: 'error'
      });
    } finally {
      loading = false;
    }
  });
  
  async function createCollection() {
    try {
      // Validate inputs
      if (!name || !symbol) {
        throw new Error('Name and symbol are required');
      }
      
      // Convert royalty to basis points (2.5% -> 250)
      const royaltyBasisPoints = Math.round(royalty * 100);
      const capOption = supplyCap ? parseInt(supplyCap) : null;
      
      // In a real app, this would call the backend to deploy a new collection
      toastsShow({
        text: 'Creating new collection... In a real app, this would deploy a new ICRC7 canister.',
        level: 'info'
      });
      
      // Simulate new collection being added
      const newCollection = {
        id: `demo-${Date.now()}`,
        name,
        symbol,
        imageUrl: `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/400/400` // Generate image based on name
      };
      
      collections = [...collections, newCollection];
      
      // Reset form
      name = '';
      symbol = '';
      royalty = 2.5;
      supplyCap = '';
      
    } catch (error) {
      console.error('Error creating collection:', error);
      toastsShow({
        text: `Error creating collection: ${error.message}`,
        level: 'error'
      });
    }
  }
</script>

<svelte:head>
  <title>NFT Collections | NFTropoly</title>
</svelte:head>

<div class="collections-page">
  <div class="page-header">
    <h1>NFT Collections</h1>
    <p>Create and manage your ICRC7 NFT collections on the Internet Computer</p>
  </div>
  
  <div class="collections-grid">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading collections...</p>
      </div>
    {:else if collections.length === 0}
      <div class="empty-state">
        <p>No collections found. Create your first collection below!</p>
      </div>
    {:else}
      {#each collections as collection}
        <div class="collection-card">
          <div class="collection-banner">
            <img src={collection.imageUrl} alt={collection.name} />
          </div>
          <div class="collection-details">
            <h2>{collection.name} <span class="collection-symbol">({collection.symbol})</span></h2>
            <div class="collection-stats">
              <div class="stat">
                <span class="stat-label">Floor</span>
                <span class="stat-value">{collection.floorPrice || 0} ICP</span>
              </div>
              <div class="stat">
                <span class="stat-label">Items</span>
                <span class="stat-value">{collection.totalSupply || 0}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Owners</span>
                <span class="stat-value">{collection.owners || 0}</span>
              </div>
            </div>
            <p class="collection-id">Collection ID: {collection.id}</p>
            <button 
              class="view-btn"
              on:click={() => document.getElementById(`collection-${collection.id}`).scrollIntoView({ behavior: 'smooth' })}
            >
              View Collection
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
  
  <div class="create-collection">
    <h2>Create New Collection</h2>
    <div class="form">
      <div class="form-group">
        <label for="name">Collection Name:</label>
        <input 
          id="name" 
          type="text" 
          bind:value={name} 
          placeholder="e.g. NFTropoly Avatars"
        />
      </div>
      
      <div class="form-group">
        <label for="symbol">Symbol:</label>
        <input 
          id="symbol" 
          type="text" 
          bind:value={symbol} 
          placeholder="e.g. NFTA"
          maxlength="10"
        />
      </div>
      
      <div class="form-group">
        <label for="royalty">Royalty Percentage:</label>
        <input 
          id="royalty" 
          type="number" 
          bind:value={royalty} 
          min="0" 
          max="10" 
          step="0.1"
        />
      </div>
      
      <div class="form-group">
        <label for="supplyCap">Supply Cap (optional):</label>
        <input 
          id="supplyCap" 
          type="number" 
          bind:value={supplyCap} 
          min="1"
          placeholder="Leave empty for unlimited"
        />
      </div>
      
      <button class="create-btn" on:click={createCollection}>Create Collection</button>
    </div>
  </div>
  
  <div class="collections-detail">
    <h2>Collection Details</h2>
    
    {#each collections as collection}
      <div id={`collection-${collection.id}`} class="collection-section">
        <ICRCCollection 
          canisterId={collection.id}
          collectionName={collection.name}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .collections-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    color: var(--text-primary);
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .page-header h1 {
    font-size: 3rem;
    margin-bottom: 0.75rem;
    background: linear-gradient(90deg, #ff2a6d, #d300c5, #652ec7, #33135c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.5px;
    font-weight: 800;
  }
  
  .page-header p {
    color: var(--text-secondary);
    font-size: 1.2rem;
    margin: 0 auto 1rem;
    max-width: 600px;
    line-height: 1.5;
  }
  
  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .collection-card {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid var(--border-color);
    position: relative;
    overflow: hidden;
  }
  
  .collection-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-lg);
    border-color: #d300c5;
  }
  
  .collection-banner {
    width: 100%;
    height: 180px;
    overflow: hidden;
  }
  
  .collection-banner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  .collection-card:hover .collection-banner img {
    transform: scale(1.1);
  }
  
  .collection-details {
    padding: 1.5rem;
    position: relative;
  }
  
  .collection-details h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.75rem;
    color: var(--text-primary);
    position: relative;
    z-index: 1;
  }
  
  .collection-symbol {
    font-size: 1rem;
    color: var(--text-tertiary);
    font-weight: normal;
  }
  
  .collection-stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    position: relative;
    z-index: 1;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin-bottom: 0.25rem;
  }
  
  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .collection-id {
    font-size: 0.9rem;
    color: var(--text-tertiary);
    margin-bottom: 1.75rem;
    word-break: break-all;
    font-family: monospace;
    background-color: var(--bg-tertiary);
    padding: 0.75rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    position: relative;
    z-index: 1;
  }
  
  .view-btn {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 0.85rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    width: 100%;
    box-shadow: 0 4px 15px rgba(211, 0, 197, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  
  .view-btn:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #ff2a6d, #d300c5, #ff2a6d);
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
  }
  
  .view-btn:hover:before {
    opacity: 1;
  }
  
  .view-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(211, 0, 197, 0.5);
  }
  
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }
  
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    color: var(--text-tertiary);
    border: 1px dashed var(--border-color);
  }
  
  .loading {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: var(--text-tertiary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-radius: 50%;
    border-top-color: #d300c5;
    border-left-color: #ff2a6d;
    animation: spin 1s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .create-collection {
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    margin-bottom: 3rem;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-md);
  }
  
  .create-collection h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    color: var(--text-primary);
    position: relative;
    padding-left: 1rem;
  }
  
  .create-collection h2:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35rem;
    width: 4px;
    height: 1.5rem;
    background: linear-gradient(to bottom, #ff2a6d, #d300c5);
    border-radius: 2px;
  }
  
  .form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }
  
  .form-group input {
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.25);
  }
  
  .form-group input::placeholder {
    color: var(--text-tertiary);
  }
  
  .create-btn {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    padding: 1rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    grid-column: 1 / -1;
    margin-top: 1rem;
    box-shadow: var(--shadow-md);
  }
  
  .create-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(211, 0, 197, 0.5);
  }
  
  .collections-detail {
    margin-top: 4rem;
  }
  
  .collections-detail h2 {
    margin-bottom: 2rem;
    font-size: 2rem;
    color: var(--text-primary);
    text-align: center;
    position: relative;
    display: inline-block;
  }
  
  .collections-detail h2:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    border-radius: 2px;
  }
  
  .collection-section {
    margin-bottom: 3rem;
    padding: 2rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  @media (max-width: 768px) {
    .collections-grid {
      grid-template-columns: 1fr;
    }
    
    .page-header h1 {
      font-size: 2.25rem;
    }
    
    .form {
      grid-template-columns: 1fr;
    }
    
    .create-collection {
      padding: 1.5rem;
    }
    
    .collection-section {
      padding: 1rem;
    }
  }
</style> 