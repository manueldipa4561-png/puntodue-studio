/* Punto Due Studio — interactive P/D spatial mark v4 */
(() => {
  const stages = [...document.querySelectorAll('[data-logo-orbit]')];
  if (!stages.length || !window.WebGLRenderingContext) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');

  const vertex = `
    attribute vec2 a_position;
    void main(){ gl_Position=vec4(a_position,0.0,1.0); }
  `;

  const fragment = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pointer;
    uniform float u_motion;

    mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
    float capsule(vec3 p, vec3 a, vec3 b, float r){
      vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
      return length(pa-ba*h)-r;
    }
    float torus(vec3 p, vec3 c, float majorR, float minorR){
      vec3 q=p-c;vec2 t=vec2(length(q.xy)-majorR,q.z);return length(t)-minorR;
    }
    vec2 mapScene(vec3 p){
      float drift=.16*sin(u_time*.62)*u_motion;
      vec3 pp=p; pp.z-=.22+drift; pp.xy=rot(.12*sin(u_time*.45)*u_motion+u_pointer.x*.18)*pp.xy;
      float pStem=capsule(pp,vec3(-.92,-1.18,0.),vec3(-.92,.52,0.),.145);
      float pLoop=torus(pp,vec3(-.27,.50,0.),.64,.145);
      float dP=min(pStem,pLoop);

      vec3 pd=p; pd.z+=.18+drift; pd.xy=rot(-.10*sin(u_time*.45)*u_motion-u_pointer.x*.16)*pd.xy;
      float dStem=capsule(pd,vec3(.92,-.52,0.),vec3(.92,1.18,0.),.145);
      float dLoop=torus(pd,vec3(.27,-.50,0.),.64,.145);
      float dD=min(dStem,dLoop);
      return dP<dD?vec2(dP,1.0):vec2(dD,2.0);
    }
    vec3 normalAt(vec3 p){
      float e=.0025; vec2 h=vec2(e,0.0); float d=mapScene(p).x;
      return normalize(vec3(mapScene(p+h.xyy).x-d,mapScene(p+h.yxy).x-d,mapScene(p+h.yyx).x-d));
    }
    void main(){
      vec2 uv=(gl_FragCoord.xy*2.0-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
      vec3 ro=vec3(0.0,0.0,4.2);
      vec3 rd=normalize(vec3(uv.x,-uv.y,-2.65));
      float yaw=u_pointer.x*.38; float pitch=-u_pointer.y*.28;
      ro.xz=rot(yaw)*ro.xz; rd.xz=rot(yaw)*rd.xz;
      ro.yz=rot(pitch)*ro.yz; rd.yz=rot(pitch)*rd.yz;
      float t=0.0; float matId=0.0; bool hit=false;
      for(int i=0;i<84;i++){
        vec3 p=ro+rd*t; vec2 dm=mapScene(p);
        if(dm.x<.0018){hit=true;matId=dm.y;break;}
        if(t>8.0)break; t+=dm.x*.78;
      }
      if(!hit){gl_FragColor=vec4(0.0);return;}
      vec3 p=ro+rd*t; vec3 n=normalAt(p);
      vec3 light=normalize(vec3(-.65,.8,1.1));
      float diff=max(dot(n,light),0.0);
      float rim=pow(1.0-max(dot(n,-rd),0.0),2.3);
      float spec=pow(max(dot(reflect(-light,n),-rd),0.0),34.0);
      vec3 olive=vec3(.39,.45,.23); vec3 charcoal=vec3(.075,.105,.078);
      vec3 base=matId<1.5?olive:charcoal;
      vec3 warm=vec3(.93,.94,.78);
      vec3 col=base*(.38+diff*.82)+warm*(spec*.34+rim*.16);
      float ao=smoothstep(3.7,1.5,t);
      col*=.84+.16*ao;
      gl_FragColor=vec4(col,.98);
    }
  `;

  const makeShader = (gl, type, src) => {
    const shader = gl.createShader(type); gl.shaderSource(shader, src); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile error');
    return shader;
  };

  stages.forEach(stage => {
    const canvas = document.createElement('canvas');
    canvas.className = 'logo-orbit-canvas'; canvas.setAttribute('aria-hidden','true'); canvas.tabIndex = -1;
    stage.appendChild(canvas);
    const gl = canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
    if (!gl) { canvas.remove(); return; }
    try {
      const program = gl.createProgram();
      gl.attachShader(program, makeShader(gl, gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, makeShader(gl, gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Program link error');
      gl.useProgram(program);
      const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'a_position'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      const res=gl.getUniformLocation(program,'u_resolution');
      const timeLoc=gl.getUniformLocation(program,'u_time');
      const pointerLoc=gl.getUniformLocation(program,'u_pointer');
      const motionLoc=gl.getUniformLocation(program,'u_motion');
      let targetX=0,targetY=0,currentX=0,currentY=0,visible=true,raf=0,start=performance.now(),dragging=false;
      const resize=()=>{
        const rect=stage.getBoundingClientRect(); const dpr=Math.min(window.devicePixelRatio||1,1.6);
        const w=Math.max(2,Math.round(rect.width*dpr)),h=Math.max(2,Math.round(rect.height*dpr));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      };
      const render=now=>{
        if(!visible){raf=0;return;} resize();
        currentX+=(targetX-currentX)*.07; currentY+=(targetY-currentY)*.07;
        gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(res,canvas.width,canvas.height);
        gl.uniform1f(timeLoc,(now-start)/1000);
        gl.uniform2f(pointerLoc,currentX,currentY);
        gl.uniform1f(motionLoc,reduceMotion.matches?0:1);
        gl.drawArrays(gl.TRIANGLES,0,6);
        raf=requestAnimationFrame(render);
      };
      const move=(clientX,clientY)=>{
        const r=stage.getBoundingClientRect(); targetX=Math.max(-1,Math.min(1,((clientX-r.left)/r.width-.5)*2)); targetY=Math.max(-1,Math.min(1,((clientY-r.top)/r.height-.5)*2));
      };
      stage.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||dragging)move(e.clientX,e.clientY)});
      stage.addEventListener('pointerleave',()=>{if(!dragging){targetX=0;targetY=0}});
      stage.addEventListener('pointerdown',e=>{if(coarse.matches){dragging=true;stage.setPointerCapture?.(e.pointerId);move(e.clientX,e.clientY)}});
      stage.addEventListener('pointerup',e=>{dragging=false;stage.releasePointerCapture?.(e.pointerId);targetX=0;targetY=0});
      new ResizeObserver(resize).observe(stage);
      new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;if(visible&&!raf)raf=requestAnimationFrame(render);},{rootMargin:'120px'}).observe(stage);
      document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible&&!raf)raf=requestAnimationFrame(render)});
      stage.classList.add('webgl-ready'); raf=requestAnimationFrame(render);
    } catch (err) {
      console.warn('Punto Due interactive mark fallback active.',err); canvas.remove();
    }
  });
})();
