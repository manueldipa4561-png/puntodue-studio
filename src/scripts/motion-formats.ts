// Tre spot animati dal vivo per la sezione /formati di /motion: una lattina (9:16), un vasetto (1:1) e una bottiglia (16:9).
// Prodotti e marchi inventati da noi. Ogni spot gira in loop e riparte da capo quando torna nello schermo.
// I testi sono HTML sopra il canvas (nitidi e traducibili): compaiono quando la fase del loop supera il loro data-in.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const LOOP = 6000; // durata di uno spot in ms
const HIDE_AT = 0.93; // da qui i testi spariscono, così il loop ricomincia pulito
const FONT = '"Inter Tight Variable", system-ui, sans-serif';
// telefoni: meno pixel da disegnare (densità massima 1,5 e niente antialias, che a quella densità non si nota) e meno bollicine
const SMALL = matchMedia('(max-width: 759px)').matches;
const MAX_DPR = SMALL ? 1.5 : 1.75;

type Spot = { camera: THREE.PerspectiveCamera; scene: THREE.Scene; update: (p: number, dt: number) => void };
type Live = Spot & { el: HTMLElement; renderer: THREE.WebGLRenderer; texts: HTMLElement[]; bars: HTMLElement[]; time: HTMLElement | null; t0: number; on: boolean };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const outBack = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

function texture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
// il testo dell'etichetta va disegnato due volte (fronte e retro), così si legge da qualunque lato mentre il prodotto gira
const twice = (w: number, fn: (cx: number) => void) => { fn(w * 0.25); fn(w * 0.75); };
const lathe = (pts: [number, number][]) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96);
const metal = (color: string, roughness = 0.25) => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness });

function lights(scene: THREE.Scene, rim: string) {
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(-4, 5, 6);
  const back = new THREE.DirectionalLight(rim, 3); back.position.set(5, 2, -4);
  scene.add(key, back, new THREE.AmbientLight('#ffffff', 0.25));
}

