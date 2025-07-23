// If you see a missing module error, run: npm install @solana/web3.js

declare global {
  interface Window {
    solana?: any;
  }
}

import { Connection, clusterApiUrl } from '@solana/web3.js';

class PhantomService {
  connection: Connection;

  constructor() {
    this.connection = new Connection(clusterApiUrl('mainnet-beta'));
  }

  async connectWallet(): Promise<string | null> {
    if (window.solana && window.solana.isPhantom) {
      console.log('Phantom wallet found.');
      try {
        const response = await window.solana.connect();
        console.log('Connected with Public Key:', response.publicKey.toString());
        return response.publicKey.toString();
      } catch (err) {
        console.error('Could not connect to Phantom Wallet:', err);
        return null;
      }
    } else {
      alert('Phantom Wallet is not installed.');
      return null;
    }
  }

  async signAndSend(message: string): Promise<Uint8Array | null> {
    if (!window.solana || !window.solana.isConnected) {
      const walletConnection = await this.connectWallet();
      if (!walletConnection) return null;
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
      console.log('Phantom Handshake');
      return signedMessage.signature;
    } catch (err) {
      console.error('Error signing message with Phantom Wallet:', err);
      return null;
    }
  }
}

const phantomService = new PhantomService();
export default phantomService; 