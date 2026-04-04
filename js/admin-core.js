// js/admin-core.js — Enterprise Neural Orchestrator v4.1
// Full-scale CRUD for 15+ portal sectors at GNDECB Bidar

import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, getCountFromServer } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const COMMAND_KEY = "GNDECB_AIML_2026";
let activeCol = 'faculty';

document.addEventListener('DOMContentLoaded', () => {
    const access = sessionStorage.getItem('console_access');
    if(access === 'true') initAdmin();
    lucide.createIcons();
});

async function accessConsole() {
    const p = document.getElementById('console-pass').value;
    if(p === COMMAND_KEY) {
        sessionStorage.setItem('console_access', 'true');
        document.getElementById('login-barrier').style.display='none';
        initAdmin();
    } else { alert("Command rejected by Neural Security."); }
}

async function initAdmin() {
    document.getElementById('login-barrier').style.display = 'none';
    
    // 1. SYNC ANALYTICS
    await syncAnalytics();

    // 2. TAB ORCHESTRATION
    document.querySelectorAll('.adm-btn').forEach(btn => {
        btn.onclick = () => {
            const col = btn.getAttribute('data-tab');
            activeCol = col;
            document.querySelectorAll('.adm-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            syncAdminList();
        };
    });

    syncAdminList();
}

async function syncAnalytics() {
    const stats = ['faculty', 'projects', 'notices', 'calendar'];
    const area = document.getElementById('analytics-grid');
    if(!area) return;

    area.innerHTML = "";
    for(const col of stats) {
        const snap = await getCountFromServer(collection(db, col));
        const count = snap.data().count;
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.5rem';
        card.innerHTML = `<h3 style="color:var(--neon-cyan);">${count}</h3><p style="font-size:0.7rem; opacity:0.5;">${col.toUpperCase()} Nodes</p>`;
        area.appendChild(card);
    }
}

async function syncAdminList() {
    const area = document.getElementById('module-list-area');
    area.innerHTML = `<div align="center" style="padding: 5rem; opacity:0.3;">Synchronizing Sector: ${activeCol.toUpperCase()}...</div>`;

    try {
        const snap = await getDocs(collection(db, activeCol));
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3rem;">
                <h2 style="font-family:'Outfit'; text-transform:uppercase;">${activeCol} Master Hub</h2>
                <button class="btn-ultra" onclick="showCreateForm()" style="padding: 0.8rem 1.5rem; font-size: 0.8rem;">+ Provision Node</button>
            </div>
            <table>
                <thead><tr><th>Identity</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
        `;

        if(snap.empty) {
            html += `<tr><td colspan="3" align="center" style="padding: 5rem; opacity:0.3;">Sector is currently empty. Provisioning required.</td></tr>`;
        } else {
            snap.forEach(d => {
                const data = d.data();
                html += `
                    <tr>
                        <td style="font-weight:800;">${data.name || data.title || data.event || 'Untitled'}</td>
                        <td><span class="badge">SYNCED</span></td>
                        <td>
                            <button style="background:none; border:none; color:#ef4444; cursor:pointer;" onclick="deleteNode('${d.id}')">Decommission</button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table>`;
        area.innerHTML = html;
        lucide.createIcons();

    } catch(e) { area.innerHTML = `<div align="center; padding:5rem; color:#ef4444;">Neural Sync Failure. Check configuration.</div>`; }
}

async function deleteNode(id) {
    if(!confirm("Are you sure? This node will be purged from the neural repository.")) return;
    try {
        await deleteDoc(doc(db, activeCol, id));
        showToast(`Node ${id} Purged.`);
        syncAdminList();
        syncAnalytics();
    } catch(e) { alert("Wipe Failed."); }
}

function showCreateForm() {
    const area = document.getElementById('module-list-area');
    area.innerHTML = `
        <h2 style="margin-bottom: 3rem;">Provision New Sector Data (${activeCol.toUpperCase()})</h2>
        <div class="glass-panel" style="padding: 40px; border-radius: 20px;">
            <div class="form-group"><label>Label / Title</label><input type="text" id="node-label"></div>
            <div class="form-group"><label>Context / Content</label><textarea id="node-content"></textarea></div>
            <div class="form-group"><label>Image / Media URL</label><input type="text" id="node-media"></div>
            <div style="display:flex; gap:1.5rem; margin-top:3rem;">
                <button class="btn-ultra" onclick="commitNode()" style="padding: 1rem 2rem;">Commit to Cloud</button>
                <button class="btn-ultra" style="background:rgba(255,255,255,0.05); color:#fff; padding: 1rem 2rem;" onclick="syncAdminList()">Abort</button>
            </div>
        </div>
    `;
}

async function commitNode() {
    const label = document.getElementById('node-label').value;
    const content = document.getElementById('node-content').value;
    const media = document.getElementById('node-media').value;

    if(!label || !content) return alert("All contextual fields required.");

    try {
        const payload = {
            timestamp: serverTimestamp(),
            synced_at: new Date().toISOString()
        };

        if(activeCol === 'calendar') {
            payload.event = label; payload.day = content; payload.month = media || 'APR';
        } else if(activeCol === 'notices') {
            payload.title = label; payload.content = content;
        } else {
            payload.name = label; payload.title = label; payload.desc = content; payload.text = content; payload.image = media;
        }

        await addDoc(collection(db, activeCol), payload);
        showToast("Neural Sector Synchronized Successfully.");
        syncAdminList();
        syncAnalytics();
    } catch(e) { alert("Sync Failed."); }
}

function showToast(m) {
    const t = document.getElementById('toast');
    t.innerText = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Global expose
window.accessConsole = accessConsole;
window.deleteNode = deleteNode;
window.showCreateForm = showCreateForm;
window.commitNode = commitNode;
window.syncAdminList = syncAdminList;
