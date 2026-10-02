// ─────────────────────────────────────────────
// INTELLIGENCE ARTIFICIELLE
// ─────────────────────────────────────────────
function updateAI(dt) {
    /* Mission tutoriel : l'IA dort jusqu'au defi final. */
    if (gameState.isTutorial && !gameState._tutoIA) return;
    const difficulty = gameState.config.difficulty;

    for (const player of gameState.players) {
        if (player.isHuman || !player.alive) continue;
        if (player.bodies.length === 0) continue;

        // IA sacrifice pour multiplicité
        if (player.multiSacrifice === 0 && player.multiTier < 10) {
            player.multiSacrifice = 15 + Math.floor(gameRandom() * 20);
        }
        // IA : achat tech
        /* Pas d'achat quand elle economise pour une sphere : chaque achat
           vidait ses astres. */
        if (player.totalSpores > 2000 && player.capPhase !== 'prepa' && gameRandom() < 0.03) {
            const _br = ['homing','tenacity','mimicry'][Math.floor(gameRandom()*3)];
            /* Seulement avec le surplus au-dessus de sa bande de bon
               rendement : sinon l'achat vide l'astre qui montait vers son pic. */
            if (player.tech[_br] < 10 && iaSurplus(player) >= getTechCost(player, _br)) buyTech(player, _br);
        }

        // IA : batiments (verifie a chaque frame, pas seulement au timer)
        for (const body of player.bodies) {
            if (body.buildMode === 'off' && body.spores > body.maxSpores * zoneBonRendement()[1]) {
                /* Elle batit avec ce qui depasse le haut de la bande de bon
                   rendement (57 % de remplissage). */
                body.buildMode = aiChoixBatiment(player, body);
            }
        }
        /* Rafale et boule en cours : elles se jouent dans la duree. */
        aiArmes(player, dt);
        /* Les spheres capitales : tenter une capture, ou la mener. */
        if (gameState.capitaux && gameState.capitaux.length) {
            if (player.capPhase) iaCampagneCapital(player, dt);
            else iaExamenCapitaux(player);
        }

        player.aiTimer -= dt;
        if (player.aiTimer > 0) continue;

        // Reset timer
        player.aiTimer = player.aiCooldown + gameRandom() * player.aiCooldown * 0.5;

        // Décider d'une action
        if (difficulty === 'easy') aiActionEasy(player);
        else if (difficulty === 'normal') aiActionNormal(player);
        else aiActionBrutal(player);
    }
}

/* ─────────────────────────────────────────────
   L'IA ET LES SPHERES CAPITALES
   Une IA qui voit passer une sphere libre pres de chez elle, avec assez de
   spores a portee, peut tenter de la capturer : elle la bombarde pendant
   30 s au plus, en visant la ou la sphere sera quand le tir arrivera. Si
   elle la prend, elle la jette sur le systeme ou la planete d'un adversaire
   qui fera le plus de degats. Tout passe par le hasard de la partie :
   meme decision chez tous les joueurs en reseau.
   ───────────────────────────────────────────── */
const IA_CAP = {
    examen: 5,                 /* secondes entre deux examens */
    portee: 3200,              /* astres de l'IA assez proches de la sphere pour tirer (un tir porte ~3 500) */
    capacite: 1.3,             /* ses astres doivent pouvoir contenir 130 % de la capture */
    reserve: 1.2,              /* on tire quand ceux a portee en contiennent 120 % (tirs perdus en route) */
    preparation: 300,          /* secondes au plus pour economiser (une grosse IA produit ~70 spores/s) */
    envie: { easy: 0.03, normal: 0.12, hard: 0.25, brutal: 0.3 },
    cadence: 0.6,              /* secondes entre deux salves */
    tirsParSalve: { easy: 1, normal: 2, hard: 3, brutal: 3 },
    visee: { easy: 4, normal: 15, hard: 25, brutal: 30 },  /* essais de chaque cote du tir direct, tous les 0,02 rad */
    repos: 90                  /* apres une tentative, on souffle */
};

/* La vitesse d'une sphere, pour prevoir ou elle sera. */
function vitesseCapital(C) {
    return C.pilote >= 0 ? [C.vx || 0, C.vy || 0] : [C.vitX || 0, C.vitY || 0];
}

