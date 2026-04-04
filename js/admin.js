// js/admin.js — Admin Dashboard Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

/* ── ADMIN CREDENTIALS (override in firebase for production) ── */
const ADMIN_EMAIL = "admin@gndecb.ac.in";
const ADMIN_PASSWORD = "GndecbAdmin@2026";

let app, auth, db, currentAdmin = null;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch(e) {
  console.warn("Firebase not configured.");
}

/* ══════════════════════════════════════════════
   LOGIN / LOGOUT
══════════════════════════════════════════════ */
window.adminLogin = async function() {
  const email = document.getElementById('al-email').value.trim();
  const pass  = document.getElementById('al-pass').value;
  const errEl = document.getElementById('al-err');
  errEl.classList.remove('show');

  if (!email || !pass) { errEl.textContent = "Please fill in all fields."; errEl.classList.add('show'); return; }

  // Credential check
  if (email !== ADMIN_EMAIL) {
    errEl.textContent = "Access denied. Admin accounts only.";
    errEl.classList.add('show');
    return;
  }

  try {
    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // local mode
      if (pass === ADMIN_PASSWORD) showDashboard(email);
      else { errEl.textContent = "Invalid credentials."; errEl.classList.add('show'); }
    }
  } catch(e) {
    errEl.textContent = e.message || "Login failed.";
    errEl.classList.add('show');
  }
};

window.adminLogout = async function() {
  if (auth) await signOut(auth);
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-login-page').style.display = 'flex';
};

function showDashboard(email) {
  document.getElementById('admin-login-page').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
  const initials = email.charAt(0).toUpperCase();
  document.getElementById('admin-topbar-initials').textContent = initials;
  document.getElementById('admin-topbar-email').textContent = email;
  loadAllData();
  loadAnalytics();
}

// Auth state listener
if (auth && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      currentAdmin = user;
      showDashboard(user.email);
    } else if (user) {
      // Not admin - sign out
      signOut(auth);
    }
  });
}

/* ══════════════════════════════════════════════
   TAB NAVIGATION
══════════════════════════════════════════════ */
window.showAdminTab = function(tabName, clickedBtn) {
  // Hide all tabs
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));

  // Show selected
  const tab = document.getElementById('tab-' + tabName);
  if (tab) tab.classList.add('active');
  if (clickedBtn) clickedBtn.classList.add('active');

  // Update topbar title
  const titles = {
    overview: 'Overview', analytics: 'Analytics', notes: 'Notes Management',
    events: 'Events Management', projects: 'Projects Management', users: 'Registered Users',
    faculty: 'Faculty Management', testimonials: 'Testimonials',
    gallery: 'Gallery Management', faq: 'FAQ Management', siteconfig: 'Site Configuration'
  };
  document.getElementById('admin-topbar-title').textContent = titles[tabName] || tabName.charAt(0).toUpperCase() + tabName.slice(1);

  // Close sidebar on mobile
  if (window.innerWidth < 900) {
    document.getElementById('admin-sidebar').classList.remove('open');
  }
};

/* ══════════════════════════════════════════════
   UI HELPERS (TOASTS, MODALS)
══════════════════════════════════════════════ */
window.showToast = function(msg, type = 'success') {
  const toast = document.getElementById('admin-toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-msg');
  if (!toast) return;
  
  icon.textContent = type === 'success' ? '✅' : '❌';
  text.textContent = msg;
  toast.className = `admin-toast ${type} show`;
  
  setTimeout(() => toast.classList.remove('show'), 3000);
};

window.showConfirm = function(callback) {
  openModal('confirm-modal');
  const btn = document.getElementById('confirm-delete-btn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.onclick = () => {
    closeModal('confirm-modal');
    callback();
  };
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
};

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/* ══════════════════════════════════════════════
   LOAD ALL DATA
══════════════════════════════════════════════ */
function loadAllData() {
  loadUsers();
  loadNotes();
  loadEvents_();
  loadProjects_();
  loadFaculty();
  loadTestimonials();
  loadGallery();
  loadFaq();
  loadSiteConfigData();
}

