// ─────────────────────────────────────────────
// COMMERCE ENTRE JOUEURS
// ─────────────────────────────────────────────
/* Clic droit sur un nom de la liste des joueurs : Info, ou Commerce. Un
   commerce lie un astre de chaque joueur ; chacun envoie a l'autre, a
   intervalle regulier, une petite boule lumineuse qui voyage lentement et
   donne ses spores a l'astre qui la recoit : les deux y gagnent.
   - Niveau 1, planete contre planete (lunes comprises) : 10 spores / 20 s.
   - Niveau 2, systeme planetaire contre systeme planetaire (une planete et
     toutes ses lunes) : 100 spores / 30 s.
   - Niveau 3, systeme solaire contre systeme solaire (tout ce qui tourne
     autour d'un soleil) : 1 000 spores / 40 s.
   Un astre ne sert qu'a un commerce a la fois ; deux joueurs peuvent donc
   en ouvrir plusieurs du meme niveau, autant qu'ils ont d'astres libres
   (deux planetes chacun : deux commerces planete contre planete). Le commerce dure tant
   qu'aucun des deux n'attaque l'autre : seule une attaque le rompt (un
   astre perdu est remplace par un autre, s'il en reste). Une IA juge : elle refuse
   si on l'a attaquee dans la derniere minute, ou si le demandeur est
   nettement plus fort qu'elle. Tout passe par des ordres : meme chose chez
   tous les joueurs en reseau. */
const COMMERCE_CFG = {
    niveaux: {
        1: { nom: 'Planète contre planète', periode: 20, quantite: 10 },
        2: { nom: 'Système planétaire', periode: 30, quantite: 100 },
        3: { nom: 'Système solaire', periode: 40, quantite: 1000 }
    },
    vitesseBoule: 110,
    voyageMax: 15,             /* secondes de voyage au plus */
    rancune: 60,               /* secondes pendant lesquelles une attaque fait refuser */
    ecartForce: 2              /* l'IA refuse si le demandeur est 2 fois plus fort */
};

function initCommerce() {
    gameState.commerces = [];
    gameState.orbesCommerce = [];
    gameState.propositions = [];
    gameState._commerceId = 0;
}

function _enCommerce(body) {
    return (gameState.commerces || []).some(function (c) { return c.srcA === body.name || c.srcB === body.name; });
}

/* Une planete et toutes ses lunes a ce joueur (au moins une lune). */
function _systemePlanetaire(p, slot) {
    if (p.type !== 'planet' || p.owner !== slot || !p.moons || !p.moons.length) return false;
    return p.moons.every(function (m) { return m.owner === slot; });
}
/* Tout ce qui tourne autour de ce soleil est a ce joueur. */
function _systemeSolaire(s, slot) {
    if (!s.planets || !s.planets.length) return false;
    for (const p of s.planets) {
        if (p.owner !== slot) return false;
        for (const m of (p.moons || [])) if (m.owner !== slot) return false;
    }
    return true;
}

/* Les astres qu'un joueur peut engager a ce niveau (libres de tout commerce). */
function _astresCommerce(slot, niveau) {
    const j = gameState.players[slot];
    if (!j || !j.bodies) return [];
    if (niveau === 1) return j.bodies.filter(function (b) { return !b.lutte && !_enCommerce(b); });
    if (niveau === 2) return j.bodies.filter(function (b) { return _systemePlanetaire(b, slot) && !_enCommerce(b); });
    /* Niveau 3 : la plus grosse planete de chaque systeme solaire complet. */
    const r = [];
    for (const s of gameState.suns) {
        if (!_systemeSolaire(s, slot)) continue;
        const pl = s.planets.slice().sort(function (a, b) { return b.radius - a.radius || (a.name < b.name ? -1 : 1); })[0];
        if (pl && !_enCommerce(pl)) r.push(pl);
    }
    return r;
}

/* Les deux astres d'un commerce : ceux qui sont le plus pres l'un de l'autre. */
function _paireCommerce(a, b, niveau) {
    const A = _astresCommerce(a, niveau), B = _astresCommerce(b, niveau);
    let best = null, bd = Infinity;
    for (const x of A) for (const y of B) {
        const d = Math.hypot(x.x - y.x, x.y - y.y);
        if (d < bd) { bd = d; best = [x, y]; }
    }
    return best;
}

