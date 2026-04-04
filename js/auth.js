// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase config not set or invalid. Please update js/firebase-config.js");
}

let isLoginMode = true;
let currentUser = null;

// --- AUTH UI LOGIC ---
export function showLoginModal() {
  document.getElementById('auth-modal').classList.add('active');
  isLoginMode = true;
  updateAuthUI();
}
export function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  updateAuthUI();
}
function updateAuthUI() {
  const title = document.getElementById('auth-title');
  const btn = document.getElementById('auth-action-btn');
  const toggle = document.getElementById('auth-toggle-text');
  if(isLoginMode) {
    title.textContent = "Student Login";
    btn.textContent = "Login";
    toggle.textContent = "New student?";
  } else {
    title.textContent = "Student Signup";
    btn.textContent = "Sign Up";
    toggle.textContent = "Already have an account?";
  }
}
export async function handleAuth() {
  const email = document.getElementById('auth-email').value;
  const pwd = document.getElementById('auth-pwd').value;
  if(!email || !pwd) {
    if(window.showToast) showToast("Please fill all fields", "error");
    return;
  }
  if(!auth || firebaseConfig.apiKey === "YOUR_API_KEY") {
     if(window.showToast) showToast("Firebase not configured. Setup js/firebase-config.js", "error");
     return;
  }
  try {
    if(isLoginMode) {
      await signInWithEmailAndPassword(auth, email, pwd);
    } else {
      await createUserWithEmailAndPassword(auth, email, pwd);
    }
  } catch(err) {
    if(window.showToast) showToast(err.message, "error");
    else alert(err.message);
  }
}
async function onLoginSuccess() {
  document.getElementById('auth-modal').classList.remove('active');
  if(window.showToast) showToast("Logged in successfully!", "success");
  
  document.getElementById('auth-btn').style.display = 'none';
  document.getElementById('edit-profile-btn').style.display = 'inline-block';
  document.getElementById('logout-btn').style.display = 'inline-block';
  document.getElementById('upload-note-btn').style.display = 'inline-block';
  document.getElementById('upload-proj-init-btn').style.display = 'inline-block';

  // Fetch user profile for personalization
  if(currentUser && db) {
    try {
      const docSnap = await getDoc(doc(db, 'students', currentUser.uid));
      const data = docSnap.exists() ? docSnap.data() : {};
      const name = data.name || currentUser.displayName || currentUser.email.split('@')[0];
      const photoUrl = data.photo || null;
      // Fire personalization event
      window.dispatchEvent(new CustomEvent('aiml-user-login', {
        detail: { name, email: currentUser.email, photoUrl, uid: currentUser.uid }
      }));
    } catch(e) {
      const name = currentUser.displayName || currentUser.email.split('@')[0];
      window.dispatchEvent(new CustomEvent('aiml-user-login', {
        detail: { name, email: currentUser.email, photoUrl: null, uid: currentUser.uid }
      }));
    }
  }
}
export async function logout() {
  if(auth) await signOut(auth);
  currentUser = null;
  document.getElementById('auth-btn').style.display = 'inline-block';
  document.getElementById('edit-profile-btn').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('upload-note-btn').style.display = 'none';
  document.getElementById('upload-proj-init-btn').style.display = 'none';
  if(window.showToast) showToast("Logged out.", "info");
  // Fire logout event for personalization
  window.dispatchEvent(new CustomEvent('aiml-user-logout'));
}

// --- PROFILE LOGIC ---
export async function showEditModal() {
  document.getElementById('edit-profile-modal').classList.add('active');
  if(!auth || !currentUser) return;
  const docSnap = await getDoc(doc(db, "students", currentUser.uid));
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById('prof-name').value = data.name || '';
    document.getElementById('prof-role').value = data.role || '';
    document.getElementById('prof-skills').value = data.skills || '';
    document.getElementById('prof-linkedin').value = data.linkedin || '';
    document.getElementById('prof-projects').value = data.projects || '';
  }
}

