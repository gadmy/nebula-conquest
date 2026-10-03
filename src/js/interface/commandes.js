// ─────────────────────────────────────────────
// INTERFACE — Setup UI
// ─────────────────────────────────────────────
function setupUI() {
    // ── Couleur automatique (slot 0 = première couleur) ──
    gameState.playerColor = gameState.teamColors[0];

    // ── Config listeners ──
    // Peupler le sélecteur de maps
    const cfgMap = document.getElementById('cfgMap');
    MAP_LIBRARY.forEach((m, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        const _np = m.suns.reduce((a,s)=>a+s.planets.length,0);
        const _mx = Math.min(50, Math.max(2, _np <= 10 ? _np : _np + 5));
        opt.textContent = m.name + ' · ' + _mx + ' joueurs max';
        cfgMap.appendChild(opt);
    });
    const cfgPlayers = document.getElementById('cfgPlayers');
    function _updateSoloPlayerMax() {
        const val = cfgMap.value;
        if (val === 'random') {
            // En mode aléatoire : prendre le max parmi toutes les cartes
            /* Une planete de depart par joueur, 50 joueurs au plus (49 IA) :
               le depart prendra une carte assez grande. */
            const maxAll = MAP_LIBRARY.reduce((best, m) => Math.max(best, m.suns.reduce((a,s)=>a+s.planets.length,0)), 2);
            cfgPlayers.max = Math.min(49, maxAll - 1);
            return;
        }
        /* Carte de joueur ('j:...') ou de l'editeur ('e') : son nombre de planetes. */
        const npJ = planetesCarteChoisie(val);
        const mapIdx = parseInt(val) || 0;
        const m = MAP_LIBRARY[mapIdx];
        const np = npJ !== null ? npJ : m.suns.reduce((a,s)=>a+s.planets.length,0);
        const maxP = Math.min(49, Math.max(1, np - 1));
        cfgPlayers.max = maxP;
        if (parseInt(cfgPlayers.value) > maxP) {
            cfgPlayers.value = maxP;
            document.getElementById('cfgPlayersVal').textContent = maxP;
        }
    }
    cfgMap.addEventListener('change', _updateSoloPlayerMax);
    _updateSoloPlayerMax();
    cfgPlayers.addEventListener('input', () => {
        document.getElementById('cfgPlayersVal').textContent = cfgPlayers.value;
    });
    const cfgCleaners = document.getElementById('cfgCleaners');
    cfgCleaners.addEventListener('input', () => {
        document.getElementById('cfgCleanersVal').textContent = cfgCleaners.value;
    });

    document.getElementById('cfgPlayersVal').textContent = cfgPlayers.value;
    document.getElementById('cfgCleanersVal').textContent = cfgCleaners.value;

    // ── Boutons navigation ──
    document.getElementById('btnNewGame').addEventListener('click', () => { ensureAudio(); playClickSound(); if (!_checkSporeReady()) return; _applyActiveSpore(); fadeTransition(() => setPhase('config')); });
    document.getElementById('btnBack').addEventListener('click', () => { playClickSound(); fadeTransition(() => setPhase('title')); });
    /* Une carte de joueur se charge d'abord (cartes-joueurs.js). */
    document.getElementById('btnStart').addEventListener('click', () => { playClickSound(); preparerCarteChoisie(() => fadeTransition(() => startGame())); });
    document.getElementById('btnResume').addEventListener('click', () => {
        playClickSound();
        if (gameState.isMulti) {
            afficherPause(false);
        } else {
            togglePause();
        }
    });
    document.getElementById('btnQuit').addEventListener('click', () => {
        playClickSound();
        afficherPause(false);
        if (gameState.isMulti && currentRoom) {
            // Déconnexion franche → l'adversaire gagne
            disconnectSocket();
        }
        gameState.running = false;
        stopAmbiance();
        setPhase('title');
    });
    document.getElementById('codexClose').addEventListener('click', closeCodex);
    document.getElementById('btnReplay').addEventListener('click', () => { hideEndScreen(); startGame(); });
    setupMinimap();
    setupVolumeControl();
    document.getElementById('btnEndQuit').addEventListener('click', () => {
        if (gameState.lockstep) { quitterPartieLockstep(); return; }
        hideEndScreen(); setPhase('title');
    });

    // ── Touche Échap pour pause ──
    /* ─────────────────────────────────────────────
       RACCOURCIS SUR L'ASTRE SELECTIONNE
       1 2 3 : construire alveole, nid, biome - meme ordre que la barre de
               construction du panneau.
       Espace : passer en visee depuis l'astre choisi.
       F      : armer le demolisseur (voir armerDemolisseur).
       G      : armer la spore parasitaire ; en visee, G la lance vers le curseur.
       4, Shift+G : construire un foyer putride (spore parasitaire en 2 min).
       A / E  : envoi -10 / +10 % ; Shift+A / Shift+E : sacrifice -5 / +5 %.
       Tab    : amener la camera sur l'entree suivante de la liste de gauche.
       ───────────────────────────────────────────── */
    function _astreActif() {
        const b = (typeof followingBody !== 'undefined' && followingBody)
                ? followingBody : gameState.selectedBody;
        if (!b || b.owner !== localSlot()) return null;
        return b;
    }

    function _construire(mode) {
        const body = _astreActif();
        if (!body) return;
        if (!demanderConstruction(body, mode)) return;
        if (typeof updateCodexBuild === 'function' && gameState.selectedBody === body) {
            updateCodexBuild(body);
        }
    }

    /* DEUX FACONS DE PARCOURIR SES ASTRES A LA TOUCHE TAB, au choix du
       bouton ⇄ de MES ASTRES : de planete en planete (les lunes sont
       sautees), ou d'astre en astre (chaque planete puis ses lunes). L'ordre
       est celui du panneau : soleil par soleil, planete par planete. Le choix
       est garde d'une partie a l'autre. */
    let _modeTab = 'planetes';
    try { if (localStorage.getItem('nc_modeTab') === 'astres') _modeTab = 'astres'; } catch (e) {}
    function _majBoutonTab() {
        const t = document.getElementById('mpTabModeTxt');
        const b = document.getElementById('mpTabMode');
        if (t) t.textContent = _modeTab === 'astres' ? 'ASTRES' : 'PLANÈTES';
        if (b) b.title = _modeTab === 'astres'
            ? 'Touche Tab : d\'astre en astre (planètes et lunes) — cliquer pour changer'
            : 'Touche Tab : de planète en planète — cliquer pour changer';
    }
    const _btnTab = document.getElementById('mpTabMode');
    if (_btnTab) {
        _majBoutonTab();
        _btnTab.addEventListener('click', function (e) {
            e.stopPropagation();
            _modeTab = _modeTab === 'astres' ? 'planetes' : 'astres';
            try { localStorage.setItem('nc_modeTab', _modeTab); } catch (err) {}
            _majBoutonTab();
            if (typeof playClickSound === 'function') playClickSound();
        });
    }
    function _ordreTab() {
        const moi = localSlot();
        const noms = [];
        for (const s of gameState.suns) {
            for (const p of (s.planets || [])) {
                if (p.owner === moi) noms.push(p.name);
                if (_modeTab !== 'astres') continue;
                for (const m of (p.moons || [])) if (m.owner === moi) noms.push(m.name);
            }
        }
        return noms;
    }

    function _astreSuivant() {
        const noms = _ordreTab();
        if (!noms.length) return;
        const fb = (typeof followingBody !== 'undefined' && followingBody) ? followingBody : null;
        let i = fb ? noms.indexOf(fb.name) : -1;
        /* Sur une lune en mode planetes : on repart de sa planete, pour que
           Tab mene a la SUIVANTE et non a la premiere de la liste. */
        if (i < 0 && fb && fb.type === 'moon' && fb.parent) i = noms.indexOf(fb.parent.name);
        i = (i + 1) % noms.length;
        const suivant = gameState.allBodies.find(function (b) { return b.name === noms[i]; });
        if (!suivant) return;
        followingBody = suivant;
        gameState.camera.x = suivant.x;
        gameState.camera.y = suivant.y;   /* le zoom ne bouge pas */
        document.querySelectorAll('#myPlanetsList .mp-body-row').forEach(function (el) {
            el.classList.toggle('active', el.dataset.bodyName === suivant.name);
        });
    }

    /* ─────────────────────────────────────────────
       CAMERA AU CLAVIER : ZQSD.
       On lit le CODE physique de la touche, pas le caractere : KeyW KeyA
       KeyS KeyD tombent sur Z Q S D en azerty et sur W A S D en qwerty,
       donc les memes quatre touches sous les doigts dans les deux cas.
       Les touches restent enfoncees : on ne bouge pas a chaque frappe, on
       retient qui est appuye et la camera glisse dans la boucle.
       ───────────────────────────────────────────── */
    const _camTouches = { KeyW: 0, KeyA: 0, KeyS: 0, KeyD: 0 };
    const CAM_VITESSE = 900;     /* pixels d'ecran par seconde, zoom compris */

    window.majCameraClavier = function (dt) {
        const h = _camTouches.KeyD - _camTouches.KeyA;
        const v = _camTouches.KeyS - _camTouches.KeyW;
        /* Une sphere capitale capturee : ZQSD la pilote, la camera la suit. */
        if (typeof pilotageCapital === 'function' && pilotageCapital(h, v)) return;
        if (!h && !v) return;
        /* Conduire la camera, c'est reprendre la main : on lache l'astre suivi
           et l'astre en surbrillance dans la liste, comme pour un glisser. */
        if (typeof followingBody !== 'undefined' && followingBody) {
            followingBody = null;
            document.querySelectorAll('.mp-body-row.active')
                    .forEach(function (el) { el.classList.remove('active'); });
        }
        const cam = gameState.camera;
        /* Divise par le zoom : de loin on survole vite, de pres on ajuste. */
        let pas = CAM_VITESSE * dt / cam.zoom;
        if (h && v) pas *= 0.7071;          /* pas plus vite en diagonale */
        cam.x += h * pas;
        cam.y += v * pas;
    };

    /* ─────────────────────────────────────────────
       A et E : la part de spores envoyee a chaque tir, par crans de 5 %.
       Ce sont les codes KeyQ et KeyE : A et E en azerty, Q et E en qwerty -
       de part et d'autre de la main qui tient ZQSD.
       ───────────────────────────────────────────── */
    window.reglerEnvoi = function (delta) {
        const sl = document.getElementById('jetRatioSlider');
        if (!sl) return;
        /* De 10 en 10, cale sur une dizaine (55 % passe a 60 ou 50). */
        const v = Math.max(0, Math.min(100, Math.round((gameState.jetRatio * 100 + delta) / 10) * 10));
        if (v === Math.round(gameState.jetRatio * 100)) return;
        sl.value = v;
        gameState.jetRatio = v / 100;
        const lbl = document.getElementById('jetRatioVal');
        if (lbl) lbl.textContent = v + '%';
        if (gameState.isMulti) sendAction('set_jet_ratio', { value: gameState.jetRatio });
        else donnerOrdre('part', { v: gameState.jetRatio });
        majJaugeEnvoi(true);
    };

    /* SHIFT + A / SHIFT + E : la part de production sacrifiee pour la
       multiplicite (les evolutions), de 5 en 5, de 0 a 50 %. */
    window.reglerSacrifice = function (delta) {
        const human = gameState.players[localSlot()];
        const sl = document.getElementById('evoSacrifice');
        if (!human || !sl) return;
        const cur = human.multiSacrifice || 0;
        const v = Math.max(0, Math.min(50, Math.round((cur + delta) / 5) * 5));
        if (v === cur) return;
        sl.value = v;
        const lbl = document.getElementById('evoSacVal');
        if (lbl) lbl.textContent = v + '%';
        if (gameState.isMulti) { human.multiSacrifice = v; sendAction('set_sacrifice', { value: v }); }
        else donnerOrdre('sacrifice', { v: v });
    };

    window.addEventListener('keyup', (e) => {
        if (_camTouches[e.code] !== undefined) _camTouches[e.code] = 0;
    });
    /* Fenetre quittee touche enfoncee : sans cela la camera part toute seule. */
    window.addEventListener('blur', () => {
        _camTouches.KeyW = _camTouches.KeyA = _camTouches.KeyS = _camTouches.KeyD = 0;
    });

    window.addEventListener('keydown', (e) => {
        /* Les raccourcis de jeu ne doivent pas se declencher pendant une
           saisie, ni par-dessus un menu de pause. */
        const cible = document.activeElement;
        /* Seule une vraie saisie de texte coupe les raccourcis. Un curseur
           (part d'envoi, sacrifice) garde la main apres qu'on l'a touche : le
           compter comme une saisie rendait Espace muet jusqu'au clic suivant
           dans l'interface. */
        const enSaisie = cible && (cible.tagName === 'TEXTAREA' || (cible.tagName === 'INPUT'
            && !['range', 'checkbox', 'radio', 'button', 'submit', 'color'].includes(cible.type)));
        /* ZQSD marche aussi pendant le choix de la planete de depart : c'est
           le moment ou l'on a le plus besoin de parcourir la carte. */
        if ((gameState.phase === 'spawn' || gameState.phase === 'editor') && !enSaisie && !e.ctrlKey && !e.altKey && !e.metaKey
            && _camTouches[e.code] !== undefined) { e.preventDefault(); _camTouches[e.code] = 1; return; }
        if (gameState.phase === 'game' && !enSaisie && !e.ctrlKey && !e.altKey && !e.metaKey) {
            /* Rangee du haut, quel que soit le clavier : en azerty ces touches
               sortent & é " sans majuscule, on lit donc leur position et non
               le caractere. Le pave numerique et un vrai 1 2 3 marchent aussi. */
            const _rang = { Digit1: 'alveole', Digit2: 'nid', Digit3: 'biome', Digit4: 'parasite',
                            Numpad1: 'alveole', Numpad2: 'nid', Numpad3: 'biome', Numpad4: 'parasite' };
            const _bat = _rang[e.code] || ({ '1': 'alveole', '2': 'nid', '3': 'biome', '4': 'parasite' })[e.key];
            if (_bat) {
                e.preventDefault();
                /* 4 : le foyer putride. Inutile si une spore parasitaire attend deja. */
                const _a = _astreActif();
                if (_bat === 'parasite' && _a && (_a.parasiteSpore || 0) >= 1) { secouerEcran(8); return; }
                _construire(_bat);
                return;
            }
            /* Espace : viser depuis l'astre choisi. F arme (ou desarme) le
               DEMOLISSEUR : voir armerDemolisseur. */
            if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) viserDepuisSelection(); return; }
            if (e.code === 'KeyF')  { e.preventDefault(); if (!e.repeat) armerDemolisseur(); return; }
            /* G : armer la spore parasitaire, puis G encore (ou en visee) la
               lance vers le curseur. Shift + G : lancer sa production (le
               foyer putride, comme la touche 4). */
            if (e.code === 'KeyG')  {
                e.preventDefault();
                if (e.repeat) return;
                if (e.shiftKey) {
                    const _a = _astreActif();
                    if (_a && (_a.parasiteSpore || 0) >= 1) { secouerEcran(8); return; }
                    _construire('parasite');
                } else armerParasite();
                return;
            }
            if (e.key === 'Tab')    { e.preventDefault(); _astreSuivant();    return; }
            if (_camTouches[e.code] !== undefined) { e.preventDefault(); _camTouches[e.code] = 1; return; }
            /* La souris designe la cible : sur un astre, la riposte s'y
               limite ; dans le vide, toute la galaxie repart. */
            if (e.code === 'KeyR')  { e.preventDefault(); riposteGenerale(astreSousSouris()); return; }
            /* T : le contraire, nos zones cessent de pousser (meme ciblage). */
            if (e.code === 'KeyT')  { e.preventDefault(); arreterAttaques(astreSousSouris()); return; }
            if (e.code === 'KeyQ')  { e.preventDefault(); if (e.shiftKey) reglerSacrifice(-5); else reglerEnvoi(-10); return; }
            if (e.code === 'KeyE')  { e.preventDefault(); if (e.shiftKey) reglerSacrifice(+5); else reglerEnvoi(+10); return; }
        }
        if (e.key === 'Escape') {
            if (gameState.phase === 'game') togglePause();
            else if (gameState.phase === 'paused') togglePause();
        }
        if (e.key === 'F3') {
            e.preventDefault();
            basculerDiagnostic();
            return;
        }
        if (_diagOuvert && (e.key === 'd' || e.key === 'D')) {
            e.preventDefault();
            detaillerRendu();
            return;
        }
        if (e.key === 'F1') {
            e.preventDefault();
            let panel = document.getElementById('debugF1');
            if (panel) { panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'; return; }
            panel = document.createElement('div');
            panel.id = 'debugF1';
            panel.style.cssText = 'position:fixed;top:10px;left:10px;z-index:9999;background:rgba(0,10,30,0.92);border:1px solid #3af;color:#cde;font:12px monospace;padding:12px 16px;display:flex;flex-direction:column;gap:6px;border-radius:8px;max-height:90vh;overflow-y:auto;pointer-events:auto;min-width:340px;';
            const _P = window._debugCfg || {};
            const defs = [
                ['sunOrbitBase', 'Soleils: orbite base', 200, 100, 3000, 50],
                ['sunOrbitSpacing', 'Soleils: espacement', 100, 50, 2000, 50],
                ['sunRadMin', 'Soleils: rayon min', 80, 5, 120, 1],
                ['sunRadVar', 'Soleils: rayon var (+)', 24, 0, 60, 1],
                ['pOrbitBase', 'Planètes: orbite base (×R+)', 30, 5, 150, 5],
                ['pOrbitSpacing', 'Planètes: espacement', 95, 10, 150, 5],
                ['pOrbitSpacingVar', 'Planètes: esp. var (+)', 15, 0, 60, 5],
                ['pRadMin', 'Planètes: rayon min', 20, 2, 40, 1],
                ['pRadVar', 'Planètes: rayon var (+)', 12, 0, 30, 1],
                ['mOrbitBase', 'Lunes: orbite base (×R+)', 12, 2, 40, 1],
                ['mOrbitSpacing', 'Lunes: espacement', 14, 4, 40, 1],
                ['mRadMin', 'Lunes: rayon min', 10, 1, 20, 1],
                ['mRadVar', 'Lunes: rayon var (+)', 2, 0, 12, 1],
            ];
            if (!window._debugCfg) {
                window._debugCfg = {};
                defs.forEach(d => window._debugCfg[d[0]] = d[2]);
            }
            const title = document.createElement('div');
            title.textContent = '⚙ DEBUG UNIVERS (F1)';
            title.style.cssText = 'font-size:13px;font-weight:bold;color:#3af;margin-bottom:4px;';
            panel.appendChild(title);
            defs.forEach(d => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;';
                const lbl = document.createElement('span');
                lbl.textContent = d[1];
                lbl.style.cssText = 'flex:1;font-size:11px;';
                const sl = document.createElement('input');
                sl.type = 'range'; sl.min = d[3]; sl.max = d[4]; sl.step = d[5];
                sl.value = window._debugCfg[d[0]];
                sl.style.cssText = 'width:100px;';
                const val = document.createElement('span');
                val.textContent = sl.value;
                val.style.cssText = 'width:36px;text-align:right;color:#fff;font-size:11px;';
                sl.addEventListener('input', () => { window._debugCfg[d[0]] = parseFloat(sl.value); val.textContent = sl.value; });
                row.appendChild(lbl); row.appendChild(sl); row.appendChild(val);
                panel.appendChild(row);
            });
            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:8px;margin-top:6px;';
            const btnRegen = document.createElement('button');
            btnRegen.textContent = '🔄 Régénérer univers';
            btnRegen.style.cssText = 'flex:1;padding:6px;background:#1a3a5c;color:#fff;border:1px solid #3af;border-radius:4px;cursor:pointer;font-size:12px;';
            btnRegen.addEventListener('click', () => {
                gameState.multiSeed = null;
                generateUniverse();
                gameState.suns.forEach(s => createSunTexture(s));
                gameState.planets.forEach(p => createPlanetTexture(p));
                gameState.moons.forEach(m => createMoonTexture(m));
                rebuildAllBodies();
                buildSunHaloCache();
            });
            const btnCopy = document.createElement('button');
            btnCopy.textContent = '📋 Copier valeurs';
            btnCopy.style.cssText = 'flex:1;padding:6px;background:#1a3a5c;color:#fff;border:1px solid #3af;border-radius:4px;cursor:pointer;font-size:12px;';
            btnCopy.addEventListener('click', () => {
                const txt = JSON.stringify(window._debugCfg, null, 2);
                navigator.clipboard.writeText(txt).then(() => btnCopy.textContent = '✅ Copié !');
                setTimeout(() => btnCopy.textContent = '📋 Copier valeurs', 1500);
            });
            btnRow.appendChild(btnRegen); btnRow.appendChild(btnCopy);
            panel.appendChild(btnRow);
            document.body.appendChild(panel);
        }
        // ═══ F2 — ÉDITEUR DE MAP ═══
        if (e.key === 'F2') {
            e.preventDefault();
            editeurCarte().toggle();
        }
    });
}


