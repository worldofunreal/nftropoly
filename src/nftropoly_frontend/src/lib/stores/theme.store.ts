import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

// Create a writable store
const theme = writable<Theme>('dark');

// Preload both themes to avoid FOUC (Flash of Unstyled Content)
function preloadThemes() {
  if (typeof document === 'undefined') return;
  
  // Create theme preload links
  const lightTheme = document.createElement('link');
  lightTheme.rel = 'preload';
  lightTheme.as = 'style';
  lightTheme.href = 'data:text/css;charset=UTF-8,body{--preloaded-light:1}';
  
  const darkTheme = document.createElement('link');
  darkTheme.rel = 'preload';
  darkTheme.as = 'style';
  darkTheme.href = 'data:text/css;charset=UTF-8,body{--preloaded-dark:1}';
  
  document.head.appendChild(lightTheme);
  document.head.appendChild(darkTheme);
}

// Function to toggle theme
function toggleTheme() {
  theme.update(currentTheme => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return newTheme;
  });
}

// Function to set a specific theme
function setTheme(newTheme: Theme) {
  theme.set(newTheme);
  applyTheme(newTheme);
}

// Apply theme with performance optimizations
function applyTheme(newTheme: Theme) {
  if (typeof window === 'undefined') return;
  
  // Use requestAnimationFrame to batch DOM changes
  requestAnimationFrame(() => {
    // Save preference to localStorage
    localStorage.setItem('nftropoly-theme', newTheme);
    
    // Apply theme to document - use classList.replace for a single DOM operation
    const oppositeTheme = newTheme === 'light' ? 'dark' : 'light';
    
    // Check if the theme class already exists before manipulating the DOM
    const html = document.documentElement;
    if (html.classList.contains(oppositeTheme)) {
      html.classList.remove(oppositeTheme);
    }
    if (!html.classList.contains(newTheme)) {
      html.classList.add(newTheme);
    }
    
    // Set theme-color meta tag for browser UI
    updateThemeMetaTag(newTheme);
  });
}

// Update theme-color meta tag for browser UI
function updateThemeMetaTag(newTheme: Theme) {
  const themeColor = newTheme === 'dark' ? '#0a0a0a' : '#ffffff';
  let meta = document.querySelector('meta[name="theme-color"]');
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', themeColor);
}

// Initialize theme from localStorage or system preference
function initTheme() {
  if (typeof window === 'undefined') return;

  // Preload themes for faster switching
  preloadThemes();
  
  // Reduce initial load flicker by immediately applying a class before full load
  const htmlEl = document.documentElement;
  htmlEl.classList.add('theme-initializing');
  
  // Check localStorage first - optimize by reading once
  const savedTheme = localStorage.getItem('nftropoly-theme') as Theme | null;
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
  
  // Remove initializing class after a brief delay
  setTimeout(() => {
    htmlEl.classList.remove('theme-initializing');
  }, 50);
  
  // Listen for system preference changes - use a named function for cleaner cleanup
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // Only update if user hasn't set a preference
    if (!localStorage.getItem('nftropoly-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  // Use the modern addEventListener API
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // Return a cleanup function for use with onMount
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
}

export { theme, toggleTheme, setTheme, initTheme }; 