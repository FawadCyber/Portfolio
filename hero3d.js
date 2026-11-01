// Real-time WebGL hero: the gold V logo extruded into 3D with a physically based
// gold material, studio reflections, gold dust particles and (desktop) bloom.
// Reacts to the pointer and to scroll. Pauses when off screen or in a hidden tab.
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.querySelector(".hero-3d");
const canvas = document.getElementById("v3d");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.matchMedia("(max-width: 720px)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

if (host && canvas && webglOK()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // Studio reflections without downloading an HDR file.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Warm key and rim lights for gold highlights.
  const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd9b26f, 3.0); rim.position.set(-6, 2, -4); scene.add(rim);
  const fill = new THREE.PointLight(0xb5874a, 18, 20); fill.position.set(0, -3, 3); scene.add(fill);

  // The logo paths from favicon.svg, in their original coordinate space (mirror half included).
  const half = '<path d="M130 262 L855 830 L630 738 L830 1080 L435 770 Z"/><path d="M322 752 L860 1120 Q935 1200 965 1340 L965 1690 L800 1385 Q640 1150 435 985 Z"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${half}<g transform="translate(1930 0) scale(-1 1)">${half}</g></svg>`;
  const data = new SVGLoader().parse(svg);

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9b26f, metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 1.25 });
  const goldDark = new THREE.MeshPhysicalMaterial({ color: 0xa8763c, metalness: 1, roughness: 0.32, envMapIntensity: 1.0 });

  const logo = new THREE.Group();
  const halves = [new THREE.Group(), new THREE.Group()];
  const extrude = { depth: 110, bevelEnabled: true, bevelThickness: 22, bevelSize: 14, bevelSegments: small ? 3 : 6, curveSegments: small ? 8 : 16 };
  data.paths.forEach((p, i) => {
    SVGLoader.createShapes(p).forEach((shape) => {
      const geo = new THREE.ExtrudeGeometry(shape, extrude);
      const mesh = new THREE.Mesh(geo, [gold, goldDark]); // caps polished, sides slightly darker
      halves[i < 2 ? 0 : 1].add(mesh);
    });
  });
  halves.forEach((h) => logo.add(h));

  // Centre, flip (SVG y points down) and scale to a comfortable size.
  const box = new THREE.Box3().setFromObject(logo);
  const centre = box.getCenter(new THREE.Vector3());
  halves.forEach((h) => h.children.forEach((m) => m.geometry.translate(-centre.x, -centre.y, -centre.z)));
  const size = box.getSize(new THREE.Vector3());
  const scale = 3.6 / Math.max(size.x, size.y);
  logo.scale.set(scale, -scale, scale);
  scene.add(logo);

  // Gold dust.
  const COUNT = small ? 260 : 700;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 2.2 + Math.random() * 4.5, a = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 6;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r - 1.5;
    seed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement("canvas"); dot.width = dot.height = 64;
  const g = dot.getContext("2d"); const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,236,190,1)"); grd.addColorStop(0.35, "rgba(217,178,111,.55)"); grd.addColorStop(1, "rgba(217,178,111,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: small ? 0.07 : 0.06, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85 }));
  scene.add(dust);

  // Soft glow behind the logo (a cheap stand-in for bloom that keeps the canvas transparent).
  const glowTex = new THREE.CanvasTexture(dot);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xd9b26f, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(7, 7, 1); glow.position.z = -1.5; scene.add(glow);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 11 : 9;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  // Input: pointer (desktop) and scroll progress through the hero.
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  if (finePointer && !reduce) {
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  let scrollP = 0;
  const hero = document.querySelector(".hero");
  const onScroll = () => { const r = hero.getBoundingClientRect(); scrollP = Math.min(1, Math.max(0, -r.top / r.height)); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Intro: the two halves fly in from the sides and lock together.
  const t0 = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  let running = true, visible = true, raf = 0, last = t0;

  function frame(now) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    const intro = reduce ? 1 : ease(Math.min(1, t / 1.8));
    halves[0].position.x = (1 - intro) * -900; halves[1].position.x = (1 - intro) * 900;
    halves[0].rotation.y = (1 - intro) * -1.2; halves[1].rotation.y = (1 - intro) * 1.2;

    cur.x += (target.x - cur.x) * Math.min(1, dt * 4);
    cur.y += (target.y - cur.y) * Math.min(1, dt * 4);
    const idle = reduce ? 0 : Math.sin(t * 0.6) * 0.18;
    logo.rotation.y = idle + cur.x * 0.45 + scrollP * Math.PI * 1.1;
    logo.rotation.x = cur.y * 0.25 + scrollP * 0.35;
    logo.position.y = (reduce ? 0 : Math.sin(t * 1.1) * 0.08) + scrollP * 0.8;
    const s = scale * (0.75 + intro * 0.25) * (1 - scrollP * 0.15);
    logo.scale.set(s, -s, s);

    dust.rotation.y = t * 0.03 + cur.x * 0.08;
    dust.position.y = Math.sin(t * 0.3) * 0.1;
    rim.position.x = -6 + cur.x * 3;

    glow.material.opacity = 0.28 + Math.sin(t * 1.4) * 0.06 + (1 - intro) * 0.3;
    renderer.render(scene, camera);
    host.classList.add("ready");
    if (visible) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && running) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { rootMargin: "100px" }).observe(host);
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) start(); });
  start();
}
