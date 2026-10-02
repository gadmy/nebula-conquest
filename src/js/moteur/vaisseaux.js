// ─────────────────────────────────────────────
// LANCEMENT
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// VAISSEAUX NETTOYEURS
// ─────────────────────────────────────────────
function updateCleaners(dt) {
    const bh = gameState.blackHole;

    for (const cl of gameState.cleaners) {
        if (cl.mort) continue;                 /* abattu en duel, en attente */
        // Mouvement : naviguer vers une planète cible
        /* En duel, c'est majDuels qui pilote ; contre une sphere, duelsCapitaux. */
        if (!cl._duel && !cl._cap) {
        cl.turnTimer -= dt;
        if (cl.turnTimer <= 0) {
            cl.turnTimer = CLN_CFG.turnInterval + gameRandom() * 5;
            const speed = CLN_CFG.speedMin + gameRandom() * (CLN_CFG.speedMax - CLN_CFG.speedMin);
            // 70% chance de viser une planète, 30% errance locale
            if (gameRandom() < 0.7 && gameState.planets.length > 0) {
                const target = gameState.planets[Math.floor(gameRandom() * gameState.planets.length)];
                cl._target = target;
                const tdx = target.x - cl.x;
                const tdy = target.y - cl.y;
                const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
                if (tDist > 0) {
                    cl.vx = (tdx / tDist) * speed;
                    cl.vy = (tdy / tDist) * speed;
                }
            } else {
                cl._target = null;
                const wanderAngle = Math.atan2(cl.y, cl.x) + (gameRandom() - 0.5) * 1.5;
                cl.vx = Math.cos(wanderAngle) * speed * 0.5;
                cl.vy = Math.sin(wanderAngle) * speed * 0.5;
            }
        }

        // Si on a une cible, ajuster la direction en temps réel (la planète bouge)
        if (cl._target) {
            const tdx = cl._target.x - cl.x;
            const tdy = cl._target.y - cl.y;
            const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (tDist < 80) {
                cl.turnTimer = 0;
            } else if (tDist > 0) {
                const currentSpeed = Math.sqrt(cl.vx * cl.vx + cl.vy * cl.vy);
                cl.vx += (tdx / tDist) * 15 * dt;
                cl.vy += (tdy / tDist) * 15 * dt;
                const newSpeed = Math.sqrt(cl.vx * cl.vx + cl.vy * cl.vy);
                if (newSpeed > currentSpeed * 1.2) {
                    cl.vx = (cl.vx / newSpeed) * currentSpeed;
                    cl.vy = (cl.vy / newSpeed) * currentSpeed;
                }
            }
        }
        }

        /* Le trou noir et les soleils se contournent ; y entrer, c'est la fin. */
        eviterObstacles(cl, dt, 70);
        cl.x += cl.vx * dt;
        cl.y += cl.vy * dt;
        if (dansObstacle(cl.x, cl.y, 0)) {
            cl.pv = 0; cl.mort = true; cl._duel = null; cl._cap = null;
            cl.retour = gameState.time + DUEL_CFG.retourMin + gameRandom() * (DUEL_CFG.retourMax - DUEL_CFG.retourMin);
            exploserVaisseau(cl);
            continue;
        }

        // Garder dans la zone de jeu (orbite du soleil le plus éloigné + marge)
        if (!gameState._maxRangeCache) {
            let maxRange = 500;
            for (const sun of gameState.suns) {
                const lastP = sun.planets[sun.planets.length - 1];
                const total = sun.orbitRadius + (lastP ? lastP.orbitRadius : 0) + 100;
                if (total > maxRange) maxRange = total;
            }
            gameState._maxRangeCache = maxRange;
        }
        const maxRange = gameState._maxRangeCache;
        const distFromCenter = Math.sqrt(cl.x * cl.x + cl.y * cl.y);
        if (distFromCenter > maxRange) {
            cl.vx -= cl.x * 0.02;
            cl.vy -= cl.y * 0.02;
        }

        // Tirer sur les jets à portée
        cl.fireTimer -= dt;
        if (cl.fireTimer <= 0) {
            cl.fireTimer = CLN_CFG.fireRate;
            for (const jet of gameState.jets) {
                if (!jet.alive) continue;
                /* Les vaisseaux rouges et noirs ne peuvent rien contre la boule. */
                if (jet.boule && (cl.type === 'red' || cl.type === 'dark')) continue;
                const dx = jet.x - cl.x;
                const dy = jet.y - cl.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CLN_CFG.detectRange) {
                    playCleanerSound(cl.x, cl.y);

                    if (cl.type === 'red') {
                        // Rouge : attaque classique, réduit les spores
                        const damage = CLN_CFG.dmgMin + gameRandom() * (CLN_CFG.dmgMax - CLN_CFG.dmgMin);
                        const _av = jet.spores;
                        jet.spores -= damage;
                        if (jet.spores <= 0) jet.alive = false;
                        noterVariationJet(jet, -Math.min(_av, Math.floor(damage)));
                    } else if (cl.type === 'green') {
                        // Vert : multiplie les spores par 2 (une seule fois)
                        if (!jet._boosted) {
                            const _av = jet.spores;
                            jet.spores = Math.floor(jet.spores * 2);
                            jet._boosted = true;
                            noterVariationJet(jet, jet.spores - _av);
                        }
                    } else if (cl.type === 'dark') {
                        // Noir : renvoie les spores vers la planète d'origine
                        if (jet.source && jet.source.owner !== null) {
                            const src = jet.source;
                            const returnSpores = jet.spores;
                            // Créer un jet retour hostile (owner = -1, neutre hostile)
                            const rdx = src.x - jet.x;
                            const rdy = src.y - jet.y;
                            const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
                            if (rDist > 0) {
                                const traj = computeTrajectory(jet.x, jet.y, rdx / rDist, rdy / rDist, jet.speed * 1.2, 400);
                                gameState.jets.push({
                                    owner: -1,
                                    color: '#333333',
                                    spores: returnSpores,
                                    trajectory: traj,
                                    posIndex: 0,
                                    x: jet.x, y: jet.y,
                                    speed: jet.speed * 1.2,
                                    alive: true,
                                    trail: [],
                                    sparkles: [],
                                    age: 0,
                                    selected: false,
                                    source: null,
                                    _targetBody: src
                                });
                            }
                            jet.alive = false;
                            gameState.conquestEffects.push({
                                x: jet.x, y: jet.y - 10, baseX: jet.x,
                                text: '↩ RENVOI',
                                color: '#888888', age: 0, maxAge: 1.5
                            });
                        }
                    }
                    break; // un tir par cycle
                }
            }
        }
    }
}

