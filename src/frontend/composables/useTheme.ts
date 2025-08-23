import { ref, watch, onMounted, readonly, computed } from 'vue'

export const useTheme = () => {
  const theme = ref<'light' | 'dark'>('dark')
  const isClient = ref(false)

  // Initialize theme from localStorage or system preference
  const initTheme = (): void => {
    if (typeof window === 'undefined') return
    
    const savedTheme = localStorage.getItem('nftropoly-theme') as 'light' | 'dark' | null
    
    if (savedTheme) {
      theme.value = savedTheme
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }
    
    applyTheme()
  }

  // Apply theme to document
  const applyTheme = (): void => {
    if (typeof window === 'undefined') return
    
    const html = document.documentElement
    
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // Toggle theme
  const toggleTheme = (): void => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('nftropoly-theme', theme.value)
    applyTheme()
  }

  // Set specific theme
  const setTheme = (newTheme: 'light' | 'dark'): void => {
    theme.value = newTheme
    localStorage.setItem('nftropoly-theme', newTheme)
    applyTheme()
  }

  // Watch for theme changes
  watch(theme, () => {
    applyTheme()
  })

  // Initialize on mount
  onMounted(() => {
    isClient.value = true
    initTheme()
  })

  const currentTheme = computed(() => theme.value)

  return {
    theme: currentTheme,
    isClient: readonly(isClient),
    toggleTheme,
    setTheme
  }
}