/* Pourquoi un commerce n'est pas possible (ou '' s'il l'est). */
function raisonPasCommerce(a, b, niveau) {
    const ja = gameState.players[a], jb = gameState.players[b];
    if (!ja || !jb || a === b) return 'impossible';
    if (!jb.alive || !jb.bodies || !jb.bodies.length) return 'joueur éliminé';
    if ((gameState.propositions || []).some(function (p) { return p.de === a && p.a === b; })) return 'proposition en attente';
    if (!_astresCommerce(a, niveau).length) return niveau === 1 ? "vous n'avez pas d'astre libre" : niveau === 2 ? 'il vous faut une planète et toutes ses lunes' : 'il vous faut tout un système solaire';
    if (!_astresCommerce(b, niveau).length) return niveau === 1 ? "il n'a pas d'astre libre" : niveau === 2 ? "il n'a pas de planète avec toutes ses lunes" : "il n'a pas de système solaire complet";
    return '';
}

/* Une attaque de a sur b : b s'en souvient, et leurs commerces sont rompus. */
function noterAttaque(a, b) {
    if (a === b || a < 0 || b < 0) return;
    const jb = gameState.players[b];
    if (!jb) return;
    if (!jb.attaquesRecues) jb.attaquesRecues = {};
    jb.attaquesRecues[a] = gameState.time;
    /* Tous leurs commerces tombent ; une seule fenetre pour le dire. */
    let dit = false;
    for (const c of (gameState.commerces || []).slice()) {
        if ((c.a === a && c.b === b) || (c.a === b && c.b === a)) { finCommerce(c, 'attaque', a, dit); dit = true; }
    }
}

/* L'ordre 'commerce' : a propose a b, au niveau donne. */
function proposerCommerce(a, b, niveau) {
    const raison = raisonPasCommerce(a, b, niveau);
    const ja = gameState.players[a], jb = gameState.players[b];
    if (raison) {
        if (a === localSlot()) toastCommerce('Commerce impossible avec ' + (jb ? jb.name : '?') + ' : ' + raison, '#FCA5A5');
        return;
    }
    if (jb.isHuman) {
        /* Un humain decide lui-meme : sa fenetre s'ouvre chez lui. */
        gameState.propositions.push({ de: a, a: b, niveau: niveau, expire: gameState.time + 30 });
        if (a === localSlot()) toastCommerce('Proposition envoyée à ' + jb.name + '…', '#C4B5FD');
        if (b === localSlot()) fenetreProposition(a, niveau);
        return;
    }
    /* Une IA juge. */
    const attaque = jb.attaquesRecues && jb.attaquesRecues[a] !== undefined && gameState.time - jb.attaquesRecues[a] < COMMERCE_CFG.rancune;
    const tropFort = forceJoueur(ja) > forceJoueur(jb) * COMMERCE_CFG.ecartForce;
    if (attaque || tropFort) {
        if (a === localSlot()) toastCommerce(jb.name + ' refuse : ' + (attaque ? 'vous venez de l\'attaquer' : 'vous êtes bien plus fort'), '#FCA5A5');
        return;
    }
    ouvrirCommerce(a, b, niveau);
}

function repondreCommerce(b, a, niveau, ok) {
    const k = (gameState.propositions || []).findIndex(function (p) { return p.de === a && p.a === b && p.niveau === niveau; });
    if (k < 0) return;
    gameState.propositions.splice(k, 1);
    if (!ok) {
        if (a === localSlot()) toastCommerce(gameState.players[b].name + ' refuse le commerce', '#FCA5A5');
        return;
    }
    if (raisonPasCommerce(a, b, niveau) && raisonPasCommerce(a, b, niveau) !== 'proposition en attente') return;
    ouvrirCommerce(a, b, niveau);
}

