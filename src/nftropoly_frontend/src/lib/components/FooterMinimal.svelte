<footer class="footer">
  <div class="footer-content">
    <div class="footer-left">
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Floor Price</div>
          <div class="metric-value">16.50 ICP</div>
        </div>
        <div class="metric">
          <div class="metric-label">24h Volume</div>
          <div class="metric-value">428.8K ICP</div>
        </div>
        <div class="metric">
          <div class="metric-label">Unique Owners</div>
          <div class="metric-value">3,784 (35.4%)</div>
        </div>
      </div>
    </div>
    
    <div class="footer-right">
      <div class="links">
        <a href="/terms" class="link">Terms</a>
        <a href="/privacy" class="link">Privacy</a>
        <span class="link social">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
          </a>
        </span>
        <span class="link social">
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
              <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
            </svg>
          </a>
        </span>
        <span class="version">© 2023 NFTropoly v1.0.0</span>
      </div>
    </div>
  </div>
</footer>

<style>
  .footer {
    height: 64px;
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    position: fixed;
    bottom: 0;
    left: 64px; /* Matches the collapsed sidebar width */
    right: 0;
    z-index: 30;
    transition: left 0.25s ease;
  }
  
  .footer-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  
  .metrics {
    display: flex;
    gap: 24px;
  }
  
  .metric {
    display: flex;
    flex-direction: column;
  }
  
  .metric-label {
    font-size: 12px;
    color: var(--text-tertiary);
  }
  
  .metric-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .links {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .link {
    font-size: 13px;
    color: var(--text-tertiary);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .link:hover {
    color: var(--text-primary);
  }
  
  .social {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .social a {
    color: var(--text-tertiary);
    transition: color 0.2s ease;
  }
  
  .social a:hover {
    color: var(--text-primary);
  }
  
  .version {
    font-size: 12px;
    color: var(--text-tertiary);
  }
</style> 