function previewFile(input, previewElementId) {
  const file = input.files[0];
  const el = document.getElementById(previewElementId);
  if (!file || !el) return;
  if(file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      el.src = e.target.result;
      el.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else if (file.type === 'application/pdf') {
    el.textContent = `Selected: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
    el.style.display = 'block';
  }
}

async function convertFileToBase64(file, progressBarId) {
  if(!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const progBar = document.getElementById(progressBarId);
    if(progBar) progBar.style.width = '0%';
    
    reader.onprogress = (e) => {
      if(e.lengthComputable && progBar) {
        const progress = (e.loaded / e.total) * 100;
        progBar.style.width = progress + '%';
      }
    };
    
    reader.onload = (e) => {
      if(progBar) progBar.style.width = '100%';
      resolve(e.target.result); // This is the base64 data string
    };
    
    reader.onerror = (e) => reject("File reading failed");
    
    reader.readAsDataURL(file);
  });
}

export async function saveProfile() {
  if(!auth || !currentUser) return;
  const btn = document.getElementById('save-prof-btn');
  btn.textContent = "Saving...";
  btn.disabled = true;

  try {
    let resumeUrl = await convertFileToBase64(document.getElementById('prof-resume-file').files[0], 'prof-resume-prog') || null;
    let photoUrl = await convertFileToBase64(document.getElementById('prof-photo-file').files[0], 'prof-photo-prog') || null;

    const data = {
      name: document.getElementById('prof-name').value,
      role: document.getElementById('prof-role').value,
      skills: document.getElementById('prof-skills').value,
      email: currentUser.email,
      linkedin: document.getElementById('prof-linkedin').value,
      projects: document.getElementById('prof-projects').value,
      updatedAt: serverTimestamp()
    };
    
    // Only update url if a new file was uploaded, else keep old
    const oldDoc = await getDoc(doc(db, "students", currentUser.uid));
    if(oldDoc.exists()) {
      if(!resumeUrl && oldDoc.data().resume) resumeUrl = oldDoc.data().resume;
      if(!photoUrl && oldDoc.data().photo) photoUrl = oldDoc.data().photo;
    }
    if(resumeUrl) data.resume = resumeUrl;
    if(photoUrl) data.photo = photoUrl;

    await setDoc(doc(db, "students", currentUser.uid), data, { merge: true });
    if(window.showToast) showToast("Profile saved successfully!", "success");
    document.getElementById('edit-profile-modal').classList.remove('active');
  } catch(err) {
    if(window.showToast) showToast("Error saving profile: " + err.message, "error");
  } finally {
    btn.textContent = "Save Profile";
    btn.disabled = false;
  }
}

// --- PROJECT LOGIC ---
export function showProjModal() {
  document.getElementById('upload-proj-modal').classList.add('active');
}
export async function uploadProject() {
  if(!auth || !currentUser) return;
  const btn = document.getElementById('save-proj-btn');
  btn.textContent = "Uploading...";
  btn.disabled = true;

  try {
    const file = document.getElementById('proj-img-file').files[0];
    const photoUrl = await convertFileToBase64(file, 'proj-img-prog') || '';
    
    await addDoc(collection(db, "projects"), {
      userId: currentUser.uid,
      title: document.getElementById('proj-title').value,
      desc: document.getElementById('proj-desc').value,
      team: document.getElementById('proj-team').value,
      stack: document.getElementById('proj-stack').value,
      github: document.getElementById('proj-github').value,
      demo: document.getElementById('proj-demo').value,
      image: photoUrl,
      createdAt: serverTimestamp()
    });
    if(window.showToast) showToast("Project submitted!", "success");
    document.getElementById('upload-proj-modal').classList.remove('active');
    // Clear fields
    ['proj-title','proj-desc','proj-team','proj-stack','proj-github','proj-demo','proj-img-file'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('proj-img-prog').style.width = '0%';
  } catch(err) {
    if(window.showToast) showToast("Error uploading project", "error");
  } finally {
    btn.textContent = "Submit Project";
    btn.disabled = false;
  }
}

// --- NOTES LOGIC ---
export function showNoteModal() {
  document.getElementById('upload-note-modal').classList.add('active');
}
export async function uploadNote() {
  if(!auth || !currentUser) return;
  const file = document.getElementById('note-file').files[0];
  if(!file) {
    if(window.showToast) showToast("Please select a PDF file", "error");
    return;
  }
  const btn = document.getElementById('save-note-btn');
  btn.textContent = "Uploading...";
  btn.disabled = true;

  try {
    const fileUrl = await convertFileToBase64(file, 'note-prog');
    await addDoc(collection(db, "notes"), {
      userId: currentUser.uid,
      title: document.getElementById('note-title').value,
      subject: document.getElementById('note-subject').value,
      url: fileUrl,
      createdAt: serverTimestamp()
    });
    if(window.showToast) showToast("Note uploaded securely!", "success");
    document.getElementById('upload-note-modal').classList.remove('active');
    document.getElementById('note-title').value = '';
    document.getElementById('note-subject').value = '';
    document.getElementById('note-file').value = '';
    document.getElementById('note-prog').style.width = '0%';
  } catch(err) {
    if(window.showToast) showToast("Error uploading note", "error");
  } finally {
    btn.textContent = "Upload to Storage";
    btn.disabled = false;
  }
}

// --- REAL-TIME LISTENERS & RENDERERS ---
let notesListener = null;
let profileListener = null;
let projectListener = null;

function listenToCollections() {
  if(!auth || firebaseConfig.apiKey === "YOUR_API_KEY") return;
  
  // Profiles Listener
  profileListener = onSnapshot(collection(db, "students"), (snapshot) => {
    let html = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if(!data.name) return;
      const skillsHtml = (data.skills || '').split(',').map(s => s.trim() ? `<span class="tag tag-blue">${s.trim()}</span>` : '').join('');
      html += `
        <div class="card glass-strong text-center reveal hover-float">
          <img src="${data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`}" alt="${data.name}" style="width:100px; height:100px; border-radius:50%; margin:0 auto 1rem; border:3px solid var(--neon-cyan); background:#fff; object-fit:cover;" />
          <h3>${data.name}</h3>
          <p class="text-secondary text-sm mb-2">${data.role || ''}</p>
          <div class="flex flex-wrap" style="gap:0.5rem; justify-content:center; margin-bottom:1rem;">${skillsHtml}</div>
          <div style="display:flex; gap:0.5rem; justify-content:center;">
             ${data.email ? `<a href="mailto:${data.email}" class="btn btn-secondary btn-sm" style="padding:0.4rem;" title="Email">📧</a>` : ''}
             ${data.projects ? `<a href="${data.projects}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.4rem;" title="Projects">📁</a>` : ''}
             ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.4rem;" title="LinkedIn">🔗</a>` : ''}
             ${data.resume ? `<a href="${data.resume}" target="_blank" class="btn btn-secondary btn-sm" style="padding:0.4rem;" title="Resume">📄</a>` : ''}
          </div>
        </div>
      `;
    });
    const grid = document.getElementById('profiles-grid');
    if(html && grid) grid.innerHTML = html;
  });

  // Notes Listener
  const qNotes = query(collection(db, "notes"), orderBy("createdAt", "desc"));
  notesListener = onSnapshot(qNotes, (snapshot) => {
    let html = '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      html += `
        <div class="card resource-card reveal hover-float">
          <div class="resource-card-icon" style="background:rgba(59,130,246,.12);color:var(--neon-blue)">📄</div>
          <h3>${data.title}</h3>
          <p class="text-secondary text-sm" style="margin-bottom:0.8rem;">${data.subject}</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <a href="${data.url}" class="btn btn-secondary btn-sm" target="_blank" style="text-decoration:none;">👁 View PDF</a>
            <a href="${data.url}" download="${data.title || 'Note'}.pdf" class="btn btn-primary btn-sm" style="text-decoration:none;">⬇ Download</a>
          </div>
        </div>
      `;
    });
    if(html) {
      const grid = document.getElementById('notes-grid');
      // Keep static notes but update dynamic ones
      const statics = `
        <div class="card resource-card reveal"><div class="resource-card-icon" style="background:rgba(59,130,246,.12);color:var(--neon-blue)">📘</div><h3>Machine Learning — Sem 5 Notes</h3><div class="resource-download-btn">⬇ Download PDF →</div></div>
      `;
      if(grid) grid.innerHTML = html + statics;
    }
  });

  // Projects Listener
  const qProj = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  projectListener = onSnapshot(qProj, (snapshot) => {
    window.FIREBASE_PROJECTS = [];
    snapshot.forEach((docSnap) => {
      const p = docSnap.data();
      window.FIREBASE_PROJECTS.push({
         id: 'fb_' + docSnap.id,
         name: p.title || 'Untitled',
         desc: p.desc || '',
         category: 'Firebase', 
         team: p.team || '',
         stack: (p.stack || '').split(',').map(s=>s.trim()).filter(Boolean),
         github: p.github || '',
         demo: p.demo || '',
         image: p.image || '',
         year: p.createdAt ? new Date(p.createdAt.toDate()).getFullYear() : new Date().getFullYear()
      });
    });
    if(window.renderProjects) {
       window.renderProjects();
    }
  });
}

// Bind auth listener
if(auth && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      onLoginSuccess();
    } else {
      logout();
    }
  });
  listenToCollections();
} else {
  console.log("Waiting for user to supply API keys in firebase-config.js. Features disabled.");
}

window.auth = {
  showLoginModal,
  toggleAuthMode,
  handleAuth,
  logout,
  showEditModal,
  saveProfile,
  showNoteModal,
  uploadNote,
  showProjModal,
  uploadProject,
  previewFile
};
