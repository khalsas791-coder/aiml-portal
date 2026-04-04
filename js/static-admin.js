// js/static-admin.js — Static Site CMS Logic
// Controls all 15 "corners" by parsing index.html

const ADMIN_PASS = "GNDECB_AIML_2026"; // Secure local access
let siteDoc = null;
let currentHtml = "";

document.addEventListener('DOMContentLoaded', () => {
    // Check if previously logged in
    if(sessionStorage.getItem('admin_session') === 'true') {
        document.getElementById('login-overlay').style.display = 'none';
        initEditor();
    }
});

function checkAccess() {
    const pass = document.getElementById('admin-pass').value;
    if(pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_session', 'true');
        document.getElementById('login-overlay').style.display = 'none';
        showToast("Access Granted");
        initEditor();
    } else {
        alert("Invalid Passphrase.");
    }
}

async function initEditor() {
    try {
        // 1. Fetch current index.html
        const res = await fetch('index.html');
        currentHtml = await res.text();
        const parser = new DOMParser();
        siteDoc = parser.parseFromString(currentHtml, 'text/html');

        // 2. Clear loading
        document.getElementById('editor-forms').innerHTML = '';
        
        // 3. Build section forms
        buildSectionForm('hero', siteDoc.getElementById('gndecb-hero'));
        buildSectionForm('about', siteDoc.getElementById('about-gndecb'));
        buildSectionForm('aiml', siteDoc.getElementById('aiml-overview'));
        buildSectionForm('faculty', siteDoc.getElementById('faculty-v2'));
        buildSectionForm('courses', siteDoc.getElementById('courses'));
        buildSectionForm('achievements', siteDoc.getElementById('achievements-v2'));
        buildSectionForm('placements', siteDoc.getElementById('placements-v2'));
        buildSectionForm('facilities', siteDoc.getElementById('facilities-v2'));
        buildSectionForm('projects', siteDoc.getElementById('projects-v2'));
        buildSectionForm('resources', siteDoc.getElementById('resources-v2'));
        buildSectionForm('ai-tools', siteDoc.getElementById('ai-tools'));
        buildSectionForm('cgpa', siteDoc.getElementById('cgpa-v2'));
        buildSectionForm('events', siteDoc.getElementById('events-v2'));
        buildSectionForm('gallery', siteDoc.getElementById('gallery-v2'));
        buildSectionForm('faq', siteDoc.getElementById('faq-v2'));
        buildSectionForm('contact', siteDoc.getElementById('contact-v2'));
        buildGlobalForm();

        // Activate first tab
        toggleTab('hero');
        showToast("Site synced successfully");

    } catch(e) {
        console.error(e);
        document.getElementById('editor-forms').innerHTML = `<p style="color:red; text-align:center;">Failed to load index.html. Ensure you are running on a local server or host.</p>`;
    }
}

function buildSectionForm(id, container) {
    if(!container) {
        console.warn(`Section ${id} not found in index.html`);
        return;
    }

    const panel = document.createElement('div');
    panel.id = `panel-${id}`;
    panel.className = 'edit-panel';
    
    let html = `
        <h2 class="section-title">${id.toUpperCase()} Corner</h2>
        <p class="section-desc">Edit all textual and visual content for the ${id} area below.</p>
    `;

    // Strategy: Find all editable strings
    // 1. Title/Header
    const title = container.querySelector('.s2-title') || container.querySelector('h1') || container.querySelector('h2');
    const subtitle = container.querySelector('.s2-subtitle') || container.querySelector('p.hero-subtitle') || container.querySelector('.s2-eyebrow');
    
    if(title) {
        html += createField(id, 'Title', title.innerText, 'title');
    }
    if(subtitle) {
        html += createField(id, 'Subtitle / Slogan', subtitle.innerText, 'subtitle');
    }

    // 2. About/Body Text
    const desc = container.querySelector('.about-college-text p') || container.querySelector('.text-secondary') || container.querySelector('.section-desc');
    if(desc) {
        html += createField(id, 'Description Text', desc.innerText, 'desc', 'textarea');
    }

    // 3. Media
    const img = container.querySelector('img');
    if(img) {
        html += createField(id, 'Feature Image URL', img.getAttribute('src'), 'image');
    }

    panel.innerHTML = html;
    document.getElementById('editor-forms').appendChild(panel);
}

