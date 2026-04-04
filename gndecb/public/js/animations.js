/* ============================================================
   ANIMATIONS — IntersectionObserver reveal + counters + tabs
   ============================================================ */

// ── Reveal on scroll ──────────────────────────────────────
function initRevealAnimations() {
  const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// ── Staggered child reveals ────────────────────────────────
function initStaggeredReveal() {
  const groups = document.querySelectorAll('[data-stagger]');
  groups.forEach(group => {
    const children = group.children;
    Array.from(children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });
}

// ── Animated counter ──────────────────────────────────────
function animateCounter(el, target, duration = 2000, suffix = '') {
  let start = 0;
  const startTime = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = start + (target - start) * ease;
    el.textContent = (isDecimal ? current.toFixed(2) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target  = parseFloat(entry.target.dataset.count);
        const suffix  = entry.target.dataset.suffix || '';
        const duration = parseInt(entry.target.dataset.duration) || 2000;
        animateCounter(entry.target, target, duration, suffix);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── Tabs ──────────────────────────────────────────────────
function initTabs() {
  const tabGroups = document.querySelectorAll('[data-tabs]');
  tabGroups.forEach(group => {
    const buttons = group.querySelectorAll('.tab-btn');
    const panels  = group.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p  => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = group.querySelector(`[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { info: '💡', success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideInUp 0.4s ease reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
window.showToast = showToast;

// ── Scroll-spy nav ────────────────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

// ── Section Level Smooth Transitions ──────────────────────
function initSectionAnimations() {
  const sections = document.querySelectorAll('section:not(#hero)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  sections.forEach(sec => observer.observe(sec));
}

// ── Init all ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSectionAnimations();
  initStaggeredReveal();
  initRevealAnimations();
  initCounters();
  initTabs();
  initScrollSpy();
});
