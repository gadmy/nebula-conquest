// ─────────────────────────────────────────────
// DESSIN — Fond spatial (tuilé)
// ─────────────────────────────────────────────
/* ── LE FOND SPATIAL, SORTI DU CANEVAS ──────────────────────────────────
   Les deux couches de fond ne dependent que de la camera : ce sont deux
   images qui glissent et s'agrandissent, rien de plus. Les repeindre a
   chaque image coutait un tiers du temps de rendu pour un remplissage plein
   ecran qui n'apprend rien a personne. Confiees au compositeur, elles ne
   coutent plus rien : on ne fait que leur poser un transform, que le GPU
   applique sans repeindre quoi que ce soit.
   Le degre est un element canvas a lui, peint UNE FOIS ; les etoiles sont un
   motif repete par le CSS. Si quoi que ce soit echoue - pas de blob, pas
   d'element -, gameState._fondCss reste faux et l'ancien trace reprend. */
let _fondEls = null;

function preparerFondCss() {
    if (!gameState._bgCanvas || !gameState._starsCanvas) return;
    const deg = document.getElementById('fondDegrade');
    const eto = document.getElementById('fondEtoiles');
    const eto2 = document.getElementById('fondEtoiles2');
    const eto3 = document.getElementById('fondEtoiles3');
    if (!deg || !eto) return;
    const premier = !_fondEls;
    if (premier) _fondEls = { deg: deg, eto: eto, eto2: eto2, eto3: eto3, pret: false, pret2: false, pret3: false };

    /* Le degrade : on recopie le canevas hors-ecran dans l'element. Refait a
       chaque generation, au cas ou le fond changerait d'une partie a l'autre. */
    try {
        const c = deg.getContext('2d');
        c.clearRect(0, 0, deg.width, deg.height);
        c.drawImage(gameState._bgCanvas, 0, 0, deg.width, deg.height);
    } catch (e) { _fondEls = null; return; }
    if (!premier) return;

    /* Les etoiles : un motif, donc une image que le CSS repete. Le blob evite
       le base64 d'un toDataURL, et l'encodage n'a lieu qu'une fois. */
    try {
        gameState._starsCanvas.toBlob(function (bl) {
            if (!bl || !_fondEls) return;
            if (gameState._starsUrl) URL.revokeObjectURL(gameState._starsUrl);
            gameState._starsUrl = URL.createObjectURL(bl);
            eto.style.backgroundImage = 'url(' + gameState._starsUrl + ')';
            _fondEls.pret = true;
            gameState._fondCss = true;
            majFondCss();
        }, 'image/png');
        /* La couche proche : meme chemin. Si elle manque, la lointaine
           suffit - le fond reste juste, sans parallaxe. */
        if (eto2 && gameState._starsCanvas2) {
            gameState._starsCanvas2.toBlob(function (bl) {
                if (!bl || !_fondEls) return;
                if (gameState._starsUrl2) URL.revokeObjectURL(gameState._starsUrl2);
                gameState._starsUrl2 = URL.createObjectURL(bl);
                eto2.style.backgroundImage = 'url(' + gameState._starsUrl2 + ')';
                _fondEls.pret2 = true;
                majFondCss();
            }, 'image/png');
        }
        if (eto3 && gameState._starsCanvas3) {
            gameState._starsCanvas3.toBlob(function (bl) {
                if (!bl || !_fondEls) return;
                if (gameState._starsUrl3) URL.revokeObjectURL(gameState._starsUrl3);
                gameState._starsUrl3 = URL.createObjectURL(bl);
                eto3.style.backgroundImage = 'url(' + gameState._starsUrl3 + ')';
                _fondEls.pret3 = true;
                majFondCss();
            }, 'image/png');
        }
    } catch (e) { _fondEls = null; }
}

function montrerFondCss(oui) {
    if (!_fondEls) return;
    const v = (oui && gameState._fondCss) ? 'block' : 'none';
    _fondEls.deg.style.display = v;
    _fondEls.eto.style.display = v;
    if (_fondEls.eto2) _fondEls.eto2.style.display = v;
    if (_fondEls.eto3) _fondEls.eto3.style.display = v;
    if (_halosEl) _halosEl.style.display = v;
}

