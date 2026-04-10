// ═══════════════════════════════════════════════════════════
// PARTICLES ENGINE v6.0 — Neural Network Background
// Optimized with requestAnimationFrame and throttled resize
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CONFIG = {
        particleCount: Math.min(50, Math.floor(window.innerWidth / 25)),
        connectionDistance: 140,
        particleColor: { r: 6, g: 182, b: 212 },
        lineColor: { r: 56, g: 189, b: 248 },
        mouseRadius: 200,
        speed: 0.3,
    };

    let particles = [];
    let animId;
    let mouse = { x: null, y: null };

    // Throttle mouse tracking
    let mouseThrottle = false;
    window.addEventListener('mousemove', (e) => {
        if (mouseThrottle) return;
        mouseThrottle = true;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        setTimeout(() => mouseThrottle = false, 30);
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = (Math.random() - 0.5) * CONFIG.speed;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            // Mouse interaction
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseRadius) {
                    const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
                    this.vx -= (dx / dist) * force * 0.02;
                    this.vy -= (dy / dist) * force * 0.02;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Damping
            this.vx *= 0.999;
            this.vy *= 0.999;

            // Wrap edges
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            const { r, g, b } = CONFIG.particleColor;
            ctx.fillStyle = `rgba(${r},${g},${b},${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const { r, g, b } = CONFIG.lineColor;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy; // Skip sqrt for perf

                if (dist < CONFIG.connectionDistance * CONFIG.connectionDistance) {
                    const opacity = 0.08 * (1 - Math.sqrt(dist) / CONFIG.connectionDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
            p.update();
            p.draw();
        }
        drawConnections();

        animId = requestAnimationFrame(animate);
    }

    // Throttled resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animId);
        } else {
            animate();
        }
    });

    init();
    animate();
});