/* L'EDITEUR DE CARTE : cree une fois, a la premiere ouverture (F2 en
   partie, ou bouton EDITEUR DE CARTE du menu, voir cartes-joueurs.js). */
function editeurCarte() {
    if (window._mapEditor) return window._mapEditor;
            window._mapEditor = (function() {
                let active = false;
                let mode = 'sun'; // sun, planet, moon, asteroid_dark, asteroid_red, asteroid_green, delete
                let selectedSun = null;
                let selectedPlanet = null;
                let placedSuns = [];
                let placedAsteroids = []; // {sun, angle, radiusOff, beltRadius, type, subRocks}
                const panel = document.createElement('div');
                panel.id = 'mapEditorPanel';
                panel.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;background:rgba(0,10,30,0.95);border:1px solid #f80;color:#eda;font:11px monospace;padding:10px 12px;display:none;flex-direction:column;gap:3px;border-radius:8px;max-height:92vh;overflow-y:auto;pointer-events:auto;width:160px;user-select:none;';
                const title = document.createElement('div');
                title.textContent = '🗺️ ÉDITEUR DE MAP (F2)';
                title.style.cssText = 'font-size:13px;font-weight:bold;color:#f80;margin-bottom:6px;';
                panel.appendChild(title);
                // Info
                const info = document.createElement('div');
                info.id = 'editorInfo';
                info.style.cssText = 'font-size:10px;color:#888;margin-bottom:4px;line-height:1.4;';
                info.textContent = 'Clic gauche = placer (sur un astre du même genre : le changer) · Clic droit = supprimer · ZQSD = se déplacer · Molette = zoom · Deux astres d\'une même orbite doivent rester écartés';
                panel.appendChild(info);
                // Mode buttons
                const modes = [
                    ['sun', '☀ Soleil'],
                    ['planet', '🪐 Planète'],
                    ['moon', '🌙 Lune'],
                    ['asteroid_dark', '⚫ Astéroïde noir'],
                    ['asteroid_red', '🔴 Astéroïde rouge'],
                    ['asteroid_green', '🟢 Astéroïde vert'],
                ];
                const modeContainer = document.createElement('div');
                modeContainer.style.cssText = 'display:flex;flex-direction:column;gap:3px;margin-bottom:6px;';
                const modeBtns = {};
                modes.forEach(([m, label]) => {
                    const btn = document.createElement('button');
                    btn.textContent = label;
                    btn.style.cssText = 'padding:5px 8px;background:rgba(255,136,0,0.1);border:1px solid rgba(255,136,0,0.3);color:#eda;border-radius:4px;cursor:pointer;font:11px monospace;text-align:left;transition:all 0.15s;';
                    btn.addEventListener('click', () => {
                        mode = m;
                        Object.values(modeBtns).forEach(b => { b.style.background='rgba(255,136,0,0.1)'; b.style.borderColor='rgba(255,136,0,0.3)'; });
                        btn.style.background = 'rgba(255,136,0,0.35)';
                        btn.style.borderColor = '#f80';
                        updateInfo();
                    });
                    modeBtns[m] = btn;
                    modeContainer.appendChild(btn);
                });
                modeBtns['sun'].style.background = 'rgba(255,136,0,0.35)';
                modeBtns['sun'].style.borderColor = '#f80';
                panel.appendChild(modeContainer);
                // Selection info
                const selInfo = document.createElement('div');
                selInfo.id = 'editorSelInfo';
                selInfo.style.cssText = 'font-size:10px;color:#f80;margin-bottom:6px;min-height:28px;';
                panel.appendChild(selInfo);
                // Sep
                const sep1 = document.createElement('div');
                sep1.style.cssText = 'height:1px;background:rgba(255,136,0,0.2);margin:4px 0;';
                panel.appendChild(sep1);
                // Boutons action
                const btnRow = document.createElement('div');
                btnRow.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
                const btnClear = document.createElement('button');
                btnClear.textContent = '🗑️ Tout effacer';
                btnClear.style.cssText = 'padding:6px;background:#3a1a0a;color:#f80;border:1px solid #f80;border-radius:4px;cursor:pointer;font:12px monospace;';
                btnClear.addEventListener('click', () => {
                    if (!confirm('Effacer toute la map ?')) return;
                    gameState.suns = []; gameState.planets = []; gameState.moons = [];
                    gameState.asteroidBelts = []; placedSuns = []; placedAsteroids = [];
                    selectedSun = null; selectedPlanet = null;
                    rebuildAllBodies(); updateInfo();
                });
                const btnExport = document.createElement('button');
                btnExport.textContent = '💾 Exporter la map';
                btnExport.style.cssText = 'padding:6px;background:#0a2a1a;color:#4f8;border:1px solid #4f8;border-radius:4px;cursor:pointer;font:12px monospace;';
                btnExport.addEventListener('click', exportMap);
                btnRow.appendChild(btnClear); btnRow.appendChild(btnExport);
                panel.appendChild(btnRow);
                document.body.appendChild(panel);

                function getSunFlore(sun) {
                    let total = 0;
                    for (const p of sun.planets) {
                        total += (p.flore || 0);
                        for (const m of p.moons) total += (m.flore || 0);
                    }
                    return Math.round(total);
                }

                function adjustSunFlore(sun, pct) {
                    const factor = 1 + pct / 100;
                    for (const p of sun.planets) {
                        p.flore = Math.round(Math.min(FLORE_MAX, Math.max(0, (p.flore || 0) * factor)));
                        for (const m of p.moons) {
                            m.flore = Math.round(Math.min(FLORE_MAX, Math.max(0, (m.flore || 0) * factor)));
                        }
                    }
                    updateInfo();
                }

                // Panneau puissance par soleil
                const sunPowerPanel = document.createElement('div');
                sunPowerPanel.id = 'editorSunPower';
                sunPowerPanel.style.cssText = 'margin-top:6px;display:flex;flex-direction:column;gap:4px;';
                panel.insertBefore(sunPowerPanel, btnRow);

                function updateSunPowerPanel() {
                    sunPowerPanel.innerHTML = '';
                    if (gameState.suns.length === 0) return;
                    const title = document.createElement('div');
                    title.style.cssText = 'height:1px;background:rgba(255,136,0,0.2);margin:4px 0;';
                    sunPowerPanel.appendChild(title);
                    /* Ce que font + et - : la flore (fertilite) de tout le
                       systeme, donc la vitesse a laquelle ses astres produisent. */
                    const aide = document.createElement('div');
                    aide.style.cssText = 'font-size:10px;color:#aaa;line-height:1.35;';
                    aide.textContent = 'Richesse de chaque système : en vert sa production (taille × flore de ses astres), en rouge sa faune totale. − / + baisse ou monte la flore de tous ses astres de 5 % : plus de flore = les astres produisent plus vite.';
                    sunPowerPanel.appendChild(aide);
                    /* L'EQUILIBRE (equilibre.js) : l'ecart entre le meilleur et le
                       moins bon systeme, en rouge au-dela de 20 %, et le bouton
                       qui ramene tout le monde a +/- 8 %. */
                    const ec = ecartSystemes(gameState.suns);
                    const pc = function (r) { return isFinite(r) ? Math.round((r - 1) * 100) + ' %' : '∞'; };
                    const ligneEc = document.createElement('div');
                    ligneEc.style.cssText = 'font-size:10px;line-height:1.35;';
                    ligneEc.innerHTML = 'Écart entre systèmes : production <b style="color:' + (ec.production > 1.2 ? '#f66' : '#4f8') + '">' + pc(ec.production) +
                        '</b> · faune <b style="color:' + (ec.faune > 1.2 ? '#f66' : '#4f8') + '">' + pc(ec.faune) + '</b> (20 % au plus)';
                    sunPowerPanel.appendChild(ligneEc);
                    const btnEq = document.createElement('button');
                    btnEq.textContent = '⚖ Équilibrer les systèmes';
                    btnEq.title = 'Ajuste la flore et la faune des astres pour que chaque système vaille à peu près les autres (±8 %). Les astres ne bougent pas.';
                    btnEq.style.cssText = 'padding:4px;background:#1a2a1a;color:#4f8;border:1px solid #4f8;border-radius:4px;cursor:pointer;font:11px monospace;';
                    btnEq.addEventListener('click', () => {
                        equilibrerSystemes(gameState.suns);
                        for (const b of gameState.planets.concat(gameState.moons)) b._baseFaune = b.faune;
                        updateSunPowerPanel();
                    });
                    sunPowerPanel.appendChild(btnEq);
                    for (const sun of gameState.suns) {
                        const prod = productionSysteme(sun), fa = fauneSysteme(sun);
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:10px;';
                        row.innerHTML = `<span style="color:#f80;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">☀ ${sun.name}</span><span style="color:#4f8;min-width:34px;text-align:right;" title="Production">${(prod / 1000).toFixed(1)}k</span><span style="color:#f88;min-width:26px;text-align:right;" title="Faune">${Math.round(fa)}</span>`;
                        const btnMinus = document.createElement('button');
                        btnMinus.textContent = '−';
                        btnMinus.title = 'Flore -5 % sur tous les astres de ce système (ils produisent moins vite)';
                        btnMinus.style.cssText = 'padding:1px 6px;background:rgba(255,0,0,0.2);border:1px solid #f44;color:#f88;border-radius:3px;cursor:pointer;font:11px monospace;';
                        btnMinus.addEventListener('click', () => { adjustSunFlore(sun, -5); updateSunPowerPanel(); });
                        const btnPlus = document.createElement('button');
                        btnPlus.textContent = '+';
                        btnPlus.title = 'Flore +5 % sur tous les astres de ce système (ils produisent plus vite)';
                        btnPlus.style.cssText = 'padding:1px 6px;background:rgba(0,255,100,0.15);border:1px solid #4f8;color:#4f8;border-radius:3px;cursor:pointer;font:11px monospace;';
                        btnPlus.addEventListener('click', () => { adjustSunFlore(sun, +5); updateSunPowerPanel(); });
                        row.appendChild(btnMinus);
                        row.appendChild(btnPlus);
                        sunPowerPanel.appendChild(row);
                    }
                }

                function updateInfo() {
                    let txt = '';
                    if (mode === 'sun') txt = 'Cliquez pour placer un soleil. Il orbitera le trou noir.';
                    else if (mode === 'planet') txt = selectedSun ? ('Soleil sélectionné: ' + selectedSun.name + ' — cliquez autour pour placer une planète.') : '⚠ Cliquez d\'abord sur un soleil existant.';
                    else if (mode === 'moon') txt = selectedPlanet ? ('Planète sélectionnée: ' + selectedPlanet.name + ' — cliquez autour.') : '⚠ Cliquez d\'abord sur une planète existante.';
                    else if (mode.startsWith('asteroid_')) txt = selectedSun ? ('Soleil: ' + selectedSun.name + ' — cliquez pour placer un astéroïde.') : '⚠ Cliquez d\'abord sur un soleil.';
                    txt += '\n☀ ' + gameState.suns.length + ' soleils · 🪐 ' + gameState.planets.length + ' planètes · 🌙 ' + gameState.moons.length + ' lunes · ☄ ' + gameState.asteroidBelts.reduce((n,b) => n+b.rocks.length, 0) + ' astéroïdes';
                    selInfo.textContent = txt;
                    updateSunPowerPanel();
                }

                function findClosestSun(wx, wy) {
                    let best = null, bestD = Infinity;
                    for (const s of gameState.suns) { const d = Math.hypot(s.x-wx, s.y-wy); if (d < bestD) { bestD=d; best=s; } }
                    return best;
                }
                function findClosestPlanet(wx, wy) {
                    let best = null, bestD = Infinity;
                    for (const p of gameState.planets) { const d = Math.hypot(p.x-wx, p.y-wy); if (d < bestD) { bestD=d; best=p; } }
                    return best;
                }
                function findClosestBody(wx, wy) {
                    let best = null, bestD = Infinity;
                    for (const s of gameState.suns) { const d = Math.hypot(s.x-wx, s.y-wy); if (d < s.radius+20 && d < bestD) { bestD=d; best=s; } }
                    for (const p of gameState.planets) { const d = Math.hypot(p.x-wx, p.y-wy); if (d < p.radius+15 && d < bestD) { bestD=d; best=p; } }
                    for (const m of gameState.moons) { const d = Math.hypot(m.x-wx, m.y-wy); if (d < m.radius+10 && d < bestD) { bestD=d; best=m; } }
                    return best;
                }

                /* LA PLACE SUR UNE ORBITE. Deux astres d'un meme parent gardent
                   un ecart : sur la meme orbite, le long de l'orbite ; sur deux
                   orbites voisines, entre les orbites (sinon ils finiraient par
                   se croiser). Une lune tourne hors de sa planete, une planete
                   hors de son soleil. Rend la raison du refus, ou null. */
                const MARGE_ORBITE = 30;
                function placeLibre(freres, parent, orbitR, angle, r, sauf) {
                    const x = parent.x + Math.cos(angle) * orbitR, y = parent.y + Math.sin(angle) * orbitR;
                    const nomP = parent.name || 'trou noir';
                    if (orbitR < (parent.radius || 0) + r + MARGE_ORBITE) return 'trop près de ' + nomP;
                    for (const f of freres) {
                        if (f === sauf) continue;
                        const dr = Math.abs(f.orbitRadius - orbitR);
                        if (dr < 1) {
                            if (Math.hypot(f.x - x, f.y - y) < f.radius + r + MARGE_ORBITE) return 'trop près de ' + f.name + ' sur la même orbite';
                        } else if (dr < f.radius + r + MARGE_ORBITE) return 'son orbite croiserait celle de ' + f.name;
                    }
                    return null;
                }
                function refus(msg) {
                    selInfo.textContent = '⛔ Impossible : ' + msg + '. Écartez-le un peu.';
                    selInfo.style.color = '#f66';
                    clearTimeout(refus._t);
                    refus._t = setTimeout(function () { selInfo.style.color = '#f80'; updateInfo(); }, 2200);
                }

                /* CLIQUER SUR UN ASTRE DU GENRE CHOISI le change au lieu d'en
                   poser un second dessus : nouvelle taille, nouvelle apparence
                   (l'apparence d'une planete ou d'une lune decoule de sa taille ;
                   un soleil change de couleur). Il reste a sa place. */
                const COULEURS_SOLEIL = ['#FFE44D','#FFB830','#FF8C42','#FF6B6B','#7CB9FF'];
                /* LA TAILLE D'UN SOLEIL SUIT SA COULEUR : les rouges sont 40 %
                   plus petits que les jaunes, les bleus un peu plus grands
                   (+20 %). Base : 150 a 250. */
                const TAILLE_COULEUR = { '#FF6B6B': 0.6, '#7CB9FF': 1.2 };
                function rayonSoleil(couleur) {
                    return Math.round((150 + Math.floor(Math.random() * 101)) * (TAILLE_COULEUR[couleur] || 1));
                }
                function changerAstre(b) {
                    const sun = b.type === 'sun', planete = b.type === 'planet';
                    const parent = sun ? gameState.blackHole : b.parent;
                    const freres = sun ? gameState.suns : planete ? parent.planets : parent.moons;
                    const ang = Math.atan2(b.y - parent.y, b.x - parent.x);
                    const avant = sun ? b.color : (planete ? b.planetType : b.moonType);
                    const r0 = b.radius;
                    /* Un soleil change de couleur d'abord : sa taille en depend. */
                    const couleurNeuve = sun ? (function () { const autres = COULEURS_SOLEIL.filter(c => c !== avant); return autres[Math.floor(Math.random() * autres.length)]; })() : null;
                    for (let essai = 0; essai < 40; essai++) {
                        const r = sun ? rayonSoleil(couleurNeuve)
                                : planete ? 70 + Math.floor(Math.random() * 61)
                                : 20 + Math.floor(Math.random() * 41);
                        if (placeLibre(freres, parent, b.orbitRadius, ang, r, b)) continue;
                        /* Les lunes doivent rester hors de la planete agrandie. */
                        if (planete && (b.moons || []).some(m => m.orbitRadius < r + m.radius + MARGE_ORBITE)) continue;
                        b.radius = r;
                        if (sun) {
                            b.color = couleurNeuve;
                            createSunTexture(b);
                            buildSunHaloCache();
                            updateInfo();
                            return;
                        }
                        b.maxSpores = Math.floor(r * 50);
                        b.baseMaxSpores = b.maxSpores;
                        if (planete) createPlanetTexture(b); else createMoonTexture(b);
                        /* Meme apparence qu'avant : on retente une autre taille. */
                        if ((planete ? b.planetType : b.moonType) === avant && essai < 39) continue;
                        updateInfo();
                        return;
                    }
                    /* Aucune taille ne tient la place : on garde l'astre tel quel. */
                    if (b.radius !== r0) {
                        b.radius = r0; b.maxSpores = Math.floor(r0 * 50); b.baseMaxSpores = b.maxSpores;
                        if (planete) createPlanetTexture(b); else if (!sun) createMoonTexture(b);
                    }
                    refus('pas de place pour le changer');
                }

                const SNAP_THRESHOLD = 80;
                function snapSunOrbit(rawR) {
                    for (const s of gameState.suns) {
                        if (Math.abs(s.orbitRadius - rawR) < SNAP_THRESHOLD) return { radius: s.orbitRadius, speed: s.orbitSpeed };
                    }
                    return null;
                }
                function snapPlanetOrbit(sun, rawR) {
                    for (const p of sun.planets) {
                        if (Math.abs(p.orbitRadius - rawR) < SNAP_THRESHOLD) return { radius: p.orbitRadius, speed: p.orbitSpeed };
                    }
                    return null;
                }
                function snapMoonOrbit(planet, rawR) {
                    for (const m of planet.moons) {
                        if (Math.abs(m.orbitRadius - rawR) < SNAP_THRESHOLD * 0.5) return { radius: m.orbitRadius, speed: m.orbitSpeed };
                    }
                    return null;
                }

                function placeSun(wx, wy) {
                    const bh = gameState.blackHole;
                    const rawR = Math.hypot(wx - bh.x, wy - bh.y);
                    const angle = Math.atan2(wy - bh.y, wx - bh.x);
                    const snap = snapSunOrbit(rawR);
                    const orbitR = snap ? snap.radius : rawR;
                    const speed = snap ? snap.speed : (0.02 + Math.random() * 0.015) / (1 + orbitR * 0.0005);
                    const couleur = COULEURS_SOLEIL[Math.floor(Math.random() * COULEURS_SOLEIL.length)];
                    const r = rayonSoleil(couleur);
                    const _non = placeLibre(gameState.suns, bh, orbitR, angle, r, null);
                    if (_non) { refus(_non); return; }
                    const sun = {
                        type: 'sun', name: generateName(), radius: r,
                        orbitRadius: orbitR, orbitSpeed: speed,
                        angle: angle, x: Math.cos(angle) * orbitR + bh.x, y: Math.sin(angle) * orbitR + bh.y,
                        color: couleur,
                        planets: []
                    };
                    createSunTexture(sun);
                    gameState.suns.push(sun);
                    buildSunHaloCache();
                    selectedSun = sun;
                    updateInfo();
                }

                function placePlanet(wx, wy) {
                    if (!selectedSun) return;
                    const rawR = Math.hypot(wx - selectedSun.x, wy - selectedSun.y);
                    const angle = Math.atan2(wy - selectedSun.y, wx - selectedSun.x);
                    const snap = snapPlanetOrbit(selectedSun, rawR);
                    const orbitR = snap ? snap.radius : rawR;
                    const speed = snap ? snap.speed : (0.08 + Math.random() * 0.06) / (1 + orbitR * 0.002);
                    const r = 70 + Math.floor(Math.random() * 61);
                    const _non = placeLibre(selectedSun.planets, selectedSun, orbitR, angle, r, null);
                    if (_non) { refus(_non); return; }
                    const planet = {
                        type: 'planet', name: generateName(), radius: r,
                        flore: Math.floor(Math.random() * 101),
                        faune: Math.floor(Math.random() * 101), _baseFaune: 0,
                        symbiosis: 0, symOwnerTime: 0,
                        buildMode: 'off', nids: 0, biomes: 0, alveoles: 0,
                        orbitRadius: orbitR, orbitSpeed: speed, angle: angle,
                        parent: selectedSun, x: selectedSun.x + Math.cos(angle) * orbitR, y: selectedSun.y + Math.sin(angle) * orbitR,
                        owner: null, spores: 0, maxSpores: Math.floor(r * 50),
                        moons: []
                    };
                    planet._baseFaune = planet.faune;
                    createPlanetTexture(planet);
                    selectedSun.planets.push(planet);
                    gameState.planets.push(planet);
                    rebuildAllBodies();
                    selectedPlanet = planet;
                    updateInfo();
                }

                function placeMoon(wx, wy) {
                    if (!selectedPlanet) return;
                    const rawR = Math.hypot(wx - selectedPlanet.x, wy - selectedPlanet.y);
                    const angle = Math.atan2(wy - selectedPlanet.y, wx - selectedPlanet.x);
                    const snap = snapMoonOrbit(selectedPlanet, rawR);
                    const orbitR = snap ? snap.radius : rawR;
                    const speed = snap ? snap.speed : 0.15 + Math.random() * 0.2;
                    const r = 20 + Math.floor(Math.random() * 41);
                    const _non = placeLibre(selectedPlanet.moons, selectedPlanet, orbitR, angle, r, null);
                    if (_non) { refus(_non); return; }
                    const moon = {
                        type: 'moon', name: generateName(), radius: r,
                        flore: Math.floor(Math.random() * 51),
                        faune: Math.floor(Math.random() * 61),
                        symbiosis: 0, symOwnerTime: 0,
                        buildMode: 'off', nids: 0, biomes: 0, alveoles: 0,
                        orbitRadius: orbitR, orbitSpeed: speed, angle: angle,
                        parent: selectedPlanet, x: selectedPlanet.x + Math.cos(angle) * orbitR, y: selectedPlanet.y + Math.sin(angle) * orbitR,
                        owner: null, spores: 0, maxSpores: Math.floor(r * 50)
                    };
                    createMoonTexture(moon);
                    selectedPlanet.moons.push(moon);
                    gameState.moons.push(moon);
                    rebuildAllBodies();
                    updateInfo();
                }

                function placeAsteroid(wx, wy) {
                    if (!selectedSun) return;
                    const aType = mode.replace('asteroid_', '');
                    const dist = Math.hypot(wx - selectedSun.x, wy - selectedSun.y);
                    const angle = Math.atan2(wy - selectedSun.y, wx - selectedSun.x);
                    // Chercher une ceinture existante proche
                    let belt = null;
                    for (const b of gameState.asteroidBelts) {
                        if (b.sun === selectedSun && Math.abs(b.radius - dist) < 40) { belt = b; break; }
                    }
                    if (!belt) {
                        belt = { sun: selectedSun, radius: dist, orbitSpeed: 0.005 + Math.random() * 0.006, rocks: [] };
                        gameState.asteroidBelts.push(belt);
                    }
                    const rockCount = 3 + Math.floor(Math.random() * 4);
                    const subRocks = [];
                    for (let r = 0; r < rockCount; r++) {
                        const bR = 50 + Math.floor(Math.random()*50), bG = 40 + Math.floor(Math.random()*40), bB = 35 + Math.floor(Math.random()*35);
                        let cr=bR, cg=bG, cb=bB;
                        if (r%3===0) { if (aType==='dark'){cr-=15;cg-=15;cb-=10;} else if (aType==='red'){cr+=60;cg-=10;cb-=10;} else {cr-=10;cg+=50;cb-=10;} }
                        subRocks.push({ offX:(Math.random()-0.5)*16, offY:(Math.random()-0.5)*16, size:2+Math.random()*4, color:`rgb(${Math.max(0,cr)},${Math.max(0,cg)},${Math.max(0,cb)})` });
                    }
                    belt.rocks.push({ angle: angle, radiusOff: (Math.random()-0.5)*25, subRocks: subRocks, type: aType });
                    updateInfo();
                }

                function deleteBody(wx, wy) {
                    const body = findClosestBody(wx, wy);
                    if (!body) return;
                    if (body.type === 'sun') {
                        // Supprimer le soleil et tout son système
                        for (const p of body.planets) {
                            for (const m of p.moons) { const mi = gameState.moons.indexOf(m); if (mi>=0) gameState.moons.splice(mi,1); }
                            const pi = gameState.planets.indexOf(p); if (pi>=0) gameState.planets.splice(pi,1);
                        }
                        gameState.asteroidBelts = gameState.asteroidBelts.filter(b => b.sun !== body);
                        const si = gameState.suns.indexOf(body); if (si>=0) gameState.suns.splice(si,1);
                        if (selectedSun === body) selectedSun = null;
                        buildSunHaloCache();
                    } else if (body.type === 'planet') {
                        for (const m of body.moons) { const mi = gameState.moons.indexOf(m); if (mi>=0) gameState.moons.splice(mi,1); }
                        const parent = body.parent;
                        if (parent) { const pi = parent.planets.indexOf(body); if (pi>=0) parent.planets.splice(pi,1); }
                        const gi = gameState.planets.indexOf(body); if (gi>=0) gameState.planets.splice(gi,1);
                        if (selectedPlanet === body) selectedPlanet = null;
                    } else if (body.type === 'moon') {
                        const parent = body.parent;
                        if (parent) { const mi = parent.moons.indexOf(body); if (mi>=0) parent.moons.splice(mi,1); }
                        const gi = gameState.moons.indexOf(body); if (gi>=0) gameState.moons.splice(gi,1);
                    }
                    rebuildAllBodies();
                    updateInfo();
                }

                /* La carte telle qu'elle se garde : le format de MAP_LIBRARY. */
                function donneesCarte(nom) {
                    return {
                        name: nom || (generateName() + '-' + generateName()),
                        blackHole: { x: gameState.blackHole.x, y: gameState.blackHole.y, radius: gameState.blackHole.radius },
                        suns: gameState.suns.map(s => ({
                            name: s.name, radius: Math.round(s.radius), orbitRadius: Math.round(s.orbitRadius),
                            orbitSpeed: +s.orbitSpeed.toFixed(4), angle: +s.angle.toFixed(3), color: s.color,
                            planets: s.planets.map(p => ({
                                name: p.name, radius: Math.round(p.radius), orbitRadius: Math.round(p.orbitRadius),
                                orbitSpeed: +p.orbitSpeed.toFixed(4), angle: +p.angle.toFixed(3),
                                flore: p.flore, faune: p.faune,
                                moons: p.moons.map(m => ({
                                    name: m.name, radius: Math.round(m.radius), orbitRadius: Math.round(m.orbitRadius),
                                    orbitSpeed: +m.orbitSpeed.toFixed(4), angle: +m.angle.toFixed(3),
                                    flore: m.flore, faune: m.faune
                                }))
                            }))
                        })),
                        asteroidBelts: gameState.asteroidBelts.map(b => ({
                            sunName: b.sun.name, radius: Math.round(b.radius),
                            orbitSpeed: +b.orbitSpeed.toFixed(4),
                            rocks: b.rocks.map(r => ({ angle: +r.angle.toFixed(3), radiusOff: Math.round(r.radiusOff), type: r.type }))
                        }))
                    };
                }
                function exportMap() {
                    const mapData = donneesCarte();
                    const mapName = mapData.name;
                    const json = JSON.stringify(mapData, null, 2);
                    navigator.clipboard.writeText(json).then(() => {
                        btnExport.textContent = '✅ Copié ! Map: ' + mapName;
                        setTimeout(() => btnExport.textContent = '💾 Exporter la map', 3000);
                    });
                }

                // Intercepter les clics sur le canvas quand l'éditeur est actif
                const canvas = document.getElementById('gameCanvas');
                canvas.addEventListener('mousedown', function editorClick(e) {
                    if (!active) return;
                    const rect = canvas.getBoundingClientRect();
                    const cam = gameState.camera;
                    const wx = (e.clientX - rect.left - gameState.width/2) / cam.zoom + cam.x;
                    const wy = (e.clientY - rect.top - gameState.height/2) / cam.zoom + cam.y;

                    if (e.button === 2) { // clic droit = supprimer
                        e.preventDefault(); e.stopPropagation();
                        deleteBody(wx, wy);
                        return;
                    }
                    if (e.button !== 0) return;

                    if (mode === 'sun') {
                        // Clic sur un soleil existant = le sélectionner et le changer, sinon placer
                        const cs = findClosestSun(wx, wy);
                        if (cs && Math.hypot(cs.x-wx, cs.y-wy) < cs.radius + 30) {
                            selectedSun = cs; e.stopPropagation(); changerAstre(cs); return;
                        }
                        e.stopPropagation();
                        placeSun(wx, wy);
                    } else if (mode === 'planet') {
                        // Clic sur une planète existante = la sélectionner et la changer
                        const cp = findClosestPlanet(wx, wy);
                        if (cp && Math.hypot(cp.x-wx, cp.y-wy) < cp.radius + 20) {
                            selectedPlanet = cp; selectedSun = cp.parent; e.stopPropagation(); changerAstre(cp); return;
                        }
                        // Clic sur soleil = sélectionner
                        const cs = findClosestSun(wx, wy);
                        if (cs && Math.hypot(cs.x-wx, cs.y-wy) < cs.radius + 30) {
                            selectedSun = cs; updateInfo(); e.stopPropagation(); return;
                        }
                        if (selectedSun) { e.stopPropagation(); placePlanet(wx, wy); }
                    } else if (mode === 'moon') {
                        // Clic sur une lune existante = la changer
                        const cl = findClosestBody(wx, wy);
                        if (cl && cl.type === 'moon') {
                            selectedPlanet = cl.parent; selectedSun = cl.parent.parent; e.stopPropagation(); changerAstre(cl); return;
                        }
                        // Clic sur planète = sélectionner
                        const cp = findClosestPlanet(wx, wy);
                        if (cp && Math.hypot(cp.x-wx, cp.y-wy) < cp.radius + 20) {
                            selectedPlanet = cp; selectedSun = cp.parent; updateInfo(); e.stopPropagation(); return;
                        }
                        // Clic sur soleil = sélectionner
                        const cs = findClosestSun(wx, wy);
                        if (cs && Math.hypot(cs.x-wx, cs.y-wy) < cs.radius + 30) {
                            selectedSun = cs; selectedPlanet = null; updateInfo(); e.stopPropagation(); return;
                        }
                        if (selectedPlanet) { e.stopPropagation(); placeMoon(wx, wy); }
                    } else if (mode.startsWith('asteroid_')) {
                        const cs2 = findClosestSun(wx, wy);
                        if (cs2 && Math.hypot(cs2.x-wx, cs2.y-wy) < cs2.radius + 30) {
                            selectedSun = cs2; updateInfo(); e.stopPropagation(); return;
                        }
                        if (selectedSun) { e.stopPropagation(); placeAsteroid(wx, wy); }
                    }
                }, true); // capture phase pour intercepter avant le jeu

                canvas.addEventListener('contextmenu', function(e) { if (active) e.preventDefault(); });

                return {
                    /* Pour le menu (cartes-joueurs.js) : la carte, le panneau ou
                       ajouter des boutons, l'etat. */
                    donnees: donneesCarte,
                    panneau: panel,
                    rangee: btnRow,
                    majInfo: function () { updateInfo(); },
                    actif: function () { return active; },
                    toggle(sansQuestion) {
                        active = !active;
                        panel.style.display = active ? 'flex' : 'none';
                        if (active) {
                            gameState._prevPhase = gameState.phase;
                            gameState.phase = 'editor';
                            /* L'editeur peut s'etendre loin : on dezoome autant qu'on veut. */
                            gameState._prevMinZoom = gameState.camera.minZoom;
                            gameState.camera.minZoom = 0.02;
                            // Cacher les éléments de jeu
                            const sp = document.getElementById('spawnBanner'); if (sp) sp.style.display = 'none';
                            const spop = document.getElementById('spawnPopup'); if (spop) spop.style.display = 'none';
                            const evo = document.getElementById('evoPanel'); if (evo) evo.style.display = 'none';
                            const sb = document.getElementById('scoreBoard'); if (sb) sb.style.display = 'none';
                            if (!sansQuestion && gameState.suns.length > 0 && !confirm('Garder la map actuelle ? (Annuler = repartir de zéro)')) {
                                gameState.suns = []; gameState.planets = []; gameState.moons = [];
                                gameState.asteroidBelts = [];
                                rebuildAllBodies(); buildSunHaloCache();
                            }
                            updateInfo();
                        } else {
                            gameState.phase = gameState._prevPhase || 'spawn';
                            if (gameState._prevMinZoom) gameState.camera.minZoom = gameState._prevMinZoom;
                            const evo = document.getElementById('evoPanel'); if (evo) evo.style.display = '';
                            const sb = document.getElementById('scoreBoard'); if (sb) sb.style.display = '';
                        }
                    }
                };
            })();
    return window._mapEditor;
}

