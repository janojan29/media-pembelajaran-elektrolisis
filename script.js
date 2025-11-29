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
        options: [
            'Pembuatan baterai',
            'Penyepuhan logam',
            'Pembuatan semikonduktor',
            'Semua benar'
        ],
        correct: 3
    }
];

let currentQuestion = 0;
let score = 0;
let answers = new Array(quizData.length).fill(null);
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
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.dataset.index = index;
        
        if (answers[currentQuestion] === index) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.addEventListener('click', () => {
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionDiv.classList.add('selected');
            answers[currentQuestion] = index;
        });
        
        optionsContainer.appendChild(optionDiv);
    });
    
    if (questionCounterDisplay) {
        questionCounterDisplay.textContent = `${currentQuestion + 1} / ${quizData.length}`;
    }
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
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

if (submitAnswerBtn) {
    submitAnswerBtn.addEventListener('click', () => {
    if (answers[currentQuestion] === null) {
        alert('Pilih jawaban dulu ya, Bintang Kimia!');
        return;
    }
    
    const question = quizData[currentQuestion];
        if (!feedbackEl) return;
    const options = document.querySelectorAll('.option');
    
    if (answers[currentQuestion] === question.correct) {
        feedbackEl.textContent = 'Yeay! Jawabanmu benar 🎉';
        feedbackEl.className = 'feedback correct';
        options[answers[currentQuestion]].classList.add('correct');
        launchStars();
    } else {
        feedbackEl.textContent = `Ups! Jawaban yang tepat: ${question.options[question.correct]}`;
        feedbackEl.className = 'feedback incorrect';
        options[answers[currentQuestion]].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    // Calculate score
    score = 0;
    answers.forEach((answer, idx) => {
        if (answer === quizData[idx].correct) score++;
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

const BOARD_SIZE = 36;
const ROW_SIZE = 6;
const ladders = {
    3: 11,
    6: 17,
    14: 25,
    20: 32
};

const snakes = {
    18: 9,
    23: 13,
    28: 19,
    31: 22,
    34: 27
};

const gameQuestions = [
    {
        square: 4,
        question: 'Apa tujuan utama proses elektrolisis?',
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
        square: 9,
        question: 'Elektroda manakah yang memiliki muatan negatif pada sel elektrolisis?',
        options: ['Katoda', 'Anoda', 'Keduanya bermuatan positif', 'Tidak ada muatan'],
        correct: 0,
        reward: 10,
        explanation: 'Katoda menerima elektron dari sumber listrik sehingga bermuatan negatif.'
    },
    {
        square: 12,
        question: 'Ion apa yang bergerak menuju anoda?',
        options: ['Kation', 'Anion', 'Atom netral', 'Molekul air'],
        correct: 1,
        reward: 10,
        explanation: 'Anion bermuatan negatif tertarik menuju anoda yang bermuatan positif.'
    },
    {
        square: 16,
        question: 'Hukum Faraday menyatakan bahwa massa zat yang dihasilkan berbanding lurus dengan...',
        options: ['Volume larutan', 'Arus listrik dan waktu', 'Tekanan udara', 'Jenis bejana'],
        correct: 1,
        reward: 15,
        explanation: 'Semakin besar arus dan semakin lama waktu elektrolisis, semakin banyak zat yang dihasilkan.'
    },
    {
        square: 24,
        question: 'Pada penyepuhan logam, ion logam apa yang biasanya menempel di katoda?',
        options: ['Ion logam yang sama dengan benda kerja', 'Ion hidrogen', 'Ion oksigen', 'Ion klorida'],
        correct: 0,
        reward: 15,
        explanation: 'Proses elektroplating memakai ion logam yang sama dengan logam pelapis agar menempel di katoda.'
    },
    {
        square: 30,
        question: 'Mengapa larutan elektrolit harus dapat menghantarkan listrik?',
        options: [
            'Agar larutan tetap jernih',
            'Supaya ion bisa bergerak membawa muatan',
            'Untuk mendinginkan sistem',
            'Agar elektroda tidak korosif'
        ],
        correct: 1,
        reward: 15,
        explanation: 'Ion dalam larutan bertugas menghantarkan muatan listrik sehingga reaksi elektrolisis dapat berlangsung.'
    }
];

const questionMap = new Map();
gameQuestions.forEach(q => questionMap.set(q.square, q));

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
let winner = null;
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
        panel.classList.toggle('active', index === currentPlayerIndex && winner === null);
        panel.classList.toggle('winner', index === winner);
        panel.setAttribute('aria-current', index === currentPlayerIndex && winner === null ? 'true' : 'false');
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

    const rows = [];
    let number = 1;
    for (let row = 0; row < BOARD_SIZE / ROW_SIZE; row++) {
        const rowNumbers = [];
        for (let col = 0; col < ROW_SIZE; col++) {
            rowNumbers.push(number++);
        }
        if (row % 2 === 1) {
            rowNumbers.reverse();
        }
        rows.push(rowNumbers);
    }

    rows.reverse();
    rows.flat().forEach(squareNumber => {
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

        square.appendChild(inner);
        boardElement.appendChild(square);
    });

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
    return !isRolling && !isQuestionOpen && winner === null;
}

function handleVictory(playerIndex) {
    winner = playerIndex;
    updateStatus(`🎉 ${players[playerIndex].name} mencapai petak ${BOARD_SIZE} dan menang!`);
    if (rollDiceBtn) {
        rollDiceBtn.disabled = true;
    }
    pendingAdvanceCallback = null;
    isRolling = false;
}

function processLanding(playerIndex, onComplete) {
    const player = players[playerIndex];
    if (player.position === BOARD_SIZE) {
        handleVictory(playerIndex);
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
        if (!answeredQuestions.has(player.position)) {
            updateStatus('Petak soal! Jawab pertanyaan elektrolisis.');
            pendingAdvanceCallback = () => {
                isRolling = false;
                advanceTurn();
            };
            handleQuestion(player.position, playerIndex);
            return;
        }
        updateStatus('Kamu sudah menaklukkan soal ini, lanjutkan perjalanan!');
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
            } else {
                button.classList.add('incorrect');
                const correctBtn = gameOptionsEl.children[questionData.correct];
                if (correctBtn) {
                    correctBtn.classList.add('correct');
                }
                updateStatus(`${players[playerIndex].name} belum tepat. ${questionData.explanation}`);
            }
            answeredQuestions.add(squareNumber);
            questionAnswered = true;
            closeQuestionBtn?.classList.remove('hidden');
            closeQuestionBtn?.focus();
        });
        gameOptionsEl.appendChild(button);
    });
}

function finishQuestionModal() {
    if (!questionModal || !questionAnswered) return;
    questionModal.classList.add('hidden');
    isQuestionOpen = false;
    questionAnswered = false;
    if (winner === null && rollDiceBtn) {
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
    if (winner !== null) return;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
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
    animateDice(roll, () => performMove(roll));
}

function resetGame() {
    players.forEach(player => {
        player.position = 1;
        player.score = 0;
    });
    answeredQuestions.clear();
    currentPlayerIndex = 0;
    winner = null;
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