// ---- 9:16: lattina ONDA che cade, gira e sale tra le bollicine ----
function onda(): Spot {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 9 / 16, 0.1, 100);
  camera.position.set(0, 0.2, 9);
  lights(scene, '#fff1c9');
  const label = texture(2048, 1024, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 1024); bg.addColorStop(0, '#ffb000'); bg.addColorStop(1, '#ff4d1a');
    g.fillStyle = bg; g.fillRect(0, 0, 2048, 1024);
    g.fillStyle = '#ffffff';
    for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(0, 700 + k * 90); for (let x = 0; x <= 2048; x += 16) g.lineTo(x, 700 + k * 90 + Math.sin(x / 120 + k) * 26); g.lineTo(2048, 1024); g.lineTo(0, 1024); g.closePath(); g.globalAlpha = k ? 0.35 : 0.2; g.fill(); }
    g.globalAlpha = 1; g.textAlign = 'center'; g.fillStyle = '#fff';
    twice(2048, (cx) => {
      g.font = `800 300px ${FONT}`; g.fillText('ONDA', cx, 560);
      g.font = `600 60px ${FONT}`; g.fillText('agrumi frizzanti · 330 ml', cx, 660);
    });
  });
  const can = new THREE.Group();
  can.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 96, 1, true), new THREE.MeshStandardMaterial({ map: label, metalness: 0.45, roughness: 0.3 })));
  const silver = metal('#d9dde3', 0.28);
  can.add(new THREE.Mesh(lathe([[1, 1.5], [0.97, 1.62], [0.86, 1.78], [0.84, 1.84], [0.72, 1.84], [0.72, 1.8], [0, 1.8]]), silver));
  can.add(new THREE.Mesh(lathe([[0, -1.72], [0.8, -1.72], [0.95, -1.62], [1, -1.5]]), silver));
  can.scale.setScalar(0.64); // lascia spazio a marchio in alto e prezzo in basso
  scene.add(can);
  // bollicine: piccole sfere che salgono e ricominciano dal basso
  const N = SMALL ? 26 : 46;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 12), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.75, roughness: 0.1 }), N);
  const b = Array.from({ length: N }, () => ({ x: (Math.random() - 0.5) * 4.4, y: (Math.random() - 0.5) * 9, z: (Math.random() - 0.5) * 2.5 - 0.5, s: 0.03 + Math.random() * 0.07, v: 0.6 + Math.random() * 1.2 }));
  const m = new THREE.Matrix4();
  scene.add(bubbles);
  return {
    scene, camera,
    update(p, dt) {
      const drop = outBack(seg(p, 0, 0.14));
      can.position.y = -0.05 + (1 - drop) * 6;
      can.rotation.y = p * Math.PI * 2 + inOut(seg(p, 0.14, 0.42)) * Math.PI * 2;
      can.rotation.z = Math.sin(p * Math.PI * 4) * 0.08;
      can.rotation.x = 0.12;
      b.forEach((o, i) => { o.y += o.v * dt; if (o.y > 4.6) o.y = -4.6; m.makeScale(o.s, o.s, o.s).setPosition(o.x, o.y, o.z); bubbles.setMatrixAt(i, m); });
      bubbles.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---- 1:1: vasetto NEVE, il tappo si solleva e gira ----
function neve(): Spot {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.9, 8.5); camera.lookAt(0, 0.1, 0);
  lights(scene, '#ffd1dc');
  const label = texture(2048, 416, (g) => {
    g.fillStyle = '#fbe9ec'; g.fillRect(0, 0, 2048, 416);
    g.fillStyle = '#f3c3cd'; g.fillRect(0, 300, 2048, 22);
    g.textAlign = 'center'; g.fillStyle = '#2a2440';
    twice(2048, (cx) => {
      g.font = `800 190px ${FONT}`; g.fillText('NEVE', cx, 230);
      g.font = `600 44px ${FONT}`; g.fillText('crema viso · 50 ml', cx, 380);
    });
  });
  const jar = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: '#f7f3ef', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
  jar.add(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 1.7, 96, 1, true), new THREE.MeshPhysicalMaterial({ map: label, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 })));
  jar.add(new THREE.Mesh(lathe([[0, -0.95], [1.2, -0.95], [1.33, -0.89], [1.35, -0.85]]), white));
  jar.add(new THREE.Mesh(lathe([[1.35, 0.85], [1.3, 0.95], [1.2, 1], [1.2, 1.08], [0, 1.08]]), white));
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.55, 96), metal('#c9a24b', 0.22));
  jar.add(lid);
  jar.scale.setScalar(0.78);
  jar.position.set(0.95, -0.35, 0);
  scene.add(jar);
  // scintille che lampeggiano attorno al vasetto mentre il tappo è sollevato
  const N = 18;
  const sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1), new THREE.MeshBasicMaterial({ color: '#ffffff' }), N);
  const sp = Array.from({ length: N }, () => ({ x: 0.95 + (Math.random() - 0.5) * 3.6, y: (Math.random() - 0.5) * 3.2, z: Math.random() * 1.5, ph: Math.random() * Math.PI * 2 }));
  const m = new THREE.Matrix4();
  const sc = new THREE.Vector3();
  scene.add(sparks);
  let t = 0;
  return {
    scene, camera,
    update(p, dt) {
      t += dt;
      const up = inOut(seg(p, 0.12, 0.3)) * (1 - inOut(seg(p, 0.78, 0.92)));
      lid.position.y = 1.36 + up * 1.15;
      lid.rotation.y = up * Math.PI;
      lid.rotation.z = up * 0.18;
      jar.rotation.y = p * Math.PI;
      jar.rotation.x = 0.16;
      sp.forEach((o, i) => { const s = Math.max(0, Math.sin(t * 3 + o.ph)) * 0.07 * up; m.makeRotationZ(t + o.ph).scale(sc.set(s, s * 1.8, s)).setPosition(o.x, o.y, o.z); sparks.setMatrixAt(i, m); });
      sparks.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---- 16:9: bottiglia d'olio ORO, una luce dorata scorre sul vetro ----
function oro(): Spot {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.1, 100);
  lights(scene, '#ffd98a');
  const label = texture(1536, 512, (g) => {
    g.fillStyle = '#efe3c2'; g.fillRect(0, 0, 1536, 512);
    g.strokeStyle = '#b8902f'; g.lineWidth = 6; g.strokeRect(0, 22, 1536, 468);
    g.textAlign = 'center'; g.fillStyle = '#1f3a16';
    twice(1536, (cx) => {
      g.font = `800 170px ${FONT}`; g.fillText('ORO', cx, 250);
      g.font = `600 40px ${FONT}`; g.fillText("olio extravergine d'oliva", cx, 340);
      g.font = `500 34px ${FONT}`; g.fillText('500 ml', cx, 410);
    });
  });
  const bottle = new THREE.Group();
  bottle.add(new THREE.Mesh(
    lathe([[0, -2.3], [0.82, -2.3], [0.9, -2.2], [0.9, 0.4], [0.82, 0.85], [0.45, 1.35], [0.32, 1.6], [0.32, 2.2], [0, 2.2]]),
    new THREE.MeshPhysicalMaterial({ color: '#2c4a1c', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6 }),
  ));
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.905, 0.905, 1.9, 96, 1, true), new THREE.MeshStandardMaterial({ map: label, roughness: 0.55 }));
  lab.position.y = -0.95;
  bottle.add(lab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.62, 48), metal('#c9a24b', 0.2));
  cap.position.y = 2.45;
  bottle.add(cap);
  bottle.scale.setScalar(0.82);
  bottle.position.set(-2.3, -0.25, 0);
  scene.add(bottle);
  const sweep = new THREE.PointLight('#ffd98a', 60, 12, 1.6);
  scene.add(sweep);
  return {
    scene, camera,
    update(p) {
      camera.position.set(0, 0.1, 11.2 - inOut(seg(p, 0, 0.6)) * 1.2);
      camera.lookAt(0, 0, 0);
      bottle.rotation.y = -0.6 + p * Math.PI * 1.2;
      bottle.rotation.z = Math.sin(p * Math.PI * 2) * 0.03;
      sweep.position.set(-6 + inOut(seg(p, 0.05, 0.75)) * 8, 1.2, 2.6);
    },
  };
}

