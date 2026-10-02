/* ─────────────────────────────────────────────
   BATAILLE DE SURFACE
   Une conquete ne se joue plus en un choc : les spores qui touchent un astre
   y prennent pied et s'etalent. Le disque est decoupe en une petite grille,
   chaque case etant un morceau de surface. Les assaillants arrivent sur UNE
   case, du cote d'ou vient le tir, et gagnent du terrain case par case.

   Ce que tient un camp vaut deux choses : sa part de la production de
   l'astre - la surface fabrique les spores - et sa pression, c'est-a-dire ses
   spores rapportees a sa surface. C'est la pression qui fait avancer un
   front : un camp qui a beaucoup de spores sur peu de terrain pousse fort.
   A pression egale, plus rien n'avance et seule l'usure du front decide : les
   deux camps y perdent autant, donc le plus gros stock finit par l'emporter -
   exactement comme dans l'ancien choc instantane, mais etale dans le temps.
   ───────────────────────────────────────────── */
const LUTTE_N = 32;            /* grille N x N posee sur le disque */
const LUTTE_PAS = 0.2;         /* un tour de bataille toutes les 0,2 s */
const LUTTE_VIDE = 255;        /* case hors du disque */
const LUTTE_CADENCE = 30;      /* cases prises par seconde : c'est l'animation */
const LUTTE_MAJORITE = 0.5;    /* part etrangere au-dela de laquelle l'astre sort du groupement */

/* LE PRIX DU SOL. La planete entiere vaut sa capacite en spores : une case
   coute donc la capacite divisee par le nombre de cases. Attaquer avec X
   spores rapporte X cases-equivalentes, ni plus ni moins - il n'est plus
   besoin d'avoir plus de troupes que l'adversaire pour grignoter du terrain.
   On pousse tant qu'on a de quoi payer, puis le front s'arrete et les deux
   camps se remettent a produire sur ce qu'ils tiennent. */
function coutCase(body, total) {
    return Math.max(1, (body.maxSpores || 1) / Math.max(1, total));
}

/* Le nombre de cases d'un astre, c'est-a-dire de cases du disque. Il ne
   depend que de la grille, pas de l'astre : on le compte une fois. */
let _casesDisque = 0;
function casesAstre(body) {
    const L = body && body.lutte;
    if (L && L.cellules) {
        let n = 0;
        for (let i = 0; i < L.cellules.length; i++) if (L.cellules[i] !== LUTTE_VIDE) n++;
        if (n) return n;
    }
    if (!_casesDisque) {
        _luttePrepare();
        for (let i = 0; i < _lutteMasque.length; i++) if (_lutteMasque[i]) _casesDisque++;
    }
    return _casesDisque;
}

/* CE QUE L'ENVOI ACHETERA. Tout le jeu tient dans "X spores valent X cases",
   mais ce chiffre ne se voyait nulle part : on tirait au jugé. On refait donc
   ici, a l'identique, le trajet d'un jet - densite, faune, biomes adverses -
   puis on divise par le prix du sol vise. */
function devisAttaque(src, cible) {
    if (!src || !cible || cible.type === 'sun') return null;
    const moi = localSlot();
    const j = gameState.players[moi];
    if (!j || !j.stats) return null;

    const zt = src.lutte ? zoneDeTir(src, moi) : null;
    const dispo = zt ? zt.z.spores : (src.spores || 0);
    const envoi = Math.floor(dispo * gameState.jetRatio);
    if (envoi < 5) return null;

    /* Un envoi chez soi ou chez un allie renforce, il n'achete rien. */
    const chezMoi = (cible.owner === moi) && !(cible.lutte && partEtrangere(cible) > 0);
    if (chezMoi) return { envoi: envoi, renfort: true };

    let arrive = envoi * (1 + (j.stats.density || 0) * 0.05);
    arrive -= Math.min(cible.faune || 0, arrive);
    const bioDef = cible.lutte
        ? (cible.biomes || 0) - nbBatimentCamp(cible, 'biome', campDe(cible, moi))
        : (cible.biomes || 0);
    arrive = arrive / (1 + bonusBatiment(Math.max(0, bioDef), 'biome'));
    if (arrive <= 0) return { envoi: envoi, arrive: 0, prix: 0, cases: 0, total: casesAstre(cible) };

    const total = casesAstre(cible);
    const neutre = (cible.owner === null || cible.owner === undefined);
    const prix = coutCase(cible, total) * (neutre ? 0.15 : 1);
    /* On ne peut pas acheter plus de sol qu'il n'y en a : au-dela, l'astre
       tombe en entier et le reste des spores s'y installe. */
    const brut = Math.floor(arrive / prix);
    return { envoi: envoi, arrive: arrive, prix: prix, total: total,
             cases: Math.min(brut, total), tout: brut >= total, neutre: neutre };
}

