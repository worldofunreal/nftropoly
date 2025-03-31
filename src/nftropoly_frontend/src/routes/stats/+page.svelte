<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { deviceType } from '$lib/utils/device';

  // Types
  interface CollectionChange {
    value: string;
    isPositive: boolean;
  }

  interface Collection {
    id: string;
    name: string;
    image: string;
    floor_price: string;
    change: CollectionChange;
    top_offer: string;
    volume: string;
    sales: number;
    owners: number;
    supply: number;
    verified: boolean;
    isFavorited: boolean;
  }

  interface TabItem {
    id: string;
    label: string;
  }

  interface TimeframeItem {
    id: string;
    label: string;
  }

  interface ColumnItem {
    id: string;
    label: string;
    sortable: boolean;
  }

  // State
  let selectedTab = 'top';
  let selectedTimeframe = 'all';
  let collections: Collection[] = [];
  let isLoading = true;
  let sortColumn = 'volume';
  let sortDirection: 'asc' | 'desc' = 'desc';
  let page = 1;
  const perPage = 20;
  let hasMore = true;
  let isBrowser = false;

  // Tabs
  const tabs: TabItem[] = [
    { id: 'top', label: 'Top' },
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'New' }
  ];

  // Timeframes
  const timeframes: TimeframeItem[] = [
    { id: 'all', label: 'All' },
    { id: '30d', label: '30d' },
    { id: '7d', label: '7d' },
    { id: '1d', label: '1d' },
    { id: '1h', label: '1h' },
    { id: '15m', label: '15m' },
    { id: '5m', label: '5m' },
    { id: '1m', label: '1m' }
  ];

  // Table columns
  const columns: ColumnItem[] = [
    { id: 'collection', label: 'COLLECTION', sortable: true },
    { id: 'floor_price', label: 'FLOOR PRICE', sortable: true },
    { id: 'change', label: '1M CHANGE', sortable: true },
    { id: 'top_offer', label: 'TOP OFFER', sortable: true },
    { id: 'volume', label: '1M VOL', sortable: true },
    { id: 'sales', label: '1M SALES', sortable: true },
    { id: 'owners', label: 'OWNERS', sortable: true },
    { id: 'supply', label: 'SUPPLY', sortable: true }
  ];

  // Change tab
  function setTab(tab: string): void {
    selectedTab = tab;
    resetData();
  }

  // Change timeframe
  function setTimeframe(timeframe: string): void {
    selectedTimeframe = timeframe;
    resetData();
  }

  // Reset data when filters change
  function resetData(): void {
    collections = [];
    page = 1;
    hasMore = true;
    isLoading = true;
    loadData();
  }

  // Sort table
  function sortTable(column: ColumnItem): void {
    if (!column.sortable) return;
    
    if (sortColumn === column.id) {
      // Toggle direction if clicking the same column
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Default to descending for new column
      sortColumn = column.id;
      sortDirection = 'desc';
    }
    
    resetData();
  }

  // Generate random percentage change (-50% to +100%)
  function getRandomChange(): CollectionChange {
    const change = Math.random() * 150 - 50;
    return {
      value: change.toFixed(1),
      isPositive: change >= 0
    };
  }

  // Generate mock data
  function generateMockCollections(count: number): Collection[] {
    const mockImages = [
      'https://i.seadn.io/gcs/files/68a63f3b14cd3daea9c0d306c5f2d2b9.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/3b0428fc4ee5799d1761b807757134d5.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/f90923210af32c4c72b2016a817fd0f9.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/e8739ab231fe161b94a167ead7b487af.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/0e7c39301decc2aa57e83dcccd9c358c.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/e1b134b5a21d5fbab35203f8bd208143.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/6a57252c-bd95-48c9-9c1b-58cbe884f7f6.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/d1b92a0504772e750d3ad0cfe9cb3fe8.png?w=500&auto=format'
    ];

    const collectionNames = [
      'Courtyard.io', 'Raccoons: Genesis Pass', 'Plaza NFT', 'Axie', 'Brotherh00d',
      'doginme NFT', 'CryptoPunks', 'Ragnarok Landverse', 'Axie Material', 'Sonova ACS',
      'Wild Forest Units', 'Astar Expansion', 'Doodles', 'Moonbirds', 'Azuki',
      'Pudgy Penguins', 'BAYC', 'Mutant Ape', 'Clone X', 'Meebits',
      'NFTropoly Originals', 'IC Punks', 'DFinance Tokens', 'Metaverse Land',
      'InternetPunks', 'CryptoKitties', 'Art Blocks', 'Otherdeed'
    ];

    return Array(count).fill(0).map((_, index) => {
      const actualIndex = (page - 1) * perPage + index;
      const change = getRandomChange();
      const floorPrice = (Math.random() * 200).toFixed(2);
      const volume = (Math.random() * 500).toFixed(2);
      const verified = Math.random() > 0.3;
      
      return {
        id: `coll-${actualIndex}`,
        name: collectionNames[Math.floor(Math.random() * collectionNames.length)],
        image: mockImages[Math.floor(Math.random() * mockImages.length)],
        floor_price: floorPrice,
        change: change,
        top_offer: (parseFloat(floorPrice) * 0.8).toFixed(2),
        volume: volume,
        sales: Math.floor(Math.random() * 20) + 1,
        owners: Math.floor(Math.random() * 50000) + 500,
        supply: Math.floor(Math.random() * 10000) + 1000,
        verified: verified,
        isFavorited: Math.random() > 0.8
      };
    });
  }

  // Load data with delay to simulate API call
  async function loadData(): Promise<void> {
    if (!hasMore || !isBrowser) return;
    
    isLoading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCollections = generateMockCollections(perPage);
    collections = [...collections, ...newCollections];
    
    // Stop after 5 pages for demo purposes
    if (page >= 5) {
      hasMore = false;
    } else {
      page++;
    }
    
    isLoading = false;
  }

  // Handle infinite scrolling
  function handleScroll(e: Event): void {
    if (isLoading || !hasMore) return;
    
    const container = e.target as HTMLElement;
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    if (scrollBottom < 500) {
      loadData();
    }
  }

  // Initialize on mount
  onMount(() => {
    isBrowser = true;
    loadData();
  });

  // Format numbers with commas
  function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
