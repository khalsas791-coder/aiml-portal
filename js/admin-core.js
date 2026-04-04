// js/admin-core.js — Enterprise Neural Orchestrator v4.0
// Universal CRUD logic for 11+ portal sections via Firebase Firestore

import { db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const COMMAND_KEY = "GNDECB_AIML_2026";
let activeCol = 'faculty';

document.addEventListener('DOMContentLoaded', () => {
    if(sessionStorage.getItem('console_access') === 'true') {
        initAdmin();
    }
    lucide.createIcons();
});

function accessConsole() {
    const p = document.getElementById('console-pass').value;
    if(p === COMMAND_KEY) {
        sessionStorage.setItem('console_access', 'true');
        document.getElementById('login-barrier').style.display='none';
        initAdmin();
    } else { alert("Command rejected by Neural Security."); }
}

async function initAdmin() {
    document.getElementById('login-barrier').style.display = 'none';
    
    // Tab Management
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

async function syncAdminList() {
    const area = document.getElementById('module-list-area');
    area.innerHTML = `<div align="center" style="padding: 5rem; opacity:0.3;">Retrieving ${activeCol.toUpperCase()} Neural Matrix...</div>`;

    try {
        const snap = await getDocs(collection(db, activeCol));
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3rem;">
                <h2 style="font-family:'Outfit'; font-size:1.8rem; text-transform:uppercase;">${activeCol} Hub</h2>
                <button class="btn-publish" onclick="showCreateForm()">+ Add Neural Node</button>
            </div>
            <table>
                <thead><tr><th>Identity</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
        `;

        if(snap.empty) {
            html += `<tr><td colspan="3" align="center" style="padding: 5rem; opacity:0.5;">No active nodes found in this sector.</td></tr>`;
        } else {
            snap.forEach(d => {
                const data = d.data();
                html += `
                    <tr>
                        <td style="font-weight:800;">${data.name || data.title || 'Untitled Node'}</td>
                        <td><span class="badge">SYCHRONIZED</span></td>
                        <td>
                            <button style="background:none; border:none; color:#ef4444; cursor:pointer;" onclick="deleteNode('${d.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table>`;
        area.innerHTML = html;

    } catch(e) {
        area.innerHTML = `<div align="center" style="padding:5rem; color:#ef4444;">Neural Sync Failure: ${e.message}</div>`;
    }
}

async function deleteNode(id) {
    if(!confirm("Are you sure? This action is irreversible.")) return;
    try {
        await deleteDoc(doc(db, activeCol, id));
        showToast("Neural Node Vaporized.");
        syncAdminList();
    } catch(e) { alert("Failed to delete node."); }
}

function showCreateForm() {
    const area = document.getElementById('module-list-area');
    area.innerHTML = `
        <h2 style="margin-bottom: 3rem;">Provision New Neural Node</h2>
        <div class="glass-panel" style="padding: 40px;">
            <div class="form-group"><label>Identity Label (Name/Title)</label><input type="text" id="new-name"></div>
            <div class="form-group"><label>Neural Context (Description/Bio)</label><textarea id="new-desc"></textarea></div>
            <div class="form-group"><label>Neural Image Uplink (URL)</label><input type="text" id="new-image"></div>
            <div style="display:flex; gap:1.5rem; margin-top:3rem;">
                <button class="btn-publish" onclick="commitNewNode()">Commit to Hub</button>
                <button class="btn-publish" style="background:rgba(255,255,255,0.05); color:#fff;" onclick="syncAdminList()">Abort</button>
            </div>
        </div>
    `;
}

async function commitNewNode() {
    const name = document.getElementById('new-name').value;
    const desc = document.getElementById('new-desc').value;
    const image = document.getElementById('new-image').value;

    if(!name || !desc) return alert("Missing required Neural data.");

    try {
        await addDoc(collection(db, activeCol), {
            name: name,
            title: name,
            desc: desc,
            text: desc,
            image: image,
            synced_at: new Date().toISOString()
        });
        showToast("Neural Node Committed Successfully.");
        syncAdminList();
    } catch(e) { alert("Commit Failed."); }
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
window.commitNewNode = commitNewNode;
window.syncAdminList = syncAdminList;