function buildGlobalForm() {
    const panel = document.createElement('div');
    panel.id = 'panel-global';
    panel.className = 'edit-panel';
    
    let html = `
        <h2 class="section-title">GLOBAL BRANDING</h2>
        <p class="section-desc">Manage site-wide identity across all sections.</p>
        <div class="form-group">
            <label>Master Website Title</label>
            <input type="text" id="global-title" value="${siteDoc.title}" oninput="updateGlobal('title')">
        </div>
        <div class="form-group">
            <label>Brand Logo Text (e.g. GNDECB)</label>
            <input type="text" id="global-brand" value="${siteDoc.querySelector('.logo-text').innerText}" oninput="updateGlobal('brand')">
        </div>
        <div class="form-group">
            <label>Footer Copyright</label>
            <input type="text" id="global-footer" value="${siteDoc.querySelector('footer p').innerText}" oninput="updateGlobal('footer')">
        </div>
    `;
    panel.innerHTML = html;
    document.getElementById('editor-forms').appendChild(panel);
}

function updateGlobal(key) {
    const val = document.getElementById(`global-${key}`).value;
    if(key === 'title') siteDoc.title = val;
    if(key === 'brand') siteDoc.querySelector('.logo-text').innerText = val;
    if(key === 'footer') siteDoc.querySelector('footer p').innerText = val;
}

function createField(sectionId, label, val, key, type = 'input') {
    const fieldId = `${sectionId}-${key}`;
    const tag = type === 'textarea' ? `<textarea id="${fieldId}" oninput="updateBuffer('${sectionId}', '${key}')">${val}</textarea>` : `<input type="${type}" id="${fieldId}" value="${val}" oninput="updateBuffer('${sectionId}', '${key}')">`;
    
    return `
        <div class="form-group">
            <label for="${fieldId}">${label}</label>
            ${tag}
        </div>
    `;
}

// Global Buffer to track changes
function updateBuffer(sectionId, key) {
    const val = document.getElementById(`${sectionId}-${key}`).value;
    const container = siteDoc.getElementById(getMappingId(sectionId));
    if(!container) return;

    if(key === 'title') {
        const el = container.querySelector('.s2-title') || container.querySelector('h1') || container.querySelector('h2');
        if(el) el.innerText = val;
    } else if(key === 'subtitle') {
        const el = container.querySelector('.s2-subtitle') || container.querySelector('p.hero-subtitle') || container.querySelector('.s2-eyebrow');
        if(el) el.innerText = val;
    } else if(key === 'desc') {
        const el = container.querySelector('.about-college-text p') || container.querySelector('.text-secondary') || container.querySelector('.section-desc');
        if(el) el.innerText = val;
    } else if(key === 'image') {
        const el = container.querySelector('img');
        if(el) el.setAttribute('src', val);
    }
}

function getMappingId(sid) {
    const map = {
        hero: 'gndecb-hero', about: 'about-gndecb', aiml: 'aiml-overview', faculty: 'faculty-v2',
        courses: 'courses', achievements: 'achievements-v2', placements: 'placements-v2',
        facilities: 'facilities-v2', projects: 'projects-v2', resources: 'resources-v2',
        'ai-tools': 'ai-tools', cgpa: 'cgpa-v2', events: 'events-v2', gallery: 'gallery-v2',
        faq: 'faq-v2', contact: 'contact-v2'
    };
    return map[sid] || sid;
}

// Tab Switching
document.getElementById('sidebar-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.sidebar-btn');
    if(!btn) return;
    
    const target = btn.getAttribute('data-target');
    toggleTab(target);
});

function toggleTab(id) {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.edit-panel').forEach(p => p.classList.remove('active'));
    
    const btn = document.querySelector(`.sidebar-btn[data-target="${id}"]`);
    const panel = document.getElementById(`panel-${id}`);
    
    if(btn) btn.classList.add('active');
    if(panel) panel.classList.add('active');
    
    document.getElementById('active-title').textContent = `${id.toUpperCase()} Corner Editor`;
}

// Export / Publish
function exportWebsite() {
    const serializer = new XMLSerializer();
    const htmlString = '<!DOCTYPE html>\n' + serializer.serializeToString(siteDoc);
    
    const blob = new Blob([htmlString], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    showToast("Downloaded Updated index.html");
}

function previewChanges() {
    const iframe = document.getElementById('preview-frame');
    const serializer = new XMLSerializer();
    const htmlString = serializer.serializeToString(siteDoc);
    
    const blob = new Blob([htmlString], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    
    // Enable Visual Mode after load
    iframe.onload = () => {
        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        idoc.body.contentEditable = "true";
        idoc.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('click', (e) => e.preventDefault());
        });
        showToast("Visual Mode Enabled — Type Directly to Edit!");
        
        // Sync back to siteDoc on any change
        idoc.addEventListener('input', () => {
            const parser = new DOMParser();
            siteDoc = parser.parseFromString(idoc.documentElement.innerHTML, 'text/html');
            // Sync form fields back if they exist
            syncFormsFromDoc();
        });
    };
}

function syncFormsFromDoc() {
    // Optional: Update sidebar form fields based on visual edits
}

function showToast(m) {
    const t = document.getElementById('toast');
    t.innerText = m;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
