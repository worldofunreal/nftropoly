export type ToastLevel = 'success' | 'error' | 'warn' | 'info';

export interface ToastMsg {
  text: string;
  level?: ToastLevel;
} 