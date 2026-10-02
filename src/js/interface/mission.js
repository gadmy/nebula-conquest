// ═══ MISSION TUTORIEL ═══
/* MISSION « PREMIERS PAS » : on apprend en faisant. Une liste d'objectifs,
   chacun valide seulement quand le joueur a vraiment fait le geste (verifie
   toutes les 0,25 s). L'astre vise est entoure sur la carte. L'IA dort
   jusqu'au defi final ; ni vaisseaux, ni cometes, ni spheres.
   La touche K montre tous les raccourcis a tout moment. */
const MISSION_TUTO = [
    { titre: 'Sélectionner',
      texte: "Clique sur <b>ta planète</b>, entourée en vert, pour la sélectionner.",
      cible: function (M) { return M.planete; },
      fait: function (M) { return followingBody === M.planete; } },
    { titre: 'Regarder',
      texte: "Déplace la vue avec <kbd>Z</kbd> <kbd>Q</kbd> <kbd>S</kbd> <kbd>D</kbd> (ou les flèches), et zoome avec la <b>molette</b>.",
      debut: function (M) { const c = gameState.camera; M.cam0 = { x: c.x, y: c.y, z: c.zoom }; },
      fait: function (M) {
          const c = gameState.camera;
          if (Math.hypot(c.x - M.cam0.x, c.y - M.cam0.y) > 250) M.bouge = true;
          if (Math.abs(c.zoom - M.cam0.z) > 0.12) M.zoome = true;
          return M.bouge && M.zoome;
      } },
    { titre: "Part d'envoi",
      texte: "Chaque tir envoie une part des spores de l'astre. Monte-la à <b>70 %</b> ou plus avec <kbd>E</kbd> (et <kbd>A</kbd> pour baisser). Elle s'affiche en grand en bas de l'écran.",
      fait: function () { return gameState.jetRatio >= 0.695; } },
    { titre: 'Conquérir',
      texte: "Sélectionne ta planète, appuie sur <kbd>Espace</kbd> pour viser, puis <b>clique</b> sur la planète neutre entourée. Tes spores s'y posent et la conquièrent. Si ça ne suffit pas, tire encore.",
      debut: function (M) { M.planete.spores = Math.max(M.planete.spores, M.planete.maxSpores); },
      cible: function (M) { return M.neutre; },
      fait: function (M) { return M.neutre.owner === localSlot(); } },
    { titre: 'Construire',
      texte: "Construis un <b>nid</b> (+ production) : sélectionne un de tes astres et appuie sur <kbd>2</kbd> (<kbd>é</kbd> en azerty). <kbd>1</kbd> fait une alvéole, <kbd>3</kbd> un biome.",
      debut: function (M) { M.planete.spores = Math.max(M.planete.spores, M.planete.maxSpores); },
      fait: function () { return gameState.allBodies.some(function (b) { return b.owner === localSlot() && (b.nids || 0) > 0; }); } },
    { titre: 'Tir groupé',
      texte: "Une planète et <b>toutes</b> ses lunes forment un groupe. Vise depuis ta planète (<kbd>Espace</kbd>) vers la lune entourée, <b>sans cliquer</b> : l'astre le plus proche de la cible tirera, et les autres lui envoient leurs spores, au-delà de son maximum. Attends le <b>chiffre doré ⚡</b>.",
      debut: function (M) {
          /* Le groupe n'existe que si toutes les lunes sont a nous : on les donne. */
          const moi = localSlot();
          for (const L of (M.planete.moons || [])) {
              if (L.owner !== moi) {
                  if (L.owner !== null && gameState.players[L.owner]) gameState.players[L.owner].bodies = gameState.players[L.owner].bodies.filter(function (b) { return b !== L; });
                  L.owner = moi; gameState.players[moi].bodies.push(L);
                  addEvent('neutral', '🎓', L.name + ' vous rejoint pour l\'exercice', L, gameState.players[moi].color);
              }
              /* Comme une vraie conquete : plus de bataille en cours (un tir
                 perdu a pu en ouvrir une), plus de faune sauvage. Sinon les
                 spores de la charge partaient dans la bataille. */
              L.lutte = null;
              L.faune = 0;
              L.spores = L.maxSpores;
          }
          marquerTerritoiresSales();
          M.planete.spores = Math.max(M.planete.spores, M.planete.maxSpores * 0.9);
      },
      cible: function (M) { return M.lune; },
      fait: function () {
          return gameState._firePhase === 'aiming' && gameState.allBodies.some(function (b) {
              return b.owner === localSlot() && b.spores > b.maxSpores * 1.05;
          });
      } },
    { titre: 'Rafale',
      texte: "<b>La rafale</b> : en visée (<kbd>Espace</kbd>), maintiens <kbd>Ctrl</kbd> + <b>clic gauche</b>. Des paquets de 10 spores partent en continu autour du curseur ; lâche pour arrêter.",
      debut: function (M) { M.planete.spores = Math.max(M.planete.spores, M.planete.maxSpores); },
      fait: function (M) { if (gameState._rafale) M.rafale = true; return !!M.rafale && !gameState._rafale; } },
    { titre: 'Boule',
      texte: "<b>La boule</b> : en visée, maintiens <kbd>Shift</kbd> pour l'agglutiner (500 spores au plus), puis relâche pour la lancer. Les vaisseaux rouges et noirs ne peuvent rien contre elle.",
      debut: function (M) { M.planete.spores = Math.max(M.planete.spores, M.planete.maxSpores); },
      fait: function () { return gameState.jets.some(function (j) { return j.alive && j.boule && j.owner === localSlot(); }); } },
    { titre: 'Défi final',
      texte: "<b>L'IA se réveille.</b> Prends-lui sa planète entourée ! Charge un tir groupé, ou arrose-la en rafale. Sur un astre ennemi, tes spores se battent à sa surface : le camp le plus nombreux gagne du terrain.",
      debut: function (M) { gameState._tutoIA = true; addEvent('war', '⚔️', 'L\'IA se réveille !', M.ennemi, '#F87171'); },
      cible: function (M) { return M.ennemi; },
      fait: function (M) { return M.ennemi.owner === localSlot(); } },
];

