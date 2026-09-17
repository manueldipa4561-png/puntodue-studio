const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const policy = fs.readFileSync(path.join(root, 'cookie-policy.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'experience.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'experience.css'), 'utf8');
const sharedJs = fs.readFileSync(path.join(root, 'site-v4.js'), 'utf8');
const typeCss = fs.readFileSync(path.join(root, 'typography.css'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

// Homepage uses the current shared production stack; the policy page retains its dedicated privacy shell.
assert(index.includes('/site-v4.css'));
assert(index.includes('/site-v4.js'));
assert(index.includes('id="cookie-settings"'));
assert(index.includes('data-cookie-open'));
assert(index.includes('/cookie-policy.html'));
assert(policy.includes('/experience.css'));
assert(policy.includes('/experience.js'));
assert(policy.includes('/typography.css'));
assert(policy.includes('id="cookie-settings"'));
assert(policy.includes('non sono attivi cookie opzionali'));
assert(policy.includes('Geist e IBM Plex Mono tramite Google Fonts'));
assert(sitemap.includes('https://puntoduestudio.it/cookie-policy.html'));
assert(sharedJs.includes("'/typography.css'"));
assert(sharedJs.includes("'/motion.js'"));
assert(typeCss.includes('family=Geist'));
assert(typeCss.includes('@media(prefers-reduced-motion:reduce)'));
assert(js.includes('showModal'));
assert(js.includes('finePointer'));
assert(js.includes('prefers-reduced-motion'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(css.includes('.cookie-fab'));

for (const source of [index, policy, js, sharedJs]) {
  assert(!/gtag\s*\(|googletagmanager|facebook\.net\/.*pixel|fbq\s*\(/i.test(source), 'unexpected tracking integration');
}
// The dedicated privacy shell itself stores no optional visitor state.
for (const source of [js, index]) {
  assert(!/localStorage|sessionStorage|document\.cookie/.test(source), 'optional state storage introduced unexpectedly');
}
console.log('PASS current production stack, semantic typography module, reduced-motion fallback, cookie UI/policy, sitemap and no optional tracking');

// Behavioral smoke test for the native privacy dialog and focus restoration.
const vm = require('node:vm');
const listeners = {};
const opener = {
  hidden: false,
  focused: false,
  addEventListener(type, fn) { (this.listeners ||= {})[type] = fn; },
  focus() { this.focused = true; }
};
const dialog = {
  open: false,
  listeners: {},
  showModal() { this.open = true; },
  close() { this.open = false; (this.listeners.close || []).forEach(fn => fn({ target: this })); },
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
  getBoundingClientRect() { return { left: 10, right: 610, top: 10, bottom: 600 }; }
};
const rootClassSet = new Set();
const rootEl = { classList: { add: x => rootClassSet.add(x) } };
const media = () => ({ matches: false, addEventListener() {} });
const documentMock = {
  documentElement: rootEl,
  hidden: false,
  querySelector(selector) {
    if (selector === '#cookie-settings') return dialog;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === '[data-cookie-open]') return [opener];
    return [];
  },
  addEventListener(type, fn) { listeners[type] = fn; }
};
const context = {
  document: documentMock,
  window: { matchMedia: media, innerHeight: 800, addEventListener() {} },
  requestAnimationFrame: fn => { fn(); return 1; },
  cancelAnimationFrame() {},
  console
};
vm.runInNewContext(js, context);
assert(rootClassSet.has('experience-ready'));
opener.listeners.click();
assert.equal(dialog.open, true, 'cookie dialog should open');
dialog.close();
assert.equal(opener.focused, true, 'focus should return to the trigger');
console.log('PASS cookie dialog open/close and focus restoration');
