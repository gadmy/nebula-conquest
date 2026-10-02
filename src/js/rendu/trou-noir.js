// ─────────────────────────────────────────────
// DESSIN — Trou noir
// ─────────────────────────────────────────────
/* Vrai si un disque de centre (x,y) et de rayon r touche l'ecran. Six
   fonctions de dessin n'avaient aucun controle de ce genre et peignaient
   meme quand leur sujet etait loin derriere le bord. */
function aLEcran(x, y, r) {
    const cam = gameState.camera;
    const hw = gameState.width / 2 / cam.zoom + r;
    const hh = gameState.height / 2 / cam.zoom + r;
    return x >= cam.x - hw && x <= cam.x + hw && y >= cam.y - hh && y <= cam.y + hh;
}

/* LE DISQUE D'ACCRETION, peint une fois : vu de biais, blanc et chaud pres
   de l'horizon, violet vers l'exterieur, un cote plus brillant (il vient
   vers nous). L'arriere du disque, devie par la gravite, passe au-dessus du
   trou (comme dans Interstellar), et un fil de lumiere cerne l'horizon.
   Deux images aux stries decalees (phase) se fondent l'une dans l'autre :
   le disque semble tourbillonner. Le sprite couvre 3,5 rayons de chaque cote. */
const _TN_ETENDUE = 3.5;
function disqueTrouNoir(S, phase) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S), D = img.data;
    const N = _bruitPerlin(2024);
    const h = S / 2, R = S / 2 / _TN_ETENDUE;
    const incl = 0.28;
    const chaud = [236, 226, 255], moyen = [170, 110, 255], froid = [80, 30, 150];
    const col = [0, 0, 0];
    const couleur = function (u) {
        const A = u < 0.35 ? chaud : moyen, B = u < 0.35 ? moyen : froid, t = u < 0.35 ? u / 0.35 : (u - 0.35) / 0.65;
        col[0] = A[0] + (B[0] - A[0]) * t; col[1] = A[1] + (B[1] - A[1]) * t; col[2] = A[2] + (B[2] - A[2]) * t;
    };
    const rIn = 1.5, rOut = 3.3;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const X = (i + 0.5 - h) / R, Y = (j + 0.5 - h) / R;
        const d = Math.sqrt(X * X + Y * Y);
        let rr = 0, gg = 0, bb = 0, aa = 0;
        const rd = Math.sqrt(X * X + (Y / incl) * (Y / incl));
        /* Derriere le trou, le disque est cache (avec un bord doux). */
        const cache = Y > 0 ? 1 : _lissePas(1.0, 1.1, d);
        if (rd > rIn && rd < rOut && cache > 0) {
            const u = (rd - rIn) / (rOut - rIn);
            const ang = Math.atan2(Y / incl, X) + phase;
            const stries = 0.6 + 0.4 * N(rd * 6, Math.cos(ang) * 1.5, Math.sin(ang) * 1.5) + 0.25 * N(rd * 18, Math.cos(ang) * 3, Math.sin(ang) * 3);
            const dop = 1 + 0.4 * Math.cos(ang - phase);
            const e = cache * 1.25 * Math.pow(1 - u, 0.9) * stries * dop * _lissePas(rIn, rIn + 0.15, rd) * _lissePas(rOut, rOut - 0.7, rd);
            couleur(u);
            rr += col[0] * e; gg += col[1] * e; bb += col[2] * e; aa = Math.max(aa, Math.min(1, e));
        }
        if (d > 1.02) {
            for (let k = 0; k < 2; k++) {
                const ra = k ? 1.16 : 1.42, larg = k ? 0.18 : 0.7, cote = k ? 1 : -1;
                /* Chaque arc s'efface en douceur vers l'horizontale. */
                const fond = _lissePas(-0.1, 0.45, Y * cote);
                if (fond <= 0) continue;
                const e0 = Math.abs(d - ra) / (larg * 0.5);
                if (e0 > 1) continue;
                const ang = Math.atan2(Y, X);
                const e = fond * (1 - e0 * e0) * 1.1 * (1 + 0.35 * Math.cos(ang)) * (0.7 + 0.3 * N(d * 10, Math.cos(ang + phase) * 3, Math.sin(ang + phase) * 3)) * (k ? 0.6 : 1);
                couleur(0.15 + e0 * 0.3);
                rr += col[0] * e; gg += col[1] * e; bb += col[2] * e; aa = Math.max(aa, Math.min(1, e));
            }
        }
        const ph = Math.exp(-Math.pow((d - 1.04) / 0.018, 2)) * 0.9 + Math.exp(-Math.pow((d - 1.08) / 0.08, 2)) * 0.25;
        rr += 255 * ph; gg += 240 * ph; bb += 230 * ph; aa = Math.max(aa, Math.min(1, ph));
        if (aa <= 0.003) continue;
        const q = (j * S + i) * 4;
        D[q] = Math.min(255, rr); D[q + 1] = Math.min(255, gg); D[q + 2] = Math.min(255, bb); D[q + 3] = 255 * Math.min(1, aa);
    }
    x.putImageData(img, 0, 0);
    return c;
}
/* Les deux images du disque, faites au chargement (pas a la premiere image). */
function preparerTrouNoir() {
    const bh = gameState.blackHole;
    if (!bh || bh._disques) return;
    bh._disques = [disqueTrouNoir(640, 0), disqueTrouNoir(640, 0.9)];
}