/* ── Users ── */
function loadUsers() {
  if (!db || firebaseConfig.apiKey === "YOUR_API_KEY") {
    showNoFirebase('users-admin-body', 5);
    showNoFirebase('recent-users-body', 4);
    return;
  }

  onSnapshot(collection(db, "students"), (snap) => {
    let count = 0;
    let html = '';
    let recentHtml = '';
    snap.forEach(d => {
      const data = d.data();
      if (!data.email) return;
      count++;
      const badge = data.name
        ? `<span class="status-badge status-active">● Active</span>`
        : `<span class="status-badge status-inactive">○ Incomplete</span>`;
      html += `<tr>
        <td><strong>${data.name || '—'}</strong></td>
        <td style="color:var(--text-secondary); font-size:0.8rem;">${data.email}</td>
        <td>${data.role || '—'}</td>
        <td style="font-size:0.8rem;">${(data.skills || '').substring(0,40)}</td>
        <td>${badge}</td>
        <td><button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteStudent('${d.id}', '${data.email}')">🗑️</button></td>
      </tr>`;
      if (count <= 5) recentHtml += `<tr>
        <td><strong>${data.name || '—'}</strong></td>
        <td style="color:var(--text-secondary); font-size:0.8rem;">${data.email}</td>
        <td>${data.role || 'Student'}</td>
        <td>${badge}</td>
      </tr>`;
    });
    if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No users registered yet.</td></tr>`;
    if (!recentHtml) recentHtml = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No users yet.</td></tr>`;
    document.getElementById('users-admin-body').innerHTML = html;
    document.getElementById('recent-users-body').innerHTML = recentHtml;
    document.getElementById('stat-users').textContent = count;
    document.getElementById('badge-users').textContent = count;
  });
}

window.deleteStudent = function(id, email) {
  if (email === ADMIN_EMAIL) { showToast("Cannot delete main admin!", "error"); return; }
  showConfirm(async () => {
    try {
      await deleteDoc(doc(db, "students", id));
      showToast("User deleted successfully");
    } catch(e) { showToast(e.message, 'error'); }
  });
};

/* ── Notes ── */
function loadNotes() {
  if (!db || firebaseConfig.apiKey === "YOUR_API_KEY") {
    showNoFirebase('notes-admin-body', 5);
    updateCount('stat-notes', 0); updateCount('badge-notes', 0);
    return;
  }

  const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    let count = 0, html = '';
    snap.forEach(d => {
      count++;
      const data = d.data();
      const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'N/A';
      html += `<tr>
        <td><strong>${data.title || 'Untitled'}</strong></td>
        <td><span class="status-badge status-active">${data.subject || '—'}</span></td>
        <td style="font-size:0.78rem; color:var(--text-secondary);">${data.email || 'Admin'}</td>
        <td style="font-size:0.78rem;">${date}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editNote('${d.id}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('notes','${d.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    });
    if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No notes yet. Add one!</td></tr>`;
    document.getElementById('notes-admin-body').innerHTML = html;
    updateCount('stat-notes', count); updateCount('badge-notes', count);
  });
}

