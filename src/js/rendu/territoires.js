// ─────────────────────────────────────────────
// LABELS PROPRIÉTAIRES (clustering)
// ─────────────────────────────────────────────
/* ─────────────────────────────────────────────
   TERRITOIRES
   Une planete dont toutes les lunes appartiennent au meme joueur forme un
   TERRITOIRE PLANETAIRE. Un soleil dont toutes les planetes et toutes les
   lunes appartiennent au meme joueur forme un TERRITOIRE SOLAIRE, qui
   remplace alors les territoires planetaires qu'il contient.

   Une planete sans lune ne forme pas de territoire : il n'y aurait qu'un
   seul astre a entourer, la frontiere ferait double emploi avec l'anneau
   de propriete deja dessine autour de chaque astre.

   La liste n'est recalculee qu'a la conquete. Les astres bougent en
   permanence, mais leur proprietaire ne change presque jamais : recalculer
   a chaque image serait du travail perdu.
   ───────────────────────────────────────────── */
let _territoires = [];
let _territoiresSales = true;
/* Les ancres qui portaient un groupement au dernier calcul, et ce qu'elles
   portaient : c'est ce qui permet de reperer ceux qui viennent de naitre.
   Tant que ce tableau est nul, on est au tout premier calcul de la partie et
   on se contente de retenir - sinon la carte entiere sonnerait au demarrage. */
let _ancresGroupe = null;

function marquerTerritoiresSales() { _territoiresSales = true; }

function recalculerTerritoires() {
    _territoiresSales = false;
    const liste = [];
    for (const soleil of gameState.suns) {
        const planetes = soleil.planets || [];
        if (!planetes.length) continue;

        const proprioSolaire = planetes[0].owner;
        let solaireEntier = (proprioSolaire !== null && proprioSolaire !== undefined);
        const planetaires = [];

        for (const pl of planetes) {
            const lunes = pl.moons || [];
            const proprio = pl.owner;
            /* Un astre envahi a moins de moitie compte toujours comme tenu :
               une tete de pont ne casse pas un groupement a elle seule. */
            const tenu = tenuPar(pl, proprio) &&
                         lunes.every(function (m) { return tenuPar(m, proprio); });
            if (tenu && lunes.length > 0) {
                planetaires.push({ type: 'planetaire', owner: proprio, ancre: pl,
                                   corps: [pl].concat(lunes) });
            }
            if (!tenu || proprio !== proprioSolaire) solaireEntier = false;
        }

        if (solaireEntier) {
            const corps = [];
            for (const pl of planetes) {
                corps.push(pl);
                const lunes = pl.moons || [];
                for (let i = 0; i < lunes.length; i++) corps.push(lunes[i]);
            }
            liste.push({ type: 'solaire', owner: proprioSolaire, ancre: soleil,
                         soleil: soleil, corps: corps });
        } else {
            for (let i = 0; i < planetaires.length; i++) liste.push(planetaires[i]);
        }
    }
    _territoires = liste;

    /* Un groupement qui se referme merite une alerte, chez n'importe quel
       joueur : c'est un bloc qui vient de durcir sur la carte. On compare par
       identite d'astre - les noms peuvent se repeter, les objets non. */
    const amorce = (_ancresGroupe !== null);
    const vues = [];
    for (let i = 0; i < liste.length; i++) {
        const t = liste[i];
        const ancre = t.ancre;
        if (!ancre) continue;
        vues.push(ancre);
        const marque = t.type + ':' + t.owner;
        if (ancre._groupe === marque) continue;
        ancre._groupe = marque;
        if (amorce) {
            const j = gameState.players && gameState.players[t.owner];
            ajouterAlerte('groupe', ancre, (j && j.color) || null);
        }
    }
    if (_ancresGroupe) {
        for (let i = 0; i < _ancresGroupe.length; i++) {
            const a = _ancresGroupe[i];
            if (vues.indexOf(a) < 0) a._groupe = null;
        }
    }
    _ancresGroupe = vues;
}

function territoires() {
    if (_territoiresSales) recalculerTerritoires();
    return _territoires;
}

/* Le territoire auquel appartient un astre, ou null. */

/* ─────────────────────────────────────────────
   FRONTIERES
   Le contour est l'union de cercles, un par astre, gonfles d'une marge.
   Comme les lunes tournent autour de leur planete, la forme se deforme
   toute seule au fil des orbites.

   Pour n'obtenir que le contour EXTERIEUR sans passer par un canvas
   intermediaire : chaque cercle est trace en decoupant d'abord tout ce qui
   tombe a l'interieur des autres cercles du meme territoire. Le decoupage
   se fait avec un rectangle englobant perce des autres cercles, regle
   evenodd - le trace ne sort donc que la ou il est vraiment au bord.
   ───────────────────────────────────────────── */
