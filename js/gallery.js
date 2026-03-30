/* ============================================================
   PROJECT GALLERY — Filter + Modal
   ============================================================ */

window.STATIC_PROJECTS = [
  {
    id: 1, icon: '🧠', category: 'nlp',
    name: 'MedScribe AI',
    desc: 'An NLP pipeline that automatically transcribes and summarizes doctor-patient conversations into structured medical reports using transformer models.',
    team: 'Priya S., Rahul K., Ankit M.',
    year: '2025',
    stack: ['Python', 'HuggingFace', 'Flask', 'React'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
  },
  {
    id: 2, icon: '👁️', category: 'cv',
    name: 'CropSense Vision',
    desc: 'Real-time computer vision system for detecting crop diseases from drone footage using YOLOv8, helping farmers with early intervention.',
    team: 'Simran J., Deepak P.',
    year: '2025',
    stack: ['Python', 'YOLOv8', 'OpenCV', 'FastAPI'],
    github: 'https://github.com',
    demo: null,
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)'
  },
  {
    id: 3, icon: '🤖', category: 'web-ai',
    name: 'SmartLearn LMS',
    desc: 'AI-powered Learning Management System that adapts course difficulty based on student performance using reinforcement learning.',
    team: 'Arjun S., Meera N., Vikram R.',
    year: '2024',
    stack: ['Next.js', 'Python', 'TensorFlow', 'Firebase'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)'
  },
  {
    id: 4, icon: '📊', category: 'data',
    name: 'FinSight Analytics',
    desc: 'Stock market prediction dashboard using LSTM networks with sentiment analysis of financial news to predict short-term price movements.',
    team: 'Neha G., Rohan M.',
    year: '2025',
    stack: ['Python', 'LSTM', 'Streamlit', 'Pandas'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
  },
  {
    id: 5, icon: '🦾', category: 'robotics',
    name: 'GestureBot',
    desc: 'An autonomous robotic arm controlled by hand gestures recognized in real-time using MediaPipe and custom-trained classification models.',
    team: 'Karan T., Ayesha B., Suresh P.',
    year: '2024',
    stack: ['MediaPipe', 'Arduino', 'Python', 'OpenCV'],
    github: 'https://github.com',
    demo: null,
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
  },
  {
    id: 6, icon: '🎨', category: 'cv',
    name: 'ArtNeuron',
    desc: 'Neural style transfer web app that converts user photos into famous artistic styles using a custom-optimized VGG19 pipeline.',
    team: 'Ishita R., Naman V.',
    year: '2024',
    stack: ['PyTorch', 'VGG19', 'Flask', 'HTML/CSS'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)'
  },
  {
    id: 7, icon: '🔊', category: 'nlp',
    name: 'LangBridge',
    desc: 'Multilingual speech-to-text and translation tool supporting 12 Indian languages, built with Wav2Vec2 and Helsinki-NLP translation models.',
    team: 'Pooja S., Aditya K.',
    year: '2025',
    stack: ['Wav2Vec2', 'HuggingFace', 'FastAPI', 'React'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)'
  },
  {
    id: 8, icon: '🌐', category: 'web-ai',
    name: 'EduBot Campus',
    desc: 'Intelligent campus assistant chatbot for AIML department handling queries about schedules, resources, faculty, and events using RAG architecture.',
    team: 'Divya M., Lakshay B., Sneha R.',
    year: '2025',
    stack: ['LangChain', 'Gemini API', 'Next.js', 'Pinecone'],
    github: 'https://github.com',
    demo: 'https://demo.example.com',
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
  },
  {
    id: 9, icon: '📡', category: 'data',
    name: 'CityPulse IoT',
    desc: 'Smart city dashboard aggregating real-time IoT sensor data for traffic, pollution, and energy usage with predictive anomaly detection.',
    team: 'Manish K., Preethi N.',
    year: '2024',
    stack: ['Python', 'MQTT', 'InfluxDB', 'Grafana'],
    github: 'https://github.com',
    demo: null,
    gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
  }
];

window.FIREBASE_PROJECTS = [];

let activeFilter = 'all';

window.renderProjects = function() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const ALL_PROJECTS = [...window.FIREBASE_PROJECTS, ...window.STATIC_PROJECTS];

  const filtered = activeFilter === 'all'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter(p => p.category === activeFilter || p.category === 'Firebase'); // Allow Firebase ones to show everywhere or we can filter them properly if they don't have tags

  grid.innerHTML = filtered.map(p => {
    const isFb = p.id && String(p.id).startsWith('fb_');
    const displayImgHtml = p.image 
        ? `<img src="${p.image}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:1rem;" />` 
        : `<div class="project-icon" style="background: ${p.gradient || 'linear-gradient(135deg, #3b82f6, #06b6d4)'}">${p.icon || '🚀'}</div>`;

    return `
    <div class="card project-card reveal" onclick="openProjectModal('${p.id}')" data-category="${p.category}">
      <div class="project-card-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
        ${!p.image ? displayImgHtml : ''}
        <span class="tag tag-purple">${p.year || new Date().getFullYear()}</span>
      </div>
      ${p.image ? displayImgHtml : ''}
      <h3>${p.name}</h3>
      <p>${(p.desc || '').substring(0,110)}…</p>
      <div class="project-tags">
        ${(p.stack || []).map(t => `<span class="tag tag-cyan">${t}</span>`).join('')}
      </div>
      <div class="project-links">
        ${p.github ? `<a class="project-link" href="${p.github}" target="_blank" onclick="event.stopPropagation()">⚡ GitHub</a>` : ''}
        ${p.demo ? `<a class="project-link" href="${p.demo}" target="_blank" onclick="event.stopPropagation()">🚀 Demo</a>` : ''}
      </div>
    </div>
  `}).join('');

  // Re-init reveal for new elements
  const newCards = grid.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  newCards.forEach(c => { setTimeout(() => c.classList.add('revealed'), 50); observer.observe(c); });
};

