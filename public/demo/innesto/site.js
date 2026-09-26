/* INNESTO — comportamento condiviso: header, menu, prima/dopo, form demo, reveal */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* header: barra chiara dopo lo scroll */
  var header = document.querySelector('[data-header]');
  var onScroll = function(){ header && header.toggleAttribute('data-scrolled', scrollY > 40); };
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
  var initBA = function(ba){
    var wrap = ba.querySelector('.after-wrap'), handle = ba.querySelector('.ba-handle'), range = ba.querySelector('input[type=range]');
    var setV = function(v){ v = Math.max(0, Math.min(100, v));
      wrap.style.clipPath = 'inset(0 0 0 ' + v + '%)'; handle.style.left = v + '%';
      if(parseFloat(range.value) !== v) range.value = v; };
    setV(50);
    range.addEventListener('input', function(){ setV(parseFloat(range.value)); });
    ba.addEventListener('pointerdown', function(e){
      var r = ba.getBoundingClientRect(), move = function(ev){ setV((ev.clientX - r.left) / r.width * 100); };
      move(e);
      var up = function(){ removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    });
    if(!reduce && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){ if(!en[0].isIntersecting) return; io.disconnect();
        var t0 = null, step = function(t){ t0 = t0 || t; var p = Math.min((t - t0) / 1200, 1);
          setV(82 - 40 * (1 - Math.pow(1 - p, 3))); if(p < 1) requestAnimationFrame(step); };
        setTimeout(function(){ requestAnimationFrame(step); }, 250);
      }, {threshold:.45});
      io.observe(ba);
    }
  };
  document.querySelectorAll('[data-ba]').forEach(initBA);
  window.INNESTO = {initBA:initBA};

  /* form dimostrativi: nessun invio */
  document.querySelectorAll('[data-demo-form]').forEach(function(f){
    f.addEventListener('submit', function(e){ e.preventDefault();
      var n = f.querySelector('[data-form-note]');
      n.textContent = 'Questa è una demo: la richiesta non è stata inviata. Grazie!';
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
        onUpdate:function(s){ if(tag) tag.textContent = s.progress > .9 ? 'Finito' : 'Grezzo → finito'; }}});
  });
  /* parallasse leggera sulle immagini marcate */
  gsap.utils.toArray('[data-parallax]').forEach(function(img){
    gsap.fromTo(img, {yPercent:-6}, {yPercent:6, ease:'none', scrollTrigger:{trigger:img.parentElement, start:'top bottom', end:'bottom top', scrub:true}});
  });
})();
