/* Punto Due Studio — dependency-free WebGL2 spatial field */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    document.documentElement.classList.add('pd-field-static');
    return;
  }

  const host = document.createElement('div');
  host.className = 'pd-field';
  host.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'pd-field__canvas';
  host.appendChild(canvas);
  document.body.prepend(host);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  });

  if (!gl) {
    host.removeChild(canvas);
    document.documentElement.classList.add('pd-field-fallback');
    return;
  }

  const vertexSource = `#version 300 es
    in vec2 a_position;
    void main(){ gl_Position = vec4(a_position,0.0,1.0); }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    out vec4 outColor;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform vec2 u_velocity;
    uniform float u_time;
    uniform float u_scroll;
    uniform float u_energy;

    float hash(vec2 p){
      p = fract(p*vec2(123.34,456.21));
      p += dot(p,p+45.32);
      return fract(p.x*p.y);
    }

    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
    }

    float fbm(vec2 p){
      float v=0.0; float a=.52;
      mat2 r=mat2(.82,-.57,.57,.82);
      for(int i=0;i<5;i++){v+=a*noise(p); p=r*p*2.01+vec2(11.7,4.3); a*=.5;}
      return v;
    }

    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
      vec2 mp=(u_pointer-.5*u_resolution.xy)/u_resolution.y;
      mp.y*=-1.0;
      float t=u_time*.075;
      vec2 vel=u_velocity/u_resolution.y;
      float d=length(uv-mp);
      float influence=exp(-d*4.3)*(0.22+u_energy*.58);
      vec2 flow=uv*1.65;
      flow += vec2(fbm(uv*1.25+t),fbm(uv*1.31-t))*.34;
      flow += normalize((uv-mp)+.0001)*influence*.28;
      flow += vel*.9*exp(-d*5.5);
      flow.y += u_scroll*.42;

      float n=fbm(flow*2.2+vec2(t,-t*.7));
      float n2=fbm(flow*3.7-vec2(t*.6,t));
      float band=smoothstep(.43,.77,n*.72+n2*.42);
      float contour=abs(fract((n+n2*.55)*7.0)-.5);
      contour=1.0-smoothstep(.42,.5,contour);

      vec3 paper=vec3(.945,.935,.89);
      vec3 olive=vec3(.43,.49,.28);
      vec3 dark=vec3(.07,.085,.068);
      vec3 moss=vec3(.63,.68,.46);
      float radial=exp(-length(uv-vec2(.12,.04))*1.9);
      vec3 color=mix(paper,moss,band*.26+radial*.08);
      color=mix(color,olive,contour*.08);
      color=mix(color,dark,smoothstep(.86,1.2,length(uv))*0.08);
      color += influence*vec3(.035,.045,.018);
      outColor=vec4(color,1.0);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Unknown shader compilation error';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  };

  let program;
  try {
    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'WebGL link failed');
  } catch (error) {
    console.warn('[Punto Due Field] fallback:', error);
    host.removeChild(canvas);
    document.documentElement.classList.add('pd-field-fallback');
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  gl.useProgram(program);

  const uniforms = {
    resolution: gl.getUniformLocation(program,'u_resolution'),
    pointer: gl.getUniformLocation(program,'u_pointer'),
    velocity: gl.getUniformLocation(program,'u_velocity'),
    time: gl.getUniformLocation(program,'u_time'),
    scroll: gl.getUniformLocation(program,'u_scroll'),
    energy: gl.getUniformLocation(program,'u_energy')
  };

  const state = {
    targetX: innerWidth*.62,
    targetY: innerHeight*.28,
    x: innerWidth*.62,
    y: innerHeight*.28,
    vx: 0,
    vy: 0,
    energy: .16,
    scroll: 0,
    lastX: innerWidth*.62,
    lastY: innerHeight*.28,
    lastT: performance.now(),
    visible: !document.hidden,
    quality: 1
  };

  const coarse = matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  state.quality = coarse || cores <= 4 || memory <= 4 ? .66 : 1;

  let raf = 0;
  let start = performance.now();
  let frames = 0;
  let sampleStart = start;

  const resize = () => {
    const cap = state.quality < 1 ? 1.15 : 1.6;
    const dpr = Math.min(devicePixelRatio || 1, cap);
    const w = Math.max(1, Math.round(innerWidth*dpr));
    const h = Math.max(1, Math.round(innerHeight*dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width=w; canvas.height=h;
      gl.viewport(0,0,w,h);
    }
  };

  const draw = now => {
    raf = 0;
    if (!state.visible) return;
    resize();
    const dt = Math.min(.05,(now-state.lastT)/1000 || .016);
    state.lastT=now;
    const prevX=state.x, prevY=state.y;
    const follow=1-Math.pow(.001,dt);
    state.x += (state.targetX-state.x)*follow;
    state.y += (state.targetY-state.y)*follow;
    state.vx += (((state.x-prevX)/Math.max(dt,.001))-state.vx)*.16;
    state.vy += (((state.y-prevY)/Math.max(dt,.001))-state.vy)*.16;
    state.energy += (Math.min(1,Math.hypot(state.vx,state.vy)/1100)-state.energy)*.05;
    state.energy *= .994;

    document.documentElement.style.setProperty('--pd-vx',`${state.x}px`);
    document.documentElement.style.setProperty('--pd-vy',`${state.y}px`);

    const sx = canvas.width/innerWidth, sy = canvas.height/innerHeight;
    gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.pointer,state.x*sx,(innerHeight-state.y)*sy);
    gl.uniform2f(uniforms.velocity,state.vx*sx,-state.vy*sy);
    gl.uniform1f(uniforms.time,(now-start)/1000);
    gl.uniform1f(uniforms.scroll,state.scroll);
    gl.uniform1f(uniforms.energy,state.energy);
    gl.drawArrays(gl.TRIANGLES,0,3);

    frames++;
    if (now-sampleStart>1800) {
      const fps=frames*1000/(now-sampleStart);
      if (fps<42 && state.quality>.52) { state.quality=.52; }
      frames=0; sampleStart=now;
    }
    raf=requestAnimationFrame(draw);
  };

  const wake = () => { if (!raf && state.visible) raf=requestAnimationFrame(draw); };
  const onPointer = e => {
    state.targetX=e.clientX; state.targetY=e.clientY;
    state.energy=Math.min(1,state.energy+.06);
    wake();
  };
  addEventListener('pointermove',onPointer,{passive:true});
  addEventListener('pointerdown',e=>{
    state.targetX=e.clientX; state.targetY=e.clientY; state.energy=1; wake();
  },{passive:true});
  addEventListener('touchmove',e=>{
    const p=e.touches&&e.touches[0]; if(!p)return;
    state.targetX=p.clientX; state.targetY=p.clientY; state.energy=Math.min(1,state.energy+.09); wake();
  },{passive:true});
  addEventListener('scroll',()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    state.scroll=scrollY/max;
    wake();
  },{passive:true});
  addEventListener('resize',wake,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    state.visible=!document.hidden;
    if(state.visible){state.lastT=performance.now();wake();}
    else if(raf){cancelAnimationFrame(raf);raf=0;}
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.documentElement.classList.add('pd-field-fallback'); if(raf){cancelAnimationFrame(raf);raf=0;}},{passive:false});

  document.querySelectorAll('[data-motion-card]').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(coarse)return;
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--pd-card-rx',`${(-y*2.2).toFixed(2)}deg`);
      card.style.setProperty('--pd-card-ry',`${(x*2.6).toFixed(2)}deg`);
      state.energy=Math.min(1,state.energy+.035);
    },{passive:true});
    card.addEventListener('pointerleave',()=>{
      card.style.removeProperty('--pd-card-rx');
      card.style.removeProperty('--pd-card-ry');
    },{passive:true});
  });

  if (document.querySelector('.home-hero')) {
    const signal=document.createElement('div');
    signal.className='pd-hero-signal'; signal.setAttribute('aria-hidden','true');
    signal.innerHTML='<span></span><span></span><span></span><span></span>';
    document.querySelector('.home-hero').appendChild(signal);
  }

  document.documentElement.classList.add('pd-field-ready');
  wake();
})();
