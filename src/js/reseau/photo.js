/* ─────────────────────────────────────────────
   LA PHOTO DE LA PARTIE (reprise instantanee)
   REPRENDRE rejouait toute la partie depuis le premier tour : plus d'une
   minute pour une partie de 20 minutes. Desormais, toutes les 30 s de jeu,
   le navigateur range une PHOTO de la partie (IndexedDB) : tout ce que le
   calcul utilise, astres, tirs, joueurs, vaisseaux, cometes, hasard. Au
   retour, la page refait la carte, pose la photo par-dessus, et ne demande
   au relais que les ordres posterieurs : quelques secondes a rattraper.
   Ce qui est propre a cet ecran (taille, camera, son, visee en cours,
   textures) n'est jamais dans la photo et n'est jamais ecrase.
   Filet de securite : le relais compare toujours l'empreinte du joueur
   revenu a celle des autres. Au moindre ecart, la photo est effacee et la
   page se recharge pour une reprise complete, comme avant.
   ───────────────────────────────────────────── */
const PHOTO_TOURS = 1800;             /* une photo toutes les 30 s de jeu */
const PHOTO_LOCAL_RACINE = new Set(['lockstep', 'avantChaqueTour', 'canvas', 'ctx', 'width', 'height', 'reso',
    '_resoPalier', '_resoZoomVu', '_resoRepos', 'qualite', 'camera', 'running', 'lastTime', 'deltaTime', 'dt',
    'input', 'lod', 'lodAutoTimer', 'lodFpsAccum', 'lodFpsSamples', 'fps', 'fpsFrames', 'fpsLastCheck', 'audio',
    '_bgCanvas', '_starsCanvas', '_starsCanvas2', '_starsCanvas3', '_starsUrl', '_starsUrl2', '_starsUrl3',
    '_fondCss', '_montrerReso', '_vraiTemps', 'mouseWorldX', 'mouseWorldY', 'codexOpen', 'selectedBody',
    'launching', 'launchSource', 'launchPreview', '_firePhase', '_fireSource', '_fireType', '_fireCamZoom',
    '_fireLanceur', '_fireGroupe', '_chargeAcc', '_filetsCharge', '_fireSurface', '_zoomCible', '_tirBloque',
    '_popProdAstre', '_viseeOrdre', '_viseeEnvoi', 'cosmicDust', 'shootingStars', 'shootingStarTimer',
    'foregroundDebris', 'playerStats', 'playerColor', 'journalOrdres', '_rejeu', '_rattrapage', '_zoneSel']);
/* Les dessins et leurs caches, sur chaque objet : ceux de cette page restent. */
const PHOTO_LOCAL_CLE = new Set(['_texture', '_niveaux', '_travailHD', '_recetteHD', '_petit', '_hd', '_hasAtmosphere', '_atmoColor',
    '_haloCache', '_haloDim', '_haloR', '_spriteDanger', '_disques', '_sysCache', '_vraiX', '_vraiY']);
const PHOTO_SAUTE = { s: 1 };
/* Seuls les objets simples, tableaux et tableaux types entrent dans la
   photo ; fonctions, canevas, sons, elements de la page restent dehors. */
function _photoGardable(v) {
    if (typeof v === 'function') return false;
    if (!v || typeof v !== 'object') return true;
    if (Array.isArray(v) || ArrayBuffer.isView(v)) return true;
    const pr = Object.getPrototypeOf(v);
    return pr === Object.prototype || pr === null;
}

/* La partie a plat : une liste de noeuds, les liens entre objets notes par
   leur numero ({ r: n }) pour garder qui pointe vers qui. */
function photographier() {
    const ids = new Map(), noeuds = [];
    const coder = function (v, racine) {
        if (v === null || typeof v !== 'object') return typeof v === 'function' ? PHOTO_SAUTE : v;
        if (!_photoGardable(v)) return PHOTO_SAUTE;
        let id = ids.get(v);
        if (id !== undefined) return { r: id };
        id = noeuds.length;
        ids.set(v, id);
        noeuds.push(null);
        let n;
        if (ArrayBuffer.isView(v)) n = { k: 't', v: v.slice() };
        else if (Array.isArray(v)) {
            n = { k: 'a', v: new Array(v.length) };
            for (let i = 0; i < v.length; i++) n.v[i] = coder(v[i], false);
        } else {
            n = { k: 'o', f: {} };
            for (const k of Object.keys(v)) {
                if ((racine && PHOTO_LOCAL_RACINE.has(k)) || PHOTO_LOCAL_CLE.has(k)) continue;
                n.f[k] = coder(v[k], false);
            }
        }
        noeuds[id] = n;
        return { r: id };
    };
    coder(gameState, true);
    return { noeuds: noeuds, tour: gameState.tour, alea: _gameRng.lire(), nbAlea: _nbAlea };
}

