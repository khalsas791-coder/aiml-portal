/* ============================================================
   AI TOOLS HUB — OpenAI Integrations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('openai-key-input');
  const saveKeyBtn = document.getElementById('save-openai-key-btn');

  // Load existing key if any
  const savedKey = localStorage.getItem('openai_api_key');
  if (savedKey && apiKeyInput) {
    apiKeyInput.value = savedKey;
  }

  // Save key
  if (saveKeyBtn && apiKeyInput) {
    saveKeyBtn.addEventListener('click', () => {
      const val = apiKeyInput.value.trim();
      if (val) {
        localStorage.setItem('openai_api_key', val);
        // Also update chatbot if it's already running
        if (typeof setApiKey === 'function') setApiKey(val);
        window.showToast && showToast('OpenAI API key saved! Tools are now unlocked 🔓', 'success');
      } else {
        localStorage.removeItem('openai_api_key');
        if (typeof setApiKey === 'function') setApiKey(null);
        window.showToast && showToast('OpenAI API key removed.', 'info');
      }
    });
  }

  function getApiKey() {
    const key = localStorage.getItem('openai_api_key');
    if (!key) {
      window.showToast && showToast('Please enter your OpenAI API key first!', 'error');
      const input = document.getElementById('openai-key-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return key;
  }

  // Common UI states
  function setLoading(btn, outputDiv, isImage = false) {
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = 'Generating... ⏳';
    outputDiv.style.display = 'flex';
    if(isImage) {
        outputDiv.innerHTML = '<div style="color:white; padding: 2rem;">Generating Image...</div>';
    } else {
        outputDiv.innerHTML = '<span style="color:var(--text-secondary);">Generating response...</span>';
    }
    return () => {
      btn.disabled = false;
      btn.textContent = origText;
    };
  }

  // 1. Image Generator
  document.getElementById('btn-ai-image')?.addEventListener('click', async (e) => {
    const key = getApiKey();
    if (!key) return;
    const prompt = document.getElementById('ai-image-prompt').value.trim();
    if (!prompt) return window.showToast && showToast('Please enter a description.', 'error');

    const btn = e.target;
    const out = document.getElementById('out-ai-image');
    const resetUser = setLoading(btn, out, true);

    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const imgUrl = data.data?.[0]?.url;
      if (imgUrl) {
        out.innerHTML = `<img src="${imgUrl}" alt="Generated Image" style="width:100%; height:auto; display:block;" />`;
      } else {
        throw new Error("No image generated.");
      }
    } catch (err) {
      console.error(err);
      out.innerHTML = `<div style="color:#ef4444; padding:1rem;">Failed to generate image. Check your API key or prompt.</div>`;
    } finally {
      resetUser();
    }
  });

  // Common chat generation method for the other tools
  async function generateText(systemPrompt, userPrompt, outputDivId, btnId) {
    const key = getApiKey();
    if (!key) return;
    if (!userPrompt.trim()) return window.showToast && showToast('Please enter some text.', 'error');

    const btn = document.getElementById(btnId);
    const out = document.getElementById(outputDivId);
    const resetUser = setLoading(btn, out);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // Simple line break parsing for presentation
        let htmlContent = content.replace(/\n/g, '<br>');
        // highlight code blocks very roughly
        htmlContent = htmlContent.replace(/```([\s\S]*?)```/g, '<div style="background:rgba(0,0,0,0.5);padding:1rem;margin:1rem 0;border-radius:8px;font-family:monospace;white-space:pre-wrap;text-align:left;">$1</div>');
        out.innerHTML = htmlContent;
      } else {
        throw new Error("No response generated.");
      }
    } catch (err) {
      console.error(err);
      out.innerHTML = `<span style="color:#ef4444;">Failed to generate output. Check your API key.</span>`;
    } finally {
      resetUser();
    }
  }

  // 2. Text Summarizer
  document.getElementById('btn-ai-summary')?.addEventListener('click', () => {
    const prompt = document.getElementById('ai-summary-prompt').value;
    generateText(
      "You are an expert summarizer. Summarize the user's text concisely, capturing key points in bullet format if applicable.",
      prompt,
      'out-ai-summary',
      'btn-ai-summary'
    );
  });

  // 3. Code Explainer
  document.getElementById('btn-ai-code')?.addEventListener('click', () => {
    const prompt = document.getElementById('ai-code-prompt').value;
    generateText(
      "You are a senior developer. Explain the code provided by the user in simple, understandable terms. Break down what it does step by step.",
      prompt,
      'out-ai-code',
      'btn-ai-code'
    );
  });

  // 4. Career Suggestion Tool
  document.getElementById('btn-ai-career')?.addEventListener('click', () => {
    const prompt = document.getElementById('ai-career-prompt').value;
    generateText(
      "You are an expert career counselor for tech roles. Based on the skills provided by the user, suggest 3 suitable tech career paths. Under each path, list 1-2 sentences on why it fits.",
      prompt,
      'out-ai-career',
      'btn-ai-career'
    );
  });
});