function ouvrirCommerce(a, b, niveau) {
    const paire = _paireCommerce(a, b, niveau);
    if (!paire) return;
    const N = COMMERCE_CFG.niveaux[niveau];
    const t = gameState.time;
    const c = { id: ++gameState._commerceId, a: a, b: b, niveau: niveau, srcA: paire[0].name, srcB: paire[1].name,
                debut: t, prochain: t, periode: N.periode, quantite: N.quantite };
    gameState.commerces.push(c);
    const moi = localSlot();
    if (a === moi || b === moi) {
        const autre = gameState.players[a === moi ? b : a];
        toastCommerce('Alliance commerciale avec ' + autre.name + ' : ' + N.nom.toLowerCase() + ' (' + paire[a === moi ? 0 : 1].name + ' ↔ ' + paire[a === moi ? 1 : 0].name + ')', '#86EFAC');
    }
    addEvent('neutral', '🤝', gameState.players[a].name + ' et ' + gameState.players[b].name + ' commercent (' + N.nom.toLowerCase() + ')', paire[0], gameState.players[a].color);
}

function finCommerce(c, raison, fautif, sansFenetre) {
    const k = gameState.commerces.indexOf(c);
    if (k < 0) return;
    gameState.commerces.splice(k, 1);
    /* Rompu : les boules en route s'eteignent. */
    gameState.orbesCommerce = gameState.orbesCommerce.filter(function (o) { return o.commerce !== c.id; });
    const moi = localSlot();
    if ((c.a === moi || c.b === moi) && !sansFenetre) {
        const autre = gameState.players[c.a === moi ? c.b : c.a];
        const pourquoi = raison === 'attaque' ? (fautif === moi ? 'vous l\'avez attaqué' : 'il vous a attaqué')
                       : 'plus aucun astre à mettre en commerce';
        fenetreFinAlliance(autre, pourquoi);
    }
    addEvent('neutral', '✋', 'Fin du commerce entre ' + gameState.players[c.a].name + ' et ' + gameState.players[c.b].name, null, '#94A3B8');
}

/* Un tour de calcul : envois, voyages, arrivees, fins. */
function majCommerce(dt) {
    const t = gameState.time;
    const P = gameState.propositions || [];
    for (let i = P.length - 1; i >= 0; i--) if (t >= P[i].expire) P.splice(i, 1);
    for (const c of (gameState.commerces || []).slice()) {
        const A = astreNomme(c.srcA), B = astreNomme(c.srcB);
        if (!A || !B || A.owner !== c.a || B.owner !== c.b) {
            /* Un astre du commerce a change de camp : on en prend un autre. */
            const k = gameState.commerces.indexOf(c);
            gameState.commerces.splice(k, 1);
            const paire = _paireCommerce(c.a, c.b, c.niveau);
            gameState.commerces.splice(k, 0, c);
            if (!paire) { finCommerce(c, 'astre'); continue; }
            c.srcA = paire[0].name; c.srcB = paire[1].name;
            continue;
        }
        if (t >= c.prochain) {
            c.prochain += c.periode;
            /* Lente, mais jamais plus de 15 s de voyage, meme de loin. */
            const v = Math.max(COMMERCE_CFG.vitesseBoule, Math.hypot(A.x - B.x, A.y - B.y) / COMMERCE_CFG.voyageMax);
            gameState.orbesCommerce.push({ commerce: c.id, de: c.srcA, vers: c.srcB, pour: c.b, n: c.quantite, x: A.x, y: A.y, v: v });
            gameState.orbesCommerce.push({ commerce: c.id, de: c.srcB, vers: c.srcA, pour: c.a, n: c.quantite, x: B.x, y: B.y, v: v });
        }
    }
    const O = gameState.orbesCommerce || [];
    for (let i = O.length - 1; i >= 0; i--) {
        const o = O[i];
        const V = astreNomme(o.vers);
        if (!V || V.owner !== o.pour) { O.splice(i, 1); continue; }
        const dx = V.x - o.x, dy = V.y - o.y, d = Math.hypot(dx, dy);
        const pas = (o.v || COMMERCE_CFG.vitesseBoule) * dt;
        if (d <= V.radius + pas) {
            /* Le don passe meme au-dela du maximum : le trop-plein s'evaporera. */
            if (V.lutte) ajouterSpores(V, o.n);      /* assiege : dans ses zones */
            else V.spores = (V.spores || 0) + o.n;
            const g = o.n;
            O.splice(i, 1);
            /* Dessin : le gain qui saute, en couleur de commerce. */
            const z = gameState.camera.zoom || 1;
            gameState.conquestEffects.push({ x: V.x, y: V.y - V.radius - 10 / z, baseX: V.x, text: '+' + Math.round(g || o.n) + ' 🤝',
                                             color: '#FDE68A', age: 0, maxAge: 2, petit: true });
            continue;
        }
        o.x += dx / d * pas; o.y += dy / d * pas;
    }
}

