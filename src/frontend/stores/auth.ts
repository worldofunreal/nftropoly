import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { AuthClient } from '@dfinity/auth-client';
import { canisterService, type UserProfile } from '@/services/CanisterService';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';

// TODO: Import canister and modal stores when available
// import { useCanisterStore } from './canister';
// import { useModalStore } from '@/stores/modal';
// import Registration from '@/components/forms/RegistrationForm.vue';

let identity: Ed25519KeyIdentity | null = null;
let internetIdentityClient: AuthClient | null = null;

function generateSeedPhrase(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedInput = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', encodedInput).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    // Convert Uint8Array to hex string for bip39
    const seedHex = Array.from(seed).map(b => b.toString(16).padStart(2, '0')).join('');
    return bip39.entropyToMnemonic(seedHex);
  });
}

function deriveKeysFromSeedPhrase(seedPhrase: string) {
  // For our custom seed phrase, use the words to generate a deterministic seed
  const words = seedPhrase.split(' ');
  const wordString = words.join('');
  const encoder = new TextEncoder();
  const encoded = encoder.encode(wordString);
  return crypto.subtle.digest('SHA-256', encoded).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer).slice(0, 32);
    return nacl.sign.keyPair.fromSeed(seed);
  });
}

function createIdentityFromKeyPair(keyPair: nacl.SignKeyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    registered: false,
    player: null as any,
    userProfile: null as UserProfile | null,
    seedPhrase: '',
    walletAddress: '',
    walletType: '',
    icpPrincipal: '',
    canisterInitialized: false,
  }),
  actions: {
    getIdentity() {
      return identity;
    },
    setInternetIdentityClient(client: AuthClient) {
      internetIdentityClient = client;
    },
    getInternetIdentityClient() {
      return internetIdentityClient;
    },
    isAuthenticated() {
      return this.authenticated;
    },
    isRegistered() {
      return this.registered;
    },
    async recoverAccount(seedPhrase: string) {
      return this.handleLoginFlow(seedPhrase);
    },
    async handleLoginFlow(seedPhrase: string, walletAddress?: string, walletType?: string) {
      try {
        console.log('Starting login flow with seed phrase...');
      
        // Derive keys and create identity
        const keyPair = await deriveKeysFromSeedPhrase(seedPhrase);
        identity = createIdentityFromKeyPair(keyPair);
      
        console.log('Identity initialized:', identity.getPrincipal().toText());
        
        // Initialize canister service with the new identity
        await canisterService.initialize(identity);
        this.canisterInitialized = true;
        
        // Check if user exists in database
        console.log('Checking if user exists in database...');
        const existingProfile = await canisterService.getMyProfile();
        
        if (existingProfile) {
          console.log('User found in database:', existingProfile);
          // User exists, load their profile
          this.userProfile = existingProfile;
          this.registered = true;
          this.authenticated = true;
          
          // Update auth state with profile data
          this.seedPhrase = seedPhrase;
          this.walletAddress = walletAddress || existingProfile.wallet?.ethAddress || '';
          this.walletType = walletType || existingProfile.wallet?.walletType || '';
          this.icpPrincipal = identity.getPrincipal().toText();
          
          // Legacy player object for compatibility
          this.player = {
            username: existingProfile.username,
            displayName: existingProfile.displayName,
            avatarPreset: existingProfile.assets?.avatarPreset ? Number(existingProfile.assets.avatarPreset) : 1,
            avatarUrl: existingProfile.assets?.avatarUrl,
            bannerUrl: existingProfile.assets?.bannerUrl,
            ethAddress: walletAddress || existingProfile.wallet?.ethAddress,
            principal: identity.getPrincipal().toText(),
            walletType: walletType || existingProfile.wallet?.walletType
          };
          
          this.saveStateToLocalStorage();
          console.log('Existing user logged in successfully');
          
          return { existing: true, profile: existingProfile };
        } else {
          console.log('User not found in database, needs registration');
          // New user, needs registration
          this.authenticated = true;
          this.registered = false;
          this.userProfile = null;
          
          this.seedPhrase = seedPhrase;
          this.walletAddress = walletAddress || '';
          this.walletType = walletType || '';
          this.icpPrincipal = identity.getPrincipal().toText();
          this.saveStateToLocalStorage();
          
          return { existing: false, profile: null };
        }
      } catch (error) {
        console.error('Error in handleLoginFlow:', error);
        throw error;
      }
    },
    async createGuestAccount() {
      const seedPhrase = generateMnemonic();
      await this.handleLoginFlow(seedPhrase);
      return { username: identity?.getPrincipal().toText() };
    },
    // Complete user registration
    async completeRegistration(profile: UserProfile) {
      this.userProfile = profile;
      this.registered = true;
      
      // Update legacy player object
      this.player = {
        username: profile.username,
        displayName: profile.displayName,
        avatarPreset: profile.assets?.avatarPreset ? Number(profile.assets.avatarPreset) : 1,
        avatarUrl: profile.assets?.avatarUrl,
        bannerUrl: profile.assets?.bannerUrl,
        ethAddress: this.walletAddress,
        principal: this.icpPrincipal,
        walletType: this.walletType
      };
      
      this.saveStateToLocalStorage();
      console.log('User registration completed:', profile.username);
    },

    async logout() {
      // If using Internet Identity, logout from AuthClient as well
      if (internetIdentityClient && this.walletType === 'internet-identity') {
        try {
          await internetIdentityClient.logout();
          console.log('Logged out from Internet Identity');
        } catch (error) {
          console.error('Error logging out from Internet Identity:', error);
        }
      }
      
      localStorage.removeItem('authStore');
      identity = null;
      internetIdentityClient = null;
      this.authenticated = false;
      this.registered = false;
      this.userProfile = null;
      this.canisterInitialized = false;
      this.$reset();
      window.location.href = '/';
    },
    saveStateToLocalStorage() {
      const replacer = (key: string, value: any) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      };
      const serializedState = JSON.stringify(this.$state, replacer);
      localStorage.setItem('authStore', serializedState);
    },
    async loadStateFromLocalStorage() {
      const stored = localStorage.getItem('authStore');
      if (stored) {
        try {
          const parsed = JSON.parse(stored, (key: string, value: any) => {
            if (typeof value === 'string' && /^\d+$/.test(value)) {
              try {
                return BigInt(value);
              } catch {
                return value;
              }
            }
            return value;
          });
          this.$patch(parsed);
          if (parsed.seedPhrase) {
            try {
              const keyPair = await deriveKeysFromSeedPhrase(parsed.seedPhrase);
              identity = createIdentityFromKeyPair(keyPair);
              this.authenticated = true;
              this.registered = true;
              
              // If this was an Internet Identity session, try to restore the AuthClient
              if (parsed.walletType === 'internet-identity') {
                try {
                  const authClient = await AuthClient.create();
                  const isAuthenticated = await authClient.isAuthenticated();
                  if (isAuthenticated) {
                    internetIdentityClient = authClient;
                    console.log('Restored Internet Identity session');
                  } else {
                    // Internet Identity session expired, clear our auth
                    console.log('Internet Identity session expired');
                    this.$reset();
                    identity = null;
                    localStorage.removeItem('authStore');
                    return false;
                  }
                } catch (iiError) {
                  console.warn('Could not restore Internet Identity session:', iiError);
                  // Continue with regular auth even if II session can't be restored
                }
              }
            } catch (identityError) {
              this.$reset();
              identity = null;
              localStorage.removeItem('authStore');
              return false;
            }
          }
          return true;
        } catch (error) {
          this.$reset();
          identity = null;
          localStorage.removeItem('authStore');
          return false;
        }
      } else {
        return false;
      }
    },
  },
});

export default useAuthStore; 