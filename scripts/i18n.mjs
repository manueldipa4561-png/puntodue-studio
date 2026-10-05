// Genera le versioni inglese e tedesca del sito (/en/..., /de/...) dalle pagine italiane, che restano l'unica fonte.
// Gira da solo prima di `npm run dev` e `npm run build`. A mano: `node scripts/i18n.mjs`.
//
// Come funziona: per ogni lingua copia pagine e componenti in src/pages/<lingua> e src/components/<lingua> (ignorate da git),
// sostituisce ogni frase italiana con quella in src/i18n/<lingua>.txt e sistema link e import.
// Se cambi un testo italiano, aggiorna la riga `it:` corrispondente in en.txt e de.txt:
// lo script segnala le frasi del dizionario che non trova più.
// Nuova lingua: aggiungila a LOCALES, crea src/i18n/<lingua>.txt, aggiungi le cartelle a .gitignore e la lingua a Site.astro.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const LOCALES = ['en', 'de'];
const PAGES = ['index', 'web', 'social', 'info', 'faq', 'motion', 'servizi', 'siti-web', 'e-commerce', 'gestione-social', 'agenti-ai'];
const COMPONENTS = ['Chat', 'Sim', 'Bi', 'Profilo', 'Automazione', 'LangAuto', 'Servizio'];

// <lingua>.txt: coppie di righe "it: ..." / "<lingua>: ...", testo preso alla lettera (niente escape); # = commento
const loadPairs = (loc) => {
  const pairs = [];
  let it = null;
  for (const raw of readFileSync(`src/i18n/${loc}.txt`, 'utf8').split(/\r?\n/)) {
    if (raw.startsWith('it: ')) it = raw.slice(4);
    else if (raw.startsWith(`${loc}: `) && it !== null) { pairs.push([it, raw.slice(loc.length + 2)]); it = null; }
  }
  return pairs.sort((a, b) => b[0].length - a[0].length); // le frasi lunghe prima, così una breve non ne spezza una lunga
};

let staleTotal = 0;
for (const loc of LOCALES) {
  const pairs = loadPairs(loc);
  const used = new Set();
  const head = `// GENERATO da scripts/i18n.mjs: non modificare. Modifica la pagina italiana e src/i18n/${loc}.txt.\n`;

  const translate = (s) => {
    for (const [from, to] of pairs) if (s.includes(from)) { s = s.split(from).join(to); used.add(from); }
    return s;
  };
  // link interni verso la versione tradotta: "/" "/web" "/web/" "/social" "/info" "/faq" "/motion" (con eventuale #ancora).
  // Va fatto PRIMA di translate(): gli href scritti nel dizionario (es. il pulsante IT, href="/") restano com'è scritto.
  const links = (s) => s.replace(/href="\/(web|social|info|faq|motion|servizi|siti-web|e-commerce|gestione-social|agenti-ai)?(\/)?(#[\w-]*)?"/g, (_, p = '', sl = '', h = '') => `href="/${loc}/${p}${sl}${h}"`);
  const stamp = (s) => s.replace(/^---\r?\n/, '---\n' + head);

  rmSync(`src/pages/${loc}`, { recursive: true, force: true });
  rmSync(`src/components/${loc}`, { recursive: true, force: true });
  mkdirSync(`src/pages/${loc}`, { recursive: true });
  mkdirSync(`src/components/${loc}`, { recursive: true });

  for (const c of COMPONENTS) {
    const s = translate(links(readFileSync(`src/components/${c}.astro`, 'utf8')));
    writeFileSync(`src/components/${loc}/${c}.astro`, stamp(s));
  }
  for (const p of PAGES) {
    let s = translate(links(readFileSync(`src/pages/${p}.astro`, 'utf8')));
    s = s.replace(/from '\.\.\/components\//g, `from '../../components/${loc}/`).replace(/from '\.\.\/layouts\//g, "from '../../layouts/");
    writeFileSync(`src/pages/${loc}/${p}.astro`, stamp(s));
  }

  const stale = pairs.filter(([from]) => !used.has(from)).map(([from]) => from);
  console.log(`i18n ${loc}: ${PAGES.length} pagine e ${COMPONENTS.length} componenti, ${pairs.length} frasi nel dizionario.`);
  if (stale.length) {
    staleTotal += stale.length;
    console.error(`i18n ${loc}: ${stale.length} frasi del dizionario non trovate (testo italiano cambiato?):\n  - ${stale.join('\n  - ')}`);
  }
}
// Si ferma invece di avvisare e basta: un testo italiano cambiato senza aggiornare il dizionario manderebbe italiano in /en e /de.
// Per sbloccare a mano (es. una frase tolta di proposito): I18N_ALLOW_STALE=1 npm run build
if (staleTotal && !process.env.I18N_ALLOW_STALE) {
  console.error(`i18n: ${staleTotal} frasi non trovate, build fermata. Aggiorna le righe "it:" in src/i18n/*.txt.`);
  process.exit(1);
}
