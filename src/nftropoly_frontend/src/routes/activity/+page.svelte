<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { deviceType } from '$lib/utils/device';
  import { writable } from 'svelte/store';

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
    { id: 'qty', label: 'QTY' },
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
      { name: 'DreamZuki', verified: true },
      { name: 'Moki Genesis', verified: true },
      { name: 'OLX BASE', verified: false },
      { name: 'Sabong Saga Items', verified: true },
      { name: 'Good Vibes Club', verified: true },
      { name: 'Bumpkin Wearables', verified: true },
      { name: 'Beezie', verified: true }
    ];
    return collections[Math.floor(Math.random() * collections.length)];
  }

  // Generate random addresses
  function getRandomAddress() {
    const addresses = [
      { address: '0x8f30f3', shortAddress: '8f30f3' },
      { address: '0x64a505', shortAddress: '64a505' },
      { address: '0xee09aa', shortAddress: 'ee09aa' },
      { address: '0x2cf700', shortAddress: '2cf700' },
      { address: '0xd7f004', shortAddress: 'd7f004' },
      { address: '0xbca3b7', shortAddress: 'bca3b7' },
      { address: '0x74e632', shortAddress: '74e632' },
      { address: 'OneGravity', shortAddress: 'OneGravity' },
      { address: 'IveGotThoughts', shortAddress: 'IveGotThoughts' },
      { address: 'curious_bird', shortAddress: 'curious_bird' },
      { address: 'NFTButler_TenTenTen', shortAddress: 'NFTButler_TenTenTen' },
      { address: 'eunlegell', shortAddress: 'eunlegell' },
      { address: 'Jay27591', shortAddress: 'Jay27591' },
      { address: 'Hminhh', shortAddress: 'Hminhh' },
      { address: 'See_All_Collections', shortAddress: 'See_All_Collections' },
      { address: 'POLNFT', shortAddress: 'POLNFT' },
      { address: 'Lebnani', shortAddress: 'Lebnani' },
      { address: 'goodvibrations', shortAddress: 'goodvibrations' }
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
      'https://i.seadn.io/gae/6ev2GVLx3BLZQReuY7kFw1QpkpP9BGA6xMwWlnfBqARPLtjjjPWdVvrB87oWi8o82RoMS5yzupnATgKrTnPRIrpbPS-RXMObVS0uRg?w=500&auto=format',
      'https://i.seadn.io/gae/K1SL0TJmTTh7tdmtZnGwT8J_-INhIJwXkIseNFzJqePFzGC7U-TU7wMbRQM0aZrXkUvCJcM3rRGq3WbLR7YR4Hgi_Soz_5-nCo4q?w=500&auto=format',
      'https://i.seadn.io/gae/sYAr036bd0bZzZiKnRWQhO9qTvf9JcLh_xTUwepYlP-kzaxbT0ywUxjdNWjzYQRi6MZzxqDgrW_No74mUFAo2JL7clGmUEE1rIXg?w=500&auto=format',
      'https://i.seadn.io/gae/fz09TMpJy9ZMUid7XArDboTmg3SJAkWAoFEb_7R0XRYKhKpx0LgQABx4MJnHVw2XFm-RFqjkU8x-fZt_Hvr2mPYYAXKDv0dQnH1F?w=500&auto=format',
      'https://i.seadn.io/gae/yvl-6RTYoEUUFYzCEWC7qqx4-aEZJFQ7gekwxsy7D6ODlFwCeuYUQE9_Djo09sPuYNSo9YK-ZVeZQXTZcTQ4lKk0v_OVTbBpAkHvWw?w=500&auto=format'
    ];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Generate random NFT names
  function getRandomItemName() {
    const items = [
      'Axie #3630821',
      'Dreamzuki #766',
      'Moki #7422',
      'Silver Builder\'s Crate',
      'Feathers',
      'BTC',
      'White Sheep Onesie',
      'Opened Ascended Chest Set 2',
      'Mech Memento',
      'Citizen of Vibetown #1841',
      '1999 Fossil Seadra #42',
      '#15145'
    ];
    return items[Math.floor(Math.random() * items.length)];
  }

  // Generate random currencies
  function getRandomCurrency() {
    const currencies = ['ETH', 'RON', 'AVAX', 'USDC', 'USDT', 'WETH', 'METH'];
    return currencies[Math.floor(Math.random() * currencies.length)];
  }

  // Generate random price
  function getRandomPrice() {
    const prices = [
      '0.0315', '0.002', '171.00', '5.4312', '0.182', 
      '0.259', '9.00', '0.0695', '< 0.0001', '0.0006', 
      '2.20'
    ];
    return prices[Math.floor(Math.random() * prices.length)];
  }

  // Generate random rarity
  function getRandomRarity() {
    const rarities = ['', '', '', '#3', '#510', '#5,065', '#4,139', '#8,122', '#20'];
    return rarities[Math.floor(Math.random() * rarities.length)];
  }

  // Generate random time relative string
  function getRandomTimeRelative() {
    const times = [
      '4s ago', '6s ago', '19s ago', '1m ago', '4m ago', 
      '6m ago', '7s ago', '16s ago', '19s ago', '20s ago', 
      '21s ago', '22s ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  // Generate random event type
  function getRandomEvent() {
    // For demo, make most events sales to match OpenSea screenshot
    const random = Math.random();
    if (random < 0.8) {
      return 'sale';
    } else {
      const events = ['mint', 'transfer', 'listing', 'item_offer', 'collection_offer', 'trait_offer'];
      return events[Math.floor(Math.random() * events.length)] as ActivityItem['event'];
    }
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

  // Setup intersection observer for infinite scroll
  let lastRowElement: HTMLElement | null = null;
  let observer: IntersectionObserver | null = null;

  function setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined' || !isBrowser) return;
    
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        const lastEntry = entries[0];
        if (lastEntry.isIntersecting && !isLoading && hasMore) {
          loadData();
        }
      }, { 
        rootMargin: '100px', 
        threshold: 0.1 
      });
    }
    
    if (lastRowElement) {
      observer.observe(lastRowElement);
    }
  }

  // Load data with delay to simulate API call
  async function loadData(): Promise<void> {
    if (!hasMore || !isBrowser || isLoading) return;
    
    isLoading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
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

  // Get event icon based on event type
  function getEventIcon(event: ActivityItem['event']): string {
    switch (event) {
      case 'sale':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case 'mint':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`;
      case 'transfer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      case 'listing':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 2v5"></path><path d="M8 2v5"></path><path d="M3 10h18"></path></svg>`;
      case 'item_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
      case 'collection_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
      case 'trait_offer':
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
      default:
        return '';
    }
  }

  // Lifecycle
  onMount(() => {
    isBrowser = true;
    
    // Initialize first batch of data
    loadData();
    
    return () => {
      // Clean up observer when component is destroyed
      if (observer) {
        observer.disconnect();
      }
    };
  });
  
  // Update observer when activities or last row element change
  $: if (activities.length > 0 && lastRowElement && observer) {
    observer.disconnect();
    observer.observe(lastRowElement);
  }

  // Custom action for binding the last row element
  function bindLastRow(node: HTMLElement, isLastRow: boolean) {
    if (isLastRow) {
      lastRowElement = node;
      if (observer) {
        observer.observe(node);
      }
    }
    
    return {
      update(newIsLastRow: boolean) {
        if (newIsLastRow && !isLastRow) {
          lastRowElement = node;
          if (observer) {
            observer.observe(node);
          }
        }
      },
      destroy() {
        if (isLastRow && observer && lastRowElement === node) {
          observer.unobserve(node);
        }
      }
    };
  }
</script>

<svelte:head>
  <title>Activity | NFTropoly</title>
</svelte:head>

<div class="activity-page">
  <!-- Status Filters -->
  <div class="status-filters">
    <div class="status-filters-container">
      {#each statusFilters as filter}
        <button 
          class="status-filter-btn {activeStatusFilters.has(filter.id) ? 'active' : ''}"
          on:click={() => toggleStatusFilter(filter.id)}
        >
          {filter.label}
          {#if activeStatusFilters.has(filter.id) && filter.id !== 'all'}
            <button class="remove-filter" on:click|stopPropagation={() => toggleStatusFilter(filter.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          {/if}
        </button>
      {/each}
    </div>
    
    <div class="filter-actions">
      <button class="filter-action-btn clear-btn" on:click={clearFilters}>
        Clear
      </button>
    </div>
  </div>

  <div class="activity-header">
    <h1>NFT Activity</h1>
    <p>See the latest sales, listings, and transfers across NFT collections</p>
  </div>
  
  <div class="activity-table-container" on:scroll={setupIntersectionObserver}>
    <table class="activity-table">
      <thead>
        <tr>
          {#each columns as column}
            <th class={`${column.id}-header`}>
              <span>{column.label}</span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each activities as activity, i}
          <tr 
            in:fade={{ delay: 50, duration: 300 }}
            class="activity-row"
            use:bindLastRow={i === activities.length - 3}
          >
            <td class="event-cell">
              <div class="event-icon">
                {@html getEventIcon(activity.event)}
              </div>
              <span class="event-label">{activity.event}</span>
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
                <span class="currency-icon">
                  {#if activity.price.currency === 'ETH' || activity.price.currency === 'WETH'}
                    ◆
                  {:else if activity.price.currency === 'USDC' || activity.price.currency === 'USDT'}
                    💲
                  {:else if activity.price.currency === 'AVAX'}
                    <img src="https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png" alt="AVAX" width="16" height="16" />
                  {:else if activity.price.currency === 'RON'}
                    <img src="https://assets.coingecko.com/coins/images/20009/small/ronin.jpg" alt="RON" width="16" height="16" />
                  {:else}
                    {activity.price.currency}
                  {/if}
                </span>
                <span class="price-value">{activity.price.amount}</span>
                <span class="currency-label">{activity.price.currency}</span>
              {:else}
                <span class="price-value">—</span>
              {/if}
            </td>
            <td class="rarity-cell">
              <div class="rarity-value">
                {activity.rarity || '—'}
              </div>
            </td>
            <td class="qty-cell">
              <div class="qty-value">
                {activity.quantity}
              </div>
            </td>
            <td class="user-cell">
              <div class="user-address">
                {activity.from.shortAddress}
              </div>
            </td>
            <td class="user-cell">
              <div class="user-address">
                {activity.to.shortAddress}
              </div>
            </td>
            <td class="time-cell">
              <span class="time-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <span>{activity.time.relative}</span>
              <span class="arrow-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </td>
          </tr>
        {/each}
        
        <!-- Loading rows -->
        {#if isLoading}
          {#each Array(3) as _, i}
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
  
  {#if !hasMore && activities.length > 0 && !isLoading}
    <div class="end-message">
      You've reached the end of the activity history
    </div>
  {/if}
</div>

<style>
  /* Main Layout */
  .activity-page {
    padding: 0;
    width: 100%;
    max-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* Status Filters */
  .status-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }
  
  .status-filters-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .status-filter-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 8px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .status-filter-btn.active {
    background-color: var(--color-accent-light);
    color: var(--color-accent);
    border-color: var(--color-accent);
  }
  
  .status-filter-btn .remove-filter {
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: inherit;
  }
  
  .status-filter-btn .remove-filter svg {
    width: 14px;
    height: 14px;
  }
  
  .filter-actions {
    display: flex;
    gap: 8px;
  }
  
  .filter-action-btn {
    padding: 6px 12px;
    border-radius: 8px;
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .filter-action-btn:hover {
    background-color: var(--bg-tertiary);
  }
  
  /* Activity Header */
  .activity-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .activity-header h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  
  .activity-header p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
  
  /* Activity Table */
  .activity-table-container {
    flex: 1;
    overflow: auto;
    position: relative;
  }
  
  .activity-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* Important for column control */
  }
  
  .activity-table th,
  .activity-table td {
    padding: 16px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }
  
  .activity-table th {
    position: sticky;
    top: 0;
    background-color: var(--bg-secondary);
    z-index: 10;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--text-tertiary);
    padding-top: 16px;
    padding-bottom: 16px;
  }
  
  /* Column widths */
  .event-header, .event-cell { width: 80px; }
  .item-header, .item-cell { width: 240px; }
  .price-header, .price-cell { width: 120px; }
  .rarity-header, .rarity-cell { width: 80px; }
  .qty-header, .qty-cell { width: 60px; }
  .from-header, .user-cell { width: 140px; }
  .to-header, .user-cell { width: 140px; }
  .time-header, .time-cell { width: 100px; }
  
  /* Row styles */
  .activity-row:hover {
    background-color: var(--bg-tertiary);
  }
  
  /* Event Cell */
  .event-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: capitalize;
    white-space: nowrap;
  }
  
  .event-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  .event-icon svg {
    width: 16px;
    height: 16px;
  }
  
  /* Item Cell */
  .item-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .item-image {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--bg-tertiary);
    flex-shrink: 0;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  .item-details {
    min-width: 0; /* Enable text truncation */
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .item-name {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .collection-name {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #4585f4;
    flex-shrink: 0;
  }
  
  .verified-badge svg {
    width: 10px;
    height: 10px;
    color: white;
  }
  
  /* Price Cell */
  .price-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  
  .currency-icon {
    font-size: 16px;
    line-height: 1;
    margin-right: 2px;
    display: flex;
    align-items: center;
  }

  .currency-label {
    font-size: 0.85em;
    color: var(--text-tertiary);
    margin-left: 2px;
  }
  
  /* User Cell */
  .user-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-address {
    display: inline-block;
    padding: 4px 8px;
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Time Cell */
  .time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-tertiary);
  }
  
  .time-icon {
    display: flex;
    align-items: center;
    width: 16px;
    height: 16px;
  }
  
  .time-icon svg {
    width: 14px;
    height: 14px;
  }

  .arrow-icon {
    display: flex;
    align-items: center;
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .activity-row:hover .arrow-icon {
    opacity: 1;
  }
  
  /* Loading animations */
  .loading-row td {
    padding: 24px 12px;
  }
  
  .loading-placeholder {
    height: 16px;
    background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  .end-message {
    text-align: center;
    padding: 24px;
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .status-filters,
    .activity-header {
      padding: 16px;
    }
    
    .rarity-header, .rarity-cell,
    .qty-header, .qty-cell {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    .from-header, .from-cell,
    .to-header, .to-cell {
      display: none;
    }
    
    .item-image {
      width: 40px;
      height: 40px;
    }
  }
  
  @media (max-width: 480px) {
    .status-filters {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .status-filters-container {
      width: 100%;
      overflow-x: auto;
      padding-bottom: 8px;
      flex-wrap: nowrap;
    }
    
    .status-filter-btn {
      flex-shrink: 0;
    }
  }
</style> 