// ─────────────────────────────────────────────
// JETS DE SPORES — Physique
// ─────────────────────────────────────────────
/* gravite, facultatif : part de la gravite subie (1 par defaut). La boule
   chargee au Shift n'en subit qu'un quart. */
function computeTrajectory(startX, startY, dirX, dirY, speed, steps, gravite) {
    const bh = gameState.blackHole;
    const gFacteur = (gravite === undefined) ? 1 : gravite;
    const points = [];
    let x = startX, y = startY;
    let vx = dirX * speed, vy = dirY * speed;
    const dt = 0.4;

    for (let i = 0; i < steps; i++) {
        // Gravité du trou noir (très légère)
        const dx = bh.x - x;
        const dy = bh.y - y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < bh.dangerZone * 0.4) break;

        // Gravité du trou noir : 1/dist pour courbes visibles
        const gRange = bh.gravityRange || 1500;
        if (dist < gRange) {
            const G = bh.gravityStrength || 500;
            // Falloff progressif vers le bord de portée
            const edgeFade = 1 - Math.pow(dist / gRange, 2);
            const gravity = G / (dist + 50) * edgeFade;
            const factor = gravity * dt * gFacteur;
            vx += (dx / dist) * factor;
            vy += (dy / dist) * factor;
        }

        // Gravité des soleils (légère déviation)
        for (const sun of gameState.suns) {
            const sdx = sun.x - x;
            const sdy = sun.y - y;
            const sdist = Math.sqrt(sdx*sdx + sdy*sdy);
            const sRange = sun.radius * 8;
            if (sdist < sRange && sdist > sun.radius + 5) {
                const sG = sun.radius * 2;
                const sEdgeFade = 1 - Math.pow(sdist / sRange, 2);
                const sGravity = sG / (sdist + 30) * sEdgeFade;
                vx += (sdx / sdist) * sGravity * dt * gFacteur;
                vy += (sdy / sdist) * sGravity * dt * gFacteur;
            }
        }

        

        x += vx * dt;
        y += vy * dt;
        points.push({ x, y });
    }
    return points;
}

/* LA PART ENVOYEE A CHAQUE TIR, propre a chaque joueur. Celle du joueur
   humain arrive par l'ordre 'part' (curseur, touches A / E). Les IA gardent
   50 % : jusqu'ici elles lisaient le curseur de l'ecran - monter le sien
   faisait tirer l'IA plus gros, et en lockstep chaque ecran aurait eu une
   IA differente. */
function partEnvoi(slot) {
    const j = gameState.players[slot];
    return (j && j.jetRatio != null) ? j.jetRatio : 0.5;
}

/* Le tireur n'est pas forcement le proprietaire de l'astre : on peut lancer
   depuis la tete de pont qu'on tient sur la planete de quelqu'un d'autre. La
   reserve puisee est alors celle de ce pied-a-terre, pas celle du defenseur. */
/* opts, facultatif : { nombre } pour tirer un nombre FIXE de spores au lieu
   du pourcentage d'envoi (la rafale tire par paquets de 10), { muet } pour
   ne pas jouer le son de lancer (la rafale ne le joue qu'un coup sur trois). */
