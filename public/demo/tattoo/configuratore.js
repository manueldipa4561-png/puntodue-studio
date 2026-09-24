const root=document.querySelector('[data-tattoo-configurator]');
if(root){
  const host=root.querySelector('#tattoo-viewport');
  const areaButtons=[...root.querySelectorAll('[data-area]')];
  const designButtons=[...root.querySelectorAll('[data-design]')];
  const toneButtons=[...root.querySelectorAll('[data-tone]')];
  const stepButtons=[...root.querySelectorAll('[data-step-target]')];
  const upload=root.querySelector('#design-upload');
  const idea=root.querySelector('#idea-text');
  const codeEl=root.querySelector('#config-code');
  const copyBtn=root.querySelector('[data-copy-code]');
  const statusEl=root.querySelector('#copy-status');
  const viewerLabel=root.querySelector('#viewer-label');
  const summary={
    area:root.querySelector('#summary-area'),design:root.querySelector('#summary-design'),size:root.querySelector('#summary-size'),finish:root.querySelector('#summary-finish')
  };
  const controls={
    size:root.querySelector('#tattoo-size'),position:root.querySelector('#tattoo-position'),angle:root.querySelector('#tattoo-angle'),rotation:root.querySelector('#tattoo-rotation'),opacity:root.querySelector('#tattoo-opacity')
  };
  const outputs={
    size:root.querySelector('#tattoo-size-output'),position:root.querySelector('#tattoo-position-output'),angle:root.querySelector('#tattoo-angle-output'),rotation:root.querySelector('#tattoo-rotation-output'),opacity:root.querySelector('#tattoo-opacity-output')
  };
  const areaPresets={
    forearm:{label:'Avambraccio esterno',length:3.2,rTop:.58,rBottom:.39,defaultAngle:0},
    inner:{label:'Avambraccio interno',length:3.2,rTop:.58,rBottom:.39,defaultAngle:180},
    upper:{label:'Braccio',length:3.0,rTop:.73,rBottom:.57,defaultAngle:15},
    calf:{label:'Polpaccio',length:3.5,rTop:.68,rBottom:.48,defaultAngle:0}
  };
  const state={area:'forearm',design:'portrait',designLabel:'Ritratto',textureUrl:'',size:52,position:0,angle:0,rotation:0,opacity:88,skin:'#cf9d78'};
  let uploadedObjectUrl='';
  let sceneState=null;

  function slugPart(value){return String(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)||'XXX';}
  function makeCode(){
    const area=slugPart(state.area),design=slugPart(state.design),size=String(Math.round(state.size)).padStart(2,'0');
    const angle=String(Math.round((state.angle+180)/10)).padStart(2,'0');
    return `CTG-${area}-${design}-${size}${angle}`;
  }
  function updateOutputs(){
    if(outputs.size)outputs.size.value=`${state.size}%`;
    if(outputs.position)outputs.position.value=state.position===0?'Centro':`${state.position>0?'+':''}${state.position}%`;
    if(outputs.angle)outputs.angle.value=`${state.angle}°`;
    if(outputs.rotation)outputs.rotation.value=`${state.rotation}°`;
    if(outputs.opacity)outputs.opacity.value=`${state.opacity}%`;
  }
  function updateSummary(){
    if(summary.area)summary.area.textContent=areaPresets[state.area].label;
    if(summary.design)summary.design.textContent=state.designLabel;
    if(summary.size)summary.size.textContent=`${state.size}% · ${state.rotation}°`;
    if(summary.finish)summary.finish.textContent=`Nero & grigio · intensità ${state.opacity}%`;
    if(codeEl)codeEl.textContent=makeCode();
    if(viewerLabel)viewerLabel.textContent=`${areaPresets[state.area].label.toUpperCase()} · ${state.designLabel.toUpperCase()}`;
    updateOutputs();
  }
  function markStep(id){
    stepButtons.forEach(button=>button.setAttribute('aria-current',button.dataset.stepTarget===id?'step':'false'));
  }
  stepButtons.forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.stepTarget;
    document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    markStep(id);
  }));

  areaButtons.forEach(button=>button.addEventListener('click',()=>{
    state.area=button.dataset.area;
    const preset=areaPresets[state.area];
    if(state.area==='inner')state.angle=180;
    else if(Math.abs(state.angle)>170)state.angle=preset.defaultAngle;
    if(controls.angle)controls.angle.value=String(state.angle);
    areaButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    sceneState?.rebuildLimb();sceneState?.rebuildDecal();updateSummary();markStep('step-area');
  }));

  designButtons.forEach(button=>button.addEventListener('click',()=>{
    state.design=button.dataset.design;
    state.designLabel=button.dataset.label||button.textContent.trim();
    state.textureUrl=button.dataset.texture||button.querySelector('img')?.src||'';
    designButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    sceneState?.loadTexture(state.textureUrl);updateSummary();markStep('step-design');
  }));

  toneButtons.forEach(button=>button.addEventListener('click',()=>{
    state.skin=button.dataset.tone;
    toneButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    sceneState?.setSkin(state.skin);markStep('step-finish');
  }));

  Object.entries(controls).forEach(([key,input])=>input?.addEventListener('input',()=>{
    state[key]=Number(input.value);
    if(key==='position'||key==='angle'||key==='size'||key==='rotation')sceneState?.rebuildDecal();
    if(key==='opacity')sceneState?.setOpacity(state.opacity/100);
    updateSummary();
    markStep(key==='opacity'?'step-finish':'step-size');
  }));

  upload?.addEventListener('change',()=>{
    const file=upload.files?.[0];
    if(!file||!file.type.startsWith('image/'))return;
    if(uploadedObjectUrl)URL.revokeObjectURL(uploadedObjectUrl);
    uploadedObjectUrl=URL.createObjectURL(file);
    state.design='custom';state.designLabel='Disegno personale';state.textureUrl=uploadedObjectUrl;
    designButtons.forEach(item=>item.setAttribute('aria-pressed','false'));
    sceneState?.loadTexture(uploadedObjectUrl);updateSummary();markStep('step-design');
  });

  idea?.addEventListener('input',()=>markStep('step-summary'));
  copyBtn?.addEventListener('click',async()=>{
    const text=makeCode();
    try{await navigator.clipboard.writeText(text);if(statusEl)statusEl.textContent='Codice copiato.';}
    catch{if(statusEl)statusEl.textContent=`Codice: ${text}`;}
  });

  updateSummary();

  if(host){
    (async()=>{
      try{
        const THREE=await import('./assets/three.module.js');
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(33,1,.1,100);
        camera.position.set(0,.05,6.2);
        const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
        renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000,0);
        host.appendChild(renderer.domElement);

        const hemi=new THREE.HemisphereLight(0xfffbf2,0x66594e,2.2);scene.add(hemi);
        const key=new THREE.DirectionalLight(0xffffff,3.8);key.position.set(3,4,5);scene.add(key);
        const rim=new THREE.DirectionalLight(0xc7c0b6,2.2);rim.position.set(-4,1,-2);scene.add(rim);
        const limbGroup=new THREE.Group();scene.add(limbGroup);
        limbGroup.rotation.x=-.04;
        let limbMesh=null,decalMesh=null,currentTexture=null;
        const skinMaterial=new THREE.MeshPhysicalMaterial({color:new THREE.Color(state.skin),roughness:.78,metalness:0,clearcoat:.08,clearcoatRoughness:.88});

        function radiusAtNormalized(t,preset){return THREE.MathUtils.lerp(preset.rBottom,preset.rTop,t);}
        function buildLimbGeometry(){
          const p=areaPresets[state.area];
          const points=[];
          const count=16;
          for(let i=0;i<count;i++){
            const t=i/(count-1);
            const eased=.5-.5*Math.cos(t*Math.PI);
            let radius=radiusAtNormalized(t,p);
            radius*=.94+.06*Math.sin(eased*Math.PI);
            points.push(new THREE.Vector2(radius,(t-.5)*p.length));
          }
          return new THREE.LatheGeometry(points,72,0,Math.PI*2);
        }
        function rebuildLimb(){
          const old=limbMesh;
          limbMesh=new THREE.Mesh(buildLimbGeometry(),skinMaterial);
          limbMesh.rotation.y=0;
          limbGroup.add(limbMesh);
          if(old){old.geometry.dispose();limbGroup.remove(old);}
        }

        const vertexShader=`
          varying vec2 vUv;
          void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
        `;
        const fragmentShader=`
          uniform sampler2D uMap;
          uniform float uOpacity;
          uniform float uRotation;
          varying vec2 vUv;
          void main(){
            vec2 uv=vUv-0.5;
            float c=cos(uRotation),s=sin(uRotation);
            uv=mat2(c,-s,s,c)*uv+0.5;
            if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0)discard;
            vec4 tex=texture2D(uMap,uv);
            float luma=dot(tex.rgb,vec3(0.299,0.587,0.114));
            float ink=clamp((0.93-luma)*2.35,0.0,1.0);
            float alpha=smoothstep(0.06,0.30,ink)*uOpacity*tex.a;
            if(alpha<0.015)discard;
            vec3 inkColor=mix(vec3(0.13,0.125,0.115),vec3(0.025,0.026,0.024),ink);
            gl_FragColor=vec4(inkColor,alpha);
          }
        `;
        const decalMaterial=new THREE.ShaderMaterial({vertexShader,fragmentShader,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,uniforms:{uMap:{value:null},uOpacity:{value:state.opacity/100},uRotation:{value:THREE.MathUtils.degToRad(state.rotation)}}});

        function makeFallbackTexture(){
          const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
          const ctx=canvas.getContext('2d');ctx.fillStyle='#eee9df';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#1f201d';ctx.lineWidth=12;ctx.lineCap='round';
          ctx.beginPath();ctx.moveTo(115,390);ctx.bezierCurveTo(80,245,190,90,315,116);ctx.bezierCurveTo(445,143,430,315,318,392);ctx.stroke();
          ctx.lineWidth=6;for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(272,248,38+i*13,-1.8,1.55);ctx.stroke();}
          const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
        }
        function buildDecalGeometry(){
          const p=areaPresets[state.area];
          const segX=48,segY=18;
          const sizeNorm=state.size/100;
          const height=p.length*(.32+sizeNorm*.42);
          const widthArc=(.65+sizeNorm*1.25);
          const yCenter=(state.position/100)*(p.length*.30);
          const tCenter=THREE.MathUtils.clamp(yCenter/p.length+.5,0,1);
          const radius=radiusAtNormalized(tCenter,p)+.009;
          const center=THREE.MathUtils.degToRad(state.angle);
          const positions=[],uvs=[],indices=[];
          for(let y=0;y<=segY;y++){
            const v=y/segY;
            for(let x=0;x<=segX;x++){
              const u=x/segX;
              const theta=center+(u-.5)*widthArc;
              const localY=yCenter+(v-.5)*height;
              const localT=THREE.MathUtils.clamp(localY/p.length+.5,0,1);
              const r=radiusAtNormalized(localT,p)+.012;
              positions.push(Math.sin(theta)*r,localY,Math.cos(theta)*r);
              uvs.push(u,v);
            }
          }
          for(let y=0;y<segY;y++)for(let x=0;x<segX;x++){
            const a=y*(segX+1)+x,b=a+1,c=a+(segX+1),d=c+1;
            indices.push(a,c,b,b,c,d);
          }
          const g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
          g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
          g.setIndex(indices);g.computeVertexNormals();return g;
        }
        function rebuildDecal(){
          decalMaterial.uniforms.uRotation.value=THREE.MathUtils.degToRad(state.rotation);
          if(!decalMesh){decalMesh=new THREE.Mesh(buildDecalGeometry(),decalMaterial);limbGroup.add(decalMesh);return;}
          const old=decalMesh.geometry;decalMesh.geometry=buildDecalGeometry();old.dispose();
        }
        function setSkin(hex){skinMaterial.color.set(hex);skinMaterial.needsUpdate=true;}
        function setOpacity(value){decalMaterial.uniforms.uOpacity.value=value;}
        const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
        let textureToken=0;
        function loadTexture(url){
          const token=++textureToken;
          if(!url){
            if(currentTexture)currentTexture.dispose?.();currentTexture=makeFallbackTexture();
            decalMaterial.uniforms.uMap.value=currentTexture;decalMaterial.needsUpdate=true;return;
          }
          loader.load(url,texture=>{
            if(token!==textureToken){texture.dispose();return;}
            texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
            if(currentTexture)currentTexture.dispose?.();currentTexture=texture;
            decalMaterial.uniforms.uMap.value=currentTexture;decalMaterial.needsUpdate=true;
          },undefined,()=>{
            if(token!==textureToken)return;
            if(currentTexture)currentTexture.dispose?.();currentTexture=makeFallbackTexture();decalMaterial.uniforms.uMap.value=currentTexture;decalMaterial.needsUpdate=true;
          });
        }

        rebuildLimb();rebuildDecal();
        const initialDesign=designButtons.find(button=>button.getAttribute('aria-pressed')==='true')||designButtons[0];
        if(initialDesign){state.textureUrl=initialDesign.dataset.texture||initialDesign.querySelector('img')?.src||'';state.design=initialDesign.dataset.design||state.design;state.designLabel=initialDesign.dataset.label||state.designLabel;loadTexture(state.textureUrl);updateSummary();}
        else loadTexture('');

        let targetRotY=.15,targetRotX=-.04,dragging=false,startX=0,startY=0,startRY=0,startRX=0;
        function down(e){dragging=true;host.classList.add('dragging');startX=e.clientX;startY=e.clientY;startRY=targetRotY;startRX=targetRotX;host.setPointerCapture?.(e.pointerId)}
        function move(e){if(!dragging)return;targetRotY=startRY+(e.clientX-startX)*.006;targetRotX=Math.max(-.35,Math.min(.28,startRX+(e.clientY-startY)*.0035))}
        function up(){dragging=false;host.classList.remove('dragging')}
        host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);
        root.querySelector('[data-view-left]')?.addEventListener('click',()=>targetRotY-=.35);
        root.querySelector('[data-view-right]')?.addEventListener('click',()=>targetRotY+=.35);
        root.querySelector('[data-view-reset]')?.addEventListener('click',()=>{targetRotY=.15;targetRotX=-.04});

        function resize(){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}
        const ro=new ResizeObserver(resize);ro.observe(host);resize();
        let visible=true;const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.05});io.observe(host);
        const clock=new THREE.Clock();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const coarse=matchMedia('(pointer: coarse)').matches;let lastMobileRender=0;
        function animate(time=performance.now()){requestAnimationFrame(animate);if(!visible||document.hidden)return;if(coarse&&time-lastMobileRender<33)return;lastMobileRender=time;const dt=Math.min(.04,clock.getDelta());limbGroup.rotation.y+=(targetRotY-limbGroup.rotation.y)*Math.min(1,dt*7);limbGroup.rotation.x+=(targetRotX-limbGroup.rotation.x)*Math.min(1,dt*7);if(!dragging&&!reduced&&!coarse)targetRotY+=Math.sin(performance.now()*.00027)*.00018;renderer.render(scene,camera)}
        animate();
        root.classList.add('cfg-webgl-ready');
        sceneState={rebuildLimb,rebuildDecal,loadTexture,setSkin,setOpacity,renderer,ro,io};
      }catch(error){console.warn('3D configurator fallback active',error);}
    })();
  }

  window.addEventListener('pagehide',()=>{
    if(uploadedObjectUrl)URL.revokeObjectURL(uploadedObjectUrl);
    sceneState?.ro?.disconnect();sceneState?.io?.disconnect();sceneState?.renderer?.dispose?.();
  },{once:true});
}
