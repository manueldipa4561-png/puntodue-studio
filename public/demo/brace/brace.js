/* BRACE shared: open-now status, header state, mobile dock, toast, copy, reveals. */
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
  window.BRACE = { status, reduce };

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
