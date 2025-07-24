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
        <UButton block class="mb-2" icon="mdi:phantom" @click="loginWithPhantom" :loading="loading && loginMethod === 'phantom'">Sign in with Phantom</UButton>
        <UButton block class="mb-2" icon="ic:baseline-account-balance-wallet" @click="loginWithPlug" :loading="loading && loginMethod === 'plug'">Sign in with Plug</UButton>
        <UButton block class="mb-2" icon="logos:google-icon" @click="loginWithGoogle" :loading="loading && loginMethod === 'google'">Sign in with Google</UButton>
        <UButton block class="mb-2" icon="ic:baseline-account-circle" @click="loginWithInternetIdentity">Sign in with Internet Identity</UButton>
        <hr class="my-4 border-gray-200 dark:border-gray-700" />
        <UButton block color="neutral" variant="soft" @click="show = false">Cancel</UButton>
        <div v-if="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
  <RegistrationModal v-if="showRegistrationModal" ref="registrationModalRef" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import metaMaskService from '@/services/MetaMaskService';
import phantomService from '@/services/PhantomService';
import RegistrationModal from './RegistrationModal.vue';
import * as bip39 from 'bip39';

// TypeScript declarations for wallet extensions
declare global {
  interface Window {
    ic?: {
      plug?: {
        isConnected(): Promise<boolean>;
        requestConnect(options?: any): Promise<any>;
        agent: {
          getPrincipal(): Promise<any>;
        };
      };
    };
  }
}

const show = ref(false);
const loading = ref(false);
const error = ref('');
const loginMethod = ref('');

const showRegistrationModal = ref(false);
const registrationModalRef = ref<any>(null);
const toast = useToast();

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
    error.value = '';
    showRegistrationModal.value = false;
  } 
});

const auth = useAuthStore();