/* ── Events ── */
function loadEvents_() {
  if (!db || firebaseConfig.apiKey === "YOUR_API_KEY") {
    showNoFirebase('events-admin-body', 5);
    updateCount('stat-events', 0); updateCount('badge-events', 0);

    // Load local events from localStorage
    loadLocalEvents();
    return;
  }

  const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    let count = 0, html = '';
    snap.forEach(d => {
      count++;
      const data = d.data();
      html += buildEventRow(d.id, data);
    });

    // Also load local events
    const localEvts = getLocalEvents();
    localEvts.forEach(ev => { count++; html += buildEventRow(ev.id, ev, true); });

    if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No events yet. Add one!</td></tr>`;
    document.getElementById('events-admin-body').innerHTML = html;
    updateCount('stat-events', count); updateCount('badge-events', count);
  });
}

function buildEventRow(id, data, isLocal = false) {
  const typeBadge = data.type === 'past'
    ? `<span class="status-badge status-inactive">Past</span>`
    : `<span class="status-badge status-active">Upcoming</span>`;
  const src = isLocal ? 'local' : 'firebase';
  return `<tr>
    <td><strong>${data.title || 'Untitled'}</strong></td>
    <td style="font-size:0.78rem;">${data.date || 'N/A'}</td>
    <td>${typeBadge}</td>
    <td style="font-size:0.78rem; color:var(--text-secondary);">${(data.desc || '').substring(0,50)}...</td>
    <td>
      <div style="display:flex; gap:0.4rem;">
        <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editEvent('${id}','${src}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
        <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('${src==='local'?'local_events':'events'}','${id}')">🗑️</button>
      </div>
    </td>
  </tr>`;
}

function loadLocalEvents() {
  const evts = getLocalEvents();
  let html = '';
  evts.forEach(ev => { html += buildEventRow(ev.id, ev, true); });
  if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No events yet. Add one!</td></tr>`;
  document.getElementById('events-admin-body').innerHTML = html;
  updateCount('stat-events', evts.length); updateCount('badge-events', evts.length);
}

function getLocalEvents() {
  try { return JSON.parse(localStorage.getItem('admin_events') || '[]'); } catch { return []; }
}

/* ── Projects ── */
function loadProjects_() {
  if (!db || firebaseConfig.apiKey === "YOUR_API_KEY") {
    showNoFirebase('projects-admin-body', 5);

    // Load local projects
    loadLocalProjects();
    return;
  }

  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    let count = 0, html = '';
    snap.forEach(d => {
      count++;
      const data = d.data();
      html += buildProjectRow(d.id, data);
    });

    // Local projects too
    const local = getLocalProjects();
    local.forEach(p => { count++; html += buildProjectRow(p.id, p, true); });

    if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No projects yet.</td></tr>`;
    document.getElementById('projects-admin-body').innerHTML = html;
    updateCount('stat-projects', count); updateCount('badge-projects', count);
  });
}

function buildProjectRow(id, data, isLocal = false) {
  const src = isLocal ? 'local' : 'firebase';
  return `<tr>
    <td><strong>${data.title || data.name || 'Untitled'}</strong></td>
    <td style="font-size:0.78rem;">${data.team || '—'}</td>
    <td><span class="status-badge status-active" style="font-size:0.68rem;">${(data.stack || '').substring(0,25)}</span></td>
    <td style="font-size:0.78rem; color:var(--text-secondary);">${data.category || '—'}</td>
    <td>
      <div style="display:flex; gap:0.4rem;">
        <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editProject('${id}','${src}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
        <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('${src==='local'?'local_projects':'projects'}','${id}')">🗑️</button>
      </div>
    </td>
  </tr>`;
}

function loadLocalProjects() {
  const projects = getLocalProjects();
  let html = '';
  projects.forEach(p => { html += buildProjectRow(p.id, p, true); });
  if (!html) html = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">No projects yet.</td></tr>`;
  document.getElementById('projects-admin-body').innerHTML = html;
  updateCount('stat-projects', projects.length); updateCount('badge-projects', projects.length);
}

function getLocalProjects() {
  try { return JSON.parse(localStorage.getItem('admin_projects') || '[]'); } catch { return []; }
}

/* ══════════════════════════════════════════════
   CRUD — NOTES
══════════════════════════════════════════════ */
window.openNoteModal = function(id = null) {
  document.getElementById('note-edit-id').value = id || '';
  document.getElementById('note-modal-title').textContent = id ? 'Edit Note' : 'Add Note';
  if (!id) { ['n-title','n-subject','n-url'].forEach(i => document.getElementById(i).value = ''); }
  openModal('note-admin-modal');
};

window.editNote = function(id, data) {
  document.getElementById('note-edit-id').value = id;
  document.getElementById('note-modal-title').textContent = 'Edit Note';
  document.getElementById('n-title').value = data.title || '';
  document.getElementById('n-subject').value = data.subject || '';
  document.getElementById('n-url').value = data.url || '';
  openModal('note-admin-modal');
};

window.saveNote = async function() {
  const id = document.getElementById('note-edit-id').value;
  const noteData = {
    title: document.getElementById('n-title').value.trim(),
    subject: document.getElementById('n-subject').value.trim(),
    url: document.getElementById('n-url').value.trim(),
    email: 'Admin',
    createdAt: serverTimestamp()
  };
  if (!noteData.title) { alert('Please enter a title.'); return; }

  try {
    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      if (id) await updateDoc(doc(db, "notes", id), noteData);
      else await addDoc(collection(db, "notes"), noteData);
    } else {
      // local storage fallback
      let notes = JSON.parse(localStorage.getItem('admin_notes') || '[]');
      if (id) { notes = notes.map(n => n.id === id ? {...n, ...noteData} : n); }
      else { notes.unshift({...noteData, id: 'local_'+Date.now(), createdAt: { toDate: () => new Date() }}); }
      localStorage.setItem('admin_notes', JSON.stringify(notes));
      loadNotes();
    }
    closeModal('note-admin-modal');
  } catch(e) { alert('Error: ' + e.message); }
};

/* ══════════════════════════════════════════════
   CRUD — EVENTS
══════════════════════════════════════════════ */
window.openEventModal = function() {
  document.getElementById('event-edit-id').value = '';
  document.getElementById('event-modal-title').textContent = 'Add Event';
  ['ev-title','ev-date','ev-desc','ev-img'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('ev-type').value = 'upcoming';
  openModal('event-admin-modal');
};

window.editEvent = function(id, src, data) {
  document.getElementById('event-edit-id').value = (src === 'local' ? 'local:' : '') + id;
  document.getElementById('event-modal-title').textContent = 'Edit Event';
  document.getElementById('ev-title').value = data.title || '';
  document.getElementById('ev-date').value = data.date || '';
  document.getElementById('ev-type').value = data.type || 'upcoming';
  document.getElementById('ev-desc').value = data.desc || '';
  document.getElementById('ev-img').value = data.img || '';
  openModal('event-admin-modal');
};

window.saveEvent = async function() {
  const rawId = document.getElementById('event-edit-id').value;
  const isLocal = rawId.startsWith('local:');
  const id = isLocal ? rawId.replace('local:', '') : rawId;

  const evData = {
    title: document.getElementById('ev-title').value.trim(),
    date: document.getElementById('ev-date').value,
    type: document.getElementById('ev-type').value,
    desc: document.getElementById('ev-desc').value.trim(),
    img: document.getElementById('ev-img').value.trim()
  };
  if (!evData.title) { alert('Please enter a title.'); return; }

  try {
    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY" && !isLocal) {
      if (id) await updateDoc(doc(db, "events", id), {...evData, createdAt: serverTimestamp()});
      else await addDoc(collection(db, "events"), {...evData, createdAt: serverTimestamp()});
    } else {
      let events = getLocalEvents();
      if (id) { events = events.map(e => e.id === id ? {...e, ...evData} : e); }
      else { events.unshift({...evData, id: 'local_'+Date.now()}); }
      localStorage.setItem('admin_events', JSON.stringify(events));
      loadLocalEvents();
    }
    closeModal('event-admin-modal');
  } catch(e) { alert('Error: ' + e.message); }
};

/* ══════════════════════════════════════════════
   CRUD — PROJECTS
══════════════════════════════════════════════ */
window.openProjectModal = function() {
  document.getElementById('project-edit-id').value = '';
  document.getElementById('project-modal-title').textContent = 'Add Project';
  ['p-title','p-team','p-stack','p-desc','p-github','p-demo','p-img'].forEach(i => document.getElementById(i).value = '');
  openModal('project-admin-modal');
};

window.editProject = function(id, src, data) {
  document.getElementById('project-edit-id').value = (src === 'local' ? 'local:' : '') + id;
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('p-title').value = data.title || data.name || '';
  document.getElementById('p-team').value = data.team || '';
  document.getElementById('p-stack').value = data.stack || (Array.isArray(data.stack) ? data.stack.join(', ') : '');
  document.getElementById('p-category').value = data.category || 'web-ai';
  document.getElementById('p-desc').value = data.desc || '';
  document.getElementById('p-github').value = data.github || '';
  document.getElementById('p-demo').value = data.demo || '';
  document.getElementById('p-img').value = data.image || data.img || '';
  openModal('project-admin-modal');
};

window.saveProject = async function() {
  const rawId = document.getElementById('project-edit-id').value;
  const isLocal = rawId.startsWith('local:');
  const id = isLocal ? rawId.replace('local:', '') : rawId;

  const pData = {
    title: document.getElementById('p-title').value.trim(),
    name: document.getElementById('p-title').value.trim(),
    team: document.getElementById('p-team').value.trim(),
    stack: document.getElementById('p-stack').value.trim(),
    category: document.getElementById('p-category').value,
    desc: document.getElementById('p-desc').value.trim(),
    github: document.getElementById('p-github').value.trim(),
    demo: document.getElementById('p-demo').value.trim(),
    image: document.getElementById('p-img').value.trim()
  };
  if (!pData.title) { alert('Please enter a project name.'); return; }

  try {
    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY" && !isLocal) {
      if (id) await updateDoc(doc(db, "projects", id), {...pData, createdAt: serverTimestamp()});
      else await addDoc(collection(db, "projects"), {...pData, createdAt: serverTimestamp()});
    } else {
      let projects = getLocalProjects();
      if (id) { projects = projects.map(p => p.id === id ? {...p, ...pData} : p); }
      else { projects.unshift({...pData, id: 'local_'+Date.now(), year: new Date().getFullYear()}); }
      localStorage.setItem('admin_projects', JSON.stringify(projects));
      loadLocalProjects();
    }
    closeModal('project-admin-modal');
  } catch(e) { alert('Error: ' + e.message); }
};

