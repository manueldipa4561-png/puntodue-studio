// Dependency-free behavioral tests. These simulate DOM events, not browser layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
function fixture(width, reduced = false) {
  let document;
  class Element {
    constructor(attrs = {}) {
      this.attrs = attrs; this.listeners = {}; this.children = []; this.value = '0'; this.dataset = {};
      const set = new Set();
      this.classList = { add: x => set.add(x), contains: x => set.has(x), toggle: (x, on) => on ? set.add(x) : set.delete(x) };
      this.props = {};
      this.style = { setProperty: (k,v) => this.props[k] = v, removeProperty: k => delete this.props[k] };
    }
    addEventListener(k, fn) { (this.listeners[k] ||= []).push(fn); }
    emit(k, event = {}) { for (const fn of this.listeners[k] || []) fn({ target: this, ...event }); }
    getAttribute(k) { return this.attrs[k] ?? null; }
    setAttribute(k, v) { this.attrs[k] = v; }
    removeAttribute(k) { delete this.attrs[k]; }
    toggleAttribute(k, on) { if (on) this.attrs[k] = ''; else delete this.attrs[k]; }
    focus() { document.activeElement = this; }
    querySelectorAll() { return this.children; }
    contains(el) { return this === el || this.children.includes(el); }
    closest(selector) { return selector.includes('project-card') ? this.card || null : null; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 328 }; }
  }
  const menu = new Element({ 'aria-expanded': 'false' }), nav = new Element();
  const target = new Element(), link = new Element({ href: '#contatti' }); nav.children = [link];
  const scene = new Element(), angle = new Element(), reset = new Element();
  const main = new Element(), footer = new Element();
  const previewCard = new Element(); previewCard.dataset.project = 'corriera';
  const previewImage = new Element(); previewImage.card = previewCard; previewImage.complete = false; previewImage.naturalWidth = 1;
  const media = { matches: width <= 600, addEventListener: (_, fn) => media.change = fn };
  const motion = { matches: reduced, addEventListener: (_, fn) => motion.change = fn };
  const nodes = { '.menu-toggle': menu, '#navigation': nav, '#contatti': target, '#year': new Element(), '.interactive-scene': scene, '#scene-angle': angle, '#scene-reset': reset, main, footer };
  document = new Element(); document.documentElement = new Element(); document.hidden = false;
  document.querySelector = key => nodes[key];
  document.querySelectorAll = selector => selector.includes('.project-card[data-project]') ? [previewImage] : [];
  const frames = new Map(); let counter = 0; const observers = [];
  const context = { document, window: { matchMedia: q => q.includes('reduced') ? motion : media }, Date,
    requestAnimationFrame: fn => { frames.set(++counter, fn); return counter; }, cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} unobserve() {} } };
  context.window.IntersectionObserver = context.IntersectionObserver;
  vm.runInNewContext(source, context);
  return { document, menu, nav, target, link, scene, angle, reset, media, motion, frames, observers, main, footer, previewCard, previewImage,
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); } };
}
for (const width of [320,375,390,430,768,1024,1440]) {
  const t = fixture(width);
  assert(t.document.documentElement.classList.contains('menu-ready'));
  t.menu.emit('click'); assert.equal(t.menu.getAttribute('aria-expanded'), 'true');
  if (width <= 600) { assert.equal(t.main.getAttribute('inert'), ''); assert.equal(t.footer.getAttribute('inert'), ''); }
  t.document.emit('keydown', { key: 'Escape' }); assert.equal(t.menu.getAttribute('aria-expanded'), 'false'); assert.equal(t.document.activeElement, t.menu);
  assert.equal(t.main.getAttribute('inert'), null); assert.equal(t.footer.getAttribute('inert'), null);
  t.menu.emit('click'); t.link.emit('click'); assert.equal(t.menu.getAttribute('aria-expanded'), 'false');
  if (width <= 600) { assert.equal(t.document.activeElement, t.target); t.target.emit('blur'); assert.equal(t.target.getAttribute('tabindex'), null); }
  t.previewImage.emit('error');
  assert.equal(t.previewImage.src, 'assets/corriera-preview.webp');
  assert.equal(t.previewImage.width, 1348); assert.equal(t.previewImage.height, 926);
  assert(t.previewCard.classList.contains('preview-fallback'));
  t.angle.value = '30'; t.angle.emit('input'); t.flush(); assert.equal(t.scene.props['--scene-y'], '30deg');
  t.reset.emit('click'); assert.equal(t.angle.value, '0'); assert.equal(t.scene.props['--scene-y'], undefined);
  t.angle.emit('input'); t.document.hidden = true; t.document.emit('visibilitychange'); assert.equal(t.frames.size, 0);
  t.document.hidden = false; t.observers.at(-1).fn([{ isIntersecting: false }]); t.angle.emit('input'); assert.equal(t.frames.size, 0);
  const reduced = fixture(width, true); reduced.angle.value = '30'; reduced.angle.emit('input'); assert.equal(reduced.frames.size, 0);
  console.log(`PASS simulated controls/fallback at ${width}px; NOT a visual layout test`);
}
