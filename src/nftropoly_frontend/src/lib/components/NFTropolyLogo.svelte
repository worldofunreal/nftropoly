<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fly, fade, draw, scale, crossfade } from 'svelte/transition';
  import { cubicOut, elasticOut, bounceOut } from 'svelte/easing';
  import { theme } from '$lib/stores/theme.store';
  import { tweened } from 'svelte/motion';
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
    <svg 
      class="logo {clicked ? 'clicked' : ''}" 
      width={$logoSize} 
      height={$logoSize} 
      viewBox="0 0 256 256" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate({$rotation}deg)"
    >
      <g class="logo-paths">
        {#if mounted && animated}
          <!-- N part of the logo -->
          <path 
            class="logo-path-n {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}"
            d="M151.231 217.294L121.628 232.517L123 84.0944L253.087 26.2417L253.066 67.8573L226.083 78.0804L226.104 181.123L202.731 189.03L202.71 86.5692L152.582 109.243V134.387L185.713 117.5V149.146L152.561 167.578L151.231 217.294Z"
            in:draw={{ duration: 1200, delay: 200, easing: cubicOut }}
          />
          <!-- FT part of the logo -->
          <path 
            class="logo-path-ft {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}"
            d="M2.91293 184.684V35.246L41.3246 49.1897L88.0245 174.915L85.6824 23L117.205 37.5832L115.824 232.595L88.0245 217.266L39.3337 124.959C36.8744 124.959 37.1086 196.994 37.1086 196.994L2.91293 184.684Z"
            in:draw={{ duration: 1200, delay: 800, easing: cubicOut }}
          />
        {:else}
          <path 
            class="logo-path-n {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}" 
            d="M151.231 217.294L121.628 232.517L123 84.0944L253.087 26.2417L253.066 67.8573L226.083 78.0804L226.104 181.123L202.731 189.03L202.71 86.5692L152.582 109.243V134.387L185.713 117.5V149.146L152.561 167.578L151.231 217.294Z" 
          />
          <path 
            class="logo-path-ft {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}" 
            d="M2.91293 184.684V35.246L41.3246 49.1897L88.0245 174.915L85.6824 23L117.205 37.5832L115.824 232.595L88.0245 217.266L39.3337 124.959C36.8744 124.959 37.1086 196.994 37.1086 196.994L2.91293 184.684Z" 
          />
        {/if}
      </g>
    </svg>
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
    <svg 
      class="logo {clicked ? 'clicked' : ''}" 
      width={$logoSize} 
      height={$logoSize} 
      viewBox="0 0 256 256" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate({$rotation}deg)"
    >
      <g class="logo-paths">
        <!-- N part of the logo -->
        <path 
          class="logo-path-n {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}"
          d="M151.231 217.294L121.628 232.517L123 84.0944L253.087 26.2417L253.066 67.8573L226.083 78.0804L226.104 181.123L202.731 189.03L202.71 86.5692L152.582 109.243V134.387L185.713 117.5V149.146L152.561 167.578L151.231 217.294Z"
        />
        <!-- FT part of the logo -->
        <path 
          class="logo-path-ft {hovered ? 'animate-pulse' : ''} {clicked ? 'animate-highlight' : ''}"
          d="M2.91293 184.684V35.246L41.3246 49.1897L88.0245 174.915L85.6824 23L117.205 37.5832L115.824 232.595L88.0245 217.266L39.3337 124.959C36.8744 124.959 37.1086 196.994 37.1086 196.994L2.91293 184.684Z"
        />
      </g>
    </svg>
  </div>
{/if}

<style>
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
  
  .logo {
    display: block;
    transition: transform 0.3s ease;
  }
  
  .logo.clicked {
    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
  }
  
  /* Logo path styling */
  .logo-path-n, .logo-path-ft {
    transition: fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease;
    stroke-width: 1;
  }
  
  :global(.light-sidebar) .logo-path-n {
    fill: #14ff0c;
    stroke: rgb(255, 136, 0);
  }
  
  :global(.light-sidebar) .logo-path-ft {
    fill: #8b5cf6;
    stroke: #8b5cf6;
  }
  
  :global(.dark-sidebar) .logo-path-n {
    fill: #818cf8;
    stroke: #818cf8;
  }
  
  :global(.dark-sidebar) .logo-path-ft {
    fill: #a78bfa;
    stroke: #a78bfa;
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
  
  .animate-pulse {
    animation: pulse 1.5s infinite ease-in-out;
  }
  
  /* Highlight animation for click/tap */
  @keyframes highlight {
    0% {
      filter: brightness(1);
      stroke-width: 1;
    }
    50% {
      filter: brightness(1.5);
      stroke-width: 2;
    }
    100% {
      filter: brightness(1);
      stroke-width: 1;
    }
  }
  
  .animate-highlight {
    animation: highlight 0.8s ease-in-out;
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
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    transition: transform 0.2s ease;
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