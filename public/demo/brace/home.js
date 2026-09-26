/* BRACE home: WebGL smoke hero, 14-hour pinned story, brisket reservation, menu filter, club tilt, coupon countdown, booking form. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const root = document.documentElement;
  window.__braceHome = true;
  if (!hasGsap || reduce) root.classList.remove('anim');
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ---------- hero intro ---------- */
  if (hasGsap && !reduce) {
    gsap.fromTo('.hero .ln>span', { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: .12, delay: .15 });
    gsap.fromTo(['#hsub', '#hcta'], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .6 });
    gsap.fromTo('.hero img', { scale: 1.08 }, { scale: 1, duration: 2.6, ease: 'power2.out' });
    gsap.to('.hero-in', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- WebGL smoke (transparent layer over the real photo, so the photo stays sharp) ---------- */
  (function smoke() {
    const cv = $('#smoke'), hero = $('.hero');
    if (reduce || !cv || !hero) return;
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return;
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
    const OCT = coarse ? 4 : 5;
    const vs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define OCT ${OCT}
uniform vec2 r,m;uniform float t,intro,ms;varying vec2 v;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<OCT;i++){s+=a*n(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return s;}
void main(){
  float asp=r.x/r.y;
  vec2 q=vec2(v.x*asp,v.y), mp=vec2(m.x*asp,m.y), dm=q-mp;
  float md=length(dm), pf=ms*exp(-md*md*14.);
  vec2 p=q*1.35; p.y-=t*.07; p+=dm/(md+.05)*pf*.25;
  vec2 w=vec2(fbm(p+vec2(0.,t*.03)),fbm(p+vec2(5.2,1.3)-vec2(t*.02,0.)));
  float d=fbm(p+1.8*w);
  float a=smoothstep(.42,.95,d)*(.3+.55*smoothstep(1.05,0.,v.y));
  a*=1.-.85*pf;
  a+=intro*smoothstep(.15,.75,d)*1.2;
  a=clamp(a*.55,0.,.92);
  vec3 c=mix(vec3(.55,.59,.66),vec3(.86,.89,.96),w.y);
  gl_FragColor=vec4(c*a,a);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return;
    const pr = gl.createProgram();
    gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['r', 'm', 't', 'intro', 'ms'].forEach(k => U[k] = gl.getUniformLocation(pr, k));

    /* Smoke is soft: render it at about half resolution and let the browser upscale. */
    const SCALE = coarse ? .45 : .55;
    const size = () => {
      const w = Math.max(1, Math.round(cv.clientWidth * SCALE)), h = Math.max(1, Math.round(cv.clientHeight * SCALE));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.r, w, h);
    };
    new ResizeObserver(size).observe(cv);
    size();

    let tx = .7, ty = .45, mx = .7, my = .45, ms = 0, lx = null, ly = null;
    const move = e => {
      const b = hero.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width; ty = 1 - (e.clientY - b.top) / b.height;
      if (lx !== null) ms = Math.min(1, ms + Math.hypot(e.clientX - lx, e.clientY - ly) / 260);
      lx = e.clientX; ly = e.clientY;
      kick();
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerdown', e => { lx = null; move(e); ms = Math.min(1, ms + .6); }, { passive: true });

    let vis = true, raf = 0, last = 0, lost = false;
    const t0 = performance.now();
    const frame = now => {
      raf = 0;
      if (!vis || document.hidden || lost) return;
      raf = requestAnimationFrame(frame);
      if (coarse && now - last < 32) return; /* about 30 fps on phones */
      last = now;
      const t = (now - t0) / 1000;
      mx += (tx - mx) * .12; my += (ty - my) * .12; ms *= .965;
      const intro = Math.max(0, 1 - t / 2.4);
      gl.uniform1f(U.t, t % 1000);
      gl.uniform1f(U.intro, intro * intro);
      gl.uniform2f(U.m, mx, my);
      gl.uniform1f(U.ms, ms);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!cv.classList.contains('on')) cv.classList.add('on');
    };
    function kick() { if (!raf && vis && !document.hidden && !lost) raf = requestAnimationFrame(frame); }
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; kick(); }).observe(hero);
    document.addEventListener('visibilitychange', kick);
    /* The smoke is decoration: on context loss just fade it out and keep the photo. */
    cv.addEventListener('webglcontextlost', () => { lost = true; cv.classList.remove('on'); });
    kick();
  })();

  /* ---------- 14 ore: pinned scroll story ---------- */
  (function cook() {
    const sec = $('#fuoco');
    if (!sec || !hasGsap || reduce) return;
    sec.classList.add('pinned');
    const imgs = $$('.cook-media img', sec), stages = $$('.stg', sec);
    const clk = $('#clk'), core = $('#core'), prog = $('#prog');
    const KEYS = [[0, 4], [2, 30], [7, 68], [10, 72], [13, 93], [14, 95]];
    const temp = h => { for (let i = 1; i < KEYS.length; i++) { const [a, ta] = KEYS[i - 1], [b, tb] = KEYS[i]; if (h <= b) return ta + (tb - ta) * (h - a) / (b - a); } return 95; };
    let cur = 0;
    const render = p => {
      const h = Math.min(14, p * 14.4);
      const H = Math.floor(h), M = Math.floor((h - H) * 60);
      clk.textContent = String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0');
      core.textContent = Math.round(temp(h)) + '°C';
      prog.style.transform = 'scaleX(' + Math.min(1, p * 1.03) + ')';
      const idx = h < 2 ? 0 : h < 7 ? 1 : h < 12.5 ? 2 : 3;
      if (idx !== cur) {
        imgs[cur].classList.remove('on'); stages[cur].classList.remove('on');
        imgs[idx].classList.add('on'); stages[idx].classList.add('on');
        cur = idx;
      }
    };
    ScrollTrigger.create({
      trigger: $('.cook-pin', sec), start: 'top top',
      end: () => '+=' + Math.round(innerHeight * (innerWidth < 900 ? 2.2 : 2.6)),
      pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: s => render(s.progress)
    });
    render(0);
  })();

  /* ---------- brisket del giorno ---------- */
  (function brisket() {
    const slots = $('#slots'), left = $('#left'), btn = $('#reserve'), res = $('#res'), nt = $('#notify');
    if (!slots) return;
    const TOTAL = 40, SOLD = 33;
    slots.innerHTML = Array.from({ length: TOTAL }, (_, i) => '<i' + (i < SOLD ? ' class="sold"' : '') + '></i>').join('');
    let mine = null;
    const pad = n => String(n).padStart(2, '0');
    nt.addEventListener('click', () => nt.setAttribute('aria-pressed', nt.getAttribute('aria-pressed') !== 'true'));
    btn.addEventListener('click', () => {
      const cells = slots.children;
      if (mine) {
        cells[SOLD].classList.remove('mine'); mine = null;
        left.textContent = pad(TOTAL - SOLD);
        res.textContent = 'Prenotazione annullata. Acconto restituito (demo).';
        btn.textContent = 'Tieni da parte, acconto 5 €'; btn.classList.remove('gh');
        return;
      }
      const g = $('input[name="por"]:checked').value, price = g === '500' ? 36 : 19;
      mine = 'BR-' + (1000 + Math.floor(Math.random() * 9000));
      cells[SOLD].classList.add('mine');
      left.textContent = pad(TOTAL - SOLD - 1);
      if (hasGsap && !reduce) gsap.fromTo(left, { scale: 1.25 }, { scale: 1, duration: .5, ease: 'back.out(2)' });
      res.replaceChildren(
        'Porzione da ' + g + ' g tenuta da parte. Codice ',
        Object.assign(document.createElement('b'), { textContent: mine }),
        '. In cassa paghi ' + (price - 5) + ' €.' + (nt.getAttribute('aria-pressed') === 'true' ? ' Ti scriviamo su WhatsApp quando esce dal fumo.' : '')
      );
      btn.textContent = 'Annulla la prenotazione'; btn.classList.add('gh');
    });
  })();

  /* ---------- menu filter ---------- */
  (function menu() {
    const grid = $('#dishes'), chips = $$('.chip'), count = $('#fcount');
    if (!grid) return;
    const items = $$('.dish', grid);
    let tl = null;
    chips.forEach(c => c.addEventListener('click', () => {
      const f = c.dataset.f;
      if (c.getAttribute('aria-pressed') === 'true') return;
      chips.forEach(x => x.setAttribute('aria-pressed', x === c));
      if (tl) { tl.progress(1).kill(); tl = null; } /* finish a running flip first, or items stay absolute */
      const state = window.Flip && !reduce ? Flip.getState(items) : null;
      let n = 0;
      items.forEach(el => { const on = f === 'all' || el.dataset.cat === f; el.style.display = on ? '' : 'none'; n += on; });
      grid.classList.toggle('all', f === 'all');
      count.textContent = n + (n === 1 ? ' piatto' : ' piatti');
      if (state) tl = Flip.from(state, {
        duration: .55, ease: 'power2.inOut', absolute: true, nested: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .45, delay: .1 }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: .94, duration: .3 }),
        onComplete: () => { gsap.set(items, { clearProps: 'opacity,scale,transform' }); tl = null; }
      });
    }));
  })();

  /* ---------- room parallax ---------- */
  if (hasGsap && !reduce && $('#roomImg')) {
    gsap.fromTo('#roomImg', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.room', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- club card: 3D tilt follows the pointer ---------- */
  (function tilt() {
    const cell = $('.c-club'), t = $('#tilt');
    if (!cell || !t || reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const card = $('.mcard', t);
    cell.addEventListener('pointermove', e => {
      const b = cell.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      t.classList.add('live');
      card.style.setProperty('--ry', ((x - .5) * 26).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - y) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    cell.addEventListener('pointerleave', () => { t.classList.remove('live'); ['--rx', '--ry', '--gx', '--gy'].forEach(p => card.style.removeProperty(p)); });
  })();

  /* ---------- coupon countdown (to Wednesday 23:59) ---------- */
  (function countdown() {
    const el = $('#cd');
    if (!el) return;
    const tick = () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((3 - now.getDay() + 7) % 7), 23, 59, 59);
      let s = Math.max(0, Math.floor((end - now) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      el.textContent = d + 'g ' + String(h).padStart(2, '0') + 'h ' + String(m).padStart(2, '0') + 'm';
    };
    tick(); setInterval(tick, 30000);
  })();

  /* ---------- today's row in the opening hours ---------- */
  const today = String(new Date().getDay());
  $$('#hrs [data-d]').forEach(el => el.classList.toggle('today-row', el.dataset.d.split(' ').includes(today)));

  /* ---------- booking form ---------- */
  (function booking() {
    const fm = $('#bookForm');
    if (!fm) return;
    const day = $('#f-day'), times = $('#times'), ppl = $('#ppl'), wa = $('#wa'), waText = $('#waText');
    const SLOTS = { 0: [[12, 14.5], [19, 21.5]], 1: [], 2: [[19, 22.5]], 3: [[19, 22.5]], 4: [[19, 22.5]], 5: [[19, 23]], 6: [[19, 23]] };
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    function slotsFor(d) {
      const out = [], n0 = new Date(), isToday = iso(d) === iso(n0), cut = n0.getHours() + n0.getMinutes() / 60 + .5;
      for (const [a, b] of SLOTS[d.getDay()]) for (let h = a; h <= b; h += .5) if (!isToday || h > cut) out.push(h);
      return out;
    }
    const now = new Date();
    day.min = iso(now);
    const max = new Date(now); max.setDate(max.getDate() + 60); day.max = iso(max);
    const first = new Date(now);
    while (!slotsFor(first).length) first.setDate(first.getDate() + 1);
    day.value = iso(first);

    const fmt = h => String(Math.floor(h)).padStart(2, '0') + ':' + (h % 1 ? '30' : '00');
    const err = (id, msg) => {
      $('#e-' + id).textContent = msg || '';
      const input = $('#f-' + id);
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    function buildTimes() {
      times.replaceChildren();
      err('day');
      if (!day.value) return;
      const d = parse(day.value);
      if (!SLOTS[d.getDay()].length) { err('day', 'Il lunedì siamo chiusi. Scegli un altro giorno.'); return; }
      const list = slotsFor(d);
      if (!list.length) { err('day', 'Per oggi le prenotazioni sono chiuse. Scegli un altro giorno.'); return; }
      list.forEach(h => {
        const l = document.createElement('label'); l.className = 'opt';
        const i = Object.assign(document.createElement('input'), { type: 'radio', name: 'time', value: fmt(h) });
        i.setAttribute('aria-describedby', 'e-time');
        l.append(i, Object.assign(document.createElement('span'), { textContent: fmt(h) }));
        times.append(l);
      });
    }
    day.addEventListener('change', buildTimes);
    buildTimes();

    let n = 2;
    const setN = v => { n = Math.max(1, Math.min(12, v)); ppl.textContent = n; $('#minus').disabled = n === 1; $('#plus').disabled = n === 12; };
    $('#minus').addEventListener('click', () => setN(n - 1));
    $('#plus').addEventListener('click', () => { setN(n + 1); if (n === 12 && window.BRACE) BRACE.toast('Oltre 12 persone scrivici su WhatsApp'); });
    setN(2);

    fm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#f-name').value.trim(), tel = $('#f-tel').value.trim(), time = $('input[name="time"]:checked', fm);
      let bad = null;
      const need = (ok, id, msg, focus) => { err(id, ok ? '' : msg); if (!ok && !bad) bad = focus; };
      const d = day.value ? parse(day.value) : null;
      need(!!d && SLOTS[d.getDay()].length > 0 && day.value >= day.min && day.value <= day.max, 'day', d ? 'Scegli un giorno di apertura entro i prossimi due mesi.' : 'Scegli il giorno.', day);
      $('#e-time').textContent = time ? '' : 'Scegli un orario.';
      if (!time && !bad) bad = $('input[name="time"]', fm) || day;
      need(name.length >= 2, 'name', 'Scrivi il tuo nome.', $('#f-name'));
      need(/^\+?[\d\s.-]{8,20}$/.test(tel) && tel.replace(/\D/g, '').length >= 8, 'tel', 'Serve un numero valido per la conferma su WhatsApp.', $('#f-tel'));
      if (bad) { bad.focus(); wa.classList.remove('on'); return; }
      const when = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      waText.textContent = 'Ciao ' + name + ', ti aspettiamo ' + when + ' alle ' + time.value + ', ' + n + (n === 1 ? ' persona' : ' persone') + '.' +
        ($('#f-bris').checked ? ' Il tuo brisket da 250 g è tenuto da parte.' : '') + ' Per spostare o cancellare rispondi a questo messaggio.';
      wa.classList.add('on');
      wa.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  })();

  if (hasGsap) {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
