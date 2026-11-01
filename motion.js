// Motion effects modelled on Motion Primitives (text effect, tilt, spotlight,
// animated number, magnetic, in-view reveal), built on the Motion library
// that powers Framer Motion. Content is fully visible without this file.
import { animate, inView, scroll, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.43.0/+esm";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lite = window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 760px)").matches; // phones and tablets only
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const spring = { type: "spring", stiffness: 260, damping: 26 };

/* Hero video: loads after first paint, phones get the 720p file, skipped for reduced motion or data saver. */
const hv = $("[data-hero-video]");
const saveData = navigator.connection && navigator.connection.saveData;
if (hv && !reduce && !saveData && !lite) {
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

/* ---------- Scroll cinema: scrub the 3D logo film with scroll ---------- */
const cinema = $(".cinema");
const cv = $("[data-cinema]");
if (cinema && cv) {
  const lines = $$(".cinema-line", cinema);
  const pbar = $(".cinema-progress i", cinema);
  const lite = window.matchMedia("(max-width: 720px)").matches || !finePointer;
  if (reduce) {
    document.documentElement.classList.add("no-motion");
  } else {
    let duration = 0, target = 0, current = 0, raf = 0, ready = false;
    const tick = () => {
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.004) current = target;
      if (ready && Math.abs(cv.currentTime - current) > 0.02) cv.currentTime = current;
      raf = current !== target ? requestAnimationFrame(tick) : 0;
    };
    if (lite) {
      // Phones and touch devices: play a light looping version instead of scrubbing.
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      cv.src = portrait && cv.dataset.loopVertical ? cv.dataset.loopVertical : cv.dataset.loop;
      if (portrait && cv.dataset.posterVertical) cv.poster = cv.dataset.posterVertical;
      cv.classList.toggle("is-vertical", portrait && !!cv.dataset.loopVertical);
      cv.loop = true; cv.autoplay = true; cv.preload = "metadata";
      inView(cinema, () => { cv.play().catch(() => {}); return () => cv.pause(); });
    } else {
      // Load the scrub file only when the visitor gets close to the section.
      inView(cinema, () => {
        if (ready || cv.src) return;
        cv.src = cv.dataset.scrub; cv.preload = "auto";
        cv.addEventListener("loadedmetadata", () => { duration = cv.duration; ready = true; }, { once: true });
      }, { margin: "100% 0px 100% 0px" });
    }
    scroll((p) => {
      if (pbar) pbar.style.transform = `scaleX(${p})`;
      if (!lite && ready) { target = p * (duration - 0.05); if (!raf) raf = requestAnimationFrame(tick); }
      const n = lines.length;
      lines.forEach((line, i) => {
        const d = (p - (i + 0.5) / n) * n;             // 0 when this line is centred in its slot
        const o = Math.max(0, 1 - Math.abs(d) * 1.9);
        line.style.opacity = o.toFixed(3);
        line.style.transform = `translateY(${(-d * 70).toFixed(1)}px) scale(${(0.94 + o * 0.06).toFixed(3)})`;
      });
    }, { target: cinema, offset: ["start start", "end end"] });
  }
}

if (!reduce) {
  /* 3D letter flip on section headings */
  $$(".section-head h2").forEach((h2) => {
    const words = h2.textContent.trim().split(/\s+/);
    h2.textContent = "";
    words.forEach((w, wi) => {
      const ws = document.createElement("span");
      ws.style.display = "inline-block"; ws.style.whiteSpace = "nowrap";
      [...w].forEach((ch) => { const s = document.createElement("span"); s.className = "char"; s.textContent = ch; ws.append(s); });
      h2.append(ws);
      if (wi < words.length - 1) h2.append(" ");
    });
    const chars = $$(".char", h2);
    chars.forEach((s) => { s.style.opacity = "0"; });
    inView(h2, () => {
      animate(chars, { opacity: [0, 1], rotateX: [-90, 0], y: [20, 0] }, { duration: 0.6, delay: stagger(0.018), ease: [0.2, 0.8, 0.2, 1] });
    }, { margin: "0px 0px -10% 0px" });
  });

  /* Hero parallax: copy lifts away and the video drifts as you scroll out of the hero */
  const hero = $(".hero");
  const heroCopy = $(".hero-copy");
  const heroVid = $(".hero-video video");
  if (!lite && hero && heroCopy) scroll(animate(heroCopy, { y: [0, -90], opacity: [1, 0.15] }, { ease: "linear" }), { target: hero, offset: ["start start", "end start"] });
  if (!lite && hero && heroVid) scroll(animate(heroVid, { y: [0, 120], scale: [1, 1.12] }, { ease: "linear" }), { target: hero, offset: ["start start", "end start"] });

  /* Systems grid rises from a steep 3D angle, tied to scroll */
  const grid = $("#work .cards");
  const work = $("#work");
  if (!lite && grid && work) {
    work.style.perspective = "1400px";
    scroll(animate(grid, { rotateX: [26, 0], y: [90, 0], scale: [0.94, 1] }, { ease: "linear" }), { target: grid, offset: ["start end", "start 35%"] });
  }

  /* Products tilt in from alternating sides */
  const prods = $(".products");
  if (!lite && prods) {
    prods.style.perspective = "1200px";
    $$(".product", prods).forEach((p, i) => {
      scroll(animate(p, { rotateY: [i % 2 ? -18 : 18, 0], x: [i % 2 ? 60 : -60, 0] }, { ease: "linear" }), { target: p, offset: ["start end", "start 55%"] });
    });
  }
}

/* Gold cursor ring that follows the pointer and grows over clickable things */
const ring = $(".cursor");
if (ring && finePointer && !reduce) {
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const loop = () => {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    ring.classList.add("on");
    ring.classList.toggle("hover", !!e.target.closest("a, button, .card, .repo, .product"));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener("pointerleave", () => ring.classList.remove("on"));
}
