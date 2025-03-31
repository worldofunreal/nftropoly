import { writable } from 'svelte/store';
import type { ToastLevel, ToastMsg } from '$lib/types/toast';

export interface Toast extends ToastMsg {
  id: string;
  level: ToastLevel;
}

const createToastsStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    show: (toast: ToastMsg) => {
      const id = Math.random().toString(36).substring(2, 9);
      update((toasts) => [
        ...toasts,
        {
          id,
          text: toast.text,
          level: toast.level || 'info',
        },
      ]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        update((toasts) => toasts.filter((t) => t.id !== id));
      }, 5000);
    },
    error: (options: { msg: ToastMsg; err?: unknown }) => {
      console.error(options.err);
      update((toasts) => [
        ...toasts,
        {
          id: Math.random().toString(36).substring(2, 9),
          text: options.msg.text,
          level: 'error',
        },
      ]);
    },
    clean: () => {
      update(() => []);
    },
  };
};

export const toasts = createToastsStore();

// Aliases for better readability
export const toastsShow = toasts.show;
export const toastsError = toasts.error;
export const toastsClean = toasts.clean; 