function drawBlackHole(ctx) {
    const bh = gameState.blackHole;
    if (!bh) return;
    if (!aLEcran(bh.x, bh.y, Math.max(bh.dangerZone, bh.radius * _TN_ETENDUE))) return;
    const t = gameState.time;
    const bhLod = gameState.lod;

    /* Zone de danger. Le degrade etait en cache, mais il restait etale sur un
       disque enorme a chaque image, avec filtrage : c'est le meme cout de
       remplissage que le fond et les halos de soleil. Meme remede : le
       degrade est cuit une fois dans un petit sprite, floute pour que son
       tramage ne ressorte pas, puis pose sans filtrage. */
    if (!bh._spriteDanger) {
        const SPR = 256, R = SPR / 2;
        const brut = document.createElement('canvas');
        brut.width = brut.height = SPR;
        const bx = brut.getContext('2d');
        const g = bx.createRadialGradient(R, R, R * (bh.radius / bh.dangerZone), R, R, R);
        g.addColorStop(0, 'rgba(100, 40, 180, 0.25)');
        g.addColorStop(0.5, 'rgba(60, 20, 120, 0.1)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bx.fillStyle = g;
        bx.beginPath();
        bx.arc(R, R, R, 0, Math.PI * 2);
        bx.fill();
        const fin = document.createElement('canvas');
        fin.width = fin.height = SPR;
        const fx = fin.getContext('2d');
        fx.filter = 'blur(2px)';
        fx.drawImage(brut, 0, 0);
        fx.filter = 'none';
        bh._spriteDanger = fin;
    }
    const _lissBh0 = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bh._spriteDanger, -bh.dangerZone, -bh.dangerZone,
                  bh.dangerZone * 2, bh.dangerZone * 2);
    ctx.imageSmoothingEnabled = _lissBh0;

    // Lueur pulsante (LOD mid+)
    /* La lueur pulsante recreait son degrade radial a chaque image, parce que
       son rayon suit le battement. Le battement ne fait que 8 % : on cuit la
       lueur une fois dans un sprite et on la pose a la taille voulue. Le
       rapport interne/externe varie alors de 0,23 a 0,27 au lieu d'etre exact,
       ce qui est invisible sur une lueur a 8 % d'opacite. */
    if (bhLod >= 1) { const pulse = 1 + Math.sin(t * 2) * 0.08;
    if (!bh._gGlowSprite) {
        const SPR = 128;
        const brut = document.createElement('canvas');
        brut.width = brut.height = SPR;
        const bx = brut.getContext('2d');
        const gg = bx.createRadialGradient(SPR / 2, SPR / 2, SPR / 2 * 0.25, SPR / 2, SPR / 2, SPR / 2);
        gg.addColorStop(0, 'rgba(120, 50, 200, 0.08)');
        gg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bx.fillStyle = gg;
        bx.beginPath();
        bx.arc(SPR / 2, SPR / 2, SPR / 2, 0, Math.PI * 2);
        bx.fill();
        const fin = document.createElement('canvas');
        fin.width = fin.height = SPR;
        const fx = fin.getContext('2d');
        fx.filter = 'blur(2px)';
        fx.drawImage(brut, 0, 0);
        fx.filter = 'none';
        bh._gGlowSprite = fin;
    }
    const rGlow = bh.radius * 2 * pulse;
    const _lissBh = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bh._gGlowSprite, -rGlow, -rGlow, rGlow * 2, rGlow * 2);
    ctx.imageSmoothingEnabled = _lissBh;

    }

    // Anneau de danger pulsant (LOD high)
    if (bhLod >= 2) { const dangerPulse = 0.5 + Math.sin(t * 1.5) * 0.3;
    ctx.strokeStyle = `rgba(255, 50, 50, ${0.08 * dangerPulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, bh.dangerZone * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    }

    // Trou noir (noyau), puis le disque d'accretion par-dessus (en lumiere)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
    ctx.fill();
    preparerTrouNoir();
    {
        const W = bh.radius * _TN_ETENDUE;
        const op = ctx.globalCompositeOperation, a0 = ctx.globalAlpha;
        ctx.globalCompositeOperation = 'lighter';
        /* Les deux images se relaient : leur somme reste constante. */
        const m = bhLod >= 1 ? 0.5 + 0.5 * Math.sin(t * 0.7) : 1;
        ctx.globalAlpha = m;
        ctx.drawImage(bh._disques[0], bh.x - W, bh.y - W, W * 2, W * 2);
        if (bhLod >= 1) {
            ctx.globalAlpha = 1 - m;
            ctx.drawImage(bh._disques[1], bh.x - W, bh.y - W, W * 2, W * 2);
        }
        ctx.globalAlpha = a0;
        ctx.globalCompositeOperation = op;
    }

    if (bhLod >= 1) rayonnementHawking(ctx, bh, t);
}

/* LE RAYONNEMENT DE HAWKING, purement decoratif. Au bord de l'horizon
   naissent des paires de grains : l'un retombe et s'eteint aussitot,
   l'autre s'echappe lentement en palissant. Plus un fin liseré qui
   frissonne sur l'horizon. Sans etat : chaque paire vit un cycle, et son
   angle au cycle suivant est tire d'un hachage du numero de cycle. */
function rayonnementHawking(ctx, bh, t) {
    const R = bh.radius;
    const z = gameState.camera.zoom;
    const op = ctx.globalCompositeOperation, a0 = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    /* Le liseré : un anneau tres pale dont l'eclat ondule. */
    ctx.lineWidth = Math.max(1 / z, R * 0.025);
    for (let k = 0; k < 3; k++) {
        const a1 = t * (0.4 + k * 0.17) + k * 2.1;
        ctx.strokeStyle = 'rgba(190,170,255,' + (0.10 + 0.06 * Math.sin(t * 1.7 + k)).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, R * 1.01, a1, a1 + 1.6 + 0.6 * Math.sin(t + k));
        ctx.stroke();
    }
    const taille = Math.max(1.2 / z, R * 0.018);
    const N = 26;
    for (let j = 0; j < N; j++) {
        const decal = (j * 0.618) % 1;
        const u = t * 0.35 + decal;
        const cycle = Math.floor(u);
        const ph = u - cycle;
        const h = Math.sin(cycle * 91.7 + j * 12.9898) * 43758.5453;
        const alea = h - Math.floor(h);
        const ang = alea * Math.PI * 2;
        const c = Math.cos(ang), s = Math.sin(ang);
        /* Le grain qui s'echappe. */
        const re = R * (1.02 + 0.9 * ph);
        ctx.globalAlpha = 0.75 * Math.sin(Math.PI * Math.min(1, ph * 1.15)) * (1 - ph * 0.6);
        ctx.fillStyle = alea < 0.5 ? '#E0F2FE' : '#C4B5FD';
        ctx.beginPath();
        ctx.arc(bh.x + c * re, bh.y + s * re, taille * (1 - ph * 0.5), 0, Math.PI * 2);
        ctx.fill();
        /* Son partenaire, avale en un instant. */
        if (ph < 0.15) {
            const ri = R * (1.02 - ph * 0.6);
            ctx.globalAlpha = 0.7 * (1 - ph / 0.15);
            ctx.fillStyle = '#A78BFA';
            ctx.beginPath();
            ctx.arc(bh.x + c * ri, bh.y + s * ri, taille * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op;
}


