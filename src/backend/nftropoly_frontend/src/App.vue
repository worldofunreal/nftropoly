<script setup>
import { ref, onMounted } from 'vue';
import { nftropoly_backend } from 'declarations/nftropoly_backend/index';
import { useThemeStore } from './stores/theme';
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import MobileNavigation from './components/MobileNavigation.vue'
import HeroSection from './components/HeroSection.vue'
import FeaturedServices from './components/FeaturedServices.vue'

let greeting = ref('');

async function handleSubmit(e) {
  e.preventDefault();
  const target = e.target;
  const name = target.querySelector('#name').value;
  await nftropoly_backend.greet(name).then((response) => {
    greeting.value = response;
  });
}

// Theme store
const themeStore = useThemeStore()

// Reactive state
const isSidebarOpen = ref(false)
const currentSection = ref('home')

// Methods
const closeSidebar = () => {
  isSidebarOpen.value = false
}

const handleFiltersChanged = (filters) => {
  console.log('Filters changed:', filters)
  // TODO: Apply filters to services list
}

const handleSectionChanged = (section) => {
  currentSection.value = section
  console.log('Section changed to:', section)
  // TODO: Handle section navigation
}

// Initialize theme on mount
onMounted(() => {
  themeStore.initTheme()
  themeStore.watchSystemTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Browser Warning (hidden for now) -->
    <div class="browser-warning bg-yellow-500 text-black p-4 text-center">
      <p>Please use a modern browser for the best experience.</p>
    </div>
    
    <!-- Header -->
    <AppHeader />
    
    <!-- Sidebar -->
    <AppSidebar 
      :isOpen="isSidebarOpen" 
      @close="closeSidebar"
      @filters-changed="handleFiltersChanged"
    />
    
    <!-- Main Content -->
    <main class="pt-16 pb-20 md:pb-0">
      <section class="flex flex-col items-center justify-center min-h-[60vh] py-20 px-4">
        <div class="max-w-2xl w-full text-center">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in">
            Buy Nftropoly Credits
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 animate-fade-in">
            Purchase Nftropoly Credits to access premium features, download digital files, obtain certifications, and acquire digital assets on our platform.<br/>
            Credits are for internal use only, non-transferable, and have no cash value.
          </p>
          <div class="flex justify-center gap-4 animate-fade-in">
            <button class="btn-primary px-6 py-3 text-lg">
              Buy Credits
            </button>
            <button class="btn-secondary px-6 py-3 text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <!-- Brand -->
          <div class="col-span-1 sm:col-span-2">
            <div class="flex items-center space-x-2 mb-4">
              <img src="/nft.svg" alt="Nftropoly Logo" class="w-6 h-6 sm:w-8 sm:h-8" />
              <span class="brand-text brand-gradient-light dark:brand-gradient-dark">NFTROPOLY</span>
            </div>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 max-w-md">
              Purchase Nftropoly Credits to unlock premium features, download digital files, obtain certifications, and acquire digital assets. Credits are for internal use only, non-transferable, and have no cash value.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Buy Credits</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">AI Tools</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Design Gallery</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Pricing</a></li>
            </ul>
          </div>
          
          <!-- Support -->
          <div>
            <h3 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4">Support</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" class="text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            © 2025 Nftropoly. All rights reserved. Advanced AI design platform.
          </p>
        </div>
      </div>
    </footer>

    <!-- Mobile Navigation -->
    <MobileNavigation 
      :initialSection="currentSection"
      @section-changed="handleSectionChanged"
    />
  </div>
</template>
