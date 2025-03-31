<script lang="ts">
  import { onMount } from 'svelte';
  import { toastsShow } from '$lib/stores/toasts.store';
  
  export let canisterId: string;
  export let collectionName: string;
  
  // Define interface for NFT items
  interface NFTAttributes {
    [key: string]: string | number | boolean;
  }
  
  interface NFT {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    owner: string;
    attributes?: NFTAttributes;
    createdAt: number;
  }
  
  // Collection data
  let totalSupply = 0;
  let maxSupply: number | null = null;
  let nfts: NFT[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // Minting form data
  let mintName = '';
  let mintDescription = '';
  let mintImageUrl = '';
  let mintAttributes = '';
  let isMinting = false;
  
  // Pagination
  let page = 1;
  let pageSize = 12;
  let totalPages = 1;
  
  onMount(async () => {
    await loadCollectionData();
  });
  
  async function loadCollectionData() {
    isLoading = true;
    error = null;
    
    try {
      // In a real app, this would call the canister to fetch collection data
      // For now, we'll simulate some NFTs for the demo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      totalSupply = 18;
      maxSupply = 1000;
      
      // Generate some demo NFTs
      nfts = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        name: `${collectionName} #${i + 1}`,
        description: `This is a sample NFT from the ${collectionName} collection.`,
        imageUrl: `https://picsum.photos/seed/${canisterId}-${i}/300/300`,
        owner: '2vxsx-fae',
        attributes: {
          background: ['Red', 'Blue', 'Green', 'Yellow'][Math.floor(Math.random() * 4)],
          rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 5)]
        },
        createdAt: Date.now() - (i * 86400000) // days ago in ms
      }));
      
      totalPages = Math.ceil(totalSupply / pageSize);
      
    } catch (err: unknown) {
      console.error('Error loading collection data:', err);
      error = err instanceof Error ? err.message : 'Failed to load collection data';
      toastsShow({
        text: `Error loading collection data: ${error}`,
        level: 'error'
      });
    } finally {
      isLoading = false;
    }
  }
  
  async function mintNFT() {
    if (!mintName || !mintImageUrl) {
      toastsShow({
        text: 'Name and image URL are required',
        level: 'warn'
      });
      return;
    }
    
    isMinting = true;
    
    try {
      // Parse attributes if provided
      let parsedAttributes: NFTAttributes = {};
      if (mintAttributes.trim()) {
        // Expect format like: "key1:value1,key2:value2"
        mintAttributes.split(',').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            parsedAttributes[key] = value;
          }
        });
      }
      
      // In a real app, this would call the canister to mint an NFT
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // Add the new NFT to our local state
      const newNFT: NFT = {
        id: totalSupply + 1,
        name: mintName,
        description: mintDescription,
        imageUrl: mintImageUrl,
        owner: '2vxsx-fae', // Current user's principal (in a real app)
        attributes: parsedAttributes,
        createdAt: Date.now()
      };
      
      nfts = [newNFT, ...nfts];
      totalSupply++;
      totalPages = Math.ceil(totalSupply / pageSize);
      
      // Reset form
      mintName = '';
      mintDescription = '';
      mintImageUrl = '';
      mintAttributes = '';
      
      toastsShow({
        text: 'NFT successfully minted!',
        level: 'success'
      });
      
    } catch (err: unknown) {
      console.error('Error minting NFT:', err);
      toastsShow({
        text: `Error minting NFT: ${err instanceof Error ? err.message : 'Unknown error'}`,
        level: 'error'
      });
    } finally {
      isMinting = false;
    }
  }
  
  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
  
  function changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= totalPages) {
      page = newPage;
    }
  }
  
  $: displayedNFTs = nfts.slice((page - 1) * pageSize, page * pageSize);
</script>

