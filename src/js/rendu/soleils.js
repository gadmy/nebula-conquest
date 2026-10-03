// ─────────────────────────────────────────────
// DESSIN — Soleils
// ─────────────────────────────────────────────
/* ASTEROIDES : quelques rochers peints une fois (forme bosselee, crateres,
   eclaires de la gauche), puis simplement poses et tournes vers le soleil. */
const _ROCHES = {};
function spriteRoche(type, k) {
    const cle = type + k;
    if (_ROCHES[cle]) return _ROCHES[cle];
    const S = 48, h = S / 2;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S), D = img.data;
    const seed = 977 * (k + 1) + (type === 'red' ? 31 : type === 'green' ? 67 : 5);
    const N = _bruitPerlin(seed);
    const rng = mulberry32(seed);
    const base = type === 'red' ? [150, 84, 64] : type === 'green' ? [92, 124, 84] : [104, 96, 88];
    const allonge = 0.65 + rng() * 0.35;
    const L = [-0.8, -0.25, 0.55];
    const cr = _crateres(rng, 5, 0.12, 0.35);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const nx0 = (i + 0.5 - h) / (h - 2), ny0 = (j + 0.5 - h) / (h - 2) / allonge;
        const ang = Math.atan2(ny0, nx0);
        /* Contour bossele : le rayon varie avec l'angle. */
        const rb = 0.8 + 0.3 * N(Math.cos(ang) * 1.2, Math.sin(ang) * 1.2, 0.5) + 0.06 * N(Math.cos(ang) * 3, Math.sin(ang) * 3, 3);
        const d = Math.sqrt(nx0 * nx0 + ny0 * ny0) / rb;
        if (d > 1.03) continue;
        const nx = nx0 / rb, ny = ny0 / rb;
        const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, nx * nx + ny * ny)));
        /* Relief : bruit + crateres, qui penchent la normale. */
        let rel = N.fbm(nx * 2, ny * 2, nz * 2, 3) * 0.4;
        for (const q of cr) {
            const dd = 1 - (nx * q[0] + ny * q[1] + nz * q[2]);
            if (dd < q[3] * q[3] * 1.7) rel += _profilCratere(Math.sqrt(dd * 2) / q[3]) * 0.6;
        }
        const e = 0.02;
        const gx = N.fbm((nx + e) * 1.5, ny * 1.5, nz * 1.5, 2) - N.fbm((nx - e) * 1.5, ny * 1.5, nz * 1.5, 2);
        const gy = N.fbm(nx * 1.5, (ny + e) * 1.5, nz * 1.5, 2) - N.fbm(nx * 1.5, (ny - e) * 1.5, nz * 1.5, 2);
        let mx = nx - gx * 4, my = ny - gy * 4, mz = nz + 0.1;
        const mn = Math.sqrt(mx * mx + my * my + mz * mz); mx /= mn; my /= mn; mz /= mn;
        const lam = Math.max(0, mx * L[0] + my * L[1] + mz * L[2]);
        const lum = (0.18 + 1.05 * lam) * (0.85 + rel * 0.5);
        const kk = (j * S + i) * 4;
        D[kk] = base[0] * lum; D[kk + 1] = base[1] * lum; D[kk + 2] = base[2] * lum;
        D[kk + 3] = 255 * Math.max(0, Math.min(1, (1 - d) * (h - 2) * 0.8 + 0.5));
    }
    x.putImageData(img, 0, 0);
    _ROCHES[cle] = c;
    return c;
}

