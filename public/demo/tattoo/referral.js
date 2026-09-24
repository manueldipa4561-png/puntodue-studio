import * as THREE from './assets/three.module.js';

const host=document.querySelector('.referral-canvas-host');
const section=document.querySelector('.referral');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

if(host&&section){
  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  }catch(error){
    section.dataset.referralRender='fallback';
  }

  if(renderer){
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.08;
    const canvas=renderer.domElement;
    canvas.className='referral-canvas';
    canvas.setAttribute('aria-hidden','true');
    host.appendChild(canvas);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,40);
    camera.position.set(0,0,8.4);

    scene.add(new THREE.HemisphereLight(0xf3ead8,0x171914,2.2));
    const key=new THREE.DirectionalLight(0xffefe0,3.1);key.position.set(-3,4,5);scene.add(key);
    const rim=new THREE.DirectionalLight(0xb7432f,2.2);rim.position.set(4,-2,2);scene.add(rim);

    const group=new THREE.Group();
    group.rotation.set(-.12,.28,-.08);
    scene.add(group);

    const darkMat=new THREE.MeshStandardMaterial({color:0x252720,roughness:.58,metalness:.34});
    const paperMat=new THREE.MeshStandardMaterial({color:0xe8dfcd,roughness:.7,metalness:.08});
    const redMat=new THREE.MeshStandardMaterial({color:0xb23e2a,roughness:.48,metalness:.25});
    const faintMat=new THREE.MeshBasicMaterial({color:0xb7ae9e,transparent:true,opacity:.32});

    const loopA=new THREE.Mesh(new THREE.TorusGeometry(1.38,.035,10,180),paperMat);
    loopA.rotation.x=.48;loopA.rotation.y=.2;group.add(loopA);
    const loopB=new THREE.Mesh(new THREE.TorusGeometry(1.08,.045,10,180),redMat);
    loopB.rotation.x=-.3;loopB.rotation.y=.62;loopB.position.set(.56,.08,.08);group.add(loopB);

    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55,-.9,.05),
      new THREE.Vector3(-.75,.45,.18),
      new THREE.Vector3(.05,-.1,.48),
      new THREE.Vector3(.72,.78,.08),
      new THREE.Vector3(1.48,-.55,.02)
    ]);
    const trace=new THREE.Mesh(new THREE.TubeGeometry(curve,90,.028,7,false),darkMat);
    group.add(trace);

    const needle=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,3.4,8),paperMat);
    needle.rotation.z=-.78;needle.position.set(.15,.18,.18);group.add(needle);

    const redCore=new THREE.Mesh(new THREE.SphereGeometry(.19,26,18),redMat);
    redCore.position.set(.1,.08,.52);group.add(redCore);

    const registration=new THREE.Group();group.add(registration);
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      const line=new THREE.Mesh(new THREE.BoxGeometry(.012,.48,.012),faintMat);
      line.position.set(Math.cos(a)*1.72,Math.sin(a)*1.72,-.35);
      line.rotation.z=-a;
      registration.add(line);
    }

    let stage=0,targetStage=0,visible=false,drag=false,lastX=0,targetY=.28,raf=0,lastTime=0,idleUntil=0;
    const state={mix:0};

    function applyStage(dt){
      const speed=reduced.matches?1:1-Math.exp(-dt*5.8);
      state.mix+=(targetStage-state.mix)*speed;
      const m=state.mix;
      const sB=.12+.88*Math.min(Math.max(m,0),1);
      loopB.scale.setScalar(sB);
      loopB.position.x=.95-.4*Math.min(m,1);
      loopB.position.z=-.2+.28*Math.min(m,1);
      trace.scale.setScalar(.82+.18*Math.min(m/2,1));
      trace.material= m<.65?faintMat:darkMat;
      needle.material=m<1.45?paperMat:redMat;
      needle.position.x=.45-.3*Math.min(m/2,1);
      redCore.scale.setScalar(.45+.55*Math.min(m/2,1));
      registration.rotation.z+=dt*.08;
      registration.children.forEach((line,index)=>line.material.opacity=.14+.18*Math.min(m/2,1)+(index%2)*.025);
      const final=Math.max(0,m-1);
      loopA.rotation.z=.06-final*.24;
      loopB.rotation.z=-.08+final*.42;
    }

    function requestRender(duration=0){idleUntil=Math.max(idleUntil,performance.now()+duration);if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
    function draw(time){
      raf=0;
      const dt=Math.min((time-lastTime)/1000||.016,.05);lastTime=time;
      applyStage(dt);
      const ease=reduced.matches?1:1-Math.exp(-dt*7);
      group.rotation.y+=(targetY-group.rotation.y)*ease;
      renderer.render(scene,camera);
      const changing=Math.abs(targetStage-state.mix)>.002||Math.abs(targetY-group.rotation.y)>.002;
      if(changing||drag||time<idleUntil)requestRender();
    }

    function resize(){
      const r=host.getBoundingClientRect();
      if(!r.width||!r.height)return;
      renderer.setSize(r.width,r.height,false);
      camera.aspect=r.width/r.height;
      camera.updateProjectionMatrix();
      requestRender(250);
    }

    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      drag=true;lastX=event.clientX;canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-dragging');requestRender(500);
    });
    canvas.addEventListener('pointermove',event=>{
      if(!drag)return;
      targetY+=(event.clientX-lastX)*.007;lastX=event.clientX;requestRender(250);
    });
    const endDrag=()=>{drag=false;canvas.classList.remove('is-dragging');requestRender(300);};
    canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);

    window.addEventListener('referralstagechange',event=>{
      targetStage=Math.max(0,Math.min(2,Number(event.detail?.stage||0)));
      section.dataset.referralStage=String(targetStage);
      requestRender(reduced.matches?100:1100);
    });

    new ResizeObserver(resize).observe(host);
    new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible)requestRender(500);else{cancelAnimationFrame(raf);raf=0;}
    },{threshold:.08}).observe(host);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else requestRender(300);});
    reduced.addEventListener('change',()=>requestRender(300));
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();section.dataset.referralRender='fallback';cancelAnimationFrame(raf);raf=0;canvas.remove();});

    section.dataset.referralRender='webgl';
    resize();
  }
}