/* Les boules : un petit noyau dore, un halo, et une courte traine. */
function drawCommerce(ctx) {
    const O = gameState.orbesCommerce;
    if (!O || !O.length) return;
    const z = gameState.camera.zoom, t = gameState.time;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const o of O) {
        if (!aLEcran(o.x, o.y, 60)) continue;
        const V = astreNomme(o.vers);
        const r = Math.max(4 / z, 7);
        const pul = 0.85 + 0.15 * Math.sin(t * 6 + o.x * 0.01);
        if (V) {
            const dx = V.x - o.x, dy = V.y - o.y, d = Math.hypot(dx, dy) || 1;
            for (let k = 1; k <= 4; k++) {
                ctx.globalAlpha = 0.3 / k;
                ctx.drawImage(tacheDouce('253,230,138'), o.x - dx / d * k * r * 1.4 - r, o.y - dy / d * k * r * 1.4 - r, r * 2, r * 2);
            }
        }
        ctx.globalAlpha = 0.9;
        ctx.drawImage(tacheDouce('253,210,120'), o.x - r * 3 * pul, o.y - r * 3 * pul, r * 6 * pul, r * 6 * pul);
        ctx.globalAlpha = 1;
        ctx.drawImage(tacheDouce('255,250,230'), o.x - r, o.y - r, r * 2, r * 2);
    }
    ctx.restore();
}

// ── Petites fenetres ──
function toastCommerce(txt, couleur) {
    document.querySelectorAll('.toastCommerce').forEach(function (x) { x.remove(); });
    const el = document.createElement('div');
    el.className = 'toastCommerce';
    el.style.cssText = 'position:fixed; top:130px; left:50%; transform:translateX(-50%); z-index:980; pointer-events:none;' +
        'background:rgba(8,12,30,0.92); border:1px solid ' + (couleur || '#C4B5FD') + '; border-radius:10px; padding:8px 16px;' +
        'font-family:"Exo 2",sans-serif; font-size:13px; color:#E0E7FF; max-width:calc(100vw - 32px); transition:opacity 0.6s;';
    el.textContent = txt;
    document.body.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; }, 3500);
    setTimeout(function () { el.remove(); }, 4200);
}

/* « Alliance arrêtée avec X » : une vraie fenetre, a fermer. */
function fenetreFinAlliance(autre, pourquoi) {
    const el = document.createElement('div');
    el.className = 'fenetreCommerce';
    el.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:990;' +
        'background:rgba(10,12,32,0.96); border:1px solid rgba(248,113,113,0.6); border-radius:12px; padding:16px 22px; text-align:center;' +
        'font-family:"Exo 2",sans-serif; color:#E0E7FF; box-shadow:0 0 30px rgba(248,113,113,0.2); max-width:calc(100vw - 32px);';
    el.innerHTML = '<div style="font-family:Orbitron,sans-serif; font-size:13px; letter-spacing:2px; color:#FCA5A5; margin-bottom:6px;">ALLIANCE ARRÊTÉE</div>' +
        '<div style="font-size:14px;">Alliance arrêtée avec <b style="color:' + (autre.color || '#fff') + ';">' + esc(autre.name) + '</b></div>' +
        '<div style="font-size:12px; color:#94A3B8; margin:4px 0 12px;">' + pourquoi + '</div>' +
        '<button style="background:rgba(248,113,113,0.15); border:1px solid rgba(248,113,113,0.5); border-radius:6px; padding:5px 16px; color:#FCA5A5; cursor:pointer;">OK</button>';
    el.querySelector('button').addEventListener('click', function () { el.remove(); });
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 8000);
}