/* LE RENDEMENT DE BASE, en part de la CAPACITE par seconde. C'etait un
   nombre fixe de spores, 2,5, sans rapport avec la taille de l'astre : une
   geante de vingt mille mettait des heures a se remplir au meme rythme qu'une
   lune de quatre cents, et tout le monde stagnait faute de pouvoir accumuler
   de quoi relancer une attaque. En part de capacite, un astre se remplit dans
   un temps qui ne depend plus de sa taille : vingt-cinq pour cent en une
   minute et demie, le grand pic de la courbe en moins de quatre minutes.
   Consequence heureuse : une alveole, qui agrandit le plafond, augmente
   desormais aussi la production - un plus grand silo nourrit plus de monde. */
const TAUX_PROD = 0.006;

/* COURBE DE PRODUCTION, a la facon d'OpenFront : une population pousse
   d'autant plus qu'elle est nombreuse (spores ^ 0,75), et d'autant moins
   qu'elle manque de place (1 - remplissage). Le produit monte vite, culmine
   vers 40 % de la capacite, puis ralentit de plus en plus jusqu'au plein,
   ou il s'eteint. Un petit plancher (0,08) fait repartir un astre vide.
   Une seule courbe pour tous (les courbes par regime ont ete retirees).
   La puissance 0,75 se calcule avec deux racines carrees : exactes dans
   tous les navigateurs, donc identiques en reseau.

   La courbe multiplie le reste - flore, growth, symbiose, nids, systeme
   complet, sacrifice - qui continuent donc de compter exactement pareil.
   Le pic vaut 1 : la valeur de crete est divisee pour cela. */
/* Le seuil ou l'on considere un astre SATURE. La courbe ne tombe a zero
   qu'au plafond exact, mais elle s'eteint si doucement a l'approche qu'un
   astre n'y arrive pratiquement jamais : a 98,5 % il ne produit deja plus
   rien d'utile. Un seul chiffre pour le panneau NAISSANCE et pour les
   etincelles, sinon l'un dirait "sature" quand l'autre ne montre rien. */
const PART_SATUREE = 0.985;
const COURBE_PLANCHER = 0.08, COURBE_MAX = 0.349849;
/* La bande ou le rendement depasse 90 % du pic : les IA y gardent leurs
   astres (tirer au-dessus, laisser pousser en dessous). */
const ZONE_RENDEMENT = [0.225, 0.574];
function zoneBonRendement() { return ZONE_RENDEMENT; }

function courbeCroissance(part) {
    if (!(part > 0)) part = 0;
    if (part >= 1) return 0;
    const r = Math.sqrt(part);
    return (COURBE_PLANCHER + r * Math.sqrt(r)) * (1 - part) / COURBE_MAX;
}

let _lutteMasque = null, _lutteVoisins = null, _lutteVoisins8 = null;
const _lutteCompte = new Int16Array(34);
const _lutteCandidats = [];

function _luttePrepare() {
    if (_lutteMasque) return;
    const N = LUTTE_N, c = (N - 1) / 2, r = N / 2 - 0.15;
    _lutteMasque = new Uint8Array(N * N);
    _lutteVoisins = new Int16Array(N * N * 4);
    _lutteVoisins8 = new Int16Array(N * N * 8);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const dx = x - c, dy = y - c;
        _lutteMasque[y * N + x] = (dx * dx + dy * dy <= r * r) ? 1 : 0;
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x;
        const v = [x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1,
                   y > 0 ? i - N : -1, y < N - 1 ? i + N : -1];
        for (let k = 0; k < 4; k++) _lutteVoisins[i * 4 + k] = (v[k] >= 0 && _lutteMasque[v[k]]) ? v[k] : -1;
        /* Huit voisins pour la POUSSEE : a quatre, une tache s'etend en croix
           et finit carree. Les diagonales arrondissent le front. */
        let k8 = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy;
            const j = ny * N + nx;
            _lutteVoisins8[i * 8 + k8++] =
                (nx >= 0 && nx < N && ny >= 0 && ny < N && _lutteMasque[j]) ? j : -1;
        }
    }
}