function launchJet(source, dirX, dirY, sporeType, slot, opts) {
    const _nb = opts && opts.nombre > 0 ? Math.floor(opts.nombre) : 0;
    const tireur = (slot === undefined || slot === null) ? source.owner : slot;
    const player = gameState.players[tireur];
    if (!player) return;
    const chezSoi = (source.owner === tireur);
    if (!chezSoi && !(source.lutte && zonesDe(source, tireur).length)) return;

    sporeType = sporeType || 'normal';
    let sporeCount;
    if (sporeType === 'parasite') {
        if (!chezSoi) return;
        if ((source.parasiteSpore || 0) < 1) return;
        source.parasiteSpore = 0;
        sporeCount = 1;
    } else if (source.lutte) {
        /* Sur un astre partage, un tir part d'une ZONE et de sa reserve a
           elle. Une zone de moins de dix cases n'a pas de quoi organiser un
           depart : elle ne peut plus attaquer, elle ne fait que fondre. */
        const zt = zoneDeTir(source, tireur);
        if (!zt) return;
        if (zt.z.n < ZONE_MIN) { if (tireur === localSlot()) secouerEcran(8); return; }
        sporeCount = _nb ? (zt.z.spores >= _nb ? _nb : 0) : Math.floor(zt.z.spores * partEnvoi(tireur));
        if (sporeCount < 5) return;
        zt.z.spores -= sporeCount;
        zonesAgreger(source, source.lutte);
    } else {
        sporeCount = _nb ? (source.spores >= _nb ? _nb : 0) : Math.floor(source.spores * partEnvoi(tireur));
        if (sporeCount < 5) return;
        source.spores -= sporeCount;
    }

    /* opts.vitesse ralentit (ou accelere) le jet ; opts.pas allonge sa
       trajectoire d'autant, pour garder la meme portee. */
    const speed = (20 + player.stats.velocity * 6) * (opts && opts.vitesse > 0 ? opts.vitesse : 1);
    const traj = computeTrajectory(source.x, source.y, dirX, dirY, speed, (opts && opts.pas) || 200);

    // Générer des particules scintillantes autour du jet
    const sparkles = [];
    for (let i = 0; i < 12; i++) {
        sparkles.push({
            offX: 0, offY: 0,
            angle: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.8,
            radius: 1 + Math.random() * 2,
            phase: Math.random() * Math.PI * 2
        });
    }

    gameState.gameStats.jetsLaunched++;
    if (!(opts && opts.muet)) playLaunchSound();
    const jetColor = sporeType === 'attaque' ? '#EF4444' : sporeType === 'defense' ? '#38BDF8' : sporeType === 'parasite' ? '#22C55E' : player.color;
    gameState.jets.push({
        owner: tireur,
        color: jetColor,
        spores: sporeCount,
        sporeType: sporeType,
        trajectory: traj,
        posIndex: 0,
        x: source.x,
        y: source.y,
        speed: speed,
        alive: true,
        trail: [],
        sparkles: sparkles,
        age: 0,
        selected: false,
        source: source,
        sourceName: source.name,
        demolisseur: (opts && opts.demol) || false
    });
}

/* ─────────────────────────────────────────────
   CE QUE LE VOYAGE COUTE (OU RAPPORTE) A UN TIR. Chaque gain ou perte en vol
   saute en chiffre la ou il se produit : +N en vert, -N en rouge. Les
   petites pertes continues (une etoile trop proche) sont cumulees et
   affichees une fois par seconde, les coups francs (amas noir, vaisseau)
   tout de suite.
   ───────────────────────────────────────────── */
function popSpores(x, y, n) {
    if (!n) return;
    gameState.conquestEffects.push({
        x: x, y: y, baseX: x,
        text: (n > 0 ? '+' : '') + n,
        color: n > 0 ? '#4ADE80' : '#F87171',
        age: 0, maxAge: 1.4, petit: true
    });
}
function noterVariationJet(jet, delta) {
    jet._popAcc = (jet._popAcc || 0) + delta;
    const t = gameState.time;
    if (jet._popT === undefined) jet._popT = t;
    if (Math.abs(delta) < 3 && t - jet._popT < 1) return;
    const n = Math.round(jet._popAcc);
    if (!n) return;
    const z = gameState.camera.zoom || 1;
    popSpores(jet.x, jet.y - 14 / z, n);
    jet._popAcc -= n;
    jet._popT = t;
}

/* LES ETOILES BRULENT LES TIRS QUI LES FROLENT. Un tir qui passe pres d'une
   etoile perd 1 spore par seconde, tres pres 5 par seconde. Distances en
   rayons de l'etoile, depuis son centre (le contact detruit toujours). */
