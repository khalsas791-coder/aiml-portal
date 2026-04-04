// js/extras.js — Testimonials Slider, FAQ, Counters, Gallery Lightbox, Scroll Reveal
(function () {
  'use strict';

  /* ══════════════════════════════════════
     UNIVERSAL SCROLL REVEAL (s2-reveal)
  ══════════════════════════════════════ */
  /* ══════════════════════════════════════
     UNIVERSAL SCROLL REVEAL (s2-reveal)
  ══════════════════════════════════════ */
  window.initS2Reveal = function() {
    const els = document.querySelectorAll('.s2-reveal, .achievement-card, .why-card, .hod-card, .faculty-hover-card');
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
  };

  /* ══════════════════════════════════════
     ACHIEVEMENTS COUNTER ANIMATION
  ══════════════════════════════════════ */
  window.initCounters = function() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.done) {
          e.target.dataset.done = '1';
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
  };

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 2000;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = target * ease;
      el.textContent = prefix + (target % 1 !== 0 ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════
     TESTIMONIALS SLIDER
  ══════════════════════════════════════ */
  window.initTestimonialsSlider = function() {
    const track = document.getElementById('testimonials-track');
    const dotsEl = document.getElementById('slider-dots');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    let current = 0;
    let perView = getPerView();
    const total = cards.length;
    let autoTimer = null;

    function getPerView() {
      if (window.innerWidth < 600) return 1;
      if (window.innerWidth < 960) return 2;
      return 3;
    }

    function buildDots() {
      if (!dotsEl) return;
      const pages = Math.ceil(total / perView);
      dotsEl.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goTo(i);
        dotsEl.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsEl) return;
      dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === Math.floor(current / perView));
      });
    }

    function goTo(page) {
      const pages = Math.ceil(total / perView);
      current = page * perView;
      if (current >= total) current = 0;
      const cardWidth = cards[0].offsetWidth + 24; // gap
      track.style.transform = `translateX(-${current * cardWidth}px)`;
      updateDots();
    }

    function next() {
      const pages = Math.ceil(total / perView);
      const curPage = Math.floor(current / perView);
      goTo((curPage + 1) % pages);
    }
    function prev() {
      const pages = Math.ceil(total / perView);
      const curPage = Math.floor(current / perView);
      goTo((curPage - 1 + pages) % pages);
    }

    if (prevBtn) prevBtn.onclick = () => { resetAuto(); prev(); };
    if (nextBtn) nextBtn.onclick = () => { resetAuto(); next(); };

    function startAuto() { 
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(next, 4500); 
    }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }

    window.addEventListener('resize', () => {
      perView = getPerView();
      buildDots();
      goTo(0);
    });

    buildDots();
    startAuto();
  };

  /* ══════════════════════════════════════
     FAQ ACCORDION
  ══════════════════════════════════════ */
  window.initFAQ = function() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      // Remove old listener if exists
      const newQuestion = question.cloneNode(true);
      question.parentNode.replaceChild(newQuestion, question);
      
      newQuestion.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  };

  /* ══════════════════════════════════════
     GALLERY LIGHTBOX
  ══════════════════════════════════════ */
  window.initGallery = function() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbCaption = document.getElementById('lightbox-caption');
    const lbClose = document.getElementById('lightbox-close');
    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');

    let currentGalleryIdx = 0;
    let visibleItems = [];

    // Filter
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
        updateVisible();
      });
    });

    function updateVisible() {
      visibleItems = [...items].filter(item => item.style.display !== 'none');
    }
    updateVisible();

    // Lightbox open
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-img');
        if (!img) return;
        const imgSrc = img.src;
        const title = item.dataset.title || '';
        currentGalleryIdx = visibleItems.indexOf(item);
        openLightbox(imgSrc, title);
      });
    });

    function openLightbox(src, caption) {
      if (!lightbox) return;
      lbImg.src = src;
      lbCaption.textContent = caption;
      lightbox.style.display = 'flex';
      requestAnimationFrame(() => lightbox.classList.add('visible'));
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('visible');
      setTimeout(() => { lightbox.style.display = 'none'; }, 300);
      document.body.style.overflow = '';
    }

    if (lbClose) lbClose.onclick = closeLightbox;
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    if (lbPrev) lbPrev.onclick = () => {
      currentGalleryIdx = (currentGalleryIdx - 1 + visibleItems.length) % visibleItems.length;
      const item = visibleItems[currentGalleryIdx];
      lbImg.src = item.querySelector('.gallery-img')?.src;
      lbCaption.textContent = item.dataset.title || '';
    };

    if (lbNext) lbNext.onclick = () => {
      currentGalleryIdx = (currentGalleryIdx + 1) % visibleItems.length;
      const item = visibleItems[currentGalleryIdx];
      lbImg.src = item.querySelector('.gallery-img')?.src;
      lbCaption.textContent = item.dataset.title || '';
    };

    document.addEventListener('keydown', (e) => {
      if (!lightbox || lightbox.style.display !== 'flex') return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrev?.click();
      if (e.key === 'ArrowRight') lbNext?.click();
    });
  };

  /* ══════════════════════════════════════
     INIT ON DOM READY
  ══════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    window.initS2Reveal();
    window.initCounters();
    window.initTestimonialsSlider();
    window.initFAQ();
    window.initGallery();
  });

  // Re-run reveal when tab changes (sections become visible)
  window.addEventListener('aiml-tab-changed', () => {
    setTimeout(window.initS2Reveal, 100);
  });

  // Real-time update listeners from content-loader.js
  window.addEventListener('aiml-testimonials-updated', () => {
    window.initTestimonialsSlider();
  });
  window.addEventListener('aiml-faq-updated', () => {
    window.initFAQ();
  });
  window.addEventListener('aiml-gallery-updated', () => {
    window.initGallery();
  });
  window.addEventListener('aiml-faculty-updated', () => {
     window.initS2Reveal();
  });

})();