/* La production d'un astre s'il appartenait a ce joueur-la. Meme formule que
   debitAstre, qui n'en est plus que le cas particulier du proprietaire. */
function debitPour(body, slot) {
    if (!body || slot === null || slot === undefined) return 0;
    if (body.panne > gameState.time) return 0;
    if (!(body.flore > 0)) return 0;
    const joueur = gameState.players[slot];
    if (!joueur || !joueur.stats) return 0;
    const sym = 1 + ((body.symbiosis || 0) / 100) * (body.type === 'planet' ? 0.20 : 0.10);
    /* Seuls comptent les nids qu'on tient : sur un astre partage, ceux de
       l'autre cote de la frontiere travaillent pour l'autre. */
    const nid = 1 + bonusBatiment(nbBatimentCamp(body, 'nid', campDe(body, slot)), 'nid');
    const soleil = body.type === 'planet' ? body.parent : (body.parent ? body.parent.parent : null);
    const sys = (soleil && isSystemComplete(soleil, slot)) ? 1.03 : 1;
    const part = 1 - Math.min((joueur.multiSacrifice || 0) / 100, 0.5);
    return Math.max(1, body.maxSpores) * TAUX_PROD
           * (0.4 + (body.flore / 100) * 0.6) * (1 + joueur.stats.growth * 0.3)
           * sym * nid * sys * part;
}

/* Des spores touchent un astre ennemi ou neutre : elles debarquent. */
/* OUVRIR UNE BATAILLE sur un astre qui n'en avait pas. Le defenseur y entre
   avec ses spores, versees dans la zone unique qui couvre alors tout le
   disque : sans ce versement, declencher un combat effacerait d'un coup la
   reserve de celui qu'on attaque. */
function naitreLutte(body) {
    if (body.lutte) return body.lutte;
    _luttePrepare();
    const N = LUTTE_N;
    const cel = new Uint8Array(N * N);
    for (let i = 0; i < cel.length; i++) cel[i] = _lutteMasque[i] ? 0 : LUTTE_VIDE;
    body.lutte = { cellules: cel, assaut: {}, acc: 0, canvas: null, ctx: null, sale: true };
    zonesRecalculer(body, body.lutte);
    const garnison = body.spores || 0;
    for (const id in body.lutte.zones) {
        if (body.lutte.zones[id].v === 0) body.lutte.zones[id].spores = garnison;
    }
    return body.lutte;
}

function engagerLutte(body, slot, spores, angle) {
    _luttePrepare();
    const N = LUTTE_N;
    naitreLutte(body);
    const L = body.lutte;
    const v = slot + 1;

    /* CHAQUE TIR OUVRE SON PROPRE FRONT, a l'endroit ou il touche. Deux
       attaques sur la meme planete ne grossissent donc pas la meme tache :
       elles en font deux, qui s'etalent chacune de leur cote et finiront par
       se rejoindre. Les spores ne renforcent une tache existante que si le
       tir retombe SUR du terrain deja tenu. */
    let tete = -1;
    const c = (N - 1) / 2;
    for (let k = 0; k <= N; k++) {
        const rr = (N / 2 - 1) - k;
        if (rr < 0) break;
        const bx = Math.round(c + Math.cos(angle) * rr);
        const by = Math.round(c + Math.sin(angle) * rr);
        const i = by * N + bx;
        if (bx >= 0 && bx < N && by >= 0 && by < N && _lutteMasque[i]) { tete = i; break; }
    }
    if (!L.zid) zonesRecalculer(body, L);
    if (tete >= 0 && L.cellules[tete] !== v) {
        L.cellules[tete] = v;
        L.zid[tete] = 0;              /* zone a naitre : le recalcul lui donnera un numero */
        L.sale = true;
    }
    /* Les spores vont a la ZONE touchee : c'est elle qui les depense pour
       acheter du sol. Un tir sur son propre terrain renforce la tache qui est
       dessous ; ailleurs, il en ouvre une nouvelle. */
    zonesRecalculer(body, L);
    const id = (tete >= 0) ? L.zid[tete] : 0;
    const z = L.zones[id];
    if (z) { z.spores += spores; z.elan = (z.elan || 0) + spores; }
    zonesAgreger(body, L);
    L.dormante = false;
}


