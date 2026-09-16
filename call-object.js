/* Punto Due Studio - interactive call object */
(() => {
  const stage=document.querySelector('[data-call-object]');
  if(!stage)return;

  const MODEL_URL='https://d2ol7oe51mr4n9.cloudfront.net/user_3JN4lq7KBj4c3qEQUgSkbrftgrd/eeb88167-ca44-469a-b3d4-ddec53991a59.glb';
  const MODEL_VIEWER='https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');

  const mount=()=>{
    if(stage.dataset.callObjectMounted==='true')return;
    stage.dataset.callObjectMounted='true';
    const viewer=document.createElement('model-viewer');
    viewer.src=MODEL_URL;
    viewer.alt='Oggetto tridimensionale astratto ispirato a una conversazione digitale';
    viewer.setAttribute('camera-controls','');
    viewer.setAttribute('interaction-prompt','none');
    viewer.setAttribute('shadow-intensity','0.8');
    viewer.setAttribute('exposure','1.05');
    viewer.setAttribute('environment-image','neutral');
    viewer.setAttribute('camera-orbit','22deg 72deg 115%');
    viewer.setAttribute('min-camera-orbit','auto 46deg 86%');
    viewer.setAttribute('max-camera-orbit','auto 96deg 145%');
    viewer.setAttribute('field-of-view','30deg');
    viewer.setAttribute('touch-action','pan-y');
    viewer.setAttribute('loading','eager');
    viewer.setAttribute('reveal','auto');
    viewer.setAttribute('autoplay','');
    if(!reduce.matches){
      viewer.setAttribute('auto-rotate','');
      viewer.setAttribute('auto-rotate-delay','1500');
      viewer.setAttribute('rotation-per-second','6deg');
    }
    viewer.addEventListener('load',()=>stage.classList.add('call-object-ready'),{once:true});
    stage.appendChild(viewer);

    if(!reduce.matches&&window.matchMedia('(pointer:fine)').matches){
      stage.addEventListener('pointermove',e=>{
        const r=stage.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        stage.style.setProperty('--call-x',`${x*10}px`);
        stage.style.setProperty('--call-y',`${y*10}px`);
      });
      stage.addEventListener('pointerleave',()=>{
        stage.style.setProperty('--call-x','0px');
        stage.style.setProperty('--call-y','0px');
      });
    }
  };

  const loadViewer=()=>{
    if(customElements.get('model-viewer')){mount();return;}
    let script=document.querySelector('script[data-pds-model-viewer]');
    if(script){script.addEventListener('load',mount,{once:true});return;}
    script=document.createElement('script');
    script.type='module';
    script.src=MODEL_VIEWER;
    script.dataset.pdsModelViewer='true';
    script.addEventListener('load',mount,{once:true});
    document.head.appendChild(script);
  };

  if('IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){loadViewer();obs.disconnect();}
    },{rootMargin:'300px'});
    obs.observe(stage);
  }else loadViewer();
})();
