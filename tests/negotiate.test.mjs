import test from 'node:test';
import assert from 'node:assert/strict';
import { qualityFor, prefersMarkdown, markdownPath, negotiate, notFoundMarkdown } from '../netlify/edge-lib/negotiate.mjs';

const html = (status = 200, extra = {}) => () => Promise.resolve(new Response('<h1>x</h1>', { status, headers: { 'content-type': 'text/html; charset=utf-8', vary: 'Accept-Encoding', etag: '"a"', ...extra } }));
const req = (accept, path = '/faq/', method = 'GET') => new Request('https://puntoduestudio.it' + path, { method, headers: accept ? { accept } : {} });
const md = async () => '# FAQ\n\nBody';

test('qualityFor reads explicit types and q values only', () => {
  assert.equal(qualityFor('text/markdown', 'text/markdown'), 1);
  assert.equal(qualityFor('text/html;q=0.5, text/markdown;q=0.9', 'text/markdown'), 0.9);
  assert.equal(qualityFor('*/*', 'text/markdown'), 0);
  assert.equal(qualityFor(null, 'text/markdown'), 0);
});

test('prefersMarkdown: explicit markdown wins, browsers and wildcards stay HTML', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.8'), true);
  assert.equal(prefersMarkdown('text/html'), false);
  assert.equal(prefersMarkdown('text/html,application/xhtml+xml,*/*;q=0.8'), false);
  assert.equal(prefersMarkdown('*/*'), false);
  assert.equal(prefersMarkdown('text/markdown;q=0'), false);
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.5'), false);
});

test('markdownPath maps pages to their .md file', () => {
  assert.equal(markdownPath('/'), '/index.md');
  assert.equal(markdownPath('/web/'), '/web/index.md');
  assert.equal(markdownPath('/web'), '/web/index.md');
  assert.equal(markdownPath('/en/faq/'), '/en/faq/index.md');
});

test('Accept: text/markdown on a page returns Markdown with Vary: Accept', async () => {
  const res = await negotiate(req('text/markdown'), html(), md);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  assert.match(res.headers.get('vary'), /\bAccept\b/);
  assert.equal(res.headers.get('etag'), null);
  assert.equal(await res.text(), '# FAQ\n\nBody');
});

test('Accept: text/html keeps HTML and still sends Vary: Accept (kept next to Accept-Encoding)', async () => {
  const res = await negotiate(req('text/html'), html(), md);
  assert.match(res.headers.get('content-type'), /^text\/html/);
  assert.equal(res.headers.get('vary'), 'Accept-Encoding, Accept');
  assert.equal(await res.text(), '<h1>x</h1>');
});

test('missing page + Accept: text/markdown: still 404, Markdown body with links', async () => {
  const res = await negotiate(req('text/markdown', '/__nope'), html(404), md);
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  assert.match(res.headers.get('vary'), /\bAccept\b/);
  const body = await res.text();
  assert.ok(body.length > 20);
  assert.match(body, /\/__nope/);
  assert.match(body, /https:\/\/puntoduestudio\.it\/llms\.txt/);
  assert.match(body, /https:\/\/puntoduestudio\.it\/sitemap\.xml/);
});

test('missing page + Accept: text/html keeps the HTML 404', async () => {
  const res = await negotiate(req('text/html', '/__nope'), html(404), md);
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /^text\/html/);
});

test('non-HTML responses pass through untouched', async () => {
  const css = () => Promise.resolve(new Response('a{}', { headers: { 'content-type': 'text/css' } }));
  const res = await negotiate(req('text/markdown', '/a.css'), css, md);
  assert.equal(res.headers.get('content-type'), 'text/css');
  assert.equal(res.headers.get('vary'), null);
});

test('redirects and non-GET requests are not turned into Markdown', async () => {
  const redirect = await negotiate(req('text/markdown', '/web'), html(301, { location: '/web/' }), md);
  assert.equal(redirect.status, 301);
  assert.match(redirect.headers.get('content-type'), /^text\/html/);
  const post = await negotiate(req('text/markdown', '/faq/', 'POST'), html(), md);
  assert.match(post.headers.get('content-type'), /^text\/html/);
});

test('if the Markdown file is missing the HTML is served', async () => {
  const res = await negotiate(req('text/markdown'), html(), async () => null);
  assert.match(res.headers.get('content-type'), /^text\/html/);
  assert.match(res.headers.get('vary'), /\bAccept\b/);
});

test('HEAD returns Markdown headers without a body', async () => {
  const res = await negotiate(req('text/markdown', '/faq/', 'HEAD'), html(), md);
  assert.match(res.headers.get('content-type'), /^text\/markdown/);
  assert.equal(await res.text(), '');
});

test('notFoundMarkdown names the path and links to llms.txt', () => {
  assert.match(notFoundMarkdown('/x'), /^# Page not found/);
});
