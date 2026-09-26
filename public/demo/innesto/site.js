/* INNESTO — comportamento condiviso: header, menu, prima/dopo, form demo, reveal */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* header: barra chiara dopo lo scroll */
  var header = document.querySelector('[data-header]');
  var onScroll = function(){ header && header.toggleAttribute('data-scrolled', scrollY > 40); };
  onScroll(); addEventListener('scroll', onScroll, {passive:true});

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

  gsap.set('.hero .mask>span', {yPercent:110});
  gsap.to('.hero .mask>span', {yPercent:0, duration:1.1, ease:'power4.out', stagger:.1, delay:.1});

  gsap.utils.toArray('.fx').forEach(function(el){
    ScrollTrigger.create({trigger:el, start:'top 88%', once:true, onEnter:function(){ el.classList.add('fx-in'); }});
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