let _mission = null;

function startTutorial() {
    gameState.isMulti = false;
    gameState.isTutorial = true;
    gameState._tutoIA = false;
    /* Petite carte, une IA facile, rien d'autre. */
    const tutMapIdx = 0;
    gameState.config = {
        mapIndex: tutMapIdx, sunCount: MAP_LIBRARY[tutMapIdx].suns.length,
        difficulty: 'easy', useIA: true, aiCount: 1, fillIA: false,
        cleanerCount: 0, useComets: false, useAsteroids: false, playerCount: 2
    };
    _mission = { etape: 0, pret: false };
    document.getElementById('helpScreen').classList.add('hidden');
    document.getElementById('titleScreen').classList.add('hidden');
    fadeTransition(function () {
        startGame();
        _missionPlacer();
    });
}

/* Le choix de la planete de depart est fait pour le joueur : une planete
   avec une lune, et une planete neutre pas trop loin. */
function _missionPlacer() {
    if (!_mission) return;
    if (gameState.phase !== 'spawn') { setTimeout(_missionPlacer, 200); return; }
    /* De preference peu de lunes : le groupe de tir les demande toutes. */
    const libres = gameState.planets.filter(function (p) { return p.owner === null && p.moons && p.moons.length; })
        .sort(function (a, b) { return a.moons.length - b.moons.length; });
    const depart = libres[0] || gameState.planets.find(function (p) { return p.owner === null; });
    _spawnTarget = depart;
    confirmSpawn();
    const attendre = function () {
        if (gameState.phase !== 'game') { setTimeout(attendre, 200); return; }
        const moi = localSlot();
        const M = _mission;
        M.planete = gameState.players[moi].bodies[0] || depart;
        M.lune = (M.planete.moons || [])[0] || null;
        const ia = gameState.players.find(function (j) { return j.id !== moi && j.bodies.length; });
        M.ennemi = ia ? ia.bodies.find(function (b) { return b.type === 'planet'; }) || ia.bodies[0] : null;
        let best = null, bd = Infinity;
        for (const p of gameState.planets) {
            if (p.owner !== null || p === M.planete) continue;
            const d = Math.hypot(p.x - M.planete.x, p.y - M.planete.y);
            if (d < bd) { bd = d; best = p; }
        }
        M.neutre = best;
        M.pret = true;
        _missionPanneau();
        _missionEtape(0);
        M.minuteur = setInterval(_missionVerifier, 250);
    };
    attendre();
}

