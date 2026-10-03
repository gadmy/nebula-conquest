/* ─────────────────────────────────────────────
   MODE SURFACE ET TIR DE SURFACE
   Un double-clic sur un astre plonge dessus : la camera s'y colle et l'on
   passe en tir de surface. On vise comme avant, mais le jet est cette fois
   soumis a la pesanteur de l'astre lui-meme - il part en cloche et retombe
   sur le sol, ce qui permet d'arroser l'autre bout de la planete, ou de
   frapper droit devant d'une frontiere a l'autre. Des qu'on prend du recul,
   on repasse en visee normale.
   ───────────────────────────────────────────── */
const SURFACE_PAS = 0.05;      /* pas d'integration de la cloche */
/* Rayon a l'ecran en dessous duquel viser la surface n'a plus de sens : la
   grille fait trente-deux cases de cote, il faut donc quelques pixels par
   case pour savoir ou l'on tire. Au-dessus de ce plancher on garde le mode,
   quel que soit le grossissement - inutile d'imposer le zoom maximum pour
   bombarder une planete, et une geante reste visable de loin tandis qu'une
   petite lune demande qu'on s'approche. */
const SURFACE_MIN_PX = 70;
const SURFACE_ETAPES = 200;

function zoomSurface(body) {
    const m = Math.min(gameState.width, gameState.height);
    return Math.min(gameState.camera.maxZoom, (m * 0.40) / Math.max(6, body.radius));
}

/* Le double-clic cadre l'astre, rien de plus : la visee (vers un autre
   astre comme sur le sien) ne s'ouvre qu'a la touche Espace. */
function cadrerAstre(body) {
    if (!body || body.type === 'sun') return;
    followingBody = body;
    gameState._zoomCible = zoomSurface(body);
}

function majModeSurface(dt) {
    const cam = gameState.camera;
    if (!gameState._zoomCible) return;
    const c = gameState._zoomCible;
    cam.zoom += (c - cam.zoom) * Math.min(1, dt * 6);
    if (Math.abs(cam.zoom - c) < c * 0.012) { cam.zoom = c; gameState._zoomCible = null; }
}

/* Le joueur peut-il tirer a la surface de cet astre ? Soit il le possede,
   soit il y tient deja du terrain. */
function peutTirerSurface(body, slot) {
    if (!body || body.type === 'sun') return false;
    if (body.owner === slot) return true;
    const L = body.lutte;
    if (!L) return false;
    /* Tenir du terrain suffit : une zone a court de spores reste une zone,
       et c'est d'elle qu'on pourra tirer des qu'elle aura reproduit. */
    return zonesDe(body, slot).length > 0;
}

/* UN SEUL MODE DE VISEE. C'est le curseur qui decide : pose sur le disque de
   l'astre d'ou l'on tire, c'est un tir de surface ; partout ailleurs, c'est
   un jet ordinaire. Plus rien a entrer ni a quitter, et le meme geste sert
   aux deux. L'astre doit rester assez gros a l'ecran pour qu'on vise une
   case - sous ce plancher, le viser signifie le prendre pour cible, pas le
   bombarder. */
function astreTirSurface() {
    if (gameState._firePhase !== 'aiming') return null;
    const src = gameState._fireSource;
    if (!src || src.type === 'sun') return null;
    if (src.radius * gameState.camera.zoom < SURFACE_MIN_PX) return null;
    const dx = gameState.mouseWorldX - src.x, dy = gameState.mouseWorldY - src.y;
    if (dx * dx + dy * dy > src.radius * src.radius) return null;
    if (!peutTirerSurface(src, localSlot())) return null;
    return src;
}

function estTirSurface() { return !!astreTirSurface(); }

/* ── Passage case <-> monde ── */
function _celluleVers(body, i) {
    const N = LUTTE_N, r = body.radius, pas = (2 * r) / N;
    return { x: body.x - r + ((i % N) + 0.5) * pas,
             y: body.y - r + (((i / N) | 0) + 0.5) * pas };
}
function _celluleA(body, wx, wy) {
    const N = LUTTE_N, r = body.radius, pas = (2 * r) / N;
    const x = Math.floor((wx - (body.x - r)) / pas);
    const y = Math.floor((wy - (body.y - r)) / pas);
    if (x < 0 || x >= N || y < 0 || y >= N) return -1;
    const i = y * N + x;
    return (_lutteMasque && _lutteMasque[i]) ? i : -1;
}

