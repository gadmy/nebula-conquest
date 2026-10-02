// ═══════════════════════════════════════════════
// AUTH SUPABASE — Login + Pseudo
// ═══════════════════════════════════════════════
const SUPABASE_URL = 'https://hcjajtpbzusqgxkyzbgc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjamFqdHBienVzcWd4a3l6YmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTIwNjgsImV4cCI6MjA4NzY4ODA2OH0.UXiZvC3kQmQzZ4BSWp6X19ISPjlac87YZlLonUqzvic';
/* SANS LES SERVICES EN LIGNE, LE SOLO DOIT RESTER JOUABLE. La bibliotheque
   Supabase vient d'un CDN : un bloqueur de publicite, un reseau d'ecole ou
   d'entreprise, ou une panne, et elle manque. Avant, la ligne ci-dessous
   plantait tout ce script - boutons de connexion morts, jeu inaccessible,
   solo compris. On la remplace alors par un client factice qui repond
   "indisponible" a tout, et l'ecran de connexion propose le solo hors
   ligne (voir entrerHorsLigne). */
const SERVICES_HORS_LIGNE = !(window.supabase && window.supabase.createClient);

function _supaHorsLigne() {
    const reponse = { data: null, error: { message: 'Service en ligne indisponible', status: 0 } };
    /* Une requete s'ecrit en chaine - from().select().eq()... - puis
       s'attend : chaque maillon rend la chaine, et l'attendre donne la
       reponse "indisponible". */
    const chaine = new Proxy(function () {}, {
        get: function (t, k) {
            if (k === 'then') return function (ok, ko) { return Promise.resolve(reponse).then(ok, ko); };
            return chaine;
        },
        apply: function () { return chaine; }
    });
    return {
        from: function () { return chaine; },
        storage: { from: function () { return chaine; } },
        auth: {
            getSession: function () { return Promise.resolve({ data: { session: null }, error: null }); },
            onAuthStateChange: function () { return { data: { subscription: { unsubscribe: function () {} } } }; },
            signOut: function () { return Promise.resolve({ error: null }); },
            signInWithPassword: function () { return Promise.resolve(reponse); },
            signUp: function () { return Promise.resolve(reponse); }
        }
    };
}

const _supa = SERVICES_HORS_LIGNE
    ? _supaHorsLigne()
    : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* Vrai si une erreur de connexion vient du reseau et non du joueur : on ne
   lui dit pas "mot de passe incorrect" quand le serveur est injoignable. */
function erreurReseau(e) {
    return SERVICES_HORS_LIGNE || !e || e.status === 0
        || /fetch|network|r[ée]seau|indisponible/i.test(e.message || '');
}

function proposerHorsLigne(texte) {
    const msg = document.getElementById('authMsg');
    if (msg) { msg.textContent = texte; msg.style.color = '#FBBF24'; }
    const b = document.getElementById('btnHorsLigne');
    if (b) b.style.display = 'block';
}

/* Le menu sans compte : le solo contre l'IA marche, les modes en ligne sont
   grises. Le nom du joueur retombe sur "Commandant". */
let horsLigne = false;
function entrerHorsLigne() {
    horsLigne = true;
    document.getElementById('authScreen').classList.add('hidden');
    ['btnMulti', 'btnLocal', 'btnCompetition'].forEach(function (id) {
        const b = document.getElementById(id);
        if (!b) return;
        b.disabled = true;
        b.style.opacity = '0.35';
        b.style.cursor = 'not-allowed';
        b.title = 'Indisponible hors ligne';
    });
    const out = document.getElementById('btnLogout');
    if (out) out.style.display = 'none';
    setPhase('title');   // affiche aussi la mention HORS LIGNE sous le menu
}
document.getElementById('btnHorsLigne').addEventListener('click', function () {
    playClickSound();
    entrerHorsLigne();
});

let currentUser = null;
let currentProfile = null;
let currentRoom = null;
let isHost = false;
let mySlot = 0;
let _socket = null;

const SERVER_URL = 'https://nebula-conquest-server2-production.up.railway.app';

// ── Connexion socket ──────────────────────────────────────────

