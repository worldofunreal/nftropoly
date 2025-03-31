import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';

// Device breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1025
};

// Store for current viewport width
export const viewport = writable({
  width: browser ? window.innerWidth : 1200,
  height: browser ? window.innerHeight : 800
});

// Device type store (derived from viewport)
export const deviceType = derived(viewport, $vp => {
  if ($vp.width < BREAKPOINTS.mobile) return 'mobile';
  if ($vp.width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
});

// Initialize viewport listener if in browser
export function initViewport() {
  if (!browser) return;
  
  const handleResize = () => {
    viewport.set({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}

// Convenience functions
export const isDesktop = derived(deviceType, $device => $device === 'desktop');
export const isMobile = derived(deviceType, $device => $device === 'mobile');
export const isTablet = derived(deviceType, $device => $device === 'tablet');
export const isMobileOrTablet = derived(deviceType, $device => $device === 'mobile' || $device === 'tablet'); 