// ─────────────────────────────────────────────
// FOND SPATIAL (pré-rendu sur canvas hors-écran)
// ─────────────────────────────────────────────
function nebuleuseFond(S) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S), D = img.data;
    const N = _bruitPerlin(42), N2 = _bruitPerlin(4343);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const u = i / S * 2.6, v = j / S * 2.6;
        const w = N.fbm(u * 0.8, v * 0.8, 1.3, 3) * 1.2;
        const n1 = N.fbm(u + w, v - w, 0.5, 5);               /* voiles violets */
        const n2 = N2.fbm(u * 1.2 - w, v * 1.2, 2.5, 5);      /* voiles bleus */
        const pous = _lissePas(0.55, 0.8, N2.cretes(u * 1.4 + w, v * 1.4, 4.1, 3));
        const a1 = _lissePas(0.0, 0.5, n1), a2 = _lissePas(-0.05, 0.45, n2);
        const r = 14 + 28 * a1 * a1 + 5 * a2, g = 28 + 6 * a1 + 18 * a2 * a2, b = 60 + 24 * a1 + 28 * a2;
        const k = 1 - pous * 0.22;
        const q = (j * S + i) * 4;
        D[q] = r * k; D[q + 1] = g * k; D[q + 2] = b * k; D[q + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
}

