import * as THREE from './assets/three.module.js';
const host=document.querySelector('.artwork');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){host.dataset.render='fallback';}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const canvas=renderer.domElement;canvas.className='sculpture';canvas.setAttribute('aria-label','Scultura 3D di un crisantemo. Trascina orizzontalmente per ruotarla, oppure usa i pulsanti di rotazione.');canvas.setAttribute('role','img');host.prepend(canvas);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(0,0,8.8);
scene.add(new THREE.HemisphereLight(0xfff4de,0x313a32,3));
const key=new THREE.DirectionalLight(0xffebd2,4.5);key.position.set(-3,5,5);scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,2);fill.position.set(4,-1,3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xd54c2f,3);rim.position.set(-3,-2,-3);scene.add(rim);
const sculpture=new THREE.Group();scene.add(sculpture);sculpture.rotation.set(-.23,.25,-.12);
const flower=new THREE.Group();flower.position.y=.25;sculpture.add(flower);
const petals=[];const palette=[0xe3d8bd,0xe6dbc3,0xf3e8d1,0xd3c4a4];
function petalGeometry(length,width,curl){const pos=[],uv=[],ix=[];const U=12,V=5;for(let i=0;i<=U;i++){let t=i/U;const spread=Math.pow(Math.sin(Math.PI*t),.7)*width;for(let j=0;j<=V;j++){let s=j/V*2-1;pos.push(s*spread,length*t,Math.sin(t*Math.PI)*.12+curl*t*t+Math.abs(s)*.13*Math.sin(t*Math.PI));uv.push(j/V,t);}}for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*(V+1)+j,b=a+V+1;ix.push(a,b,a+1,b,b+1,a+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}
for(let ring=0;ring<5;ring++){const count=ring===4?9:14+ring*2;const radius=.22+ring*.11;const length=1.28-ring*.2;for(let j=0;j<count;j++){const a=j/count*Math.PI*2+ring*.34;const group=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:palette[ring%4],roughness:.58,metalness:.12,side:THREE.DoubleSide});const mesh=new THREE.Mesh(petalGeometry(length,.23-ring*.027,.1+ring*.11),mat);group.add(mesh);group.position.set(Math.sin(a)*radius,Math.cos(a)*radius,ring*.11);group.rotation.z=-a;group.rotation.x=.13+ring*.14;flower.add(group);const edgePoints=[];for(let t=0;t<=16;t++){let u=t/16;edgePoints.push(new THREE.Vector3(0,length*u,Math.sin(u*Math.PI)*.12+(.1+ring*.11)*u*u+.008));}const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(edgePoints),new THREE.LineBasicMaterial({color:0x74654d,transparent:true,opacity:.24}));group.add(line);petals.push({group,mesh,mat,line,ring,a,base:group.position.clone(),scale:1});}}
const core=new THREE.Mesh(new THREE.SphereGeometry(.21,24,16),new THREE.MeshStandardMaterial({color:0xac3e26,roughness:.5,metalness:.25}));core.position.z=.7;flower.add(core);
const stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(.02,.25,-.15),new THREE.Vector3(-.25,-.75,-.13),new THREE.Vector3(.22,-1.5,-.03),new THREE.Vector3(-.12,-2.15,.15)]);
const stem=new THREE.Mesh(new THREE.TubeGeometry(stemCurve,40,.027,8,false),new THREE.MeshStandardMaterial({color:0x494c37,roughness:.65}));sculpture.add(stem);
for(let k=0;k<2;k++){let leaf=new THREE.Mesh(petalGeometry(.77,.18,.15),new THREE.MeshStandardMaterial({color:0x787b57,side:THREE.DoubleSide,roughness:.8}));leaf.position.set(k===0?-.1:.05,-.9-k*.5,0);leaf.rotation.z=k===0?.95:-1.2;sculpture.add(leaf);}
const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.05,.009,6,140),new THREE.MeshStandardMaterial({color:0xa9936f,metalness:.7,roughness:.3}));orbit.rotation.x=.2;orbit.position.z=-.5;sculpture.add(orbit);
const halo=new THREE.Mesh(new THREE.CircleGeometry(.7,64),new THREE.MeshBasicMaterial({color:0xb4442e,transparent:true,opacity:.9}));halo.position.set(.8,.85,-1);sculpture.add(halo);
let stage=2,targetX=-.23,targetY=.25,targetZ=-.12,drag=false,lastX=0,progress=2,raf=0,visible=true,lastTime=0,idleUntil=0;
function resize(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();requestRender();}
function requestRender(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw);}
function draw(time){raf=0;const dt=Math.min((time-lastTime)/1000||.016,.05);lastTime=time;const ease=reduced.matches?1:1-Math.exp(-dt*7);progress+=(stage-progress)*ease;sculpture.rotation.x+=(targetX-sculpture.rotation.x)*ease;sculpture.rotation.y+=(targetY-sculpture.rotation.y)*ease;sculpture.rotation.z+=(targetZ-sculpture.rotation.z)*ease;
const explode=1-Math.min(progress,1);for(const p of petals){p.group.position.copy(p.base);p.group.position.x+=Math.sin(p.a)*explode*(.48+p.ring*.09);p.group.position.y+=Math.cos(p.a)*explode*(.48+p.ring*.09);p.group.position.z+=explode*(p.ring-2)*.26;p.mat.wireframe=progress<.45;p.mat.color.setHex(progress<1.5?0xd1c4a6:palette[p.ring%4]);p.line.visible=progress>.5;p.group.scale.setScalar(.82+.18*Math.min(progress/2,1));}
core.scale.setScalar(.5+.5*Math.min(progress/2,1));halo.material.opacity=.35+.55*Math.min(progress/2,1);renderer.render(scene,camera);
const changing=Math.abs(stage-progress)>.001||Math.abs(targetY-sculpture.rotation.y)>.001||Math.abs(targetX-sculpture.rotation.x)>.001||Math.abs(targetZ-sculpture.rotation.z)>.001;
if(changing||drag||time<idleUntil)requestRender();}
const stageButtons=document.querySelectorAll('.stages button');stageButtons.forEach(b=>b.addEventListener('click',()=>{stage=Number(b.dataset.stage);requestRender();}));
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{if(!drag)return;targetY+=(e.clientX-lastX)*.008;lastX=e.clientX;requestRender();});
function end(){drag=false;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
document.querySelectorAll('[data-rotate]').forEach(b=>b.addEventListener('click',()=>{targetY+=Number(b.dataset.rotate)*.45;requestRender();}));
document.querySelector('[data-reset-scene]').addEventListener('click',()=>{targetX=-.23;targetY=.25;targetZ=-.12;requestRender();});
const play=document.querySelector('[data-play-scene]');let timer=0;function stop(){clearTimeout(timer);play.textContent='Riproduci la trasformazione ↗';play.setAttribute('aria-pressed','false');}play.addEventListener('click',()=>{if(play.getAttribute('aria-pressed')==='true'){stop();return;}play.setAttribute('aria-pressed','true');play.textContent='Ferma la trasformazione ■';let i=0;const next=()=>{stageButtons[i].click();i++;if(i<3)timer=setTimeout(next,reduced.matches?600:1600);else timer=setTimeout(stop,800);};next();});
new ResizeObserver(resize).observe(host);new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)requestRender();else{cancelAnimationFrame(raf);raf=0;stop();}},{threshold:0}).observe(host);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;stop();}else requestRender();});reduced.addEventListener('change',()=>{stop();requestRender();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('is-3d');host.dataset.render='fallback';stop();cancelAnimationFrame(raf);raf=0;});
host.classList.add('is-3d');host.dataset.render='webgl';resize();
}