/* D'ou part le tir : le bout de terrain qu'on tient le plus proche de la
   cible. C'est la transposition, a l'echelle d'un astre, de la regle du tir
   groupe - on tire de la ou l'on est le plus pres. */
function pointTirSurface(body, slot, tx, ty) {
    const L = body.lutte;
    const r = body.radius;
    if (!L) {
        /* Pas de bataille : on part du point de la surface tourne vers la
           cible. */
        const dx = tx - body.x, dy = ty - body.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: body.x + dx / d * r * 0.86, y: body.y + dy / d * r * 0.86 };
    }
    /* On part de la zone choisie, et d'elle seule : c'est de la qu'on tire. */
    const zt = zoneDeTir(body, slot);
    const idz = zt ? zt.id : -1;
    const cel = L.cellules;
    let best = -1, bd = Infinity;
    for (let i = 0; i < cel.length; i++) {
        if (L.zid[i] !== idz) continue;
        const p = _celluleVers(body, i);
        const d = (p.x - tx) * (p.x - tx) + (p.y - ty) * (p.y - ty);
        if (d < bd) { bd = d; best = i; }
    }
    if (best < 0) return { x: body.x, y: body.y };
    return _celluleVers(body, best);
}


/* LA CLOCHE, calculee dans le repere de l'astre : il orbite pendant le vol,
   un trace en coordonnees du monde se decrocherait de lui.

   Le vol dure d'autant plus longtemps que la cible est loin, et part a la
   vitesse qu'il faut pour l'atteindre en ligne droite - MAIS une acceleration
   constante vers le centre de l'astre le devie en chemin. C'est la ce qui
   fait tout le sel du tir de surface : plus on vise loin, plus la courbe
   s'ecarte, et il faut la corriger a l'oeil. D'une frontiere a la frontiere
   d'en face, a courte portee, le tir reste presque tendu.

   Le vol peut passer AU-DESSUS du disque - dans l'atmosphere, voire au-dela
   du limbe : rien ne le retient sur le sol pendant la montee. Seul le point
   de CHUTE est ramene sur la planete, car les spores doivent bien se poser
   quelque part. */
const SURFACE_COURBE = 0.16;   /* deviation vers le centre, en rayons par seconde carree */

function trajectoireSurface(body, ox, oy, tx, ty) {
    const R = body.radius;
    const px = tx - ox, py = ty - oy;
    const portee = Math.sqrt(px * px + py * py) || 1;
    const tVol = Math.max(0.7, Math.min(3.4, 0.55 + portee / (R * 0.85)));
    const n = Math.max(6, Math.round(tVol / SURFACE_PAS));
    const a = R * SURFACE_COURBE;
    let x = ox, y = oy, vx = px / tVol, vy = py / tVol;
    const pts = [];
    for (let i = 0; i < n; i++) {
        const d = Math.sqrt(x * x + y * y) || 1;
        vx -= x / d * a * SURFACE_PAS;
        vy -= y / d * a * SURFACE_PAS;
        x += vx * SURFACE_PAS;
        y += vy * SURFACE_PAS;
        /* h monte puis redescend : c'est l'altitude, qui ne sert qu'au dessin. */
        pts.push({ x: x, y: y, h: Math.sin(Math.PI * (i + 1) / n) });
    }
    /* La chute, elle, se fait sur la planete : un tir sorti du limbe y est
       ramene au bord le plus proche. */
    const fin = pts[pts.length - 1];
    const df = Math.sqrt(fin.x * fin.x + fin.y * fin.y);
    if (df > R * 0.97) { fin.x = fin.x / df * R * 0.97; fin.y = fin.y / df * R * 0.97; }
    return pts;
}

/* Le trace de visee, en coordonnees du monde, recalcule a chaque image. */
function apercuTirSurface(body, slot, tx, ty) {
    const p = pointTirSurface(body, slot, tx, ty);
    const rel = trajectoireSurface(body, p.x - body.x, p.y - body.y,
                                   tx - body.x, ty - body.y);
    const pts = [];
    for (let i = 0; i < rel.length; i++) pts.push({ x: body.x + rel[i].x, y: body.y + rel[i].y });
    return { depart: p, points: pts };
}

/* depuisOrdre : appel par l'ordre 'tir_surface', au tour qui l'execute. Sans
   lui (le clic du joueur, en solo), on verifie - pour faire vibrer l'ecran
   tout de suite en cas de refus - puis on donne l'ordre. */
