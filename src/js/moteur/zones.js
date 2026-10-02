/* ─────────────────────────────────────────────
   LES ZONES
   Une tache de couleur sur une planete n'est plus un simple morceau de camp :
   c'est une ZONE, avec ses spores a elle et son propre rendement. Deux taches
   du meme joueur sur le meme astre vivent donc leur vie chacune de leur cote,
   se remplissent separement, et ne mettent leurs spores en commun que si le
   terrain finit par les souder.

   L'identite d'une zone tient dans L.zid, qui donne pour chaque case le
   numero de sa zone. A chaque tour on refait les composantes connexes : une
   composante reprend le numero le plus represente parmi ses cases, ce qui la
   fait survivre aux gains et aux pertes de terrain. Deux zones soudees
   mettent leurs spores ensemble ; une zone coupee en deux les partage au
   prorata des cases. Perdre du sol, c'est donc perdre les spores qui etaient
   dessus - elles sont sur le terrain, pas dans un coffre.
   ───────────────────────────────────────────── */
const ZONE_MIN = 10;           /* en dessous, une zone ne peut plus attaquer et s'effrite */
const ZONE_FONTE = 0.5;        /* secondes entre deux cases perdues par fonte */
const _zoneMarque = new Int16Array(LUTTE_N * LUTTE_N);
const _zonePile = [];

function _zidNeuf(zones) {
    for (let id = 1; id < 255; id++) if (!zones[id]) return id;
    return 0;
}

function zonesRecalculer(body, L) {
    const nb = L.cellules.length, cel = L.cellules;
    /* RIEN N'A BOUGE depuis le dernier recalcul (memes cases, memes zones) :
       le recalcul retomberait exactement sur les memes zones, les memes
       numeros et les memes spores (chaque zone se reverse a 100 % dans
       elle-meme). On s'en passe : la plupart des batailles dorment, et ce
       recalcul faisait a lui seul le tiers du calcul de la partie. */
    const snap = L._snap;
    if (snap && L._snapZones === L.zones && L.zid) {
        let pareil = true;
        for (let i = 0; i < nb; i++) if (snap[i] !== cel[i]) { pareil = false; break; }
        if (pareil) return;
    }
    if (!L.zid) L.zid = new Uint8Array(nb);
    if (!L.zones) L.zones = {};
    const zid = L.zid, anciennes = L.zones;
    _zoneMarque.fill(0);

    /* Composantes connexes, huit voisins : deux taches qui se touchent par un
       coin sont bien la meme. */
    const compos = [];
    for (let i = 0; i < nb; i++) {
        if (cel[i] === LUTTE_VIDE || _zoneMarque[i]) continue;
        const v = cel[i];
        const comp = { v: v, cases: [], anciens: {} };
        compos.push(comp);
        const m = compos.length;
        _zonePile.length = 0; _zonePile.push(i); _zoneMarque[i] = m;
        while (_zonePile.length) {
            const j = _zonePile.pop();
            comp.cases.push(j);
            const a = zid[j];
            if (a) comp.anciens[a] = (comp.anciens[a] || 0) + 1;
            for (let k = 0; k < 8; k++) {
                const w = _lutteVoisins8[j * 8 + k];
                if (w >= 0 && !_zoneMarque[w] && cel[w] === v) { _zoneMarque[w] = m; _zonePile.push(w); }
            }
        }
    }

    /* Les plus grosses composantes choisissent leur numero les premieres :
       c'est le gros morceau qui garde l'identite quand une zone se coupe. */
    compos.sort(function (a, b) { return b.cases.length - a.cases.length; });

    const neuves = {};
    for (let c = 0; c < compos.length; c++) {
        const comp = compos[c];
        let id = 0, best = 0;
        for (const a in comp.anciens) {
            if (neuves[a]) continue;
            if (comp.anciens[a] > best) { best = comp.anciens[a]; id = +a; }
        }
        if (!id) id = _zidNeuf(neuves);
        if (!id) continue;
        /* Les spores suivent le sol : chaque ancienne zone verse au prorata
           des cases qu'elle apporte ici. */
        let sp = 0, el = 0;
        for (const a in comp.anciens) {
            const z = anciennes[a];
            /* Seulement les zones du meme camp : des cases peintes par un
               debarquement (ou fondues vers un voisin) gardaient l'ancienne
               zone ennemie, et le prorata versait ses spores au nouveau
               venu. Le terrain pris a l'ennemi ne rapporte pas ses spores. */
            if (!z || z.v !== comp.v) continue;
            /* Le prorata se prend sur les cases que la zone avait AU DEBUT
               du tour : la poussee a deja bouge les compteurs, s'en servir
               ferait payer deux fois le terrain perdu. */
            const part = Math.min(1, comp.anciens[a] / Math.max(1, z.nRef || z.n));

            sp += z.spores * part;
            el += (z.elan || 0) * part;
        }
        const z0 = anciennes[id];
        /* nRef fige le compte de CE recalcul : c'est sur lui que se fera le
           prorata au suivant, quoi que la poussee change entre-temps. Sans
           lui, le terrain perdu etait facture deux fois et un defenseur se
           retrouvait a sec en tenant encore les deux tiers de sa planete. */
        neuves[id] = { v: comp.v, n: comp.cases.length, nRef: comp.cases.length,
                       spores: sp, elan: el,
                       cx: 0, cy: 0, debit: z0 ? z0.debit : 0,
                       rendement: z0 ? z0.rendement : 0, fonte: z0 ? z0.fonte : 0 };
        let sx = 0, sy = 0;
        for (let k = 0; k < comp.cases.length; k++) {
            const j = comp.cases[k];
            zid[j] = id;
            sx += j % LUTTE_N; sy += (j / LUTTE_N) | 0;
        }
        neuves[id].cx = sx / comp.cases.length;
        neuves[id].cy = sy / comp.cases.length;
    }
    L.zones = neuves;
    /* La photo des cases, pour savoir au prochain appel si quelque chose a bouge. */
    if (!L._snap || L._snap.length !== nb) L._snap = new Uint8Array(nb);
    L._snap.set(cel);
    L._snapZones = neuves;
}

/* Les totaux par camp, refaits depuis les zones : tout le reste du jeu lit
   body.spores et L.assaut, qui ne sont plus que des sommes. */
function zonesAgreger(body, L) {
    let def = 0;
    const att = {};
    for (const id in L.zones) {
        const z = L.zones[id];
        if (z.v === 0) def += z.spores;
        else att[z.v - 1] = (att[z.v - 1] || 0) + z.spores;
    }
    if (body.owner !== null && body.owner !== undefined) body.spores = def;
    L.assaut = att;
}

/* Les zones d'un joueur sur un astre, de la plus grande a la plus petite. */
function zonesDe(body, slot) {
    const L = body.lutte;
    if (!L || !L.zones) return [];
    const v = campDe(body, slot);
    const out = [];
    for (const id in L.zones) if (L.zones[id].v === v) out.push({ id: +id, z: L.zones[id] });
    out.sort(function (a, b) { return b.z.n - a.z.n; });
    return out;
}

