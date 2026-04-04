// js/content-loader.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not configured for content loader.");
}

if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  initContentLoaders();
}

function initContentLoaders() {
  // 1. HOD & Site Config
  onSnapshot(doc(db, "site_config", "hod"), (docSnap) => {
    if (docSnap.exists()) {
      const d = docSnap.data();
      if (d.hodName) document.getElementById('hod-name-el').textContent = d.hodName;
      if (d.hodRole) document.getElementById('hod-role-el').textContent = d.hodRole;
      if (d.hodMsg) document.getElementById('hod-msg-el').innerHTML = d.hodMsg.replace(/\n/g, '<br>');
      if (d.hodImg) document.getElementById('hod-img-el').src = d.hodImg;
    }
  });

  onSnapshot(doc(db, "site_config", "vision"), (docSnap) => {
    if (docSnap.exists()) {
      const d = docSnap.data();
      if (d.vision) document.getElementById('vision-text-el').textContent = d.vision;
      if (d.mission && Array.isArray(d.mission)) {
        document.getElementById('mission-list-el').innerHTML = d.mission.map(m => `<li>${m}</li>`).join('');
      }
    }
  });

  // 2. Faculty (Directors & Deans)
  onSnapshot(collection(db, "faculty"), (snap) => {
    const grid = document.getElementById('faculty-grid-el');
    if (!grid) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `
        <div class="faculty-card-v2 reveal">
          <div class="faculty-image-container">
            <img src="${data.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + data.name}" alt="${data.name}">
          </div>
          <div class="faculty-details">
            <div class="faculty-name-v2">${data.name}</div>
            <div class="faculty-qual">${data.edu || 'Faculty Member'}</div>
            <div class="faculty-exp-chips">
              <span class="exp-chip">${data.role}</span>
            </div>
          </div>
        </div>
      `;
    });
    if (html) {
      grid.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-faculty-updated'));
    }
  });

  // 3. Testimonials
  onSnapshot(collection(db, "testimonials"), (snap) => {
    const track = document.getElementById('testimonials-track');
    if (!track) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `
        <div class="testimonial-card">
          <div class="testimonial-quote">"</div>
          <p class="testimonial-text">${data.feedback}</p>
          <div class="testimonial-stars">★★★★★</div>
          <div class="testimonial-author">
            <img class="testimonial-avatar" src="${data.img || 'https://api.dicebear.com/7.x/initials/svg?seed=' + data.name}" alt="${data.name}">
            <div>
              <div class="testimonial-name">${data.name}</div>
              <div class="testimonial-role">${data.role}</div>
            </div>
          </div>
        </div>
      `;
    });
    if (html) {
      track.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-testimonials-updated'));
    }
  });

  // 4. Gallery
  onSnapshot(collection(db, "gallery"), (snap) => {
    const grid = document.getElementById('gallery-grid-el');
    if (!grid) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `
        <div class="gallery-item" data-category="${data.category || 'all'}" data-title="${data.title}">
          <img class="gallery-img" src="${data.img}" alt="${data.title}" loading="lazy">
          <div class="gallery-overlay">
            <div class="gallery-item-title">${data.title}</div>
            <div class="gallery-item-cat">${data.category || 'Campus'}</div>
          </div>
          <div class="gallery-zoom-icon">🔍</div>
        </div>
      `;
    });
    if (html) {
      grid.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-gallery-updated'));
    }
  });

  // 5. FAQ
  onSnapshot(collection(db, "faq"), (snap) => {
    const list = document.getElementById('faq-list-el');
    if (!list) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `
        <div class="faq-item">
          <div class="faq-question">
            <span>${data.question}</span>
            <div class="faq-icon">+</div>
          </div>
          <div class="faq-answer">
            <div class="faq-tag">${data.category || 'General'}</div>
            <p>${data.answer}</p>
          </div>
        </div>
      `;
    });
    if (html) {
      list.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-faq-updated'));
    }
  });

  // 6. Events
  onSnapshot(collection(db, "events"), (snap) => {
    const container = document.getElementById('events-grid-el');
    if (!container) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      const typeClass = data.type === 'past' ? 'tag-purple' : 'tag-cyan';
      html += `
        <div class="card glass-strong cin-reveal">
          <div style="position:relative; height:180px; overflow:hidden; border-radius:12px; margin-bottom:1.5rem;">
            <img src="${data.img || 'assets/images/hackathon.png'}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover;">
            <span class="tag ${typeClass}" style="position:absolute; top:1rem; right:1rem;">${data.type || 'Upcoming'}</span>
          </div>
          <h3 style="color:#fff; margin-bottom:0.5rem;">${data.title}</h3>
          <div style="color:var(--neon-cyan); font-size:0.85rem; font-weight:600; margin-bottom:1rem;">📅 ${data.date}</div>
          <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6;">${data.desc}</p>
        </div>
      `;
    });
    if (html) {
      container.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-events-updated'));
    }
  });

  // 7. Projects
  onSnapshot(collection(db, "projects"), (snap) => {
    const container = document.getElementById('projects-grid-el');
    if (!container) return;
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `
        <div class="card glass-strong cin-reveal" style="padding:2rem;">
          <div style="height:160px; overflow:hidden; border-radius:12px; margin-bottom:1.5rem; background:rgba(255,255,255,0.03);">
            <img src="${data.image || 'assets/images/aiml_lab.png'}" alt="${data.title}" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <div class="tag tag-blue" style="margin-bottom:0.75rem; display:inline-block;">${data.category || 'AI Project'}</div>
          <h3 style="color:#fff; margin-bottom:0.5rem;">${data.title || data.name}</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem; line-height:1.6; margin-bottom:1.25rem;">${data.desc}</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
            ${(data.stack || '').split(',').map(s => `<span class="tag" style="background:rgba(255,255,255,0.05); color:var(--text-secondary); font-size:0.7rem;">${s.trim()}</span>`).join('')}
          </div>
          <div style="display:flex; gap:1rem;">
            ${data.github ? `<a href="${data.github}" target="_blank" class="admin-btn admin-btn-ghost admin-btn-sm" style="flex:1; text-align:center; text-decoration:none;">GitHub</a>` : ''}
            ${data.demo ? `<a href="${data.demo}" target="_blank" class="admin-btn admin-btn-primary admin-btn-sm" style="flex:1; text-align:center; text-decoration:none;">Demo</a>` : ''}
          </div>
        </div>
      `;
    });
    if (html) {
      container.innerHTML = html;
      window.dispatchEvent(new CustomEvent('aiml-projects-updated'));
    }
  });
}
