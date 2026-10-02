"use strict";


// ─────────────────────────────────────────────
// GAME STATE — Objet central
// ─────────────────────────────────────────────
const CLN_CFG = {
    speedMin: 67, speedMax: 120, turnInterval: 15,
    detectRange: 120, fireRate: 0.3, dmgMin: 34, dmgMax: 106
};

const COMET_CFG = {
    freq: 8, speed: 150, size: 8, tail: 80, fgDebris: 10
};

const gameState = {
    // ── Machine à états ──
    phase: 'title',  // 'title' | 'config' | 'spawn' | 'game' | 'paused' | 'end'
    isMulti: false,
    multiSeed: null,

    // ── Canvas & rendu ──
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    /* Resolution de rendu : 1 = plein ecran peint pixel pour pixel. */
    reso: 1,
    _resoPalier: 4,
    _resoZoomVu: 0,
    _resoRepos: 0,
    qualite: 'haute',

    // ── Caméra ──
    camera: {
        x: 0,        // position monde (centre de vue)
        y: 0,
        zoom: 1,
        minZoom: 0.05,
        maxZoom: 10,
        zoomSpeed: 0.1
    },

    // ── Boucle de jeu ──
    running: false,
    lastTime: 0,
    deltaTime: 0,

    // ── Input ──
    input: {
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        cameraStartX: 0,
        cameraStartY: 0,
        mouseX: 0,
        mouseY: 0
    },

    // ── Décor ──
    cosmicDust: [],       // particules ambiantes
    shootingStars: [],    // étoiles filantes
    shootingStarTimer: 0,
    comets: [],           // comètes destructrices
    cometTimer: 0,
    foregroundDebris: [],  // débris premier plan
    time: 0,              // temps total écoulé (pour animations)

    // ── Performance ──
    allBodies: [],         // planets + moons (recalculé à la conquête)
    lod: 2,               // 0=low, 1=mid, 2=high
    lodAutoTimer: 0,       // timer pour FPS adaptatif
    lodFpsAccum: 0,        // accumulateur FPS pour moyenne
    lodFpsSamples: 0,      // nombre d'échantillons FPS

    // ── FPS ──
    fps: 0,
    fpsFrames: 0,
    fpsLastCheck: 0,

    // ── Univers (préparé pour étape 2) ──
    blackHole: null,
    suns: [],
    alliances: [],
    
    planets: [],
    moons: [],

    // ── Joueurs (préparé pour étape 4) ──
    players: [],

    // ── Jets (préparé pour étape 5) ──
    jets: [],

    // ── Vaisseaux nettoyeurs ──
    cleaners: [],
    capitaux: [],

    // ── Amas de météorites ──
    asteroidBelts: [],

    // ── Audio ──
    audio: {
        ctx: null,
        masterGain: null,
        ambDrone: null,
        volume: 0.7,
        muted: false,
        initialized: false,
        tension: 0,
        tensionTarget: 0,
        orbitHum: null,
        orbitHumGain: null,
        buffers: {},
        _buffersLoading: false
    },

    // ── Config partie ──
    config: {
        sunCount: 4,
        playerCount: 4,
        difficulty: 'normal',  // 'easy' | 'normal' | 'brutal'
        useIA: true,
        cleanerCount: 3,
        useAsteroids: true
    },

    // ── Joueur humain stats ──
    playerStats: {
        growth: 3,
        velocity: 4,
        density: 2,
        sensitivity: 1
    },
    playerColor: '#8B5CF6',

    // ── Couleurs disponibles ──
    /* 16 couleurs : jusqu'a 16 joueurs en reseau (lockstep). Les 6 dernieres
       ne servent qu'au-dela de 10 joueurs. */
    /* 50 couleurs : les 16 d'origine d'abord, puis 34 choisies une a une
       pour etre le plus loin possible des precedentes (espace OKLab), et
       assez claires pour se lire sur le fond de nuit. A 50 joueurs, deux
       couleurs restent proches : le nom sur chaque astre tranche. */
    teamColors: ['#8B5CF6','#EC4899','#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#A855F7','#F472B6',
                 '#14B8A6','#84CC16','#E2E8F0','#B45309','#6EE7B7','#FF7F50',
                 '#288A28','#B6A5E9','#ECEC13','#28828A','#EC13EC','#E9B6A5','#C20AA3','#8A7A28','#C2940A','#A5CDE9',
                 '#D2E9A5','#13EC13','#13DAEC','#9BE963','#DE63E9','#0A94C2','#639BE9','#E9A5D2','#A413EC','#C2750A',
                 '#A5E9DD','#EC13B6','#E9D263','#13EC80','#C813EC','#E9A663','#EC136D','#C2C20A','#E96379','#288A61',
                 '#E9D2A5','#6363E9','#136DEC','#6A8A28'],

    // ── Codex ──
    selectedBody: null,
    codexOpen: false,

    // ── Effets visuels conquête ──
    conquestEffects: [],   // {x, y, text, color, age, maxAge}
    bloomEffects: [],      // {body, age, maxAge, color}
    impactEffects: [],     // {x, y, color, particles[], age, maxAge}

    // ── Log d'événements ──
    eventLog: [],

    // ── Stats de partie ──
    gameStats: {
        jetsLaunched: 0,
        jetsNeutralized: 0,
        bodiesConquered: 0,
        sporesProduced: 0,
        timeElapsed: 0
    },

    // ── Lancement de jets ──
    jetRatio: 0.5,         // pourcentage de spores envoyées (0.0 à 1.0)
    launching: false,
    launchSource: null,
    launchPreview: [],
    _filetsCharge: [],   /* filets lumineux du chargement de tir */
    _fireLanceur: null,  /* l'astre du groupe qui tirera */
    _fireGroupe: null,
    _chargeAcc: 0,
    mouseWorldX: 0,
    mouseWorldY: 0
};


