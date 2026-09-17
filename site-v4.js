/* Punto Due Studio - shared production interaction layer */
(() => {
  /* Spatial Experience 2026: one isolated module shared by every page using this runtime. */
  if(!document.querySelector('link[href="/spatial-2026.css"]')){
    const spatialCss=document.createElement('link');
    spatialCss.rel='stylesheet';
    spatialCss.href='/spatial-2026.css';
    document.head.appendChild(spatialCss);
  }
  if(!document.querySelector('script[src="/experience-field.js"]')){
    const spatialScript=document.createElement('script');
    spatialScript.src='/experience-field.js';
    spatialScript.defer=true;
    document.head.appendChild(spatialScript);
  }

  if(document.querySelector('link[href="/site-v5.css"]')){
    const appendStyle=href=>{
      if(document.querySelector(`link[href="${href}"]`))return;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    };
    const appendScript=src=>{
      if(document.querySelector(`script[src="${src}"]`))return;
      const script=document.createElement('script');
      script.src=src;
      script.defer=true;
      document.head.appendChild(script);
    };

    /* Shared production layers. Patch order is preserved inside shared-patches.css. */
    ['/shared-patches.css','/site-v9.css'].forEach(appendStyle);
    appendScript('/site-v9.js');

    /* Case-only motion and handoff logic remain completely route-scoped. */
    if(document.body.classList.contains('case-study-page')){
      appendStyle('/case-motion.css');
      appendScript('/case-runtime.js');
    }

    /* Portfolio/case refinement CSS is centrally loaded last, preserving its historical cascade position. */
    if(document.querySelector('script[src="/portfolio-v8.js"]')){
      appendStyle('/portfolio-refinements.css');
    }
  }

  const header=document.querySelector('.site-header');
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  const main=document.querySelector('main');
  const footer=document.querySelector('footer');
  const mobile=window.matchMedia('(max-width:760px)');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-year]').forEach(n=>n.textContent=new Date().getFullYear());

  if(header&&'IntersectionObserver' in window){
    const sentinel=document.createElement('div');
    sentinel.className='scroll-sentinel';
    sentinel.setAttribute('aria-hidden','true');
    document.body.prepend(sentinel);
    const obs=new IntersectionObserver(([entry])=>header.classList.toggle('scrolled',!entry.isIntersecting),{threshold:0});
    obs.observe(sentinel);
  }

  if(menu&&nav){
    const regions=[main,footer].filter(Boolean);
    let scrollLocked=false;
    let lockedScrollY=0;

    const setScrollLock=open=>{
      const shouldLock=open&&mobile.matches;
      if(shouldLock&&!scrollLocked){
        lockedScrollY=window.scrollY||window.pageYOffset||0;
        document.documentElement.classList.add('menu-open');
        document.body.classList.add('menu-open');
        document.body.style.position='fixed';
        document.body.style.top=`-${lockedScrollY}px`;
        document.body.style.left='0';
        document.body.style.right='0';
        document.body.style.width='100%';
        scrollLocked=true;
        return;
      }
      if(!shouldLock&&scrollLocked){
        document.documentElement.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('left');
        document.body.style.removeProperty('right');
        document.body.style.removeProperty('width');
        const y=lockedScrollY;
        scrollLocked=false;
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'})));
      }else if(!shouldLock){
        document.documentElement.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
      }
    };

    const setMenu=(open,restore=false)=>{
      nav.classList.toggle('open',open);
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',open?'Chiudi menu':'Apri menu');
      regions.forEach(r=>r.toggleAttribute('inert',open&&mobile.matches));
      setScrollLock(open);
      if(restore)menu.focus();
    };

    menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')setMenu(false,true)});
    mobile.addEventListener('change',()=>setMenu(false));
    window.addEventListener('pageshow',()=>setMenu(false));
  }

  if(!reduceMotion.matches&&'IntersectionObserver' in window){
    const nodes=[...document.querySelectorAll('[data-reveal]')];
    nodes.forEach(n=>n.classList.add('reveal'));
    const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in');obs.unobserve(entry.target)}
    }),{threshold:.06,rootMargin:'0px 0px -4% 0px'});
    nodes.forEach(n=>obs.observe(n));
  }

  document.querySelectorAll('[data-motion-study]').forEach(v=>{
    if(reduceMotion.matches){v.pause();v.removeAttribute('autoplay');return;}
    if('IntersectionObserver' in window){
      const obs=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting)v.play().catch(()=>{});else v.pause();
      }),{rootMargin:'100px'});
      obs.observe(v);
    }else v.play().catch(()=>{});
  });

  const dialog=document.querySelector('#cookie-settings');
  if(dialog&&typeof dialog.showModal==='function'){
    document.querySelectorAll('[data-cookie-open]').forEach(b=>b.addEventListener('click',()=>{if(!dialog.open)dialog.showModal()}));
    dialog.addEventListener('click',e=>{
      if(e.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(!(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom))dialog.close();
    });
  }
})();
