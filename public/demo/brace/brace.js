/* BRACE shared: open-now status, spring helpers, header state, mobile dock, toast, copy, reveals. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.remove('no-js');
  if (reduce) document.documentElement.classList.add('reduce');

  /* Opening hours. Hours > 24 run past midnight (25 = 01:00 of the next day). 0 = Sunday. */
  const HOURS = { 0: [[12, 16], [19, 23]], 1: [], 2: [[19, 24]], 3: [[19, 24]], 4: [[19, 24]], 5: [[19, 25]], 6: [[19, 25]] };
  const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const hh = h => (h === 24 ? '24' : String(h % 24).padStart(2, '0'));
  function status(now = new Date()) {
    const d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const prev = HOURS[(d + 6) % 7].find(([, e]) => e > 24 && h < e - 24);
    if (prev) return { open: true, text: 'Aperto ora, fino alle ' + hh(prev[1]) };
    const cur = HOURS[d].find(([s, e]) => h >= s && h < e);
    if (cur) return { open: true, text: 'Aperto ora, fino alle ' + hh(cur[1]) };
    const next = HOURS[d].find(([s]) => h < s);
    if (next) return { open: false, text: 'Apre oggi alle ' + next[0] };
    for (let i = 1; i <= 7; i++) {
      const s = HOURS[(d + i) % 7][0];
      if (s) return { open: false, text: 'Apre ' + (i === 1 ? 'domani' : DAYS[(d + i) % 7]) + ' alle ' + s[0] };
    }
    return { open: false, text: '' };
  }
  const st = status();
  $$('[data-now]').forEach(el => {
    el.classList.toggle('open', st.open);
    ($('span', el) || el).textContent = st.text;
  });

  /* Spring with Apple's two designer parameters: damping ratio (1 = no overshoot) and response (s).
     Always integrates from the live value and velocity, so a new target mid-flight never jumps. */
  function spring(onUpdate, { value = 0, response = .4, damping = 1 } = {}) {
    let x = value, v = 0, target = value, k = 0, c = 0, raf = 0, last = 0;
    const tune = (r, d) => { k = (2 * Math.PI / r) ** 2; c = 4 * Math.PI * d / r; };
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      for (let i = 0; i < 4; i++) { const h = dt / 4; v += (-k * (x - target) - c * v) * h; x += v * h; }
      if (Math.abs(v) < .5 && Math.abs(x - target) < .05) { x = target; v = 0; raf = 0; } else raf = requestAnimationFrame(step);
      onUpdate(x);
    };
    return {
      get value() { return x; }, get target() { return target; }, get moving() { return !!raf; },
      to(t, o = {}) {
        target = t; tune(o.response || response, o.damping || damping);
        if (o.velocity != null) v = o.velocity;
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
      },
      set(val) { cancelAnimationFrame(raf); raf = 0; x = target = val; v = 0; onUpdate(x); }
    };
  }
  /* Where a flick comes to rest (Apple's projection, deceleration 0.998 = scroll feel). */
  const project = (vel, d = .998) => (vel / 1000) * d / (1 - d);
  /* Progressive resistance past a boundary. */
  const rubberband = (over, dim, c = .55) => (over * dim * c) / (dim + c * Math.abs(over));
  window.BRACE = { status, reduce, spring, project, rubberband };
  /* iOS only paints :active when a touch listener exists; press feedback depends on it. */
  document.addEventListener('touchstart', () => {}, { passive: true });

  /* Header background once the page leaves the top. */
  const hd = $('.hd');
  const top = document.createElement('div');
  top.setAttribute('aria-hidden', 'true');
  top.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none';
  document.body.prepend(top);
  if (hd) new IntersectionObserver(([e]) => hd.classList.toggle('on', !e.isIntersecting)).observe(top);

  /* Mobile dock: visible after the first screen, hidden while the booking form is on screen. */
  const dock = $('.dock');
  if (dock) {
    const first = $('[data-first]') || top;
    const book = $('#prenota');
    let pastFirst = false, onBook = false;
    const sync = () => dock.classList.toggle('on', pastFirst && !onBook);
    new IntersectionObserver(([e]) => { pastFirst = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(first);
    if (book) new IntersectionObserver(([e]) => { onBook = e.isIntersecting; sync(); }, { rootMargin: '0px 0px -30% 0px' }).observe(book);
  }

  /* Toast + copy buttons */
  let toastEl, tt;
  const toast = msg => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2400);
  };
  window.BRACE.toast = toast;
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiato: ' + b.dataset.copy); }
    catch { toast('Copia non disponibile su questo browser'); }
  });

  /* Reveals */
  const rv = $$('.rv');
  if (!rv.length) return;
  if (reduce || !window.gsap || !window.ScrollTrigger) { rv.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.batch(rv, {
    start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, overwrite: true })
  });
})();
