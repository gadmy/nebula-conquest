// ─────────────────────────────────────────────
// VAISSEAUX CAPITAUX (spheres-carapaces)
// ─────────────────────────────────────────────
/* Trois spheres blindees, grandes comme des lunes, laissees par une race
   ancienne : une verte, une noire, une rouge (les couleurs des petits
   vaisseaux). Elles sortent du trou noir apres 3 minutes de jeu et
   errent lentement ; de temps en temps la verte passe pres du joueur le
   plus faible (et l'arrose), la noire pres du meilleur (et le saigne),
   puis elles repartent. La rouge se tient pres d'un soleil, loin des
   joueurs.
   - Seuls les petits vaisseaux d'une AUTRE couleur les attaquent (et
     peuvent les detruire) ; la sphere riposte, sans quitter son orbite.
     Les tirs de spores ne l'abiment pas (ils servent a la capturer), et
     pilotee par un joueur elle n'est plus attaquee.
   - Detruite : enorme explosion, les astres alentour tombent a zero spore
     et ne produisent plus rien pendant une minute. Elle revient 3 min plus
     tard, sur son orbite.
   - En passant pres d'un astre, la verte le mitraille de paquets de 5
     spores qui s'AJOUTENT (tous camps, neutres compris) ; la noire, de tirs
     qui en DETRUISENT 5. La rouge ne tire pas.
   - CAPTURE : un joueur qui lui envoie 20 000 spores en moins de 30 s en
     prend le controle 1 minute et la pilote (ZQSD, par des ordres : meme
     chose chez tous en reseau). Ecrasee sur une planete ou une lune : tous
     ses batiments detruits, zero spore et zero production pendant 1 min.
     Sur un soleil : toutes les planetes et lunes du systeme, zero spore et
     zero production pendant 1 min. La sphere est perdue dans le choc.
   Tout ce qui compte pour la partie passe par gameRandom et l'horloge du
   jeu ; le hasard du navigateur ne sert qu'aux effets (balles, eclats). */
const CAP_CFG = {
    rayon: 40, pv: 4000, retour: 180,
    eveil: 180,                           /* elles sortent du trou noir apres 3 min de jeu */
    emergence: 6,                         /* secondes pour sortir du trou noir */
    presage: 5,                           /* secondes ou le trou noir s'agite avant */
    vitesse: 40, virage: 0.35,            /* croisiere lente, cap qui tourne doucement (rad/s) */
    vitesseLoin: 85,                      /* en passage, loin du but (plus de 600) : les planetes vont vite */
    /* Verte et noire ERRENT, et de temps en temps PASSENT devant leur
       joueur (un coup de main, un coup de mal) avant de repartir : collees
       en permanence, elles etaient une arme offerte au meilleur joueur. */
    errance: { duree: 50, chancePassage: 0.35 },
    passage: { dureeMax: 90, repos: 60, sortie: 900 },
    engage: 250,                          /* un petit vaisseau attaque a cette distance du bord */
    /* Du spectacle : la sphere balaie les petits vaisseaux (2 ou 3 coups
       suffisent), eux l'egratignent a peine et elle se repare. Ce sont
       les joueurs qui doivent s'en emparer. */
    riposte: { cadence: 0.55, dmgMin: 35, dmgMax: 55, precision: 0.85, portee: 520 },
    blindage: 0.2,                        /* part des degats des petits vaisseaux qui passe */
    reparation: 25,                       /* PV par seconde, 5 s apres la derniere attaque */
    explosion: { rayon: 700, duree: 60 },
    mitraille: { portee: 240, portePilote: 350, cadence: 0.12, paquet: 5 },
    capture: { spores: 20000, fenetre: 30, duree: 60 },
    pilote: { vitesse: 130, inertie: 0.9 },
    panne: 60
};
const CAP_TEINTES = {
    green: { pierre: [70, 78, 64], accent: '80,220,80',   nom: 'verte' },
    dark:  { pierre: [52, 52, 64], accent: '140,140,170', nom: 'noire' },
    red:   { pierre: [88, 60, 54], accent: '220,70,60',   nom: 'rouge' }
};

/* A la creation de l'univers, apres les petits vaisseaux. Aucun tirage au
   hasard ici : la suite de la partie reste la meme qu'avant. Elles dorment
   dans le trou noir et n'en sortent qu'apres 3 minutes de jeu, l'une apres
   l'autre (sortie). */
function creerCapitaux() {
    gameState.capitaux = [];
    /* L'ancien multijoueur (serveur 2) ne les connait pas ; le tutoriel reste simple. */
    if (gameState.isMulti || gameState.isTutorial) return;
    const bh = gameState.blackHole;
    ['green', 'dark', 'red'].forEach(function (type, k) {
        gameState.capitaux.push({
            type: type, angle: k * Math.PI * 2 / 3 + 0.5, rOrbite: 0,
            x: bh.x, y: bh.y, rayon: CAP_CFG.rayon, pv: CAP_CFG.pv, mort: false, retour: 0,
            sortie: CAP_CFG.eveil + k * 8, annonce: 0,
            cap: k * Math.PI * 2 / 3 + 0.5, cible: '', cibleX: bh.x, cibleY: bh.y, decide: 0, joueur: -1,
            humeur: 'errance', errX: bh.x, errY: bh.y, etapeFin: 0, reposFin: CAP_CFG.eveil + k * 8 + 60,
            sortieX: 0, sortieY: 0,
            pilote: -1, piloteFin: 0, cmdX: 0, cmdY: 0, vx: 0, vy: 0,
            tirT: 0, riposteT: 0, apports: []
        });
    });
}

/* En jeu pour de bon : ni detruite, ni encore dans le trou noir. */
function capActive(C) {
    return !C.mort && gameState.time >= C.sortie + CAP_CFG.emergence;
}
function capitauxVivants() {
    return (gameState.capitaux || []).filter(capActive);
}

/* LA SORTIE DU TROU NOIR : elle part du centre et s'eloigne jusqu'a quitter
   la zone dangereuse, en grossissant. Rien ne l'atteint pendant ce temps. */
function sortieCapital(C) {
    const bh = gameState.blackHole;
    const f = Math.max(0, Math.min(1, (gameState.time - C.sortie) / CAP_CFG.emergence));
    const e = 1 - Math.pow(1 - f, 3);
    const d = (bh.radius + bh.dangerZone + C.rayon * 3) * e;
    C.x = bh.x + Math.cos(C.angle) * d;
    C.y = bh.y + Math.sin(C.angle) * d;
    C.cap = C.angle;
}

/* OU VA-T-ELLE ? Revu toutes les 4 s, a partir de la seule partie (meme
   choix chez tous les joueurs en reseau).
   - verte : vers le joueur le plus faible, pour l'arroser de spores ;
   - noire : vers le meilleur joueur, pour le saigner ;
   - rouge : pres d'un soleil, au point le plus eloigne des astres tenus
     par les joueurs. */
