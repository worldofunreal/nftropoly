import genesis from '../data/genesis.json';
import sow from '../data/sow.json';

const SITE = 'https://nftropoly.com';
const STATIC = ['', '/showcase', '/trades', '/vault', '/me', '/privacy', '/terms', '/collections/genesis', '/collections/sow'];

export function GET() {
  const urls = [
    ...STATIC.map((p) => `${SITE}${p === '' ? '/' : p}/`.replace(/\/+/g, '/').replace('https:/', 'https://')),
    ...[...genesis, ...sow].map((c) => `${SITE}/card/${c.id}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