let spawnCountdownInterval = null;

function setPhase(phase) {
    /* Une partie en lockstep ne repasse pas par l'ecran titre ni par les
       menus : la connexion au compte, qui se termine quelques secondes apres
       l'ouverture de la page, y renvoyait en plein chargement - et le retour
       au titre efface la graine de la partie (desynchronisation Chrome
       connecte contre Firefox). Pour quitter, on recharge la page. */
    if (gameState.lockstep && gameState.lockstep.slot !== null
        && !['spawn', 'game', 'end'].includes(phase)) return;
    gameState.phase = phase;
    if (spawnCountdownInterval) { clearInterval(spawnCountdownInterval); spawnCountdownInterval = null; }

    /* Une partie qui demarre ferme l'histoire si elle tournait encore. */
    if (phase !== 'title') { try { fermerHistoire(); } catch (e) {} }

    // Cacher tous les écrans
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('helpScreen').classList.add('hidden');
    document.getElementById('eventLog').style.display = 'block';
    document.getElementById('configScreen').classList.add('hidden');
    if (document.getElementById('multiScreen')) document.getElementById('multiScreen').classList.add('hidden');
    if (document.getElementById('tournamentScreen')) document.getElementById('tournamentScreen').classList.add('hidden');
    if (document.getElementById('localScreen')) document.getElementById('localScreen').classList.add('hidden');
    if (document.getElementById('competitionScreen')) document.getElementById('competitionScreen').classList.add('hidden');
    if (document.getElementById('rankedScreen')) document.getElementById('rankedScreen').classList.add('hidden');
    document.getElementById('spawnBanner').classList.add('hidden');
    document.getElementById('gameHud').style.display = 'none';
    afficherPause(false);
    document.getElementById('endScreen').classList.remove('active');
    document.getElementById('gameCanvas').style.display = 'none';
    montrerFondCss(false);

    document.getElementById('myPlanets').style.display = 'none';
    document.getElementById('envoiHud').style.display = 'none';
    document.getElementById('ficheHud').style.display = 'none';
    document.getElementById('surfaceHud').style.display = 'none';
    document.getElementById('sidePanel').style.display = 'none';
    document.getElementById('topRight').style.display = 'none';
    document.getElementById('sporeCounter').style.display = 'none';
    document.getElementById('evoPanel').style.display = 'none';
    document.getElementById('codex').classList.remove('open');

    // Si on quitte une room auto en attente → se désincrire
    if (currentRoom && currentRoom.settings?.mode === 'auto' && currentRoom.status === 'waiting') {
    }

    switch (phase) {
case 'title':
            document.getElementById('titleScreen').classList.remove('hidden');
            if (typeof installerCartesJoueurs === 'function') installerCartesJoueurs();
            setTimeout(() => { ensureAudio(); playTitleMusic(); }, 500);
            connectSocket();
            setTimeout(() => { if (_socket && currentProfile) _socket.emit('register_pseudo', { pseudo: currentProfile.pseudo }); }, 1000);
            if (_titleAnimPlayed) document.getElementById('titleScreen').classList.add('no-intro');
            /* Arrive par un lien d'invitation : on rejoint la partie. */
            setTimeout(invitationDepuisAdresse, 600);
            gameState.running = false;
            const _pEl = document.getElementById('titlePseudo');
            if (_pEl) _pEl.textContent = currentProfile ? '⬡ ' + currentProfile.pseudo
                : (horsLigne ? '⬡ HORS LIGNE — SOLO UNIQUEMENT' : '');
            gameState.isMulti = false;
            gameState.multiSeed = null;
            currentRoom = null; isHost = false;
            stopAmbiance();
            animateTitleScreen();
            break;
        case 'competition':
            document.getElementById('competitionScreen').classList.remove('hidden');
            playTitleMusic();
            break;
        case 'ranked':
            document.getElementById('rankedScreen').classList.remove('hidden');
            playTitleMusic();
            connectSocket();
            setTimeout(() => _initRankedListeners(), 500);
            break;
        case 'tournament':
            document.getElementById('tournamentScreen').classList.remove('hidden');
            playTitleMusic();
            _refreshTournamentUI();
            if (_socket) _socket.emit('tournament_state');
            break;
case 'createMulti':
            document.getElementById('multiScreen').classList.remove('hidden');
            document.getElementById('titleScreen').classList.add('hidden');
            playTitleMusic();
            break;
        case 'room':
            document.getElementById('localScreen').classList.remove('hidden');
            document.getElementById('titleScreen').classList.add('hidden');
            playTitleMusic();
            break;
        case 'config':
            document.getElementById('configScreen').classList.remove('hidden');
            break;
        case 'spawn':
            stopTitleMusic();
            document.getElementById('gameCanvas').style.display = 'block';
            montrerFondCss(true);
            document.getElementById('spawnBanner').classList.remove('hidden');
            document.getElementById('sidePanel').style.display = 'flex';
            document.getElementById('eventLog').style.display = 'block';
            initSidePanel();
            break;
        case 'game':
            document.getElementById('spawnPopup').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            montrerFondCss(true);
            document.getElementById('spawnBanner').classList.add('hidden');
            document.getElementById('gameHud').style.display = 'block';
            document.getElementById('sporeCounter').style.display = 'block';
            document.getElementById('sidePanel').style.display = 'flex';
            document.getElementById('topRight').style.display = 'flex';
            initSidePanel();
            initTopRight();
            break;
        case 'paused':
            document.getElementById('gameCanvas').style.display = 'block';
            montrerFondCss(true);
            document.getElementById('gameHud').style.display = 'block';
            document.getElementById('pauseTitle').textContent = 'PAUSE';
            afficherPause(true);
            break;
    }
}