function generateBackground() {
    const rng = mulberry32(42);
    // ══ Fond bleu dégradé (canvas offscreen) ══
    const bgW = 2048, bgH = 2048;
    const bgC = document.createElement('canvas');
    bgC.width = bgW; bgC.height = bgH;
    const bgCtx = bgC.getContext('2d');
    /* Une nebuleuse discrete : de grands voiles violets et bleus, a peine
       plus clairs que le bleu nuit, et des filaments de poussiere un peu
       plus sombres. Peinte petit (224 px) puis agrandie : ce fond est de
       toute facon etire sur 60 000 unites, seuls les grands nuages se voient. */
    bgCtx.imageSmoothingEnabled = true;
    bgCtx.imageSmoothingQuality = 'high';
    bgCtx.drawImage(nebuleuseFond(224), 0, 0, bgW, bgH);
    /* Le degrade et les taches sont trames par le navigateur : un bruit d'un
       ou deux niveaux, invisible a l'echelle 1. Mais ce canvas est etire d'un
       facteur 10 a 30 a l'ecran, et comme on l'affiche sans filtrage (voir
       drawBackground) ce bruit deviendrait un quadrillage visible. Un flou
       d'un coup, ici, l'efface : le fond obtenu est meme plus lisse qu'avant. */
    const bgFlou = document.createElement('canvas');
    bgFlou.width = bgW; bgFlou.height = bgH;
    const bgFctx = bgFlou.getContext('2d');
    bgFctx.filter = 'blur(2px)';
    bgFctx.drawImage(bgC, 0, 0);
    bgFctx.filter = 'none';
    gameState._bgCanvas = bgFlou;

    // ══ Étoiles (canvas offscreen tuilable) ══
    const stW = 2048, stH = 2048;
    const stC = document.createElement('canvas');
    stC.width = stW; stC.height = stH;
    const stCtx = stC.getContext('2d');
    const starColors = ['255,255,255','220,230,255','200,210,240','255,240,220','180,200,255'];
    const starsCount = 3000;
    for (let i = 0; i < starsCount; i++) {
        const sx = rng() * stW;
        const sy = rng() * stH;
        const sr = rng() * 1.3 + 0.3;
        const sa = rng() * 0.6 + 0.2;
        const sc = starColors[Math.floor(rng() * starColors.length)];
        stCtx.fillStyle = `rgba(${sc}, ${sa})`;
        stCtx.beginPath();
        stCtx.arc(sx, sy, sr, 0, Math.PI * 2);
        stCtx.fill();
        // Quelques étoiles plus brillantes avec halo
        if (rng() > 0.95) {
            const gh = stCtx.createRadialGradient(sx, sy, 0, sx, sy, sr * 4);
            gh.addColorStop(0, `rgba(${sc}, 0.3)`);
            gh.addColorStop(1, 'rgba(0,0,0,0)');
            stCtx.fillStyle = gh;
            stCtx.beginPath();
            stCtx.arc(sx, sy, sr * 4, 0, Math.PI * 2);
            stCtx.fill();
        }
    }
    gameState._starsCanvas = stC;

    /* ══ Etoiles proches : la seconde couche de la parallaxe ══
       Moins nombreuses, plus grosses et plus vives, quelques-unes avec un
       eclat en croix. Elles defilent plus vite que les lointaines et
       grossissent un peu au zoom : le fond prend de la profondeur. Un tirage
       a part, pour ne rien changer au reste du decor. */
    const rng2 = mulberry32(4242);
    const st2 = 1536;
    const stC2 = document.createElement('canvas');
    stC2.width = st2; stC2.height = st2;
    const st2Ctx = stC2.getContext('2d');
    for (let i = 0; i < 260; i++) {
        const sx = rng2() * st2, sy = rng2() * st2;
        const sr = rng2() * 1.4 + 0.9;
        const sa = rng2() * 0.45 + 0.45;
        const sc = starColors[Math.floor(rng2() * starColors.length)];
        const gh = st2Ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
        gh.addColorStop(0, `rgba(${sc}, ${sa * 0.35})`);
        gh.addColorStop(1, 'rgba(0,0,0,0)');
        st2Ctx.fillStyle = gh;
        st2Ctx.beginPath();
        st2Ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2);
        st2Ctx.fill();
        st2Ctx.fillStyle = `rgba(${sc}, ${sa})`;
        st2Ctx.beginPath();
        st2Ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        st2Ctx.fill();
        if (rng2() > 0.88) {
            /* Eclat en croix, fin et pale. */
            const l = sr * (5 + rng2() * 5);
            st2Ctx.strokeStyle = `rgba(${sc}, ${sa * 0.45})`;
            st2Ctx.lineWidth = 0.7;
            st2Ctx.beginPath();
            st2Ctx.moveTo(sx - l, sy); st2Ctx.lineTo(sx + l, sy);
            st2Ctx.moveTo(sx, sy - l); st2Ctx.lineTo(sx, sy + l);
            st2Ctx.stroke();
        }
    }
    gameState._starsCanvas2 = stC2;

    /* ══ Troisieme couche : le tout premier plan du fond ══
       Rare et doux : une quarantaine de grosses etoiles floues et quelques
       voiles de poussiere a peine colores. Elle file vite et grossit
       franchement au zoom : c'est elle qui fait sentir la profondeur. */
    const rng3 = mulberry32(777);
    const st3 = 1024;
    const stC3 = document.createElement('canvas');
    stC3.width = st3; stC3.height = st3;
    const st3Ctx = stC3.getContext('2d');
    const voiles = ['150,110,255', '90,150,255', '255,140,200'];
    for (let i = 0; i < 6; i++) {
        const vx = rng3() * st3, vy = rng3() * st3, vr = 60 + rng3() * 90;
        const vc = voiles[Math.floor(rng3() * voiles.length)];
        const gv = st3Ctx.createRadialGradient(vx, vy, 0, vx, vy, vr);
        gv.addColorStop(0, `rgba(${vc}, ${0.035 + rng3() * 0.025})`);
        gv.addColorStop(1, 'rgba(0,0,0,0)');
        st3Ctx.fillStyle = gv;
        st3Ctx.beginPath();
        st3Ctx.arc(vx, vy, vr, 0, Math.PI * 2);
        st3Ctx.fill();
    }
    for (let i = 0; i < 42; i++) {
        const sx = rng3() * st3, sy = rng3() * st3;
        const sr = 1.6 + rng3() * 1.8;
        const sa = 0.5 + rng3() * 0.4;
        const sc = starColors[Math.floor(rng3() * starColors.length)];
        const gh = st3Ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
        gh.addColorStop(0, `rgba(${sc}, ${sa * 0.4})`);
        gh.addColorStop(1, 'rgba(0,0,0,0)');
        st3Ctx.fillStyle = gh;
        st3Ctx.beginPath();
        st3Ctx.arc(sx, sy, sr * 5, 0, Math.PI * 2);
        st3Ctx.fill();
        st3Ctx.fillStyle = `rgba(${sc}, ${sa})`;
        st3Ctx.beginPath();
        st3Ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        st3Ctx.fill();
    }
    gameState._starsCanvas3 = stC3;

    // ══ Particules ambiantes (poussière cosmique) — on garde ══
    gameState.cosmicDust = [];
    const rng4 = mulberry32(55);
    for (let i = 0; i < 40; i++) {
        gameState.cosmicDust.push({
            x: (rng4() - 0.5) * 15000,
            y: (rng4() - 0.5) * 15000,
            vx: (rng4() - 0.5) * 3,
            vy: (rng4() - 0.5) * 3,
            size: rng4() * 2 + 0.5,
            alpha: rng4() * 0.12 + 0.03,
            phase: rng4() * Math.PI * 2
        });
    }
}