/* Le meilleur cap de tir vers une sphere en mouvement : on essaie des
   directions autour du tir direct, on suit la vraie courbe de chaque tir
   (trou noir, soleils) et on garde celle qui passe au plus pres de la
   sphere au bon moment. Rend [dx, dy, ecart] ou null. */
function viserCapital(src, C, player) {
    const speed = 20 + player.stats.velocity * 6;
    const parPoint = 1 / (speed * 0.7);          /* secondes pour avancer d'un point de trajectoire */
    const v = vitesseCapital(C);
    const base = Math.atan2(C.y - src.y, C.x - src.x);
    const n = IA_CAP.visee[gameState.config.difficulty] || 0;
    let best = null;
    for (let k = -n; k <= n; k++) {
        const a = base + k * 0.02;
        const dx = Math.cos(a), dy = Math.sin(a);
        const traj = computeTrajectory(src.x, src.y, dx, dy, speed, 200);
        let m = Infinity;
        for (let i = 0; i < traj.length; i += 2) {
            const t = i * parPoint;
            const ex = traj[i].x - (C.x + v[0] * t), ey = traj[i].y - (C.y + v[1] * t);
            const d = ex * ex + ey * ey;
            if (d < m) m = d;
        }
        m = Math.sqrt(m);
        if (!best || m < best[2]) best = [dx, dy, m];
    }
    return best;
}

/* Les spores (ou la place, max) des astres de l'IA ; C donne : seulement
   ceux a portee de cette sphere. */
function iaReserveCapital(player, C, max) {
    let n = 0;
    for (const b of player.bodies) {
        if (b.lutte) continue;
        if (C && Math.hypot(b.x - C.x, b.y - C.y) >= IA_CAP.portee) continue;
        n += max ? (b.maxSpores || 0) : (b.spores || 0);
    }
    return n;
}

/* Pendant qu'elle economise, l'IA ne tire plus (sauf rafale ou boule deja
   lancee) : c'est le prix de la sphere. */
function iaGardeReserve(player, src) {
    return player.capPhase === 'prepa';
}

/* La sphere libre la plus proche de ses astres, ou -1. */
function iaSphereVisee(player) {
    let k = -1, best = Infinity;
    (gameState.capitaux || []).forEach(function (C, i) {
        if (!capActive(C) || C.pilote >= 0) return;
        /* Deux IA sur la meme sphere se gacheraient leurs spores. */
        if (gameState.players.some(function (j) { return j !== player && j.capK === i; })) return;
        for (const b of player.bodies) {
            const d = Math.hypot(b.x - C.x, b.y - C.y);
            if (d < best) { best = d; k = i; }
        }
    });
    return k;
}

/* Une campagne de capture : economiser, puis une salve toutes les 0,6 s. */
function iaCampagneCapital(player, dt) {
    const t = gameState.time;
    const fin = function () { player.capK = -1; player.capPhase = ''; player.capRepos = t + IA_CAP.repos; };
    if (t >= player.capFin) { fin(); return; }
    if (player.capPhase === 'prepa') {
        /* De quoi faire, et une sphere libre a portee d'assez d'astres ? */
        const k = iaSphereVisee(player);
        if (k < 0) return;
        if (iaReserveCapital(player, gameState.capitaux[k], false) < CAP_CFG.capture.spores * IA_CAP.reserve) return;
        player.capK = k;
        player.capPhase = 'tir';
        player.capFin = t + CAP_CFG.capture.fenetre;
        player.capTir = 0;
    }
    const C = (gameState.capitaux || [])[player.capK];
    if (!C || !capActive(C) || C.pilote >= 0) { fin(); return; }
    /* L'IA ne reflechit qu'un tour sur deux : on cadence sur l'horloge. */
    if (t < (player.capTir || 0)) return;
    player.capTir = t + IA_CAP.cadence;
    const sources = player.bodies.filter(function (b) {
        return !b.lutte && b.spores > 300 && Math.hypot(b.x - C.x, b.y - C.y) < IA_CAP.portee;
    }).sort(function (a, b) { return b.spores - a.spores; });
    const nb = IA_CAP.tirsParSalve[gameState.config.difficulty] || 1;
    for (let k = 0; k < sources.length && k < nb; k++) {
        /* On ne tire que si le calcul dit que ca touche. */
        const vis = viserCapital(sources[k], C, player);
        if (vis && vis[2] < C.rayon * 0.7) launchJet(sources[k], vis[0], vis[1], 'normal', player.id, { muet: true });
    }
}