/* La zone sous un point du monde. */
function zoneA(body, wx, wy) {
    const L = body.lutte;
    if (!L || !L.zones) return 0;
    if (gameState.isMulti) {
        /* En multijoueur la grille locale n'est qu'une silhouette et ses
           numeros ne sont pas ceux du serveur : on prend la zone dont le
           centre est le plus proche du point clique. */
        let best = 0, bd = Infinity;
        for (const id in L.zones) {
            const c = zoneCentre(body, L.zones[id]);
            const d = (c.x - wx) * (c.x - wx) + (c.y - wy) * (c.y - wy);
            if (d < bd) { bd = d; best = +id; }
        }
        return best;
    }
    if (!L.zid) return 0;
    const i = _celluleA(body, wx, wy);
    if (i < 0) return 0;
    return L.zid[i] || 0;
}

/* Le centre d'une zone, en coordonnees du monde. */
function zoneCentre(body, z) {
    const r = body.radius, pas = (2 * r) / LUTTE_N;
    return { x: body.x - r + (z.cx + 0.5) * pas, y: body.y - r + (z.cy + 0.5) * pas };
}

/* LA ZONE CHOISIE PAR UN JOUEUR ({ body, id } ou null). En solo, chacun a la
   sienne, posee par l'ordre 'zone' : le calcul ne lit plus la selection de
   l'ecran, que l'ordinateur d'en face n'a pas. En multijoueur actuel, la
   selection reste celle de l'ecran : le serveur recoit le point vise. */
function zoneChoisie(slot) {
    if (gameState.isMulti) return slot === localSlot() ? gameState._zoneSel : null;
    const j = gameState.players[slot];
    return j ? j.zoneSel || null : null;
}

/* Le clic designe une zone : ordre en solo, selection locale en multi. */
function choisirZone(body, id) {
    if (gameState.isMulti) { gameState._zoneSel = { body: body, id: id }; return; }
    donnerOrdre('zone', { astre: body.name, id: id });
}

/* La zone d'ou l'on tire : celle qu'on a choisie si elle tient toujours, sinon
   la plus grande qu'on ait sur cet astre. */
function zoneDeTir(body, slot) {
    const L = body.lutte;
    if (!L || !L.zones) return null;
    const sel = zoneChoisie(slot);
    if (sel && sel.body === body) {
        const z = L.zones[sel.id];
        if (z && z.v === campDe(body, slot)) return { id: sel.id, z: z };
    }
    /* A defaut de choix, c'est la zone la mieux pourvue qui tire parmi celles
       qui en ont le droit - la plus GRANDE n'est pas forcement celle qui a des
       troupes, et proposer une zone vide n'aurait servi a rien. */
    const liste = zonesDe(body, slot);
    if (!liste.length) return null;
    let best = null;
    for (let i = 0; i < liste.length; i++) {
        if (liste[i].z.n < ZONE_MIN) continue;
        if (!best || liste[i].z.spores > best.z.spores) best = liste[i];
    }
    return best || liste[0];
}

/* Les cases qu'une zone peut prendre : celles d'un AUTRE camp qui touchent
   les siennes. Le choix se fait ensuite au poids, pas dans l'ordre de la
   grille - sinon le front avancerait par lignes bien droites. */
function _frontDe(L, id, v, sortie) {
    sortie.length = 0;
    const cel = L.cellules, zid = L.zid;
    for (let i = 0; i < cel.length; i++) {
        const w = cel[i];
        if (w === LUTTE_VIDE || w === v) continue;
        let n = 0;
        for (let k = 0; k < 8; k++) {
            const j = _lutteVoisins8[i * 8 + k];
            if (j >= 0 && zid[j] === id) n++;
        }
        if (n) sortie.push({ i: i, n: n });
    }
    return sortie;
}

/* Le grain du sol : un poids fixe par case, tire une fois pour toutes a la
   naissance de la bataille, puis lisse. C'est lui qui fait avancer le front
   par lobes au lieu d'un cercle regulier. */
function _grainLutte(L) {
    if (L.grain) return L.grain;
    const N = LUTTE_N;
    const brut = new Float32Array(N * N);
    for (let i = 0; i < brut.length; i++) brut[i] = gameRandom();
    const g = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let somme = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
            somme += brut[ny * N + nx]; n++;
        }
        g[y * N + x] = somme / n;
    }
    L.grain = g;
    return g;
}

