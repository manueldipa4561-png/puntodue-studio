// Livello UI condiviso (home + pagine interne): pulsanti, testata, menu, barra CTA, titoli. Tutto con anime.js, nessun orologio reale.
import { animate, splitText, stagger, spring } from 'animejs';
import { siWhatsapp } from 'simple-icons';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

// anello di focus solo per chi usa la tastiera
addEventListener('keydown', (e) => { if (e.key === 'Tab') root.classList.add('kbd'); });
addEventListener('pointerdown', () => root.classList.remove('kbd'));

/* ---------- pulsanti ---------- */
const svg = (inner: string, fill = false) => `<svg viewBox="0 0 24 24" ${fill ? 'class="fill"' : 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"'} aria-hidden="true">${inner}</svg>`;
// il simbolo della lente dice cosa succede al click: freccia = vai, ↗ = si apre fuori, play = guarda, WhatsApp, email
const GLYPHS: Record<string, string> = {
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  ext: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  play: svg('<path d="M8 5.5v13l11-6.5z"/>', true),
  wa: svg(`<path d="${siWhatsapp.path}"/>`, true),
  mail: svg('<path d="M4 6h16v12H4zM4 7.5l8 6 8-6"/>'),
};
const isArrowOnly = (el: Element) => !el.children.length && /^[\s→]*$/.test(el.textContent ?? '');

function enhanceButton(btn: HTMLElement) {
  if (btn.dataset.enh) return;
  btn.dataset.enh = '1';
  let arr = [...btn.children].find((c) => c.classList.contains('arr') || (c.tagName === 'SPAN' && isArrowOnly(c))) as HTMLElement | undefined;
  if (!arr) { arr = document.createElement('span'); btn.append(arr); }
  arr.className = 'arr';
  arr.setAttribute('aria-hidden', 'true');
  const g = GLYPHS[btn.dataset.i ?? 'arrow'] ?? GLYPHS.arrow;
  arr.innerHTML = g + g;
  // il testo (tutto ciò che non è la lente) va in un solo elemento
  const label = document.createElement('span');
  label.className = 'btn-t';
  [...btn.childNodes].filter((n) => n !== arr).forEach((n) => label.append(n));
  btn.insertBefore(label, arr);
  if (!hoverable || reduced) return;
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', e.clientX - r.left + 'px');
    btn.style.setProperty('--my', e.clientY - r.top + 'px');
    const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
    animate(btn, { x: dx * 14, y: dy * 10, duration: 280, ease: 'out(3)' });
  });
  btn.addEventListener('pointerleave', () => animate(btn, { x: 0, y: 0, ease: spring({ stiffness: 170, damping: 24 }) }));
}
document.querySelectorAll<HTMLElement>('.btn').forEach(enhanceButton);

/* ---------- logo: all'apertura i due punti si avvicinano e si sovrappongono (la home ha la sua apertura) ---------- */
if (!reduced && !document.getElementById('mark')) {
  const m = (c: string) => document.querySelector<SVGCircleElement>(`.brand .${c}`);
  const set = [['pa', 29, 37], ['pc', 29, 37], ['pb', 71, 63], ['pl', 71, 63]] as const;
  set.forEach(([c, from, to]) => { const el = m(c); if (el) animate(el, { cx: [from, to], duration: 1100, ease: spring({ stiffness: 90, damping: 12 }) }); });
}

/* ---------- testata ---------- */
const hdr = document.querySelector<HTMLElement>('.hdr');
const menuBtn = document.querySelector<HTMLButtonElement>('.menu-btn');
const mnav = document.querySelector<HTMLElement>('.mnav');
const behind = () => [...document.querySelectorAll<HTMLElement>('.hdr, main, .dock, .skip, .rail')];
const closeMenu = (back = true) => {
  if (!mnav || !menuBtn || !mnav.classList.contains('open')) return;
  behind().forEach((e) => e.removeAttribute('inert'));
  mnav.classList.remove('open'); document.body.classList.remove('mopen'); menuBtn.setAttribute('aria-expanded', 'false');
  mnav.setAttribute('aria-hidden', 'true'); mnav.setAttribute('inert', '');
  if (back) menuBtn.focus();
};
const openMenu = () => {
  if (!mnav || !menuBtn) return;
  hdr?.classList.remove('hide');
  mnav.classList.add('open'); document.body.classList.add('mopen'); menuBtn.setAttribute('aria-expanded', 'true');
  mnav.removeAttribute('aria-hidden'); mnav.removeAttribute('inert');
  behind().forEach((e) => e.setAttribute('inert', ''));
  mnav.querySelector<HTMLElement>('.mnav-x')?.focus({ preventScroll: true });
};
if (mnav) { mnav.setAttribute('inert', ''); mnav.setAttribute('aria-hidden', 'true'); }
menuBtn?.addEventListener('click', () => (mnav?.classList.contains('open') ? closeMenu() : openMenu()));
mnav?.querySelector('.mnav-x')?.addEventListener('click', () => closeMenu());
mnav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
matchMedia('(min-width: 1100px)').addEventListener('change', (e) => { if (e.matches) closeMenu(false); });

