/* ─────────────────────────────────────────────
   LES BATIMENTS SONT POSES SUR LE SOL
   Un batiment n'est plus un simple compteur sur l'astre : il occupe une case
   de la surface. Cela change deux choses. On le voit, la ou il est ; et quand
   la frontiere passe dessus, il change de mains avec le terrain - on ne
   detruit plus rien a la conquete, on recupere.
   Les compteurs nids/biomes/alveoles restent la somme, pour que tout ce qui
   lit deja un bonus continue de marcher ; la liste dit ou ils sont et a qui
   ils appartiennent a l'instant.
   ───────────────────────────────────────────── */
function edifices(body) {
    if (body.edifices) return body.edifices;
    body.edifices = [];
    /* Rattrapage : un astre d'avant, ou un instantane multijoueur, n'apporte
       que des compteurs. On leur trouve une place au hasard. */
    _luttePrepare();
    const genres = [['alveole', body.alveoles || 0], ['nid', body.nids || 0], ['biome', body.biomes || 0]];
    for (let g = 0; g < genres.length; g++) {
        for (let k = 0; k < genres[g][1]; k++) {
            const i = _caseLibre(body, null);
            if (i >= 0) body.edifices.push({ g: genres[g][0], i: i });
        }
    }
    return body.edifices;
}

/* Une case inoccupee, de preference chez le camp qui construit. */
function _caseLibre(body, v) {
    _luttePrepare();
    const N = LUTTE_N;
    const cel = body.lutte ? body.lutte.cellules : null;
    const pris = {};
    const liste = body.edifices || [];
    for (let k = 0; k < liste.length; k++) pris[liste[k].i] = 1;
    const libres = [];
    for (let i = 0; i < N * N; i++) {
        if (!_lutteMasque[i] || pris[i]) continue;
        if (v !== null && cel && cel[i] !== v) continue;
        libres.push(i);
    }
    if (!libres.length) return -1;
    return libres[Math.floor(gameRandom() * libres.length)];
}

function poserEdifice(body, genre, v) {
    const liste = edifices(body);
    const i = _caseLibre(body, (body.lutte && v !== undefined) ? v : null);
    if (i >= 0) liste.push({ g: genre, i: i });
    if (genre === 'nid') body.nids = (body.nids || 0) + 1;
    else if (genre === 'alveole') body.alveoles = (body.alveoles || 0) + 1;
    else body.biomes = (body.biomes || 0) + 1;
}

/* Combien de batiments d'un genre un camp tient-il ? Sur un astre paisible,
   c'est tout ce qu'il porte ; sur un astre partage, seulement ceux qui sont
   de son cote de la frontiere. */
function nbBatimentCamp(body, genre, v) {
    const cle = genre === 'nid' ? 'nids' : genre === 'alveole' ? 'alveoles' : 'biomes';
    if (!body.lutte) return body[cle] || 0;
    const liste = edifices(body);
    const cel = body.lutte.cellules;
    let n = 0;
    for (let k = 0; k < liste.length; k++) {
        if (liste[k].g !== genre) continue;
        if (cel[liste[k].i] === v) n++;
    }
    return n;
}

/* Le camp d'un joueur sur un astre : 0 pour le proprietaire, slot+1 sinon. */
function campDe(body, slot) {
    return (body.owner === slot) ? 0 : slot + 1;
}

/* slot : le joueur de l'ordre 'batiment', au tour qui l'execute. Sans lui,
   c'est le clic : on verifie (la vibration d'un refus doit etre immediate),
   puis en solo on donne l'ordre, en multijoueur on previent le serveur. */
function demanderConstruction(body, mode, slot) {
    if (!body) return false;
    const depuisOrdre = (slot !== undefined);
    const donner = !depuisOrdre && !gameState.isMulti;
    const moi = depuisOrdre ? slot : localSlot();
    /* On batit chez soi, mais aussi sur le bout de sol qu'on tient chez
       l'autre : une tete de pont est un territoire comme un autre. */
    const v = campDe(body, moi);
    const chezMoi = (body.owner === moi);
    if (!chezMoi && !(body.lutte && zonesDe(body, moi).length)) return false;

    if (mode === 'off' || mode === 'parasite') {
        if (donner) { donnerOrdre('batiment', { astre: body.name, mode: mode }); return true; }
        body.buildMode = mode;
        body.buildSlot = moi;
        if (gameState.isMulti) sendAction('build_mode', { bodyName: body.name, mode: mode });
        return true;
    }
    const zb = body.lutte ? zoneDeTir(body, moi) : null;
    if (body.lutte && (!zb || zb.z.n < ZONE_MIN)) { if (!depuisOrdre) secouerEcran(8); return false; }
    const reserve = zb ? zb.z.spores : body.spores;
    if (reserve < coutBatiment(body, mode)) {
        if (!depuisOrdre) secouerEcran(8);
        return false;
    }
    if (donner) { donnerOrdre('batiment', { astre: body.name, mode: mode }); return true; }
    body.buildMode = mode;
    body.buildSlot = moi;
    if (gameState.isMulti) sendAction('build_mode', { bodyName: body.name, mode: mode });
    return true;
}

/* Pour les textes : 0.06 devient "6", 0.025 devient "2,5". */
function pct(x) {
    const v = Math.round(x * 1000) / 10;
    return String(v).replace('.', ',');
}

/* Le debit de production d'un astre, en spores par seconde, apres sacrifice.
   Une seule definition : la formule etait deja recopiee dans le HUD et dans
   la fiche, et les deux copies avaient oublie le bonus de systeme complet -
   elles affichaient donc un chiffre legerement faux. En passant toutes par
   ici, elles disent la meme chose que la simulation.

   En multijoueur la production est calculee sur le serveur et le client ne
   voit que des instantanes : recalculer le debit de son cote est le seul
   moyen de l'afficher sans attendre. */
function debitAstre(body) {
    if (!body || body.owner === null || body.owner === undefined) return 0;
    if (body.panne > gameState.time) return 0;
    if (!(body.flore > 0)) return 0;
    const joueur = gameState.players[body.owner];
    if (!joueur || !joueur.stats) return 0;
    const sym = 1 + ((body.symbiosis || 0) / 100) * (body.type === 'planet' ? 0.20 : 0.10);
    const nid = 1 + bonusBatiment(body.nids || 0, 'nid');
    const soleil = body.type === 'planet' ? body.parent : (body.parent ? body.parent.parent : null);
    const sys = (soleil && isSystemComplete(soleil, body.owner)) ? 1.03 : 1;
    const part = 1 - partSacrifice(joueur);
    return Math.max(1, body.maxSpores) * TAUX_PROD
           * (0.4 + (body.flore / 100) * 0.6) * (1 + joueur.stats.growth * 0.3)
           * sym * nid * sys * part
           * courbeCroissance((body.spores || 0) / Math.max(1, body.maxSpores || 1));
}