function connectSocket() {
    /* socket.io vient lui aussi d'un CDN : absent, on reste sans connexion
       plutot que de planter. */
    if (typeof io !== 'function') { console.warn('[socket] socket.io non charge'); return; }
    if (_socket && _socket.connected) return;
    if (_socket) { _socket.removeAllListeners(); _socket.disconnect(); }
    const auth = {
        pseudo: currentProfile?.pseudo || 'Joueur',
        color:  currentProfile?.color  || '#C084FC',
        userId: currentUser?.id        || null
    };
    /* LE JETON DE SESSION. Le serveur ne croit plus le pseudo annonce : il
       fait verifier ce jeton par Supabase et lit le pseudo dans la base.
       Sans jeton valide on joue en invite - ni classe, ni tournoi. Donne
       sous forme de fonction : socket.io la rappelle a chaque reconnexion,
       avec un jeton toujours frais. */
    const _authAvecJeton = function (cb) {
        /* Quoi qu'il arrive, on rappelle cb : sans cela la connexion
           attendrait indefiniment. */
        try {
            Promise.resolve(_supa.auth.getSession())
                .then(function (r) {
                    const jeton = r && r.data && r.data.session ? r.data.session.access_token : null;
                    cb(Object.assign({}, auth, { token: jeton }));
                })
                .catch(function () { cb(auth); });
        } catch (e) { cb(auth); }
    };
    _socket = io(SERVER_URL, { auth: _authAvecJeton });

    _socket.on('connect', () => { console.log('[socket] connecté'); _initRankedListeners(); });
    _socket.on('disconnect', () => console.log('[socket] déconnecté'));
    _socket.on('error', e => console.warn('[socket] erreur:', e.msg));
    _socket.on('player_action', (data) => { handleGameEvent(data); });
    _socket.on('game_snapshot', (snap) => { applySnapshot(snap); });
    _socket.on('spawn_start', () => {
        if (gameState.phase !== 'spawn') return;
        const banner = document.getElementById('spawnBanner');
        // Créer un overlay 3,2,1 centré
        let _cdEl = document.getElementById('_spawnCdOverlay');
        if (!_cdEl) {
            _cdEl = document.createElement('div');
            _cdEl.id = '_spawnCdOverlay';
            _cdEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Orbitron,sans-serif;font-size:120px;font-weight:bold;color:#FFD700;text-shadow:0 0 40px rgba(255,215,0,0.8);z-index:200;pointer-events:none;transition:opacity 0.3s;';
            document.body.appendChild(_cdEl);
        }
        let count = 3;
        _cdEl.textContent = count;
        _cdEl.style.opacity = '1';
        const _cd = setInterval(() => {
            count--;
            if (count > 0) {
                _cdEl.textContent = count;
            } else {
                clearInterval(_cd);
                _cdEl.style.opacity = '0';
                setTimeout(() => _cdEl.remove(), 300);
                if (banner) banner.textContent = 'CHOISISSEZ VOTRE PLANÈTE !';
                gameState._spawnLocked = false;
                startSpawnCountdown();
            }
        }, 1000);
    });
    _socket.on('all_spawned', () => {
        if (spawnCountdownInterval) { clearInterval(spawnCountdownInterval); spawnCountdownInterval = null; }
        if (gameState.phase === 'spawn' && gameState.players.length > 0) finishMultiSpawn();
    });
    _socket.on('cleaner_hit', (ev) => {
        if (ev.type === 'red') {
            spawnImpact(ev.x, ev.y, '#FF4444');
            gameState.conquestEffects.push({ x: ev.x, y: ev.y - 10, baseX: ev.x, text: '-' + ev.damage, color: '#FF4444', age: 0, maxAge: 1.5 });
        } else if (ev.type === 'green') {
            spawnImpact(ev.x, ev.y, '#44FF44');
            gameState.conquestEffects.push({ x: ev.x, y: ev.y - 10, baseX: ev.x, text: 'x2', color: '#44FF44', age: 0, maxAge: 1.5 });
        } else if (ev.type === 'dark') {
            spawnImpact(ev.x, ev.y, '#9966FF');
            gameState.conquestEffects.push({ x: ev.x, y: ev.y - 10, baseX: ev.x, text: '↩', color: '#9966FF', age: 0, maxAge: 1.5 });
        }
    });
    _socket.on('jet_fired', (ev) => {
        const src = gameState.planets.find(p => p.name === ev.srcName)
                 || gameState.moons.find(m => m.name === ev.srcName);
        if (!src) return;
        // Sauvegarder et restaurer les spores (le serveur est autoritaire)
        const savedSpores = src.spores;
        src.spores = ev.spores * 2;
        const n0 = gameState.jets.length;
        launchJet(src, ev.dirX, ev.dirY, ev.sporeType, undefined,
                  { nombre: ev.spores, muet: !!ev.rafale && Math.random() > 0.33 });
        src.spores = savedSpores;
        /* Le jet qu'on vient de creer, et pas "le dernier de la liste" : si
           launchJet a refuse, c'etait un autre jet qu'on ecrasait. */
        const j = gameState.jets.length > n0 ? gameState.jets[n0] : null;
        if (j) {
            /* Le TIREUR, annonce par le serveur - depuis une tete de pont,
               ce n'est pas le proprietaire de l'astre. Les serveurs d'avant
               n'envoyaient que le proprietaire : on s'en contente alors. */
            if (ev.slot !== undefined && ev.slot !== null) j.owner = ev.slot;
            if (ev.boule) { j.boule = true; j._groupe = _groupeBoule(src); }
            if (ev.rafale) j.rafale = true;
            if (ev.demol) j.demolisseur = ev.demol;
            /* La vitesse du serveur : celle de la boule n'est pas celle d'un jet. */
            if (ev.speed > 0) j.speed = ev.speed;
            j.id         = ev.id;
            j.spores     = ev.spores;
            j._sv        = ev.spores;
            j.color      = ev.color;
            j._serverDriven = true;
            if (ev.trajectory && ev.trajectory.length > 0) {
                j.trajectory = ev.trajectory;
                j.posIndex   = 0;
            }
        }
    });
    _socket.on('invite_error', ({ msg }) => {
        const el = document.getElementById('localInviteMsg');
        if (el) { el.textContent = '⚠ ' + msg; el.style.color = '#F87171'; }
    });
    _socket.on('invite_declined', ({ fromPseudo }) => {
        const el = document.getElementById('localInviteMsg');
        if (el) { el.textContent = '✗ ' + fromPseudo + ' a décliné.'; el.style.color = '#F87171'; }
        const w = document.getElementById('localWaitMsg');
        if (w) w.textContent = 'En attente d\'une réponse...';
    });
    
    _socket.on('invite_received', ({ roomId, fromPseudo }) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `<div style="background:rgba(10,15,35,0.98);border:1px solid rgba(100,180,255,0.4);border-radius:14px;padding:28px 32px;text-align:center;font-family:'Exo 2',sans-serif;max-width:320px;">
            <div style="font-size:15px;color:#E0E7FF;margin-bottom:20px;"><b>${_fEsc(fromPseudo)}</b> vous invite à jouer</div>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="btnAcceptInvite" style="padding:10px 24px;background:rgba(34,197,94,0.25);border:1px solid rgba(34,197,94,0.6);border-radius:8px;color:#4ADE80;font-family:'Exo 2',sans-serif;font-size:13px;cursor:pointer;">LANCER</button>
                <button id="btnDeclineInvite" style="padding:10px 24px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);border-radius:8px;color:#F87171;font-family:'Exo 2',sans-serif;font-size:13px;cursor:pointer;">DÉCLINER</button>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        document.getElementById('btnAcceptInvite').onclick = () => {
            overlay.remove();
            joinLocalRoom(roomId);
        };
        document.getElementById('btnDeclineInvite').onclick = () => {
            overlay.remove();
            _socket.emit('invite_declined', { targetPseudo: fromPseudo });
        };
    });
   _socket.on('build_complete', ({ slot, icon, msg, bodyName }) => {
        const body = gameState.planets.find(p => p.name === bodyName) || gameState.moons.find(m => m.name === bodyName);
        const player = gameState.players.find(p => p.id === slot);
        /* Le serveur envoie un emoji : on le remplace par l'icone du jeu. */
        const _g = { '🏗️': 'nid', '🍯': 'alveole', '🛡️': 'biome', '🦠': 'parasite' }[icon];
        if (player) addEvent('build', _g ? iconeBat(_g, 12) : _fEsc(icon || ''), _fEsc(msg || ''), body, player.color);
    });

    _socket.on('multi_pending', ({ slot }) => {
        const localPlayer = gameState.players[localSlot()];
        if (localPlayer && localPlayer.id === slot) {
            localPlayer._multiPending = multiEnAttente(localPlayer) + 1;
        }
    });

    _socket.on('player_eliminated', ({ slot, pseudo }) => {
        const p = gameState.players.find(p => p.id === slot);
        if (p) { p.alive = false; p._inSursis = false; }
        addEvent('neutral', '💀', (pseudo || 'Joueur') + ' est éliminé !', null, '#EF4444');
    });

           _socket.on('game_over', ({ winnerSlot, reason, stats }) => {
        if (gameState.phase === 'end') return;
        gameState._endReason = reason;
        const localPlayer = gameState.players[localSlot()];
        console.log('[game_over] winnerSlot=', winnerSlot, 'typeof=', typeof winnerSlot, 'localPlayer.id=', localPlayer?.id, 'mySlot=', mySlot, 'reason=', reason);
        const isVictory = winnerSlot !== -1 && (localPlayer && localPlayer.id === +winnerSlot);

        // Tournoi — envoyer le résultat au serveur
        if (gameState.isTournament && gameState._tournamentMatchId) {
            const winnerPlayer = gameState.players.find(p => p.id === +winnerSlot);
            if (winnerPlayer) {
                _socket.emit('tournament_result', {
                    matchId: gameState._tournamentMatchId,
                    winnerPseudo: winnerPlayer.name
                });
            }
        }

        // Ranked : le résultat est géré par le serveur via ranked_manche_result

        const totalBodies = gameState.planets.length + gameState.moons.length;
        showEndScreen(isVictory,
            { ...gameState.gameStats, timeElapsed: stats?.timeElapsed || gameState.time },
            localPlayer,
            totalBodies
        );
    });

    _socket.on('player_disconnected', ({ slot, pseudo }) => {
        console.warn('[multi] joueur déconnecté:', pseudo, 'slot', slot);
        const p = gameState.players.find(p => p.id === slot);
        if (p) p.alive = false;
        addEvent('disconnect', '⚡', `${pseudo || 'Joueur'} a quitté la partie`, null, '#F87171');
    });
}

function disconnectSocket() {
    if (_socket) { _socket.removeAllListeners(); _socket.disconnect(); _socket = null; }
}

// ── sendAction (en jeu) ───────────────────────────────────────

function sendAction(type, data) {
    if (!_socket || !gameState.isMulti) return;
    _socket.emit('player_action', { type, ...data });
}

function localSlot() {
    if (gameState.lockstep && gameState.lockstep.slot !== null) return gameState.lockstep.slot;
    return gameState.isMulti ? mySlot : 0;
}

// ── MULTI : matchmaking ───────────────────────────────────────

function startMultiMatchmaking() {
    connectSocket();
    gameState.isMulti = true;
    setPhase('createMulti');

    const statusEl = document.getElementById('multiStatus');
    const timerEl  = document.getElementById('multiTimer');
    const slotsEl  = document.getElementById('multiSlots');

    statusEl.textContent = 'Recherche d\'adversaires...';
    slotsEl.innerHTML = '';
    timerEl.textContent = '';

    let elapsed = 0;
    const timer = setInterval(() => {
        elapsed++;
        timerEl.textContent = elapsed + 's';
    }, 1000);

    _socket.emit('multi_queue');

    _socket.off('queue_status');
    _socket.on('queue_status', ({ position, total, needed }) => {
        statusEl.textContent = `Joueurs trouvés : ${total}/${needed}`;
        slotsEl.innerHTML = '';
        for (let i = 0; i < needed; i++) {
            const div = document.createElement('div');
            div.className = 'room-slot' + (i >= total ? ' empty' : '');
            div.style.cssText = 'padding:8px 12px; border:1px solid rgba(34,197,94,0.3); border-radius:6px; margin-bottom:4px; font-family:Exo 2,sans-serif; font-size:13px; color:#E0E7FF;';
            div.textContent = i < total ? '● Joueur connecté' : '○ En attente...';
            slotsEl.appendChild(div);
        }
    });

    _socket.off('matched');
    _socket.on('matched', ({ roomId, slot, players }) => {
        clearInterval(timer);
        currentRoom = { id: roomId, mode: 'multi' };
        mySlot = slot;
        isHost = (slot === 0);
        gameState._serverPlayers = players;
        statusEl.textContent = 'Partie trouvée ! Lancement...';
        timerEl.textContent = '';
        if (isHost) {
            // Même flow que l'hôte local
            fadeTransition(() => _onGameReady(roomId, players));
        } else {
            // Même flow que l'invité local
            _socket.off('game_start');
            _socket.on('game_start', ({ universe, players: serverPlayers }) => {
                gameState._serverUniverse = universe;
                gameState._serverPlayers = serverPlayers;
                fadeTransition(() => startGame());
            });
        }
    });

    document.getElementById('btnMultiCancel').onclick = () => {
        clearInterval(timer);
        _socket.emit('multi_queue_leave');
        disconnectSocket();
        gameState.isMulti = false;
        fadeTransition(() => setPhase('title'));
    };
}

// ── LOCAL : créer et inviter ──────────────────────────────────

function startLocalHost() {
    connectSocket();
    gameState.isMulti = true;
    setPhase('room');
    mySlot = 0;
    isHost = true;

    _socket.emit('local_create');

    _socket.off('local_created');
    _socket.on('local_created', ({ roomId, players }) => {
        currentRoom = { id: roomId, mode: 'local' };
        _refreshLocalSlots(players);

        window._localRoomId = roomId;
        const msg = document.getElementById('localInviteMsg');
        msg.textContent = 'Code : ' + roomId;
        msg.style.color = '#4ADE80';
    });

    _socket.off('room_update');
    _socket.on('room_update', ({ players }) => {
        _refreshLocalSlots(players);
    });
    _socket.off('player_ready');
    _socket.on('player_ready', ({ players }) => {
        if (currentRoom && isHost) {
            gameState._serverPlayers = players;
            fadeTransition(() => _onGameReady(currentRoom.id, players));
        }
    });

    const _nbv = document.getElementById('localCleaners');
    if (_nbv) _nbv.oninput = () => { document.getElementById('localCleanersVal').textContent = _nbv.value; };

    document.getElementById('btnLocalInvite').onclick = () => {
        const pseudo = document.getElementById('localInviteInput').value.trim();
        if (!pseudo || !currentRoom) return;
        _socket.emit('local_invite', { roomId: currentRoom.id, targetPseudo: pseudo });
        document.getElementById('localInviteInput').value = '';
        document.getElementById('localInviteMsg').textContent = 'Invitation envoyée à ' + pseudo + '...';
    };

    document.getElementById('btnLocalCancel').onclick = () => {
        disconnectSocket();
        gameState.isMulti = false;
        currentRoom = null;
        fadeTransition(() => setPhase('title'));
    };
}

function joinLocalRoom(roomId) {
    connectSocket();
    gameState.isMulti = true;

    _socket.emit('local_join', { roomId });

    _socket.off('local_joined');
    _socket.on('local_joined', ({ slot, players }) => {
        mySlot = slot;
        isHost = false;
        currentRoom = { id: roomId, mode: 'local' };
        gameState._serverPlayers = players;
        _socket.off('game_start');
        _socket.on('game_start', ({ universe, players: serverPlayers }) => {
            gameState._serverUniverse = universe;
            gameState._serverPlayers = serverPlayers;
            fadeTransition(() => startGame());
        });
        _socket.emit('player_ready', { roomId });
    });

    _socket.off('room_update');
    _socket.on('room_update', ({ players }) => _refreshLocalSlots(players));
}

function _refreshLocalSlots(players) {
    const el = document.getElementById('localSlots');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 2; i++) {
        const p = players.find(p => p.slot === i);
        const div = document.createElement('div');
        div.style.cssText = 'padding:8px 12px; border:1px solid rgba(100,180,255,' + (p ? '0.4' : '0.15') + '); border-radius:6px; margin-bottom:4px; font-family:Exo 2,sans-serif; font-size:13px; display:flex; align-items:center; gap:8px;';
        if (p) {
            div.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:' + p.color + ';display:inline-block;"></span><span style="color:#E0E7FF;">' + p.pseudo + (i === mySlot ? ' (vous)' : '') + '</span>';
        } else {
            div.innerHTML = '<span style="color:#475569;">Slot ' + (i+1) + ' — vide</span>';
        }
        el.appendChild(div);
    }
}

// ── Lancement effectif de la partie ──────────────────────────

function _onGameReady(roomId, players) {
    console.log('[_onGameReady] isHost=', isHost, 'roomId=', roomId);
    if (isHost) {
        // L'hôte génère l'univers et démarre directement (pas d'écran config en multi)
        gameState._pendingRoomId = roomId;
        gameState._pendingPlayers = players;
        // Config multi par défaut
        gameState.config.useIA = false;
        gameState.config.aiCount = 0;
        gameState.config.playerCount = players ? players.length : 2;
        gameState.config.mapIndex = Math.floor(Math.random() * MAP_LIBRARY.length);
        gameState.config.useComets = true;
        /* Partie locale : l'hote choisit le nombre de vaisseaux (0 a 12). */
        const _nbv = document.getElementById('localCleaners');
        gameState.config.cleanerCount = (currentRoom && currentRoom.mode === 'local' && _nbv)
            ? Math.max(0, Math.min(12, parseInt(_nbv.value, 10) || 0)) : 2;
        fadeTransition(() => startGame());
    } else {
        // Les autres attendent le signal du serveur
        _socket.off('game_start');
        _socket.on('game_start', ({ universe, players: serverPlayers }) => {
            gameState._serverUniverse = universe;
            gameState._serverPlayers = serverPlayers;
            fadeTransition(() => startGame());
        });
    }
}

// ── Réception snapshot ────────────────────────────────────────

function applySnapshot(snap) {
    if (!snap || !gameState.isMulti) return;

    if (snap.planets) snap.planets.forEach(sp => {
        const p = gameState.planets.find(p => p.name === sp.name);
        if (!p) return;
        const ownerChanged = p.owner !== sp.owner;
        if (ownerChanged) { marquerTerritoiresSales(); p.lutte = null; }
        if (sp.lu !== undefined) appliquerResumeLutte(p, sp.lu);
        p.owner         = sp.owner;
        p.spores        = sp.spores;
        p.symbiosis     = sp.symbiosis     ?? p.symbiosis;
        p.nids          = sp.nids          ?? p.nids;
        p.biomes        = sp.biomes        ?? p.biomes;
        p.alveoles      = sp.alveoles      ?? p.alveoles;
        accorderEdifices(p);
        p.buildMode        = sp.buildMode        ?? p.buildMode;
        p.parasiteSpore    = sp.parasiteSpore     ?? p.parasiteSpore;
        p.parasiteProgress = sp.parasiteProgress  ?? p.parasiteProgress;
        if (sp.maxSpores !== undefined)      p.maxSpores      = sp.maxSpores;
        if (sp.baseMaxSpores !== undefined)  p.baseMaxSpores  = sp.baseMaxSpores;
        if (sp.parasite !== undefined) {
            if (sp.parasite === null) {
                p.parasite = null;
            } else {
                const _srcBody = gameState.planets.find(b => b.name === sp.parasite.sourceName)
                               || gameState.moons.find(b => b.name === sp.parasite.sourceName);
                p.parasite = { ownerSlot: sp.parasite.ownerSlot, sourceName: sp.parasite.sourceName, sourceBody: _srcBody || null, _accumulator: p.parasite?._accumulator || 0 };
            }
        }
        // Mettre à jour bodies/spawnPlanet pour chaque joueur
        if (ownerChanged) {
            for (const player of gameState.players) {
                player.bodies = gameState.planets.filter(b => b.owner === player.id)
                              .concat(gameState.moons.filter(b => b.owner === player.id));
                if (!player.spawnPlanet && p.owner === player.id) {
                    player.spawnPlanet = p;
                    // Flash visuel pendant la phase spawn
                    if (gameState.phase === 'spawn' || gameState.phase === 'game') {
                        if (!gameState._spawnFlashes) gameState._spawnFlashes = [];
                        gameState._spawnFlashes.push({ body: p, age: 0, maxAge: 2.5, color: player.color });
                        if (player.id !== localSlot()) {
                            addEvent('war', '🌍', `${player.name} colonise ${p.name} !`, p, player.color);
                            if (!gameState._spawnArrows) gameState._spawnArrows = [];
                            gameState._spawnArrows.push({ body: p, age: 0, maxAge: 3, color: player.color });
                        }
                    }
                }
            }
        }
    });

    if (snap.moons) snap.moons.forEach(sm => {
        const m = gameState.moons.find(m => m.name === sm.name);
        if (!m) return;
        const ownerChanged = m.owner !== sm.owner;
        if (ownerChanged) { marquerTerritoiresSales(); m.lutte = null; }
        if (sm.lu !== undefined) appliquerResumeLutte(m, sm.lu);
        m.owner     = sm.owner;
        m.spores    = sm.spores;
        m.buildMode = sm.buildMode ?? m.buildMode;
        m.nids      = sm.nids      ?? m.nids;
        m.biomes    = sm.biomes    ?? m.biomes;
        m.alveoles  = sm.alveoles  ?? m.alveoles;
        accorderEdifices(m);
        /* Envoyes par les serveurs recents : le plafond bouge avec les
           alveoles, et la fiche montre la symbiose. */
        if (sm.maxSpores !== undefined) m.maxSpores = sm.maxSpores;
        if (sm.symbiosis !== undefined) m.symbiosis = sm.symbiosis;
        if (ownerChanged) {
            for (const player of gameState.players) {
                player.bodies = gameState.planets.filter(b => b.owner === player.id)
                              .concat(gameState.moons.filter(b => b.owner === player.id));
            }
        }
    });

// Sync cleaners depuis snapshot serveur
    if (snap.cleaners) {
        snap.cleaners.forEach((sc, i) => {
            const cl = gameState.cleaners[i];
            if (cl) {
                /* Duels : vie, mort (explosion quand il tombe, onde quand il
                   revient ailleurs) et adversaire, envoyes par le serveur. */
                if (sc.m !== undefined) {
                    const mort = !!sc.m;
                    if (mort && !cl.mort) exploserVaisseau(cl);
                    if (!mort && cl.mort) {
                        if (!gameState._ondes) gameState._ondes = [];
                        gameState._ondes.push({ x: sc.x, y: sc.y, r0: 30, r1: 2, age: 0, maxAge: 0.6,
                                                couleur: _rgbDe(DUEL_COULEURS[cl.type] || '#FFFFFF'), ep: 2 });
                    }
                    cl.mort = mort;
                    cl.pv = sc.pv;
                    cl._duel = (sc.d !== undefined && sc.d >= 0) ? (gameState.cleaners[sc.d] || null) : null;
                }
                cl.x     = sc.x;
                cl.y     = sc.y;
                cl.vx    = sc.vx;
                cl.vy    = sc.vy;
                cl.angle = sc.angle;
            }
        });
    }

    // Correction position jets depuis snapshot serveur
    if (snap.jets) {
        snap.jets.forEach(sj => {
            const j = gameState.jets.find(j => j.id === sj.id);
            if (j) {
                j.x = sj.x;
                j.y = sj.y;
                /* Ce que le serveur a ajoute ou retire depuis son dernier
                   instantane saute en chiffre (etoile, amas, vaisseau). */
                if (sj.spores !== undefined && sj.spores !== null) {
                    if (j._sv !== undefined && sj.spores !== j._sv) noterVariationJet(j, sj.spores - j._sv);
                    j._sv = sj.spores;
                }
                j.spores = sj.spores ?? j.spores;
                if (!sj.alive) j.alive = false;
            }
        });
        // Supprimer les jets que le serveur ne connaît plus
        const serverIds = new Set(snap.jets.map(sj => sj.id));
        gameState.jets = gameState.jets.filter(j => !j._serverDriven || serverIds.has(j.id));
    }

// Sync orbites et timer
    /* RECALAGE EN DOUCEUR. L'horloge et les angles d'orbite etaient remis
       d'un coup sur ceux du serveur a chaque instantane : l'horloge reculait
       par moments, et les astres sautaient d'une dizaine d'unites en arriere
       puis repartaient - dix fois par seconde. De pres, un effet
       stroboscopique. On rattrape desormais l'ecart par petites touches, et
       l'horloge ne recule jamais que de quelques millisecondes. Un ecart
       franc (reprise apres un onglet en veille) se recale d'un coup. */
    if (snap.time !== undefined) {
        const ecart = snap.time - gameState.time;
        if (!isFinite(gameState.time) || Math.abs(ecart) > 1) gameState.time = snap.time;
        else gameState.time += Math.max(-0.004, ecart * 0.15);
        gameState.gameStats.timeElapsed = snap.time;
    }
    const _recale = (cur, cible) => {
        if (!isFinite(cur)) return cible;
        let d = (cible - cur) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        return Math.abs(d) > 0.5 ? cible : cur + d * 0.2;
    };
    if (snap.orbits) {
        snap.orbits.forEach((so, si) => {
            const sun = gameState.suns[si];
            if (!sun) return;
            sun.angle = _recale(sun.angle, so.a);
            so.planets.forEach((sp, pi) => {
                const planet = sun.planets[pi];
                if (!planet) return;
                planet.angle = _recale(planet.angle, sp.a);
                sp.moons.forEach((sm, mi) => {
                    const moon = planet.moons[mi];
                    if (moon) moon.angle = _recale(moon.angle, sm.a);
                });
            });
        });
    }
    if (snap.belts) {
        snap.belts.forEach((sb, bi) => {
            const belt = gameState.asteroidBelts[bi];
            if (!belt) return;
            // Recalculer les angles de tous les rocks depuis le premier
            const baseAngle = sb.a - (belt.rocks[0]?.angle || 0);
            for (const rock of belt.rocks) rock.angle += baseAngle;
        });
    }
    gameState._boulesServeur = Array.isArray(snap.boules) ? snap.boules : [];
    if (snap.players) snap.players.forEach(sp => {
        const p = gameState.players.find(p => p.id === sp.id);
        if (!p) return;
        p.alive = sp.alive;
        p.totalSpores = sp.totalSpores;
    if (sp.multiProgress !== undefined) {
            p.multiProgress = sp.multiProgress;
            p.multiTier = sp.multiTier;
            if (sp.stats) p.stats = sp.stats;
        }
    });

    // Reconstruire player.bodies depuis les owners des planètes/lunes
    for (const p of gameState.players) p.bodies = [];
    for (const body of [...gameState.planets, ...gameState.moons]) {
        if (body.owner !== null && gameState.players[body.owner]) {
            gameState.players[body.owner].bodies.push(body);
        }
    }
}

function handleGameEvent(ev) {
    if (!ev || !ev.type) return;
    if (ev.type === 'jet') {
        const src = gameState.planets.find(p => p.name === ev.srcName)
                 || gameState.moons.find(m => m.name === ev.srcName);
        if (src) launchJet(src, ev.dirX, ev.dirY, ev.sporeType || 'normal');
    }
    if (ev.type === 'spawn') {
        const slot = ev.fromSlot !== undefined ? ev.fromSlot : ev.slot;
        const body = gameState.planets.find(p => p.name === ev.bodyName)
                  || gameState.moons.find(m => m.name === ev.bodyName);
        const player = gameState.players.find(p => p.id === slot);
        if (body && player) {
            body.owner = slot;
            body.spores = body.maxSpores * 0.5;
            player.bodies = [body];
            player.spawnPlanet = body;
        }
    }
}

async function initAuth() {
    if (SERVICES_HORS_LIGNE) {
        showAuthScreen();
        proposerHorsLigne('Services en ligne injoignables (bloqueur de publicité, réseau filtré ?). Le solo reste jouable.');
        return;
    }
    try {
        const { data: { session }, error } = await _supa.auth.getSession();
        if (error) {
            console.warn('Session invalide, nettoyage...', error.message);
            await _supa.auth.signOut();
            currentUser = null;
            currentProfile = null;
            showAuthScreen();
            return;
        }
        if (session && session.user) {
            currentUser = session.user;
            let profile = null;
            try { profile = await Promise.race([loadProfile(currentUser.id), new Promise(r => setTimeout(() => r(null), 5000))]); }
            catch(e) { console.warn('loadProfile échoué:', e); }
            if (profile) {
                currentProfile = profile;
                enterGame();
                return;
            }
            await _supa.auth.signOut().catch(() => {});
        }
    } catch(e) {
        console.warn('Erreur auth init:', e);
        await _supa.auth.signOut().catch(() => {});
    }
    currentUser = null;
    currentProfile = null;
    showAuthScreen();
}

// Filet de sécurité : si après 6s aucun écran visible ET user pas en train de taper → forcer authScreen
setTimeout(() => {
    const auth = document.getElementById('authScreen');
    const title = document.getElementById('titleScreen');
    if (!auth || !title) return;
    const bothHidden = auth.classList.contains('hidden') && title.classList.contains('hidden');
    const userTyping = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
    if (bothHidden && !userTyping && !gameState.isMulti && gameState.phase === 'title') { console.warn('[auth] écran bloqué, forçage authScreen'); showAuthScreen(); }
}, 6000);

_supa.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && session) {
        currentUser = session.user;
    }
    if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentProfile = null;
    }
});

function onSignedIn(user) {
    currentUser = user;
    loadProfile(user.id).then(async (profile) => {
        if (profile) {
            currentProfile = profile;
            enterGame();
        } else {
            showPseudoStep();
        }
    });
}

function showAuthScreen() {
    if (gameState.lockstep && gameState.lockstep.slot !== null) return;   /* pas par-dessus une partie lockstep */
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('titleScreen').classList.add('hidden');
}

function showPseudoStep() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('authStep1').style.display = 'none';
    document.getElementById('authStep2').style.display = 'block';
}

async function enterGame() {
    if (!currentUser || !currentProfile) {
        console.warn('[enterGame] pas de user/profile — redirection auth');
        showAuthScreen();
        return;
    }
    document.getElementById('authScreen').classList.add('hidden');
    const pseudoEl = document.getElementById('titlePseudo');
    if (pseudoEl && currentProfile) pseudoEl.textContent = '⬡ ' + currentProfile.pseudo;
    setPhase('title');
}

async function loadProfile(userId) {
    try {
    const { data, error } = await _supa
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error || !data) return null;
    // Charger le tag de guilde
    try {
        const { data: membership } = await _supa
            .from('guild_members')
            .select('role, guilds(id, tag)')
            .eq('player_id', userId)
            .maybeSingle();
        data._guildTag = membership?.guilds?.tag || null;
        data._guildId = membership?.guilds?.id || null;
        data._guildRole = membership?.role || null;
    } catch(e) { data._guildTag = null; data._guildId = null; }
    return data;
    } catch(e) { return null; }
}

// ── Pseudo avec tag de guilde ──
function displayName(pseudo, guildTag) {
    if (!guildTag) return pseudo || '?';
    return (pseudo || '?') + ' [' + guildTag + ']';
}

document.getElementById('btnAuthLogin').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const msg = document.getElementById('authMsg');
    if (!email || !email.includes('@')) {
        msg.textContent = 'Entrez un email valide.';
        msg.style.color = '#EF4444';
        return;
    }
    if (password.length < 6) {
        msg.textContent = 'Mot de passe : 6 caractères minimum.';
        msg.style.color = '#EF4444';
        return;
    }
    msg.textContent = 'Connexion...';
    msg.style.color = '#8B5CF6';
    const { data, error } = await _supa.auth.signInWithPassword({ email, password });
    if (error && erreurReseau(error)) {
        proposerHorsLigne('Serveur injoignable pour l\'instant. Le solo reste jouable.');
    } else if (error) {
        msg.textContent = 'Email ou mot de passe incorrect.';
        msg.style.color = '#EF4444';
    } else if (data && data.user) {
        msg.textContent = '✓ Connecté !';
        msg.style.color = '#22C55E';
        onSignedIn(data.user);
    }
});

document.getElementById('btnAuthSignup').addEventListener('click', async () => {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const msg = document.getElementById('authMsg');
    if (!email || !email.includes('@')) {
        msg.textContent = 'Entrez un email valide.';
        msg.style.color = '#EF4444';
        return;
    }
    if (password.length < 6) {
        msg.textContent = 'Mot de passe : 6 caractères minimum.';
        msg.style.color = '#EF4444';
        return;
    }
    msg.textContent = 'Création du compte...';
    msg.style.color = '#8B5CF6';
    const { data, error } = await _supa.auth.signUp({ email, password });
    if (error && erreurReseau(error)) {
        proposerHorsLigne('Serveur injoignable pour l\'instant. Le solo reste jouable.');
    } else if (error) {
        msg.textContent = 'Erreur : ' + error.message;
        msg.style.color = '#EF4444';
    } else if (data && data.user) {
        msg.textContent = '✓ Compte créé !';
        msg.style.color = '#22C55E';
        onSignedIn(data.user);
    }
});

document.getElementById('btnAuthPseudo').addEventListener('click', async () => {
    const pseudo = document.getElementById('authPseudo').value.trim();
    const msg = document.getElementById('pseudoMsg');
    if (pseudo.length < 3 || pseudo.length > 20 || !/^[\w\- ÀÂÄÉÈÊËÎÏÔÙÛÜÇàâäéèêëîïôùûüç]+$/.test(pseudo)) {
        msg.textContent = 'Le pseudo doit faire entre 3 et 20 caractères (lettres, chiffres, tiret, espace).';
        msg.style.color = '#EF4444';
        return;
    }
    msg.textContent = 'Enregistrement...';
    msg.style.color = '#8B5CF6';
    const { data, error } = await _supa
        .from('profiles')
        .insert({ id: currentUser.id, pseudo: pseudo })
        .select()
        .single();
    if (error) {
        if (error.code === '23505') {
            msg.textContent = 'Ce pseudo est déjà pris.';
        } else {
            msg.textContent = 'Erreur : ' + error.message;
        }
        msg.style.color = '#EF4444';
    } else {
        currentProfile = data;
        enterGame();
    }
});

// ── DEBUG bouton (ga.dmy@ikmail.com uniquement) ──

document.getElementById('btnLogout').addEventListener('click', async () => {
    playClickSound();
    try { await _supa.auth.signOut(); } catch(e) { console.warn('Erreur logout:', e); }
    currentUser = null;
    currentProfile = null;
    document.getElementById('titlePseudo').textContent = '';
    document.getElementById('authStep1').style.display = 'block';
    document.getElementById('authStep2').style.display = 'none';
    document.getElementById('authMsg').textContent = '';
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    showAuthScreen();
});

false && document.getElementById('btnLeaderboard_DEAD').addEventListener('click', () => {
    playClickSound();
    showLeaderboard();
});

false && document.getElementById('btnGuilds_DEAD').addEventListener('click', () => {
    playClickSound();
    showGuildScreen();
});

false && document.getElementById('btnGuildBack_DEAD').addEventListener('click', () => {
    playClickSound();
    setPhase('title');
});

false && document.getElementById('btnCreateGuild_DEAD').addEventListener('click', () => createGuild());
document.getElementById('btnJoinGuild').addEventListener('click', () => joinGuild());
document.getElementById('btnLeaveGuild').addEventListener('click', () => leaveGuild());

document.getElementById('guildLogoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = document.getElementById('guildLogoPreview');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
});

document.getElementById('guildTagInput').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
});
document.getElementById('guildJoinTagInput').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
});

async function showGuildScreen() {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('guildScreen').classList.remove('hidden');
    await refreshGuildScreen();
}

async function refreshGuildScreen() {
    if (!currentUser) return;
    // Charger la guilde du joueur
    const { data: membership } = await _supa
        .from('guild_members')
        .select('guild_id, role, guilds(*)')
        .eq('player_id', currentUser.id)
        .maybeSingle();

    const myPanel = document.getElementById('myGuildPanel');
    const noPanel = document.getElementById('noGuildPanel');

    if (membership?.guilds) {
        const g = membership.guilds;
        myPanel.style.display = 'block';
        noPanel.style.display = 'none';
        document.getElementById('myGuildName').textContent = g.name;
        document.getElementById('myGuildTag').textContent = '[' + g.tag + '] · ' + (membership.role === 'owner' ? 'Fondateur' : 'Membre');
        document.getElementById('myGuildElo').textContent = 'ELO : ' + g.elo;
        const logo = document.getElementById('myGuildLogo');
        if (g.logo_url) { logo.src = g.logo_url; logo.style.display = 'block'; }
        else logo.style.display = 'none';
        // Membres
        const { data: members } = await _supa
            .from('guild_members')
            .select('role, profiles(pseudo)')
            .eq('guild_id', g.id);
        if (members) {
            document.getElementById('myGuildMembers').innerHTML =
                '<b style="color:rgba(251,146,60,0.8);">Membres (' + members.length + ') :</b> ' +
                members.map(m => (m.role === 'owner' ? '👑 ' : '') + (m.profiles?.pseudo || '?')).join(', ');
        }
        // Stocker le tag pour l'invitation de guilde
        currentProfile._guildTag = g.tag;
        currentProfile._guildId = g.id;
    } else {
        myPanel.style.display = 'none';
        noPanel.style.display = 'block';
        if (currentProfile) { currentProfile._guildTag = null; currentProfile._guildId = null; }
    }

    // Classement guildes
    const { data: ranking } = await _supa
        .from('guild_leaderboard')
        .select('*')
        .limit(20);
    const lb = document.getElementById('guildLeaderboard');
    if (ranking && ranking.length > 0) {
        lb.innerHTML = ranking.map((g, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
            const eloColor = g.elo >= 1200 ? '#FFD700' : g.elo >= 1000 ? '#4ADE80' : '#94A3B8';
            return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(251,146,60,0.1);">
                <span style="width:24px;text-align:center;">${medal}</span>
                ${g.logo_url ? `<img src="${g.logo_url}" style="width:24px;height:24px;border-radius:4px;object-fit:cover;">` : '<div style="width:24px;height:24px;background:rgba(251,146,60,0.2);border-radius:4px;"></div>'}
                <span style="flex:1;color:#FB923C;">${esc(g.name)} <span style="color:rgba(251,146,60,0.5);">[${esc(g.tag)}]</span></span>
                <span style="color:${eloColor};font-family:'Orbitron',monospace;font-size:11px;">${g.elo}</span>
                <span style="color:#64748B;font-size:11px;">${g.member_count} mbr</span>
            </div>`;
        }).join('');
    } else {
        lb.textContent = 'Aucune guilde enregistrée.';
    }
}

