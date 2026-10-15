// Miniature 480px delle foto demo usate nel mockup /profilo (le originali, 1400px, restano per i siti demo). Uso: node scripts/thumbs.mjs
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
const MAP = { hair: 'hair', brace: 'brace', innesto: 'innesto' };
for (const [k, d] of Object.entries(MAP)) {
  mkdirSync(`public/pf/${k}`, { recursive: true });
  for (const f of readdirSync(`public/demo/${d}/img`).filter((x) => x.endsWith('.webp')))
    await sharp(`public/demo/${d}/img/${f}`).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 74 }).toFile(`public/pf/${k}/${f}`);
}
