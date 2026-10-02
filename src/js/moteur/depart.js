// ─────────────────────────────────────────────
// DÉPART : RÉGIME POLITIQUE, PUIS CHOIX DE LA PLANÈTE
// ─────────────────────────────────────────────
/* Au debut de chaque partie (solo et reseau, pas le tutoriel ni l'ancien
   multijoueur) :
   1. Chacun choisit un REGIME POLITIQUE : 3 points d'evolution offerts,
      repartis selon le regime. En solo on prend son temps ; en reseau, 15 s,
      et les retardataires recoivent un regime au hasard. Les IA en tirent un.
   2. Puis le CHOIX DE LA PLANETE, en 15 s pour tous. On RESERVE un astre
      libre (pas deja reserve par un autre) et on peut changer d'avis
      jusqu'au bout ; les reservations de chacun se voient sur la carte.
      Les IA reservent les leurs pendant le decompte. A zero, chacun
      s'installe sur sa reservation ; sans reservation : un astre au hasard.
   Tout passe par des ordres et se compte en tours : meme chose chez tous
   les joueurs en reseau. */
const REGIMES = [
    { id: 'centre_collaborateur',  nom: 'Centre collaborateur',   icone: '⚖️', stats: { growth: 1, velocity: 1, density: 1 },      texte: "D'accord avec tout le monde. Surtout avec le plus fort.", pourquoi: "La Terre était fichue : ils ont attendu de voir ce que faisaient les autres partis, puis ils ont suivi." },
    { id: 'gauche_non_solidaire',  nom: 'Gauche non solidaire',   icone: '🌹', stats: { growth: 1, density: 1, sensitivity: 1 },    texte: 'Partager, oui. Mais chacun le sien.', pourquoi: "Un grand vaisseau pour tous ? Non : une spore chacun, et chacun sa planète." },
    { id: 'dictature_eclairee',    nom: 'Dictature éclairée',     icone: '💡', stats: { velocity: 1, density: 1, sensitivity: 1 },  texte: 'Un seul chef, mais il a lu des livres.', pourquoi: "Le chef a calculé qu'une spore ne vote jamais contre lui. Le départ a été voté à 100 %." },
    { id: 'royaute_plusieurs',     nom: 'Royauté à plusieurs',    icone: '👑', stats: { growth: 1, density: 2 },                    texte: 'Douze rois, un seul trône, beaucoup de réunions.', pourquoi: "La Terre détruite ne suffisait plus à tous ces rois : il leur fallait chacun un royaume." },
    { id: 'fascisme_sympa',        nom: 'Fascisme sympa',         icone: '🎖️', stats: { velocity: 2, density: 1 },                  texte: 'On marche au pas, mais on dit merci.', pourquoi: "Partir en rangs serrés de spores, au pas, vers des planètes à conquérir. Poliment." },
    { id: 'anarchie_organisee',    nom: 'Anarchie très organisée', icone: '🏴', stats: { velocity: 3 },                             texte: 'Pas de chef, mais un planning très strict.', pourquoi: "La fin du monde était au planning. Le départ en spores aussi : mardi, 14 h." },
    { id: 'ecolo_pas_trop',        nom: 'Écolo mais pas trop',    icone: '🌿', stats: { growth: 1, sensitivity: 2 },                texte: 'On protège les soleils. Sauf le week-end.', pourquoi: "Ils avaient prévenu que la planète finirait détruite. Ils partent quand même les premiers." },
    { id: 'communisme_neoliberal', nom: 'Communisme néolibéral',  icone: '📈', stats: { growth: 2, sensitivity: 1 },                texte: 'Tout appartient à tous. Surtout aux actionnaires.', pourquoi: "Des millions d'adhérents en spores, sans salaire ni congés : la conquête la plus rentable de l'histoire." },
    { id: 'droite_proletaire',     nom: 'Droite prolétaire',      icone: '🛠️', stats: { growth: 3 },                                texte: 'Travailler plus pour produire plus. Beaucoup plus.', pourquoi: "Le travail ne s'arrête pas pour une fin du monde : on part en spores et on reprend ailleurs." }
];
const STATS_REGIME = [
    { cle: 'growth', nom: 'Croissance', icone: '🌱', couleur: '#4ADE80' },
    { cle: 'velocity', nom: 'Vélocité', icone: '⚡', couleur: '#FACC15' },
    { cle: 'density', nom: 'Densité', icone: '💎', couleur: '#38BDF8' },
    { cle: 'sensitivity', nom: 'Sensibilité', icone: '☀', couleur: '#F472B6' }
];
const DEPART_CFG = {
    compte: 15,          /* secondes pour choisir sa planete */
    regimeReseau: 15,    /* secondes pour choisir son regime, en reseau */
    iaPremier: 2,        /* les IA reservent entre 2 et 11 s */
    iaDernier: 11,
    statMax: 8           /* plafond d'une statistique */
};

