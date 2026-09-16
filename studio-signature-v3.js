/* Punto Due Studio — Dual Current WebGL signature system
   No external 3D library. Two continuous currents, one shared direction. */
(() => {
  const stage = document.querySelector('[data-signature-scene]');
  const host = stage?.querySelector('.spatial-system');
  if (!stage || !host || !window.WebGLRenderingContext) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  const halo = document.createElement('span');
  halo.className = 'dual-current-halo';
  halo.setAttribute('aria-hidden', 'true');
  const axis = document.createElement('span');
  axis.className = 'dual-current-axis';
  axis.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'dual-current-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;
  host.append(halo, axis, canvas);

  const gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
    powerPreference: coarsePointer.matches ? 'low-power' : 'high-performance'
  });
  if (!gl) return;

  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat4 uModel;
    uniform mat4 uViewProj;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main(){
      vec4 world = uModel * vec4(aPosition,1.0);
      vWorld = world.xyz;
      vNormal = normalize(mat3(uModel) * aNormal);
      gl_Position = uViewProj * world;
    }
  `;

  const fragmentSource = `
    precision mediump float;
    uniform vec3 uColor;
    uniform vec3 uAccent;
    uniform float uAlpha;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main(){
      vec3 N = normalize(vNormal);
      vec3 L = normalize(vec3(-0.45,0.62,0.68));
      vec3 V = normalize(vec3(0.0,-0.35,1.0));
      float ndl = max(dot(N,L),0.0);
      float rim = pow(1.0-max(abs(dot(N,V)),0.0),2.4);
      float vertical = clamp((vWorld.z+1.7)/3.4,0.0,1.0);
      vec3 base = mix(uColor,uAccent,0.10 + vertical*0.12);
      vec3 color = base*(0.44 + ndl*0.72) + uAccent*rim*0.24;
      gl_FragColor = vec4(color,uAlpha);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile error');
    }
    return shader;
  };

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    console.warn('Punto Due Dual Current disabled:', error);
    canvas.remove();
    return;
  }

  const positionLoc = gl.getAttribLocation(program, 'aPosition');
  const normalLoc = gl.getAttribLocation(program, 'aNormal');
  const modelLoc = gl.getUniformLocation(program, 'uModel');
  const viewProjLoc = gl.getUniformLocation(program, 'uViewProj');
  const colorLoc = gl.getUniformLocation(program, 'uColor');
  const accentLoc = gl.getUniformLocation(program, 'uAccent');
  const alphaLoc = gl.getUniformLocation(program, 'uAlpha');

  const normalize = v => {
    const l = Math.hypot(v[0],v[1],v[2]) || 1;
    return [v[0]/l,v[1]/l,v[2]/l];
  };
  const cross = (a,b) => [
    a[1]*b[2]-a[2]*b[1],
    a[2]*b[0]-a[0]*b[2],
    a[0]*b[1]-a[1]*b[0]
  ];
  const sub = (a,b) => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const add = (a,b) => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  const scale = (v,s) => [v[0]*s,v[1]*s,v[2]*s];

  const createRibbon = (phase, width, lift) => {
    const samples = coarsePointer.matches ? 118 : 168;
    const pts = [];
    for (let i=0;i<samples;i++) {
      const t = Math.PI*2*i/samples;
      pts.push([
        3.15*Math.sin(t),
        1.50*Math.sin(2*t+phase),
        0.70*Math.cos(t+phase*.35)+0.26*Math.sin(3*t+phase)+lift
      ]);
    }
    const positions = [];
    const normals = [];
    const indices = [];
    for (let i=0;i<samples;i++) {
      const tangent = normalize(sub(pts[(i+1)%samples],pts[(i-1+samples)%samples]));
      let side = cross(tangent,[0,0,1]);
      if (Math.hypot(...side)<.15) side = cross(tangent,[0,1,0]);
      side = normalize(side);
      let up = normalize(cross(tangent,side));
      const bank = Math.sin((Math.PI*2*i/samples)*2+phase)*.42;
      side = normalize(add(scale(side,Math.cos(bank)),scale(up,Math.sin(bank))));
      up = normalize(cross(tangent,side));
      const left = add(pts[i],scale(side,-width*.5));
      const right = add(pts[i],scale(side,width*.5));
      positions.push(...left,...right);
      normals.push(...up,...up);
      const n=(i+1)%samples;
      indices.push(i*2,n*2,i*2+1,i*2+1,n*2,n*2+1);
    }
    const pbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,pbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
    const nbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,nbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    return {pbo,nbo,ibo,count:indices.length};
  };

  const currentA = createRibbon(0,.46,.10);
  const currentB = createRibbon(Math.PI/2,.36,-.12);

  const mat4Identity = () => new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  const mat4Multiply = (a,b) => {
    const out = new Float32Array(16);
    for (let c=0;c<4;c++) for (let r=0;r<4;r++) {
      out[c*4+r] = a[0*4+r]*b[c*4+0] + a[1*4+r]*b[c*4+1] + a[2*4+r]*b[c*4+2] + a[3*4+r]*b[c*4+3];
    }
    return out;
  };
  const mat4Perspective = (fovy,aspect,near,far) => {
    const f=1/Math.tan(fovy/2), nf=1/(near-far), out=new Float32Array(16);
    out[0]=f/aspect; out[5]=f; out[10]=(far+near)*nf; out[11]=-1; out[14]=2*far*near*nf;
    return out;
  };
  const mat4Translate = (x,y,z) => {
    const out=mat4Identity(); out[12]=x; out[13]=y; out[14]=z; return out;
  };
  const mat4RotateX = a => {
    const c=Math.cos(a),s=Math.sin(a),out=mat4Identity(); out[5]=c; out[6]=s; out[9]=-s; out[10]=c; return out;
  };
  const mat4RotateY = a => {
    const c=Math.cos(a),s=Math.sin(a),out=mat4Identity(); out[0]=c; out[2]=-s; out[8]=s; out[10]=c; return out;
  };
  const mat4RotateZ = a => {
    const c=Math.cos(a),s=Math.sin(a),out=mat4Identity(); out[0]=c; out[1]=s; out[4]=-s; out[5]=c; return out;
  };

  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);

  let width=0,height=0,dpr=1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1.35 : 1.75);
    const nextW = Math.max(1,Math.round(rect.width*dpr));
    const nextH = Math.max(1,Math.round(rect.height*dpr));
    if (nextW===width && nextH===height) return;
    width=nextW; height=nextH; canvas.width=width; canvas.height=height;
    gl.viewport(0,0,width,height);
  };

  let targetYaw=0,targetPitch=0,yaw=0,pitch=0;
  let dragging=false,lastX=0,lastY=0;
  const updatePointerTarget = (clientX,clientY) => {
    const rect=stage.getBoundingClientRect();
    const nx=(clientX-rect.left)/rect.width-.5;
    const ny=(clientY-rect.top)/rect.height-.5;
    targetYaw=Math.max(-.38,Math.min(.38,nx*.66));
    targetPitch=Math.max(-.22,Math.min(.22,-ny*.42));
  };

  stage.addEventListener('pointermove', event => {
    if (reduceMotion.matches) return;
    if (event.pointerType==='mouse' && !dragging) updatePointerTarget(event.clientX,event.clientY);
    if (dragging) {
      const dx=event.clientX-lastX, dy=event.clientY-lastY;
      targetYaw=Math.max(-.7,Math.min(.7,targetYaw+dx*.006));
      targetPitch=Math.max(-.38,Math.min(.38,targetPitch+dy*.004));
      lastX=event.clientX; lastY=event.clientY;
    }
  },{passive:true});
  stage.addEventListener('pointerdown', event => {
    if (reduceMotion.matches) return;
    dragging=true; lastX=event.clientX; lastY=event.clientY;
    canvas.classList.add('is-dragging');
    try{stage.setPointerCapture(event.pointerId)}catch(_){}
  });
  const stopDrag = () => {dragging=false; canvas.classList.remove('is-dragging')};
  stage.addEventListener('pointerup',stopDrag);
  stage.addEventListener('pointercancel',stopDrag);
  stage.addEventListener('pointerleave',() => {
    if (!dragging && !coarsePointer.matches) {targetYaw*=.45; targetPitch*=.45;}
  });

  const bindMesh = mesh => {
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.pbo);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.nbo);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.ibo);
  };

  const drawMesh = (mesh,model,color,accent,alpha=1) => {
    bindMesh(mesh);
    gl.uniformMatrix4fv(modelLoc,false,model);
    gl.uniform3fv(colorLoc,color);
    gl.uniform3fv(accentLoc,accent);
    gl.uniform1f(alphaLoc,alpha);
    gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);
  };

  let raf=0,start=performance.now(),visible=true;
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
    if (visible && !raf) raf=requestAnimationFrame(render);
  },{threshold:.02}) : null;
  observer?.observe(stage);

  const render = now => {
    raf=0;
    if (!visible) return;
    resize();
    const t=(now-start)/1000;
    yaw += (targetYaw-yaw)*.075;
    pitch += (targetPitch-pitch)*.075;
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    const aspect=width/height;
    const projection=mat4Perspective(44*Math.PI/180,aspect,.1,40);
    const camera=mat4Translate(0,0,-8.45);
    const tilt=mat4Multiply(mat4RotateX(pitch-.08),mat4RotateY(yaw));
    const viewProj=mat4Multiply(projection,camera);
    gl.uniformMatrix4fv(viewProjLoc,false,viewProj);

    const slow = reduceMotion.matches ? 0 : t*.055;
    const modelA=mat4Multiply(tilt,mat4RotateZ(slow));
    const modelB=mat4Multiply(tilt,mat4RotateZ(-slow*.82));
    drawMesh(currentA,modelA,new Float32Array([.38,.45,.20]),new Float32Array([.76,.82,.46]),1);
    drawMesh(currentB,modelB,new Float32Array([.86,.81,.67]),new Float32Array([1.0,.96,.84]),.98);

    if (!reduceMotion.matches) raf=requestAnimationFrame(render);
  };

  const motionChange = () => {
    if (reduceMotion.matches) {
      if (raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(render);
    } else if (!raf && visible) {
      start=performance.now();
      raf=requestAnimationFrame(render);
    }
  };
  reduceMotion.addEventListener?.('change',motionChange);
  window.addEventListener('resize',() => {resize(); if (reduceMotion.matches) requestAnimationFrame(render)},{passive:true});
  raf=requestAnimationFrame(render);
})();