function forceJoueur(j) {
    let sp = 0;
    for (const b of j.bodies) sp += b.spores || 0;
    return j.bodies.length * 1e7 + sp;
}
function deciderCapital(C) {
    C.decide = gameState.time + 4;
    if (C.type === 'red') {
        const tenus = gameState.allBodies.filter(function (b) { return b.type !== 'sun' && b.owner !== null && b.owner !== undefined && b.owner >= 0; });
        let best = -1, bestS = 0, bestA = 0;
        gameState.suns.forEach(function (s, i) {
            for (let k = 0; k < 12; k++) {
                const a = k * Math.PI / 6;
                const px = s.x + Math.cos(a) * (s.radius + C.rayon + 220), py = s.y + Math.sin(a) * (s.radius + C.rayon + 220);
                let m = 1e9;
                for (const b of tenus) m = Math.min(m, Math.hypot(b.x - px, b.y - py));
                /* Un peu de fidelite a son choix d'avant : elle ne zigzague pas. */
                if (C.cible === 'soleil' + i + ':' + k) m *= 1.15;
                if (m > best) { best = m; bestS = i; bestA = a; }
            }
        });
        C.cible = 'soleil' + bestS + ':' + Math.round(bestA / (Math.PI / 6));
        return;
    }
    const t = gameState.time;
    if (C.humeur === 'sortie') {
        /* Passee : elle file au-dela de l'astre, puis reprend son errance. */
        if (t >= C.etapeFin || Math.hypot(C.sortieX - C.x, C.sortieY - C.y) < 150) nouvelleErrance(C);
        return;
    }
    if (C.humeur !== 'passage') {
        if (t < C.etapeFin && Math.hypot(C.errX - C.x, C.errY - C.y) > 150) return;
        /* Etape d'errance finie : un passage chez son joueur, ou ailleurs. */
        if (t >= C.reposFin && gameRandom() < CAP_CFG.errance.chancePassage) {
            C.humeur = 'passage';
            C.etapeFin = t + CAP_CFG.passage.dureeMax;
            C.cible = '';
        } else { nouvelleErrance(C); return; }
    } else if (t >= C.etapeFin) {
        /* Elle n'arrive pas a le rejoindre : elle laisse tomber. */
        C.reposFin = t + CAP_CFG.passage.repos;
        nouvelleErrance(C);
        return;
    }
    const joueurs = gameState.players.filter(function (j) { return j.alive && j.bodies && j.bodies.length; });
    if (!joueurs.length) { C.cible = ''; C.joueur = -1; nouvelleErrance(C); return; }
    let choisi = joueurs[0];
    for (const j of joueurs) {
        const d = forceJoueur(j) - forceJoueur(choisi);
        if (C.type === 'green' ? d < 0 : d > 0) choisi = j;
    }
    /* De la suite dans les idees : elle garde le joueur qu'elle suit tant
       qu'un autre n'est pas nettement plus faible (verte) ou plus fort
       (noire). Sans cela, entre deux joueurs presque egaux, elle faisait
       demi-tour toutes les 4 s. */
    const actuel = gameState.players[C.joueur];
    if (actuel && actuel.alive && actuel.bodies && actuel.bodies.length && actuel !== choisi) {
        const fa = forceJoueur(actuel), fc = forceJoueur(choisi);
        if (C.type === 'green' ? fc > fa * 0.8 : fc < fa * 1.25) choisi = actuel;
    }
    C.joueur = gameState.players.indexOf(choisi);
    /* Et l'astre qu'elle vise, tant qu'il est encore a ce joueur. */
    const garde = C.cible ? astreNomme(C.cible) : null;
    if (garde && garde.owner === C.joueur) return;
    let astre = null, bd = Infinity;
    for (const b of choisi.bodies) {
        const d = Math.hypot(b.x - C.x, b.y - C.y);
        if (d < bd) { bd = d; astre = b; }
    }
    C.cible = astre ? astre.name : '';
}

/* Un point au hasard dans la zone de jeu, loin du trou noir. */
function nouvelleErrance(C) {
    const bh = gameState.blackHole;
    const rMin = bh.radius + bh.dangerZone + 300;
    const rMax = Math.max(rMin + 200, (gameState._maxRangeCache || 2500) * 0.85);
    const a = gameRandom() * Math.PI * 2, r = rMin + gameRandom() * (rMax - rMin);
    C.humeur = 'errance';
    C.errX = bh.x + Math.cos(a) * r; C.errY = bh.y + Math.sin(a) * r;
    C.etapeFin = gameState.time + CAP_CFG.errance.duree;
    C.cible = '';
}

/* En passage, a portee de mitrailleuse : elle ne s'arrete pas, elle file
   droit au-dela de l'astre et ressort de l'autre cote. */
function lancerSortiePassage(C, b) {
    const dx = b.x - C.x, dy = b.y - C.y, d = Math.hypot(dx, dy) || 1;
    let px = b.x + dx / d * CAP_CFG.passage.sortie, py = b.y + dy / d * CAP_CFG.passage.sortie;
    const R = (gameState._maxRangeCache || 2500) * 0.9, n = Math.hypot(px, py);
    if (n > R) { px *= R / n; py *= R / n; }
    C.humeur = 'sortie';
    C.sortieX = px; C.sortieY = py;
    C.etapeFin = gameState.time + 30;
    C.reposFin = gameState.time + CAP_CFG.passage.repos;
    C.decide = gameState.time + 4;
}

/* Le point vise, recalcule a chaque tour : astres et soleils bougent. */
function pointCible(C) {
    if (C.type !== 'red') {
        if (C.humeur === 'errance') return [C.errX, C.errY];
        if (C.humeur === 'sortie') return [C.sortieX, C.sortieY];
    }
    if (C.cible.indexOf('soleil') === 0) {
        const m = C.cible.slice(6).split(':');
        const s = gameState.suns[+m[0]];
        if (s) {
            const a = (+m[1]) * Math.PI / 6;
            return [s.x + Math.cos(a) * (s.radius + C.rayon + 220), s.y + Math.sin(a) * (s.radius + C.rayon + 220)];
        }
    }
    const b = C.cible ? astreNomme(C.cible) : null;
    /* En passage : droit sur l'astre (elle bifurque a portee de tir). */
    if (b && C.type !== 'red' && C.humeur === 'passage') return [b.x, b.y];
    if (b) {
        /* Au large de l'astre, a portee de mitrailleuse, du cote ou elle arrive. */
        const dx = C.x - b.x, dy = C.y - b.y, d = Math.hypot(dx, dy) || 1;
        const r = b.radius + C.rayon + 140;
        let px = b.x + dx / d * r, py = b.y + dy / d * r;
        /* Hors de la zone de jeu (astre du bord) : on passe de l'autre cote. */
        const R = (gameState._maxRangeCache || 2500) - C.rayon;
        if (Math.hypot(px, py) > R) {
            const ux = -b.x, uy = -b.y, un = Math.hypot(ux, uy) || 1;
            px = b.x + ux / un * r; py = b.y + uy / un * r;
        }
        return [px, py];
    }
    const bh = gameState.blackHole;
    const r = bh.radius + bh.dangerZone + 600;
    return [bh.x + Math.cos(C.cap + 0.3) * r, bh.y + Math.sin(C.cap + 0.3) * r];
}

/* Un pas de route : cap qui tourne lentement vers le but, vitesse de
   croisiere, et on s'ecarte des astres et du trou noir sans les toucher. */
