// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const youtubeIframes = document.querySelectorAll('.js-youtube');
const videoBackdrop = document.getElementById('videoBackdrop');
const closeVideoBtns = document.querySelectorAll('.btn-close-video');
let activePlayer = null;
let activeWrapper = null;
const playerMap = new Map();

function setActiveTab(tabName) {
    // Reset kuis jika keluar dari tab kuis
    const currentActiveTab = document.querySelector('.tab-content.active');
    if (currentActiveTab && currentActiveTab.id === 'kuis' && tabName !== 'kuis') {
        resetQuiz();
    }
    
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    const targetBtn = [...tabBtns].find(btn => btn.dataset.tab === tabName);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    if (tabName !== 'video' && activeWrapper) {
        const iframe = activeWrapper.querySelector('iframe');
        collapseVideo(activeWrapper, activePlayer, true, iframe);
    }
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
});

document.querySelectorAll('.btn-hero[data-target]').forEach(btn => {
    btn.classList.add('tab-trigger');
});

const tabTriggers = document.querySelectorAll('.tab-trigger[data-target]');
const theoryTabButtons = document.querySelectorAll('.theory-tab-btn');
const theoryPanels = document.querySelectorAll('.theory-tab-panel');

function handleTabTriggerClick(target) {
    if (!target) return;
    setActiveTab(target);
    const targetSection = document.getElementById(target);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => handleTabTriggerClick(trigger.dataset.target));
    trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleTabTriggerClick(trigger.dataset.target);
        }
    });
});

function setActiveTheoryTab(targetId) {
    if (!targetId) return;
    theoryTabButtons.forEach(btn => {
        const isActive = btn.dataset.target === targetId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });

    theoryPanels.forEach(panel => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
        panel.setAttribute('aria-hidden', String(!isActive));
    });
}

function initTheoryTabs() {
    if (theoryTabButtons.length === 0 || theoryPanels.length === 0) return;

    theoryPanels.forEach(panel => {
        const isActive = panel.classList.contains('active');
        panel.hidden = !isActive;
        panel.setAttribute('aria-hidden', String(!isActive));
    });

    theoryTabButtons.forEach(btn => {
        btn.addEventListener('click', () => setActiveTheoryTab(btn.dataset.target));
        btn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveTheoryTab(btn.dataset.target);
            }
        });
    });
}

initTheoryTabs();

if (youtubeIframes.length > 0) {
    const ytScript = document.createElement('script');
    ytScript.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(ytScript);
}

function expandVideo(wrapper, player) {
    if (!wrapper || !player) return;
    if (activePlayer && activePlayer !== player && activeWrapper) {
        collapseVideo(activeWrapper, activePlayer, true, activeWrapper.querySelector('iframe'));
    }
    activeWrapper = wrapper;
    activePlayer = player;
    wrapper.classList.add('expanded');
    document.body.classList.add('modal-open');
    if (videoBackdrop) {
        videoBackdrop.classList.remove('hidden');
    }
}

function collapseVideo(wrapper, player, shouldStop = false, iframeEl = null) {
    if (!wrapper) return;
    wrapper.classList.remove('expanded');
    if (videoBackdrop) {
        videoBackdrop.classList.add('hidden');
    }
    document.body.classList.remove('modal-open');

    if (shouldStop) {
        if (player && typeof player.stopVideo === 'function') {
            player.stopVideo();
        } else if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
        } else if (iframeEl) {
            const currentSrc = iframeEl.src;
            iframeEl.src = currentSrc;
        }
    }

    if (activePlayer === player) {
        activePlayer = null;
        activeWrapper = null;
    }
}

function handlePlayerStateChange(event) {
    if (!window.YT) return;
    const iframe = event.target?.getIframe?.();
    const wrapper = iframe?.closest('.video-wrapper');
    if (!wrapper) return;

    if (event.data === YT.PlayerState.PLAYING) {
        expandVideo(wrapper, event.target);
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        collapseVideo(wrapper, event.target);
    }
}

window.onYouTubeIframeAPIReady = function () {
    youtubeIframes.forEach(iframe => {
        const player = new YT.Player(iframe, {
            events: {
                onStateChange: handlePlayerStateChange
            }
        });
        if (iframe.id) {
            playerMap.set(iframe.id, player);
        }
    });
};

if (videoBackdrop) {
    videoBackdrop.addEventListener('click', () => {
        if (activeWrapper) {
            const iframe = activeWrapper.querySelector('iframe');
            collapseVideo(activeWrapper, activePlayer, true, iframe);
        }
    });
}

closeVideoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const wrapper = btn.closest('.video-wrapper');
        if (!wrapper) return;
        const iframe = wrapper.querySelector('iframe');
        const player = iframe?.id ? playerMap.get(iframe.id) : null;
        collapseVideo(wrapper, player, true, iframe);
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeWrapper) {
        const iframe = activeWrapper.querySelector('iframe');
        collapseVideo(activeWrapper, activePlayer, true, iframe);
    }
});

const funFacts = [
    'Tahukah kamu? Ion positif dan negatif bergerak seperti magnet kecil yang saling mencari pasangan!',
    'Sparky suka warna-warni! Setiap ion memiliki warna khas pada simulasi agar kamu mudah mengenalinya.',
    'Dalam 1 menit, ion bisa menempuh "maraton mini" di dalam larutan saat tegangan cukup besar.',
    'Elektrolisis membantu membuat permen berwarna cerah karena pewarna makanan dibuat dengan proses kimia listrik.',
    'Gas hidrogen hasil elektrolisis bisa dipakai sebagai bahan bakar roket ramah lingkungan!',
    'Elektrolisis pertama kali dipelajari serius oleh ilmuwan bernama Michael Faraday hampir 200 tahun lalu.'
];

const funFactText = document.getElementById('funFactText');
const funFactBtn = document.getElementById('newFunFact');
let lastFunFactIndex = -1;

function showRandomFunFact() {
    if (!funFactText) return;
    let index;
    do {
        index = Math.floor(Math.random() * funFacts.length);
    } while (index === lastFunFactIndex && funFacts.length > 1);
    lastFunFactIndex = index;
    funFactText.textContent = funFacts[index];
    funFactText.classList.remove('pop');
    void funFactText.offsetWidth; // retrigger animation
    funFactText.classList.add('pop');
}

if (funFactBtn) {
    funFactBtn.addEventListener('click', showRandomFunFact);
}

if (funFactText) {
    funFactText.addEventListener('animationend', () => funFactText.classList.remove('pop'));
}

showRandomFunFact();

const timelineSteps = document.querySelectorAll('.timeline-step');
const stepDetailTitle = document.getElementById('stepDetailTitle');
const stepDetailText = document.getElementById('stepDetailText');
const stepDetailCard = document.getElementById('stepDetailCard');

stepDetailCard?.addEventListener('animationend', () => stepDetailCard.classList.remove('animate'));

