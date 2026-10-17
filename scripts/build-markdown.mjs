// Dopo `astro build`: accanto a ogni pagina HTML indicizzabile scrive la versione Markdown (dist/<percorso>/index.md).
// La funzione edge netlify/edge-functions/markdown.mjs la serve quando un agente chiede `Accept: text/markdown`.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { htmlToMarkdown } from './html-to-markdown.mjs';

const DIST = process.argv[2] || 'dist';
if (!existsSync(DIST)) { console.error(`${DIST}/ non esiste: esegui prima astro build.`); process.exit(2); }

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const SKIP = /^\/(demo|kern|previews|agent|pf)\//; // demo e asset: non sono pagine del sito
let n = 0;
for (const file of walk(DIST).filter((f) => f.endsWith('index.html'))) {
  const rel = '/' + relative(DIST, file).split('\\').join('/');
  if (SKIP.test(rel)) continue;
  const url = 'https://puntoduestudio.it' + rel.replace(/index\.html$/, '');
  writeFileSync(file.replace(/index\.html$/, 'index.md'), htmlToMarkdown(readFileSync(file, 'utf8'), url));
  n++;
}
console.log(`Markdown: ${n} pagine`);
