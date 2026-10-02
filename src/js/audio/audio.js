// ─────────────────────────────────────────────
// AUDIO GÉNÉRATIF — Web Audio API
// ─────────────────────────────────────────────
function initAudio() {
    if (gameState.audio.initialized) return;
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    gameState.audio.ctx = ac;

    // Master gain
    const master = ac.createGain();
    master.gain.value = gameState.audio.volume;
    master.connect(ac.destination);
    gameState.audio.masterGain = master;

    gameState.audio.initialized = true;
}

function ensureAudio() {
    if (!gameState.audio.initialized) initAudio();
    if (gameState.audio.ctx?.state === 'suspended') {
        gameState.audio.ctx.resume().then(() => {
            if (gameState.audio.buffers && !gameState.audio._buffersLoading && Object.keys(gameState.audio.buffers).length === 0) {
                gameState.audio._buffersLoading = true;
                loadAudioBuffers();
            }
        });
        return;
    }
    if (gameState.audio.buffers && !gameState.audio._buffersLoading && Object.keys(gameState.audio.buffers).length === 0) {
        gameState.audio._buffersLoading = true;
        loadAudioBuffers();
    }
}

// Appel unique après le premier geste utilisateur
let _audioBootstrapped = false;
document.addEventListener('click', () => {
    if (_audioBootstrapped) return;
    _audioBootstrapped = true;
    // Initialiser l'audio si pas encore fait
    if (!gameState.audio.initialized) initAudio();
    const ctx = gameState.audio.ctx;
    if (!ctx) return;
    const doLoad = () => {
        if (!gameState.audio._buffersLoading && Object.keys(gameState.audio.buffers).length === 0) {
            gameState.audio._buffersLoading = true;
            loadAudioBuffers();
        }
    };
    if (ctx.state === 'suspended') {
        ctx.resume().then(doLoad);
    } else {
        doLoad();
    }
}, { once: false });

function playBuildSound() {
    if (!gameState.audio.initialized || gameState.audio.muted) return;
    if (gameState.audio.buffers.build_complete) { _playBuffer('build_complete', 0.6); return; }
    // Fallback placeholder
    const ac = gameState.audio.ctx; const master = gameState.audio.masterGain; const t = ac.currentTime;
    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    const g = ac.createGain(); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
    o.onended = function () { try { o.disconnect(); g.disconnect(); } catch (e) {} };
}

// ── Ambiance spatiale (drone) ──
function startAmbiance() {
    ensureAudio();
    const ac = gameState.audio.ctx;
    const master = gameState.audio.masterGain;

    if (gameState.audio.ambDrone) return;

    // Drone basse (calme)
    const osc1 = ac.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 40;
    const gain1 = ac.createGain();
    gain1.gain.value = 0.06;

    // Sub harmonique
    const osc2 = ac.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 60;
    const gain2 = ac.createGain();
    gain2.gain.value = 0.03;

    // Drone tension (désactivé au départ)
    const oscTension = ac.createOscillator();
    oscTension.type = 'sawtooth';
    oscTension.frequency.value = 55;
    const gainTension = ac.createGain();
    gainTension.gain.value = 0;
    const filterTension = ac.createBiquadFilter();
    filterTension.type = 'lowpass';
    filterTension.frequency.value = 200;
    filterTension.Q.value = 3;

    // LFO pour modulation
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    // LFO tension (plus rapide)
    const lfoT = ac.createOscillator();
    lfoT.type = 'sine';
    lfoT.frequency.value = 0.4;
    const lfoTGain = ac.createGain();
    lfoTGain.gain.value = 8;
    lfoT.connect(lfoTGain);
    lfoTGain.connect(oscTension.frequency);

    // Filtre passe-bas
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    filter.Q.value = 1;

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(master);

    oscTension.connect(filterTension);
    filterTension.connect(gainTension);
    gainTension.connect(master);

    osc1.start();
    osc2.start();
    lfo.start();
    oscTension.start();
    lfoT.start();

    gameState.audio.ambDrone = { osc1, osc2, lfo, gain1, gain2, filter, oscTension, gainTension, filterTension, lfoT };
}

function stopAmbiance() {
    if (gameState.audio.ambDrone) {
        try {
            gameState.audio.ambDrone.osc1.stop();
            gameState.audio.ambDrone.osc2.stop();
            gameState.audio.ambDrone.lfo.stop();
        } catch(e) {}
        gameState.audio.ambDrone = null;
    }
    if (_ambianceNode) {
        try { _ambianceNode.src.stop(); } catch(e) {}
        _ambianceNode = null;
    }
    _ambianceType = null;
}

// ── Son de lancement de jet ──
function playLaunchSound() { _playBuffer('launch', 0.4); }

// ── Son de fusion ──
function playFusionSound() { _playBuffer('fusion', 0.5); }

// ── Son de conquête ──
function playConquestSound() { _playBuffer('conquest', 0.6); }

// ── Son de neutralisation ──
function playNeutralizationSound() { _playBuffer('neutralization', 0.5); }

// ── Son de vaisseau nettoyeur ──
function playCleanerSound(cleanerX, cleanerY) { _playBuffer('cleaner', 0.3); }

// ── Séquence victoire ──
function playVictorySound() { _playBuffer('victory', 0.7); }

// ── Séquence défaite ──
function playDefeatSound() { _playBuffer('defeat', 0.7); }

// ── Contrôle volume ──
function setupVolumeControl() {
    const slider = document.getElementById('volSlider');
    const icon = document.getElementById('volToggle');

    slider.value = gameState.audio.volume * 100;

    slider.addEventListener('input', () => {
        gameState.audio.volume = parseInt(slider.value) / 100;
        if (gameState.audio.masterGain) {
            gameState.audio.masterGain.gain.value = gameState.audio.volume;
        }
        gameState.audio.muted = gameState.audio.volume === 0;
        icon.textContent = gameState.audio.muted ? '🔇' : '🔊';
    });

    icon.addEventListener('click', () => {
        gameState.audio.muted = !gameState.audio.muted;
        if (gameState.audio.masterGain) {
            gameState.audio.masterGain.gain.value = gameState.audio.muted ? 0 : gameState.audio.volume;
        }
        icon.textContent = gameState.audio.muted ? '🔇' : '🔊';
    });
}