function naviguerCapital(C, dt) {
    const t = gameState.time;
    if (t >= C.decide) deciderCapital(C);
    if (C.humeur === 'passage' && C.cible) {
        const b = astreNomme(C.cible);
        if (b && Math.hypot(b.x - C.x, b.y - C.y) - b.radius - C.rayon < CAP_CFG.mitraille.portee * 0.8) lancerSortiePassage(C, b);
    }
    const P = pointCible(C);
    C.cibleX = P[0]; C.cibleY = P[1];
    let dx = P[0] - C.x, dy = P[1] - C.y;
    const dist = Math.hypot(dx, dy);
    /* En passage elle fonce sans ralentir (la planete tourne, elle lui
       echappait) ; en errance elle ralentit en arrivant. */
    let vit = C.humeur === 'passage' ? CAP_CFG.vitesseLoin
            : CAP_CFG.vitesse * (C.humeur === 'sortie' ? 1 : Math.min(1, dist / 250));
    /* Ecartement : astres, soleils, trou noir. */
    let ex = 0, ey = 0;
    for (const b of [...gameState.suns, ...gameState.allBodies]) {
        const bx = C.x - b.x, by = C.y - b.y, d = Math.hypot(bx, by) || 1;
        const marge = b.radius + C.rayon + 60;
        if (d < marge) { const k = (marge - d) / marge; ex += bx / d * k * 3; ey += by / d * k * 3; }
    }
    const bh = gameState.blackHole;
    const hx = C.x - bh.x, hy = C.y - bh.y, hd = Math.hypot(hx, hy) || 1;
    const hm = bh.radius + bh.dangerZone + C.rayon * 2;
    if (hd < hm) { const k = (hm - hd) / hm; ex += hx / hd * k * 4; ey += hy / hd * k * 4; }
    /* ANTICIPER soleils et trou noir : un obstacle droit devant, sur la
       route actuelle, fait virer tot et plus vite, du cote ou elle passe
       deja. Sans cela, lourde et lente a tourner, elle s'y consumait. */
    let alerte = 0;
    const ux = Math.cos(C.cap), uy = Math.sin(C.cap);
    for (const o of obstaclesFixes()) {
        const ox = o.x - C.x, oy = o.y - C.y, od = Math.hypot(ox, oy) || 1;
        const bord = od - o.r - C.rayon;
        if (bord > 500) continue;
        const devant = ox * ux + oy * uy, cote = -ox * uy + oy * ux;
        if (devant > 0 && Math.abs(cote) < o.r + C.rayon + 120) {
            const k = (1 - Math.max(0, bord) / 500) * 4;
            const sg = cote >= 0 ? -1 : 1;
            ex += -uy * sg * k; ey += ux * sg * k;
            alerte = Math.max(alerte, k / 4);
        }
        if (bord < 120) { const k = (1 - Math.max(0, bord) / 120) * 4; ex -= ox / od * k; ey -= oy / od * k; alerte = 1; }
    }
    const n = Math.hypot(dx, dy) || 1;
    dx = dx / n + ex; dy = dy / n + ey;
    if (ex || ey) vit = Math.max(vit, CAP_CFG.vitesse * 0.6);
    /* Le cap tourne vers la direction voulue, sans a-coup (plus vite face a un obstacle). */
    const voulu = Math.atan2(dy, dx);
    let ecart = voulu - C.cap;
    while (ecart > Math.PI) ecart -= Math.PI * 2;
    while (ecart < -Math.PI) ecart += Math.PI * 2;
    const tour = CAP_CFG.virage * (1 + alerte * 3) * dt;
    C.cap += Math.max(-tour, Math.min(tour, ecart));
    if (C.cap > Math.PI) C.cap -= Math.PI * 2; else if (C.cap < -Math.PI) C.cap += Math.PI * 2;
    C.vitX = Math.cos(C.cap) * vit; C.vitY = Math.sin(C.cap) * vit;
    C.x += C.vitX * dt;
    C.y += C.vitY * dt;
    const R = gameState._maxRangeCache || 2500;
    const d = Math.hypot(C.x, C.y);
    if (d > R) { C.x *= R / d; C.y *= R / d; }
}

/* Un tour de calcul. */
function majCapitaux(dt) {
    const L = gameState.capitaux;
    if (!L || !L.length) return;
    const t = gameState.time;
    for (const C of L) {
        if (C.mort) {
            if (t >= C.retour) reapparaitreCapital(C);
            continue;
        }
        if (t < C.sortie) continue;
        if (t < C.sortie + CAP_CFG.emergence) {
            if (!C.annonce) {
                C.annonce = 1;
                addEvent('war', '🕳', 'La sphère ' + CAP_TEINTES[C.type].nom + ' sort du trou noir !', null, 'rgb(' + CAP_TEINTES[C.type].accent + ')');
            }
            sortieCapital(C);
            continue;
        }
        if (C.pilote >= 0 && t >= C.piloteFin) finPilotage(C);
        /* Tenue par une IA : c'est elle qui tient la barre. */
        if (C.pilote >= 0 && gameState.players[C.pilote] && !gameState.players[C.pilote].isHuman) iaPiloteCapital(C);
        if (C.pilote >= 0) {
            /* Pilotee : lourde, elle prend son elan lentement. */
            const n = Math.hypot(C.cmdX, C.cmdY);
            const cx = n ? C.cmdX / n : 0, cy = n ? C.cmdY / n : 0;
            const k = Math.min(1, dt * CAP_CFG.pilote.inertie);
            C.vx += (cx * CAP_CFG.pilote.vitesse - C.vx) * k;
            C.vy += (cy * CAP_CFG.pilote.vitesse - C.vy) * k;
            C.x += C.vx * dt; C.y += C.vy * dt;
            const R = gameState._maxRangeCache || 2500;
            const d = Math.hypot(C.x, C.y);
            if (d > R) { C.x *= R / d; C.y *= R / d; C.vx *= 0.5; C.vy *= 0.5; }
            if (collisionCapital(C)) continue;
        } else {
            naviguerCapital(C, dt);
            /* Libre, elle contourne soleils et trou noir ; si elle y entre
               quand meme, elle s'y consume. */
            const o = obstaclesFixes().find(function (q) { return Math.hypot(C.x - q.x, C.y - q.y) < q.r + C.rayon * 0.5; });
            if (o) {
                addEvent('neutral', '🔥', 'La sphère ' + CAP_TEINTES[C.type].nom + ' se consume ' + (o.r === gameState.blackHole.radius && o.x === gameState.blackHole.x ? 'dans le trou noir' : 'dans un soleil'), null, '#FFB347');
                detruireCapital(C, false);
                continue;
            }
        }
        mitraillerCapital(C, dt);
    }
    duelsCapitaux(dt);
}

/* Les petits vaisseaux d'une autre couleur s'en prennent a la sphere. */
function duelsCapitaux(dt) {
    const caps = capitauxVivants();
    for (const cl of gameState.cleaners) {
        if (cl.mort || cl._duel) { cl._cap = null; continue; }
        let C = cl._cap;
        /* Pilotee par un joueur, elle n'est plus une cible. */
        if (C && (C.mort || C.pilote >= 0 || Math.hypot(C.x - cl.x, C.y - cl.y) > C.rayon + CAP_CFG.riposte.portee * 1.6)) C = cl._cap = null;
        if (!C) {
            for (const K of caps) {
                if (K.type === cl.type || K.pilote >= 0) continue;
                if (Math.hypot(K.x - cl.x, K.y - cl.y) < K.rayon + CAP_CFG.engage) { C = cl._cap = K; cl._tirT = DUEL_CFG.cadence * gameRandom(); break; }
            }
        }
        if (!C) continue;
        /* Il tourne autour de la sphere en tirant. */
        const dx = C.x - cl.x, dy = C.y - cl.y, d = Math.hypot(dx, dy) || 1;
        const ang = Math.atan2(dy, dx) + (d < C.rayon + 170 ? 1.25 : 0.4);
        const v = CLN_CFG.speedMax;
        cl.vx += (Math.cos(ang) * v - cl.vx) * Math.min(1, dt * 2.5);
        cl.vy += (Math.sin(ang) * v - cl.vy) * Math.min(1, dt * 2.5);
        cl._tirT = (cl._tirT || 0) - dt;
        if (cl._tirT <= 0 && d < C.rayon + CAP_CFG.riposte.portee) {
            cl._tirT = DUEL_CFG.cadence * (0.8 + gameRandom() * 0.4);
            const touche = gameRandom() < DUEL_CFG.precision;
            _tirLaser(cl, C, touche);
            if (touche) {
                C.pv -= (DUEL_CFG.dmgMin + gameRandom() * (DUEL_CFG.dmgMax - DUEL_CFG.dmgMin)) * CAP_CFG.blindage;
                C.touchee = gameState.time;
                if (C.pv <= 0) { detruireCapital(C, true); }
            }
        }
    }
    /* La sphere riposte sur le plus proche de ses assaillants. */
    for (const C of caps) {
        if (C.mort) continue;
        if (C.pv < CAP_CFG.pv && gameState.time - (C.touchee || 0) > 5) C.pv = Math.min(CAP_CFG.pv, C.pv + CAP_CFG.reparation * dt);
        C.riposteT -= dt;
        if (C.riposteT > 0) continue;
        let cible = null, best = C.rayon + CAP_CFG.riposte.portee;
        for (const cl of gameState.cleaners) {
            if (cl.mort || cl._cap !== C) continue;
            const d = Math.hypot(cl.x - C.x, cl.y - C.y);
            if (d < best) { best = d; cible = cl; }
        }
        if (!cible) continue;
        C.riposteT = CAP_CFG.riposte.cadence * (0.8 + gameRandom() * 0.4);
        const touche = gameRandom() < CAP_CFG.riposte.precision;
        _tirLaser(C, cible, touche);
        if (touche) {
            cible.pv = (cible.pv === undefined ? DUEL_CFG.pv : cible.pv) - (CAP_CFG.riposte.dmgMin + gameRandom() * (CAP_CFG.riposte.dmgMax - CAP_CFG.riposte.dmgMin));
            if (cible.pv <= 0) {
                cible.pv = 0; cible.mort = true; cible._duel = null; cible._cap = null;
                cible.retour = gameState.time + DUEL_CFG.retourMin + gameRandom() * (DUEL_CFG.retourMax - DUEL_CFG.retourMin);
                exploserVaisseau(cible);
            }
        }
    }
}

