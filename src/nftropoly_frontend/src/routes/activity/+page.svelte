<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { deviceType } from '$lib/utils/device';

  // Types
  interface ActivityItem {
    id: string;
    event: 'sale' | 'mint' | 'transfer' | 'listing' | 'item_offer' | 'collection_offer' | 'trait_offer';
    item: {
      name: string;
      image: string;
      collection: string;
      verified: boolean;
    };
    price?: {
      amount: string;
      currency: string;
    };
    rarity?: string;
    quantity: number;
    from: {
      address: string;
      shortAddress: string;
    };
    to: {
      address: string;
      shortAddress: string;
    };
    time: {
      relative: string;
      timestamp: number;
    };
  }

  interface FilterItem {
    id: string;
    label: string;
  }

  interface Chain {
    id: string;
    name: string;
    enabled: boolean;
  }

  interface Currency {
    id: string;
    symbol: string;
    name: string;
  }

  // State
  let activities: ActivityItem[] = [];
  let isLoading = true;
  let hasMore = true;
  let page = 1;
  const perPage = 20;
  let isBrowser = false;
  
  // Filter states
  let activeStatusFilters = new Set(['sale']);
  let showFiltersOnMobile = false;
  let minPrice = '';
  let maxPrice = '';
  let selectedCurrency: Currency = { id: 'usd', symbol: 'USD', name: 'US Dollar' };
  let showCurrencyDropdown = false;
  let activeChains = new Set(['icp']);
  
  // Filters configuration
  const statusFilters: FilterItem[] = [
    { id: 'all', label: 'All' },
    { id: 'sale', label: 'Sale' },
    { id: 'mint', label: 'Mint' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'listing', label: 'Listing' },
    { id: 'item_offer', label: 'Item Offer' },
    { id: 'collection_offer', label: 'Collection Offer' },
    { id: 'trait_offer', label: 'Trait Offer' }
  ];

  const chains: Chain[] = [
    { id: 'icp', name: 'Internet Computer', enabled: true },
    { id: 'eth', name: 'Ethereum', enabled: false },
    { id: 'sol', name: 'Solana', enabled: false }
  ];

  const currencies: Currency[] = [
    { id: 'usd', symbol: 'USD', name: 'US Dollar' },
    { id: 'eth', symbol: 'ETH', name: 'Ethereum' },
    { id: 'icp', symbol: 'ICP', name: 'Internet Computer' },
    { id: 'sol', symbol: 'SOL', name: 'Solana' }
  ];

  // Table columns
  const columns = [
    { id: 'event', label: 'EVENT' },
    { id: 'item', label: 'ITEM' },
    { id: 'price', label: 'PRICE' },
    { id: 'rarity', label: 'RARITY' },
    { id: 'quantity', label: 'QTY' },
    { id: 'from', label: 'FROM' },
    { id: 'to', label: 'TO' },
    { id: 'time', label: 'TIME' }
  ];
  
  // Functions
  function toggleStatusFilter(filterId: string): void {
    if (filterId === 'all') {
      if (activeStatusFilters.size === statusFilters.length - 1) {
        // If all filters are already selected, just keep "all"
        activeStatusFilters = new Set(['all']);
      } else {
        // Select all filters
        activeStatusFilters = new Set(statusFilters.map(f => f.id));
      }
    } else {
      if (activeStatusFilters.has(filterId)) {
        // Remove filter if already selected
        activeStatusFilters.delete(filterId);
        // Also remove "all" if it was selected
        activeStatusFilters.delete('all');
      } else {
        // Add filter
        activeStatusFilters.add(filterId);
        // Check if all individual filters are selected
        const allIndividualFiltersSelected = statusFilters
          .filter(f => f.id !== 'all')
          .every(f => activeStatusFilters.has(f.id));
        if (allIndividualFiltersSelected) {
          activeStatusFilters.add('all');
        }
      }
    }
    
    // Reset and reload data
    resetData();
  }

  function toggleChain(chainId: string): void {
    if (activeChains.has(chainId)) {
      activeChains.delete(chainId);
    } else {
      activeChains.add(chainId);
    }
    
    // Reset and reload data
    resetData();
  }

  function toggleCurrencyDropdown(): void {
    showCurrencyDropdown = !showCurrencyDropdown;
  }

  function selectCurrency(currency: Currency): void {
    selectedCurrency = currency;
    showCurrencyDropdown = false;
  }

  function clearFilters(): void {
    activeStatusFilters = new Set(['sale']);
    minPrice = '';
    maxPrice = '';
    activeChains = new Set(['icp']);
    selectedCurrency = currencies[0];
    resetData();
  }

  function toggleMobileFilters(): void {
    showFiltersOnMobile = !showFiltersOnMobile;
  }

  function applyPriceFilter(): void {
    resetData();
  }

  // Reset data when filters change
  function resetData(): void {
    activities = [];
    page = 1;
    hasMore = true;
    isLoading = true;
    loadData();
  }

  // Generate random NFT collections
  function getRandomCollection() {
    const collections = [
      { name: 'Axie', verified: true },
      { name: 'Forgotten Runiverse', verified: true },
      { name: 'Axie Material', verified: true },
      { name: 'Forgotten Runiverse Items', verified: true },
      { name: 'Rocky sonelum', verified: false },
      { name: 'Courtyard.io', verified: true },
      { name: 'Sonova ACS edition', verified: false },
      { name: 'OSL', verified: false },
      { name: 'kikiverse', verified: false },
      { name: 'Astar Brew IV #31', verified: true },
      { name: 'POSSE LUNAR NEW YEAR', verified: false },
      { name: 'Beezie', verified: true },
      { name: 'Soneium Not Phunk', verified: true }
    ];
    return collections[Math.floor(Math.random() * collections.length)];
  }

  // Generate random addresses
  function getRandomAddress() {
    const addresses = [
      { address: '0x9b1ac5', shortAddress: '9b1ac5' },
      { address: '0x99a58e', shortAddress: '99a58e' },
      { address: '0x48e233', shortAddress: '48e233' },
      { address: '0x03e6a2', shortAddress: '03e6a2' },
      { address: '0x0b45a4', shortAddress: '0b45a4' },
      { address: '0x1f7edc', shortAddress: '1f7edc' },
      { address: '0xce4478', shortAddress: 'ce4478' },
      { address: '0x81b1fe', shortAddress: '81b1fe' },
      { address: '0x2bba39', shortAddress: '2bba39' },
      { address: '0xc4a726', shortAddress: 'c4a726' },
      { address: '0xb34f83', shortAddress: 'b34f83' },
      { address: '0xf68784', shortAddress: 'f68784' },
      { address: '0x04f88a', shortAddress: '04f88a' },
      { address: '0x02c17c', shortAddress: '02c17c' },
      { address: '0xfa456', shortAddress: 'fa456' },
      { address: '0xce4478', shortAddress: 'ce4478' },
      { address: '0x9fc84d', shortAddress: '9fc84d' },
      { address: '0x7bab8b', shortAddress: '7bab8b' },
      { address: '0xa21bb', shortAddress: 'a21bb' },
      { address: 'INPACT_NFTs', shortAddress: 'INPACT_NFTs' },
      { address: '0x3d0ede', shortAddress: '3d0ede' },
      { address: 'NessaMoon', shortAddress: 'NessaMoon' },
      { address: 'stefie322', shortAddress: 'stefie322' },
      { address: '0xc5c832', shortAddress: 'c5c832' },
      { address: '0x719776', shortAddress: '719776' },
      { address: '0xe02377', shortAddress: 'e02377' },
      { address: '0xd94a7e', shortAddress: 'd94a7e' },
      { address: '0xe61798', shortAddress: 'e61798' },
      { address: 'freakyjax', shortAddress: 'freakyjax' },
      { address: '0xf21bd0', shortAddress: 'f21bd0' },
      { address: '0xc6e004', shortAddress: 'c6e004' },
      { address: 'spikelov', shortAddress: 'spikelov' },
      { address: '0x5335e8', shortAddress: '5335e8' }
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  // Generate random NFT images
  function getRandomImage() {
    const images = [
      'https://i.seadn.io/gcs/files/68a63f3b14cd3daea9c0d306c5f2d2b9.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/3b0428fc4ee5799d1761b807757134d5.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/f90923210af32c4c72b2016a817fd0f9.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/e8739ab231fe161b94a167ead7b487af.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/0e7c39301decc2aa57e83dcccd9c358c.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/e1b134b5a21d5fbab35203f8bd208143.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/6a57252c-bd95-48c9-9c1b-58cbe884f7f6.png?w=500&auto=format',
      'https://i.seadn.io/gcs/files/d1b92a0504772e750d3ad0cfe9cb3fe8.png?w=500&auto=format'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Generate random NFT names
  function getRandomItemName() {
    const items = [
      'OSL 8097',
      '#15145',
      'kikiverse #7555',
      'Astar Brew IV #31 #1896',
      'POSSE LUNAR NEW YEAR 2023',
      'Rocky soneium',
      '2022 Japanese Incandescent',
      'NotPunk #6243',
      'Axie #2668347',
      'KUKU X Collection Soul',
      '#14561',
      '#15219',
      '#14817',
      '#14706',
      '#14845',
      '#14551',
      'kikiverse #7086',
      'SON PIXEL #896',
    ];
    return items[Math.floor(Math.random() * items.length)];
  }

  // Generate random currencies
  function getRandomCurrency() {
    const currencies = ['WETH', 'WRON', 'ETH', 'RON', 'USDC'];
    return currencies[Math.floor(Math.random() * currencies.length)];
  }

  // Generate random price
  function getRandomPrice() {
    const prices = [
      '0.002', '0.0008', '0.001', '200.00', '0.188', 
      '0.0001', '4.29', '0.0018', '34.20', '0.0002', 
      '0.0017', '< 0.0001', '0.0003', '0.075', '1.25',
      '0.03', '0.18', '0.01', '31.56', '0.11'
    ];
    return prices[Math.floor(Math.random() * prices.length)];
  }

  // Generate random rarity
  function getRandomRarity() {
    const rarities = ['', '', '', '#3,793', '#3', '', '#2', '#5,105', '#5,068', '#3,922', '#2,088'];
    return rarities[Math.floor(Math.random() * rarities.length)];
  }

  // Generate random time relative string
  function getRandomTimeRelative() {
    const times = [
      '2s ago', '4s ago', '6s ago', '8s ago', '12s ago', 
      '21s ago', '44s ago', '48s ago', '1m ago', '2m ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  // Generate random event type
  function getRandomEvent() {
    const events = ['sale', 'mint', 'transfer', 'listing', 'item_offer', 'collection_offer', 'trait_offer'];
    return events[Math.floor(Math.random() * events.length)] as ActivityItem['event'];
  }

  // Generate mock activity data
  function generateMockActivity(count: number): ActivityItem[] {
    return Array(count).fill(0).map((_, index) => {
      const event = getRandomEvent();
      const collection = getRandomCollection();
      
      return {
        id: `activity-${Date.now()}-${index}`,
        event,
        item: {
          name: getRandomItemName(),
          image: getRandomImage(),
          collection: collection.name,
          verified: collection.verified
        },
        price: event !== 'transfer' ? {
          amount: getRandomPrice(),
          currency: getRandomCurrency()
        } : undefined,
        rarity: getRandomRarity(),
        quantity: 1,
        from: getRandomAddress(),
        to: getRandomAddress(),
        time: {
          relative: getRandomTimeRelative(),
          timestamp: Date.now() - Math.floor(Math.random() * 3600000)
        }
      };
    });
  }

  // Load data with delay to simulate API call
  async function loadData(): Promise<void> {
    if (!hasMore || !isBrowser) return;
    
    isLoading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newActivities = generateMockActivity(perPage);
    
    // Filter activities based on selected filters
    const filteredActivities = activeStatusFilters.has('all') 
      ? newActivities 
      : newActivities.filter(a => activeStatusFilters.has(a.event));
    
    activities = [...activities, ...filteredActivities];
    
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

  // Get event icon based on event type
  function getEventIcon(event: ActivityItem['event']): string {
    switch (event) {
      case 'sale':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"></path></svg>`;
      case 'mint':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
      case 'transfer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      case 'listing':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
      case 'item_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`;
      case 'collection_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
      case 'trait_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
      default:
        return '';
    }
  }
</script>

<svelte:head>
  <title>Activity | NFTropoly</title>
</svelte:head>

<div class="activity-layout">
  <!-- Mobile filter toggle -->
  <button class="mobile-filter-toggle" on:click={toggleMobileFilters}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
    </svg>
    Filters
  </button>

  <!-- Left sidebar for filters -->
  <aside class="filters-sidebar" class:mobile-visible={showFiltersOnMobile}>
    <div class="mobile-header">
      <h3>Filters</h3>
      <button class="close-btn" on:click={toggleMobileFilters}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- Status filter -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Status</h3>
      </div>
      <div class="filter-content">
        <div class="status-tags">
          {#each statusFilters as filter}
            <button 
              class="status-tag {activeStatusFilters.has(filter.id) ? 'active' : ''}"
              on:click={() => toggleStatusFilter(filter.id)}
            >
              {filter.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Price filter -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Price</h3>
      </div>
      <div class="filter-content">
        <div class="currency-selector">
          <button class="currency-btn" on:click={toggleCurrencyDropdown}>
            {selectedCurrency.symbol}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {#if showCurrencyDropdown}
            <div class="currency-dropdown" transition:fade={{ duration: 150 }}>
              {#each currencies as currency}
                <button 
                  class="currency-option {selectedCurrency.id === currency.id ? 'active' : ''}"
                  on:click={() => selectCurrency(currency)}
                >
                  <span class="currency-symbol">{currency.symbol}</span>
                  <span class="currency-name">{currency.name}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        
        <div class="price-inputs">
          <input 
            type="number" 
            placeholder="Min" 
            class="price-input" 
            bind:value={minPrice}
            min="0"
          />
          <span class="to-separator">to</span>
          <input 
            type="number" 
            placeholder="Max" 
            class="price-input" 
            bind:value={maxPrice}
            min="0"
          />
        </div>
        
        <button class="apply-btn" on:click={applyPriceFilter}>
          Apply
        </button>
      </div>
    </div>
    
    <!-- Chains filter -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Chains</h3>
      </div>
      <div class="filter-content">
        <div class="chains-list">
          {#each chains as chain}
            <div class="chain-item">
              <label class="chain-checkbox {!chain.enabled ? 'disabled' : ''}">
                <input 
                  type="checkbox" 
                  checked={activeChains.has(chain.id)}
                  on:change={() => chain.enabled && toggleChain(chain.id)}
                  disabled={!chain.enabled}
                />
                <span class="checkbox-custom"></span>
                <span class="chain-name">{chain.name}</span>
              </label>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Collections filter (placeholder for future implementation) -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>Collections</h3>
      </div>
      <div class="filter-content">
        <input 
          type="text" 
          placeholder="Search for collections" 
          class="collections-search" 
        />
        <div class="collections-placeholder">
          Apply filters to see collections
        </div>
      </div>
    </div>
  </aside>

  <!-- Main content area -->
  <main class="activity-content" on:scroll={handleScroll}>
    <div class="activity-header">
      <div class="header-left">
        <h1>NFT Activity</h1>
        <p>See the latest sales, listings, and transfers across NFT collections</p>
      </div>
      
      <div class="active-filters-display">
        {#if [...activeStatusFilters].some(id => id !== 'all')}
          <div class="back-button" on:click={clearFilters}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </div>
          
          {#each [...activeStatusFilters] as filterId}
            {#if filterId !== 'all'}
              <div class="filter-badge">
                {statusFilters.find(f => f.id === filterId)?.label}
                <button class="remove-filter" on:click={() => toggleStatusFilter(filterId)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            {/if}
          {/each}
          
          <button class="clear-button" on:click={clearFilters}>
            Clear
          </button>
        {/if}
      </div>
    </div>
    
    <div class="activity-table-container">
      <table class="activity-table">
        <thead>
          <tr>
            {#each columns as column}
              <th>
                <div class="th-content">
                  <span>{column.label}</span>
                </div>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each activities as activity, i}
            <tr 
              in:fade={{ delay: i * 50, duration: 200 }}
            >
              <td class="event-cell">
                <div class="event-icon">
                  {@html getEventIcon(activity.event)}
                </div>
                <span class="event-label">{statusFilters.find(f => f.id === activity.event)?.label}</span>
              </td>
              <td class="item-cell">
                <div class="item-image">
                  <img src={activity.item.image} alt={activity.item.name} loading="lazy" />
                </div>
                <div class="item-details">
                  <div class="item-name">{activity.item.name}</div>
                  <div class="collection-name">
                    {activity.item.collection}
                    {#if activity.item.verified}
                      <span class="verified-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </span>
                    {/if}
                  </div>
                </div>
              </td>
              <td class="price-cell">
                {#if activity.price}
                  <div class="price-value">{activity.price.amount} {activity.price.currency}</div>
                {:else}
                  <div class="price-value">—</div>
                {/if}
              </td>
              <td class="rarity-cell">
                <div class="rarity-value">
                  {activity.rarity || '—'}
                </div>
              </td>
              <td class="quantity-cell">
                <div class="quantity-value">
                  {activity.quantity}
                </div>
              </td>
              <td class="address-cell">
                <div class="address-value">
                  {activity.from.shortAddress}
                </div>
              </td>
              <td class="address-cell">
                <div class="address-value">
                  {activity.to.shortAddress}
                </div>
              </td>
              <td class="time-cell">
                <div class="time-value">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {activity.time.relative}
                </div>
              </td>
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
    
    {#if !hasMore && activities.length > 0}
      <div class="end-message">
        You've reached the end of the activity history
      </div>
    {/if}
  </main>
</div>

<style>
  /* Layout Styles */
  .activity-layout {
    width: 100%;
    display: flex;
    height: calc(100vh - 60px);
    position: relative;
  }
  
  /* Filters Sidebar */
  .filters-sidebar {
    width: 280px;
    height: 100%;
    overflow-y: auto;
    background-color: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 20;
  }
  
  .mobile-header {
    display: none;
  }
  
  .filter-section {
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;
  }
  
  .filter-section:last-child {
    border-bottom: none;
  }
  
  .filter-header {
    margin-bottom: 12px;
  }
  
  .filter-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .filter-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  /* Status filter */
  .status-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .status-tag {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .status-tag:hover {
    border-color: var(--color-accent);
  }
  
  .status-tag.active {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
  
  /* Price filter */
  .currency-selector {
    position: relative;
    width: 100%;
  }
  
  .currency-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .currency-btn:hover {
    border-color: var(--text-secondary);
  }
  
  .currency-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .currency-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    z-index: 30;
    box-shadow: var(--shadow-md);
  }
  
  .currency-option {
    width: 100%;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: none;
    background: none;
    text-align: left;
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .currency-option:hover {
    background-color: var(--color-hover);
  }
  
  .currency-option.active {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
  }
  
  .currency-symbol {
    font-weight: 600;
  }
  
  .currency-name {
    font-size: 13px;
    color: var(--text-secondary);
  }
  
  .price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .price-input {
    flex: 1;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
  }
  
  .price-input:focus {
    border-color: var(--color-accent);
    outline: none;
  }
  
  .to-separator {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .apply-btn {
    width: 100%;
    padding: 10px 0;
    border-radius: 6px;
    background-color: var(--color-accent);
    color: white;
    font-size: 14px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  
  .apply-btn:hover {
    opacity: 0.9;
  }
  
  /* Chains filter */
  .chains-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .chain-item {
    width: 100%;
  }
  
  .chain-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .chain-checkbox.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .chain-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkbox-custom {
    position: relative;
    height: 18px;
    width: 18px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .chain-checkbox input:checked ~ .checkbox-custom {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
  }
  
  .checkbox-custom:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .chain-checkbox input:checked ~ .checkbox-custom:after {
    display: block;
  }
  
  .chain-name {
    font-size: 14px;
    color: var(--text-primary);
  }
  
  /* Collections filter */
  .collections-search {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
  }
  
  .collections-search:focus {
    border-color: var(--color-accent);
    outline: none;
  }
  
  .collections-placeholder {
    text-align: center;
    padding: 20px 0;
    color: var(--text-tertiary);
    font-size: 14px;
  }
  
  /* Activity Content Area */
  .activity-content {
    flex: 1;
    padding: 24px;
    height: 100%;
    overflow-y: auto;
  }
  
  .activity-header {
    margin-bottom: 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  
  .header-left h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .header-left p {
    font-size: 16px;
    color: var(--text-secondary);
  }
  
  .active-filters-display {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: var(--bg-tertiary);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .back-button:hover {
    background-color: var(--color-hover);
  }
  
  .back-button svg {
    width: 18px;
    height: 18px;
    stroke: var(--text-primary);
  }
  
  .filter-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .remove-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }
  
  .remove-filter:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .remove-filter svg {
    width: 12px;
    height: 12px;
  }
  
  .clear-button {
    padding: 6px 12px;
    background: none;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .clear-button:hover {
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }
  
  /* Activity Table */
  .activity-table-container {
    width: 100%;
    overflow-x: auto;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    background-color: var(--bg-secondary);
  }
  
  .activity-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .activity-table th {
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
    white-space: nowrap;
  }
  
  .th-content {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .activity-table td {
    padding: 16px 12px;
    font-size: 14px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
    white-space: nowrap;
  }
  
  .activity-table tbody tr {
    transition: background-color 0.2s ease;
  }
  
  .activity-table tbody tr:hover:not(.loading-row) {
    background-color: var(--table-hover);
  }
  
  .event-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .event-icon {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    background-color: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .event-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .event-label {
    font-weight: 500;
  }
  
  .item-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 250px;
  }
  
  .item-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--bg-tertiary);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    flex-shrink: 0;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
  }
  
  .item-name {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .collection-name {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    flex-shrink: 0;
  }
  
  .verified-badge svg {
    width: 12px;
    height: 12px;
  }
  
  .price-cell {
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }
  
  .price-value, .rarity-value, .quantity-value, .address-value, .time-value {
    font-size: 14px;
  }
  
  .address-value {
    font-family: 'Courier New', monospace;
  }
  
  .time-value {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .time-value svg {
    color: var(--text-secondary);
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
  
  /* Mobile filter toggle */
  .mobile-filter-toggle {
    display: none;
  }
  
  /* Responsive styles */
  @media (max-width: 1024px) {
    .filters-sidebar {
      width: 240px;
    }
    
    .activity-table th, .activity-table td {
      padding: 12px 8px;
      font-size: 13px;
    }
    
    .item-image {
      width: 36px;
      height: 36px;
    }
  }
  
  @media (max-width: 768px) {
    .activity-layout {
      flex-direction: column;
    }
    
    .filters-sidebar {
      position: fixed;
      left: -100%;
      top: 0;
      width: 280px;
      height: 100vh;
      z-index: 100;
      transition: left 0.3s ease;
      box-shadow: var(--shadow-lg);
    }
    
    .filters-sidebar.mobile-visible {
      left: 0;
    }
    
    .mobile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .mobile-header h3 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      color: var(--text-primary);
    }
    
    .close-btn svg {
      width: 20px;
      height: 20px;
    }
    
    .mobile-filter-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 50;
      box-shadow: var(--shadow-md);
    }
    
    .mobile-filter-toggle svg {
      width: 16px;
      height: 16px;
    }
    
    .activity-table th:nth-child(3),
    .activity-table td:nth-child(3),
    .activity-table th:nth-child(4),
    .activity-table td:nth-child(4),
    .activity-table th:nth-child(5),
    .activity-table td:nth-child(5) {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    .activity-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .activity-table th:nth-child(6),
    .activity-table td:nth-child(6),
    .activity-table th:nth-child(7),
    .activity-table td:nth-child(7) {
      display: none;
    }
    
    .item-cell {
      width: 180px;
    }
    
    .status-tags {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }
    
    .status-tag {
      flex-shrink: 0;
    }
  }
</style> 