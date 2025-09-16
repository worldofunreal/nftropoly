// Polyfills for browser compatibility
import { Buffer } from 'buffer'
import process from 'process'

// Configure global polyfills for browser environment
if (typeof window !== 'undefined') {
  // Make Buffer available globally
  ;(window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer

  // Make process available globally
  ;(window as unknown as { process: typeof process }).process = process

  // Configure global object
  if (
    typeof (window as unknown as { global: unknown }).global === 'undefined'
  ) {
    ;(window as unknown as { global: unknown }).global = window
  }

  // Configure crypto for Solana Web3.js
  if (typeof window.crypto === 'undefined') {
    // Use the browser's crypto API
    ;(window as unknown as { crypto: Crypto }).crypto =
      window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto
  }

  // Configure other Node.js globals that might be needed
  if (
    typeof (window as unknown as { setImmediate: unknown }).setImmediate ===
    'undefined'
  ) {
    ;(window as unknown as { setImmediate: typeof setTimeout }).setImmediate =
      setTimeout
  }

  if (
    typeof (window as unknown as { clearImmediate: unknown }).clearImmediate ===
    'undefined'
  ) {
    ;(
      window as unknown as { clearImmediate: typeof clearTimeout }
    ).clearImmediate = clearTimeout
  }
}

export default defineNuxtPlugin(() => {
  // Plugin is loaded
  console.log('Polyfills plugin loaded')
})