if (timelineSteps.length) {
    const activateStep = (step) => {
        timelineSteps.forEach(item => {
            const trigger = item.querySelector('.step-trigger');
            const isActive = item === step;
            item.classList.toggle('active', isActive);
            trigger?.setAttribute('aria-expanded', String(isActive));
        });

        const titleFallback = step.querySelector('.step-content h4')?.textContent?.trim() || 'Langkah Elektrolisis';
        const textFallback = step.querySelector('.step-content p')?.textContent?.trim() || '';
        const nextTitle = step.dataset.detailTitle || titleFallback;
        const nextText = step.dataset.detailText || textFallback;

        if (stepDetailTitle) {
            stepDetailTitle.textContent = nextTitle;
        }
        if (stepDetailText) {
            stepDetailText.textContent = nextText;
        }
        if (stepDetailCard) {
            stepDetailCard.classList.add('has-selection');
            stepDetailCard.classList.remove('animate');
            void stepDetailCard.offsetWidth;
            stepDetailCard.classList.add('animate');
        }
    };

    const prefersHover = window.matchMedia('(hover: hover) and (pointer: fine)');

    timelineSteps.forEach(step => {
        const trigger = step.querySelector('.step-trigger');
        if (!trigger) {
            return;
        }
        trigger.addEventListener('click', () => activateStep(step));
        trigger.addEventListener('focus', () => activateStep(step));
        trigger.addEventListener('mouseenter', () => {
            if (prefersHover.matches) {
                activateStep(step);
            }
        });
    });

    activateStep(timelineSteps[0]);
}

const definitionCards = document.querySelectorAll('.definition-item');

definitionCards.forEach(card => {
    const frontFace = card.querySelector('.definition-front');
    const backFace = card.querySelector('.definition-back');

    const setExpanded = (expanded) => {
        card.setAttribute('aria-expanded', String(expanded));
        frontFace?.setAttribute('aria-hidden', String(expanded));
        backFace?.setAttribute('aria-hidden', String(!expanded));
    };

    setExpanded(false);

    card.addEventListener('click', () => {
        const isActive = card.classList.toggle('is-flipped');
        setExpanded(isActive);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && card.classList.contains('is-flipped')) {
            card.classList.remove('is-flipped');
            setExpanded(false);
            card.blur();
        }
    });
});

const electrodeCards = document.querySelectorAll('.electrode-item');

electrodeCards.forEach(card => {
    const frontFace = card.querySelector('.electrode-front');
    const backFace = card.querySelector('.electrode-back');

    const setExpanded = (expanded) => {
        card.setAttribute('aria-expanded', String(expanded));
        frontFace?.setAttribute('aria-hidden', String(expanded));
        backFace?.setAttribute('aria-hidden', String(!expanded));
    };

    setExpanded(false);

    card.addEventListener('click', () => {
        const isActive = card.classList.toggle('is-flipped');
        setExpanded(isActive);
    });

    card.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && card.classList.contains('is-flipped')) {
            card.classList.remove('is-flipped');
            setExpanded(false);
            card.blur();
        }
    });
});

// Simulation Variables
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
let animationId;
let isRunning = false;
let particles = [];
let timeElapsed = 0;

// Control Elements
const electrolyteSelect = document.getElementById('electrolyte');
const voltageSlider = document.getElementById('voltage');
const currentSlider = document.getElementById('current');
const timeSlider = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const simulationOutputsPanel = document.querySelector('.simulation-outputs');
const cathodaReactionEl = document.getElementById('cathodaReaction');
const anodaReactionEl = document.getElementById('anodaReaction');
const massResultEl = document.getElementById('massResult');
const volumeResultEl = document.getElementById('volumeResult');

function hideSimulationOutputs() {
    if (simulationOutputsPanel) {
        simulationOutputsPanel.classList.add('hidden');
    }
    if (cathodaReactionEl) {
        cathodaReactionEl.textContent = '-';
    }
    if (anodaReactionEl) {
        anodaReactionEl.textContent = '-';
    }
    if (massResultEl) {
        massResultEl.textContent = 'Massa zat akan muncul setelah kamu klik "Mulai Elektrolisis"!';
    }
    if (volumeResultEl) {
        volumeResultEl.textContent = 'Volume gas akan terlihat setelah simulasi berjalan.';
    }
}

// Update slider values
voltageSlider.addEventListener('input', (e) => {
    document.getElementById('voltageValue').textContent = e.target.value;
    if (!simulationOutputsPanel || !simulationOutputsPanel.classList.contains('hidden')) {
        updateReactionInfo();
    }
});

currentSlider.addEventListener('input', (e) => {
    document.getElementById('currentValue').textContent = e.target.value;
    if (!simulationOutputsPanel || !simulationOutputsPanel.classList.contains('hidden')) {
        updateReactionInfo();
    }
});

timeSlider.addEventListener('input', (e) => {
    document.getElementById('timeValue').textContent = e.target.value;
    if (!simulationOutputsPanel || !simulationOutputsPanel.classList.contains('hidden')) {
        updateReactionInfo();
    }
});

// Electrolyte data
const electrolytes = {
    CuSO4: {
        name: 'Tembaga Sulfat',
        cathoda: 'Cu²⁺ + 2e⁻ → Cu',
        anoda: '2H₂O → O₂ + 4H⁺ + 4e⁻',
        color: '#b87333',
        cationColor: '#4a90e2',
        anionColor: '#e74c3c',
        Mr: 63.5,
        n: 2
    },
    NaCl: {
        name: 'Natrium Klorida',
        cathoda: '2H₂O + 2e⁻ → H₂ + 2OH⁻',
        anoda: '2Cl⁻ → Cl₂ + 2e⁻',
        color: '#ecf0f1',
        cationColor: '#9b59b6',
        anionColor: '#27ae60',
        Mr: 35.5,
        n: 1
    },
    H2SO4: {
        name: 'Asam Sulfat',
        cathoda: '2H⁺ + 2e⁻ → H₂',
        anoda: '2H₂O → O₂ + 4H⁺ + 4e⁻',
        color: '#e8f8f5',
        cationColor: '#e74c3c',
        anionColor: '#3498db',
        Mr: 2,
        n: 2
    },
    AgNO3: {
        name: 'Perak Nitrat',
        cathoda: 'Ag⁺ + e⁻ → Ag',
        anoda: '2H₂O → O₂ + 4H⁺ + 4e⁻',
        color: '#c0c0c0',
        cationColor: '#95a5a6',
        anionColor: '#e67e22',
        Mr: 107.9,
        n: 1
    }
};

// Particle class
class Particle {
    constructor(x, y, type, color) {
        this.x = x;
        this.y = y;
        this.type = type; // 'cation' or 'anion'
        this.color = color;
        this.radius = 8;
        this.speed = 1.5;
        this.targetX = type === 'cation' ? 150 : 650;
    }

    update() {
        if (this.type === 'cation' && this.x > this.targetX) {
            this.x -= this.speed;
        } else if (this.type === 'anion' && this.x < this.targetX) {
            this.x += this.speed;
        }
        this.y += Math.sin(this.x * 0.02) * 0.5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw + or - sign
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'cation' ? '+' : '-', this.x, this.y);
    }
}