function lancerJetSurface(body, slot, tx, ty, depuisOrdre) {
    const joueur = gameState.players[slot];
    if (!joueur) return false;
    /* Le tir de surface part lui aussi d'une zone, et de sa reserve. */
    const zt = body.lutte ? zoneDeTir(body, slot) : null;
    if (body.lutte && (!zt || zt.z.n < ZONE_MIN)) { if (!depuisOrdre) secouerEcran(8); return false; }
    const dispo = zt ? zt.z.spores : body.spores;
    const nb = Math.floor(dispo * partEnvoi(slot));
    if (nb < 5) { if (!depuisOrdre) secouerEcran(6); return false; }

    const p = pointTirSurface(body, slot, tx, ty);
    const dx = tx - p.x, dy = ty - p.y;
    if (dx * dx + dy * dy < 1) return false;

    /* En multijoueur c'est le serveur qui tire : on ne lui annonce que la
       cible, il verifie le terrain, choisit le depart et calcule la cloche. */
    if (gameState.isMulti) {
        const _zc = zt ? zoneCentre(body, zt.z) : null;
        sendAction('jet_surface', { srcName: body.name, tx: tx, ty: ty,
                                    zx: _zc ? _zc.x : undefined, zy: _zc ? _zc.y : undefined });
        return true;
    }
    if (!depuisOrdre) {
        donnerOrdre('tir_surface', { src: body.name, tx: tx, ty: ty });
        return true;
    }

    if (zt) { zt.z.spores -= nb; zonesAgreger(body, body.lutte); }
    else body.spores -= nb;

    const rel = trajectoireSurface(body, p.x - body.x, p.y - body.y,
                                   tx - body.x, ty - body.y);
    gameState.gameStats.jetsLaunched++;
    playLaunchSound();
    gameState.jets.push({
        owner: slot, color: joueur.color, spores: nb, sporeType: 'normal',
        trajectory: rel, posIndex: 0, x: p.x, y: p.y,
        /* Les points sont espaces de SURFACE_PAS secondes ; updateJets avance
           l'indice de speed * dt * 0.70, d'ou cette vitesse. */
        speed: 1 / (0.70 * SURFACE_PAS),
        alive: true, trail: [], sparkles: [], age: 0, selected: false,
        source: body, sourceName: body.name, _surface: body
    });
    return true;
}

/* Un tir de surface retombe : ses spores debarquent la ou il touche, et
   prennent pied sur quelques cases autour du point de chute. */
function debarquerSurface(body, slot, spores, wx, wy) {
    _luttePrepare();
    const N = LUTTE_N;
    if (slot === body.owner && !body.lutte) {
        ajouterSpores(body, spores);
        return;
    }
    if (slot >= 0 && body.owner !== null && body.owner !== undefined && body.owner >= 0 && body.owner !== slot) noterAttaque(slot, body.owner);
    /* Planete neutre : le tir de surface n'est le tir favori d'aucun type. */
    spores *= facteurTypeAstre(body, 'surface');
    naitreLutte(body);
    const L = body.lutte;
    L.dormante = false;
    const v = (slot === body.owner) ? 0 : slot + 1;

    let centre = _celluleA(body, wx, wy);
    if (centre < 0) {
        const dx = wx - body.x, dy = wy - body.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        centre = _celluleA(body, body.x + dx / d * body.radius * 0.8,
                                 body.y + dy / d * body.radius * 0.8);
    }
    if (centre >= 0) {
        /* Le rayon de la tete de pont suit la masse debarquee. */
        const rayon = Math.min(4.5, 0.7 + Math.sqrt(spores) / 10);
        const cx = centre % N, cy = (centre / N) | 0;
        const r2 = rayon * rayon;
        for (let y = Math.max(0, cy - 5); y <= Math.min(N - 1, cy + 5); y++) {
            for (let x = Math.max(0, cx - 5); x <= Math.min(N - 1, cx + 5); x++) {
                const dd = (x - cx) * (x - cx) + (y - cy) * (y - cy);
                if (dd > r2) continue;
                const i = y * N + x;
                if (L.cellules[i] === LUTTE_VIDE) continue;
                L.cellules[i] = v;
            }
        }
    }
    /* Debarquer, c'est attaquer - y compris sur son propre sol, ou c'est la
       contre-attaque qui reprend le terrain perdu. Les spores vont a la zone
       du point de chute. */
    zonesRecalculer(body, L);
    const idc = (centre >= 0) ? L.zid[centre] : 0;
    const zc = L.zones[idc];
    if (zc) { zc.spores += spores; zc.elan = (zc.elan || 0) + spores; }
    zonesAgreger(body, L);
    L.dormante = false;
    L.sale = true;
    if (!gameState._ondes) gameState._ondes = [];
    const j = gameState.players[slot];
    gameState._ondes.push({ x: wx, y: wy, r0: body.radius * 0.05, r1: body.radius * 0.5,
                            age: 0, maxAge: 0.5,
                            couleur: _rgbDe((j && j.color) || '#FFFFFF'), ep: 2.5 });
}

