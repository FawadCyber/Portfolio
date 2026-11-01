// Whole-page 3D: one fixed WebGL layer behind every section. Thousands of gold
// particles morph into a different formation per section as you scroll:
// galaxy (hero) -> wave grid (systems) -> torus (products) -> helix (GitHub)
// -> sphere (about) -> the V logo (contact). Pointer adds parallax.
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const canvas = document.getElementById("world");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.matchMedia("(max-width: 720px)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lite = window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 760px)").matches; // phones and tablets only

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
if (canvas && webglOK()) init();

function init() {
  const N = lite ? 900 : 6500;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.6);
  let pixelRatio = dpr;
  renderer.setPixelRatio(pixelRatio);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  // ---------- Formations (each a Float32Array of N xyz points) ----------
  const rnd = (a, b) => a + Math.random() * (b - a);
  const make = (fn) => { const a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } return a; };

  const galaxy = make((i) => {
    const arm = i % 3, r = Math.pow(Math.random(), 0.7) * 7.5, a = r * 0.75 + arm * (Math.PI * 2 / 3) + rnd(-0.35, 0.35);
    return [Math.cos(a) * r, rnd(-0.35, 0.35) * (1.2 - r / 9), Math.sin(a) * r];
  });
  const side = Math.ceil(Math.sqrt(N));
  const wave = make((i) => {
    const gx = (i % side) / side - 0.5, gz = Math.floor(i / side) / side - 0.5;
    const x = gx * 18, z = gz * 12;
    return [x, Math.sin(x * 0.6) * 0.7 + Math.cos(z * 0.8) * 0.5 - 1.5, z];
  });
  const torus = make(() => {
    const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2, R = 4.6, r = 1.5 + rnd(-0.12, 0.12);
    return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)];
  });
  const helix = make((i) => {
    const strand = i % 3, t = (i / N) * Math.PI * 14 - Math.PI * 7, y = t * 0.62;
    if (strand === 2) { // rungs between the two strands
      const k = Math.random(), a = t;
      return [Math.cos(a) * 2.4 * (2 * k - 1), y, Math.sin(a) * 2.4 * (2 * k - 1)];
    }
    const a = t + strand * Math.PI;
    return [Math.cos(a) * 2.4 + rnd(-0.08, 0.08), y, Math.sin(a) * 2.4 + rnd(-0.08, 0.08)];
  });
  const sphere = make((i) => {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963229728653, R = 5 + rnd(-0.08, 0.08);
    return [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R];
  });

  // The V logo as particles: sample points across its triangulated faces.
  const half = '<path d="M130 262 L855 830 L630 738 L830 1080 L435 770 Z"/><path d="M322 752 L860 1120 Q935 1200 965 1340 L965 1690 L800 1385 Q640 1150 435 985 Z"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${half}<g transform="translate(1930 0) scale(-1 1)">${half}</g></svg>`;
  const tris = [];
  new SVGLoader().parse(svg).paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => {
    const g = new THREE.ShapeGeometry(s, 12).toNonIndexed();
    const pa = g.attributes.position.array;
    for (let i = 0; i < pa.length; i += 9) {
      const A = [pa[i], pa[i + 1]], B = [pa[i + 3], pa[i + 4]], C = [pa[i + 6], pa[i + 7]];
      const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
      tris.push({ A, B, C, area });
    }
  }));
  const total = tris.reduce((s, t) => s + t.area, 0);
  const vLogo = make(() => {
    let pick = Math.random() * total, t = tris[0];
    for (const tr of tris) { pick -= tr.area; if (pick <= 0) { t = tr; break; } }
    let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const x = t.A[0] + u * (t.B[0] - t.A[0]) + v * (t.C[0] - t.A[0]);
    const y = t.A[1] + u * (t.B[1] - t.A[1]) + v * (t.C[1] - t.A[1]);
    return [(x - 965) * 0.0062, -(y - 975) * 0.0062, rnd(-0.35, 0.35)];
  });

  const formations = [galaxy, galaxy, wave, torus, helix, sphere, vLogo];
  const anchors = [".hero", "#cinema", "#work", "#products", "#github", "#about", "#contact"].map((s) => document.querySelector(s));

  // ---------- Particle system ----------
  const geo = new THREE.BufferGeometry();
  const current = new Float32Array(galaxy);
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  geo.setAttribute("position", new THREE.BufferAttribute(current, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: lite ? 46 : 78 }, uPixelRatio: { value: dpr }, uFade: { value: 1 } },
    vertexShader: `
      attribute float aSeed; uniform float uTime; uniform float uSize; uniform float uPixelRatio;
      varying float vSeed; varying float vDepth;
      void main() {
        vec3 p = position;
        p += vec3(sin(uTime * .7 + aSeed * 31.), cos(uTime * .6 + aSeed * 17.), sin(uTime * .5 + aSeed * 23.)) * .06;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (.45 + aSeed * .9) / -mv.z;
        vSeed = aSeed; vDepth = -mv.z;
      }`,
    fragmentShader: `
      varying float vSeed; varying float vDepth; uniform float uFade;
      void main() {
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., d);
        vec3 gold = mix(vec3(.85, .70, .44), vec3(1., .93, .76), step(.86, vSeed));
        float fog = clamp(1.25 - vDepth / 26., .15, 1.);
        gl_FragColor = vec4(gold, a * fog * uFade);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    mat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    camera.aspect = w / h;
    camera.position.z = 14;
    group.scale.setScalar(Math.min(1, (w / h) / 0.95)); // fit narrow screens
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------- Scroll -> formation index ----------
  let docTops = [];
  const measure = () => { docTops = anchors.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : Infinity)); };
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  setTimeout(measure, 1500);
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  function formationIndex() {
    const mid = window.scrollY + window.innerHeight * 0.55;
    let i = 0;
    while (i < docTops.length - 1 && mid >= docTops[i + 1]) i++;
    if (i >= docTops.length - 1) return docTops.length - 1;
    const span = docTops[i + 1] - docTops[i];
    const frac = span > 0 ? (mid - docTops[i]) / span : 0;
    return i + smooth(0.5, 1, frac); // hold each shape, morph in the last half of the section
  }

  let lastF = -1;
  function applyMorph(f) {
    const a = Math.floor(f), b = Math.min(formations.length - 1, a + 1), t = f - a;
    const A = formations[a], B = formations[b];
    for (let k = 0; k < current.length; k++) current[k] = A[k] + (B[k] - A[k]) * t;
    geo.attributes.position.needsUpdate = true;
  }

  // ---------- Pointer parallax ----------
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  if (finePointer && !reduce) window.addEventListener("pointermove", (e) => {
    target.x = e.clientX / window.innerWidth - 0.5; target.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  // ---------- Loop (stops while the tab is hidden) ----------
  let raf = 0, running = true, last = performance.now(), time = 0, fSmooth = 0;
  const heroEl = document.querySelector(".hero");
  function frame(now) {
    raf = 0; if (!running) return;
    if (lite) {
      // Phones: ~30 fps, and skip rendering while the hero (with its own 3D logo) fills the screen.
      const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
      if (now - last < 32 || heroBottom > window.innerHeight * 0.5) { raf = requestAnimationFrame(frame); if (now - last >= 32) last = now; return; }
    }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduce) time += dt;

    const f = formationIndex();
    fSmooth += (f - fSmooth) * Math.min(1, dt * 5);
    if (Math.abs(fSmooth - lastF) > 0.0005) { applyMorph(fSmooth); lastF = fSmooth; }

    cur.x += (target.x - cur.x) * Math.min(1, dt * 3); cur.y += (target.y - cur.y) * Math.min(1, dt * 3);
    group.rotation.y = time * 0.05 + cur.x * 0.5 + fSmooth * 0.9;
    group.rotation.x = 0.35 + cur.y * 0.3 - (fSmooth > 5.5 ? (fSmooth - 5.5) * 0.7 : 0); // face the V head-on at the end
    if (fSmooth > 5.5) group.rotation.y *= 1 - Math.min(1, (fSmooth - 5.5) * 2);       // and stop spinning
    // Quieter in the hero, where the WebGL logo and video already carry the scene.
    mat.uniforms.uFade.value = 0.35 + Math.min(1, fSmooth) * 0.65;
    mat.uniforms.uTime.value = time;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  canvas.classList.add("ready");
  raf = requestAnimationFrame(frame);
}