// Draw the electrolysis cell
function drawCell() {
    const electrolyte = electrolytes[electrolyteSelect.value];
    
    // Clear canvas with colorful gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#120d31');
    bgGradient.addColorStop(0.5, '#2d3a7c');
    bgGradient.addColorStop(1, '#4cc9f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw container (beaker)
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(200, 400);
    ctx.lineTo(600, 400);
    ctx.lineTo(600, 100);
    ctx.stroke();
    
    // Draw electrolyte solution
    ctx.fillStyle = electrolyte.color + '40';
    ctx.fillRect(200, 150, 400, 250);
    
    // Draw cathoda (left electrode) - negative
    ctx.fillStyle = '#ff6f91';
    ctx.fillRect(140, 120, 20, 280);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('-', 150, 100);
    ctx.font = '16px Arial';
    ctx.fillText('Katoda', 150, 430);
    
    // Draw anoda (right electrode) - positive
    ctx.fillStyle = '#6c63ff';
    ctx.fillRect(640, 120, 20, 280);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('+', 650, 100);
    ctx.font = '16px Arial';
    ctx.fillText('Anoda', 650, 430);
    
    // Draw battery
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 80);
    ctx.lineTo(150, 30);
    ctx.lineTo(400, 30);
    ctx.lineTo(650, 30);
    ctx.lineTo(650, 80);
    ctx.stroke();
    
    // Battery symbol
    ctx.fillStyle = '#ff7b54';
    ctx.fillRect(390, 20, 5, 20);
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(405, 25, 5, 10);
    
    // Voltage indicator
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(voltageSlider.value + 'V', 400, 60);
    
    // Draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Draw bubbles at electrodes if running
    if (isRunning && Math.random() > 0.7) {
        drawBubble(150, 150 + Math.random() * 200, 5);
        drawBubble(650, 150 + Math.random() * 200, 5);
    }
}

function drawBubble(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
}

// Initialize particles
function initParticles() {
    particles = [];
    const electrolyte = electrolytes[electrolyteSelect.value];
    
    for (let i = 0; i < 30; i++) {
        const x = 220 + Math.random() * 360;
        const y = 160 + Math.random() * 230;
        const type = Math.random() > 0.5 ? 'cation' : 'anion';
        const color = type === 'cation' ? electrolyte.cationColor : electrolyte.anionColor;
        particles.push(new Particle(x, y, type, color));
    }
}

// Animation loop
function animate() {
    drawCell();
    
    if (isRunning) {
        timeElapsed += 0.016; // ~60fps
        
        // Add new particles occasionally
        if (Math.random() > 0.95) {
            const electrolyte = electrolytes[electrolyteSelect.value];
            const x = 220 + Math.random() * 360;
            const y = 160 + Math.random() * 230;
            const type = Math.random() > 0.5 ? 'cation' : 'anion';
            const color = type === 'cation' ? electrolyte.cationColor : electrolyte.anionColor;
            particles.push(new Particle(x, y, type, color));
        }
        
        // Remove particles that reached electrodes
        particles = particles.filter(p => {
            if (p.type === 'cation' && p.x <= 160) return false;
            if (p.type === 'anion' && p.x >= 640) return false;
            return true;
        });
    }
    
    animationId = requestAnimationFrame(animate);
}

// Update reaction info
function updateReactionInfo() {
    if (!cathodaReactionEl || !anodaReactionEl || !massResultEl || !volumeResultEl) {
        return;
    }
    const electrolyte = electrolytes[electrolyteSelect.value];
    const current = parseFloat(currentSlider.value);
    const time = parseFloat(timeSlider.value) * 60; // convert to seconds
    
    cathodaReactionEl.textContent = electrolyte.cathoda;
    anodaReactionEl.textContent = electrolyte.anoda;
    
    // Calculate mass using Faraday's law
    const Q = current * time; // Coulombs
    const F = 96500; // Faraday constant
    const mass = (Q * electrolyte.Mr) / (electrolyte.n * F);
    
    massResultEl.textContent = `Massa zat yang diendapkan: ${mass.toFixed(4)} gram`;
    
    // Calculate volume of gas (if applicable)
    const moles = Q / (electrolyte.n * F);
    const volume = moles * 22.4; // L at STP
    volumeResultEl.textContent = `Volume gas yang dihasilkan: ${volume.toFixed(4)} L (STP)`;
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startBtn.textContent = 'Stop';
        startBtn.style.background = 'linear-gradient(135deg, #ff6f91 0%, #ff9671 100%)';
        updateReactionInfo();
        if (simulationOutputsPanel) {
            const wasHidden = simulationOutputsPanel.classList.contains('hidden');
            simulationOutputsPanel.classList.remove('hidden');
            if (wasHidden) {
                simulationOutputsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    } else {
        isRunning = false;
        startBtn.textContent = 'Mulai Elektrolisis';
        startBtn.style.background = 'linear-gradient(135deg, #7c4dff 0%, #c084fc 100%)';
    }
});

resetBtn.addEventListener('click', () => {
    isRunning = false;
    timeElapsed = 0;
    startBtn.textContent = 'Mulai Elektrolisis';
    startBtn.style.background = 'linear-gradient(135deg, #7c4dff 0%, #c084fc 100%)';
    initParticles();
    hideSimulationOutputs();
});

electrolyteSelect.addEventListener('change', () => {
    initParticles();
    if (!simulationOutputsPanel || !simulationOutputsPanel.classList.contains('hidden')) {
        updateReactionInfo();
    }
});

