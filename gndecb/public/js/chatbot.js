/* ============================================================
   AI CHATBOT — Gemini API + Smart FAQ fallback
   ============================================================ */

const CHATBOT_FAQ = {
  'notes': 'You can find all semester notes in the 📚 Student Resources section! We have notes for all 8 semesters covering AI, ML, Deep Learning, NLP, and more.',
  'cgpa': 'Use our ⚡ CGPA Calculator tool on this page! Just add your subjects, credits, and grades — it calculates your CGPA and grade in real-time.',
  'projects': 'Check out the 🗂️ Project Gallery section to see 9+ amazing student projects across AI, CV, NLP, Robotics, and Data Science domains.',
  'faculty': 'Our department has 8 highly qualified faculty members. Meet them all in the 👨‍🏫 Faculty section!',
  'events': 'Upcoming events include the AI Hackathon 2026, ML Workshop Series, and Annual Tech Fest. Check the 📅 Events section for details.',
  'admission': 'For admissions, contact us at admissions@aiml.edu or call +91-98765-43210 during working hours (9AM-5PM).',
  'syllabus': 'The complete 8-semester curriculum is available in the 📖 Courses section. It covers fundamentals to advanced AI/ML topics.',
  'placement': 'Our placement rate is 94%! Top recruiters include Google, Microsoft, Amazon, and 50+ startups. Average package: ₹8.5 LPA.',
  'lab': 'We have 3 state-of-the-art labs: AI Research Lab, Computer Vision Lab, and Deep Learning GPU Cluster with NVIDIA A100s.',
  'contact': 'Reach us at: 📧 info@aiml.edu | 📞 +91-98765-43210 | 📍 AI Block, Room 301, College Campus.',
  'fee': 'For fee structure details, please contact the admin office at admin@aiml.edu or visit the college website.',
  'research': 'Our faculty has 120+ research publications in top conferences like NeurIPS, ICML, CVPR, and ACL.',
  'tools': 'Check our 🛠️ AI Tools Hub section for links to ChatGPT, Gemini, Copilot, Hugging Face, Kaggle, Google Colab, and more!',
  'hello': 'Hello! 👋 I\'m AIRA — the AIML Department Assistant. I can help you with notes, CGPA calculation, events, faculty info, and more!',
  'hi': 'Hi there! 👋 I\'m AIRA, your AIML assistant. Ask me anything about the department, courses, projects, or events!',
};

const SYSTEM_PROMPT = `You are AIRA (AI Research Assistant), the official AI assistant for the AIML Department of a premier engineering college. Be concise, helpful, and enthusiastic about AI/ML topics.

Department Info:
- 500+ AIML students, 8 faculty members, 120+ research publications
- 94% placement rate, average package ₹8.5 LPA
- 3 labs: AI Research Lab, CV Lab, Deep Learning GPU Cluster
- Tools: Python, TensorFlow, PyTorch, Scikit-learn, OpenCV, HuggingFace
- Contact: info@aiml.edu | +91-98765-43210

Respond in 2-4 sentences max. Use relevant emojis. Be friendly and professional.`;

let chatHistory = [];
let apiKey = null;

function initChatbot() {
  const fab    = document.getElementById('chatbot-fab');
  const panel  = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close');
  const input  = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');

  if (!fab || !panel) return;

  // Toggle panel
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && chatHistory.length === 0) {
      setTimeout(() => addBotMessage(
        "👋 Hi! I'm **AIRA**, your AIML department assistant. Ask me about notes, CGPA, projects, events, faculty, placements, or anything AI/ML! 🧠"
      ), 400);
    }
    if (panel.classList.contains('open')) {
      document.getElementById('chatbot-badge')?.remove();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Send message
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    input.style.height = 'auto';
    processMessage(text);
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });
  }
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  chatHistory.push({ role: 'user', text });
  const el = document.createElement('div');
  el.className = 'chat-msg user';
  el.innerHTML = `<div class="chat-msg-bubble">${escapeHtml(text)}</div>`;
  msgs.appendChild(el);
  scrollToBottom(msgs);
}

function addBotMessage(text) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  chatHistory.push({ role: 'bot', text });
  const el = document.createElement('div');
  el.className = 'chat-msg bot';
  el.innerHTML = `
    <div class="chatbot-avatar" style="width:28px;height:28px;min-width:28px;font-size:14px">🤖</div>
    <div class="chat-msg-bubble">${renderMarkdown(text)}</div>
  `;
  msgs.appendChild(el);
  scrollToBottom(msgs);
}

function showTyping() {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return null;
  const el = document.createElement('div');
  el.className = 'chat-msg bot';
  el.id = 'typing-indicator';
  el.innerHTML = `
    <div class="chatbot-avatar" style="width:28px;height:28px;min-width:28px;font-size:14px">🤖</div>
    <div class="chat-msg-bubble" style="padding:8px 12px;">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  msgs.appendChild(el);
  scrollToBottom(msgs);
  return el;
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(6,182,212,0.12);padding:1px 5px;border-radius:4px;font-family:monospace">$1</code>')
    .replace(/\n/g, '<br>');
}

async function processMessage(text) {
  // FAQ check first (offline capable)
  const lowerText = text.toLowerCase();
  let faqAnswer = null;
  for (const [keyword, answer] of Object.entries(CHATBOT_FAQ)) {
    if (lowerText.includes(keyword)) { faqAnswer = answer; break; }
  }

  const typingEl = showTyping();
  await new Promise(r => setTimeout(r, faqAnswer ? 700 : 1200));
  removeTyping();

  if (faqAnswer) {
    addBotMessage(faqAnswer);
    return;
  }

  // Try Gemini API if key available
  if (apiKey) {
    try {
      const response = await callGeminiAPI(text);
      addBotMessage(response);
      return;
    } catch (err) {
      console.warn('Gemini API error:', err);
    }
  }

  // Smart fallback responses
  const fallbacks = [
    "That's a great question about AI/ML! 🧠 For detailed information, please check our department website sections or contact us at info@aiml.edu.",
    "I'm still learning! 🤖 For your query, I recommend checking the Student Resources section or connecting with our faculty. They'd be happy to help!",
    "Interesting question! While I don't have the exact answer, you can find more info in our 📚 Resources section or visit the department office.",
    "I'm your AIML assistant AIRA! 🎯 For comprehensive answers, try exploring our website sections — Notes, Projects, Faculty, and Tools Hub have lots of info!"
  ];
  addBotMessage(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
}

async function callGeminiAPI(userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const history = chatHistory.slice(-6).map(m => ({
    role: m.role === 'bot' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: history,
    generationConfig: { maxOutputTokens: 250, temperature: 0.8 }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
}

function setApiKey(key) {
  apiKey = key;
  localStorage.setItem('gemini_api_key', key);
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore API key from localStorage if exists
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) apiKey = savedKey;

  initChatbot();

  // Connect API key button if present
  const apiKeyBtn = document.getElementById('set-api-key-btn');
  if (apiKeyBtn) {
    apiKeyBtn.addEventListener('click', () => {
      const key = prompt('Enter your Gemini API key (get one free at https://aistudio.google.com):');
      if (key && key.trim()) {
        setApiKey(key.trim());
        window.showToast && showToast('Gemini API key set! AIRA is now powered by AI ✨', 'success');
      }
    });
  }
});