/* Verte : +5 spores par balle ; noire : -5. Sur l'astre le plus proche a
   portee. PILOTEE, elle tire pour son pilote, et plus loin : la verte
   n'arrose que ses astres, la noire ne ronge que ceux de ses adversaires
   (avant, elle visait l'astre le plus proche, souvent un neutre ou un
   astre du pilote lui-meme). */
function mitraillerCapital(C, dt) {
    if (C.type === 'red') return;
    C.tirT -= dt;
    if (C.tirT > 0) return;
    const pilote = C.pilote;
    const portee = pilote >= 0 ? CAP_CFG.mitraille.portePilote : CAP_CFG.mitraille.portee;
    let cible = null, best = Infinity;
    for (const b of gameState.allBodies) {
        if (b.type === 'sun') continue;
        if (pilote >= 0) {
            const aLui = b.owner === pilote;
            const adverse = b.owner !== null && b.owner !== undefined && b.owner >= 0 && !aLui;
            if (C.type === 'green' ? !aLui : !adverse) continue;
        }
        const d = Math.hypot(b.x - C.x, b.y - C.y) - b.radius - C.rayon;
        if (d < portee && d < best) { best = d; cible = b; }
    }
    if (!cible) { C.tirT = 0; return; }
    C.tirT = CAP_CFG.mitraille.cadence;
    const p = CAP_CFG.mitraille.paquet;
    const avant = cible.spores || 0;
    /* Assiege ou non : les helpers passent par les zones d'un astre en lutte. */
    if (C.type === 'green') ajouterSpores(cible, p);
    else retirerSpores(cible, p);
    /* La balle (dessin seulement) : elle file vers la face de l'astre
       tournee vers la sphere et s'y ecrase, en faisant sauter le gain ou
       la perte. */
    if (!gameState._balles) gameState._balles = [];
    gameState._balles.push({ x1: C.x, y1: C.y, astre: cible, ecart: (Math.random() - 0.5) * 1.3,
                             t0: gameState.time, delta: Math.round(cible.spores - avant),
                             couleur: 'rgb(' + CAP_TEINTES[C.type].accent + ')' });
}

/* Un tir de spores touche une sphere : il s'y perd. S'il vient d'un joueur,
   il compte pour la capture. Rend vrai si le tir a ete absorbe. */
function tirContreCapitaux(jet) {
    const L = gameState.capitaux;
    if (!L || !L.length) return false;
    for (const C of L) {
        if (!capActive(C)) continue;
        if (Math.hypot(jet.x - C.x, jet.y - C.y) > C.rayon + 4) continue;
        jet.alive = false;
        spawnImpact(jet.x, jet.y, jet.color || '#FFFFFF');
        if (jet.owner >= 0 && C.pilote < 0 && gameState.players[jet.owner]) {
            const tour = gameState.tour || 0;
            C.apports.push([jet.owner, tour, Math.max(0, Math.floor(jet.spores || 0))]);
            const limite = tour - CAP_CFG.capture.fenetre * 60;
            C.apports = C.apports.filter(function (a) { return a[1] > limite; });
            let total = 0;
            for (const a of C.apports) if (a[0] === jet.owner) total += a[2];
            if (total >= CAP_CFG.capture.spores) capturerCapital(C, jet.owner);
        }
        return true;
    }
    return false;
}

/* Les spores envoyees par chaque joueur dans les 30 dernieres secondes. */
function jaugeCapture(C) {
    const par = {};
    const limite = (gameState.tour || 0) - CAP_CFG.capture.fenetre * 60;
    for (const a of (C.apports || [])) if (a[1] > limite) par[a[0]] = (par[a[0]] || 0) + a[2];
    let slot = -1, n = 0;
    for (const k in par) if (par[k] > n) { n = par[k]; slot = +k; }
    return { slot: slot, n: n };
}

function capturerCapital(C, slot) {
    const j = gameState.players[slot];
    C.pilote = slot;
    C.piloteFin = gameState.time + CAP_CFG.capture.duree;
    C.cmdX = 0; C.cmdY = 0; C.vx = 0; C.vy = 0;
    C.apports = [];
    C.cibleIA = '';
    /* Ce qu'elle touche deja au moment de la capture ne compte pas : sans
       cela, prise en frolant une lune, elle s'y ecrasait aussitot. */
    C.ignore = [];
    for (const b of [...gameState.suns, ...gameState.allBodies]) {
        if (Math.hypot(C.x - b.x, C.y - b.y) < b.radius + C.rayon + 10 && C.ignore.indexOf(b.name) < 0) C.ignore.push(b.name);
    }
    addEvent('war', '🛸', j.name + ' prend le contrôle de la sphère ' + CAP_TEINTES[C.type].nom + ' !', null, j.color);
    if (!gameState._ondes) gameState._ondes = [];
    gameState._ondes.push({ x: C.x, y: C.y, r0: C.rayon, r1: C.rayon * 3, age: 0, maxAge: 0.9, couleur: _rgbDe(j.color || '#FFFFFF'), ep: 3 });
    if (slot === localSlot()) playConquestSound();
}

function finPilotage(C) {
    /* Elle reprend sa route a partir de l'endroit ou on l'a laissee. */
    if (C.vx || C.vy) C.cap = Math.atan2(C.vy, C.vx);
    C.pilote = -1; C.cmdX = 0; C.cmdY = 0; C.vx = 0; C.vy = 0; C.ignore = [];
    C.decide = gameState.time;
}