function majLutte(body, pas) {
    const L = body.lutte, cel = L.cellules, nb = cel.length;
    const neutre = (body.owner === null || body.owner === undefined);

    zonesRecalculer(body, L);

    _lutteCompte.fill(0);
    let total = 0;
    for (let i = 0; i < nb; i++) { const v = cel[i]; if (v === LUTTE_VIDE) continue; total++; _lutteCompte[v]++; }
    if (!total) { body.lutte = null; return; }

    /* CHAQUE ZONE PRODUIT POUR ELLE-MEME, au prorata de la surface qu'elle
       tient, sous le plafond que lui donne cette surface, et au rendement de
       la courbe de croissance. Deux taches du meme joueur ont donc chacune
       leur reserve et leur rythme. */
    for (const id in L.zones) {
        const z = L.zones[id];
        const slot = (z.v === 0) ? body.owner : z.v - 1;
        z.plafond = body.maxSpores * (z.n / total);
        if (slot === null || slot === undefined) { z.debit = 0; z.rendement = 0; continue; }
        z.rendement = courbeCroissance(z.spores / Math.max(1, z.plafond));
        z.debit = debitPour(body, slot) * (z.n / total) * z.rendement;
        if (z.spores < z.plafond) z.spores = Math.min(z.plafond, z.spores + z.debit * pas);
    }

    const cout = coutCase(body, total);
    const grain = _grainLutte(L);
    let pousseEncore = false;

    /* Le chantier d'un astre partage : updateSporeGeneration ne passe plus
       par la, c'est donc ici qu'il aboutit, paye par la zone qui l'a demande
       et pose sur son sol. */
    if (body.buildMode === 'nid' || body.buildMode === 'biome' || body.buildMode === 'alveole') {
        const bs = (body.buildSlot !== undefined) ? body.buildSlot : body.owner;
        const zb = zoneDeTir(body, bs);
        if (zb) {
            const prixB = coutBatiment(body, body.buildMode);
            if (zb.z.spores >= prixB) {
                zb.z.spores -= prixB;
                const genre = body.buildMode;
                if (genre === 'alveole') body.baseMaxSpores = body.baseMaxSpores || body.maxSpores;
                poserEdifice(body, genre, zb.z.v);
                body.buildMode = 'off';
                L.sale = true;
                if (bs === localSlot()) {
                    playBuildSound();
                    gameState.conquestEffects.push({
                        x: body.x, y: body.y - body.radius - 26, baseX: body.x,
                        text: '+' + pct(bonusProchain(nbBatiment(body, genre) - 1, genre)) + '%',
                        color: BATI_TEINTES[genre] || '#FFFFFF', age: 0, maxAge: 2.8 });
                }
            }
        }
    }

    /* L'IA contre-attaque d'elle-meme des qu'elle a de quoi : un joueur humain
       choisit quand relancer, une IA n'a personne pour le faire a sa place. */
    if (!neutre) {
        const j0 = gameState.players[body.owner];
        if (j0 && !j0.isHuman) {
            const miennes = zonesDe(body, body.owner);
            for (let k = 0; k < miennes.length; k++) {
                const z = miennes[k].z;
                if (z.n < ZONE_MIN || z.elan >= cout) continue;
                const surplus = z.spores - z.plafond * 0.5;
                if (surplus >= cout) z.elan = surplus;
            }
        }
    }

    /* LA POUSSEE, zone par zone. Une zone n'avance que si elle a de l'elan -
       des spores engagees - et chaque case lui coute le prix du sol. */
    for (const id in L.zones) {
        const z = L.zones[id];
        if (!(z.elan >= cout)) { z.elan = 0; continue; }
        let cases = Math.max(1, Math.round(LUTTE_CADENCE * pas));
        const front = _frontDe(L, +id, z.v, _lutteCandidats);
        if (!front.length) { z.elan = 0; continue; }
        for (let i = 0; i < front.length; i++) {
            const f = front[i];
            /* Les creux du front d'abord - c'est ce qui evite les dentelles -
               mais le grain et le hasard pesent plus lourd : le front doit
               avancer par lobes, pas en cercle parfait. */
            f.p = f.n * 0.30 + grain[f.i] * 2.6 + gameRandom() * 1.3;
        }
        front.sort(function (a, b) { return b.p - a.p; });
        for (let i = 0; i < front.length && cases > 0; i++) {
            const j = front[i].i;
            const perdant = cel[j];
            if (perdant === z.v || perdant === LUTTE_VIDE) continue;
            /* Le sol vierge se prend pour presque rien : personne ne le
               defend. Coloniser ne doit pas couter aussi cher que conquerir. */
            const prix = (perdant === 0 && neutre) ? cout * 0.15 : cout;
            if (z.elan < prix || z.spores < prix) break;
            const perdue = L.zones[L.zid[j]];
            if (perdue) perdue.n--;      /* ses spores suivront au prochain prorata */
            cel[j] = z.v;
            L.zid[j] = +id;
            z.n++;
            _lutteCompte[perdant]--;
            _lutteCompte[z.v]++;
            z.elan -= prix;
            z.spores = Math.max(0, z.spores - prix);
            cases--;
            L.sale = true;
        }
        if (z.elan >= cout) pousseEncore = true; else z.elan = 0;
    }
    L.dormante = !pousseEncore;

    /* LA FONTE. Une zone de moins de dix cases ne tient pas : une fois son
       elan retombe, elle s'effrite case par case jusqu'a disparaitre. C'est
       ce qui empeche les confettis de rester eternellement sur la carte. */
    for (const id in L.zones) {
        const z = L.zones[id];
        if (z.n >= ZONE_MIN || z.elan >= cout) { z.fonte = 0; continue; }
        z.fonte = (z.fonte || 0) + pas;
        if (z.fonte < ZONE_FONTE) continue;
        z.fonte = 0;
        /* La case la plus exposee part la premiere, au camp qui l'entoure le
           mieux. */
        let pire = -1, pireN = -1, repreneur = 0;
        for (let i = 0; i < nb; i++) {
            if (L.zid[i] !== +id) continue;
            const voisins = {};
            let etrangers = 0;
            for (let k = 0; k < 8; k++) {
                const j = _lutteVoisins8[i * 8 + k];
                if (j < 0 || cel[j] === LUTTE_VIDE || cel[j] === z.v) continue;
                voisins[cel[j]] = (voisins[cel[j]] || 0) + 1;
                etrangers++;
            }
            if (etrangers > pireN) {
                pireN = etrangers; pire = i;
                let best = 0;
                for (const w in voisins) if (voisins[w] > best) { best = voisins[w]; repreneur = +w; }
            }
        }
        if (pire >= 0 && pireN > 0) {
            cel[pire] = repreneur;
            _lutteCompte[z.v]--;
            _lutteCompte[repreneur]++;
            z.n--;                       /* ses spores suivront au prochain prorata */
            L.sale = true;
        }
    }

    zonesAgreger(body, L);

    /* Qui plie ? Un camp sans terrain est chasse ; celui qui tient tout
       emporte l'astre. */
    for (const k in L.assaut) {
        const s = +k, v = s + 1;
        if (_lutteCompte[v] > 0) continue;
        delete L.assaut[s];
        L.sale = true;
        if (body.owner === localSlot() || s === localSlot()) {
            gameState.conquestEffects.push({ x: body.x, y: body.y - body.radius - 15, baseX: body.x,
                                             text: 'Repoussé', color: '#888', age: 0, maxAge: 3 });
        }
    }

    /* Un astre majoritairement etranger sort du groupement, et y revient
       quand on a repris la main : la frontiere doit etre recalculee au
       passage du seuil, pas a chaque case. */
    const majo = (total - _lutteCompte[0]) / total >= LUTTE_MAJORITE;
    if (L.majorite !== majo) { L.majorite = majo; marquerTerritoiresSales(); }

    let vainqueur = -1, meilleur = 0;
    for (let v = 1; v < _lutteCompte.length; v++) {
        if (_lutteCompte[v] > meilleur) { meilleur = _lutteCompte[v]; vainqueur = v - 1; }
    }
    if (vainqueur < 0) { body.lutte = null; marquerTerritoiresSales(); return; }
    if (_lutteCompte[0] === 0) {
        const reste = L.assaut[vainqueur] || 0;
        body.lutte = null;
        conquerir(body, vainqueur, reste);
    }
}

/* La part de la surface tenue par un autre que le proprietaire. */
function partEtrangere(body) {
    const L = body.lutte;
    if (!L) return 0;
    const cel = L.cellules;
    let etr = 0, tot = 0;
    for (let i = 0; i < cel.length; i++) {
        const v = cel[i];
        if (v === LUTTE_VIDE) continue;
        tot++;
        if (v !== 0) etr++;
    }
    return tot ? etr / tot : 0;
}

/* Un astre compte comme tenu tant que l'etranger n'y est pas majoritaire :
   une tete de pont ne doit pas casser un groupement a elle seule. */
function tenuPar(body, slot) {
    if (body.owner !== slot || slot === null || slot === undefined) return false;
    return !(body.lutte && body.lutte.majorite);
}

