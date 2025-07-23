import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mnemonicToSeedSync, generateMnemonic, validateMnemonic } from 'bip39';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import nacl from 'tweetnacl';

// TODO: Import canister and modal stores when available
// import { useCanisterStore } from './canister';
// import { useModalStore } from '@/stores/modal';
// import Registration from '@/components/forms/RegistrationForm.vue';

let identity: Ed25519KeyIdentity | null = null;

function generateSeedPhrase(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const encodedInput = encoder.encode(input);
  return crypto.subtle.digest('SHA-256', encodedInput).then(hashBuffer => {
    const seed = new Uint8Array(hashBuffer.slice(0, 32));
    return (require('bip39') as typeof import('bip39')).entropyToMnemonic(seed);
  });
}

function deriveKeysFromSeedPhrase(seedPhrase: string) {
  const seed = mnemonicToSeedSync(seedPhrase).slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seed);
}

function createIdentityFromKeyPair(keyPair: nacl.SignKeyPair) {
  return Ed25519KeyIdentity.fromKeyPair(keyPair.publicKey, keyPair.secretKey);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    registered: false,
    player: null as any,
    seedPhrase: '',
  }),
  actions: {
    getIdentity() {
      return identity;
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
    async handleLoginFlow(seedPhrase: string) {
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase.');
      }
      // Derive keys and create identity
      const keyPair = deriveKeysFromSeedPhrase(seedPhrase);
      identity = createIdentityFromKeyPair(keyPair);
      this.authenticated = true;
      this.seedPhrase = seedPhrase;
      this.saveStateToLocalStorage();
      // TODO: Fetch player data from canister and update state
      // For now, stub registration as true
      this.registered = true;
    },
    async createGuestAccount() {
      const seedPhrase = generateMnemonic();
      await this.handleLoginFlow(seedPhrase);
      return { username: identity?.getPrincipal().toText() };
    },
    async logout() {
      localStorage.removeItem('authStore');
      identity = null;
      this.authenticated = false;
      this.registered = false;
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
              const keyPair = deriveKeysFromSeedPhrase(parsed.seedPhrase);
              identity = createIdentityFromKeyPair(keyPair);
              this.authenticated = true;
              this.registered = true;
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