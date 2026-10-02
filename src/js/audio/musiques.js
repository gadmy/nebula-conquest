// ─────────────────────────────────────────────
// AUDIO — Tension adaptative & sons UI
// ─────────────────────────────────────────────
function updateAudioTension() {
    if (!gameState.audio.initialized || !gameState.audio.ambDrone) return;

    // Calculer la tension : jets ennemis proches de nos astres
    let tensionTarget = 0;
    const human = gameState.players[localSlot()];
    if (human) {
        /* Les tirs des AUTRES : en reseau on n'est pas forcement le joueur 0,
           et ses propres tirs faisaient passer la musique en mode agite. */
        const moi = localSlot();
        for (const jet of gameState.jets) {
            if (!jet.alive || jet.owner === moi) continue;
            for (const body of human.bodies) {
                const dx = jet.x - body.x;
                const dy = jet.y - body.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 300) {
                    tensionTarget += (300 - dist) / 300;
                }
            }
        }
    }
    tensionTarget = Math.min(1, tensionTarget);

    // Lerp vers la cible
    gameState.audio.tension += (tensionTarget - gameState.audio.tension) * 0.02;
    const t = gameState.audio.tension;

    // Appliquer la tension au drone
    const drone = gameState.audio.ambDrone;
    if (drone.gainTension) {
        drone.gainTension.gain.value = t * 0.04;
    }
    if (drone.filterTension) {
        drone.filterTension.frequency.value = 150 + t * 300;
    }
    // Accélérer le LFO en tension
    if (drone.lfo) {
        drone.lfo.frequency.value = 0.15 + t * 0.3;
    }
}

// ═══════════════════════════════════════════════════════
// SYSTÈME AUDIO ÉTENDU — Sons d'action + Ambiances + Musique
// Toutes les fonctions sont des PLACEHOLDERS Web Audio API.
// Remplacer le corps de chaque fonction par le vrai fichier audio.
// Format cible : AudioBuffer chargé via fetch() + decodeAudioData()
// ═══════════════════════════════════════════════════════


// ── Clic menu (3 variantes) ──
const AUDIO_BASE = '/Audio/';
const AUDIO_FILES = {
    click_menu:      'click_menu_v1.mp3',
    alliance:        'Alliance_v1.mp3',
    alliance_break:  'Alliance_break_v1.mp3',
    banner:          'banner_v1.mp3',
    signal:          'signal_v1.mp3',
    nidification:    'nidification.mp3',
    trade_orb:       'trade_orb_v1.mp3',
    intercept:       'intercept.mp3',
    build_complete:  'build_complet_v1.mp3',
    title_music:     'title_music.mp3',
    amb_calm_1:      'amb_calm_1.mp3',
    amb_calm_2:      'amb_calm_2.mp3',
    amb_calm_3:      'amb_calm_3.mp3',
    amb_calm_4:      'amb_calm_4.mp3',
    amb_calm_5:      'amb_calm_5.mp3',
    amb_tense_1:     'amb_tense_1.mp3',
    amb_tense_2:     'amb_tense_2.mp3',
    amb_tense_3:     'amb_tense_3.mp3',
    amb_tense_4:     'amb_tense_4.mp3',
    amb_tense_5:     'amb_tense_5.mp3',
    launch:          'playLaunchSound.mp3',
    conquest:        'playConquestSound.mp3',
    fusion:          'playFusionSound.mp3',
    neutralization:  'playNeutralizationSound.mp3',
    cleaner:         'playCleanerSound.mp3',
    victory:         'playVictorySound.mp3',
    defeat:          'playDefeatSound.mp3',
};

async function loadAudioBuffers() {
    if (!gameState.audio.ctx) return;
    const ac = gameState.audio.ctx;
    for (const [key, file] of Object.entries(AUDIO_FILES)) {
        try {
            const resp = await fetch(AUDIO_BASE + file);
            const arr = await resp.arrayBuffer();
            gameState.audio.buffers[key] = await ac.decodeAudioData(arr);
        } catch(e) {
            console.warn('[audio] Impossible de charger', file, e.message);
        }
    }
    console.log('[audio] Buffers chargés :', Object.keys(gameState.audio.buffers).length);
    // Relancer la musique titre si on est sur l'écran titre
    if (gameState.phase === 'title' && !_titleMusicNode) {
        playTitleMusic();
    }
}

function _playBuffer(key, volume = 1.0, loop = false) {
    if (!gameState.audio.initialized || gameState.audio.muted) return null;
    /* Pendant un rattrapage lockstep, des centaines de tours passent en une
       seconde : leurs sons feraient une cacophonie. */
    if (gameState._rattrapage && !loop) return null;
    const buf = gameState.audio.buffers[key];
    if (!buf) return null;
    const ac = gameState.audio.ctx;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    const g = ac.createGain();
    g.gain.setValueAtTime(volume, ac.currentTime);
    src.connect(g);
    g.connect(gameState.audio.masterGain);
    /* Un son termine laissait son GainNode branche sur le master pour toujours.
       Sur une longue partie (chaque lancement, chaque conquete, chaque impact)
       le graphe audio accumulait un noeud par son joue, tous remixes a chaque
       tranche de rendu. On debranche quand le son se termine. Les sons en
       boucle n'emettent jamais 'ended' : ils sont coupes ailleurs. */
    if (!loop) {
        src.onended = function () {
            try { src.disconnect(); g.disconnect(); } catch (e) {}
        };
    }
    src.start();
    return { src, gain: g };
}

