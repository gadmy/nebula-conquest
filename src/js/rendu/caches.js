// ─────────────────────────────────────────────
// PERFORMANCE — Caches offscreen (étoiles, clusters, halos)
// ─────────────────────────────────────────────

/* Le halo d'un soleil est un simple degrade radial. On le stockait a sa
   taille reelle a l'ecran : un carre de 1468 px pour un gros soleil, redessine
   a chaque image avec filtrage. C'etait le plus gros poste du rendu apres le
   fond. Un sprite fixe de 256 px agrandi au trace est indiscernable, et il est
   floute pour que le tramage du degrade ne ressorte pas en quadrillage une
   fois dessine sans filtrage (voir drawSuns). Le degrade est defini en
   proportions du sprite, donc le resultat ne depend plus du rayon du soleil. */
const _HALO_SOLEIL_PX = 384;

/* Les jets de la couronne, pour un sprite de halo de S px (le disque du
   soleil y fait un tiers du rayon). */
function _couronneSoleil(sun, S) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S), D = img.data;
    const C = _hexRgb(sun.color);
    const N = _bruitPerlin(99 + ((sun.name || '').charCodeAt(0) || 0));
    const h = S / 2, r0 = S / 2 / 3;
    const cr = Math.min(255, C[0] * 0.6 + 100), cg = Math.min(255, C[1] * 0.6 + 80), cb = Math.min(255, C[2] * 0.6 + 60);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const dx = i + 0.5 - h, dy = j + 0.5 - h, d = Math.sqrt(dx * dx + dy * dy) / r0;
        if (d < 0.9 || d > 2.2) continue;
        const a = Math.atan2(dy, dx), ca = Math.cos(a), sa = Math.sin(a);
        const jets = 0.5 + 0.5 * N(ca * 7, sa * 7, d * 0.8);
        const fil = Math.pow(0.5 + 0.5 * N(ca * 22, sa * 22, 3.3), 3);
        const v = Math.pow(Math.max(0, 2.2 - d) / 1.2, 2.2) * (0.35 + 0.9 * jets * jets + 0.6 * fil) * _lissePas(0.9, 1.02, d);
        const k = (j * S + i) * 4;
        D[k] = cr; D[k + 1] = cg; D[k + 2] = cb;
        D[k + 3] = Math.min(255, 255 * v * 0.5);
    }
    x.putImageData(img, 0, 0);
    return c;
}

function buildSunHaloCache() {
    for (const sun of gameState.suns) {
        const haloR = sun.radius * 3;
        const dim = _HALO_SOLEIL_PX;
        const brut = document.createElement('canvas');
        brut.width = brut.height = dim;
        const bctx = brut.getContext('2d');
        const cx = dim / 2, cy = dim / 2, rr = dim / 2;
        /* meme forme qu'avant : rayon interne = 0.3 / 3 = 0.1 du rayon du halo */
        const g = bctx.createRadialGradient(cx, cy, rr * 0.1, cx, cy, rr);
        g.addColorStop(0, sun.color + '50');
        g.addColorStop(0.5, sun.color + '15');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(cx, cy, rr, 0, Math.PI * 2);
        bctx.fill();

        /* La couronne : de longs jets de lumiere fins autour du disque,
           peints dans le halo (rien de plus a poser pendant la partie). En
           couche CSS, le halo tourne tres lentement (majHalosCss). */
        bctx.globalCompositeOperation = 'lighter';
        bctx.drawImage(_couronneSoleil(sun, dim), 0, 0);
        bctx.globalCompositeOperation = 'source-over';

        const c = document.createElement('canvas');
        c.width = c.height = dim;
        const ctx = c.getContext('2d');
        ctx.filter = 'blur(1px)';
        ctx.drawImage(brut, 0, 0);
        ctx.filter = 'none';

        sun._haloCache = c;
        sun._haloDim = dim;
        sun._haloR = haloR;
    }
    preparerHalosCss();
}