/* Pilotee, elle s'ecrase sur ce qu'elle touche. Rend vrai si elle est detruite. */
function collisionCapital(C) {
    const bh = gameState.blackHole;
    /* Un astre ignore redevient un obstacle une fois qu'on s'en est ecarte. */
    const touche = function (b) {
        const dedans = Math.hypot(C.x - b.x, C.y - b.y) < b.radius + C.rayon;
        const k = C.ignore ? C.ignore.indexOf(b.name) : -1;
        if (k >= 0) {
            if (Math.hypot(C.x - b.x, C.y - b.y) > b.radius + C.rayon + 20) C.ignore.splice(k, 1);
            return false;
        }
        return dedans;
    };
    if (Math.hypot(C.x - bh.x, C.y - bh.y) < bh.radius * 0.6 + C.rayon) {
        addEvent('neutral', '🕳', 'La sphère ' + CAP_TEINTES[C.type].nom + ' disparaît dans le trou noir', null, '#888888');
        detruireCapital(C, false);
        return true;
    }
    for (const s of gameState.suns) {
        if (touche(s)) {
            const touches = [];
            for (const p of (s.planets || [])) { touches.push(p); for (const m of (p.moons || [])) touches.push(m); }
            for (const b of touches) { viderSpores(b); b.panne = gameState.time + CAP_CFG.panne; }
            /* L'etoile encaisse le choc, puis chaque monde du systeme s'embrase a son tour. */
            const ax = s.x + (C.x - s.x) * s.radius / (s.radius + C.rayon), ay = s.y + (C.y - s.y) * s.radius / (s.radius + C.rayon);
            lancerApocalypse(ax, ay, Math.max(260, s.radius * 2.6), CAP_TEINTES[C.type].accent, 0);
            touches.forEach(function (b, k) {
                lancerApocalypse(b.x, b.y, Math.max(70, b.radius * 1.6), '255,160,80', 0.5 + Math.hypot(b.x - s.x, b.y - s.y) / 1400 + (k % 3) * 0.1, true);
            });
            addEvent('war', '☀', 'La sphère ' + CAP_TEINTES[C.type].nom + ' s\'écrase sur ' + s.name + ' : tout le système est paralysé 1 min', s, '#FFB347');
            detruireCapital(C, false);
            return true;
        }
    }
    for (const b of gameState.allBodies) {
        if (b.type === 'sun') continue;
        if (touche(b)) {
            for (const e of edifices(b)) effetDemolition(b, e);
            b.edifices = [];
            b.nids = 0; b.alveoles = 0; b.biomes = 0;
            b.buildMode = 'off';
            viderSpores(b);
            b.panne = gameState.time + CAP_CFG.panne;
            const ax = b.x + (C.x - b.x) * b.radius / (b.radius + C.rayon), ay = b.y + (C.y - b.y) * b.radius / (b.radius + C.rayon);
            lancerApocalypse(ax, ay, Math.max(180, b.radius * 2.4), CAP_TEINTES[C.type].accent, 0);
            addEvent('war', '💥', 'La sphère ' + CAP_TEINTES[C.type].nom + ' s\'écrase sur ' + b.name + ' : bâtiments détruits', b, '#FF7A1A');
            detruireCapital(C, false);
            return true;
        }
    }
    return false;
}

/* abattue = detruite par les petits vaisseaux : l'onde de choc paralyse les
   astres alentour. Sinon (ecrasee), l'effet est celui du choc, deja fait. */
function detruireCapital(C, abattue) {
    C.mort = true; C.pv = 0; C.pilote = -1; C.apports = [];
    C.retour = gameState.time + CAP_CFG.retour;
    for (const cl of gameState.cleaners) if (cl._cap === C) cl._cap = null;
    if (abattue) {
        for (const b of gameState.allBodies) {
            if (b.type === 'sun') continue;
            if (Math.hypot(b.x - C.x, b.y - C.y) - b.radius > CAP_CFG.explosion.rayon) continue;
            viderSpores(b);
            b.panne = gameState.time + CAP_CFG.explosion.duree;
        }
        addEvent('war', '💥', 'La sphère ' + CAP_TEINTES[C.type].nom + ' explose : les astres voisins sont paralysés 1 min', null, '#FF7A1A');
        lancerApocalypse(C.x, C.y, 240, CAP_TEINTES[C.type].accent, 0);
    }
    /* L'explosion, a la mesure de l'engin. */
    const c = CAP_TEINTES[C.type].accent;
    if (!gameState._ondes) gameState._ondes = [];
    gameState._ondes.push({ x: C.x, y: C.y, r0: C.rayon, r1: abattue ? CAP_CFG.explosion.rayon : C.rayon * 5, age: 0, maxAge: 1.6, couleur: '255,170,80', ep: 6 });
    gameState._ondes.push({ x: C.x, y: C.y, r0: C.rayon * 0.5, r1: C.rayon * 4, age: 0, maxAge: 1.0, couleur: c, ep: 4 });
    gameState._ondes.push({ x: C.x, y: C.y, r0: 4, r1: C.rayon * 2.5, age: 0, maxAge: 0.6, couleur: '255,255,255', ep: 3 });
    for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        spawnImpact(C.x + Math.cos(a) * C.rayon * 0.8, C.y + Math.sin(a) * C.rayon * 0.8, k % 2 ? '#FFB347' : couleurHex('rgb(' + c + ')'));
    }
    if (typeof playCleanerSound === 'function') playCleanerSound(C.x, C.y);
}

/* Detruite, elle renait dans le trou noir et en ressort. */
function reapparaitreCapital(C) {
    const bh = gameState.blackHole;
    C.mort = false; C.pv = CAP_CFG.pv; C.pilote = -1; C.apports = [];
    C.sortie = gameState.time; C.annonce = 0;
    C.humeur = 'errance'; C.etapeFin = 0; C.cible = '';
    C.reposFin = gameState.time + CAP_CFG.emergence + 60;
    C.angle += 2.4;
    C.x = bh.x; C.y = bh.y;
    C._avX = undefined; C._trace = [];
}

/* PILOTAGE AU CLAVIER : appele a chaque image par la camera clavier. Si le
   joueur tient une sphere, ZQSD la dirige (un ordre a chaque changement de
   direction) et la camera la suit. Rend vrai si le clavier a servi. */
function pilotageCapital(h, v) {
    const L = gameState.capitaux;
    if (!L || gameState.phase !== 'game' || gameState.isSpectator) return false;
    const moi = localSlot();
    const k = L.findIndex(function (C) { return capActive(C) && C.pilote === moi; });
    if (k < 0) return false;
    const C = L[k];
    if (!gameState._pilotage || gameState._pilotage.k !== k || gameState._pilotage.h !== h || gameState._pilotage.v !== v) {
        gameState._pilotage = { k: k, h: h, v: v };
        donnerOrdre('capital', { k: k, dx: h, dy: v });
    }
    const cam = gameState.camera;
    cam.x += (C.x - cam.x) * 0.12;
    cam.y += (C.y - cam.y) * 0.12;
    return true;
}

/* Une balle de mitrailleuse arrive sur la surface : petites etincelles a la
   couleur du tireur, et le gain ou la perte qui saute. */
function eclatBalle(b, ang) {
    const P = gameState.particles;
    if (P) {
        for (let k = 0; k < 5; k++) {
            const a = ang + (Math.random() - 0.5) * 1.6, v = 60 + Math.random() * 90;
            P.push({ x: b.x2, y: b.y2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0,
                     maxLife: 0.25 + Math.random() * 0.25, radius: 1 + Math.random() * 1.2, color: b.couleur });
        }
    }
    if (!b.delta) return;
    const z = gameState.camera.zoom || 1;
    gameState.conquestEffects.push({ x: b.x2, y: b.y2 - 8 / z, baseX: b.x2,
        text: (b.delta > 0 ? '+' : '') + b.delta, color: b.delta > 0 ? '#4ADE80' : '#F87171',
        age: 0, maxAge: 0.9, petit: true });
}

/* L'APOCALYPSE : une sphere capitale s'ecrase sur un astre ou un soleil.
   Eclair blanc, boule de feu, ondes de choc, gerbes d'etincelles, nuages de
   gaz ejectes qui derivent et se dissipent, debris. Dessin seulement (hasard
   du navigateur) : la partie, elle, a deja ete touchee. taille : le rayon de
   la boule de feu au plus fort. */
/* Une tache lumineuse ronde et douce, dessinee une fois par couleur puis
   reutilisee (drawImage) : creer des degrades a chaque image pour chaque
   nuage coutait jusqu'a 16 ms par image pendant une explosion. */