/* Toutes les 5 s : faut-il se mettre a economiser pour une sphere ? */
function iaExamenCapitaux(player) {
    const t = gameState.time;
    if (t < (player.capExamen || 0)) return;
    player.capExamen = t + IA_CAP.examen;
    if (t < (player.capRepos || 0)) return;
    const caps = gameState.capitaux || [];
    if (caps.some(function (C) { return C.pilote === player.id; })) return;
    if (!caps.some(function (C) { return capActive(C) && C.pilote < 0; })) return;
    /* Une seule IA a la fois : sinon elles economisaient toutes en meme
       temps et cessaient toutes d'attaquer. */
    if (gameState.players.some(function (j) { return j !== player && j.capPhase; })) return;
    /* Ses astres doivent pouvoir contenir la capture, et plus. */
    if (iaReserveCapital(player, null, true) < CAP_CFG.capture.spores * IA_CAP.capacite) return;
    if (gameRandom() >= (IA_CAP.envie[gameState.config.difficulty] || 0.12)) return;
    player.capK = -1;
    player.capPhase = 'prepa';
    player.capFin = t + IA_CAP.preparation;
}

/* Une IA tient une sphere : elle choisit sa cible une fois, puis la
   dirige dessus. Cible : le systeme solaire ou elle fera le plus de mal
   (astres adverses, batiments) et le moins a elle-meme, sinon la planete
   adverse la mieux batie. */
function iaPiloteCapital(C) {
    const player = gameState.players[C.pilote];
    if (!player || player.isHuman) return;
    let cible = C.cibleIA ? (gameState.suns.find(function (s) { return s.name === C.cibleIA; }) || astreNomme(C.cibleIA)) : null;
    if (!cible) {
        let best = null, bestS = 0;
        const valeur = function (b) {
            if (b.owner === null || b.owner === undefined || b.owner < 0) return 0;
            const bat = (b.nids || 0) + (b.alveoles || 0) + (b.biomes || 0);
            return b.owner === player.id ? -3 - bat : 2 + bat;
        };
        for (const s of gameState.suns) {
            let sc = 0;
            for (const p of (s.planets || [])) { sc += valeur(p); for (const m of (p.moons || [])) sc += valeur(m); }
            if (sc > bestS) { bestS = sc; best = s; }
        }
        for (const b of gameState.allBodies) {
            if (b.type === 'sun') continue;
            const sc = valeur(b) * 1.5;
            if (sc > bestS) { bestS = sc; best = b; }
        }
        if (!best) return;
        cible = best;
        C.cibleIA = best.name;
        addEvent('war', '🛸', player.name + ' lance la sphère ' + CAP_TEINTES[C.type].nom + ' sur ' + best.name + ' !', best, player.color);
    }
    const dx = cible.x - C.x, dy = cible.y - C.y;
    const d = Math.hypot(dx, dy) || 1;
    C.cmdX = Math.abs(dx) / d > 0.38 ? Math.sign(dx) : 0;
    C.cmdY = Math.abs(dy) / d > 0.38 ? Math.sign(dy) : 0;
}

/* L'IA (normale et brutale) vise le pic de SA courbe : un astre sous sa
   bande de bon rendement pousse en paix, elle tire de ceux qui l'ont
   atteinte - ou qui se battent. */
function iaSourcePrete(b, min) {
    if (!(b.spores > min)) return false;
    if (b.lutte) return true;
    return b.spores >= Math.max(1, b.maxSpores) * zoneBonRendement()[0];
}

/* Les spores d'un joueur au-dessus du bas de sa bande de bon rendement. */
function iaSurplus(player) {
    const bas = zoneBonRendement()[0];
    let n = 0;
    for (const b of player.bodies) n += Math.max(0, (b.spores || 0) - Math.max(1, b.maxSpores) * bas);
    return n;
}

