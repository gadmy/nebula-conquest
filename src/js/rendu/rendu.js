// ─────────────────────────────────────────────
// RENDER (dessin)
// ─────────────────────────────────────────────
function render() {
    const ctx = gameState.ctx;
    majUiDepart();
    majHD();
    const cam = gameState.camera;
    const w = gameState.width;
    const h = gameState.height;

    // ── Effacer ──
    if (gameState._fondCss) {
        /* Les couches de fond sont derriere le canevas : on l'efface pour
           qu'elles se voient, au lieu de repeindre un aplat par-dessus. La
           couleur du ciel passe sur la page, sous tout le monde. */
        ctx.clearRect(0, 0, w, h);
        majFondCss();
        majHalosCss();
        if (document.body.style.backgroundColor === '') {
            document.body.style.backgroundColor = SKY_CFG._hex || '#16264E';
        }
    } else {
        ctx.fillStyle = SKY_CFG._hex || '#16264E';
        ctx.fillRect(0, 0, w, h);
    }

    // ── Appliquer la transformation caméra ──
    ctx.save();
    /* Secousse : un decalage aleatoire qui s'amortit, applique avant la
       camera pour que toute la scene bouge d'un bloc. L'interface, dessinee
       hors de cette transformation, ne bouge pas - ce serait desagreable. */
    if (gameState._secousse > 0) {
        const f = gameState._secousse;
        ctx.translate((Math.random() - 0.5) * f, (Math.random() - 0.5) * f);
    }
    ctx.translate(w / 2, h / 2);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    _chiffresSpores.length = 0;

    // ── Fond spatial ──
    drawBackground(ctx);

    // ── Particules & étoiles filantes (LOD mid+) ──
    if (gameState.lod >= 1) drawCosmicEffects(ctx);

    // ── Frontieres de territoire ──
    // Sous tout le reste : le contour ne doit pas barrer une etoile.
    drawTerritoryBorders(ctx);

    // ── Comètes ──
    drawComets(ctx);

    // ── Trou noir ──
    drawBlackHole(ctx);

    // ── Soleils ──
    drawSuns(ctx);

    // ── Orbites éditeur (F2) ──
    if (gameState.phase === 'editor') {
        ctx.save();
        ctx.lineWidth = Math.max(1.5, 2 / cam.zoom);
        ctx.setLineDash([8 / cam.zoom, 6 / cam.zoom]);
        const bh = gameState.blackHole;
        const drawnSunOrbits = new Set();
        for (const s of gameState.suns) {
            const key = Math.round(s.orbitRadius);
            if (drawnSunOrbits.has(key)) continue;
            drawnSunOrbits.add(key);
            ctx.strokeStyle = 'rgba(255,60,60,0.6)';
            ctx.beginPath();
            ctx.arc(bh.x, bh.y, s.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (const s of gameState.suns) {
            const drawnPO = new Set();
            for (const p of s.planets) {
                const key = Math.round(p.orbitRadius);
                if (drawnPO.has(key)) continue;
                drawnPO.add(key);
                ctx.strokeStyle = 'rgba(255,120,60,0.5)';
                ctx.beginPath();
                ctx.arc(s.x, s.y, p.orbitRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (const p of s.planets) {
                const drawnMO = new Set();
                for (const m of p.moons) {
                    const key = Math.round(m.orbitRadius);
                    if (drawnMO.has(key)) continue;
                    drawnMO.add(key);
                    ctx.strokeStyle = 'rgba(255,180,80,0.4)';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, m.orbitRadius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        for (const belt of gameState.asteroidBelts) {
            ctx.strokeStyle = 'rgba(150,150,150,0.3)';
            ctx.beginPath();
            ctx.arc(belt.sun.x, belt.sun.y, belt.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
    }

    // ── Amas de météorites ──
    drawAsteroidBelts(ctx);

    // ── Planètes & Lunes ──
    drawPlanets(ctx);
    drawLuttes(ctx);
    drawEdifices(ctx);
    if (gameState._hudCounter % 3 === 0) _updateOwnerClusters();
    _drawOwnerClustersCache(ctx);

    // ── Vaisseaux nettoyeurs, vaisseaux capitaux ──
    drawCleaners(ctx);
    drawPannes(ctx);
    drawCapitaux(ctx);
    drawApocalypses(ctx);
    drawCibleTuto(ctx);
    drawCommerce(ctx);
    drawEchoTirs(ctx);
    drawReservations(ctx);

    // ── Jets de spores ──
    drawJets(ctx);
    drawBoules(ctx);
    drawExplosionsBat(ctx);

    // ── Prévisualisation de lancement ──
    // Recalculer la preview à chaque frame (la planète orbite même si la souris ne bouge pas)
    if (gameState.launching && gameState.launchSource && performance.now() - (gameState.launchStartTime||0) > 150) {
        const src = gameState.launchSource;
        const dx = gameState.mouseWorldX - src.x;
        const dy = gameState.mouseWorldY - src.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len > 1) {
            /* La vitesse est celle du TIREUR, pas du proprietaire : depuis une
               tete de pont sur l'astre d'un autre, c'est la sienne qui
               courberait le trait - comme le fait launchJet. */
            const player = gameState.players[localSlot()];
            const speed = 20 + (player ? player.stats.velocity * 6 : 0);
            gameState.launchPreview = computeTrajectory(src.x, src.y, dx/len, dy/len, speed, 120);
        }
    }
    const _bSurf = gameState._demol ? null : astreTirSurface();
    if (_bSurf) {
        /* En surface le trait part du bout de terrain qu'on tient le plus
           proche du curseur, et suit la cloche de la pesanteur de l'astre. */
        const b = _bSurf;
        const ap = apercuTirSurface(b, localSlot(), gameState.mouseWorldX, gameState.mouseWorldY);
        gameState.launchPreview = ap.points;
        gameState._departSurface = ap.depart;
        gameState._fireSurface = true;
    } else if (gameState._firePhase === 'aiming' && gameState._fireSource) {
        gameState._fireSurface = false;
        /* le trait part de l'astre qui tirera, pas de celui qu'on a clique */
        const src = gameState._fireLanceur || gameState._fireSource;
        const dx = gameState.mouseWorldX - src.x;
        const dy = gameState.mouseWorldY - src.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len > 1) {
            /* La vitesse est celle du TIREUR, pas du proprietaire : depuis une
               tete de pont sur l'astre d'un autre, c'est la sienne qui
               courberait le trait - comme le fait launchJet. */
            const player = gameState.players[localSlot()];
            const speed = 20 + (player ? player.stats.velocity * 6 : 0);
            /* Un soleil tire du bord de son anneau, sans sa propre gravite. */
            const dep = departTir(src, dx/len, dy/len);
            const sauf = src.type === 'sun' ? src : null;
            gameState.launchPreview = gameState._demol
                ? computeTrajectory(dep.x, dep.y, dx/len, dy/len, speed * DEMOL_VITESSE, DEMOL_PAS, undefined, sauf)
                : computeTrajectory(dep.x, dep.y, dx/len, dy/len, speed, 200, undefined, sauf);
        }
    }
    drawOndesSolaires(ctx);
    drawFiletsCharge(ctx);
    drawAnneaux(ctx);
    drawOndes(ctx);
    /* Pendant la charge d'une boule, le trait montre SON depart a elle :
       du bord de l'astre, dans l'axe centre -> boule, sa physique a elle. */
    if (gameState._boule) {
        const Bo = gameState._boule;
        let ang = Bo.angle;
        if (gameState.isMulti) {
            const mienne = (gameState._boulesServeur || []).find(b => b.owner === localSlot());
            if (mienne) ang = mienne.a;
        }
        const jo = gameState.players[localSlot()];
        gameState.launchPreview = _trajetBoule(Bo.src, ang, 20 + (jo ? jo.stats.velocity * 6 : 0));
        gameState._fireSurface = false;
    }
    drawLaunchPreview(ctx);

    // ── Impacts (LOD mid+) ──
    if (gameState.lod >= 1) drawImpacts(ctx);

    // ── Effets de conquête ──
    drawConquestEffects(ctx);

    // ── Etincelles des astres pleins ──
    drawEtincelles(ctx);

    // ── Compteurs de spores sur les astres ──
    drawSporeCountOnBodies(ctx);
    drawDebitAstre(ctx);

    ctx.restore();

    // ── Débris premier plan (LOD mid+) ──
    if (gameState.lod >= 1) drawForegroundDebris(ctx);

    // ── Indicateurs hors-écran (hors transformation caméra) ──
    drawOffscreenIndicators();

    // ── Alertes directionnelles ──
    // Par-dessus tout le reste : c'est ce qu'on doit voir en premier.
    drawAlertes();
}