const _taches = {};
function tacheDouce(c) {
    if (_taches[c]) return _taches[c];
    const n = 64, cv = document.createElement('canvas');
    cv.width = cv.height = n * 2;
    const x = cv.getContext('2d');
    const g = x.createRadialGradient(n, n, 0, n, n, n);
    g.addColorStop(0, 'rgba(' + c + ',1)');
    g.addColorStop(0.45, 'rgba(' + c + ',0.45)');
    g.addColorStop(1, 'rgba(' + c + ',0)');
    x.fillStyle = g;
    x.fillRect(0, 0, n * 2, n * 2);
    _taches[c] = cv;
    return cv;
}

function lancerApocalypse(x, y, taille, accent, retard, petite) {
    if (!gameState._apocalypses) gameState._apocalypses = [];
    const r = Math.random;
    const etincelles = [], nuages = [], debris = [];
    const feux = ['255,240,200', '255,190,90', '255,120,40', accent];
    const nE = petite ? 24 : 110, nN = petite ? 4 : 18, nD = petite ? 5 : 20;
    for (let k = 0; k < nE; k++) {
        etincelles.push({ a: r() * Math.PI * 2, v: taille * (1.2 + r() * 3.8), vie: 0.8 + r() * 2.2,
                          c: k % feux.length, e: 0.6 + r() * 1.4 });
    }
    const gaz = ['255,140,50', '230,80,40', '160,70,200', accent, '255,200,120'];
    for (let k = 0; k < nN; k++) {
        nuages.push({ a: r() * Math.PI * 2, v: taille * (0.15 + r() * 0.9), r0: taille * (0.3 + r() * 0.5),
                      r1: taille * (0.9 + r() * 1.3), vie: 3.5 + r() * 3.5, c: gaz[k % gaz.length],
                      tourne: (r() - 0.5) * 0.6 });
    }
    for (let k = 0; k < nD; k++) {
        debris.push({ a: r() * Math.PI * 2, v: taille * (0.6 + r() * 2.2), vie: 2 + r() * 2.5,
                      t: taille * (0.03 + r() * 0.06), rot: r() * 6, vr: (r() - 0.5) * 8 });
    }
    /* Les taches se preparent ici, pas a la premiere image de l'explosion. */
    tacheDouce('255,250,235'); tacheDouce('255,160,60'); tacheDouce('255,245,210');
    for (const c of gaz) tacheDouce(c);
    gameState._apocalypses.push({ x: x, y: y, t0: gameState.time + (retard || 0), taille: taille, accent: accent,
                                  feux: feux, etincelles: etincelles, nuages: nuages, debris: debris,
                                  secoue: !!petite });
}

function drawApocalypses(ctx) {
    const L = gameState._apocalypses;
    if (!L || !L.length) return;
    const t = gameState.time;
    const z = gameState.camera.zoom;
    const px = 1 / z;
    const a0 = ctx.globalAlpha, op0 = ctx.globalCompositeOperation;
    for (let i = L.length - 1; i >= 0; i--) {
        const E = L[i];
        const age = t - E.t0;
        if (age < 0) continue;
        if (age > 7) { L.splice(i, 1); continue; }
        const T = E.taille;
        if (!E.secoue) {
            E.secoue = true;
            if (aLEcran(E.x, E.y, T * 2)) secouerEcran(Math.min(60, 18 + T * z * 0.12));
            if (typeof playCleanerSound === 'function') playCleanerSound(E.x, E.y);
        }
        if (!aLEcran(E.x, E.y, T * 5)) continue;
        ctx.globalCompositeOperation = 'lighter';
        /* Nuages de gaz ejectes : ils filent, ralentissent, gonflent et se dissipent. */
        for (const N of E.nuages) {
            if (age > N.vie) continue;
            const f = age / N.vie;
            const d = N.v * (1 - Math.pow(1 - Math.min(1, age / 3), 2)) * 3;
            const a = N.a + N.tourne * age;
            const rr = N.r0 + (N.r1 - N.r0) * Math.min(1, age / 2.5);
            ctx.globalAlpha = (f < 0.15 ? f / 0.15 : 1) * (1 - f) * 0.55;
            ctx.drawImage(tacheDouce(N.c), E.x + Math.cos(a) * d - rr, E.y + Math.sin(a) * d - rr, rr * 2, rr * 2);
        }
        /* Eclair blanc, puis boule de feu qui gonfle et s'eteint. */
        if (age < 0.5) {
            const f = age / 0.5, rr = T * (0.6 + f * 2.8);
            ctx.globalAlpha = 1 - f;
            ctx.drawImage(tacheDouce('255,250,235'), E.x - rr, E.y - rr, rr * 2, rr * 2);
        }
        if (age < 2.5) {
            const f = age / 2.5, rr = T * (0.3 + 0.9 * Math.sqrt(f));
            ctx.globalAlpha = 0.9 * (1 - f);
            ctx.drawImage(tacheDouce('255,160,60'), E.x - rr, E.y - rr, rr * 2, rr * 2);
            ctx.globalAlpha = 0.9 * (1 - f) * (1 - f);
            ctx.drawImage(tacheDouce('255,245,210'), E.x - rr * 0.5, E.y - rr * 0.5, rr, rr);
        }
        ctx.globalAlpha = 1;
        /* Trois ondes de choc. */
        for (let k = 0; k < 3; k++) {
            const f = (age - k * 0.25) / (1.4 + k * 0.8);
            if (f <= 0 || f >= 1) continue;
            ctx.strokeStyle = 'rgba(' + (k === 1 ? E.accent : '255,210,150') + ',' + ((1 - f) * 0.7) + ')';
            ctx.lineWidth = Math.max(2 * px, T * 0.08 * (1 - f));
            ctx.beginPath(); ctx.arc(E.x, E.y, T * (0.5 + f * (4 + k * 1.5)), 0, Math.PI * 2); ctx.stroke();
        }
        /* Etincelles : un seul trace par couleur et par palier d'eclat. */
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1.2 * px, T * 0.015);
        for (let c = 0; c < E.feux.length; c++) {
            for (let palier = 0; palier < 3; palier++) {
                let n = 0;
                ctx.beginPath();
                for (const S of E.etincelles) {
                    if (S.c !== c || age > S.vie) continue;
                    if (Math.min(2, Math.floor(age / S.vie * 3)) !== palier) continue;
                    const d = S.v * (1 - Math.exp(-age * 1.6)) / 1.6;
                    const d0 = S.v * (1 - Math.exp(-Math.max(0, age - 0.08) * 1.6)) / 1.6;
                    const ca = Math.cos(S.a), sa = Math.sin(S.a);
                    ctx.moveTo(E.x + ca * d0, E.y + sa * d0);
                    ctx.lineTo(E.x + ca * d, E.y + sa * d);
                    n++;
                }
                if (!n) continue;
                ctx.strokeStyle = 'rgba(' + E.feux[c] + ',' + (1 - (palier + 0.5) / 3) + ')';
                ctx.stroke();
            }
        }
        /* Eclats de blindage : un seul trace pour tous. */
        ctx.globalCompositeOperation = 'source-over';
        let nD = 0, fd = 0;
        ctx.beginPath();
        for (const D of E.debris) {
            if (age > D.vie) continue;
            fd += age / D.vie; nD++;
            const d = D.v * (1 - Math.exp(-age * 1.1)) / 1.1;
            const cx = E.x + Math.cos(D.a) * d, cy = E.y + Math.sin(D.a) * d;
            const r = D.rot + D.vr * age, cr = Math.cos(r), sr = Math.sin(r);
            const w = D.t, h = D.t * 0.6;
            ctx.moveTo(cx + cr * w - sr * h, cy + sr * w + cr * h);
            ctx.lineTo(cx - cr * w - sr * h, cy - sr * w + cr * h);
            ctx.lineTo(cx - cr * w + sr * h, cy - sr * w - cr * h);
            ctx.lineTo(cx + cr * w + sr * h, cy + sr * w - cr * h);
            ctx.closePath();
        }
        if (nD) {
            const al = 1 - fd / nD;
            ctx.fillStyle = 'rgba(70,65,70,' + al + ')';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,150,70,' + (0.8 * al) + ')';
            ctx.lineWidth = Math.max(px, T * 0.01);
            ctx.stroke();
        }
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op0;
}

