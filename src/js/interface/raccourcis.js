// ═══ TOUCHE K : TOUS LES RACCOURCIS ═══
/* Un panneau transparent par-dessus la partie ; il ne bloque ni la souris
   ni le jeu. K le montre ou le cache. */
/* Entre crochets : une touche, dessinee comme telle. */
const RACCOURCIS = [
    ['CLAVIER', [
        ['[Z] [Q] [S] [D] ou [flèches]', 'Déplacer la vue (piloter une sphère capturée)'],
        ['[P] / [M]', 'Zoom avant / arrière'],
        ['[Espace]', "Viser depuis l'astre sélectionné"],
        ['[Tab]', 'Astre suivant'],
        ['[1] [2] [3]', 'Construire alvéole · nid · biome'],
        ['[4]', 'Construire un foyer putride (spore parasitaire)'],
        ['[A] / [E]', "Part d'envoi −5 % / +5 %"],
        ['[F]', 'Armer le démolisseur (molette : bâtiment visé)'],
        ['[G]', 'Armer la spore parasitaire'],
        ['[R]', "Riposte (sur l'astre survolé, ou partout)"],
        ['[T]', 'Arrêt des attaques'],
        ['[K]', 'Afficher / cacher ces raccourcis'],
        ['[Échap]', 'Pause et livre des règles'],
        ['[F3] puis [D]', 'Diagnostic de performance']
    ]],
    ['SOURIS', [
        ['Clic gauche', 'Sélectionner un astre (et une zone de tir)'],
        ['Double-clic', "Plonger sur l'astre"],
        ['Clic droit sur un astre', 'Sa fiche (infos et bâtiments)'],
        ['Clic droit + glisser', 'Déplacer la vue'],
        ['Molette', 'Zoom'],
        ['Survol d\u2019un nombre', 'À qui sont ces spores'],
        ['Clic droit sur un nom (liste des joueurs)', 'Info du joueur, ou proposer un commerce']
    ]],
    ['EN VISÉE', [
        ['Clic gauche', 'Tirer vers le curseur'],
        ['Viser sans cliquer', "Tir groupé : l'astre qui tire se charge (⚡ au-delà du maximum)"],
        ['Curseur sur ton disque', 'Tir de surface'],
        ['[Ctrl] + clic maintenu', 'Rafale'],
        ['[Shift] maintenu', 'Boule (relâcher pour lancer)'],
        ['Clic droit', 'Annuler']
    ]]
];

function basculerRaccourcis() {
    let el = document.getElementById('panneauRaccourcis');
    if (el) { el.remove(); return; }
    el = document.createElement('div');
    el.id = 'panneauRaccourcis';
    el.style.cssText = 'position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:950; pointer-events:none;' +
        'width:min(900px, calc(100vw - 32px)); max-height:calc(100vh - 40px); overflow:hidden;' +
        'background:rgba(6,10,28,0.72); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);' +
        'border:1px solid rgba(168,85,247,0.35); border-radius:14px; padding:16px 20px;' +
        'font-family:"Exo 2",sans-serif; color:#E0E7FF;';
    const kbd = function (s) {
        return s.replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>');
    };
    el.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px;">' +
        '<span style="font-family:Orbitron,sans-serif; font-size:13px; letter-spacing:3px; color:#D8B4FE;">RACCOURCIS</span>' +
        '<span style="font-size:11px; color:#94A3B8;"><kbd>K</kbd> pour fermer</span></div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px 22px;">' +
        RACCOURCIS.map(function (g) {
            return '<div><div style="font-family:Orbitron,sans-serif; font-size:10px; letter-spacing:2px; color:#A78BFA; margin-bottom:6px;">' + g[0] + '</div>' +
                g[1].map(function (l) {
                    return '<div style="display:flex; gap:10px; align-items:baseline; padding:3px 0; border-bottom:1px solid rgba(148,163,184,0.1); font-size:12.5px;">' +
                        '<span style="flex:0 0 42%; color:#F5F3FF;">' + kbd(l[0]) + '</span><span style="color:#CBD5E1;">' + l[1] + '</span></div>';
                }).join('') + '</div>';
        }).join('') + '</div>';
    document.body.appendChild(el);
}

window.addEventListener('keydown', function (e) {
    if (e.code !== 'KeyK' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    const a = document.activeElement;
    if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button'].includes(a.type)))) return;
    if (gameState.phase !== 'game' && gameState.phase !== 'paused' && gameState.phase !== 'spawn') return;
    e.preventDefault();
    basculerRaccourcis();
});

false && document.getElementById('btnLeaderboardBack_DEAD').addEventListener('click', () => {
    playClickSound();
    setPhase('title');
});

async function showLeaderboard() {
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('leaderboardScreen').classList.remove('hidden');
    const body = document.getElementById('leaderboardBody');
    const empty = document.getElementById('leaderboardEmpty');
    body.innerHTML = '<tr><td colspan="5" style="color:#94A3B8; text-align:center; padding:20px;">Chargement...</td></tr>';
    empty.style.display = 'none';

    // ── Colonne Joueurs ──
    try {
        const { data, error } = await _supa.from('leaderboard').select('*').order('elo', { ascending: false }).limit(50);
        if (error) throw error;
        if (!data || data.length === 0) { body.innerHTML = ''; empty.style.display = 'block'; }
        else {
            body.innerHTML = data.map((row, i) => {
                const rank = i + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
                const isMe = currentProfile && row.pseudo === currentProfile.pseudo;
                const bg = isMe ? 'background:rgba(139,92,246,0.15);' : '';
                const elo = row.elo ?? 1000;
                const eloColor = elo >= 1200 ? '#FFD700' : elo >= 1000 ? '#4ADE80' : '#94A3B8';
                return `<tr style="${bg} border-bottom:1px solid rgba(139,92,246,0.1);">
                    <td style="padding:6px 4px; color:#E0E7FF;">${medal}</td>
                    <td style="padding:6px 4px; color:${esc(row.avatar_color || '#E0E7FF')}; font-weight:${isMe ? 'bold' : 'normal'};">${esc(row.pseudo)}</td>
                    <td style="padding:6px 4px; text-align:center; color:${eloColor}; font-family:'Orbitron',monospace; font-size:12px;">${elo}</td>
                    <td style="padding:6px 4px; text-align:center; color:#22C55E;">${row.wins}</td>
                    <td style="padding:6px 4px; text-align:center; color:#FBBF24;">${row.win_rate}%</td>
                </tr>`;
            }).join('');
        }
    } catch(e) {
        body.innerHTML = '<tr><td colspan="5" style="color:#EF4444; text-align:center; padding:20px;">Erreur</td></tr>';
    }

    // ── Colonne Guildes ──
    const glb = document.getElementById('guildLeaderboardRanking');
    try {
        const { data: guilds } = await _supa.from('guild_leaderboard').select('*').limit(30);
        if (!guilds || guilds.length === 0) { glb.textContent = 'Aucune guilde.'; return; }
        glb.innerHTML = guilds.map((g, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
            const eloColor = g.elo >= 1200 ? '#FFD700' : g.elo >= 1000 ? '#4ADE80' : '#94A3B8';
            const isMyGuild = currentProfile?._guildTag === g.tag;
            const bg = isMyGuild ? 'background:rgba(251,146,60,0.1);' : '';
            return `<div onclick="openGuildProfile('${g.id}')" style="cursor:pointer; display:flex; align-items:center; gap:8px; padding:7px 4px; border-bottom:1px solid rgba(251,146,60,0.1); ${bg} border-radius:4px;">
                <span style="width:24px; text-align:center; font-size:13px;">${medal}</span>
                ${g.logo_url ? `<img src="${esc(g.logo_url)}" style="width:26px;height:26px;border-radius:4px;object-fit:cover;">` : '<div style="width:26px;height:26px;background:rgba(251,146,60,0.15);border-radius:4px;"></div>'}
                <span style="flex:1; color:#FB923C; font-size:13px;">${esc(g.name)} <span style="color:rgba(251,146,60,0.5); font-size:11px;">[${esc(g.tag)}]</span></span>
                <span style="color:${eloColor}; font-family:'Orbitron',monospace; font-size:11px;">${g.elo}</span>
                <span style="color:#64748B; font-size:11px;">${g.member_count}m</span>
            </div>`;
        }).join('');
    } catch(e) {
        glb.textContent = 'Erreur de chargement.';
    }
}

async function openGuildProfile(guildId) {
    const { data: g } = await _supa.from('guild_leaderboard').select('*').eq('id', guildId).single();
    if (!g) return;
    const { data: members } = await _supa.from('guild_members').select('role, profiles(pseudo, elo)').eq('guild_id', guildId);
    const popup = document.getElementById('guildProfilePopup');
    const logo = document.getElementById('gpLogo');
    if (g.logo_url) { logo.src = g.logo_url; logo.style.display = 'block'; } else logo.style.display = 'none';
    document.getElementById('gpName').textContent = g.name;
    document.getElementById('gpTag').textContent = '[' + g.tag + '] · ' + g.member_count + ' membre(s)';
    document.getElementById('gpElo').textContent = 'ELO Guilde : ' + g.elo;
    document.getElementById('gpDesc').textContent = g.description || 'Aucune présentation.';
    document.getElementById('gpDescEdit').value = g.description || '';
    document.getElementById('gpDescEdit').style.display = 'none';
    document.getElementById('gpDesc').style.display = 'block';
    document.getElementById('gpSaveBtn').style.display = 'none';
    if (members) {
        document.getElementById('gpMembers').innerHTML = '<b style="color:rgba(251,146,60,0.6);">Membres :</b> ' +
            members.map(m => (m.role === 'owner' ? '👑 ' : '') + (m.profiles?.pseudo || '?') + ' <span style="color:#4ADE80;font-size:10px;">(' + (m.profiles?.elo ?? 1000) + ')</span>').join(', ');
    }
    // Bouton édition visible seulement si fondateur
    const isOwner = currentProfile?._guildId === guildId && members?.find(m => m.profiles?.pseudo === currentProfile?.pseudo && m.role === 'owner');
    const editBtn = document.getElementById('gpEditBtn');
    editBtn.style.display = isOwner ? 'inline-block' : 'none';
    editBtn.onclick = () => {
        document.getElementById('gpDesc').style.display = 'none';
        document.getElementById('gpDescEdit').style.display = 'block';
        document.getElementById('gpSaveBtn').style.display = 'inline-block';
        editBtn.style.display = 'none';
    };
    document.getElementById('gpSaveBtn').onclick = async () => {
        const desc = document.getElementById('gpDescEdit').value.trim();
        await _supa.from('guilds').update({ description: desc }).eq('id', guildId);
        document.getElementById('gpDesc').textContent = desc || 'Aucune présentation.';
        document.getElementById('gpDesc').style.display = 'block';
        document.getElementById('gpDescEdit').style.display = 'none';
        document.getElementById('gpSaveBtn').style.display = 'none';
        editBtn.style.display = 'inline-block';
    };
    document.getElementById('gpCloseBtn').onclick = closeGuildProfile;
    document.getElementById('guildProfileOverlay').style.display = 'block';
    popup.style.display = 'block';
}

function closeGuildProfile() {
    document.getElementById('guildProfilePopup').style.display = 'none';
    document.getElementById('guildProfileOverlay').style.display = 'none';
}

document.getElementById('uiResetBtn').addEventListener('click', () => {
    const slider = document.getElementById('uiZoomSlider');
    if (slider) { slider.value = 100; document.getElementById('uiZoomVal').textContent = '100%'; }
    document.getElementById('myPlanets').style.transform = '';
    document.getElementById('sidePanel').style.transform = '';
    document.getElementById('topRight').style.transform = '';
});

document.querySelectorAll('#eventLog .log-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#eventLog .log-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refreshEventLog();
    });
});