function drawCleaners(ctx) {
    const t = gameState.time;
    const z = gameState.camera.zoom;
    const scale = Math.max(1, 1 / z);

    for (const cl of gameState.cleaners) {
        if (cl.mort) continue;                 /* abattu en duel, en attente */
        if (!aLEcran(cl.x, cl.y, cl.size * scale * 3)) continue;
        // Direction de mouvement
        const moveAngle = Math.atan2(cl.vy, cl.vx);

        ctx.save();
        ctx.translate(cl.x, cl.y);
        ctx.rotate(moveAngle);

        // Couleurs selon type
        const s = cl.size * scale;
        let fillColor, strokeColor, reactorC1, reactorC2, detectColor, accentColor;
        if (cl.type === 'green') {
            fillColor = 'rgba(70, 75, 65, 0.8)';
            strokeColor = 'rgba(100, 110, 90, 0.5)';
            accentColor = 'rgba(80, 220, 80, 0.7)';
            reactorC1 = 'rgba(60, 180, 80, 0.4)';
            reactorC2 = 'rgba(40, 120, 50, 0.15)';
            detectColor = 'rgba(60, 180, 60, 0.06)';
        } else if (cl.type === 'dark') {
            fillColor = 'rgba(55, 55, 65, 0.8)';
            strokeColor = 'rgba(80, 80, 100, 0.5)';
            accentColor = 'rgba(140, 140, 170, 0.7)';
            reactorC1 = 'rgba(90, 90, 130, 0.4)';
            reactorC2 = 'rgba(50, 50, 80, 0.15)';
            detectColor = 'rgba(100, 100, 130, 0.06)';
        } else {
            fillColor = 'rgba(85, 60, 55, 0.8)';
            strokeColor = 'rgba(120, 80, 70, 0.5)';
            accentColor = 'rgba(220, 70, 60, 0.7)';
            reactorC1 = 'rgba(200, 80, 50, 0.4)';
            reactorC2 = 'rgba(150, 40, 30, 0.15)';
            detectColor = 'rgba(200, 60, 50, 0.06)';
        }

        // Corps du vaisseau (détaillé)
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(s * 1.8, 0);           // Nez
        ctx.lineTo(s * 0.6, -s * 0.3);    // Avant haut
        ctx.lineTo(-s * 0.2, -s * 0.9);   // Aile haute
        ctx.lineTo(-s * 0.8, -s * 0.7);   // Arrière aile haute
        ctx.lineTo(-s * 0.6, -s * 0.2);   // Jonction haute
        ctx.lineTo(-s, 0);                 // Arrière centre
        ctx.lineTo(-s * 0.6, s * 0.2);    // Jonction basse
        ctx.lineTo(-s * 0.8, s * 0.7);    // Arrière aile basse
        ctx.lineTo(-s * 0.2, s * 0.9);    // Aile basse
        ctx.lineTo(s * 0.6, s * 0.3);     // Avant bas
        ctx.closePath();
        ctx.fill();

        // Contour lumineux
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1 * scale;
        ctx.stroke();

        // Cockpit (bulle centrale avec touche de couleur)
        ctx.fillStyle = 'rgba(200,220,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(s * 0.5, 0, s * 0.4, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.ellipse(s * 0.5, 0, s * 0.25, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bandes de couleur sur les ailes
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(-s * 0.1, -s * 0.6);
        ctx.lineTo(-s * 0.5, -s * 0.65);
        ctx.moveTo(-s * 0.1, s * 0.6);
        ctx.lineTo(-s * 0.5, s * 0.65);
        ctx.stroke();

        /* Tout ce qui EMET de la lumiere s'ajoute au fond au lieu de se poser
           dessus : une lueur en alpha simple est plus sombre qu'une planete
           eclairee, donc elle disparaissait des qu'un vaisseau passait devant.
           Le ctx.restore() de fin remet le mode normal. */
        ctx.globalCompositeOperation = 'lighter';

        // Lumières d'aile clignotantes
        const blink = Math.sin(t * 5 + cl.angle * 10) > 0.3 ? 1 : 0.2;
        ctx.fillStyle = accentColor.replace(/[\d.]+\)$/, (blink * 0.8) + ')');
        ctx.beginPath();
        ctx.arc(-s * 0.2, -s * 0.7, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-s * 0.2, s * 0.7, s * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Réacteur (lueur arrière avec traînée)
        const gReactor = ctx.createRadialGradient(-s, 0, 0, -s, 0, s * 2);
        gReactor.addColorStop(0, reactorC1);
        gReactor.addColorStop(0.4, reactorC2);
        gReactor.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gReactor;
        ctx.beginPath();
        ctx.arc(-s, 0, s * 2, 0, Math.PI * 2);
        ctx.fill();

        // Traînée de propulsion
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = reactorC1;
        for (let ti = 1; ti <= 3; ti++) {
            const trailS = s * (0.3 / ti);
            ctx.beginPath();
            ctx.arc(-s * (1 + ti * 0.8), 0, trailS, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.restore();

        // Cercle de détection — LOD mid+ (pulsant)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (gameState.lod >= 1) {
            const dPulse = 0.5 + Math.sin(t * 2 + cl.angle) * 0.5;
            ctx.strokeStyle = detectColor;
            ctx.lineWidth = 0.5 + dPulse * 0.5;
            ctx.setLineDash([4 + dPulse * 2, 8 - dPulse * 2]);
            ctx.beginPath();
            ctx.arc(cl.x, cl.y, cl.detectionRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Remplissage subtil
            ctx.fillStyle = detectColor.replace('0.06', '0.02');
            ctx.beginPath();
            ctx.arc(cl.x, cl.y, cl.detectionRange, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pulsation d'alerte — LOD high
        if (gameState.lod >= 2) {
            const pulse = Math.sin(t * 3) * 0.5 + 0.5;
            const pulseColor = cl.type === 'green' ? `rgba(50,255,50,${0.03*pulse})` :
                               cl.type === 'dark' ? `rgba(120,120,150,${0.03*pulse})` :
                               `rgba(255,50,50,${0.03*pulse})`;
            ctx.fillStyle = pulseColor;
            ctx.beginPath();
            ctx.arc(cl.x, cl.y, cl.detectionRange * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        /* En duel, ou blesse : une petite barre de vie au-dessus. */
        if (cl._duel || (cl.pv !== undefined && cl.pv < DUEL_CFG.pv)) {
            const w = s * 2.4, h = Math.max(1.5 / z, s * 0.22);
            const f = Math.max(0, (cl.pv || 0) / DUEL_CFG.pv);
            ctx.fillStyle = 'rgba(8,6,20,0.75)';
            ctx.fillRect(cl.x - w / 2, cl.y - s * 1.9, w, h);
            ctx.fillStyle = f > 0.5 ? '#4ADE80' : f > 0.25 ? '#FACC15' : '#F87171';
            ctx.fillRect(cl.x - w / 2, cl.y - s * 1.9, w * f, h);
        }
    }
    drawDuels(ctx);
}

/* ─────────────────────────────────────────────
   LES DUELS DE VAISSEAUX. Deux vaisseaux de couleurs differentes qui se
   croisent se prennent en chasse : ils tournent l'un autour de l'autre en
   se tirant dessus (lasers a leur couleur). Le perdant explose ; un vaisseau
   de sa couleur reapparait ailleurs quelques instants plus tard. Le
   vainqueur repart avec ce qu'il lui reste de vie, et se repare lentement.
   Solo : simule ici. Multijoueur : le serveur decide, le client montre
   (lasers dessines d'apres les duels de l'instantane, explosion quand un
   vaisseau disparait).
   ───────────────────────────────────────────── */
const DUEL_CFG = { detect: 380, rupture: 950, cadence: 0.45, dmgMin: 7, dmgMax: 15,
                   precision: 0.7, pv: 100, reparation: 2, retourMin: 6, retourMax: 12 };
const DUEL_COULEURS = { red: '#FF5A4A', green: '#5CFF7A', dark: '#B8B8FF' };

function _tirLaser(a, b, touche) {
    if (!gameState._lasers) gameState._lasers = [];
    /* Un tir rate passe a cote de sa cible. */
    const ec = touche ? 0 : 18 + Math.random() * 20;
    const ang = Math.random() * Math.PI * 2;
    gameState._lasers.push({ x1: a.x, y1: a.y, x2: b.x + Math.cos(ang) * ec, y2: b.y + Math.sin(ang) * ec,
                             couleur: DUEL_COULEURS[a.type] || '#FFFFFF', t0: gameState.time, touche: touche,
                             gros: a.rOrbite !== undefined });
}

function exploserVaisseau(cl) {
    const c = DUEL_COULEURS[cl.type] || '#FFFFFF';
    spawnImpact(cl.x, cl.y, c);
    spawnImpact(cl.x, cl.y, '#FFB347');
    spawnImpact(cl.x, cl.y, '#FFFFFF');
    if (!gameState._ondes) gameState._ondes = [];
    gameState._ondes.push({ x: cl.x, y: cl.y, r0: 4, r1: 90, age: 0, maxAge: 0.7, couleur: '255,170,80', ep: 3 });
    gameState._ondes.push({ x: cl.x, y: cl.y, r0: 2, r1: 50, age: 0, maxAge: 0.4, couleur: '255,255,255', ep: 2 });
    if (typeof playCleanerSound === 'function') playCleanerSound(cl.x, cl.y);
}

/* Solo : detection, poursuite, tirs, mort, reapparition. */
function majDuels(dt) {
    const L = gameState.cleaners;
    if (!L || !L.length) return;
    const t = gameState.time;
    for (const cl of L) {
        if (cl.pv === undefined) cl.pv = DUEL_CFG.pv;
        if (cl.mort) {
            if (t >= cl.retour) reapparaitreVaisseau(cl);
            continue;
        }
        if (!cl._duel && !cl._cap && cl.pv < DUEL_CFG.pv) cl.pv = Math.min(DUEL_CFG.pv, cl.pv + DUEL_CFG.reparation * dt);
    }
    /* Qui croise qui. */
    for (let i = 0; i < L.length; i++) {
        const a = L[i];
        if (a.mort || a._duel) continue;
        for (let j = i + 1; j < L.length; j++) {
            const b = L[j];
            if (b.mort || b._duel || b.type === a.type) continue;
            if (Math.hypot(a.x - b.x, a.y - b.y) < DUEL_CFG.detect) {
                a._duel = b; b._duel = a;
                a._tirT = DUEL_CFG.cadence * gameRandom();
                b._tirT = DUEL_CFG.cadence * gameRandom();
                break;
            }
        }
    }
    for (const cl of L) {
        const o = cl._duel;
        if (!o || cl.mort) continue;
        const dx = o.x - cl.x, dy = o.y - cl.y, d = Math.hypot(dx, dy) || 1;
        if (o.mort || d > DUEL_CFG.rupture) { cl._duel = null; if (!o.mort && o._duel === cl) o._duel = null; continue; }
        /* La chasse : on fonce vers l'autre en le contournant, ce qui fait
           tourner les deux vaisseaux l'un autour de l'autre. */
        const ang = Math.atan2(dy, dx) + (d < 160 ? 1.1 : 0.45);
        const v = CLN_CFG.speedMax * 1.15;
        cl.vx += (Math.cos(ang) * v - cl.vx) * Math.min(1, dt * 2.5);
        cl.vy += (Math.sin(ang) * v - cl.vy) * Math.min(1, dt * 2.5);
        cl._tirT -= dt;
        if (cl._tirT <= 0 && d < DUEL_CFG.rupture * 0.6) {
            cl._tirT = DUEL_CFG.cadence * (0.8 + gameRandom() * 0.4);
            const touche = gameRandom() < DUEL_CFG.precision;
            _tirLaser(cl, o, touche);
            if (touche) {
                o.pv -= DUEL_CFG.dmgMin + gameRandom() * (DUEL_CFG.dmgMax - DUEL_CFG.dmgMin);
                if (o.pv <= 0) {
                    o.pv = 0; o.mort = true; o._duel = null; cl._duel = null;
                    o.retour = t + DUEL_CFG.retourMin + gameRandom() * (DUEL_CFG.retourMax - DUEL_CFG.retourMin);
                    exploserVaisseau(o);
                }
            }
        }
    }
}

/* LES OBSTACLES : le trou noir (son disque noir) et les soleils. */
function obstaclesFixes() {
    const bh = gameState.blackHole;
    const L = [{ x: bh.x, y: bh.y, r: bh.radius }];
    for (const s of gameState.suns) L.push({ x: s.x, y: s.y, r: s.radius });
    return L;
}
/* Le point (avec une marge) est-il dans un obstacle ? */
function dansObstacle(x, y, marge) {
    for (const o of obstaclesFixes()) if (Math.hypot(x - o.x, y - o.y) < o.r + marge) return true;
    return false;
}
/* CONTOURNER : un obstacle droit devant pousse le vaisseau sur le cote
   (du cote ou il passe deja), un obstacle trop proche le repousse. La
   vitesse ne change pas, seule la direction tourne. marge : la distance
   de securite au bord. */
function eviterObstacles(m, dt, marge) {
    const v = Math.hypot(m.vx, m.vy);
    if (v < 1) return;
    const ux = m.vx / v, uy = m.vy / v;
    let ax = 0, ay = 0;
    for (const o of obstaclesFixes()) {
        const dx = o.x - m.x, dy = o.y - m.y;
        const d = Math.hypot(dx, dy) || 1;
        const bord = d - o.r;
        const portee = marge * 3 + v * 2;
        if (bord > portee) continue;
        const devant = dx * ux + dy * uy;               /* distance le long de la route */
        const cote = -dx * uy + dy * ux;                /* ecart lateral (signe : quel cote) */
        if (devant > 0 && Math.abs(cote) < o.r + marge) {
            /* Droit dessus : virer du cote ou l'on passe deja. */
            const s = cote >= 0 ? -1 : 1;
            const k = (1 - Math.max(0, bord) / portee) * 3.5;
            ax += -uy * s * k; ay += ux * s * k;
        }
        if (bord < marge) {
            const k = (1 - Math.max(0, bord) / marge) * 4;
            ax -= dx / d * k; ay -= dy / d * k;
        }
    }
    if (!ax && !ay) return;
    m.vx += ax * v * dt * 2;
    m.vy += ay * v * dt * 2;
    const n = Math.hypot(m.vx, m.vy) || 1;
    m.vx = m.vx / n * v; m.vy = m.vy / n * v;
}

/* Le remplacant : meme couleur, ailleurs dans la zone de jeu (jamais dans
   un soleil ni dans le trou noir). */
function reapparaitreVaisseau(cl) {
    let R = 0, a = 0;
    for (let essai = 0; essai < 12; essai++) {
        R = (gameState._maxRangeCache || 3000) * (0.45 + gameRandom() * 0.45);
        a = gameRandom() * Math.PI * 2;
        if (!dansObstacle(Math.cos(a) * R, Math.sin(a) * R, 150)) break;
    }
    cl.x = Math.cos(a) * R; cl.y = Math.sin(a) * R;
    cl.vx = 0; cl.vy = 0; cl.turnTimer = 0; cl._target = null;
    cl.pv = DUEL_CFG.pv; cl.mort = false; cl._duel = null;
    cl._apparu = gameState.time;
    if (!gameState._ondes) gameState._ondes = [];
    gameState._ondes.push({ x: cl.x, y: cl.y, r0: 30, r1: 2, age: 0, maxAge: 0.6,
                            couleur: _rgbDe(DUEL_COULEURS[cl.type] || '#FFFFFF'), ep: 2 });
}

/* Multijoueur : le client ne simule pas les duels, il les montre. Lasers
   tires a la cadence du duel, explosion quand un vaisseau meurt. */
function montrerDuels(dt) {
    const L = gameState.cleaners;
    if (!L) return;
    for (const cl of L) {
        if (cl.mort || !cl._duel || cl._duel.mort) continue;
        cl._tirT = (cl._tirT === undefined ? Math.random() * DUEL_CFG.cadence : cl._tirT) - dt;
        if (cl._tirT <= 0) {
            cl._tirT = DUEL_CFG.cadence * (0.8 + Math.random() * 0.4);
            _tirLaser(cl, cl._duel, Math.random() < DUEL_CFG.precision);
        }
    }
}

function drawDuels(ctx) {
    const L = gameState._lasers;
    if (!L || !L.length) return;
    const t = gameState.time;
    const z = gameState.camera.zoom;
    const op = ctx.globalCompositeOperation, a0 = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = L.length - 1; i >= 0; i--) {
        const l = L[i];
        const age = t - l.t0;
        if (age > 0.18 || age < 0) { L.splice(i, 1); continue; }
        /* Un trait qui file de l'un a l'autre, en 0,1 s, puis s'efface. */
        const f = Math.min(1, age / 0.1);
        const x2 = l.x1 + (l.x2 - l.x1) * f, y2 = l.y1 + (l.y2 - l.y1) * f;
        const x1 = l.x1 + (l.x2 - l.x1) * Math.max(0, f - 0.35), y1 = l.y1 + (l.y2 - l.y1) * Math.max(0, f - 0.35);
        ctx.globalAlpha = 1 - age / 0.18;
        ctx.strokeStyle = l.couleur;
        /* Le canon d'une sphere capitale : un trait bien plus epais. */
        ctx.lineWidth = Math.max(1.2 / z, 2.2) * (l.gros ? 3.5 : 1);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = Math.max(0.5 / z, 0.8);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        if (l.touche && f >= 1 && !l._eclat) { l._eclat = true; spawnImpact(l.x2, l.y2, l.couleur); }
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op;
}


