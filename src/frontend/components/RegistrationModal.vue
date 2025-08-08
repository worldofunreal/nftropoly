<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-900">Create Your Profile</h2>
        <button @click="close()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
      
      <!-- Step indicator -->
      <div class="flex items-center justify-center mb-6">
        <div class="flex items-center space-x-4">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', 
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">
            1
          </div>
          <div :class="['h-1 w-8', currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200']"></div>
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', 
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">
            2
          </div>
          <div :class="['h-1 w-8', currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200']"></div>
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', 
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">
            3
          </div>
        </div>
      </div>

      <!-- Step 1: Basic Information -->
      <div v-if="currentStep === 1" class="space-y-6">
        <h3 class="text-lg font-semibold">Basic Information</h3>
        
        <!-- Wallet Info Display -->
        <div class="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <h4 class="font-semibold mb-2">Connected Wallet</h4>
          <div class="space-y-2 text-sm">
            <div v-if="ethAddress && ethAddress !== icpPrincipal">
              <span class="text-gray-600 dark:text-gray-400">{{ walletType }}:</span>
              <span class="font-mono ml-2">{{ ethAddress }}</span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">ICP Principal:</span>
              <span class="font-mono ml-2">{{ icpPrincipal }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Username *</label>
            <input
              v-model="formData.username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="loading"
              @input="checkUsernameAvailability"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <p v-if="usernameStatus" :class="['text-xs mt-1', 
              usernameStatus === 'available' ? 'text-green-600' : 'text-red-600']">
              {{ usernameMessage }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Display Name</label>
            <input
              v-model="formData.displayName"
              type="text"
              placeholder="How you'd like to be called"
              :disabled="loading"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Bio</label>
          <textarea
            v-model="formData.bio"
            placeholder="Tell us about yourself..."
            rows="3"
            :disabled="loading"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-vertical"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email (optional)</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="your@email.com"
            :disabled="loading"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      <!-- Step 2: Profile Customization -->
      <div v-if="currentStep === 2" class="space-y-6">
        <h3 class="text-lg font-semibold">Profile Customization</h3>
        
        <!-- Avatar Selection -->
        <div>
          <label class="block text-sm font-medium mb-4">Choose Your Avatar</label>
          
          <!-- Custom Avatar Upload -->
          <div class="mb-4">
            <label class="block p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleAvatarUpload"
                :disabled="loading"
              />
              <div class="text-center">
                <UIcon name="i-heroicons-cloud-arrow-up" class="mx-auto h-12 w-12 text-gray-400" />
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Upload custom avatar (max 2MB)
                </p>
              </div>
            </label>
          </div>

          <!-- Avatar Preview -->
          <div v-if="avatarPreview" class="mb-4 text-center">
            <img :src="avatarPreview" alt="Avatar preview" class="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg" />
            <button @click="clearAvatar" class="text-sm text-red-600 hover:text-red-800 mt-2">Remove</button>
          </div>

          <!-- Preset Avatars -->
          <div class="grid grid-cols-6 gap-3">
            <button
              v-for="i in 12"
              :key="i"
              type="button"
              @click="selectPresetAvatar(i)"
              :class="[
                'w-12 h-12 rounded-full border-2 transition-colors',
                formData.avatarPreset === i && !avatarPreview
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs">
                {{ i }}
              </div>
            </button>
          </div>
        </div>

        <!-- Banner Upload -->
        <div>
          <label class="block text-sm font-medium mb-2">Profile Banner (optional)</label>
          <label class="block p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <input
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleBannerUpload"
              :disabled="loading"
            />
            <div class="text-center">
              <UIcon name="i-heroicons-photo" class="mx-auto h-8 w-8 text-gray-400" />
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Upload banner image (max 5MB, 1200x300 recommended)
              </p>
            </div>
          </label>
          
          <!-- Banner Preview -->
          <div v-if="bannerPreview" class="mt-4">
            <img :src="bannerPreview" alt="Banner preview" class="w-full h-32 object-cover rounded-lg" />
            <button @click="clearBanner" class="text-sm text-red-600 hover:text-red-800 mt-2">Remove Banner</button>
          </div>
        </div>
      </div>

      <!-- Step 3: Social Links & Privacy -->
      <div v-if="currentStep === 3" class="space-y-6">
        <h3 class="text-lg font-semibold">Social Links & Privacy</h3>
        
        <!-- Social Links -->
        <div>
          <h4 class="font-medium mb-4">Social Links (optional)</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Twitter</label>
              <UInput
                v-model="formData.socialLinks.twitter"
                placeholder="@username or full URL"
                :disabled="loading"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Discord</label>
              <UInput
                v-model="formData.socialLinks.discord"
                placeholder="username#1234"
                :disabled="loading"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Website</label>
              <UInput
                v-model="formData.socialLinks.website"
                placeholder="https://your-website.com"
                :disabled="loading"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Telegram</label>
              <UInput
                v-model="formData.socialLinks.telegram"
                placeholder="@username"
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div>
          <h4 class="font-medium mb-4">Privacy Settings</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm">Make profile public</span>
              <input type="checkbox" v-model="formData.privacy.profilePublic" class="toggle" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Show portfolio value</span>
              <input type="checkbox" v-model="formData.privacy.showPortfolio" class="toggle" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Show trading activity</span>
              <input type="checkbox" v-model="formData.privacy.showActivity" class="toggle" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm">Show email in profile</span>
              <input type="checkbox" v-model="formData.privacy.showEmail" class="toggle" />
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between pt-6 border-t border-gray-200">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="previousStep"
          :disabled="loading"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div v-else></div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="close"
            :disabled="loading"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            v-if="currentStep < 3"
            type="button"
            @click="nextStep"
            :disabled="!canProceed || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          
          <button
            v-else
            type="button"
            @click="handleRegistration"
            :disabled="!canComplete || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating...' : 'Create Profile' }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { canisterService } from '@/services/CanisterService';

// Component state
const show = ref(false);
const loading = ref(false);
const error = ref('');
const currentStep = ref(1);

// Form data
const formData = ref({
  username: '',
  displayName: '',
  bio: '',
  email: '',
  avatarPreset: 1,
  socialLinks: {
    twitter: '',
    discord: '',
    website: '',
    telegram: '',
    instagram: ''
  },
  privacy: {
    profilePublic: true,
    showPortfolio: true,
    showActivity: true,
    showEmail: false
  }
});

// Wallet info passed from login
const ethAddress = ref('');
const icpPrincipal = ref('');
const walletType = ref('');

// Avatar and banner handling
const avatarPreview = ref('');
const bannerPreview = ref('');
const avatarFile = ref<File | null>(null);
const bannerFile = ref<File | null>(null);

// Username availability
const usernameStatus = ref<'available' | 'taken' | 'checking' | null>(null);
const usernameMessage = ref('');
const usernameCheckTimeout = ref<NodeJS.Timeout | null>(null);

const auth = useAuthStore();
const toast = useToast();

// Computed properties
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return formData.value.username.trim().length >= 3 && usernameStatus.value === 'available';
    case 2:
      return true; // Avatar is optional, so always can proceed
    case 3:
      return true; // All fields in step 3 are optional
    default:
      return false;
  }
});

