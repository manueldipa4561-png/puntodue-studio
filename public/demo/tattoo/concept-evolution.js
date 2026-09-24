const conceptRoot=document.querySelector('[data-concept-evolution]');
if(conceptRoot){
  const stageUrls=[conceptRoot.getAttribute('data-stage-0'),conceptRoot.getAttribute('data-stage-1'),conceptRoot.getAttribute('data-stage-2')].filter(Boolean);
  const buttons=[...conceptRoot.querySelectorAll('[data-concept-stage]')];
  const fallback=conceptRoot.querySelector('.concept-fallback');
  const indexEl=conceptRoot.querySelector('.concept-stage-index');
  const titleEl=conceptRoot.querySelector('.concept-stage-title');
  const descEl=conceptRoot.querySelector('.concept-stage-description');
  const progressEl=conceptRoot.querySelector('.concept-progress span');
  const playBtn=conceptRoot.querySelector('[data-concept-play]');
  const host=conceptRoot.querySelector('.concept-3d-host');
  const labels=['FASE 01 / LA TRACCIA','FASE 02 / LO STENCIL','FASE 03 / L’INCHIOSTRO'];
  const titles=['La traccia','Lo stencil','L’inchiostro'];
  const descriptions=[
    'Il gesto nasce leggero: proporzioni, direzione e respiro prima che il segno diventi definitivo.',
    'La composizione si chiarisce. Linee, pesi e vuoti costruiscono una struttura pronta a diventare tatuaggio.',
    'Il disegno raggiunge la sua forma piena: profondità, contrasto e dettagli trasformano l’idea in identità.'
  ];
  let currentStage=0;
  let meshes=[];
  let playing=false;
  let playTimer=0;
  let threeState=null;

  function setStage(stage,{fromAuto=false}={}){
    currentStage=Math.max(0,Math.min(2,Number(stage)||0));
    buttons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===currentStage)));
    if(indexEl)indexEl.textContent=labels[currentStage];
    if(titleEl)titleEl.textContent=titles[currentStage];
    if(descEl)descEl.textContent=descriptions[currentStage];
    if(progressEl)progressEl.style.width=`${(currentStage+1)/3*100}%`;
    if(fallback&&stageUrls[currentStage]){
      fallback.src=stageUrls[currentStage];
      fallback.alt=`Concept illustrativo — ${titles[currentStage]}`;
      fallback.style.transform=`scale(${.94+currentStage*.02})`;
    }
    meshes.forEach((mesh,index)=>{
      mesh.userData.targetOpacity=index===currentStage?1:0;
      mesh.userData.targetZ=index===currentStage?0:index<currentStage?-.18:.18;
      mesh.userData.targetScale=index===currentStage?1:.94;
    });
    if(playing&&!fromAuto&&currentStage===2)stopPlayback();
  }

  function stopPlayback(){
    playing=false;
    clearTimeout(playTimer);
    if(playBtn){
      playBtn.setAttribute('aria-pressed','false');
      playBtn.textContent='Riproduci evoluzione ↗';
    }
  }

  function scheduleNext(){
    if(!playing)return;
    playTimer=window.setTimeout(()=>{
      const next=(currentStage+1)%3;
      setStage(next,{fromAuto:true});
      if(next===2){
        playTimer=window.setTimeout(stopPlayback,1700);
      }else scheduleNext();
    },1500);
  }

  buttons.forEach(button=>button.addEventListener('click',()=>{
    stopPlayback();
    setStage(Number(button.dataset.conceptStage));
  }));
  playBtn?.addEventListener('click',()=>{
    if(playing){stopPlayback();return;}
    playing=true;
    playBtn.setAttribute('aria-pressed','true');
    playBtn.textContent='Pausa trasformazione ×';
    if(currentStage===2)setStage(0,{fromAuto:true});
    scheduleNext();
  });
  setStage(0);

  if(host&&stageUrls.length===3){
    (async()=>{
      try{
        const THREE=await import('./assets/three.module.js');
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(34,1,.1,100);
        camera.position.set(0,0,6.1);
        const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000,0);
        host.appendChild(renderer.domElement);

        const group=new THREE.Group();
        scene.add(group);
        const loader=new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        const textures=await Promise.all(stageUrls.map(url=>new Promise((resolve,reject)=>loader.load(url,texture=>{
          texture.colorSpace=THREE.SRGBColorSpace;
          texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
          resolve(texture);
        },undefined,reject))));

        const geometry=new THREE.PlaneGeometry(4.1,4.1,1,1);
        meshes=textures.map((texture,index)=>{
          const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:index===0?1:0,depthWrite:false});
          const mesh=new THREE.Mesh(geometry,material);
          mesh.position.z=index===0?0:.18;
          mesh.scale.setScalar(index===0?1:.94);
          mesh.renderOrder=index+1;
          mesh.userData={targetOpacity:index===0?1:0,targetZ:index===0?0:.18,targetScale:index===0?1:.94};
          group.add(mesh);
          return mesh;
        });

        const frame=new THREE.Mesh(
          new THREE.PlaneGeometry(4.32,4.32),
          new THREE.MeshBasicMaterial({color:0xd8d1c4,transparent:true,opacity:.35,depthWrite:false})
        );
        frame.position.z=-.08;
        group.add(frame);
        frame.renderOrder=0;

        group.rotation.x=-.035;
        let targetX=-.035,targetY=0;
        let dragging=false,startX=0,startY=0,startRotX=0,startRotY=0;
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarse=window.matchMedia('(pointer: coarse)').matches;
        let lastMobileRender=0;

        function pointerDown(e){
          dragging=true;host.classList.add('is-dragging');
          startX=e.clientX;startY=e.clientY;startRotX=targetX;startRotY=targetY;
          host.setPointerCapture?.(e.pointerId);
        }
        function pointerMove(e){
          if(!dragging)return;
          targetY=startRotY+(e.clientX-startX)*.0045;
          targetX=Math.max(-.28,Math.min(.22,startRotX+(e.clientY-startY)*.003));
        }
        function pointerUp(){dragging=false;host.classList.remove('is-dragging');}
        host.addEventListener('pointerdown',pointerDown);
        host.addEventListener('pointermove',pointerMove);
        host.addEventListener('pointerup',pointerUp);
        host.addEventListener('pointercancel',pointerUp);
        host.addEventListener('keydown',e=>{
          if(e.key==='ArrowLeft'){stopPlayback();setStage(currentStage-1);e.preventDefault();}
          if(e.key==='ArrowRight'){stopPlayback();setStage(currentStage+1);e.preventDefault();}
        });

        function resize(){
          const rect=host.getBoundingClientRect();
          if(!rect.width||!rect.height)return;
          renderer.setSize(rect.width,rect.height,false);
          camera.aspect=rect.width/rect.height;
          camera.updateProjectionMatrix();
        }
        const resizeObserver=new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        let visible=true;
        const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;},{threshold:.05});
        io.observe(host);
        const clock=new THREE.Clock();
        function animate(time=performance.now()){
          requestAnimationFrame(animate);
          if(!visible||document.hidden)return;
          if(coarse&&time-lastMobileRender<33)return;
          lastMobileRender=time;
          const dt=Math.min(.04,clock.getDelta());
          group.rotation.x+=(targetX-group.rotation.x)*Math.min(1,dt*6);
          group.rotation.y+=(targetY-group.rotation.y)*Math.min(1,dt*6);
          if(!dragging&&!reduced&&!coarse)group.rotation.y+=Math.sin(performance.now()*.00035)*.00016;
          meshes.forEach((mesh,index)=>{
            const speed=Math.min(1,dt*5.8);
            mesh.material.opacity+=(mesh.userData.targetOpacity-mesh.material.opacity)*speed;
            mesh.position.z+=(mesh.userData.targetZ-mesh.position.z)*speed;
            const s=mesh.scale.x+(mesh.userData.targetScale-mesh.scale.x)*speed;
            mesh.scale.setScalar(s);
            mesh.rotation.z+=(index===currentStage?Math.sin(performance.now()*.00055+index)*.00003:0);
          });
          renderer.render(scene,camera);
        }
        animate();
        conceptRoot.classList.add('is-webgl');
        threeState={renderer,resizeObserver,io,textures,geometry};
      }catch(error){
        conceptRoot.classList.add('is-fallback');
        console.warn('Concept 3D fallback active',error);
      }
    })();
  }

  window.addEventListener('pagehide',()=>{
    stopPlayback();
    if(threeState){
      threeState.resizeObserver?.disconnect();
      threeState.io?.disconnect();
      threeState.textures?.forEach(texture=>texture.dispose?.());
      threeState.geometry?.dispose?.();
      threeState.renderer?.dispose?.();
    }
  },{once:true});
}