const BRULURE_PRES = 2.2, BRULURE_TRES_PRES = 1.5;
const BRULURE_LENTE = 1, BRULURE_FORTE = 5;
function brulureEtoile(jet, suns) {
    let taux = 0;
    for (const s of suns) {
        const dx = jet.x - s.x, dy = jet.y - s.y;
        const d2 = dx * dx + dy * dy;
        const r = s.radius;
        if (d2 < r * r * BRULURE_TRES_PRES * BRULURE_TRES_PRES) { taux = BRULURE_FORTE; break; }
        if (d2 < r * r * BRULURE_PRES * BRULURE_PRES) taux = Math.max(taux, BRULURE_LENTE);
    }
    return taux;
}

/* LA FRONDE DU TROU NOIR. Un tir qui frole le trou noir en ressort plus
   rapide - et le garde. Le gain depend de la distance la plus courte
   atteinte : rien a FRONDE_PORTEE fois la zone de danger, jusqu'a +80 % au
   ras de la zone qui detruit. Le trajet ne change pas, le tir le parcourt
   plus vite. Au plus pres, des que le tir recommence a s'eloigner, le gain
   saute en chiffre bleu. */
const FRONDE_PORTEE = 2.5, FRONDE_MAX = 0.8;
function frondeTrouNoir(jet, bh, d) {
    if (jet._surface || !bh) return;
    const portee = bh.dangerZone * FRONDE_PORTEE, mini = bh.dangerZone * 0.4;
    if (d < portee) {
        if (jet._vBase === undefined) jet._vBase = jet.speed;
        const f = 1 + FRONDE_MAX * Math.min(1, (portee - d) / (portee - mini));
        if (f > (jet._fronde || 1)) { jet._fronde = f; jet.speed = jet._vBase * f; }
        if (jet._dMin === undefined || d < jet._dMin) { jet._dMin = d; return; }
        if (d < jet._dMin + 5) return;          /* pas encore vraiment reparti */
        const pct = Math.round(((jet._fronde || 1) - 1) * 100);
        if (!jet._frondeVue && pct >= 5) {
            jet._frondeVue = true;
            const z = gameState.camera.zoom || 1;
            gameState.conquestEffects.push({ x: jet.x, y: jet.y - 14 / z, baseX: jet.x,
                text: '\u26A1 +' + pct + ' % vitesse', color: '#93C5FD', age: 0, maxAge: 1.6, petit: true });
        }
    }
}

