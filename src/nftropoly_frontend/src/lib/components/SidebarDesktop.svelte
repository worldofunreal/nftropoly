<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut, backOut } from 'svelte/easing';
  import { theme } from '$lib/stores/theme.store';
  import { authStore } from '$lib/stores/auth.store';
  import NFTropolyLogo from './NFTropolyLogo.svelte';
  import ThemeSwitch from './ThemeSwitch.svelte';
  
  // Props
  export let currentPage: string = '/';
  
  // State
  let expanded = false;
  let hoveredItem: string | null = null;
  let mounted = false;
  let visibleExpanded = false; // For smoother transitions
  
  // Constants
  const COLLAPSED_WIDTH = 70; // in px
  const EXPANDED_WIDTH = 240; // in px
  const TRANSITION_DURATION = 400; // in ms, must match CSS transition duration
  
  const dispatch = createEventDispatcher();
  
  // Navigation items with routes, icons, and labels
  const navItems = [
    {
      id: 'home',
      path: '/',
      label: 'Home',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
    },
    {
      id: 'stats',
      path: '/stats',
      label: 'Statistics',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
    },
    {
      id: 'activity',
      path: '/activity',
      label: 'Activity',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`
    },
    {
      id: 'explore',
      path: '/explore',
      label: 'Explore',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`
    },
    {
      id: 'collections',
      path: '/collections',
      label: 'Collections',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
    },
    {
      id: 'favorites',
      path: '/favorites',
      label: 'Favorites',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
    },
    {
      id: 'create',
      path: '/create',
      label: 'Create NFT',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
    }
  ];
  
  // Bottom section items
  const bottomItems = [
    {
      id: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
    },
    {
      id: 'help',
      path: '/help',
      label: 'Help Center',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    }
  ];
  
  // Handle mouse enter/leave for the entire sidebar
  function handleMouseEnter() {
    expanded = true;
    visibleExpanded = true;
    clearTimeout(expandTimeout);
  }
  
  let expandTimeout: ReturnType<typeof setTimeout>;
  
  function handleMouseLeave() {
    expanded = false;
    // Keep visible expanded content during the transition
    expandTimeout = setTimeout(() => {
      visibleExpanded = false;
    }, TRANSITION_DURATION);
  }
  
  // Handle item hover for tooltip when collapsed
  function handleItemHover(id: string) {
    hoveredItem = id;
  }
  
  function handleItemLeave() {
    hoveredItem = null;
  }
  
  function toggleTheme() {
    theme.update(current => current === 'light' ? 'dark' : 'light');
  }
  
  onMount(() => {
    mounted = true;
    return () => {
      clearTimeout(expandTimeout);
    };
  });
</script>

<nav 
  class="sidebar {expanded ? 'expanded' : 'collapsed'} {$theme}-sidebar"
  style="width: {expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}px;"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  aria-label="Main Navigation"
