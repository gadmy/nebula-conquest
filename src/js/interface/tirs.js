/* ─────────────────────────────────────────────
   TIR DEPUIS L'ASTRE LE PLUS PROCHE, ET CHARGEMENT
   Quand une planete et toutes ses lunes sont tenues, elles ne tirent plus
   chacune de leur cote. Pendant la visee :
   - c'est l'astre du groupe LE PLUS PROCHE DE LA CIBLE qui tirera ;
   - les autres lui envoient leurs spores par paquets de 100, donc plus on
     attend, plus le tir est gros - et ils se vident vraiment ;
   - si la cible bouge et qu'un autre astre devient le plus proche, le
     chargement repart de zero sur celui-la. Rien n'est transfere en arriere :
     ce qui a deja ete envoye reste ou il est.
   Le chargement se fait au niveau d'un systeme planetaire - une planete et
   SES lunes - jamais a l'echelle d'un systeme solaire entier.
   ───────────────────────────────────────────── */
const CHARGE_PAQUET = 100;
const CHARGE_PERIODE = 0.35;   /* secondes entre deux paquets */
/* SURCHARGE : pendant la charge d'un tir, l'astre qui va tirer peut monter
   au-dessus de son maximum, sans limite : tout ce que le groupe lui envoie
   s'accumule. Apres, le trop-plein s'evapore : SURCHARGE_FUITE de
   l'excedent par seconde (plus au moins SURCHARGE_FUITE_MIN), jusqu'a
   revenir au maximum. */
const SURCHARGE_FUITE = 0.15;
const SURCHARGE_FUITE_MIN = 5;

/* Ajouter des spores sans depasser le maximum... ni faire fondre d'un coup
   un astre deja en surcharge : il garde son trop-plein, qui s'evapore. */
function ajouterSpores(body, gain) {
    const avant = body.spores || 0;
    const z = _zoneDefense(body);
    if (z) {
        /* Astre assiege : ses spores vivent dans ses zones, body.spores n'en
           est que la somme (refaite a chaque pas de lutte). Un gain pose sur
           body.spores etait efface au pas suivant : il va dans sa plus
           grande zone. */
        const g = Math.max(0, Math.min(gain, Math.max(avant, body.maxSpores) - avant));
        z.spores += g;
        zonesAgreger(body, body.lutte);
        return g;
    }
    body.spores = Math.max(avant, Math.min(body.maxSpores, avant + gain));
    return body.spores - avant;
}

/* La plus grande zone du proprietaire sur un astre assiege, sinon null. */
function _zoneDefense(body) {
    if (!body.lutte || !body.lutte.zones || body.owner === null || body.owner === undefined || body.owner < 0) return null;
    const m = zonesDe(body, body.owner);
    return m.length ? m[0].z : null;
}

/* Retirer des spores (sphere noire, achat d'une technologie...), assiege ou
   non. Rend ce qui a vraiment ete retire. */
function retirerSpores(body, perte) {
    if (_zoneDefense(body)) {
        let reste = perte;
        for (const m of zonesDe(body, body.owner)) {
            const t = Math.min(m.z.spores, reste);
            m.z.spores -= t;
            reste -= t;
            if (reste <= 0) break;
        }
        zonesAgreger(body, body.lutte);
        return perte - Math.max(0, reste);
    }
    const t = Math.min(body.spores || 0, perte);
    body.spores = (body.spores || 0) - t;
    return t;
}

/* Vider un astre (comete, sphere capitale ecrasee...), assiege ou non. */
function viderSpores(body) {
    if (_zoneDefense(body)) {
        for (const m of zonesDe(body, body.owner)) m.z.spores = 0;
        zonesAgreger(body, body.lutte);
    }
    body.spores = 0;
}

/* Un astre qu'un joueur est en train de charger pour un tir. */
function astreEnCharge(body) {
    for (const j of gameState.players) if (j.ordreVisee && j.ordreVisee.lanceur === body) return true;
    return false;
}

function _groupeTir(src) {
    if (!src) return [];
    const planete = (src.type === 'planet') ? src : (src.parent || null);
    if (!planete || planete.type !== 'planet') return [src];
    const proprio = src.owner;
    if (planete.owner !== proprio) return [src];
    const lunes = planete.moons || [];
    if (!lunes.length) return [planete];
    for (let i = 0; i < lunes.length; i++) {
        if (lunes[i].owner !== proprio) return [src];   /* groupe incomplet */
    }
    return [planete].concat(lunes);
}

/* Le curseur est-il DANS la frontiere du groupe qui tire ? Un groupe de tir
   est une planete et ses lunes : sa frontiere tient dans un cercle centre sur
   la planete, du rayon de l'orbite lunaire la plus large, plus la marge. Pas
   besoin de l'enveloppe exacte ici - on cherche a savoir si le joueur vise
   chez lui, pas a tracer un trait. Le serveur fait le meme calcul, mot pour
   mot, pour que le multijoueur se comporte pareil. */
/* Le segment ax,ay -> bx,by coupe-t-il le disque cx,cy,r ? Le point du
   segment le plus proche du centre suffit : s'il est dans le disque, ils se
   coupent. */
function _segmentCoupeDisque(ax, ay, bx, by, cx, cy, r) {
    const dx = bx - ax, dy = by - ay;
    const a = dx * dx + dy * dy;
    if (a < 1e-9) { const ux = ax - cx, uy = ay - cy; return ux * ux + uy * uy < r * r; }
    let t = -((ax - cx) * dx + (ay - cy) * dy) / a;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    const px = ax + dx * t - cx, py = ay + dy * t - cy;
    return px * px + py * py < r * r;
}

/* Un tir de A vers B passe-t-il a travers une etoile ou le trou noir ? Les
   jets sont detruits net par les deux : viser par-dessus une etoile revenait
   a ne pas tirer du tout, et la planete derriere passait pour invulnerable.
   Les rayons sont ceux qui tuent le jet dans checkJetCollision et updateJets,
   avec un peu de marge : on ecarte le tir qui frole autant que celui qui
   traverse. */
function tirBloque(ax, ay, bx, by) {
    const suns = gameState.suns || [];
    for (let i = 0; i < suns.length; i++) {
        const s = suns[i];
        if (_segmentCoupeDisque(ax, ay, bx, by, s.x, s.y, s.radius + 14)) return true;
    }
    const bh = gameState.blackHole;
    if (bh && _segmentCoupeDisque(ax, ay, bx, by, bh.x, bh.y, bh.dangerZone * 0.4 + 10)) return true;
    return false;
}

function _viseeInterne(groupe, x, y) {
    if (!groupe || groupe.length < 2) return false;
    const p = groupe[0];              /* la planete ; les suivantes sont ses lunes */
    let r = p.radius;
    for (let i = 1; i < groupe.length; i++) {
        const b = groupe[i];
        const d = Math.sqrt((b.x - p.x) * (b.x - p.x) + (b.y - p.y) * (b.y - p.y)) + b.radius;
        if (d > r) r = d;
    }
    r += MARGE_FRONTIERE;
    const dx = x - p.x, dy = y - p.y;
    return dx * dx + dy * dy <= r * r;
}

/* ─────────────────────────────────────────────
   LA RAFALE : Ctrl + clic gauche maintenu pendant la visee. L'astre crache
   des paquets de 10 spores, 8 par seconde, dans la direction du curseur a
   plus ou moins 20 degres pres - une mitrailleuse, pas un fusil. Tant qu'on
   tient, il se vide ; il s'arrete au relacher, ou quand il n'a plus de quoi
   faire un paquet. En multijoueur, c'est le SERVEUR qui cadence et tire :
   le client ne fait qu'annoncer le debut, la cible et la fin.
   ───────────────────────────────────────────── */
const RAFALE_CADENCE = 8;                      /* paquets par seconde */
const RAFALE_PAQUET = 10;                      /* spores par paquet */
const RAFALE_ECART = 20 * Math.PI / 180;       /* dispersion, de part et d'autre */

function demarrerRafale() {
    if (gameState._firePhase !== 'aiming' || !gameState._fireSource || gameState._boule) return;
    /* Premier paquet sans attendre : le doigt appuie, ca part. */
    gameState._rafale = { acc: 1 / RAFALE_CADENCE, n: 0, envoi: 0 };
    if (!gameState.isMulti) {
        const src = gameState._fireLanceur || gameState._fireSource;
        donnerOrdre('rafale_debut', { src: src.name, tx: gameState.mouseWorldX, ty: gameState.mouseWorldY });
    } else {
        const src = gameState._fireSource;
        const zt = src.lutte ? zoneDeTir(src, localSlot()) : null;
        const zc = zt ? zoneCentre(src, zt.z) : null;
        sendAction('rafale_debut', { srcName: src.name,
            tx: gameState.mouseWorldX, ty: gameState.mouseWorldY,
            zx: zc ? zc.x : undefined, zy: zc ? zc.y : undefined });
    }
}

function arreterRafale() {
    if (!gameState._rafale) return;
    gameState._rafale = null;
    if (gameState.isMulti) sendAction('rafale_fin', {});
    else donnerOrdre('rafale_fin', {});
}

function majRafale(dt) {
    const R = gameState._rafale;
    if (!R) return;
    if (gameState.phase !== 'game' || gameState._firePhase !== 'aiming' || !gameState._fireSource) {
        arreterRafale();
        return;
    }
    if (gameState.isMulti) {
        /* Le serveur tire ; on lui dit seulement ou l'on vise. */
        R.envoi += dt;
        if (R.envoi >= 0.12) {
            R.envoi = 0;
            sendAction('rafale_cible', { tx: gameState.mouseWorldX, ty: gameState.mouseWorldY });
        }
        return;
    }
    /* En solo : la cible et le lanceur partent en ordre 'rafale_cible', a la
       meme cadence qu'au serveur. Quand le calcul arrete la rafale (plus de
       quoi faire un paquet), l'ecran la lache aussi. */
    const moi = gameState.players[localSlot()];
    if (moi && moi.ordreRafale) R.vue = true;
    else if (R.vue) { gameState._rafale = null; return; }
    R.envoi += dt;
    if (R.envoi >= 0.12) {
        R.envoi = 0;
        const src = gameState._fireLanceur || gameState._fireSource;
        donnerOrdre('rafale_cible', { src: src.name, tx: gameState.mouseWorldX, ty: gameState.mouseWorldY });
    }
}