// ── IA Facile : cible aléatoire, pas d'anticipation ──
function aiActionEasy(player) {
    // Choisir un astre source avec des spores
    const sources = player.bodies.filter(b => b.spores > 20);
    if (sources.length === 0) return;
    const source = sources[Math.floor(gameRandom() * sources.length)];

    // Choisir une cible aléatoire (neutre ou ennemie)
    const targets = gameState.allBodies.filter(b =>
        b.owner !== player.id && b.type !== 'sun'
    );
    if (targets.length === 0) return;
    const target = targets[Math.floor(gameRandom() * targets.length)];

    aiTirer(source, target, player);
}

// ── IA Normale : évalue les cibles, interception basique ──
function aiActionNormal(player) {
    const sources = player.bodies.filter(b => iaSourcePrete(b, 30));
    if (sources.length === 0) return;

    // Évaluer les cibles
    const targets = gameState.allBodies.filter(b =>
        b.owner !== player.id && b.type !== 'sun'
    );
    if (targets.length === 0) return;

    let bestTarget = null;
    let bestScore = -Infinity;

    for (const target of targets) {
        // Trouver la source la plus proche
        let minDist = Infinity;
        let closestSource = null;
        for (const src of sources) {
            const dx = target.x - src.x;
            const dy = target.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) { minDist = dist; closestSource = src; }
        }

        // Score : Flore haute + Faune faible + proximité
        const score = (target.flore || 0) * 2
            - (target.faune || 0) * 1
            - minDist * 0.05
            + (target.owner === null ? 50 : 0); // préférer les neutres

        if (score > bestScore) {
            bestScore = score;
            bestTarget = target;
        }
    }

    if (!bestTarget) return;

    // Trouver la meilleure source pour cette cible
    let bestSource = sources[0];
    let bestDist = Infinity;
    for (const src of sources) {
        const dx = bestTarget.x - src.x;
        const dy = bestTarget.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) { bestDist = dist; bestSource = src; }
    }

    aiTirer(bestSource, bestTarget, player);
}

// ── IA Brutale : interception parfaite, coordination, micro-gestion ──
function aiActionBrutal(player) {
    const sources = player.bodies.filter(b => iaSourcePrete(b, 25));
    if (sources.length === 0) return;

    // Évaluer les cibles avec anticipation orbitale
    const targets = gameState.allBodies.filter(b =>
        b.owner !== player.id && b.type !== 'sun'
    );
    if (targets.length === 0) return;

    let bestTarget = null;
    let bestScore = -Infinity;

    for (const target of targets) {
        let minDist = Infinity;
        for (const src of sources) {
            const dx = target.x - src.x;
            const dy = target.y - src.y;
            minDist = Math.min(minDist, Math.sqrt(dx * dx + dy * dy));
        }

        // Score avancé
        const floreFactor = (target.flore || 0) * 3;
        const faunePenalty = (target.faune || 0) * 0.5;
        const distPenalty = minDist * 0.03;
        const ownerBonus = target.owner === null ? 40 : 20;
        const sporePenalty = (target.spores || 0) * 0.3;

        // Bonus si c'est un astre du joueur humain (agressif)
        const humanBonus = (target.owner !== null && target.owner !== player.id && gameState.players[target.owner]?.isHuman) ? 60 : 0;

        const score = floreFactor - faunePenalty - distPenalty + ownerBonus - sporePenalty + humanBonus;

        if (score > bestScore) {
            bestScore = score;
            bestTarget = target;
        }
    }

    if (!bestTarget) return;

    // Coordination : lancer depuis plusieurs sources si possible
    const attackSources = [];
    for (const src of sources) {
        const dx = bestTarget.x - src.x;
        const dy = bestTarget.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1500) attackSources.push({ src, dist });
    }

    // Trier par distance
    attackSources.sort((a, b) => a.dist - b.dist);

    // Lancer depuis les 1 à 3 sources les plus proches
    const count = Math.min(attackSources.length, 1 + Math.floor(gameRandom() * 3));
    for (let i = 0; i < count; i++) {
        const src = attackSources[i].src;
        // Garder une réserve défensive (30% des spores)
        if (src.spores < 40) continue;
        aiTirer(src, bestTarget, player);
    }
}

/* ─────────────────────────────────────────────
   LES IA SE SERVENT DE TOUT L'ARSENAL. Elles batissent les trois genres
   (et des foyers putrides), et tirent parasite, demolisseur, boule et
   rafale en plus du jet normal. La difficulte regle leur gout pour les
   tirs speciaux : facile 15 %, normal 35 %, brutal 50 % des tirs.
   ───────────────────────────────────────────── */
