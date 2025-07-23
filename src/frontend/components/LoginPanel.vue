<template>
  <!-- Simple Modal Overlay -->
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="show = false"></div>
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4">Sign in to Nftropoly</h2>
        <UButton block class="mb-2" icon="token-branded:metamask" @click="loginWithMetaMask" :loading="loading && loginMethod === 'metamask'">Sign in with MetaMask</UButton>
        <UButton block class="mb-2" icon="token-branded:phantom" @click="loginWithPhantom">Sign in with Phantom</UButton>
        <UButton block class="mb-2" icon="ic:baseline-account-balance-wallet" @click="loginWithPlug">Sign in with Plug</UButton>
        <UButton block class="mb-2" icon="logos:google-icon" @click="loginWithGoogle">Sign in with Google</UButton>
        <UButton block class="mb-2" icon="ic:baseline-account-circle" @click="loginWithInternetIdentity">Sign in with Internet Identity</UButton>
        <hr class="my-4 border-gray-200 dark:border-gray-700" />
        <UButton block color="neutral" variant="soft" @click="show = false">Cancel</UButton>
        <div v-if="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
  <RegistrationModal ref="registrationModalRef" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import metaMaskService from '@/services/MetaMaskService';
import phantomService from '@/services/PhantomService';
import RegistrationModal from './RegistrationModal.vue';
import * as bip39 from 'bip39';

const show = ref(false);
const loading = ref(false);
const error = ref('');
const loginMethod = ref('');

const registrationModalRef = ref<any>(null);

// Watch for changes to show value
watch(show, (newVal) => {
  console.log('LoginPanel show value changed to:', newVal);
});

defineExpose({ 
  open: () => { 
    console.log('LoginPanel open() called');
    show.value = true; 
    console.log('show.value set to:', show.value);
  }, 
  close: () => { 
    show.value = false; 
  } 
});

const auth = useAuthStore();

async function loginWithMetaMask() {
  error.value = '';
  loading.value = true;
  loginMethod.value = 'metamask';
  try {
    // Get Ethereum address first
    const ethAddress = await metaMaskService.getEthereumAddress();
    
    const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
    const signature = await metaMaskService.signMessage(uniqueMessage);
    if (!signature) throw new Error('Failed to sign with MetaMask.');
    
    // Generate a seed phrase from the signature
    const encoder = new TextEncoder();
    const encoded = encoder.encode(signature);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    // Convert Uint8Array to string for bip39
    const seedString = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    const seedPhrase = bip39.entropyToMnemonic(seedString);
    
    // Handle login flow (this creates the identity)
    await auth.handleLoginFlow(seedPhrase);
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    
    // Close login modal and show registration
    show.value = false;
    registrationModalRef.value?.open(ethAddress, icpPrincipal);
    
  } catch (err: any) {
    error.value = err?.message || 'MetaMask login failed.';
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
async function loginWithPhantom() {
  alert('Phantom login (stub)');
  show.value = false;
}
async function loginWithPlug() {
  alert('Plug login (stub)');
  show.value = false;
}
async function loginWithGoogle() {
  alert('Google login (stub)');
  show.value = false;
}
async function loginWithInternetIdentity() {
  alert('Internet Identity login (stub)');
  show.value = false;
}
</script> 