document.getElementById('btnCompetition').addEventListener('click', () => {
    fadeTransition(() => { connectSocket(); setPhase('competition'); });
});

document.getElementById('btnCompetitionBack').addEventListener('click', () => {
    fadeTransition(() => setPhase('title'));
});

document.getElementById('btnGoTournament').addEventListener('click', () => {
    fadeTransition(() => setPhase('tournament'));
});

document.getElementById('btnGoRanked').addEventListener('click', () => {
    fadeTransition(() => setPhase('ranked'));
});

document.getElementById('btnRankedBack').addEventListener('click', () => {
    if (_socket) _socket.emit('ranked_queue_leave');
    fadeTransition(() => setPhase('competition'));
});

// ── RANKED 1v1 ──────────────────────────────────────────────

document.getElementById('btnRankedRandom').addEventListener('click', () => {
    if (!_socket) { console.warn('[ranked] pas de socket'); return; }
    document.getElementById('rankedStatus').textContent = '🔍 Recherche d\'un adversaire...';
    document.getElementById('btnRankedRandom').disabled = true;
    if (_socket.connected) {
        _socket.emit('ranked_queue');
    } else {
        _socket.once('connect', () => _socket.emit('ranked_queue'));
    }
});

document.getElementById('btnRankedInvite').addEventListener('click', () => {
    const pseudo = document.getElementById('rankedInviteInput').value.trim();
    if (!pseudo) return;
    if (!_socket) return;
    _socket.emit('ranked_invite', { targetPseudo: pseudo });
    document.getElementById('rankedStatus').textContent = `📨 Invitation envoyée à ${pseudo}...`;
});

// Listeners socket ranked
function _initRankedListeners() {
    if (!_socket) return;
    _socket.off('ranked_queue_status');
    _socket.off('ranked_queue_left');
    _socket.off('ranked_invite_received');
    _socket.off('ranked_invite_declined');
    _socket.off('ranked_invite_error');
    _socket.off('ranked_matched');
    _socket.off('ranked_manche_result');
    _socket.off('ranked_match_over');

    _socket.on('ranked_queue_status', ({ position }) => {
        document.getElementById('rankedStatus').textContent = `🔍 En attente... (${position} joueur(s) en file)`;
    });

    _socket.on('ranked_queue_left', () => {
        document.getElementById('rankedStatus').textContent = 'Choisissez un mode';
        document.getElementById('btnRankedRandom').disabled = false;
    });

    _socket.on('ranked_invite_received', ({ fromPseudo, fromColor }) => {
        const accept = confirm(`⚔️ ${fromPseudo} vous défie en 1vs1 ! Accepter ?`);
        if (accept) {
            _socket.emit('ranked_invite_accept', { fromPseudo });
        } else {
            _socket.emit('ranked_invite_declined', { targetPseudo: fromPseudo });
        }
    });

    _socket.on('ranked_invite_declined', ({ fromPseudo }) => {
        document.getElementById('rankedStatus').textContent = `❌ ${fromPseudo} a refusé le défi.`;
    });

    _socket.on('ranked_invite_error', ({ msg }) => {
        document.getElementById('rankedStatus').textContent = `❌ ${msg}`;
    });

    _socket.on('ranked_matched', ({ roomId, slot, opponent, maps }) => {
        document.getElementById('rankedStatus').textContent = `⚔️ Adversaire trouvé : ${opponent.pseudo} !`;
        gameState._rankedSession = {
            roomId, slot, opponent, maps,
            scores: [0, 0],
            manche: 0
        };
        mySlot = slot;
        currentRoom = { id: roomId };
        isHost = (slot === 0);
        gameState.isMulti = true;
        gameState.isRanked = true;

        if (slot !== 0) {
            // Slot 1 : enregistrer game_start immédiatement
            _socket.off('game_start');
            _socket.on('game_start', ({ universe: u, players: serverPlayers }) => {
                gameState._serverUniverse = u;
                gameState._serverPlayers = serverPlayers;
                fadeTransition(() => startGame());
            });
        }
        setTimeout(() => _startRankedManche(), 2000);
    });

    _socket.on('ranked_manche_result', ({ winnerSlot, scores }) => {
        const session = gameState._rankedSession;
        if (!session) return;
        const myScore = scores[session.slot];
        const oppScore = scores[1 - session.slot];
        session.scores = [myScore, oppScore];
        session.manche = myScore + oppScore;
        document.getElementById('rankedScoreTitle').textContent = `MANCHE ${session.manche} TERMINÉE`;
        document.getElementById('rankedScore').textContent = `${myScore} — ${oppScore}`;
        document.getElementById('rankedScoreMsg').textContent = `Manche ${session.manche + 1} dans quelques secondes...`;
        document.getElementById('btnRankedNextManche').style.display = '';
        document.getElementById('rankedScorePanel').style.display = 'flex';
        setPhase('ranked');
    });

    _socket.on('ranked_match_over', ({ winnerSlot, scores, elo }) => {
        const session = gameState._rankedSession;
        if (!session) return;
        const myScore = scores[session.slot];
        const oppScore = scores[1 - session.slot];
        const iWin = winnerSlot === session.slot;
        document.getElementById('rankedScoreTitle').textContent = iWin ? '🏆 VICTOIRE !' : '💀 DÉFAITE';
        document.getElementById('rankedScore').textContent = `${myScore} — ${oppScore}`;
        let msg = 'Match terminé';
        if (elo) {
            const mine = iWin ? elo.winner : elo.loser;
            if (mine) { const d = mine.after - mine.before; msg = `ELO ${mine.after} (${d >= 0 ? '+' : ''}${d})`; }
        }
        document.getElementById('rankedScoreMsg').textContent = msg;
        document.getElementById('btnRankedNextManche').style.display = 'none';
        document.getElementById('rankedScorePanel').style.display = 'flex';
        setPhase('ranked');
    });
}