// Quiz Data
const quizData = [
    {
        question: 'Apa yang dimaksud dengan sel elektrolisis?',
        type: 'multiple',
        options: [
            'Sel yang menghasilkan listrik dari reaksi kimia spontan',
            'Sel yang menggunakan energi listrik untuk reaksi kimia tidak spontan',
            'Sel yang menyimpan energi listrik',
            'Sel yang mengubah energi mekanik menjadi listrik'
        ],
        correct: 1
    },
    {
        question: 'Di elektroda manakah terjadi reaksi reduksi?',
        type: 'multiple',
        options: [
            'Anoda',
            'Katoda',
            'Kedua elektroda',
            'Tidak ada yang benar'
        ],
        correct: 1
    },
    {
        question: 'Berapa nilai konstanta Faraday?',
        type: 'multiple',
        options: [
            '96.500 C/mol',
            '6.022 × 10²³',
            '8.314 J/mol·K',
            '9.81 m/s²'
        ],
        correct: 0
    },
    {
        question: 'Pada elektrolisis larutan CuSO₄, zat apa yang mengendap di katoda?',
        type: 'multiple',
        options: [
            'Gas oksigen',
            'Gas hidrogen',
            'Tembaga (Cu)',
            'Belerang (S)'
        ],
        correct: 2
    },
    {
        question: 'Aplikasi elektrolisis dalam industri adalah...',
        type: 'multiple',
        options: [
            'Pembuatan baterai',
            'Penyepuhan logam',
            'Pembuatan semikonduktor',
            'Semua benar'
        ],
        correct: 3
    },
    {
        question: 'Berapa massa tembaga (Cu) yang diendapkan jika arus 2A dialirkan selama 965 detik? (Ar Cu = 64, F = 96500 C/mol, valensi Cu = 2). Jawab dalam gram (angka saja)',
        type: 'essay',
        correct: '0.64'
    },
    {
        question: 'Berapa volume gas H₂ (STP) yang dihasilkan dari elektrolisis air jika arus 5A dialirkan selama 1930 detik? (F = 96500 C/mol, Vm = 22.4 L/mol). Jawab dalam liter (angka saja)',
        type: 'essay',
        correct: '1.12'
    },
    {
        question: 'Jika pada elektrolisis digunakan arus 3A selama 3216,67 detik, berapa mol elektron yang dipindahkan? (F = 96500 C/mol). Jawab dalam mol (angka saja)',
        type: 'essay',
        correct: '0.1'
    },
    {
        question: 'Berapa waktu (dalam detik) yang diperlukan untuk mengendapkan 10.8 gram perak (Ag) dengan arus 2A? (Ar Ag = 108, F = 96500 C/mol, valensi Ag = 1). Jawab angka saja',
        type: 'essay',
        correct: '4825'
    },
    {
        question: 'Dalam sel elektrolisis, elektron mengalir dari...',
        type: 'multiple',
        options: [
            'Katoda ke anoda melalui larutan',
            'Anoda ke katoda melalui rangkaian luar',
            'Katoda ke anoda melalui rangkaian luar',
            'Tidak ada aliran elektron'
        ],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;
let answers = new Array(quizData.length).fill(null);
let answeredQuizQuestions = new Set(); // Melacak soal yang sudah dijawab
const progressFill = document.getElementById('progressFill');
const scoreDisplay = document.getElementById('score');
const totalQuestionsDisplay = document.getElementById('totalQuestions');
const questionCounterDisplay = document.getElementById('questionCounter');
const quizCelebration = document.getElementById('quizCelebration');
const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackEl = document.getElementById('feedback');
const submitAnswerBtn = document.getElementById('submitAnswer');
const nextQuestionBtn = document.getElementById('nextQuestion');
const prevQuestionBtn = document.getElementById('prevQuestion');

function loadQuestion() {
    const question = quizData[currentQuestion];
    if (!optionsContainer) return;
    if (questionTextEl) {
        questionTextEl.textContent = `${currentQuestion + 1}. ${question.question}`;
    }
    
    optionsContainer.innerHTML = '';
    
    const isAlreadyAnswered = answeredQuizQuestions.has(currentQuestion);
    
    if (question.type === 'essay') {
        // Soal essay - input angka
        const inputDiv = document.createElement('div');
        inputDiv.className = 'essay-input-container';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'essayAnswer';
        input.className = 'essay-input no-spinner';
        input.placeholder = 'Masukkan jawaban (angka saja)';
        input.step = 'any';
        
        if (answers[currentQuestion] !== null) {
            input.value = answers[currentQuestion];
        }
        
        // Jika sudah dijawab, nonaktifkan input
        if (isAlreadyAnswered) {
            input.disabled = true;
            input.classList.add('disabled');
            // Tampilkan hasil benar/salah
            const userAnswer = answers[currentQuestion].toString().replace(',', '.').trim();
            const correctAnswer = question.correct.toString();
            if (userAnswer === correctAnswer) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
            }
        } else {
            input.addEventListener('input', () => {
                answers[currentQuestion] = input.value.trim();
            });
        }
        
        inputDiv.appendChild(input);
        optionsContainer.appendChild(inputDiv);
    } else {
        // Soal pilihan ganda
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.textContent = option;
            optionDiv.dataset.index = index;
            
            if (answers[currentQuestion] === index) {
                optionDiv.classList.add('selected');
            }
            
            // Jika sudah dijawab, tampilkan hasil dan nonaktifkan
            if (isAlreadyAnswered) {
                optionDiv.classList.add('disabled');
                if (index === question.correct) {
                    optionDiv.classList.add('correct');
                } else if (answers[currentQuestion] === index) {
                    optionDiv.classList.add('incorrect');
                }
            } else {
                optionDiv.addEventListener('click', () => {
                    document.querySelectorAll('.option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    optionDiv.classList.add('selected');
                    answers[currentQuestion] = index;
                });
            }
            
            optionsContainer.appendChild(optionDiv);
        });
    }
    
    if (questionCounterDisplay) {
        questionCounterDisplay.textContent = `${currentQuestion + 1} / ${quizData.length}`;
    }
    
    // Selalu kosongkan feedback (tidak menampilkan keterangan jawaban)
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }
    
    // Nonaktifkan tombol submit jika sudah dijawab
    if (submitAnswerBtn) {
        if (isAlreadyAnswered) {
            submitAnswerBtn.disabled = true;
            submitAnswerBtn.classList.add('disabled');
        } else {
            submitAnswerBtn.disabled = false;
            submitAnswerBtn.classList.remove('disabled');
        }
    }
    
    updateQuizProgress();
}

function updateQuizProgress() {
    if (progressFill) {
        const progress = ((currentQuestion + 1) / quizData.length) * 100;
        progressFill.style.width = `${progress}%`;
    }
    if (questionCounterDisplay) {
        questionCounterDisplay.textContent = `${currentQuestion + 1} / ${quizData.length}`;
    }
    if (totalQuestionsDisplay) {
        totalQuestionsDisplay.textContent = quizData.length;
    }
}