function regimeDe(id) { return REGIMES.find(function (r) { return r.id === id; }) || null; }
function departActif() { return gameState.phase === 'spawn' && !gameState.isTutorial && !gameState.isMulti; }
function _humainsDepart() { return gameState.players.filter(function (p) { return p.isHuman; }); }
function reservePar(nom) {
    const D = gameState.depart;
    if (!D) return -1;
    for (const s in D.reserv) if (D.reserv[s] === nom) return +s;
    return -1;
}

function appliquerRegime(p) {
    const R = regimeDe(p.regime);
    if (!R || p._regimeApplique) return;
    p._regimeApplique = true;
    for (const k in R.stats) p.stats[k] = Math.min(DEPART_CFG.statMax, (p.stats[k] || 0) + R.stats[k]);
}

/* L'etat du depart, cree au premier besoin (un ordre peut arriver avant le
   premier tour de la phase). */
function _etatDepart() {
    if (!departActif()) return null;
    if (!gameState.depart) {
        gameState.depart = { etape: 'regime', fin: gameState.lockstep ? gameState.tour + DEPART_CFG.regimeReseau * 60 : Infinity,
                             reserv: {}, iaT: {} };
    }
    return gameState.depart;
}

/* A chaque tour de la phase de depart (tourSimulation). */
function majDepart() {
    const D = _etatDepart();
    if (!D) return;
    if (D.etape === 'regime') {
        const humains = _humainsDepart();
        if (!humains.every(function (h) { return h.regime; }) && gameState.tour < D.fin) return;
        for (const p of gameState.players) {
            if (!p.regime) p.regime = REGIMES[Math.floor(gameRandom() * REGIMES.length)].id;
            appliquerRegime(p);
        }
        D.etape = 'planete';
        D.fin = gameState.tour + DEPART_CFG.compte * 60;
        for (const p of gameState.players) {
            if (p.isHuman) continue;
            D.iaT[p.id] = gameState.tour + Math.round((DEPART_CFG.iaPremier + gameRandom() * (DEPART_CFG.iaDernier - DEPART_CFG.iaPremier)) * 60);
        }
        const moi = gameState.players[localSlot()];
        if (moi) addEvent('mine', regimeDe(moi.regime).icone, 'Régime : ' + regimeDe(moi.regime).nom, null, moi.color);
        return;
    }
    for (const id in D.iaT) {
        if (gameState.tour >= D.iaT[id] && D.reserv[id] === undefined) iaReserver(+id);
    }
    if (gameState.tour >= D.fin) finirDepart();
}

/* L'IA prend un astre libre, loin des autres reservations, a bonne flore. */
function _meilleurAstreLibre(slot) {
    const D = gameState.depart;
    let best = null, bestScore = -1;
    const pris = [];
    for (const s in D.reserv) if (+s !== slot) { const b = astreNomme(D.reserv[s]); if (b) pris.push(b); }
    for (const b of gameState.planets.concat(gameState.moons)) {
        if (b.owner !== null || reservePar(b.name) >= 0) continue;
        let minDist = Infinity;
        for (const o of pris) minDist = Math.min(minDist, Math.hypot(b.x - o.x, b.y - o.y));
        const score = (pris.length ? minDist : 0) + (b.flore || 0) * 2;
        if (score > bestScore) { bestScore = score; best = b; }
    }
    return best;
}
function iaReserver(slot) {
    const b = _meilleurAstreLibre(slot);
    if (b) gameState.depart.reserv[slot] = b.name;
}