document.getElementById('btnRankedNextManche').addEventListener('click', () => {
    document.getElementById('rankedScorePanel').style.display = 'none';
    _startRankedManche();
});

function _startRankedManche() {
    const session = gameState._rankedSession;
    if (!session) return;
    const mapRef = session.maps[session.manche];
    const mapData = TOURNAMENT_MAPS[mapRef.cycle]?.[mapRef.round - 1];
    if (!mapData) {
        document.getElementById('rankedStatus').textContent = `❌ Carte introuvable (${mapRef.cycle} round ${mapRef.round})`;
        return;
    }
    const universe = generateTournamentUniverse(mapData, session.slot, session.opponent);
    gameState.isMulti = true;
    gameState.isRanked = true;
    gameState.isTournament = false;
    gameState.localSlot = session.slot;
    mySlot = session.slot;
    isHost = (session.slot === 0);

    if (session.slot === 0) {
        // Hôte : même flow que multi hôte
        gameState._pendingRoomId = session.roomId;
        gameState._serverUniverse = universe;
        gameState._serverPlayers = [
            { slot: 0, pseudo: currentProfile.pseudo, color: currentProfile.avatar_color },
            { slot: 1, pseudo: session.opponent.pseudo, color: session.opponent.color }
        ];
        gameState.config.useIA = false;
        gameState.config.aiCount = 0;
        gameState.config.playerCount = 2;
        fadeTransition(() => startGame());
    } else {
        // Invité : même flow que multi invité
        _socket.off('game_start');
        _socket.on('game_start', ({ universe: u, players: serverPlayers }) => {
            gameState._serverUniverse = u;
            gameState._serverPlayers = serverPlayers;
            fadeTransition(() => startGame());
        });
    }
}

document.getElementById('btnTournamentBack').addEventListener('click', () => {
    playClickSound();
    fadeTransition(() => setPhase('title'));
});

document.getElementById('btnTournamentJoin').addEventListener('click', () => {
    const msg = document.getElementById('tournamentJoinMsg');
    const btn = document.getElementById('btnTournamentJoin');
    if (!currentProfile) { msg.textContent = 'Connectez-vous d\'abord.'; return; }
    btn.disabled = true;
    btn.textContent = '✓ INSCRIT';
    btn.style.opacity = '0.6';
    msg.textContent = 'En attente du lancement...';
    msg.style.color = '#4ADE80';
    _tournamentRegister();
    document.getElementById('titleScreen').classList.add('hidden');
});

document.getElementById('btnMulti').addEventListener('click', () => {
    ensureAudio(); playClickSound();
    if (!_checkSporeReady()) return;
    _applyActiveSpore();
    startMultiMatchmaking();
});

document.getElementById('btnLocal').addEventListener('click', () => {
    ensureAudio(); playClickSound();
    if (!_checkSporeReady()) return;
    _applyActiveSpore();
    startLocalHost();
});

// ── Tournoi ──────────────────────────────────────────────────

let _tournamentData = null;