/* LA RAFALE, cote calcul (solo) : pour chaque joueur qui en tient une, des
   paquets de RAFALE_PAQUET vers la cible de ses ordres. */
function majRafales(dt) {
    const joueurs = gameState.players;
    for (let slot = 0; slot < joueurs.length; slot++) {
        const R = joueurs[slot].ordreRafale;
        if (!R) continue;
        R.acc += dt;
        while (R.acc >= 1 / RAFALE_CADENCE) {
            R.acc -= 1 / RAFALE_CADENCE;
            const src = R.src;
            const dx = R.tx - src.x, dy = R.ty - src.y;
            if (dx * dx + dy * dy < 100) continue;     /* cible sur le lanceur : pas de direction */
            const a = Math.atan2(dy, dx) + (gameRandom() * 2 - 1) * RAFALE_ECART;
            const n0 = gameState.jets.length;
            launchJet(src, Math.cos(a), Math.sin(a), 'normal', slot,
                      { nombre: RAFALE_PAQUET, muet: true });
            if (gameState.jets.length === n0) {        /* plus de quoi faire un paquet */
                joueurs[slot].ordreRafale = null;
                break;
            }
            gameState.jets[n0].rafale = true;          /* dessine en balle tracante */
            /* Un son de lancer sur trois : huit par seconde saturaient l'oreille. */
            if (R.n % 3 === 0) _playBuffer('launch', 0.25);
            R.n++;
        }
    }
}

/* ─────────────────────────────────────────────
   LA BOULE : Shift maintenu pendant la visee. L'astre agglutine des spores
   dans son atmosphere, 25 par seconde jusqu'a 500 ; chaque spore chargee lui
   en coute 2, et rien n'est rendu. La boule flotte au bord de l'astre et
   tourne LENTEMENT vers la souris ; au relacher de Shift elle part dans
   l'axe centre -> boule, pas selon la visee habituelle. Plus rapide qu'un
   jet, deux fois plus de portee, un quart de la gravite, et les vaisseaux
   et amas rouges ou noirs ne lui font rien. A l'arrivee, c'est un jet comme
   un autre. En multijoueur, le serveur charge, tourne et tire.
   ───────────────────────────────────────────── */
const BOULE_DEBIT = 25;                  /* spores chargees par seconde */
const BOULE_MAX = 500;
const BOULE_COUT = 2;                    /* spores prises a l'astre par spore chargee */
const BOULE_ROTATION = 0.15;             /* radians par seconde vers la souris, au zoom 1 et plus */

/* LA ROTATION RALENTIT QUAND ON DEZOOME. A vitesse d'angle fixe, dezoome, on
   voit toute la longue trajectoire prevue balayer l'ecran, et son bout file :
   la boule semblait tourner vite. Elle tourne donc d'autant moins vite qu'on
   voit loin : pleine vitesse au zoom 1, le quart au zoom 0,25 et en dessous. */
function vitesseRotationBoule(zoom) {
    return BOULE_ROTATION * Math.max(0.25, Math.min(1, zoom || 1));
}
const BOULE_VITESSE = 1.4;               /* par rapport a un jet */
const BOULE_PAS = Math.round(200 * 2 / BOULE_VITESSE);   /* deux fois la portee d'un jet */
const BOULE_GRAVITE = 0.25;
const BOULE_HAUTEUR = 1.35;              /* rayon de l'orbite, en rayons d'astre */

function _angleVers(a, cible, pasMax) {
    let d = cible - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return a + Math.max(-pasMax, Math.min(pasMax, d));
}

/* Rayon a l'ecran de la boule : grossit avec la racine de son contenu. */
function _rayonBoule(n) { return 7 + Math.sqrt(Math.max(0, n)) * 1.5; }

function demarrerBoule() {
    if (gameState._boule || gameState._rafale) return;
    if (gameState._firePhase !== 'aiming' || !gameState._fireSource) return;
    const src = gameState._fireSource;
    const moi = localSlot();
    if (src.owner !== moi && !(src.lutte && zonesDe(src, moi).length)) return;
    const a = Math.atan2(gameState.mouseWorldY - src.y, gameState.mouseWorldX - src.x);
    gameState._boule = { src: src, angle: a, n: 0, envoi: 0 };
    /* La boule REMPLACE le tir normal : le clic qu'on relachera pendant ou
       apres la charge ne doit pas tirer un jet en plus. */
    gameState._bouleUtilisee = true;
    if (!gameState.isMulti) {
        donnerOrdre('boule_debut', { src: src.name, tx: gameState.mouseWorldX, ty: gameState.mouseWorldY,
                                     z: gameState.camera.zoom });
    } else {
        const zt = src.lutte ? zoneDeTir(src, moi) : null;
        const zc = zt ? zoneCentre(src, zt.z) : null;
        sendAction('boule_debut', { srcName: src.name, z: gameState.camera.zoom,
            tx: gameState.mouseWorldX, ty: gameState.mouseWorldY,
            zx: zc ? zc.x : undefined, zy: zc ? zc.y : undefined });
    }
}

function majBoule(dt) {
    const B = gameState._boule;
    if (!B) return;
    const src = B.src;
    const moi = localSlot();
    if (gameState.phase !== 'game' || gameState._firePhase !== 'aiming'
        || (src.owner !== moi && !(src.lutte && zonesDe(src, moi).length))) {
        /* Visee abandonnee ou astre perdu : la boule se disperse, perdue. */
        if (gameState.isMulti) sendAction('boule_fin', {});
        else donnerOrdre('boule_fin', {});
        gameState._boule = null;
        return;
    }
    const cible = Math.atan2(gameState.mouseWorldY - src.y, gameState.mouseWorldX - src.x);
    if (gameState.isMulti) {
        /* Le serveur charge et tourne ; on lui dit ou est la souris, et on
           suit sa boule a lui (instantanes) pour l'affichage. */
        B.envoi += dt;
        if (B.envoi >= 0.12) {
            B.envoi = 0;
            sendAction('boule_cible', { tx: gameState.mouseWorldX, ty: gameState.mouseWorldY,
                                        z: gameState.camera.zoom });
        }
        return;
    }
    /* En solo : la boule vit dans le calcul (majBoules) ; l'ecran recopie
       son angle et son contenu pour l'afficher, et envoie la cible et le
       zoom en ordre 'boule_cible'. Si le calcul l'a dispersee, l'ecran la
       lache aussi. */
    const S = gameState.players[moi] && gameState.players[moi].ordreBoule;
    if (S) { B.vue = true; B.angle = S.angle; B.n = S.n; }
    else if (B.vue) { gameState._boule = null; return; }
    B.envoi += dt;
    if (B.envoi >= 0.12) {
        B.envoi = 0;
        donnerOrdre('boule_cible', { tx: gameState.mouseWorldX, ty: gameState.mouseWorldY,
                                     z: gameState.camera.zoom });
    }
}

/* LA BOULE, cote calcul (solo) : elle tourne vers la cible de ses ordres, a
   la vitesse que donne le zoom annonce, et se charge de ce que l'astre (ou
   la zone) peut payer. */
function majBoules(dt) {
    const joueurs = gameState.players;
    for (let slot = 0; slot < joueurs.length; slot++) {
        const B = joueurs[slot].ordreBoule;
        if (!B) continue;
        const src = B.src;
        if (src.owner !== slot && !(src.lutte && zonesDe(src, slot).length)) {
            joueurs[slot].ordreBoule = null;         /* astre perdu : dispersee */
            continue;
        }
        const cible = Math.atan2(B.ty - src.y, B.tx - src.x);
        B.angle = _angleVers(B.angle, cible, vitesseRotationBoule(B.z) * dt);
        let voulu = Math.min(BOULE_DEBIT * dt, BOULE_MAX - B.n);
        if (voulu <= 0) continue;
        const zt = src.lutte ? zoneDeTir(src, slot) : null;
        const dispo = zt ? zt.z.spores : (src.spores || 0);
        voulu = Math.min(voulu, dispo / BOULE_COUT);
        if (voulu <= 0) continue;
        if (zt) { zt.z.spores -= voulu * BOULE_COUT; zonesAgreger(src, src.lutte); }
        else src.spores -= voulu * BOULE_COUT;
        B.n += voulu;
    }
}

/* L'ONDE DE CHOC de la boule : trois anneaux qui s'ecartent a des vitesses
   differentes - un eclair blanc rapide, la couleur du tireur, puis un large
   anneau lent - et, si on la ressent, l'ecran qui tremble. La force suit le
   contenu de la boule : une boule pleine secoue beaucoup plus. */
function ondeDeChoc(x, y, rayon, couleurHex, n) {
    if (!gameState._ondes) gameState._ondes = [];
    const c = _rgbDe(couleurEtincelle(couleurHex || '#FFFFFF'));
    const f = Math.min(1, (n || 0) / BOULE_MAX);
    gameState._ondes.push({ x: x, y: y, r0: rayon * 0.1, r1: rayon * (1.2 + 0.6 * f), age: 0, maxAge: 0.35, couleur: '255,255,255', ep: 5 + 4 * f });
    gameState._ondes.push({ x: x, y: y, r0: rayon * 0.2, r1: rayon * (2 + f), age: 0, maxAge: 0.7, couleur: c, ep: 4 + 4 * f });
    gameState._ondes.push({ x: x, y: y, r0: rayon * 0.3, r1: rayon * (3 + 1.5 * f), age: 0, maxAge: 1.2, couleur: c, ep: 2 + 2 * f });
}

/* Au depart : le tireur sent le recul. */
function _chocDepartBoule(src, angle, n) {
    const h = src.radius * BOULE_HAUTEUR;
    const j = gameState.players[localSlot()];
    ondeDeChoc(src.x + Math.cos(angle) * h, src.y + Math.sin(angle) * h, src.radius * 1.4, j && j.color, n);
    secouerEcran(6 + 14 * Math.min(1, n / BOULE_MAX));
}

/* A l'arrivee : tout le monde voit l'onde ; seul celui qu'elle frappe - le
   proprietaire de l'astre, ou qui y tient du terrain - voit son ecran
   trembler. */
function impactBoule(jet, body) {
    ondeDeChoc(jet.x, jet.y, body.radius * 1.6, jet.color, jet.spores);
    const moi = localSlot();
    if (jet.owner === moi) return;
    const touche = body.owner === moi || (body.lutte && zonesDe(body, moi).length > 0);
    if (touche) secouerEcran(8 + 18 * Math.min(1, jet.spores / BOULE_MAX));
}