/* LES HALOS DES SOLEILS SORTENT DU CANEVAS. Un halo est un grand carre
   transparent - trois fois le rayon du soleil - que le canevas devait
   remplir a chaque image : le gros de drawSuns en zoom fort. Comme le fond,
   il ne depend que de la camera : le sprite du halo est pose tel quel dans
   la page, et le compositeur le deplace et l'agrandit. Il passe donc SOUS
   le canevas, et avec lui sous les frontieres, les cometes et le trou noir,
   qui se dessinaient avant lui. Tant que le fond n'est pas en CSS, rien ne
   change : drawSuns continue de le peindre. */
let _halosEl = null;

function preparerHalosCss() {
    _halosEl = _halosEl || document.getElementById('halosSoleils');
    if (!_halosEl) return;
    _halosEl.textContent = '';   // les halos d'une carte precedente
    for (const sun of gameState.suns) {
        if (sun._haloCache) _halosEl.appendChild(sun._haloCache);
    }
}

function halosEnCss(sun) {
    return gameState._fondCss && _halosEl && sun._haloCache &&
           sun._haloCache.parentNode === _halosEl;
}

function majHalosCss() {
    if (!gameState._fondCss || !_halosEl) return;
    const cam = gameState.camera, z = cam.zoom;
    const W = gameState.width, H = gameState.height;
    for (const sun of gameState.suns) {
        if (!halosEnCss(sun)) continue;
        const el = sun._haloCache;
        const r = sun._haloR;
        const sx = (sun.x - r - cam.x) * z + W / 2;
        const sy = (sun.y - r - cam.y) * z + H / 2;
        const d = 2 * r * z;
        /* Hors de l'ecran : on le retire, le compositeur n'a pas a s'en
           occuper. */
        const vu = sx < W && sy < H && sx + d > 0 && sy + d > 0;
        const aff = vu ? '' : 'none';
        if (el.style.display !== aff) el.style.display = aff;
        if (!vu) continue;
        /* La couronne tourne tres lentement autour du centre du soleil. */
        const w2 = el.width / 2, rot = ((gameState.time || 0) * 0.6) % 360;
        el.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' +
            sy.toFixed(1) + 'px,0) scale(' + (d / el.width).toFixed(4) + ') translate(' + w2 + 'px,' + w2 + 'px) rotate(' +
            rot.toFixed(2) + 'deg) translate(' + (-w2) + 'px,' + (-w2) + 'px)';
    }
}

function majFondCss() {
    if (!gameState._fondCss || !_fondEls || !_fondEls.pret) return;
    const cam = gameState.camera, z = cam.zoom;
    const W = gameState.width, H = gameState.height;

    /* Le degrade couvre 60000 unites de monde. Son coin haut-gauche tombe a
       l'ecran la, et il faut l'agrandir d'autant : exactement ce que faisait
       le drawImage d'avant. */
    const bgS = 60000;
    const wx = -bgS / 2 + cam.x * 0.02;
    const wy = -bgS / 2 + cam.y * 0.02;
    const sx = (wx - cam.x) * z + W / 2;
    const sy = (wy - cam.y) * z + H / 2;
    const k = (bgS * z) / 2048;
    _fondEls.deg.style.transform =
        'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';

    /* Les etoiles glissent en repere ecran, d'une tuile au plus. La couche
       fait donc un ecran PLUS une tuile, et on la recule d'autant. */
    const T = 2048, prlx = 0.15;
    let ox = (-cam.x * prlx * z) % T;
    let oy = (-cam.y * prlx * z) % T;
    if (ox > 0) ox -= T;
    if (oy > 0) oy -= T;
    const e = _fondEls.eto;
    const lw = (W + T) + 'px', lh = (H + T) + 'px';
    if (e.style.width !== lw) { e.style.width = lw; e.style.height = lh; }
    e.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';

    /* Les etoiles proches : presque trois fois plus rapides (0,4 contre
       0,15), et un leger grossissement qui suit le zoom (de 0,75 a 1,5) -
       c'est l'ecart entre les deux couches qui donne la profondeur. */
    if (_fondEls.pret2) _placerCoucheEtoiles(_fondEls.eto2, 1536, 0.4, Math.max(0.75, Math.min(1.5, Math.pow(z, 0.3))));
    /* La troisieme, la plus proche : 0,85 et un grossissement franc (0,6 a
       2,2). */
    if (_fondEls.pret3) _placerCoucheEtoiles(_fondEls.eto3, 1024, 0.85, Math.max(0.6, Math.min(2.2, Math.pow(z, 0.5))));
}

