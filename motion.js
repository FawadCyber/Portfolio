// Motion effects modelled on Motion Primitives (text effect, tilt, spotlight,
// animated number, magnetic, in-view reveal), built on the Motion library
// that powers Framer Motion. Content is fully visible without this file.
import { animate, inView, scroll, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.43.0/+esm";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const spring = { type: "spring", stiffness: 260, damping: 26 };

/* Hero video: loads after first paint, phones get the 720p file, skipped for reduced motion or data saver. */
const hv = $("[data-hero-video]");
const saveData = navigator.connection && navigator.connection.saveData;
if (hv && !reduce && !saveData) {
  const src = $("source", hv);
  src.src = window.matchMedia("(max-width: 720px)").matches ? src.dataset.srcMobile : src.dataset.srcDesktop;
  hv.load();
  const play = () => hv.play().catch(() => {});
  hv.addEventListener("canplay", play, { once: true });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); else hv.pause(); }).observe(hv);
}

/* Scroll progress bar */
const bar = $(".progress");
if (bar && !reduce) scroll(animate(bar, { scaleX: [0, 1] }, { ease: "linear" }));

if (!reduce) {
  /* TextEffect: headline words rise in with a blur, one after another. */
  const h1 = $(".hero h1");
  if (h1) {
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span");
            w.className = "word";
            w.textContent = part;
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          wrap(child);
        }
      });
    };
    wrap(h1);
    const words = $$(".word", h1);
    words.forEach((w) => { w.style.opacity = "0"; });
    animate(words, { opacity: [0, 1], y: [18, 0], filter: ["blur(8px)", "blur(0px)"] }, { duration: 0.7, delay: stagger(0.06, { startDelay: 0.1 }), ease: [0.2, 0.8, 0.2, 1] });
  }

  /* Hero copy and 3D card entrance */
  const heroBits = $$(".hero .eyebrow, .hero .lede, .hero .hero-actions");
  heroBits.forEach((el) => { el.style.opacity = "0"; });
  animate(heroBits, { opacity: [0, 1], y: [14, 0] }, { duration: 0.6, delay: stagger(0.1, { startDelay: 0.45 }) });
  const scene = $(".scene");
  if (scene) {
    scene.style.opacity = "0";
    animate(scene, { opacity: [0, 1], scale: [0.92, 1], rotateX: [14, 0] }, { duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] });
  }

  /* In-view reveal: section headings, then their cards in a stagger. */
  $$(".section-head, .stats, .marquee, .contact-card, .skills, .method").forEach((el) => {
    el.style.opacity = "0";
    inView(el, () => { animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }); }, { margin: "0px 0px -10% 0px" });
  });
  $$(".cards, .products, .repos").forEach((group) => {
    const run = () => {
      const items = $$(".card, .product, .repo", group);
      items.forEach((i) => { i.style.opacity = "0"; });
      animate(items, { opacity: [0, 1], y: [30, 0], rotateX: [8, 0] }, { duration: 0.7, delay: stagger(0.07), ease: [0.2, 0.8, 0.2, 1] });
    };
    if (group.id === "repos") {
      // Repos arrive from the GitHub API; reveal them once they render.
      const mo = new MutationObserver(() => { if ($(".repo", group)) { mo.disconnect(); inView(group, run, { margin: "0px 0px -10% 0px" }); } });
      mo.observe(group, { childList: true });
    } else {
      inView(group, run, { margin: "0px 0px -10% 0px" });
    }
  });

  /* AnimatedNumber: stats count up when they enter the viewport. */
  $$(".stats dt").forEach((dt) => {
    const target = parseInt(dt.textContent, 10);
    if (!Number.isFinite(target)) return;
    dt.textContent = "0";
    inView(dt, () => {
      animate(0, target, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { dt.textContent = String(Math.round(v)); } });
    });
  });
}

/* Spotlight: a soft glow follows the cursor inside cards. Cheap: only updates CSS variables. */
if (finePointer) {
  $$(".card, .product, .repo").forEach(bindSpotlight);
  const reposEl = $("#repos");
  if (reposEl) new MutationObserver(() => $$(".repo", reposEl).forEach(bindSpotlight)).observe(reposEl, { childList: true });
}
function bindSpotlight(el) {
  if (el.dataset.spot) return;
  el.dataset.spot = "1";
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

/* Tilt: 3D tilt on the hero card and system cards (desktop pointers only). */
if (finePointer && !reduce) {
  const tilt = (el, max) => {
    let frame = 0;
    el.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        animate(el, { rotateY: px * max, rotateX: -py * max }, spring);
      });
    });
    el.addEventListener("pointerleave", () => animate(el, { rotateY: 0, rotateX: 0 }, spring));
  };
  const card = $(".hero-card");
  if (card) tilt(card, 16);
  $$(".cards .card").forEach((c) => tilt(c, 7));

  /* Magnetic: primary buttons lean toward the cursor. */
  $$(".btn-dark, .btn-wa, .btn-light").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      animate(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35 }, spring);
    });
    btn.addEventListener("pointerleave", () => animate(btn, { x: 0, y: 0 }, spring));
  });
}

/* Pause the CSS orbit while the hero is off screen so it never costs frames elsewhere. */
const orbit = $(".orbit");
if (orbit && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    const state = entry.isIntersecting ? "running" : "paused";
    orbit.style.animationPlayState = state;
    $$(".badge span", orbit).forEach((s) => { s.style.animationPlayState = state; });
  }).observe($(".scene") || orbit);
}

/* Safety net: never leave content hidden if an animation is throttled or skipped.
   Above-the-fold items are forced visible after 3s; others 3s after they scroll into view. */
const forceShow = (el) => { if (el.style.opacity === "0") { el.style.opacity = ""; el.style.transform = ""; el.style.filter = ""; } };
setTimeout(() => {
  document.querySelectorAll('[style*="opacity: 0"]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) forceShow(el);
    else inView(el, () => { setTimeout(() => forceShow(el), 3000); });
  });
}, 3000);
