/* INNESTO — comportamento condiviso: header, menu, prima/dopo, form demo, reveal */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* iOS mostra :active (la risposta alla pressione) solo se la pagina ascolta il tocco */
  document.addEventListener('touchstart', function(){}, {passive:true});

  /* molla con i due parametri di Apple: damping (1 = nessun rimbalzo) e response (secondi, non una durata).
     Interrompibile: go() riparte dal valore e dalla velocità attuali. Accetta un numero o un array di
     dimensioni indipendenti (una molla per asse). */
  var spring = function(onUpdate, eps){
    var x = [0], v = [0], to = [0], z = 1, r = .4, raf = 0, last = 0, arr = false, done = null;
    eps = eps || .01;
    var A = function(n){ arr = Array.isArray(n); return arr ? n.slice() : [n]; };
    var out = function(){ onUpdate(arr ? x.slice() : x[0]); };
    var frame = function(t){
      var dt = t > last ? Math.min((t - last) / 1000, 1 / 30) : 1 / 60, k = Math.pow(2 * Math.PI / r, 2), c = 4 * Math.PI * z / r, rest = true;
      last = t;
      for(var i = 0; i < x.length; i++){
        v[i] += (-k * (x[i] - to[i]) - c * v[i]) * dt; x[i] += v[i] * dt;
        if(Math.abs(v[i]) > eps || Math.abs(x[i] - to[i]) > eps) rest = false;
      }
      if(rest){ x = to.slice(); v = x.map(function(){ return 0; }); raf = 0; }
      else raf = requestAnimationFrame(frame);
      out();
      if(rest && done){ var d = done; done = null; d(); }
    };
    var stop = function(){ cancelAnimationFrame(raf); raf = 0; done = null; };
    return {
      get value(){ return arr ? x.slice() : x[0]; },
      get target(){ return arr ? to.slice() : to[0]; },
      get moving(){ return !!raf; },
      set: function(n){ stop(); x = A(n); to = x.slice(); v = x.map(function(){ return 0; }); out(); },
      stop: function(){ stop(); v = x.map(function(){ return 0; }); },
      /* o: {v: velocità iniziale (unità/s), from: nuovo punto di partenza senza perdere la velocità, damping, response, done} */
      go: function(n, o){ o = o || {};
        if(o.from != null) x = A(o.from);
        to = A(n); if(o.v != null) v = A(o.v);
        if(v.length !== x.length) v = x.map(function(){ return 0; });
        z = o.damping || 1; r = o.response || .4; done = o.done || null;
        if(!raf){ last = performance.now(); raf = requestAnimationFrame(frame); }
      }
    };
  };
  /* dove si fermerebbe un lancio (funzione di proiezione di Apple, decelerazione 0.99 = scatto breve) */
  var project = function(vel, d){ d = d || .99; return vel / 1000 * d / (1 - d); };
  /* oltre il bordo l'oggetto segue sempre meno: resistenza progressiva, non uno stop secco */
  var rubber = function(over, dim){ return over * dim * .55 / (dim + .55 * Math.abs(over)); };

  /* header: barra chiara dopo lo scroll */
  var header = document.querySelector('[data-header]');
  /* e materiale scuro quando sotto la barra passa una sezione scura (un controllo per fotogramma) */
  var ticking = false;
  var onScroll = function(){
    if(!header || ticking) return; ticking = true;
    requestAnimationFrame(function(){ ticking = false;
      header.toggleAttribute('data-scrolled', scrollY > 40);
      var under = document.elementFromPoint(innerWidth / 2, header.offsetHeight + 2);
      header.toggleAttribute('data-over-dark', !!(under && under.closest('.t-dark')));
    });
  };
  onScroll(); addEventListener('scroll', onScroll, {passive:true});
  var lastY = scrollY;
  addEventListener('scroll', function(){
    var y = scrollY;
    if(header && !document.body.hasAttribute('data-menu-open')) header.classList.toggle('hide', y > lastY + 4 && y > 500);
    if(y < lastY - 4) header && header.classList.remove('hide');
    lastY = y;
  }, {passive:true});
  header && header.addEventListener('focusin', function(){ header.classList.remove('hide'); });

  /* menu mobile */
  var btn = document.querySelector('[data-menu]'), menu = document.getElementById('mobile-menu');
  if(btn && menu){
    var set = function(open){
      menu.toggleAttribute('data-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.toggleAttribute('data-menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', function(){ set(!menu.hasAttribute('data-open')); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
    addEventListener('keydown', function(e){ if(e.key === 'Escape' && menu.hasAttribute('data-open')){ set(false); btn.focus(); } });
  }

  /* slider prima/dopo (riutilizzabile: window.INNESTO.initBA) */
  /* il divisorio segue il dito 1:1 da qualunque punto dell'immagine (senza saltare sotto il dito),
     al rilascio prosegue con la velocità del gesto e si posa con una molla; tastiera: frecce, PagSu/PagGiù, Home/Fine */
  var initBA = function(ba){
    var wrap = ba.querySelector('.after-wrap'), handle = ba.querySelector('.ba-handle'), range = ba.querySelector('input[type=range]');
    var W = ba.clientWidth || 1, touched = false, drag = null;
    var clamp = function(n){ return Math.max(0, Math.min(100, n)); };
    var paint = function(x){
      /* oltre i bordi la maniglia resiste: al massimo ~28px, sempre più lenta */
      var p = x < 0 ? -rubber(-x / 100 * W, 28) / W * 100 : x > 100 ? 100 + rubber((x - 100) / 100 * W, 28) / W * 100 : x;
      wrap.style.clipPath = 'inset(0 0 0 ' + clamp(p).toFixed(2) + '%)';
      handle.style.transform = 'translate3d(' + (p / 100 * W - 1).toFixed(1) + 'px,0,0)';
      range.value = Math.round(clamp(x));
    };
    var s = spring(paint, .02);
    var settle = function(n, o){ reduce ? s.set(n) : s.go(n, o); };
    handle.style.left = '0'; range.step = 1;
    range.style.pointerEvents = 'none'; /* il puntatore lo gestisce la figura; il range resta per tastiera e screen reader */
    s.set(50);
    if('ResizeObserver' in window) new ResizeObserver(function(){ W = ba.clientWidth || 1; paint(s.value); }).observe(ba);

    ba.addEventListener('pointerdown', function(e){
      if(e.button > 0) return;
      touched = true; s.stop();
      var r = ba.getBoundingClientRect(); W = r.width;
      try { ba.setPointerCapture(e.pointerId); } catch(err){}
      drag = {id:e.pointerId, left:r.left, x0:e.clientX, start:s.value, max:0, hist:[[e.timeStamp, e.clientX]]};
      ba.setAttribute('data-grab', '');
    });
    ba.addEventListener('pointermove', function(e){
      if(!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, h = drag.hist;
      drag.max = Math.max(drag.max, Math.abs(dx));
      h.push([e.timeStamp, e.clientX]);
      while(h.length > 2 && e.timeStamp - h[0][0] > 100) h.shift();
      s.set(drag.start + dx / W * 100);
    });
    var end = function(e){
      if(!drag || e.pointerId !== drag.id) return;
      var d = drag, cur = s.value, h = d.hist, a = h[0], b = h[h.length - 1], vel = 0;
      drag = null; ba.removeAttribute('data-grab');
      /* il browser ha preso il gesto per scorrere la pagina: torna dov'era */
      if(e.type === 'pointercancel'){ settle(clamp(d.start)); return; }
      /* tocco senza trascinare: il divisorio va dove hai toccato (se non hai toccato la maniglia) */
      if(d.max < 6){
        var tap = (e.clientX - d.left) / W * 100;
        if(Math.abs(tap - d.start) * W / 100 > 28) settle(clamp(tap), {response:.35});
        else settle(clamp(cur));
        return;
      }
      if(e.timeStamp - b[0] < 60 && b[0] > a[0]) vel = (b[1] - a[1]) / (b[0] - a[0]) * 1000 / W * 100; /* %/s */
      if(reduce){ s.set(clamp(cur)); return; }
      /* lancio: arriva dove porta lo slancio; un filo di rimbalzo solo se c'era slancio */
      s.go(clamp(cur + project(vel)), {v:vel, damping:Math.abs(vel) > 60 ? .85 : 1, response:.4});
    };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);
    ba.addEventListener('lostpointercapture', end);

    range.addEventListener('keydown', function(e){
      var step = {ArrowLeft:-5, ArrowDown:-5, ArrowRight:5, ArrowUp:5, PageDown:-20, PageUp:20}[e.key], n;
      if(step) n = s.target + step; else if(e.key === 'Home') n = 0; else if(e.key === 'End') n = 100; else return;
      e.preventDefault(); touched = true; settle(clamp(n), {response:.3});
    });
    range.addEventListener('input', function(){ touched = true; settle(+range.value, {response:.3}); });

    /* suggerimento del gesto: appena è in vista, il divisorio viene "lanciato" e si posa */
    if(!reduce && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){ if(!en[0].isIntersecting) return; io.disconnect();
        setTimeout(function(){ if(!touched) s.go(42, {v:520, response:.8}); }, 250);
      }, {threshold:.45});
      io.observe(ba);
    }
  };
  document.querySelectorAll('[data-ba]').forEach(initBA);
  window.INNESTO = {initBA:initBA, spring:spring, reduce:reduce};

  /* form dimostrativi: nessun invio */
  document.querySelectorAll('[data-demo-form]').forEach(function(f){
    f.addEventListener('submit', function(e){ e.preventDefault();
      var n = f.querySelector('[data-form-note]');
      n.textContent = t('Questa è una demo: la richiesta non è stata inviata. Grazie!');
      n.setAttribute('data-sent', '');
    });
  });

  /* reveal e grezzo -> finito */
  var showAll = function(){
    document.querySelectorAll('.fx').forEach(function(el){ el.classList.add('fx-in'); });
    document.querySelectorAll('.reveal-media .after').forEach(function(el){ el.style.clipPath = 'none'; });
  };
  if(reduce || !window.gsap || !window.ScrollTrigger){ showAll(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if(document.fonts) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });

  gsap.set('.hero .mask>span', {yPercent:110});
  gsap.to('.hero .mask>span', {yPercent:0, duration:1.1, ease:'power4.out', stagger:.1, delay:.1});

  /* titoli di sezione: parola per parola da sotto una maschera */
  var split = function(el){
    var walk = function(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType === 3){
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'), i = document.createElement('span');
            w.className = 'w'; i.textContent = part; w.appendChild(i); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if(n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el); return el.querySelectorAll('.w>span');
  };
  gsap.utils.toArray('h2.fx').forEach(function(h){
    h.classList.remove('fx');
    var words = split(h);
    gsap.set(words, {yPercent:115});
    ScrollTrigger.create({trigger:h, start:'top 88%', once:true, onEnter:function(){
      gsap.to(words, {yPercent:0, duration:1, ease:'power4.out', stagger:.045});
    }});
  });

  gsap.utils.toArray('.fx').forEach(function(el){
    ScrollTrigger.create({trigger:el, start:'top 88%', once:true, onEnter:function(){ el.classList.add('fx-in'); }});
  });

  /* immagini: si aprono dal basso con un leggero zoom-out */
  gsap.utils.toArray('.mat, .studio-pics figure, .teaser-fig, [data-grid] .card figure, .site-pic').forEach(function(fig){
    var img = fig.querySelector('img'), st = {trigger:fig, start:'top 90%', once:true};
    gsap.fromTo(fig, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.25, ease:'power4.inOut', scrollTrigger:st, clearProps:'clipPath'});
    if(img && !img.hasAttribute('data-parallax')) gsap.fromTo(img, {scale:1.22}, {scale:1, duration:1.7, ease:'power3.out', scrollTrigger:st, clearProps:'transform'});
  });

  /* numeri che contano */
  gsap.utils.toArray('.stats b').forEach(function(b){
    var m = b.textContent.match(/^(\d+)(.*)$/); if(!m || +m[1] === 0) return;
    var o = {v:0}, end = +m[1], suf = m[2];
    b.textContent = '0' + suf;
    ScrollTrigger.create({trigger:b, start:'top 92%', once:true, onEnter:function(){
      gsap.to(o, {v:end, duration:1.4, ease:'power2.out', onUpdate:function(){ b.textContent = Math.round(o.v) + suf; }});
    }});
  });

  /* hero: il media entra dal basso e poi rallenta allo scroll */
  var hm = document.querySelector('.hero-media');
  if(hm){
    gsap.fromTo(hm, {clipPath:'inset(100% 0% 0% 0%)'}, {clipPath:'inset(0% 0% 0% 0%)', duration:1.4, ease:'power4.inOut', delay:.25, clearProps:'clipPath'});
    gsap.to(hm, {yPercent:10, scale:.95, ease:'none', scrollTrigger:{trigger:'.hero', start:'top top', end:'bottom top', scrub:true}});
  }

  /* metodo: una linea che avanza fase per fase */
  var steps = document.querySelector('.steps');
  if(steps){
    var line = document.createElement('span'); line.className = 'steps-line'; line.setAttribute('aria-hidden', 'true'); steps.appendChild(line);
    gsap.fromTo(line, {scaleX:0}, {scaleX:1, ease:'none', scrollTrigger:{trigger:steps, start:'top 75%', end:'bottom 55%', scrub:.5}});
  }

  /* scritta del footer: lettera per lettera */
  gsap.utils.toArray('.footer-word').forEach(function(f){
    var t = f.textContent; f.textContent = '';
    t.split('').forEach(function(c){ var s = document.createElement('span'); s.textContent = c; f.appendChild(s); });
    gsap.fromTo(f.children, {yPercent:100}, {yPercent:0, duration:1, ease:'power4.out', stagger:.05, scrollTrigger:{trigger:f, start:'top 95%', once:true}});
  });
  gsap.utils.toArray('.reveal-media').forEach(function(fig){
    var after = fig.querySelector('.after'), tag = fig.querySelector('.tag');
    gsap.fromTo(after, {clipPath:'inset(0 0 0 100%)'}, {clipPath:'inset(0 0 0 0%)', ease:'none',
      scrollTrigger:{trigger:fig, start:'top 80%', end:'bottom 55%', scrub:.6,
        onUpdate:function(s){ if(tag) tag.textContent = t(s.progress > .9 ? 'Finito' : 'Grezzo → finito'); }}});
  });
  /* parallasse leggera sulle immagini marcate */
  gsap.utils.toArray('[data-parallax]').forEach(function(img){
    gsap.fromTo(img, {yPercent:-6}, {yPercent:6, ease:'none', scrollTrigger:{trigger:img.parentElement, start:'top bottom', end:'bottom top', scrub:true}});
  });
})();