function _missionEtape(k) {
    const M = _mission;
    if (!M) return;
    M.etape = k;
    const e = MISSION_TUTO[k];
    if (e && e.debut) e.debut(M);
    gameState._tutoCible = (e && e.cible) ? e.cible(M) : null;
    _missionAfficher();
}

function _missionVerifier() {
    const M = _mission;
    if (!M || !M.pret || gameState.phase === 'title') { if (M && gameState.phase === 'title') endTutorial(); return; }
    const e = MISSION_TUTO[M.etape];
    if (!e) return;
    if (e.cible) gameState._tutoCible = e.cible(M);
    if (!e.fait(M)) return;
    if (typeof playFusionSound === 'function') playFusionSound();
    if (M.etape + 1 < MISSION_TUTO.length) _missionEtape(M.etape + 1);
    else _missionFin();
}

function _missionPanneau() {
    let el = document.getElementById('missionTuto');
    if (el) el.remove();
    el = document.createElement('div');
    el.id = 'missionTuto';
    /* Sous les consignes du jeu (bandeau de visee, en haut au centre). */
    el.style.cssText = 'position:fixed; top:92px; left:50%; transform:translateX(-50%); z-index:600; width:min(460px, calc(100vw - 32px));' +
        'background:rgba(8,14,34,0.88); border:1px solid rgba(74,222,128,0.45); border-radius:12px; padding:12px 16px;' +
        'font-family:"Exo 2",sans-serif; color:#E0E7FF; box-shadow:0 0 24px rgba(74,222,128,0.15); pointer-events:auto;';
    el.innerHTML =
        '<div style="display:flex; align-items:baseline; justify-content:space-between; gap:10px;">' +
        '<span style="font-family:Orbitron,sans-serif; font-size:11px; letter-spacing:2px; color:#4ADE80;">🎓 MISSION · PREMIERS PAS</span>' +
        '<span id="missionCompte" style="font-family:Orbitron,sans-serif; font-size:11px; color:#94A3B8;"></span></div>' +
        '<div id="missionBarre" style="height:3px; background:rgba(255,255,255,0.1); border-radius:2px; margin:8px 0 10px;"><div style="height:100%; width:0; background:#4ADE80; border-radius:2px; transition:width 0.4s;"></div></div>' +
        '<div id="missionTitre" style="font-family:Orbitron,sans-serif; font-size:14px; letter-spacing:1px; margin-bottom:4px;"></div>' +
        '<div id="missionTexte" style="font-size:13.5px; line-height:1.55; color:#CBD5E1;"></div>' +
        '<div id="missionListe" style="display:flex; flex-wrap:wrap; gap:4px 10px; margin-top:10px; font-size:11px; color:#64748B;"></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:8px;">' +
        '<span style="font-size:11px; color:#94A3B8;"><kbd>K</kbd> tous les raccourcis</span>' +
        '<span><button id="missionPasser" style="background:none; border:1px solid rgba(148,163,184,0.4); border-radius:6px; padding:4px 10px; color:#94A3B8; font-size:11px; cursor:pointer; margin-right:6px;">Passer l\'étape</button>' +
        '<button id="missionQuitter" style="background:none; border:1px solid rgba(248,113,113,0.4); border-radius:6px; padding:4px 10px; color:#FCA5A5; font-size:11px; cursor:pointer;">Arrêter la mission</button></span></div>';
    document.body.appendChild(el);
    document.getElementById('missionPasser').addEventListener('click', function () {
        const M = _mission;
        if (!M) return;
        if (M.etape + 1 < MISSION_TUTO.length) _missionEtape(M.etape + 1); else _missionFin();
    });
    document.getElementById('missionQuitter').addEventListener('click', function () { endTutorial(); });
}

