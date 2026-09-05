/**
 * NFTROPOLY collection ownership layer — hybrid authoritative.
 * Authenticated: WOU-ID Redb via id.worldofunreal.com (Bearer).
 * Guest: localStorage keyed by guest.
 */
import { wouAuth } from '@worldofunreal/id-sdk';
wouAuth.setDefaultContext('nftropoly');

const API = 'https://id.worldofunreal.com';
const KEY = (uid: string) => `nftropoly_collection_${uid}`;
const currentKey = () => KEY(wouAuth.getUser()?.id || 'guest');

function read(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}
function write(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}
function notify() {
  window.dispatchEvent(
    new CustomEvent('nftropoly:collection-changed', { detail: { ids: collection.list() } })
  );
}

// In-memory authoritative cache (synced from server when signed in)
let cache: string[] | null = null;

async function syncFromServer(): Promise<void> {
  const token = wouAuth.getToken();
  if (!token) {
    cache = read(currentKey());
    notify();
    return;
  }
  try {
    const res = await fetch(`${API}/api/v1/inventory/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      cache = data.card_ids || [];
      write(currentKey(), cache);
    } else {
      cache = read(currentKey());
    }
  } catch {
    cache = read(currentKey());
  }
  notify();
}

export const collection = {
  list(): string[] {
    if (cache !== null) return cache;
    return read(currentKey());
  },
  has(id: string): boolean {
    return this.list().includes(id);
  },
  async add(id: string): Promise<void> {
    await this.addMany([id]);
  },
  async addMany(ids: string[]): Promise<void> {
    const token = wouAuth.getToken();
    if (token) {
      try {
        const res = await fetch(`${API}/api/v1/inventory/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ card_ids: ids }),
        });
        if (res.ok) {
          const data = await res.json();
          cache = data.card_ids;
          write(currentKey(), cache);
          notify();
          return;
        }
      } catch {}
    }
    // Fallback: local guest
    const cur = new Set(read(currentKey()));
    let changed = false;
    for (const id of ids) {
      if (!cur.has(id)) {
        cur.add(id);
        changed = true;
      }
    }
    if (changed) {
      const next = [...cur];
      cache = next;
      write(currentKey(), next);
      notify();
    }
  },
  async refresh() {
    await syncFromServer();
  },
};

// Initial sync + on auth change (merge guest → server)
if (typeof window !== 'undefined') {
  syncFromServer();
  window.addEventListener('wou:auth-changed', async (e: any) => {
    const uid = e.detail?.user?.id;
    if (uid) {
      const guest = read(KEY('guest'));
      if (guest.length) {
        try {
          const token = wouAuth.getToken();
          if (token) {
            await fetch(`${API}/api/v1/inventory/collect`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ card_ids: guest }),
            });
          }
        } catch {}
        write(KEY('guest'), []);
      }
    }
    await syncFromServer();
  });
  (window as any).collection = collection;
}
