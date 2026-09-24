const body=document.body;
const html=document.documentElement;
const header=document.querySelector('[data-header]');
const menuButton=document.querySelector('.menu-trigger');
const menu=document.getElementById('mobile-menu');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lockedY=0;

const lockPage=()=>{
  lockedY=window.scrollY;
  body.classList.add('menu-open');
  Object.assign(body.style,{position:'fixed',top:`-${lockedY}px`,left:'0',right:'0',width:'100%'});
  html.style.overflow='hidden';
};
const unlockPage=()=>{
  body.classList.remove('menu-open');
  Object.assign(body.style,{position:'',top:'',left:'',right:'',width:''});
  html.style.overflow='';
  const y=lockedY;
  const prevBehavior=html.style.scrollBehavior;
  html.style.scrollBehavior='auto';
  window.scrollTo(0,y);
  requestAnimationFrame(()=>{html.style.scrollBehavior=prevBehavior});
};
const closeMenu=()=>{
  if(!body.classList.contains('menu-open')) return;
  menu?.setAttribute('aria-hidden','true');
  menuButton?.setAttribute('aria-expanded','false');
  unlockPage();
};
menuButton?.addEventListener('click',()=>{
  if(body.classList.contains('menu-open')) return closeMenu();
  menu?.setAttribute('aria-hidden','false');
  menuButton.setAttribute('aria-expanded','true');
  lockPage();
});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

const syncHeader=()=>{if(header&&!header.classList.contains('site-header--solid'))header.classList.toggle('is-scrolled',scrollY>40)};
syncHeader();addEventListener('scroll',syncHeader,{passive:true});

if(!reduceMotion){
  const hero=document.querySelector('.hero-image img');
  if(hero)addEventListener('scroll',()=>{hero.style.transform=`scale(1.025) translate3d(0,${Math.min(scrollY*.025,22)}px,0)`},{passive:true});
}

const demoForm=document.querySelector('[data-demo-form]');
demoForm?.addEventListener('submit',e=>{
  e.preventDefault();
  const note=demoForm.querySelector('[data-form-note]');
  if(note){note.textContent='Concept portfolio — nessun dato è stato inviato.';note.classList.add('is-confirmed')}
});

const compare=document.querySelector('[data-compare]');
if(compare){
  const input=compare.querySelector('input[type="range"]');
  input?.addEventListener('input',()=>compare.style.setProperty('--split',`${input.value}%`));
}

const stage=document.querySelector('[data-section-stage]');
const motionVideo=document.querySelector('[data-section-motion]');
const canvas=document.getElementById('section-canvas');
const phaseButtons=[...document.querySelectorAll('[data-phase]')];
const caption=document.querySelector('[data-phase-caption]');
let desiredPhase=0;
let motionInView=false;
const phaseTimes=[.08,1.55,3.05,4.55];

const safePlay=()=>{
  if(!motionVideo||reduceMotion||!motionInView)return;
  const p=motionVideo.play();
  if(p?.catch)p.catch(()=>stage?.classList.add('motion-paused'));
};
const seekMotion=i=>{
  if(!stage)return;
  stage.dataset.motionPhase=String(i+1);
  if(!motionVideo||!Number.isFinite(motionVideo.duration)||motionVideo.duration<=0)return;
  motionVideo.currentTime=Math.min(phaseTimes[i]??0,Math.max(0,motionVideo.duration-.12));
  safePlay();
};

if(stage&&motionVideo){
  stage.dataset.motionSource='higgsfield';
  stage.dataset.motionStatus=reduceMotion?'reduced':'loading';

  if(reduceMotion){
    motionVideo.pause();
    motionVideo.removeAttribute('autoplay');
  }else{
    motionVideo.addEventListener('loadedmetadata',()=>{
      stage.dataset.motionDuration=motionVideo.duration.toFixed(2);
      seekMotion(desiredPhase);
    });
    motionVideo.addEventListener('canplay',()=>{
      stage.classList.add('motion-ready');
      stage.classList.remove('motion-error','motion-paused');
      stage.dataset.motionStatus='ready';
      safePlay();
    });
    motionVideo.addEventListener('playing',()=>{
      stage.classList.add('motion-ready');
      stage.classList.remove('motion-paused');
      stage.dataset.motionStatus='playing';
    });
    motionVideo.addEventListener('error',()=>{
      stage.classList.remove('motion-ready');
      stage.classList.add('motion-error');
      stage.dataset.motionStatus='error';
    });
    new IntersectionObserver(entries=>{
      motionInView=entries[0]?.isIntersecting??false;
      if(motionInView)safePlay();else motionVideo.pause();
    },{rootMargin:'180px'}).observe(stage);
  }

  const stopInteraction=()=>stage.classList.remove('motion-interacting');
  stage.addEventListener('pointerdown',()=>stage.classList.add('motion-interacting'));
  stage.addEventListener('pointerup',stopInteraction);
  stage.addEventListener('pointercancel',stopInteraction);
  stage.addEventListener('pointerleave',stopInteraction);
}