const FACTORIES: Record<string, () => Spot> = { onda, neve, oro };

export async function mountFormats(root: HTMLElement) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { await document.fonts.load(`800 100px ${FONT}`); } catch { /* senza il font le etichette usano quello di sistema */ }
  const lives: Live[] = [];
  root.querySelectorAll<HTMLElement>('[data-spot]').forEach((el) => {
    const make = FACTORIES[el.dataset.spot!];
    const canvas = el.querySelector('canvas');
    if (!make || !canvas) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !SMALL, alpha: true, powerPreference: 'low-power' }); }
    catch { el.classList.add('nogl'); return; } // senza WebGL restano sfondo e testi
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MAX_DPR));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const spot = make();
    const pmrem = new THREE.PMREMGenerator(renderer);
    spot.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const live: Live = { ...spot, el, renderer, texts: [...el.querySelectorAll<HTMLElement>('[data-in]')], bars: [...el.querySelectorAll<HTMLElement>('[data-prog]')], time: el.querySelector('.pl-time'), t0: 0, on: false };
    const size = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      live.camera.aspect = w / h; live.camera.updateProjectionMatrix();
    };
    new ResizeObserver(size).observe(canvas);
    size();
    lives.push(live);
  });
  if (!lives.length) return;

  const paint = (l: Live, p: number, dt: number) => {
    l.update(p, dt);
    l.renderer.render(l.scene, l.camera);
    l.texts.forEach((t) => t.classList.toggle('in', p >= +t.dataset.in! && p < HIDE_AT));
    l.bars.forEach((b) => (b.style.transform = `scaleX(${p})`));
    if (l.time) l.time.textContent = `0:0${Math.floor((p * LOOP) / 1000)} / 0:0${LOOP / 1000}`;
  };

  // "riduci animazioni": un fotogramma fermo con tutti i testi visibili
  if (still) { lives.forEach((l) => paint(l, 0.62, 0)); return; }

  let last = performance.now(), raf = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let any = false;
    lives.forEach((l) => { if (!l.on) return; any = true; paint(l, ((now - l.t0) % LOOP) / LOOP, dt); });
    raf = any ? requestAnimationFrame(frame) : 0;
  };
  // ogni spot gira solo quando è nello schermo e ogni volta che ci rientra riparte dall'inizio
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const l = lives.find((x) => x.el === e.target);
      if (!l) return;
      if (e.isIntersecting && !l.on) { l.on = true; l.t0 = performance.now(); l.texts.forEach((t) => t.classList.remove('in')); }
      if (!e.isIntersecting) l.on = false;
    });
    if (!raf && lives.some((l) => l.on)) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }, { threshold: 0.5 }); // nel carosello del telefono lo schermo che si intravede appena resta fermo
  lives.forEach((l) => io.observe(l.el));
}