function playClickSound() {
    _playBuffer('click_menu', 0.6);
}

// ── Nidification ──

// ── Alliance ──

// ── Orbe de commerce ──

// ── Signal émoji ──

// ── Bannière / Notification globale ──

// ── Interception orbe ──

// ── Rupture alliance ──

// ═══════════════════════════════════════════════════════
// MUSIQUE MENU TITRE
// PLACEHOLDER — remplacer par un AudioBuffer chargé depuis un fichier
// ═══════════════════════════════════════════════════════
let _titleMusicNode = null;
function playTitleMusic() {
    if (!gameState.audio.initialized || gameState.audio.muted) return;
    if (_titleMusicNode) return;
    const n = _playBuffer('title_music', 0.5, true);
    if (n) _titleMusicNode = n;
}
function stopTitleMusic() {
    if (!_titleMusicNode) return;
    try {
        if (_titleMusicNode.src) { _titleMusicNode.src.stop(); }
        else { _titleMusicNode.osc.stop(); _titleMusicNode.lfo.stop(); }
    } catch(e) {}
    _titleMusicNode = null;
}

// ═══════════════════════════════════════════════════════
// AMBIANCES DE JEU — 5 calmes + 5 agitées
// Sélection automatique selon gameState.audio.tension
// ═══════════════════════════════════════════════════════
let _ambianceNode = null;
let _ambianceType = null; // 'calm' | 'tense'
let _ambianceIdx = 0;

const AMBIANCE_CALM = [
    'amb_calm_1', // Dérive stellaire — nappes froides, basses légères
    'amb_calm_2', // Respiration cosmique — pad lent, harmoniques douces
    'amb_calm_3', // Orbite silencieuse — drone minimal, réverb longue
    'amb_calm_4', // Brumes nébulaires — textures filtrées, très lent
    'amb_calm_5', // Champ d'étoiles — micro-sons cristallins, quasi silence
];
const AMBIANCE_TENSE = [
    'amb_tense_1', // Alerte rouge — percussions sourdes, basses pulsées
    'amb_tense_2', // Invasion — arpèges menaçants, rythme accéléré
    'amb_tense_3', // Confrontation — dissonances, tension montante
    'amb_tense_4', // Assaut spatial — rythme binaire, distorsion légère
    'amb_tense_5', // Dernière défense — chaos ordonné, urgence maximale
];

function updateAmbiance() {
    if (!gameState.audio.initialized || gameState.audio.muted) return;
    const tension = gameState.audio.tension || 0;
    const targetType = tension > 0.3 ? 'tense' : 'calm';
    if (_ambianceType === targetType) return;
    // Transition : stop ancien, start nouveau
    _ambianceType = targetType;
    const pool = targetType === 'tense' ? AMBIANCE_TENSE : AMBIANCE_CALM;
    _ambianceIdx = Math.floor(Math.random() * pool.length);
    const key = pool[_ambianceIdx];
    if (_ambianceNode) {
        try { _ambianceNode.src.stop(); } catch(e) {}
        _ambianceNode = null;
    }
    if (gameState.audio.buffers[key]) {
        _ambianceNode = _playBuffer(key, 0.35, true);
    }
}

function updateOrbitHum() {
    if (!gameState.audio.initialized || gameState.audio.muted) return;
    const cam = gameState.camera;

    // Son d'orbite seulement quand très zoomé
    if (cam.zoom < 2) {
        if (gameState.audio.orbitHum) {
            gameState.audio.orbitHumGain.gain.value = 0;
        }
        return;
    }

    const ac = gameState.audio.ctx;
    const master = gameState.audio.masterGain;

    // Créer le hum si pas encore fait
    if (!gameState.audio.orbitHum) {
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 80;
        const gain = ac.createGain();
        gain.gain.value = 0;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();
        gameState.audio.orbitHum = osc;
        gameState.audio.orbitHumGain = gain;
    }

    // Volume basé sur le zoom et la proximité d'une planète
    let closestDist = Infinity;
    for (const p of gameState.planets) {
        const dx = p.x - cam.x;
        const dy = p.y - cam.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < closestDist) closestDist = dist;
    }

    const proxFactor = Math.max(0, 1 - closestDist / 200);
    const zoomFactor = Math.min(1, (cam.zoom - 2) / 3);
    const vol = proxFactor * zoomFactor * 0.015;
    gameState.audio.orbitHumGain.gain.value = vol;

    // Moduler la fréquence selon la planète
    gameState.audio.orbitHum.frequency.value = 60 + proxFactor * 40;
}