// la testata sparisce scorrendo verso il basso e torna scorrendo verso l'alto
let lastY = scrollY, run = 0;
addEventListener('scroll', () => {
  const y = scrollY, d = y - lastY;
  lastY = y;
  if (!hdr || !d || document.body.classList.contains('mopen')) return;
  if (y < 90) { run = 0; hdr.classList.remove('hide'); return; }
  if ((d > 0) !== (run > 0)) run = 0; // cambio di direzione: si riparte da zero
  run += d; // si somma lo scroll nella stessa direzione: anche i passi piccoli (trackpad, frecce) contano
  if (run > 40 && !hdr.contains(document.activeElement)) hdr.classList.add('hide');
  else if (run < -12) hdr.classList.remove('hide');
}, { passive: true });
hdr?.addEventListener('focusin', () => hdr.classList.remove('hide'));

// indicatore giallo che scorre tra le voci del menu (molla); la voce attiva la decide la pagina o lo scroll della home
const nav = document.querySelector<HTMLElement>('.nav');
const ind = nav?.querySelector<HTMLElement>('.nav-ind');
if (nav && ind) {
  const links = [...nav.querySelectorAll<HTMLElement>('a')];
  let placed = false;
  const to = (a: HTMLElement | null, instant = false) => {
    if (!a) { ind.style.opacity = '0'; return; }
    if (!nav.classList.contains('has-ind')) nav.classList.add('has-ind');
    ind.style.opacity = '1';
    const p = { left: a.offsetLeft, width: a.offsetWidth };
    if (instant || !placed || reduced) { Object.assign(ind.style, { left: p.left + 'px', width: p.width + 'px' }); placed = true; return; }
    animate(ind, { left: p.left, width: p.width, ease: spring({ stiffness: 240, damping: 30 }) });
  };
  const active = () => links.find((a) => a.classList.contains('on')) ?? null;
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => { links.forEach((l) => l.classList.toggle('hov', l === a)); to(a); });
  });
  nav.addEventListener('pointerleave', () => { links.forEach((l) => l.classList.remove('hov')); to(active()); });
  new MutationObserver(() => { if (!nav.matches(':hover')) to(active()); }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
  addEventListener('resize', () => to(active(), true));
  document.fonts?.ready.then(() => to(active(), true));
  to(active(), true);
}

