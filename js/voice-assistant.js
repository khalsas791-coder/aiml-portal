/* js/voice-assistant.js */
document.addEventListener('DOMContentLoaded', () => {
    const voiceFab = document.getElementById('voice-fab');
    if (!voiceFab) return;

    const apiKey = "AIzaSyCsWk0yH89b4dwwjsJAUCX7cIzk93H-W4Q";
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        voiceFab.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    let isListening = false;
    const synth = window.speechSynthesis;

    function speak(text) {
        if(synth.speaking) synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        utter.voice = voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')) || voices[0];
        utter.pitch = 1.1;
        utter.rate = 1.0;
        synth.speak(utter);
    }

    async function handleCommand(transcript) {
        const text = transcript.toLowerCase();
        
        // 1. Direct Keyword Check (Fast Path)
        const navMap = {
            'home': 'hero', 'about': 'about', 'faculty': 'faculty', 'team': 'faculty',
            'project': 'projects', 'event': 'events', 'stat': 'stats', 'placement': 'stats',
            'lab': 'facilities', 'note': 'notes', 'partner': 'industry', 'gallery': 'gallery',
            'research': 'research', 'faq': 'faq', 'contact': 'contact'
        };

        for(let key in navMap) {
            if(text.includes(key)) {
                const target = document.getElementById(navMap[key]);
                if(target) {
                    target.scrollIntoView({behavior: 'smooth'});
                    speak(`Navigating to the ${key} section.`);
                    if(window.showToast) showToast(`Syncing Viewport: ${key.toUpperCase()}`, 'success');
                    return;
                }
            }
        }

        // 2. Intelligent AI Path (for complex queries)
        speak("Processing your request with AIRA Intelligence.");
        if(window.showToast) showToast("Neural Processing...", "info");
        
        try {
            const aiResponse = await callGemini(text);
            speak(aiResponse);
            
            // Check if AI suggested a section in its response
            for(let key in navMap) {
                if(aiResponse.toLowerCase().includes(key)) {
                    document.getElementById(navMap[key])?.scrollIntoView({behavior: 'smooth'});
                    break;
                }
            }
        } catch(e) {
            speak("Sorry, I am having trouble connecting to the neural core.");
        }
    }

    async function callGemini(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const body = {
            contents: [{ parts: [{ text: `You are AIRA, the Voice Assistant for GNDECB AIML. Provide a extremely short, 1-sentence response. Prompt: ${prompt}` }] }]
        };
        const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    }

    voiceFab.addEventListener('click', () => {
        if (isListening) { recognition.stop(); return; }
        try { recognition.start(); } catch(e) {}
    });

    recognition.onstart = () => {
        isListening = true;
        voiceFab.style.background = '#ef4444';
        if(window.showToast) showToast("Voice Link Active. Speak now...", "info");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(window.showToast) showToast(`Intel Received: "${transcript}"`, "info");
        handleCommand(transcript);
    };

    recognition.onend = () => {
        isListening = false;
        voiceFab.style.background = 'var(--neon-cyan)';
    };

    recognition.onerror = (event) => {
        isListening = false;
        voiceFab.style.background = 'var(--neon-cyan)';
        if(event.error !== 'no-speech' && window.showToast) showToast("Neural Link Error: " + event.error, "error");
    };
});