/* La planete et ses lunes : ce que la boule traverse au depart. */
function _groupeBoule(src) {
    const pl = src.type === 'moon' ? src.parent : src;
    if (!pl) return [src.name];
    return [pl.name].concat((pl.moons || []).map(m => m.name));
}

/* Le depart : du bord de l'astre, dans l'axe centre -> boule. */
function _trajetBoule(src, angle, vitesseJoueur) {
    const h = src.radius * BOULE_HAUTEUR;
    const bx = src.x + Math.cos(angle) * h, by = src.y + Math.sin(angle) * h;
    return computeTrajectory(bx, by, Math.cos(angle), Math.sin(angle),
                             vitesseJoueur * BOULE_VITESSE, BOULE_PAS, BOULE_GRAVITE);
}

function lancerBoule() {
    const B = gameState._boule;
    if (!B) return;
    gameState._boule = null;
    /* L'onde de choc du depart, avec l'angle et le contenu reels : les
       notres en solo, ceux du serveur en multijoueur. */
    let _ang = B.angle, _n = B.n;
    if (gameState.isMulti) {
        const mienne = (gameState._boulesServeur || []).find(x => x.owner === localSlot());
        if (mienne) { _ang = mienne.a; _n = mienne.n; }
    }
    if (_n >= 5) _chocDepartBoule(B.src, _ang, _n);
    /* Pas de clic en cours : rien a neutraliser, le prochain tir normal passe. */
    if (!gameState._aimHolding) gameState._bouleUtilisee = false;
    if (gameState.isMulti) { sendAction('boule_lancer', {}); return; }
    donnerOrdre('boule_lancer', {});
}

/* Le jet d'une boule lancee, pour le joueur comme pour les IA. */
function creerJetBoule(src, angle, n, slot) {
    const j = gameState.players[slot];
    if (!j) return;
    const vitesse = 20 + j.stats.velocity * 6;
    const traj = _trajetBoule(src, angle, vitesse);
    const sparkles = [];
    for (let i = 0; i < 12; i++) {
        sparkles.push({ offX: 0, offY: 0, angle: Math.random() * Math.PI * 2,
                        speed: 0.3 + Math.random() * 0.8, radius: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2 });
    }
    if (slot === localSlot()) { gameState.gameStats.jetsLaunched++; _playBuffer('launch', 0.6); }
    gameState.jets.push({
        owner: slot, color: j.color, spores: n, sporeType: 'normal',
        trajectory: traj, posIndex: 0,
        x: traj[0] ? traj[0].x : src.x, y: traj[0] ? traj[0].y : src.y,
        speed: vitesse * BOULE_VITESSE, alive: true, trail: [], sparkles: sparkles,
        age: 0, selected: false, source: src, sourceName: src.name,
        boule: true, _groupe: _groupeBoule(src)
    });
}

/* ─────────────────────────────────────────────
   LE DEMOLISSEUR (touche F). F ARME le tir : le trait de visee
   rougeoie, et la molette fait defiler les trois batiments - alveole, nid,
   biome. Le clic suivant tire 250 spores, plus lentes qu'un jet, qui cassent
   sur l'astre touche UN batiment du genre choisi, pris au hasard parmi ceux
   qui ne sont pas au tireur. S'il n'y en a pas de ce genre, rien ne casse.
   Les spores attaquent en plus comme celles d'un jet ordinaire. Sans les 250
   spores, l'ecran vibre et rien ne part. F a nouveau desarme.
   ───────────────────────────────────────────── */
const DEMOL_SPORES = 250;
const DEMOL_VITESSE = 0.6;                            /* par rapport a un jet */
const DEMOL_PAS = Math.round(200 / DEMOL_VITESSE);    /* meme portee qu'un jet */
const DEMOL_GENRES = ['alveole', 'nid', 'biome'];
const DEMOL_NOMS = { alveole: 'Alvéole', nid: 'Nid', biome: 'Biome' };

/* Espace : passer en visee depuis l'astre choisi (suivi ou selectionne),
   des qu'on peut tirer depuis lui - un pied-a-terre suffit. */
function viserDepuisSelection() {
    if (gameState.phase !== 'game' || gameState.isSpectator) return;
    if (gameState._boule || gameState._rafale) return;
    const sel = (typeof followingBody !== 'undefined' && followingBody) ? followingBody : gameState.selectedBody;
    if (!sel || !peutTirerSurface(sel, localSlot())) { secouerEcran(8); return; }
    _closeSporMenu();
    followingBody = sel;
    gameState._fireSource = sel;
    gameState._fireLanceur = null;
    gameState._fireType = 'normal';
    gameState._firePhase = 'aiming';
}

/* F : armer ou desarmer. Sans visee en cours, on vise d'abord depuis
   l'astre choisi. */
function armerDemolisseur() {
    if (gameState.phase !== 'game' || gameState.isSpectator) return;
    if (gameState._boule || gameState._rafale) return;
    if (gameState._demol) { gameState._demol = false; return; }
    const moi = localSlot();
    if (gameState._firePhase !== 'aiming' || !gameState._fireSource) {
        const sel = (typeof followingBody !== 'undefined' && followingBody) ? followingBody : gameState.selectedBody;
        if (!sel || !peutTirerSurface(sel, moi)) { secouerEcran(8); return; }
        gameState._fireSource = sel;
        gameState._fireLanceur = null;
        gameState._fireType = 'normal';
        gameState._firePhase = 'aiming';
    }
    if (!gameState._demolGenre) gameState._demolGenre = 'nid';
    gameState._demol = true;
}

/* G : armer (ou desarmer) la SPORE PARASITAIRE. Il en faut une prete sur
   l'astre d'ou l'on vise (foyer putride, touche 4) ; sans visee en cours, on
   vise d'abord depuis l'astre choisi. Le clic suivant la lance. */
function armerParasite() {
    if (gameState.phase !== 'game' || gameState.isSpectator) return;
    if (gameState._boule || gameState._rafale) return;
    const moi = localSlot();
    /* Deja en visee : G lance la spore parasitaire tout de suite, vers le
       curseur, depuis l'astre qui vise. */
    if (gameState._firePhase === 'aiming') {
        const s = gameState._fireLanceur || gameState._fireSource;
        if (s && s.owner === moi && (s.parasiteSpore || 0) >= 1 && !s.lutte) { tirerParasiteVersCurseur(s); return; }
        if (gameState._fireType === 'parasite') { secouerEcran(8); return; }
    }
    const src = (gameState._firePhase === 'aiming' && gameState._fireSource) ? gameState._fireSource
              : ((typeof followingBody !== 'undefined' && followingBody) ? followingBody : gameState.selectedBody);
    if (!src || src.owner !== moi || (src.parasiteSpore || 0) < 1) { secouerEcran(8); return; }
    _closeSporMenu();
    gameState._demol = false;
    if (gameState._fireSource !== src) gameState._fireLanceur = null;
    followingBody = src;
    gameState._fireSource = src;
    gameState._fireType = 'parasite';
    gameState._firePhase = 'aiming';
}

function tirerParasiteVersCurseur(src) {
    const dx = gameState.mouseWorldX - src.x, dy = gameState.mouseWorldY - src.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 10) { secouerEcran(8); return; }
    if (gameState.isMulti) sendAction('jet', { srcName: src.name, dirX: dx / len, dirY: dy / len, sporeType: 'parasite' });
    else donnerOrdre('tir', { src: src.name, dx: dx / len, dy: dy / len, t: 'parasite' });
    /* Fin de visee, comme apres un clic. */
    const cam = gameState.camera;
    if (gameState._fireCamZoom !== null && gameState._fireCamZoom !== undefined) { cam.zoom = gameState._fireCamZoom; gameState._fireCamZoom = null; }
    gameState._firePhase = null;
    gameState._fireType = 'normal';
    gameState._fireSource = null;
    gameState._fireLanceur = null;
    gameState._fireGroupe = null;
    gameState._chargeAcc = 0;
    gameState._aimHolding = false;
    gameState.launchPreview = [];
}

/* Molette pendant que le demolisseur est arme : le genre suivant. */
function genreDemolisseurSuivant(sens) {
    const i = DEMOL_GENRES.indexOf(gameState._demolGenre || 'nid');
    gameState._demolGenre = DEMOL_GENRES[(i + (sens > 0 ? 1 : DEMOL_GENRES.length - 1)) % DEMOL_GENRES.length];
    if (typeof playClickSound === 'function') playClickSound();
}

/* Le tir, au clic. Vrai s'il est parti (ou a ete demande au serveur). */
function tirDemolisseur() {
    const moi = localSlot();
    const src = gameState._fireLanceur || gameState._fireSource;
    if (!src || !peutTirerSurface(src, moi)) { secouerEcran(8); return false; }
    const dx = gameState.mouseWorldX - src.x, dy = gameState.mouseWorldY - src.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 10) return false;
    const zt = src.lutte ? zoneDeTir(src, moi) : null;
    if (src.lutte && (!zt || zt.z.n < ZONE_MIN)) { secouerEcran(8); return false; }
    const dispo = zt ? zt.z.spores : (src.spores || 0);
    if (dispo < DEMOL_SPORES) { secouerEcran(8); return false; }
    const genre = gameState._demolGenre || 'nid';
    if (gameState.isMulti) {
        const zc = zt ? zoneCentre(src, zt.z) : null;
        sendAction('demolisseur', { srcName: (gameState._fireSource || src).name,
                                    dirX: dx / len, dirY: dy / len, genre: genre,
                                    zx: zc ? zc.x : undefined, zy: zc ? zc.y : undefined });
        return true;
    }
    donnerOrdre('demol', { src: src.name, dx: dx / len, dy: dy / len, genre: genre });
    return true;
}

/* Casse un batiment du genre voulu qui n'est pas au tireur ; rend son genre,
   ou null s'il n'y en avait pas. Solo seulement : en multijoueur c'est le
   serveur qui casse, et le client suit ses compteurs. */
