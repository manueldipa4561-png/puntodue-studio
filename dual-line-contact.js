/* Punto Due Studio — Dual Line interactive contact object */
(() => {
  const root=document.querySelector('[data-dual-line-contact]');
  if(!root)return;

  const stage=root.querySelector('[data-dual-line-stage]');
  const routes=[...root.querySelectorAll('[data-dual-line-route]')];
  if(!stage)return;

  const MODEL_URL='/assets/dual-signal-contact.glb';
  const MODEL_VIEWER='https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(pointer:fine)');
  let viewer=null;
  let visible=false;

  const setActive=route=>{
    root.dataset.active=route||'';
    if(!viewer||reduce.matches)return;
    const orbit=route==='line01'
      ? '-18deg 70deg 116%'
      : route==='line02'
        ? '18deg 70deg 116%'
        : '0deg 70deg 118%';
    viewer.setAttribute('camera-orbit',orbit);
  };

  routes.forEach(link=>{
    const route=link.dataset.dualLineRoute;
    link.addEventListener('pointerenter',()=>setActive(route));
    link.addEventListener('focus',()=>setActive(route));
    link.addEventListener('pointerleave',()=>setActive(''));
    link.addEventListener('blur',()=>setActive(''));
  });

  const syncMotion=()=>{
    if(!viewer)return;
    if(!reduce.matches&&visible){
      viewer.setAttribute('auto-rotate','');
      viewer.setAttribute('auto-rotate-delay','1100');
      viewer.setAttribute('rotation-per-second','4deg');
    }else{
      viewer.removeAttribute('auto-rotate');
    }
  };

  const mount=()=>{
    if(stage.dataset.dualLineMounted==='true')return;
    stage.dataset.dualLineMounted='true';

    viewer=document.createElement('model-viewer');
    viewer.src=MODEL_URL;
    viewer.alt='Due forme tridimensionali: Linea 01 per la chiamata e Linea 02 per WhatsApp';
    viewer.setAttribute('camera-controls','');
    viewer.setAttribute('interaction-prompt','none');
    viewer.setAttribute('shadow-intensity','0.35');
    viewer.setAttribute('exposure','1.08');
    viewer.setAttribute('environment-image','neutral');
    viewer.setAttribute('camera-orbit','0deg 70deg 118%');
    viewer.setAttribute('min-camera-orbit','auto 54deg 96%');
    viewer.setAttribute('max-camera-orbit','auto 88deg 138%');
    viewer.setAttribute('field-of-view','29deg');
    viewer.setAttribute('touch-action','pan-y');
    viewer.setAttribute('loading','lazy');
    viewer.setAttribute('reveal','auto');

    viewer.addEventListener('load',()=>{
      root.classList.add('dual-line-ready');
      syncMotion();
    },{once:true});

    stage.prepend(viewer);

    if(!reduce.matches&&fine.matches){
      stage.addEventListener('pointermove',e=>{
        if(root.dataset.active)return;
        const rect=stage.getBoundingClientRect();
        const x=(e.clientX-rect.left)/rect.width-.5;
        const y=(e.clientY-rect.top)/rect.height-.5;
        stage.style.setProperty('--dual-x',`${x*8}px`);
        stage.style.setProperty('--dual-y',`${y*6}px`);
      },{passive:true});
      stage.addEventListener('pointerleave',()=>{
        stage.style.setProperty('--dual-x','0px');
        stage.style.setProperty('--dual-y','0px');
      });
    }
  };

  const loadViewer=()=>{
    if(customElements.get('model-viewer')){mount();return;}
    let script=document.querySelector('script[data-pds-model-viewer]');
    if(script){
      script.addEventListener('load',mount,{once:true});
      return;
    }
    script=document.createElement('script');
    script.type='module';
    script.src=MODEL_VIEWER;
    script.dataset.pdsModelViewer='true';
    script.addEventListener('load',mount,{once:true});
    document.head.appendChild(script);
  };

  if('IntersectionObserver' in window){
    const mountObserver=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        loadViewer();
        mountObserver.disconnect();
      }
    },{rootMargin:'240px'});
    mountObserver.observe(root);

    const visibilityObserver=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      syncMotion();
    },{threshold:.05});
    visibilityObserver.observe(root);
  }else{
    visible=true;
    loadViewer();
  }

  reduce.addEventListener?.('change',syncMotion);
})();