function _missionAfficher() {
    const M = _mission;
    const e = MISSION_TUTO[M.etape];
    if (!e || !document.getElementById('missionTuto')) return;
    document.getElementById('missionCompte').textContent = (M.etape + 1) + ' / ' + MISSION_TUTO.length;
    document.querySelector('#missionBarre > div').style.width = (M.etape / MISSION_TUTO.length * 100) + '%';
    document.getElementById('missionTitre').textContent = e.titre.toUpperCase();
    document.getElementById('missionTexte').innerHTML = e.texte;
    document.getElementById('missionListe').innerHTML = MISSION_TUTO.map(function (x, i) {
        const c = i < M.etape ? '#4ADE80' : i === M.etape ? '#E0E7FF' : '#64748B';
        return '<span style="color:' + c + ';">' + (i < M.etape ? '✓ ' : i === M.etape ? '▸ ' : '') + x.titre + '</span>';
    }).join('');
}

function _missionFin() {
    const M = _mission;
    if (!M) return;
    clearInterval(M.minuteur);
    gameState._tutoCible = null;
    gameState._tutoIA = true;
    const el = document.getElementById('missionTuto');
    if (!el) return;
    el.innerHTML =
        '<div style="font-family:Orbitron,sans-serif; font-size:16px; letter-spacing:2px; color:#4ADE80; margin-bottom:6px;">MISSION ACCOMPLIE</div>' +
        '<div style="font-size:13.5px; line-height:1.55; color:#CBD5E1;">Tu sais viser, conquérir, construire, charger un tir groupé, lancer la rafale et la boule. Pour gagner : <b>80 %</b> des astres, ou être le dernier en vie. Le <b>livre des règles</b> (Échap) explique tout le reste : batailles de surface, mutations, sphères capitales.</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;"><span style="font-size:11px; color:#94A3B8;"><kbd>K</kbd> tous les raccourcis</span>' +
        '<button id="missionContinuer" style="background:rgba(74,222,128,0.18); border:1px solid rgba(74,222,128,0.5); border-radius:6px; padding:6px 14px; color:#4ADE80; font-size:12px; cursor:pointer;">Continuer la partie</button></div>';
    document.getElementById('missionContinuer').addEventListener('click', function () { endTutorial(true); });
}

/* garderPartie : on finit la mission mais on continue de jouer. */
function endTutorial(garderPartie) {
    if (_mission && _mission.minuteur) clearInterval(_mission.minuteur);
    _mission = null;
    gameState._tutoCible = null;
    gameState._tutoIA = true;
    const el = document.getElementById('missionTuto');
    if (el) el.remove();
    if (!garderPartie) gameState.isTutorial = false;
}

/* L'astre a viser, entoure sur la carte : anneau pointille qui tourne et
   palpite, et "ICI" au-dessus. */
function drawCibleTuto(ctx) {
    const b = gameState._tutoCible;
    if (!b || !_mission) return;
    const t = gameState.time, z = gameState.camera.zoom;
    const r = b.radius * 1.35 + 6 / z;
    const p = 0.5 + 0.5 * Math.sin(t * 4);
    ctx.save();
    ctx.strokeStyle = 'rgba(74,222,128,' + (0.55 + 0.4 * p) + ')';
    ctx.lineWidth = Math.max(2 / z, b.radius * 0.05);
    ctx.setLineDash([b.radius * 0.25, b.radius * 0.15]);
    ctx.beginPath(); ctx.arc(b.x, b.y, r + p * 6 / z, t * 0.8, t * 0.8 + Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = 'bold ' + (13 / z) + 'px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ADE80';
    ctx.fillText('ICI', b.x, b.y - r - 12 / z);
    ctx.restore();
}

