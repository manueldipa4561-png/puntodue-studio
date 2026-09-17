/* Punto Due Studio — consolidated case-study runtime.
   Preserves historical execution order: handoff setup first, section choreography second. */
(() => {
  if(!document.body.classList.contains('case-study-page'))return;

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
})();

(() => {
  const caseMain = document.querySelector('.case-study-page .case-main');
  if (!caseMain) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('case-choreography-v11-ready');

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const sections = [...caseMain.querySelectorAll(':scope > .case-section')];
  const next = caseMain.querySelector(':scope > .case-next');

  sections.forEach((section, index) => {
    section.classList.add('case-flow-v11');
    section.dataset.caseFlowIndex = String(index + 1).padStart(2, '0');
    const content = section.querySelector(':scope > .container');
    if (content) content.classList.add('case-flow-content-v11');

    const bridge = document.createElement('span');
    bridge.className = 'case-flow-bridge-v11';
    bridge.setAttribute('aria-hidden', 'true');
    bridge.innerHTML = '<i></i><b></b>';
    section.appendChild(bridge);
  });

  if (next) {
    next.classList.add('case-next-v11');
    const nextLink = next.querySelector('.case-next-link');
    if (nextLink) nextLink.classList.add('case-next-link-v11');
  }

  if (reduceMotion.matches) {
    sections.forEach(section => section.classList.add('is-case-entered'));
    next?.classList.add('is-case-next-ready');
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-case-entered');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });
    sections.forEach(section => observer.observe(section));
    if (next) observer.observe(next);
  } else {
    sections.forEach(section => section.classList.add('is-case-entered'));
    next?.classList.add('is-case-entered');
  }

  let raf = 0;
  const render = () => {
    raf = 0;
    const vh = Math.max(1, window.innerHeight);

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const direction = clamp((center - vh / 2) / (vh * .88), -1, 1);
      const proximity = 1 - clamp(Math.abs(center - vh / 2) / (vh * .95), 0, 1);
      const bridge = clamp((vh * 1.14 - rect.bottom) / (vh * .62), 0, 1);

      section.style.setProperty('--pd-flow-y', `${(direction * 4.6).toFixed(2)}px`);
      section.style.setProperty('--pd-flow-rx', `${(-direction * .52).toFixed(3)}deg`);
      section.style.setProperty('--pd-flow-z', `${(proximity * 5.5).toFixed(2)}px`);
      section.style.setProperty('--pd-bridge-progress', bridge.toFixed(4));
      section.classList.toggle('is-case-current', rect.top < vh * .62 && rect.bottom > vh * .38);
    });

    if (next) {
      const rect = next.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh * .7), 0, 1);
      next.style.setProperty('--pd-next-y', `${((1 - progress) * 24).toFixed(2)}px`);
      next.style.setProperty('--pd-next-rx', `${((1 - progress) * 1.65).toFixed(3)}deg`);
      next.style.setProperty('--pd-next-z', `${(progress * 10).toFixed(2)}px`);
      next.style.setProperty('--pd-next-line', progress.toFixed(4));
      next.style.setProperty('--pd-next-arrow', `${(progress * 7).toFixed(2)}px`);
      next.classList.toggle('is-case-next-ready', progress > .12);
    }
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(render);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule, { passive: true });
  render();
})();