/* ══════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   NEW SECTIONS (FACULTY, TESTIMONIALS, GALLERY, FAQ)
══════════════════════════════════════════════ */

/* ── Faculty ── */
window.openFacultyModal = () => { 
  ['f-name','f-role','f-edu','f-img'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('faculty-edit-id').value = '';
  openModal('faculty-admin-modal'); 
};
window.editFaculty = (id, data) => {
  document.getElementById('faculty-edit-id').value = id;
  document.getElementById('f-name').value = data.name || '';
  document.getElementById('f-role').value = data.role || '';
  document.getElementById('f-edu').value = data.edu || '';
  document.getElementById('f-img').value = data.img || '';
  openModal('faculty-admin-modal');
};
window.saveFaculty = async () => {
  const id = document.getElementById('faculty-edit-id').value;
  const data = {
    name: document.getElementById('f-name').value.trim(),
    role: document.getElementById('f-role').value.trim(),
    edu: document.getElementById('f-edu').value.trim(),
    img: document.getElementById('f-img').value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if (id) await updateDoc(doc(db, "faculty", id), data);
    else await addDoc(collection(db, "faculty"), data);
    showToast("Faculty saved!"); closeModal('faculty-admin-modal');
  } catch(e) { showToast(e.message, 'error'); }
};
function loadFaculty() {
  onSnapshot(collection(db, "faculty"), snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr>
        <td><strong>${data.name}</strong></td>
        <td>${data.role}</td>
        <td style="font-size:0.8rem;">${data.edu}</td>
        <td><div style="display:flex;gap:4px;">
          <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editFaculty('${d.id}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
          <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('faculty','${d.id}')">🗑️</button>
        </div></td>
      </tr>`;
    });
    document.getElementById('faculty-admin-body').innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:2rem;">No faculty added.</td></tr>';
  });
}

/* ── Testimonials ── */
window.openTestimonialModal = () => {
  ['t-name','t-role','t-feedback','t-img'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('testimonial-edit-id').value = '';
  openModal('testimonial-admin-modal');
};
window.editTestimonial = (id, data) => {
  document.getElementById('testimonial-edit-id').value = id;
  document.getElementById('t-name').value = data.name || '';
  document.getElementById('t-role').value = data.role || '';
  document.getElementById('t-feedback').value = data.feedback || '';
  document.getElementById('t-img').value = data.img || '';
  openModal('testimonial-admin-modal');
};
window.saveTestimonial = async () => {
  const id = document.getElementById('testimonial-edit-id').value;
  const data = {
    name: document.getElementById('t-name').value.trim(),
    role: document.getElementById('t-role').value.trim(),
    feedback: document.getElementById('t-feedback').value.trim(),
    img: document.getElementById('t-img').value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if (id) await updateDoc(doc(db, "testimonials", id), data);
    else await addDoc(collection(db, "testimonials"), data);
    showToast("Testimonial saved!"); closeModal('testimonial-admin-modal');
  } catch(e) { showToast(e.message, 'error'); }
};
function loadTestimonials() {
  onSnapshot(collection(db, "testimonials"), snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr>
        <td><strong>${data.name}</strong></td>
        <td>${data.role}</td>
        <td style="font-size:0.75rem;">${(data.feedback || '').substring(0,60)}...</td>
        <td><div style="display:flex;gap:4px;">
          <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editTestimonial('${d.id}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
          <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('testimonials','${d.id}')">🗑️</button>
        </div></td>
      </tr>`;
    });
    document.getElementById('testimonials-admin-body').innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:2rem;">No testimonials yet.</td></tr>';
  });
}