const MARGE_FRONTIERE = 26;

/* Au niveau solaire les astres sont tres espaces : avec une marge fixe,
   l'enveloppe n'est plus faite que de longues tangentes et prend une allure
   de polygone. La marge y suit donc la taille du systeme, pour que les arcs
   reprennent le dessus et que la forme reste ronde. */
function marge(t) {
    if (t.type !== 'solaire' || !t.soleil) return MARGE_FRONTIERE;
    if (t._marge === undefined || t._margeT !== gameState.time) {
        let rMax = 0;
        for (let i = 0; i < t.corps.length; i++) {
            const b = t.corps[i];
            const dx = b.x - t.soleil.x, dy = b.y - t.soleil.y;
            const d = Math.sqrt(dx * dx + dy * dy) + b.radius;
            if (d > rMax) rMax = d;
        }
        t._marge = Math.max(MARGE_FRONTIERE * 2.2, rMax * 0.09);
        t._margeT = gameState.time;
    }
    return t._marge;
}

/* Les disques du territoire : un par astre, plus l'etoile quand tout le
   systeme solaire est tenu - elle fait alors partie du territoire. Il n'y a
   plus de disques de liaison : c'est l'enveloppe qui enjambe les ecarts. */
function _formesTerritoire(t) {
    const m = marge(t);
    const formes = [];
    const corps = t.corps;
    for (let i = 0; i < corps.length; i++) {
        const b = corps[i];
        formes.push({ x: b.x, y: b.y, r: b.radius + m });
    }
    if (t.type === 'solaire' && t.soleil) {
        formes.push({ x: t.soleil.x, y: t.soleil.y, r: t.soleil.radius + m });
    }
    return formes;
}

/* L'ENVELOPPE TENDUE autour des disques : comme un elastique pose autour du
   groupe. Elle epouse chaque astre par un arc et enjambe les ecarts par une
   tangente, donc aucun creux entre deux astres et aucune ligne a l'interieur.

   Methode : on echantillonne chaque disque, on prend l'enveloppe convexe du
   nuage (parcours monotone d'Andrew), puis on redessine - deux points de
   suite sur le meme disque redeviennent un vrai arc, un changement de disque
   devient le segment tangent. Le nombre de points suit le rayon a l'ecran :
   une petite lune n'a pas besoin d'autant de points qu'une geante. */
const _nuage = [];
function _enveloppe(formes, zoom) {
    _nuage.length = 0;
    for (let i = 0; i < formes.length; i++) {
        const f = formes[i];
        let n = Math.ceil(f.r * zoom * 0.5);
        if (n < 10) n = 10; else if (n > 48) n = 48;
        for (let k = 0; k < n; k++) {
            const a = k / n * Math.PI * 2;
            _nuage.push({ x: f.x + Math.cos(a) * f.r, y: f.y + Math.sin(a) * f.r, i: i, a: a });
        }
    }
    _nuage.sort(function (u, v) { return u.x === v.x ? u.y - v.y : u.x - v.x; });
    const croix = function (o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    };
    const bas = [], haut = [];
    for (let k = 0; k < _nuage.length; k++) {
        const pt = _nuage[k];
        while (bas.length >= 2 && croix(bas[bas.length - 2], bas[bas.length - 1], pt) <= 0) bas.pop();
        bas.push(pt);
    }
    for (let k = _nuage.length - 1; k >= 0; k--) {
        const pt = _nuage[k];
        while (haut.length >= 2 && croix(haut[haut.length - 2], haut[haut.length - 1], pt) <= 0) haut.pop();
        haut.push(pt);
    }
    bas.pop(); haut.pop();
    return bas.concat(haut);
}

/* L'enveloppe convexe est exacte mais elle se lit comme un polygone : sommets
   nets et tangentes toutes droites. On la repasse donc en courbe fermee, par
   quadratiques passant par les MILIEUX des cotes, chaque sommet servant de
   point de controle. C'est du rognage de coin a la Chaikin : le trait reste
   toujours a l'interieur de l'enveloppe, il ne peut donc ni se recouper ni
   former d'encoche - ce que faisait une interpolation de Catmull-Rom, qui
   depasse aux virages serres. Les sommets s'arrondissent, les longues
   tangentes restent tendues, et la forme respire.

   Les points sont d'abord eclaircis : l'enveloppe en compte beaucoup, serres
   le long des arcs, et une courbe qui passerait par tous ne ferait que
   redessiner le polygone. */
