document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('idea-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const newChatBtn = document.getElementById('new-chat-btn');
  const chatItems = document.querySelectorAll('.chat-item');
  const featureButtons = document.querySelectorAll('.feature-btn');

  // ── State ───────────────────────────────────────────────────────────
  let currentFeature = null;
  let currentQuestionIndex = 0;
  let userAnswers = {};           // { feature: { q1: "answer", q2: "answer", ... } }

  // ── Default welcome ─────────────────────────────────────────────────
  const defaultMessage = `
    <div class="flex items-start gap-4">
      <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
        <i class="fa-solid fa-robot text-lg"></i>
      </div>
      <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
        <p>Hi 👋 I'm your Brand assistant.<br>Choose a feature on the right or tell me about your idea (e.g., "Eco-friendly fitness app for women" or "Minecraft gaming tutorial").</p>
      </div>
    </div>
  `;

  chatMessages.innerHTML = defaultMessage;

  // ── New Chat resets everything ──────────────────────────────────────
  newChatBtn.addEventListener('click', () => {
    chatItems.forEach(i => i.classList.remove('active'));
    currentFeature = null;
    currentQuestionIndex = 0;
    userAnswers = {};
    chatMessages.innerHTML = defaultMessage;
    input.value = '';
    input.placeholder = "Describe your brand / video idea...";
    input.focus();
  });

  // ── Chat history placeholder ────────────────────────────────────────
  chatItems.forEach(item => {
    item.addEventListener('click', () => {
      chatItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      chatMessages.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
            <p>Resuming chat: ${item.querySelector('.font-medium').textContent}...</p>
          </div>
        </div>
      `;
      currentFeature = null;
      currentQuestionIndex = 0;
      userAnswers = {};
    });
  });

  // ── Feature selection starts the guided flow ────────────────────────
  featureButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      featureButtons.forEach(b => b.classList.remove('highlight'));
      btn.classList.add('highlight');

      currentFeature = btn.dataset.feature;
      currentQuestionIndex = 0;
      userAnswers[currentFeature] = {};

      askNextQuestion();
    });
  });

  // ── Ask next question ───────────────────────────────────────────────
  function askNextQuestion() {
    if (!currentFeature) return;

    const questions = getQuestionsForFeature(currentFeature);

    if (currentQuestionIndex >= questions.length) {
      finishFeatureFlow(); // ← this now sends to backend
      return;
    }

    const question = questions[currentQuestionIndex];
    const previousAnswers = formatPreviousAnswers();

    chatMessages.innerHTML += `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
          <i class="fa-solid fa-robot text-lg"></i>
        </div>
        <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
          <p>${previousAnswers ? previousAnswers + '<br><br>' : ''}${question}</p>
        </div>
      </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
    input.focus();
    input.placeholder = "Answer here...";
  }

  // ── Format previous answers ─────────────────────────────────────────
  function formatPreviousAnswers() {
    if (!userAnswers[currentFeature] || Object.keys(userAnswers[currentFeature]).length === 0) return '';

    let summary = "So far you've said:<br>";
    Object.entries(userAnswers[currentFeature]).forEach(([q, a], i) => {
      summary += `${i + 1}. ${a}<br>`;
    });
    return summary;
  }

  // ── Define questions per feature ────────────────────────────────────
  function getQuestionsForFeature(feature) {
    const q = {
      'brand-name': [
        "Which sector or industry best describes your brand? (e.g. fitness, gaming, fashion, tech, food...)",
        "Who is your main target audience? (age, gender, interests, location...)",
        "What feeling or personality should the name give? (modern, fun, luxury, trustworthy, edgy, cozy...)",
        "Are there any themes you definitely want included?",
        "Are there any words, letters or styles you want to avoid?",
      ],
      'tagline': [
        "What is your brand name?",
        "What is the main benefit or promise your brand delivers?",
        "Short & punchy (3–6 words) or a bit longer?",
        "Preferred tone? (inspirational, funny, bold, warm, professional...)",
        "Any keywords or phrases you want to include?",
        "Do you have an existing tagline you're trying to improve?"
      ],
      'logo': [
        "What is your brand name?",
        "What style do you prefer? (minimal, bold, illustrative, vintage, geometric...)",
        "Favorite colors or palette? Any colors to avoid?",
        "Any symbols/icons that represent your idea? (leaf, camera, rocket...)",
        "Text-only, icon+text, or symbol-only logo?",
      ],
      'social-captions': [
        "Which platform(s) are we writing for? (Instagram, TikTok, X, LinkedIn...)",
        "Type of post? (reel, carousel, story, single image, thread...)",
        "What is the goal? (sell product, get likes, educate, drive traffic...)",
        "Desired tone & vibe? (funny, motivational, elegant, casual...)",
        "How long should captions be? (short & snappy, medium, storytelling...)",
      ],
      'thumbnails': [
        "What is the video title or main topic?",
        "What emotion should the thumbnail create? (excited, curious, relaxed...)",
        "What text should appear big on the thumbnail? (title, number, question...)",
        "Preferred color scheme? (bright/neon, dark/moody, pastel, brand colors...)",
        "Style vibe? (clean, bold, cinematic, cartoon, retro...)",
      ],
      'full-brand': [
        "What is your business/channel/product in one sentence?",
        "Who is your ideal customer? (age, gender, lifestyle, problems...)",
        "What 3–5 core values or personality traits define your brand?",
        "Do you have any name, color or logo ideas already?",
        "Any brands you admire or want to be similar to?",
        "Where will this brand appear most? (app, YouTube, Instagram, website...)",
        "Any budget, timeline or must-have deliverables?"
      ]
    };

    return q[feature] || ["Tell me more about your idea..."];
  }

  // ── When all questions answered → send to backend ───────────────────
  function finishFeatureFlow() {
    const answers = userAnswers[currentFeature];

    chatMessages.innerHTML += `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
          <i class="fa-solid fa-robot text-lg"></i>
        </div>
        <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
          <p>Thank you! Generating your ${currentFeature.replace('-', ' ')} now...</p>
        </div>
      </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send everything to backend
    const payload = {
      text: "Generate final output", // optional
      feature: currentFeature,
      answers: answers,
      session_id: 'flow-' + Date.now()
    };

    fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => {
      if (!r.ok) throw new Error(`Backend error: ${r.status}`);
      return r.json();
    })
    .then(data => {
      chatMessages.innerHTML += `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
            <i class="fa-solid fa-robot text-lg"></i>
          </div>
          <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
            <p>${data.reply.replace(/\n/g, '<br>') || 'No result received'}</p>
          </div>
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Reset after generation
      currentFeature = null;
      currentQuestionIndex = 0;
      userAnswers = {};
      input.placeholder = "Describe your brand / video idea...";
    })
    .catch(err => {
      console.error(err);
      chatMessages.innerHTML += `
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
            <i class="fa-solid fa-exclamation-triangle"></i>
          </div>
          <div class="bg-red-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] text-red-800">
            <p>Error generating result: ${err.message}</p>
          </div>
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  // ── Handle user sending message ────────────────────────────────────
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Show user message
    chatMessages.innerHTML += `
      <div class="flex items-start gap-4 justify-end">
        <div class="bg-brand-purple text-white rounded-2xl rounded-tr-none px-5 py-4 max-w-[85%]">
          <p>${text}</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 flex-shrink-0">
          <i class="fa-solid fa-user"></i>
        </div>
      </div>
    `;

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (currentFeature) {
      // Guided mode: save answer & continue / finish
      const questions = getQuestionsForFeature(currentFeature);
      const qKey = `q${currentQuestionIndex + 1}`;
      userAnswers[currentFeature][qKey] = text;

      currentQuestionIndex++;

      setTimeout(() => {
        askNextQuestion();
      }, 600);
    } else {
      // Free chat: send directly to backend
      const payload = {
        text: text,
        feature: null,
        answers: null,
        session_id: 'free-' + Date.now()
      };

      fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => {
        if (!r.ok) throw new Error(`Backend error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        chatMessages.innerHTML += `
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white flex-shrink-0">
              <i class="fa-solid fa-robot text-lg"></i>
            </div>
            <div class="bg-gray-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%]">
              <p>${data.reply.replace(/\n/g, '<br>') || 'No reply received'}</p>
            </div>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch(err => {
        console.error(err);
        chatMessages.innerHTML += `
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
              <i class="fa-solid fa-exclamation-triangle"></i>
            </div>
            <div class="bg-red-100 rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] text-red-800">
              <p>Error: ${err.message}</p>
            </div>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
});


// ── Simple client-side SVG logo generator ───────────────────────────────
function generateLogoSVG(answers) {
  // Extract useful info from answers
  const brandName = answers['q1'] || 'Your Brand'; // brand name
  const style = answers['q2']?.toLowerCase() || 'minimal'; // style preference
  const colors = answers['q3']?.toLowerCase() || 'blue, white'; // colors
  const symbol = answers['q4']?.toLowerCase() || ''; // symbol/icon
  const type = answers['q5']?.toLowerCase() || 'icon+text'; // text-only / icon+text / symbol-only

  // Simple color mapping
  const colorMap = {
    blue: '#2563eb', dark: '#1e293b', green: '#16a34a', purple: '#7c3aed',
    pink: '#ec4899', orange: '#f97316', black: '#000000', white: '#ffffff'
  };

  let primaryColor = colorMap.blue;
  let secondaryColor = colorMap.white;

  // Try to find first mentioned color
  const colorWords = colors.split(/[, ]+/);
  for (let c of colorWords) {
    if (colorMap[c]) {
      primaryColor = colorMap[c];
      break;
    }
  }

  // Background / text contrast
  secondaryColor = (primaryColor === '#000000' || primaryColor === '#1e293b') ? '#ffffff' : '#000000';

  // Basic SVG dimensions
  const width = 400;
  const height = 400;

  // Start SVG string
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Background circle (common for logos)
  svg += `<circle cx="${width/2}" cy="${height/2}" r="${Math.min(width,height)/2 - 20}" fill="${primaryColor}" />`;

  // Add symbol if mentioned
  if (symbol.includes('leaf') || symbol.includes('nature')) {
    svg += `
      <path d="M ${width/2} ${height/2 - 80} Q ${width/2 - 60} ${height/2 - 40}, ${width/2 - 40} ${height/2 + 40} Q ${width/2} ${height/2 + 80}, ${width/2 + 40} ${height/2 + 40} Q ${width/2 + 60} ${height/2 - 40}, ${width/2} ${height/2 - 80}" fill="none" stroke="${secondaryColor}" stroke-width="12" />
      <circle cx="${width/2}" cy="${height/2 - 100}" r="15" fill="${secondaryColor}" />
    `;
  } else if (symbol.includes('camera') || symbol.includes('photo')) {
    svg += `
      <rect x="${width/2 - 80}" y="${height/2 - 60}" width="160" height="120" rx="20" fill="none" stroke="${secondaryColor}" stroke-width="12" />
      <circle cx="${width/2 + 40}" cy="${height/2 - 20}" r="20" fill="none" stroke="${secondaryColor}" stroke-width="12" />
      <circle cx="${width/2 + 40}" cy="${height/2 - 20}" r="8" fill="${secondaryColor}" />
    `;
  } // Add more symbols later if needed

  // Add brand name text
  if (type.includes('text') || type.includes('icon+text')) {
    svg += `
      <text x="${width/2}" y="${height/2 + 100}" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${secondaryColor}" text-anchor="middle">
        ${brandName.split(' ').join(' ')}
      </text>
    `;
  }

  svg += `</svg>`;

  return svg;
}