/* CONTRE-ATTAQUE GENERALE (touche R). Sur chacun de nos astres ou un autre
   tient du terrain, chacune de nos zones engage LE POURCENTAGE D'ENVOI - celui
   qu'on regle avec A et E, comme pour un jet - de sa reserve. C'est un budget,
   pas une depense : chaque case prise se paie au prix du sol, et ce qui n'a
   rien trouve a acheter reste dans la zone. Nettoyer trois cases a 100 % ne
   vide donc pas une planete. Les zones de moins de dix cases ne participent
   pas, elles n'ont deja pas le droit d'attaquer. */
/* L'astre sous le curseur, s'il y en a un : c'est lui qui decide si la
   riposte vise une planete ou toute la galaxie. */
function astreSousSouris() {
    const bodies = gameState.allBodies || [];
    const wx = gameState.mouseWorldX, wy = gameState.mouseWorldY;
    for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const dx = b.x - wx, dy = b.y - wy;
        if (dx * dx + dy * dy < (b.radius + 8) * (b.radius + 8)) return b;
    }
    return null;
}

/* slot : le joueur de l'ordre 'riposte'. Sans lui, c'est la touche R : en
   solo elle donne l'ordre, en multijoueur elle previent le serveur. */
function riposteGenerale(cible, slot) {
    if (gameState.phase !== 'game') return 0;
    if (slot === undefined && !gameState.isMulti) {
        donnerOrdre('riposte', { cible: cible ? cible.name : null });
        return 0;
    }
    const moi = slot === undefined ? localSlot() : slot;
    const aMoi = (moi === localSlot());      /* messages et sons : pour son propre ecran */
    if (gameState.isMulti) sendAction('riposte', { bodyName: cible ? cible.name : null });
    let astres = 0, engage = 0;
    const ratio = gameState.isMulti ? gameState.jetRatio : partEnvoi(moi);
    if (!(ratio > 0)) {
        if (aMoi) {
            addEvent('neutral', '⚔', 'Riposte impossible : envoi a 0 % (A / E pour le regler)',
                     null, '#888888');
            secouerEcran(5);
        }
        return 0;
    }
    const bodies = cible ? [cible] : (gameState.allBodies || []);
    for (let bi = 0; bi < bodies.length; bi++) {
        const body = bodies[bi];
        const L = body.lutte;
        if (!L || !L.zones) continue;

        /* Tout astre ou plusieurs camps se partagent le sol et ou nous
           tenons pied : le notre, celui d'en face, ou un neutre entame. */
        const vMoi = campDe(body, moi);
        let total = 0, etrangeres = 0;
        for (const id in L.zones) {
            const z = L.zones[id];
            total += z.n;
            if (z.v !== vMoi) etrangeres += z.n;
        }
        if (!etrangeres || !total) continue;

        const miennes = [];
        let dispo = 0;
        const liste = zonesDe(body, moi);
        for (let k = 0; k < liste.length; k++) {
            if (liste[k].z.n < ZONE_MIN) continue;
            miennes.push(liste[k].z);
            dispo += liste[k].z.spores;
        }
        const cout = coutCase(body, total);
        if (!miennes.length || dispo * ratio < cout) continue;

        /* Chaque zone engage le pourcentage d'envoi de SA reserve. */
        for (let k = 0; k < miennes.length; k++) {
            const z = miennes[k];
            z.elan = Math.max(z.elan || 0, z.spores * ratio);
        }
        L.dormante = false;
        astres++;
        engage += dispo * ratio;
        gameState.conquestEffects.push({
            x: body.x, y: body.y - body.radius - 20, baseX: body.x,
            text: '\u2694 RIPOSTE', color: '#FFD27A', age: 0, maxAge: 2.5 });
    }
    const j = gameState.players[moi];
    if (!aMoi) return astres;
    if (astres) {
        const ou = cible ? `sur ${cible.name}` : `sur ${astres} astre${astres > 1 ? 's' : ''}`;
        addEvent('mine', '\u2694', `Riposte ${ou} — ${Math.round(engage)} spores engagées`, null, j && j.color);
        playLaunchSound();
    } else {
        addEvent('neutral', '\u2694', cible ? `Rien a nettoyer sur ${cible.name}` : 'Aucun astre a nettoyer',
                 null, '#888888');
        secouerEcran(5);
    }
    return astres;
}