const _lisse = [];
function _eclaircir(env, sortie) {
    sortie.length = 0;
    const n = env.length;
    if (n < 4) { for (let k = 0; k < n; k++) sortie.push(env[k]); return; }
    let tour = 0;
    for (let k = 0; k < n; k++) {
        const a = env[k], b = env[(k + 1) % n];
        tour += Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    }
    const pas = tour / 56;
    sortie.push(env[0]);
    for (let k = 1; k < n; k++) {
        const a = sortie[sortie.length - 1], b = env[k];
        const d = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
        if (d >= pas) sortie.push(b);
    }
    if (sortie.length > 4) {
        const a = sortie[sortie.length - 1], b = sortie[0];
        const d = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
        if (d < pas * 0.5) sortie.pop();
    }
}

function _tracerEnveloppe(ctx, formes, env) {
    _eclaircir(env, _lisse);
    const n = _lisse.length;
    if (n < 3) return;
    ctx.beginPath();
    let a = _lisse[n - 1], b = _lisse[0];
    ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
    for (let k = 0; k < n; k++) {
        const p = _lisse[k], q = _lisse[(k + 1) % n];
        ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
    }
    ctx.closePath();
}

/* Deux enveloppes convexes se chevauchent-elles ? Theoreme de l'axe
   separateur : si l'on trouve une seule direction, prise parmi les normales
   des aretes, ou les deux nuages ne se recouvrent pas, ils sont disjoints ;
   sinon ils se touchent. Les enveloppes sont echantillonnees - on cherche un
   chevauchement visible, pas une precision au pixel - et la sortie est
   immediate des qu'un axe separe, ce qui est le cas courant. */
function _axeSepare(A, B, pasA) {
    for (let i = 0; i < A.length; i += pasA) {
        const a = A[i], b = A[(i + pasA) % A.length];
        const nx = -(b.y - a.y), ny = (b.x - a.x);
        let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
        for (let k = 0; k < A.length; k++) {
            const d = A[k].x * nx + A[k].y * ny;
            if (d < a0) a0 = d; if (d > a1) a1 = d;
        }
        for (let k = 0; k < B.length; k++) {
            const d = B[k].x * nx + B[k].y * ny;
            if (d < b0) b0 = d; if (d > b1) b1 = d;
        }
        if (a1 < b0 || b1 < a0) return true;
    }
    return false;
}
function _enveloppesSeCroisent(A, B) {
    if (A.length < 3 || B.length < 3) return false;
    const pasA = Math.max(1, Math.floor(A.length / 16));
    const pasB = Math.max(1, Math.floor(B.length / 16));
    return !_axeSepare(A, B, pasA) && !_axeSepare(B, A, pasB);
}

/* Les territoires visibles du tour, avec de quoi les reunir. La fusion se
   decide ici et non au calcul des territoires : les astres orbitent, deux
   frontieres se croisent puis se separent sans qu'aucune conquete n'ait eu
   lieu. C'est donc une affaire d'image, pas de possession. */
const _bordsVus = [];

function drawTerritoryBorders(ctx) {
    const ts = territoires();
    if (!ts.length) return;
    const cam = gameState.camera;
    const halfW = gameState.width / 2 / cam.zoom;
    const halfH = gameState.height / 2 / cam.zoom;

    _bordsVus.length = 0;
    for (let ti = 0; ti < ts.length; ti++) {
        const t = ts[ti];
        const joueur = gameState.players[t.owner];
        if (!joueur) continue;
        const formes = _formesTerritoire(t);

        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (let i = 0; i < formes.length; i++) {
            const f = formes[i];
            if (f.x - f.r < x0) x0 = f.x - f.r;
            if (f.y - f.r < y0) y0 = f.y - f.r;
            if (f.x + f.r > x1) x1 = f.x + f.r;
            if (f.y + f.r > y1) y1 = f.y + f.r;
        }
        if (x1 < cam.x - halfW || x0 > cam.x + halfW ||
            y1 < cam.y - halfH || y0 > cam.y + halfH) continue;

        _bordsVus.push({ t: t, joueur: joueur, formes: formes,
                         x0: x0, y0: y0, x1: x1, y1: y1,
                         env: _enveloppe(formes, cam.zoom),
                         lien: -1, chef: 0, reunies: null, solaire: t.type === 'solaire' });
    }

    const n = _bordsVus.length;
    if (!n) return;

    /* Deux frontieres d'un meme joueur qui se croisent n'en font plus qu'une :
       se chevaucher donnait un double trait au milieu de son propre empire.
       On les relie par proche-en-proche - si A rejoint B et B rejoint C, les
       trois ne forment qu'un seul contour. */
    const racine = function (i) { while (_bordsVus[i].lien >= 0) i = _bordsVus[i].lien; return i; };
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const a = _bordsVus[i], b = _bordsVus[j];
            if (a.t.owner !== b.t.owner) continue;
            if (a.x1 < b.x0 || b.x1 < a.x0 || a.y1 < b.y0 || b.y1 < a.y0) continue;
            const ra = racine(i), rb = racine(j);
            if (ra === rb) continue;
            if (!_enveloppesSeCroisent(a.env, b.env)) continue;
            _bordsVus[rb].lien = ra;
        }
    }
    for (let i = 0; i < n; i++) _bordsVus[i].chef = racine(i);
    for (let i = 0; i < n; i++) {
        const b = _bordsVus[i];
        if (b.chef === i) continue;
        const c = _bordsVus[b.chef];
        if (!c.reunies) c.reunies = c.formes.slice();
        for (let k = 0; k < b.formes.length; k++) c.reunies.push(b.formes[k]);
        if (b.solaire) c.solaire = true;
    }

    for (let i = 0; i < n; i++) {
        const b = _bordsVus[i];
        if (b.chef !== i) continue;
        const joueur = b.joueur;
        const formes = b.reunies || b.formes;
        const env = b.reunies ? _enveloppe(formes, cam.zoom) : b.env;
        const couleur = (gameState.config && gameState.config.teamCount >= 2 && joueur.teamColor)
                      ? joueur.teamColor : (joueur.color || '#FFFFFF');
        const rgb = _rgbDe(couleur);

        _tracerEnveloppe(ctx, formes, env);
        ctx.fillStyle = 'rgba(' + rgb + ',' + (b.solaire ? 0.07 : 0.06) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (b.solaire ? 0.85 : 0.65) + ')';
        ctx.lineWidth = Math.max(1.5, (b.solaire ? 2.5 : 2) / cam.zoom);
        ctx.stroke();
    }
}