/* La photo reposee sur la partie fraichement creee. Les objets qui existent
   deja a la meme place (astres, joueurs, ceinture...) sont REMPLIS, pas
   remplaces : leurs textures et tout ce qui pointe vers eux restent bons. */
function restaurerPhoto(P) {
    const N = P.noeuds, objs = new Array(N.length), pris = new Set();
    const estRef = function (e) { return e !== null && typeof e === 'object' && e.r !== undefined; };
    const associer = function (id, ex) {
        if (objs[id] !== undefined) return;
        const n = N[id];
        const libre = ex !== null && typeof ex === 'object' && !pris.has(ex);
        let o;
        if (n.k === 't') o = (libre && ex.constructor === n.v.constructor && ex.length === n.v.length) ? ex : new n.v.constructor(n.v.length);
        else if (n.k === 'a') o = (libre && Array.isArray(ex)) ? ex : [];
        else o = (libre && !Array.isArray(ex) && !ArrayBuffer.isView(ex) && _photoGardable(ex)) ? ex : {};
        objs[id] = o;
        pris.add(o);
        const meme = o === ex;
        if (n.k === 'a') { for (let i = 0; i < n.v.length; i++) if (estRef(n.v[i])) associer(n.v[i].r, meme ? ex[i] : undefined); }
        else if (n.k === 'o') { for (const k in n.f) if (estRef(n.f[k])) associer(n.f[k].r, meme ? ex[k] : undefined); }
    };
    objs[0] = gameState;
    pris.add(gameState);
    const racine = N[0].f;
    /* D'abord les listes qui fixent l'identite des objets, dans l'ordre. */
    for (const k of ['allBodies', 'suns', 'planets', 'moons', 'blackHole', 'players', 'asteroidBelts', 'cleaners', 'capitaux', 'comets', 'jets']) {
        if (estRef(racine[k])) associer(racine[k].r, gameState[k]);
    }
    for (const k in racine) if (estRef(racine[k])) associer(racine[k].r, gameState[k]);
    const lire = function (e, ancien) {
        if (e !== null && typeof e === 'object') return e.s ? ancien : objs[e.r];
        return e;
    };
    for (let id = 0; id < N.length; id++) {
        const n = N[id], o = objs[id];
        if (n.k === 't') { o.set(n.v); continue; }
        if (n.k === 'a') {
            const avant = o.slice();
            o.length = n.v.length;
            for (let i = 0; i < n.v.length; i++) o[i] = lire(n.v[i], avant[i]);
            continue;
        }
        for (const k of Object.keys(o)) {
            if (k in n.f || PHOTO_LOCAL_CLE.has(k) || (id === 0 && PHOTO_LOCAL_RACINE.has(k))) continue;
            if (!_photoGardable(o[k])) continue;
            delete o[k];
        }
        for (const k in n.f) o[k] = lire(n.f[k], o[k]);
    }
    _gameRng.ecrire(P.alea);
    _nbAlea = P.nbAlea;
    /* Les grilles des batailles de surface, preparees d'ordinaire au premier
       combat : une page fraiche ne les a pas encore. */
    _luttePrepare();
}

/* Le rangement : IndexedDB, une seule photo (la derniere). */
function _photoBase(suite) {
    try {
        const rq = indexedDB.open('nebulaConquest', 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore('photos'); };
        rq.onsuccess = function () { suite(rq.result); };
        rq.onerror = function () { suite(null); };
    } catch (e) { suite(null); }
}
function _photoAction(mode, faire, suite) {
    _photoBase(function (db) {
        if (!db) { if (suite) suite(null); return; }
        try {
            const tx = db.transaction('photos', mode);
            const rq = faire(tx.objectStore('photos'));
            tx.oncomplete = function () { db.close(); if (suite) suite(rq ? rq.result : null); };
            tx.onerror = tx.onabort = function () { db.close(); if (suite) suite(null); };
        } catch (e) { db.close(); if (suite) suite(null); }
    });
}
function photoEnregistrer(P) { _photoAction('readwrite', function (st) { st.put(P, 'reseau'); return null; }); }
function photoLire(suite) { _photoAction('readonly', function (st) { return st.get('reseau'); }, function (r) { suite(r || null); }); }
function photoEffacer(suite) { _photoAction('readwrite', function (st) { st.delete('reseau'); return null; }, suite || null); }