function openProjectModal(id) {
  const ALL_PROJECTS = [...window.FIREBASE_PROJECTS, ...window.STATIC_PROJECTS];
  const project = ALL_PROJECTS.find(p => String(p.id) === String(id));
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const body  = document.getElementById('project-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
      ${project.image ? `<img src="${project.image}" style="width:100px;height:100px;border-radius:16px;object-fit:cover;" />` : `<div class="project-icon" style="width:70px;height:70px;font-size:2rem;border-radius:16px;background:${project.gradient || 'linear-gradient(135deg, #3b82f6, #06b6d4)'};display:flex;align-items:center;justify-content:center;">${project.icon || '🚀'}</div>`}
      <div>
        <h2 style="font-size:1.75rem;font-weight:800;margin-bottom:4px;">${project.name}</h2>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;">
          <span class="tag tag-purple">${project.year || new Date().getFullYear()}</span>
          ${project.category ? `<span class="tag tag-blue">${project.category.toUpperCase()}</span>` : ''}
        </div>
      </div>
    </div>
    <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:1.5rem;">${project.desc}</p>
    <div style="margin-bottom:1.25rem;">
      <h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:.75rem;">Tech Stack</h4>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;">${project.stack.map(t => `<span class="tag tag-cyan">${t}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:.5rem;">Team</h4>
      <p style="color:var(--text-secondary);font-size:.9rem;">👥 ${project.team}</p>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <a href="${project.github}" target="_blank" class="btn btn-primary btn-sm">⚡ View on GitHub</a>
      ${project.demo ? `<a href="${project.demo}" target="_blank" class="btn btn-secondary btn-sm">🚀 Live Demo</a>` : ''}
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function initGallery() {
  window.renderProjects();

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      window.renderProjects();
    });
  });

  // Close modal on overlay click
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });
}

document.addEventListener('DOMContentLoaded', initGallery);