/* Un autre joueur humain nous propose un commerce (reseau). */
function fenetreProposition(de, niveau) {
    const j = gameState.players[de];
    const el = document.createElement('div');
    el.className = 'fenetreCommerce';
    el.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:990;' +
        'background:rgba(10,12,32,0.96); border:1px solid rgba(253,224,138,0.6); border-radius:12px; padding:16px 22px; text-align:center;' +
        'font-family:"Exo 2",sans-serif; color:#E0E7FF; max-width:calc(100vw - 32px);';
    el.innerHTML = '<div style="font-family:Orbitron,sans-serif; font-size:13px; letter-spacing:2px; color:#FDE68A; margin-bottom:6px;">PROPOSITION DE COMMERCE</div>' +
        '<div style="font-size:14px; margin-bottom:12px;"><b style="color:' + j.color + ';">' + esc(j.name) + '</b> propose : ' + COMMERCE_CFG.niveaux[niveau].nom.toLowerCase() + '</div>' +
        '<button data-ok="1" style="background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.5); border-radius:6px; padding:5px 16px; color:#86EFAC; cursor:pointer; margin-right:8px;">Accepter</button>' +
        '<button data-ok="0" style="background:none; border:1px solid rgba(148,163,184,0.4); border-radius:6px; padding:5px 16px; color:#94A3B8; cursor:pointer;">Refuser</button>';
    el.querySelectorAll('button').forEach(function (bt) {
        bt.addEventListener('click', function () {
            donnerOrdre('commerce_reponse', { de: de, niveau: niveau, ok: bt.dataset.ok === '1' ? 1 : 0 });
            el.remove();
        });
    });
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 30000);
}

/* CLIC DROIT SUR UN JOUEUR : Info, ou Commerce (les trois niveaux, grises
   quand ils ne sont pas possibles, avec la raison au survol). */
function menuJoueur(slot, x, y) {
    fermerMenuJoueur();
    const moi = localSlot();
    const j = gameState.players[slot];
    if (!j) return;
    const el = document.createElement('div');
    el.id = 'menuJoueur';
    el.style.cssText = 'position:fixed; z-index:985; min-width:230px; background:rgba(10,12,32,0.97); border:1px solid rgba(168,85,247,0.45);' +
        'border-radius:10px; padding:6px; font-family:"Exo 2",sans-serif; font-size:13px; color:#E0E7FF; box-shadow:0 8px 24px rgba(0,0,0,0.4);';
    const ligne = function (txt, action, grise, info) {
        return '<div class="mj-ligne" data-action="' + action + '" title="' + (info || '') + '" style="padding:6px 10px; border-radius:6px; cursor:' + (grise ? 'not-allowed' : 'pointer') +
               '; color:' + (grise ? '#64748B' : '#E0E7FF') + ';">' + txt + (grise && info ? '<div style="font-size:10.5px; color:#64748B;">' + info + '</div>' : '') + '</div>';
    };
    let html = '<div style="padding:4px 10px 6px; font-family:Orbitron,sans-serif; font-size:11px; letter-spacing:1px; color:' + j.color + ';">' + esc(j.name) + '</div>';
    html += ligne('ℹ️ Info', 'info', false, '');
    if (slot !== moi && (!gameState.isMulti || gameState.lockstep)) {
        html += '<div style="padding:6px 10px 2px; font-size:10px; letter-spacing:2px; color:#A78BFA; font-family:Orbitron,sans-serif;">COMMERCE</div>';
        for (const n of [1, 2, 3]) {
            const N = COMMERCE_CFG.niveaux[n];
            const r = raisonPasCommerce(moi, slot, n);
            html += ligne('🤝 ' + N.nom + ' <span style="color:#94A3B8; font-size:11px;">' + N.quantite + ' sp / ' + N.periode + ' s</span>', 'c' + n, !!r, r);
        }
    }
    el.innerHTML = html;
    document.body.appendChild(el);
    const W = window.innerWidth, H = window.innerHeight, r = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(x - r.width - 8, W - r.width - 8)) + 'px';
    el.style.top = Math.max(8, Math.min(y, H - r.height - 8)) + 'px';
    el.querySelectorAll('.mj-ligne').forEach(function (l) {
        l.addEventListener('mouseenter', function () { if (l.style.cursor === 'pointer') l.style.background = 'rgba(139,92,246,0.18)'; });
        l.addEventListener('mouseleave', function () { l.style.background = ''; });
        l.addEventListener('click', function () {
            if (l.style.cursor !== 'pointer') return;
            const a = l.dataset.action;
            fermerMenuJoueur();
            if (typeof playClickSound === 'function') playClickSound();
            if (a === 'info') fenetreInfoJoueur(slot);
            else donnerOrdre('commerce', { cible: slot, niveau: +a.slice(1) });
        });
    });
}
function fermerMenuJoueur() {
    const el = document.getElementById('menuJoueur');
    if (el) el.remove();
}

