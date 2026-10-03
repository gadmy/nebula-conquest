/* ─────────────────────────────────────────────
   EMPREINTE DE L'ETAT (preparation du lockstep)
   Un nombre qui resume toute la partie : astres, luttes au sol, batiments,
   tirs en vol, joueurs, vaisseaux, cometes. Deux navigateurs qui calculent
   la meme partie doivent trouver le meme a chaque tour ; le premier tour ou
   ils different montre ou la partie s'est desynchronisee.
   Le decor (etincelles, lasers, ondes...) n'y entre pas : il a le droit
   d'etre different d'un ecran a l'autre. Les champs en _ non plus (caches,
   textures, etat d'affichage).
   detail = true rend une empreinte par famille, pour chercher le coupable.
   ───────────────────────────────────────────── */
const _empF64 = new Float64Array(1), _empU32 = new Uint32Array(_empF64.buffer);
/* Le code de chaque nom de champ, calcule une fois. */
const _empCles = new Map();
function empreinteEtat(detail) {
    /* On melange directement les valeurs dans l'empreinte, sans fabriquer
       de texte : un nombre y entre par ses 64 bits (deux nombres egaux ont
       les memes bits ; 0 et -0, NaN, sont ramenes a un seul code). Trois
       fois plus rapide qu'avant, ou toute la partie etait d'abord ecrite en
       un long texte. Les cles restent triees : l'ordre ne depend pas de
       l'histoire des objets (une partie reprise apres reconnexion a les
       memes). */
    let h = 0;
    const melanger = function (s) {
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    };
    const entier = function (x) { h ^= x; h = Math.imul(h, 16777619); };
    const f64 = _empF64, u32 = _empU32;
    const valeur = function (v, t) {
        if (t === 'number') {
            if (v === 0 || v !== v) entier(v === 0 ? 0x30 : 0x4E);
            else { f64[0] = v; entier(u32[0]); entier(u32[1]); }
        } else if (t === 'boolean') entier(v ? 0x74 : 0x66);
        else if (v === null) entier(0x6E);
        else melanger(v);
        entier(0x3B);
    };
    /* Propres a chaque ecran, donc differents d'un joueur a l'autre sans que
       la partie le soit : qui est "moi", le tir qu'on a clique. */
    const LOCAUX = { isLocal: 1, selected: 1 };
    const simples = function (o) {
        if (!o) return;
        const cles = Object.keys(o).sort();
        for (let i = 0; i < cles.length; i++) {
            const k = cles[i];
            if (k[0] === '_' || LOCAUX[k]) continue;
            const v = o[k], t = typeof v;
            if (t === 'number' || t === 'string' || t === 'boolean' || v === null) {
                let ck = _empCles.get(k);
                if (ck === undefined) {
                    ck = 0x811c9dc5;
                    for (let j = 0; j < k.length; j++) { ck ^= k.charCodeAt(j); ck = Math.imul(ck, 16777619); }
                    _empCles.set(k, ck);
                }
                entier(ck);
                valeur(v, t);
            }
        }
    };
    const familles = {
        astres: function (b) {
            simples(b);
            for (const e of (b.edifices || [])) { entier(0x5B); simples(e); entier(0x5D); }
            if (b.lutte) {
                entier(0x7C);
                const cel = b.lutte.cellules;
                if (cel instanceof Uint8Array && !(cel.byteOffset & 3) && !(cel.length & 3)) {
                    /* Les cases quatre par quatre. */
                    const w = new Uint32Array(cel.buffer, cel.byteOffset, cel.length >> 2);
                    for (let i = 0; i < w.length; i++) { h ^= w[i]; h = Math.imul(h, 16777619); }
                } else if (cel) {
                    /* Meme calcul pour un simple tableau : quatre cases par mot. */
                    for (let i = 0; i < cel.length; i += 4) {
                        h ^= ((cel[i] | 0) | ((cel[i + 1] | 0) << 8) | ((cel[i + 2] | 0) << 16) | ((cel[i + 3] | 0) << 24));
                        h = Math.imul(h, 16777619);
                    }
                }
                entier(0x7C);
                simples(b.lutte.assaut);
            }
        },
        jets: simples,
        joueurs: function (p) {
            simples(p); simples(p.stats); simples(p.tech); simples(p.nidification); simples(p.attaquesRecues);
        },
        vaisseaux: simples,
        cometes: simples,
        capitaux: function (C) { simples(C); melanger((C.apports || []).join('|') + '/' + (C.ignore || []).join(',')); },
        commerces: simples,
        orbes: simples,
        propositions: simples,
        /* Les anneaux des soleils (systeme solaire complet) : leur charge. */
        anneaux: function (s) { if (s.anneau) { melanger(s.name); simples(s.anneau); } },
    };
    const listes = {
        astres: gameState.allBodies, jets: gameState.jets, joueurs: gameState.players,
        vaisseaux: gameState.cleaners, cometes: gameState.comets, capitaux: gameState.capitaux,
        commerces: gameState.commerces, orbes: gameState.orbesCommerce, propositions: gameState.propositions,
        anneaux: gameState.suns,
    };
    const parts = {};
    let total = 0x811c9dc5;
    for (const nom in familles) {
        h = 0x811c9dc5;
        for (const x of (listes[nom] || [])) { familles[nom](x); entier(0x0A); }
        parts[nom] = (h >>> 0).toString(16);
        total = Math.imul(total ^ h, 16777619);
    }
    h = total; melanger('t=' + gameState.time);
    const empreinte = (h >>> 0).toString(16);
    return detail ? { empreinte: empreinte, parts: parts } : empreinte;
}


