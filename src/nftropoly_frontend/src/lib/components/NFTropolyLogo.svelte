<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { spring } from 'svelte/motion';

  // Props
  export let expanded = false; // Whether the logo is in expanded mode (with text)
  export let size = 35; // Size of the logo in pixels
  export let animated = true; // Whether to animate the logo paths
  
  // State 
  let mounted = false;
  let hovered = false;
  let clicked = false;
  let logoSize = spring(size, { stiffness: 0.3, damping: 0.7 });
  let rotation = spring(0, { stiffness: 0.2, damping: 0.8 });
  
  // Get path to the logo SVG
  const logoPath = '/logo.svg';
  
  const dispatch = createEventDispatcher();

  // Handle logo hover events
  function handleMouseEnter() {
    hovered = true;
  }

  function handleMouseLeave() {
    hovered = false;
    clicked = false;
    reset();
  }
  
  // Handle click/tap interactions
  function handleClick() {
    clicked = true;
    // Increment rotation by 360 degrees for a full spin
    rotation.set($rotation + 360);
    // Spring animation for size - grow slightly then return to normal
    logoSize.set(size * 1.1);
    setTimeout(() => logoSize.set(size), 400);
    
    dispatch('logoClick');
    
    // Reset after animation
    setTimeout(() => {
      if (!hovered) {
        clicked = false;
      }
    }, 1200);
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
  
  function reset() {
    logoSize.set(size);
    rotation.set(0);
  }

  onMount(() => {
    mounted = true;
  });
</script>

{#if expanded}
  <div 
    class="logo-full" 
    role="button"
    tabindex="0"
    in:fade={{ duration: 200, delay: 100 }}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    aria-label="NFTropoly Logo"
  >
    <img src={logoPath} alt="NFTropoly Logo" class="logo-svg" width="252" height="207" />
    {#if expanded}
      <span 
        class="logo-text {clicked ? 'text-animate' : ''}" 
        in:fly={{ x: 15, duration: 250, delay: 150, easing: cubicOut }}
      >
        NFTropoly
      </span>
    {/if}
  </div>
{:else}
  <div 
    class="logo-icon"
    role="button"
    tabindex="0"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
    on:keydown={handleKeyDown}
    aria-label="NFTropoly Logo"
  >
    <img 
      src={logoPath} 
      alt="NFTropoly Logo"
      class="logo {clicked ? 'clicked' : ''}" 
      width={$logoSize} 
      height={$logoSize} 
      style="transform: rotate({$rotation}deg)"
    />
  </div>
{/if}

<style>
  .logo-full, .logo-icon {
    position: relative;
    z-index: 101; /* Ensure logo appears above fixed footer */
  }
  
  .logo-full {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .logo-full:hover {
    transform: translateY(-1px);
  }
  
  .logo-full:active {
    transform: translateY(1px);
  }
  
  .logo, .logo-svg {
    display: block;
    transition: transform 0.3s ease;
  }
  
  .logo.clicked {
    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
  }
  
  /* Pulsing animation for logo hover */
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
    }
  }
  
  /* Highlight animation for click/tap */
  @keyframes highlight {
    0% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.5);
    }
    100% {
      filter: brightness(1);
    }
  }
  
  /* Text animation for click */
  @keyframes textwave {
    0% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-6px);
    }
    50% {
      transform: translateY(0);
    }
    75% {
      transform: translateY(9px);
    }
    100% {
      transform: translateY(0);
    }
  }
  
  .logo-text {
    margin-left: 12px;
    font-weight: 600;
    font-size: 18px;
    white-space: nowrap;
    background: linear-gradient(90deg, #303030, #505050);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    transition: transform 0.2s ease;
  }
  
  :global(.light) .logo-text {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  
  .logo-text.text-animate {
    animation: textwave 0.5s ease-in-out;
  }
  
  .logo-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .logo-icon:hover {
    transform: translateY(-1px);
  }
  
  .logo-icon:active {
    transform: translateY(1px);
  }
  
  /* Focus styles for keyboard users */
  .logo-full:focus, .logo-icon:focus {
    outline: 2px solid #fffb00;
    outline-offset: 2px;
    border-radius: 4px;
  }
  
  /* Hide outline when using mouse */
  .logo-full:focus:not(:focus-visible), .logo-icon:focus:not(:focus-visible) {
    outline: none;
  }
</style> 