async function createGuild() {
    const name = document.getElementById('guildNameInput').value.trim();
    const tag = document.getElementById('guildTagInput').value.trim().toUpperCase();
    const logoFile = document.getElementById('guildLogoInput').files[0];
    const msg = document.getElementById('guildCreateMsg');
    if (!name || !tag) { msg.textContent = 'Nom et tag requis.'; msg.style.color = '#F87171'; return; }
    if (tag.length > 3) { msg.textContent = 'Tag : 3 lettres max.'; msg.style.color = '#F87171'; return; }
    msg.textContent = 'Création en cours...'; msg.style.color = '#94A3B8';
    try {
        let logo_url = null;
        if (logoFile) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(logoFile.type)) { msg.textContent = 'Format invalide (JPG, PNG, GIF, WEBP).'; msg.style.color = '#F87171'; return; }
            if (logoFile.size > 1024 * 1024) { msg.textContent = 'Logo trop lourd (max 1MB).'; msg.style.color = '#F87171'; return; }
            const ext = logoFile.name.split('.').pop();
            const path = currentUser.id + '_' + Date.now() + '.' + ext;
            const { error: upErr } = await _supa.storage.from('guild-logos').upload(path, logoFile, { upsert: true });
            if (upErr) throw upErr;
            const { data: urlData } = _supa.storage.from('guild-logos').getPublicUrl(path);
            logo_url = urlData.publicUrl;
        }
        const { data: guild, error } = await _supa.from('guilds')
            .insert({ name, tag, logo_url, created_by: currentUser.id })
            .select().single();
        if (error) throw error;
        await _supa.from('guild_members').insert({ guild_id: guild.id, player_id: currentUser.id, role: 'owner' });
        msg.textContent = 'Guilde créée !'; msg.style.color = '#4ADE80';
        await refreshGuildScreen();
    } catch(e) {
        msg.textContent = e.message?.includes('unique') ? 'Nom ou tag déjà pris.' : 'Erreur : ' + e.message;
        msg.style.color = '#F87171';
    }
}

