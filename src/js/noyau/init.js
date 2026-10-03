// ─────────────────────────────────────────────
// CACHE DOM
// ─────────────────────────────────────────────
const DOM = {};
function cacheDom() {
    DOM.fps = document.getElementById('fps');
    DOM.sporeCount = document.getElementById('sporeCount');
    DOM.scoreBoard = document.getElementById('scoreBoard');
    DOM.gameTimer = document.getElementById('gameTimer');
    DOM.codexName = document.getElementById('codexName');
    DOM.codexType = document.getElementById('codexType');
    DOM.codexRadius = document.getElementById('codexRadius');
    DOM.codexFlore = document.getElementById('codexFlore');
    DOM.codexFaune = document.getElementById('codexFaune');
    DOM.codexOwner = document.getElementById('codexOwner');
    DOM.codexSpores = document.getElementById('codexSpores');
    DOM.codexSymVal = document.getElementById('codexSymVal');
    DOM.codexSymBar = document.getElementById('codexSymBar');
    DOM.codexSymBonus = document.getElementById('codexSymBonus');
    DOM.codexSymbiose = document.getElementById('codexSymbiose');
    DOM.codexPreview = document.getElementById('codexPreview');
    DOM.codex = document.getElementById('codex');
    DOM.myPlanetsList = document.getElementById('myPlanetsList');
    DOM.myPlanets = document.getElementById('myPlanets');
}


// ─────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────
function init() {
    // Canvas setup
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Cache DOM
    cacheDom();

    // Input listeners
    setupInput();

    // Interface
    setupUI();

    // Cacher le loading
    hideLoading();

    // Démarrer sur l'écran auth — initAuth() basculera sur title si session valide
    // Différé pour s'assurer que tous les scripts sont parsés
    setTimeout(() => showAuthScreen(), 0);

    /* Adresse avec ?relais=... : partie en lockstep (voir rejoindreRelais). */
    lockstepDepuisAdresse();
    installerSalon();
}

/* LA RESOLUTION DE RENDU. Le canevas est affiche en plein ecran par le CSS,
   mais rien n'oblige a le PEINDRE a cette taille : on peut le dessiner plus
   petit et laisser le navigateur l'agrandir. Le cout du rendu est presque
   exactement proportionnel au nombre de pixels peints - mesure : le fond
   passe de 1,4 ms a 1,3 Mpx a 11,5 ms a 8,3 Mpx -, donc c'est le seul levier
   qui vaille sur une machine modeste.

   L'echelle suit le zoom. Plus on dezoome, plus les astres sont petits a
   l'ecran et moins la finesse se voit : on peut peindre a moitie sans que
   personne le remarque. Plus on zoome, moins il y a d'objets et plus le
   detail compte : on repasse a pleine resolution. Les paliers ont une marge
   de 6 %, sinon un zoom pose pile sur un seuil redimensionnerait le canevas
   a chaque image - et un redimensionnement efface tout. */
const PALIERS_RESO = [
    { zoom: 0.25, r: 0.50 },
    { zoom: 0.40, r: 0.62 },
    { zoom: 0.70, r: 0.75 },
    { zoom: 1.20, r: 0.88 },
    { zoom: Infinity, r: 1.00 }
];
const QUALITES = { haute: 1, moyenne: 0.8, basse: 0.62, minimale: 0.5 };

/* LA VUE LOINTAINE. Sous ce zoom, toute une grande carte tient a l'ecran :
   les astres ne font plus que quelques pixels, leurs textures, halos,
   anneaux et batailles de surface ne se voient plus mais coutent cher (15 ms
   pour toute Zetapha a 50 joueurs). Ils deviennent de simples disques de la
   couleur de leur proprietaire, et les tirs des points. Plus le reglage
   GRAPH est bas, plus tot on y passe. */
const SEUIL_LOINTAIN = { haute: 0.07, moyenne: 0.09, basse: 0.12, minimale: 0.25 };
function vueLointaine() {
    return gameState.camera.zoom < (SEUIL_LOINTAIN[gameState.qualite] || 0.07);
}

function echelleRendu() {
    return (window.devicePixelRatio || 1) * (gameState.reso || 1);
}

function majResolution() {
    const z = gameState.camera.zoom;

    /* Redimensionner le canevas coute une image un peu plus lourde - mesure :
       2 a 5 ms de plus sur celle-la. C'est indolore sur une image isolee, mais
       pas au milieu d'une molette qui tourne. On attend donc que le zoom se
       soit POSE : tant qu'il bouge, on garde la resolution courante, et on ne
       change de palier qu'un sixieme de seconde apres le dernier cran. */
    if (Math.abs(z - (gameState._resoZoomVu || 0)) > 0.0005) {
        gameState._resoZoomVu = z;
        gameState._resoRepos = 0;
        return;
    }
    gameState._resoRepos = (gameState._resoRepos || 0) + (gameState.deltaTime || 0.016);
    if (gameState._resoRepos < 0.16) return;

    const i = gameState._resoPalier | 0;
    let j = i;
    /* On ne descend qu'une fois le seuil franchi de 6 %, et on ne remonte
       qu'une fois repasse 6 % au-dessus : pas de battement sur le seuil. */
    while (j > 0 && z < PALIERS_RESO[j - 1].zoom * 0.94) j--;
    while (j < PALIERS_RESO.length - 1 && z >= PALIERS_RESO[j].zoom * 1.06) j++;
    const q = QUALITES[gameState.qualite] || 1;
    const voulue = Math.max(0.4, Math.min(1, PALIERS_RESO[j].r * q));
    if (j !== i || Math.abs(voulue - (gameState.reso || 1)) > 0.001) {
        gameState._resoPalier = j;
        gameState.reso = voulue;
        resizeCanvas();
        if (gameState._montrerReso) gameState._montrerReso();
    }
}

function resizeCanvas() {
    const e = echelleRendu();
    gameState.width = window.innerWidth;
    gameState.height = window.innerHeight;
    gameState.canvas.width = Math.max(1, Math.round(gameState.width * e));
    gameState.canvas.height = Math.max(1, Math.round(gameState.height * e));
    gameState.ctx.setTransform(e, 0, 0, e, 0, 0);
}