/* LE PRESAGE : quelques secondes avant la sortie, le trou noir s'agite.
   Bras de lumiere a la couleur de la sphere qui tournent de plus en plus
   vite, lueur qui enfle et palpite. reste : secondes avant la sortie. */
function dessinerPresage(ctx, C, reste, z) {
    const bh = gameState.blackHole;
    if (!aLEcran(bh.x, bh.y, bh.radius * 4)) return;
    const T = CAP_TEINTES[C.type];
    const f = 1 - reste / CAP_CFG.presage;              /* 0 -> 1 a l'approche */
    const t = gameState.time;
    const a0 = ctx.globalAlpha, op0 = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    const pouls = 0.6 + 0.4 * Math.sin(t * (4 + f * 14));
    const rr = bh.radius * (0.9 + f * 1.2);
    ctx.globalAlpha = 0.25 + 0.55 * f * pouls;
    ctx.drawImage(tacheDouce(T.accent), bh.x - rr, bh.y - rr, rr * 2, rr * 2);
    ctx.lineCap = 'round';
    const rot = t * (0.8 + f * 5);
    for (let k = 0; k < 4; k++) {
        const a = rot + k * Math.PI / 2;
        ctx.strokeStyle = 'rgba(' + T.accent + ',' + (0.25 + 0.6 * f) + ')';
        ctx.lineWidth = Math.max(2 / z, bh.radius * 0.06 * (0.5 + f));
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.radius * (0.55 + 0.25 * Math.sin(t * 3 + k)), a, a + 0.9 + f * 0.8);
        ctx.stroke();
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op0;
}

/* LA SORTIE : un eclair au coeur du trou noir, deux ondes, un jet de
   lumiere qui relie le trou noir a la sphere et une gerbe de particules le
   long du jet ; la sphere grossit en s'eloignant, drapee d'un halo. */
function dessinerSortie(ctx, C, age, f, z) {
    const bh = gameState.blackHole;
    const T = CAP_TEINTES[C.type];
    if (C._secoue !== C.sortie) {
        C._secoue = C.sortie;
        if (aLEcran(bh.x, bh.y, bh.radius * 3)) secouerEcran(22);
        if (typeof playCleanerSound === 'function') playCleanerSound(bh.x, bh.y);
    }
    if (!aLEcran((bh.x + C.x) / 2, (bh.y + C.y) / 2, bh.radius * 4)) return;
    const a0 = ctx.globalAlpha, op0 = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    /* Eclair et ondes au trou noir. */
    if (age < 1) {
        const rr = bh.radius * (0.8 + age * 2.5);
        ctx.globalAlpha = 1 - age;
        ctx.drawImage(tacheDouce('255,250,235'), bh.x - rr, bh.y - rr, rr * 2, rr * 2);
    }
    for (let k = 0; k < 2; k++) {
        const g = (age - k * 0.35) / 1.8;
        if (g <= 0 || g >= 1) continue;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(' + T.accent + ',' + (0.8 * (1 - g)) + ')';
        ctx.lineWidth = Math.max(2 / z, bh.radius * 0.07 * (1 - g));
        ctx.beginPath(); ctx.arc(bh.x, bh.y, bh.radius * (0.6 + g * 3.5), 0, Math.PI * 2); ctx.stroke();
    }
    /* Le jet : large et vif au debut, il s'amincit et s'eteint. */
    const v = 1 - f;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.5 * v;
    ctx.strokeStyle = 'rgb(' + T.accent + ')';
    ctx.lineWidth = C.rayon * 1.6 * v + 2 / z;
    ctx.beginPath(); ctx.moveTo(bh.x, bh.y); ctx.lineTo(C.x, C.y); ctx.stroke();
    ctx.globalAlpha = 0.8 * v;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = C.rayon * 0.35 * v + 1 / z;
    ctx.stroke();
    /* Particules le long du jet (dessin seulement). */
    ctx.globalAlpha = v;
    ctx.fillStyle = 'rgb(' + T.accent + ')';
    ctx.beginPath();
    for (let k = 0; k < 24; k++) {
        const u = Math.random(), ec = (Math.random() - 0.5) * C.rayon * 2.2;
        const nx = -(C.y - bh.y), ny = C.x - bh.x, nn = Math.hypot(nx, ny) || 1;
        const x = bh.x + (C.x - bh.x) * u + nx / nn * ec, y = bh.y + (C.y - bh.y) * u + ny / nn * ec;
        const r = (1 + Math.random() * 2.5) / z;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fill();
    /* Halo autour de la sphere qui naît. */
    const hr = C.rayon * (1.5 + 2.5 * v);
    ctx.globalAlpha = 0.35 + 0.5 * v;
    ctx.drawImage(tacheDouce(T.accent), C.x - hr, C.y - hr, hr * 2, hr * 2);
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op0;
}

/* LA TRAINEE d'une sphere pilotee : un sillage a la couleur du pilote,
   large et vif pres d'elle, qui s'amincit et s'efface en 2,5 s. Dessin
   seulement : les points se notent a l'image, pas dans la partie. */
function dessinerTrainee(ctx, C, t, z) {
    if (!C._trace) C._trace = [];
    const tr = C._trace;
    if (C.pilote >= 0 && gameState.players[C.pilote]) {
        C._traceCouleur = couleurHex(gameState.players[C.pilote].color);
        const d = tr.length ? Math.hypot(C.x - tr[tr.length - 1].x, C.y - tr[tr.length - 1].y) : Infinity;
        if (d > 6) tr.push({ x: C.x, y: C.y, t: t });
    }
    while (tr.length && (t - tr[0].t > 2.5 || tr[0].t > t)) tr.shift();
    if (tr.length < 2) return;
    const coul = C._traceCouleur || '#FFFFFF';
    const acc = CAP_TEINTES[C.type].accent;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 1; i < tr.length; i++) {
        const f = 1 - (t - tr[i].t) / 2.5;               /* 1 : tout frais, 0 : efface */
        if (f <= 0) continue;
        ctx.beginPath();
        ctx.moveTo(tr[i - 1].x, tr[i - 1].y);
        ctx.lineTo(i === tr.length - 1 ? C.x : tr[i].x, i === tr.length - 1 ? C.y : tr[i].y);
        ctx.strokeStyle = coul + hexAlpha(0.45 * f);
        ctx.lineWidth = C.rayon * 1.6 * f + 2 / z;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(' + acc + ',' + (0.7 * f) + ')';
        ctx.lineWidth = C.rayon * 0.5 * f + 1 / z;
        ctx.stroke();
    }
    ctx.restore();
}

/* LES ASTRES PARALYSES (explosion ou ecrasement d'une sphere) : sol calcine,
   anneau rouge qui palpite, et le temps qu'il reste avant que la
   production reparte. */
function drawPannes(ctx) {
    const t = gameState.time;
    const z = gameState.camera.zoom;
    const px = 1 / z;
    for (const b of gameState.allBodies) {
        if (!(b.panne > t) || b.type === 'sun') continue;
        if (!aLEcran(b.x, b.y, b.radius * 2)) continue;
        const reste = Math.ceil(b.panne - t);
        const pouls = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.fillStyle = 'rgba(25,8,6,' + (0.35 + 0.1 * pouls) + ')';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,40,' + (0.45 + 0.4 * pouls) + ')';
        ctx.lineWidth = Math.max(2 * px, b.radius * 0.05);
        ctx.setLineDash([b.radius * 0.18, b.radius * 0.12]);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius * 1.12, t * 0.6, t * 0.6 + Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        const fs = 12 * px;
        ctx.font = 'bold ' + fs + 'px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        const txt = '☢ PARALYSÉ ' + reste + ' s';
        const w = ctx.measureText(txt).width;
        const y = b.y + b.radius * 1.12 + 20 * px;
        ctx.fillStyle = 'rgba(30,6,6,0.8)';
        ctx.fillRect(b.x - w / 2 - 5 * px, y - fs, w + 10 * px, fs * 1.4);
        ctx.fillStyle = '#FF7A5A';
        ctx.fillText(txt, b.x, y);
    }
}

