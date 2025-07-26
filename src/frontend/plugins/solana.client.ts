import { Connection, clusterApiUrl } from '@solana/web3.js';

export default defineNuxtPlugin(() => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  return {
    provide: {
      solana: { connection }
    }
  };
}); 