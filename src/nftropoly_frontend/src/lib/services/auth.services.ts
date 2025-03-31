import { authStore } from '$lib/stores/auth.store';
import { toastsError, toastsShow, toastsClean } from '$lib/stores/toasts.store';
import type { ToastMsg } from '$lib/types/toast';
import { get } from 'svelte/store';

export const signIn = async (): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
  try {
    await authStore.signIn();
    
    // Clean previous messages
    toastsClean();
    
    return { success: 'ok' };
  } catch (err: unknown) {
    if (err === 'UserInterrupt') {
      // User cancelled the sign-in process
      return { success: 'cancelled' };
    }
    
    toastsError({
      msg: { text: 'Error while signing in' },
      err
    });
    
    return { success: 'error', err };
  }
};

export const signOut = async (): Promise<void> => {
  await logout();
};

const logout = async () => {
  sessionStorage.clear();
  await authStore.signOut();
  
  // Reload the page to clear all states
  window.location.reload();
};

export const displayAndCleanLogoutMsg = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const msg = urlParams.get('msg');
  
  if (!msg) {
    return;
  }
  
  const level = urlParams.get('level') || 'success';
  toastsShow({ text: decodeURI(msg), level: level as any });
  
  // Clean up URL
  const url = new URL(window.location.href);
  url.searchParams.delete('msg');
  url.searchParams.delete('level');
  window.history.replaceState({}, document.title, url.toString());
};

const cleanToasts = () => {
  // This function would clear any existing toast messages
  // We'll implement toasts store later
}; 