/* L'ordre 'reserver' : un astre libre, que personne d'autre n'a reserve. */
function reserverAstre(slot, nom) {
    const D = gameState.depart;
    if (!departActif() || !D || D.etape !== 'planete') return;
    const b = astreNomme(nom);
    if (!b || (b.type !== 'planet' && b.type !== 'moon') || b.owner !== null) return;
    const qui = reservePar(nom);
    if (qui >= 0 && qui !== slot) {
        if (slot === localSlot()) toastCommerce(b.name + ' est déjà réservée par ' + gameState.players[qui].name, '#FCA5A5');
        return;
    }
    D.reserv[slot] = nom;
    if (slot === localSlot()) playClickSound();
}

/* Le decompte est fini : chacun s'installe. */
function finirDepart() {
    const D = gameState.depart;
    for (const p of gameState.players) {
        let b = D.reserv[p.id] !== undefined ? astreNomme(D.reserv[p.id]) : null;
        if (!b || b.owner !== null) {
            if (p.isHuman) {
                const libres = gameState.planets.concat(gameState.moons).filter(function (x) { return x.owner === null; });
                b = libres.length ? libres[Math.floor(gameRandom() * libres.length)] : null;
            } else b = _meilleurAstreLibre(p.id);
        }
        if (!b) continue;
        b.owner = p.id;
        b.spores = b.maxSpores * 0.5;
        p.bodies = [b];
        p.spawnPlanet = b;
        p._spawnAnnounced = true;
        if (!gameState._spawnFlashes) gameState._spawnFlashes = [];
        gameState._spawnFlashes.push({ body: b, age: 0, maxAge: 2.5, color: p.color });
        if (p.id === localSlot()) addEvent('mine', '🌍', 'Vous colonisez ' + b.name + ' !', b, p.color);
        else addEvent('war', '🌍', p.name + ' colonise ' + b.name + ' !', b, p.color);
    }
    marquerTerritoiresSales();
    gameState.depart = null;
    fermerEcranRegime();
    setPhase('game');
}

// ── L'écran des régimes (cartes) ──
let _ecranRegime = null, _regimeClique = null;
function ouvrirEcranRegime() {
    if (_ecranRegime) return;
    const el = document.createElement('div');
    el.id = 'ecranRegime';
    let cartes = '';
    for (const R of REGIMES) {
        let stats = '';
        for (const S of STATS_REGIME) {
            const n = R.stats[S.cle] || 0;
            stats += '<div class="rg-stat' + (n ? '' : ' rg-zero') + '" title="' + S.nom + '"><span>' + S.icone + '</span><b style="color:' + (n ? S.couleur : '#475569') + ';">+' + n + '</b></div>';
        }
        cartes += '<div class="rg-carte" data-id="' + R.id + '">' +
            '<div class="rg-image"><span class="rg-icone">' + R.icone + '</span>' +
            '<img src="assets/regimes/' + R.id + '.svg" alt="" onload="this.parentNode.classList.add(\'rg-logo\')" onerror="this.remove()"></div>' +
            '<div class="rg-nom">' + R.nom + '</div>' +
            '<div class="rg-texte">' + R.texte + '</div>' +
            '<div class="rg-pourquoi">' + (R.pourquoi || '') + '</div>' +
            '<div class="rg-stats">' + stats + '</div></div>';
    }
    el.innerHTML = '<div class="rg-titre">CHOISISSEZ VOTRE RÉGIME</div>' +
        '<div class="rg-sous">La Terre est détruite. Seules des spores peuvent la quitter : votre parti y transforme ses adhérents pour conquérir l\'univers.<br>3 points d\'évolution offerts, répartis selon le régime.</div>' +
        '<div class="rg-info" id="rgInfo"></div>' +
        '<div class="rg-grille">' + cartes + '</div>';
    el.querySelectorAll('.rg-carte').forEach(function (c) {
        c.addEventListener('click', function () {
            const D = gameState.depart;
            if (!D || D.etape !== 'regime') return;
            _regimeClique = c.dataset.id;
            playClickSound();
            donnerOrdre('regime', { id: c.dataset.id });
            majEcranRegime();
        });
    });
    document.body.appendChild(el);
    _ecranRegime = el;
}
function fermerEcranRegime() {
    if (_ecranRegime) { _ecranRegime.remove(); _ecranRegime = null; }
    _regimeClique = null;
}
function majEcranRegime() {
    if (!_ecranRegime) return;
    const moi = gameState.players[localSlot()];
    const choisi = (moi && moi.regime) || _regimeClique;
    _ecranRegime.querySelectorAll('.rg-carte').forEach(function (c) { c.classList.toggle('rg-choisie', c.dataset.id === choisi); });
    const D = gameState.depart, info = _ecranRegime.querySelector('#rgInfo');
    if (gameState.lockstep && D) {
        const H = _humainsDepart();
        const n = H.filter(function (h) { return h.regime; }).length;
        const reste = Math.max(0, Math.ceil((D.fin - gameState.tour) / 60));
        info.textContent = reste + ' s · ' + n + ' / ' + H.length + ' joueurs ont choisi' + (choisi ? ' · en attente des autres…' : '');
    } else info.textContent = '';
}