async function joinGuild() {
    const tag = document.getElementById('guildJoinTagInput').value.trim().toUpperCase();
    const msg = document.getElementById('guildJoinMsg');
    if (!tag) { msg.textContent = 'Entre un tag.'; msg.style.color = '#F87171'; return; }
    msg.textContent = 'Recherche...'; msg.style.color = '#94A3B8';
    try {
        const { data: guild, error } = await _supa.from('guilds').select('id, name').eq('tag', tag).maybeSingle();
        if (error || !guild) { msg.textContent = 'Guilde introuvable.'; msg.style.color = '#F87171'; return; }
        await _supa.from('guild_members').insert({ guild_id: guild.id, player_id: currentUser.id, role: 'member' });
        msg.textContent = 'Vous avez rejoint ' + guild.name + ' !'; msg.style.color = '#4ADE80';
        await refreshGuildScreen();
    } catch(e) {
        msg.textContent = (e.message?.includes('unique') || e.message?.includes('guild_members_one_guild')) ? 'Vous appartenez déjà à une guilde. Quittez-la d\'abord.' : 'Erreur : ' + e.message;
        msg.style.color = '#F87171';
    }
}

async function leaveGuild() {
    if (!confirm('Quitter votre guilde ?')) return;
    if (!currentProfile?._guildId) return;
    try {
        await _supa.from('guild_members').delete().eq('guild_id', currentProfile._guildId).eq('player_id', currentUser.id);
        await refreshGuildScreen();
    } catch(e) { console.warn('leaveGuild:', e); }
}

document.getElementById('btnHelp').addEventListener('click', () => {
    playClickSound();
    livreVersAide();
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('helpScreen').classList.remove('hidden');
});

document.getElementById('btnHelpBack').addEventListener('click', () => {
    playClickSound();
    setPhase('title');
});

document.getElementById('btnStartTutorial').addEventListener('click', () => {
    playClickSound();
    setPhase('title');
    setTimeout(() => startTutorial(), 100);
});
