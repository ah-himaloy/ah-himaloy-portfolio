/* ======================================================
   Alvi – site scripts (single, clean file)
   - Theme toggle (persists)
   - Active nav highlight
   - Name typing effect
   - Constellation background
   - Modal helpers
   - Mobile drawer (hamburger / 3-dots)
   - AlviBot (UI + /api/chat backend)
====================================================== */

"use strict";

/* -----------------------------
   Theme (dark by default)
----------------------------- */
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
  paintToggle(theme);
}

function paintToggle(theme) {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.innerHTML =
    theme === "dark"
      ? `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M23 12h-2M3 12H1m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m12.9 0-1.41 1.41M6.46 17.54 5.05 18.95"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#themeToggle")) {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyTheme(next);
  }
});

/* -----------------------------
   Mark active nav link
----------------------------- */
const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
document.querySelectorAll(".nav .btn").forEach((a) => {
  const href = (a.getAttribute("href") || "").toLowerCase();
  if ((path === "" && href === "index.html") || path === href) a.classList.add("active");
});

/* -----------------------------
   Typing effect for the name
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("typedName");
  if (!target) return;

  const full = "Alvi Hossain Himaloy";
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    target.textContent = full;
    return;
  }

  let i = 0;
  (function type() {
    target.textContent = full.slice(0, i);
    i++;
    if (i <= full.length) {
      const delay = i < 6 ? 160 : i < 14 ? 90 : 80;
      setTimeout(type, delay);
    }
  })();
});

/* --------------------------------------------
   Constellation particles background (canvas)
-------------------------------------------- */
(() => {
  const c = document.getElementById("bg-particles");
  if (!c) return;

  const ctx = c.getContext("2d");
  let points = [];
  let running = true;
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px";
    c.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.floor(innerWidth / 22));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }));
  }

  function drawFrame() {
    if (!running || prefersReduced) return;

    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const isDark = document.documentElement.classList.contains("dark");
    const dotColor = isDark ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.6)";
    const lineColor = isDark ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.18)";

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i],
          b = points[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.globalAlpha = 1 - dist / 120;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(drawFrame);
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) drawFrame();
  });
  window.addEventListener("resize", resize);

  resize();
  drawFrame();
})();

/* -----------------------------
   Modal helpers
----------------------------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  m.querySelector(".modal-close")?.focus();
}
function closeModal(el) {
  el.setAttribute("hidden", "");
  document.body.style.overflow = "";
}

// close on overlay click / close button / Esc
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) closeModal(overlay);
  });
  overlay.querySelector(".modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hasAttribute("hidden")) closeModal(overlay);
  });
});

// make whole project card open its modal (but not when clicking links/buttons)
document.addEventListener("click", (e) => {
  const card = e.target.closest(".project-card[data-modal]");
  if (!card) return;
  if (e.target.closest("a,button")) return; // let buttons/links work normally
  openModal(card.dataset.modal);
});
document.querySelectorAll(".project-card[data-modal]").forEach((card) => {
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(card.dataset.modal);
    }
  });
});
document.querySelectorAll("[data-modal]").forEach((card) => {
  const id = card.getAttribute("data-modal");
  const ov = document.getElementById(id);
  if (!ov) return;
  card.addEventListener("click", () => ov.removeAttribute("hidden"));
});

/* -----------------------------
   Mobile drawer (hamburger)
----------------------------- */
(() => {
  const menuBtn = document.getElementById("menuBtn");
  const drawer = document.getElementById("mobileMenu");
  if (!menuBtn || !drawer) return;

  function openDrawer() {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("open")); // animate
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(() => (drawer.hidden = true), 200);
  }

  menuBtn.addEventListener("click", () => (drawer.hidden ? openDrawer() : closeDrawer()));
  drawer.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close") || e.target.closest("[data-close]")) closeDrawer();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.hidden) closeDrawer();
  });
})();

/* =============== AlviBot — via FastAPI (/ask) =============== */
(() => {
  const win   = document.querySelector(".chat-window");
  const log   = document.getElementById("chatLog");
  const form  = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const toggle= document.getElementById("chatToggle");
  const close = document.getElementById("chatClose");
  if (!win || !log || !form || !input || !toggle) return;
  
  
 

  // POINT THIS TO YOUR API (change after you deploy)
 const API = "https://ah-himaloy-portfolio.onrender.com/ask";

  function add(role, html){
    const d = document.createElement("div");
    d.className = `chat-msg ${role}`;
    d.innerHTML = `<div class="bubble">${(html||"").toString().replace(/\n/g,"<br>")}</div>`;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function greetOnce(){
    if (log.dataset.greeted) return;
    add("bot", `Hi! I’m <b>Alvibot </b>. A virtual version of Alvi Ask me anything, related myself `);
    log.dataset.greeted = "1";
  }
  function openChat(){ win.hidden=false; requestAnimationFrame(()=>win.classList.add("open")); greetOnce(); }
  function closeChat(){ win.classList.remove("open"); setTimeout(()=>win.hidden=true,180); }

  document.addEventListener("click",(e)=>{
    if (e.target.closest("#chatToggle")) return (win.hidden || !win.classList.contains("open")) ? openChat() : closeChat();
    if (e.target.closest("#chatClose")) return closeChat();
  });
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && !win.hidden) closeChat(); });

  async function askLLM(question){
    const res = await fetch(API, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.answer || "No answer.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = (input.value || "").trim();
    if (!q) return;

    add("user", q);
    input.value = "";
    const typing = add("bot", "…");

    try {
      const answer = await askLLM(q);
      typing.querySelector(".bubble").innerHTML = answer.replace(/\n/g,"<br>");
    } catch (err) {
      typing.querySelector(".bubble").textContent =
        "Couldn’t reach the bot API. Make sure the Python server is running on http://127.0.0.1:8000 and try again.";
      console.error(err);
    }
  });

  // minimal bubble/chip styles if not present
  const style = document.createElement("style");
  style.textContent = `
    .chat-msg{margin:8px 0;display:flex}.chat-msg.user{justify-content:flex-end}
    .chat-msg .bubble{max-width:85%;padding:.6rem .8rem;border-radius:14px}
    .chat-msg.user .bubble{background:var(--accent,#3b82f6);color:#fff}
    .chat-msg.bot  .bubble{background:var(--card);border:1px solid var(--border)}
  `;
  document.head.appendChild(style);
})();





