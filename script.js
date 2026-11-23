// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Nav border on scroll
const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const closeMenu = () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("#site-nav a").forEach((a) => a.addEventListener("click", closeMenu));
addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

// Email links ([data-compose]) open Gmail compose.
// Each link's href is a Gmail web-compose URL (to= recipient, su= subject):
//   Desktop -> that URL opens in a new tab (default link behaviour).
//   Android -> Gmail app compose; falls back to Gmail web if the app isn't installed.
//   iOS     -> Gmail app compose; falls back to Gmail web if the app isn't installed.
const ua = navigator.userAgent;
const isAndroid = /Android/i.test(ua);
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const enc = encodeURIComponent;

document.querySelectorAll("[data-compose]").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!isAndroid && !isIOS) return;
    e.preventDefault();
    const webUrl = link.href;
    const params = new URL(webUrl).searchParams;
    const to = params.get("to") || "";
    const subject = params.get("su") || "";

    if (isAndroid) {
      location.href =
        `intent:${to}?subject=${enc(subject)}` +
        `#Intent;scheme=mailto;package=com.google.android.gm;` +
        `S.browser_fallback_url=${enc(webUrl)};end`;
    } else {
      const fallback = setTimeout(() => { if (!document.hidden) location.href = webUrl; }, 1500);
      const cancel = () => clearTimeout(fallback);
      document.addEventListener("visibilitychange", cancel, { once: true });
      addEventListener("pagehide", cancel, { once: true });
      location.href = `googlegmail://co?to=${enc(to)}&subject=${enc(subject)}`;
    }
  });
});

// Typing effect
const phrases = [
  "AI-powered products",
  "ML models that ship",
  "full-stack web apps",
  "NLP & vision pipelines",
];
const typed = document.getElementById("typed");
if (!reduceMotion) {
  let p = 0, i = phrases[0].length, deleting = true;
  const tick = () => {
    const word = phrases[p];
    typed.textContent = word.slice(0, i);
    if (deleting) {
      i--;
      if (i < 0) { deleting = false; p = (p + 1) % phrases.length; i = 0; }
    } else {
      i++;
      if (i > phrases[p].length) { deleting = true; setTimeout(tick, 1600); return; }
    }
    setTimeout(tick, deleting ? 40 : 80);
  };
  setTimeout(tick, 2200);
}