/* Le livre des regles n'existe qu'a un seul exemplaire : on le DEPLACE entre
   l'ecran AIDE et le menu de pause, plutot que d'en tenir deux copies qui
   finiraient par diverger. */
function livreVersPause() {
    const livre = document.getElementById('helpBook');
    const hote = document.getElementById('pauseBook');
    if (!livre || !hote) return;
    if (livre.parentNode !== hote) hote.appendChild(livre);
    livre.scrollTop = 0;
}

function livreVersAide() {
    const livre = document.getElementById('helpBook');
    const ecran = document.getElementById('helpScreen');
    const retour = document.getElementById('btnHelpBack');
    if (!livre || !ecran || livre.parentNode === ecran) return;
    if (retour) ecran.insertBefore(livre, retour); else ecran.appendChild(livre);
}

function afficherPause(oui) {
    const ov = document.getElementById('pauseOverlay');
    if (!ov) return;
    if (oui) { livreVersPause(); ov.classList.add('active'); }
    else { ov.classList.remove('active'); livreVersAide(); }
}

function togglePause() {
    /* En lockstep non plus, pas de vraie pause : la partie des autres
       continue. Le menu s'ouvre, le jeu tourne. */
    if (gameState.isMulti || gameState.lockstep) {
        if (gameState.phase === 'game') {
            document.getElementById('pauseTitle').textContent = 'MENU';
            afficherPause(true);
        } else {
            afficherPause(false);
        }
        return;
    }
    if (gameState.phase === 'game') {
        gameState.phase = 'paused';
        setPhase('paused');
    } else if (gameState.phase === 'paused') {
        gameState.phase = 'game';
        setPhase('game');
    }
}