if(stage){
  const labels=['01 / ESISTENTE','02 / STRUTTURA','03 / IMPIANTI','04 / MATERIA'];
  const setPhaseUI=i=>{
    desiredPhase=i;
    phaseButtons.forEach((b,n)=>{b.classList.toggle('is-active',n===i);b.setAttribute('aria-pressed',String(n===i))});
    if(caption)caption.textContent=labels[i];
    seekMotion(i);
  };
  phaseButtons.forEach((b,i)=>b.addEventListener('click',()=>setPhaseUI(i)));
}

if(stage&&canvas&&!reduceMotion){
  const startScene=async()=>{
    try{
      const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
      const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
      renderer.setClearColor(0x000000,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.02;
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(7.5,-8.35,6.35);
      const root=new THREE.Group();root.rotation.z=-.035;root.scale.setScalar(1.08);scene.add(root);

      scene.add(new THREE.HemisphereLight(0xf6ead9,0x20211d,2.65));
      const key=new THREE.DirectionalLight(0xffe8cd,5.2);key.position.set(4,-4,8);scene.add(key);
      const rim=new THREE.PointLight(0xb64a27,22,14,1.6);rim.position.set(-4,2,4);scene.add(rim);

      const mats={
        existing:new THREE.MeshStandardMaterial({color:0x77736b,roughness:.86,transparent:true}),
        structure:new THREE.MeshStandardMaterial({color:0x181915,roughness:.36,metalness:.56,transparent:true}),
        copper:new THREE.MeshStandardMaterial({color:0xb64a27,roughness:.38,metalness:.45,transparent:true}),
        blue:new THREE.MeshStandardMaterial({color:0x205864,roughness:.4,metalness:.22,transparent:true}),
        plaster:new THREE.MeshStandardMaterial({color:0xd4c8b6,roughness:.7,transparent:true}),
        oak:new THREE.MeshStandardMaterial({color:0x5a3421,roughness:.67,transparent:true}),
        trav:new THREE.MeshStandardMaterial({color:0xb8a785,roughness:.62,transparent:true}),
        glass:new THREE.MeshPhysicalMaterial({color:0x70898a,roughness:.18,transmission:.4,transparent:true,opacity:.38,side:THREE.DoubleSide})
      };
      const groups=[0,1,2,3].map(()=>new THREE.Group());groups.forEach(g=>root.add(g));
      const addBox=(g,size,pos,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.set(...pos);g.add(m);return m};
      const addPipe=(g,a,b,r,mat)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),18),mat);m.position.copy(va.clone().add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());g.add(m);return m};

      addBox(groups[0],[7.6,5.3,.14],[0,0,.08],mats.existing);addBox(groups[0],[7.6,.16,3.05],[0,2.57,1.55],mats.existing);addBox(groups[0],[.16,5.3,3.05],[-3.72,0,1.55],mats.existing);addBox(groups[0],[.16,2.2,3.05],[3.72,1.55,1.55],mats.existing);addBox(groups[0],[.16,1.4,3.05],[3.72,-2.0,1.55],mats.existing);addBox(groups[0],[.45,.45,3.0],[1.25,1.45,1.55],mats.existing);
      [-1.55,1.55].forEach(x=>addBox(groups[1],[.17,.17,3.25],[x,.1,1.66],mats.structure));addBox(groups[1],[3.3,.17,.17],[0,.1,3.2],mats.structure);addBox(groups[1],[4.0,2.7,.14],[-1.2,-1.0,2.0],mats.structure);
      for(let i=0;i<8;i++)addBox(groups[1],[1.05,.25,.07],[1.85,-2.0+i*.28,.29+i*.235],mats.structure);
      [-.65,-.35,-.05].forEach((x,i)=>addPipe(groups[2],[x,2.05,.35],[x,2.05,2.8],.055,i===2?mats.blue:mats.copper));[.6,1.1,1.6].forEach((z,i)=>addPipe(groups[2],[-.6,2.05,z],[2.5,2.05,z],.045,i===2?mats.blue:mats.copper));addBox(groups[2],[1.0,1.55,2.7],[2.55,1.5,1.4],mats.plaster);
      addBox(groups[3],[6.4,4.2,.10],[0,-.15,.18],mats.trav);addBox(groups[3],[1.0,1.75,2.45],[2.1,.82,1.26],mats.oak);addBox(groups[3],[2.55,1.0,1.0],[-1.2,1.55,.62],mats.structure);addBox(groups[3],[1.8,.8,.8],[-.5,.1,.5],mats.trav);addBox(groups[3],[2.4,.06,2.75],[1.95,-1.55,1.45],mats.glass);addBox(groups[3],[5.4,3.8,.08],[-.8,.5,3.43],mats.plaster);

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(10,8),new THREE.MeshStandardMaterial({color:0x10110e,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.01;scene.add(ground);
      const ringMat=new THREE.MeshStandardMaterial({color:0xb64a27,roughness:.35,metalness:.2});const ring=new THREE.Mesh(new THREE.TorusGeometry(4.15,.012,8,120),ringMat);ring.rotation.x=Math.PI/2;ring.position.y=.06;scene.add(ring);

      const targets=[
        [[0,0,0],[.25,.45,.1],[1.85,.8,.65],[-1.2,.2,1.05]],
        [[0,0,0],[0,0,.1],[1.6,.65,.55],[-1.0,.2,.9]],
        [[0,0,0],[0,0,.05],[.3,.15,.2],[-.75,.1,.7]],
        [[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
      ];
      const opacities=[
        [1,.16,.08,.06],
        [1,1,.14,.08],
        [.55,.85,1,.12],
        [.38,.5,.45,1]
      ];

      let targetRotX=.38,targetRotY=-.62,rotX=targetRotX,rotY=targetRotY,drag=false,lastX=0,lastY=0,visible=true;
      const pointer={x:0,y:0};
      const setMatOpacity=(g,value)=>g.traverse(o=>{if(o.isMesh&&o.material){o.material.transparent=true;o.material.opacity=value}});
      const resize=()=>{const r=stage.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()};
      resize();new ResizeObserver(resize).observe(stage);
      stage.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture?.(e.pointerId)});
      stage.addEventListener('pointerup',e=>{drag=false;stage.releasePointerCapture?.(e.pointerId)});
      stage.addEventListener('pointercancel',()=>drag=false);
      stage.addEventListener('pointermove',e=>{
        const r=stage.getBoundingClientRect();
        pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2;
        if(drag){targetRotY+=(e.clientX-lastX)*.006;targetRotX=Math.max(-.15,Math.min(.95,targetRotX+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY}
      });
      new IntersectionObserver(e=>visible=e[0]?.isIntersecting??true,{rootMargin:'150px'}).observe(stage);
      const clock=new THREE.Clock();
      const animate=()=>{
        requestAnimationFrame(animate);if(!visible)return;
        const phase=desiredPhase,dt=Math.min(clock.getDelta(),.033),ease=1-Math.pow(.0005,dt);
        groups.forEach((g,i)=>{
          const t=targets[phase][i];
          g.position.x+=(t[0]-g.position.x)*ease;g.position.y+=(t[1]-g.position.y)*ease;g.position.z+=(t[2]-g.position.z)*ease;
          const current=g.userData.opacity??0;const next=current+(opacities[phase][i]-current)*ease;g.userData.opacity=next;setMatOpacity(g,next);
        });
        if(!drag){targetRotY+=pointer.x*.00011;targetRotX+=pointer.y*.00004}
        rotX+=(targetRotX-rotX)*.055;rotY+=(targetRotY-rotY)*.055;root.rotation.x=rotX;root.rotation.y=rotY;
        renderer.render(scene,camera);
      };
      stage.classList.add('is-live');
      stage.dataset.webgl='ready';
      animate();
    }catch(err){
      console.warn('INNESTO Section House WebGL enhancement unavailable; Higgsfield motion remains active.',err);
      stage.dataset.webgl='fallback';
    }
  };
  const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();startScene()}},{rootMargin:'320px'});
  io.observe(stage);
}