// Reveal sections on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Neural-network style background
const canvas = document.getElementById("net");
const ctx = canvas.getContext("2d");
let nodes = [];
let mouse = { x: -9999, y: -9999 };

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const maxD = 130;
  for (const n of nodes) {
    if (!reduceMotion) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > innerWidth) n.vx *= -1;
      if (n.y < 0 || n.y > innerHeight) n.vy *= -1;
    }
  }
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      const d = Math.hypot(dx, dy);
      if (d < maxD) {
        ctx.strokeStyle = `rgba(139,156,255,${0.18 * (1 - d / maxD)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < 140;
    ctx.fillStyle = near ? "rgba(124,242,196,.95)" : "rgba(124,242,196,.45)";
    ctx.beginPath(); ctx.arc(n.x, n.y, near ? 2.6 : 1.6, 0, Math.PI * 2); ctx.fill();
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}

addEventListener("resize", () => { resize(); if (reduceMotion) draw(); });
addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
resize();
draw();

/* ================= PROJECT DETAILS MODAL =================
   To add screenshots: drop images into images/<project>/ and list them under "shots".
   Use mobile: true for phone-sized screenshots so they display at phone proportions.
   After replacing or editing a screenshot, bump SHOTS_VERSION so browsers load the new file. */
const SHOTS_VERSION = 2;
const shotUrl = (src) => `${src}?v=${SHOTS_VERSION}`;
const GITHUB = "https://github.com/09lakshya";
const PROJECTS = {
  invexo: {
    tag: "FinTech ML · Live",
    title: "Invexo",
    desc: [
      "A real-time AI stock analytics dashboard for Indian markets (NSE/BSE). Invexo combines live market streaming, quantitative technical indicators, financial news-sentiment analysis and machine-learning price predictions in one responsive interface.",
      "Predictions adapt to the market regime: in trending markets (high ADX) the model leans on momentum factors, while range-bound markets favour mean-reverting signals. A consensus score across seven indicators calibrates realistic confidence levels.",
    ],
    features: [
      "Live price streaming over a FastAPI WebSocket gateway",
      "Custom candlestick engine plus line-chart toggle with an OHLC hover HUD",
      "XGBoost price prediction with regime-aware weighting",
      "FinBERT and lexicon-based, recency-weighted news sentiment",
      "Consensus confidence across EMA, MACD, RSI, Stochastics, Bollinger Bands, sentiment and fundamentals",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Chart.js", "Python", "FastAPI", "WebSockets", "XGBoost", "FinBERT", "Pandas"],
    links: [{ label: "Visit live site", href: "https://invexo.co.in/", primary: true }, { label: "GitHub", href: GITHUB }],
    shots: [
      { src: "images/invexo/invexo1.png", caption: "Sign-in page, desktop" },
      { src: "images/invexo/invexo2.png", caption: "Dashboard", mobile: true },
      { src: "images/invexo/invexo3.png", caption: "AI Assistant", mobile: true },
      { src: "images/invexo/invexo4.png", caption: "Reliance Stock card", mobile: true },
    ],
  },
  stylesync: {
    tag: "Computer Vision",
    title: "StyleSync — Smart Digital Wardrobe",
    desc: [
      "An AI-assisted digital wardrobe. Users photograph their clothes to digitise their closet, get personalised outfit recommendations, track wardrobe analytics and avoid duplicate purchases.",
      "Every item is embedded with OpenAI's CLIP model (512-dimension vectors). When you're shopping, StyleSync compares the new item against your wardrobe using cosine similarity and warns you if you already own something similar.",
    ],
    features: [
      "Category-based wardrobe inventory with Cloudinary image hosting",
      "Duplicate-purchase check using CLIP visual-similarity search",
      "Outfit pairing by colour harmony, season and occasion",
      "OpenCV preprocessing (CLAHE) and K-Means dominant-colour extraction",
      "JWT + bcrypt authentication on a layered FastAPI modular monolith",
    ],
    tech: ["React 19", "Vite", "TypeScript", "Tailwind CSS", "TanStack Query", "FastAPI", "SQLAlchemy", "PyTorch", "CLIP", "OpenCV"],
    links: [{ label: "GitHub", href: GITHUB, primary: true }],
    shots: [
      { src: "images/stylesync/stylesync1.png", caption: "Sign-in page" },
      { src: "images/stylesync/stylesync2.png", caption: "Account creation with style profile" },
    ],
  },
  sip: {
    tag: "Finance tool · In the works",
    title: "SIP / SWP Calculator",
    desc: [
      "A web calculator for mutual-fund planning. It estimates how a Systematic Investment Plan (SIP) grows over time, and how long a corpus lasts under a Systematic Withdrawal Plan (SWP).",
    ],
    features: [
      "SIP mode: monthly contribution, expected return and duration give you the future value",
      "SWP mode: corpus, withdrawal amount and return show you the remaining balance over time",
      "Instant recalculation as inputs change",
    ],
    tech: ["React", "JavaScript", "CSS"],
    links: [{ label: "GitHub", href: GITHUB, primary: true }],
    shots: [],
    comingSoon: "Currently in the final build phase. A live preview is launching soon.",
  },
  fitindia: {
    tag: "Web",
    title: "FIT INDIA",
    desc: [
      "A front-end web project for a fitness-membership campaign, built from scratch with plain HTML, CSS and JavaScript. It features a full-bleed imagery layout with a membership sign-up card and UPI QR payment.",
    ],
    features: [
      "Membership form with name and phone-number fields",
      "UPI QR-code payment section",
      "Full-bleed background imagery with a centred sign-up card",
    ],
    tech: ["HTML", "CSS", "JavaScript"],
    links: [{ label: "GitHub", href: GITHUB, primary: true }],
    shots: [
      { src: "images/fitindia/1.png", caption: "Membership page, desktop" },
      // { src: "images/fitindia/2.png", caption: "Membership page, mobile", mobile: true },
    ],
  },
};

const modal = document.getElementById("project-modal");
const $ = (id) => document.getElementById(id);
const stage = modal.querySelector(".gallery-stage");
const img = $("pm-img");
const empty = modal.querySelector(".gallery-empty");
const viewer = $("pm-viewer");
const viewerImg = $("pm-viewer-img");
let shots = [], idx = 0, lastFocus = null;

function showShot(i) {
  if (!shots.length) return;
  idx = (i + shots.length) % shots.length;
  const s = shots[idx];
  img.src = shotUrl(s.src);
  img.alt = s.caption;
  stage.classList.toggle("mobile-shot", !!s.mobile);
  $("pm-caption").textContent = `${s.caption}  ·  ${idx + 1} / ${shots.length}`;
  viewerImg.src = shotUrl(s.src);
  viewerImg.alt = s.caption;
  $("pm-viewer-caption").textContent = $("pm-caption").textContent;
  $("pm-thumbs").querySelectorAll("button").forEach((b, j) => b.classList.toggle("active", j === idx));
}

function openProject(key) {
  const p = PROJECTS[key];
  if (!p) return;
  lastFocus = document.activeElement;
  $("pm-tag").textContent = p.tag;
  $("pm-title").textContent = p.title;
  $("pm-desc").innerHTML = p.desc.map((d) => `<p>${d}</p>`).join("");
  $("pm-features").innerHTML = p.features.map((f) => `<li>${f}</li>`).join("");
  $("pm-tech").innerHTML = p.tech.map((t) => `<li>${t}</li>`).join("");
  $("pm-links").innerHTML = p.links
    .map((l) => `<a class="btn${l.primary ? " primary" : ""}" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`)
    .join("");

  shots = p.shots;
  const has = shots.length > 0;
  img.hidden = !has;
  empty.hidden = has;
  empty.textContent = p.comingSoon || "Screenshots coming soon";
  modal.querySelectorAll(".g-nav").forEach((b) => (b.hidden = shots.length < 2));
  closeViewer();
  $("pm-caption").textContent = "";
  $("pm-thumbs").innerHTML = shots
    .map((s, j) => `<button aria-label="Screenshot ${j + 1}: ${s.caption}"><img src="${shotUrl(s.src)}" alt="" loading="lazy" /></button>`)
    .join("");
  $("pm-thumbs").querySelectorAll("button").forEach((b, j) => b.addEventListener("click", () => showShot(j)));
  stage.classList.remove("mobile-shot");
  showShot(0);

  modal.showModal();
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-inner").scrollTop = 0;
}

modal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (lastFocus) lastFocus.focus();
});
modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); }); // backdrop click
modal.querySelectorAll(".g-nav.prev").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); showShot(idx - 1); }));
modal.querySelectorAll(".g-nav.next").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); showShot(idx + 1); }));
modal.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") showShot(idx - 1);
  if (e.key === "ArrowRight") showShot(idx + 1);
  // Esc closes the full-screen view first, not the whole popup
  if (e.key === "Escape" && !viewer.hidden) { e.preventDefault(); closeViewer(); }
});

// Click the screenshot to view it full-screen on the same page
function openViewer() {
  if (!shots.length) return;
  viewer.hidden = false;
  viewer.querySelector(".viewer-close").focus();
}
function closeViewer() {
  if (viewer.hidden) return;
  viewer.hidden = true;
  img.focus({ preventScroll: true });
}
img.addEventListener("click", openViewer);
viewer.querySelector(".viewer-close").addEventListener("click", closeViewer); // only the ✕ (or Esc) closes it

// Swipe between screenshots on touch screens
[stage, viewer].forEach((el) => {
  let touchX = null;
  el.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) showShot(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
});


// Whole card is clickable (mouse, tap, Enter or Space)
document.querySelectorAll(".card[data-project]").forEach((card) => {
  card.addEventListener("click", () => openProject(card.dataset.project));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(card.dataset.project); }
  });
});