</script>

<svelte:head>
  <title>Stats | NFTropoly</title>
</svelte:head>

<div class="stats-page" on:scroll={handleScroll}>
  <div class="stats-header">
    <h1>NFT Collection Stats</h1>
    <p>Browse NFT collections by volume, floor price and other stats</p>
  </div>
  
  <div class="filter-container">
    <div class="tabs">
      {#each tabs as tab}
        <button 
          class="tab-button {selectedTab === tab.id ? 'active' : ''}" 
          on:click={() => setTab(tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
    
    <div class="timeframes">
      {#each timeframes as timeframe}
        <button 
          class="timeframe-button {selectedTimeframe === timeframe.id ? 'active' : ''}" 
          on:click={() => setTimeframe(timeframe.id)}
        >
          {timeframe.label}
        </button>
      {/each}
    </div>
  </div>
  
  <div class="stats-table-container">
    <table class="stats-table">
      <thead>
        <tr>
          {#each columns as column}
            <th 
              class="{column.sortable ? 'sortable' : ''} {sortColumn === column.id ? 'sorted' : ''}"
              on:click={() => sortTable(column)}
            >
              <div class="th-content">
                <span>{column.label}</span>
                {#if column.sortable}
                  <div class="sort-indicator {sortColumn === column.id ? sortDirection : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12l7-7 7 7"/>
                    </svg>
                  </div>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each collections as collection, i}
          <tr 
            in:fade={{ delay: i * 50, duration: 200 }}
          >
            <td class="collection-cell">
              <div class="star-container">
                <button class="star-button {collection.isFavorited ? 'favorited' : ''}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={collection.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              </div>
              <div class="collection-image">
                <img src={collection.image} alt={collection.name} loading="lazy" />
              </div>
              <div class="collection-name">
                {collection.name}
                {#if collection.verified}
                  <span class="verified-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </span>
                {/if}
              </div>
            </td>
            <td class="price-cell">${collection.floor_price}</td>
            <td class="change-cell">
              <span class={collection.change.isPositive ? 'positive' : 'negative'}>
                {collection.change.isPositive ? '+' : ''}{collection.change.value}%
              </span>
            </td>
            <td class="price-cell">${collection.top_offer}</td>
            <td class="price-cell">${collection.volume}</td>
            <td>{collection.sales}</td>
            <td>{formatNumber(collection.owners)}</td>
            <td>{formatNumber(collection.supply)}</td>
          </tr>
        {/each}
        
        <!-- Loading rows -->
        {#if isLoading}
          {#each Array(5) as _, i}
            <tr class="loading-row">
              {#each columns as _}
                <td>
                  <div class="loading-placeholder"></div>
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  {#if !hasMore && collections.length > 0}
    <div class="end-message">
      You've reached the end of the list
    </div>
  {/if}
</div>

<style>
  .stats-page {
    width: 100%;
    max-width: 100%;
    padding: 24px;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
  
  .stats-header {
    margin-bottom: 32px;
  }
  
  .stats-header h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .stats-header p {
    font-size: 16px;
    color: var(--text-secondary);
  }
  
  .filter-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
  }
  
  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tab-button {
    padding: 12px 16px;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }
  
  .tab-button.active {
    color: var(--text-primary);
  }
  
  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--tab-active-border);
  }
  
  .tab-button:hover:not(.active) {
    color: var(--text-primary);
  }
  
  .timeframes {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .timeframe-button {
    padding: 8px 12px;
    background: none;
    border: 1px solid var(--border-color);
    font-size: 14px;
    border-radius: 6px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .timeframe-button.active {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--color-accent);
  }
  
  .timeframe-button:hover:not(.active) {
    border-color: var(--text-secondary);
    background-color: var(--bg-tertiary);
  }
  
  .stats-table-container {
    width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    background-color: var(--bg-secondary);
  }
  
  .stats-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .stats-table th {
    position: sticky;
    top: 0;
    background-color: var(--bg-secondary);
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border-color);
    z-index: 10;
  }
  
  .stats-table th.sortable {
    cursor: pointer;
  }
  
  .stats-table th.sortable:hover {
    color: var(--text-primary);
  }
  
  .th-content {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .sort-indicator {
    width: 16px;
    height: 16px;
    opacity: 0.5;
    transition: all 0.2s ease;
  }
  
  .sort-indicator.asc {
    opacity: 1;
    transform: rotate(0deg);
  }
  
  .sort-indicator.desc {
    opacity: 1;
    transform: rotate(180deg);
  }
  
  .stats-table td {
    padding: 16px 12px;
    font-size: 14px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
  }
  
  .stats-table tbody tr {
    transition: background-color 0.2s ease;
  }
  
  .stats-table tbody tr:hover:not(.loading-row) {
    background-color: var(--table-hover);
  }
  
  .collection-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .star-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .star-button {
    background: none;
    border: none;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }
  
  .star-button:hover {
    color: var(--favorite-color);
  }
  
  .star-button.favorited {
    color: var(--favorite-color);
  }
  
  .collection-image {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-tertiary);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }
  
  .collection-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .collection-name {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .verified-badge {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--verified-badge);
    color: white;
    align-items: center;
    justify-content: center;
  }
  
  .verified-badge svg {
    width: 12px;
    height: 12px;
  }
  
  .price-cell {
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }
  
  .change-cell {
    font-weight: 500;
  }
  
  .positive {
    color: var(--color-success);
  }
  
  .negative {
    color: var(--color-error);
  }
  
  .loading-row td {
    padding: 12px;
  }
  
  .loading-placeholder {
    height: 20px;
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .end-message {
    text-align: center;
    padding: 24px;
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  /* Responsive styles */
  @media (max-width: 1024px) {
    .stats-table th, .stats-table td {
      padding: 12px 8px;
      font-size: 13px;
    }
    
    .collection-image {
      width: 36px;
      height: 36px;
    }
  }
  
  @media (max-width: 768px) {
    .filter-container {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .tabs, .timeframes {
      width: 100%;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 4px;
    }
    
    .stats-table th:nth-child(5),
    .stats-table td:nth-child(5),
    .stats-table th:nth-child(7),
    .stats-table td:nth-child(7),
    .stats-table th:nth-child(8),
    .stats-table td:nth-child(8) {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    .stats-table th:nth-child(3),
    .stats-table td:nth-child(3),
    .stats-table th:nth-child(4),
    .stats-table td:nth-child(4) {
      display: none;
    }
    
    .collection-name {
      max-width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style> 