const canComplete = computed(() => {
  return formData.value.username.trim().length >= 3 && usernameStatus.value === 'available';
});

// Username availability check
async function checkUsernameAvailability() {
  const username = formData.value.username.trim();
  
  if (username.length < 3) {
    usernameStatus.value = null;
    usernameMessage.value = '';
    return;
  }

  // Clear previous timeout
  if (usernameCheckTimeout.value) {
    clearTimeout(usernameCheckTimeout.value);
  }

  // Set checking status
  usernameStatus.value = 'checking';
  usernameMessage.value = 'Checking availability...';

  // Debounce the check
  usernameCheckTimeout.value = setTimeout(async () => {
    try {
      // Call canister to check username availability
      const isAvailable = await canisterService.isUsernameAvailable(username);
      
      if (isAvailable) {
        usernameStatus.value = 'available';
        usernameMessage.value = 'Username is available';
      } else {
        usernameStatus.value = 'taken';
        usernameMessage.value = 'Username is already taken';
      }
    } catch (err) {
      console.error('Username availability check failed:', err);
      usernameStatus.value = null;
      usernameMessage.value = 'Could not check availability';
    }
  }, 300);
}

// File upload handlers
function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({
      title: 'File too large',
      description: 'Avatar must be smaller than 2MB',
      color: 'error'
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Invalid file type',
      description: 'Please upload an image file',
      color: 'error'
    });
    return;
  }

  avatarFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  
  // Clear preset selection
  formData.value.avatarPreset = 0;
}

function handleBannerUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: 'File too large',
      description: 'Banner must be smaller than 5MB',
      color: 'error'
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: 'Invalid file type',
      description: 'Please upload an image file',
      color: 'error'
    });
    return;
  }

  bannerFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    bannerPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function selectPresetAvatar(preset: number) {
  formData.value.avatarPreset = preset;
  avatarFile.value = null;
  avatarPreview.value = '';
}