function startGame() {
    // Afficher le loading
    document.getElementById('loadingScreen').classList.remove('hidden');
    updateLoadingBar(0, 'Génération de l\'espace...');

    // Lire la config (solo seulement, en multi c'est déjà défini par onMultiGameStart,
    // en lockstep par lancerPartieLockstep)
    if (!gameState.isMulti && !gameState.isTutorial && !gameState.lockstep) {
        gameState.config.difficulty = document.getElementById('cfgDifficulty').value;
        gameState.config.useIA = true;
        gameState.config.aiCount = parseInt(document.getElementById('cfgPlayers').value);
        gameState.config.playerCount = 1 + gameState.config.aiCount;
        gameState.config.cleanerCount = parseInt(document.getElementById('cfgCleaners').value);
        gameState.config.useComets = document.getElementById('cfgComets').value === 'on';
        const mapSel = document.getElementById('cfgMap').value;
        /* Carte au hasard : parmi celles qui ont assez de planetes pour tout
           le monde (deux par joueur, a defaut une, sinon la plus grande). */
        if (mapSel === 'random') {
            const nPl = MAP_LIBRARY.map(function (m) { return m.suns.reduce(function (a, s) { return a + s.planets.length; }, 0); });
            let ok = [];
            for (const parJ of [2, 1]) {
                ok = nPl.map(function (n, i) { return [n, i]; }).filter(function (x) { return x[0] >= gameState.config.playerCount * parJ; }).map(function (x) { return x[1]; });
                if (ok.length) break;
            }
            gameState.config.mapIndex = ok.length ? ok[Math.floor(Math.random() * ok.length)] : nPl.indexOf(Math.max.apply(null, nPl));
            gameState.config.carteDonnees = null;
        } else if (mapSel === 'e' || mapSel.indexOf('j:') === 0) {
            /* Carte de joueur : deja chargee par preparerCarteChoisie. */
            gameState.config.mapIndex = null;
        } else { gameState.config.mapIndex = parseInt(mapSel); gameState.config.carteDonnees = null; }
    }

    // Générer l'univers avec progression
    setTimeout(() => {
        updateLoadingBar(15, 'Nébuleuses et étoiles...');
        generateBackground();
        preparerFondCss();
        generateForegroundDebris();

        setTimeout(() => {
            updateLoadingBar(35, 'Systèmes solaires...');
            let _mapData;
if (gameState.isMulti && gameState._serverUniverse) {
                // Multi : utiliser la carte envoyée par le serveur (tous les clients)
                _mapData = gameState._serverUniverse;
                loadMapFromJSON(_mapData);
                // Écraser les belts régénérés aléatoirement par ceux de l'hôte
                if (_mapData.asteroidBelts && _mapData.asteroidBelts.length > 0) {
                    gameState.asteroidBelts = _mapData.asteroidBelts.map(b => ({
                        ...b,
                        sun: gameState.suns[b.sunIndex] || gameState.suns[0],
                    }));
                }
                _syncServerIds(_mapData);
                _buildBodyIndex();
                gameState._serverUniverse = null;
            } else if (gameState.isMulti && !gameState._serverUniverse && !isHost) {
                // Multi mais univers pas encore reçu → attendre max 10s
                console.log('[multi] en attente de l\'univers serveur...');
                let waited = 0;
                const waitUniverse = setInterval(() => {
                    waited += 200;
                    if (gameState._serverUniverse) {
                        clearInterval(waitUniverse);
                        loadMapFromJSON(gameState._serverUniverse);
                        _syncServerIds(gameState._serverUniverse);
                        _buildBodyIndex();
                        gameState._serverUniverse = null;
                        finishStartGame();
                    } else if (waited >= 10000) {
                        clearInterval(waitUniverse);
                        console.warn('[multi] timeout univers serveur, carte aléatoire utilisée');
                        const mapIdx = Math.floor(Math.random() * MAP_LIBRARY.length);
                        loadMapFromJSON(MAP_LIBRARY[mapIdx]);
                        finishStartGame();
                    }
                }, 200);
                return; // sortir de startGame, il sera relancé via le callback
            } else {
                // Solo / hôte multi : carte locale
                const mapIdx = gameState.config.mapIndex != null ? gameState.config.mapIndex : Math.floor(Math.random() * MAP_LIBRARY.length);
                /* Une carte de joueur (solo, ou envoyee par le relais) passe avant. */
                _mapData = (!gameState.isTutorial && gameState.config.carteDonnees) || MAP_LIBRARY[mapIdx];
                loadMapFromJSON(_mapData);
                // Hôte multi : envoyer l'univers aux autres joueurs
                console.log('[startGame] isMulti=', gameState.isMulti, '_pendingRoomId=', gameState._pendingRoomId);
            // En multi : l'universe est envoyé depuis finishStartGame après createPlayers()
            }
            // Synchroniser la config avec la carte chargée
            gameState.config.sunCount = _mapData.suns.length;
            const _totalPlanets = _mapData.suns.reduce((a, s) => a + s.planets.length, 0);
            const _maxPlayers = Math.max(2, _totalPlanets);
            if (gameState.config.playerCount > _maxPlayers) {
                gameState.config.playerCount = _maxPlayers;
                gameState.config.aiCount = _maxPlayers - 1;
            }

            setTimeout(() => {
                updateLoadingBar(55, 'Textures des soleils...');
                gameState.suns.forEach(s => createSunTexture(s));

                setTimeout(() => {
                    updateLoadingBar(70, 'Textures des planètes...');
                    gameState.planets.forEach(p => createPlanetTexture(p));

                    setTimeout(() => {
                        updateLoadingBar(85, 'Textures des lunes...');
                        gameState.moons.forEach(m => createMoonTexture(m));
                        /* Les rochers des ceintures, peints d'avance (pas au premier affichage). */
                        for (const ty of ['dark', 'red', 'green']) for (let k = 0; k < 4; k++) spriteRoche(ty, k);
                        preparerTrouNoir();

                        setTimeout(() => {
                            updateLoadingBar(92, 'Caches performances...');
                            buildSunHaloCache();
                            setTimeout(() => {
                                updateLoadingBar(100, 'Prêt !');
                                setTimeout(() => {
                                    document.getElementById('loadingScreen').classList.add('hidden');
                                    finishStartGame();
                                }, 300);
                            }, 50);
                        }, 50);
                    }, 50);
                }, 50);
            }, 50);
        }, 50);
    }, 50);
}

