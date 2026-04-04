import React, { useEffect, useRef } from 'react';

export default function AimlVanilla() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Inject vanilla CSS
    const styles = ['variables.css', 'base.css', 'components.css', 'sections.css', 'responsive.css'];
    styles.forEach(css => {
      if (!document.querySelector(`link[href='/css/${css}']`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/' + css;
        document.head.appendChild(link);
      }
    });

    // Inject vanilla JS scripts dynamically so they run
    const scripts = ['animations.js', 'cgpa.js', 'gallery.js', 'chatbot.js'];
    let loaded = 0;
    scripts.forEach(src => {
      if (!document.querySelector(`script[src='/js/${src}']`)) {
        const script = document.createElement('script');
        script.src = '/js/' + src;
        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            // Re-bind listeners just in case
            if(window.initRevealAnimations) window.initRevealAnimations();
            if(window.initCounters) window.initCounters();
            if(window.initStaggeredReveal) window.initStaggeredReveal();
            if(window.initSectionAnimations) window.initSectionAnimations();
            if(window.initTabs) window.initTabs();
            if(window.initScrollSpy) window.initScrollSpy();
          }
        };
        document.body.appendChild(script);
      }
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="aiml-vanilla-wrapper"
      dangerouslySetInnerHTML={{ __html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="description" content="AIML Department — Artificial Intelligence & Machine Learning. Notes, projects, AI tools, CGPA calculator, chatbot and more for AIML students."/>
<title>AIML Department | AI & Machine Learning</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="css/variables.css"/>
<link rel="stylesheet" href="css/base.css"/>
<link rel="stylesheet" href="css/components.css"/>
<link rel="stylesheet" href="css/sections.css"/>
<link rel="stylesheet" href="css/responsive.css"/>
<!-- Scroll progress -->
<style>
#scroll-progress-bar{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,var(--neon-blue),var(--neon-cyan),var(--neon-purple));z-index:9999;width:0%;transition:width .1s linear;pointer-events:none;}
</style>
</head>
<body>

<!-- Scroll Progress -->
<div id="scroll-progress-bar" id="scroll-progress"></div>

<!-- Toast Container -->
<div class="toast-container" id="toast-container"></div>

<!-- ═══════════════════════ LOADING SCREEN ═══════════════════════ -->
<div id="loading-screen">
  <div class="loader-ring"></div>
  <div class="loader-text">AIML Department</div>
  <div class="loader-subtitle">Initializing AI Systems...</div>
  <div class="loader-progress"><div class="loader-progress-bar" id="loader-bar"></div></div>
</div>

<!-- ═══════════════════════ NAVBAR ═══════════════════════ -->
<nav id="navbar">
  <div class="nav-inner">
    <a class="nav-logo" href="#" data-scroll-to="hero">
      <div class="nav-logo-icon">🧠</div>
      <div class="nav-logo-text">AIML<span>Dept</span></div>
    </a>
    <div class="nav-links">
      <span class="nav-link" data-section="about" data-scroll-to="about">About</span>
      <span class="nav-link" data-section="courses" data-scroll-to="courses">Courses</span>
      <span class="nav-link" data-section="faculty" data-scroll-to="faculty">Faculty</span>
      <span class="nav-link" data-section="resources" data-scroll-to="resources">Resources</span>
      <span class="nav-link" data-section="ai-tools" data-scroll-to="ai-tools">AI Tools</span>
      <span class="nav-link" data-section="cgpa" data-scroll-to="cgpa">CGPA Calc</span>
      <span class="nav-link" data-section="projects" data-scroll-to="projects">Projects</span>
      <span class="nav-link" data-section="events" data-scroll-to="events">Events</span>
      <span class="nav-link" data-section="contact" data-scroll-to="contact">Contact</span>
    </div>
    <div class="nav-cta">
      <button class="btn btn-primary btn-sm" id="set-api-key-btn">🤖 Enable AI</button>
    </div>
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-menu" id="mobile-menu">
    <span class="nav-link" data-scroll-to="about">About</span>
    <span class="nav-link" data-scroll-to="courses">Courses</span>
    <span class="nav-link" data-scroll-to="faculty">Faculty</span>
    <span class="nav-link" data-scroll-to="resources">Resources</span>
    <span class="nav-link" data-scroll-to="ai-tools">AI Tools Hub</span>
    <span class="nav-link" data-scroll-to="cgpa">CGPA Calculator</span>
    <span class="nav-link" data-scroll-to="projects">Projects</span>
    <span class="nav-link" data-scroll-to="events">Events</span>
    <span class="nav-link" data-scroll-to="contact">Contact</span>
  </div>
</nav>

<!-- ═══════════════════════ HERO ═══════════════════════ -->
<section id="hero">
  <div class="hero-bg"></div>
  <div class="hero-bg-overlay"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <canvas id="particles-canvas"></canvas>
  <div class="hero-content">
    <div class="hero-badge"><span class="dot"></span>Department of AI &amp; Machine Learning</div>
    <h1 class="hero-title">
      <span class="hero-title-top">Shaping the Future of</span>
      <span class="hero-title-gradient" id="hero-typewriter">Machine Learning</span>
    </h1>
    <p class="hero-subtitle">A premier AIML department bridging theory and innovation — equipping tomorrow's AI engineers with cutting-edge tools, research, and real-world projects.</p>
    <div class="hero-ctas">
      <button class="btn btn-primary btn-lg" data-scroll-to="resources">📚 Student Resources</button>
      <button class="btn btn-secondary btn-lg" data-scroll-to="ai-tools">🛠️ AI Tools Hub</button>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="hero-stat-number" data-target="500" data-suffix="+">500+</div><div class="hero-stat-label">Students</div></div>
      <div class="hero-stat"><div class="hero-stat-number" data-target="94" data-suffix="%">94%</div><div class="hero-stat-label">Placement</div></div>
      <div class="hero-stat"><div class="hero-stat-number" data-target="120" data-suffix="+">120+</div><div class="hero-stat-label">Publications</div></div>
      <div class="hero-stat"><div class="hero-stat-number" data-target="8">8</div><div class="hero-stat-label">Faculty</div></div>
    </div>
  </div>
  <div class="scroll-indicator">
    <div class="scroll-mouse"><div class="scroll-dot"></div></div>
    <span>Scroll</span>
  </div>
</section>

` }} 
    />
  );
}