/* ── Rendu : la surface prise, peinte sur le disque ── */
const _lutteRgb = {};
function _rgb255(c) {
    if (_lutteRgb[c]) return _lutteRgb[c];
    const m = _rgbDe(c).split(',');
    const out = [+m[0], +m[1], +m[2]];
    _lutteRgb[c] = out;
    return out;
}

/* La couleur d'un camp : celle du joueur, ou le gris du sol pour ce que
   personne ne tient - un astre neutre a bien une frontiere, elle est grise. */
const LUTTE_GRIS = [154, 160, 172];
function _teinteCamp(body, v) {
    if (v === 0) {
        if (body.owner === null || body.owner === undefined) return LUTTE_GRIS;
        const j = gameState.players[body.owner];
        return _rgb255((j && j.color) || '#FFFFFF');
    }
    const j = gameState.players[v - 1];
    return _rgb255((j && j.color) || '#FFFFFF');
}

function _peindreLutte(body, L) {
    const N = LUTTE_N;
    if (!L.canvas) {
        L.canvas = document.createElement('canvas');
        L.canvas.width = N; L.canvas.height = N;
        L.ctx = L.canvas.getContext('2d');
    }
    const img = L.ctx.createImageData(N, N);
    const d = img.data;
    const cel = L.cellules;
    for (let i = 0; i < N * N; i++) {
        const v = cel[i];
        if (v === LUTTE_VIDE) continue;

        /* PAS DE LISERE BLANC. Les cases de bord etaient tirees a 60 % vers
           le blanc : un anneau de pixels clairs autour de chaque zone, et
           autour du sol du defenseur, qui brouillait plus qu'il n'aidait.
           La frontiere se lit par la difference de couleur entre les camps ;
           le bord d'une zone attaquante est seulement un peu plus opaque que
           son interieur, et le sol du defenseur ne change pas a la couture. */
        let front = false;
        for (let k = 0; k < 4; k++) {
            const j2 = _lutteVoisins[i * 4 + k];
            if (j2 >= 0 && cel[j2] !== v) front = true;
        }
        const c = _teinteCamp(body, v);
        const sol = (v === 0);      /* le camp du defenseur, ou le sol neutre */
        if (front && !sol) {
            d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2];
            d[i * 4 + 3] = 235;
        } else {
            d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2];
            /* L'interieur du defenseur reste discret : c'est sa planete, on
               doit continuer a voir sa surface sous la couleur. */
            d[i * 4 + 3] = sol ? 55 : 185;
        }
    }
    L.ctx.putImageData(img, 0, 0);
}


/* La grille fait dix-huit cases de cote pour un disque qui en fait cent a
   l'ecran : on la laisse volontairement s'etaler au filtrage, ce qui donne
   des taches molles plutot qu'un damier. Une seule image par astre et par
   frame, repeinte seulement quand le front a bouge. */
/* Les batiments, poses la ou ils sont : l'icone de son genre par edifice,
   cerclee de sombre pour tenir sur n'importe quelle surface. On ne les montre qu'a partir d'un certain grossissement -
   en dessous ils ne seraient qu'un grain de bruit. */
function drawEdifices(ctx) {
    const z = gameState.camera.zoom;
    const bodies = gameState.allBodies;
    for (let bi = 0; bi < bodies.length; bi++) {
        const body = bodies[bi];
        const n = (body.alveoles || 0) + (body.nids || 0) + (body.biomes || 0);
        if (!n) continue;
        const r = body.radius;
        if (r * z < 26) continue;
        if (!aLEcran(body.x, body.y, r)) continue;
        const liste = edifices(body);
        if (!liste.length) continue;
        const pas = (2 * r) / LUTTE_N;
        const x0 = body.x - r, y0 = body.y - r;
        /* L'icone du genre (voir iconeBat), la meme que dans les menus. */
        const cote = Math.max(pas * 1.05, 6 / z);
        /* Tout pres, un nid qui produit crache ses spores : de petits jets
           qui jaillissent et retombent. Seulement si l'astre produit, et
           seulement quand l'icone est assez grande pour qu'on les voie. */
        let jets = false, couleur = '#4ADE80';
        if (cote * z >= 18 && (body.nids || 0) > 0 && debitAstre(body) > 0) {
            jets = true;
            const j = body.owner !== null && body.owner !== undefined ? gameState.players[body.owner] : null;
            if (j) couleur = couleurEtincelle(j.color);
        }
        for (let k = 0; k < liste.length; k++) {
            const e = liste[k];
            const cx = x0 + ((e.i % LUTTE_N) + 0.5) * pas;
            const cy = y0 + (((e.i / LUTTE_N) | 0) + 0.5) * pas;
            dessinerIconeBat(ctx, e.g, cx, cy, cote);
            if (jets && e.g === 'nid') jetsDuNid(ctx, cx, cy, cote, e.i, couleur);
        }
    }
}

/* Les jets d'un nid : des grains qui partent du bord du nid vers le haut,
   s'ecartent un peu, ralentissent et retombent en s'eteignant. Chaque grain
   suit un cycle ; a chaque cycle il repart sous un autre angle (tire d'un
   hachage du numero de cycle), ce qui evite de garder un etat par nid. */
