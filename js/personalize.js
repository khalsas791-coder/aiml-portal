// js/personalize.js — User Personalization + Analytics Tracker
// Runs on index.html — tracks visits, section views, shows welcome bar

(function() {
  'use strict';

  /* ══════════════════════════════════════════════
     ANALYTICS TRACKER
  ══════════════════════════════════════════════ */
  function trackVisit() {
    // Total visits
    const total = parseInt(localStorage.getItem('aiml_total_visits') || '0') + 1;
    localStorage.setItem('aiml_total_visits', total);

    // Daily visits
    const today = new Date().toDateString();
    let daily = {};
    try { daily = JSON.parse(localStorage.getItem('aiml_daily_visits') || '{}'); } catch {}
    daily[today] = (daily[today] || 0) + 1;
    localStorage.setItem('aiml_daily_visits', JSON.stringify(daily));
  }

  function trackSectionView(sectionId) {
    let views = {};
    try { views = JSON.parse(localStorage.getItem('aiml_section_views') || '{}'); } catch {}
    views[sectionId] = (views[sectionId] || 0) + 1;
    localStorage.setItem('aiml_section_views', JSON.stringify(views));
  }

  // Track on load
  trackVisit();

  // Track section tab clicks
  function hookSectionTabs() {
    document.querySelectorAll('.section-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        if (targetId) trackSectionView(targetId);
      });
    });
  }

  /* ══════════════════════════════════════════════
     PREMIUM LOADING SCREEN INIT
  ══════════════════════════════════════════════ */
  function initPremiumLoader() {
    const ls  = document.getElementById('premium-loading-screen');
    const bar = document.getElementById('pls-bar');
    if (!ls || !bar) return;

    let w = 0;
    const iv = setInterval(() => {
      w += Math.random() * 22 + 5;
      if (w >= 100) { w = 100; clearInterval(iv); }
      bar.style.width = w + '%';
    }, 70);

    // Hide after all assets load
    const hide = () => {
      clearInterval(iv);
      bar.style.width = '100%';
      setTimeout(() => { ls.classList.add('hidden'); }, 500);
    };

    if (document.readyState === 'complete') {
      setTimeout(hide, 900);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 600));
      setTimeout(hide, 2500); // Max timeout
    }
  }

  /* ══════════════════════════════════════════════
     PERSONALIZATION — WELCOME BAR
  ══════════════════════════════════════════════ */
  function initPersonalization() {
    // Listen for user login event from auth module
    window.addEventListener('aiml-user-login', (e) => {
      const { name, email, photoUrl } = e.detail;
      showWelcomeBar(name, email, photoUrl);
      loadUserDashboard(name, email, photoUrl);
      saveUserPreference('last_login', new Date().toISOString());
      saveUserPreference('user_name', name);
      saveUserPreference('user_email', email);
    });

    window.addEventListener('aiml-user-logout', () => {
      hideWelcomeBar();
      closeUserDashboard();
    });

    // Restore from localStorage if previously logged in (offline mode)
    const savedName = loadUserPreference('user_name');
    const savedEmail = loadUserPreference('user_email');
    if (savedName && window.location.search.includes('demo=1')) {
      showWelcomeBar(savedName, savedEmail, null);
    }
  }

  function showWelcomeBar(name, email, photoUrl) {
    const bar = document.getElementById('user-welcome-bar');
    const chip = document.getElementById('user-chip-tabbar');
    if (!bar || !chip) return;

    // Extract first name
    const firstName = (name || email || 'Student').split(' ')[0];

    // Update welcome bar
    bar.querySelector('.welcome-name').textContent = firstName;
    const avatar = bar.querySelector('.welcome-avatar');
    if (photoUrl && avatar) {
      avatar.src = photoUrl;
      avatar.onerror = () => { avatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundColor=3b82f6`; };
    } else if (avatar) {
      avatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundColor=3b82f6&textColor=fff`;
    }

    bar.classList.add('show');

    // Update chip in tab bar
    const chipAvatar = document.getElementById('user-chip-avatar');
    const chipName = document.getElementById('user-chip-name');
    if (chipAvatar) chipAvatar.src = photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundColor=3b82f6`;
    if (chipName) chipName.textContent = `Hi, ${firstName}`;
    chip.classList.add('show');
  }

  function hideWelcomeBar() {
    const bar = document.getElementById('user-welcome-bar');
    const chip = document.getElementById('user-chip-tabbar');
    if (bar) bar.classList.remove('show');
    if (chip) chip.classList.remove('show');
  }

  /* ══════════════════════════════════════════════
     USER DASHBOARD PANEL
  ══════════════════════════════════════════════ */
  function loadUserDashboard(name, email, photoUrl) {
    const panel = document.getElementById('user-dashboard-panel');
    if (!panel) return;

    const firstName = (name || 'Student').split(' ')[0];

    // Update header
    const avatar = panel.querySelector('.udp-avatar');
    const nameEl = panel.querySelector('.udp-name');
    const emailEl = panel.querySelector('.udp-email');

    if (avatar) {
      avatar.src = photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundColor=0a0f1e`;
      avatar.onerror = () => { avatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}&backgroundColor=3b82f6`; };
    }
    if (nameEl) nameEl.textContent = name || 'Student';
    if (emailEl) emailEl.textContent = email || '';

    // Load preferences
    const lastLogin = loadUserPreference('last_login');
    const prefSection = loadUserPreference('pref_start_section') || 'Leadership';

    const prefsEl = panel.querySelector('.udp-prefs');
    if (prefsEl && lastLogin) {
      const date = new Date(lastLogin).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      prefsEl.innerHTML = `
        <div class="udp-pref-row"><span>Last Login</span><span>${date}</span></div>
        <div class="udp-pref-row"><span>Start Section</span><span>${prefSection}</span></div>
        <div class="udp-pref-row"><span>Theme</span><span>Dark Neon</span></div>
      `;
    }

    // Load saved projects
    loadUserProjects(email);
  }

  function loadUserProjects(email) {
    const savedProjects = JSON.parse(localStorage.getItem('admin_projects') || '[]');
    const projEl = document.getElementById('udp-saved-projects');
    if (!projEl) return;

    if (savedProjects.length === 0) {
      projEl.innerHTML = `<div style="font-size:0.82rem; color:rgba(148,163,184,0.4); padding:0.5rem 0;">No projects yet. Upload one in the Projects section.</div>`;
      return;
    }

    projEl.innerHTML = savedProjects.slice(0, 4).map(p => `
      <div class="udp-project-item">
        <div class="udp-project-name">${p.title || p.name || 'Untitled'}</div>
        <div class="udp-project-stack">${p.stack || p.category || ''}</div>
      </div>
    `).join('');
  }

  window.openUserDashboard = function() {
    const panel = document.getElementById('user-dashboard-panel');
    if (panel) {
      panel.classList.add('open');
      panel.style.display = 'flex';
    }
  };

  window.closeUserDashboard = function() {
    const panel = document.getElementById('user-dashboard-panel');
    if (panel) {
      panel.classList.remove('open');
      setTimeout(() => { panel.style.display = 'none'; }, 500);
    }
  };

  /* ══════════════════════════════════════════════
     USER PREFERENCES (localStorage)
  ══════════════════════════════════════════════ */
  function saveUserPreference(key, value) {
    try {
      const prefs = JSON.parse(localStorage.getItem('aiml_user_prefs') || '{}');
      prefs[key] = value;
      localStorage.setItem('aiml_user_prefs', JSON.stringify(prefs));
    } catch {}
  }

  function loadUserPreference(key) {
    try {
      const prefs = JSON.parse(localStorage.getItem('aiml_user_prefs') || '{}');
      return prefs[key] || null;
    } catch { return null; }
  }

  window.saveUserPref = saveUserPreference;
  window.loadUserPref = loadUserPreference;

  /* ══════════════════════════════════════════════
     PAGE TRANSITION
  ══════════════════════════════════════════════ */
  function initPageTransition() {
    // Smooth fade between tab sections
    document.querySelectorAll('.section-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const overlay = document.getElementById('page-transition-overlay');
        if (!overlay) return;

        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 350);
      });
    });
  }

  /* ══════════════════════════════════════════════
     DOMContentLoaded INIT
  ══════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initPremiumLoader();
    initPersonalization();
    hookSectionTabs();

    // Slight delay for transitions to be set up after tabs
    setTimeout(initPageTransition, 200);
  });

})();
