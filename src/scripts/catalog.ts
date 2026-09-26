/**
 * Build-time catalog. WOU-ID is the authority: collections and cards are
 * fetched from the server during the build so every registered token gets a
 * page and future series appear without touching this repo. The local JSON
 * files are editorial overlays (lore copy, traits, serials) and the offline
 * fallback if the server is unreachable at build time.
 */
import genesis from '../data/genesis.json';
import sow from '../data/sow.json';
import rush from '../data/rush.json';

const API = 'https://id.worldofunreal.com';

export interface Card {
  id: string;
  series: string;
  num: number;
  name: string;
  title?: string;
  description: string;
  image: string;
  role?: string;
  faction?: string;
  civ?: string;
  type?: string;
  rarity: string;
  pop: number;
  edition: number;
  serial: number;
}

export interface Series {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export interface Catalog {
  cards: Card[];
  series: Series[];
}

const LOCAL: Card[] = [...genesis, ...sow, ...rush] as unknown as Card[];

const LOCAL_SERIES: Series[] = [
  { id: 'genesis', name: 'Cosmicrafts Genesis', symbol: 'GEN', description: 'Ships, titans and outlaws of the Dark Rift.', image: '' },
  { id: 'sow', name: 'Shadows of War Commanders', symbol: 'SOW', description: 'The twelve great commanders of history.', image: '' },
  { id: 'rush', name: 'Cosmic Rush', symbol: 'RUSH', description: 'Logros de Cosmic Rush: cada victoria deja carta.', image: '' },
];

function merge(tok: any, col: Series): Card {
  const base = LOCAL.find((c) => c.id === tok.id);
  const attrs: Record<string, string> = Object.fromEntries(
    (tok.metadata?.attributes ?? []).map((a: any) => [a.trait_type, a.value])
  );
  return {
    id: tok.id,
    series: col.id,
    num: base?.num ?? 0,
    name: base?.name || tok.metadata?.name || tok.id,
    title: base?.title,
    description: base?.description || tok.metadata?.description || '',
    image: tok.metadata?.image || base?.image || '',
    role: base?.role || attrs.Role,
    faction: base?.faction || attrs.Faction,
    civ: base?.civ || attrs.Civilization,
    type: base?.type || attrs.Type,
    rarity: base?.rarity || attrs.Rarity || 'Common',
    pop: tok.minted ?? base?.pop ?? 0,
    edition: tok.max_supply || base?.edition || 0,
    serial: base?.serial ?? (tok.minted || 1),
  };
}

let memo: Promise<Catalog> | null = null;

export function catalog(): Promise<Catalog> {
  memo ??= build();
  return memo;
}

async function build(): Promise<Catalog> {
  try {
    const cRes = await fetch(`${API}/api/v1/assets/collections`);
    if (!cRes.ok) throw new Error(`collections HTTP ${cRes.status}`);
    const series: Series[] = await cRes.json();
    const fetched = await Promise.all(
      series.map(async (col) => {
        const t = await fetch(`${API}/api/v1/assets/collections/${col.id}/tokens`);
        if (!t.ok) throw new Error(`tokens ${col.id} HTTP ${t.status}`);
        return ((await t.json()) as any[]).map((tok) => merge(tok, col));
      })
    );
    const cards = fetched.flat();
    // Editorial entries not registered server-side yet still get a page.
    for (const base of LOCAL) {
      if (!cards.some((c) => c.id === base.id)) cards.push(base);
    }
    cards.sort((a, b) => a.series.localeCompare(b.series) || a.num - b.num || a.id.localeCompare(b.id));
    series.sort((a, b) => a.id.localeCompare(b.id));
    return { cards, series };
  } catch (err) {
    console.warn('[catalog] WOU-ID unreachable at build time, using local JSON:', err);
    return { cards: LOCAL, series: LOCAL_SERIES };
  }
}
