// Controlli sul sito compilato (dist/): `npm run build && npm run audit`. Esce con errore se trova un problema.
// Link e ancore interni, canonical, hreflang reciproci, sitemap, titolo/descrizione/H1, JSON-LD, demo in noindex
// e italiano rimasto in /en e /de (euristica sulle parole italiane non ambigue: avvisa, non può dimostrare che sia tutto tradotto).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
if (!existsSync(DIST)) { console.error('dist/ non esiste: esegui prima `npm run build`.'); process.exit(2); }

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(DIST).map((p) => '/' + relative(DIST, p).split('\\').join('/'));
const fileSet = new Set(files);
const pages = new Map(files.filter((f) => f.endsWith('.html')).map((f) => [f.replace(/index\.html$/, ''), readFileSync(join(DIST, f), 'utf8')]));
const ids = new Map([...pages].map(([u, h]) => [u, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

const isDemo = (u) => u.startsWith('/demo/') || u.startsWith('/kern/');
const isVerification = (u) => /^\/google[0-9a-f]+\.html$/.test(u);
const isNoindex = (h) => /<meta name="robots" content="[^"]*noindex/i.test(h);
const exists = (href) => { const p = href.split(/[?#]/)[0]; return !p || fileSet.has(p.endsWith('/') ? p + 'index.html' : p) || fileSet.has(p + '/index.html'); };
const alternates = (h) => Object.fromEntries([...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https:\/\/puntoduestudio\.it([^"]*)"/g)].map((m) => [m[1], m[2]]));

const problems = [];
const bad = (u, msg) => problems.push(`${u}  ${msg}`);

for (const [u, h] of pages) {
  if (isVerification(u)) continue;
  if (isDemo(u)) { if (!isNoindex(h)) bad(u, 'demo senza noindex'); continue; }
  const noindex = isNoindex(h);
  const title = (h.match(/<title>(.*?)<\/title>/s) || [])[1];
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) bad(u, 'manca <title>'); else if (title.length > 65) bad(u, `titolo di ${title.length} caratteri (max 65)`);
  if (!noindex) {
    if (!desc || desc.length < 70 || desc.length > 165) bad(u, `descrizione di ${desc ? desc.length : 0} caratteri (70-165)`);
    if (!/<link rel="canonical" href="[^"]+"/.test(h)) bad(u, 'manca il canonical');
  }
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) bad(u, `${h1} H1 (deve essere 1)`);
  for (const [, j] of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(j); } catch (e) { bad(u, `JSON-LD non valido: ${e.message}`); }
  }
  for (const [, href] of h.matchAll(/\shref="(\/[^"]*|#[^"]+)"/g)) {
    const [path, anchor] = href.split('#');
    const target = href.startsWith('#') ? u : path;
    if (!href.startsWith('#') && !exists(path)) { bad(u, `link interno rotto: ${href}`); continue; }
    const targetPage = pages.has(target) ? target : pages.has(target + '/') ? target + '/' : null;
    if (anchor && targetPage && !ids.get(targetPage).has(anchor)) bad(u, `ancora mancante: ${href}`);
  }
  const alt = alternates(h);
  for (const [lang, path] of Object.entries(alt)) {
    if (!pages.has(path)) { bad(u, `hreflang ${lang} punta a una pagina che non esiste: ${path}`); continue; }
    if (!Object.values(alternates(pages.get(path))).includes(u)) bad(u, `hreflang non reciproco con ${path}`);
  }
}

// sitemap: ogni URL esiste e ogni pagina indicizzabile c'è
const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const inMap = new Set([...sitemap.matchAll(/<loc>https:\/\/puntoduestudio\.it([^<]*)<\/loc>/g)].map((m) => m[1]));
for (const u of inMap) if (!pages.has(u)) bad('sitemap.xml', `URL che non esiste: ${u}`); else if (isNoindex(pages.get(u))) bad('sitemap.xml', `URL in noindex: ${u}`);
for (const [u, h] of pages) if (!isDemo(u) && !isVerification(u) && !isNoindex(h) && !inMap.has(u)) bad(u, 'pagina indicizzabile non presente nella sitemap');

// italiano rimasto nelle versioni tradotte (lo slot italiano nascosto dei <Bi> e gli script non contano)
const ITALIANO = new Set('della delle degli nella nelle questo questa tutti senza dalla tuo tua tuoi siamo abbiamo cosa dove mentre dopo molto negozio scrivici raccontaci preventivo gratuito chiedi perché così già'.split(' '));
for (const [u, h] of pages) {
  if (!/^\/(en|de)\//.test(u)) continue;
  const body = h.replace(/<(script|style)\b.*?<\/\1>/gs, '').replace(/<span lang="it"[^>]*>.*?<\/span>/gs, '');
  const attrs = [...body.matchAll(/\s(?:alt|aria-label|title|content|placeholder)="([^"]{4,})"/g)].map((m) => m[1]);
  const text = body.replace(/<[^>]+>/g, '\n').split('\n').map((s) => s.trim()).filter(Boolean);
  const hit = [...text, ...attrs].filter((s) => (s.toLowerCase().match(/[a-zàèéìòù]+/g) || []).some((w) => ITALIANO.has(w)));
  if (hit.length) bad(u, `italiano rimasto (${hit.length}): "${hit[0].slice(0, 80)}"`);
}

if (problems.length) { console.error(`audit: ${problems.length} problemi\n  - ${problems.join('\n  - ')}`); process.exit(1); }
console.log(`audit: ok (${pages.size} pagine, ${inMap.size} URL in sitemap)`);