function aiChoixBatiment(player, body) {
    const chezElle = body.owner === player.id;
    /* Un foyer putride de temps en temps, s'il n'y a pas deja de spore
       parasitaire en reserve. */
    if (chezElle && !body.lutte && (body.parasiteSpore || 0) < 1 && gameRandom() < 0.12
        && !player.bodies.some(b => b.buildMode === 'parasite' || (b.parasiteSpore || 0) >= 1)) return 'parasite';
    /* Menace (bataille sur l'astre) : biome. Plein a ras bord : alveole.
       Sinon nids d'abord, puis un peu de tout. */
    if (body.lutte && gameRandom() < 0.7) return 'biome';
    if (body.spores > body.maxSpores * 0.95 && gameRandom() < 0.6) return 'alveole';
    const r = gameRandom();
    if (player.bodies.length < 4 || r < 0.45) return 'nid';
    return r < 0.75 ? 'biome' : 'alveole';
}

/* Les batiments d'un astre que l'IA peut casser, par genre. */
function _aiBatimentsAdverses(target, slot) {
    const n = { alveole: 0, nid: 0, biome: 0 };
    if (!((target.alveoles || 0) + (target.nids || 0) + (target.biomes || 0))) return null;
    const monCamp = campDe(target, slot);
    const cel = target.lutte ? target.lutte.cellules : null;
    let total = 0;
    for (const e of edifices(target)) {
        if (cel ? cel[e.i] === monCamp : target.owner === slot) continue;
        n[e.g]++; total++;
    }
    return total ? n : null;
}

function aiTirer(src, target, player) {
    /* Elle economise pour capturer une sphere : pas de tir depuis ces astres. */
    if (iaGardeReserve(player, src)) return;
    const d = gameState.config.difficulty;
    const gout = d === 'easy' ? 0.15 : d === 'normal' ? 0.35 : 0.5;
    const chezElle = src.owner === player.id;
    /* Parasite pret ou demolisseur possible : on se choisit un astre ennemi
       a portee, meme si la cible du moment est un neutre. */
    const parasitePret = chezElle && (src.parasiteSpore || 0) >= 1;
    const peutDemolir = !src.lutte && (src.spores || 0) >= DEMOL_SPORES + 100;
    if ((parasitePret || peutDemolir) && !(target.owner !== null && target.owner !== undefined && target.owner !== player.id)) {
        let best = null, bd = 3000 * 3000;
        for (const b of gameState.allBodies) {
            if (b.type === 'sun' || b.owner === null || b.owner === undefined || b.owner === player.id) continue;
            if (!parasitePret && !_aiBatimentsAdverses(b, player.id)) continue;
            const d2 = (b.x - src.x) * (b.x - src.x) + (b.y - src.y) * (b.y - src.y);
            if (d2 < bd) { bd = d2; best = b; }
        }
        if (best && gameRandom() < 0.5) target = best;
    }
    const ennemi = target.owner !== null && target.owner !== undefined && target.owner !== player.id;
    /* Une spore parasitaire prete part sur un astre ennemi. */
    if (ennemi && parasitePret && gameRandom() < 0.7) {
        aiLaunchAt(src, target, player, 'parasite'); return;
    }
    if (gameRandom() < gout && !player._aiRafale && !player._aiBoule) {
        const bats = ennemi ? _aiBatimentsAdverses(target, player.id) : null;
        const dispo = src.lutte ? 0 : (src.spores || 0);
        /* Demolisseur : vise le genre le plus present chez l'autre. */
        if (bats && dispo >= DEMOL_SPORES + 100 && gameRandom() < 0.6) {
            let g = 'nid';
            for (const k of DEMOL_GENRES) if (bats[k] > bats[g]) g = k;
            aiLaunchAt(src, target, player, 'normal',
                       { nombre: DEMOL_SPORES, vitesse: DEMOL_VITESSE, pas: DEMOL_PAS, demol: g });
            return;
        }
        if (chezElle && !src.lutte && dispo >= 400 && gameRandom() < 0.5) {
            player._aiBoule = { src: src, cible: target, n: 0,
                                but: Math.min(BOULE_MAX, dispo * 0.4 / BOULE_COUT),
                                angle: Math.atan2(target.y - src.y, target.x - src.x) };
            return;
        }
        if (dispo >= 150) {
            player._aiRafale = { src: src, cible: target, acc: 0,
                                 reste: Math.min(16, Math.floor(dispo * 0.4 / RAFALE_PAQUET)) };
            return;
        }
    }
    aiLaunchAt(src, target, player);
}

