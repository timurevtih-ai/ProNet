/* =========================================================
   ProNet — 3D (three.js r149, vendor/three.min.js)
   1) Hero: волна из световых частиц, реагирует на курсор
   2) Технологии: пучок оптоволокна с бегущими импульсами
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }
  if (!window.THREE || !webglOK()) { root.classList.add('no-webgl'); return; }

  const THREE = window.THREE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const SPEED = reduce ? 0.12 : 1;
  const BLUE = new THREE.Color('#2993d1');
  const SKY = new THREE.Color('#8fd3ff');
  const STEEL = new THREE.Color('#3b5677');
  const WHITE = new THREE.Color('#eaf6ff');

  function glowTexture() {
    const s = 128, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  const GLOW = glowTexture();

  // render loop that pauses off-screen / in background tabs
  function makeLoop(el, render) {
    let visible = false, raf = 0, last = 0;
    const tick = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      render(dt);
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '80px' }).observe(el);
    document.addEventListener('visibilitychange', start);
    return start;
  }

  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setClearColor(0x000000, 0);
    return r;
  }
  function fit(renderer, camera, el, uPixel) {
    const w = el.clientWidth, h = el.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (uPixel) uPixel.value = pr;
  }


  /* =======================================================
     GLOBE — реальные контуры материков
     Маска суши 360×180 (1°) построена из Natural Earth 1:50m
     (public domain, через world-atlas, ISC).
     ======================================================= */
  const LAND_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAb///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///+h//////6fAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gD/5////////gAAAAAAAAACwBgAAAAPgAAAAAAAAAAAAAAAAAAAAAAAAAAA///+Af//////+AAAABrvwAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAeHznn/w////////4AAAAB3sAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAEcIA5M3AI///////4AAAAAPFAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAABoCGc+r+AH///////wAAAAAAAAAAAAAB4AAAAA/+AAAAAAAAAAAAAAAAAAAAAD/wPz78AAAP/////+AAAAAAAAAAAAD4AAAA////AAAB9oAAAAAAAAAAAAAACAwACAIAAAAD/////+AAAAAAAAAAAAOAAAAH///6AAAAAAAAAAAAAAAAAAAAP+AY8+M/gAAD////+4AAAAAAAAAAAA4AAGH///+O+HQAOAAAAAAAAAAAAAAAfv+4/Q944AAB////+wAAAAAAAAAAABgAHlH///////4AHwAAAAAwAAAAAAAAON/8EY//9AABf///7gAAAAAAAAAAABwAPZ+///////4nv/gAAAAAAAP8gAAAAAP+A8f//8AA3///ogAAAAAABvgAAAAAfv+////////////8AAAAAB///+BfWH/+CuBhf8AA3////AAAAAABf/wAAAA8Pv///////////////H8wAP////////Q8BOzwD+AAf///wAAAAAAF///wMBe/3+/////////////////+AD////////+//f34Y/wA///4AAAAAAAD///+I////P//////////////////4EP///////////5gD/8A///gAAAAAAAf//5+P///8//////////////////jw/////////////qAD+YAf/wAAv8AAAA/8f+D///////////////////////AwAf///////////zwx/gAH/wAAP8AAAB/4/+f//////////////////////4AMAf//////////+DAAbgAH/gAADAAAAN/z/////////////////////////+AAH///////////4AwgGQAD/AAAAAAAA//H///////////////////////n/6AAP///////////wAA/AAAB/AAAAAAAB/+D//////////////////////jP+AAAH/9z////////gAA/wAAAMAAAAAACB//D1////////////////////+A/YAAAA/wAD///////gAA/wQAAAAAAAAAAB9/Ab///////////////////+uDgAAAAAB0AAf//////4AA/94AAAAAAAAAYA5+C///////////////////4AAHAAAAAABcAAP//////4AAf/8AAAAAAAAB8AA+i///////////////////wAAfgAAAAAMAAAC///////wAf/8AAAAAAAAAYAOeH///////////////////AAA/gAAAAAAAAAC///////8Af//AAAAAAAAAcAPQH//////////////////8AAA/AAAAAEAAAAAP///////z///wAAAAAAADuAETv//////////////////+AAA+AAAAAAAAAABP///////x///8AAAAAAAPHAX/////////////////////4AA8AAAAAAAAAAAj///////x///8AAAAAAAPPx//////////////////////6AAwAAAAAAAAAAAD///////////6AAAAAAAAPj//////////////////////6AAwAAAAAAAAAAACf//////////EAAAAAAAAQP//////////////////////zAAAAAAAAAAAAAABv////////+MNAAAAAAAAC///////////////////////zAAAAAAAAAAAAAAAP////////7wPgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAL/////////gCgAAAAAAAD///////////////////////iAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////vP/h//////////////BAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//GP/B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jx/+AD/H/////////////4HgAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Fw/8AA/B////////////+ACAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wAcf8PB/g////////////8AAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfB///x///////////v4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/IMCOH///h//////////+ZwAMAAAAAAAAAAAAAAAH///////4AAAAAAAQAAH/AACHP///g//////////8BwAMAAAAAAAAAAAAAAAD///////wAAAAAAAAAAH+AAYCH///g//////////+wYAYAAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+AABs//////////////gYD4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAh/+AAAA//////////////A4PwAAAAAAAAAAAAAAAB///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gjwAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAH///4OAB//////////////gBAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4D//////////////gCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAABv//hAYAAAAAAAAAAAP//////3//H///////////wAAAAAAAAAAAAAAAAAAAAv/+AAYAAAAAAAAAAAf/////////H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////8//h///////////gAAAAAAAAAAAAAAAAAAAAZ/+AAMAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/wB/f////////AAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/4YAf///////8QAAAAAAAAAAAAAAAAAAAACf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAvAAAAAAAAAAP////////H///AD///////AgAAAAAAAAAAAAAAAAAAAAAH8AQBgAAAAAAAAAf////////n//+ADf/4P//IAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+IAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAD/lwAD8AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AB/+AAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAP////////4f+AAAf8ADP/AAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAgAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAf/////////eAAAAHwAAN/gAsAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAf/////////gBAAAHwAAE/gACAAAAAAAAAAAAAAAAAAAAAAAADABIAAAAAAAAH/////////gIAAADwAAEfgALAAAAAAAAAAAAAAAAAAAAAAAADgPfIAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAHAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAA//////////wAAAAMAAEAAADgAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/7///////gAAAAMAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAP/B///////gAAAAAABDgAeAAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAAn//////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAD/////8AAAAAAAAMwH8AIAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAD/////wAAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAD////4AAAAAAAAAH/////gAAAAAAAAHgf8cIAAAAAAAAAAAAAAAAAAAAAAAAD/////AAAAAAAAAH/////AAAAAAAAADof8ASgAAAAAAAAAAAAAAAAAAAAAAAH////u4AAAAAAAAH/////AAAAAAAAABwP5wQwAAAAAAAAAAAAAAAAAAAAAAAH////94AAAAAAAAD////+AAAAAAAAAB+P5wAD4AAAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAB////8AAAAAAAAAA8ARQif/AAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAA////4AAAAAAAAAAcAAAAD/gAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMABAAI/ywAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAA////4AAAAAAAAAADgAAAIf8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AABA/4AAAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAfsgAOMAAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGgAAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAP///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAACgCAEAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAQAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AwAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAAz8DgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////+DwAAAAAAAAAAAD/8HgAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAA////8PwAAAAAAAAAAAH//XgAABABAAAAAgAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////gPgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgEAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA//vgAAAAAAAAAAA/4AAAAAAAAAAAAAAP8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAQAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAP4AAAAAAD+HgBj/AAAAgAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAACf/gAAB//////////AAAAAAAAAAAAAAAAAAAAAAAABoAAAAAAAAAAAAAAAAB////8Af///////////gAAAAAAAAAAAAAAAAAAAAAB34AAAAAAAAAAAAAAAGD////4D/////////////8AAAAAAAAAAAAAAAAAAAAAb8AAAAAAAAAAAc/kB//////4f/////////////+gAAAAAAAAAAAAAAAAAAAB98AAAAAAAA7+///////////x////////////////4AAAAAAAAAAAAAAHAAAB5+AAAAAAAA/////////////n////////////////gAAAAAAAAABAAAAP/+Gl/+AAAAAAAP/////////////////////////////+AAAAAAAAAAiAfsAP/////+AAAAAAA//////////////////////////////oAAAAAAAAH////////////wAAAAAAF//////////////////////////////AAAAAAAAH////////////wAAAAAAf///////////////////////////////gAAAAAD+P///////////8AAAAAAP////////////////////////////////zgAAAAA////////////PgCAAD8A/////////////////////////////////+AAAAB4B////////////wwAAD+AA///////////////////////////////8AAAAAAAA////////////wA/A/gAH///////////////////////////////+AAAAABgf//////////////gAAA/////////////////////////////////+AAAAAAAH//////////////4D////////////////////////////////////4AAAB/X//////////////////////////////////////////////////////4AAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const LAND = (() => { const s = atob(LAND_B64); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; })();
  function isLand(lat, lon) {
    const c = ((Math.floor(lon + 180) % 360) + 360) % 360;
    const r = Math.min(179, Math.max(0, Math.floor(90 - lat)));
    const i = r * 360 + c;
    return (LAND[i >> 3] & (128 >> (i & 7))) !== 0;
  }
  function ll(lat, lon, r) {
    const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  }

  const HUB = { lat: 44.99, lon: 38.95 }; // ProNet, пгт Яблоновский
  const NODES = [
    [55.75, 37.62], [59.94, 30.31], [60.17, 24.94], [59.33, 18.07], [50.11, 8.68], [52.37, 4.90],
    [51.51, -0.13], [41.01, 28.98], [25.20, 55.27], [43.24, 76.89], [55.03, 82.92], [40.71, -74.0],
    [1.35, 103.82], [35.68, 139.69],
  ];
  const LINKS = [[4, 6], [4, 11], [6, 11], [0, 10], [8, 12], [12, 13], [3, 2], [7, 8]];

  function createGlobe(uPixel, small) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    const uTime = { value: 0 };
    const R = 2;

    const anchor = new THREE.Group(); scene.add(anchor);
    const sway = new THREE.Group(); anchor.add(sway);
    const tilt = new THREE.Group(); sway.add(tilt);
    const spin = new THREE.Group(); tilt.add(spin);
    const LIGHT = 'normalize(vec3(-0.45, 0.55, 0.75))';

    // body
    spin.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.99, 96, 96), new THREE.ShaderMaterial({
      uniforms: { uA: { value: new THREE.Color('#040a15') }, uB: { value: new THREE.Color('#0d2744') }, uRim: { value: BLUE } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uA, uB, uRim; varying vec3 vN; varying vec3 vV;
        void main() {
          float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.4);
          float l = clamp(dot(vN, ${LIGHT}), 0.0, 1.0);
          gl_FragColor = vec4(uA + uB * l * 0.75 + uRim * fres * 0.55, 1.0);
        }`,
    })));

    // land dots
    const N = small ? 15000 : 32000;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pos = [], rnd = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * golden;
      const x = Math.cos(th) * rr, z = Math.sin(th) * rr;
      const lat = Math.asin(y) * 180 / Math.PI;
      // inverse of ll(): θ = lon + 180°, cosθ = -x/ρ, sinθ = z/ρ
      const lonN = ((Math.atan2(z, -x) * 180 / Math.PI - 180 + 540) % 360) - 180;
      if (!isLand(lat, lonN)) continue;
      pos.push(x * R, y * R, z * R);
      rnd.push(Math.random());
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    dg.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 1));
    spin.add(new THREE.Points(dg, new THREE.ShaderMaterial({
      uniforms: { uTime, uPixel, uC1: { value: new THREE.Color('#1c6aa0') }, uC2: { value: new THREE.Color('#a8e0ff') } },
      vertexShader: `attribute float aRnd; uniform float uTime, uPixel; varying float vA; varying float vL;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * position);
          float facing = dot(n, normalize(-mv.xyz));
          vL = clamp(dot(n, ${LIGHT}) * 0.8 + 0.35, 0.0, 1.0);
          float tw = 0.78 + 0.22 * sin(uTime * 1.4 + aRnd * 40.0);
          vA = smoothstep(-0.02, 0.45, facing) * tw;
          gl_PointSize = uPixel * (1.7 + aRnd * 0.5) * (10.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform vec3 uC1, uC2; varying float vA; varying float vL;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(mix(uC1, uC2, vL), smoothstep(0.5, 0.1, d) * vA);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })));

    // faint graticule
    const gp = [];
    const seg = 144;
    for (let lat = -60; lat <= 60; lat += 30) for (let j = 0; j < seg; j++) {
      const a = ll(lat, (j / seg) * 360 - 180, R * 1.003), b = ll(lat, ((j + 1) / seg) * 360 - 180, R * 1.003);
      gp.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    for (let lon = -180; lon < 180; lon += 30) for (let j = 0; j < seg / 2; j++) {
      const a = ll(-90 + (j / (seg / 2)) * 180, lon, R * 1.003), b = ll(-90 + ((j + 1) / (seg / 2)) * 180, lon, R * 1.003);
      gp.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
    spin.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false })));

    // atmosphere + halo
    sway.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.17, 64, 64), new THREE.ShaderMaterial({
      uniforms: { uColor: { value: BLUE } },
      vertexShader: `varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 vN; void main() { float i = pow(0.68 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(uColor, clamp(i * 0.36, 0.0, 1.0)); }`,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: BLUE, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(9.5, 9.5, 1);
    halo.position.z = -2.5;
    sway.add(halo);

    // hub (ProNet)
    const hub = ll(HUB.lat, HUB.lon, R);
    const hubDir = hub.clone().normalize();
    const qHub = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), hubDir);
    const ringGeo = new THREE.RingGeometry(0.05, 0.062, 48);
    const hubRings = [0, 1, 2].map(() => {
      const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: SKY, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.position.copy(hubDir).multiplyScalar(R * 1.006);
      m.quaternion.copy(qHub);
      spin.add(m);
      return m;
    });
    const hubGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: WHITE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    hubGlow.scale.set(0.34, 0.34, 1);
    hubGlow.position.copy(hubDir).multiplyScalar(R * 1.012);
    spin.add(hubGlow);
    const spikeGeo = new THREE.BufferGeometry().setFromPoints([hubDir.clone().multiplyScalar(R), hubDir.clone().multiplyScalar(R * 1.28)]);
    spikeGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array([1, 0]), 1));
    spin.add(new THREE.Line(spikeGeo, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: SKY } },
      vertexShader: `attribute float aT; varying float vT; void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying float vT; void main() { gl_FragColor = vec4(uColor, vT); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })));
    const labelAnchor = new THREE.Object3D();
    labelAnchor.position.copy(hubDir).multiplyScalar(R * 1.28);
    spin.add(labelAnchor);

    // arcs with light pulses
    const ARC_VS = `attribute float aT; varying float vT; void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const ARC_FS = `uniform float uTime, uSpeed, uOff, uBase; uniform vec3 uColor, uHead; varying float vT;
      void main() {
        float head = fract(uTime * uSpeed + uOff) * 1.5 - 0.25;
        float d = head - vT;
        float c = step(0.0, d) * pow(1.0 - smoothstep(0.0, 0.32, d), 2.0);
        float ends = smoothstep(0.0, 0.04, vT) * (1.0 - smoothstep(0.96, 1.0, vT));
        gl_FragColor = vec4(mix(uColor, uHead, c), (uBase + c * 0.95) * ends);
      }`;
    const arcs = [];
    const nodePts = [];
    const addArc = (a, b, primary) => {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dist = a.distanceTo(b);
      mid.normalize().multiplyScalar(R + dist * 0.38 + 0.04);
      const curve = new THREE.QuadraticBezierCurve3(a.clone().multiplyScalar(1.004), mid, b.clone().multiplyScalar(1.004));
      const pts = curve.getPoints(110);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const t = new Float32Array(pts.length);
      for (let i = 0; i < pts.length; i++) t[i] = i / (pts.length - 1);
      g.setAttribute('aT', new THREE.BufferAttribute(t, 1));
      const m = new THREE.ShaderMaterial({
        uniforms: { uTime, uSpeed: { value: (primary ? 0.16 : 0.1) + Math.random() * 0.08 }, uOff: { value: Math.random() }, uBase: { value: primary ? 0.2 : 0.08 }, uColor: { value: primary ? BLUE : STEEL }, uHead: { value: primary ? WHITE : SKY } },
        vertexShader: ARC_VS, fragmentShader: ARC_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      spin.add(new THREE.Line(g, m));
      arcs.push({ curve, m, primary });
    };
    const nodes = NODES.map(([la, lo]) => ll(la, lo, R));
    nodes.forEach((n) => { addArc(hub, n, true); nodePts.push(n.x * 1.006, n.y * 1.006, n.z * 1.006); });
    LINKS.forEach(([a, b]) => addArc(nodes[a], nodes[b], false));

    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(nodePts, 3));
    const pointMat = (size, color) => new THREE.ShaderMaterial({
      uniforms: { uTex: { value: GLOW }, uPixel, uSize: { value: size }, uColor: { value: color } },
      vertexShader: `attribute float aA; uniform float uPixel, uSize; varying float vA; varying float vF;
        void main() { vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); vF = smoothstep(-0.1, 0.3, dot(normalize(normalMatrix * position), normalize(-mv.xyz)));
          gl_PointSize = uSize * uPixel * (10.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uTex; uniform vec3 uColor; varying float vA; varying float vF;
        void main() { vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(mix(uColor, vec3(1.0), t.r * 0.5), t.a * vA * vF); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    ng.setAttribute('aA', new THREE.Float32BufferAttribute(new Array(nodes.length).fill(0.85), 1));
    spin.add(new THREE.Points(ng, pointMat(9, SKY)));

    const hg = new THREE.BufferGeometry();
    const hp = new Float32Array(arcs.length * 3), ha = new Float32Array(arcs.length);
    hg.setAttribute('position', new THREE.BufferAttribute(hp, 3));
    hg.setAttribute('aA', new THREE.BufferAttribute(ha, 1));
    spin.add(new THREE.Points(hg, pointMat(20, SKY)));

    // thin orbit with a satellite
    const orbit = new THREE.Group();
    orbit.rotation.set(1.2, 0, -0.35);
    const on = 256, op = new Float32Array((on + 1) * 3), ot = new Float32Array(on + 1);
    for (let i = 0; i <= on; i++) { const a = (i / on) * Math.PI * 2; op[i * 3] = Math.cos(a) * R * 1.32; op[i * 3 + 2] = Math.sin(a) * R * 1.32; ot[i] = i / on; }
    const og = new THREE.BufferGeometry();
    og.setAttribute('position', new THREE.BufferAttribute(op, 3));
    og.setAttribute('aT', new THREE.BufferAttribute(ot, 1));
    const orbitMat = new THREE.ShaderMaterial({
      uniforms: { uTime, uColor: { value: SKY } },
      vertexShader: ARC_VS,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; varying float vT;
        void main() { float head = fract(uTime * 0.045); float d = fract(head - vT); float tail = pow(1.0 - smoothstep(0.0, 0.45, d), 3.0);
          gl_FragColor = vec4(uColor, 0.06 * step(0.5, fract(vT * 160.0)) + tail * 0.55); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    orbit.add(new THREE.Line(og, orbitMat));
    const sat = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: WHITE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sat.scale.set(0.28, 0.28, 1);
    orbit.add(sat);
    tilt.add(orbit);

    // intro: double shockwave + flash when the globe powers on
    const waveGeo = new THREE.RingGeometry(R * 1.0, R * 1.03, 128);
    const shock = [0, 1].map(() => {
      const m = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      m.visible = false;
      sway.add(m);
      return m;
    });
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: WHITE, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    flash.scale.set(8, 8, 1);
    sway.add(flash);

    // orientation: bring the hub to the front, tilt the north toward the viewer
    const home = Math.atan2(-hub.x, hub.z) + 0.12;
    tilt.rotation.x = 0.5;
    spin.rotation.y = home;

    const state = { cx: 0, cy: 0, rpx: 0 };
    const v = new THREE.Vector3(), c = new THREE.Vector3(), camDir = new THREE.Vector3();

    return {
      scene, camera, state,
      layout(w, h, cx, cy, rpx) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const unit = (2 * halfH) / h;
        state.s = (rpx * unit) / R;
        anchor.scale.setScalar(state.s);
        anchor.position.set((cx - w / 2) * unit, (h / 2 - cy) * unit, 0);
        Object.assign(state, { cx, cy, rpx, unit, w, h });
      },
      update(time, input, p, intro) {
        uTime.value = time;
        anchor.scale.setScalar(state.s * Math.max(0.001, intro.scale));
        spin.rotation.y = home + Math.sin(time * 0.13) * 0.28 + input.spin + p * 0.9 + intro.kick;
        [[shock[0], intro.t - 0.5], [shock[1], intro.t - 0.78]].forEach(([m, t]) => {
          if (t < 0 || t > 1.3) { m.visible = false; return; }
          const e = t / 1.3;
          m.visible = true;
          m.scale.setScalar(1 + (1 - Math.pow(1 - e, 3)) * 1.8);
          m.material.opacity = Math.pow(1 - e, 1.5) * 0.95;
        });
        const ft = intro.t - 0.45;
        flash.material.opacity = ft > 0 && ft < 0.9 ? Math.sin((ft / 0.9) * Math.PI) * 0.75 : 0;
        tilt.rotation.x = 0.5 + input.tilt;
        sway.rotation.y += (input.mx * 0.18 - sway.rotation.y) * 0.05;
        sway.rotation.x += (input.my * 0.12 - sway.rotation.x) * 0.05;
        anchor.position.y = (state.h / 2 - state.cy) * state.unit + p * 1.4;
        hubRings.forEach((m, i) => {
          const k = (time * 0.55 + i / 3) % 1;
          m.scale.setScalar(1 + k * 4.5);
          m.material.opacity = (1 - k) * 0.9;
        });
        arcs.forEach((a, i) => {
          const u = a.m.uniforms;
          const head = ((time * u.uSpeed.value + u.uOff.value) % 1) * 1.5 - 0.25;
          if (head > 0.02 && head < 0.98) { a.curve.getPoint(head, v); hp[i * 3] = v.x; hp[i * 3 + 1] = v.y; hp[i * 3 + 2] = v.z; ha[i] = a.primary ? 1 : 0.6; }
          else ha[i] = 0;
        });
        hg.attributes.position.needsUpdate = true;
        hg.attributes.aA.needsUpdate = true;
        const sa = (time * 0.045) % 1 * Math.PI * 2;
        sat.position.set(Math.cos(sa) * R * 1.32, 0, Math.sin(sa) * R * 1.32);
      },
      label(el, canvas, p, ready) {
        if (!el) return;
        if (!ready) { el.style.opacity = 0; return; }
        labelAnchor.getWorldPosition(v);
        spin.getWorldPosition(c);
        const facing = v.clone().sub(c).normalize().dot(camDir.copy(camera.position).sub(v).normalize());
        v.project(camera);
        const cw = canvas.clientWidth, x = (v.x * 0.5 + 0.5) * cw, y = (-v.y * 0.5 + 0.5) * canvas.clientHeight;
        const lw = el.offsetWidth, flip = x + lw > cw - 16; // not enough room on the right → put it on the left
        el.classList.toggle('is-left', flip);
        el.style.transform = `translate(${(flip ? x - lw : x).toFixed(1)}px, ${(y - el.offsetHeight / 2).toFixed(1)}px)`;
        el.style.opacity = facing > 0.25 ? (Math.min(1, (facing - 0.25) * 4) * Math.max(0, 1 - p * 2)).toFixed(2) : 0;
      },
    };
  }

  /* =======================================================
     1) HERO — particle wave
     ======================================================= */
  function initWave() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const hero = canvas.parentElement;
    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const look = new THREE.Vector3(0, -0.6, -4);
    camera.position.set(0, 1.9, 8.5);

    const uTime = { value: 0 }, uPixel = { value: 1 };
    const uMouse = { value: new THREE.Vector2(0, 0) }, uAmp = { value: 0 };

    const small = coarse || innerWidth < 760;
    const COLS = small ? 120 : 210, ROWS = small ? 70 : 115;
    const W = 38, D = 26;
    const N = COLS * ROWS;
    const pos = new Float32Array(N * 3), rnd = new Float32Array(N);
    let k = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        pos[k * 3] = (c / (COLS - 1) - 0.5) * W;
        pos[k * 3 + 1] = 0;
        pos[k * 3 + 2] = (r / (ROWS - 1) - 0.5) * D - 5;
        rnd[k] = Math.random();
        k++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime, uPixel, uMouse, uAmp, uW: { value: W }, uC1: { value: STEEL }, uC2: { value: BLUE }, uC3: { value: SKY } },
      vertexShader: `
        attribute float aRnd;
        uniform float uTime, uPixel, uAmp, uW;
        uniform vec2 uMouse;
        varying float vH; varying float vA;
        void main() {
          vec3 p = position;
          float t = uTime;
          float h = sin(p.x * 0.28 + t * 0.55) * 0.55
                  + sin(p.z * 0.42 + t * 0.42) * 0.42
                  + sin((p.x + p.z) * 0.16 + t * 0.3) * 0.6
                  + sin(p.x * 0.9 - p.z * 0.7 + t * 0.9) * 0.08;
          float d = distance(p.xz, uMouse);
          float bump = exp(-d * d * 0.09) * uAmp;
          h += bump * 1.0 + sin(d * 1.8 - t * 3.2) * exp(-d * 0.32) * 0.14 * uAmp;
          p.y = h - 1.7;
          vH = h + bump * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float depth = -mv.z;
          float edge = 1.0 - smoothstep(0.36, 0.5, abs(position.x) / uW);
          vA = smoothstep(32.0, 7.0, depth) * smoothstep(0.5, 3.5, depth) * edge;
          gl_PointSize = uPixel * (1.15 + aRnd * 0.7 + bump * 1.6) * (10.0 / depth);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uC1, uC2, uC3;
        varying float vH; varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.08, d);
          float k = smoothstep(-1.0, 1.3, vH);
          vec3 col = mix(uC1, uC2, k);
          col = mix(col, uC3, smoothstep(0.9, 1.8, vH));
          gl_FragColor = vec4(col, a * vA * (0.35 + 0.65 * k));
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // horizon glow
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: BLUE, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(34, 9, 1);
    glow.position.set(0, -1.2, -16);
    scene.add(glow);

    // globe on top of the wave (same canvas, second pass)
    renderer.autoClear = false;
    const globe = createGlobe(uPixel, small);
    const inner = document.getElementById('heroInner');
    const kicker = inner && inner.querySelector('.kicker');
    const label = document.getElementById('globeLabel');
    const hint = document.getElementById('globeHint');
    if (hint && coarse) hint.querySelector('em').textContent = 'Проведите пальцем, чтобы покрутить';
    const hideHint = () => { if (hint) hint.classList.add('is-gone'); };
    setTimeout(hideHint, 14000);
    const placeGlobe = () => {
      const w = hero.clientWidth, h = hero.clientHeight, vh = Math.min(h, innerHeight);
      let cx, cy, rpx;
      if (w >= 900) {
        rpx = Math.min(vh * 0.29, w * 0.195);
        cx = w * 0.76;
        cy = vh * 0.47;
      } else {
        const top = inner && kicker ? inner.offsetTop + kicker.offsetTop : h * 0.4;
        const nav = 72, avail = Math.max(0, top - nav);
        rpx = Math.max(64, Math.min(w * 0.4, (avail / 2) * 0.78));
        cx = w / 2;
        cy = nav + avail / 2;
      }
      globe.layout(w, h, cx, cy, rpx);
      if (hint) { hint.style.left = `${cx}px`; hint.style.top = `${cy + rpx * 0.8}px`; }
    };

    const resize = () => { fit(renderer, camera, hero, uPixel); placeGlobe(); };
    resize();
    addEventListener('resize', resize);
    addEventListener('load', resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

    // drag the globe: mouse, pen and touch (on touch a vertical swipe still scrolls the page)
    const cursorEl = document.getElementById('cursor');
    const gi = { spin: 0, tilt: 0, vel: 0, mx: 0, my: 0, dragging: false, touch: false, lastX: 0, lastY: 0, lastDrag: -10 };
    const overGlobe = (e) => {
      const r = hero.getBoundingClientRect(), st = globe.state;
      return Math.hypot(e.clientX - r.left - st.cx, e.clientY - r.top - st.cy) < st.rpx * 1.05;
    };
    hero.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || !overGlobe(e) || e.target.closest('a, button, input')) return;
      gi.dragging = true; gi.touch = e.pointerType === 'touch';
      gi.lastX = e.clientX; gi.lastY = e.clientY; gi.vel = 0;
      hideHint();
      if (!gi.touch) { hero.style.cursor = 'grabbing'; e.preventDefault(); }
    });
    addEventListener('pointermove', (e) => {
      if (gi.dragging) {
        gi.vel = (e.clientX - gi.lastX) * (gi.touch ? 0.01 : 0.006);
        gi.spin += gi.vel;
        if (!gi.touch) gi.tilt = Math.max(-0.45, Math.min(0.45, gi.tilt + (e.clientY - gi.lastY) * 0.004));
        gi.lastX = e.clientX; gi.lastY = e.clientY; gi.lastDrag = time;
      } else if (e.pointerType !== 'touch') {
        const over = overGlobe(e) && !e.target.closest('a, button, input');
        hero.style.cursor = over ? 'grab' : '';
        if (cursorEl && over) cursorEl.classList.add('is-hover');
      }
    }, { passive: true });
    const endDrag = () => { if (gi.dragging) { gi.dragging = false; hero.style.cursor = ''; } };
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    // pointer → point on the wave plane
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.7);
    const target = new THREE.Vector2(0, -2);
    let mx = 0, my = 0, lastMove = -10, time = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      mx = ndc.x; my = ndc.y; gi.mx = ndc.x; gi.my = -ndc.y;
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) { target.set(hit.x, hit.z); lastMove = time; }
    }, { passive: true });

    const root = document.documentElement;
    let readyAt = -1;
    const easeOutBack = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    const start = makeLoop(canvas, (dt) => {
      time += dt * SPEED;
      uTime.value = time;
      if (readyAt < 0 && root.classList.contains('is-ready')) readyAt = time;
      // globe powers on ~1s after the page opens, when the title has assembled
      const it = readyAt < 0 ? -1 : (time - readyAt) * (reduce ? 50 : 1) - 1.0;
      const k = it < 0 ? 0 : Math.min(1, it / 0.95);
      const intro = { scale: k <= 0 ? 0 : easeOutBack(k), kick: (1 - (1 - Math.pow(1 - k, 3))) * 2.6, t: it };
      uMouse.value.lerp(target, 0.08);
      const active = time - lastMove < 2.5 ? 1 : 0;
      uAmp.value += (active - uAmp.value) * 0.04;

      camera.position.x += (mx * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (1.9 + my * 0.35 - camera.position.y) * 0.03;
      const p = Math.min(1, scrollY / (hero.offsetHeight || 1));
      camera.position.z = 8.5 - p * 2.2;
      camera.lookAt(look.x, look.y - p * 0.8, look.z);
      const fadeIn = readyAt < 0 ? 0 : Math.min(1, ((time - readyAt) * (reduce ? 50 : 1)) / 1.2);
      canvas.style.opacity = String(fadeIn * (1 - p * 0.85));
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p * 5));

      if (!gi.dragging) {
        gi.vel *= 0.94;
        gi.spin += gi.vel;
        if (time - gi.lastDrag > 2.5) { gi.spin *= 0.985; gi.tilt *= 0.97; }
      }
      globe.update(time, gi, p, intro);

      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(globe.scene, globe.camera);
      globe.label(label, canvas, p, k >= 1);
    });
    addEventListener('resize', start);
  }

  /* =======================================================
     2) TECH — fiber optic bundle
     ======================================================= */
  function initFiber() {
    const canvas = document.getElementById('fiberCanvas');
    if (!canvas) return;
    const stage = canvas.parentElement;
    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 15);
    const uTime = { value: 0 }, uPixel = { value: 1 };

    const group = new THREE.Group();
    group.rotation.y = -0.32;
    group.rotation.x = 0.08;
    scene.add(group);

    const VS = `
      attribute float aT;
      uniform float uTime, uSeed;
      varying float vT;
      void main() {
        vT = aT;
        vec3 p = position;
        float loose = 1.0 - smoothstep(0.25, 0.7, aT);
        p.y += sin(uTime * 0.7 + aT * 7.0 + uSeed * 6.28) * 0.12 * loose;
        p.z += cos(uTime * 0.6 + aT * 5.0 + uSeed * 4.0) * 0.12 * loose;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`;
    const FS = `
      uniform float uTime, uSpeed, uOff, uBase;
      uniform vec3 uColor, uHead;
      varying float vT;
      float comet(float head, float t) {
        float d = head - t;
        return step(0.0, d) * pow(1.0 - smoothstep(0.0, 0.22, d), 2.0);
      }
      void main() {
        float h1 = fract(uTime * uSpeed + uOff) * 1.4 - 0.2;
        float h2 = fract(uTime * uSpeed + uOff + 0.5) * 1.4 - 0.2;
        float c = max(comet(h1, vT), comet(h2, vT));
        float fade = smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.93, 1.0, vT));
        vec3 col = mix(uColor, uHead, c);
        gl_FragColor = vec4(col, (uBase + c * 0.95) * fade);
      }`;

    const small = coarse || innerWidth < 760;
    const STR = small ? 34 : 64;
    const heads = [];
    for (let i = 0; i < STR; i++) {
      // fan out on the left, converge into a tight cable on the right
      const a = Math.random() * Math.PI * 2;
      const r0 = 1.2 + Math.random() * 3.6;
      const yr = Math.sin(a) * r0, zr = Math.cos(a) * r0 * 0.8;
      const ca = Math.random() * Math.PI * 2, cr = Math.sqrt(Math.random()) * 0.32;
      const yc = Math.sin(ca) * cr, zc = Math.cos(ca) * cr;
      const pts = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        const x = -13 + t * 26;
        const m = 1 - (t < 0.62 ? Math.pow(t / 0.62, 1.6) : 1);
        const wobble = Math.sin(t * 5 + i) * 0.25 * m;
        pts.push(new THREE.Vector3(x, yc + (yr - yc) * m + wobble, zc + (zr - zc) * m));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
      const sp = curve.getPoints(220);
      const g = new THREE.BufferGeometry().setFromPoints(sp);
      const at = new Float32Array(sp.length);
      for (let j = 0; j < sp.length; j++) at[j] = j / (sp.length - 1);
      g.setAttribute('aT', new THREE.BufferAttribute(at, 1));
      const bright = Math.random() < 0.3;
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uTime, uSeed: { value: Math.random() }, uSpeed: { value: 0.08 + Math.random() * 0.1 }, uOff: { value: Math.random() },
          uBase: { value: bright ? 0.16 : 0.07 }, uColor: { value: bright ? BLUE : STEEL }, uHead: { value: bright ? WHITE : SKY },
        },
        vertexShader: VS, fragmentShader: FS,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      });
      group.add(new THREE.Line(g, m));
      heads.push({ curve, m });
    }

    // glowing heads (sprites follow the comets)
    const hg = new THREE.BufferGeometry();
    const hp = new Float32Array(heads.length * 2 * 3), ha = new Float32Array(heads.length * 2);
    hg.setAttribute('position', new THREE.BufferAttribute(hp, 3));
    hg.setAttribute('aA', new THREE.BufferAttribute(ha, 1));
    group.add(new THREE.Points(hg, new THREE.ShaderMaterial({
      uniforms: { uTex: { value: GLOW }, uPixel, uColor: { value: SKY } },
      vertexShader: `
        attribute float aA; uniform float uPixel; varying float vA;
        void main() { vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = 22.0 * uPixel * (15.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `
        uniform sampler2D uTex; uniform vec3 uColor; varying float vA;
        void main() { vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(mix(uColor, vec3(1.0), t.r * 0.6), t.a * vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })));

    // light at the cable end
    const end = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: BLUE, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    end.scale.set(5, 5, 1);
    end.position.set(13, 0, 0);
    group.add(end);

    // dust
    const DN = small ? 160 : 320;
    const dp = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) { dp[i * 3] = (Math.random() - 0.5) * 30; dp[i * 3 + 1] = (Math.random() - 0.5) * 12; dp[i * 3 + 2] = (Math.random() - 0.5) * 10; }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.07, map: GLOW, color: SKY, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    const resize = () => {
      fit(renderer, camera, stage, uPixel);
      // keep the whole bundle in frame on narrow screens
      camera.position.z = camera.aspect < 1 ? 15 / Math.max(camera.aspect, 0.55) * 0.9 : 15;
    };
    resize();
    addEventListener('resize', resize);

    let mx = 0, my = 0, time = 0;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = ((e.clientY - r.top) / r.height) * 2 - 1;
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { mx = 0; my = 0; });

    const v = new THREE.Vector3();
    const start = makeLoop(canvas, (dt) => {
      time += dt * SPEED;
      uTime.value = time;
      group.rotation.y += (-0.32 + mx * 0.25 - group.rotation.y) * 0.04;
      group.rotation.x += (0.08 + my * 0.12 - group.rotation.x) * 0.04;
      dust.rotation.y += dt * 0.01;

      heads.forEach((h, i) => {
        const u = h.m.uniforms;
        [0, 0.5].forEach((o, j) => {
          const head = ((time * u.uSpeed.value + u.uOff.value + o) % 1) * 1.4 - 0.2;
          const idx = i * 2 + j;
          if (head >= 0.02 && head <= 0.98) {
            h.curve.getPoint(head, v);
            hp[idx * 3] = v.x; hp[idx * 3 + 1] = v.y; hp[idx * 3 + 2] = v.z;
            ha[idx] = u.uBase.value > 0.1 ? 1 : 0.55;
          } else ha[idx] = 0;
        });
      });
      hg.attributes.position.needsUpdate = true;
      hg.attributes.aA.needsUpdate = true;
      end.material.opacity = 0.55 + Math.sin(time * 2) * 0.15;

      renderer.render(scene, camera);
    });
    addEventListener('resize', start);
  }

  try { initWave(); } catch (e) { console.error(e); root.classList.add('no-webgl'); }
  try { initFiber(); } catch (e) { console.error(e); }
})();
