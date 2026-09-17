const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const policy = fs.readFileSync(path.join(root, 'cookie-policy.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'privacy-dialog.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'utility-routes.css'), 'utf8');
const typography = fs.readFileSync(path.join(root, 'typography.css'), 'utf8');
const caseRuntime = fs.readFileSync(path.join(root, 'case-runtime.js'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert(policy.includes('/utility-routes.css'));
assert(policy.includes('/site-v5.css'));
assert(policy.includes('/typography.css'));
assert(policy.includes('/privacy-dialog.js'));
assert(!policy.includes('/style.css'));
assert(!policy.includes('/polish.css'));
assert(!policy.includes('/experience.css'));
assert(!policy.includes('/experience.js'));
assert(policy.includes('id="cookie-settings"'));
assert(policy.includes('data-cookie-open'));
assert(policy.includes('non risultano attivi cookie di profilazione'));
assert(policy.includes('Nessun cookie opzionale, analytics o profilazione attivi.'));
assert(policy.includes('sessionStorage'), 'temporary case handoff storage must be disclosed');
assert(policy.includes('esclusivamente per coordinare il passaggio visivo'), 'technical purpose must be explained');
assert(policy.includes('rimosso dopo l’uso oppure quando non è più valido'), 'storage lifetime must be explained');
assert(policy.includes('non viene usato per analytics, pubblicità, profilazione'), 'non-tracking purpose must be explicit');
assert(policy.includes('Geist e IBM Plex Mono tramite Google Fonts'));
assert(policy.includes('model-viewer'));
assert(policy.includes('CloudFront'));
assert(policy.includes('Instagram'));
assert(policy.includes('WhatsApp'));
assert(sitemap.includes('https://puntoduestudio.it/cookie-policy.html'));
assert(typography.includes('family=Geist'));
assert(caseRuntime.includes('sessionStorage.setItem'), 'case handoff runtime still uses temporary session storage');
assert(caseRuntime.includes('sessionStorage.removeItem'), 'case handoff storage must be cleared');
assert(css.includes('.cookie-dialog'));
assert(css.includes('.policy-main'));
assert(css.includes('.policy-status'));
assert(css.includes('.policy-section-index'));
assert(css.includes('.not-found'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(script.includes('showModal'));
assert(script.includes('returnFocus'));
assert(script.includes('getBoundingClientRect'));

for (const source of [policy, script]) {
  assert(!/gtag\s*\(|googletagmanager|facebook\.net\/.*pixel|fbq\s*\(/i.test(source), 'unexpected tracking integration');
}
assert(!/localStorage|sessionStorage|document\.cookie/.test(script), 'privacy dialog must not introduce optional visitor state');

const makeHarness = ({ supportsDialog = true } = {}) => {
  const opener = {
    hidden: false,
    focused: false,
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    focus() { this.focused = true; }
  };
  const dialog = {
    open: false,
    listeners: {},
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
    getBoundingClientRect() { return { left: 10, right: 610, top: 10, bottom: 600 }; },
    close() {
      this.open = false;
      (this.listeners.close || []).forEach(fn => fn({ target: this }));
    }
  };
  if (supportsDialog) dialog.showModal = function () { this.open = true; };

  const classSet = new Set();
  const documentMock = {
    documentElement: { classList: { add: value => classSet.add(value) } },
    querySelector(selector) { return selector === '#cookie-settings' ? dialog : null; },
    querySelectorAll(selector) { return selector === '[data-cookie-open]' ? [opener] : []; }
  };

  vm.runInNewContext(script, { document: documentMock, console });
  return { opener, dialog, classSet };
};

{
  const { opener, dialog, classSet } = makeHarness();
  assert(classSet.has('privacy-dialog-ready'));
  opener.listeners.click();
  assert.equal(dialog.open, true, 'cookie dialog should open');

  (dialog.listeners.click || []).forEach(fn => fn({ clientX: 700, clientY: 700 }));
  assert.equal(dialog.open, false, 'outside click should close the dialog');
  assert.equal(opener.focused, true, 'focus should return to the trigger');
}

{
  const { opener } = makeHarness({ supportsDialog: false });
  assert.equal(opener.hidden, true, 'cookie opener should hide when native dialog is unsupported');
}

console.log('PASS utility privacy route, accurate temporary-storage disclosure, native dialog behavior, focus restoration and no optional tracking');
