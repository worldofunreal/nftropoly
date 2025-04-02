<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme.store';
  
  // TODO: Replace with actual data/logic
  const networkStatus = { live: true, aggregating: true, networks: true };
  const priceData = { eth: 1875.87, gwei: 0.69 };
  const collectorStatus = { pro: true };
  let currency = 'USD'; // TODO: Add currency selection logic
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v19.056c0 1.368-1.104 2.472-2.46 2.472h-15c-1.368 0-2.472-1.104-2.472-2.472v-19.056c0-1.368 1.104-2.472 2.472-2.472h15zm-6.576 14.664c-1.176 0-2.136.96-2.136 2.136s.96 2.136 2.136 2.136c1.176 0 2.136-.96 2.136-2.136s-.96-2.136-2.136-2.136zm-4.416 0c-1.176 0-2.136.96-2.136 2.136s.96 2.136 2.136 2.136c1.176 0 2.136-.96 2.136-2.136s-.96-2.136-2.136-2.136zm8.832 0c-1.176 0-2.136.96-2.136 2.136s.96 2.136 2.136 2.136c1.176 0 2.136-.96 2.136-2.136s-.96-2.136-2.136-2.136zm-14.88-6.168c1.992 0 3.648-1.608 3.648-3.588 0-1.98-1.656-3.588-3.648-3.588-1.98 0-3.648 1.608-3.648 3.588 0 1.98 1.668 3.588 3.648 3.588zm17.016 0c1.992 0 3.648-1.608 3.648-3.588 0-1.98-1.656-3.588-3.648-3.588-1.98 0-3.648 1.608-3.648 3.588 0 1.98 1.668 3.588 3.648 3.588z"/></svg>
      </a>
    </span>
    <span class="footer-item social-link">
       <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1668.56 1221.19" fill="currentColor"><path d="M283.94,167.31l386.39,516.64L281.5,1104h87.51l340.13-379.78L954.17,1104h287.49L918.8,492.57L1260.44,167.31h-87.51 L891.08,548.58L571.46,167.31H283.94z M412.63,231.77h136.81l604.13,807.76h-136.81L412.63,231.77z"/></svg>
       </a>
    </span>
    <span class="footer-item price-item">◆ {priceData.eth}</span>
    <span class="footer-item price-item">⛽️ {priceData.gwei} GWEI</span>
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
      Collector {collectorStatus.pro ? 'Pro' : ''}
    </span>
    <button class="footer-item currency-toggle" aria-label="Change Currency">
      {currency}
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
  </div>
</footer>

<style>
  .footer-minimal {
    height: var(--footer-height, 50px); /* Default height */
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    position: fixed;
    bottom: 0;
    left: var(--sidebar-width); /* Aligns with sidebar */
    right: 0;
    z-index: 1000; /* High z-index */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 12px;
    color: var(--text-secondary);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Match sidebar */
    contain: layout style paint; /* Performance optimization */
    box-shadow: 0 -1px 3px rgba(0,0,0,0.03);
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
    background-color: grey; /* Default inactive color */
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
    padding: 4px;
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
     padding: 3px 8px;
     border-radius: 12px;
     gap: 4px;
  }

  .collector-status.pro {
    border-color: var(--color-accent); /* Or a specific pro color */
    color: var(--color-accent);
  }

  .collector-status svg {
    width: 14px;
    height: 14px;
  }

  .price-item {
     font-weight: 500;
     color: var(--text-primary);
     font-family: monospace;
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