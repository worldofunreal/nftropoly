/**
 * World of Unreal Identity (wou-id) Client Script
 * Zero-dependency pure vanilla TypeScript client for static Astro sites.
 */

export interface WouIdentity {
  provider: string;
  external_id: string;
  linked_at: number;
}

export interface WouAccount {
  id: string;
  display_name: string;
  email: string | null;
  newsletter_opt_in: boolean;
  kind: 'human' | 'agent' | 'anonymous';
  linked_identities: WouIdentity[];
  created_at: number;
  updated_at: number;
}

export const ID_SERVER_URL = 'https://id.worldofunreal.com';

class WouAuthClient {
  private token: string | null = null;
  private user: WouAccount | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSession();
    }
  }

  public loadSession(): void {
    try {
      this.token = localStorage.getItem('wou_session_token');
      const userRaw = localStorage.getItem('wou_user_data');
      if (userRaw) {
        this.user = JSON.parse(userRaw);
      }
      this.notify();

      // Check profile validity in background
      if (this.token && this.user?.id) {
        this.fetchProfile(this.user.id);
      }
    } catch {
      // Ignore storage errors
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public getUser(): WouAccount | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  public openModal(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wou:open-modal'));
    }
  }

  public closeModal(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wou:close-modal'));
    }
  }

  public async requestOtp(email: string, newsletterOptIn = true): Promise<any> {
    const res = await fetch(`${ID_SERVER_URL}/api/v1/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        account_id: this.user?.id || null,
        context: 'nftropoly',
        newsletter_opt_in: newsletterOptIn,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch verification code.');
    }
    return data;
  }

  public async verifyOtp(email: string, code: string): Promise<any> {
    const res = await fetch(`${ID_SERVER_URL}/api/v1/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code,
        account_id: this.user?.id || null,
        context: 'nftropoly',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid verification code.');
    }

    this.setSession(data.session_token, data.account);
    this.closeModal();
    return data;
  }

  public async loginWithOAuth(provider: 'discord' | 'google' | 'twitter' | 'meta'): Promise<void> {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const res = await fetch(
      `${ID_SERVER_URL}/api/v1/auth/oauth/login/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to initiate ${provider} login.`);
    }

    if (data.authorization_url) {
      sessionStorage.setItem('wou_oauth_provider', provider);
      window.location.href = data.authorization_url;
    }
  }

  public async handleOAuthCallback(provider: string, code: string): Promise<any> {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const res = await fetch(`${ID_SERVER_URL}/api/v1/auth/oauth/callback/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri,
        account_id: this.user?.id || null,
        context: 'nftropoly',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'OAuth verification failed.');
    }

    this.setSession(data.session_token, data.account);
    return data;
  }

  public async loginWithSolana(): Promise<any> {
    const solana = (window as any).solana || (window as any).phantom?.solana;
    if (!solana || !solana.isPhantom) {
      throw new Error('Phantom wallet not detected. Please install Phantom from phantom.app.');
    }

    const resp = await solana.connect();
    const publicAddress = resp.publicKey.toString();

    // 1. Request challenge nonce
    const challengeRes = await fetch(`${ID_SERVER_URL}/api/v1/auth/web3/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chain: 'solana', public_address: publicAddress }),
    });
    const challengeData = await challengeRes.json();
    if (!challengeRes.ok) throw new Error(challengeData.error || 'Failed to request challenge.');

    // 2. Sign message in wallet
    const encodedMessage = new TextEncoder().encode(challengeData.message);
    const signedData = await solana.signMessage(encodedMessage, 'utf8');
    
    // Convert signature bytes to hex
    const signatureBytes = signedData.signature;
    const signatureHex = Array.from(signatureBytes)
      .map((b: any) => b.toString(16).padStart(2, '0'))
      .join('');

    // 3. Verify signature with WOU-ID
    const verifyRes = await fetch(`${ID_SERVER_URL}/api/v1/auth/web3/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain: 'solana',
        public_address: publicAddress,
        signature: signatureHex,
        message: challengeData.message,
        account_id: this.user?.id || null,
        context: 'nftropoly',
      }),
    });

    const data = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(data.error || 'Solana verification failed.');

    this.setSession(data.session_token, data.account);
    this.closeModal();
    return data;
  }

  public async loginWithEthereum(): Promise<any> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask / EVM wallet not detected. Please install MetaMask from metamask.io.');
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const publicAddress = accounts[0];
    if (!publicAddress) throw new Error('No Ethereum account selected.');

    // 1. Request challenge nonce
    const challengeRes = await fetch(`${ID_SERVER_URL}/api/v1/auth/web3/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chain: 'ethereum', public_address: publicAddress }),
    });
    const challengeData = await challengeRes.json();
    if (!challengeRes.ok) throw new Error(challengeData.error || 'Failed to request challenge.');

    // 2. Sign message in wallet (personal_sign)
    const signatureHex = await ethereum.request({
      method: 'personal_sign',
      params: [challengeData.message, publicAddress],
    });

    // 3. Verify signature with WOU-ID
    const verifyRes = await fetch(`${ID_SERVER_URL}/api/v1/auth/web3/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain: 'ethereum',
        public_address: publicAddress,
        signature: signatureHex,
        message: challengeData.message,
        account_id: this.user?.id || null,
        context: 'nftropoly',
      }),
    });

    const data = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(data.error || 'Ethereum verification failed.');

    this.setSession(data.session_token, data.account);
    this.closeModal();
    return data;
  }

  public logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('wou_session_token');
    localStorage.removeItem('wou_user_data');
    this.notify();
  }

  private setSession(token: string, user: WouAccount): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('wou_session_token', token);
    localStorage.setItem('wou_user_data', JSON.stringify(user));
    this.notify();
  }

  private async fetchProfile(id: string): Promise<void> {
    try {
      const res = await fetch(`${ID_SERVER_URL}/api/v1/user/profile/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (res.ok) {
        const fresh = await res.json();
        this.user = fresh;
        localStorage.setItem('wou_user_data', JSON.stringify(fresh));
        this.notify();
      } else if (res.status === 401 || res.status === 404) {
        this.logout();
      }
    } catch {
      // Keep cached session offline
    }
  }

  private notify(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('wou:auth-changed', {
          detail: { user: this.user, isAuthenticated: this.isAuthenticated() },
        })
      );
    }
  }
}

export const wouAuth = new WouAuthClient();
if (typeof window !== 'undefined') {
  (window as any).wouAuth = wouAuth;
}
