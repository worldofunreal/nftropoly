import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

// Create a writable store
const theme = writable<Theme>('dark');

// Function to toggle theme
function toggleTheme() {
  theme.update(currentTheme => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('nftropoly-theme', newTheme);
      document.documentElement.classList.remove(currentTheme);
      document.documentElement.classList.add(newTheme);
    }
    
    return newTheme;
  });
}

// Function to set a specific theme
function setTheme(newTheme: Theme) {
  theme.set(newTheme);
  
  // Save preference to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('nftropoly-theme', newTheme);
    document.documentElement.classList.remove(newTheme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.add(newTheme);
  }
}

// Initialize theme from localStorage or system preference
function initTheme() {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const savedTheme = localStorage.getItem('nftropoly-theme') as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('nftropoly-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

export { theme, toggleTheme, setTheme, initTheme }; 