// Configurations des maps par round de tournoi
// ── Cartes de tournoi — Cycle 1 ───────────────────────────────
const TOURNAMENT_MAPS = {
    cycle1: [
        // Round 1 — Sigisnis-Lyrirnis
        {"name":"Sigisnis-Lyrirnis","blackHole":{"x":0,"y":0,"radius":300},"suns":[{"name":"Celirvyn","radius":182,"orbitRadius":2543,"orbitSpeed":0.0106,"angle":-0.763,"color":"#FF6B6B","planets":[{"name":"Omiaxdis","radius":97,"orbitRadius":745,"orbitSpeed":0.0343,"angle":6.876,"flore":100,"faune":63,"moons":[{"name":"Xorarton","radius":59,"orbitRadius":258,"orbitSpeed":0.1666,"angle":24.438,"flore":44,"faune":49}]},{"name":"Thalara","radius":128,"orbitRadius":1390,"orbitSpeed":0.0344,"angle":4.96,"flore":65,"faune":59,"moons":[{"name":"Eriumdon","radius":44,"orbitRadius":237,"orbitSpeed":0.2224,"angle":31.776,"flore":51,"faune":31},{"name":"Pyxisria","radius":40,"orbitRadius":345,"orbitSpeed":0.2092,"angle":34.173,"flore":39,"faune":45}]},{"name":"Ithelra","radius":102,"orbitRadius":745,"orbitSpeed":0.0343,"angle":3.1,"flore":3,"faune":4,"moons":[{"name":"Nebisdis","radius":23,"orbitRadius":349,"orbitSpeed":0.1517,"angle":20.117,"flore":6,"faune":14},{"name":"Lyredis","radius":51,"orbitRadius":349,"orbitSpeed":0.1517,"angle":21.556,"flore":49,"faune":16},{"name":"Paludis","radius":32,"orbitRadius":212,"orbitSpeed":0.2003,"angle":24.579,"flore":50,"faune":50}]}]},{"name":"Eriellux","radius":188,"orbitRadius":2543,"orbitSpeed":0.0106,"angle":2.25,"color":"#FF8C42","planets":[{"name":"Lyralbus","radius":73,"orbitRadius":769,"orbitSpeed":0.0538,"angle":4.62,"flore":29,"faune":77,"moons":[{"name":"Corelxis","radius":30,"orbitRadius":222,"orbitSpeed":0.3277,"angle":31.647,"flore":8,"faune":28},{"name":"Ithuria","radius":25,"orbitRadius":222,"orbitSpeed":0.3277,"angle":29.484,"flore":29,"faune":32}]},{"name":"Thalemus","radius":123,"orbitRadius":769,"orbitSpeed":0.0538,"angle":8.654,"flore":80,"faune":44,"moons":[{"name":"Synonton","radius":48,"orbitRadius":329,"orbitSpeed":0.1557,"angle":11.738,"flore":4,"faune":43}]},{"name":"Velaxria","radius":125,"orbitRadius":1396,"orbitSpeed":0.0239,"angle":3.207,"flore":95,"faune":9,"moons":[{"name":"Ithovyn","radius":48,"orbitRadius":268,"orbitSpeed":0.1653,"angle":15.503,"flore":36,"faune":14},{"name":"Aurora","radius":45,"orbitRadius":268,"orbitSpeed":0.1653,"angle":20.155,"flore":32,"faune":53},{"name":"Sigamir","radius":53,"orbitRadius":408,"orbitSpeed":0.1612,"angle":19.325,"flore":86,"faune":28}]}]},{"name":"Velardon","radius":183,"orbitRadius":838,"orbitSpeed":0.0238,"angle":0.669,"color":"#FF6B6B","planets":[{"name":"Velenria","radius":83,"orbitRadius":498,"orbitSpeed":0.0533,"angle":0.705,"flore":21,"faune":87,"moons":[]},{"name":"Draaxdon","radius":96,"orbitRadius":498,"orbitSpeed":0.0533,"angle":2.622,"flore":73,"faune":42,"moons":[]}]}],"asteroidBelts":[]},
        // Round 2 — Lyrith-Nebipha
        {"name":"Lyrith-Nebipha","blackHole":{"x":0,"y":0,"radius":300},"suns":[{"name":"Synonnis","radius":202,"orbitRadius":1745,"orbitSpeed":0.0133,"angle":3.709,"color":"#FF6B6B","planets":[{"name":"Zetirdis","radius":106,"orbitRadius":455,"orbitSpeed":0.0517,"angle":14.775,"flore":100,"faune":28,"moons":[{"name":"Celisth","radius":58,"orbitRadius":195,"orbitSpeed":0.2619,"angle":82.006,"flore":28,"faune":34}]},{"name":"Celonria","radius":102,"orbitRadius":711,"orbitSpeed":0.0512,"angle":16.979,"flore":100,"faune":13,"moons":[{"name":"Zetelra","radius":21,"orbitRadius":176,"orbitSpeed":0.1838,"angle":56.958,"flore":56,"faune":60}]}]},{"name":"Zetelnis","radius":225,"orbitRadius":1745,"orbitSpeed":0.0133,"angle":1.619,"color":"#FFB830","planets":[{"name":"Coroszar","radius":84,"orbitRadius":456,"orbitSpeed":0.0482,"angle":16.483,"flore":87,"faune":22,"moons":[]},{"name":"Thalaxis","radius":110,"orbitRadius":855,"orbitSpeed":0.047,"angle":16.036,"flore":20,"faune":10,"moons":[{"name":"Synanvyn","radius":35,"orbitRadius":204,"orbitSpeed":0.2491,"angle":77.132,"flore":38,"faune":9}]},{"name":"Kryumpha","radius":128,"orbitRadius":855,"orbitSpeed":0.047,"angle":15.009,"flore":66,"faune":31,"moons":[{"name":"Palarton","radius":29,"orbitRadius":294,"orbitSpeed":0.2716,"angle":87.99,"flore":29,"faune":26},{"name":"Zanaxdon","radius":28,"orbitRadius":294,"orbitSpeed":0.2716,"angle":89.155,"flore":45,"faune":46}]}]},{"name":"Aurelnis","radius":152,"orbitRadius":4194,"orbitSpeed":0.0088,"angle":1.092,"color":"#FF8C42","planets":[{"name":"Corumlux","radius":81,"orbitRadius":495,"orbitSpeed":0.0667,"angle":4.034,"flore":100,"faune":48,"moons":[{"name":"Thalilux","radius":28,"orbitRadius":179,"orbitSpeed":0.2348,"angle":24.377,"flore":96,"faune":6},{"name":"Omiulux","radius":44,"orbitRadius":179,"orbitSpeed":0.2348,"angle":19.821,"flore":7,"faune":26}]},{"name":"Thalith","radius":126,"orbitRadius":834,"orbitSpeed":0.0466,"angle":2.782,"flore":100,"faune":42,"moons":[{"name":"Celirton","radius":35,"orbitRadius":229,"orbitSpeed":0.1923,"angle":15.916,"flore":56,"faune":22},{"name":"Itharvyn","radius":38,"orbitRadius":229,"orbitSpeed":0.1923,"angle":14.136,"flore":100,"faune":46}]},{"name":"Drairnis","radius":95,"orbitRadius":834,"orbitSpeed":0.0466,"angle":5.671,"flore":1,"faune":50,"moons":[{"name":"Synelra","radius":54,"orbitRadius":237,"orbitSpeed":0.3134,"angle":33.573,"flore":46,"faune":26}]}]},{"name":"Draelria","radius":221,"orbitRadius":4194,"orbitSpeed":0.0088,"angle":2.87,"color":"#FFE44D","planets":[{"name":"Auronnis","radius":92,"orbitRadius":726,"orbitSpeed":0.039,"angle":1.511,"flore":47,"faune":7,"moons":[{"name":"Omianmir","radius":21,"orbitRadius":143,"orbitSpeed":0.2847,"angle":13.078,"flore":63,"faune":58},{"name":"Lyrarxis","radius":54,"orbitRadius":300,"orbitSpeed":0.2434,"angle":9.851,"flore":28,"faune":2},{"name":"Vorosth","radius":20,"orbitRadius":300,"orbitSpeed":0.2434,"angle":15.335,"flore":56,"faune":16}]},{"name":"Synadon","radius":117,"orbitRadius":1247,"orbitSpeed":0.0382,"angle":0.248,"flore":72,"faune":33,"moons":[{"name":"Lyrenzar","radius":39,"orbitRadius":282,"orbitSpeed":0.3016,"angle":16.546,"flore":1,"faune":32},{"name":"Draoton","radius":35,"orbitRadius":197,"orbitSpeed":0.1893,"angle":12.367,"flore":4,"faune":49}]},{"name":"Velaxmir","radius":106,"orbitRadius":1247,"orbitSpeed":0.0382,"angle":4.82,"flore":95,"faune":86,"moons":[{"name":"Aurospha","radius":33,"orbitRadius":194,"orbitSpeed":0.1963,"angle":9.975,"flore":50,"faune":23},{"name":"Synenmus","radius":30,"orbitRadius":540,"orbitSpeed":0.3188,"angle":16.563,"flore":59,"faune":0},{"name":"Pyxaltis","radius":30,"orbitRadius":444,"orbitSpeed":0.3369,"angle":16.257,"flore":25,"faune":2}]}]},{"name":"Eriaxbus","radius":203,"orbitRadius":4194,"orbitSpeed":0.0088,"angle":-1.195,"color":"#FF6B6B","planets":[{"name":"Paloslux","radius":80,"orbitRadius":507,"orbitSpeed":0.0675,"angle":2.987,"flore":100,"faune":14,"moons":[]},{"name":"Celosbus","radius":80,"orbitRadius":507,"orbitSpeed":0.0675,"angle":5.311,"flore":100,"faune":53,"moons":[{"name":"Erienton","radius":24,"orbitRadius":126,"orbitSpeed":0.2757,"angle":10.982,"flore":36,"faune":26},{"name":"Palarth","radius":37,"orbitRadius":126,"orbitSpeed":0.2757,"angle":6.289,"flore":36,"faune":57},{"name":"Ithenxis","radius":34,"orbitRadius":126,"orbitSpeed":0.2757,"angle":8.218,"flore":92,"faune":14}]},{"name":"Celapha","radius":109,"orbitRadius":507,"orbitSpeed":0.0675,"angle":1.697,"flore":48,"faune":84,"moons":[]},{"name":"Celaxra","radius":100,"orbitRadius":833,"orbitSpeed":0.0444,"angle":0.367,"flore":4,"faune":20,"moons":[{"name":"Eriislux","radius":52,"orbitRadius":199,"orbitSpeed":0.2822,"angle":11.577,"flore":83,"faune":25}]}]}],"asteroidBelts":[]},
        // Round 3 — Celanlux-Velarbus
        {"name":"Celanlux-Velarbus","blackHole":{"x":0,"y":0,"radius":300},"suns":[{"name":"Aurirmus","radius":200,"orbitRadius":1746,"orbitSpeed":0.0123,"angle":2.734,"color":"#FF6B6B","planets":[{"name":"Ithenxis","radius":123,"orbitRadius":499,"orbitSpeed":0.0552,"angle":3.583,"flore":100,"faune":49,"moons":[{"name":"Palalbus","radius":34,"orbitRadius":183,"orbitSpeed":0.1574,"angle":10.942,"flore":100,"faune":22},{"name":"Palirmus","radius":22,"orbitRadius":236,"orbitSpeed":0.1659,"angle":13.385,"flore":100,"faune":59},{"name":"Zetora","radius":36,"orbitRadius":236,"orbitSpeed":0.1659,"angle":14.502,"flore":0,"faune":44}]},{"name":"Zetamus","radius":119,"orbitRadius":990,"orbitSpeed":0.0468,"angle":7.091,"flore":100,"faune":8,"moons":[{"name":"Corosnis","radius":42,"orbitRadius":201,"orbitSpeed":0.2057,"angle":16.742,"flore":100,"faune":4},{"name":"Omiaxlux","radius":45,"orbitRadius":348,"orbitSpeed":0.3185,"angle":26.077,"flore":100,"faune":6},{"name":"Erievyn","radius":26,"orbitRadius":348,"orbitSpeed":0.3185,"angle":24.535,"flore":100,"faune":19}]}]},{"name":"Corarpha","radius":226,"orbitRadius":1746,"orbitSpeed":0.0123,"angle":0.919,"color":"#FF6B6B","planets":[{"name":"Ithonis","radius":96,"orbitRadius":779,"orbitSpeed":0.0353,"angle":0.012,"flore":90,"faune":27,"moons":[{"name":"Xorirvyn","radius":33,"orbitRadius":220,"orbitSpeed":0.3448,"angle":15.784,"flore":64,"faune":59},{"name":"Omienth","radius":31,"orbitRadius":307,"orbitSpeed":0.1724,"angle":6.025,"flore":90,"faune":52},{"name":"Thalaxth","radius":56,"orbitRadius":220,"orbitSpeed":0.3448,"angle":13.988,"flore":90,"faune":13}]},{"name":"Zetelmir","radius":88,"orbitRadius":490,"orbitSpeed":0.0623,"angle":5.102,"flore":86,"faune":41,"moons":[{"name":"Sigallux","radius":48,"orbitRadius":165,"orbitSpeed":0.2948,"angle":12.172,"flore":90,"faune":55},{"name":"Thalelth","radius":23,"orbitRadius":165,"orbitSpeed":0.2948,"angle":10.902,"flore":2,"faune":35}]},{"name":"Synenria","radius":99,"orbitRadius":490,"orbitSpeed":0.0623,"angle":2.904,"flore":90,"faune":15,"moons":[{"name":"Thalimus","radius":40,"orbitRadius":171,"orbitSpeed":0.3413,"angle":16.552,"flore":90,"faune":40}]}]},{"name":"Vorummus","radius":170,"orbitRadius":1746,"orbitSpeed":0.0123,"angle":-1.412,"color":"#FFE44D","planets":[{"name":"Zetummus","radius":90,"orbitRadius":481,"orbitSpeed":0.0539,"angle":6.487,"flore":6,"faune":100,"moons":[{"name":"Ithura","radius":36,"orbitRadius":137,"orbitSpeed":0.3485,"angle":41.249,"flore":95,"faune":21},{"name":"Paluton","radius":46,"orbitRadius":137,"orbitSpeed":0.3485,"angle":36.998,"flore":65,"faune":17}]},{"name":"Eriamus","radius":127,"orbitRadius":784,"orbitSpeed":0.0391,"angle":3.553,"flore":50,"faune":17,"moons":[{"name":"Synonra","radius":39,"orbitRadius":268,"orbitSpeed":0.2806,"angle":28.351,"flore":2,"faune":17},{"name":"Zanarpha","radius":56,"orbitRadius":268,"orbitSpeed":0.2806,"angle":29.664,"flore":79,"faune":3},{"name":"Coralth","radius":52,"orbitRadius":268,"orbitSpeed":0.2806,"angle":30.967,"flore":84,"faune":33},{"name":"Lyrivyn","radius":44,"orbitRadius":197,"orbitSpeed":0.1644,"angle":14.492,"flore":9,"faune":58}]},{"name":"Celozar","radius":80,"orbitRadius":784,"orbitSpeed":0.0391,"angle":1.809,"flore":95,"faune":79,"moons":[{"name":"Kryalxis","radius":40,"orbitRadius":182,"orbitSpeed":0.2104,"angle":23.319,"flore":6,"faune":51},{"name":"Ithanth","radius":56,"orbitRadius":182,"orbitSpeed":0.2104,"angle":24.553,"flore":48,"faune":1},{"name":"Zetanxis","radius":26,"orbitRadius":278,"orbitSpeed":0.3188,"angle":31.356,"flore":30,"faune":35}]},{"name":"Celaxra","radius":78,"orbitRadius":784,"orbitSpeed":0.0391,"angle":6.642,"flore":95,"faune":38,"moons":[{"name":"Draosth","radius":47,"orbitRadius":155,"orbitSpeed":0.1985,"angle":20.495,"flore":3,"faune":28},{"name":"Lyrisdon","radius":20,"orbitRadius":236,"orbitSpeed":0.3013,"angle":33.971,"flore":34,"faune":39}]}]}],"asteroidBelts":[]},
        // Round 4 — Draarlux-Xorirnis (demi-finales)
        {"name":"Draarlux-Xorirnis","blackHole":{"x":0,"y":0,"radius":300},"suns":[{"name":"Eriilux","radius":191,"orbitRadius":1376,"orbitSpeed":0.0129,"angle":0.515,"color":"#7CB9FF","planets":[{"name":"Nebandis","radius":100,"orbitRadius":564,"orbitSpeed":0.046,"angle":9.407,"flore":100,"faune":97,"moons":[{"name":"Synirlux","radius":22,"orbitRadius":164,"orbitSpeed":0.2491,"angle":49.015,"flore":29,"faune":26},{"name":"Drauth","radius":38,"orbitRadius":232,"orbitSpeed":0.3222,"angle":61.877,"flore":30,"faune":46},{"name":"Thalirria","radius":33,"orbitRadius":232,"orbitSpeed":0.3222,"angle":60.864,"flore":96,"faune":27},{"name":"Siginis","radius":50,"orbitRadius":164,"orbitSpeed":0.2491,"angle":46.452,"flore":83,"faune":21},{"name":"Aurubus","radius":37,"orbitRadius":164,"orbitSpeed":0.2491,"angle":44.267,"flore":87,"faune":16},{"name":"Zetenpha","radius":47,"orbitRadius":232,"orbitSpeed":0.3222,"angle":51.573,"flore":83,"faune":27}]}]},{"name":"Zetosmus","radius":234,"orbitRadius":2923,"orbitSpeed":0.0115,"angle":4.068,"color":"#7CB9FF","planets":[{"name":"Zetenth","radius":112,"orbitRadius":452,"orbitSpeed":0.0628,"angle":8.245,"flore":4,"faune":56,"moons":[{"name":"Kryardon","radius":24,"orbitRadius":179,"orbitSpeed":0.2235,"angle":36.145,"flore":46,"faune":36}]},{"name":"Nebuvyn","radius":100,"orbitRadius":869,"orbitSpeed":0.0403,"angle":3.853,"flore":40,"faune":82,"moons":[{"name":"Corirdis","radius":48,"orbitRadius":244,"orbitSpeed":0.1701,"angle":23.566,"flore":32,"faune":21},{"name":"Corarra","radius":35,"orbitRadius":244,"orbitSpeed":0.1701,"angle":27.141,"flore":46,"faune":8}]},{"name":"Omionlux","radius":89,"orbitRadius":869,"orbitSpeed":0.0403,"angle":9.116,"flore":44,"faune":54,"moons":[{"name":"Paluton","radius":42,"orbitRadius":178,"orbitSpeed":0.2052,"angle":27.782,"flore":29,"faune":15},{"name":"Aurendon","radius":24,"orbitRadius":178,"orbitSpeed":0.2052,"angle":31.744,"flore":44,"faune":60}]},{"name":"Ithonis","radius":120,"orbitRadius":869,"orbitSpeed":0.0403,"angle":6.876,"flore":4,"faune":51,"moons":[{"name":"Celibus","radius":32,"orbitRadius":167,"orbitSpeed":0.207,"angle":30.125,"flore":88,"faune":10},{"name":"Coridon","radius":60,"orbitRadius":263,"orbitSpeed":0.2904,"angle":41.164,"flore":34,"faune":18},{"name":"Celanvyn","radius":54,"orbitRadius":263,"orbitSpeed":0.2904,"angle":46.049,"flore":100,"faune":60}]}]},{"name":"Draevyn","radius":162,"orbitRadius":1376,"orbitSpeed":0.0129,"angle":2.034,"color":"#7CB9FF","planets":[{"name":"Xoruria","radius":98,"orbitRadius":448,"orbitSpeed":0.0654,"angle":13.249,"flore":84,"faune":6,"moons":[{"name":"Xorardis","radius":36,"orbitRadius":152,"orbitSpeed":0.1709,"angle":34.624,"flore":38,"faune":39},{"name":"Zanubus","radius":50,"orbitRadius":152,"orbitSpeed":0.1709,"angle":32.856,"flore":40,"faune":7}]},{"name":"Eriannis","radius":120,"orbitRadius":448,"orbitSpeed":0.0654,"angle":11.747,"flore":75,"faune":23,"moons":[{"name":"Draelbus","radius":33,"orbitRadius":255,"orbitSpeed":0.1637,"angle":32.821,"flore":38,"faune":34},{"name":"Draomir","radius":50,"orbitRadius":255,"orbitSpeed":0.1637,"angle":34.273,"flore":24,"faune":31}]},{"name":"Erienlux","radius":81,"orbitRadius":777,"orbitSpeed":0.0357,"angle":4.573,"flore":36,"faune":99,"moons":[{"name":"Ithovyn","radius":44,"orbitRadius":168,"orbitSpeed":0.2232,"angle":41.955,"flore":24,"faune":11},{"name":"Synonvyn","radius":39,"orbitRadius":365,"orbitSpeed":0.3138,"angle":65.433,"flore":8,"faune":16},{"name":"Neboxis","radius":23,"orbitRadius":365,"orbitSpeed":0.3138,"angle":60.069,"flore":22,"faune":11},{"name":"Eriaxth","radius":27,"orbitRadius":168,"orbitSpeed":0.2232,"angle":46.741,"flore":50,"faune":29}]},{"name":"Zanumton","radius":86,"orbitRadius":777,"orbitSpeed":0.0357,"angle":8.795,"flore":22,"faune":32,"moons":[{"name":"Aururia","radius":24,"orbitRadius":136,"orbitSpeed":0.2076,"angle":41.33,"flore":22,"faune":31},{"name":"Itholux","radius":38,"orbitRadius":207,"orbitSpeed":0.3457,"angle":75.522,"flore":22,"faune":6}]}]},{"name":"Celanra","radius":238,"orbitRadius":2923,"orbitSpeed":0.0115,"angle":-0.384,"color":"#FFB830","planets":[{"name":"Aureria","radius":104,"orbitRadius":477,"orbitSpeed":0.0646,"angle":6.688,"flore":76,"faune":47,"moons":[{"name":"Zetarnis","radius":21,"orbitRadius":225,"orbitSpeed":0.2149,"angle":20.864,"flore":42,"faune":25},{"name":"Celumxis","radius":34,"orbitRadius":225,"orbitSpeed":0.2149,"angle":24.402,"flore":4,"faune":28},{"name":"Celanra","radius":31,"orbitRadius":164,"orbitSpeed":0.1546,"angle":15.833,"flore":8,"faune":56}]},{"name":"Velosmus","radius":97,"orbitRadius":477,"orbitSpeed":0.0646,"angle":4.866,"flore":100,"faune":66,"moons":[{"name":"Vorospha","radius":25,"orbitRadius":163,"orbitSpeed":0.151,"angle":16.189,"flore":75,"faune":8},{"name":"Sigelth","radius":47,"orbitRadius":163,"orbitSpeed":0.151,"angle":18.958,"flore":96,"faune":38}]},{"name":"Eriumzar","radius":74,"orbitRadius":477,"orbitSpeed":0.0646,"angle":9.052,"flore":100,"faune":64,"moons":[]}]},{"name":"Kryennis","radius":164,"orbitRadius":1376,"orbitSpeed":0.0129,"angle":-1.493,"color":"#FF8C42","planets":[{"name":"Thaliston","radius":75,"orbitRadius":342,"orbitSpeed":0.0704,"angle":2.955,"flore":65,"faune":12,"moons":[]}]}],"asteroidBelts":[]},
        // Round 5 (finale) — Pyxaxmir-Omielpha
        {"name":"Pyxaxmir-Omielpha","blackHole":{"x":0,"y":0,"radius":300},"suns":[{"name":"Thalozar","radius":218,"orbitRadius":1098,"orbitSpeed":0.0188,"angle":0.708,"color":"#FF8C42","planets":[{"name":"Ithanria","radius":123,"orbitRadius":423,"orbitSpeed":0.0505,"angle":6.97,"flore":86,"faune":20,"moons":[{"name":"Kryelux","radius":21,"orbitRadius":192,"orbitSpeed":0.2611,"angle":43.835,"flore":46,"faune":42},{"name":"Draath","radius":41,"orbitRadius":192,"orbitSpeed":0.2611,"angle":41.159,"flore":7,"faune":30}]},{"name":"Kryuth","radius":72,"orbitRadius":806,"orbitSpeed":0.0337,"angle":3.992,"flore":86,"faune":5,"moons":[{"name":"Velospha","radius":35,"orbitRadius":152,"orbitSpeed":0.2118,"angle":32.065,"flore":86,"faune":22},{"name":"Eriumdon","radius":27,"orbitRadius":152,"orbitSpeed":0.2118,"angle":37.109,"flore":56,"faune":7}]},{"name":"Omianra","radius":88,"orbitRadius":806,"orbitSpeed":0.0337,"angle":8.517,"flore":86,"faune":91,"moons":[{"name":"Xorolux","radius":55,"orbitRadius":180,"orbitSpeed":0.2893,"angle":44.945,"flore":64,"faune":5}]}]},{"name":"Lyrodon","radius":180,"orbitRadius":1098,"orbitSpeed":0.0188,"angle":2.216,"color":"#FF6B6B","planets":[{"name":"Vorenmir","radius":107,"orbitRadius":462,"orbitSpeed":0.0435,"angle":7.333,"flore":100,"faune":87,"moons":[{"name":"Kryalra","radius":24,"orbitRadius":210,"orbitSpeed":0.3343,"angle":57.832,"flore":100,"faune":42},{"name":"Lyrara","radius":48,"orbitRadius":210,"orbitSpeed":0.3343,"angle":62.154,"flore":1,"faune":52}]},{"name":"Thalevyn","radius":117,"orbitRadius":462,"orbitSpeed":0.0435,"angle":5.799,"flore":100,"faune":37,"moons":[{"name":"Nebuzar","radius":23,"orbitRadius":191,"orbitSpeed":0.2098,"angle":34.368,"flore":100,"faune":15},{"name":"Xorarmus","radius":42,"orbitRadius":191,"orbitSpeed":0.2098,"angle":35.527,"flore":100,"faune":48},{"name":"Celonvyn","radius":32,"orbitRadius":247,"orbitSpeed":0.2224,"angle":41.068,"flore":1,"faune":19}]}]},{"name":"Thalosbus","radius":153,"orbitRadius":1098,"orbitSpeed":0.0188,"angle":3.746,"color":"#FF8C42","planets":[{"name":"Siganpha","radius":89,"orbitRadius":466,"orbitSpeed":0.056,"angle":7.86,"flore":59,"faune":1,"moons":[{"name":"Ithantis","radius":37,"orbitRadius":178,"orbitSpeed":0.1946,"angle":26.966,"flore":96,"faune":50},{"name":"Synarlux","radius":38,"orbitRadius":268,"orbitSpeed":0.2924,"angle":40.536,"flore":59,"faune":37},{"name":"Erieltis","radius":42,"orbitRadius":178,"orbitSpeed":0.1946,"angle":30.86,"flore":100,"faune":17},{"name":"Lyruvyn","radius":46,"orbitRadius":268,"orbitSpeed":0.2924,"angle":44.398,"flore":100,"faune":45},{"name":"Pyxirxis","radius":51,"orbitRadius":268,"orbitSpeed":0.2924,"angle":42.591,"flore":87,"faune":24}]}]},{"name":"Thalaton","radius":206,"orbitRadius":1098,"orbitSpeed":0.0188,"angle":5.281,"color":"#FF6B6B","planets":[{"name":"Zetanzar","radius":129,"orbitRadius":445,"orbitSpeed":0.0489,"angle":7.823,"flore":100,"faune":90,"moons":[{"name":"Eriarmus","radius":26,"orbitRadius":203,"orbitSpeed":0.1787,"angle":26.189,"flore":100,"faune":10},{"name":"Omiosnis","radius":23,"orbitRadius":203,"orbitSpeed":0.1787,"angle":27.443,"flore":100,"faune":36},{"name":"Zetelmus","radius":56,"orbitRadius":203,"orbitSpeed":0.1787,"angle":29.871,"flore":100,"faune":21}]},{"name":"Pyxeton","radius":92,"orbitRadius":445,"orbitSpeed":0.0489,"angle":12.2,"flore":0,"faune":69,"moons":[{"name":"Sigaria","radius":30,"orbitRadius":149,"orbitSpeed":0.3422,"angle":53.795,"flore":100,"faune":16},{"name":"Kryosvyn","radius":38,"orbitRadius":222,"orbitSpeed":0.3289,"angle":50.362,"flore":1,"faune":32}]}]},{"name":"Thalopha","radius":162,"orbitRadius":2908,"orbitSpeed":0.0121,"angle":1.887,"color":"#7CB9FF","planets":[{"name":"Thalirtis","radius":116,"orbitRadius":392,"orbitSpeed":0.0592,"angle":3.462,"flore":100,"faune":49,"moons":[{"name":"Auronria","radius":35,"orbitRadius":198,"orbitSpeed":0.2311,"angle":17.547,"flore":100,"faune":30},{"name":"Coralra","radius":31,"orbitRadius":198,"orbitSpeed":0.2311,"angle":18.788,"flore":4,"faune":34},{"name":"Synumnis","radius":24,"orbitRadius":198,"orbitSpeed":0.2311,"angle":15.266,"flore":46,"faune":0}]},{"name":"Synirton","radius":105,"orbitRadius":722,"orbitSpeed":0.0527,"angle":2.11,"flore":100,"faune":89,"moons":[{"name":"Palisvyn","radius":54,"orbitRadius":310,"orbitSpeed":0.3399,"angle":22.798,"flore":100,"faune":31},{"name":"Palardis","radius":59,"orbitRadius":310,"orbitSpeed":0.3399,"angle":21.919,"flore":83,"faune":29},{"name":"Zetenlux","radius":31,"orbitRadius":197,"orbitSpeed":0.2804,"angle":22.071,"flore":100,"faune":47}]},{"name":"Zanalra","radius":105,"orbitRadius":722,"orbitSpeed":0.0527,"angle":7.069,"flore":75,"faune":33,"moons":[{"name":"Zetenth","radius":27,"orbitRadius":283,"orbitSpeed":0.2982,"angle":18.367,"flore":100,"faune":5}]},{"name":"Nebirria","radius":107,"orbitRadius":722,"orbitSpeed":0.0527,"angle":5.093,"flore":100,"faune":98,"moons":[{"name":"Auroxis","radius":22,"orbitRadius":149,"orbitSpeed":0.2453,"angle":18.198,"flore":100,"faune":19},{"name":"Pyxaxton","radius":32,"orbitRadius":220,"orbitSpeed":0.2599,"angle":24.16,"flore":100,"faune":59}]}]},{"name":"Velisvyn","radius":206,"orbitRadius":2908,"orbitSpeed":0.0121,"angle":-1.357,"color":"#FFE44D","planets":[{"name":"Palenbus","radius":104,"orbitRadius":469,"orbitSpeed":0.0427,"angle":1.275,"flore":100,"faune":9,"moons":[{"name":"Omiaxxis","radius":21,"orbitRadius":182,"orbitSpeed":0.1971,"angle":4.436,"flore":68,"faune":42},{"name":"Kryellux","radius":36,"orbitRadius":182,"orbitSpeed":0.1971,"angle":8.624,"flore":100,"faune":23},{"name":"Nebantis","radius":28,"orbitRadius":229,"orbitSpeed":0.1765,"angle":6.483,"flore":1,"faune":1},{"name":"Ithannis","radius":34,"orbitRadius":182,"orbitSpeed":0.1971,"angle":5.587,"flore":2,"faune":0}]},{"name":"Lyrumton","radius":75,"orbitRadius":469,"orbitSpeed":0.0427,"angle":-0.714,"flore":0,"faune":73,"moons":[{"name":"Synarra","radius":35,"orbitRadius":163,"orbitSpeed":0.1991,"angle":5.601,"flore":100,"faune":33}]},{"name":"Zetupha","radius":70,"orbitRadius":891,"orbitSpeed":0.0481,"angle":-0.832,"flore":100,"faune":54,"moons":[{"name":"Pyxelmus","radius":41,"orbitRadius":138,"orbitSpeed":0.2806,"angle":8.72,"flore":100,"faune":46},{"name":"Coranvyn","radius":45,"orbitRadius":324,"orbitSpeed":0.2278,"angle":11.715,"flore":68,"faune":27},{"name":"Synenpha","radius":29,"orbitRadius":243,"orbitSpeed":0.3261,"angle":13.792,"flore":65,"faune":40},{"name":"Pyxenth","radius":58,"orbitRadius":324,"orbitSpeed":0.2278,"angle":10.01,"flore":100,"faune":31},{"name":"Zanarth","radius":23,"orbitRadius":324,"orbitSpeed":0.2278,"angle":7.679,"flore":100,"faune":43}]},{"name":"Draumnis","radius":76,"orbitRadius":891,"orbitSpeed":0.0481,"angle":3.391,"flore":30,"faune":11,"moons":[{"name":"Velenlux","radius":44,"orbitRadius":155,"orbitSpeed":0.3025,"angle":3.052,"flore":50,"faune":48},{"name":"Sigaldon","radius":22,"orbitRadius":242,"orbitSpeed":0.289,"angle":2.522,"flore":63,"faune":9},{"name":"Ithumdon","radius":37,"orbitRadius":284,"orbitSpeed":0.1727,"angle":-0.244,"flore":2,"faune":40},{"name":"Xoroslux","radius":42,"orbitRadius":284,"orbitSpeed":0.1727,"angle":4.506,"flore":54,"faune":45}]}]}],"asteroidBelts":[]},
    ]
};