function launchStars(count = 12) {
    if (!quizCelebration) return;
    for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${50 + Math.random() * 30}%`;
        star.style.animationDelay = `${Math.random() * 0.4}s`;
        quizCelebration.appendChild(star);
        setTimeout(() => star.remove(), 1200);
    }
}

// Audio feedback functions
function playCorrectSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play two ascending tones for correct answer
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (happy chord)
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
        gainNode.gain.exponentialDecayToValueAtTime = 0.01;
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
        gainNode.gain.exponentialDecayTo = 0.01;
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);
        
        oscillator.start(audioCtx.currentTime + i * 0.1);
        oscillator.stop(audioCtx.currentTime + i * 0.1 + 0.3);
    });
}

function playIncorrectSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play "tetot" sound - two short beeps descending
    const frequencies = [400, 300];
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'square';
        
        const startTime = audioCtx.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.linearRampToValueAtTime(0.01, startTime + 0.12);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.12);
    });
}

if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', () => {
    // Cek apakah sudah dijawab
    if (answeredQuizQuestions.has(currentQuestion)) {
        return;
    }
    
    if (answers[currentQuestion] === null || answers[currentQuestion] === '') {
        alert('Pilih atau isi jawaban dulu ya, Bintang Kimia!');
        return;
    }
    
    // Tandai soal sebagai sudah dijawab
    answeredQuizQuestions.add(currentQuestion);
    
    const question = quizData[currentQuestion];
    
    if (question.type === 'essay') {
        // Validasi jawaban essay
        const userAnswer = answers[currentQuestion].toString().replace(',', '.').trim();
        const correctAnswer = question.correct.toString();
        const essayInput = document.getElementById('essayAnswer');
        
        if (userAnswer === correctAnswer) {
            if (essayInput) {
                essayInput.classList.add('correct');
                essayInput.disabled = true;
            }
            playCorrectSound();
            launchStars();
        } else {
            if (essayInput) {
                essayInput.classList.add('incorrect');
                essayInput.disabled = true;
            }
            playIncorrectSound();
        }
    } else {
        // Validasi jawaban pilihan ganda
        const options = document.querySelectorAll('.option');
        
        if (answers[currentQuestion] === question.correct) {
            options[answers[currentQuestion]].classList.add('correct');
            playCorrectSound();
            launchStars();
        } else {
            options[answers[currentQuestion]].classList.add('incorrect');
            options[question.correct].classList.add('correct');
            playIncorrectSound();
        }
        
        // Nonaktifkan semua option setelah dijawab
        options.forEach(opt => opt.classList.add('disabled'));
    }
    
    // Nonaktifkan tombol submit setelah dijawab
    if (submitAnswerBtn) {
        submitAnswerBtn.disabled = true;
        submitAnswerBtn.classList.add('disabled');
    }
    
    // Calculate score
    score = 0;
    answers.forEach((answer, idx) => {
        const q = quizData[idx];
        if (q.type === 'essay') {
            if (answer !== null && answer.toString().replace(',', '.').trim() === q.correct.toString()) {
                score++;
            }
        } else {
            if (answer === q.correct) score++;
        }
    });
    if (scoreDisplay) {
        scoreDisplay.textContent = score;
    }
    updateQuizProgress();
    });
}

if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', () => {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
    });
}

if (prevQuestionBtn) {
    prevQuestionBtn.addEventListener('click', () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
    });
}

// Fungsi untuk reset kuis
function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = new Array(quizData.length).fill(null);
    answeredQuizQuestions.clear();
    
    if (scoreDisplay) {
        scoreDisplay.textContent = '0';
    }
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }
    if (submitAnswerBtn) {
        submitAnswerBtn.disabled = false;
        submitAnswerBtn.classList.remove('disabled');
    }
    
    loadQuestion();
}

// Game Edukatif - Ular Tangga Elektrolisis
const boardElement = document.getElementById('gameBoard');
const diceValueEl = document.getElementById('diceValue');
const rollDiceBtn = document.getElementById('rollDice');
const resetGameBtn = document.getElementById('resetGame');
const gameMessageEl = document.getElementById('gameMessage');
const questionModal = document.getElementById('gameQuestion');
const gameQuestionTextEl = document.getElementById('gameQuestionText');
const gameOptionsEl = document.getElementById('gameOptions');
const closeQuestionBtn = document.getElementById('closeQuestion');
const playerPanels = document.querySelectorAll('.player-panel');

const BOARD_SIZE = 30;
const ROW_SIZE = 6;
const ladders = {
    3: 11,
    7: 16,
    12: 22,
    18: 27
};

const snakes = {
    14: 5,
    21: 9,
    25: 17,
    29: 20
};

const gameQuestions = [
    {
        question: 'Apa tujuan utama proses elektrolisis?',
        type: 'multiple',
        options: [
            'Menghasilkan listrik dari reaksi spontan',
            'Menggunakan listrik untuk memaksa reaksi kimia berjalan',
            'Mengubah energi panas menjadi listrik',
            'Menurunkan suhu larutan elektrolit'
        ],
        correct: 1,
        reward: 10,
        explanation: 'Elektrolisis memakai energi listrik untuk menjalankan reaksi kimia yang tidak spontan.'
    },
    {
        question: 'Elektroda manakah yang memiliki muatan negatif pada sel elektrolisis?',
        type: 'multiple',
        options: ['Katoda', 'Anoda', 'Keduanya bermuatan positif', 'Tidak ada muatan'],
        correct: 0,
        reward: 10,
        explanation: 'Katoda menerima elektron dari sumber listrik sehingga bermuatan negatif.'
    },
    {
        question: 'Berapa massa tembaga (gram) yang diendapkan jika arus 2A dialirkan selama 965 detik? (Ar Cu=64, F=96500, valensi=2). Jawab angka saja.',
        type: 'essay',
        correct: '0.64',
        reward: 15,
        explanation: 'Menggunakan rumus m = (I × t × Ar) / (n × F) = (2 × 965 × 64) / (2 × 96500) = 0.64 gram'
    },
    {
        question: 'Ion apa yang bergerak menuju anoda?',
        type: 'multiple',
        options: ['Kation', 'Anion', 'Atom netral', 'Molekul air'],
        correct: 1,
        reward: 10,
        explanation: 'Anion bermuatan negatif tertarik menuju anoda yang bermuatan positif.'
    },
    {
        question: 'Jika arus 5A dialirkan selama 1930 detik, berapa mol elektron yang dipindahkan? (F=96500). Jawab angka saja.',
        type: 'essay',
        correct: '0.1',
        reward: 15,
        explanation: 'Menggunakan rumus n = (I × t) / F = (5 × 1930) / 96500 = 0.1 mol'
    },
    {
        question: 'Mengapa sel elektrolisis membutuhkan sumber listrik searah (DC)?',
        type: 'multiple',
        options: [
            'Agar elektron mengalir satu arah tetap ke elektroda',
            'Supaya elektroda tetap bersuhu rendah',
            'Untuk membuat larutan berputar',
            'Agar reaksi berlangsung spontan'
        ],
        correct: 0,
        reward: 10,
        explanation: 'Arus DC menjaga arah aliran elektron sehingga katoda dan anoda memiliki peran tetap selama proses.'
    },
    {
        question: 'Berapa waktu (detik) yang diperlukan untuk mengendapkan 5.4 gram perak dengan arus 1A? (Ar Ag=108, F=96500, valensi=1). Jawab angka saja.',
        type: 'essay',
        correct: '4825',
        reward: 15,
        explanation: 'Menggunakan rumus t = (m × n × F) / (I × Ar) = (5.4 × 1 × 96500) / (1 × 108) = 4825 detik'
    },
    {
        question: 'Elektroda inert sering dipilih karena...',
        type: 'multiple',
        options: [
            'Mereka ikut bereaksi menghasilkan gas tambahan',
            'Mereka tidak ikut bereaksi sehingga hanya menyalurkan elektron',
            'Mereka membuat arus menjadi AC',
            'Mereka mengubah larutan menjadi padat'
        ],
        correct: 1,
        reward: 10,
        explanation: 'Elektroda inert seperti grafit tidak teroksidasi atau tereduksi, sehingga hanya menjadi pengantar elektron.'
    },
    {
        question: 'Produk utama industri dari proses chlor-alkali adalah...',
        type: 'multiple',
        options: [
            'Asam sulfat dan gas oksigen',
            'Natrium hidroksida, gas klorin, dan gas hidrogen',
            'Perak murni dan gas nitrogen',
            'Tembaga murni dan gas karbon dioksida'
        ],
        correct: 1,
        reward: 15,
        explanation: 'Elektrolisis brine menghasilkan NaOH, Cl₂, dan H₂ yang menjadi bahan penting berbagai industri.'
    },
    {
        question: 'Berapa volume gas H₂ (liter, STP) yang dihasilkan jika arus 4A dialirkan selama 2412.5 detik? (F=96500, Vm=22.4 L/mol). Jawab angka saja.',
        type: 'essay',
        correct: '1.12',
        reward: 15,
        explanation: 'mol e = (4 × 2412.5)/96500 = 0.1 mol. Untuk H₂: 2e⁻ → 1 H₂, jadi mol H₂ = 0.05. Volume = 0.05 × 22.4 = 1.12 L'
    }
];

const questionMap = new Map();

function assignQuestionSquares() {
    questionMap.clear();

    const blockedSquares = new Set([1, BOARD_SIZE]);
    Object.keys(ladders).forEach(key => {
        const start = Number(key);
        const end = Number(ladders[start]);
        blockedSquares.add(start);
        blockedSquares.add(end);
    });
    Object.keys(snakes).forEach(key => {
        const start = Number(key);
        const end = Number(snakes[start]);
        blockedSquares.add(start);
        blockedSquares.add(end);
    });

    const availableSquares = [];
    for (let square = 2; square < BOARD_SIZE; square++) {
        if (!blockedSquares.has(square)) {
            availableSquares.push(square);
        }
    }

    const pool = [...availableSquares];
    gameQuestions.forEach(question => {
        if (pool.length === 0) {
            return;
        }
        const index = Math.floor(Math.random() * pool.length);
        const square = pool.splice(index, 1)[0];
        const questionData = { ...question, square };
        questionMap.set(square, questionData);
    });
}

const tokenOffsets = [
    { top: 6, left: 6 },
    { top: 6, right: 6 },
    { bottom: 6, left: 6 },
    { bottom: 6, right: 6 }
];

const players = [
    { id: 0, name: 'Pemain 1', tokenLabel: 'P1', className: 'player-0', position: 1, score: 0 },
    { id: 1, name: 'Pemain 2', tokenLabel: 'P2', className: 'player-1', position: 1, score: 0 },
    { id: 2, name: 'Pemain 3', tokenLabel: 'P3', className: 'player-2', position: 1, score: 0 },
    { id: 3, name: 'Pemain 4', tokenLabel: 'P4', className: 'player-3', position: 1, score: 0 }
];

const playerPositionEls = Array.from(playerPanels, panel => panel?.querySelector('.player-position'));
const playerScoreEls = Array.from(playerPanels, panel => panel?.querySelector('.player-score'));

let playerTokenEls = [];
let currentPlayerIndex = 0;
let statusMessage = 'Giliran Pemain 1, lempar dadu!';
let isRolling = false;
let isQuestionOpen = false;
let pendingAdvanceCallback = null;
let questionAnswered = false;
let winners = []; // Array untuk menyimpan 3 pemenang
let gameEnded = false;
const answeredQuestions = new Set();

function updateStatus(message) {
    if (typeof message === 'string') {
        statusMessage = message;
    }
    if (gameMessageEl) {
        gameMessageEl.textContent = statusMessage;
    }
    players.forEach((player, index) => {
        const panel = playerPanels[index];
        if (!panel) {
            return;
        }
        panel.classList.toggle('active', index === currentPlayerIndex && !gameEnded);
        panel.classList.toggle('winner', winners.includes(index));
        panel.setAttribute('aria-current', index === currentPlayerIndex && !gameEnded ? 'true' : 'false');
        const positionLabel = playerPositionEls[index];
        const scoreLabel = playerScoreEls[index];
        if (positionLabel) {
            positionLabel.textContent = player.position;
        }
        if (scoreLabel) {
            scoreLabel.textContent = player.score;
        }
    });
}

function applyTokenOffset(token, offset) {
    ['top', 'right', 'bottom', 'left'].forEach(prop => {
        token.style[prop] = offset[prop] !== undefined ? `${offset[prop]}px` : 'auto';
    });
}

function placePlayerToken(playerIndex) {
    if (!boardElement) return;
    const token = playerTokenEls[playerIndex];
    if (!token) return;
    const targetSquare = boardElement.querySelector(`[data-square="${players[playerIndex].position}"]`);
    if (targetSquare) {
        token.classList.remove('jump');
        targetSquare.appendChild(token);
        void token.offsetWidth;
        token.classList.add('jump');
    }
}

function createBoard() {
    if (!boardElement) return;
    boardElement.innerHTML = '';

    const totalRows = Math.ceil(BOARD_SIZE / ROW_SIZE);
    const rows = [];

    for (let rowFromBottom = 0; rowFromBottom < totalRows; rowFromBottom++) {
        const rowNumbers = [];
        const startNumber = rowFromBottom * ROW_SIZE + 1;
        for (let offset = 0; offset < ROW_SIZE; offset++) {
            const squareNumber = startNumber + offset;
            rowNumbers.push(squareNumber <= BOARD_SIZE ? squareNumber : null);
        }
        if (rowFromBottom % 2 === 1) {
            rowNumbers.reverse();
        }
        rows.push(rowNumbers);
    }

    for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex--) {
        rows[rowIndex].forEach(squareNumber => {
            if (squareNumber === null) {
                const filler = document.createElement('div');
                filler.className = 'board-square placeholder';
                boardElement.appendChild(filler);
                return;
            }

            const square = document.createElement('div');
            square.className = 'board-square';
            square.dataset.square = squareNumber.toString();

            if (ladders[squareNumber]) {
                square.classList.add('ladder-start');
            }
            if (snakes[squareNumber]) {
                square.classList.add('snake-start');
            }
            if (questionMap.has(squareNumber)) {
                square.classList.add('question-square');
            }
            if (squareNumber === 1) {
                square.classList.add('square-start');
            }
            if (squareNumber === BOARD_SIZE) {
                square.classList.add('square-finish');
            }

            const inner = document.createElement('div');
            inner.className = 'square-inner';

            if (squareNumber === 1) {
                const startTag = document.createElement('span');
                startTag.className = 'square-marker start-marker';
                startTag.textContent = 'Start';
                inner.appendChild(startTag);
            }

            const numberTag = document.createElement('span');
            numberTag.className = 'square-number';
            numberTag.textContent = squareNumber;
            inner.appendChild(numberTag);

            if (ladders[squareNumber]) {
                const tag = document.createElement('span');
                tag.className = 'square-tag ladder-tag';
                tag.textContent = `Naik ke ${ladders[squareNumber]}`;
                inner.appendChild(tag);
            }

            if (snakes[squareNumber]) {
                const tag = document.createElement('span');
                tag.className = 'square-tag snake-tag';
                tag.textContent = `Turun ke ${snakes[squareNumber]}`;
                inner.appendChild(tag);
            }

            if (questionMap.has(squareNumber)) {
                const tag = document.createElement('span');
                tag.className = 'square-tag question-tag';
                tag.textContent = 'Soal!';
                inner.appendChild(tag);
            }

            if (squareNumber === BOARD_SIZE) {
                const finishTag = document.createElement('span');
                finishTag.className = 'square-marker finish-marker';
                finishTag.textContent = 'Finish';
                inner.appendChild(finishTag);
            }

            square.appendChild(inner);
            boardElement.appendChild(square);
        });
    }

    playerTokenEls = players.map((player, index) => {
        const token = document.createElement('div');
        token.className = `player-token ${player.className}`;
        token.textContent = player.tokenLabel;
        applyTokenOffset(token, tokenOffsets[index] || {});
        return token;
    });

    players.forEach((player, index) => {
        player.position = 1;
        placePlayerToken(index);
    });
}

function movePlayerTo(playerIndex, destination, onComplete) {
    const player = players[playerIndex];
    if (player.position === destination) {
        onComplete();
        return;
    }
    const direction = destination > player.position ? 1 : -1;
    player.position += direction;
    placePlayerToken(playerIndex);
    updateStatus(`${player.name} berada di petak ${player.position}.`);
    setTimeout(() => movePlayerTo(playerIndex, destination, onComplete), 320);
}

function animateDice(finalValue, onComplete) {
    if (!diceValueEl) {
        onComplete();
        return;
    }
    const intervalMs = 110;
    const durationMs = 900;
    diceValueEl.classList.add('rolling');
    const diceInterval = setInterval(() => {
        diceValueEl.textContent = Math.floor(Math.random() * 6) + 1;
    }, intervalMs);
    setTimeout(() => {
        clearInterval(diceInterval);
        diceValueEl.classList.remove('rolling');
        diceValueEl.textContent = finalValue;
        onComplete();
    }, durationMs);
}

function canRollDice() {
    return !isRolling && !isQuestionOpen && !gameEnded;
}

// Audio untuk lempar dadu (seperti Ludo)
function playDiceSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Suara dadu menggelinding dan jatuh seperti Ludo
    const numBounces = 8;
    
    for (let i = 0; i < numBounces; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Noise-like sound untuk efek dadu
        oscillator.type = 'square';
        oscillator.frequency.value = 80 + Math.random() * 120;
        
        filter.type = 'lowpass';
        filter.frequency.value = 800 + Math.random() * 400;
        
        const startTime = audioCtx.currentTime + i * 0.06;
        const duration = 0.04 + (i * 0.008);
        
        // Volume menurun seiring waktu (dadu melambat)
        const volume = 0.25 * (1 - i / numBounces);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    // Suara "tok" akhir saat dadu berhenti
    setTimeout(() => {
        const finalOsc = audioCtx.createOscillator();
        const finalGain = audioCtx.createGain();
        
        finalOsc.connect(finalGain);
        finalGain.connect(audioCtx.destination);
        
        finalOsc.type = 'sine';
        finalOsc.frequency.value = 150;
        
        finalGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        finalGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        finalOsc.start(audioCtx.currentTime);
        finalOsc.stop(audioCtx.currentTime + 0.1);
    }, numBounces * 60);
}

// Audio dan animasi kemenangan
function playVictorySound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Fanfare kemenangan - nada naik
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C5 ke C6
    
    notes.forEach((freq, i) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioCtx.currentTime + i * 0.12;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.linearRampToValueAtTime(0.01, startTime + 0.15);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.15);
    });
}

function showMiniVictoryAnimation(playerIndex, rank) {
    const player = players[playerIndex];
    const rankText = rank === 1 ? '🥇 Juara 1' : rank === 2 ? '🥈 Juara 2' : '🥉 Juara 3';
    
    // Buat overlay animasi mini
    const overlay = document.createElement('div');
    overlay.className = 'mini-victory-overlay';
    
    overlay.innerHTML = `
        <div class="mini-victory-content">
            <div class="mini-victory-emoji">🎉</div>
            <h2 class="mini-victory-title">${player.name}</h2>
            <p class="mini-victory-rank">${rankText}</p>
            <div class="mini-confetti-container"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Tambahkan confetti mini
    const confettiContainer = overlay.querySelector('.mini-confetti-container');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#7c4dff', '#ff9f43', '#00c9a7'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 1 + 's';
        confetti.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        confettiContainer.appendChild(confetti);
    }
    
    // Play victory sound
    playVictorySound();
    
    // Hapus overlay setelah 2.5 detik
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    }, 2500);
}

