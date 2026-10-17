// Controlla il sito compilato: `npm run build && npm test`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { negotiate } from '../netlify/edge-lib/negotiate.mjs';
import { htmlToMarkdown } from '../scripts/html-to-markdown.mjs';

const built = existsSync('dist/index.html');
const opts = { skip: built ? false : 'dist/ mancante: esegui npm run build' };
const read = (p) => readFileSync('dist' + p, 'utf8');
const text = (h) => h.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('home: raw HTML has an H1, 500+ chars of content and a content ratio of at least 5%', opts, () => {
  const h = read('/index.html');
  assert.equal((h.match(/<h1[\s>]/g) || []).length, 1);
  const t = text(h);
  assert.ok(t.length >= 500, `solo ${t.length} caratteri`);
  assert.ok(t.length / h.length >= 0.05, `rapporto ${(t.length / h.length * 100).toFixed(1)}%`);
});

test('home: each tool icon is defined once and reused with <use>', opts, () => {
  const h = read('/index.html');
  assert.equal((h.match(/<symbol /g) || []).length, 11);
  assert.ok((h.match(/<use href="#ic-/g) || []).length >= 22);
});

test('home titles keep the brand first in every language', opts, () => {
  for (const p of ['/index.html', '/en/index.html', '/de/index.html']) assert.match(read(p), /<title>Punto Due Studio — /);
});

test('every sitemap page has a Markdown twin with an H1 and a source line', opts, () => {
  const urls = [...read('/sitemap.xml').matchAll(/<loc>https:\/\/puntoduestudio\.it([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.length > 10);
  for (const u of urls) {
    assert.ok(existsSync('dist' + u + 'index.md'), `manca ${u}index.md`);
    const md = read(u + 'index.md');
    assert.match(md, /^# \S/m, u);
    assert.ok(md.includes('Source: https://puntoduestudio.it' + u), u);
    assert.ok(!/<(svg|script|div)/.test(md), `HTML rimasto in ${u}`);
  }
});

test('Markdown keeps only the page language (no duplicated IT/EN text)', opts, () => {
  const md = read('/web/index.md');
  assert.ok(md.includes('accesso anticipato') && !md.includes('early access'));
});

test('end to end on the built files: Accept: text/markdown → Markdown, text/html → HTML, unknown → 404 Markdown', opts, async () => {
  const serve = (path, accept) => {
    const file = path === '/' ? '/index.html' : path.endsWith('/') ? path + 'index.html' : null;
    const next = () => Promise.resolve(file && existsSync('dist' + file)
      ? new Response(read(file), { headers: { 'content-type': 'text/html; charset=utf-8', vary: 'Accept-Encoding' } })
      : new Response(read('/404.html'), { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } }));
    return negotiate(new Request('https://puntoduestudio.it' + path, { headers: { accept } }), next, async (p) => (existsSync('dist' + p) ? read(p) : null));
  };
  const m = await serve('/', 'text/markdown');
  assert.match(m.headers.get('content-type'), /^text\/markdown/);
  assert.match(m.headers.get('vary'), /Accept/);
  assert.match(await m.text(), /^# Punto Due Studio/);
  const h = await serve('/', 'text/html');
  assert.match(h.headers.get('content-type'), /^text\/html/);
  assert.match(h.headers.get('vary'), /Accept/);
  const n = await serve('/__ora-404-probe-x', 'text/markdown');
  assert.equal(n.status, 404);
  assert.match(n.headers.get('content-type'), /^text\/markdown/);
});

test('llms.txt follows llmstxt.org and has a when-to-use section', opts, () => {
  const t = read('/llms.txt');
  assert.match(t, /^# Punto Due Studio\n\n> /);
  assert.match(t, /^## When to use this site$/m);
  assert.match(t, /^## How an agent should engage$/m);
  for (const [, u] of t.matchAll(/\]\((https:\/\/puntoduestudio\.it[^)#]*)\)/g)) {
    const p = u.replace('https://puntoduestudio.it', '') || '/';
    assert.ok(existsSync('dist' + p) || existsSync('dist' + p + 'index.html'), `link rotto in llms.txt: ${u}`);
  }
});

test('htmlToMarkdown drops hidden and decorative nodes', () => {
  const md = htmlToMarkdown('<html lang="it"><head><title>T</title></head><body><main><h1>Ciao</h1><span aria-hidden="true">X</span><svg><path/></svg><button>no</button><p lang="en">english</p><p>testo <a href="/web/">vai</a></p></main></body></html>', 'https://puntoduestudio.it/');
  assert.ok(md.startsWith('# Ciao'));
  for (const bad of ['X\n', 'no', 'english', '<svg']) assert.ok(!md.includes(bad), bad);
  assert.ok(md.includes('[vai](https://puntoduestudio.it/web/)'));
});