/* INFO : astres, batiments, spores et production du joueur, mises a jour
   tant que la fenetre est ouverte. */
function fenetreInfoJoueur(slot) {
    let el = document.getElementById('infoJoueur');
    if (el) { clearInterval(el._maj); el.remove(); }
    el = document.createElement('div');
    el.id = 'infoJoueur';
    el.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:985; width:min(330px, calc(100vw - 32px));' +
        'background:rgba(10,12,32,0.96); border:1px solid rgba(168,85,247,0.5); border-radius:12px; padding:14px 18px;' +
        'font-family:"Exo 2",sans-serif; color:#E0E7FF; box-shadow:0 0 30px rgba(168,85,247,0.2);';
    const remplir = function () {
        const j = gameState.players[slot];
        if (!j) return;
        const B = j.bodies || [];
        const nPl = B.filter(function (b) { return b.type === 'planet'; }).length;
        const nLu = B.length - nPl;
        let alv = 0, nid = 0, bio = 0, sp = 0, prod = 0;
        for (const b of B) {
            alv += b.alveoles || 0; nid += b.nids || 0; bio += b.biomes || 0;
            sp += b.spores || 0; prod += debitAstre(b);
        }
        const coms = (gameState.commerces || []).filter(function (c) { return c.a === slot || c.b === slot; });
        const ligne = function (k, v) {
            return '<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid rgba(148,163,184,0.12); font-size:13px;"><span style="color:#94A3B8;">' + k + '</span><span style="font-family:Orbitron,sans-serif; font-size:12px;">' + v + '</span></div>';
        };
        el.innerHTML =
            '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">' +
            '<span style="font-family:Orbitron,sans-serif; font-size:14px; letter-spacing:1px; color:' + j.color + ';">' + esc(j.name) + '</span>' +
            '<button id="infoJoueurFermer" style="background:none; border:none; color:#94A3B8; font-size:16px; cursor:pointer;">✕</button></div>' +
            (j.alive ? '' : '<div style="color:#FCA5A5; font-size:12px; margin-bottom:6px;">Éliminé</div>') +
            ligne('Planètes', nPl) + ligne('Lunes', nLu) +
            ligne('Bâtiments', (alv + nid + bio) + ' <span style="color:#94A3B8; font-size:10px;">(' + alv + ' alv. · ' + nid + ' nids · ' + bio + ' biomes)</span>') +
            ligne('Spores', Math.round(sp).toLocaleString('fr-FR')) +
            ligne('Production', '+' + (Math.round(prod * 10) / 10).toLocaleString('fr-FR') + ' /s') +
            ligne('Commerces en cours', coms.length ? coms.map(function (c) {
                const autre = gameState.players[c.a === slot ? c.b : c.a];
                return '<span style="color:' + autre.color + ';">' + esc(autre.name) + '</span> (depuis ' + Math.floor((gameState.time - c.debut) / 60) + ' min)';
            }).join('<br>') : 'aucun');
        el.querySelector('#infoJoueurFermer').addEventListener('click', function () { clearInterval(el._maj); el.remove(); });
    };
    remplir();
    document.body.appendChild(el);
    el._maj = setInterval(function () { if (!el.parentNode || gameState.phase === 'title') { clearInterval(el._maj); if (el.parentNode) el.remove(); return; } remplir(); }, 500);
}

document.addEventListener('mousedown', function (e) {
    const m = document.getElementById('menuJoueur');
    if (m && !m.contains(e.target)) fermerMenuJoueur();
});
/* Clic droit sur une ligne de la liste des joueurs. */
document.addEventListener('contextmenu', function (e) {
    const row = e.target.closest && e.target.closest('#scoreBoard .score-row');
    if (!row || gameState.phase !== 'game') return;
    menuJoueur(+row.dataset.slot, e.clientX, e.clientY);
});

