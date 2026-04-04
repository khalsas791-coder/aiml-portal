// js/aira-chatbot.js — Neural Assistant Interface v1.0
// High-fidelity, interactive floating chatbot for the AIML Hub

class AiraChatbot {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        // Create UI
        const fab = document.createElement('div');
        fab.className = 'aira-fab';
        fab.innerHTML = '<i data-lucide="message-square"></i>';
        
        const window = document.createElement('div');
        window.className = 'aira-window glass-panel glow-border';
        window.innerHTML = `
            <div class="aira-header">
                <span>🤖 AIRA NEURAL ASSISTANT</span>
                <i data-lucide="x" style="cursor:pointer;" id="close-aira"></i>
            </div>
            <div class="aira-chat" id="aira-chat-feed">
                <div class="msg aira">Hello! I am AIRA, the department's Neural Assistant. How can I assist you with your research or queries today?</div>
            </div>
            <div class="aira-input">
                <input type="text" id="aira-msg-input" placeholder="Type a message or command...">
                <button class="btn-ultra" id="send-aira" style="padding: 0 1rem; height: 100%; border:none;">Send</button>
            </div>
        `;

        document.body.appendChild(fab);
        document.body.appendChild(window);

        // Events
        fab.addEventListener('click', () => this.toggle());
        document.getElementById('close-aira').addEventListener('click', () => this.toggle());
        document.getElementById('send-aira').addEventListener('click', () => this.send());
        document.getElementById('aira-msg-input').addEventListener('keypress', (e) => {
            if(e.key === 'Enter') this.send();
        });

        lucide.createIcons();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        document.querySelector('.aira-window').style.display = this.isOpen ? 'flex' : 'none';
    }

    send() {
        const input = document.getElementById('aira-msg-input');
        const feed = document.getElementById('aira-chat-feed');
        const text = input.value.trim();

        if(!text) return;

        // User Msg
        const uMsg = document.createElement('div');
        uMsg.className = 'msg user';
        uMsg.innerText = text;
        feed.appendChild(uMsg);
        input.value = '';

        // Response Logic (Simulated Intelligence)
        setTimeout(() => {
            const rMsg = document.createElement('div');
            rMsg.className = 'msg aira';
            rMsg.innerText = this.getResponse(text);
            feed.appendChild(rMsg);
            feed.scrollTop = feed.scrollHeight;
        }, 800);
    }

    getResponse(text) {
        text = text.toLowerCase();
        if(text.includes('about')) return "GNDECB Bidar, established in 1980, is an autonomous AI excellence hub. We started the AIML branch in 2021.";
        if(text.includes('placement')) return "Our graduates maintain a 96% placement rate with top packages reaching 45.0 LPA.";
        if(text.includes('lab')) return "Our Neural Labs are powered by NVIDIA hardware and are dedicated to Generative AI research.";
        return "Acknowledged! I have synced your query to the department's neural core. How else can I help?";
    }
}

document.addEventListener('DOMContentLoaded', () => new AiraChatbot());