/* A chaque image : l'ecran qui va avec l'etape (regime, puis decompte). */
let _departUiT = 0;
function majUiDepart() {
    const D = gameState.depart;
    if (!departActif() || !D) { if (_ecranRegime) fermerEcranRegime(); _majBoutonLancer(false); return; }
    const now = performance.now();
    if (now - _departUiT < 200) return;
    _departUiT = now;
    const banner = document.getElementById('spawnBanner');
    if (banner) banner.style.visibility = D.etape === 'regime' ? 'hidden' : '';
    if (D.etape === 'regime') { ouvrirEcranRegime(); majEcranRegime(); _majBoutonLancer(false); return; }
    if (_ecranRegime) fermerEcranRegime();
    const reste = Math.max(0, Math.ceil((D.fin - gameState.tour) / 60));
    const mien = D.reserv[localSlot()];
    if (banner) banner.textContent = (mien ? 'VOTRE PLANÈTE : ' + mien.toUpperCase() + ' — vous pouvez encore changer' : 'CHOISISSEZ VOTRE PLANÈTE DE DÉPART') + ' — ' + reste + ' s';
    _majBoutonLancer(!gameState.lockstep && !!mien);
}
/* En solo : pas besoin d'attendre la fin du decompte. */
function _majBoutonLancer(oui) {
    let b = document.getElementById('btnLancerDepart');
    if (!oui) { if (b) b.style.display = 'none'; return; }
    if (!b) {
        b = document.createElement('button');
        b.id = 'btnLancerDepart';
        b.className = 'btn';
        b.textContent = '▶ LANCER LA PARTIE';
        b.style.cssText = 'position:fixed; top:58px; left:50%; transform:translateX(-50%); z-index:56; font-size:12px; padding:6px 18px; letter-spacing:2px; background:rgba(34,197,94,0.2); border-color:rgba(34,197,94,0.5); color:#4ADE80; cursor:pointer;';
        b.addEventListener('click', function () { playClickSound(); donnerOrdre('depart_vite', {}); b.style.display = 'none'; });
        document.body.appendChild(b);
    }
    b.style.display = 'block';
}

/* Sur la carte : qui a reserve quoi. Un anneau pointille qui tourne, a la
   couleur du joueur, et son nom au-dessus. */
function drawReservations(ctx) {
    const D = gameState.depart;
    if (!departActif() || !D || D.etape !== 'planete') return;
    const z = gameState.camera.zoom, t = performance.now() / 1000;
    ctx.save();
    for (const s in D.reserv) {
        const b = astreNomme(D.reserv[s]), p = gameState.players[s];
        if (!b || !p || !aLEcran(b.x, b.y, b.radius + 80)) continue;
        const moi = +s === localSlot();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (moi ? 3 : 2) / z;
        ctx.setLineDash([10 / z, 7 / z]);
        ctx.lineDashOffset = -t * 30 / z;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius + 9 / z, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        const px = Math.max(11, Math.min(18, 14 * Math.sqrt(z))) / z;
        ctx.font = 'bold ' + px + 'px Orbitron';
        ctx.textAlign = 'center';
        _texteLisible(ctx, (moi ? '★ ' : '') + p.name, b.x, b.y - b.radius - 16 / z, p.color, Math.max(2, px * 0.22));
    }
    ctx.restore();
}

