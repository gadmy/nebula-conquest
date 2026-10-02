/* ─────────────────────────────────────────────
   ORDRES DES JOUEURS
   Un geste du joueur (tirer, construire, choisir une techno...) n'agit plus
   sur la partie au moment du clic : il devient un ORDRE, date du tour qui
   suit, et c'est ce tour qui l'applique. Un ordre ne contient que des
   donnees (noms d'astres, directions, nombres), jamais l'etat de l'ecran :
   ni la souris, ni la camera, ni un reglage local. Deux navigateurs qui
   recoivent les memes ordres aux memes tours calculent donc la meme partie
   - en lockstep, le serveur n'aura qu'a faire circuler ces ordres.
   En solo l'ordre part pour le tour suivant (1/60 s : imperceptible). En
   multijoueur actuel, c'est toujours le serveur qui decide (sendAction).
   Tout ordre applique est garde dans le journal : de quoi rejouer une
   partie, ou remettre a niveau un joueur qui se reconnecte.
   ───────────────────────────────────────────── */
let _ordresEnAttente = [];

/* LE TIR REPOND AU CLIC. En reseau, le vrai tir part quand l'ordre revient
   du relais (50 a 100 ms plus tard) : le son et un bref eclair au depart,
   eux, viennent tout de suite. Purement local : rien dans la partie. */
const _echos = [];
function echoTir(d) {
    const src = astreNomme(d && d.src);
    if (!src || !isFinite(d.dx) || !isFinite(d.dy)) return;
    playLaunchSound();
    const j = gameState.players[localSlot()];
    _echos.push({ b: src, dx: +d.dx, dy: +d.dy, t0: performance.now(), couleur: (j && j.color) || '#FFFFFF' });
}
function drawEchoTirs(ctx) {
    if (!_echos.length) return;
    const now = performance.now(), z = gameState.camera.zoom;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = _echos.length - 1; i >= 0; i--) {
        const e = _echos[i], f = (now - e.t0) / 250;
        if (f >= 1) { _echos.splice(i, 1); continue; }
        const b = e.b, r0 = b.radius + 4 / z, l = (18 + 40 * f) / z;
        const x0 = b.x + e.dx * r0, y0 = b.y + e.dy * r0;
        ctx.globalAlpha = 0.9 * (1 - f);
        ctx.strokeStyle = e.couleur;
        ctx.lineWidth = Math.max(1.5 / z, 4 / z * (1 - f));
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + e.dx * l, y0 + e.dy * l);
        ctx.stroke();
        const rh = (10 + 16 * f) / z;
        ctx.drawImage(haloSprite(e.couleur, 'halo'), x0 - rh, y0 - rh, rh * 2, rh * 2);
    }
    ctx.restore();
}

function donnerOrdre(type, d) {
    /* En lockstep, l'ordre part au relais : il reviendra a tous les joueurs
       dans un paquet, date du meme tour pour chacun (recevoirPaquet). */
    if (gameState.lockstep) {
        envoyerAuRelais({ t: 'ordre', type: type, d: d || {} });
        if (type === 'tir') echoTir(d);
        return;
    }
    programmerOrdre({ tour: (gameState.tour || 0) + 1, slot: localSlot(), type: type, d: d || {} });
}

function programmerOrdre(o) {
    _ordresEnAttente.push(o);
}

/* Les ordres dus a ce tour (ou en retard), dans l'ordre ou ils sont
   arrives. On les sort de la file avant de les executer. */
function appliquerOrdres(tour) {
    if (!_ordresEnAttente.length) return;
    const dus = [], reste = [];
    for (const o of _ordresEnAttente) (o.tour <= tour ? dus : reste).push(o);
    if (!dus.length) return;
    _ordresEnAttente = reste;
    if (!gameState.journalOrdres) gameState.journalOrdres = [];
    for (const o of dus) {
        const f = EXECUTER_ORDRE[o.type];
        if (!f || !gameState.players[o.slot]) continue;
        f(o.slot, o.d);
        gameState.journalOrdres.push(o);
    }
}

function astreNomme(nom) {
    if (!nom) return null;
    return (gameState.allBodies || []).find(b => b.name === nom) || null;
}