/* ARRET DES ATTAQUES (touche T), le pendant de R. Sur l'astre sous le
   curseur, ou partout si le curseur est dans le vide, nos zones perdent leur
   elan : elles cessent de pousser. Rien n'est perdu - l'elan n'est qu'un
   budget, les spores restent dans la zone. */
/* slot : le joueur de l'ordre 'arret' ; sans lui, la touche T (comme R). */
function arreterAttaques(cible, slot) {
    if (gameState.phase !== 'game') return 0;
    if (slot === undefined && !gameState.isMulti) {
        donnerOrdre('arret', { cible: cible ? cible.name : null });
        return 0;
    }
    const moi = slot === undefined ? localSlot() : slot;
    if (gameState.isMulti) sendAction('arret', { bodyName: cible ? cible.name : null });
    const bodies = cible ? [cible] : (gameState.allBodies || []);
    let astres = 0;
    for (const body of bodies) {
        if (!body.lutte || !body.lutte.zones) continue;
        let arretees = 0;
        const liste = zonesDe(body, moi);
        for (const m of liste) {
            if (m.z.elan > 0) { m.z.elan = 0; arretees++; }
        }
        /* En multijoueur l'elan est chez le serveur, pas ici : on signale
           l'arret partout ou l'on tient une zone dans une bataille. */
        if (gameState.isMulti) arretees = liste.length;
        if (!arretees) continue;
        astres++;
        gameState.conquestEffects.push({
            x: body.x, y: body.y - body.radius - 20, baseX: body.x,
            text: '\u270B ARRÊT', color: '#93C5FD', age: 0, maxAge: 2.2 });
    }
    const j = gameState.players[moi];
    if (moi !== localSlot()) return astres;
    if (astres) {
        const ou = cible ? `sur ${cible.name}` : `sur ${astres} astre${astres > 1 ? 's' : ''}`;
        addEvent('mine', '\u270B', `Attaques arrêtées ${ou}`, null, j && j.color);
    } else {
        secouerEcran(5);
    }
    return astres;
}

function majLuttes(dt) {
    const bodies = gameState.allBodies;
    const multi = gameState.isMulti;
    for (let bi = 0; bi < bodies.length; bi++) {
        const body = bodies[bi];
        if (!body.lutte) continue;
        body.lutte.acc += dt;
        let gardes = 8;
        while (body.lutte && body.lutte.acc >= LUTTE_PAS && gardes-- > 0) {
            body.lutte.acc -= LUTTE_PAS;
            if (multi) suivreLutte(body, LUTTE_PAS); else majLutte(body, LUTTE_PAS);
        }
        if (body.lutte && body.lutte.acc > LUTTE_PAS) body.lutte.acc = 0;
    }
}

/* EN MULTIJOUEUR c'est le serveur qui livre la bataille : il n'envoie que les
   comptes de cases et les stocks, jamais la grille - trois cents octets par
   astre et par instantane seraient du gaspillage pour une tache que le client
   sait peindre. Le client fait donc avancer SA grille vers ces comptes : un
   camp en retard sur son objectif pousse, un camp en avance recule. Le front
   suit le meme mouvement que dans le solo, sans jamais decider de rien. */