// barra di avanzamento della pagina
const prog = document.querySelector<HTMLElement>('.prog') ?? Object.assign(document.createElement('span'), { className: 'prog', ariaHidden: 'true' });
if (!prog.isConnected) document.body.prepend(prog);
const setProg = () => { const h = root.scrollHeight - innerHeight; prog.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`; };
addEventListener('scroll', setProg, { passive: true }); setProg();

/* ---------- scelta della lingua ---------- */
function initLangMenu() {
  const menus = [...document.querySelectorAll<HTMLElement>('[data-lm]')];
  if (!menus.length) return;
  const SUP = ['it', 'en', 'de'];
  const prefs = navigator.languages?.length ? [...navigator.languages] : [navigator.language || ''];
  let detected = '', byDefault = false;
  for (const l of prefs) { const c = String(l).slice(0, 2).toLowerCase(); if (SUP.includes(c)) { detected = c; break; } }
  if (!detected && prefs[0]) { detected = 'en'; byDefault = true; } // lingua non presente: inglese, quella di base
  const T = JSON.parse(menus[0].dataset.t || '{}') as Record<string, string>;

  const pops: { m: HTMLElement; open: () => void; close: (back?: boolean) => void }[] = [];
  menus.forEach((m) => {
    m.classList.add('js-lm');
    const tag = m.querySelector<HTMLElement>(`.lm-opt[data-l="${detected}"] .lm-tag`);
    if (tag) { tag.textContent = byDefault ? T.def : T.device; tag.classList.add('on'); }
    if (m.classList.contains('inline')) return;
    const btn = m.querySelector<HTMLButtonElement>('.lm-btn')!, panel = m.querySelector<HTMLElement>('.lm-panel')!;
    const opts = [...panel.querySelectorAll<HTMLElement>('.lm-opt')];
    panel.setAttribute('inert', '');
    const open = () => {
      m.classList.add('open'); panel.removeAttribute('inert'); btn.setAttribute('aria-expanded', 'true');
      (panel.querySelector<HTMLElement>('[aria-current="true"]') ?? opts[0]).focus({ preventScroll: true });
    };
    const close = (back = false) => {
      if (!m.classList.contains('open')) return;
      m.classList.remove('open'); panel.setAttribute('inert', ''); btn.setAttribute('aria-expanded', 'false');
      if (back) btn.focus();
    };
    pops.push({ m, open, close });
    btn.addEventListener('click', () => (m.classList.contains('open') ? close(true) : open()));
    addEventListener('pointerdown', (e) => { if (!m.contains(e.target as Node)) close(); });
    addEventListener('scroll', () => close(), { passive: true });
    m.addEventListener('focusout', (e) => { if (!m.contains(e.relatedTarget as Node | null)) close(); });
    m.addEventListener('keydown', (e) => {
      if (!m.classList.contains('open')) return;
      if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
      const i = opts.indexOf(document.activeElement as HTMLElement);
      const go = (n: number) => { e.preventDefault(); opts[(n + opts.length) % opts.length].focus(); };
      if (e.key === 'ArrowDown') go(i + 1); else if (e.key === 'ArrowUp') go(i - 1);
      else if (e.key === 'Home') go(0); else if (e.key === 'End') go(opts.length - 1);
    });
  });

  // dopo un cambio automatico di lingua (LangAuto) un avviso dice cosa è successo e permette di cambiare
  let auto: string | null = null;
  try { auto = sessionStorage.getItem('pd-auto'); sessionStorage.removeItem('pd-auto'); } catch { /* niente avviso */ }
  if (auto) {
    const toast = document.createElement('div');
    toast.className = 'lm-toast'; toast.setAttribute('role', 'status');
    toast.innerHTML = `<p></p><button type="button" class="lm-change"></button><button type="button" class="lm-x"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2 2 8 8M10 2l-8 8"/></svg></button>`;
    toast.querySelector('p')!.textContent = auto === 'fallback' ? T.fallback : T.matched;
    toast.querySelector('.lm-change')!.textContent = T.change;
    toast.querySelector('.lm-x')!.setAttribute('aria-label', T.close);
    document.body.append(toast);
    const hide = () => toast.classList.remove('show');
    toast.querySelector('.lm-x')!.addEventListener('click', hide);
    toast.querySelector('.lm-change')!.addEventListener('click', () => {
      hide();
      const p = pops[0];
      if (p && p.m.offsetParent) p.open(); else document.querySelector<HTMLButtonElement>('.menu-btn')?.click(); // telefono: il menu ha la lista
    });
    // sulla home aspetta la fine dell'apertura animata
    let tries = 0;
    const show = () => { if (document.querySelector('canvas.loader') && tries++ < 25) { setTimeout(show, 400); return; } toast.classList.add('show'); setTimeout(hide, 11000); };
    setTimeout(show, 700);
  }
}
initLangMenu();

/* ---------- barra CTA fissa (telefono) ---------- */
const dock = document.querySelector<HTMLElement>('.dock');
if (dock) {
  let past = false, atEnd = false;
  const upd = () => dock.classList.toggle('show', past && !atEnd);
  addEventListener('scroll', () => { const p = scrollY > 520; if (p !== past) { past = p; upd(); } }, { passive: true });
  const seen = new Set<Element>();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    atEnd = seen.size > 0; upd();
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.cta-s, .sec.info, .ftr').forEach((el) => io.observe(el));
}

// "torna su"
document.querySelector('.top-btn')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

/* ---------- titoli: le parole entrano a scorrimento (le sezioni con data-split, nella home, le anima GSAP) ---------- */
if (!reduced) {
  const heads = [...document.querySelectorAll<HTMLElement>('main h1, main .cta-h, main section > h2')].filter((h) => !h.closest('[data-split], .big, .phone, .k-wrap, .sk, .chatwin, .mails'));
  heads.forEach((h) => {
    try {
      h.classList.add('u-split');
      const sp = splitText(h, { words: { wrap: 'clip' } });
      const words = sp.words as HTMLElement[];
      if (!words.length) return;
      words.forEach((w) => (w.style.transform = 'translateY(115%)'));
      const run = () => animate(words, { translateY: ['115%', '0%'], duration: 900, delay: stagger(70), ease: 'out(4)' });
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { rootMargin: '0px 0px -8% 0px' });
      io.observe(h);
    } catch { /* senza split il titolo resta com'è */ }
  });
}