/* LE DESSIN : plaques de blindage sur une sphere, quelques-unes manquantes
   laissent voir le coeur. De loin, un disque a la couleur de la sphere. */
function _capOmbre(p, k) {
    return 'rgb(' + Math.min(255, Math.round(p[0] * k)) + ',' + Math.min(255, Math.round(p[1] * k)) + ',' + Math.min(255, Math.round(p[2] * k)) + ')';
}
function drawCapitaux(ctx) {
    const L = gameState.capitaux;
    if (!L || !L.length) return;
    const z = gameState.camera.zoom;
    const t = gameState.time;
    for (const C of L) {
        if (C.mort) continue;
        const T = CAP_TEINTES[C.type];
        /* Avant sa sortie, le trou noir s'agite ; pendant, elle en jaillit. */
        const ageS = t - C.sortie;
        if (ageS < 0) { if (ageS > -CAP_CFG.presage) dessinerPresage(ctx, C, -ageS, z); continue; }
        const fS = Math.min(1, ageS / CAP_CFG.emergence);
        if (fS < 1) dessinerSortie(ctx, C, ageS, fS, z);
        const R = C.rayon * (fS < 1 ? 0.15 + 0.85 * (1 - Math.pow(1 - fS, 3)) : 1);
        dessinerTrainee(ctx, C, t, z);
        if (!aLEcran(C.x, C.y, C.rayon * 4)) continue;
        ctx.save();
        ctx.translate(C.x, C.y);
        ctx.globalCompositeOperation = 'lighter';
        const g0 = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
        g0.addColorStop(0, 'rgba(' + T.accent + ',0.30)');
        g0.addColorStop(1, 'rgba(' + T.accent + ',0)');
        ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        const coeur = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        coeur.addColorStop(0, 'rgba(' + T.accent + ',0.95)');
        coeur.addColorStop(0.35, 'rgba(' + T.accent + ',0.45)');
        coeur.addColorStop(1, 'rgb(10,10,16)');
        ctx.fillStyle = coeur; ctx.beginPath(); ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2); ctx.fill();
        if (R * z > 14) {
            const rot = t * 0.08 + C.angle, bascule = 0.35;
            const cb = Math.cos(bascule), sb = Math.sin(bascule);
            const pt = function (la, lo) {
                const x0 = Math.cos(la) * Math.sin(lo), y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
                const x = x0 * Math.cos(rot) + z0 * Math.sin(rot), zz = -x0 * Math.sin(rot) + z0 * Math.cos(rot);
                return [x, y0 * cb - zz * sb, y0 * sb + zz * cb];
            };
            const dLa = Math.PI / 8, dLo = Math.PI / 9;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 18; j++) {
                    const la = -Math.PI / 2 + i * dLa, lo = j * dLo;
                    const c = pt(la + dLa / 2, lo + dLo / 2);
                    if (c[2] <= 0.02) continue;
                    const coins = [pt(la, lo), pt(la, lo + dLo), pt(la + dLa, lo + dLo), pt(la + dLa, lo)];
                    ctx.beginPath();
                    /* Plus la sphere est abimee, plus il manque de plaques. */
                    const trou = (i * 7 + j * 3) % 11 === 0 || ((i * 13 + j * 5) % 7) / 7 > C.pv / CAP_CFG.pv + 0.15;
                    if (trou) {
                        coins.forEach(function (p, q) { if (q) ctx.lineTo(p[0] * R, p[1] * R); else ctx.moveTo(p[0] * R, p[1] * R); });
                        ctx.closePath();
                        ctx.strokeStyle = 'rgba(' + T.accent + ',0.6)'; ctx.lineWidth = Math.max(1 / z, R * 0.025); ctx.stroke();
                        continue;
                    }
                    coins.forEach(function (p, q) {
                        const x = (c[0] + (p[0] - c[0]) * 0.9) * R, y = (c[1] + (p[1] - c[1]) * 0.9) * R;
                        if (q) ctx.lineTo(x, y); else ctx.moveTo(x, y);
                    });
                    ctx.closePath();
                    const lum = Math.max(0, -0.5 * c[0] - 0.6 * c[1] + 0.62 * c[2]);
                    ctx.fillStyle = _capOmbre(T.pierre, 0.45 + 1.15 * lum);
                    ctx.fill();
                }
            }
        }
        ctx.strokeStyle = C.pilote >= 0 && gameState.players[C.pilote] ? gameState.players[C.pilote].color : 'rgba(' + T.accent + ',0.7)';
        ctx.lineWidth = Math.max(1.5 / z, C.pilote >= 0 ? R * 0.08 : R * 0.03);
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        if (fS < 1) continue;

        /* Vie, capture, pilotage : sous la sphere, a taille d'ecran constante. */
        const px = 1 / z;
        const bw = Math.max(R * 2, 60 * px), by = C.y + R + 10 * px;
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(C.x - bw / 2, by, bw, 4 * px);
        ctx.fillStyle = 'rgba(' + T.accent + ',0.95)'; ctx.fillRect(C.x - bw / 2, by, bw * Math.max(0, C.pv / CAP_CFG.pv), 4 * px);
        if (C.pilote >= 0) {
            const j = gameState.players[C.pilote];
            const reste = Math.max(0, Math.ceil(C.piloteFin - t));
            ctx.font = 'bold ' + (12 * px) + 'px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillStyle = j ? j.color : '#FFFFFF';
            ctx.fillText((j ? j.name : '') + ' · ' + reste + ' s', C.x, by + 18 * px);
        } else {
            const jg = jaugeCapture(C);
            if (jg.n > 0 && gameState.players[jg.slot]) {
                const f = Math.min(1, jg.n / CAP_CFG.capture.spores);
                ctx.strokeStyle = gameState.players[jg.slot].color; ctx.lineWidth = 4 * px;
                ctx.beginPath(); ctx.arc(C.x, C.y, R + 6 * px, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
                ctx.font = (11 * px) + 'px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillStyle = gameState.players[jg.slot].color;
                ctx.fillText('capture ' + Math.floor(f * 100) + ' %', C.x, by + 18 * px);
            }
        }
    }
    /* Les balles des mitrailleuses : de courts traits qui filent vers l'astre. */
    const B = gameState._balles;
    if (B && B.length) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (let i = B.length - 1; i >= 0; i--) {
            const b = B[i], age = t - b.t0;
            if (age < 0) { B.splice(i, 1); continue; }
            /* Le point d'impact suit l'astre : a sa surface, face au tireur. */
            const A = b.astre;
            const ang = Math.atan2(b.y1 - A.y, b.x1 - A.x) + b.ecart;
            b.x2 = A.x + Math.cos(ang) * A.radius; b.y2 = A.y + Math.sin(ang) * A.radius;
            if (age >= 0.35) {
                B.splice(i, 1);
                eclatBalle(b, ang);
                continue;
            }
            const f = age / 0.35;
            const x = b.x1 + (b.x2 - b.x1) * f, y = b.y1 + (b.y2 - b.y1) * f;
            const xq = b.x1 + (b.x2 - b.x1) * Math.max(0, f - 0.12), yq = b.y1 + (b.y2 - b.y1) * Math.max(0, f - 0.12);
            ctx.strokeStyle = b.couleur; ctx.lineWidth = Math.max(1.5 / z, 3);
            ctx.beginPath(); ctx.moveTo(xq, yq); ctx.lineTo(x, y); ctx.stroke();
        }
        ctx.restore();
    }
}

