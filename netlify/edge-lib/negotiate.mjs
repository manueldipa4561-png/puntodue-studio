// Content negotiation HTML ↔ Markdown (acceptmarkdown.com). Puro JavaScript senza dipendenze:
// gira sia nella funzione edge di Netlify (Deno) sia nei test (Node).

const SITE = 'https://puntoduestudio.it';
const MD_TYPE = 'text/markdown; charset=utf-8';

/** Qualità (q) con cui `accept` chiede `type`; 0 se non è elencato esplicitamente. `*​/*` e `text/*` non contano. */
export const qualityFor = (accept, type) => {
  for (const part of String(accept || '').split(',')) {
    const [name, ...params] = part.trim().toLowerCase().split(';');
    if (name.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    const v = q ? Number(q.slice(2)) : 1;
    return Number.isFinite(v) ? v : 0;
  }
  return 0;
};

/** Markdown solo se è chiesto esplicitamente e con priorità almeno pari a text/html (browser e `*​/*` restano HTML). */
export const prefersMarkdown = (accept) => {
  const md = qualityFor(accept, 'text/markdown');
  return md > 0 && md >= qualityFor(accept, 'text/html');
};

/** Percorso del file Markdown che corrisponde a una pagina: "/" → "/index.md", "/web/" e "/web" → "/web/index.md". */
export const markdownPath = (pathname) => {
  if (pathname.endsWith('.html')) return pathname.replace(/\.html$/, '.md');
  return (pathname.endsWith('/') ? pathname : pathname + '/') + 'index.md';
};

export const notFoundMarkdown = (pathname) => `# Page not found (404)

The page \`${pathname}\` does not exist on puntoduestudio.it. It may have been moved or the address may be mistyped.

Where to go next:

- [Home](${SITE}/): what Punto Due Studio does
- [Agent guide (llms.txt)](${SITE}/llms.txt): what the site offers and when to use it
- [Sitemap](${SITE}/sitemap.xml): every public page
- [Services](${SITE}/servizi/): websites, e-commerce, social media, AI agents, 3D video
- [Contact](${SITE}/info/): projects@puntoduestudio.it

---

Pagina non trovata: l'indirizzo \`${pathname}\` non esiste. Parti dalla [home](${SITE}/) o dalla [mappa del sito](${SITE}/sitemap.xml).
`;

const withVaryAccept = (headers) => {
  const out = new Headers(headers);
  const vary = (out.get('vary') || '').split(',').map((v) => v.trim()).filter(Boolean);
  if (!vary.some((v) => v === '*' || v.toLowerCase() === 'accept')) vary.push('Accept');
  out.set('vary', vary.join(', '));
  return out;
};

/**
 * `next()` restituisce la risposta normale del sito; `getMarkdown(path)` il testo Markdown della pagina (o null).
 * - Risposte HTML: sempre `Vary: Accept` (la risposta cambia con l'header Accept).
 * - Accept: text/markdown su una pagina 200: Markdown con Content-Type text/markdown.
 * - Accept: text/markdown su un 404: stesso status 404, corpo Markdown con i link per ripartire.
 */
export const negotiate = async (request, next, getMarkdown) => {
  const res = await next();
  if (!['GET', 'HEAD'].includes(request.method)) return res;
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;

  const headers = withVaryAccept(res.headers);
  if (!prefersMarkdown(request.headers.get('accept')) || (res.status !== 200 && res.status !== 404)) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }

  const { pathname } = new URL(request.url);
  const text = res.status === 404 ? notFoundMarkdown(pathname) : await getMarkdown(markdownPath(pathname));
  if (text == null) return new Response(res.body, { status: res.status, statusText: res.statusText, headers });

  for (const h of ['content-length', 'content-encoding', 'etag', 'last-modified']) headers.delete(h);
  headers.set('content-type', MD_TYPE);
  headers.set('x-content-type-options', 'nosniff');
  return new Response(request.method === 'HEAD' ? null : text, { status: res.status, headers });
};
