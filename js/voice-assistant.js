/* js/voice-assistant.js */

document.addEventListener('DOMContentLoaded', () => {
  const voiceFab = document.getElementById('voice-fab');
  if (!voiceFab) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    voiceFab.style.display = 'none';
    console.warn("Speech Recognition API not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let isListening = false;

  const synth = window.speechSynthesis;
  function speak(text) {
    if(synth.speaking) {
       synth.cancel();
    }
    const utterThis = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a natural feeling voice
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en-') && v.name.toLowerCase().includes('female')) || voices[0];
    if(voice) utterThis.voice = voice;
    
    utterThis.pitch = 1.1;
    utterThis.rate = 1.0;
    synth.speak(utterThis);
  }

  // Pre-load voices if necessary
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => synth.getVoices();
  }

  function handleCommand(transcript) {
    const text = transcript.toLowerCase();
    let handled = false;

    // Define navigation mappings
    const navMap = [
      { keywords: ['home', 'hero', 'top'], target: 'gndecb-hero', speech: 'Taking you to the home section.' },
      { keywords: ['leadership', 'director', 'hod'], target: 'gndecb-leadership', speech: 'Here is the leadership section.' },
      { keywords: ['department', 'departments'], target: 'gndecb-departments', speech: 'Showing the departments.' },
      { keywords: ['about'], target: 'about', speech: 'Here is information about the AIML department.' },
      { keywords: ['curriculum', 'course', 'syllabus'], target: 'courses', speech: 'Here is the 8-semester curriculum.' },
      { keywords: ['note', 'resource', 'download'], target: 'resources', speech: 'Opening student resources and notes.' },
      { keywords: ['tool', 'chatgpt', 'image generator', 'explain code'], target: 'ai-tools', speech: 'Opening the AI tools hub.' },
      { keywords: ['cgpa', 'calculator', 'grade'], target: 'cgpa', speech: 'Opening the CGPA calculator.' },
      { keywords: ['project', 'showcase'], target: 'projects', speech: 'Here are the student projects.' },
      { keywords: ['contact'], target: 'contact', speech: 'Here is our contact information.' },
      { keywords: ['event', 'workshop', 'hackathon'], target: 'events', speech: 'Showing upcoming events and workshops.' },
      { keywords: ['profile', 'student profile'], target: 'profiles', speech: 'Opening student profiles.' }
    ];

    for (const item of navMap) {
      if (item.keywords.some(kw => text.includes(kw))) {
        // Find corresponding tab button and click it to trigger navigation
        const tabBtn = document.querySelector(`.section-tab[data-target="${item.target}"]`);
        if (tabBtn) {
          tabBtn.click();
          speak(item.speech);
          if(window.showToast) showToast(`Navigating: ${item.speech}`, 'success');
          handled = true;
          break;
        } else if (item.target === 'gndecb-hero') {
           // Home scroll fallback
           window.scrollTo({top: 0, behavior:'smooth'});
           speak(item.speech);
           handled = true;
           break;
        }
      }
    }

    if (!handled) {
      // General feedback if command not mapped
      if(text.includes('hello') || text.includes('hi')) {
         speak("Hello! I am AIRA, your assistant. How can I help you today?");
      } else {
         speak("Sorry, I didn't recognize that command. Try saying 'open projects' or 'show notes'.");
      }
    }
  }

  voiceFab.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch(e) {
      console.warn('Speech recognition start failed', e);
    }
  });

  recognition.onstart = function() {
    isListening = true;
    // Visual cue
    voiceFab.style.background = '#ef4444'; // Red listening
    voiceFab.querySelector('.chatbot-pulse').style.borderColor = '#ef4444';
    if(window.showToast) showToast("Listening... Speak now 🎤", "info");
  };

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if(window.showToast) showToast(`You said: "${transcript}"`, "info");
    handleCommand(transcript);
  };

  recognition.onspeechend = function() {
    recognition.stop();
  };

  recognition.onend = function() {
    isListening = false;
    // Reset Visual cue
    voiceFab.style.background = 'var(--neon-purple)';
    voiceFab.querySelector('.chatbot-pulse').style.borderColor = 'var(--neon-purple)';
  };

  recognition.onerror = function(event) {
    if (event.error !== 'no-speech') {
        if(window.showToast) showToast("Microphone focus lost: " + event.error, "error");
    }
    isListening = false;
    voiceFab.style.background = 'var(--neon-purple)';
    voiceFab.querySelector('.chatbot-pulse').style.borderColor = 'var(--neon-purple)';
  };
});
