// ═══════════════════════════════════════════════════════════
// UI CORE v6.0 — Cinematic Interface Controller
// Handles: loader, navbar, scroll reveals, stats, mobile nav,
//          FAQ accordion, lightbox, back-to-top, toasts
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 UI Core v6.0: Initializing...');

    // ── 1. PREMIUM LOADER ──────────────────────────────────
    const initLoader = () => {
        const loader = document.getElementById('loader');
        const fill = document.querySelector('.progress-bar-fill');
        if (!loader) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 18 + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 1,
                        ease: 'power3.inOut',
                        onComplete: () => {
                            loader.style.display = 'none';
                            document.body.style.overflow = '';
                            initScrollReveal();
                        }
                    });
                }, 400);
            }
            if (fill) fill.style.width = `${Math.min(progress, 100)}%`;
        }, 120);

        document.body.style.overflow = 'hidden';
    };

    // ── 2. FLOATING NAVBAR ─────────────────────────────────
    const initNavbar = () => {
        const nav = document.getElementById('navbar');
        if (!nav) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
            lastScroll = window.scrollY;
        }, { passive: true });

        // Active link tracking
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        const updateActiveLink = () => {
            let current = '';
            sections.forEach(section => {
                const top = section.offsetTop - 200;
                if (window.scrollY >= top) current = section.getAttribute('id');
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
            });
        };
        window.addEventListener('scroll', updateActiveLink, { passive: true });
    };

    // ── 3. MOBILE NAVIGATION ───────────────────────────────
    const initMobileNav = () => {
        const toggle = document.getElementById('nav-toggle');
        const overlay = document.getElementById('mobile-nav');
        const closeBtn = document.getElementById('mobile-nav-close');
        if (!toggle || !overlay) return;

        const open = () => {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const close = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        toggle.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);

        overlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', close);
        });
    };

    // ── 4. GSAP SCROLL REVEAL ──────────────────────────────
    const initScrollReveal = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('.reveal').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 60, scale: 0.97 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 1.2,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true
                    },
                    onComplete: () => el.classList.add('active')
                }
            );
        });

        // Init stats counter after reveal system is ready
        initStatsCounter();
    };

    // ── 5. STATS COUNTER ───────────────────────────────────
    const initStatsCounter = () => {
        const stats = document.querySelectorAll('.stat-value[data-target]');
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            if (isNaN(target)) return;

            const suffix = stat.getAttribute('data-suffix') || '+';
            let started = false;

            const animate = () => {
                if (started) return;
                started = true;
                let count = 0;
                const step = Math.max(1, target / 50);
                const timer = setInterval(() => {
                    count += step;
                    if (count >= target) {
                        count = target;
                        clearInterval(timer);
                        stat.textContent = target + suffix;
                    } else {
                        stat.textContent = Math.ceil(count);
                    }
                }, 25);
            };

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: stat,
                    start: 'top 90%',
                    onEnter: animate,
                    once: true
                });
            }
        });
    };

    // ── 6. FAQ ACCORDION ───────────────────────────────────
    const initFAQ = () => {
        document.addEventListener('click', (e) => {
            const question = e.target.closest('.faq-question');
            if (!question) return;

            const item = question.closest('.faq-item');
            const wasActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));

            // Toggle clicked
            if (!wasActive) item.classList.add('active');
        });
    };

    // ── 7. GALLERY LIGHTBOX ────────────────────────────────
    const initLightbox = () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.getElementById('lightbox-close');
        if (!lightbox) return;

        document.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                const img = item.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        const closeLB = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLB);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLB();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLB();
        });
    };

    // ── 8. BACK TO TOP ─────────────────────────────────────
    const initBackToTop = () => {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) btn.classList.add('visible');
            else btn.classList.remove('visible');
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    // ── 9. SMART GREETING ──────────────────────────────────
    const initGreeting = () => {
        const badge = document.getElementById('smart-greeting-badge');
        if (!badge) return;

        const hour = new Date().getHours();
        let greeting = 'NEURAL LINK ESTABLISHED';
        if (hour < 12) greeting = 'GOOD MORNING • NEURAL LINK ACTIVE';
        else if (hour < 17) greeting = 'GOOD AFTERNOON • SYSTEMS ONLINE';
        else if (hour < 21) greeting = 'GOOD EVENING • HUB SYNCHRONIZED';
        else greeting = 'LATE SESSION • NIGHT MODE ACTIVE';

        badge.textContent = greeting;
    };

    // ── 10. TOAST SYSTEM ───────────────────────────────────
    window.showToast = (msg, type = 'info') => {
        let toast = document.querySelector('.neural-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'neural-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = msg;
        if (type === 'success') toast.style.borderColor = 'var(--neon-cyan)';
        else if (type === 'error') toast.style.borderColor = '#ef4444';
        else toast.style.borderColor = 'var(--border-glass)';

        toast.classList.add('visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('visible'), 3500);
    };

    // ── 11. LUCIDE ICONS ───────────────────────────────────
    const initIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    // ── INIT ALL ───────────────────────────────────────────
    initLoader();
    initNavbar();
    initMobileNav();
    initFAQ();
    initLightbox();
    initBackToTop();
    initGreeting();
    initIcons();

    // Expose for external use
    window.initStatsCounter = initStatsCounter;
    window.initUIEffects = () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        initIcons();
    };
});
