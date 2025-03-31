<script lang="ts">
  import { theme } from "$lib/stores/theme.store";
</script>

<svelte:head>
  <title>Integration | NFTropoly</title>
</svelte:head>

<main>
  <div class="page-header">
    <h1>Integrating NFTropoly</h1>
    <p class="tagline">
      NFTropoly is designed to be portable and easily integrated into any application.
      This guide will show you how to embed the NFTropoly marketplace in your own apps.
    </p>
  </div>
  
  <div class="content">
    <section class="integration-section">
      <h2>Installation</h2>
      <p>NFTropoly can be installed via npm (coming soon):</p>
      
      <div class="code-snippet">
        <pre><code>npm install nftropoly</code></pre>
      </div>
      
      <p>For now, you can clone the repository and build it yourself:</p>
      
      <div class="code-snippet">
        <pre><code>git clone https://github.com/your-org/nftropoly.git
cd nftropoly
npm install
npm run build</code></pre>
      </div>
    </section>
    
    <section class="integration-section">
      <h2>Basic Integration</h2>
      <p>Import and use NFTropoly in your application:</p>
      
      <h3>Framework Support</h3>
      <p>NFTropoly is available for multiple frameworks:</p>
      
      <ul>
        <li><strong>React</strong>: Import from 'nftropoly/react'</li>
        <li><strong>Svelte</strong>: Import from 'nftropoly/svelte'</li>
        <li><strong>Vue</strong>: Import from 'nftropoly/vue'</li>
        <li><strong>Angular</strong>: Import from 'nftropoly/angular'</li>
      </ul>
      
      <h3>Configuration Options</h3>
      <p>The marketplace accepts these configuration options:</p>
      <div class="table-container">
        <table class="config-table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>chains</td>
              <td>array</td>
              <td>["IC"]</td>
              <td>Blockchain networks to display</td>
            </tr>
            <tr>
              <td>theme</td>
              <td>string</td>
              <td>"light"</td>
              <td>UI theme (light or dark)</td>
            </tr>
            <tr>
              <td>showHeader</td>
              <td>boolean</td>
              <td>true</td>
              <td>Whether to show the marketplace header</td>
            </tr>
            <tr>
              <td>commissionRate</td>
              <td>number</td>
              <td>0.03</td>
              <td>Commission rate (3% by default)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    
    <section class="integration-section">
      <h2>Integration Methods</h2>
      
      <div class="methods">
        <div class="method-card">
          <h3>Component Integration</h3>
          <p>Import NFTropoly as a component in your application. Available for React, Vue, Svelte, and Angular.</p>
          <ul>
            <li>Simple to implement</li>
            <li>Customizable appearance</li>
            <li>Direct component API access</li>
          </ul>
        </div>
        
        <div class="method-card">
          <h3>iFrame Embedding</h3>
          <p>Embed NFTropoly as an iFrame for simple integration in any web page.</p>
          <ul>
            <li>Works with any web technology</li>
            <li>Isolation from parent app</li>
            <li>Simple to implement</li>
          </ul>
        </div>
        
        <div class="method-card">
          <h3>JavaScript SDK</h3>
          <p>Use our JavaScript SDK for programmatic interaction with NFTropoly.</p>
          <ul>
            <li>Complete API access</li>
            <li>Custom frontend implementation</li>
            <li>Headless usage possible</li>
          </ul>
        </div>
      </div>
    </section>
    
    <section class="integration-section">
      <h2>Revenue Sharing & Commission Model</h2>
      <p>NFTropoly's 3% commission model can be integrated with revenue sharing options for your platform:</p>
      
      <div class="methods">
        <div class="method-card">
          <h3>Standard Model</h3>
          <p>3% commission on all transactions goes to NFTropoly to support maintenance and development.</p>
        </div>
        
        <div class="method-card">
          <h3>Partner Revenue Sharing</h3>
          <p>For platforms that embed NFTropoly, revenue sharing options are available:</p>
          <ul>
            <li>50/50 split of commission fees</li>
            <li>Custom revenue sharing models for high-volume partners</li>
            <li>Backend tracking of transactions originating from your platform</li>
          </ul>
        </div>
      </div>
    </section>
    
    <section class="integration-section">
      <h2>Authentication Flow</h2>
      <p>NFTropoly handles wallet authentication for you:</p>
      
      <div class="auth-flow">
        <div class="flow-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>User Clicks "Connect Wallet"</h3>
            <p>NFTropoly displays authentication options</p>
          </div>
        </div>
        
        <div class="flow-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>User Authenticates</h3>
            <p>User connects with Internet Identity or other wallet providers</p>
          </div>
        </div>
        
        <div class="flow-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>NFTropoly Gets Credentials</h3>
            <p>Auth details are securely managed by NFTropoly</p>
          </div>
        </div>
        
        <div class="flow-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>User Can Interact with NFTs</h3>
            <p>Browse, buy, sell, and trade across chains</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="integration-section">
      <h2>Multi-Payment Support</h2>
      <p>NFTropoly supports multiple payment methods:</p>
      
      <div class="payment-methods">
        <div class="payment-method">
          <h3>Cryptocurrency Tokens</h3>
          <p>Support for tokens from multiple blockchains:</p>
          <ul>
            <li>Internet Computer (ICP)</li>
            <li>Ethereum (ETH)</li>
            <li>Solana (SOL)</li>
            <li>And more</li>
          </ul>
        </div>
        
        <div class="payment-method">
          <h3>Fiat Payments (Coming Soon)</h3>
          <p>Integration with Stripe for fiat currency payments:</p>
          <ul>
            <li>Credit/debit card support</li>
            <li>Bank transfers</li>
            <li>Multiple currency support</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    color: var(--text-primary);
  }
  
  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  h1 {
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
  
  .tagline {
    font-size: 1.25rem;
    color: var(--text-secondary);
    max-width: 800px;
    margin: 0 auto 1.5rem;
    line-height: 1.5;
  }
  
  .content {
    margin-top: 2rem;
  }
  
  .integration-section {
    margin-bottom: 3rem;
    background-color: var(--bg-secondary);
    padding: 2rem;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    position: relative;
    padding-bottom: 0.75rem;
  }
  
  h2::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, #ff2a6d, #d300c5);
    border-radius: var(--radius-sm);
  }
  
  h3 {
    font-size: 1.4rem;
    margin: 1.5rem 0 1rem;
    color: var(--text-primary);
  }
  
  p, li {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  ul {
    margin-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
  
  .code-snippet {
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    margin: 1.5rem 0;
    overflow-x: auto;
    border: 1px solid var(--border-color);
  }
  
  code {
    font-family: 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.9rem;
    color: var(--color-accent);
  }
  
  pre {
    margin: 0;
  }
  
  .table-container {
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  .config-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  .config-table th {
    background-color: var(--bg-tertiary);
    padding: 1rem;
    color: var(--text-primary);
    font-weight: 600;
  }
  
  .config-table td {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
  }
  
  .methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .method-card {
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .method-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
  
  .method-card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  .method-card p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  .method-card ul {
    margin-bottom: 0;
  }
  
  .auth-flow {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .flow-step {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff2a6d, #d300c5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .step-content {
    flex: 1;
  }
  
  .step-content h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  .step-content p {
    margin-bottom: 0;
  }
  
  .payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .payment-method {
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
  }
  
  .payment-method h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2.25rem;
    }
    
    .integration-section {
      padding: 1.5rem;
    }
    
    .flow-step {
      flex-direction: column;
      gap: 1rem;
      position: relative;
      padding-left: 2.5rem;
    }
    
    .step-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 30px;
      height: 30px;
      font-size: 1rem;
    }
  }
</style> 