/* ── Gallery ── */
window.openGalleryModal = () => {
  ['g-title','g-img'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('gallery-edit-id').value = '';
  openModal('gallery-admin-modal');
};
window.editGallery = (id, data) => {
  document.getElementById('gallery-edit-id').value = id;
  document.getElementById('g-title').value = data.title || '';
  document.getElementById('g-category').value = data.category || 'campus';
  document.getElementById('g-img').value = data.img || '';
  openModal('gallery-admin-modal');
};
window.saveGallery = async () => {
  const id = document.getElementById('gallery-edit-id').value;
  const data = {
    title: document.getElementById('g-title').value.trim(),
    category: document.getElementById('g-category').value,
    img: document.getElementById('g-img').value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if (id) await updateDoc(doc(db, "gallery", id), data);
    else await addDoc(collection(db, "gallery"), data);
    showToast("Image saved to gallery!"); closeModal('gallery-admin-modal');
  } catch(e) { showToast(e.message, 'error'); }
};
function loadGallery() {
  onSnapshot(collection(db, "gallery"), snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr>
        <td><img src="${data.img}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;"></td>
        <td><strong>${data.title}</strong></td>
        <td><span class="status-badge status-active">${data.category}</span></td>
        <td><div style="display:flex;gap:4px;">
          <button class="admin-btn admin-btn-ghost admin-btn-sm" onclick="editGallery('${d.id}', ${JSON.stringify(data).replace(/"/g,'&quot;')})">✏️</button>
          <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('gallery','${d.id}')">🗑️</button>
        </div></td>
      </tr>`;
    });
    document.getElementById('gallery-admin-body').innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:2rem;">Gallery is empty.</td></tr>';
  });
}

/* ── FAQ ── */
window.openFaqModal = () => {
  ['faq-q','faq-a','faq-cat'].forEach(i => document.getElementById(i).value = '');
  document.getElementById('faq-edit-id').value = '';
  openModal('faq-admin-modal');
};
window.saveFaq = async () => {
  const id = document.getElementById('faq-edit-id').value;
  const data = {
    question: document.getElementById('faq-q').value.trim(),
    answer: document.getElementById('faq-a').value.trim(),
    category: document.getElementById('faq-cat').value.trim(),
    updatedAt: serverTimestamp()
  };
  try {
    if (id) await updateDoc(doc(db, "faq", id), data);
    else await addDoc(collection(db, "faq"), data);
    showToast("FAQ saved!"); closeModal('faq-admin-modal');
  } catch(e) { showToast(e.message, 'error'); }
};
function loadFaq() {
  onSnapshot(collection(db, "faq"), snap => {
    let html = '';
    snap.forEach(d => {
      const data = d.data();
      html += `<tr>
        <td style="font-size:0.8rem;"><strong>${data.question}</strong></td>
        <td style="font-size:0.75rem;">${(data.answer || '').substring(0,50)}...</td>
        <td>${data.category || 'General'}</td>
        <td><div style="display:flex;gap:4px;">
          <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="deleteItem('faq','${d.id}')">🗑️</button>
        </div></td>
      </tr>`;
    });
    document.getElementById('faq-admin-body').innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:2rem;">No FAQs yet.</td></tr>';
  });
}

/* ── Site Config ── */
window.saveSiteConfig = async (type) => {
  let data = {};
  if (type === 'hod') {
    data = {
      hodName: document.getElementById('config-hod-name').value,
      hodRole: document.getElementById('config-hod-role').value,
      hodMsg: document.getElementById('config-hod-msg').value,
      hodImg: document.getElementById('config-hod-img').value
    };
  } else if (type === 'vision') {
    data = {
      vision: document.getElementById('config-vision').value,
      mission: document.getElementById('config-mission').value.split('\n').filter(l => l.trim())
    };
  }
  try {
    await setDoc(doc(db, "site_config", type), data, { merge: true });
    showToast("Site configuration updated!");
  } catch(e) { showToast(e.message, 'error'); }
};
async function loadSiteConfigData() {
  try {
    const hod = await getDoc(doc(db, "site_config", "hod"));
    if (hod.exists()) {
      const d = hod.data();
      document.getElementById('config-hod-name').value = d.hodName || '';
      document.getElementById('config-hod-role').value = d.hodRole || '';
      document.getElementById('config-hod-msg').value = d.hodMsg || '';
      document.getElementById('config-hod-img').value = d.hodImg || '';
    }
    const vis = await getDoc(doc(db, "site_config", "vision"));
    if (vis.exists()) {
      const d = vis.data();
      document.getElementById('config-vision').value = d.vision || '';
      document.getElementById('config-mission').value = (d.mission || []).join('\n');
    }
  } catch(e) { console.error(e); }
}

/* ── Global Delete ── */
window.deleteItem = function(collectionName, id) {
  showConfirm(async () => {
    try {
      if (collectionName.startsWith('local_')) {
        const type = collectionName.replace('local_','');
        let items = JSON.parse(localStorage.getItem('admin_'+type) || '[]');
        items = items.filter(i => i.id !== id);
        localStorage.setItem('admin_'+type, JSON.stringify(items));
        if (type === 'events') loadLocalEvents();
        if (type === 'projects') loadLocalProjects();
      } else {
        await deleteDoc(doc(db, collectionName, id));
      }
      showToast("Item deleted successfully");
    } catch(e) { showToast(e.message, 'error'); }
  });
};

/* ══════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════ */
function loadAnalytics() {
  // Total visits
  const visits = parseInt(localStorage.getItem('aiml_total_visits') || '0');
  setEl('stat-visits', visits);
  setEl('a-stat-visits', visits);

  // Today's visits
  const today = new Date().toDateString();
  const todayData = JSON.parse(localStorage.getItem('aiml_daily_visits') || '{}');
  const todayCount = todayData[today] || 0;
  setEl('a-stat-today', todayCount);

  // Section views
  const sectionViews = JSON.parse(localStorage.getItem('aiml_section_views') || '{}');
  const sectionNames = {
    'gndecb-leadership': 'Leadership',
    'gndecb-departments': 'Departments',
    'about': 'About AIML',
    'courses': 'Curriculum',
    'resources': 'Resources',
    'events': 'Events',
    'ai-tools': 'AI Tools',
    'profiles': 'Profiles',
    'cgpa': 'CGPA Calc',
    'projects': 'Projects',
    'contact': 'Contact'
  };

  let topSection = '—', topCount = 0;
  const chart = document.getElementById('section-analytics-chart');
  if (!chart) return;

  const sorted = Object.entries(sectionViews).sort((a,b) => b[1]-a[1]);
  const maxVal = sorted[0]?.[1] || 1;

  if (sorted.length === 0) {
    chart.innerHTML = `<div style="color:rgba(148,163,184,0.4); font-size:0.85rem; text-align:center; padding:1rem;">No section data yet. Views are tracked when users navigate sections.</div>`;
  } else {
    chart.innerHTML = sorted.map(([key, val]) => {
      const pct = Math.round((val / maxVal) * 100);
      const name = sectionNames[key] || key;
      if (val > topCount) { topCount = val; topSection = name; }
      return `<div class="analytics-bar-row">
        <div class="analytics-bar-label">${name}</div>
        <div class="analytics-bar-track"><div class="analytics-bar-fill" style="width:${pct}%"></div></div>
        <div class="analytics-bar-val">${val}</div>
      </div>`;
    }).join('');
  }

  setEl('stat-top-section', topSection);
  setEl('a-stat-top', topSection);

  // 7-day trend chart
  const trendChart = document.getElementById('visitors-chart');
  const trendLabels = document.getElementById('visitors-chart-labels');
  if (!trendChart) return;

  const trend7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const shortKey = d.toLocaleDateString('en', {weekday:'short'});
    trend7.push({ key, label: shortKey, count: todayData[key] || 0 });
  }

  const maxTrend = Math.max(...trend7.map(d => d.count), 1);
  trendChart.innerHTML = trend7.map(d => {
    const pct = Math.max(Math.round((d.count / maxTrend) * 100), 5);
    return `<div class="chart-bar-mini" style="height:${pct}%" title="${d.label}: ${d.count} visits"></div>`;
  }).join('');
  trendLabels.innerHTML = trend7.map(d => `<span>${d.label}</span>`).join('');
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function updateCount(id, count) {
  const el = document.getElementById(id);
  if (el) el.textContent = count;
}
function showNoFirebase(tbodyId, cols) {
  const el = document.getElementById(tbodyId);
  if (el) el.innerHTML = `<tr><td colspan="${cols}" style="text-align:center; padding:2rem; color:rgba(148,163,184,0.4)">Firebase not configured. Connect Firebase to see live data.<br><small>Local data (if any) shown below.</small></td></tr>`;
}

// Handle Enter key on login
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('al-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') window.adminLogin();
  });
});