/* Toutes les 30 s de jeu (tourSimulation), en partie et a jour seulement. */
function prendrePhoto() {
    const L = gameState.lockstep;
    if (!L || !L.enJeu || !L.jeton || L.desync !== null || gameState.phase !== 'game') return;
    try {
        const P = photographier();
        P.salle = L.salleNom;
        P.slot = L.slot;
        P.version = versionJeu();
        /* Le premier paquet dont les ordres tombent apres ce tour. */
        P.n0 = gameState.tour / TOURS_PAR_PAQUET - PAQUETS_AVANCE;
        P.date = Date.now();
        photoEnregistrer(P);
    } catch (e) { console.warn('[photo]', e); }
}

/* Au retour (lockstepPret) : la photo pose la partie au tour ou elle a ete
   prise ; les paquets suivants, demandes au relais, font le reste. */
function reprendreDepuisPhoto(L) {
    const P = L.photo;
    L.photo = null;
    restaurerPhoto(P);
    _ordresEnAttente = [];
    L.paquets = P.n0;
    L.tourPermis = P.tour;
    L.details = {};
    L.depuisPhoto = P.tour;
    _ownerClustersCache = [];
    _territoires = [];
    _ancresGroupe = null;
    _lastScoreHash = '';
    marquerTerritoiresSales();
    setPhase(gameState.phase === 'end' ? 'game' : gameState.phase);
    const moi = gameState.players[L.slot];
    const b = moi && moi.bodies && moi.bodies[0];
    if (b) { gameState.camera.x = b.x; gameState.camera.y = b.y; }
    afficherLockstep('Reprise depuis la photo du tour ' + P.tour);
}

/* La photo ne colle pas (le relais a vu un ecart) : on l'efface et on
   recharge la page pour une reprise complete, depuis le premier tour. */
function repliRepriseComplete() {
    afficherLockstep('Reprise rapide impossible : reprise complete...', true);
    photoEffacer(function () {
        try { sessionStorage.setItem('nc_repriseComplete', '1'); } catch (e) {}
        location.reload();
    });
}

/* Le relais a reuni tout le monde : meme graine, meme carte, memes reglages
   pour tous. Les vaisseaux et les cometes gardent les valeurs par defaut du
   solo, identiques partout. */
function lancerPartieLockstep(m) {
    const L = gameState.lockstep;
    L.slot = m.slot;
    L.joueurs = m.joueurs;
    L.jeton = m.jeton;
    L.salleNom = m.salle;
    if (L.jeton) noterPartieReseau(L);
    /* Avant tout calcul de la partie, carte comprise : les memes maths que
       les autres joueurs, quel que soit leur navigateur. */
    installerMathsFixes();
    L.graine = m.graine;
    const salon = document.getElementById('salonReseau');
    if (salon) salon.style.display = 'none';
    gameState.isMulti = false;
    gameState.isTutorial = false;
    gameState.multiSeed = m.graine;
    const cfg = gameState.config;
    cfg.difficulty = m.difficulte;
    cfg.useIA = true;
    cfg.aiCount = m.ia;
    cfg.playerCount = m.joueurs.length + m.ia;
    cfg.cleanerCount = 3;
    cfg.useComets = true;
    cfg.mapIndex = m.carte;
    /* Carte d'un joueur : le relais l'envoie avec le depart. */
    cfg.carteDonnees = m.carteDonnees ? nettoyerCarte(m.carteDonnees) : null;
    afficherLockstep('Partie lancee : vous etes le joueur ' + (m.slot + 1) + ' sur ' + m.joueurs.length +
                     (m.classee ? ' — partie classee (ELO)' : ''));
    /* Attendre que l'ecran d'accueil ait fini de s'installer, pour qu'il ne
       repasse pas par-dessus la partie. */
    const partir = function () {
        if (gameState.phase === 'title' || performance.now() > 4000) startGame();
        else setTimeout(partir, 200);
    };
    partir();
}

/* Apres createPlayers : les humains ont les premiers numeros, avec leur nom,
   des couleurs et des statistiques identiques chez tous. */