function suivreLutte(body, pas) {
    const L = body.lutte, cel = L.cellules, nb = cel.length;
    const cible = L.cible;
    if (!cible) return;

    _lutteCompte.fill(0);
    for (let i = 0; i < nb; i++) { const v = cel[i]; if (v !== LUTTE_VIDE) _lutteCompte[v]++; }

    /* Chaque camp en retard sur son objectif pousse, a la meme cadence et
       avec le meme grain que dans le solo : le front a la meme allure, sans
       jamais rien decider. */
    const grain = _grainLutte(L);
    const vise = { 0: cible.d || 0 };
    for (const k in cible.a) vise[(+k) + 1] = cible.a[k];

    for (const k in vise) {
        const v = +k;
        const manque = vise[v] - _lutteCompte[v];
        if (manque <= 0) continue;
        let cases = Math.min(manque, Math.max(1, Math.round(LUTTE_CADENCE * pas)));
        /* En suivi, le front se prend au camp et non a la zone : on ne
           reproduit qu'une silhouette, pas une comptabilite. */
        const front = _lutteCandidats;
        front.length = 0;
        for (let i = 0; i < nb; i++) {
            const w = cel[i];
            if (w === LUTTE_VIDE || w === v) continue;
            let c = 0;
            for (let k = 0; k < 8; k++) {
                const j = _lutteVoisins8[i * 8 + k];
                if (j >= 0 && cel[j] === v) c++;
            }
            if (c) front.push({ i: i, n: c });
        }
        if (!front.length) continue;
        for (let i = 0; i < front.length; i++) {
            const f = front[i];
            f.p = f.n * 0.30 + grain[f.i] * 2.6 + Math.random() * 1.3;
        }
        front.sort(function (a, b) { return b.p - a.p; });
        for (let i = 0; i < front.length && cases > 0; i++) {
            const j = front[i].i;
            const perdant = cel[j];
            if (perdant === v || perdant === LUTTE_VIDE) continue;
            /* On ne prend pas a un camp qui est deja sous son objectif. */
            if (_lutteCompte[perdant] <= (vise[perdant] || 0)) continue;
            cel[j] = v;
            _lutteCompte[perdant]--;
            _lutteCompte[v]++;
            cases--;
        }
    }
    L.sale = true;
    let tot = 0;
    for (let v = 0; v < _lutteCompte.length; v++) tot += _lutteCompte[v];
    const majo = tot ? (tot - _lutteCompte[0]) / tot >= LUTTE_MAJORITE : false;
    if (L.majorite !== majo) { L.majorite = majo; marquerTerritoiresSales(); }
}

/* Le resume d'un instantane devient, ou met a jour, la bataille locale. */
function appliquerResumeLutte(body, lu) {
    if (!lu) { body.lutte = null; return; }
    _luttePrepare();
    const N = LUTTE_N;
    if (!body.lutte) {
        const cel = new Uint8Array(N * N);
        for (let i = 0; i < cel.length; i++) cel[i] = _lutteMasque[i] ? 0 : LUTTE_VIDE;
        body.lutte = { cellules: cel, assaut: {}, acc: 0, canvas: null, ctx: null, sale: true };
    }
    const L = body.lutte;
    L.assaut = {};
    /* Le serveur dit aussi si l'etranger est majoritaire : c'est lui qui
       decide si l'astre sort du groupement. */
    if (L.majorite !== !!lu.m) { L.majorite = !!lu.m; marquerTerritoiresSales(); }
    /* Les zones viennent du serveur : leurs chiffres font autorite. La grille
       locale n'est qu'une silhouette, ses numeros a elle ne servent a rien. */
    if (lu.z) {
        const zs = {};
        let totalCases = 0;
        for (let i = 0; i < lu.z.length; i++) totalCases += lu.z[i][2];
        for (let i = 0; i < lu.z.length; i++) {
            const t = lu.z[i];
            /* Le plafond ne voyage pas : il se recalcule ici a l'identique du
               serveur, sinon la courbe de naissance n'aurait pas d'echelle. */
            zs[t[0]] = { v: t[1], n: t[2], spores: t[3], rendement: t[4] / 100,
                         cx: t[5], cy: t[6], elan: 0,
                         plafond: (body.maxSpores || 1) * (t[2] / Math.max(1, totalCases)) };
        }
        L.zones = zs;
    }
    L.cible = { d: lu.d || 0, a: {} };
    for (let i = 0; i < (lu.a || []).length; i++) {
        const t = lu.a[i];
        L.assaut[t[0]] = t[1];
        L.cible.a[t[0]] = t[2];
        /* Un assaillant que le client ne connait pas encore n'a pas de tete de
           pont : on lui en pose une, sinon il n'aurait aucune case d'ou
           pousser et resterait invisible. */
        let tient = false;
        for (let c = 0; c < L.cellules.length; c++) if (L.cellules[c] === t[0] + 1) { tient = true; break; }
        if (!tient && t[2] > 0) engagerLutte(body, t[0], 0, Math.random() * Math.PI * 2);
    }
}

