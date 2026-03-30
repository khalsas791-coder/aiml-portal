/* ============================================================
   CINEMATIC.JS — GNDECB parallax + scroll animations
   ============================================================ */

(function() {
  /* ── Cinematic Parallax Logo Zoom ── */
  function initCinematicHero() {
    const hero    = document.getElementById('gndecb-hero');
    const logoEl  = document.getElementById('gndecb-logo-el');
    const titleWrap = document.getElementById('gndecb-title-wrap');
    const scrollHint = document.getElementById('gndecb-scroll-hint');
    const bgPara  = document.getElementById('gndecb-bg-para');
    if (!hero || !logoEl) return;

    function onScroll() {
      const scrollY = window.scrollY;
      const heroH   = hero.offsetHeight;
      const prog    = Math.min(scrollY / (heroH * 0.55), 1); // 0..1 over first 55% height
      const prog2   = Math.max(0, Math.min((scrollY - heroH * 0.25) / (heroH * 0.3), 1));

      // Logo: scale, rotate, translateY, and glow
      const scale = 1.5 - prog * 0.5;
      const rotateX = prog * 45; // 3D flip backwards
      const translateY = -prog * 80;
      const glow  = prog * 60;
      const blur = prog * 4;
      
      logoEl.style.transform = `perspective(800px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`;
      logoEl.style.boxShadow = `0 15px ${glow}px rgba(212,175,55,${prog * 0.5})`;
      logoEl.style.filter = `blur(${blur}px)`;
      logoEl.style.opacity = 1 - (prog * 1.2); // fade out as it flips

      // Title: fade in from prog2 0→1
      if (titleWrap) {
        titleWrap.style.opacity = prog2;
        titleWrap.style.transform = `translateY(${(1 - prog2) * 30}px)`;
      }

      // Scroll hint: fade out
      if (scrollHint) scrollHint.style.opacity = 1 - prog * 2;

      // Background parallax
      if (bgPara) bgPara.style.transform = `translateY(${scrollY * 0.15}px)`;

      // GNDECB Navbar: show when past hero, hide when in AIML area
      const gNav = document.getElementById('gndecb-navbar');
      const aimlTop = document.getElementById('aiml-dept-wrapper');
      if (gNav && aimlTop) {
        const aimlOffset = aimlTop.getBoundingClientRect().top;
        if (scrollY > window.innerHeight * 0.75 && aimlOffset > 0) {
          gNav.classList.add('visible');
          gNav.classList.remove('hidden-nav');
        } else {
          gNav.classList.remove('visible');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Cinematic IntersectionObserver Reveal ── */
  function initCinReveal() {
    const els = document.querySelectorAll('.cin-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ── Cinematic Particle Canvas ── */
  function initCinParticles() {
    const canvas = document.getElementById('gndecb-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let W, H;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        a: Math.random() * 0.5 + 0.1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Custom Loading Screen ── */
  function initLoadingScreen() {
    const ls   = document.getElementById('cin-loading-screen');
    const bar  = document.getElementById('cin-loader-bar');
    if (!ls) return;
    let w = 0;
    const iv = setInterval(() => {
      w += Math.random() * 18 + 5;
      if (w >= 100) { w = 100; clearInterval(iv); }
      if (bar) bar.style.width = w + '%';
    }, 80);
    setTimeout(() => { ls.classList.add('hidden'); }, 1600);
  }

  /* ── GNDECB Stats counter ── */
  function initGndecbStats() {
    const els = document.querySelectorAll('.gndecb-count');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.done) {
          e.target.dataset.done = '1';
          const target = parseFloat(e.target.dataset.target);
          const suffix = e.target.dataset.suffix || '';
          let start = 0;
          const t0 = performance.now();
          const dur = 1600;
          function tick(now) {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = start + (target - start) * ease;
            e.target.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.floor(val)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ── Scroll Letters Animation (GNDECB) ── */
  function initScrollLetters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    
    const section = document.getElementById('gndecb-scroll-letters');
    const boxes = document.querySelectorAll('.cin-letter-box');
    if (!section || boxes.length === 0) return;
    
    // We set initial GSAP state here to ensure perfect cross-browser scrubbing
    gsap.set(boxes, { opacity: 0, scale: 0.5, y: 50, filter: "blur(10px)" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=4000", // Smooth long scroll
        pin: true,
        scrub: 1
      }
    });

    boxes.forEach((box) => {
      tl.to(box, {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out"
      });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initCinematicHero();
    initScrollLetters();
    initCinReveal();
    initCinParticles();
    initGndecbStats();
  });
})();
