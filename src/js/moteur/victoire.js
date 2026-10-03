// ─────────────────────────────────────────────
// VICTOIRE / ÉLIMINATION
// ─────────────────────────────────────────────
function checkVictoryAndElimination() {
    if (gameState.phase !== 'game') return;

    const totalBodies = gameState.planets.length + gameState.moons.length;
    let eliminationLocale = false;

    // Timer 1v1 multi : 10 minutes → victoire au plus grand nombre de planètes
    if (gameState.isMulti && gameState.time >= 600) {
        const alivePlayers = gameState.players.filter(p => p.alive);
        if (alivePlayers.length >= 2) {
            const best = alivePlayers.reduce((a, b) => b.bodies.length > a.bodies.length ? b : a);
            const localPlayer = gameState.players[localSlot()];
            const localWins = best === localPlayer;
            showEndScreen(localWins,
                { ...gameState.gameStats, timeElapsed: gameState.time },
                localPlayer,
                totalBodies
            );
            return;
        }
    }

    for (const player of gameState.players) {
        if (!player.alive) continue;

        // Compter les astres
        /* Tenir du terrain sur un astre (debarquement de depart, tete de
           pont) suffit a rester en vie. */
        let ownedCount = player.bodies.length;
        if (!ownedCount) for (const b of gameState.allBodies) if (b.lutte && zonesDe(b, player.id).length) { ownedCount = 1; break; }

        // Vérifier élimination / sursis
        if (ownedCount === 0) {
            const hasJets = gameState.jets.some(j => j.alive && j.owner === player.id);
            if (hasJets) {
                // Sursis : jets encore en vol
                if (!player._inSursis) {
                    player._inSursis = true;
                    addEvent('neutral', '⚠️', player.name + ' est en sursis !', null, player.color);
                }
            } else {
                // Éliminé définitivement
                player.alive = false;
                player._inSursis = false;
                /* En reseau, le tour de l'elimination fait le classement
                   final (identique chez tous : il entre dans l'empreinte). */
                if (gameState.lockstep) player.eliminTour = gameState.tour;
                addEvent('neutral', '💀', player.name + ' est éliminé !', null, player.color);
                if (player.isLocal) {
                    /* En lockstep, on ne s'arrete pas la : les autres joueurs
                       doivent etre verifies au meme tour chez tous. L'elimine
                       devient spectateur apres la boucle. */
                    if (gameState.lockstep) eliminationLocale = true;
                    else { showEndScreen(false); return; }
                }
            }
        } else {
            player._inSursis = false;
        }

        // Vérifier victoire (80% de la masse)
        const teamCount = gameState.config?.teamCount || 0;
        let teamOwnedCount = ownedCount;
        if (teamCount >= 2 && player.team !== undefined) {
            teamOwnedCount = gameState.players
                .filter(p => p.team === player.team)
                .reduce((sum, p) => sum + p.bodies.length, 0);
        }
        const pct = totalBodies > 0 ? teamOwnedCount / totalBodies : 0;
        if (pct >= 0.8) {
            if (gameState.lockstep) { finPartieLockstep(player); return; }
            const localPlayer = gameState.players[localSlot()];
            const localWins = teamCount >= 2
                ? localPlayer?.team === player.team
                : player.isLocal;
            showEndScreen(localWins);
            return;
        }
    }

    if (gameState.lockstep) {
        if (eliminationLocale) passerSpectateurLockstep();
        /* En reseau, le dernier joueur en vie l'emporte aussi : humains et IA
           confondus, decide au meme tour chez tous. */
        const vivants = gameState.players.filter(p => p.alive);
        if (vivants.length === 1) finPartieLockstep(vivants[0]);
    }
}