function drawAsteroidBelts(ctx) {
    if (vueLointaine()) return;
    const t = gameState.time;
    const cam = gameState.camera;
    const halfW = gameState.width / 2 / cam.zoom;
    const halfH = gameState.height / 2 / cam.zoom;
    const lod = gameState.lod;

    for (const belt of gameState.asteroidBelts) {
        const sun = belt.sun;
        if (!sun || !belt.rocks[0]?.subRocks) continue;

        // Culling soleil entier
        const beltMax = belt.radius + 30;
        if (sun.x + beltMax < cam.x - halfW || sun.x - beltMax > cam.x + halfW ||
            sun.y + beltMax < cam.y - halfH || sun.y - beltMax > cam.y + halfH) continue;

        // Traînée orbitale (LOD mid+)
        if (lod >= 1) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.strokeStyle = 'rgba(80,70,60,0.06)';
            ctx.lineWidth = 14;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, belt.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        for (const rock of belt.rocks) {
            const a = rock.angle;
            const r = belt.radius + rock.radiusOff;
            const cx = sun.x + Math.cos(a) * r;
            const cy = sun.y + Math.sin(a) * r;

            // Culling par rock
            if (cx < cam.x - halfW - 30 || cx > cam.x + halfW + 30 ||
                cy < cam.y - halfH - 30 || cy > cam.y + halfH + 30) continue;

            // LOD 0 : simple point
            if (lod === 0) {
                ctx.fillStyle = rock.subRocks[0]?.color || '#555';
                ctx.fillRect(cx - 2, cy - 2, 4, 4);
                continue;
            }

            /* Des rochers peints d'avance (spriteRoche), eclaires de la
               gauche : on les tourne vers le soleil, avec un leger balancement. */
            for (let si = 0; si < rock.subRocks.length; si++) {
                const sr = rock.subRocks[si];
                const rx = cx + sr.offX;
                const ry = cy + sr.offY;
                const sz = sr.size * 1.25;
                const rot = a + 0.4 * Math.sin(t * 0.3 + si * 1.7 + rock.radiusOff);
                const sp = spriteRoche(rock.type, (si + (rock.subRocks.length << 1)) & 3);
                ctx.translate(rx, ry);
                ctx.rotate(rot);
                ctx.drawImage(sp, -sz, -sz, sz * 2, sz * 2);
                ctx.rotate(-rot);
                ctx.translate(-rx, -ry);
            }

            // Lueur de groupe (LOD high)
            if (lod >= 2) {
                let haloColor;
                if (rock.type === 'dark') haloColor = 'rgba(60,55,50,0.06)';
                else if (rock.type === 'red') haloColor = 'rgba(120,50,40,0.06)';
                else haloColor = 'rgba(50,100,50,0.06)';
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = haloColor;
                ctx.beginPath();
                ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}

function drawSuns(ctx) {
    const t = gameState.time;
    const cam = gameState.camera;
    const halfW = gameState.width / 2 / cam.zoom;
    const halfH = gameState.height / 2 / cam.zoom;
    const pxParUnite = cam.zoom * echelleRendu();   // pixels reels du canevas

    for (let i = 0; i < gameState.suns.length; i++) {
        const sun = gameState.suns[i];

        // Culling
        const margin = sun.radius * 4;
        if (sun.x < cam.x - halfW - margin || sun.x > cam.x + halfW + margin ||
            sun.y < cam.y - halfH - margin || sun.y > cam.y + halfH + margin) continue;

        // Halo (depuis cache) — sprite lisse agrandi, donc sans filtrage :
        // c'est la que passait l'essentiel du cout de drawSuns.
        // (sauf s'il est deja en couche CSS, voir majHalosCss)
        if (sun._haloCache && !halosEnCss(sun)) {
            const drawR = sun._haloR;
            const _liss = ctx.imageSmoothingEnabled;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(sun._haloCache, sun.x - drawR, sun.y - drawR, drawR * 2, drawR * 2);
            ctx.imageSmoothingEnabled = _liss;
        }

        // Texture cachée - la copie a la bonne taille (voir createSunTexture)
        if (sun._texture) {
            const px = sun.radius * 2 * pxParUnite;
            const niv = sun._niveaux || [sun._texture];
            let k = 0;
            while (k + 1 < niv.length && niv[k + 1].width >= px) k++;
            /* Plus grand que la grande texture (zoom tres fort) : il faut
               agrandir, et la le lissage reste necessaire. */
            const _liss = ctx.imageSmoothingEnabled;
            ctx.imageSmoothingEnabled = px > niv[0].width;
            dessinerVisible(ctx, niv[k], sun.x - sun.radius, sun.y - sun.radius, sun.radius * 2, sun.radius * 2);
            ctx.imageSmoothingEnabled = _liss;
        }
        if (gameState.lod >= 1) eruptionsSolaires(ctx, sun, t);
        // Anneau de sélection
        if (gameState.selectedBody === sun) {
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.radius + 6, 0, Math.PI*2);
            ctx.stroke();
        }
    }
}

/* LES ERUPTIONS SOLAIRES, purement decoratives. De temps en temps, une
   gerbe de feu jaillit d'un point de la surface : une trentaine de grains
   partent en eventail, montent, ralentissent et retombent en passant du
   blanc a la couleur de l'etoile puis au rouge. Un eclat marque le pied de
   la gerbe. En moyenne une gerbe toutes les 5 s par etoile a l'ecran. */
function eruptionsSolaires(ctx, sun, t) {
    const R = sun.radius;
    if (!sun._eruptions) { sun._eruptions = []; sun._eruptionT = t + 1 + Math.random() * 4; }
    if (t >= sun._eruptionT) {
        const grains = [];
        const n = 40 + Math.floor(Math.random() * 25);
        const hMax = R * (0.25 + Math.random() * 0.45);
        const penche = (Math.random() - 0.5) * 0.5;      /* la gerbe peut pencher */
        for (let k = 0; k < n; k++) {
            grains.push({ off: (Math.random() - 0.5) * 0.45,
                          derive: penche + (Math.random() - 0.5) * 0.7,
                          h: hMax * (0.3 + Math.random() * 0.7),
                          retard: Math.random() * 0.35,      /* depart echelonne */
                          taille: 0.5 + Math.random() * 0.9 });
        }
        sun._eruptions.push({ a: Math.random() * Math.PI * 2, t0: t, duree: 1.6 + Math.random() * 1.6,
                              grains: grains, hMax: hMax, penche: penche });
        sun._eruptionT = t + 2 + Math.random() * 6;
    }
    const L = sun._eruptions;
    if (!L.length) return;
    const z = gameState.camera.zoom;
    const couleur = sun.color || '#FFB830';
    const op = ctx.globalCompositeOperation, a0 = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = L.length - 1; i >= 0; i--) {
        const E = L[i];
        const age = t - E.t0;
        if (age < 0 || age > E.duree) { L.splice(i, 1); continue; }
        const f = age / E.duree;
        /* Eclat au pied. */
        const bx = sun.x + Math.cos(E.a) * R, by = sun.y + Math.sin(E.a) * R;
        if (f < 0.5) {
            ctx.globalAlpha = 0.8 * (1 - f / 0.5);
            const rb = R * 0.22 * (0.6 + f);
            ctx.drawImage(haloSprite('#FFE7A8', 'halo'), bx - rb, by - rb, rb * 2, rb * 2);
        }
        /* Le panache : une lueur douce qui monte avec la gerbe. */
        {
            const hp = E.hMax * 0.55 * Math.sin(Math.PI * Math.min(1, f * 1.3));
            const ap = E.a + E.penche * 0.5;
            const px = sun.x + Math.cos(ap) * (R + hp), py = sun.y + Math.sin(ap) * (R + hp);
            const rp = E.hMax * 0.7;
            ctx.globalAlpha = 0.45 * Math.sin(Math.PI * f);
            ctx.drawImage(haloSprite('#FF7A1A', 'halo'), px - rp, py - rp, rp * 2, rp * 2);
        }
        const base = Math.max(1.2 / z, R * 0.014);
        ctx.lineCap = 'round';
        for (let k = 0; k < E.grains.length; k++) {
            const g = E.grains[k];
            /* Chaque grain a sa vie : il part un peu apres les autres, monte
               en parabole et retombe. */
            const fg = (f - g.retard) / (1 - g.retard);
            if (fg <= 0 || fg >= 1) continue;
            const pos = (q) => {
                const r = R * 0.97 + g.h * 4 * q * (1 - q);
                const ang = E.a + g.off + g.derive * q;
                return [sun.x + Math.cos(ang) * r, sun.y + Math.sin(ang) * r];
            };
            const [x, y] = pos(fg);
            const [qx, qy] = pos(Math.max(0, fg - 0.09));
            const coul = fg < 0.2 ? '#FFF1C1' : fg < 0.45 ? '#FFC04D' : fg < 0.75 ? '#FF6A1F' : '#C2310F';
            const ep = base * g.taille * (1.3 - fg * 0.7);
            ctx.globalAlpha = Math.min(1, (1 - fg) * 1.6);
            ctx.strokeStyle = coul;
            ctx.lineWidth = ep;
            ctx.beginPath();
            ctx.moveTo(qx, qy);
            ctx.lineTo(x, y);
            ctx.stroke();
            /* Un grain sur quatre luit : le feu, pas des billes. */
            if ((k & 3) === 0) {
                ctx.globalAlpha *= 0.5;
                const rh = ep * 4;
                ctx.drawImage(haloSprite(fg < 0.45 ? couleur : '#FF6A1F', 'halo'), x - rh, y - rh, rh * 2, rh * 2);
            }
        }
    }
    ctx.globalAlpha = a0;
    ctx.globalCompositeOperation = op;
}