function _isAllied() { return false; }

// ── STM — Menu radial (global) ────────────────────────────────
function _closeSporMenu() {
    document.getElementById('sporeTypeMenu').style.display = 'none';
    const _bip = document.getElementById('bodyInfoPanel');
    if (_bip) _bip.style.display = 'none';
    _stmLiveBody = null;
    gameState._parasiteArrowBody = null;
}
let _stmLiveBody = null;
var _stmCanvas = null;
var _stmCtx = null;
function _stmInit() {
    if (_stmCanvas) return;
    _stmCanvas = document.getElementById('stmCanvas');
    if (!_stmCanvas) return;
    _stmCtx = _stmCanvas.getContext('2d');
    _stmCanvas.addEventListener('mousemove', (e) => {
        const r = _stmCanvas.getBoundingClientRect();
        const x = e.clientX-r.left, y = e.clientY-r.top;
        const hit = _stmGetSector(x, y);
        const prevH = _stmHover, prevB = _stmHoverB;
        _stmHover = hit.zone==='spore' ? hit.idx : (hit.zone==='codex' ? -2 : -1);
        _stmHoverB = hit.zone==='bld' ? hit.idx : -1;
        if (_stmHover !== prevH || _stmHoverB !== prevB) _stmDraw();
        if (hit.zone==='bld') { const b = _stmBldSectors[hit.idx]; if (b) _stmShowTip(b.tip || b.name, e.clientX, e.clientY); } else { _stmHideTip(); }
    });
    _stmCanvas.addEventListener('mouseleave', () => { _stmHover=-1; _stmHoverB=-1; _stmDraw(); _stmHideTip(); });
    _stmCanvas.addEventListener('click', (e) => {
        const r = _stmCanvas.getBoundingClientRect();
        const x = e.clientX-r.left, y = e.clientY-r.top;
        const hit = _stmGetSector(x, y);
        if (hit.zone==='codex') {
            const body = gameState._fireSource;
            _closeSporMenu();
            gameState._firePhase = null;
            if (body) { openCodex._cx=e.clientX; openCodex._cy=e.clientY; openCodex(body); }
        } else if (hit.zone==='spore' && hit.idx>=0 && hit.idx<_stmSectors.length) {
            const _sec = _stmSectors[hit.idx];
            if (!_sec.disabled) { _selectSporeType(_sec.type); }
        } else if (hit.zone==='bld' && hit.idx>=0 && hit.idx<_stmBldSectors.length) {
            const b = _stmBldSectors[hit.idx];
            if (!b.disabled && _stmLiveBody) {
                const body = _stmLiveBody;
                if (!demanderConstruction(body, b.mode)) return;
                _closeSporMenu();
                addEvent('build', BATI_GENRES.indexOf(b.mode) >= 0 ? iconeBat(b.mode, 12) : (b.icon || ''), `${b.name} activé sur ${body.name}`, body, gameState.players[localSlot()]?.color);
            }
        }
    });
}
var STM_SIZE = 300, STM_INNER = 32, STM_R = 90, STM_R2 = 140;
let _stmSectors = [], _stmBldSectors = [], _stmHover = -1, _stmHoverB = -1, _stmTT = null;
function _stmShowTip(text, x, y) { if (!_stmTT) { _stmTT = document.createElement('div'); _stmTT.style.cssText = 'position:fixed;z-index:300;background:rgba(10,8,35,0.97);border:1px solid rgba(100,70,180,0.5);border-radius:6px;padding:6px 10px;font-family:"Exo 2",sans-serif;font-size:11px;color:#E2D9F3;pointer-events:none;max-width:200px;line-height:1.5;'; document.body.appendChild(_stmTT); } _stmTT.textContent = text; _stmTT.style.left = (x+14)+'px'; _stmTT.style.top = (y-10)+'px'; _stmTT.style.display = 'block'; }
function _stmHideTip() { if (_stmTT) _stmTT.style.display = 'none'; }
function _buildMultiUniverse() {
    const _serializeBody = (b) => ({
        name: b.name, type: b.type, radius: b.radius,
        flore: b.flore, faune: b.faune, _baseFaune: b._baseFaune,
        maxSpores: b.maxSpores, baseMaxSpores: b.baseMaxSpores,
        orbitRadius: b.orbitRadius, orbitSpeed: b.orbitSpeed,
        angle: b.angle, x: b.x, y: b.y,
        owner: b.owner, spores: b.spores,
        symbiosis: b.symbiosis || 0, symOwnerTime: b.symOwnerTime || 0,
        buildMode: b.buildMode || 'off', nids: b.nids || 0,
        biomes: b.biomes || 0, alveoles: b.alveoles || 0,
        parasiteSpore: b.parasiteSpore || 0,
        parasiteProgress: b.parasiteProgress || 0,
    });
    return {
        multiSeed:      gameState.multiSeed,
        blackHole:      { x: gameState.blackHole.x, y: gameState.blackHole.y, radius: gameState.blackHole.radius, dangerZone: gameState.blackHole.dangerZone, gravityRange: gameState.blackHole.gravityRange, gravityStrength: gameState.blackHole.gravityStrength },
        suns:           gameState.suns.map(s => ({
            name: s.name, type: 'sun', radius: s.radius,
            orbitRadius: s.orbitRadius, orbitSpeed: s.orbitSpeed,
            angle: s.angle, x: s.x, y: s.y, color: s.color,
            planets: s.planets.map(p => ({
                ..._serializeBody(p),
                moons: (p.moons || []).map(m => _serializeBody(m)),
            })),
        })),
                        asteroidBelts:  (gameState.asteroidBelts || []).map(b => ({
                            radius: b.radius, orbitSpeed: b.orbitSpeed,
                            sunIndex: gameState.suns.indexOf(b.sun),
                            rocks: b.rocks.map(r => ({
                                angle: r.angle, radiusOff: r.radiusOff, type: r.type,
                                subRocks: (r.subRocks || []).map(s => ({ offX: s.offX, offY: s.offY, size: s.size, color: s.color })),
                            })),
                        })),
        players:        gameState.players.map(p => ({
            id: p.id, name: p.name, color: p.color,
            isHuman: p.isHuman, alive: p.alive,
            stats: p.stats, tech: p.tech,
            multiSacrifice: p.multiSacrifice || 0,
            multiTier: p.multiTier || 0,
            aiTimer: p.aiTimer || 0,
            aiCooldown: p.aiCooldown || 1.5,
            bodies: [],
        })),
        config:         { ...gameState.config },
        jetRatio:       gameState.jetRatio,
        universeRadius: gameState.universeRadius,
        cleaners:       (gameState.cleaners || []).map(c => ({
            type: c.type, x: c.x, y: c.y, vx: c.vx || 0, vy: c.vy || 0, angle: c.angle || 0, size: c.size || 8,
        })),
    };
}

