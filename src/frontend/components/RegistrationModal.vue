<template>
  <UModal v-model="show">
    <div class="p-6 max-w-md">
      <h2 class="text-xl font-bold mb-4">Create Your Account</h2>
      
      <!-- Wallet Info -->
      <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 class="font-semibold mb-2">Connected Wallet</h3>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-600 dark:text-gray-400">Ethereum:</span>
            <span class="font-mono ml-2">{{ ethAddress }}</span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">ICP Principal:</span>
            <span class="font-mono ml-2">{{ icpPrincipal }}</span>
          </div>
        </div>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegistration" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <UInput
            v-model="username"
            placeholder="Enter your username"
            required
            :disabled="loading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Avatar</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="i in 12"
              :key="i"
              type="button"
              @click="selectedAvatar = i"
              :class="[
                'w-12 h-12 rounded-full border-2 transition-colors',
                selectedAvatar === i 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                {{ i }}
              </div>
            </button>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="!username.trim()"
            class="flex-1"
          >
            Create Account
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            @click="show = false"
            :disabled="loading"
          >
            Cancel
          </UButton>
        </div>
      </form>

      <div v-if="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const show = ref(false);
const loading = ref(false);
const error = ref('');
const username = ref('');
const selectedAvatar = ref(1);
const ethAddress = ref('');
const icpPrincipal = ref('');

const auth = useAuthStore();

const open = (address: string, principal: string) => {
  ethAddress.value = address;
  icpPrincipal.value = principal;
  show.value = true;
};

const close = () => {
  show.value = false;
  error.value = '';
  username.value = '';
  selectedAvatar.value = 1;
};

defineExpose({ open, close });

async function handleRegistration() {
  if (!username.value.trim()) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // TODO: Call canister signup method
    // For now, just update the auth store
    console.log('Creating account with:', {
      username: username.value,
      avatarId: selectedAvatar.value,
      ethAddress: ethAddress.value,
      icpPrincipal: icpPrincipal.value
    });
    
    // Simulate successful registration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update auth store to show user is registered
    auth.registered = true;
    auth.player = {
      username: username.value,
      avatarId: selectedAvatar.value,
      ethAddress: ethAddress.value,
      principal: icpPrincipal.value
    };
    
    show.value = false;
  } catch (err: any) {
    error.value = err?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script> 