/* Ce que fait chaque ordre. slot : le joueur qui l'a donne. */
const EXECUTER_ORDRE = {
    /* Le depart : le regime politique, puis la reservation d'un astre. */
    regime: function (slot, d) {
        const D = _etatDepart(), p = gameState.players[slot];
        if (!D || D.etape !== 'regime' || !p || !regimeDe(d.id)) return;
        p.regime = String(d.id);
    },
    reserver: function (slot, d) { reserverAstre(slot, String(d.astre || '')); },
    /* En solo seulement : lancer sans attendre la fin du decompte. */
    depart_vite: function (slot, d) {
        const D = gameState.depart;
        if (gameState.lockstep || !departActif() || !D || D.etape !== 'planete') return;
        D.fin = Math.min(D.fin, gameState.tour + 1);
    },
    /* Proposer un commerce a un joueur (niveau 1 a 3). */
    commerce: function (slot, d) {
        const cible = Math.round(Number(d.cible)), niveau = Math.round(Number(d.niveau));
        if (!(niveau >= 1 && niveau <= 3) || !gameState.players[cible] || cible === slot) return;
        proposerCommerce(slot, cible, niveau);
    },
    /* Repondre a une proposition de commerce. */
    commerce_reponse: function (slot, d) {
        const de = Math.round(Number(d.de)), niveau = Math.round(Number(d.niveau));
        if (!gameState.players[de] || !(niveau >= 1 && niveau <= 3)) return;
        repondreCommerce(slot, de, niveau, !!d.ok);
    },
    /* Piloter la sphere capitale qu'on a capturee : une direction (ZQSD). */
    capital: function (slot, d) {
        const C = (gameState.capitaux || [])[d.k];
        if (!C || !capActive(C) || C.pilote !== slot) return;
        const lim = function (v) { v = Math.round(Number(v)); return v > 0 ? 1 : v < 0 ? -1 : 0; };
        C.cmdX = lim(d.dx); C.cmdY = lim(d.dy);
    },
    /* La part de spores envoyee a chaque tir, de 0 a 1. */
    part: function (slot, d) {
        const v = Number(d.v);
        if (v >= 0 && v <= 1) gameState.players[slot].jetRatio = v;
    },
    /* La zone d'ou partiront les tirs et les batiments sur un astre partage.
       Refusee si la zone n'existe plus ou n'est pas a ce joueur. */
    zone: function (slot, d) {
        const b = astreNomme(d.astre);
        const z = b && b.lutte && b.lutte.zones ? b.lutte.zones[d.id] : null;
        if (z && z.v === campDe(b, slot)) gameState.players[slot].zoneSel = { body: b, id: d.id };
    },
    /* Un tir depuis un astre, dans une direction (vecteur unitaire). */
    tir: function (slot, d) {
        const src = astreNomme(d.src);
        const dx = Number(d.dx), dy = Number(d.dy);
        if (!src || !isFinite(dx) || !isFinite(dy)) return;
        const t = ['normal', 'attaque', 'defense', 'parasite'].includes(d.t) ? d.t : 'normal';
        /* En reseau, notre propre tir a deja fait son bruit au clic (echoTir). */
        launchJet(src, dx, dy, t, slot, (gameState.lockstep && slot === localSlot()) ? { muet: true } : undefined);
    },
    /* Un tir de surface vers un point du monde. */
    tir_surface: function (slot, d) {
        const b = astreNomme(d.src);
        const tx = Number(d.tx), ty = Number(d.ty);
        if (b && isFinite(tx) && isFinite(ty)) lancerJetSurface(b, slot, tx, ty, true);
    },
    /* R : nos zones repartent a l'assaut, sur un astre ou partout (null). */
    riposte: function (slot, d) {
        const b = d.cible ? astreNomme(d.cible) : null;
        if (d.cible && !b) return;
        riposteGenerale(b, slot);
    },
    /* T : nos zones cessent de pousser, sur un astre ou partout (null). */
    arret: function (slot, d) {
        const b = d.cible ? astreNomme(d.cible) : null;
        if (d.cible && !b) return;
        arreterAttaques(b, slot);
    },
    /* Ce que l'astre produit : off, alveole, nid, biome ou parasite. */
    batiment: function (slot, d) {
        const b = astreNomme(d.astre);
        if (!b || !['off', 'alveole', 'nid', 'biome', 'parasite'].includes(d.mode)) return;
        if (demanderConstruction(b, d.mode, slot) && slot === localSlot()
            && gameState.selectedBody === b && typeof updateCodexBuild === 'function') {
            updateCodexBuild(b);
        }
    },
    /* Le pourcentage de production sacrifie a la multiplicite (0 a 50, les
       bornes du curseur). */
    sacrifice: function (slot, d) {
        const v = Math.round(Number(d.v));
        if (v >= 0 && v <= 50) gameState.players[slot].multiSacrifice = v;
    },
    /* Un palier de multiplicite atteint, place sur une statistique. */
    stat: function (slot, d) {
        const p = gameState.players[slot];
        if (!['growth', 'velocity', 'sensitivity', 'density'].includes(d.stat)) return;
        if (p._multiPending) applyMultiChoice(p, d.stat);
    },
    /* Un niveau de technologie achete. */
    techno: function (slot, d) {
        if (!['homing', 'tenacity', 'mimicry'].includes(d.branche)) return;
        if (buyTech(gameState.players[slot], d.branche) && slot === localSlot()) updateTechPanel();
    },
    /* L'astre de depart, pendant la phase de choix. */
    colonie: function (slot, d) {
        if (gameState.phase !== 'spawn') return;
        coloniser(slot, astreNomme(d.astre));
    },
    /* Le demolisseur : un tir lent de DEMOL_SPORES qui casse un batiment
       du genre choisi la ou il tombe. */
    demol: function (slot, d) {
        const src = astreNomme(d.src);
        const dx = Number(d.dx), dy = Number(d.dy);
        if (!src || !isFinite(dx) || !isFinite(dy) || !DEMOL_GENRES.includes(d.genre)) return;
        if (!peutTirerSurface(src, slot)) return;
        launchJet(src, dx, dy, 'normal', slot,
                  { nombre: DEMOL_SPORES, vitesse: DEMOL_VITESSE, pas: DEMOL_PAS, demol: d.genre });
    },

    /* LES GESTES CONTINUS : la visee (et sa charge), la rafale, la boule.
       Chacun a un debut, des mises a jour de la cible, et une fin. L'etat
       vit chez le joueur (ordreVisee, ordreRafale, ordreBoule) et c'est le
       calcul qui le fait avancer : majVisees, majRafales, majBoules. */
    visee: function (slot, d) {
        const src = astreNomme(d.src), j = gameState.players[slot];
        const tx = Number(d.tx), ty = Number(d.ty);
        if (!src || !isFinite(tx) || !isFinite(ty) || !peutTirerDe(src, slot)) return;
        if (j.ordreVisee && j.ordreVisee.src === src) { j.ordreVisee.tx = tx; j.ordreVisee.ty = ty; }
        else j.ordreVisee = { src: src, tx: tx, ty: ty, lanceur: null, acc: 0 };
    },
    visee_fin: function (slot) {
        gameState.players[slot].ordreVisee = null;
    },
    rafale_debut: function (slot, d) {
        const src = astreNomme(d.src), j = gameState.players[slot];
        const tx = Number(d.tx), ty = Number(d.ty);
        if (!src || !isFinite(tx) || !isFinite(ty) || !peutTirerDe(src, slot) || j.ordreBoule) return;
        /* Premier paquet sans attendre : le doigt appuie, ca part. */
        j.ordreRafale = { src: src, tx: tx, ty: ty, acc: 1 / RAFALE_CADENCE, n: 0 };
    },
    rafale_cible: function (slot, d) {
        const R = gameState.players[slot].ordreRafale;
        const tx = Number(d.tx), ty = Number(d.ty);
        if (!R || !isFinite(tx) || !isFinite(ty)) return;
        R.tx = tx; R.ty = ty;
        /* Le lanceur peut changer en cours de rafale (la cible passe plus
           pres d'une autre lune du groupe). */
        const src = astreNomme(d.src);
        if (src && peutTirerDe(src, slot)) R.src = src;
    },
    rafale_fin: function (slot) {
        gameState.players[slot].ordreRafale = null;
    },
    boule_debut: function (slot, d) {
        const src = astreNomme(d.src), j = gameState.players[slot];
        const tx = Number(d.tx), ty = Number(d.ty), z = Number(d.z);
        if (!src || !isFinite(tx) || !isFinite(ty) || !peutTirerDe(src, slot) || j.ordreBoule || j.ordreRafale) return;
        j.ordreBoule = { src: src, angle: Math.atan2(ty - src.y, tx - src.x), n: 0,
                         tx: tx, ty: ty, z: z > 0 ? z : 1 };
    },
    boule_cible: function (slot, d) {
        const B = gameState.players[slot].ordreBoule;
        const tx = Number(d.tx), ty = Number(d.ty), z = Number(d.z);
        if (!B || !isFinite(tx) || !isFinite(ty)) return;
        B.tx = tx; B.ty = ty;
        if (z > 0) B.z = z;
    },
    boule_fin: function (slot) {
        gameState.players[slot].ordreBoule = null;
    },
    /* Au relacher : la boule part dans l'axe centre -> boule. Trop peu
       chargee, elle se disperse. */
    boule_lancer: function (slot) {
        const j = gameState.players[slot], B = j.ordreBoule;
        if (!B) return;
        j.ordreBoule = null;
        const n = Math.floor(B.n);
        if (n >= 5) creerJetBoule(B.src, B.angle, n, slot);
    },
};

/* Un joueur peut-il tirer de cet astre : le sien, ou une tete de pont qu'il
   y tient ? */
function peutTirerDe(src, slot) {
    return src.owner === slot || !!(src.lutte && zonesDe(src, slot).length);
}

