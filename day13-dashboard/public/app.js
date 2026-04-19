// ── Tab navigation ────────────────────────────────

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ── Slider descriptions ───────────────────────────

const DESC = {
  professional:          'Clear, structured & authoritative',
  casual:                'Relaxed, friendly & approachable',
  punchy:                'Bold, direct & high-impact',
  formal:                'Structured and respectful',
  'friendly-professional': 'Warm yet businesslike',
  warm:                  'Personal and sincere',
  conversational:        'Natural, engaging & easy to read',
  'bold and direct':     'Direct, energetic & unapologetic',
  'warm and friendly':   'Empathetic, inviting & human',
};

// ── Segmented controls ────────────────────────────

function initSliders() {
  document.querySelectorAll('.slider-group').forEach(group => {
    const opts      = group.querySelectorAll('.slider-opt');
    const indicator = group.querySelector('.slider-indicator');
    const desc      = group.querySelector('.slider-desc');
    const n         = opts.length;

    indicator.style.width = `${100 / n}%`;

    function activate(opt, animate = true) {
      const idx = [...opts].indexOf(opt);
      opts.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      indicator.style.transition = animate ? 'transform 0.28s cubic-bezier(.4,0,.2,1)' : 'none';
      indicator.style.transform  = `translateX(${idx * 100}%)`;

      if (desc) {
        desc.textContent = DESC[opt.dataset.value] || '';
        desc.style.animation = 'none';
        void desc.offsetWidth;
        desc.style.animation = 'descFade 0.26s ease both';
      }
    }

    opts.forEach(opt => opt.addEventListener('click', () => activate(opt)));
    activate(group.querySelector('.slider-opt.active') || opts[0], false);
  });
}

function sliderValue(id) {
  return document.querySelector(`#${id} .slider-opt.active`)?.dataset.value ?? '';
}

initSliders();

// ── API call ──────────────────────────────────────

async function callApi(endpoint, body, resultEl, btnEl) {
  const bodyEl = resultEl.querySelector('.result-body');
  bodyEl.textContent = 'Generating…';
  resultEl.classList.remove('hidden');
  resultEl.classList.add('loading');
  btnEl.disabled = true;

  try {
    const res  = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    bodyEl.textContent = data.result;
    resultEl.classList.remove('loading');
  } catch (e) {
    bodyEl.textContent = 'Error: ' + e.message;
    resultEl.classList.remove('loading');
  } finally {
    btnEl.disabled = false;
  }
}

// ── Copy ──────────────────────────────────────────

function copyResult(id) {
  const text = document.querySelector(`#${id} .result-body`)?.textContent ?? '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(`#${id} .result-copy`);
    const orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => (btn.textContent = orig), 1800);
  });
}

// ── Generators ───────────────────────────────────

function generateTone() {
  const text = document.getElementById('tone-text').value.trim();
  const tone = sliderValue('tone-slider');
  if (!text) return alert('Please paste some text first.');
  callApi('/api/tone', { text, tone }, document.getElementById('tone-result'), event.target);
}

function generateEmail() {
  const recipient = document.getElementById('email-recipient').value.trim();
  const situation = document.getElementById('email-situation').value.trim();
  const goal      = document.getElementById('email-goal').value.trim();
  const tone      = sliderValue('email-slider');
  const details   = document.getElementById('email-details').value.trim();
  if (!recipient || !situation || !goal) return alert('Please fill in recipient, situation, and goal.');
  callApi('/api/email', { recipient, situation, goal, tone, details }, document.getElementById('email-result'), event.target);
}

function generateBrief() {
  const product  = document.getElementById('brief-product').value.trim();
  const audience = document.getElementById('brief-audience').value.trim();
  const usp      = document.getElementById('brief-usp').value.trim();
  const tone     = sliderValue('brief-slider');
  const cta      = document.getElementById('brief-cta').value.trim();
  if (!product || !audience || !usp) return alert('Please fill in product, audience, and USP.');
  callApi('/api/brief', { product, audience, usp, tone, cta }, document.getElementById('brief-result'), event.target);
}