function clearAvatar() {
  avatarFile.value = null;
  avatarPreview.value = '';
  formData.value.avatarPreset = 1;
}

function clearBanner() {
  bannerFile.value = null;
  bannerPreview.value = '';
}

// Step navigation
function nextStep() {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Public API
const open = (address: string, principal: string, type: string = 'unknown') => {
  console.log('RegistrationModal.open() called with:', { address, principal, type });
  ethAddress.value = address;
  icpPrincipal.value = principal;
  walletType.value = type;
  show.value = true;
  console.log('RegistrationModal show.value set to:', show.value);
  resetForm();
};

const close = () => {
  show.value = false;
  resetForm();
};

function resetForm() {
  currentStep.value = 1;
  error.value = '';
  formData.value = {
    username: '',
    displayName: '',
    bio: '',
    email: '',
    avatarPreset: 1,
    socialLinks: {
      twitter: '',
      discord: '',
      website: '',
      telegram: '',
      instagram: ''
    },
    privacy: {
      profilePublic: true,
      showPortfolio: true,
      showActivity: true,
      showEmail: false
    }
  };
  clearAvatar();
  clearBanner();
  usernameStatus.value = null;
  usernameMessage.value = '';
}

defineExpose({ open, close });

// Main registration handler
async function handleRegistration() {
  if (!canComplete.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    // Upload avatar if provided
    let avatarUrl = null;
    if (avatarFile.value) {
      // TODO: Upload to asset canister
      console.log('Would upload avatar:', avatarFile.value.name);
      // avatarUrl = await uploadAsset(avatarFile.value, 'avatar');
    }

    // Upload banner if provided
    let bannerUrl = null;
    if (bannerFile.value) {
      // TODO: Upload to asset canister
      console.log('Would upload banner:', bannerFile.value.name);
      // bannerUrl = await uploadAsset(bannerFile.value, 'banner');
    }

    // Helper function to convert string to optional format
    const toOptional = (value: string) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? [trimmed] : [];
    };

    // Prepare registration data for canister with proper Candid format
    const registrationData = {
      username: formData.value.username.trim(),
      displayName: toOptional(formData.value.displayName),
      bio: toOptional(formData.value.bio),
      email: toOptional(formData.value.email),
      ethAddress: ethAddress.value !== icpPrincipal.value ? [ethAddress.value] : [],
      walletType: walletType.value,
      avatarPreset: avatarFile.value ? [] : [formData.value.avatarPreset],
      socialLinks: {
        twitter: toOptional(formData.value.socialLinks.twitter),
        discord: toOptional(formData.value.socialLinks.discord),
        instagram: toOptional(formData.value.socialLinks.instagram),
        website: toOptional(formData.value.socialLinks.website),
        telegram: toOptional(formData.value.socialLinks.telegram),
      },
      privacy: formData.value.privacy
    };

    console.log('Registration data:', registrationData);

    // Call canister registerUser method
    const result = await canisterService.registerUser(registrationData);
    
    if ('ok' in result) {
      // Registration successful
      const profile = result.ok;
      console.log('Registration successful:', profile);
      
      // Update auth store with the new profile
      await auth.completeRegistration(profile);
      
      // Show success notification
      toast.add({
        title: 'Profile Created!',
        description: `Welcome to NFTropoly, ${profile.username}! Your profile has been created successfully.`,
        color: 'success'
      });
      
      show.value = false;
      
      // Navigate to profile page
      await navigateTo('/profile');
    } else {
      // Registration failed
      const errorMsg = result.err;
      console.error('Registration failed:', errorMsg);
      
      let errorText = 'Registration failed. Please try again.';
      if ('InvalidInput' in errorMsg && errorMsg.InvalidInput) {
        errorText = errorMsg.InvalidInput;
      } else if ('UserAlreadyExists' in errorMsg) {
        errorText = 'User already exists';
      } else if ('InternalError' in errorMsg && errorMsg.InternalError) {
        errorText = errorMsg.InternalError;
      }
      
      throw new Error(errorText);
    }
    
  } catch (err: any) {
    console.error('Registration error:', err);
    error.value = err?.message || 'Registration failed. Please try again.';
    
    toast.add({
      title: 'Registration Failed',
      description: error.value,
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
}

// Watch for username changes to reset status
watch(() => formData.value.username, () => {
  if (usernameStatus.value && usernameStatus.value !== 'checking') {
    usernameStatus.value = null;
    usernameMessage.value = '';
  }
});
</script> 