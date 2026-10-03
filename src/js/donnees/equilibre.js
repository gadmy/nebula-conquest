/* ─────────────────────────────────────────────
   L'EQUILIBRE DES SYSTEMES SOLAIRES
   Sur une carte, chaque systeme solaire doit valoir a peu pres autant que
   les autres : le meilleur au plus 20 % au-dessus du moins bon, en
   production comme en faune.
   - PRODUCTION d'un systeme : la somme, sur ses planetes et ses lunes, de
     taille x 50 (la capacite) x (0,4 + 0,6 x flore / 100) - le debit du jeu
     (production.js) a un facteur commun pres. Un astre sans flore ne produit
     rien.
   - FAUNE d'un systeme : la somme des faunes de ses astres (la defense des
     astres neutres).
   equilibrerSystemes ramene chaque systeme dans une bande de +/- 8 % autour
   de la mediane de la carte (donc 17 % au plus entre le meilleur et le moins
   bon), en changeant seulement la flore et la faune de ses astres, dans les
   memes proportions entre eux. Les astres ne bougent pas. Une flore peut
   depasser 100 (un petit systeme face a de gros) : jusqu'a FLORE_MAX.
   Sert a l'editeur (bouton EQUILIBRER) et a ete passe une fois sur toutes
   les cartes de la bibliotheque (3 octobre 2026).
   ───────────────────────────────────────────── */
const EQUILIBRE_BANDE = 0.08;
const FLORE_MAX = 500, FAUNE_MAX = 1000;

function _corpsSysteme(sun) {
    const l = [];
    for (const p of (sun.planets || [])) {
        l.push(p);
        for (const m of (p.moons || [])) l.push(m);
    }
    return l;
}
function productionSysteme(sun) {
    let t = 0;
    for (const b of _corpsSysteme(sun)) if (b.flore > 0) t += b.radius * 50 * (0.4 + 0.6 * b.flore / 100);
    return t;
}
function fauneSysteme(sun) {
    let t = 0;
    for (const b of _corpsSysteme(sun)) t += b.faune || 0;
    return t;
}
function _mediane(a) {
    const s = a.slice().sort(function (x, y) { return x - y; });
    const n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
/* L'ecart entre le meilleur et le moins bon systeme : 1,2 = 20 %. */
function ecartSystemes(suns) {
    const sys = (suns || []).filter(function (s) { return _corpsSysteme(s).length; });
    if (sys.length < 2) return { production: 1, faune: 1 };
    const P = sys.map(productionSysteme), F = sys.map(fauneSysteme);
    const r = function (a) { const mi = Math.min.apply(null, a); return mi > 0 ? Math.max.apply(null, a) / mi : Infinity; };
    return { production: r(P), faune: r(F) };
}

function equilibrerSystemes(suns) {
    const sys = (suns || []).filter(function (s) { return _corpsSysteme(s).length; });
    if (sys.length < 2) return ecartSystemes(suns);
    /* Deux passes : les arrondis et les plafonds deplacent un peu la mediane. */
    for (let passe = 0; passe < 3; passe++) {
        const P = sys.map(productionSysteme);
        /* Le centre de la bande : la mediane, deplacee si un systeme ne peut
           pas l'atteindre (trop petit meme a FLORE_MAX, trop gros meme a 1). */
        const borne = function (s, f) { let t = 0; for (const b of _corpsSysteme(s)) t += b.radius * 50 * (0.4 + 0.6 * f / 100); return t; };
        let lo = 0, hi = Infinity;
        for (const s of sys) {
            lo = Math.max(lo, borne(s, 1) / (1 + EQUILIBRE_BANDE));
            hi = Math.min(hi, borne(s, FLORE_MAX) / (1 - EQUILIBRE_BANDE));
        }
        let med = _mediane(P);
        med = lo <= hi ? Math.max(lo, Math.min(hi, med)) : Math.sqrt(lo * hi);
        sys.forEach(function (s, i) {
            const cible = Math.min(med * (1 + EQUILIBRE_BANDE), Math.max(med * (1 - EQUILIBRE_BANDE), P[i]));
            if (Math.abs(cible - P[i]) < 1) return;
            const corps = _corpsSysteme(s);
            let base = 0, partFlore = 0, unite = 0;
            for (const b of corps) {
                base += b.radius * 50 * 0.4;
                partFlore += b.radius * 50 * 0.6 * Math.max(1, b.flore || 0) / 100;
                unite += b.radius * 50 * 0.6 / 100;
            }
            const besoin = cible - base;
            for (const b of corps) {
                let f;
                if (besoin <= unite) f = 1;
                else if (partFlore > 0) f = Math.max(1, b.flore || 0) * besoin / partFlore;
                else f = besoin / unite;
                b.flore = Math.max(1, Math.min(FLORE_MAX, Math.round(f)));
            }
        });
        const F = sys.map(fauneSysteme), medF = _mediane(F);
        sys.forEach(function (s, i) {
            const cible = Math.min(medF * (1 + EQUILIBRE_BANDE), Math.max(medF * (1 - EQUILIBRE_BANDE), F[i]));
            if (Math.abs(cible - F[i]) < 1) return;
            const corps = _corpsSysteme(s);
            const k = F[i] > 0 ? cible / F[i] : 0;
            for (const b of corps) {
                const f = F[i] > 0 ? (b.faune || 0) * k : cible / corps.length;
                b.faune = Math.max(0, Math.min(FAUNE_MAX, Math.round(f)));
            }
        });
    }
    return ecartSystemes(suns);
}
