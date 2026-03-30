/* ============================================================
   APP.JS — Navigation, Loading, Misc Init
   ============================================================ */

// ── Loading screen ────────────────────────────────────────
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  const bar = document.getElementById('loader-bar');
  if (!screen) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 25 + 10;
    if (bar) bar.style.width = Math.min(progress, 95) + '%';
    if (progress >= 95) {
      clearInterval(interval);
      if (bar) bar.style.width = '100%';
      setTimeout(() => screen.classList.add('hidden'), 300);
    }
  }, 200);

  window.addEventListener('load', () => {
    clearInterval(interval);
    if (bar) bar.style.width = '100%';
    setTimeout(() => screen.classList.add('hidden'), 400);
  });
}

// ── Navbar ────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Nav link smooth scroll
  document.querySelectorAll('[data-scroll-to]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.scrollTo);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile menu
        mobileMenu?.classList.remove('open');
        hamburger?.classList.remove('open');
      }
    });
  });
}

// ── Hero typewriter ───────────────────────────────────────
function initTypewriter() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;
  const words = ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning'];
  let wordIndex = 0, charIndex = 0, deleting = false;

  function type() {
    const word = words[wordIndex];
    if (!deleting) {
      el.textContent = word.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = word.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  setTimeout(type, 800);
}

// ── Contact form ──────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✅ Sent!';
      form.reset();
      window.showToast && showToast('Message sent! We\'ll get back to you soon. 🚀', 'success');
      setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 2000);
    }, 1500);
  });
}

// ── Scroll progress bar ───────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / total) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Resource filter ───────────────────────────────────────
function initResourceFilter() {
  const btns  = document.querySelectorAll('.resource-filter-btn');
  const cards = document.querySelectorAll('.resource-card[data-category]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

// ── Smooth reveal for hero stats (numbers) ─────────────────
function initHeroCounters() {
  const stats = document.querySelectorAll('.hero-stat-number[data-target]');
  stats.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let started = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          let count = 0;
          const step = target / 60;
          const isDecimal = target % 1 !== 0;
          const interval = setInterval(() => {
            count += step;
            if (count >= target) { count = target; clearInterval(interval); }
            el.textContent = (isDecimal ? count.toFixed(1) : Math.floor(count)) + suffix;
          }, 30);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

// ── API Key shortcut ──────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+/ or Cmd+/ opens chatbot
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const panel = document.getElementById('chatbot-panel');
      const fab   = document.getElementById('chatbot-fab');
      if (panel) panel.classList.toggle('open');
      if (panel?.classList.contains('open') && document.getElementById('chatbot-messages')?.children.length === 0) {
        fab?.click();
      }
    }
  });
}

// ── Main init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNavbar();
  initTypewriter();
  initContactForm();
  initScrollProgress();
  initResourceFilter();
  initHeroCounters();
  initKeyboardShortcuts();
});
