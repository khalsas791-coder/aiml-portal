// ═══════════════════════════════════════════════════════════
// AIRA CHATBOT v6.0 — Neural Intelligence Assistant
// Integrated chatbot + voice assistant
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 AIRA v6.0: Neural assistant online.');

    // ── BUILD UI ───────────────────────────────────────────
    const fab = document.createElement('button');
    fab.className = 'aira-fab';
    fab.id = 'aira-fab';
    fab.setAttribute('aria-label', 'Open AI Assistant');
    fab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
    document.body.appendChild(fab);

    const win = document.createElement('div');
    win.className = 'aira-window';
    win.id = 'aira-window';
    win.innerHTML = `
        <div class="aira-header">
            <div class="aira-header-info">
                <h3><span class="aira-status-dot"></span> Aira Assistant</h3>
                <p>AI-Powered • Online</p>
            </div>
            <button class="aira-close" id="aira-close">&times;</button>
        </div>
        <div class="aira-messages" id="aira-messages">
            <div class="chat-msg bot">
                Hello! I'm <strong>Aira</strong>, your intelligent guide for GNDECB's AIML department. Ask me about events, projects, admissions, or anything else! 🎓
            </div>
        </div>
        <div class="aira-input-area">
            <input type="text" class="aira-input" id="aira-input" placeholder="Ask Aira anything..." autocomplete="off">
            <button class="aira-send" id="aira-send" aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    `;
    document.body.appendChild(win);

    // ── TOGGLE LOGIC ───────────────────────────────────────
    const chatWin = document.getElementById('aira-window');
    const closeBtn = document.getElementById('aira-close');
    const input = document.getElementById('aira-input');
    const sendBtn = document.getElementById('aira-send');
    const messages = document.getElementById('aira-messages');

    fab.addEventListener('click', () => {
        const isOpen = chatWin.classList.contains('active');
        if (isOpen) {
            chatWin.classList.remove('active');
        } else {
            chatWin.classList.add('active');
            setTimeout(() => input.focus(), 300);
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWin.classList.remove('active');
    });

    // ── CHAT LOGIC ─────────────────────────────────────────
    const addMessage = (text, type) => {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        msg.innerHTML = text;
        messages.appendChild(msg);
        messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
        return msg;
    };

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        const loading = addMessage('<span style="opacity:0.6;">Thinking...</span>', 'bot');

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            // Remove loading
            loading.remove();

            // Format response — clean up markdown
            let reply = data.reply || 'Sorry, I could not process that.';
            reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            reply = reply.replace(/\n/g, '<br>');

            addMessage(reply, 'bot');
        } catch (e) {
            loading.remove();
            addMessage('⚠️ Unable to connect. Please try again later.', 'bot');
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ── QUICK ACTIONS ──────────────────────────────────────
    // Handle common navigation queries locally
    const navQuickResponses = {
        'home': '#hero',
        'about': '#about',
        'event': '#events',
        'project': '#projects',
        'achievement': '#achievements',
        'team': '#faculty',
        'faculty': '#faculty',
        'gallery': '#gallery',
        'contact': '#contact',
        'faq': '#faq',
    };

    // Override sendMessage to check for nav commands first
    const originalSend = sendMessage;
    // Quick nav is handled server-side via Gemini, keeping it simple
});
