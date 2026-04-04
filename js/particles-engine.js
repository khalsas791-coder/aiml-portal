// js/particles-engine.js — GPU-Accelerated Neural Network Background
// High-fidelity particle system with connecting node lines

class NeuralParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.numParticles = 100;
        this.lineDist = 120;
        this.color = 'rgba(56, 189, 248, 0.2)';
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Generate Particles
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse Interaction (Push/Pull)
            let dx = this.mouse.x - p.x;
            let dy = this.mouse.y - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < this.mouse.radius) {
                p.x -= dx * 0.01;
                p.y -= dy * 0.01;
            }

            // Draw Point
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();

            // Draw Connections
            for (let j = i + 1; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let d = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                if (d < this.lineDist) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(56, 189, 248, ${1 - d/this.lineDist * 0.5})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'neural-canvas';
    canvas.style.cssText = 'position:fixed; inset:0; z-index:-1; pointer-events:none;';
    document.body.prepend(canvas);
    new NeuralParticles('neural-canvas');
});