/* '#a1b2c3' ou 'rgb(...)' vers '161,178,195' */
const _rgbCache = {};
function _rgbDe(c) {
    if (_rgbCache[c]) return _rgbCache[c];
    let out = '255,255,255';
    if (c.charAt(0) === '#') {
        let h = c.slice(1);
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        if (h.length >= 6) {
            out = parseInt(h.slice(0, 2), 16) + ',' +
                  parseInt(h.slice(2, 4), 16) + ',' +
                  parseInt(h.slice(4, 6), 16);
        }
    } else {
        const m = c.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) out = m[1] + ',' + m[2] + ',' + m[3];
    }
    _rgbCache[c] = out;
    return out;
}

let _ownerClustersCache = [];
function _updateOwnerClusters() {
    if (gameState.phase !== 'game' && gameState.phase !== 'spawn') return;
    const cam = gameState.camera;
    const THRESH = 70 / cam.zoom;
    const owned = [];
    for (const p of gameState.planets) {
        if (p.owner == null || p.owner < 0) continue;
        owned.push({ sx: p.x, sy: p.y, owner: p.owner, radius: p.radius });
        for (const m of p.moons) {
            if (m.owner == null || m.owner < 0) continue;
            owned.push({ sx: m.x, sy: m.y, owner: m.owner, radius: m.radius });
        }
    }
    const used = new Uint8Array(owned.length);
    const clusters = [];
    for (let i = 0; i < owned.length; i++) {
        if (used[i]) continue;
        const cl = { owner: owned[i].owner, sx: owned[i].sx, sy: owned[i].sy, r: owned[i].radius, count: 1 };
        for (let j = i+1; j < owned.length; j++) {
            if (used[j] || owned[j].owner !== owned[i].owner) continue;
            const dx = owned[j].sx - owned[i].sx, dy = owned[j].sy - owned[i].sy;
            if (dx*dx + dy*dy < THRESH*THRESH) {
                cl.sx += owned[j].sx; cl.sy += owned[j].sy; cl.r += owned[j].radius;
                cl.count++; used[j] = 1;
            }
        }
        used[i] = 1;
        cl.sx /= cl.count; cl.sy /= cl.count; cl.r /= cl.count;
        clusters.push(cl);
    }
    _ownerClustersCache = clusters;
}
function _drawOwnerClustersCache(ctx) {
    if (!_ownerClustersCache.length) return;
    const cam = gameState.camera;
    ctx.textAlign = 'center';
    for (const cl of _ownerClustersCache) {
        const player = gameState.players[cl.owner];
        if (!player) continue;
        const pseudo = player.name || ('J'+cl.owner);
        const label = cl.count > 1 ? pseudo+' ×'+cl.count : pseudo;
        const cy = cl.sy - cl.r - 6/cam.zoom;
        const fs = Math.max(9/cam.zoom, Math.min(16/cam.zoom, cl.r*0.45));
        ctx.font = 'bold '+fs+'px Orbitron';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(8,6,30,0.72)';
        ctx.beginPath();
        ctx.roundRect(cl.sx-tw/2-4, cy-fs, tw+8, fs*1.4, 3);
        ctx.fill();
        ctx.fillStyle = (gameState.config?.teamCount >= 2 && player.teamColor) ? player.teamColor : (player.color || '#FFF');
        ctx.fillText(label, cl.sx, cy);
    }
}

