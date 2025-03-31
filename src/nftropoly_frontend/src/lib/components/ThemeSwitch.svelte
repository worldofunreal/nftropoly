<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme.store';
</script>

<button 
  class="theme-switch" 
  on:click={toggleTheme} 
  aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if $theme === 'dark'}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .theme-switch {
    background: none;
    border: none;
    color: currentColor;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: background-color 0.3s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }

  .theme-switch:hover {
    background-color: var(--color-hover);
    transform: scale(1.1);
  }

  .theme-switch:active {
    transform: scale(0.95);
  }

  .theme-switch::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
    background: radial-gradient(circle, var(--color-accent-light) 0%, transparent 70%);
  }

  .theme-switch:hover::before {
    opacity: 0.2;
  }
</style> 