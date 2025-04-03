<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme.store';
  
  // Status data
  const networkStatus = { live: true, aggregating: true, networks: true };
  const priceData = { eth: 1875.87, gwei: 0.69 };
  const collectorStatus = { pro: true };
  
  // Currency selection
  let currency = 'USD';
  
  // Format currency amount
  function formatCurrency(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
</script>

<footer class="footer-minimal">
  <div class="footer-left">
    <span class="status-item live {networkStatus.live ? 'active' : ''}">
      <span class="indicator"></span>
      Live
    </span>
    <span class="status-item aggregating {networkStatus.aggregating ? 'active' : ''}">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
      Aggregating
    </span>
    <span class="status-item networks {networkStatus.networks ? 'active' : ''}">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
      Networks
    </span>
    <a href="/terms" class="link">Terms of Service</a>
    <a href="/privacy" class="link">Privacy Policy</a>
  </div>

  <div class="footer-right">
    <span class="footer-item social-link">
      <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"></path></svg>
      </a>
    </span>
    <span class="footer-item social-link">
       <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
       </a>
    </span>
    <span class="footer-item price-item">
      <span class="eth-icon">◆</span>
      ${formatCurrency(priceData.eth)}
    </span>
    <span class="footer-item price-item">
      <span class="gwei-icon">⛽</span>
      {priceData.gwei} GWEI
    </span>
    <span class="footer-item support-link">
      <a href="/help">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        Support
      </a>
    </span>
    <button class="footer-item theme-toggle" on:click={toggleTheme} aria-label="Toggle Theme">
      {#if $theme === 'dark'}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      {/if}
    </button>
    <span class="footer-item collector-status {collectorStatus.pro ? 'pro' : ''}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      Collector{collectorStatus.pro ? ' Pro' : ''}
    </span>
    <button class="footer-item currency-toggle" aria-label="Change Currency">
      {currency}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  </div>
</footer>

<style>
  .footer-minimal {
    height: var(--footer-height, 50px);
    background-color: var(--dark-bg-secondary, #111111);
    border-top: 1px solid var(--border-color);
    position: fixed;
    bottom: 0;
    left: var(--sidebar-width); /* Aligns with sidebar */
    right: 0;
    z-index: 1000; /* High z-index */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 12px;
    color: var(--text-secondary);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Match sidebar */
    contain: layout style paint; /* Performance optimization */
    box-shadow: 0 -1px 3px rgba(0,0,0,0.1);
    transform: translateZ(0); 
    backface-visibility: hidden;
  }

  .app-container.sidebar-expanded .footer-minimal {
    left: 240px; /* Expanded sidebar width */
  }

  .footer-left,
  .footer-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .footer-item,
  .status-item,
  .link {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: default;
    text-decoration: none;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .link:hover,
  .support-link a:hover,
  .social-link a:hover {
    color: var(--text-primary);
  }

  .status-item {
    opacity: 0.6;
  }

  .status-item.active {
    opacity: 1;
    color: var(--text-primary);
  }

  .status-item .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #555; /* Default inactive color */
    transition: background-color 0.3s ease;
  }

  .status-item.live.active .indicator {
    background-color: #10b981; /* Green for live */
  }
  
  .status-item svg {
    width: 12px;
    height: 12px;
  }

  .support-link a,
  .social-link a {
    display: flex;
    align-items: center;
    gap: 6px;
    color: inherit;
    text-decoration: none;
  }

  .social-link svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .theme-toggle,
  .currency-toggle {
    background: none;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--text-secondary);
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .theme-toggle:hover,
  .currency-toggle:hover {
    background-color: var(--color-hover);
    color: var(--text-primary);
  }

  .theme-toggle svg,
  .currency-toggle svg {
    width: 14px;
    height: 14px;
  }

  .collector-status {
    border: 1px solid var(--border-color);
    padding: 4px 10px;
    border-radius: 12px;
    gap: 4px;
  }

  .collector-status.pro {
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .collector-status svg {
    width: 12px;
    height: 12px;
  }

  .price-item {
    font-weight: 500;
    color: var(--text-primary);
    font-family: monospace;
  }
  
  .eth-icon {
    font-size: 16px;
    color: #2081e2;
    margin-right: 2px;
  }
  
  .gwei-icon {
    font-size: 14px;
    margin-right: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 1024px) {
    .footer-minimal {
      padding: 0 12px;
      gap: 8px;
    }
    .footer-left { gap: 12px; }
    .footer-right { gap: 12px; }
    .status-item, .link, .footer-item {
      font-size: 11px;
      gap: 4px;
    }
    .status-item.aggregating,
    .status-item.networks,
    .price-item:first-of-type, /* Hide ETH price on smaller screens */
    .collector-status {
      display: none; /* Hide less critical info */
    }
  }

  @media (max-width: 768px) {
    .footer-minimal {
      left: 0; /* Full width on mobile */
      width: 100%;
    }
    .footer-left .link {
      display: none; /* Hide text links on mobile */
    }
    .support-link span {
      display: none; /* Hide 'Support' text */
    }
  }
</style> 