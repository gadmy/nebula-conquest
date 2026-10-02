// ─────────────────────────────────────────────
// SPAWN — Sélection de planète de départ
// ─────────────────────────────────────────────
let _spawnTarget = null;

function handleSpawnClick(worldX, worldY) {
    let closest = null;
    let closestDist = Infinity;
    for (const b of [...gameState.planets, ...gameState.moons]) {
        if (b.owner !== null) continue;
        const dx = b.x - worldX;
        const dy = b.y - worldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < Math.max(b.radius + 14, 20) && dist < closestDist) {
            closest = b;
            closestDist = dist;
        }
    }
    if (!closest) return;

    const slot = localSlot();
    const human = gameState.players.find(p => p.id === slot) || gameState.players[slot];
    if (!human) return;
    if (departActif()) {
        /* Nouveau depart : pendant le decompte, un astre que personne
           d'autre n'a reserve ; on peut changer d'avis. */
        const D = gameState.depart;
        if (!D || D.etape !== 'planete') return;
        const qui = reservePar(closest.name);
        if (qui >= 0 && qui !== slot) { toastCommerce(closest.name + ' est déjà réservée par ' + gameState.players[qui].name, '#FCA5A5'); return; }
        const bt = document.getElementById('spawnPopupBtn');
        if (bt) bt.textContent = D.reserv[slot] === closest.name ? '✓ DÉJÀ CHOISIE' : D.reserv[slot] ? '✦ CHANGER POUR CELLE-CI ✦' : '✦ CHOISIR ✦';
    } else if (human.spawnPlanet) return;

    // Centrer la caméra sur la planète
    gameState.camera.x = closest.x;
    gameState.camera.y = closest.y;
    gameState.camera.zoom = Math.max(gameState.camera.zoom, 1.2);

    // Afficher la popup d'info
    _spawnTarget = closest;
    const popup = document.getElementById('spawnPopup');
    popup.style.display = 'block';
    document.getElementById('spawnPopupName').textContent = closest.name;
    document.getElementById('spawnPopupFlore').textContent = closest.flore;
    document.getElementById('spawnPopupFaune').textContent = closest.faune;
    document.getElementById('spawnPopupRadius').textContent = Math.floor(closest.radius);
    document.getElementById('spawnPopupMax').textContent = closest.maxSpores;

    // Image preview
    const previewEl = document.getElementById('spawnPopupPreview');
    previewEl.innerHTML = '';
    if (closest._texture) {
        const cvs = document.createElement('canvas');
        cvs.width = 64; cvs.height = 64;
        cvs.getContext('2d').drawImage(closest._texture, 0, 0, 64, 64);
        cvs.style.borderRadius = '50%';
        previewEl.appendChild(cvs);
    }
}

function confirmSpawn() {
    if (!_spawnTarget) return;
    const slot = localSlot();
    const human = gameState.players.find(p => p.id === slot) || gameState.players[slot];
    if (!human || human.spawnPlanet) return;
    if (_spawnTarget.owner !== null) { _spawnTarget = null; document.getElementById('spawnPopup').style.display = 'none'; return; }
    if (departActif()) {
        /* Nouveau depart : une reservation, modifiable jusqu'a la fin du decompte. */
        donnerOrdre('reserver', { astre: _spawnTarget.name });
        document.getElementById('spawnPopup').style.display = 'none';
        _spawnTarget = null;
        return;
    }

if (gameState.isMulti) {
        // En multi : le serveur applique le spawn, on attend le snapshot
        sendAction('spawn', { bodyName: _spawnTarget.name, fromSlot: mySlot });
        sendAction('spawn_done', { slot: mySlot });
        addEvent('mine', '🌍', `Vous colonisez ${_spawnTarget.name} !`, _spawnTarget, human.color);
        document.getElementById('spawnPopup').style.display = 'none';
        _spawnTarget = null;
        setPhase('game');
        return;
    }

    /* En solo, la colonisation est un ordre : elle se fait au tour suivant. */
    donnerOrdre('colonie', { astre: _spawnTarget.name });
    document.getElementById('spawnPopup').style.display = 'none';
    _spawnTarget = null;
}

/* L'ordre 'colonie' : le joueur prend son astre de depart, puis les IA
   prennent les leurs et la partie commence. */
function coloniser(slot, astre) {
    const human = gameState.players[slot];
    if (!human || human.spawnPlanet || !astre || astre.owner !== null) return;
    astre.owner = slot;
    astre.spores = astre.maxSpores * 0.5;
    marquerTerritoiresSales();
    human.bodies = [astre];
    human.spawnPlanet = astre;
    if (slot === localSlot()) addEvent('mine', '🌍', `Vous colonisez ${astre.name} !`, astre, human.color);
    if (!gameState._spawnFlashes) gameState._spawnFlashes = [];
    gameState._spawnFlashes.push({ body: astre, age: 0, maxAge: 2.5, color: human.color });
    /* En lockstep, la partie ne commence que quand TOUS les humains ont leur
       astre (ancien depart, garde pour le tutoriel). */
    if (gameState.lockstep) {
        if (slot !== localSlot()) addEvent('war', '🌍', `${human.name} colonise ${astre.name} !`, astre, human.color);
        return;
    }
    autoSpawnAIs();
    setPhase('game');
}

function autoSpawnAIs() {
    const available = [...gameState.planets, ...gameState.moons].filter(b => b.owner === null);
    for (let i = 1; i < gameState.players.length; i++) {
        if (available.length === 0) break;
        if ((gameState.isMulti || gameState.lockstep) && gameState.players[i].isHuman) continue;
        // Choisir un astre éloigné des autres joueurs
        let bestPlanet = null;
        let bestScore = -1;
        for (const p of available) {
            let minDist = Infinity;
            for (const other of gameState.players) {
                if (other.id >= i || !other.spawnPlanet) continue;
                const dx = p.x - other.spawnPlanet.x;
                const dy = p.y - other.spawnPlanet.y;
                minDist = Math.min(minDist, Math.sqrt(dx*dx + dy*dy));
            }
            const score = minDist + p.flore * 2;
            if (score > bestScore) {
                bestScore = score;
                bestPlanet = p;
            }
        }
        if (bestPlanet) {
            bestPlanet.owner = i;
            bestPlanet.spores = bestPlanet.maxSpores * 0.5;
            gameState.players[i].bodies = [bestPlanet];
            gameState.players[i].spawnPlanet = bestPlanet;
            gameState.players[i]._spawnAnnounced = true;
            available.splice(available.indexOf(bestPlanet), 1);
            const _p = gameState.players[i];
            addEvent('war', '🌍', `${_p.name} colonise ${bestPlanet.name} !`, bestPlanet, _p.color);
            if (!gameState._spawnFlashes) gameState._spawnFlashes = [];
            gameState._spawnFlashes.push({ body: bestPlanet, age: 0, maxAge: 2.5, color: _p.color });
            if (!gameState._spawnArrows) gameState._spawnArrows = [];
            gameState._spawnArrows.push({ body: bestPlanet, age: 0, maxAge: 4, color: _p.color });
        }
    }
}