function showVictoryAnimation() {
    // Buat overlay animasi
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    
    // Leaderboard 1: Urutan Finish
    const finishLeaderboard = winners.map((winnerIdx, rank) => {
        const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉';
        return `<div class="leaderboard-item">${medal} ${players[winnerIdx].name}</div>`;
    }).join('');
    
    // Leaderboard 2: Urutan Point (semua pemain, ambil top 3)
    const sortedByScore = [...players]
        .map((p, idx) => ({ ...p, originalIndex: idx }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    
    const scoreLeaderboard = sortedByScore.map((p, rank) => {
        const medal = rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉';
        return `<div class="leaderboard-item">${medal} ${p.name} - ${p.score} poin</div>`;
    }).join('');
    
    overlay.innerHTML = `
        <div class="victory-content victory-leaderboard">
            <div class="victory-trophy">🏆</div>
            <h2 class="victory-title">GAME SELESAI!</h2>
            
            <div class="leaderboards-container">
                <div class="leaderboard-box">
                    <h3 class="leaderboard-title">🏁 Urutan Finish</h3>
                    <div class="leaderboard-list">
                        ${finishLeaderboard}
                    </div>
                </div>
                
                <div class="leaderboard-box">
                    <h3 class="leaderboard-title">⭐ Perolehan Poin</h3>
                    <div class="leaderboard-list">
                        ${scoreLeaderboard}
                    </div>
                </div>
            </div>
            
            <button class="btn-primary victory-close-btn" onclick="closeLeaderboardAndReset()">Main Lagi</button>
            <div class="confetti-container"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Tambahkan confetti
    const confettiContainer = overlay.querySelector('.confetti-container');
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#7c4dff', '#ff9f43', '#00c9a7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        confettiContainer.appendChild(confetti);
    }
    
    // Play victory sound
    playVictorySound();
}

function handleVictory(playerIndex) {
    // Tambahkan ke daftar pemenang jika belum ada
    if (!winners.includes(playerIndex)) {
        winners.push(playerIndex);
        const rank = winners.length;
        const rankText = rank === 1 ? 'Juara 1' : rank === 2 ? 'Juara 2' : 'Juara 3';
        updateStatus(`🎉 ${players[playerIndex].name} finish sebagai ${rankText}!`);
        
        // Tampilkan animasi mini untuk setiap pemenang
        showMiniVictoryAnimation(playerIndex, rank);
        
        // Jika sudah 3 pemenang, game selesai
        if (winners.length >= 3) {
            gameEnded = true;
            if (rollDiceBtn) {
                rollDiceBtn.disabled = true;
            }
            pendingAdvanceCallback = null;
            isRolling = false;
            
            // Tampilkan leaderboard setelah delay
            setTimeout(() => showVictoryAnimation(), 1000);
            return;
        }
    }
    
    pendingAdvanceCallback = null;
    isRolling = false;
}

function processLanding(playerIndex, onComplete) {
    const player = players[playerIndex];
    
    // Jika pemain sudah finish, skip
    if (winners.includes(playerIndex)) {
        onComplete();
        return;
    }
    
    if (player.position === BOARD_SIZE) {
        handleVictory(playerIndex);
        // Lanjutkan game jika belum 3 pemenang
        if (!gameEnded) {
            onComplete();
        }
        return;
    }

    if (ladders[player.position]) {
        const destination = ladders[player.position];
        updateStatus(`${player.name} menemukan tangga ke petak ${destination}!`);
        setTimeout(() => movePlayerTo(playerIndex, destination, () => processLanding(playerIndex, onComplete)), 500);
        return;
    }

    if (snakes[player.position]) {
        const destination = snakes[player.position];
        updateStatus(`${player.name} tergelincir ke ular turun ke petak ${destination}.`);
        setTimeout(() => movePlayerTo(playerIndex, destination, () => processLanding(playerIndex, onComplete)), 500);
        return;
    }

    if (questionMap.has(player.position)) {
        updateStatus('Petak soal! Jawab pertanyaan elektrolisis.');
        pendingAdvanceCallback = () => {
            isRolling = false;
            advanceTurn();
        };
        handleQuestion(player.position, playerIndex);
        return;
    }

    onComplete();
}

function handleQuestion(squareNumber, playerIndex) {
    const questionData = questionMap.get(squareNumber);
    if (!questionData || !questionModal || !gameQuestionTextEl || !gameOptionsEl) {
        return;
    }

    isQuestionOpen = true;
    if (rollDiceBtn) {
        rollDiceBtn.disabled = true;
    }
    questionModal.classList.remove('hidden');
    gameQuestionTextEl.textContent = questionData.question;
    gameOptionsEl.innerHTML = '';
    closeQuestionBtn?.classList.add('hidden');
    questionAnswered = false;

    if (questionData.type === 'essay') {
        // Soal essay
        const inputContainer = document.createElement('div');
        inputContainer.className = 'game-essay-container';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'game-essay-input no-spinner';
        input.placeholder = 'Masukkan jawaban (angka saja)';
        input.step = 'any';
        
        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'game-option-btn game-submit-btn';
        submitBtn.textContent = 'Jawab';
        
        submitBtn.addEventListener('click', () => {
            if (submitBtn.disabled) return;
            
            const userAnswer = input.value.trim().replace(',', '.');
            
            // Validasi: jawaban wajib diisi
            if (userAnswer === '') {
                input.classList.add('shake');
                input.placeholder = 'Jawaban wajib diisi!';
                input.focus();
                setTimeout(() => input.classList.remove('shake'), 500);
                return;
            }
            
            submitBtn.disabled = true;
            input.disabled = true;
            
            if (userAnswer === questionData.correct) {
                input.classList.add('correct');
                players[playerIndex].score += questionData.reward;
                updateStatus(`${players[playerIndex].name} benar! ${questionData.explanation}`);
                playCorrectSound();
            } else {
                input.classList.add('incorrect');
                updateStatus(`${players[playerIndex].name} belum tepat. Jawaban: ${questionData.correct}. ${questionData.explanation}`);
                playIncorrectSound();
            }
            answeredQuestions.add(squareNumber);
            questionAnswered = true;
            closeQuestionBtn?.classList.remove('hidden');
            closeQuestionBtn?.focus();
        });
        
        inputContainer.appendChild(input);
        inputContainer.appendChild(submitBtn);
        gameOptionsEl.appendChild(inputContainer);
    } else {
        // Soal pilihan ganda
        questionData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'game-option-btn';
            button.textContent = option;
            button.addEventListener('click', () => {
                if (button.disabled) {
                    return;
                }
                Array.from(gameOptionsEl.children).forEach(opt => {
                    opt.disabled = true;
                });
                if (index === questionData.correct) {
                    button.classList.add('correct');
                    players[playerIndex].score += questionData.reward;
                    updateStatus(`${players[playerIndex].name} benar! ${questionData.explanation}`);
                    playCorrectSound();
                } else {
                    button.classList.add('incorrect');
                    updateStatus(`${players[playerIndex].name} belum tepat. ${questionData.explanation}`);
                    playIncorrectSound();
                }
                answeredQuestions.add(squareNumber);
                questionAnswered = true;
                closeQuestionBtn?.classList.remove('hidden');
                closeQuestionBtn?.focus();
            });
            gameOptionsEl.appendChild(button);
        });
    }
}

function finishQuestionModal() {
    if (!questionModal || !questionAnswered) return;
    questionModal.classList.add('hidden');
    isQuestionOpen = false;
    questionAnswered = false;
    if (!gameEnded && rollDiceBtn) {
        rollDiceBtn.disabled = false;
    }
    if (typeof pendingAdvanceCallback === 'function') {
        const callback = pendingAdvanceCallback;
        pendingAdvanceCallback = null;
        callback();
    } else {
        updateStatus('Siap lempar dadu lagi!');
    }
}

function advanceTurn() {
    if (gameEnded) return;
    
    // Cari pemain berikutnya yang belum finish
    let nextPlayer = (currentPlayerIndex + 1) % players.length;
    let attempts = 0;
    while (winners.includes(nextPlayer) && attempts < players.length) {
        nextPlayer = (nextPlayer + 1) % players.length;
        attempts++;
    }
    
    currentPlayerIndex = nextPlayer;
    if (rollDiceBtn) {
        rollDiceBtn.disabled = false;
    }
    updateStatus(`Giliran ${players[currentPlayerIndex].name}, lempar dadu!`);
}

function performMove(roll) {
    const player = players[currentPlayerIndex];
    const target = player.position + roll;
    if (target > BOARD_SIZE) {
        updateStatus(`${player.name} butuh ${BOARD_SIZE - player.position} langkah lagi untuk finis.`);
        isRolling = false;
        setTimeout(() => advanceTurn(), 700);
        return;
    }

    updateStatus(`${player.name} maju ${roll} langkah!`);
    movePlayerTo(currentPlayerIndex, target, () => {
        processLanding(currentPlayerIndex, () => {
            isRolling = false;
            advanceTurn();
        });
    });
}

function handleRoll() {
    if (!canRollDice()) return;
    isRolling = true;
    pendingAdvanceCallback = null;
    if (rollDiceBtn) {
        rollDiceBtn.disabled = true;
    }
    const roll = Math.floor(Math.random() * 6) + 1;
    const currentPlayer = players[currentPlayerIndex];
    updateStatus(`${currentPlayer.name} sedang mengocok dadu...`);
    playDiceSound();
    animateDice(roll, () => performMove(roll));
}

function closeLeaderboardAndReset() {
    // Hapus overlay leaderboard
    const overlay = document.querySelector('.victory-overlay');
    if (overlay) {
        overlay.remove();
    }
    // Reset game
    resetGame();
}

function resetGame() {
    players.forEach(player => {
        player.position = 1;
        player.score = 0;
    });
    answeredQuestions.clear();
    currentPlayerIndex = 0;
    winners = [];
    gameEnded = false;
    statusMessage = `Giliran ${players[0].name}, lempar dadu!`;
    questionAnswered = false;
    isRolling = false;
    isQuestionOpen = false;
    pendingAdvanceCallback = null;
    if (diceValueEl) {
        diceValueEl.classList.remove('rolling');
        diceValueEl.textContent = '-';
    }
    if (questionModal) {
        questionModal.classList.add('hidden');
    }
    closeQuestionBtn?.classList.add('hidden');
    assignQuestionSquares();
    createBoard();
    updateStatus(statusMessage);
    if (rollDiceBtn) {
        rollDiceBtn.disabled = false;
    }
}

if (closeQuestionBtn) {
    closeQuestionBtn.addEventListener('click', finishQuestionModal);
}

if (questionModal) {
    questionModal.addEventListener('click', (event) => {
        if (event.target === questionModal) {
            finishQuestionModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isQuestionOpen) {
        finishQuestionModal();
    }
});

if (rollDiceBtn) {
    rollDiceBtn.addEventListener('click', handleRoll);
}

if (resetGameBtn) {
    resetGameBtn.addEventListener('click', resetGame);
}

assignQuestionSquares();
createBoard();
updateStatus(statusMessage);
animate();
// Initialize
initParticles();
hideSimulationOutputs();
animate();
loadQuestion();
if (scoreDisplay) {
    scoreDisplay.textContent = score;
}
const initialTab = document.querySelector('.tab-btn.active');
setActiveTab(initialTab?.dataset.tab || 'pilih');