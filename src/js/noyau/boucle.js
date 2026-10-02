// ─────────────────────────────────────────────
// BOUCLE DE JEU
// ─────────────────────────────────────────────
const _keysDown = {};
window.addEventListener('keydown', e => { if (!e.key) return; if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return; if (e.key.startsWith('Arrow') || e.key === 'p' || e.key === 'P' || e.key === 'm' || e.key === 'M') { _keysDown[e.key] = true; e.preventDefault(); } });
window.addEventListener('keyup', e => { if (!e.key) return; if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return; if (e.key.startsWith('Arrow') || e.key === 'p' || e.key === 'P' || e.key === 'm' || e.key === 'M') _keysDown[e.key] = false; });

function gameLoop(timestamp) {
    if (!gameState.running) return;

    // Delta time (en secondes)
    gameState.deltaTime = (timestamp - gameState.lastTime) / 1000;
    gameState.lastTime = timestamp;

    // Cap delta pour éviter les sauts après un onglet en arrière-plan
    if (gameState.deltaTime > 0.1) gameState.deltaTime = 0.016;

    // FPS
    gameState.fpsFrames++;
    if (timestamp - gameState.fpsLastCheck >= 500) {
        gameState.fps = Math.round(gameState.fpsFrames / ((timestamp - gameState.fpsLastCheck) / 1000));
        gameState.fpsFrames = 0;
        gameState.fpsLastCheck = timestamp;
        if (DOM.fps) DOM.fps.textContent = gameState.fps + ' FPS';
    }

    // Déplacement caméra par flèches
    /* Meme allure que ZQSD : passer d'un jeu de touches a l'autre ne doit pas
       changer la vitesse de la vue. */
    const camSpeed = 900 / gameState.camera.zoom;
    if (_keysDown['ArrowLeft'] || _keysDown['ArrowRight'] || _keysDown['ArrowUp'] || _keysDown['ArrowDown']) {
        followingBody = null;
        document.querySelectorAll('.mp-body-row.active').forEach(el => el.classList.remove('active'));
    }
    if (_keysDown['ArrowLeft']) gameState.camera.x -= camSpeed * gameState.deltaTime;
    if (_keysDown['ArrowRight']) gameState.camera.x += camSpeed * gameState.deltaTime;
    if (_keysDown['ArrowUp']) gameState.camera.y -= camSpeed * gameState.deltaTime;
    if (_keysDown['ArrowDown']) gameState.camera.y += camSpeed * gameState.deltaTime;

    /* Le palier de resolution se decide avant de peindre : redimensionner le
       canevas efface son contenu, il ne faut donc pas le faire en plein
       milieu d'une image. */
    majResolution();

    avancerImage(gameState.deltaTime, timestamp);

    requestAnimationFrame(gameLoop);
}

/* ─────────────────────────────────────────────
   TOURS FIXES
   La partie avance par tours de duree fixe, 60 par seconde, quel que soit
   l'ecran : un ecran a 144 Hz ne calcule plus 144 petits pas, une machine
   lente a 30 images/s ne fait plus des pas deux fois plus grands. Deux
   navigateurs qui recoivent les memes ordres calculent donc exactement la
   meme partie (condition du lockstep, verifiee par npm run lockstep).
   60 et pas 20 : c'est la cadence pour laquelle le jeu a ete regle
   (traines, rythme de l'IA, collisions des tirs rapides). Le reseau pourra
   regrouper les ordres par paquets de plusieurs tours.
   Entre deux tours, l'image est interpolee : astres, tirs, vaisseaux et
   cometes sont dessines entre leur position du tour precedent et celle du
   tour courant, puis remis a leur vraie place. La camera et le niveau de
   detail, eux, suivent chaque image.
   ───────────────────────────────────────────── */
const TOUR_SIM = 1 / 60;
const TOURS_MAX_PAR_IMAGE = 6;     /* au-dela (onglet ralenti), le jeu ralentit au lieu de s'emballer */
let _accSim = 0;
let _interpoles = [];

/* Un tour de jeu. avantChaqueTour, s'il existe, recoit le numero du tour qui
   commence : c'est la que s'appliqueront les ordres des joueurs. */
function tourSimulation() {
    noterPositionsAvant();
    gameState.tour = (gameState.tour || 0) + 1;
    if (typeof gameState.avantChaqueTour === 'function') gameState.avantChaqueTour(gameState.tour);
    appliquerOrdres(gameState.tour);
    if (gameState.phase === 'spawn') majDepart();
    update(TOUR_SIM);
    /* Une fois par seconde de jeu, l'empreinte part au relais, qui la
       compare a celle des autres joueurs. */
    /* Pendant une reprise (gameState._rejeu), les autres joueurs ont deja
       valide ces tours : l'empreinte ne part que toutes les 10 s (le relais
       la compare a la leur, un ecart se verrait encore), et le detail, qui
       ne sert qu'a comparer les joueurs entre eux, n'est pas calcule. */
    if (gameState.lockstep && gameState.tour % 60 === 0 && (!gameState._rejeu || gameState.tour % 600 === 0)) {
        const e = empreinteEtat(true);
        envoyerAuRelais({ t: 'empreinte', tour: gameState.tour, h: e.empreinte, p: e.parts });
        /* Le detail de la partie a ce tour, garde un moment : si le relais
           signale un ecart, on le lui enverra pour qu'il dise quoi. */
        const L = gameState.lockstep;
        if (!gameState._rejeu) {
            if (!L.details) L.details = {};
            L.details[gameState.tour] = detailPartie();
            delete L.details[gameState.tour - 240];
        }
    }
    /* La photo de la partie, pour une reprise instantanee. */
    if (gameState.lockstep && gameState.tour % PHOTO_TOURS === 0 && !gameState._rejeu) prendrePhoto();
}

