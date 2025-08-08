<template>
  <!-- Simple Modal Overlay -->
  <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-white/80 dark:bg-black/90" @click="show = false"></div>
    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-8">
        <!-- Logo Section -->
        <div class="flex flex-col items-center mb-8">
          <img src="/logo.svg" alt="NFTropoly Logo" class="w-12 h-12 mb-2" />
          <img src="/logo-text.svg" alt="NFTropoly" class="h-6 light:invert" />
        </div>
        
        <h2 class="text-2xl font-bold mb-6 text-center ">Sign in to Nftropoly</h2>
        <div class="space-y-4 ">
          <UButton 
            block 
            size="xl"
            color="neutral" 
            variant="soft"
            class="h-12 text-sm font-normal bg-gray-200 dark:bg-neutral-800 hover:bg-primary-400 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 justify-start" 
            @click="loginWithInternetIdentity"
            :loading="loading && loginMethod === 'internet-identity'"
          >
            <div class="flex items-center gap-3">
              <UIcon name="token-branded:icp" class="text-2xl" />
              <span>Sign in with Internet Identity</span>
            </div>
          </UButton>
          
          <UButton 
            block 
            size="xl"
            color="neutral" 
            variant="soft"
            class="h-12 text-sm font-normal bg-gray-200 dark:bg-neutral-800 hover:bg-primary-400 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 justify-start" 
            @click="loginWithMetaMask" 
            :loading="loading && loginMethod === 'metamask'"
          >
            <div class="flex items-center gap-3">
              <UIcon name="token-branded:metamask" class="text-2xl" />
              <span>Sign in with MetaMask</span>
            </div>
          </UButton>
          <UButton 
            block 
            size="xl"
            color="neutral" 
            variant="soft"
            class="h-12 text-sm font-normal bg-gray-200 dark:bg-neutral-800 hover:bg-primary-400 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 justify-start" 
            @click="loginWithPhantom" 
            :loading="loading && loginMethod === 'phantom'"
          >
            <div class="flex items-center gap-3">
              <UIcon name="token-branded:phantom" class="text-2xl" />
              <span>Sign in with Phantom</span>
            </div>
          </UButton>
          <UButton 
            block 
            size="xl"
            color="neutral" 
            variant="soft"
            class="h-12 text-sm font-normal bg-gray-200 dark:bg-neutral-800 hover:bg-primary-400 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 justify-start" 
            @click="loginWithPlug" 
            :loading="loading && loginMethod === 'plug'"
          >
            <div class="flex items-center gap-3">
              <UIcon name="fa6-solid:plug" class="text-2xl" />
              <span>Sign in with Plug</span>
            </div>
          </UButton>
          <UButton 
            block 
            size="xl"
            color="neutral" 
            variant="soft"
            class="h-12 text-sm font-normal bg-gray-200 dark:bg-neutral-800 hover:bg-primary-400 dark:hover:bg-primary-600 text-gray-800 dark:text-gray-200 justify-start" 
            @click="loginWithGoogle" 
            :loading="loading && loginMethod === 'google'"
          >
            <div class="flex items-center gap-3">
              <UIcon name="logos:google-icon" class="text-2xl" />
              <span>Sign in with Google</span>
            </div>
          </UButton>

        </div>
        <hr class="my-6 border-gray-200 dark:border-gray-700" />
        <UButton 
          block 
          color="neutral" 
          variant="soft" 
          size="lg"
          class="h-12 text-base"
          @click="show = false"
        >
          Cancel
        </UButton>
        <div v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</div>
        
        <!-- Terms and Privacy Policy -->
        <div class="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          By signing in and using Nftropoly, you agree to our 
          <NuxtLink to="/terms" class="text-primary hover:underline">Terms of Service</NuxtLink> 
          and 
          <NuxtLink to="/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>
        </div>
      </div>
    </div>
  </div>
  <RegistrationModal v-if="showRegistrationModal" ref="registrationModalRef" />
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import metaMaskService from '@/services/MetaMaskService';
import phantomService from '@/services/PhantomService';
import RegistrationModal from './RegistrationModal.vue';
import { AuthClient } from '@dfinity/auth-client';
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
    
    // Handle login flow (this creates the identity and checks for existing user)
    console.log('Calling handleLoginFlow...');
    const loginResult = await auth.handleLoginFlow(finalSeedPhrase, ethAddress, 'metamask');
    console.log('handleLoginFlow completed:', loginResult);
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    if (loginResult.existing) {
      // User already exists, redirect to profile
      console.log('Existing user found, redirecting to profile...');
      show.value = false;
      
      // Show success toast
      toast.add({
        title: 'Welcome Back!',
        description: `Welcome back, ${loginResult.profile?.username || 'user'}!`,
        color: 'success'
      });
      
      // Navigate to profile page
      await navigateTo('/profile');
    } else {
      // New user, show registration modal
      console.log('New user, opening registration modal...');
      show.value = false;
      showRegistrationModal.value = true;
      console.log('showRegistrationModal set to:', showRegistrationModal.value);
      await nextTick();
      console.log('After nextTick, registrationModalRef.value:', registrationModalRef.value);
      if (registrationModalRef.value) {
        console.log('Calling registrationModalRef.value.open with:', ethAddress, icpPrincipal, 'metamask');
        registrationModalRef.value.open(ethAddress, icpPrincipal, 'metamask');
        console.log('Registration modal open() called successfully');
      } else {
        console.error('registrationModalRef.value is null/undefined!');
      }
      console.log('Registration modal opened');
    }
    
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
    
    // Get the ICP principal from the identity
    const identity = auth.getIdentity();
    const icpPrincipal = identity?.getPrincipal().toText() || '';
    console.log('Got ICP principal:', icpPrincipal);
    
    // For Phantom, we'll use a placeholder address since we don't have it directly
    const phantomAddress = 'Phantom Wallet Connected';
    
    // Handle login flow (this creates the identity and checks for existing user)
    console.log('Calling handleLoginFlow...');
    const loginResult = await auth.handleLoginFlow(finalSeedPhrase, phantomAddress, 'phantom');
    console.log('handleLoginFlow completed:', loginResult);
    
    if (loginResult.existing) {
      // User already exists, redirect to profile
      console.log('Existing user found, redirecting to profile...');
      show.value = false;
      
      // Show success toast
      toast.add({
        title: 'Welcome Back!',
        description: `Welcome back, ${loginResult.profile?.username || 'user'}!`,
        color: 'success'
      });
      
      // Navigate to profile page
      await navigateTo('/profile');
    } else {
      // New user, show registration modal
      console.log('New user, opening registration modal...');
      show.value = false;
      showRegistrationModal.value = true;
      await nextTick();
      registrationModalRef.value?.open(phantomAddress, icpPrincipal, 'phantom');
      console.log('Registration modal opened');
    }
    
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
    await auth.handleLoginFlow(finalSeedPhrase, principalId.toText(), 'plug');
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
    await nextTick();
    registrationModalRef.value?.open(plugAddress, icpPrincipal, 'plug');
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
    await auth.handleLoginFlow(finalSeedPhrase, mockUserId, 'google');
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
    await nextTick();
    registrationModalRef.value?.open(googleAddress, icpPrincipal, 'google');
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
  error.value = '';
  loading.value = true;
  loginMethod.value = 'internet-identity';
  
  try {
    console.log('Starting Internet Identity login...');
    
    // Initialize the AuthClient
    const authClient = await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30, // 30 minutes
        disableDefaultIdleCallback: true
      }
    });
    
    // Check if already authenticated
    const isAuthenticated = await authClient.isAuthenticated();
    if (isAuthenticated) {
      console.log('Already authenticated with Internet Identity');
    } else {
      // Start the login process
      console.log('Starting Internet Identity authentication flow...');
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: 'https://identity.ic0.app',
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: () => {
            console.log('Internet Identity login successful');
            resolve();
          },
          onError: (error) => {
            console.error('Internet Identity login failed:', error);
            reject(new Error('Internet Identity login failed'));
          }
        });
      });
    }
    
    // Get the identity from the auth client
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal();
    const principalText = principal.toText();
    
    console.log('Internet Identity Principal:', principalText);
    
    // Generate a seed phrase from the principal ID for compatibility with existing auth flow
    const encoder = new TextEncoder();
    const encoded = encoder.encode(principalText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    
    // Generate a deterministic seed phrase from the principal
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    
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
    console.log('Generated seed phrase for Internet Identity:', finalSeedPhrase);
    
    // Handle login flow using the existing auth store method
    console.log('Calling handleLoginFlow...');
    await auth.handleLoginFlow(finalSeedPhrase, principalText, 'internet-identity');
    console.log('handleLoginFlow completed');
    
    // Store the AuthClient instance in the auth store for logout purposes
    auth.setInternetIdentityClient(authClient);
    
    // Close login modal and show registration
    console.log('Opening registration modal...');
    show.value = false;
    showRegistrationModal.value = true;
    await nextTick();
    registrationModalRef.value?.open(principalText, principalText, 'internet-identity');
    console.log('Registration modal opened');
    
    // Show success toast
    toast.add({
      title: 'Internet Identity Connected',
      description: 'Successfully authenticated with Internet Identity',
      color: 'success'
    });
    
  } catch (err: any) {
    console.error('Internet Identity login error:', err);
    error.value = err?.message || 'Internet Identity login failed.';
    
    // Show error toast
    toast.add({
      title: 'Login Failed',
      description: err?.message || 'Internet Identity login failed',
      color: 'error'
    });
  } finally {
    loading.value = false;
    loginMethod.value = '';
  }
}
</script> 