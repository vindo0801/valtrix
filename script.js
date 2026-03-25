/* ═══════════════════════════════════════════
   VALTRIX™ — script.js
   Features: Lang toggle, Registration, Quiz,
   Simulation, Chatbot AI, Employer form, Animations
   ═══════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────
const APP = {
  lang: 'en',
  quiz: { current: 0, answers: [], result: null },
  sim:  { currentPhase: 0 },
  chat: { open: false, messages: [], typing: false },
  reg:  { step: 1, totalSteps: 3 },
  user: null,
};

// ─────────────────────────────────────────
// LANGUAGE SYSTEM
// ─────────────────────────────────────────
function setLang(lang) {
  APP.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.querySelectorAll('.en-text').forEach(el => {
    el.style.display = lang === 'en' ? '' : 'none';
  });
  document.querySelectorAll('.id-text').forEach(el => {
    el.style.display = lang === 'id' ? '' : 'none';
  });
  document.querySelectorAll('[data-nav-en]').forEach(a => {
    a.textContent = lang === 'en' ? a.dataset.navEn : a.dataset.navId;
  });
}

// ─────────────────────────────────────────
// NAV: SCROLL HIGHLIGHT + HAMBURGER
// ─────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // highlight active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });

  // hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }
}

// ─────────────────────────────────────────
// SCROLL REVEAL
// ─────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// ─────────────────────────────────────────
// MODAL HELPERS
// ─────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
// close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─────────────────────────────────────────
// REGISTRATION FORM
// ─────────────────────────────────────────
function initRegistration() {
  APP.reg.step = 1;
  updateRegUI();
}

function updateRegUI() {
  const { step, totalSteps } = APP.reg;

  // steps bar
  document.querySelectorAll('#modal-register .step-dot').forEach((dot, i) => {
    dot.className = 'step-dot';
    if (i + 1 < step)  dot.classList.add('done');
    if (i + 1 === step) dot.classList.add('active');
  });

  // step label
  const stepLabel = document.getElementById('reg-step-label');
  const labels = {
    en: ['Personal Info', 'Work Background', 'Track Preference'],
    id: ['Info Pribadi',  'Latar Pekerjaan',  'Pilihan Jalur'],
  };
  if (stepLabel) {
    stepLabel.innerHTML = `<span>${step}/${totalSteps}</span> — ${labels[APP.lang][step-1]}`;
  }

  // show active step
  document.querySelectorAll('.form-step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === step);
  });

  // buttons
  const btnPrev = document.getElementById('reg-prev');
  const btnNext = document.getElementById('reg-next');
  const btnSubmit = document.getElementById('reg-submit');
  if (btnPrev)   btnPrev.style.display   = step > 1 ? 'flex' : 'none';
  if (btnNext)   btnNext.style.display   = step < totalSteps ? 'flex' : 'none';
  if (btnSubmit) btnSubmit.style.display = step === totalSteps ? 'flex' : 'none';
}

function regNext() {
  if (!validateRegStep()) return;
  if (APP.reg.step < APP.reg.totalSteps) {
    APP.reg.step++;
    updateRegUI();
  }
}
function regPrev() {
  if (APP.reg.step > 1) {
    APP.reg.step--;
    updateRegUI();
  }
}

function validateRegStep() {
  const step = APP.reg.step;
  let valid = true;

  const checks = {
    1: ['reg-name','reg-email','reg-phone'],
    2: ['reg-sector','reg-years'],
    3: [],
  };

  checks[step].forEach(fieldId => {
    const el = document.getElementById(fieldId);
    const err = document.getElementById(fieldId + '-err');
    if (el && !el.value.trim()) {
      el.style.borderColor = 'var(--danger)';
      if (err) err.classList.add('show');
      valid = false;
    } else if (el) {
      el.style.borderColor = '';
      if (err) err.classList.remove('show');
    }
  });

  // email validation
  if (step === 1) {
    const emailEl = document.getElementById('reg-email');
    const emailErr = document.getElementById('reg-email-err');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.style.borderColor = 'var(--danger)';
      if (emailErr) { emailErr.textContent = APP.lang === 'en' ? 'Invalid email format' : 'Format email tidak valid'; emailErr.classList.add('show'); }
      valid = false;
    }
  }
  return valid;
}

function submitRegistration() {
  if (!validateRegStep()) return;

  const name  = document.getElementById('reg-name')?.value || '';
  const email = document.getElementById('reg-email')?.value || '';
  const track = document.querySelector('input[name="reg-track"]:checked')?.value || 'digital';

  APP.user = { name, email, track };

  // Save to localStorage so learn.html can pick it up
  localStorage.setItem('valtrix_user', JSON.stringify(APP.user));

  closeModal('modal-register');

  const trackLabels = { digital:'Digital Services', green:'Green Economy', agro:'Agro-Industry 4.0' };
  const msg = APP.lang === 'en'
    ? `Welcome, ${name}! Redirecting to your Learning Dashboard... 🚀`
    : `Selamat datang, ${name}! Menuju Dashboard Belajarmu... 🚀`;

  showToast(msg, 'success');

  // Redirect to learn.html after short delay
  setTimeout(() => {
    window.location.href = 'learn.html';
  }, 1400);
}

// ─────────────────────────────────────────
// QUIZ — SKILL ASSESSMENT
// ─────────────────────────────────────────
const QUIZ_DATA = {
  en: [
    {
      q: "When you were working, which tasks felt most natural to you?",
      opts: [
        { text: "Operating machines or handling physical products", track: 'agro' },
        { text: "Communicating with customers or managing admin tasks", track: 'digital' },
        { text: "Working outdoors or in natural environments", track: 'agro' },
        { text: "Using computers, spreadsheets, or digital tools", track: 'digital' },
      ]
    },
    {
      q: "How comfortable are you with smartphones and social media?",
      opts: [
        { text: "Very comfortable — I use them daily for many things", track: 'digital' },
        { text: "Somewhat comfortable — I use basic features", track: 'digital' },
        { text: "Not very comfortable — I prefer hands-on work", track: 'green' },
        { text: "I prefer working with nature and physical tools", track: 'agro' },
      ]
    },
    {
      q: "Which income model appeals to you most?",
      opts: [
        { text: "Freelance — work on multiple projects, earn per output", track: 'digital' },
        { text: "Contract — stable 6-month placement at one company", track: 'green' },
        { text: "Revenue share — earn % based on project results", track: 'digital' },
        { text: "Field work — daily or weekly outdoor operations", track: 'agro' },
      ]
    },
    {
      q: "What kind of training feels most achievable in 90 days?",
      opts: [
        { text: "Learning to manage social media ads and content", track: 'digital' },
        { text: "Installing and maintaining solar panels (PLTS)", track: 'green' },
        { text: "Operating smart farm sensors and IoT devices", track: 'agro' },
        { text: "Becoming a waste-to-energy plant operator", track: 'green' },
      ]
    },
    {
      q: "Which future sector do you believe will grow the most in Indonesia?",
      opts: [
        { text: "Digital economy and e-commerce", track: 'digital' },
        { text: "Renewable energy and green infrastructure", track: 'green' },
        { text: "Smart agriculture and food technology", track: 'agro' },
        { text: "Electric vehicles and sustainable manufacturing", track: 'green' },
      ]
    },
  ],
  id: [
    {
      q: "Ketika masih bekerja, tugas apa yang paling terasa alami untuk kamu?",
      opts: [
        { text: "Mengoperasikan mesin atau menangani produk fisik", track: 'agro' },
        { text: "Berkomunikasi dengan pelanggan atau mengelola administrasi", track: 'digital' },
        { text: "Bekerja di luar ruangan atau di alam terbuka", track: 'agro' },
        { text: "Menggunakan komputer, spreadsheet, atau alat digital", track: 'digital' },
      ]
    },
    {
      q: "Seberapa nyaman kamu menggunakan smartphone dan media sosial?",
      opts: [
        { text: "Sangat nyaman — saya menggunakannya setiap hari", track: 'digital' },
        { text: "Cukup nyaman — saya pakai fitur-fitur dasar", track: 'digital' },
        { text: "Kurang nyaman — saya lebih suka pekerjaan fisik", track: 'green' },
        { text: "Saya lebih suka bekerja dengan alam dan alat fisik", track: 'agro' },
      ]
    },
    {
      q: "Model penghasilan mana yang paling menarik bagimu?",
      opts: [
        { text: "Freelance — kerjakan berbagai proyek, dibayar per output", track: 'digital' },
        { text: "Kontrak — penempatan stabil 6 bulan di satu perusahaan", track: 'green' },
        { text: "Revenue share — dapat % berdasarkan hasil proyek", track: 'digital' },
        { text: "Pekerjaan lapangan — operasional outdoor harian/mingguan", track: 'agro' },
      ]
    },
    {
      q: "Pelatihan apa yang paling bisa kamu capai dalam 90 hari?",
      opts: [
        { text: "Belajar mengelola iklan media sosial dan konten", track: 'digital' },
        { text: "Memasang dan merawat panel surya (PLTS)", track: 'green' },
        { text: "Mengoperasikan sensor smart farm dan perangkat IoT", track: 'agro' },
        { text: "Menjadi operator pabrik waste-to-energy", track: 'green' },
      ]
    },
    {
      q: "Sektor mana yang menurut kamu akan paling berkembang di Indonesia?",
      opts: [
        { text: "Ekonomi digital dan e-commerce", track: 'digital' },
        { text: "Energi terbarukan dan infrastruktur hijau", track: 'green' },
        { text: "Pertanian cerdas dan teknologi pangan", track: 'agro' },
        { text: "Kendaraan listrik dan manufaktur berkelanjutan", track: 'green' },
      ]
    },
  ],
};

const TRACK_INFO = {
  digital: {
    en: { label:'DIGITAL SERVICES', jobs:['Chatbot Trainer','Social Media Manager','Google Ads Specialist','Content Creator'], desc:'You thrive in fast-paced digital environments. Your path is the fastest-growing track with 60% of our graduates.' },
    id: { label:'LAYANAN DIGITAL',  jobs:['Chatbot Trainer','Social Media Manager','Google Ads Specialist','Content Creator'], desc:'Kamu cocok di lingkungan digital yang dinamis. Jalur ini adalah jalur dengan pertumbuhan tercepat, 60% lulusan kami.' },
  },
  green: {
    en: { label:'GREEN ECONOMY',   jobs:['PLTS Rooftop Installer','Waste-to-Energy Operator','EV Technician','Green Inspector'], desc:'Your hands-on skills translate perfectly to Indonesia\'s booming renewable energy sector — earning above-average wages.' },
    id: { label:'EKONOMI HIJAU',   jobs:['Installer Panel Surya','Operator Waste-to-Energy','Teknisi EV','Inspektor Hijau'],     desc:'Keahlian fisik kamu sangat cocok untuk sektor energi terbarukan Indonesia yang sedang booming — upah di atas rata-rata.' },
  },
  agro: {
    en: { label:'AGRO-INDUSTRY 4.0',jobs:['Smart Farming IoT','Cold Chain Logistics','Drone Operator','Food Tech Specialist'],  desc:'Your connection to physical work and nature makes you ideal for modernising Indonesia\'s agricultural backbone.' },
    id: { label:'AGRO-INDUSTRI 4.0',jobs:['Smart Farming IoT','Logistik Cold Chain','Operator Drone','Spesialis Food Tech'],   desc:'Koneksimu dengan pekerjaan fisik dan alam membuatmu ideal untuk memodernisasi tulang punggung pertanian Indonesia.' },
  },
};

function initQuiz() {
  APP.quiz = { current: 0, answers: [], result: null };
  renderQuizQuestion();
  openModal('modal-quiz');
}

function renderQuizQuestion() {
  const { current } = APP.quiz;
  const data = QUIZ_DATA[APP.lang];
  const total = data.length;
  const q = data[current];

  document.getElementById('quiz-progress-text').textContent =
    APP.lang === 'en' ? `Question ${current+1} of ${total}` : `Pertanyaan ${current+1} dari ${total}`;
  document.getElementById('quiz-progress-fill').style.width = `${((current+1)/total)*100}%`;
  document.getElementById('quiz-question-text').textContent = q.q;

  const container = document.getElementById('quiz-options');
  container.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const div = document.createElement('label');
    div.className = 'quiz-option';
    div.innerHTML = `
      <input type="radio" name="quiz-q${current}" value="${opt.track}" data-idx="${i}">
      <span class="quiz-radio"></span>
      <span class="quiz-option-text">${opt.text}</span>
    `;
    div.addEventListener('click', () => {
      container.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      div.querySelector('input').checked = true;
    });
    container.appendChild(div);
  });

  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-q-area').style.display = 'block';
  document.getElementById('quiz-btn-next').textContent =
    current === total - 1
      ? (APP.lang === 'en' ? 'See My Track →' : 'Lihat Jalur Saya →')
      : (APP.lang === 'en' ? 'Next →' : 'Selanjutnya →');
}

function quizNext() {
  const selected = document.querySelector(`input[name="quiz-q${APP.quiz.current}"]:checked`);
  if (!selected) {
    showToast(APP.lang === 'en' ? 'Please select an answer.' : 'Pilih salah satu jawaban.', 'error');
    return;
  }
  APP.quiz.answers.push(selected.value);

  if (APP.quiz.current < QUIZ_DATA[APP.lang].length - 1) {
    APP.quiz.current++;
    renderQuizQuestion();
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const counts = { digital: 0, green: 0, agro: 0 };
  APP.quiz.answers.forEach(a => counts[a]++);
  const result = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
  APP.quiz.result = result;

  const info = TRACK_INFO[result][APP.lang];

  document.getElementById('quiz-q-area').style.display = 'none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display = 'block';

  document.getElementById('quiz-result-badge').textContent = info.label;
  document.getElementById('quiz-result-badge').className = `result-track-badge result-${result}`;
  document.getElementById('quiz-result-title').textContent =
    APP.lang === 'en' ? 'Your Recommended Track:' : 'Jalur yang Direkomendasikan:';
  document.getElementById('quiz-result-desc').textContent = info.desc;

  const jobsEl = document.getElementById('quiz-result-jobs');
  jobsEl.innerHTML = info.jobs.map(j => `<span class="result-job-tag">${j}</span>`).join('');

  document.getElementById('quiz-result-cta').textContent =
    APP.lang === 'en' ? '📋 Register for this Track' : '📋 Daftar Jalur Ini';
}

function quizToCTA() {
  closeModal('modal-quiz');
  setTimeout(() => openModal('modal-register'), 300);
}

// ─────────────────────────────────────────
// SIMULATION — 90-DAY PROGRAM
// ─────────────────────────────────────────
const SIM_PHASES = {
  en: [
    {
      weeks:'Week 1–4 · 40 Hours', title:'Micro-Credential Training',
      desc:'AI-personalized skill assessment and intensive track training. Earn recognized micro-credentials.',
      tasks:[
        { icon:'🧠', text:'AI Skill Gap Analysis — identify your strengths & learning path' },
        { icon:'📚', text:'40-hour intensive course with live instructors + recorded sessions' },
        { icon:'🎓', text:'Industry micro-credential exam — pass to unlock Phase 2' },
        { icon:'👥', text:'Join peer cohort group + assigned mentor' },
      ]
    },
    {
      weeks:'Week 5–8 · Live Projects', title:'Industry Live Project',
      desc:'Work on real projects with partner companies. Earn 30% revenue share from day one.',
      tasks:[
        { icon:'🏢', text:'Matched to verified partner employer in your track' },
        { icon:'💼', text:'Execute real client project under mentor supervision' },
        { icon:'💰', text:'Earn 30% revenue share — avg Rp3–5M in this phase' },
        { icon:'📊', text:'Performance dashboard tracks your progress in real-time' },
      ]
    },
    {
      weeks:'Week 9–12 · Placement', title:'Guaranteed Contract Placement',
      desc:'Placed into a verified 6-month employment contract. Average income: Rp7–15M/month.',
      tasks:[
        { icon:'📝', text:'Sign 6-month guaranteed contract with partner employer' },
        { icon:'💵', text:'Target income: Rp7–15M/month (vs Rp3–4M before)' },
        { icon:'🚀', text:'Option to go freelance after contract or extend placement' },
        { icon:'🌐', text:'Join Valtrix alumni network — referrals & upsizing' },
      ]
    },
  ],
  id: [
    {
      weeks:'Minggu 1–4 · 40 Jam', title:'Pelatihan Micro-Credential',
      desc:'Asesmen skill personal berbasis AI dan pelatihan jalur intensif. Raih micro-credential yang diakui industri.',
      tasks:[
        { icon:'🧠', text:'Analisis Kesenjangan Skill AI — identifikasi kekuatan & jalur belajarmu' },
        { icon:'📚', text:'Kursus intensif 40 jam dengan instruktur langsung + rekaman' },
        { icon:'🎓', text:'Ujian micro-credential industri — lulus untuk buka Fase 2' },
        { icon:'👥', text:'Bergabung dengan grup peer cohort + mentor yang ditugaskan' },
      ]
    },
    {
      weeks:'Minggu 5–8 · Proyek Nyata', title:'Proyek Industri Langsung',
      desc:'Kerjakan proyek nyata bersama perusahaan mitra. Dapatkan 30% revenue share sejak hari pertama.',
      tasks:[
        { icon:'🏢', text:'Dicocokkan dengan employer mitra terverifikasi di jalurmu' },
        { icon:'💼', text:'Jalankan proyek klien nyata di bawah supervisi mentor' },
        { icon:'💰', text:'Raih 30% revenue share — rata-rata Rp3–5 juta di fase ini' },
        { icon:'📊', text:'Dashboard performa melacak kemajuanmu secara real-time' },
      ]
    },
    {
      weeks:'Minggu 9–12 · Penempatan', title:'Penempatan Kontrak Terjamin',
      desc:'Ditempatkan dalam kontrak kerja terjamin 6 bulan. Rata-rata penghasilan: Rp7–15 juta/bulan.',
      tasks:[
        { icon:'📝', text:'Tanda tangani kontrak terjamin 6 bulan dengan employer mitra' },
        { icon:'💵', text:'Target penghasilan: Rp7–15 juta/bulan (vs Rp3–4 juta sebelumnya)' },
        { icon:'🚀', text:'Opsi freelance setelah kontrak atau perpanjang penempatan' },
        { icon:'🌐', text:'Bergabung alumni network Valtrix — referral & peningkatan karir' },
      ]
    },
  ],
};

function renderSimulation() {
  const phases = SIM_PHASES[APP.lang];
  const container = document.getElementById('sim-phases-container');
  if (!container) return;
  container.innerHTML = '';

  phases.forEach((phase, i) => {
    const isActive    = i === APP.sim.currentPhase;
    const isCompleted = i < APP.sim.currentPhase;
    const div = document.createElement('div');
    div.className = `sim-phase ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="sim-num">${String(i+1).padStart(2,'0')}</div>
      <div class="sim-info">
        <div class="sim-weeks">${phase.weeks}</div>
        <div class="sim-title">${phase.title}</div>
        <div class="sim-desc">${phase.desc}</div>
        <div class="sim-detail">
          <div class="sim-detail-inner">
            ${phase.tasks.map((t,ti) => `
              <div class="sim-task">
                <span class="sim-task-icon">${t.icon}</span>
                <span>${t.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="sim-status">
        <span class="sim-status-dot ${isCompleted?'status-done':isActive?'status-active':'status-next'}"></span>
        <span>${isCompleted?(APP.lang==='en'?'Done':'Selesai'):isActive?(APP.lang==='en'?'Active':'Aktif'):(APP.lang==='en'?'Next':'Berikutnya')}</span>
      </div>
    `;
    div.addEventListener('click', () => {
      APP.sim.currentPhase = i;
      renderSimulation();
    });
    container.appendChild(div);
  });

  // progress indicator
  const progEl = document.getElementById('sim-progress-label');
  if (progEl) {
    const labels = { en:['Phase 1 of 3','Phase 2 of 3','Phase 3 of 3'], id:['Fase 1 dari 3','Fase 2 dari 3','Fase 3 dari 3'] };
    progEl.textContent = labels[APP.lang][APP.sim.currentPhase];
  }
  const nextBtn = document.getElementById('sim-next-btn');
  if (nextBtn) {
    nextBtn.style.display = APP.sim.currentPhase < 2 ? 'flex' : 'none';
    nextBtn.textContent = APP.lang === 'en' ? 'Next Phase →' : 'Fase Berikutnya →';
  }
  const doneBtn = document.getElementById('sim-done-btn');
  if (doneBtn) {
    doneBtn.style.display = APP.sim.currentPhase === 2 ? 'flex' : 'none';
    doneBtn.textContent = APP.lang === 'en' ? '🎉 Register Now' : '🎉 Daftar Sekarang';
  }
}

function simNextPhase() {
  if (APP.sim.currentPhase < 2) {
    APP.sim.currentPhase++;
    renderSimulation();
  }
}
function simComplete() {
  closeModal('modal-simulation');
  const msg = APP.lang === 'en'
    ? `🎉 You've completed the full 90-day preview! Registration done — we'll be in touch soon.`
    : `🎉 Kamu sudah melihat perjalanan 90 hari penuh! Pendaftaran selesai — kami segera menghubungimu.`;
  showToast(msg, 'success');
}

// ─────────────────────────────────────────
// CHATBOT AI
// ─────────────────────────────────────────
const BOT_KNOWLEDGE = {
  en: {
    greet: "Hi! I'm ValtrixBot, your Valtrix advisor 🤖\n\nI'm here to help you understand your options after a layoff. Ask me anything about:\n• The 3 transformation tracks\n• Our 90-day Fastrain program\n• Registration & eligibility\n• PHK Radar predictions\n• Salary expectations",
    tracks: "Valtrix offers **3 automation-resistant tracks**:\n\n💻 **Digital Services (60%)** — Chatbot Trainer, Social Media Manager, Google Ads Specialist. Income: Rp7–15M/month\n\n🌱 **Green Economy (25%)** — Solar Panel Installer, Waste-to-Energy Operator. Income: Rp6–12M/month\n\n🌾 **Agro-Industry 4.0 (15%)** — Smart Farming IoT, Cold Chain Logistics. Income: Rp5–10M/month\n\nTake our **Skill Assessment Quiz** to find your best fit!",
    program: "The Valtrix program is **90 days total**, split into 3 phases:\n\n📚 **Phase 1 (Week 1–4):** 40-hour micro-credential training + AI skill assessment\n\n💼 **Phase 2 (Week 5–8):** Live industry project — earn 30% revenue share\n\n🏆 **Phase 3 (Week 9–12):** Guaranteed 6-month placement contract\n\nNo prior tech experience needed for most tracks!",
    salary: "After completing Valtrix:\n\n💰 **Before:** Rp3–4M/month (average manufacturing wage)\n💰 **After:** Rp7–15M/month target income\n\nIn Phase 2 alone, you can earn Rp3–5M through the 30% revenue share model.\n\nThe top 10% of graduates in Digital Services reach **Rp15–25M/month** within year 1.",
    register: "To register for Valtrix:\n\n1️⃣ Click **'Start Your Journey'** on the homepage\n2️⃣ Complete the 3-step registration form (takes ~3 minutes)\n3️⃣ Take the Skill Assessment Quiz to confirm your track\n4️⃣ Receive your program start date via email\n\n**Eligibility:** Any Indonesian worker affected by layoff, ages 18–55. No degree required!",
    radar: "The **PHK Radar™** is our AI prediction system that analyzes:\n\n📊 Company financial health & profit margins\n🌐 Global automation & industry trends\n📉 Macroeconomic signals (exchange rate, inflation)\n\nIt predicts layoff risk **6 months in advance** with **85% accuracy** — giving both workers and employers time to prepare with pre-emptive reskilling.",
    cost: "The Valtrix program is **free for workers**! 🎉\n\nFunding comes from:\n• Rp2M/month employer subsidy per reskilled worker\n• CSR partnerships (Google, Microsoft, local tech companies)\n• Prabowo's National Endowment Fund\n\nYou invest your time and commitment — we invest in your future.",
    default: "Great question! I can help you with info about:\n\n• **Tracks** — ask 'what tracks are available?'\n• **Program** — ask 'how does the 90-day program work?'\n• **Salary** — ask 'how much will I earn?'\n• **Registration** — ask 'how do I register?'\n• **PHK Radar** — ask 'how does the radar work?'\n• **Cost** — ask 'is it free?'\n\nWhat would you like to know more about?",
  },
  id: {
    greet: "Halo! Saya ValtrixBot, advisor Valtrix kamu 🤖\n\nSaya siap membantu kamu memahami pilihan setelah kena PHK. Tanyakan apa saja tentang:\n• 3 jalur transformasi\n• Program Fastrain 90 hari\n• Pendaftaran & kelayakan\n• Prediksi PHK Radar\n• Ekspektasi gaji",
    tracks: "Valtrix menawarkan **3 jalur tahan otomatisasi**:\n\n💻 **Layanan Digital (60%)** — Chatbot Trainer, Social Media Manager, Google Ads Specialist. Penghasilan: Rp7–15 juta/bulan\n\n🌱 **Ekonomi Hijau (25%)** — Installer Panel Surya, Operator Waste-to-Energy. Penghasilan: Rp6–12 juta/bulan\n\n🌾 **Agro-Industri 4.0 (15%)** — Smart Farming IoT, Logistik Cold Chain. Penghasilan: Rp5–10 juta/bulan\n\nIkuti **Kuis Asesmen Skill** untuk menemukan jalur terbaikmu!",
    program: "Program Valtrix berlangsung **90 hari total**, dibagi 3 fase:\n\n📚 **Fase 1 (Minggu 1–4):** Pelatihan micro-credential 40 jam + asesmen skill AI\n\n💼 **Fase 2 (Minggu 5–8):** Proyek industri nyata — dapatkan 30% revenue share\n\n🏆 **Fase 3 (Minggu 9–12):** Kontrak penempatan terjamin 6 bulan\n\nTidak perlu pengalaman teknologi sebelumnya untuk sebagian besar jalur!",
    salary: "Setelah menyelesaikan Valtrix:\n\n💰 **Sebelum:** Rp3–4 juta/bulan (upah rata-rata manufaktur)\n💰 **Sesudah:** Target penghasilan Rp7–15 juta/bulan\n\nDi Fase 2 saja, kamu bisa mendapatkan Rp3–5 juta melalui model 30% revenue share.\n\n10% lulusan teratas di Layanan Digital mencapai **Rp15–25 juta/bulan** dalam tahun pertama.",
    register: "Untuk mendaftar Valtrix:\n\n1️⃣ Klik **'Mulai Perjalananmu'** di halaman utama\n2️⃣ Lengkapi form pendaftaran 3 langkah (~3 menit)\n3️⃣ Ikuti Kuis Asesmen Skill untuk konfirmasi jalurmu\n4️⃣ Terima tanggal mulai program melalui email\n\n**Syarat:** Pekerja Indonesia yang terdampak PHK, usia 18–55 tahun. Tidak perlu gelar!",
    radar: "**PHK Radar™** adalah sistem prediksi AI kami yang menganalisis:\n\n📊 Kesehatan keuangan & margin keuntungan perusahaan\n🌐 Tren otomatisasi global & industri\n📉 Sinyal makroekonomi (kurs, inflasi)\n\nMemprediksi risiko PHK **6 bulan sebelumnya** dengan akurasi **85%** — memberi pekerja dan employer waktu untuk mempersiapkan reskilling pre-emptif.",
    cost: "Program Valtrix **gratis untuk pekerja**! 🎉\n\nPendanaan berasal dari:\n• Subsidi employer Rp2 juta/bulan per pekerja reskill\n• Kemitraan CSR (Google, Microsoft, perusahaan tech lokal)\n• Dana Abadi Nasional Prabowo\n\nKamu investasikan waktu dan komitmen — kami investasikan di masa depanmu.",
    default: "Pertanyaan bagus! Saya bisa bantu dengan info tentang:\n\n• **Jalur** — tanya 'jalur apa yang tersedia?'\n• **Program** — tanya 'bagaimana program 90 hari bekerja?'\n• **Gaji** — tanya 'berapa penghasilan saya nanti?'\n• **Pendaftaran** — tanya 'bagaimana cara daftar?'\n• **PHK Radar** — tanya 'bagaimana radar bekerja?'\n• **Biaya** — tanya 'apakah gratis?'\n\nApa yang ingin kamu ketahui lebih lanjut?",
  },
};

function getBotResponse(input) {
  const text = input.toLowerCase();
  const kb = BOT_KNOWLEDGE[APP.lang];

  if (/track|jalur|jalu|path|digital|green|agro/i.test(text))    return kb.tracks;
  if (/program|day|hari|90|phase|fase|week|minggu/i.test(text))  return kb.program;
  if (/salary|gaji|earn|penghasilan|income|pay|bayar|money|uang/i.test(text)) return kb.salary;
  if (/register|daftar|sign up|join|cara|how to|bagaimana daftar/i.test(text)) return kb.register;
  if (/radar|predict|prediksi|phk|layoff|risk|risiko/i.test(text)) return kb.radar;
  if (/cost|free|gratis|biaya|bayar berapa|how much|harga|price/i.test(text)) return kb.cost;
  return kb.default;
}

function initChatbot() {
  addBotMessage(BOT_KNOWLEDGE[APP.lang].greet);
}

function toggleChatbot() {
  APP.chat.open = !APP.chat.open;
  const win = document.getElementById('chatbot-window');
  const toggle = document.getElementById('chatbot-toggle');
  win.classList.toggle('open', APP.chat.open);
  toggle.classList.toggle('open', APP.chat.open);
  toggle.textContent = APP.chat.open ? '✕' : '💬';
  if (APP.chat.open) {
    document.getElementById('chatbot-input').focus();
  }
}

function addBotMessage(text) {
  const messages = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">${text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addUserMessage(text) {
  const messages = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'msg msg-user';
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'msg msg-bot msg-typing';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  document.getElementById('typing-indicator')?.remove();
}

function sendChatMessage(text) {
  const msg = text || document.getElementById('chatbot-input').value.trim();
  if (!msg) return;
  document.getElementById('chatbot-input').value = '';

  addUserMessage(msg);
  showTyping();

  setTimeout(() => {
    hideTyping();
    addBotMessage(getBotResponse(msg));
  }, 900 + Math.random() * 600);
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendChatMessage();
}

// ─────────────────────────────────────────
// EMPLOYER FORM
// ─────────────────────────────────────────
function submitEmployerForm(e) {
  e.preventDefault();
  const company = document.getElementById('emp-company')?.value.trim();
  const contact = document.getElementById('emp-contact')?.value.trim();
  const email   = document.getElementById('emp-email')?.value.trim();
  const workers = document.getElementById('emp-workers')?.value;

  if (!company || !contact || !email || !workers) {
    showToast(APP.lang === 'en' ? 'Please fill in all fields.' : 'Harap isi semua kolom.', 'error');
    return;
  }

  const msg = APP.lang === 'en'
    ? `Thank you, ${company}! We'll contact ${contact} within 48 hours to discuss your reskilling partnership.`
    : `Terima kasih, ${company}! Kami akan menghubungi ${contact} dalam 48 jam untuk membahas kemitraan reskilling.`;
  showToast(msg, 'success');

  document.getElementById('employer-form').reset();
}

// ─────────────────────────────────────────
// RADAR BARS ANIMATION
// ─────────────────────────────────────────
function initRadarBars() {
  const radarEl = document.querySelector('.radar-display');
  if (!radarEl) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.sector-bar').forEach(bar => {
          const target = bar.getAttribute('data-width');
          bar.style.width = '0';
          setTimeout(() => { bar.style.width = target; }, 200);
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(radarEl);
}

// ─────────────────────────────────────────
// COUNTER ANIMATION
// ─────────────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = el.dataset.decimals || 0;
      let start = null;
      const duration = 1800;
      const step = ts => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = ease * target;
        el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setLang('en');
  initNav();
  initReveal();
  initChatbot();
  initRadarBars();
  animateCounters();

  // Simulation default render
  if (document.getElementById('sim-phases-container')) {
    renderSimulation();
  }

  // Show email popup after 3 seconds (only once per session)
  if (!sessionStorage.getItem('popup_dismissed')) {
    setTimeout(() => {
      const overlay = document.getElementById('popup-email');
      if (overlay) overlay.classList.add('open');
    }, 3000);
  }
});

// ─────────────────────────────────────────
// EMAIL POPUP
// ─────────────────────────────────────────
function closePopup() {
  const overlay = document.getElementById('popup-email');
  if (overlay) overlay.classList.remove('open');
  sessionStorage.setItem('popup_dismissed', '1');
}

function submitPopupEmail() {
  const input = document.getElementById('popup-email-input');
  const email = input?.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    input.style.borderColor = 'var(--danger)';
    input.placeholder = APP.lang === 'en' ? 'Please enter a valid email' : 'Masukkan email yang valid';
    return;
  }
  // Save email and close popup
  localStorage.setItem('valtrix_lead_email', email);
  closePopup();
  showToast(
    APP.lang === 'en'
      ? `✅ Got it! We'll send your free risk assessment to ${email}`
      : `✅ Siap! Asesmen risiko gratis akan dikirim ke ${email}`,
    'success'
  );
  // Pre-fill register modal email
  setTimeout(() => {
    const regEmail = document.getElementById('reg-email');
    if (regEmail) regEmail.value = email;
  }, 500);
}

// ─────────────────────────────────────────
// FAQ TOGGLE
// ─────────────────────────────────────────
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  // Open clicked if it was closed
  if (!isOpen) item.classList.add('open');
}