let _activeTournamentCycle = 'cycle1';

function getTournamentMap(round) {
    const maps = TOURNAMENT_MAPS[_activeTournamentCycle];
    const idx = Math.min(round - 1, maps.length - 1);
    return maps[idx]; // null = pas encore de map définie pour ce round
}

function generateTournamentUniverse(mapData, mySlot, opponent) {
    // Cloner la map pour ne pas la modifier
    const universe = JSON.parse(JSON.stringify(mapData));
    // Reconstruire allBodies
    universe.planets = [];
    universe.moons = [];
    universe.allBodies = [];
    for (const sun of universe.suns) {
        for (const planet of sun.planets) {
            planet.type = 'planet';
            planet.owner = null;
            planet.spores = 0;
            planet.maxSpores = Math.floor(planet.radius * 8);
            planet.baseMaxSpores = planet.maxSpores;
            planet.symbiosis = 0; planet.symOwnerTime = 0;
            planet.buildMode = 'off';
            planet.nids = 0; planet.biomes = 0; planet.alveoles = 0;
            planet.parent = sun;
            universe.planets.push(planet);
            universe.allBodies.push(planet);
            for (const moon of planet.moons) {
                moon.type = 'moon';
                moon.owner = null;
                moon.spores = 0;
                moon.maxSpores = Math.floor(moon.radius * 6);
                moon.baseMaxSpores = moon.maxSpores;
                moon.symbiosis = 0; moon.symOwnerTime = 0;
                moon.buildMode = 'off';
                moon.nids = 0; moon.biomes = 0; moon.alveoles = 0;
                moon.parent = planet;
                universe.moons.push(moon);
                universe.allBodies.push(moon);
            }
        }
    }
    universe.players = [
        { id: 0, name: mySlot === 0 ? currentProfile.pseudo : opponent.pseudo, color: mySlot === 0 ? currentProfile.avatar_color : opponent.color, isHuman: true, alive: true, stats: { growth:0, velocity:0, density:0, sensitivity:0 }, bodies: [], multiSacrifice: 0, multiTier: 0, multiProgress: 0, totalSpores: 0, tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] } },
        { id: 1, name: mySlot === 1 ? currentProfile.pseudo : opponent.pseudo, color: mySlot === 1 ? currentProfile.avatar_color : opponent.color, isHuman: true, alive: true, stats: { growth:0, velocity:0, density:0, sensitivity:0 }, bodies: [], multiSacrifice: 0, multiTier: 0, multiProgress: 0, totalSpores: 0, tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] } },
    ];
    universe.jetRatio = 0.5;
    universe.universeRadius = 6000;
    universe.config = { difficulty: 'normal' };
    universe.multiSeed = Math.floor(Math.random() * 999999);
    return universe;
}