function updateJets(dt) {
    const bh = gameState.blackHole;
    const jets = gameState.jets;

    for (let i = jets.length - 1; i >= 0; i--) {
        const jet = jets[i];
        if (!jet.alive) { jets.splice(i, 1); continue; }

        jet.age += dt;

        // Jets renvoyés : guidage vers la cible
        if (jet._targetBody) {
            const tb = jet._targetBody;
            const tdx = tb.x - jet.x;
            const tdy = tb.y - jet.y;
            const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
            jet.trail.push({ x: jet.x, y: jet.y, t: jet.age });
            if (jet.trail.length > 30) jet.trail.shift();
            if (tDist < tb.radius + 8) {
                // Arrivé sur la cible
                jet.x = tb.x;
                jet.y = tb.y;
            } else {
                const moveSpeed = jet.speed * 0.70 * dt;
                jet.x += (tdx / tDist) * moveSpeed;
                jet.y += (tdy / tDist) * moveSpeed;
            }
        } else {
        // Avancer le long de la trajectoire
        jet.posIndex += jet.speed * dt * 0.70;
        const idx = Math.floor(jet.posIndex);

        if (idx >= jet.trajectory.length - 1) {
            /* Un tir de surface est arrive au bout de sa cloche : il se pose. */
            if (jet._surface) {
                const fin = jet.trajectory[jet.trajectory.length - 1];
                const fx = jet._surface.x + fin.x, fy = jet._surface.y + fin.y;
                spawnImpact(fx, fy, jet.color);
                debarquerSurface(jet._surface, jet.owner, jet.spores, fx, fy);
            }
            jet.alive = false;
            continue;
        }

        const pt = jet.trajectory[idx];

        // Traîne : stocker les positions passées
        jet.trail.push({ x: jet.x, y: jet.y, t: jet.age });
        if (jet.trail.length > 30) jet.trail.shift();

        if (jet._surface) {
            /* Trajectoire gardee dans le repere de l'astre : il orbite
               pendant le vol, un trace en coordonnees du monde se
               decrocherait de lui. */
            jet.x = jet._surface.x + pt.x;
            jet.y = jet._surface.y + pt.y;
        } else {
            jet.x = pt.x;
            jet.y = pt.y;
        }
        }

        // Animer les particules scintillantes
        for (const sp of jet.sparkles) {
            sp.angle += sp.speed * dt * 3;
            sp.offX = Math.cos(sp.angle) * (5 + Math.sin(jet.age * 4 + sp.phase) * 3);
            sp.offY = Math.sin(sp.angle) * (5 + Math.cos(jet.age * 4 + sp.phase) * 3);
        }

        // ── Tête chercheuse ──
        const _hp = gameState.players[jet.owner];
        const _hl = _hp?.tech?.homing || 0;
        if (_hl > 0 && !jet._targetBody) {
            const hRange = 80 + _hl * 30;
            const hForce = 0.02 + _hl * 0.01;
            let hBest = null, hDist = hRange;
            for (const b of gameState.allBodies) {
                if (b.owner === jet.owner || b === jet.source) continue;
                const hdx = b.x-jet.x, hdy = b.y-jet.y;
                const hd = Math.sqrt(hdx*hdx+hdy*hdy);
                if (hd < hDist) { hDist = hd; hBest = b; }
            }
            if (hBest) {
                const i2 = Math.floor(jet.posIndex);
                for (let ti=i2; ti<jet.trajectory.length; ti++) {
                    const tp = jet.trajectory[ti];
                    const tx=hBest.x-tp.x, ty=hBest.y-tp.y, td=Math.sqrt(tx*tx+ty*ty);
                    if (td>1) { const f=Math.max(0,1-(ti-i2)/60); tp.x+=tx/td*hForce*f*jet.speed*0.3; tp.y+=ty/td*hForce*f*jet.speed*0.3; }
                }
            }
        }

        /* Brulure des etoiles. En multijoueur c'est le serveur qui retire
           les spores : les instantanes les font sauter a l'ecran. */
        if (!jet._serverDriven && !jet._surface && jet.owner !== -1) {
            const taux = brulureEtoile(jet, gameState.suns);
            if (taux) {
                jet._brule = (jet._brule || 0) + taux * dt;
                const k = Math.floor(jet._brule);
                if (k > 0) {
                    jet._brule -= k;
                    jet.spores -= k;
                    noterVariationJet(jet, -k);
                    if (jet.spores <= 0) { spawnImpact(jet.x, jet.y, '#FFB347'); jet.alive = false; continue; }
                }
            }
        }

        /* Une sphere capitale sur le chemin : le tir s'y perd (et compte
           pour sa capture). */
        if (!jet._serverDriven && !jet._surface && tirContreCapitaux(jet)) continue;

        // Traversée amas de météorites
        if (!jet._hitBelt) jet._hitBelt = {};
        /* Un amas qui passe devant ou derriere l'astre de depart ne touche
           pas le tir tant qu'il en sort : on n'examine les amas qu'une fois
           le tir degage de sa planete. */
        const _srcB = jet.source;
        const _pres = _srcB && Math.hypot(jet.x - _srcB.x, jet.y - _srcB.y) < _srcB.radius * 1.6 + 40;
        for (let bi = 0; !_pres && bi < gameState.asteroidBelts.length; bi++) {
            if (jet._hitBelt[bi]) continue;
            const belt = gameState.asteroidBelts[bi];
            const sun = belt.sun;
            // Vérifier proximité réelle avec un amas (pas juste l'anneau)
            let closestType = null;
            let closestDist = Infinity;
            for (const rock of belt.rocks) {
                const ra = rock.angle;
                const rr = belt.radius + rock.radiusOff;
                const rcx = sun.x + Math.cos(ra) * rr;
                const rcy = sun.y + Math.sin(ra) * rr;
                const rd = (jet.x - rcx) * (jet.x - rcx) + (jet.y - rcy) * (jet.y - rcy);
                if (rd < closestDist) { closestDist = rd; closestType = rock.type; }
            }
            // Seulement si le jet est à moins de 40px d'un amas réel
            if (closestDist > 1600) continue; // 40 * 40
            jet._hitBelt[bi] = true;
            /* La boule traverse les amas rouges et noirs sans broncher. */
            if (jet.boule && (closestType === 'red' || closestType === 'dark')) continue;
            if (closestType === 'dark') {
                // Noir : divise les spores (Ténacité réduit la perte)
                const _tl1 = gameState.players[jet.owner]?.tech?.tenacity || 0;
                const _dk = 0.5 + _tl1 * 0.05;
                /* En multijoueur, le serveur fait la perte ; l'instantane
                   la fera sauter en chiffre. */
                if (!jet._serverDriven) {
                    const _av = jet.spores;
                    jet.spores = Math.max(1, Math.floor(jet.spores * _dk));
                    noterVariationJet(jet, jet.spores - _av);
                }
                spawnImpact(jet.x, jet.y, '#555555');
            } else if (closestType === 'red') {
                // Rouge : dévie le jet de 5° à 15°
                const devAngle = (5 + gameRandom() * 10) * Math.PI / 180;
                const sign = gameRandom() < 0.5 ? 1 : -1;
                const cosA = Math.cos(devAngle * sign);
                const sinA = Math.sin(devAngle * sign);
                for (let ti = Math.floor(jet.posIndex); ti < jet.trajectory.length; ti++) {
                    const p = jet.trajectory[ti];
                    const relX = p.x - jet.x;
                    const relY = p.y - jet.y;
                    p.x = jet.x + relX * cosA - relY * sinA;
                    p.y = jet.y + relX * sinA + relY * cosA;
                }
                spawnImpact(jet.x, jet.y, '#FF4444');
            } else if (closestType === 'green') {
                // Vert : éclate en 5 mini-jets (Ténacité améliore conservation + direction)
                const _tl2 = gameState.players[jet.owner]?.tech?.tenacity || 0;
                const _kr = (1/5) + _tl2 * (4/5) / 10;
                const sporesEach = Math.max(1, Math.floor(jet.spores * _kr));
                for (let si = 0; si < 5; si++) {
                    let sDirX, sDirY;
                    if (_tl2 > 0) {
                        const _ts = gameState.suns[si % gameState.suns.length];
                        const _tp = _ts.planets[Math.floor(gameRandom()*_ts.planets.length)] || _ts;
                        const _tx=_tp.x-jet.x, _ty=_tp.y-jet.y, _td=Math.sqrt(_tx*_tx+_ty*_ty);
                        const _sc = (1-_tl2*0.08)*Math.PI*0.5;
                        const _sa = Math.atan2(_ty,_tx)+(gameRandom()-0.5)*_sc;
                        sDirX = Math.cos(_sa); sDirY = Math.sin(_sa);
                    } else { const sAngle=gameRandom()*Math.PI*2; sDirX=Math.cos(sAngle); sDirY=Math.sin(sAngle); }
                    const speed = jet.speed * (0.6 + gameRandom() * 0.4);
                    const traj = computeTrajectory(jet.x, jet.y, sDirX, sDirY, speed, 200);
                    gameState.jets.push({
                        owner: jet.owner,
                        color: jet.color,
                        spores: sporesEach,
                        trajectory: traj,
                        posIndex: 0,
                        x: jet.x,
                        y: jet.y,
                        speed: speed,
                        alive: true,
                        trail: [],
                        sparkles: [],
                        age: 0,
                        selected: false,
                        source: jet.source,
                        sourceName: jet.sourceName,
                        _hitBelt: Object.assign({}, jet._hitBelt)
                    });
                }
                spawnImpact(jet.x, jet.y, '#44FF44');
                jet.alive = false;
                break;
            }
        }

        // Destruction par trou noir
        const bhDx = bh.x - jet.x;
        const bhDy = bh.y - jet.y;
        if (Math.sqrt(bhDx*bhDx + bhDy*bhDy) < bh.dangerZone * 0.4) {
            spawnImpact(jet.x, jet.y, '#9933FF');
            jet.alive = false;
            continue;
        }
        frondeTrouNoir(jet, bh, Math.sqrt(bhDx*bhDx + bhDy*bhDy));

        // Collision avec astres
        checkJetCollision(jet);
    }

    checkJetNeutralization();
}

