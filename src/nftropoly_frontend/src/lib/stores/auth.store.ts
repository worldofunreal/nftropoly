import { writable, type Readable } from 'svelte/store';
import { AuthClient } from '@dfinity/auth-client';
import type { Identity } from '@dfinity/agent';

export interface AuthStoreData {
  identity: Identity | null | undefined;
}

let authClient: AuthClient | null = null;

export interface AuthStore extends Readable<AuthStoreData> {
  sync: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
  const { subscribe, set, update } = writable<AuthStoreData>({
    identity: undefined
  });

  return {
    subscribe,

    sync: async () => {
      authClient = authClient ?? (await createAuthClient());
      const isAuthenticated = await authClient.isAuthenticated();

      set({
        identity: isAuthenticated ? authClient.getIdentity() : null
      });
    },

    signIn: () =>
      // eslint-disable-next-line no-async-promise-executor
      new Promise<void>(async (resolve, reject) => {
        authClient = authClient ?? (await createAuthClient());

        const identityProvider = `https://identity.ic0.app`;

        // Default maximum session length, 8 days
        const maxTimeToLive = BigInt(8) * BigInt(24) * BigInt(3_600_000_000_000);

        await authClient.login({
          maxTimeToLive,
          onSuccess: () => {
            update((state: AuthStoreData) => ({
              ...state,
              identity: authClient?.getIdentity()
            }));

            resolve();
          },
          onError: reject,
          identityProvider,
          windowOpenerFeatures: popupCenter({ width: 400, height: 600 })
        });
      }),

    signOut: async () => {
      const client = authClient ?? (await createAuthClient());

      await client.logout();

      // Fix for "sign in -> sign out -> sign in again" flow without reload
      authClient = null;

      update((state: AuthStoreData) => ({
        ...state,
        identity: null
      }));
    }
  };
};

const createAuthClient = async (): Promise<AuthClient> => {
  return await AuthClient.create();
};

const popupCenter = ({ width, height }: { width: number; height: number }): string => {
  const left = window.innerWidth / 2 - width / 2;
  const top = window.innerHeight / 2 - height / 2;
  return `width=${width},height=${height},top=${top},left=${left}`;
};

export const authStore = initAuthStore(); 