function finishStartGame() {

    // Reset stats
    gameState.gameStats = {
        jetsLaunched: 0, jetsNeutralized: 0,
        bodiesConquered: 0, sporesProduced: 0, timeElapsed: 0
    };
    gameState.jets = [];
   
    gameState.alliances = [];
    gameState.conquestEffects = [];
    gameState.bloomEffects = [];
    gameState.particles = [];
    gameState._etincelles = [];
    gameState.impactEffects = [];
    gameState.comets = [];
    gameState.cometTimer = 0;
    gameState.time = 0;
    gameState.tour = 0;
    /* Il cadence l'IA (un tour sur deux) et la verification de victoire (tous
       les 30 tours) : il doit repartir de zero a chaque partie, sinon deux
       joueurs dont l'un a deja joue une partie dans la page ne sont pas
       cales pareil. */
    gameState._hudCounter = 0;
    _accSim = 0;
    _ordresEnAttente = [];
    gameState.journalOrdres = [];
    gameState._maxRangeCache = null;
    _lastScoreHash = '';
    if (typeof _floatingBubbles !== 'undefined') _floatingBubbles.length = 0;

    _ownerClustersCache = [];
    for (const _b of (gameState.allBodies || [])) _b.lutte = null;
    _territoires = [];
    _ancresGroupe = null;
    gameState._alertes = [];
    gameState._eclatBord = null;
    marquerTerritoiresSales();
    gameState._filetsCharge = [];
    gameState._zoomCible = null;
    gameState._fireSurface = false;
    gameState._ondes = [];
    gameState._ondesSolaires = [];
    gameState._fireLanceur = null;
    gameState._fireGroupe = null;
    gameState._chargeAcc = 0;
    const _logBody = document.querySelector('#eventLog .log-body');
    if (_logBody) _logBody.innerHTML = '';
    /* En lockstep, la graine donnee par le relais, a l'abri : multiSeed peut
       avoir ete efface entre-temps (retour au titre). */
    _gameRng = mulberry32((gameState.lockstep && gameState.lockstep.graine
                           ? gameState.lockstep.graine : (gameState.multiSeed || 42)) + 5555);
    _nbAlea = 0;

    // Créer les joueurs
    createPlayers();
    if (gameState.lockstep) preparerJoueursLockstep();
    /* La part d'envoi reglee avant la partie vaut des le premier tour. */
    /* Sauf en reprise : cet ordre-la est deja dans les paquets a rejouer. */
    if (!gameState.isMulti && !(gameState.lockstep && gameState.lockstep.aRejouer)) donnerOrdre('part', { v: gameState.jetRatio });
    if (gameState.isMulti && gameState._pendingRoomId && isHost) {
        const _universe = _buildMultiUniverse();
        _socket.emit('game_start', { roomId: gameState._pendingRoomId, universe: _universe });
        _socket.off('game_start');
    }

    // Calculer le rayon max de l'univers
    let maxR = 0;
    for (const p of gameState.planets) {
        const d = Math.sqrt(p.x*p.x + p.y*p.y) + p.radius;
        if (d > maxR) maxR = d;
    }
    for (const m of gameState.moons) {
        const d = Math.sqrt(m.x*m.x + m.y*m.y) + m.radius;
        if (d > maxR) maxR = d;
    }
    gameState.universeRadius = maxR + 200;
    rebuildAllBodies();
    /* Le dezoom va jusqu'a voir tout l'univers d'un coup : le plancher de
       0,35 empechait de voir une grande carte (Zetapha) en entier. */
    const screenMin = Math.min(gameState.width, gameState.height);
    gameState.camera.minZoom = Math.max(0.02, Math.min(0.35, screenMin / (gameState.universeRadius * 2.2)));

    // Centrer la caméra et zoom adapté
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    gameState.camera.zoom = 0.3;

    // Lancer la boucle si pas encore active
    if (!gameState.running) {
        gameState.running = true;
        gameState.lastTime = performance.now();
        gameState.fpsLastCheck = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // Audio
    ensureAudio();
    startAmbiance();

    // Phase spawn
    setPhase('spawn');
    if (gameState.isMulti) {
        gameState._spawnLocked = true;
        const banner = document.getElementById('spawnBanner');
        if (banner) banner.textContent = 'En attente de l\'adversaire...';
        if (_socket) _socket.emit('spawn_ready');
    }
    if (gameState.lockstep) lockstepPret();
}

