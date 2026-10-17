import { negotiate } from '../edge-lib/negotiate.mjs';

// Una sola funzione per tutte le pagine: aggiunge Vary: Accept all'HTML e serve il Markdown a chi lo chiede.
export default async (request, context) =>
  negotiate(request, () => context.next(), async (path) => {
    const res = await fetch(new URL(path, request.url), { headers: { accept: 'text/markdown' } });
    return res.ok ? res.text() : null;
  });

// Fuori restano file statici e demo: nessuna negoziazione, nessun costo di esecuzione.
export const config = {
  path: '/*',
  excludedPath: ['/_astro/*', '/demo/*', '/kern/*', '/previews/*', '/agent/*', '/pf/*', '/*.md', '/*.txt', '/*.xml', '/*.png', '/*.webp', '/*.svg', '/*.ico', '/*.jpg', '/*.mp4', '/*.woff2', '/*.js', '/*.css', '/*.json', '/*.webmanifest'],
};