function demolirEdifice(body, tireur, genre) {
    const liste = edifices(body);
    const monCamp = campDe(body, tireur);
    const cel = body.lutte ? body.lutte.cellules : null;
    const cibles = [];
    for (let k = 0; k < liste.length; k++) {
        if (liste[k].g !== genre) continue;
        if (cel ? cel[liste[k].i] === monCamp : body.owner === tireur) continue;
        cibles.push(k);
    }
    if (!cibles.length) return null;
    const k = cibles[Math.floor(gameRandom() * cibles.length)];
    const e = liste.splice(k, 1)[0];
    const cle = e.g === 'nid' ? 'nids' : e.g === 'alveole' ? 'alveoles' : 'biomes';
    body[cle] = Math.max(0, (body[cle] || 0) - 1);
    effetDemolition(body, e);
    return e.g;
}

/* Ce qu'on voit quand un batiment tombe : un eclat a sa place, son nom
   barre au-dessus de l'astre, et une ligne au journal pour sa victime. */
function effetDemolition(body, e) {
    const noms = { nid: 'Nid', alveole: 'Alvéole', biome: 'Biome' };
    let x = body.x, y = body.y;
    if (e && e.i !== undefined && e.i >= 0) { const c = _celluleVers(body, e.i); x = c.x; y = c.y; }
    const teinte = BATI_TEINTES[e.g] || '#FFFFFF';
    spawnImpact(x, y, '#FF7A1A');
    if (!gameState._ondes) gameState._ondes = [];
    gameState._ondes.push({ x: x, y: y, r0: 1, r1: body.radius * 0.3, age: 0, maxAge: 0.5, couleur: '255,170,60', ep: 2 });
    /* La petite explosion, a la place meme du batiment : un eclair, une
       boule de feu, et des debris a sa couleur qui retombent. */
    const pas = (2 * body.radius) / LUTTE_N;
    const debris = [];
    for (let k = 0; k < 10; k++) {
        const a = Math.random() * Math.PI * 2;
        debris.push({ a: a, v: (1.5 + Math.random() * 2.5) * pas, t: 0.5 + Math.random() * 0.8 });
    }
    if (!gameState._explosionsBat) gameState._explosionsBat = [];
    gameState._explosionsBat.push({ body: body, dx: x - body.x, dy: y - body.y, t0: gameState.time,
                                    pas: pas, teinte: teinte, debris: debris });
    gameState.conquestEffects.push({
        x: body.x, y: body.y - body.radius - 26, baseX: body.x,
        text: '💥 ' + (noms[e.g] || 'Bâtiment') + ' détruit',
        color: '#FF8A3D', age: 0, maxAge: 2.8
    });
    const moi = localSlot();
    if (body.owner === moi || (body.lutte && zonesDe(body, moi).length > 0)) {
        addEvent('war', '💥', (noms[e.g] || 'Bâtiment') + ' détruit sur ' + body.name, body, '#FF8A3D');
    }
}

