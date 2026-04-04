// js/data-engine.js — Neural Data Orchestrator v4.0
// Logic for Standardizing dynamic fetching across 11+ sections

import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. DYNAMIC FETCH: FACULTY
    await syncSection('faculty', 'faculty-grid', createFacultyCard);
    
    // 2. DYNAMIC FETCH: PROJECTS
    await syncSection('projects', 'project-grid', createProjectCard);

    // 3. DYNAMIC FETCH: TESTIMONIALS
    await syncSection('testimonials', 'testimonial-grid', createTestimonialCard);

    // 4. SMART LOGIC: GREETING
    const hours = new Date().getHours();
    const g = hours < 12 ? "Good Morning" : (hours < 18 ? "Good Afternoon" : "Good Evening");
    document.getElementById('smart-greeting').innerText = `${g}, Jaspreet`;

    // 5. SCROLL SPY INIT
    initScrollSpy();
});

async function syncSection(col, gridId, cardFn) {
    try {
        const grid = document.getElementById(gridId);
        if(!grid) return;
        
        const snap = await getDocs(collection(db, col));
        if(snap.empty) {
            grid.innerHTML = `<div style="padding: 5rem; opacity: 0.3; grid-column: 1/-1; text-align: center;">No active ${col} synced. Check Admin.</div>`;
            return;
        }

        grid.innerHTML = ""; // Clear skeletons
        snap.forEach(doc => {
            const card = cardFn(doc.data(), doc.id);
            grid.appendChild(card);
        });
    } catch(e) {
        console.error(`Sync Failure [${col}]:`, e);
    }
}

function createFacultyCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel glow-border';
    d.style.padding = '2.5rem';
    d.innerHTML = `
        <div style="height: 250px; background: rgba(56, 189, 248, 0.05); border-radius: 12px; margin-bottom: 2rem; overflow: hidden;"><img src="${data.image || 'assets/images/campus.png'}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(1);"></div>
        <h3 style="font-family: 'Outfit'; margin-bottom: 0.5rem;">${data.name || 'Faculty Member'}</h3>
        <p style="color: var(--neon-cyan); font-weight: 800; font-size: 0.8rem; letter-spacing: 2px;">${data.role || 'Professor'}</p>
        <p style="font-size: 0.9rem; opacity: 0.5; margin-top: 1.5rem; line-height: 1.6;">${data.bio || 'Architecting neural excellence in higher education.'}</p>
    `;
    return d;
}

function createProjectCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel glow-border';
    d.style.padding = '2.5rem';
    d.innerHTML = `
        <span style="font-size: 0.75rem; font-weight: 800; color: var(--neon-purple); letter-spacing: 2px;">PROJ_${data.category || 'MODEL'}</span>
        <h3 style="margin: 1.5rem 0 1rem; font-family:'Outfit';">${data.title || 'Untitled Deployment'}</h3>
        <p style="font-size: 0.9rem; opacity: 0.5; line-height: 1.6;">${data.desc || 'No description available for this project snapshot.'}</p>
        <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 0.8rem; font-weight: 800;">VER 1.0</span><button class="btn-ultra" style="font-size: 0.7rem; padding: 0.5rem 1rem;">View Repo</button></div>
    `;
    return d;
}

function createTestimonialCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel';
    d.style.padding = '4rem';
    d.innerHTML = `
        <i data-lucide="quote" style="color: var(--neon-cyan); opacity: 0.3; margin-bottom: 2rem;"></i>
        <p style="font-size: 1.25rem; font-style: italic; line-height: 1.8; opacity: 0.8;">"${data.text || 'GNDECB AIML has provided an unparalleled ecosystem for technical growth.'}"</p>
        <div style="margin-top: 3rem; display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(var(--neon-cyan), var(--neon-purple));"></div>
            <div><strong>${data.name || 'Anonymous Student'}</strong><p style="font-size: 0.8rem; opacity: 0.5;">${data.batch || 'Class of 2024'}</p></div>
        </div>
    `;
    return d;
}

function initScrollSpy() {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.ultra-nav a');
        let current = "";
        sections.forEach(s => {
            if(window.pageYOffset >= (s.offsetTop - 200)) current = s.getAttribute('id');
        });
        navLinks.forEach(a => {
            a.classList.remove('active');
            if(a.getAttribute('href').includes(current)) a.classList.add('active');
        });
    });
}