function showEndScreen(isVictory, statsOverride, humanOverride, totalBodiesOverride) {
    gameState.phase = 'end';

    const title = document.getElementById('endTitle');
    const isTeamMode = (gameState.config?.teamCount || 0) >= 2;
    title.textContent = isVictory ? (isTeamMode ? 'VICTOIRE D\'ÉQUIPE !' : 'VICTOIRE') : 'DÉFAITE';
    title.className = isVictory ? 'victory' : 'defeat';

    const sub = document.getElementById('endSubtitle');
    const human = humanOverride || gameState.players[localSlot()];
    const totalBodies = totalBodiesOverride || (gameState.planets.length + gameState.moons.length);
    const ownedPct = Math.round((human.bodies.length / totalBodies) * 100);
    const isForfeit = isVictory && gameState._endReason === 'disconnect';
    sub.textContent = isForfeit
        ? 'Victoire par forfait !'
        : isVictory
            ? 'Vous contrôlez ' + ownedPct + '% de l\'univers !'
            : (gameState.lockstep && gameState.lockstep.gagnant)
                ? gameState.lockstep.gagnant + ' remporte la partie.'
                : 'Votre empire s\'est effondré...';

    const stats = statsOverride || gameState.gameStats;
    if (!statsOverride) stats.timeElapsed = gameState.time;
    const minutes = Math.floor(stats.timeElapsed / 60);
    const seconds = Math.floor(stats.timeElapsed % 60);

    document.getElementById('endStats').innerHTML = `
        <div class="end-stat-row"><span>Astres possédés</span><span class="end-stat-val">${human.bodies.length} / ${totalBodies}</span></div>
        <div class="end-stat-row"><span>Durée</span><span class="end-stat-val">${minutes}m ${seconds}s</span></div>
    `;

    document.getElementById('endScreen').classList.add('active');
    const btnSpectate = document.getElementById('btnSpectate');
    const btnReplay = document.getElementById('btnReplay');
    if (gameState.isTournament) {
        if (btnReplay) btnReplay.style.display = 'none';
        if (btnSpectate) btnSpectate.style.display = 'none';
        // Bouton retour bracket
        let btnBracket = document.getElementById('btnBackToBracket');
        if (!btnBracket) {
            btnBracket = document.createElement('button');
            btnBracket.id = 'btnBackToBracket';
            btnBracket.className = 'btn-end';
            btnBracket.textContent = isVictory ? '🏆 Voir le bracket' : '📊 Voir le bracket';
            btnBracket.addEventListener('click', () => {
                document.getElementById('endScreen').classList.remove('active');
                gameState.isTournament = false;
                gameState.isMulti = false;
                setPhase('tournament');
                _socket.emit('tournament_state');
            });
            document.getElementById('endScreen').querySelector('.end-buttons')?.appendChild(btnBracket);
        }
        btnBracket.style.display = '';
    } else if (gameState.isMulti || gameState.lockstep) {
        /* En reseau (lockstep aussi) : pas de "rejouer" en solo par-dessus ;
           MENU ramene a l'ecran titre (voir btnEndQuit). */
        if (btnReplay) btnReplay.style.display = 'none';
        if (btnSpectate) btnSpectate.style.display = 'none';
        const btnBracket = document.getElementById('btnBackToBracket');
        if (btnBracket) btnBracket.style.display = 'none';
    } else {
        if (btnReplay) btnReplay.style.display = '';
        if (btnSpectate) btnSpectate.style.display = (!isVictory) ? 'inline-block' : 'none';
    }
    stopAmbiance();
    if (isVictory) playVictorySound();
    else playDefeatSound();

    // Sauvegarder la partie dans Supabase (pas les parties lockstep : c'est
    // le relais qui les enregistre, resultat compare entre joueurs)
    if (!gameState.lockstep) saveGame(isVictory, stats, human, totalBodies);
}

async function saveGame(isVictory, stats, human, totalBodies) {
    if (!currentUser) return;
    try {
        await _supa.from('games').insert({
            player_id: currentUser.id,
            won: isVictory,
            score: human.bodies.length,
            planets_captured: stats.bodiesConquered,
            duration_seconds: Math.floor(stats.timeElapsed),
            players_count: gameState.players.length,
            suns_count: gameState.suns.length
        });
    } catch (e) {
        console.warn('Erreur sauvegarde partie:', e);
    }
}

function enterSpectatorMode() {
    document.getElementById('endScreen').classList.remove('active');
    gameState.phase = 'game';
    gameState.isSpectator = true;
    let band = document.getElementById('spectatorBand');
    if (!band) {
        band = document.createElement('div');
        band.id = 'spectatorBand';
        band.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99;background:rgba(99,102,241,0.25);border:1px solid rgba(99,102,241,0.5);border-radius:20px;padding:4px 18px;font-family:Orbitron,monospace;font-size:10px;color:#A5B4FC;letter-spacing:2px;pointer-events:none;';
        band.textContent = '👁 SPECTATEUR';
        document.body.appendChild(band);
    }
    band.style.display = 'block';
}

document.getElementById('btnSpectate')?.addEventListener('click', enterSpectatorMode);

function hideEndScreen() {
    document.getElementById('endScreen').classList.remove('active');
}