/* Les explosions de batiments, collees a leur astre (il orbite). */
function drawExplosionsBat(ctx) {
    const L = gameState._explosionsBat;
    if (!L || !L.length) return;
    const DUREE = 1.3;
    const z = gameState.camera.zoom;
    ctx.save();
    for (let i = L.length - 1; i >= 0; i--) {
        const E = L[i];
        const age = gameState.time - E.t0;
        if (age > DUREE || age < 0) { L.splice(i, 1); continue; }
        const x = E.body.x + E.dx, y = E.body.y + E.dy;
        const r = Math.max(E.pas, 3 / z);
        ctx.globalCompositeOperation = 'lighter';
        if (age < 0.5) {
            const f = age / 0.5;
            ctx.globalAlpha = 1 - f;
            ctx.drawImage(haloSprite('#FF7A1A', 'halo'), x - r * 5 * (0.5 + f), y - r * 5 * (0.5 + f), r * 10 * (0.5 + f), r * 10 * (0.5 + f));
            ctx.fillStyle = '#FFF4D6';
            ctx.beginPath();
            ctx.arc(x, y, r * 1.6 * (1 - f), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        for (const d of E.debris) {
            if (age > d.t) continue;
            const f = age / d.t;
            ctx.globalAlpha = 1 - f;
            ctx.fillStyle = f < 0.3 ? '#FFB347' : E.teinte;
            const dd = d.v * (1 - (1 - f) * (1 - f));
            ctx.fillRect(x + Math.cos(d.a) * dd - r * 0.2, y + Math.sin(d.a) * dd - r * 0.2, r * 0.4, r * 0.4);
        }
    }
    ctx.restore();
}

/* Multijoueur : le serveur n'envoie que des compteurs. On aligne la liste des
   batiments dessus - un compteur qui baisse, c'est un batiment demoli ; un
   compteur qui monte, un batiment neuf a placer. */
function accorderEdifices(body) {
    if (!body.edifices) return;
    const genres = [['alveole', 'alveoles'], ['nid', 'nids'], ['biome', 'biomes']];
    for (const [g, cle] of genres) {
        const voulu = body[cle] || 0;
        let n = 0;
        for (const e of body.edifices) if (e.g === g) n++;
        while (n > voulu) {
            let k = -1;
            for (let i = body.edifices.length - 1; i >= 0; i--) if (body.edifices[i].g === g) { k = i; break; }
            const e = body.edifices.splice(k, 1)[0];
            effetDemolition(body, e);
            n--;
        }
        while (n < voulu) {
            const i = _caseLibre(body, null);
            if (i < 0) break;
            body.edifices.push({ g: g, i: i });
            n++;
        }
    }
}

/* Le demolisseur en vol : un boulet sombre et lourd, cerne d'un liseré
   ardent, qui laisse des braises derriere lui. */
function dessinerDemolisseur(ctx, jet) {
    const z = gameState.camera.zoom;
    const t = gameState.time;
    const r = Math.max(6, 5 / z);
    const tr = jet.trail;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < tr.length; i++) {
        const f = (i + 1) / tr.length;
        ctx.globalAlpha = 0.5 * f;
        ctx.fillStyle = i % 2 ? '#FF7A1A' : '#FFB347';
        const rr = r * (0.25 + 0.5 * f);
        ctx.beginPath();
        ctx.arc(tr[i].x, tr[i].y, rr, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 10);
    ctx.drawImage(haloSprite('#FF7A1A', 'halo'), jet.x - r * 3, jet.y - r * 3, r * 6, r * 6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#2A1408';
    ctx.strokeStyle = '#FF8A3D';
    ctx.lineWidth = Math.max(1.2 / z, r * 0.28);
    ctx.beginPath();
    const a0 = jet.age * 3;
    for (let k = 0; k < 7; k++) {
        const a = a0 + k * Math.PI * 2 / 7;
        const rk = r * (k % 2 ? 0.8 : 1.05);
        if (k === 0) ctx.moveTo(jet.x + Math.cos(a) * rk, jet.y + Math.sin(a) * rk);
        else ctx.lineTo(jet.x + Math.cos(a) * rk, jet.y + Math.sin(a) * rk);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = jet.color || '#FFFFFF';
    ctx.beginPath();
    ctx.arc(jet.x, jet.y, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/* Les boules en charge : la notre en solo, celles de tous (serveur) en
   multijoueur. Une lueur qui grossit avec son contenu, et son nombre. */
function drawBoules(ctx) {
    const liste = [];
    if (!gameState.isMulti && gameState._boule) {
        const B = gameState._boule;
        liste.push({ src: B.src, angle: B.angle, n: B.n, owner: localSlot() });
    }
    if (!gameState.isMulti) {
        for (const p of gameState.players) {
            const B = p._aiBoule;
            if (B) liste.push({ src: B.src, angle: B.angle, n: B.n, owner: p.id });
        }
    }
    if (gameState.isMulti && gameState._boulesServeur) {
        for (const b of gameState._boulesServeur) {
            const src = gameState.planets.find(p => p.name === b.src) || gameState.moons.find(m => m.name === b.src);
            if (src) liste.push({ src: src, angle: b.a, n: b.n, owner: b.owner });
        }
    }
    if (!liste.length) return;
    const z = gameState.camera.zoom;
    const t = gameState.time;
    const op = ctx.globalCompositeOperation;
    const a0 = ctx.globalAlpha;
    for (const b of liste) {
        const src = b.src;
        const h = src.radius * BOULE_HAUTEUR;
        const x = src.x + Math.cos(b.angle) * h, y = src.y + Math.sin(b.angle) * h;
        const j = gameState.players[b.owner];
        const c = couleurEtincelle((j && j.color) || '#FFFFFF');
        const plein = b.n >= BOULE_MAX - 0.5;
        const f = Math.min(1, b.n / BOULE_MAX);           /* 0 -> 1 avec la charge */
        const r = _rayonBoule(b.n) * Math.max(1, 0.8 / z);
        ctx.globalCompositeOperation = 'lighter';

        /* 1. L'ASPIRATION : des filets de spores montent du sol et
           s'engouffrent dans la boule, tant qu'elle se remplit. Aucun etat a
           garder : chaque grain suit une phase tiree du temps. */
        if (!plein) {
            const N = 22;
            const spS = haloSprite(c, 'noyau');
            for (let k = 0; k < N; k++) {
                const ph = (t * 1.6 + k / N + (k * 0.37) % 1) % 1;
                const ecart = ((k * 0.618) % 1 - 0.5) * 1.6;         /* d'ou il part, sur le sol */
                const aSol = b.angle + ecart;
                const sx = src.x + Math.cos(aSol) * src.radius * 0.98;
                const sy = src.y + Math.sin(aSol) * src.radius * 0.98;
                const e = ph * ph;                                   /* il accelere en montant */
                /* une legere spirale : le filet s'enroule autour de la boule */
                const tour = (1 - e) * 0.9 * (k % 2 ? 1 : -1);
                const mx = sx + (x - sx) * e + Math.cos(b.angle + Math.PI / 2) * tour * r;
                const my = sy + (y - sy) * e + Math.sin(b.angle + Math.PI / 2) * tour * r;
                const tg = Math.max(1.5 / z, r * 0.12) * (0.6 + 0.6 * (1 - e));
                ctx.globalAlpha = 0.25 + 0.75 * Math.sin(ph * Math.PI);
                ctx.drawImage(spS, mx - tg, my - tg, tg * 2, tg * 2);
            }
        }

        /* 2. LE HALO, qui s'etend et s'intensifie avec la charge. */
        const puls = 1 + (plein ? 0.18 : 0.08) * Math.sin(t * (plein ? 14 : 8));
        ctx.globalAlpha = 0.45 + 0.55 * f;
        const rh = r * (2.4 + 1.6 * f) * puls;
        ctx.drawImage(haloSprite(c, 'brume'), x - rh, y - rh, rh * 2, rh * 2);

        /* 3. LES ANNEAUX : deux arcs qui tournent en sens contraire. */
        ctx.globalAlpha = 0.5 + 0.5 * f;
        ctx.strokeStyle = plein ? '#FFFFFF' : c;
        ctx.lineWidth = Math.max(1 / z, r * 0.1);
        ctx.lineCap = 'round';
        for (let k = 0; k < 2; k++) {
            const sens = k ? -1 : 1;
            const rr = r * (1.45 + 0.35 * k);
            const deb = t * (2.2 + k) * sens + k;
            ctx.beginPath(); ctx.arc(x, y, rr, deb, deb + Math.PI * 0.7); ctx.stroke();
            ctx.beginPath(); ctx.arc(x, y, rr, deb + Math.PI, deb + Math.PI * 1.7); ctx.stroke();
        }

        /* 4. LE COEUR, blanc et chaud, qui bat. */
        ctx.globalAlpha = 1;
        const rc = r * puls;
        ctx.drawImage(haloSprite(c, 'noyau'), x - rc, y - rc, rc * 2, rc * 2);
        ctx.drawImage(haloSprite('#FFFFFF', 'noyau'), x - rc * 0.55, y - rc * 0.55, rc * 1.1, rc * 1.1);

        /* 5. PLEINE : un eclair regulier, pour dire "c'est pret". */
        if (plein) {
            const flash = Math.max(0, Math.sin(t * 5));
            ctx.globalAlpha = flash * 0.6;
            const rf = r * 3.2;
            ctx.drawImage(haloSprite('#FFFFFF', 'brume'), x - rf, y - rf, rf * 2, rf * 2);
        }

        ctx.globalCompositeOperation = op;
        ctx.globalAlpha = a0;
        ctx.font = 'bold ' + Math.max(10, 12 / z) + 'px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = plein ? '#FFD27A' : '#FFFFFF';
        ctx.fillText(plein ? 'MAX' : String(Math.floor(b.n)), x, y - r * 2.1 - 4 / z);
    }
}

window.addEventListener('keydown', function (e) {
    if (e.key === 'Shift' && !e.repeat && gameState.phase === 'game') demarrerBoule();
});
window.addEventListener('keyup', function (e) { if (e.key === 'Shift') lancerBoule(); });

/* Lacher Ctrl, ou quitter la fenetre, arrete la rafale comme lacher le clic. */
window.addEventListener('keyup', function (e) { if (e.key === 'Control') arreterRafale(); });
window.addEventListener('blur', function () { arreterRafale(); });

/* L'astre du groupe qui tirera vers (tx, ty). Viser chez soi ne change plus
   le lanceur. Traverser sa propre frontiere pour aller chercher une cible
   derriere faisait sauter le tir d'une lune a l'autre, et chaque saut
   remettait la charge a zero : la charge ne montait jamais. Des que la cible
   ressort, la bascule reprend. Sert a l'ecran (le trait de visee) comme au
   calcul (la charge, ordre 'visee') : la meme regle des deux cotes. */
function choisirLanceur(groupe, source, precedent, tx, ty) {
    if (_viseeInterne(groupe, tx, ty) && precedent && groupe.indexOf(precedent) >= 0) return precedent;
    /* Le plus proche QUI VOIT LA CIBLE. Une etoile avale le jet : le plus
       proche n'est pas le meilleur s'il tire a travers un soleil. On ne
       retombe sur le plus proche tout court que si aucun n'a la vue. */
    let lanceur = source;
    let meilleure = Infinity, meilleureVue = Infinity, lanceurVue = null;
    for (let i = 0; i < groupe.length; i++) {
        const b = groupe[i];
        const dx = tx - b.x, dy = ty - b.y;
        const d = dx * dx + dy * dy;
        if (d < meilleure) { meilleure = d; lanceur = b; }
        if (d < meilleureVue && !tirBloque(b.x, b.y, tx, ty)) {
            meilleureVue = d; lanceurVue = b;
        }
    }
    return lanceurVue || lanceur;
}

/* LA VISEE, cote ecran : elle suit la souris pour le trait et le lanceur
   affiches. La charge elle-meme (les spores qui passent au lanceur) est
   calculee ailleurs : par le serveur en multijoueur, par majVisees en solo,
   a partir de la cible que ces fonctions leur envoient. */
function majChargementTir(dt) {
    if (gameState._firePhase !== 'aiming' || !gameState._fireSource) {
        if (gameState._fireLanceur && gameState.isMulti) sendAction('aim_end', {});
        if (gameState._viseeOrdre) { donnerOrdre('visee_fin', {}); gameState._viseeOrdre = null; }
        gameState._fireLanceur = null;
        gameState._fireGroupe = null;
        gameState._tirBloque = false;
        return;
    }
    /* Depuis un pied-a-terre chez l'autre, il n'y a pas de groupe : on ne
       tire que de la ou l'on est. */
    const groupe = (gameState._fireSource.owner === localSlot())
                 ? _groupeTir(gameState._fireSource) : [gameState._fireSource];
    gameState._fireGroupe = groupe;

    const lanceur = choisirLanceur(groupe, gameState._fireSource, gameState._fireLanceur,
                                   gameState.mouseWorldX, gameState.mouseWorldY);
    /* Quand meme le lanceur retenu n'a pas la vue, le trait de visee le dit :
       sans cela le joueur tire dans une etoile sans comprendre pourquoi rien
       n'arrive. */
    gameState._tirBloque = tirBloque(lanceur.x, lanceur.y,
                                     gameState.mouseWorldX, gameState.mouseWorldY);
    if (lanceur !== gameState._fireLanceur) {
        gameState._fireLanceur = lanceur;
        gameState._chargeAcc = 0;
    }
    if (groupe.length < 2) return;

    /* En multijoueur c'est le serveur qui fait autorite : on lui envoie la
       cible visee, il choisit le lanceur et deplace les spores lui-meme. Le
       client se contente d'afficher ce que les instantanes lui renvoient. La
       cadence d'envoi est limitee - la cible bouge a chaque image, le serveur
       n'a pas besoin de la connaitre aussi souvent. */
    if (gameState.isMulti) {
        gameState._viseeEnvoi = (gameState._viseeEnvoi || 0) + dt;
        if (gameState._viseeEnvoi >= 0.15) {
            gameState._viseeEnvoi = 0;
            sendAction('aim', { srcName: gameState._fireSource.name,
                                tx: gameState.mouseWorldX, ty: gameState.mouseWorldY });
        }
        return;
    }

    /* En solo : l'ordre 'visee' dit au calcul d'ou l'on vise et vers ou, a
       la meme cadence qu'au serveur - et tout de suite quand l'astre de
       depart change. */
    const V = gameState._viseeOrdre;
    gameState._viseeEnvoi = (gameState._viseeEnvoi || 0) + dt;
    if (!V || V.src !== gameState._fireSource || gameState._viseeEnvoi >= 0.15) {
        gameState._viseeEnvoi = 0;
        gameState._viseeOrdre = { src: gameState._fireSource };
        donnerOrdre('visee', { src: gameState._fireSource.name,
                               tx: gameState.mouseWorldX, ty: gameState.mouseWorldY });
    }
}

/* LA CHARGE, cote calcul (solo). Pour chaque joueur qui vise depuis un
   groupe (une planete et ses lunes, toutes a lui), les autres astres du
   groupe envoient au lanceur leurs spores par paquets. Le lanceur est choisi
   par la regle de l'ecran, mais avec la cible de l'ordre 'visee' : jamais la
   souris, que l'ordinateur d'en face ne voit pas. */
function majVisees(dt) {
    const joueurs = gameState.players;
    for (let slot = 0; slot < joueurs.length; slot++) {
        const V = joueurs[slot].ordreVisee;
        if (!V) continue;
        const src = V.src;
        if (src.owner !== slot && !(src.lutte && zonesDe(src, slot).length)) { joueurs[slot].ordreVisee = null; continue; }
        const groupe = (src.owner === slot) ? _groupeTir(src) : [src];
        const lanceur = choisirLanceur(groupe, src, V.lanceur, V.tx, V.ty);
        if (lanceur !== V.lanceur) { V.lanceur = lanceur; V.acc = 0; }
        if (groupe.length < 2) continue;
        V.acc += dt;
        while (V.acc >= CHARGE_PERIODE) {
            V.acc -= CHARGE_PERIODE;
            /* Pas de plafond : la charge s'accumule tant que le groupe donne. */
            let place = Infinity;
            let envoye = 0;
            for (let i = 0; i < groupe.length && place > 1; i++) {
                const b = groupe[i];
                if (b === lanceur) continue;
                const envoi = Math.min(CHARGE_PAQUET, Math.floor(b.spores), Math.floor(place));
                if (envoi <= 0) continue;
                b.spores -= envoi;
                lanceur.spores += envoi;
                place -= envoi;
                envoye += envoi;
                if (slot === localSlot()) gameState._filetsCharge.push({ de: b, vers: lanceur, age: 0, maxAge: 0.45 });
            }
            if (envoye === 0) break;
        }
    }
}

/* Les filets lumineux qui montrent qui alimente qui. Ils tiennent lieu de
   reponse a "quelle planete va tirer ?" sans deplacer la camera : la vue ne
   bouge jamais pendant la visee. */
function majFiletsCharge(dt) {
    const f = gameState._filetsCharge;
    for (let i = f.length - 1; i >= 0; i--) {
        const t = f[i];
        t.age += dt;
        /* Arrivee du convoi : un anneau de choc sur l'astre qui charge. On ne
           le pose qu'une fois, a la traversee du seuil. */
        if (!t.arrive && t.age >= t.maxAge * 0.72) {
            t.arrive = true;
            if (!gameState._ondes) gameState._ondes = [];
            gameState._ondes.push({ x: t.vers.x, y: t.vers.y, suit: t.vers,
                                    r0: t.vers.radius * 0.6, r1: t.vers.radius * 2.1,
                                    age: 0, maxAge: 0.45, couleur: '220,200,255', ep: 2.5 });
        }
        if (t.age >= t.maxAge) f.splice(i, 1);
    }
    const o = gameState._ondes;
    if (o) for (let i = o.length - 1; i >= 0; i--) {
        o[i].age += dt;
        if (o[i].age >= o[i].maxAge) o.splice(i, 1);
    }
}

/* Anneaux qui s'ouvrent : arrivee d'un convoi de charge, onde d'un soleil. */
function drawOndes(ctx) {
    const o = gameState._ondes;
    if (!o || !o.length) return;
    const ep = 1 / gameState.camera.zoom;
    ctx.save();
    for (let i = 0; i < o.length; i++) {
        const w = o[i];
        const u = w.age / w.maxAge;
        const k = 1 - u;
        if (w.suit) { w.x = w.suit.x; w.y = w.suit.y; }
        const r = w.r0 + (w.r1 - w.r0) * u;
        if (!aLEcran(w.x, w.y, r)) continue;
        ctx.strokeStyle = 'rgba(' + w.couleur + ',' + (k * k * 0.85).toFixed(3) + ')';
        ctx.lineWidth = Math.max(1, w.ep * ep * k);
        ctx.beginPath();
        ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

/* LE CONVOI DE CHARGE. C'etait un trait droit qui palissait : on ne voyait
   ni d'ou partaient les spores, ni qu'elles arrivaient. Chaque envoi est
   maintenant un arc - le cote est tire au depart, deux astres voisins ne se
   superposent donc pas - le long duquel filent trois grains lumineux. Le
   sillage est peint en deux passes, large et sourde dessous, fine et claire
   dessus : c'est ce qui donne l'impression de lumiere sans cout de flou. */
function drawFiletsCharge(ctx) {
    const lanceur = gameState._fireLanceur;
    const f = gameState._filetsCharge;
    if (!lanceur && !f.length) return;
    const cam = gameState.camera;
    const ep = 1 / cam.zoom;
    const temps = gameState.time || 0;

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < f.length; i++) {
        const t = f[i];
        if (t.cote === undefined) t.cote = (i % 2) ? 1 : -1;
        const u0 = t.age / t.maxAge;
        const k = 1 - u0;
        const ax = t.de.x, ay = t.de.y, bx = t.vers.x, by = t.vers.y;
        const dx = bx - ax, dy = by - ay;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const cx = (ax + bx) / 2 - dy / d * d * 0.15 * t.cote;
        const cy = (ay + by) / 2 + dx / d * d * 0.15 * t.cote;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx, cy, bx, by);
        ctx.strokeStyle = 'rgba(140,100,255,' + (0.26 * k).toFixed(3) + ')';
        ctx.lineWidth = 8 * ep;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(228,210,255,' + (0.7 * k).toFixed(3) + ')';
        ctx.lineWidth = 2 * ep;
        ctx.stroke();

        /* Les grains. Ils courent un peu plus vite que la vie du filet, pour
           arriver avant qu'il ne s'efface. */
        for (let g = 0; g < 3; g++) {
            const u = u0 * 1.4 - g * 0.12;
            if (u < 0 || u > 1) continue;
            const iu = 1 - u;
            const px = iu * iu * ax + 2 * iu * u * cx + u * u * bx;
            const py = iu * iu * ay + 2 * iu * u * cy + u * u * by;
            const r = (5.5 - g * 1.3) * ep * (0.75 + 0.25 * Math.sin(temps * 18 + g * 2));
            ctx.fillStyle = 'rgba(170,130,255,0.30)';
            ctx.beginPath(); ctx.arc(px, py, r * 2.6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,250,255,' + (0.95 * k).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        }
    }

    /* L'ASTRE QUI CHARGE. Deux anneaux qui tournent en sens inverse, et une
       lueur qui monte avec la charge accumulee : on voit le tir se remplir. */
    if (lanceur && gameState._firePhase === 'aiming') {
        const charge = Math.min(1, (gameState._chargeAcc || 0) / CHARGE_PERIODE);
        const battement = 0.55 + 0.45 * Math.sin(temps * 6);
        const base = lanceur.radius + 8 * ep;
        ctx.strokeStyle = 'rgba(220,200,255,' + (0.45 + 0.45 * battement).toFixed(3) + ')';
        ctx.lineWidth = Math.max(1.5, 3 * ep);
        ctx.beginPath();
        ctx.arc(lanceur.x, lanceur.y, base, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = Math.max(1, 2.5 * ep);
        for (let a = 0; a < 2; a++) {
            const sens = a ? -1 : 1;
            const dep = temps * 1.9 * sens + a * Math.PI;
            ctx.strokeStyle = 'rgba(190,150,255,' + (0.35 + 0.45 * charge).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(lanceur.x, lanceur.y, base + (5 + a * 5) * ep, dep, dep + Math.PI * 0.55);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(lanceur.x, lanceur.y, base + (5 + a * 5) * ep, dep + Math.PI, dep + Math.PI * 1.55);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function _selectSporeType(type) {
    _closeSporMenu();
    gameState._fireType = type;
    gameState._firePhase = 'aiming';
}
function _syncServerIds() {}
function _buildBodyIndex() {}

function _stmDraw() {
    const ctx = _stmCtx;
    const cx = STM_SIZE/2, cy = STM_SIZE/2;
    ctx.clearRect(0, 0, STM_SIZE, STM_SIZE);
    const n = _stmSectors.length;
    const asp = (Math.PI * 2) / n;
    const off = -Math.PI / 2;
    for (let i = 0; i < n; i++) {
        const s = _stmSectors[i];
        const a1 = off + i * asp, a2 = a1 + asp;
        const isH = _stmHover === i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, STM_R, a1, a2);
        ctx.closePath();
        ctx.fillStyle = s.disabled ? 'rgba(30,30,40,0.7)' : (isH ? s.colorHover : s.color);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
        const midA = (a1+a2)/2;
        const lr = (STM_R+STM_INNER)/2;
        const lx = cx+Math.cos(midA)*lr, ly = cy+Math.sin(midA)*lr;
        ctx.save();
        ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        if (s.type === 'parasite') dessinerIconeBat(ctx, 'parasite', lx, ly-7, 22);
        else ctx.fillText(s.icon, lx, ly-7);
        ctx.font=`bold 8px 'Exo 2',sans-serif`; ctx.fillStyle='rgba(255,255,255,0.9)';
        ctx.fillText(s.label, lx, ly+8);
        if (s.count) { ctx.font=`7px 'Exo 2',sans-serif`; ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillText(s.count, lx, ly+18); }
        ctx.restore();
    }
    const nb = _stmBldSectors.length;
    if (nb > 0) {
        const bsp = (Math.PI * 2) / nb;
        for (let i = 0; i < nb; i++) {
            const b = _stmBldSectors[i];
            const a1 = off + i * bsp, a2 = a1 + bsp;
            const isH = _stmHoverB === i;
            ctx.beginPath();
            ctx.arc(cx, cy, STM_R2, a1, a2);
            ctx.arc(cx, cy, STM_R+4, a2, a1, true);
            ctx.closePath();
            const baseCol = b.active ? b.color.replace('0.3','0.85') : (isH ? b.color.replace('0.3','0.6') : b.color);
            ctx.fillStyle = b.active ? baseCol : (isH ? baseCol : b.color);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
            const midA = (a1+a2)/2;
            const lr2 = (STM_R2+STM_R+4)/2;
            const lx = cx+Math.cos(midA)*lr2, ly = cy+Math.sin(midA)*lr2;
            ctx.save();
            ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.globalAlpha = b.disabled ? 0.35 : 1;
            if (BATI_GENRES.indexOf(b.mode) >= 0) dessinerIconeBat(ctx, b.mode, lx, ly-4, 18);
            else if (b.icon) ctx.fillText(b.icon, lx, ly-4);
            ctx.font=`bold 7px 'Exo 2',sans-serif`; ctx.fillStyle='rgba(255,255,255,0.85)';
            ctx.fillText(b.name.split(' ')[0], lx, ly+7);
            ctx.restore();
        }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, STM_INNER, 0, Math.PI*2);
    ctx.fillStyle = _stmHover === -2 ? 'rgba(100,70,200,0.9)' : 'rgba(20,15,50,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,120,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('📖', cx, cy);
}
function _stmGetSector(x, y) {
    const cx = STM_SIZE/2, cy = STM_SIZE/2;
    const dx = x-cx, dy = y-cy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    if (dist < STM_INNER) return { zone:'codex' };
    if (dist <= STM_R) {
        const angle = Math.atan2(dy, dx);
        const n = _stmSectors.length;
        const asp = (Math.PI*2)/n;
        let a = angle - (-Math.PI/2); if (a<0) a+=Math.PI*2;
        return { zone:'spore', idx: Math.floor(a/asp) };
    }
    if (dist <= STM_R2 && _stmBldSectors.length > 0) {
        const angle = Math.atan2(dy, dx);
        const nb = _stmBldSectors.length;
        const bsp = (Math.PI*2)/nb;
        let a = angle - (-Math.PI/2); if (a<0) a+=Math.PI*2;
        return { zone:'bld', idx: Math.floor(a/bsp) };
    }
    return { zone:'outside' };
}
if (false) { _stmCanvas.addEventListener('mousemove', (e) => {
    const r = _stmCanvas.getBoundingClientRect();
    const x = e.clientX-r.left, y = e.clientY-r.top;
    const hit = _stmGetSector(x, y);
    const prevH = _stmHover, prevB = _stmHoverB;
    _stmHover = hit.zone==='spore' ? hit.idx : (hit.zone==='codex' ? -2 : -1);
    _stmHoverB = hit.zone==='bld' ? hit.idx : -1;
    if (_stmHover !== prevH || _stmHoverB !== prevB) _stmDraw();
   if (hit.zone==='bld') { const b = _stmBldSectors[hit.idx]; if (b) _stmShowTip(b.tip || b.name, e.clientX, e.clientY); } else { _stmHideTip(); }
}); }

function _stmOpen(body, clientX, clientY) {
    _stmInit();
    const ratio = gameState.jetRatio;
    /* Sur un astre qu'on assiege, les spores disponibles ne sont pas celles
       de l'astre - qui sont au defenseur - mais celles qu'on tient a sa
       surface. */
    const _dispo = (body.owner === localSlot()) ? (body.spores || 0)
                 : ((body.lutte && body.lutte.assaut[localSlot()]) || 0);
    const norm = _sp(_dispo * ratio);
    const paraCount = (body.parasiteSpore || 0);
    _stmSectors = [
        { type:'normal',      icon:'⚪', label:'Spores',  count: norm + ' sp',         color:'rgba(60,40,120,0.85)',  colorHover:'rgba(100,70,180,0.95)', disabled: norm < 5 },
        { type:'parasite',    icon:null,   label:'Parasite',count: paraCount + ' prête', color:'rgba(10,60,25,0.85)',  colorHover:'rgba(20,120,50,0.95)',  disabled: paraCount < 1 },
    ];
    const _base = body.baseMaxSpores || body.maxSpores || 0;
    const _BLD_ALL = [
        { mode:'off',     icon:'⬛', name:'OFF',     color:'rgba(100,70,180,0.3)',  tip:'Production normale.',                              disabled:false },
        /* Le gain et le cout affiches sont ceux du PROCHAIN batiment : ils
           changent a chaque construction, c'est tout l'interet de la courbe. */
        { mode:'alveole', icon:null, name:'ALVÉOLE', color:'rgba(234,179,8,0.3)',   tip:`+${pct(bonusProchain(body.alveoles, 'alveole'))}% stock max · Coût: ${coutBatiment(body,'alveole')} sp`, disabled: body.spores < coutBatiment(body,'alveole') },
        { mode:'nid',     icon:null, name:'NID',     color:'rgba(34,197,94,0.3)',   tip:`+${pct(bonusProchain(body.nids, 'nid'))}% prod · Coût: ${coutBatiment(body,'nid')} sp`,   disabled: body.spores < coutBatiment(body,'nid') },
        { mode:'biome',   icon:null, name:'BIOME',   color:'rgba(59,130,246,0.3)',  tip:`+${pct(bonusProchain(body.biomes, 'biome'))}% défense · Coût: ${coutBatiment(body,'biome')} sp`,  disabled: body.spores < coutBatiment(body,'biome') },
        { mode:'parasite',icon:null, name:'FOYER PUTRIDE',color:'rgba(10,80,30,0.3)',    tip:'2 min → 1 spore parasitaire.',                      disabled:(body.parasiteSpore||0)>=1 },
    ];
    _stmBldSectors = _BLD_ALL.map(b => ({ ...b, active: body.buildMode===b.mode }));
    _stmLiveBody = body;
    _stmHover = -1;
    _stmHoverB = -1;
    _stmDraw();
    const menu = document.getElementById('sporeTypeMenu');
    menu.style.display = 'block';
    const _mx = Math.max(8, Math.min(window.innerWidth - STM_SIZE - 8, clientX - STM_SIZE/2));
    const _my = Math.max(8, Math.min(window.innerHeight - STM_SIZE - 8, clientY - STM_SIZE/2));
    menu.style.left = _mx + 'px';
    menu.style.top  = _my + 'px';
    _updateBodyInfoPanel(body, _mx, _my);
}

function _updateBodyInfoPanel(body, menuLeft, menuTop) {
    const panel = document.getElementById('bodyInfoPanel');
    if (!panel) return;
    if (!body) { panel.style.display = 'none'; return; }

    const player = gameState.players[localSlot()];
    const sacPct = player?.multiSacrifice || 0;
    const symPct = Math.round(((body.symbiosis||0)/100)*(body.type==='planet'?20:10));
    const nidPct = Math.round(bonusBatiment(body.nids||0, 'nid') * 100);
    const rate = debitAstre(body);

    // Parasite envoyé par ce joueur
    const _parasitedByMe = [...gameState.planets, ...gameState.moons]
        .filter(b => b.parasite && b.parasite.ownerSlot === localSlot() && b.parasite.sourceName === body.name);

    const rows = [];
    rows.push({ label:'Production', val: rate > 0 ? `+${Math.round(rate)}/s` : '—', cls:'bi-pos' });
    rows.push({ label:'Spores', val: `${_sp(body.spores||0)} / ${body.maxSpores||0}`, cls:'bi-neu' });
    rows.push('sep');
    if (sacPct > 0) rows.push({ label:'Sacrifice', val: `-${sacPct}%`, cls:'bi-neg' });
    if (symPct > 0) rows.push({ label:'Symbiose', val: `+${symPct}%`, cls:'bi-pos' });
    if (nidPct > 0) rows.push({ label:'Nids (×'+body.nids+')', val: `+${nidPct}%`, cls:'bi-pos' });
    if ((body.biomes||0) > 0) rows.push({ label:'Biomes (×'+body.biomes+')', val: `+${body.biomes*5}% déf`, cls:'bi-pos' });
    if ((body.alveoles||0) > 0) rows.push({ label:'Alvéoles (×'+body.alveoles+')', val: `+${body.alveoles*5}% cap`, cls:'bi-pos' });
    if (body.buildMode && body.buildMode !== 'off') rows.push({ label:'Construction', val: body.buildMode, cls:'bi-neu' });
    if (body.parasite) {
        const _parasiteSrcName = body.parasite.sourceName || '?';
        const _parasiteDrainRate = rate >= 10 ? Math.max(1, Math.round(rate * 0.20)) : Math.round(rate * 0.20 * 10) / 10;
        rows.push({ label: `Parasite de ${_parasiteSrcName}`, val: `-20% prod (-${_parasiteDrainRate}/s)`, cls:'bi-neg' });
    }
    if (_parasitedByMe.length > 0) {
        for (const _pb of _parasitedByMe) {
            const _pbPlayer = gameState.players.find(p => p.id === _pb.owner);
            const _pbRate = _pb.flore > 0 ? (0.4+(_pb.flore/100)*0.6)*(1+(player?.stats?.growth||0)*0.3)*2.5 : 0;
            const _pbDrain = _pbRate >= 10 ? Math.max(1, Math.round(_pbRate * 0.20)) : Math.round(_pbRate * 0.20 * 10) / 10;
            rows.push({ label: `${_pb.name} parasité`, val: `+${_pbDrain}/s`, cls:'bi-pos' });
        }
    }

    panel.innerHTML = `<div class="bi-title">${body.name}</div>` +
        rows.map(r => r === 'sep'
            ? '<hr class="bi-sep">'
            : `<div class="bi-row"><span class="bi-label">${r.label}</span><span class="bi-val ${r.cls}">${r.val}</span></div>`
        ).join('');

    panel.style.display = 'block';
    // Positionner à droite du menu radial
    const pw = 200, ph = panel.offsetHeight || 200;
    let px = menuLeft + STM_SIZE + 8;
    if (px + pw > window.innerWidth - 8) px = menuLeft - pw - 8;
    let py = Math.max(8, Math.min(window.innerHeight - ph - 8, menuTop));
    panel.style.left = px + 'px';
    panel.style.top  = py + 'px';
    gameState._parasiteArrowBody = body;
}

function startSpawnCountdown() {
    let remaining = 30;
    const banner = document.getElementById('spawnBanner');
    if (banner) banner.textContent = 'CHOISISSEZ VOTRE PLANÈTE — ' + remaining + 's';
    spawnCountdownInterval = setInterval(() => {
        remaining--;
        if (banner) banner.textContent = 'CHOISISSEZ VOTRE PLANÈTE — ' + remaining + 's';
        if (remaining <= 0) {
            clearInterval(spawnCountdownInterval);
            spawnCountdownInterval = null;
            finishMultiSpawn();
        }
    }, 1000);
}

function finishMultiSpawn() {
    const slot = localSlot();
    const human = gameState.players.find(p => p.id === slot) || gameState.players[slot];
    // Seed déterministe pour le spawn auto (identique sur tous les clients)
    const spawnRng = mulberry32((gameState.multiSeed || 42) + 9999);
    // Si le joueur n'a pas choisi, placer au hasard
    // Détection colonisations adverses (pendant spawn)
    if (gameState.phase === 'spawn') {
        for (let i = 0; i < gameState.players.length; i++) {
            if (i === localSlot()) continue;
            const p = gameState.players[i];
            if (p && p.spawnPlanet && !p._spawnAnnounced) {
                p._spawnAnnounced = true;
                const b = p.spawnPlanet;
                addEvent('war', '🌍', `${p.name} colonise ${b.name} !`, b, p.color);
                // Flash visuel sur la planète
                if (!gameState._spawnFlashes) gameState._spawnFlashes = [];
                gameState._spawnFlashes.push({ body: b, age: 0, maxAge: 2, color: p.color });
                // Flèche hors-écran
                if (!gameState._spawnArrows) gameState._spawnArrows = [];
                gameState._spawnArrows.push({ body: b, age: 0, maxAge: 3, color: p.color });
            }
        }
    }
    if (!human || !human.spawnPlanet) {
        const free = [...gameState.planets, ...gameState.moons].filter(b => b.owner === null);
        if (free.length > 0) {
            const pick = free[Math.floor(spawnRng() * free.length)];
            pick.owner = slot;
            pick.spores = pick.maxSpores * 0.5;
            human.bodies = [pick];
            human.spawnPlanet = pick;
            sendAction('spawn', { bodyName: pick.name });
        }
    }
    // Placer les joueurs distants non spawn (déterministe)
    for (const player of gameState.players) {
        if (!player.spawnPlanet) {
            const free = [...gameState.planets, ...gameState.moons].filter(b => b.owner === null);
            if (free.length > 0) {
                const pick = free[Math.floor(spawnRng() * free.length)];
                pick.owner = player.id;
                pick.spores = pick.maxSpores * 0.5;
                player.bodies = [pick];
                player.spawnPlanet = pick;
            }
        }
    }
    setPhase('game');
}

const AI_NAMES = ['Zyrex','Vorath','Nex','Kael','Draven','Syx','Torvan','Umek','Xael','Phryx','Corvus','Zalith','Nekron','Vreth','Oxar','Juvek','Thyron','Blaze','Mordax','Cynth'];
const _usedAiNames = new Set();
function randomAiName() {
    const available = AI_NAMES.filter(n => !_usedAiNames.has(n));
    const pool = available.length > 0 ? available : AI_NAMES;
    const n = pool[Math.floor(gameRandom() * pool.length)];
    _usedAiNames.add(n); return '[IA] ' + n;
}
function createPlayers() {
    gameState.players = [];
    _usedAiNames.clear();
    const colors = [...gameState.teamColors];

  if (gameState.isMulti && currentRoom) {
        const roomPlayers = (gameState._serverPlayers || []);
        for (let i = 0; i < roomPlayers.length; i++) {
            const rp = roomPlayers[i];
            const isMe = (rp.slot === mySlot);
            gameState.players.push({
                id: rp.slot,
                name: rp.pseudo,
                color: rp.color,
                isHuman: true,
                isLocal: isMe,
                stats: isMe ? { ...gameState.playerStats } : (rp.stats || { growth: 3, velocity: 4, density: 2, sensitivity: 1 }),
                bodies: [],
                totalSpores: 0,
                alive: true,
                spawnPlanet: null,
                multiTier: 0,
                multiProgress: 0,
                multiSacrifice: 0,
                nidification: {},
                tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] }
            });
        }
        // Ajouter les IAs multi
        const aiCount = gameState.config.aiCount || 0;
        const useIA = gameState.config.useIA !== false;
        if (aiCount > 0 && useIA) {
            const usedColors = roomPlayers.map(rp => rp.color);
            const aiColors = colors.filter(c => !usedColors.includes(c));
            for (let a = 0; a < aiCount; a++) {
                const aiId = roomPlayers.length + a;
                const aiColor = aiColors[a % aiColors.length] || colors[a % colors.length];
                gameState.players.push({
                    id: aiId,
                    name: randomAiName(),
                    color: aiColor,
                    isHuman: false,
                    stats: { growth: 3, velocity: 4, density: 2, sensitivity: 1 },
                    bodies: [],
                    totalSpores: 0,
                    alive: true,
                    spawnPlanet: null,
                    aiTimer: 0,
                    aiCooldown: gameState.config.difficulty === 'easy' ? 3 : gameState.config.difficulty === 'normal' ? 1.5 : 0.5,
                    multiTier: 0,
                    multiProgress: 0,
                    multiSacrifice: 0,
                    nidification: {},
                    tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] }
                });
            }
        }
        return;
    }

    // Mode solo
    gameState.players.push({
        id: 0,
        name: (currentProfile && currentProfile.pseudo) ? displayName(currentProfile.pseudo, currentProfile._guildTag) : 'Commandant',
        color: gameState.playerColor,
        isHuman: true,
        isLocal: true,
        stats: { ...gameState.playerStats },
        bodies: [],
        totalSpores: 0,
        alive: true,
        spawnPlanet: null,
        multiTier: 0,
        multiProgress: 0,
        multiSacrifice: 0,
        nidification: {},
        tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] }
    });

    const usedIdx = colors.indexOf(gameState.playerColor);
    if (usedIdx >= 0) colors.splice(usedIdx, 1);

    for (let i = 1; i < gameState.config.playerCount; i++) {
        const aiColor = colors[(i - 1) % colors.length];
        gameState.players.push({
            id: i,
            name: randomAiName(),
            color: aiColor,
            isHuman: false,
            stats: { growth: 3, velocity: 4, density: 2, sensitivity: 1 },
            bodies: [],
            totalSpores: 0,
            alive: true,
            spawnPlanet: null,
            aiTimer: 0,
            aiCooldown: gameState.config.difficulty === 'easy' ? 3 : gameState.config.difficulty === 'normal' ? 1.5 : 0.5,
            multiTier: 0,
            multiProgress: 0,
            multiSacrifice: 0,
            nidification: {},
            tech: { homing:0, tenacity:0, mimicry:0, _branchOrder:[] }
        });
    }
}// ─────────────────────────────────────────────

// MULTIPLICITÉ — Fonctions
// ─────────────────────────────────────────────
function getMultiTierCost(currentTier) {
    return (currentTier + 1) * 100;
}

function aiChooseMultiStat(player) {
    /* L'IA monte sa statistique la plus faible. Sensitivity entre dans le
       tirage comme les autres - sans quoi l'IA n'en aurait jamais. */
    const s = player.stats;
    if (s.sensitivity === undefined) s.sensitivity = 1;
    const noms = ['growth', 'velocity', 'density', 'sensitivity'];
    let choix = noms[0];
    for (let i = 1; i < noms.length; i++) if (s[noms[i]] < s[choix]) choix = noms[i];
    s[choix]++;
    player.multiTier++;
}

/* Les paliers atteints mais pas encore places. C'etait un simple "oui/non" :
   un deuxieme palier atteint avant qu'on ait choisi etait PERDU. C'est
   desormais un compteur, les points s'empilent et on les place quand on
   veut. */
/* La part de production sacrifiee pour la multiplicite (0 a 0,5). Plus rien
   une fois les 10 paliers atteints : le reglage restait, et l'astre perdait
   jusqu'a la moitie de sa production pour rien (les IA, 15 a 34 %, toute la
   partie). */
/* LE COUP DE POUCE DES IA FAIBLES. Une IA reduite a deux astres ou moins
   produisait trop peu pour se defendre : assiegee, elle ne tirait presque
   plus et tombait (audit des parties entre IA). Elle produit 30 % de plus,
   et riposte plus tot (zones.js). Les joueurs humains n'y ont pas droit. */
function iaFaible(player) {
    return !!(player && !player.isHuman && player.bodies && player.bodies.length > 0 && player.bodies.length <= 2);
}
function bonusIaFaible(player) { return iaFaible(player) ? 1.3 : 1; }

function partSacrifice(player) {
    if (!player || !(player.multiSacrifice > 0)) return 0;
    if ((player.multiTier || 0) + multiEnAttente(player) >= 10) return 0;
    return Math.min(player.multiSacrifice / 100, 0.5);
}

function multiEnAttente(player) {
    return player._multiPending === true ? 1 : (player._multiPending | 0);
}

function applyMultiChoice(player, stat) {
    player.stats[stat]++;
    player.multiTier++;
    player._multiPending = Math.max(0, multiEnAttente(player) - 1);
    if (player === gameState.players[localSlot()]) {
        addEvent('build', '✦', `Multiplicité palier ${player.multiTier} — ${stat} +1`, null, player.color);
    }
}

function updateMultiPanel() {
    const panel = document.getElementById('evoPanel');
    if (!panel || gameState.phase !== 'game') return;
    /* Toujours visible en jeu : il n'y a plus a l'ouvrir. */
    if (panel.style.display === 'none' || panel.style.display === '') panel.style.display = 'block';

    const human = gameState.players[localSlot()];
    if (!human || !human.alive) return;

    // Pips - les paliers atteints mais pas encore places brillent comme le
    // palier en cours : ils attendent qu'on s'en serve.
    const attente = multiEnAttente(human);
    const atteints = human.multiTier + attente;
    const pipsEl = document.getElementById('evoTierPips');
    let pipsHtml = '';
    for (let i = 0; i < 10; i++) {
        const filled = i < human.multiTier ? 'filled' : '';
        const current = i >= human.multiTier && i <= atteints && i < 10 ? 'current' : '';
        const label = i < human.multiTier ? (i + 1) : '';
        pipsHtml += `<div class="tier-pip ${filled} ${current}">${label}</div>`;
    }
    pipsEl.innerHTML = pipsHtml;

    // Barre de progression
    const cost = getMultiTierCost(atteints);
    const pct = atteints >= 10 ? 100 : Math.min(100, (human.multiProgress / cost) * 100);
    document.getElementById('evoBar').style.width = pct + '%';

    // Info
    const info = atteints >= 10
        ? (attente ? 'ÉVOLUTION MAXIMALE — reste à placer' : 'ÉVOLUTION MAXIMALE')
        : `Palier ${atteints}/10 — ${Math.floor(human.multiProgress)} / ${cost} spores`;
    document.getElementById('evoInfo').textContent = info;

    // Slider
    document.getElementById('evoSacVal').textContent = human.multiSacrifice + '%';

    // Choix de stat en attente ?
    const chooseEl = document.getElementById('evoChoose');
    if (attente > 0) {
        chooseEl.style.display = 'block';
        document.getElementById('evoChooseTitle').textContent = attente > 1
            ? `⬆ CHOISISSEZ — ${attente} POINTS À PLACER ⬆`
            : '⬆ CHOISISSEZ UN BONUS ⬆';
        document.getElementById('evoGrowthCur').textContent = `(${human.stats.growth})`;
        document.getElementById('evoVelocityCur').textContent = `(${human.stats.velocity})`;
        document.getElementById('evoDensityCur').textContent = `(${human.stats.density})`;
        document.getElementById('evoSensitivityCur').textContent = `(${human.stats.sensitivity || 0})`;
        document.getElementById('evoGrowth').disabled = human.stats.growth >= 8;
        document.getElementById('evoVelocity').disabled = human.stats.velocity >= 8;
        document.getElementById('evoDensity').disabled = human.stats.density >= 8;
        document.getElementById('evoSensitivity').disabled = (human.stats.sensitivity || 0) >= 8;
    } else {
        chooseEl.style.display = 'none';
    }

    // Mise à jour panneau stats + effets
    const s = human.stats;
    const base = gameState.playerStats || { growth: 3, velocity: 4, density: 2, sensitivity: 1 };
    document.getElementById('evoStatGrowth').textContent = s.growth;
    document.getElementById('evoStatVelocity').textContent = s.velocity;
    document.getElementById('evoStatDensity').textContent = s.density;
    document.getElementById('evoStatSensitivity').textContent = s.sensitivity || 0;
    const gB = s.growth - base.growth;
    const vB = s.velocity - base.velocity;
    const dB = s.density - base.density;
    const sB = (s.sensitivity || 0) - (base.sensitivity || 0);
    document.getElementById('evoStatGrowthBonus').textContent = gB > 0 ? `+${gB}` : '';
    document.getElementById('evoStatVelocityBonus').textContent = vB > 0 ? `+${vB}` : '';
    document.getElementById('evoStatDensityBonus').textContent = dB > 0 ? `+${dB}` : '';
    document.getElementById('evoStatSensitivityBonus').textContent = sB > 0 ? `+${sB}` : '';
    // Effets concrets
    const velSpeed = 20 + s.velocity * 6;
    const densPct = Math.round(s.density * 5);
    document.getElementById('evoStatGrowthFx').textContent = `×${(1 + s.growth * 0.3).toFixed(1)} prod`;
    document.getElementById('evoStatVelocityFx').textContent = `${velSpeed} vitesse`;
    document.getElementById('evoStatDensityFx').textContent = `+${densPct}% impact`;
    document.getElementById('evoStatSensitivityFx').textContent = `+${Math.round((s.sensitivity || 0) * ONDE_PAR_POINT * 100)}% onde`;
}

