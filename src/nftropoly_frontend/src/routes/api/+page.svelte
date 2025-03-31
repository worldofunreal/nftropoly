<script lang="ts">
  import { theme } from "$lib/stores/theme.store";
</script>

<main>
  <h1>NFTropoly API Documentation</h1>
  
  <div class="api-doc">
    <section class="intro">
      <h2>Introduction</h2>
      <p>
        NFTropoly provides comprehensive APIs to integrate our multichain NFT marketplace
        into your applications. This documentation covers available endpoints and implementation details.
      </p>
    </section>

    <section>
      <h2>Embedding NFTropoly</h2>
      <p>
        You can embed the NFTropoly marketplace in your application using our JavaScript library.
        Simply add our script to your page and initialize it with your configuration:
      </p>
      
      <div class="code-snippet">
        <p class="code-title">HTML:</p>
        <pre><code>&lt;script src="https://nftropoly.ic0.app/embed.js"&gt;&lt;/script&gt;
&lt;div id="nftropoly-container"&gt;&lt;/div&gt;</code></pre>

        <p class="code-title">JavaScript:</p>
        <pre><code>// Initialize NFTropoly
NFTropoly.init("nftropoly-container", {{'{'}}
  chains: ["IC", "ETH"],
  theme: "light"
{{'}'}})</code></pre>
      </div>
      
      <h3>Configuration Options</h3>
      <table class="config-options">
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
            <td>container</td>
            <td>string</td>
            <td>#nftropoly-container</td>
            <td>CSS selector for the container element</td>
          </tr>
          <tr>
            <td>chains</td>
            <td>array</td>
            <td>["IC"]</td>
            <td>Blockchain networks to display</td>
          </tr>
          <tr>
            <td>theme</td>
            <td>string</td>
            <td>light</td>
            <td>UI theme (light or dark)</td>
          </tr>
          <tr>
            <td>canister</td>
            <td>string</td>
            <td>default canister</td>
            <td>Custom canister ID for IC backend</td>
          </tr>
          <tr>
            <td>commissionRate</td>
            <td>number</td>
            <td>0.03</td>
            <td>Commission rate (3% by default)</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>REST API</h2>
      <p>
        NFTropoly provides a REST API for interacting with the marketplace programmatically.
        Base URL: <code>https://api.nftropoly.ic0.app/v1</code>
      </p>
      
      <h3>Authentication</h3>
      <p>
        API requests require authentication using an API key. Include your API key in the 
        Authorization header:
      </p>
      
      <div class="code-snippet">
        <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
      </div>
      
      <h3>Endpoints</h3>
      
      <div class="endpoint">
        <h4>GET /api/v1/nfts</h4>
        <p>Retrieve a list of NFTs from the marketplace.</p>
        
        <h5>Query Parameters</h5>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>chain</td>
              <td>string</td>
              <td>Filter by blockchain (IC, ETH, SOL)</td>
            </tr>
            <tr>
              <td>limit</td>
              <td>integer</td>
              <td>Number of results to return (max 100)</td>
            </tr>
            <tr>
              <td>offset</td>
              <td>integer</td>
              <td>Pagination offset</td>
            </tr>
          </tbody>
        </table>
        
        <h5>Response Example</h5>
        <div class="code-snippet">
          <pre><code>{{'{'}}
  "status": "success",
  "data": {{'{'}}
    "nfts": [
      {{'{'}}
        "id": "abc123",
        "name": "Cosmic Explorer #42",
        "price": 1.5,
        "currency": "ICP",
        "commission": 0.045
      {{'}'}}
    ],
    "total": 253,
    "limit": 10,
    "offset": 0
  {{'}'}}
{{'}'}}
</code></pre>
        </div>
      </div>
      
      <div class="endpoint">
        <h4>GET /api/v1/nfts/{'{id}'}</h4>
        <p>Retrieve details of a specific NFT.</p>
        
        <h5>Path Parameters</h5>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>id</td>
              <td>string</td>
              <td>Unique identifier of the NFT</td>
            </tr>
          </tbody>
        </table>
        
        <h5>Response Example</h5>
        <div class="code-snippet">
          <pre><code>{{'{'}}
  "status": "success",
  "data": {{'{'}}
    "id": "abc123",
    "name": "Cosmic Explorer #42",
    "description": "A journey through digital space",
    "price": 1.5,
    "commission": 0.045
  {{'}'}}
{{'}'}}
</code></pre>
        </div>
      </div>

      <div class="endpoint">
        <h4>POST /api/v1/nfts/purchase</h4>
        <p>Purchase an NFT. Note: 3% commission will be applied to the purchase price.</p>
        
        <h5>Request Body Example</h5>
        <div class="code-snippet">
          <pre><code>{{'{'}}
  "nftId": "abc123",
  "paymentMethod": "ICP"
{{'}'}}
</code></pre>
        </div>
        
        <h5>Response Example</h5>
        <div class="code-snippet">
          <pre><code>{{'{'}}
  "status": "success",
  "data": {{'{'}}
    "transactionId": "xyz789",
    "nftId": "abc123",
    "price": 1.5,
    "commission": 0.045,
    "totalPaid": 1.545
  {{'}'}}
{{'}'}}
</code></pre>
        </div>
      </div>
    </section>

    <section>
      <h2>Canister Interface</h2>
      <p>
        For direct integration with the Internet Computer, you can interact with our canister
        using Candid. The principal canister ID is <code>ryjl3-tyaaa-aaaaa-aaaba-cai</code>.
      </p>
      
      <h3>Key Functions</h3>
      <ul class="function-list">
        <li>
          <strong>getNFTs</strong> - Get all NFTs with optional filters
        </li>
        <li>
          <strong>getNFT</strong> - Get a specific NFT by ID
        </li>
        <li>
          <strong>purchaseNFT</strong> - Purchase an NFT (includes 3% commission)
        </li>
        <li>
          <strong>listNFT</strong> - List an NFT for sale
        </li>
      </ul>

      <p class="note">
        Note: All purchases include a 3% commission that helps maintain the NFTropoly platform.
      </p>
    </section>
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }
  
  h1, h2, h3, h4, h5 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  h1 {
    margin-bottom: 1.5rem;
    font-size: 2.25rem;
    background: linear-gradient(90deg, #ff2a6d, #d300c5, #652ec7, #33135c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
  
  h2 {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
    font-size: 1.75rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-top: 2rem;
  }

  h4 {
    font-size: 1.25rem;
    color: var(--color-accent);
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .api-doc {
    margin-top: 2rem;
  }
  
  section {
    margin-bottom: 3rem;
  }
  
  .intro p {
    font-size: 1.125rem;
    line-height: 1.7;
  }
  
  .code-snippet {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    padding: 1.25rem;
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: 1.25rem 0;
    font-size: 0.875rem;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
  }
  
  .code-title {
    color: var(--text-tertiary);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .code-snippet pre {
    margin: 0;
  }
  
  .code-snippet code {
    font-family: monospace;
    white-space: pre;
    color: var(--text-primary);
    background-color: transparent;
    padding: 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.25rem 0;
    font-size: 0.95rem;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }
  
  table th, table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  table th {
    background-color: var(--bg-tertiary);
    font-weight: 600;
    color: var(--text-primary);
  }

  table td {
    color: var(--text-secondary);
  }
  
  .config-options {
    width: 100%;
  }
  
  .endpoint {
    margin-bottom: 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    box-shadow: var(--shadow-md);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .endpoint:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  
  .endpoint h4 {
    margin-top: 0;
    position: relative;
    padding-left: 1rem;
    margin-bottom: 1rem;
  }

  .endpoint h4::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #ff2a6d, #d300c5);
    border-radius: var(--radius-full);
  }
  
  .endpoint h5 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: var(--color-accent);
  }
  
  code {
    font-family: monospace;
    background-color: var(--bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--color-accent);
  }
  
  .function-list {
    list-style-type: none;
    padding: 0;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-color);
  }
  
  .function-list li {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    transition: background-color 0.2s ease;
  }
  
  .function-list li:hover {
    background-color: var(--bg-tertiary);
  }
  
  .function-list li:last-child {
    border-bottom: none;
  }

  .function-list li strong {
    color: var(--color-accent);
    margin-right: 0.5rem;
  }
  
  .note {
    background-color: var(--bg-tertiary);
    border-left: 4px solid var(--color-accent);
    padding: 1.25rem;
    margin: 1.5rem 0;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
  }
  
  @media (max-width: 768px) {
    main {
      padding: 1.5rem 1rem;
    }
    
    h1 {
      font-size: 1.75rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    h3 {
      font-size: 1.25rem;
    }
    
    .endpoint {
      padding: 1.25rem;
    }
    
    table {
      font-size: 0.85rem;
    }
    
    table th, table td {
      padding: 0.65rem;
    }
    
    .code-snippet {
      padding: 1rem;
    }
  }
</style> 