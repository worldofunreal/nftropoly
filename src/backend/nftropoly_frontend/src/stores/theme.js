import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Theme state
  const isDark = ref(false)
  
  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem('nftropoly-theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = systemPrefersDark
    }
    
    applyTheme()
  }
  
  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }
  
  // Set specific theme
  const setTheme = (dark) => {
    isDark.value = dark
    applyTheme()
  }
  
  // Apply theme to DOM
  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('nftropoly-theme', isDark.value ? 'dark' : 'light')
  }
  
  // Watch for system theme changes
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('nftropoly-theme')) {
        isDark.value = e.matches
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  
  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme,
    applyTheme,
    watchSystemTheme
  }
}) 