function preparerJoueursLockstep() {
    const L = gameState.lockstep;
    for (let i = 0; i < gameState.players.length; i++) {
        const p = gameState.players[i];
        p.color = gameState.teamColors[i % gameState.teamColors.length];
        p.isLocal = (i === L.slot);
        if (i < L.joueurs.length) {
            p.isHuman = true;
            p.name = L.joueurs[i].nom;
            p.stats = { growth: 3, velocity: 4, density: 2, sensitivity: 1 };
        }
    }
    L.tourPermis = PAQUETS_AVANCE * TOURS_PAR_PAQUET;
    L.paquets = 0;
}

/* La partie est chargee : on le dit au relais, qui lancera les paquets
   quand tout le monde sera pret. */
function lockstepPret() {
    const L = gameState.lockstep;
    L.enJeu = true;
    if (L.photo) {
        try { reprendreDepuisPhoto(L); }
        catch (e) { console.warn('[photo]', e); repliRepriseComplete(); return; }
    }
    if (L.aRejouer) { appliquerReprise(L, L.aRejouer); L.aRejouer = null; }
    envoyerAuRelais({ t: 'pret' });
    if (!L.affichage) L.affichage = setInterval(majBandeauLockstep, 500);
}

function recevoirPaquet(m) {
    const L = gameState.lockstep;
    /* Reprise en cours de chargement : mis de cote avec le reste. */
    if (!L.enJeu && L.aRejouer) {
        if (m.o && m.o.length) L.aRejouer.paquets.push(m);
        L.aRejouer.n = m.n;
        return;
    }
    const base = (m.n + PAQUETS_AVANCE) * TOURS_PAR_PAQUET;
    for (const o of (m.o || [])) programmerOrdre({ tour: base + 1, slot: o.s, type: o.type, d: o.d || {} });
    L.tourPermis = base + TOURS_PAR_PAQUET;
    L.paquets = m.n + 1;
    mesurerReseau(L, m.n);
    if (document.visibilityState === 'hidden' && L.enJeu) avancerEnFond(L);
}

/* LA PARTIE CONTINUE PAGE CACHEE. Onglet en arriere-plan, fenetre reduite :
   le navigateur n'affiche plus la page et coupe la boucle d'images - la
   partie de ce joueur s'arretait, et il revenait avec des minutes de retard
   (vu en ligne : 4 minutes). Mais les messages du reseau, eux, continuent
   d'arriver : a chaque paquet recu, on fait donc les tours dus, sans
   dessiner ni jouer de son, en gardant la reserve habituelle. Au retour,
   la partie est deja a jour. */
function avancerEnFond(L) {
    const cible = L.cible || RESERVE_MIN;
    gameState._rattrapage = true;
    let n = 0;
    while (gameState.tour < L.tourPermis - cible && n < 900) { tourSimulation(); n++; }
    _accSim = 0;
}

/* LA RESERVE S'ADAPTE AU RESEAU. Les paquets partent toutes les 50 ms ;
   chacun arrive plus ou moins en retard sur ce rythme. Sur les 6 dernieres
   secondes, l'ecart entre le paquet le plus en avance et les plus en retard
   (on ecarte les 5 % extremes) dit de combien un paquet peut tarder : la
   reserve doit tenir ce temps-la, plus 2 tours de marge. Reseau regulier :
   petite reserve, le geste repond vite. Reseau irregulier : plus de
   reserve, un peu plus de delai, mais l'image ne se fige plus.
   Une image figee malgre tout ajoute un tour de marge (6 au plus) ; chaque
   tranche de 5 s sans accroc en retire un. */
const RESERVE_MIN = 3, RESERVE_MAX = 36;
function mesurerReseau(L, n) {
    const maintenant = performance.now();
    if (L.origine === undefined) L.origine = maintenant - n * 50;
    if (!L.retards) L.retards = [];
    L.retards.push(maintenant - (L.origine + n * 50));
    if (L.retards.length > 120) L.retards.shift();
    const tri = L.retards.slice().sort((a, b) => a - b);
    const gigue = tri[Math.floor((tri.length - 1) * 0.95)] - tri[0];
    L.gigue = gigue;
    if (L.bonus === undefined) { L.bonus = 0; L.sansAccroc = maintenant; }
    if (L.bonus > 0 && maintenant - L.sansAccroc > 5000) { L.bonus--; L.sansAccroc = maintenant; }
    L.cible = Math.max(RESERVE_MIN, Math.min(RESERVE_MAX, Math.ceil(gigue / (1000 / 60)) + 2 + L.bonus));
}

