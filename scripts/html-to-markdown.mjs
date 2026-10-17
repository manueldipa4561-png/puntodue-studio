// Converte una pagina compilata (dist/**/index.html) in Markdown per gli agenti: solo il contenuto di <main>,
// senza grafica, widget interattivi e testi duplicati in un'altra lingua. Usato da build-markdown.mjs.
import TurndownService from 'turndown';

const SITE = 'https://puntoduestudio.it';
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'CANVAS', 'BUTTON', 'IFRAME', 'SELECT', 'INPUT', 'TEXTAREA', 'NOSCRIPT', 'TEMPLATE', 'IMG', 'VIDEO']);

export const pageMeta = (html) => ({
  lang: (html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || 'it',
  title: decode((html.match(/<title>(.*?)<\/title>/s) || [])[1] || ''),
  description: decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''),
});

const decode = (s) => s.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const service = (lang) => {
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', linkStyle: 'inlined' });
  // addRule e non remove(): le regole standard di Turndown (p, a, h1...) hanno la precedenza su remove()
  const drop = (node) => {
    if (DROP_TAGS.has(node.nodeName)) return true;
    const get = (a) => (node.getAttribute ? node.getAttribute(a) : null);
    if (get('aria-hidden') === 'true' || get('hidden') !== null) return true;
    const l = get('lang');
    return Boolean(l) && l.slice(0, 2) !== lang; // testo doppio IT/EN: resta solo la lingua della pagina
  };
  td.addRule('absoluteLinks', {
    filter: (node) => node.nodeName === 'A' && node.getAttribute('href'),
    replacement: (content, node) => {
      const text = content.replace(/\s+/g, ' ').trim();
      if (!text) return '';
      const href = node.getAttribute('href');
      const abs = href.startsWith('/') ? SITE + href : href;
      return `[${text}](${abs}) `;
    },
  });
  td.addRule('drop', { filter: drop, replacement: () => '' });
  return td;
};

/** HTML di una pagina → Markdown. `url` è l'indirizzo pubblico (canonico) della pagina. */
export const htmlToMarkdown = (html, url) => {
  const { lang, title, description } = pageMeta(html);
  const main = (html.match(/<main\b[^>]*>([\s\S]*)<\/main>/) || [])[1] || '';
  const body = service(lang)
    .turndown(main)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  // la descrizione va subito sotto l'H1; se nel contenuto non c'è un H1, il titolo della pagina fa da H1
  const lead = description ? `> ${description}\n\n` : '';
  const h1 = body.match(/^# .*\n+/);
  const text = h1 ? h1[0] + lead + body.slice(h1[0].length) : `# ${title}\n\n${lead}${body}`;
  return `${text.replace(/ +\n/g, '\n')}\n\n---\n\nSource: ${url}\nSite: ${SITE}/ · Agent guide: ${SITE}/llms.txt · Sitemap: ${SITE}/sitemap.xml\n`;
};
