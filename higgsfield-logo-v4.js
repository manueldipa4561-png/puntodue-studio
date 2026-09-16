/* Punto Due Studio — direct Higgsfield animated GLB integration */
(() => {
  const stage=document.querySelector('.identity-demo .logo-stage[data-logo-orbit]');
  if(!stage)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader=document.createElement('script');
  loader.type='module';
  loader.src='https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
  loader.addEventListener('error',()=>stage.classList.add('glb-fallback'));
  document.head.appendChild(loader);
  const viewer=document.createElement('model-viewer');
  viewer.setAttribute('src','https://d2ol7oe51mr4n9.cloudfront.net/user_3JN4lq7KBj4c3qEQUgSkbrftgrd/be3bf622-8ee6-439c-aba9-7375257af880.glb');
  viewer.setAttribute('camera-controls','');
  viewer.setAttribute('interaction-prompt','none');
  viewer.setAttribute('shadow-intensity','.45');
  viewer.setAttribute('exposure','1.05');
  viewer.setAttribute('camera-orbit','0deg 78deg 7m');
  viewer.setAttribute('min-camera-orbit','auto 48deg 4.5m');
  viewer.setAttribute('max-camera-orbit','auto 115deg 9m');
  if(!reduced){viewer.setAttribute('autoplay','');viewer.setAttribute('auto-rotate','');viewer.setAttribute('rotation-per-second','8deg');}
  viewer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:3;background:transparent;--poster-color:transparent;touch-action:pan-y;';
  viewer.setAttribute('aria-label','Logo tridimensionale animato Punto Due: i tracciati P e D si separano nello spazio e tornano a comporre il monogramma');
  let activated=false;
  const activate=()=>{
    if(activated)return; activated=true;
    stage.classList.add('higgsfield-glb-ready');
    const canvas=stage.querySelector('.logo-orbit-canvas'); if(canvas)canvas.style.opacity='0';
    const fallback=stage.querySelector('.stage-fallback'); if(fallback)fallback.style.opacity='0';
    if(reduced&&typeof viewer.pause==='function')viewer.pause();
  };
  viewer.addEventListener('load',activate,{once:true});
  viewer.addEventListener('error',()=>{viewer.remove();stage.classList.add('glb-fallback')},{once:true});
  stage.appendChild(viewer);
  customElements.whenDefined('model-viewer').then(()=>{
    if(viewer.loaded){activate();return;}
    let checks=0;
    const timer=setInterval(()=>{
      if(viewer.loaded){clearInterval(timer);activate();}
      else if(++checks>60)clearInterval(timer);
    },100);
  }).catch(()=>stage.classList.add('glb-fallback'));
})();