function _renderBracket(matches) {
    const grid = document.getElementById('bracketGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const me = currentProfile?.pseudo || null;

    for (const match of matches) {
        const p1 = match.p1 || null;
        const p2 = match.p2 || null;
        const iAm1 = me && p1 && p1.pseudo === me;
        const iAm2 = me && p2 && p2.pseudo === me;
        const isMyMatch = iAm1 || iAm2;
        const isDone = match.status === 'done';

        const div = document.createElement('div');
        div.style.cssText = `
            background:${isMyMatch ? 'rgba(255,215,0,0.07)' : 'rgba(5,8,25,0.8)'};
            border:${isMyMatch ? '2px solid rgba(255,215,0,0.7)' : '1px solid rgba(255,215,0,0.15)'};
            border-radius:8px; padding:10px 12px; position:relative;
            opacity:${isDone ? '0.6' : '1'};`;

        const badge = isMyMatch
            ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#FFD700;color:#0F172A;font-family:'Orbitron',sans-serif;font-size:8px;font-weight:bold;padding:2px 8px;border-radius:10px;letter-spacing:1px;">VOTRE MATCH</div>`
            : '';

        const styleP = (p, isMe) => {
            if (!p) return `<div style="padding:4px 0;font-family:'Exo 2',sans-serif;font-size:11px;color:#334155;">○ En attente...</div>`;
            const isWinner = isDone && match.winner === p.pseudo;
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;">
                <span style="width:8px;height:8px;border-radius:50%;background:${p.color || '#94A3B8'};display:inline-block;flex-shrink:0;"></span>
                <span style="font-family:'Exo 2',sans-serif;font-size:${isMe ? '13px' : '12px'};color:${isWinner ? '#4ADE80' : isMe ? '#FFD700' : '#E0E7FF'};font-weight:${isMe || isWinner ? 'bold' : 'normal'};">${_fEsc(p.pseudo)}</span>
                ${isWinner ? '<span style="font-size:9px;color:#4ADE80;">✓</span>' : ''}
                ${isMe && !isDone ? '<span style="font-size:9px;color:rgba(255,215,0,0.6);margin-left:2px;">(vous)</span>' : ''}
               </div>`;
        };

        div.innerHTML = `
            ${badge}
            <div style="font-family:'Orbitron',sans-serif;font-size:8px;color:rgba(255,215,0,0.35);letter-spacing:1px;margin-bottom:6px;">${match.matchId.toUpperCase()}</div>
            ${styleP(p1, iAm1)}
            <div style="font-family:'Exo 2',sans-serif;font-size:9px;color:rgba(200,210,230,0.25);text-align:center;margin:1px 0;">— vs —</div>
            ${styleP(p2, iAm2)}`;

        grid.appendChild(div);
    }
}

function _tournamentRegister() {
    if (!currentProfile) return;
    connectSocket();
    _socket.emit('tournament_register');

    _socket.off('tournament_update');
    _socket.on('tournament_update', (state) => {
        _tournamentData = state;
        _refreshTournamentUI();
    });

    _socket.off('tournament_finished');
    _socket.on('tournament_finished', ({ champion }) => {
        const statusEl = document.getElementById('tournamentStatus');
        if (statusEl) statusEl.textContent = '🏆 Champion : ' + champion + ' !';
    });

    // Countdown avant lancement des matchs
    _socket.off('tournament_starting');
    _socket.on('tournament_starting', ({ countdown }) => {
        const statusEl = document.getElementById('tournamentStatus');
        let t = countdown;
        if (statusEl) statusEl.textContent = `🚀 Tournoi complet ! Lancement dans ${t}s...`;
        const iv = setInterval(() => {
            t--;
            if (statusEl) statusEl.textContent = `🚀 Lancement dans ${t}s...`;
            if (t <= 0) clearInterval(iv);
        }, 1000);
    });

    // Mon match démarre — lancer la partie automatiquement
    _socket.off('tournament_match_start');
    _socket.on('tournament_match_start', ({ roomId, matchId, round, opponent, slot }) => {
        const statusEl = document.getElementById('tournamentStatus');
        if (statusEl) statusEl.textContent = `⚔️ Tour ${round} — vs ${opponent.pseudo} !`;
        // Stocker le contexte tournoi
        gameState._tournamentMatchId = matchId;
        gameState._tournamentRoomId = roomId;
        // Lancer comme un match multi normal
        setTimeout(() => {
            fadeTransition(() => {
                gameState.isMulti = true;
                gameState.isTournament = true;
                gameState.localSlot = slot;
                _startTournamentMatch(roomId, slot, opponent);
            });
        }, 1500);
    });

    _socket.emit('tournament_state');
}

function _startTournamentMatch(roomId, slot, opponent) {
    // Générer la map selon le round
    const round = gameState._tournamentRound || 1;
    const mapData = getTournamentMap(round);
    if (!mapData) { alert(`Pas de carte définie pour le round ${round} !`); return; }
    const universe = generateTournamentUniverse(mapData, slot, opponent);
    // Rejoindre la room socket
    _socket.emit('player_action', { type: 'spawn_done', slot });
    if (slot === 0) {
        _socket.emit('game_start', { roomId, universe });
    }
    setPhase('game');
}

function _refreshTournamentUI() {
    if (!_tournamentData) return;
    const { players, bracket, round, status } = _tournamentData;
    const count = (players || []).length;
    const countEl = document.getElementById('tournamentPlayerCount');
    const statusEl = document.getElementById('tournamentStatus');

    if (countEl) countEl.textContent = count + ' / 32';

    if (statusEl && status === 'open') {
        statusEl.textContent = count + ' joueur(s) inscrit(s) — en attente de ' + (32 - count) + ' de plus';
    } else if (statusEl && status === 'playing') {
        statusEl.textContent = `⚔️ Tour ${round} en cours`;
    } else if (statusEl && status === 'finished') {
        statusEl.textContent = `🏆 Tournoi terminé !`;
    }

    // Bracket réel si tournoi lancé, sinon liste d'attente
    if (status === 'open' || !bracket || bracket.length === 0) {
        // Phase d'inscription : afficher les slots d'attente
        const waitingMatches = [];
        for (let i = 0; i < 16; i++) {
            waitingMatches.push({
                matchId: `match-${i+1}`,
                round: 1,
                p1: players[i * 2] || null,
                p2: players[i * 2 + 1] || null,
                winner: null,
                status: 'pending'
            });
        }
        _renderBracket(waitingMatches);
    } else {
        // Tournoi lancé : afficher le round courant
        gameState._tournamentRound = round;
        const currentMatches = bracket.filter(m => m.round === round);
        _renderBracket(currentMatches);
    }
}

initAuth();

