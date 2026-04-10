// ═══════════════════════════════════════════════════════════
// DATA ENGINE v6.0 — Dynamic Content Renderer
// Fetches from /api/full-site-data and renders all sections
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Data Engine v6.0: Loading site data...');

    const API_URL = '/api/full-site-data';

    // ── HELPER: Fallback image ─────────────────────────────
    const fallbackImg = (url, fallback) => {
        return url || fallback;
    };

    const unsplashFallback = (query) =>
        `https://images.unsplash.com/photo-${query}?auto=format&fit=crop&w=800&q=80`;

    // ── FETCH & RENDER ─────────────────────────────────────
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(data => {
            renderHero(data.home);
            renderAbout(data.about, data.mission, data.highlights);
            renderEvents(data.events);
            renderProjects(data.projects);
            renderAchievements(data.achievements);
            renderTeam(data.team);
            renderGallery(data.gallery || []);
            renderFAQ(data.faq || []);
            renderContact(data.contact);
            renderFooter(data.home);

            // Re-init UI effects after dynamic content
            setTimeout(() => {
                if (window.initUIEffects) window.initUIEffects();
            }, 100);
        })
        .catch(err => {
            console.warn('Data Engine: Using static fallback.', err);
        });

    // ── HERO ───────────────────────────────────────────────
    function renderHero(home) {
        if (!home) return;
        const title = document.getElementById('hero-title');
        const sub = document.getElementById('hero-subtitle');
        if (title && home.tagline) title.innerHTML = `Next-Gen<br>AIML Innovation`;
        if (sub && home.intro) sub.textContent = home.intro;
    }

    // ── ABOUT ──────────────────────────────────────────────
    function renderAbout(about, mission, highlights) {
        if (about) {
            const desc = document.getElementById('about-desc');
            const vision = document.getElementById('about-vision');
            if (desc) desc.textContent = about.description;
            if (vision) vision.textContent = about.vision;
        }

        if (mission && mission.length) {
            const box = document.getElementById('about-mission');
            if (box) {
                box.innerHTML = mission.map(m => `<p style="margin-bottom:6px;">• ${m}</p>`).join('');
            }
        }

        if (highlights && highlights.length) {
            const row = document.getElementById('highlights-row');
            if (row) {
                row.innerHTML = highlights.map(h =>
                    `<span class="highlight-chip">${h}</span>`
                ).join('');
            }
        }
    }

    // ── EVENTS ─────────────────────────────────────────────
    function renderEvents(events) {
        const grid = document.getElementById('events-grid');
        if (!grid || !events) return;

        if (events.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No events yet. Check back soon!</p>';
            return;
        }

        grid.innerHTML = events.map(ev => `
            <div class="glass-card event-card" onmouseenter="fetch('/api/track/event/${ev.id}',{method:'POST'}).catch(()=>{})">
                <div class="event-card-image">
                    <img src="/static/images/${ev.image_path}"
                         alt="${ev.title}"
                         onerror="this.src='${unsplashFallback('1517245386807-bb43f82c33c4')}'">
                </div>
                <div class="event-card-body">
                    <h3>${ev.title}</h3>
                    <p>${ev.description}</p>
                    <div class="event-meta">
                        <i data-lucide="eye" style="width:14px;height:14px;"></i>
                        ${ev.views || 0} views
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ── PROJECTS ───────────────────────────────────────────
    function renderProjects(projects) {
        const grid = document.getElementById('project-grid');
        if (!grid || !projects) return;

        if (projects.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No projects yet.</p>';
            return;
        }

        const icons = ['🤖', '🧠', '🔬', '🛡️', '📡', '🌐', '⚙️', '💡'];

        grid.innerHTML = projects.map((p, i) => `
            <div class="glass-card project-card" onmouseenter="fetch('/api/track/project/${p.id}',{method:'POST'}).catch(()=>{})">
                <div class="project-card-header">
                    <div class="project-icon">${icons[i % icons.length]}</div>
                    <div>
                        <h3>${p.project_title}</h3>
                        <span class="project-author">${p.student_name}</span>
                    </div>
                </div>
                <p>${p.description}</p>
                <a href="${p.github_link}" target="_blank" rel="noopener" class="project-link">
                    <i data-lucide="github" style="width:14px;height:14px;"></i>
                    View Repository
                </a>
            </div>
        `).join('');
    }

    // ── ACHIEVEMENTS ───────────────────────────────────────
    function renderAchievements(achievements) {
        const grid = document.getElementById('achievements-grid');
        if (!grid || !achievements) return;

        if (achievements.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No achievements yet.</p>';
            return;
        }

        const emojis = ['🏆', '🥇', '🎯', '📈', '🌟', '💎', '🔥', '⚡'];

        grid.innerHTML = achievements.map((a, i) => `
            <div class="glass-card achievement-card">
                <div class="achievement-icon">${emojis[i % emojis.length]}</div>
                <h3>${a.title}</h3>
                <p>${a.description}</p>
            </div>
        `).join('');
    }

    // ── TEAM ───────────────────────────────────────────────
    function renderTeam(team) {
        const grid = document.getElementById('team-grid');
        if (!grid || !team) return;

        if (team.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Team info coming soon.</p>';
            return;
        }

        grid.innerHTML = team.map(t => `
            <div class="glass-card team-card">
                <div class="team-avatar">
                    <img src="/static/images/${t.image_path}"
                         alt="${t.name}"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0f172a&color=06b6d4&size=200&bold=true'">
                </div>
                <h3>${t.name}</h3>
                <p class="team-role">${t.role}</p>
            </div>
        `).join('');
    }

    // ── GALLERY ────────────────────────────────────────────
    function renderGallery(gallery) {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        if (!gallery || gallery.length === 0) {
            // Provide default gallery with Unsplash images
            const defaults = [
                { url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80', caption: 'Campus View' },
                { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=600&q=80', caption: 'Lab Session' },
                { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80', caption: 'Workshop' },
                { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', caption: 'Tech Event' },
                { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', caption: 'Team Meeting' },
                { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', caption: 'Innovation Hub' },
            ];
            gallery = defaults;
        }

        grid.innerHTML = gallery.map(g => `
            <div class="gallery-item">
                <img src="${g.url || '/static/images/' + g.image_path}"
                     alt="${g.caption || 'Gallery'}"
                     onerror="this.src='${unsplashFallback('1562774053-701939374585')}'">
                <div class="gallery-overlay">
                    <span>${g.caption || ''}</span>
                </div>
            </div>
        `).join('');
    }

    // ── FAQ ────────────────────────────────────────────────
    function renderFAQ(faq) {
        const list = document.getElementById('faq-list');
        if (!list) return;

        if (!faq || faq.length === 0) {
            // Default FAQ
            faq = [
                { question: 'What is the AIML department about?', answer: 'The AIML (Artificial Intelligence & Machine Learning) department at GNDECB focuses on cutting-edge AI research, hands-on project development, and preparing students for careers in data science, machine learning, and intelligent systems.' },
                { question: 'What are the placement opportunities?', answer: 'Our students are placed in top tech companies with packages ranging from 4 LPA to 15+ LPA. We maintain a 95%+ placement rate with strong industry connections.' },
                { question: 'Are there research opportunities for students?', answer: 'Yes! Students can participate in VGST-funded research projects, publish papers in international conferences, and work on real-world AI solutions in our dedicated research labs.' },
                { question: 'How can I get involved in events?', answer: 'Join our student chapters like AI-Node and Robotics-Link. Follow our events section for upcoming hackathons, workshops, and the annual Tech-Srijan Symposium.' },
                { question: 'What programming languages are taught?', answer: 'The curriculum covers Python, R, Java, C++, and specialized ML frameworks like TensorFlow, PyTorch, and scikit-learn, alongside cloud platforms like AWS and Azure.' },
            ];
        }

        list.innerHTML = faq.map((f, i) => `
            <div class="faq-item${i === 0 ? ' active' : ''}">
                <button class="faq-question">
                    <span>${f.question}</span>
                    <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                    <p>${f.answer}</p>
                </div>
            </div>
        `).join('');
    }

    // ── CONTACT ────────────────────────────────────────────
    function renderContact(contact) {
        if (!contact) return;

        const info = document.getElementById('contact-info');
        if (info) {
            info.innerHTML = `
                <div class="contact-info-item">
                    <h4 style="color:var(--neon-cyan);">📍 Address</h4>
                    <p>${contact.address}</p>
                </div>
                <div class="contact-info-item">
                    <h4 style="color:var(--neon-purple);">📧 Email & Phone</h4>
                    <p>${contact.email}<br>${contact.phone}</p>
                </div>
            `;
        }

        // Map
        if (contact.map_location) {
            const mapFrame = document.getElementById('contact-map');
            if (mapFrame && contact.map_location.includes('embed')) {
                mapFrame.src = contact.map_location;
            }
        }
    }

    // ── FOOTER ─────────────────────────────────────────────
    function renderFooter(home) {
        if (!home) return;
        const logo = document.getElementById('footer-logo');
        const desc = document.getElementById('footer-desc');
        if (logo) logo.textContent = home.college_name || 'GNDECB AIML Hub';
        if (desc) desc.textContent = home.intro || '';
    }

    // ── CONTACT FORM HANDLER ───────────────────────────────
    const cForm = document.getElementById('contactForm');
    if (cForm) {
        cForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = cForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            try {
                const payload = {
                    name: document.getElementById('c_name').value,
                    email: document.getElementById('c_email').value,
                    message: document.getElementById('c_msg').value
                };

                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    if (window.showToast) showToast('Message sent successfully!', 'success');
                    cForm.reset();
                } else {
                    throw new Error('Send failed');
                }
            } catch (err) {
                if (window.showToast) showToast('Failed to send message. Try again.', 'error');
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});
