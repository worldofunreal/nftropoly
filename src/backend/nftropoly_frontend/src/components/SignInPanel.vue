<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center min-h-screen bg-neutral/70 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative animate-fade-in border-2 border-blue-500 max-h-[90vh] overflow-auto flex flex-col justify-center">
      <button class="absolute top-4 right-4 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-blue-200 dark:border-blue-700" @click="$emit('close')">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-8 text-center tracking-tight">Sign In</h2>
      <div class="space-y-6">
        <!-- Google Identity Services -->
        <div id="google-signin-btn" class="w-full flex justify-center mb-2"></div>
        <div class="flex items-center gap-2 my-2">
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          <span class="text-xs text-slate-400">or</span>
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <!-- Email Login -->
        <form @submit.prevent="$emit('email-signin', { email, password })" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input v-model="email" type="email" required class="input-field w-full text-lg" placeholder="you@email.com" :disabled="loading" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input v-model="password" type="password" required class="input-field w-full text-lg" placeholder="Password" :disabled="loading" />
          </div>
          <button type="submit" class="btn-primary w-full py-3 text-lg font-semibold shadow-md" :disabled="loading">
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in with Email</span>
          </button>
        </form>
        <div v-if="error" class="text-red-600 dark:text-red-400 text-base text-center mt-2 font-semibold">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    })
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-btn'),
      { theme: 'outline', size: 'large', width: 320 }
    )
  }
})

function handleCredentialResponse(response) {
  // response.credential is a JWT ID token
  const user = parseJwt(response.credential)
  localStorage.setItem('nftropoly_user', JSON.stringify(user))
  window.location.reload()
}

function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]))
}
</script> 