/* Pose une couche d'etoiles repetee : tuile de T px, defilement prlx x
   camera x zoom, agrandie de s. La couche couvre un ecran plus une tuile. */
function _placerCoucheEtoiles(el, T, prlx, s) {
    if (!el) return;
    const cam = gameState.camera, z = cam.zoom;
    const W = gameState.width, H = gameState.height;
    const Ts = T * s;
    let ox = (-cam.x * prlx * z) % Ts;
    let oy = (-cam.y * prlx * z) % Ts;
    if (ox > 0) ox -= Ts;
    if (oy > 0) oy -= Ts;
    const lw = Math.ceil((W + Ts) / s) + 'px', lh = Math.ceil((H + Ts) / s) + 'px';
    if (el.style.width !== lw) el.style.width = lw;
    if (el.style.height !== lh) el.style.height = lh;
    el.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
}

function drawBackground(ctx) {
    /* Les couches CSS s'en chargent : plus rien a peindre ici. */
    if (gameState._fondCss) return;
    const cam = gameState.camera;
    // Le fond est enorme a l'ecran (le degrade couvre 60000 unites, les tuiles
    // d'etoiles 8000). Le filtrage bilineaire sur un agrandissement pareil
    // coute une lecture de quatre texels par pixel d'ecran, sur tout l'ecran,
    // a chaque image : c'etait la moitie du temps de rendu. En nearest le
    // degrade ne bouge pas (3/255 d'ecart au pire) et les etoiles restent nettes.
    const _lissage = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    // Fond bleu dégradé (parallaxe très lente, couvre tout)
    if (gameState._bgCanvas) {
        const bgS = 60000;
        const px = -bgS / 2 + cam.x * 0.02;
        const py = -bgS / 2 + cam.y * 0.02;
        ctx.drawImage(gameState._bgCanvas, px, py, bgS, bgS);
    }
    ctx.imageSmoothingEnabled = _lissage;

    /* Etoiles : couche lointaine, dessinee en REPERE ECRAN a l'echelle 1:1.
       Avant, la tuile de 2048 px etait etiree sur 8000 unites de monde, donc
       agrandie de 4 fois le zoom : floue et couteuse avec filtrage, carree
       sans filtrage. A 1:1 le probleme disparait des deux cotes, les etoiles
       restent des points nets a tous les zooms et le tuilage descend a quatre
       images au plus. Contrepartie assumee : les etoiles ne grossissent plus
       quand on zoome - ce sont des etoiles lointaines, elles ne devraient pas.
       Le defilement de parallaxe reste identique : 0,15 x camera x zoom. */
    if (gameState._starsCanvas) {
        const st = gameState._starsCanvas;
        const e = echelleRendu();
        const W = gameState.width, H = gameState.height;
        const prlx = 0.15;
        let ox = (-cam.x * prlx * cam.zoom) % st.width;
        let oy = (-cam.y * prlx * cam.zoom) % st.height;
        if (ox > 0) ox -= st.width;
        if (oy > 0) oy -= st.height;
        ctx.save();
        ctx.setTransform(e, 0, 0, e, 0, 0);
        ctx.imageSmoothingEnabled = false;
        for (let x = ox; x < W; x += st.width) {
            for (let y = oy; y < H; y += st.height) {
                ctx.drawImage(st, x, y);
            }
        }
        /* Repli : les couches proches, sans le grossissement (voir majFondCss). */
        for (const [stk, pk] of [[gameState._starsCanvas2, 0.4], [gameState._starsCanvas3, 0.85]]) {
            if (!stk) continue;
            let ox2 = (-cam.x * pk * cam.zoom) % stk.width;
            let oy2 = (-cam.y * pk * cam.zoom) % stk.height;
            if (ox2 > 0) ox2 -= stk.width;
            if (oy2 > 0) oy2 -= stk.height;
            for (let x = ox2; x < W; x += stk.width) {
                for (let y = oy2; y < H; y += stk.height) ctx.drawImage(stk, x, y);
            }
        }
        ctx.restore();
    }
}