>
  <div class="sidebar-inner">
    <!-- Logo section -->
    <div class="logo-container">
      <NFTropolyLogo expanded={false} animated={mounted} size={35} />
    </div>
    
    <!-- Main navigation items -->
    <ul class="nav-items">
      {#each navItems as item, i}
        {@const isActive = currentPage === item.path}
        <li 
          class="nav-item {isActive ? 'active' : ''}"
          on:mouseenter={() => handleItemHover(item.id)}
          on:mouseleave={handleItemLeave}
        >
          <a 
            href={item.path} 
            aria-current={isActive ? 'page' : undefined}
            class="nav-link"
          >
            <div class="icon-container">
              {@html item.icon}
              
              <!-- Tooltip for collapsed state -->
              {#if !expanded && hoveredItem === item.id && mounted}
                <div 
                  class="tooltip"
                  in:fly={{ x: 20, y: 0, duration: 300, delay: 100, easing: backOut }}
                >
                  {item.label}
                </div>
              {/if}
            </div>
            
            {#if expanded || visibleExpanded}
              <div class="label-wrapper" class:fade-out={!expanded} in:fade={{ duration: 350, delay: 180 + i * 25 }}>
                <span class="label">
                  {item.label}
                </span>
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
    
    <!-- Bottom section items (settings, help, theme) -->
    <div class="bottom-section">
      <!-- Theme Switch -->
      <div class="theme-switch-container">
        <div 
          class="theme-switch-wrapper"
          role="button"
          tabindex="0"
          aria-label="Toggle dark mode"
          on:mouseenter={() => handleItemHover('theme')}
          on:mouseleave={handleItemLeave}
          on:click={toggleTheme}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
        >
          <div class="icon-container">
            <ThemeSwitch />
            
            <!-- Tooltip for collapsed state -->
            {#if !expanded && hoveredItem === 'theme' && mounted}
              <div 
                class="tooltip"
                role="tooltip"
                in:fly={{ x: 20, y: 0, duration: 300, delay: 100, easing: backOut }}
              >
                {$theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
            {/if}
          </div>
          
          {#if expanded || visibleExpanded}
            <div class="label-wrapper" class:fade-out={!expanded} in:fade={{ duration: 350, delay: 180 }}>
              <span class="label">
                {$theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
          {/if}
        </div>
      </div>
      
      <ul class="bottom-items">
        {#each bottomItems as item, i}
          {@const isActive = currentPage === item.path}
          <li 
            class="nav-item {isActive ? 'active' : ''}"
            on:mouseenter={() => handleItemHover(item.id)}
            on:mouseleave={handleItemLeave}
          >
            <a 
              href={item.path} 
              aria-current={isActive ? 'page' : undefined}
              class="nav-link"
            >
              <div class="icon-container">
                {@html item.icon}
                
                <!-- Tooltip for collapsed state -->
                {#if !expanded && hoveredItem === item.id && mounted}
                  <div 
                    class="tooltip"
                    in:fly={{ x: 20, y: 0, duration: 300, delay: 100, easing: backOut }}
                  >
                    {item.label}
                  </div>
                {/if}
              </div>
              
              {#if expanded || visibleExpanded}
                <div class="label-wrapper" class:fade-out={!expanded} in:fade={{ duration: 350, delay: 200 + i * 25 }}>
                  <span class="label">
                    {item.label}
                  </span>
                </div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
      
      <!-- Profile section at bottom -->
      <div class="profile-section">
        <div 
          class="profile-wrapper {expanded ? 'expanded' : ''}"
          role="button"
          tabindex="0"
          aria-label="User profile"
          on:mouseenter={() => handleItemHover('profile')}
          on:mouseleave={handleItemLeave}
          on:click={() => {/* Handle profile click action */}}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              /* Handle profile click action */
            }
          }}
        >
          <div class="avatar" role="img" aria-label="User avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="profile-icon">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            
            <!-- Tooltip for collapsed state -->
            {#if !expanded && hoveredItem === 'profile' && mounted}
              <div 
                class="tooltip profile-tooltip"
                role="tooltip"
                in:fly={{ x: 20, y: 0, duration: 300, delay: 100, easing: backOut }}
              >
                Your Profile
              </div>
            {/if}
          </div>
          
          {#if expanded || visibleExpanded}
            <div class="profile-info" class:fade-out={!expanded} in:fade={{ duration: 350, delay: 200 }}>
              <div class="profile-name">NFT Collector</div>
              <div class="profile-status">Connected</div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  /* Sidebar base styles */
  .sidebar {
    background-color: var(--bg-secondary);
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999; /* Higher z-index to ensure it's on top */
    display: flex;
    flex-direction: column;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-right: 1px solid var(--border-color);
    box-shadow: 1px 0 5px rgba(0, 0, 0, 0.05);
    transform: translateZ(0); /* Force hardware acceleration */
    backface-visibility: hidden; /* Improve rendering performance */
    contain: layout style; /* Improve rendering performance */
  }
  
  /* Different transitions for expanding and collapsing */
  .sidebar.collapsed {
    transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  
  .sidebar.expanded {
    transition: width 0.4s cubic-bezier(0.3, 0, 0.2, 1);
  }
  
  /* Theme styles */
  .light-sidebar {
    background-color: #ffffff;
    color: #1e293b;
    border-right: 1px solid rgba(226, 232, 240, 0.75);
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }
  
  .dark-sidebar {
    background-color: #151525;
    color: #f1f5f9;
    border-right: 1px solid rgba(30, 30, 53, 0.75);
  }
  
  .sidebar-inner {
    width: 100%;
    height: 100%;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  /* Logo styles */
  .logo-container {
    padding: 0;
    height: 56px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Navigation items */
  .nav-items {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .nav-item {
    width: 100%;
    position: relative;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    margin: 0 8px;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.3s ease, transform 0.3s ease, color 0.3s ease;
    position: relative;
  }
  
  .light-sidebar .nav-link {
    color: #475569;
  }
  
  .dark-sidebar .nav-link {
    color: #cbd5e1;
  }
  
  /* Active state styling */
  .nav-item.active .nav-link {
    font-weight: 500;
  }
  
  .light-sidebar .nav-item.active .nav-link {
    background-color: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }
  
  .dark-sidebar .nav-item.active .nav-link {
    background-color: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
  }
  
  .nav-item.active::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 3px;
    background-color: #8b5cf6;
    border-radius: 0 3px 3px 0;
  }
  
  /* Hover states */
  .light-sidebar .nav-link:hover {
    background-color: rgba(241, 245, 249, 0.8);
    color: #1e293b;
    transform: translateX(2px);
  }
  
  .dark-sidebar .nav-link:hover {
    background-color: rgba(30, 30, 53, 0.6);
    color: #f1f5f9;
    transform: translateX(2px);
  }
  
  .light-sidebar .nav-item.active .nav-link:hover {
    background-color: rgba(139, 92, 246, 0.15);
  }
  
  .dark-sidebar .nav-item.active .nav-link:hover {
    background-color: rgba(139, 92, 246, 0.25);
  }
  
  /* Icon container */
  .icon-container {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    border-radius: 6px;
    transition: background-color 0.3s ease;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
    stroke-width: 2px;
    transition: transform 0.3s ease;
  }
  
  .nav-link:hover .nav-icon {
    transform: scale(1.05);
  }
  
  /* Label styling */
  .label-wrapper {
    overflow: hidden;
    flex: 1;
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  .label-wrapper.fade-out {
    opacity: 0;
  }
  
  .label {
    margin-left: 12px;
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    display: inline-block;
  }
  
  /* Tooltip styling */
  .tooltip {
    position: absolute;
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
    background-color: #1e293b;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 10px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 100;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .tooltip::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent #1e293b transparent transparent;
  }
  
  /* Theme switch */
  .theme-switch-container {
    padding: 4px 8px;
    margin-bottom: 16px;
  }
  
  .theme-switch-wrapper {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    position: relative;
  }
  
  .light-sidebar .theme-switch-wrapper:hover {
    background-color: rgba(241, 245, 249, 0.8);
    transform: translateX(2px);
  }
  
  .dark-sidebar .theme-switch-wrapper:hover {
    background-color: rgba(30, 30, 53, 0.6);
    transform: translateX(2px);
  }
  
  /* Bottom section */
  .bottom-section {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  /* Bottom items section */
  .bottom-items {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-top: 1px solid;
    padding-top: 16px;
    margin-bottom: 16px;
  }
  
  .light-sidebar .bottom-items {
    border-color: rgba(226, 232, 240, 0.75);
  }
  
  .dark-sidebar .bottom-items {
    border-color: rgba(30, 30, 53, 0.75);
  }
  
  /* Profile section */
  .profile-section {
    padding: 8px;
  }
  
  .profile-wrapper {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    position: relative;
  }
  
  .profile-wrapper.expanded {
    padding: 10px 12px;
  }
  
  .light-sidebar .profile-wrapper:hover {
    background-color: rgba(241, 245, 249, 0.8);
    transform: translateY(-1px);
  }
  
  .dark-sidebar .profile-wrapper:hover {
    background-color: rgba(30, 30, 53, 0.6);
    transform: translateY(-1px);
  }
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #8b5cf6;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .profile-wrapper:hover .avatar {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .profile-tooltip {
    bottom: 50%;
    transform: translateY(50%);
  }
  
  .profile-icon {
    width: 18px;
    height: 18px;
    stroke: white;
  }
  
  .profile-info {
    margin-left: 12px;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.3s ease;
  }
  
  .profile-info.fade-out {
    opacity: 0;
  }
  
  .profile-name {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .profile-status {
    font-size: 12px;
    white-space: nowrap;
  }
  
  .light-sidebar .profile-status {
    color: #8b5cf6;
  }
  
  .dark-sidebar .profile-status {
    color: #a78bfa;
  }
  
  /* Focus styles for keyboard users */
  .profile-wrapper:focus,
  .theme-switch-wrapper:focus {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
    border-radius: 8px;
  }
  
  /* Hide outline when using mouse */
  .profile-wrapper:focus:not(:focus-visible),
  .theme-switch-wrapper:focus:not(:focus-visible) {
    outline: none;
  }
  
  /* Collapsed state specific styles */
  .sidebar.collapsed .nav-link {
    justify-content: center;
  }
  
  .sidebar.collapsed .profile-wrapper,
  .sidebar.collapsed .theme-switch-wrapper {
    justify-content: center;
  }
</style> 