function jetsDuNid(ctx, cx, cy, cote, graine, couleur) {
    const t = gameState.time;
    const a0 = ctx.globalAlpha, op = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = couleur;
    ctx.strokeStyle = couleur;
    ctx.lineCap = 'round';
    for (let j = 0; j < 12; j++) {
        const decal = ((graine * 0.618 + j * 0.377) % 1);
        const u = t * 1.1 + decal;
        const cycle = Math.floor(u);
        const ph = u - cycle;
        const h = Math.sin(cycle * 12.9898 + j * 78.233 + graine * 3.1) * 43758.5453;
        const alea = h - Math.floor(h);
        const ang = -Math.PI / 2 + (alea - 0.5) * 1.3;
        const v = cote * (0.8 + alea * 0.7);
        /* Position a l'instant, et un peu avant : le trait entre les deux
           fait le jet. */
        const pos = (q) => [cx + Math.cos(ang) * v * q,
                            cy - cote * 0.18 + Math.sin(ang) * v * q + cote * 0.9 * q * q];
        const [px, py] = pos(ph);
        const [qx, qy] = pos(Math.max(0, ph - 0.12));
        const r = cote * 0.055 * (1 - ph * 0.5);
        ctx.globalAlpha = 0.9 * (1 - ph);
        ctx.lineWidth = r * 1.6;
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, r * 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op;
}

function drawLuttes(ctx) {
    const bodies = gameState.allBodies;
    for (let bi = 0; bi < bodies.length; bi++) {
        const body = bodies[bi];
        const L = body.lutte;
        if (!L) continue;
        if (!aLEcran(body.x, body.y, body.radius + 20)) continue;
        if (L.sale || !L.canvas) { _peindreLutte(body, L); L.sale = false; }
        const r = body.radius;
        const zc = gameState.camera.zoom;
        ctx.save();
        /* Pas de filtrage : les cases doivent rester nettes, sinon le lisere
           d'une case de large que porte chaque camp se dissout en une bande
           floue et la frontiere ne se lit plus. */
        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        ctx.arc(body.x, body.y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(L.canvas, body.x - r, body.y - r, r * 2, r * 2);
        /* LA ZONE CHOISIE, cernee d'un trait clair qui bat : c'est d'elle
           que partira le prochain tir, et il faut le voir sans hesiter. */
        const sel = zoneChoisie(localSlot());
        if (sel && sel.body === body && L.zones && L.zones[sel.id] && gameState.isMulti) {
            /* La grille locale n'etant pas celle du serveur, on cerne la zone
               d'un anneau pose sur son centre plutot que de suivre ses cases. */
            const z = L.zones[sel.id];
            const c = zoneCentre(body, z);
            const rr = Math.sqrt(z.n / Math.PI) * ((2 * r) / LUTTE_N);
            const bat = 0.55 + 0.45 * Math.sin((gameState.time || 0) * 6);
            ctx.save();
            ctx.globalAlpha = 0.5 + 0.5 * bat;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = Math.max(1 / zc, r * 0.02);
            ctx.beginPath();
            ctx.arc(c.x, c.y, Math.max(rr, r * 0.08), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else if (sel && sel.body === body && L.zones && L.zones[sel.id]) {
            const pas = (2 * r) / LUTTE_N;
            const x0 = body.x - r, y0 = body.y - r;
            const bat = 0.55 + 0.45 * Math.sin((gameState.time || 0) * 6);
            ctx.save();
            ctx.lineCap = 'round';
            /* Deux passes : un trait sombre dessous, le blanc dessus. Sur une
               planete deja bariolee de liseres, un simple trait clair se
               perdait et l'on ne voyait pas ce qu'on avait choisi. */
            for (let passe = 0; passe < 2; passe++) {
              ctx.globalAlpha = passe ? (0.55 + 0.45 * bat) : 0.85;
              ctx.strokeStyle = passe ? '#FFFFFF' : 'rgba(6,6,20,0.9)';
              ctx.lineWidth = Math.max(1 / zc, pas * (passe ? 0.30 : 0.62));
              for (let y = 0; y < LUTTE_N; y++) for (let x = 0; x < LUTTE_N; x++) {
                const i = y * LUTTE_N + x;
                if (L.zid[i] !== sel.id) continue;
                /* Seules les aretes qui donnent sur l'exterieur de la zone. */
                if (x === LUTTE_N - 1 || L.zid[i + 1] !== sel.id) {
                    ctx.beginPath();
                    ctx.moveTo(x0 + (x + 1) * pas, y0 + y * pas);
                    ctx.lineTo(x0 + (x + 1) * pas, y0 + (y + 1) * pas);
                    ctx.stroke();
                }
                if (x === 0 || L.zid[i - 1] !== sel.id) {
                    ctx.beginPath();
                    ctx.moveTo(x0 + x * pas, y0 + y * pas);
                    ctx.lineTo(x0 + x * pas, y0 + (y + 1) * pas);
                    ctx.stroke();
                }
                if (y === LUTTE_N - 1 || L.zid[i + LUTTE_N] !== sel.id) {
                    ctx.beginPath();
                    ctx.moveTo(x0 + x * pas, y0 + (y + 1) * pas);
                    ctx.lineTo(x0 + (x + 1) * pas, y0 + (y + 1) * pas);
                    ctx.stroke();
                }
                if (y === 0 || L.zid[i - LUTTE_N] !== sel.id) {
                    ctx.beginPath();
                    ctx.moveTo(x0 + x * pas, y0 + y * pas);
                    ctx.lineTo(x0 + (x + 1) * pas, y0 + y * pas);
                    ctx.stroke();
                }
              }
            }
            ctx.restore();
        }

        ctx.restore();

        /* CE QUE PORTE CHAQUE ZONE, ecrit en son milieu des qu'on est assez
           pres : sa reserve, et son rendement du moment. Une zone trop petite
           pour attaquer le dit aussi - elle ne fait plus que fondre. */
        if (r * zc > 40 && L.zones) {
            const px = _taillePx(zc, 11, r * zc * 0.25, 10, 22);
            const monde = px / zc;
            ctx.save();
            ctx.textAlign = 'center';
            for (const id in L.zones) {
                const z = L.zones[id];
                if (z.n < 3) continue;
                const c = zoneCentre(body, z);
                const j2 = gameState.players[(z.v === 0) ? body.owner : z.v - 1];
                ctx.font = 'bold ' + monde + 'px Orbitron';
                _texteLisible(ctx, _sp(z.spores), c.x, c.y,
                              (j2 && j2.color) || '#CCCCCC', Math.max(2, monde * 0.24));
                ctx.font = 'bold ' + (monde * 0.72) + 'px Orbitron';
                const rd = Math.round((z.rendement || 0) * 100);
                _texteLisible(ctx, z.n < ZONE_MIN ? '\u25BC ' + z.n : '\u25D1' + rd + '%',
                              c.x, c.y + monde * 0.95,
                              z.n < ZONE_MIN ? '#F87171' : (rd >= 85 ? '#4ADE80' : rd >= 50 ? '#FACC15' : '#F87171'),
                              Math.max(2, monde * 0.2));
                /* La zone choisie se nomme : sans cela on ne sait pas d'ou
                   partira le tir, et le trait seul ne suffit pas a le dire. */
                const selz = zoneChoisie(localSlot());
                if (selz && selz.body === body && selz.id === +id) {
                    ctx.font = 'bold ' + (monde * 0.62) + 'px Orbitron';
                    _texteLisible(ctx, '\u2316 TIR', c.x, c.y - monde * 0.85,
                                  '#FFFFFF', Math.max(2, monde * 0.2));
                }
            }
            ctx.restore();
        }

        /* Le stock de chaque assaillant, a sa couleur, sous l'astre. Le grand
           nombre qui y figure deja est celui du defenseur : sans celui-ci on
           se bat a l'aveugle. Memes unites que drawSporeCountOnBodies - du
           monde, pas de l'ecran - et place sous la ligne des batiments. */
        const z = gameState.camera.zoom;
        if (z < 0.3) continue;
        const monde = _taillePx(z, 15, r * z, 13, 34) / z;
        let ligne = body.y + r + monde * 2.25;
        if ((body.alveoles || 0) + (body.nids || 0) + (body.biomes || 0) > 0) ligne += monde * 0.9;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold ' + (monde * 0.85) + 'px Orbitron';
        for (const k in L.assaut) {
            const j2 = gameState.players[+k];
            if (!j2) continue;
            const txt = '\u2694' + _sp(L.assaut[+k]);
            _texteLisible(ctx, txt, body.x, ligne, j2.color, Math.max(2, monde * 0.2));
            _noterChiffre(body.x, ligne, ctx.measureText(txt).width, monde * 0.85,
                          { slot: +k, valeur: L.assaut[+k], astre: body.name, role: 'assaut' });
            ligne += monde * 0.95;
        }
        ctx.restore();
    }
}

/* LA COURBE DE NAISSANCE. Le rendement d'une zone ne depend que de son taux
   de remplissage : une montee rapide, le pic vers 40 %, puis un
   ralentissement jusqu'a l'extinction.
   Plutot que de le faire deviner, on dessine la courbe et on y pose un point
   - vous etes ici. */
/* LE PANNEAU NAISSANCE. Le rendement d'une zone ne depend que de son taux de
   remplissage : une montee rapide, le pic vers 40 %, puis un ralentissement
   jusqu'au plein. On dessine donc la courbe en entier et on y pose un point
   - vous etes ici. */
let _naissancePts = null;
function _pointsNaissance() {
    if (_naissancePts) return _naissancePts;
    _naissancePts = [];
    for (let i = 0; i <= 64; i++) {
        const t = i / 64;
        _naissancePts.push([t, courbeCroissance(t)]);
    }
    return _naissancePts;
}

/* LE PIC DE LA COURBE, trouve une fois pour toutes : c'est vers lui qu'on
   veut savoir combien de temps il reste. */
let _picNaissance = -1;
function picNaissance() {
    if (_picNaissance >= 0) return _picNaissance;
    let best = 0, bv = -1;
    for (let i = 0; i <= 200; i++) {
        const t = i / 200, v = courbeCroissance(t);
        if (v > bv) { bv = v; best = t; }
    }
    _picNaissance = best;
    return best;
}

/* COMBIEN DE TEMPS JUSQU'A... La courbe dit OU l'on est, jamais QUAND on sera
   au bon endroit - et comme le rendement varie tout du long, on ne peut pas
   le deviner d'une regle de trois. On integre donc la montee pas a pas :
   a chaque cran, la vitesse est le debit de base fois le rendement du moment.
   Renvoie des secondes, ou null si l'on n'y arrivera jamais. */
function tempsJusqua(depart, cible, debitPlein, plafond) {
    if (!(debitPlein > 0) || !(plafond > 0)) return 'arret';   /* rien ne pousse */
    if (cible <= depart) return 0;
    let t = 0, part = depart;
    const N = 400, pas = (cible - depart) / N;
    for (let i = 0; i < N; i++) {
        const r = courbeCroissance(part + pas / 2);
        if (r < 1e-4) return 'long';            /* le rendement s'eteint */
        t += (pas * plafond) / (debitPlein * r);
        part += pas;
        if (t > 3600) return 'long';
    }
    return t;
}

function _duree(s) {
    if (s === null || s === undefined) return null;
    if (s < 1) return 'maintenant';
    if (s < 60) return Math.round(s) + ' s';
    const m = Math.floor(s / 60), r = Math.round(s % 60);
    return m + ' min' + (r ? ' ' + r + ' s' : '');
}

let _naiEls = null;
function majPanneauNaissance() {
    if (!_naiEls) {
        _naiEls = {
            panneau: document.getElementById('naissancePanel'),
            cv: document.getElementById('naissanceCanvas'),
            zone: document.getElementById('naissanceZone'),
            plein: document.getElementById('naissancePlein'),
            rend: document.getElementById('naissanceRend'),
            quand: document.getElementById('naissanceQuand')
        };
        if (!_naiEls.panneau) return;
    }
    const E = _naiEls;
    if (!E.panneau) return;

    /* LA COURBE NE DOIT PAS DEPENDRE D'UNE BATAILLE. Les zones n'existent que
       pendant un conflit : tant qu'il n'y en a pas - c'est-a-dire la plupart
       du temps - il n'y avait aucune zone a selectionner, donc pas de
       panneau, alors qu'un astre tranquille suit exactement la meme courbe.
       On prend donc la zone choisie quand il y en a une, et a defaut l'astre
       selectionne, avec sa reserve et sa capacite. */
    let titre = null, part = 0, plafond = 0, debitPlein = 0;
    const moi = localSlot();
    const sel = zoneChoisie(moi);
    const zb = sel && sel.body;
    const z = (zb && zb.lutte && zb.lutte.zones) ? zb.lutte.zones[sel.id] : null;
    if (z) {
        titre = zb.name + ' \u00b7 ' + z.n + ' cases';
        plafond = Math.max(1, z.plafond || 1);
        part = (z.spores || 0) / plafond;
        /* Le debit d'une zone est celui de l'astre au prorata de sa surface,
           avant la courbe : c'est elle qu'on integre. */
        const tot = casesAstre(zb);
        const slot = (z.v === 0) ? zb.owner : z.v - 1;
        debitPlein = debitPour(zb, slot) * (z.n / Math.max(1, tot));
    } else {
        const a = (typeof followingBody !== 'undefined' && followingBody)
                ? followingBody : gameState.selectedBody;
        if (a && a.type !== 'sun' && (a.owner === moi || (a.lutte && zonesDe(a, moi).length))) {
            titre = a.name;
            plafond = Math.max(1, a.maxSpores || 1);
            part = (a.spores || 0) / plafond;
            debitPlein = debitPour(a, a.owner);
        }
    }

    if (gameState.phase !== 'game' || titre === null) {
        if (E.panneau.classList.contains('actif')) E.panneau.classList.remove('actif');
        return;
    }
    if (!E.panneau.classList.contains('actif')) E.panneau.classList.add('actif');

    part = Math.max(0, Math.min(1, part));
    const rend = courbeCroissance(part);
    const teinte = rend >= 0.85 ? '#4ADE80' : rend >= 0.5 ? '#FACC15' : '#F87171';

    E.zone.textContent = titre;
    E.plein.textContent = Math.round(part * 100) + '% plein';
    E.rend.textContent = Math.round(rend * 100) + '%';
    E.rend.style.color = teinte;

    /* QUAND. Le chiffre qui manquait : la courbe disait ou l'on etait, jamais
       combien de temps il restait a attendre. Avant le pic on annonce le pic,
       apres on annonce la saturation - le moment ou l'astre cesse de
       produire, et ou il vaut mieux avoir tire. */
    if (E.quand) {
        const pic = picNaissance();
        const avant = part < pic - 0.005;
        const t = (part < PART_SATUREE) ? tempsJusqua(part, avant ? pic : PART_SATUREE, debitPlein, plafond) : null;
        let txt;
        if (part >= PART_SATUREE) txt = '\u26A0 saturé — ne produit plus';
        else if (t === 'arret') txt = 'production à l\'arrêt';
        else if (t === 'long')  txt = (avant ? 'pic' : 'saturation') + ' dans plus d\'une heure';
        else txt = (avant ? 'pic dans ' : '\u26A0 saturation dans ') + _duree(t);
        if (E.quand.textContent !== txt) E.quand.textContent = txt;
        E.quand.style.color = avant ? 'rgba(190,210,245,0.6)' : 'rgba(250,204,21,0.85)';
    }

    const cv = E.cv, x = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    x.clearRect(0, 0, W, H);

    const m = 6, gx = m, gw = W - m * 2, gy = m, gh = H - m * 2;
    const px = t => gx + t * gw;
    const py = v => gy + gh - Math.max(0, Math.min(1, v)) * gh;

    // La ligne de sol
    x.strokeStyle = 'rgba(140,170,230,0.20)';
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(gx, gy + gh); x.lineTo(gx + gw, gy + gh); x.stroke();

    // La courbe, remplie dessous pour qu'on lise la forme d'un coup d'oeil
    const pts = _pointsNaissance();
    x.beginPath();
    x.moveTo(px(0), py(pts[0][1]));
    for (let i = 1; i < pts.length; i++) x.lineTo(px(pts[i][0]), py(pts[i][1]));
    x.lineTo(px(1), gy + gh); x.lineTo(px(0), gy + gh); x.closePath();
    x.fillStyle = 'rgba(120,170,255,0.16)';
    x.fill();

    x.beginPath();
    x.moveTo(px(0), py(pts[0][1]));
    for (let i = 1; i < pts.length; i++) x.lineTo(px(pts[i][0]), py(pts[i][1]));
    x.strokeStyle = 'rgba(160,200,255,0.9)';
    x.lineWidth = 3;
    x.lineJoin = 'round';
    x.stroke();

    // Vous etes ici : le fil a plomb, puis le point
    x.beginPath();
    x.moveTo(px(part), gy + gh); x.lineTo(px(part), py(rend));
    x.strokeStyle = teinte;
    x.globalAlpha = 0.5;
    x.lineWidth = 2;
    x.stroke();
    x.globalAlpha = 1;

    x.beginPath();
    x.arc(px(part), py(rend), 6, 0, Math.PI * 2);
    x.fillStyle = teinte;
    x.fill();
    x.strokeStyle = 'rgba(10,8,30,0.95)';
    x.lineWidth = 2.5;
    x.stroke();
}

/* PRISE D'UN ASTRE. Extrait d'applyConquest : ce n'est plus l'impact d'un
   jet qui conquiert, mais la bataille de surface qui se termine, et les deux
   ont besoin du meme rituel - changement de camp, batiments, evenements,
   alerte, effets. */
function conquerir(body, nouveauProprio, sporesArrivees) {
    body.lutte = null;
    if (gameState._zoneSel && gameState._zoneSel.body === body) gameState._zoneSel = null;
    for (const j of gameState.players) if (j.zoneSel && j.zoneSel.body === body) j.zoneSel = null;
    const attacking = sporesArrivees;
    const jet = { owner: nouveauProprio };
    const attackerColor = gameState.players[nouveauProprio]?.color || '#FFF';
    const oldOwner = body.owner;
    if (oldOwner !== null && gameState.players[oldOwner]) {
        const arr = gameState.players[oldOwner].bodies;
        const idx = arr.indexOf(body);
        if (idx >= 0) arr.splice(idx, 1);
    }

    body.owner = jet.owner;
    body.spores = attacking;
    /* Le maitre du parasite prend l'astre : le parasite n'a plus personne a vider. */
    if (body.parasite && body.parasite.ownerSlot === nouveauProprio) { body.parasite = null; body.droneCount = 0; }
    body.faune = 0; // Faune détruite après conquête
    // Invalider cache isSystemComplete du soleil concerné
    const _conquSun = body.type === 'planet' ? body.parent : (body.parent?.parent || null);
    if (_conquSun) _conquSun._sysCache = null;
    marquerTerritoiresSales();
    body.symbiosis = 0; // Reset symbiose
    body.symOwnerTime = 0;
    body.buildMode = 'off';
    /* Les batiments restent : ils sont poses sur le sol, et qui prend le sol
       prend ce qui est dessus. On ne detruit plus rien a la conquete - un
       batiment construit ne peut plus qu'etre recupere. */

    if (gameState.players[jet.owner]) {
        gameState.players[jet.owner].bodies.push(body);
    }

    gameState.gameStats.bodiesConquered++;

    // Log événement
    const attackerName = gameState.players[jet.owner]?.name || 'IA-' + jet.owner;
    const bType = body.type === 'planet' ? 'Planète' : 'Lune';
    const aColor = gameState.players[jet.owner]?.color || '#AAA';
    const oColor = oldOwner !== null ? (gameState.players[oldOwner]?.color || '#AAA') : '#AAA';
    if (oldOwner === null) {
        const _virginBonus = body.type === 'planet' ? 500 : 250;
        body.spores = Math.min(body.maxSpores, (body.spores || 0) + _virginBonus);
        gameState.conquestEffects.push({
            x: body.x, y: body.y - body.radius - 30,
            baseX: body.x,
            text: '+' + _virginBonus + ' 🎁',
            color: '#FFD700', age: 0, maxAge: 3
        });
        if (jet.owner === localSlot()) {
            addEvent('neutral', '🏳️', `${bType} ${body.name} colonisée ! +${_virginBonus} sp 🎁`, body, aColor);
        } else {
            addEvent('neutral', '🏳️', `${bType} ${body.name} colonisée par ${attackerName}`, body, aColor);
        }
    } else if (jet.owner === localSlot()) {
        addEvent('mine', '⚔️', `${bType} ${body.name} conquise !`, body, aColor);
    } else if (oldOwner === localSlot()) {
        addEvent('mine', '💀', `${bType} ${body.name} perdue ! (${attackerName})`, body, aColor);
        /* La perte est la seule alerte qu'on ne peut pas se permettre de
           rater : balise, eclat lumineux du bon cote, et secousse. */
        ajouterAlerte('perte', body, aColor);
        eclatBord(body, '#FF3B55');
        secouerEcran(9);
    } else {
        addEvent('war', '⚔️', `${bType} ${body.name} : ${attackerName} prend à ${gameState.players[oldOwner]?.name || 'IA-'+oldOwner}`, body, aColor);
    }

    // Effet d'éclosion
    gameState.bloomEffects.push({
        body: body, age: 0, maxAge: 1.5, color: attackerColor
    });

    // Effet texte
    gameState.conquestEffects.push({
        x: body.x, y: body.y - body.radius - 15,
        baseX: body.x,
        text: oldOwner === null ? 'COLONISÉ !' : 'CONQUIS !',
        color: attackerColor, age: 0, maxAge: 5
    });

    // Particules d'explosion conquête
    const _pCount = body.type === 'planet' ? 18 : 10;
    for (let _pi = 0; _pi < _pCount; _pi++) {
        const _ang = (Math.PI * 2 * _pi / _pCount) + (Math.random() - 0.5) * 0.4;
        const _spd = body.radius * (0.8 + Math.random() * 1.2);
        gameState.particles.push({
            x: body.x, y: body.y,
            vx: Math.cos(_ang) * _spd, vy: Math.sin(_ang) * _spd,
            life: 0, maxLife: 0.6 + Math.random() * 0.4,
            color: attackerColor, radius: 1.5 + Math.random() * 2,
            fade: true
        });
    }
    // Anneau de couleur expansif
    gameState.bloomEffects.push({
        body: body, age: 0, maxAge: 0.6, color: attackerColor, ring: true
    });
}

function applyConquest(body, jet) {
    // Jet de drain parasite → atterrit sur planète alliée, renforce
    if (jet._parasiteDrain) {
        if (jet._targetBody && jet._targetBody === body) {
            ajouterSpores(body, jet.spores);
        }
        return;
    }

    // Jet parasite → installe le parasite sur planète ennemie
    if (jet.sporeType === 'parasite') {
        if (body.owner !== null && body.owner !== jet.owner) {
            if (!body.parasite) {
                body.parasite = { ownerSlot: jet.owner, sourceBody: jet.source, _accumulator: 0 };
                body.droneCount = 0;
                const attackerName = gameState.players[jet.owner]?.name || '?';
                if (body.owner === localSlot()) {
                    addEvent('war', iconeBat('parasite', 12), `${body.name} infectée par ${attackerName} !`, body, gameState.players[jet.owner]?.color);
                    ajouterAlerte('attaque', body, gameState.players[jet.owner]?.color);
                }
                if (jet.owner === localSlot()) addEvent('war', iconeBat('parasite', 12), `Parasite installé sur ${body.name}`, body, gameState.players[jet.owner]?.color);
            }
        }
        return;
    }

    // Jets normaux sur planète infectée → comptent comme drones anti-parasite
    if (body.parasite && body.owner === jet.owner && jet.sporeType !== 'parasite' && jet.sporeType !== 'parasite_drain') {
        body.droneCount = (body.droneCount || 0) + jet.spores;
        if (body.droneCount >= 500) {
            body.parasite = null;
            body.droneCount = 0;
            if (body.owner === localSlot()) addEvent('build', '✅', `Parasite éliminé sur ${body.name}`, body, gameState.players[localSlot()]?.color);
        }
        return;
    }


    // Jets sur planète alliée (mélange ADN) → renforcement
    if (body.owner !== null && body.owner !== jet.owner && _isAllied(jet.owner, body.owner)) {
        let _gain = 0;
        _gain = Math.floor(ajouterSpores(body, Math.floor(jet.spores)));
        if (_gain > 0) gameState.conquestEffects.push({ x:body.x, y:body.y-body.radius-10, baseX:body.x, text:'+'+_gain, color:'#4ADE80', age:0, maxAge:2.5 });
        return;
    }
    // Density bonus : +5% puissance d'impact par point
    const densityBonus = 1 + (gameState.players[jet.owner]?.stats.density || 0) * 0.05;
    let attacking = jet.spores * densityBonus;
    // Spores sur planète alliée : renforcement
    if (body.owner === jet.owner) {
        let _gain = 0;
        if (body.spores < body.maxSpores) { _gain = Math.floor(Math.min(jet.spores, body.maxSpores-body.spores)); body.spores = Math.min(body.maxSpores, body.spores+_gain); }
        if (_gain > 0) gameState.conquestEffects.push({ x:body.x, y:body.y-body.radius-10, baseX:body.x, text:'+'+_gain, color:'#C8A0FF', age:0, maxAge:2.5 });
        /* Renforcer un astre assiege, c'est contre-attaquer : les spores
           arrivees repoussent l'envahisseur au lieu d'attendre. */
        if (body.lutte && _gain > 0) {
            if (!body.lutte.elan) body.lutte.elan = {};
            body.lutte.elan[0] = (body.lutte.elan[0] || 0) + _gain;
            body.lutte.dormante = false;
        }
        return;
    }
    const attackerColor = gameState.players[jet.owner]?.color || '#FFF';

    /* On nous tire dessus : balise sur l'astre vise, aux couleurs de
       l'assaillant. Les tirs allies et les renforts sont deja repartis
       plus haut, ce qui arrive ici est forcement hostile. */
    if (body.owner === localSlot() && jet.owner !== localSlot()) {
        ajouterAlerte('attaque', body, attackerColor);
    }

    // Épuiser la faune
    if (body.faune > 0) {
        const fauneDmg = Math.min(body.faune, attacking);
        body.faune -= fauneDmg;
        attacking -= fauneDmg;
        // Effet visuel : faune restante
        gameState.conquestEffects.push({
            x: body.x, y: body.y - body.radius - 15,
            baseX: body.x,
            text: '-' + Math.floor(fauneDmg) + ' Faune',
            color: '#FF6B6B', age: 0, maxAge: 4
        });
    }

    /* Les biomes qui defendent sont ceux que l'assaillant NE tient PAS : ses
       propres bastions ne vont pas se dresser contre lui. */
    const _bioDef = body.lutte
        ? (body.biomes || 0) - nbBatimentCamp(body, 'biome', campDe(body, jet.owner))
        : (body.biomes || 0);
    const biomeDefense = 1 + bonusBatiment(Math.max(0, _bioDef), 'biome');
    attacking = attacking / biomeDefense;

    /* Les spores qui restent ne s'annulent plus d'un coup contre le stock du
       defenseur : elles debarquent et se battent pour la surface. C'est la
       bataille qui decidera, et qui pourra aussi les rejeter a la mer. */
    if (attacking > 0) {
        engagerLutte(body, jet.owner, attacking,
                     Math.atan2(jet.y - body.y, jet.x - body.x));
    } else if (body.faune <= 0 && body.spores > 0) {
        gameState.conquestEffects.push({
            x: body.x, y: body.y - body.radius - 15,
            baseX: body.x,
            text: 'Repoussé',
            color: '#888', age: 0, maxAge: 3.5
        });
    }
}

function checkJetNeutralization() {
    const jets = gameState.jets;
    for (let i = 0; i < jets.length; i++) {
        if (!jets[i].alive) continue;
        for (let j = i + 1; j < jets.length; j++) {
            if (!jets[j].alive) continue;
            if (jets[i].owner === jets[j].owner) continue;

            const dx = jets[i].x - jets[j].x;
            const dy = jets[i].y - jets[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 15) {
                playNeutralizationSound();
                gameState.gameStats.jetsNeutralized++;
                const min = Math.min(jets[i].spores, jets[j].spores);
                jets[i].spores -= min;
                jets[j].spores -= min;
                if (jets[i].spores <= 0) { jets[i].alive = false; break; }
                if (jets[j].spores <= 0) jets[j].alive = false;
            }
        }
    }
}