<div class="collection-container">
  <div class="collection-header">
    <h2>{collectionName}</h2>
    <div class="collection-info">
      <p>Canister ID: <span class="canister-id">{canisterId}</span></p>
      <p>Total NFTs: {totalSupply} {#if maxSupply}/ {maxSupply}{/if}</p>
    </div>
  </div>
  
  <div class="mint-section">
    <h3>Mint New NFT</h3>
    <div class="mint-form">
      <div class="form-group">
        <label for="mint-name">Name:</label>
        <input 
          id="mint-name" 
          type="text" 
          bind:value={mintName} 
          placeholder="NFT Name"
          disabled={isMinting}
        />
      </div>
      
      <div class="form-group">
        <label for="mint-description">Description:</label>
        <textarea 
          id="mint-description" 
          bind:value={mintDescription} 
          placeholder="Describe your NFT"
          rows="2"
          disabled={isMinting}
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="mint-image">Image URL:</label>
        <input 
          id="mint-image" 
          type="text" 
          bind:value={mintImageUrl} 
          placeholder="https://example.com/image.png"
          disabled={isMinting}
        />
      </div>
      
      <div class="form-group">
        <label for="mint-attributes">Attributes (optional):</label>
        <input 
          id="mint-attributes" 
          type="text" 
          bind:value={mintAttributes} 
          placeholder="key1:value1,key2:value2"
          disabled={isMinting}
        />
        <small>Format: key1:value1,key2:value2</small>
      </div>
      
      <button class="mint-button" on:click={mintNFT} disabled={isMinting}>
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  </div>
  
  <div class="nfts-section">
    <h3>Collection NFTs</h3>
    
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading collection data...</p>
      </div>
    {:else if error}
      <div class="error">
        <p>{error}</p>
        <button on:click={loadCollectionData}>Try Again</button>
      </div>
    {:else if nfts.length === 0}
      <div class="empty-state">
        <p>No NFTs in this collection yet. Mint your first one above!</p>
      </div>
    {:else}
      <div class="nft-grid">
        {#each displayedNFTs as nft}
          <div class="nft-card">
            <div class="nft-image">
              <img src={nft.imageUrl} alt={nft.name} />
            </div>
            <div class="nft-details">
              <h4>{nft.name}</h4>
              <p class="nft-description">{nft.description}</p>
              <div class="nft-metadata">
                <span class="token-id">ID: {nft.id}</span>
                <span class="mint-date">Minted: {formatDate(nft.createdAt)}</span>
              </div>
              {#if nft.attributes && Object.keys(nft.attributes).length > 0}
                <div class="attributes">
                  {#each Object.entries(nft.attributes) as [key, value]}
                    <span class="attribute">{key}: {value}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      <div class="pagination">
        <button 
          class="page-button" 
          on:click={() => changePage(1)} 
          disabled={page === 1}
          aria-label="First Page"
        >
          &laquo;
        </button>
        <button 
          class="page-button" 
          on:click={() => changePage(page - 1)} 
          disabled={page === 1}
          aria-label="Previous Page"
        >
          &lsaquo;
        </button>
        
        {#each Array(totalPages) as _, i}
          {#if i + 1 === page || (i + 1 >= page - 1 && i + 1 <= page + 1) || i + 1 === 1 || i + 1 === totalPages}
            <button 
              class="page-button {i + 1 === page ? 'active' : ''}" 
              on:click={() => changePage(i + 1)}
            >
              {i + 1}
            </button>
          {:else if (i + 1 === page - 2 && page > 3) || (i + 1 === page + 2 && page < totalPages - 2)}
            <span class="page-ellipsis">...</span>
          {/if}
        {/each}
        
        <button 
          class="page-button" 
          on:click={() => changePage(page + 1)} 
          disabled={page === totalPages}
          aria-label="Next Page"
        >
          &rsaquo;
        </button>
        <button 
          class="page-button" 
          on:click={() => changePage(totalPages)} 
          disabled={page === totalPages}
          aria-label="Last Page"
        >
          &raquo;
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .collection-container {
    background: linear-gradient(135deg, #16162a, #1a1a2e);
    border-radius: 16px;
    padding: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
    color: white;
  }
  
  .collection-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2.5rem;
    text-align: center;
  }
  
  .collection-header h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #ff2a6d, #d300c5, #652ec7, #33135c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }
  
  .collection-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    font-size: 1.1rem;
    color: #ccccdd;
  }
  
  .canister-id {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .mint-section {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
  }
  
  .mint-section:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at bottom right, rgba(211, 0, 197, 0.1), transparent 70%);
    z-index: 0;
  }
  
  .mint-section h3 {
    font-size: 1.75rem;
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: white;
    position: relative;
    z-index: 1;
    padding-left: 1rem;
  }
  
  .mint-section h3:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35rem;
    width: 4px;
    height: 1.3rem;
    background: linear-gradient(to bottom, #ff2a6d, #d300c5);
    border-radius: 2px;
  }
  
  .mint-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    position: relative;
    z-index: 1;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #ccccdd;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.85rem;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
    resize: none;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: #d300c5;
    box-shadow: 0 0 0 3px rgba(211, 0, 197, 0.15);
  }
  
  input::placeholder, textarea::placeholder {
    color: #666;
  }
  
  small {
    display: block;
    margin-top: 0.4rem;
    color: #8f8fa3;
    font-size: 0.8rem;
  }
  
  .mint-button {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    grid-column: 1 / -1;
    margin-top: 1rem;
    box-shadow: 0 4px 15px rgba(211, 0, 197, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
  }
  
  .mint-button:before {
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
  }
  
  .mint-button:hover:before {
    opacity: 1;
  }
  
  .mint-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(211, 0, 197, 0.5);
  }
  
  .mint-button:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }
  
  .nfts-section {
    margin-top: 2rem;
  }
  
  .nfts-section h3 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    color: white;
    position: relative;
    padding-left: 1rem;
  }
  
  .nfts-section h3:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35rem;
    width: 4px;
    height: 1.3rem;
    background: linear-gradient(to bottom, #ff2a6d, #d300c5);
    border-radius: 2px;
  }
  
  .nft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .nft-card {
    background: linear-gradient(135deg, #16162a, #1a1a2e);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  
  .nft-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    border-color: #d300c5;
  }
  
  .nft-image {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
  }
  
  .nft-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
    filter: brightness(0.95);
  }
  
  .nft-card:hover .nft-image img {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
  
  .nft-details {
    padding: 1.25rem;
  }
  
  .nft-details h4 {
    margin: 0 0 0.75rem;
    font-size: 1.2rem;
    color: white;
    font-weight: 600;
  }
  
  .nft-description {
    color: #ccccdd;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
  
  .nft-metadata {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.8rem;
    color: #8f8fa3;
  }
  
  .token-id {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: monospace;
  }
  
  .attributes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .attribute {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ccccdd;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
  }
  
  .attribute:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    gap: 0.5rem;
  }
  
  .page-button {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .page-button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .page-button.active {
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    border: none;
  }
  
  .page-ellipsis {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8f8fa3;
    font-size: 1.2rem;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #ccc;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border-top-color: #d300c5;
    border-left-color: #ff2a6d;
    animation: spin 1s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error, .empty-state {
    text-align: center;
    padding: 3rem;
    color: #ccc;
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }
  
  .error button {
    margin-top: 1rem;
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .error button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(211, 0, 197, 0.3);
  }
  
  @media (max-width: 768px) {
    .collection-container {
      padding: 1.5rem;
    }
    
    .collection-header h2 {
      font-size: 2rem;
    }
    
    .mint-section {
      padding: 1.5rem;
    }
    
    .mint-form {
      grid-template-columns: 1fr;
    }
    
    .nft-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
</style> 