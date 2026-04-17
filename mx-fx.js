/**
 * mx-fx.js — Metamorphex shared interactive enhancements
 * Drop one <script src="mx-fx.js"> (or "../mx-fx.js") into any page.
 * Auto-detects what's on the page and applies the right effects.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     0. INJECT SHARED CSS
  ───────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* Reveal: both .active (industry/service pages) and .visible (about) */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity .65s ease-out, transform .65s ease-out;
    }
    .reveal.active, .reveal.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }

    /* Stagger slide-in for list items */
    .mx-stagger-item {
      opacity: 0;
      transform: translateX(-14px);
      transition: opacity .45s ease-out, transform .45s ease-out;
    }
    .mx-stagger-item.mx-in {
      opacity: 1;
      transform: translateX(0);
    }

    /* Card hover lift + glow */
    .mx-card {
      transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease !important;
      will-change: transform;
    }
    .mx-card:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 14px 44px rgba(0,0,0,.55), 0 0 0 1px rgba(62,201,232,.18) !important;
      border-color: rgba(62,201,232,.28) !important;
    }

    /* Particle canvas inside hero */
    .mx-particle-canvas {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    /* Ensure hero content sits above canvas */
    .hero > *:not(.mx-particle-canvas):not(.hero-glow) {
      position: relative;
      z-index: 1;
    }

    /* Scroll hint */
    .mx-scroll-hint {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .45rem;
      z-index: 2;
      opacity: 0;
      animation: mxFadeUp .6s 2s ease forwards;
      pointer-events: none;
    }
    .mx-scroll-hint span {
      font-size: .58rem;
      font-weight: 600;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: rgba(255,255,255,.28);
    }
    .mx-scroll-mouse {
      width: 20px; height: 32px;
      border: 1.5px solid rgba(255,255,255,.18);
      border-radius: 10px;
      display: flex;
      justify-content: center;
      padding-top: 5px;
    }
    .mx-scroll-dot {
      width: 3px; height: 5px;
      background: #3EC9E8;
      border-radius: 2px;
      animation: mxScrollDot 1.8s ease infinite;
    }
    @keyframes mxScrollDot {
      0%   { transform: translateY(0);  opacity: 1; }
      100% { transform: translateY(10px); opacity: 0; }
    }
    @keyframes mxFadeUp {
      to { opacity: 1; }
    }

    /* Count-up flash on complete */
    .mx-counted {
      animation: mxFlash .35s ease;
    }
    @keyframes mxFlash {
      0%   { color: #3EC9E8; }
      100% { color: inherit; }
    }

    /* Line scan on section dividers */
    .mx-scan-line {
      position: relative;
      overflow: hidden;
    }
    .mx-scan-line::after {
      content: '';
      position: absolute;
      top: 0; left: -50%;
      width: 35%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(62,201,232,.5), transparent);
      animation: mxLineScan 5s ease-in-out infinite;
    }
    @keyframes mxLineScan {
      0%   { left: -50%; }
      100% { left: 140%; }
    }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
     1. PARTICLE CANVAS — injected into .hero
  ───────────────────────────────────────────── */
  function initParticles() {
    // Skip if already has a canvas (about.html has its own)
    if (document.getElementById('particle-canvas')) return;

    const hero = document.querySelector('section.hero, .hero');
    if (!hero) return;

    // Make sure hero is positioned
    const heroStyle = getComputedStyle(hero);
    if (heroStyle.position === 'static') hero.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.className = 'mx-particle-canvas';
    canvas.id = 'particle-canvas';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, particles;
    let mouse = { x: -999, y: -999 };

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function initP() {
      const count = Math.max(30, Math.floor((W * H) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .32,
        vy: (Math.random() - .5) * .32,
        r: Math.random() * 1.6 + .5,
        a: Math.random() * .45 + .15
      }));
    }

    window.addEventListener('resize', () => { resize(); initP(); });

    // Track mouse relative to canvas
    hero.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const CONN = 120, MCONN = 150;

      particles.forEach((p, i) => {
        // Mouse repulsion
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          const f = (80 - d) / 80 * .7;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= .98; p.vy *= .98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(62,201,232,${p.a})`;
        ctx.fill();

        // Node-to-node lines
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ex = p.x - q.x, ey = p.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < CONN) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(62,201,232,${.15 * (1 - ed / CONN)})`;
            ctx.lineWidth = .55;
            ctx.stroke();
          }
        }

        // Mouse-to-node lines
        const md = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
        if (md < MCONN) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(62,201,232,${.3 * (1 - md / MCONN)})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      });

      requestAnimationFrame(draw);
    }

    resize(); initP(); draw();
  }

  /* ─────────────────────────────────────────────
     2. SCROLL HINT — added to hero if tall enough
  ───────────────────────────────────────────── */
  function initScrollHint() {
    const hero = document.querySelector('section.hero, .hero');
    if (!hero || hero.offsetHeight < 400) return;
    if (hero.querySelector('.scroll-hint, .mx-scroll-hint')) return;

    const hint = document.createElement('div');
    hint.className = 'mx-scroll-hint';
    hint.innerHTML = `
      <div class="mx-scroll-mouse"><div class="mx-scroll-dot"></div></div>
      <span>Scroll</span>
    `;
    hero.appendChild(hint);
  }

  /* ─────────────────────────────────────────────
     3. COUNT-UP — for [data-countup] or [data-target]
  ───────────────────────────────────────────── */
  function countUp(el) {
    const raw    = el.dataset.countup || el.dataset.target || el.textContent;
    const target = parseInt(raw);
    if (isNaN(target)) return;
    const suffix  = el.dataset.suffix  || (el.textContent.includes('%') ? '%' : (el.textContent.includes('+') ? '+' : ''));
    const prefix  = el.dataset.prefix  || '';
    const dur     = 1600;
    const start   = performance.now();

    function step(now) {
      const t    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.floor(ease * target) + suffix;
      if (t < 1) { requestAnimationFrame(step); }
      else {
        el.textContent = prefix + target + suffix;
        el.classList.add('mx-counted');
      }
    }
    requestAnimationFrame(step);
  }

  function initCountUp() {
    // Explicit data-countup attrs
    const explicit = document.querySelectorAll('[data-countup]');
    // Stat numbers on index page (class stat-number) and industry panels (class panel-stat-num)
    // — only auto-detect if the content looks like a plain number (e.g. "30+", "98%", "50+")
    const auto = document.querySelectorAll('.stat-number, .proof-num');

    const allEls = [...explicit, ...auto];
    if (!allEls.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          countUp(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .5 });

    allEls.forEach(el => {
      // Skip if non-numeric content
      const txt = el.dataset.countup || el.textContent;
      if (!/\d/.test(txt)) return;
      obs.observe(el);
    });
  }

  /* ─────────────────────────────────────────────
     4. SCROLL REVEAL — enhances existing .reveal
  ───────────────────────────────────────────── */
  function initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Support both .active (old pages) and .visible (about page)
          e.target.classList.add('active');
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: .08 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────────
     5. STAGGER — children of grids animate in sequence
  ───────────────────────────────────────────── */
  function initStagger() {
    const grids = document.querySelectorAll(
      '.services-grid, .help-grid, .standards-grid, .related-grid, .expertise-grid, .team-grid, .proof-grid, .adv-grid, .values-grid, .trust-grid'
    );

    grids.forEach(grid => {
      const items = Array.from(grid.children);
      items.forEach(item => item.classList.add('mx-stagger-item'));

      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const children = Array.from(e.target.children);
            children.forEach((child, i) => {
              setTimeout(() => child.classList.add('mx-in'), i * 90);
            });
            obs.unobserve(e.target);
          }
        });
      }, { threshold: .08 });

      obs.observe(grid);
    });
  }

  /* ─────────────────────────────────────────────
     6. CARD HOVER LIFT — auto-apply to known card selectors
  ───────────────────────────────────────────── */
  function initCardHover() {
    const selectors = [
      '.service-card', '.expertise-card', '.related-card',
      '.help-card', '.case-card', '.std-card', '.team-card',
      '.trust-card', '.adv-card', '.value-card', '.stat-box'
    ].join(', ');

    document.querySelectorAll(selectors).forEach(el => el.classList.add('mx-card'));
  }

  /* ─────────────────────────────────────────────
     7. SCAN LINE — add subtle scan to border-top dividers
  ───────────────────────────────────────────── */
  function initScanLines() {
    // Add scan line to the top border of key section dividers
    document.querySelectorAll('.stats, .stats-strip, .cta-section, .quote-break').forEach(el => {
      el.classList.add('mx-scan-line');
    });
  }

  /* ─────────────────────────────────────────────
     8. HERO WORD FADE-IN — stagger hero headline words
  ───────────────────────────────────────────── */
  function initHeroWords() {
    // Only run on pages that don't already have .word spans (about.html handles its own)
    const h1 = document.querySelector('.hero h1, .hero-headline');
    if (!h1 || h1.querySelector('.word')) return;

    // Don't run if hero has inline animation delays already
    const words = h1.innerHTML;
    if (words.includes('animation-delay')) return;

    // Wrap text nodes in spans for fade-in, preserving HTML tags like <span class="accent">
    // We'll do a simpler approach: just fade the whole h1 in with a subtle upward motion
    h1.style.opacity = '0';
    h1.style.transform = 'translateY(18px)';
    h1.style.transition = 'opacity .8s .3s ease, transform .8s .3s ease';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        h1.style.opacity = '1';
        h1.style.transform = 'translateY(0)';
      });
    });
  }

  /* ─────────────────────────────────────────────
     INIT — run after DOM ready
  ───────────────────────────────────────────── */
  function init() {
    initParticles();
    initScrollHint();
    initCountUp();
    initReveal();
    initStagger();
    initCardHover();
    initScanLines();
    initHeroWords();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