async function loginWithMetaMask() {
  error.value = '';
  loading.value = true;
  loginMethod.value = 'metamask';
  try {
    console.log('Starting MetaMask login...');
    // Get Ethereum address first
    const ethAddress = await metaMaskService.getEthereumAddress();
    console.log('Got ETH address:', ethAddress);
    
    const uniqueMessage = 'Sign this message to log in with your Ethereum wallet';
    const signature = await metaMaskService.signMessage(uniqueMessage);
    console.log('Got signature:', signature);
    if (!signature) throw new Error('Failed to sign with MetaMask.');
    
    // Generate a seed phrase from the signature
    const encoder = new TextEncoder();
    const encoded = encoder.encode(signature);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    // Generate a deterministic seed phrase from the signature
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Generated seed hex:', seedHex);
    // Use a simple word list to create a seed phrase (12 words)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult',
      'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
      'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always',
      'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
      'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area',
      'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive',
      'arrow', 'art', 'arte', 'article', 'aside', 'ask', 'aspect', 'assault', 'asset', 'assist'
    ];
    
    // Use the seed hex to select 12 words deterministically
    const seedPhrase = [];
    for (let i = 0; i < 12; i++) {
      const start = i * 4;
      const end = start + 4;
      const hexSlice = seedHex.slice(start, end);
      const wordIndex = parseInt(hexSlice, 16) % words.length;
      seedPhrase.push(words[wordIndex]);
    }
    const finalSeedPhrase = seedPhrase.join(' ');
    console.log('Generated seed phrase:', finalSeedPhrase);
    
    // Handle login flow (this creates the identity)
    console.log('Calling handleLoginFlow...');
    await auth.handleLoginFlow(finalSeedPhrase);
    console.log('handleLoginFlow completed');
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    // Close login modal and show registration
    console.log('Opening registration modal...');
    show.value = false;
    showRegistrationModal.value = true;
    registrationModalRef.value?.open(ethAddress, icpPrincipal);
    console.log('Registration modal opened');
    
    // Show success toast
    toast.add({
      title: 'MetaMask Connected',
      description: 'Successfully connected with MetaMask wallet',
      color: 'success'
    });
    
  } catch (err: any) {
    console.error('MetaMask login error:', err);
    error.value = err?.message || 'MetaMask login failed.';
    
    // Show error toast
    toast.add({
      title: 'Login Failed',
      description: err?.message || 'MetaMask login failed',
      color: 'error'
    });
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
async function loginWithPhantom() {
  error.value = '';
  loading.value = true;
  loginMethod.value = 'phantom';
  try {
    console.log('Starting Phantom login...');
    
    const message = 'Sign this message to log in with your Phantom Wallet';
    const signature = await phantomService.signAndSend(message);
    console.log('Got Phantom signature:', signature);
    
    if (!signature) throw new Error('Failed to sign with Phantom.');
    
    // Generate a seed phrase from the signature
    const encoder = new TextEncoder();
    const encoded = encoder.encode(signature.toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    
    // Generate a deterministic seed phrase from the signature
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Generated seed hex:', seedHex);
    
    // Use a simple word list to create a seed phrase (12 words)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult',
      'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
      'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always',
      'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
      'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area',
      'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive',
      'arrow', 'art', 'arte', 'article', 'aside', 'ask', 'aspect', 'assault', 'asset', 'assist'
    ];
    
    // Use the seed hex to select 12 words deterministically
    const seedPhrase = [];
    for (let i = 0; i < 12; i++) {
      const start = i * 4;
      const end = start + 4;
      const hexSlice = seedHex.slice(start, end);
      const wordIndex = parseInt(hexSlice, 16) % words.length;
      seedPhrase.push(words[wordIndex]);
    }
    const finalSeedPhrase = seedPhrase.join(' ');
    console.log('Generated seed phrase:', finalSeedPhrase);
    
    // Handle login flow (this creates the identity)
    console.log('Calling handleLoginFlow...');
    await auth.handleLoginFlow(finalSeedPhrase);
    console.log('handleLoginFlow completed');
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    // For Phantom, we'll use a placeholder address since we don't have it directly
    const phantomAddress = 'Phantom Wallet Connected';
    
    // Close login modal and show registration
    console.log('Opening registration modal...');
    show.value = false;
    showRegistrationModal.value = true;
    registrationModalRef.value?.open(phantomAddress, icpPrincipal);
    console.log('Registration modal opened');
    
  } catch (err: any) {
    console.error('Phantom login error:', err);
    error.value = err?.message || 'Phantom login failed.';
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
async function loginWithPlug() {
  error.value = '';
  loading.value = true;
  loginMethod.value = 'plug';
  try {
    console.log('Starting Plug login...');
    
    // Check if Plug is available
    if (!window.ic || !window.ic.plug) {
      throw new Error('Plug Wallet is not installed. Please install the Plug extension.');
    }
    
    // Check if already connected
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      console.log('Connecting to Plug Wallet...');
      // For now, we don't need a whitelist since we're just getting the principal
      // Later when we add canister calls, we'll add the canister IDs to whitelist
      const connected = await window.ic.plug.requestConnect();
      if (!connected) {
        throw new Error('Failed to connect to Plug Wallet.');
      }
    }
    
    // Get the user's principal ID from Plug
    const principalId = await window.ic.plug.agent.getPrincipal();
    console.log('Plug Principal ID:', principalId);
    
    // Generate a seed phrase from the principal ID
    const encoder = new TextEncoder();
    const encoded = encoder.encode(principalId.toText());
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    
    // Generate a deterministic seed phrase from the principal
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Generated seed hex:', seedHex);
    
    // Use a simple word list to create a seed phrase (12 words)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult',
      'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
      'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always',
      'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
      'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area',
      'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive',
      'arrow', 'art', 'arte', 'article', 'aside', 'ask', 'aspect', 'assault', 'asset', 'assist'
    ];
    
    // Use the seed hex to select 12 words deterministically
    const seedPhrase = [];
    for (let i = 0; i < 12; i++) {
      const start = i * 4;
      const end = start + 4;
      const hexSlice = seedHex.slice(start, end);
      const wordIndex = parseInt(hexSlice, 16) % words.length;
      seedPhrase.push(words[wordIndex]);
    }
    const finalSeedPhrase = seedPhrase.join(' ');
    console.log('Generated seed phrase:', finalSeedPhrase);
    
    // Handle login flow (this creates the identity)
    console.log('Calling handleLoginFlow...');
    await auth.handleLoginFlow(finalSeedPhrase);
    console.log('handleLoginFlow completed');
    
    // Get the ICP principal from the identity (should match the Plug principal)
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    // For Plug, we'll use the actual principal ID as the address
    const plugAddress = principalId.toText();
    
    // Close login modal and show registration
    console.log('Opening registration modal...');
    show.value = false;
    showRegistrationModal.value = true;
    registrationModalRef.value?.open(plugAddress, icpPrincipal);
    console.log('Registration modal opened');
    
  } catch (err: any) {
    console.error('Plug login error:', err);
    error.value = err?.message || 'Plug login failed.';
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
async function loginWithGoogle() {
  error.value = '';
  loading.value = true;
  loginMethod.value = 'google';
  try {
    console.log('Starting Google login...');
    
    // TODO: Implement actual Google OAuth
    // For now, simulate Google login with a mock user ID
    // In a real implementation, this would be:
    // 1. Open Google OAuth popup
    // 2. Get user ID from JWT token
    // 3. Generate seed phrase from user ID
    
    // Simulate getting user ID from Google
    const mockUserId = 'google_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Mock Google user ID:', mockUserId);
    
    // Generate a seed phrase from the user ID
    const encoder = new TextEncoder();
    const encoded = encoder.encode(mockUserId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    
    // Generate a deterministic seed phrase from the user ID
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('Generated seed hex:', seedHex);
    
    // Use a simple word list to create a seed phrase (12 words)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult',
      'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
      'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always',
      'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
      'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area',
      'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive',
      'arrow', 'art', 'arte', 'article', 'aside', 'ask', 'aspect', 'assault', 'asset', 'assist'
    ];
    
    // Use the seed hex to select 12 words deterministically
    const seedPhrase = [];
    for (let i = 0; i < 12; i++) {
      const start = i * 4;
      const end = start + 4;
      const hexSlice = seedHex.slice(start, end);
      const wordIndex = parseInt(hexSlice, 16) % words.length;
      seedPhrase.push(words[wordIndex]);
    }
    const finalSeedPhrase = seedPhrase.join(' ');
    console.log('Generated seed phrase:', finalSeedPhrase);
    
    // Handle login flow (this creates the identity)
    console.log('Calling handleLoginFlow...');
    await auth.handleLoginFlow(finalSeedPhrase);
    console.log('handleLoginFlow completed');
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    // For Google, we'll use the user ID as the address
    const googleAddress = mockUserId;
    
    // Close login modal and show registration
    console.log('Opening registration modal...');
    show.value = false;
    showRegistrationModal.value = true;
    registrationModalRef.value?.open(googleAddress, icpPrincipal);
    console.log('Registration modal opened');
    
  } catch (err: any) {
    console.error('Google login error:', err);
    error.value = err?.message || 'Google login failed.';
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
async function loginWithInternetIdentity() {
  alert('Internet Identity login (stub)');
  show.value = false;
}
</script> 