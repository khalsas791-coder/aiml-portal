// js/static-admin.js — Enterprise Node Orchestrator v4.0
// Logic for handling the 15+ corners of GNDECB AIML in a SaaS interface

const COMMAND_KEY = "GNDECB_AIML_2026";
let siteDoc = null;
let currentHtml = "";

document.addEventListener('DOMContentLoaded', () => {
    // Check Session
    if(sessionStorage.getItem('console_access') === 'true') {
        document.getElementById('login-barrier').style.opacity = '0';
        setTimeout(() => document.getElementById('login-barrier').style.display = 'none', 400);
        initConsole();
    }
    lucide.createIcons();
});

function accessConsole() {
    const pass = document.getElementById('console-pass').value;
    if(pass === COMMAND_KEY) {
        sessionStorage.setItem('console_access', 'true');
        document.getElementById('login-barrier').style.display = 'none';
        showToast("Authentication Successful");
        initConsole();
    } else {
        alert("Command key rejected.");
    }
}

async function initConsole() {
    // 1. Module Orchestration
    initTabs();
    
    // 2. Fetch & Sync index.html
    try {
        const res = await fetch('index.html');
        currentHtml = await res.text();
        const parser = new DOMParser();
        siteDoc = parser.parseFromString(currentHtml, 'text/html');
        
        // Populate Content Sidebar
        initContentHub();
        
    } catch(e) {
        console.error("Critical Sync Failure:", e);
    }

    // 3. Render Analytics (Chart.js)
    initAnalytics();

    // 4. Populate Users
    initUserMatrix();
}

function initTabs() {
    document.querySelectorAll('.adm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            // UI Toggle
            document.querySelectorAll('.adm-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.adm-module').forEach(m => m.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`module-${tab}`).classList.add('active');
            document.getElementById('active-module-title').innerText = tab.toUpperCase();
        });
    });
}

function initAnalytics() {
  const ctx = document.getElementById('analyticsChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Current'],
      datasets: [{
        label: 'Neural Hub Traversal (Visits)',
        data: [1200, 2500, 4800, 12492, 9800, 14000, 12492],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function initContentHub() {
    const sidebar = document.getElementById('content-sidebar');
    const sections = [
        {id: 'hero', name: '🚀 Hero Platform'},
        {id: 'about', name: '🏛 Heritage Aware'},
        {id: 'department', name: '🤖 Dept. Architecture'},
        {id: 'experience', name: '✨ AI Experience'},
        {id: 'pathway', name: '🌌 Future Pipeline'},
        {id: 'innovation', name: '🏆 Merit Matrix'},
        {id: 'gallery', name: '🖼 Visual Array'}
    ];

    sidebar.innerHTML = sections.map(s => `
        <button class="adm-btn" style="padding: 1rem; font-size: 0.8rem; border-left: 2px solid transparent;" onclick="editSection('${s.id}')">
            ${s.name}
        </button>
    `).join('');
}

function editSection(id) {
    const area = document.getElementById('content-form-area');
    const target = siteDoc.getElementById(getMappingId(id));
    
    if(!target) {
        area.innerHTML = `<div style="padding: 3rem; text-align:center;">Section logic not found in index.html</div>`;
        return;
    }

    // Enhanced Form Generation
    let html = `<h2 style="font-family:'Outfit'; font-size:1.5rem; margin-bottom: 2rem;">Synchronizing: ${id.toUpperCase()}</h2>`;
    
    const title = target.querySelector('.gradient-text') || target.querySelector('h1') || target.querySelector('h2');
    const subtitle = target.querySelector('.hero-subtitle') || target.querySelector('p.text-secondary');
    
    if(title) {
        html += createField(id, 'Core Identity (Header)', title.innerText, 'title');
    }
    if(subtitle) {
        html += createField(id, 'Neural Context (Subheader)', subtitle.innerText, 'subtitle', 'textarea');
    }

    html += `<button class="btn-publish" style="margin-top: 3rem;" onclick="showToast('Section Buffered')">Buffer Changes</button>`;
    area.innerHTML = html;
}

function createField(sid, label, val, key, type='input') {
    const fid = `field-${sid}-${key}`;
    const tag = type === 'textarea' ? `<textarea id="${fid}" oninput="syncToSite('${sid}', '${key}')">${val}</textarea>` : `<input type="${type}" id="${fid}" value="${val}" oninput="syncToSite('${sid}', '${key}')">`;
    return `<div class="form-group"><label>${label}</label>${tag}</div>`;
}

function syncToSite(sid, key) {
    const val = document.getElementById(`field-${sid}-${key}`).value;
    const target = siteDoc.getElementById(getMappingId(sid));
    if(!target) return;

    if(key === 'title') {
        const el = target.querySelector('.gradient-text') || target.querySelector('h1') || target.querySelector('h2');
        if(el) el.innerText = val;
    } else if(key === 'subtitle') {
        const el = target.querySelector('.hero-subtitle') || target.querySelector('p.text-secondary');
        if(el) el.innerText = val;
    }
}

function getMappingId(sid) {
    return sid === 'hero' ? 'hero' : (sid === 'about' ? 'about' : sid);
}

function initUserMatrix() {
    const users = [
        {name: 'Admin_Lead', status: 'Authorized', role: 'Superuser', last: '2 mins ago'},
        {name: 'Student_0X92', status: 'Synchronized', role: 'Architect', last: '1 hour ago'},
        {name: 'Dean_GNDECB', status: 'Authorized', role: 'Viewer', last: 'Yesterday'}
    ];
    document.getElementById('user-rows').innerHTML = users.map(u => `
        <tr>
            <td style="font-weight:700;">${u.name}</td>
            <td><span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">Online</span></td>
            <td>${u.role}</td>
            <td style="opacity:0.5;">${u.last}</td>
            <td><button style="background:none; border:none; color: #ef4444; cursor:pointer;" onclick="showToast('Action Blocked: Level 5 privilege required')">Suspend</button></td>
        </tr>
    `).join('');
}

function triggerSnapshot() {
    const serializer = new XMLSerializer();
    const htmlString = '<!DOCTYPE html>\n' + serializer.serializeToString(siteDoc);
    const blob = new Blob([htmlString], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'index.html'; a.click();
    showToast("Snapshot Exported Successfully");
}

function showToast(m) {
    const t = document.getElementById('toast');
    t.innerText = m;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