function checkJetCollision(jet) {
    /* Un tir de surface ne connait que l'astre d'ou il part : il decolle du
       sol, monte en cloche et y retombe. Rien d'autre ne le concerne - ni les
       soleils, ni les autres astres qu'il survolerait. */
    if (jet._surface) return;   /* il se pose au bout de sa cloche, pas par choc */

    // Destruction par les soleils
    for (const sun of gameState.suns) {
        const dx = sun.x - jet.x;
        const dy = sun.y - jet.y;
        const _sr = sun.radius + 5;
        if (dx*dx + dy*dy < _sr*_sr) {
            spawnImpact(jet.x, jet.y, sun.color || '#FFE44D');
            jet.alive = false;
            return;
        }
    }

    const bodies = gameState.allBodies;
    for (const body of bodies) {
        /* L'astre de depart laisse partir son tir : pendant une demi-seconde,
           ET tant que le tir n'est pas nettement degage de lui (la marge des
           amas, plus bas). Le demi-seconde seul ne suffisait pas au
           demolisseur, a 60 % de la vitesse d'un jet : au bout de 0,5 s il
           survolait encore sa planete, ou elle le rattrapait sur son orbite,
           et il "explosait" sans jamais atteindre sa cible. On reconnait
           l'astre a l'objet lui-meme quand on l'a : deux astres pouvaient
           porter le meme nom (voir nomsUniques). */
        const estSource = jet.source ? body === jet.source : (jet.sourceName && body.name === jet.sourceName);
        if (estSource && (jet.age < 0.5 || !jet.sorti)) {
            const sx = body.x - jet.x, sy = body.y - jet.y, sr = body.radius * 1.6 + 40;
            if (sx * sx + sy * sy > sr * sr) jet.sorti = true;
            continue;
        }
        /* La boule part de l'atmosphere, la ou passent les lunes : pendant sa
           premiere seconde, elle traverse sa planete et les lunes de celle-ci
           au lieu de s'ecraser dans l'une d'elles. */
        if (jet.boule && jet.age < 1 && jet._groupe && jet._groupe.indexOf(body.name) >= 0) continue;
        const dx = body.x - jet.x;
        const dy = body.y - jet.y;
        const _br = body.radius + 8;

        if (dx*dx + dy*dy < _br*_br) {
            spawnImpact(jet.x, jet.y, jet.color);
            /* Toucher l'astre d'un autre joueur, c'est l'attaquer : ses commerces avec nous cessent. */
            if (jet.owner >= 0 && body.owner !== null && body.owner !== undefined && body.owner >= 0 && body.owner !== jet.owner) noterAttaque(jet.owner, body.owner);
            if (jet.boule) impactBoule(jet, body);
            /* Le demolisseur casse avant que ses spores n'attaquent : ce
               qu'il vise, c'est ce qui se trouve la a son arrivee. */
            if (jet.demolisseur) {
                const _moi = localSlot();
                if (jet.owner === _moi || body.owner === _moi) secouerEcran(5);
                if (!gameState.isMulti) demolirEdifice(body, jet.owner, jet.demolisseur);
            }
            // Jets renvoyés par vaisseau noir : ciblent une planète spécifique
            if (jet.owner === -1) {
                if (body === jet._targetBody || !jet._targetBody) {
                    const oldOwner = body.owner;
                    body.spores -= jet.spores;
                    if (body.spores < 0) {
                        body.spores = Math.abs(body.spores);
                        body.owner = null;
                        body.lutte = null;
                        marquerTerritoiresSales();
                        body.symOwnerTime = 0;
                        body.symbiosis = 0;
                        if (oldOwner !== null) {
                            const p = gameState.players[oldOwner];
                            if (p) p.bodies = p.bodies.filter(b => b !== body);
                        }
                        gameState.conquestEffects.push({
                            x: body.x, y: body.y - 15, baseX: body.x,
                            text: 'CHASSÉ !', color: '#888888', age: 0, maxAge: 2
                        });
                        const bT = body.type === 'planet' ? 'Planète' : 'Lune';
                        const chColor = oldOwner !== null ? (gameState.players[oldOwner]?.color || '#888') : '#888';
                        if (oldOwner === localSlot()) {
                            addEvent('mine', '↩', `${bT} ${body.name} chassé par vaisseau !`, body, chColor);
                            ajouterAlerte('perte', body, chColor);
                            eclatBord(body, '#FF3B55');
                            secouerEcran(9);
                        }
                        else addEvent('war', '↩', `${bT} ${body.name} chassé (${gameState.players[oldOwner]?.name || 'IA-'+oldOwner})`, body, chColor);
                    }
                    jet.alive = false;
                    return;
                }
                continue;
            }
            if (body.owner === jet.owner) {
                // Density bonus : +5% spores livrées par point
                const densityBonus = 1 + (gameState.players[jet.owner]?.stats.density || 0) * 0.05;
                ajouterSpores(body, jet.spores * densityBonus);
                playFusionSound();
            } else {
                const _ml = gameState.players[jet.owner]?.tech?.mimicry || 0;
                const oldOwner = body.owner;
                /* Un eclat ne se scinde pas a son tour. Il part du centre de la
                   planete : quand la pesanteur le ramenait dessus, il se
                   scindait encore - 2 eclats, puis 4, 8... jusqu'a des milliers
                   de tirs et le jeu fige (vu par le banc lockstep). */
                if (_ml > 0 && !jet.eclat && body.type === 'planet' && body.moons && body.moons.length > 0) {
                    const _skip = _ml >= 10;
                    if (!_skip) { applyConquest(body, jet); if (body.owner !== oldOwner) playConquestSound(); }
                    const _mr = 0.2 + _ml * 0.08;
                    const _mc = Math.min(body.moons.length, Math.max(1, Math.ceil(body.moons.length * _ml / 10)));
                    const _ms = Math.max(1, Math.floor(jet.spores * _mr));
                    for (let mi=0; mi<_mc; mi++) {
                        const mn = body.moons[mi]; if (mn.owner === jet.owner) continue;
                        const mdx=mn.x-body.x, mdy=mn.y-body.y, mdd=Math.sqrt(mdx*mdx+mdy*mdy);
                        if (mdd<1) continue;
                        const mSpd=jet.speed*0.8, mTr=computeTrajectory(body.x,body.y,mdx/mdd,mdy/mdd,mSpd,200);
                        gameState.jets.push({ owner:jet.owner, color:jet.color, spores:_ms, trajectory:mTr, posIndex:0, x:body.x, y:body.y, speed:mSpd, alive:true, trail:[], sparkles:[], age:0, selected:false, source:body, sourceName:body.name, eclat:true, _hitBelt:{} });
                    }
                } else {
                    applyConquest(body, jet);
                    if (body.owner !== oldOwner) playConquestSound();
                }
            }
            jet.alive = false;
            return;
        }
    }
}


