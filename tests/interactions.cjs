// Dependency-free behavioral tests for the current shared production runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../site-v4.js'), 'utf8');

function fixture(width) {
  let document;
  const windowListeners = {};

  class Element {
    constructor(attrs = {}) {
      this.attrs = { ...attrs };
      this.listeners = {};
      this.children = [];
      const classes = new Set();
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        toggle: (name, force) => {
          if (force === undefined) force = !classes.has(name);
          if (force) classes.add(name); else classes.delete(name);
          return force;
        }
      };
      this.style = {
        setProperty(name, value) { this[name] = value; },
        removeProperty(name) { delete this[name]; }
      };
    }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn({ target: this, ...event }); }
    getAttribute(name) { return this.attrs[name] ?? null; }
    setAttribute(name, value) { this.attrs[name] = value; }
    removeAttribute(name) { delete this.attrs[name]; }
    toggleAttribute(name, force) { if (force) this.attrs[name] = ''; else delete this.attrs[name]; }
    focus() { document.activeElement = this; }
    querySelectorAll(selector) { return selector === 'a' ? this.children : []; }
  }

  const menu = new Element({ 'aria-expanded': 'false' });
  const nav = new Element();
  const navLink = new Element({ href: '/progetti.html' });
  nav.children = [navLink];
  const main = new Element();
  const footer = new Element();
  const body = new Element();
  const root = new Element();
  const year = new Element();

  const mobile = { matches: width <= 760, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } };
  const reduced = { matches: false, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } };

  document = new Element();
  document.body = body;
  document.documentElement = root;
  document.activeElement = null;
  document.hidden = false;
  document.head = { appendChild() {} };
  document.createElement = () => new Element();
  document.querySelector = selector => {
    if (selector === 'link[href="/spatial-2026.css"]') return new Element();
    if (selector === 'script[src="/experience-field.js"]') return new Element();
    if (selector === 'link[href="/site-v5.css"]') return null;
    if (selector === '.site-header') return null;
    if (selector === '.menu-toggle') return menu;
    if (selector === '.site-nav') return nav;
    if (selector === 'main') return main;
    if (selector === 'footer') return footer;
    if (selector === '#cookie-settings') return null;
    return null;
  };
  document.querySelectorAll = selector => {
    if (selector === '[data-year]') return [year];
    return [];
  };

  const window = {
    matchMedia: query => query.includes('max-width') ? mobile : reduced,
    scrollY: 240,
    pageYOffset: 240,
    addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); },
    scrollTo(options) { this.lastScrollTo = options; }
  };

  const context = {
    document,
    window,
    location: { href: 'https://puntoduestudio.it/metodo.html', protocol: 'https:', hostname: 'puntoduestudio.it', origin: 'https://puntoduestudio.it' },
    sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    URL,
    Date,
    encodeURIComponent,
    requestAnimationFrame(fn) { fn(); return 1; },
    cancelAnimationFrame() {},
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {},
    addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); },
    console,
  };

  vm.runInNewContext(source, context);

  return { document, window, menu, nav, navLink, main, footer, body, root, mobile, reduced, year, windowListeners };
}

for (const width of [360, 390, 430, 760, 761, 1024, 1440]) {
  const t = fixture(width);
  assert.equal(t.year.textContent, String(new Date().getFullYear()));

  t.menu.emit('click');
  assert.equal(t.menu.getAttribute('aria-expanded'), 'true');
  assert.equal(t.menu.getAttribute('aria-label'), 'Chiudi menu');
  assert(t.nav.classList.contains('open'));

  if (width <= 760) {
    assert.equal(t.main.getAttribute('inert'), '');
    assert.equal(t.footer.getAttribute('inert'), '');
    assert(t.root.classList.contains('menu-open'));
    assert(t.body.classList.contains('menu-open'));
    assert.equal(t.body.style.position, 'fixed');
    assert.equal(t.body.style.top, '-240px');
  } else {
    assert.equal(t.main.getAttribute('inert'), null);
    assert.equal(t.footer.getAttribute('inert'), null);
    assert(!t.root.classList.contains('menu-open'));
  }

  t.document.emit('keydown', { key: 'Escape' });
  assert.equal(t.menu.getAttribute('aria-expanded'), 'false');
  assert.equal(t.menu.getAttribute('aria-label'), 'Apri menu');
  assert.equal(t.document.activeElement, t.menu);
  assert.equal(t.main.getAttribute('inert'), null);
  assert.equal(t.footer.getAttribute('inert'), null);
  assert(!t.root.classList.contains('menu-open'));
  assert(!t.body.classList.contains('menu-open'));
  assert.equal(t.body.style.position, undefined);
  assert.equal(t.body.style.top, undefined);

  t.menu.emit('click');
  t.navLink.emit('click');
  assert.equal(t.menu.getAttribute('aria-expanded'), 'false');

  console.log(`PASS shared menu/scroll-lock/focus behavior at ${width}px`);
}