/* Les tirs d'IA qui durent : la rafale crache ses paquets, la boule se
   charge en tournant vers sa cible puis part. */
function aiArmes(player, dt) {
    const R = player._aiRafale;
    if (R) {
        if (R.src.owner !== player.id && !(R.src.lutte && zonesDe(R.src, player.id).length)) player._aiRafale = null;
        else {
            R.acc += dt;
            while (R.acc >= 1 / RAFALE_CADENCE && R.reste > 0) {
                R.acc -= 1 / RAFALE_CADENCE;
                R.reste--;
                const a = Math.atan2(R.cible.y - R.src.y, R.cible.x - R.src.x) + (gameRandom() * 2 - 1) * RAFALE_ECART;
                const n0 = gameState.jets.length;
                launchJet(R.src, Math.cos(a), Math.sin(a), 'normal', player.id, { nombre: RAFALE_PAQUET, muet: true });
                if (gameState.jets.length > n0) gameState.jets[n0].rafale = true;
                else { R.reste = 0; break; }
            }
            if (R.reste <= 0) player._aiRafale = null;
        }
    }
    const B = player._aiBoule;
    if (B) {
        if (B.src.owner !== player.id || B.src.lutte) { player._aiBoule = null; return; }
        const cible = Math.atan2(B.cible.y - B.src.y, B.cible.x - B.src.x);
        B.angle = _angleVers(B.angle, cible, BOULE_ROTATION * 3 * dt);
        let voulu = Math.min(BOULE_DEBIT * dt, B.but - B.n, (B.src.spores || 0) / BOULE_COUT);
        if (voulu > 0) { B.src.spores -= voulu * BOULE_COUT; B.n += voulu; }
        /* Pleine (ou plus rien a y mettre) et a peu pres dans l'axe : feu. */
        let ecart = Math.abs(cible - B.angle);
        if (ecart > Math.PI) ecart = 2 * Math.PI - ecart;
        if ((B.n >= B.but - 0.5 || voulu <= 0) && ecart < 0.15) {
            player._aiBoule = null;
            if (B.n >= 5) {
                const h = B.src.radius * BOULE_HAUTEUR;
                ondeDeChoc(B.src.x + Math.cos(B.angle) * h, B.src.y + Math.sin(B.angle) * h,
                           B.src.radius * 1.4, player.color, B.n);
                creerJetBoule(B.src, B.angle, Math.floor(B.n), player.id);
            }
        }
    }
}

// ── Lancement IA avec anticipation d'orbite ──
/* Ou sera un astre dans t secondes : les orbites sont des cercles, le soleil
   autour du trou noir (au centre), la planete autour du soleil, la lune
   autour de la planete. */
function _iaPosFuture(b, t) {
    if (!b.parent) {
        if (!b.orbitRadius) return { x: b.x, y: b.y };
        const a = b.angle + b.orbitSpeed * t;
        return { x: Math.cos(a) * b.orbitRadius, y: Math.sin(a) * b.orbitRadius };
    }
    const p = _iaPosFuture(b.parent, t);
    const a = b.angle + b.orbitSpeed * t;
    return { x: p.x + Math.cos(a) * b.orbitRadius, y: p.y + Math.sin(a) * b.orbitRadius };
}

/* LA VISEE DE L'IA. Elle visait tout droit, la ou la cible serait apres un
   temps de vol mal estime (cinq fois trop long), sans la courbe que la
   gravite du trou noir donne au tir : un tir sur cinq seulement touchait sa
   cible (mesure sur des parties entieres). Elle essaie maintenant des
   angles autour de la cible, calcule pour chacun la vraie trajectoire (la
   meme que celle du jet) et garde celui qui passe au plus pres de la cible
   au moment ou le tir y arrive. Un trajet qui croise un soleil est ecarte. */
