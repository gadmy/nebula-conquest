// ─────────────────────────────────────────────
// HUD — Mise à jour
// ─────────────────────────────────────────────
/* La jauge d'envoi : le pourcentage en gros, et sous lui le nombre de spores
   que partirait vraiment de l'astre en main - selectionne, suivi, ou celui
   qui s'apprete a tirer. Le pourcentage seul ne dit pas grand-chose quand on
   ne sait pas sur quoi il s'applique. */
let _jaugePulseT = null;
/* LA FICHE, sous la jauge d'envoi. Tout ce qu'on sait de l'astre choisi,
   d'un coup d'oeil, sans ouvrir de panneau ; et quand rien n'est choisi,
   le bilan du joueur. Rafraichie avec le reste de l'interface, six fois
   par seconde. Les noms passent par _fEsc : un pseudo vient d'un joueur. */
function _fEsc(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function _fCase(label, valeur, cls) {
    return '<div><span>' + label + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + valeur + '</b></div>';
}
function _fDuree(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0');
}

function majFiche() {
    const el = document.getElementById('ficheHud');
    if (!el) return;
    if (gameState.phase !== 'game') { el.style.display = 'none'; return; }
    if (el.style.display !== 'block') el.style.display = 'block';
    const tete = document.getElementById('ficheTete');
    const grille = document.getElementById('ficheGrille');
    const moi = localSlot();
    const b = (typeof followingBody !== 'undefined' && followingBody) ? followingBody : gameState.selectedBody;
    let h = '', g = '';

    if (b && b.type !== 'sun') {
        // ── L'ASTRE CHOISI ──
        const j = (b.owner !== null && b.owner !== undefined && b.owner >= 0) ? gameState.players[b.owner] : null;
        const couleur = j ? j.color : '#888888';
        const qui = !j ? 'NEUTRE' : (b.owner === moi ? 'À VOUS' : _fEsc(j.name));
        h = '<i style="background:' + _fEsc(couleur) + '"></i>' + _fEsc(b.name)
          + '<small>' + (b.type === 'planet' ? 'PLANÈTE' : 'LUNE') + ' · ' + qui + '</small>';

        const max = Math.max(1, b.maxSpores || 1);
        const part = Math.max(0, Math.min(1, (b.spores || 0) / max));
        g += _fCase('Spores', _sp(Math.floor(b.spores || 0)) + ' / ' + _sp(Math.floor(max)));
        g += _fCase('Rempli', Math.round(part * 100) + ' %', part >= PART_SATUREE ? 'neg' : '');
        const debit = debitAstre(b);
        g += _fCase('Production', debit > 0 ? '+' + _sp(debit) + '/s' : '—', debit > 0 ? 'pos' : '');
        g += _fCase('Rendement', Math.round(courbeCroissance(part) * 100) + ' %');
        g += _fCase('Flore', Math.round(b.flore || 0));
        g += _fCase('Faune', Math.round(b.faune || 0));
        g += _fCase('Symbiose', Math.round(b.symbiosis || 0) + ' %');
        g += _fCase('Bâtiments', iconeBat('alveole', 13) + (b.alveoles || 0) + ' ' + iconeBat('nid', 13) + (b.nids || 0) + ' ' + iconeBat('biome', 13) + (b.biomes || 0));

        /* Astre partage : la part du sol qu'on tient, c'est LA donnee qui
           compte - a qui est vraiment cette planete. */
        const L = b.lutte;
        if (L && L.zones) {
            const v = campDe(b, moi);
            let tout = 0, mien = 0;
            for (const id in L.zones) { tout += L.zones[id].n; if (L.zones[id].v === v) mien += L.zones[id].n; }
            g += _fCase('Terrain', tout ? Math.round(100 * mien / tout) + ' % à vous' : '—', mien ? 'pos' : '');
        } else if (b.parasite) {
            g += _fCase('Parasite', 'actif', 'neg');
        } else if (b.type === 'planet') {
            g += _fCase('Lunes', (b.moons || []).length);
        }
        /* Le type d'une planete, et tant qu'elle est neutre le tir qui la
           prend le mieux. */
        if (b.type === 'planet') {
            const ty = typePlanete(b), fav = TIR_FAVORI[ty];
            g += _fCase('Type', NOMS_TYPE_PLANETE[ty] || ty);
            if (!j && fav) g += _fCase('Point faible', NOMS_TIR[fav[0]] + ' +' + Math.round((fav[1] - 1) * 100) + ' %', 'pos');
        } else {
            g += _fCase('Planète', _fEsc(b.parent ? b.parent.name : '—'));
        }
    } else {
        // ── LE JOUEUR, quand rien n'est choisi ──
        const j = gameState.players[moi];
        if (!j) { el.style.display = 'none'; return; }
        h = '<i style="background:' + _fEsc(j.color) + '"></i>' + _fEsc(j.name) + '<small>BILAN DU JOUEUR</small>';
        let pl = 0, lu = 0, debit = 0;
        for (const x of (j.bodies || [])) {
            if (x.type === 'planet') pl++; else if (x.type === 'moon') lu++;
            debit += debitAstre(x);
        }
        let sys = 0;
        for (const s of gameState.suns) if (isSystemComplete(s, moi)) sys++;
        const st = j.stats || {};
        const te = j.tech || {};
        const att = multiEnAttente(j);
        g += _fCase('Astres', pl + ' pl. · ' + lu + ' lunes');
        /* Recompte ici : en multijoueur, l'instantane du serveur ecrase
           totalSpores par un zero entre deux mises a jour de l'interface. */
        let tot = 0;
        for (const x of (j.bodies || [])) tot += x.spores || 0;
        g += _fCase('Spores', _sp(Math.floor(tot)));
        g += _fCase('Production', '+' + _sp(debit) + '/s', 'pos');
        g += _fCase('Stats', '🌱' + (st.growth || 0) + ' ⚡' + (st.velocity || 0) + ' 💎' + (st.density || 0) + ' ☀' + (st.sensitivity || 0));
        g += _fCase('Multiplicité', (j.multiTier || 0) + '/10' + (att ? ' (+' + att + ')' : ''), att ? 'pos' : '');
        g += _fCase('Sacrifice', (j.multiSacrifice || 0) + ' %');
        g += _fCase('Technos', '🎯' + (te.homing || 0) + ' 💪' + (te.tenacity || 0) + ' 🦎' + (te.mimicry || 0));
        g += _fCase('Systèmes', sys + ' complet' + (sys > 1 ? 's' : ''));
        const gs = gameState.gameStats || {};
        g += _fCase('Jets · prises', (gs.jetsLaunched || 0) + ' · ' + (gs.bodiesConquered || 0));
    }

    if (tete._h !== h) { tete.innerHTML = h; tete._h = h; }
    if (grille._h !== g) { grille.innerHTML = g; grille._h = g; }
}

function majJaugeEnvoi(pulse) {
    const surf = document.getElementById('surfaceHud');
    if (surf) {
        /* Le bandeau ne dit plus dans quel mode on est - il n'y en a plus
           qu'un - mais ce que le tir fera SI on lache maintenant. Il ne
           s'affiche donc que pendant la visee, depuis un astre ou le tir de
           surface est possible. */
        const src = gameState._fireSource;
        const vise = gameState.phase === 'game' && gameState._firePhase === 'aiming';
        const dispo = vise && src && src.type !== 'sun' && !gameState._boule
                   && src.radius * gameState.camera.zoom >= SURFACE_MIN_PX
                   && peutTirerSurface(src, localSlot());
        const veut = dispo ? 'block' : 'none';
        if (surf.style.display !== veut) surf.style.display = veut;
        if (dispo) {
            surf.textContent = astreTirSurface()
                ? '\u260D TIR DE SURFACE \u00B7 ' + src.name
                : '\u260D ' + src.name + ' \u2014 VISEZ SON SOL POUR UN TIR DE SURFACE';
        }
    }
    const hud = document.getElementById('envoiHud');
    if (!hud) return;
    if (gameState.phase !== 'game') { hud.style.display = 'none'; return; }
    hud.style.display = 'block';

    const pct = Math.round(gameState.jetRatio * 100);
    const val = document.getElementById('envoiPct');
    if (val) val.innerHTML = pct + '<span>%</span>';
    const bar = document.getElementById('envoiBar');
    if (bar) bar.style.width = pct + '%';

    const src = gameState._fireLanceur || gameState._fireSource
             || ((typeof followingBody !== 'undefined' && followingBody) ? followingBody : null)
             || gameState.selectedBody;
    const nb = document.getElementById('envoiNb');
    if (nb && gameState._demol) {
        const g = gameState._demolGenre || 'nid';
        nb.innerHTML = 'DÉMOLISSEUR<em>' + DEMOL_SPORES + ' · ' + iconeBat(g, 14) + ' ' + DEMOL_NOMS[g] + '</em>';
    } else if (nb && gameState._boule) {
        /* Pendant la charge : le contenu de la boule, sur son maximum. */
        let n = gameState._boule.n;
        if (gameState.isMulti) {
            const mienne = (gameState._boulesServeur || []).find(x => x.owner === localSlot());
            n = mienne ? mienne.n : 0;
        }
        nb.innerHTML = 'BOULE ' + Math.floor(n) + '<em>/ ' + BOULE_MAX + '</em>';
    } else if (nb && gameState._rafale) {
        /* Pendant la rafale, le pourcentage ne compte plus : on tire par paquets. */
        nb.innerHTML = 'RAFALE<em>' + RAFALE_PAQUET + ' × ' + RAFALE_CADENCE + '/s</em>';
    } else if (nb) {
        /* Un soleil : ce que contient son anneau. */
        const _soleil = src && src.type === 'sun';
        nb.innerHTML = (src && (_soleil || (src.owner === localSlot() && src.spores !== undefined)))
            ? Math.floor(reserveTir(src, localSlot()) * gameState.jetRatio) + '<em>SPORES' + (_soleil ? ' · ANNEAU' : '') + '</em>'
            : '';
    }
    if (pulse) {
        hud.classList.add('pulse');
        clearTimeout(_jaugePulseT);
        _jaugePulseT = setTimeout(function () { hud.classList.remove('pulse'); }, 220);
    }
}

function updateHUD() {
    if (gameState.phase !== 'game') return;
    majJaugeEnvoi(false);
    majFiche();

    // Zoom clavier P/M
    if (_keysDown['p'] || _keysDown['P']) {
        gameState.camera.zoom = Math.min(gameState.camera.maxZoom, gameState.camera.zoom * 1.02);
    }
    if (_keysDown['m'] || _keysDown['M']) {
        gameState.camera.zoom = Math.max(gameState.camera.minZoom, gameState.camera.zoom * 0.98);
    }

    // Recalculer totalSpores pour chaque joueur
    for (const player of gameState.players) {
        let total = 0;
        for (const body of player.bodies) {
            total += body.spores;
        }
        player.totalSpores = total;
    }

    // Compteur spores joueur humain
    const human = gameState.players[localSlot()];
    if (human && DOM.sporeCount) {
        DOM.sporeCount.textContent = _sp(human.totalSpores);
        const modsEl = document.getElementById('sporeMods');
        if (modsEl) {
            const mods = [];
            const sacPct = human.multiSacrifice || 0;
            let totalRate = 0;
            for (const body of human.bodies) {
                totalRate += debitAstre(body);
            }
            let sysBonusCount = 0;
            for (const sun of gameState.suns) {
                if (isSystemComplete(sun, localSlot())) sysBonusCount++;
            }
            if (totalRate > 0) mods.push({ cls:'pos', label:`+${Math.round(totalRate)}/s`, tip:'Production totale (sp/s)' });
            if (sacPct > 0) mods.push({ cls:'neg', label:`-${sacPct}% sacr.`, tip:'Spores sacrifiées pour la multiplicité' });
            if (sysBonusCount > 0) mods.push({ cls:'pos', label:`+${sysBonusCount*3}% sys.`, tip:`${sysBonusCount} système(s) complet(s)` });
            // Parasites reçus/envoyés
            const _parasitedByMe = [...gameState.planets, ...gameState.moons].filter(b => b.parasite && b.parasite.ownerSlot === localSlot());
            const _parasitedOnMe = human.bodies.filter(b => b.parasite);
            if (_parasitedOnMe.length > 0) mods.push({ cls:'neg', label:`-20% ×${_parasitedOnMe.length} parasite`, tip:`Planètes parasitées: ${_parasitedOnMe.map(b=>b.name).join(', ')}` });
            if (_parasitedByMe.length > 0) mods.push({ cls:'pos', label:`+drain ×${_parasitedByMe.length}`, tip:`Parasites actifs sur: ${_parasitedByMe.map(b=>b.name).join(', ')}` });
            modsEl.innerHTML = mods.map(m =>
                `<span class="spore-mod ${m.cls}" title="${m.tip}">${m.label}</span>`
            ).join('');
        }

        /* Batiments : le total sur TOUS les astres du joueur, pour voir d'un
           coup d'oeil ce qui a ete construit sans ouvrir chaque fiche. */
        const batsEl = document.getElementById('sporeBats');
        if (batsEl) {
            let alv = 0, nid = 0, bio = 0, par = 0;
            for (const body of human.bodies) {
                alv += body.alveoles || 0;
                nid += body.nids || 0;
                bio += body.biomes || 0;
                par += body.parasiteSpore || 0;
            }
            const bats = [
                { icone: iconeBat('alveole', 14), n: alv, tip: 'Alveoles : stockage. Gains decroissants, 20 puis 15, 10 et 5 % par astre.' },
                { icone: iconeBat('nid', 14), n: nid, tip: 'Nids : production. Gains decroissants, 20 puis 15, 10 et 5 % par astre.' },
                { icone: iconeBat('biome', 14), n: bio, tip: 'Biomes : defense. Gains decroissants, 20 puis 15, 10 et 5 % par astre.' },
                { icone: iconeBat('parasite', 14), n: par, tip: 'Spores parasitaires pretes' },
            ].filter(b => b.n > 0);
            batsEl.innerHTML = bats.map(b =>
                `<span class="spore-bat" title="${b.tip}">${b.icone} <b>${b.n}</b></span>`
            ).join('');
        }
    }

    // Courbe de naissance de la zone choisie
    majPanneauNaissance();

    // Tableau des scores
    updateScoreBoard();

    // Timer
    updateGameTimer();

    // Minimap (throttle toutes les 15 frames)
    if (gameState._hudCounter % 15 === 0) drawMinimap();

    // Codex si ouvert : rafraîchir les données sans repositionner
    if (gameState.codexOpen && gameState.selectedBody) {
        const _b = gameState.selectedBody;
        document.getElementById('codexSpores').textContent = _b.spores !== undefined ? _sp(_b.spores) : '—';
        _codexBatiments(_b);
        if (_b.owner !== null && _b.symbiosis !== undefined) {
            const pct = Math.floor(_b.symbiosis);
            document.getElementById('codexSymVal').textContent = pct + '%';
            document.getElementById('codexSymBar').style.width = pct + '%';
        }
        if (_b.owner === localSlot()) updateCodexBuild(_b);
    }
}

let _lastScoreHash = '';
/* LES ETOILES DE COMMERCE : une petite etoile par commerce en cours du
   joueur - bronze planete contre planete, argent systeme planetaire, or
   systeme solaire. Le survol dit avec qui. */
const ETOILES_COMMERCE = { 1: ['#CD7F32', 'bronze'], 2: ['#C8D0DA', 'argent'], 3: ['#FFD700', 'or'] };
function _etoilesCommerce(player) {
    const cs = (gameState.commerces || []).filter(function (c) { return c.a === player.id || c.b === player.id; });
    if (!cs.length) return { html: '', cle: '' };
    /* Une etoile par niveau, suivie du nombre de commerces s'il y en a
       plusieurs : la colonne reste etroite. */
    let html = '<span class="score-etoiles">', cle = '';
    for (const niv of [3, 2, 1]) {
        const ici = cs.filter(function (c) { return c.niveau === niv; });
        if (!ici.length) continue;
        const e = ETOILES_COMMERCE[niv];
        const nom = (COMMERCE_CFG.niveaux[niv] || {}).nom || '';
        const avec = ici.map(function (c) { const a = gameState.players[c.a === player.id ? c.b : c.a]; return a ? a.name : '?'; }).join(', ');
        const titre = esc(ici.length + ' commerce' + (ici.length > 1 ? 's ' : ' ') + e[1] + ' (' + nom.toLowerCase() + ') avec ' + avec).replace(/"/g, '&quot;');
        html += '<span style="color:' + e[0] + '" title="' + titre + '">★' + (ici.length > 1 ? '<small>' + ici.length + '</small>' : '') + '</span>';
        cle += niv + 'x' + ici.length + '.';
    }
    return { html: html + '</span>', cle: cle };
}
function updateScoreBoard() {
    const board = DOM.scoreBoard;
    if (!board) return;
    const totalBodies = gameState.planets.length + gameState.moons.length;

    // Calculer un hash rapide pour éviter innerHTML inutile
    let hash = '';
    let html = '';
    /* Grande partie (plus de 16 joueurs) : du plus grand au plus petit, les
       elimines a la fin ; la liste defile (#scoreBoard, jeu.css). */
    let liste = gameState.players;
    if (liste.length > 16) {
        liste = liste.slice().sort(function (a, b) {
            return ((b.bodies ? b.bodies.length : 0) - (a.bodies ? a.bodies.length : 0)) || (a.id - b.id);
        });
    }
    for (const player of liste) {
        const owned = player.bodies ? player.bodies.length : 0;
        const pct = totalBodies > 0 ? Math.round((owned / totalBodies) * 100) : 0;
        const _et = _etoilesCommerce(player);
        hash += player.id + ':' + pct + ':' + _et.cle + ',';
        html += `<div class="score-row${player.id === localSlot() ? ' moi' : ''}" data-slot="${player.id}" title="Clic droit : info / commerce">
            <div class="score-color" style="background:${player.color}"></div>
            <span class="score-name">${player.name}${player.guildTag ? ' <span style="color:rgba(251,146,60,0.6);font-size:10px;">['+player.guildTag+']</span>' : ''}</span>${_et.html}
            <div class="score-bar-bg"><div class="score-bar" style="width:${pct}%;background:${player.color}"></div></div>
            <span class="score-pct">${pct}%</span>
        </div>`;
    }

    if (hash !== _lastScoreHash) {
        _lastScoreHash = hash;
        const handle = board.querySelector('.panel-drag-handle');
        board.innerHTML = html;
        if (handle) board.insertBefore(handle, board.firstChild);
    }
}


