/**
 * NFTROPOLY ownership layer — server-authoritative instances.
 * Every owned copy is a registered instance (`{token}#{serial}`) with one
 * owner in WOU-ID Redb. Guests own nothing server-side: sign in to keep.
 */
import { wouAuth } from '@worldofunreal/id';
wouAuth.setDefaultContext('nftropoly');

const API = 'https://id.worldofunreal.com';

export interface Asset {
  id: string;
  token: string;
  collection: string;
  serial: number;
  owner: string;
  status: 'active' | 'frozen';
  metadata: { name: string; description: string; image: string; attributes: { trait_type: string; value: string }[]; collection: string };
  metadata_digest: string;
  minted_at: number;
}

let cache: Asset[] | null = null;

function notify() {
  window.dispatchEvent(
    new CustomEvent('nftropoly:collection-changed', { detail: { assets: collection.list() } })
  );
}

async function syncFromServer(): Promise<void> {
  const user = wouAuth.getUser();
  const token = wouAuth.getToken();
  if (!user || !token) {
    cache = [];
    notify();
    return;
  }
  try {
    const res = await fetch(`${API}/api/v1/assets/owner/${user.id}`);
    cache = res.ok ? await res.json() : [];
  } catch {
    cache = [];
  }
  notify();
}

export const collection = {
  list(): Asset[] {
    return cache ?? [];
  },
  ids(): string[] {
    return this.list().map((a) => a.id);
  },
  hasToken(token: string): boolean {
    return this.list().some((a) => a.token === token);
  },
  findByToken(token: string): Asset | undefined {
    return this.list().find((a) => a.token === token);
  },
  /** Mint the next serial of a design to the caller. Throws server message when exhausted. */
  async claim(token: string): Promise<Asset> {
    const t = wouAuth.getToken();
    if (!t) {
      wouAuth.openModal();
      throw new Error('Sign in to claim');
    }
    const res = await fetch(`${API}/api/v1/assets/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Claim failed');
    await this.refresh();
    return data as Asset;
  },
  async transfer(id: string, to: string): Promise<void> {
    const t = wouAuth.getToken();
    if (!t) {
      wouAuth.openModal();
      throw new Error('Sign in to transfer');
    }
    const res = await fetch(`${API}/api/v1/assets/transfer/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ to }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transfer failed');
    await this.refresh();
  },
  async refresh() {
    await syncFromServer();
  },
};

if (typeof window !== 'undefined') {
  syncFromServer();
  window.addEventListener('wou:auth-changed', async () => {
    await syncFromServer();
  });
  (window as any).collection = collection;
}