function _iaScoreVisee(source, target, ang, speed, pas, maxI) {
    const traj = computeTrajectory(source.x, source.y, Math.cos(ang), Math.sin(ang), speed, pas);
    const parPoint = 1 / (speed * 0.70);       /* secondes par point (jets.js : posIndex) */
    let best = 1e9;
    const n = Math.min(traj.length, maxI);
    for (let i = 2; i < n; i += 2) {
        const pt = traj[i];
        for (const s of gameState.suns) {
            const ds = Math.hypot(pt.x - s.x, pt.y - s.y);
            if (ds < s.radius + 12) return best < 1e9 ? best : 1e9;
        }
        const f = _iaPosFuture(target, i * parPoint);
        const d = Math.hypot(pt.x - f.x, pt.y - f.y) - target.radius;
        if (d < best) best = d;
        if (best <= 0) return 0;
    }
    return best;
}
function _iaVisee(source, target, speed, pas) {
    const base = Math.atan2(target.y - source.y, target.x - source.x);
    let meilleur = base, score = _iaScoreVisee(source, target, base, speed, pas, pas);
    for (let k = -14; k <= 14 && score > 0; k++) {
        if (!k) continue;
        const a = base + k * 0.06;
        const sc = _iaScoreVisee(source, target, a, speed, pas, pas);
        if (sc < score) { score = sc; meilleur = a; }
    }
    /* Affinage autour du meilleur angle. */
    const centre = meilleur;
    for (let k = -5; k <= 5 && score > 0; k++) {
        if (!k) continue;
        const a = centre + k * 0.012;
        const sc = _iaScoreVisee(source, target, a, speed, pas, pas);
        if (sc < score) { score = sc; meilleur = a; }
    }
    return { dx: Math.cos(meilleur), dy: Math.sin(meilleur) };
}

function aiLaunchAt(source, target, player, sporeType, opts) {
    if (gameState.config.difficulty !== 'easy') {
        const speed = (20 + player.stats.velocity * 6) * (opts && opts.vitesse > 0 ? opts.vitesse : 1);
        const v = _iaVisee(source, target, speed, (opts && opts.pas) || 200);
        launchJet(source, v.dx, v.dy, sporeType || 'normal', player.id, opts);
        return;
    }
    // Prédire la position future de la cible
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 20 + player.stats.velocity * 6;
    const travelTime = dist / speed * 0.4; // estimation grossière

    // Anticiper l'orbite (seulement IA normale et brutale)
    let futureX = target.x;
    let futureY = target.y;

    if (gameState.config.difficulty !== 'easy' && target.parent) {
        const futureAngle = target.angle + target.orbitSpeed * travelTime;
        futureX = target.parent.x + Math.cos(futureAngle) * target.orbitRadius;
        futureY = target.parent.y + Math.sin(futureAngle) * target.orbitRadius;

        // IA Brutale : anticiper aussi l'orbite du parent (soleil)
        if (gameState.config.difficulty === 'brutal' && target.parent.parent) {
            // Le parent est une planète, son parent est un soleil
            const parentFutureAngle = target.parent.angle + target.parent.orbitSpeed * travelTime;
            const parentFutureX = target.parent.parent.x + Math.cos(parentFutureAngle) * target.parent.orbitRadius;
            const parentFutureY = target.parent.parent.y + Math.sin(parentFutureAngle) * target.parent.orbitRadius;
            futureX = parentFutureX + Math.cos(futureAngle) * target.orbitRadius;
            futureY = parentFutureY + Math.sin(futureAngle) * target.orbitRadius;
        } else if (gameState.config.difficulty === 'brutal' && target.parent.orbitRadius) {
            // Le parent est un soleil qui orbite le trou noir
            const sunFutureAngle = target.parent.angle + target.parent.orbitSpeed * travelTime;
            const sunFutureX = Math.cos(sunFutureAngle) * target.parent.orbitRadius;
            const sunFutureY = Math.sin(sunFutureAngle) * target.parent.orbitRadius;
            futureX = sunFutureX + Math.cos(futureAngle) * target.orbitRadius;
            futureY = sunFutureY + Math.sin(futureAngle) * target.orbitRadius;
        }
    }

    const aimDx = futureX - source.x;
    const aimDy = futureY - source.y;
    const aimLen = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
    if (aimLen < 5) return;

    launchJet(source, aimDx / aimLen, aimDy / aimLen, sporeType || 'normal', player.id, opts);
}


