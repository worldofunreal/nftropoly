/**
 * NFTROPOLY collection ownership layer.
 * Client-side inventory keyed by WOU-ID account (guest until signed in).
 */
import { wouAuth } from './wou-auth';

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
    new CustomEvent('nftropoly:collection-changed', { detail: { ids: read(currentKey()) } })
  );
}

export const collection = {
  list(): string[] {
    return read(currentKey());
  },
  has(id: string): boolean {
    return read(currentKey()).includes(id);
  },
  add(id: string): void {
    if (!this.has(id)) {
      write(currentKey(), [...read(currentKey()), id]);
      notify();
    }
  },
  addMany(ids: string[]): void {
    const cur = new Set(read(currentKey()));
    let changed = false;
    for (const id of ids) {
      if (!cur.has(id)) {
        cur.add(id);
        changed = true;
      }
    }
    if (changed) {
      write(currentKey(), [...cur]);
      notify();
    }
  },
};

// Merge guest inventory into the account on sign-in
window.addEventListener('wou:auth-changed', (e: any) => {
  const uid = e.detail?.user?.id;
  if (uid) {
    const guest = read(KEY('guest'));
    if (guest.length) {
      collection.addMany(guest);
      write(KEY('guest'), []);
    }
  }
  notify();
});

if (typeof window !== 'undefined') {
  (window as any).collection = collection;
}
