/* Punto Due Studio - shared production interaction layer */
(() => {
  /* Production loading policy: keep shared essentials global; scope heavy/specialist layers. */
  const isHome = Boolean(document.querySelector('.home-hero'));
  const isCaseStudy = document.body.classList.contains('case-study-page');
  const hasCore2026 = Boolean(document.querySelector('link[href="/site-core-2026.css"]'));
  const hasLegacyV5 = Boolean(document.querySelector('link[href="/site-v5.css"]'));

  const loadStyle = href => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  const loadScript = src => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

  const afterInitialLoad = callback => {
    const run = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(callback, { timeout: 700 });
      else setTimeout(callback, 0);
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  };

  if (hasCore2026) {
    if (isHome) afterInitialLoad(() => loadScript('/site-v9.js'));
    else loadScript('/site-v9.js');
  } else if (hasLegacyV5) {
    ['/site-v5-fixes.css','/site-v6.css','/mobile-menu-hotfix.css','/site-v9.css'].forEach(loadStyle);
    loadScript('/site-v9.js');
  }

  /* Case-study choreography belongs only to case studies. */
  if (isCaseStudy) {
    ['/site-v11.css','/site-v12.css','/site-v13.css'].forEach(loadStyle);
    loadScript('/site-v11.js');
  }

  /* The spatial field is progressive enhancement: static visual first, WebGL after real user intent. */
  if (isHome) {
    loadStyle('/spatial-2026.css');
    afterInitialLoad(() => {
      loadScript('/dual-field-v5.js');
      loadScript('/portfolio-v8.js');
    });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduceMotion.matches) {
      let fieldQueued = false;
      const activateSpatialField = () => {
        if (fieldQueued) return;
        fieldQueued = true;
        ['pointermove','touchstart','scroll','keydown'].forEach(type => {
          window.removeEventListener(type, activateSpatialField);
        });
        const load = () => loadScript('/experience-field.js');
        if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1200 });
        else setTimeout(load, 180);
      };
      ['pointermove','touchstart','scroll','keydown'].forEach(type => {
        window.addEventListener(type, activateSpatialField, { passive: true, once: true });
      });
    }
  }

  const header=document.querySelector('.site-header');
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.site-nav');
  const main=document.querySelector('main');
  const footer=document.querySelector('footer');
  const mobile=window.matchMedia('(max-width:760px)');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');

  /* v12/v13: carry the case-study exit into a softer, continuous next-case entry. */
  if(document.body.classList.contains('case-study-page')){
    const root=document.documentElement;
    const supportsCrossDoc='onpageswap' in window&&'onpagereveal' in window;
    const nativeCaseHandoff=false;
    const prefersReduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!nativeCaseHandoff)root.classList.add('no-cross-doc-vt');

    const storageKey='pd-case-handoff-v12';
    const normalize=url=>{
      const path=new URL(url,location.href).pathname.replace(/\/$/,'')||'/';
      return path.endsWith('.html')?path.slice(0,-5):path;
    };
    const isCaseDestination=pathname=>/^\/progetti\/(?:nodo|innesto|trama-zero)$/.test(pathname);
    const readToken=()=>{
      try{return JSON.parse(sessionStorage.getItem(storageKey)||'null')}catch{return null}
    };
    const writeToken=value=>{
      try{sessionStorage.setItem(storageKey,JSON.stringify(value))}catch{}
    };
    const clearToken=()=>{try{sessionStorage.removeItem(storageKey)}catch{}};

    const currentPath=normalize(location.href);
    const heroTitle=document.querySelector('.case-title-wrap h1');
    const heroMeta=document.querySelector('.case-kicker');
    const firstCaseSection=document.querySelector('.case-main > .case-section');
    const incoming=readToken();

    if(prefersReduced()){
      clearToken();
    }else if(incoming&&isCaseDestination(currentPath)&&incoming.to===currentPath&&Date.now()-incoming.at<10000){
      document.body.classList.add('case-handoff-incoming-v12');
      root.dataset.caseHandoff='incoming';
      if(nativeCaseHandoff&&heroTitle)heroTitle.style.viewTransitionName='case-title-handoff';
      if(nativeCaseHandoff&&heroMeta)heroMeta.style.viewTransitionName='case-meta-handoff';
      if(firstCaseSection){
        firstCaseSection.classList.add('case-first-after-handoff-v13');
        firstCaseSection.addEventListener('animationend',event=>{
          if(event.animationName==='pd-case-first-section-settle-v13')firstCaseSection.classList.remove('case-first-after-handoff-v13');
        });
      }
      clearToken();

      let settleStarted=false;
      let cleaned=false;
      const finishIncoming=()=>{
        if(cleaned)return;
        cleaned=true;
        if(heroTitle)heroTitle.style.removeProperty('view-transition-name');
        if(heroMeta)heroMeta.style.removeProperty('view-transition-name');
        document.body.classList.remove('case-handoff-incoming-v12','is-case-handoff-settling-v13','is-case-handoff-entered-v12');
        root.removeAttribute('data-case-handoff');
      };
      const beginIncomingSettle=()=>{
        if(settleStarted||prefersReduced())return;
        settleStarted=true;
        document.body.classList.add('is-case-handoff-settling-v13');
        requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('is-case-handoff-entered-v12')));
        setTimeout(finishIncoming,1040);
      };

      if(nativeCaseHandoff&&supportsCrossDoc){
        addEventListener('pagereveal',event=>{
          if(event.viewTransition)event.viewTransition.finished.then(beginIncomingSettle,beginIncomingSettle);
          else setTimeout(beginIncomingSettle,90);
        },{once:true});
        setTimeout(beginIncomingSettle,1260);
      }else{
        setTimeout(beginIncomingSettle,90);
      }
    }else if(incoming){
      clearToken();
    }

    const nextLink=document.querySelector('.case-next-link');
    if(nextLink){
      if(location.protocol==='https:'&&location.hostname==='puntoduestudio.it'){
        const prettyPath=normalize(nextLink.href);
        if(isCaseDestination(prettyPath))nextLink.setAttribute('href',prettyPath);
      }
      const nextTitle=nextLink.querySelector('strong');
      const nextMeta=nextLink.querySelector('span');

      const armHandoff=destination=>{
        writeToken({from:currentPath,to:normalize(destination.href),at:Date.now()});
        document.body.classList.add('case-handoff-outgoing-v12');
        root.dataset.caseHandoff='outgoing';
        if(nativeCaseHandoff&&nextTitle)nextTitle.style.viewTransitionName='case-title-handoff';
        if(nativeCaseHandoff&&nextMeta)nextMeta.style.viewTransitionName='case-meta-handoff';
      };

      const disarmHandoff=()=>{
        document.body.classList.remove('case-handoff-outgoing-v12');
        root.removeAttribute('data-case-handoff');
        if(nextTitle)nextTitle.style.removeProperty('view-transition-name');
        if(nextMeta)nextMeta.style.removeProperty('view-transition-name');
      };

      nextLink.addEventListener('click',event=>{
        if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        if(nextLink.target&&nextLink.target!=='_self')return;
        const destination=new URL(nextLink.href,location.href);
        const destinationPath=normalize(destination.href);
        if(destination.origin!==location.origin||!isCaseDestination(destinationPath)){
          clearToken();
          disarmHandoff();
          return;
        }
        if(prefersReduced()){
          clearToken();
          disarmHandoff();
          return;
        }

        armHandoff(destination);
        if(!nativeCaseHandoff){
          event.preventDefault();
          setTimeout(()=>location.assign(destination.href),260);
        }
      });

      nextLink.addEventListener('keydown',event=>{
        if(event.key==='Escape'){
          clearToken();
          disarmHandoff();
        }
      });

      addEventListener('pageshow',event=>{
        if(event.persisted){
          clearToken();
          disarmHandoff();
        }
      });
    }
  }

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

  const need=[...document.querySelectorAll('input[name="need"]')];
  const stage=[...document.querySelectorAll('input[name="stage"]')];
  const message=document.querySelector('#brief-message');
  const projectEmail=document.querySelector('#brief-projects');
  const briefWhatsapp=document.querySelector('#brief-whatsapp');
  if(message&&need.length&&stage.length){
    const needPhrases={
      'un nuovo sito':'creare un nuovo sito',
      'un redesign del sito attuale':'ripensare il sito che uso oggi',
      'un progetto ecommerce':'realizzare un progetto ecommerce',
      'capire quale soluzione web è più adatta':'capire quale soluzione web sia più adatta'
    };
    const update=()=>{
      const n=need.find(x=>x.checked)?.value||'capire quale soluzione web è più adatta';
      const s=stage.find(x=>x.checked)?.value||'sto valutando il punto di partenza';
      const action=needPhrases[n]||n;
      const text=`Ciao! Sto valutando di ${action}. Al momento ${s}. Possiamo sentirci per capire quale direzione avrebbe più senso per il progetto?`;
      message.textContent=text;
      const enc=encodeURIComponent(text);
      const subject=encodeURIComponent('Nuovo progetto — Punto Due Studio');
      if(projectEmail)projectEmail.href=`mailto:projects@puntoduestudio.it?subject=${subject}&body=${enc}`;
      if(briefWhatsapp)briefWhatsapp.href=`https://wa.me/393248423657?text=${enc}`;
    };
    [...need,...stage].forEach(i=>i.addEventListener('change',update));
    update();
  }
})();
