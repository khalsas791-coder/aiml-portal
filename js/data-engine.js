// js/data-engine.js — Neural Data Orchestrator v4.1
// Powering 15+ dynamic sectors of the GNDECB AIML Hub

import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. SYNC: CORE ACADEMIC BLOCKS
    await syncSection('faculty', 'faculty-grid', createFacultyCard);
    await syncSection('projects', 'project-grid', createProjectCard);
    await syncSection('testimonials', 'testimonial-grid', createTestimonialCard);

    // 2. SYNC: NOTICE BOARD (LATEST)
    await syncNoticeBoard();

    // 3. SYNC: ACADEMIC CALENDAR
    await syncCalendar();

    // 4. SMART GREETING
    const h = new Date().getHours();
    const g = h < 12 ? "Good Morning" : (h < 18 ? "Good Afternoon" : "Good Evening");
    const ge = document.getElementById('smart-greeting');
    if(ge) ge.innerText = `${g}, GNDECB Hub User`;

    // 5. SCROLL SPY INIT
    initScrollSpy();
});

async function syncSection(col, gridId, cardFn) {
    try {
        const grid = document.getElementById(gridId);
        if(!grid) return;
        const snap = await getDocs(collection(db, col));
        if(snap.empty) {
            grid.innerHTML = `<div style="padding: 5rem; opacity: 0.3; grid-column: 1/-1; text-align: center;">Retrieving sectoral matrix for ${col.toUpperCase()}...</div>`;
            return;
        }
        grid.innerHTML = "";
        snap.forEach(doc => grid.appendChild(cardFn(doc.data(), doc.id)));
    } catch(e) { console.error(`Sync Fail [${col}]:`, e); }
}

async function syncNoticeBoard() {
    const feed = document.getElementById('notice-feed');
    if(!feed) return;
    try {
        const q = query(collection(db, 'notices'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(query(collection(db, 'notices')));
        feed.innerHTML = "";
        snap.forEach(d => {
            const data = d.data();
            const div = document.createElement('div');
            div.className = 'glass-panel';
            div.style.padding = '1.5rem 2rem';
            div.style.borderLeft = '4px solid var(--neon-cyan)';
            div.innerHTML = `
                <div style="font-size: 0.7rem; font-weight: 800; color: var(--neon-cyan); letter-spacing: 2px;">NOTICE_${new Date(data.timestamp).toLocaleDateString()}</div>
                <h4 style="margin: 0.8rem 0 0.5rem; font-size: 1.1rem; color: #fff;">${data.title}</h4>
                <p style="opacity: 0.5; font-size: 0.85rem;">${data.content}</p>
            `;
            feed.appendChild(div);
        });
    } catch(e) { feed.innerHTML = "Sync Delay..."; }
}

async function syncCalendar() {
    const feed = document.getElementById('calendar-feed');
    if(!feed) return;
    try {
        const snap = await getDocs(collection(db, 'calendar'));
        feed.innerHTML = "";
        snap.forEach(d => {
            const data = d.data();
            const div = document.createElement('div');
            div.className = 'glass-panel';
            div.style.padding = '1.5rem 2rem';
            div.style.display = 'flex';
            div.style.gap = '1.5rem';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div style="text-align: center;"><h3 style="color: var(--neon-purple);">${data.day || '01'}</h3><p style="font-size: 0.7rem; opacity: 0.4;">${data.month || 'APR'}</p></div>
                <div style="height: 40px; width: 1px; background: rgba(255,255,255,0.1);"></div>
                <p style="font-size: 0.85rem; font-weight: 800;">${data.event || 'Semester Sync'}</p>
            `;
            feed.appendChild(div);
        });
    } catch(e) { feed.innerHTML = "Sync Delay..."; }
}

// Visual Card UI Logic (Refined)
function createFacultyCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel glow-border';
    d.style.padding = '2.5rem';
    d.innerHTML = `
        <div style="height: 250px; background: rgba(56, 189, 248, 0.05); border-radius: 12px; margin-bottom: 2rem; overflow: hidden;"><img src="${data.image || 'assets/images/campus.png'}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(1);"></div>
        <h3 style="font-family:'Outfit'; margin-bottom: 0.5rem;">${data.name}</h3>
        <p style="color: var(--neon-cyan); font-weight: 800; font-size: 0.75rem; letter-spacing: 2px;">${data.role || 'Neural Faculty'}</p>
        <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; opacity: 0.5; font-size: 0.8rem;"><p>Exp: ${data.exp || '10+'} Years</p><p>Expertise: ${data.expertise || 'AIML'}</p></div>
    `;
    return d;
}

function createProjectCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel glow-border';
    d.style.padding = '3rem';
    d.innerHTML = `
        <span style="font-size: 0.7rem; font-weight: 800; color: var(--neon-purple); letter-spacing: 2px;">VER_1.0_PROJ</span>
        <h3 style="margin: 1.5rem 0 1rem; font-family:'Outfit';">${data.title}</h3>
        <p style="font-size: 0.85rem; opacity: 0.5; line-height: 1.8;">${data.desc}</p>
        <div style="margin-top: 3rem; display: flex; justify-content: space-between;"><button class="btn-ultra" style="padding: 0.6rem 1.2rem; font-size: 0.7rem;">Source Code</button></div>
    `;
    return d;
}

function createTestimonialCard(data) {
    const d = document.createElement('div');
    d.className = 'glass-panel';
    d.style.padding = '4rem';
    d.innerHTML = `
        <p style="font-style: italic; line-height: 2; opacity: 0.8;">"${data.text}"</p>
        <div style="margin-top: 3rem; display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));"></div>
            <div><strong style="font-family:'Outfit';">${data.name}</strong><p style="font-size: 0.7rem; opacity: 0.4; letter-spacing: 1px;">${data.batch || 'Class of 2024'}</p></div>
        </div>
    `;
    return d;
}

function initScrollSpy() {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.ultra-nav a');
        let current = "";
        sections.forEach(s => { if(window.pageYOffset >= (s.offsetTop - 200)) current = s.getAttribute('id'); });
        navLinks.forEach(a => {
            a.classList.remove('active');
            if(a.getAttribute('href').includes(current)) a.classList.add('active');
        });
    });
}
