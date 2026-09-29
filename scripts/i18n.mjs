// Genera la versione inglese del sito (/en/...) dalle pagine italiane, che restano l'unica fonte.
// Gira da solo prima di `npm run dev` e `npm run build`. A mano: `node scripts/i18n.mjs`.
//
// Come funziona: copia pagine e componenti in src/pages/en e src/components/en (ignorate da git),
// sostituisce ogni frase italiana con quella in src/i18n/en.txt e sistema link e import.
// Se cambi un testo italiano, aggiorna la riga `it:` corrispondente in en.txt:
// lo script segnala le frasi del dizionario che non trova più.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const PAGES = ['index', 'web', 'social', 'info', 'faq'];
const COMPONENTS = ['Chat', 'Sim', 'Bi', 'Profilo', 'Automazione'];
const HEAD = '// GENERATO da scripts/i18n.mjs: non modificare. Modifica la pagina italiana e src/i18n/en.txt.\n';

// en.txt: coppie di righe "it: ..." / "en: ...", testo preso alla lettera (niente escape); # = commento
const pairs = [];
let it = null;
for (const raw of readFileSync('src/i18n/en.txt', 'utf8').split(/\r?\n/)) {
  if (raw.startsWith('it: ')) it = raw.slice(4);
  else if (raw.startsWith('en: ') && it !== null) { pairs.push([it, raw.slice(4)]); it = null; }
}
pairs.sort((a, b) => b[0].length - a[0].length); // le frasi lunghe prima, così una breve non ne spezza una lunga
const used = new Set();

const translate = (s) => {
  for (const [from, to] of pairs) if (s.includes(from)) { s = s.split(from).join(to); used.add(from); }
  return s;
};
// link interni verso la versione inglese: "/" "/web" "/social" "/info" "/faq" (con eventuale #ancora)
const links = (s) => s.replace(/href="\/(web|social|info|faq)?(#[\w-]*)?"/g, (_, p = '', h = '') => `href="/en/${p}${h}"`);
const stamp = (s) => s.replace(/^---\r?\n/, '---\n' + HEAD);

rmSync('src/pages/en', { recursive: true, force: true });
rmSync('src/components/en', { recursive: true, force: true });
mkdirSync('src/pages/en', { recursive: true });
mkdirSync('src/components/en', { recursive: true });

for (const c of COMPONENTS) {
  const s = translate(readFileSync(`src/components/${c}.astro`, 'utf8'));
  writeFileSync(`src/components/en/${c}.astro`, stamp(links(s)));
}
for (const p of PAGES) {
  let s = translate(readFileSync(`src/pages/${p}.astro`, 'utf8'));
  s = s.replace(/from '\.\.\/components\//g, "from '../../components/en/").replace(/from '\.\.\/layouts\//g, "from '../../layouts/");
  writeFileSync(`src/pages/en/${p}.astro`, stamp(links(s)));
}

const stale = pairs.filter(([from]) => !used.has(from)).map(([from]) => from);
console.log(`i18n: ${PAGES.length} pagine e ${COMPONENTS.length} componenti in inglese, ${pairs.length} frasi nel dizionario.`);
if (stale.length) console.warn(`i18n: ${stale.length} frasi del dizionario non trovate (testo italiano cambiato?):\n  - ${stale.join('\n  - ')}`);
