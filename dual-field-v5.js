/* Punto Due Studio v5 - abstract Dual Field interaction */
(() => {
  const stages=[...document.querySelectorAll('[data-logo-orbit],[data-dual-field]')];
  if(!stages.length)return;

  const MODEL_URL='https://d2ol7oe51mr4n9.cloudfront.net/user_3JN4lq7KBj4c3qEQUgSkbrftgrd/a69b759b-2f16-4f9a-b8e1-2085e8619470.glb';
  const MODEL_VIEWER='https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  const mount=stage=>{
    if(stage.dataset.dualFieldMounted==='true')return;
    stage.dataset.dualFieldMounted='true';
    stage.classList.add('dual-field-stage');

    stage.querySelectorAll('canvas.logo-orbit-canvas').forEach(n=>n.remove());
    const top=stage.querySelector('.stage-top');
    const bottom=stage.querySelector('.stage-bottom');
    const isHero=stage.classList.contains('hero-object-stage');
    if(top)top.innerHTML=isHero
      ? '<span>Realtime 3D / WebGL</span><span>Trascina per esplorare</span>'
      : '<span>Dual Field / scultura digitale</span><span>Trascina per esplorare</span>';
    if(bottom)bottom.innerHTML=isHero
      ? '<strong>Strategia.<br>Art direction.<br>Sviluppo.</strong><span>Interactive object / 2026</span>'
      : '<strong>Due forme.<br>Un sistema.</strong><span>Interactive object / 2026</span>';
    stage.setAttribute('aria-label',isHero
      ? 'Oggetto tridimensionale astratto e interattivo che rappresenta strategia, design e sviluppo di Punto Due Studio'
      : 'Scultura tridimensionale astratta e interattiva di Punto Due Studio');

    const viewer=document.createElement('model-viewer');
    viewer.src=MODEL_URL;
    viewer.alt='Scultura tridimensionale astratta di Punto Due Studio';
    viewer.setAttribute('camera-controls','');
    viewer.setAttribute('interaction-prompt','none');
    viewer.setAttribute('shadow-intensity','0.7');
    viewer.setAttribute('exposure','1.05');
    viewer.setAttribute('environment-image','neutral');
    viewer.setAttribute('camera-orbit','18deg 72deg 112%');
    viewer.setAttribute('min-camera-orbit','auto 45deg 82%');
    viewer.setAttribute('max-camera-orbit','auto 96deg 145%');
    viewer.setAttribute('field-of-view','31deg');
    viewer.setAttribute('touch-action','pan-y');
    viewer.setAttribute('loading','lazy');
    viewer.setAttribute('reveal','auto');
    if(!reduce.matches){
      viewer.setAttribute('autoplay','');
      viewer.setAttribute('auto-rotate','');
      viewer.setAttribute('auto-rotate-delay',isHero?'500':'1200');
      viewer.setAttribute('rotation-per-second',isHero?'10deg':'8deg');
    }
    viewer.addEventListener('load',()=>stage.classList.add('dual-field-ready'),{once:true});
    stage.appendChild(viewer);
  };

  const ensureModelViewer=()=>{
    if(customElements.get('model-viewer')){stages.forEach(mount);return;}
    let script=document.querySelector('script[data-pds-model-viewer]');
    if(script){script.addEventListener('load',()=>stages.forEach(mount),{once:true});return;}
    script=document.createElement('script');
    script.type='module';
    script.src=MODEL_VIEWER;
    script.dataset.pdsModelViewer='true';
    script.addEventListener('load',()=>stages.forEach(mount),{once:true});
    document.head.appendChild(script);
  };

  // Keep the 3D sculpture as progressive enhancement. The static fallback is immediate;
  // model-viewer and the GLB are loaded only after explicit user intent.
  const armStage=stage=>{
    if(reduce.matches)return;
    let activated=false;
    const activate=()=>{
      if(activated)return;
      activated=true;
      stage.removeEventListener('pointermove',activate);
      stage.removeEventListener('pointerdown',activate);
      stage.removeEventListener('touchstart',activate);
      ensureModelViewer();
    };
    stage.addEventListener('pointermove',activate,{passive:true,once:true});
    stage.addEventListener('pointerdown',activate,{passive:true,once:true});
    stage.addEventListener('touchstart',activate,{passive:true,once:true});
  };
  stages.forEach(armStage);
})();
