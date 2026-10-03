// ─────────────────────────────────────────────
// JETS DE SPORES — Rendu (style gerbe magique)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CACHE DE HALOS  —  le correctif de performance
//
// createRadialGradient est l'un des appels canvas les plus couteux, et il
// etait fait DANS la boucle la plus chaude : 17 degrades neufs par jet et
// par image (15 pour la trainee, plus le halo et le noyau). A 100 jets en
// vol, 1700 degrades par image ; mesure a 13,8 ms/image contre 2,7 ms avec
// des sprites - soit 11 ms rendues sur les 16,7 disponibles.
//
// Le principe etait DEJA dans le code, applique aux atmospheres de planetes
// (p._atmoCache) : on peint le degrade UNE FOIS dans un petit canvas, puis
// on le pose au drawImage a la taille voulue. Ici on va plus loin : les
// alphas des paliers sont tous proportionnels, donc un seul sprite par
// couleur suffit et l'intensite se regle au globalAlpha - c'est exactement
// equivalent, chaque palier etant multiplie par le meme facteur.
// ─────────────────────────────────────────────
const _haloCache = new Map();
const _HALO_PX = 64;          // rayon du sprite ; on le redimensionne au trace

function haloSprite(color, genre) {
    const cle = genre + '|' + color;
    let c = _haloCache.get(cle);
    if (c) return c;

    c = document.createElement('canvas');
    c.width = c.height = _HALO_PX * 2;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(_HALO_PX, _HALO_PX, 0, _HALO_PX, _HALO_PX, _HALO_PX);

    if (genre === 'brume') {
        // trainee : les alphas d'origine etaient alpha et alpha*0.4 ;
        // on peint le profil a pleine intensite, l'appelant module au globalAlpha
        g.addColorStop(0, color + 'FF');
        g.addColorStop(0.6, color + '66');
        g.addColorStop(1, 'rgba(0,0,0,0)');
    } else if (genre === 'halo') {
        g.addColorStop(0, color + '50');
        g.addColorStop(0.3, color + '25');
        g.addColorStop(0.7, color + '10');
        g.addColorStop(1, 'rgba(0,0,0,0)');
    } else { // 'noyau'
        g.addColorStop(0, '#FFFFFFEE');
        g.addColorStop(0.3, color + 'DD');
        g.addColorStop(0.6, color + '88');
        g.addColorStop(1, 'rgba(0,0,0,0)');
    }

    x.fillStyle = g;
    x.beginPath();
    x.arc(_HALO_PX, _HALO_PX, _HALO_PX, 0, Math.PI * 2);
    x.fill();
    _haloCache.set(cle, c);
    return c;
}

// Poser un halo cache, centre sur (cx,cy), de rayon r.
function poserHalo(ctx, color, genre, cx, cy, r, alpha) {
    const s = haloSprite(color, genre);
    if (alpha !== undefined && alpha !== 1) {
        const a = ctx.globalAlpha;
        ctx.globalAlpha = a * alpha;
        ctx.drawImage(s, cx - r, cy - r, r * 2, r * 2);
        ctx.globalAlpha = a;
    } else {
        ctx.drawImage(s, cx - r, cy - r, r * 2, r * 2);
    }
}

// L'eclairage directionnel d'une planete : meme idee, mais le degrade est
// DECALE vers l'etoile. On peint donc la lumiere venant de la gauche, une
// fois pour toutes, et on fait tourner le sprite au trace.
let _lumiereCache = null;
/* LUMIERE : le calque jour / nuit pose sur chaque astre, tourne vers son
   soleil (lumiere venant de la gauche dans le calque). Peint une fois, par
   pixel : cote jour legerement dore, terminateur doux, cote nuit sombre. */
function lumiereSprite() {
    if (_lumiereCache) return _lumiereCache;
    const R = 96, S = R * 2;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S), D = img.data;
    const L = [-0.82, -0.12, 0.56];              /* vers le soleil : a gauche, un peu devant */
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const nx = (i + 0.5 - R) / R, ny = (j + 0.5 - R) / R, d2 = nx * nx + ny * ny;
        if (d2 > 1) continue;
        const nz = Math.sqrt(1 - d2);
        const l = nx * L[0] + ny * L[1] + nz * L[2];
        const k = (j * S + i) * 4;
        const bord = Math.max(0, Math.min(1, (1 - Math.sqrt(d2)) * R * 0.7 + 0.5));
        if (l > 0.55) {
            /* Reflet chaud, discret. */
            D[k] = 255; D[k + 1] = 246; D[k + 2] = 214; D[k + 3] = 255 * 0.22 * Math.pow((l - 0.55) / 0.45, 2) * bord;
        } else {
            /* Terminateur doux puis nuit (jamais noire : les astres restent lisibles). */
            const nuit = _lissePas(0.35, -0.25, l);
            D[k] = 4; D[k + 1] = 6; D[k + 2] = 22; D[k + 3] = 255 * 0.68 * nuit * bord;
        }
    }
    x.putImageData(img, 0, 0);
    _lumiereCache = c;
    return c;
}

/* TROIS TIRS, TROIS ALLURES. La rafale et la boule doivent se reconnaitre
   d'un coup d'oeil, les siennes comme celles de l'adversaire. */

/* Paquet de RAFALE : une balle tracante. Petite, vive, un trait court et
   net derriere elle, sans brume ni scintillements - elles sont nombreuses. */
function dessinerTracante(ctx, jet) {
    const z = gameState.camera.zoom;
    const sc = Math.max(1, 1.2 / z);
    const c = couleurEtincelle(jet.color);
    const tr = jet.trail;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (tr.length > 1) {
        const k0 = Math.max(0, tr.length - 7);
        ctx.lineCap = 'round';
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 2.2 * sc;
        ctx.beginPath();
        ctx.moveTo(tr[k0].x, tr[k0].y);
        ctx.lineTo(jet.x, jet.y);
        ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 0.9 * sc;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    poserHalo(ctx, jet.color, 'halo', jet.x, jet.y, 11 * sc);
    poserHalo(ctx, c, 'noyau', jet.x, jet.y, 4 * sc);
    ctx.restore();
}

/* La BOULE en vol : une comete. Coeur blanc large, halo a sa mesure, une
   traine epaisse qui s'effile, et ses deux anneaux qui tournent encore. */
function dessinerBouleEnVol(ctx, jet) {
    const z = gameState.camera.zoom;
    const t = gameState.time;
    const c = couleurEtincelle(jet.color);
    const r = _rayonBoule(jet.spores) * Math.max(1, 0.8 / z);
    const tr = jet.trail;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    /* La traine : des halos de plus en plus petits et pales vers l'arriere. */
    for (let i = 0; i < tr.length; i++) {
        const f = (i + 1) / tr.length;                 /* 0 a l'arriere, 1 contre la boule */
        const rr = r * (0.35 + 0.95 * f);
        ctx.globalAlpha = 0.08 + 0.5 * f * f;
        ctx.drawImage(haloSprite(c, 'brume'), tr[i].x - rr, tr[i].y - rr, rr * 2, rr * 2);
    }
    ctx.globalAlpha = 0.9;
    const rh = r * 3;
    ctx.drawImage(haloSprite(c, 'brume'), jet.x - rh, jet.y - rh, rh * 2, rh * 2);
    /* Les anneaux, comme pendant la charge. */
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(1 / z, r * 0.1);
    ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
        const sens = k ? -1 : 1;
        const rr = r * (1.45 + 0.35 * k);
        const deb = t * (3 + k) * sens + k;
        ctx.beginPath(); ctx.arc(jet.x, jet.y, rr, deb, deb + Math.PI * 0.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(jet.x, jet.y, rr, deb + Math.PI, deb + Math.PI * 1.7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(haloSprite(c, 'noyau'), jet.x - r, jet.y - r, r * 2, r * 2);
    ctx.drawImage(haloSprite('#FFFFFF', 'noyau'), jet.x - r * 0.55, jet.y - r * 0.55, r * 1.1, r * 1.1);
    ctx.restore();
    if (jet.selected) {
        ctx.font = '10px Orbitron';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(Math.floor(jet.spores), jet.x, jet.y - r * 2);
    }
}

/* Vue lointaine : un point par tir (2 pixels), un seul trace par couleur. */
const _jetsLoin = new Map();
function drawJetsSimples(ctx) {
    const z = gameState.camera.zoom, r = 2 / z;
    for (const l of _jetsLoin.values()) l.length = 0;
    for (const jet of gameState.jets) {
        if (!jet.alive) continue;
        let l = _jetsLoin.get(jet.color);
        if (!l) { l = []; _jetsLoin.set(jet.color, l); }
        l.push(jet);
    }
    for (const [c, l] of _jetsLoin) {
        if (!l.length) continue;
        ctx.fillStyle = c || '#FFFFFF';
        ctx.beginPath();
        for (const jet of l) { ctx.moveTo(jet.x + r, jet.y); ctx.arc(jet.x, jet.y, r, 0, Math.PI * 2); }
        ctx.fill();
    }
}

function drawJets(ctx) {
    if (vueLointaine()) { drawJetsSimples(ctx); return; }
    const t = gameState.time;
    const jLod = gameState.lod;

    for (const jet of gameState.jets) {
        if (!jet.alive) continue;
        if (jet.rafale) { dessinerTracante(ctx, jet); continue; }
        if (jet.boule) { dessinerBouleEnVol(ctx, jet); continue; }
        if (jet.demolisseur) { dessinerDemolisseur(ctx, jet); continue; }

        /* Un jet n'est que de la lumiere : brume, trainee, halo, noyau et
           scintillements s'AJOUTENT au fond. En transparence simple ils
           s'effacaient des qu'un jet passait devant une planete eclairee,
           qui est plus claire qu'eux. Le nombre de spores, lui, reste en
           rendu normal - c'est du texte, pas une lueur. */
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // ── Traîne diffuse (brume colorée) ──
        const trail = jet.trail;
        if (trail.length > 1) {
            // LOD high uniquement : brume radiale (coûteuse)
            if (jLod >= 2) {
              for (let i = 1; i < trail.length; i += 2) {
                const progress = i / trail.length;
                const alpha = progress * 0.35;
                const zs = Math.max(1, 1.2 / gameState.camera.zoom);
                const spread = (8 + (1 - progress) * 6) * zs;
                poserHalo(ctx, jet.color, 'brume', trail[i].x, trail[i].y, spread, alpha);
              }
            }

            // Ligne de traîne lumineuse
            ctx.beginPath();
            ctx.moveTo(trail[0].x, trail[0].y);
            for (let i = 1; i < trail.length; i++) {
                ctx.lineTo(trail[i].x, trail[i].y);
            }
            ctx.lineTo(jet.x, jet.y);
            const zl = Math.max(1, 1.2 / gameState.camera.zoom);
            ctx.strokeStyle = jet.color + '40';
            ctx.lineWidth = 4 * zl;
            ctx.stroke();
            ctx.strokeStyle = '#FFFFFF20';
            ctx.lineWidth = 2 * zl;
            ctx.stroke();
        }

        // Taille adaptée au zoom (toujours bien visible)
        const z = gameState.camera.zoom;
        const scale = Math.max(1, 1.2 / z);
        const haloR = 30 * scale;
        const coreR = 8 * scale;
        const sparkScale = scale;

        // ── Halo externe large (lueur magique) ──
        poserHalo(ctx, jet.color, 'halo', jet.x, jet.y, haloR);

        // ── Noyau lumineux ──
        poserHalo(ctx, jet.color, 'noyau', jet.x, jet.y, coreR);

        // ── Particules scintillantes (LOD high uniquement) ──
        if (jLod < 2) { /* skip sparkles */ }
        else for (const sp of jet.sparkles) {
            const sx = jet.x + sp.offX * sparkScale;
            const sy = jet.y + sp.offY * sparkScale;
            const flicker = 0.4 + Math.sin(t * 8 + sp.phase) * 0.4;
            const sr = (sp.radius + 1) * flicker * sparkScale;

            ctx.fillStyle = '#FFFFFF' + hexAlpha(flicker * 0.8);
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();

            // Petite lueur colorée autour
            ctx.fillStyle = jet.color + hexAlpha(flicker * 0.4);
            ctx.beginPath();
            ctx.arc(sx, sy, sr + 3 * sparkScale, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // ── Afficher le nombre de spores si sélectionné (clic) ──
        if (jet.selected) {
            ctx.font = '10px Orbitron';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(Math.floor(jet.spores), jet.x, jet.y - 18);
        }
    }
}

// Helper : escape HTML (anti-XSS)
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// Helper : alpha (0-1) → hex string 2 chars
/* L'eclat d'impact ajoute sa transparence en fin de couleur ("#RRGGBB" +
   "80") : il lui faut une couleur en #RRGGBB. Toute autre ecriture
   ("rgb(...)", "#abc", un nom) faisait planter le dessin de toute l'image.
   On la convertit ; une couleur illisible devient du blanc. */
const _couleursHex = {};
function couleurHex(c) {
    if (typeof c !== 'string') return '#FFFFFF';
    if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    if (_couleursHex[c]) return _couleursHex[c];
    let h = '#FFFFFF';
    const m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) h = '#' + [m[1], m[2], m[3]].map(function (v) { return Math.min(255, +v).toString(16).padStart(2, '0'); }).join('');
    else if (/^#[0-9a-f]{3}$/i.test(c)) h = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    else if (/^#[0-9a-f]{8}$/i.test(c)) h = c.slice(0, 7);
    else {
        try {
            const t = document.createElement('canvas').getContext('2d');
            t.fillStyle = '#FFFFFF'; t.fillStyle = c;
            if (/^#[0-9a-f]{6}$/i.test(t.fillStyle)) h = t.fillStyle;
        } catch (e) {}
    }
    _couleursHex[c] = h;
    return h;
}

function hexAlpha(a) {
    return Math.floor(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');
}

function drawLaunchPreview(ctx) {
    if (gameState._firePhase !== 'aiming' || !gameState._fireSource) return;
    const src = gameState._fireSource;
    const preview = gameState.launchPreview;

    if (preview.length < 2) return;

    /* En surface on montre la cloche ENTIERE : c'est le point de chute qui
       interesse, pas la direction de depart. Le depart est marque d'un rond. */
    const surface = gameState._fireSurface;
    const count = surface ? preview.length : Math.floor(preview.length * 0.7);

    ctx.save();
    const zScale = Math.max(1, 2 / gameState.camera.zoom);
    ctx.setLineDash([4 * zScale, 6 * zScale]);
    const player = gameState.players[localSlot()];
    /* Trait rouge quand une etoile ou le trou noir barre la route : le jet y
       serait detruit, et la cible passerait pour invulnerable. */
    const bloque = !surface && !gameState._boule && gameState._tirBloque;
    const demol = !!gameState._demol && !gameState._boule;
    const col = bloque ? '#FF3B30' : demol ? '#FF5A1F' : (player ? player.color : '#C8A0FF');
    /* Demolisseur arme : le trait rougeoie, il pulse et luit. */
    if (demol) {
        ctx.shadowColor = '#FF3B00';
        ctx.shadowBlur = 10 + 6 * Math.sin(gameState.time * 6);
    }
    if (surface && gameState._departSurface) {
        const d0 = gameState._departSurface;
        ctx.setLineDash([]);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(d0.x, d0.y, Math.max(1.5, 4 * zScale), 0, Math.PI * 2);
        ctx.fill();
        const fin = preview[preview.length - 1];
        ctx.strokeStyle = col;
        ctx.lineWidth = 2 * zScale;
        ctx.beginPath();
        ctx.arc(fin.x, fin.y, Math.max(2, 7 * zScale), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([4 * zScale, 6 * zScale]);
    }

    for (let i = 0; i < count - 1; i++) {
        const alpha = (bloque || demol ? 0.85 : 0.5) * (1 - i / count);
        ctx.strokeStyle = col + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = (bloque ? 3 : demol ? 3.5 : 2) * zScale;
        ctx.beginPath();
        ctx.moveTo(preview[i].x, preview[i].y);
        ctx.lineTo(preview[i+1].x, preview[i+1].y);
        ctx.stroke();
    }
    ctx.restore();

    if (demol) { dessinerChoixDemolisseur(ctx); return; }
    if (!gameState._boule) dessinerDevis(ctx, src, bloque);
}

/* Les trois batiments, colles au curseur, celui qu'on detruira entoure de
   feu ; en dessous, combien l'astre vise en a qu'on peut casser. */
function dessinerChoixDemolisseur(ctx) {
    const z = gameState.camera.zoom;
    const px = _taillePx(z, 12, 40, 11, 17);
    const m = px / z;
    const genre = gameState._demolGenre || 'nid';
    const x0 = gameState.mouseWorldX + m * 2.2, y0 = gameState.mouseWorldY - m * 2.4;
    const pasI = m * 2.4;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let k = 0; k < DEMOL_GENRES.length; k++) {
        const g = DEMOL_GENRES[k];
        const cx = x0 + k * pasI, cy = y0;
        const choisi = g === genre;
        ctx.globalAlpha = choisi ? 1 : 0.45;
        ctx.fillStyle = 'rgba(12,8,20,0.8)';
        ctx.beginPath();
        ctx.arc(cx, cy, m * (choisi ? 1.05 : 0.8), 0, Math.PI * 2);
        ctx.fill();
        if (choisi) {
            ctx.shadowColor = '#FF3B00';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = '#FF5A1F';
            ctx.lineWidth = m * 0.16;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        dessinerIconeBat(ctx, g, cx, cy, m * (choisi ? 1.55 : 1.15));
    }
    ctx.globalAlpha = 1;
    const cible = _astreSousCurseur();
    let txt = 'DÉMOLIR : ' + DEMOL_NOMS[genre].toUpperCase();
    let teinte = '#FF8A3D';
    if (cible) {
        const moi = localSlot();
        const monCamp = campDe(cible, moi);
        const cel = cible.lutte ? cible.lutte.cellules : null;
        let n = 0;
        const n0 = (cible.alveoles || 0) + (cible.nids || 0) + (cible.biomes || 0);
        if (n0) for (const e of edifices(cible)) {
            if (e.g !== genre) continue;
            if (cel ? cel[e.i] === monCamp : cible.owner === moi) continue;
            n++;
        }
        txt += n ? '  \u00b7 ' + n + ' sur ' + cible.name : '  \u00b7 aucun sur ' + cible.name;
        if (!n) teinte = '#9CA3AF';
    }
    ctx.font = '600 ' + Math.round(m * 0.8) + 'px "Exo 2", sans-serif';
    ctx.textAlign = 'left';
    ctx.lineWidth = m * 0.22;
    ctx.strokeStyle = 'rgba(8,6,20,0.85)';
    ctx.strokeText(txt, x0 - m, y0 + m * 1.9);
    ctx.fillStyle = teinte;
    ctx.fillText(txt, x0 - m, y0 + m * 1.9);
    ctx.restore();
}

/* LE DEVIS, colle au curseur. Ce que l'envoi achetera sur l'astre vise, et a
   quel prix la case : sans ces deux nombres on tire au jugé, alors que toute
   l'economie du jeu tient dedans. */
function dessinerDevis(ctx, src, bloque) {
    if (bloque) return;
    const surf = astreTirSurface();
    const cible = surf || _astreSousCurseur();
    if (!cible) return;
    const d = devisAttaque(src, cible);
    if (!d) return;

    const z = gameState.camera.zoom;
    const px = _taillePx(z, 12, 40, 11, 17);
    const m = px / z;

    let l1, l2, teinte;
    if (d.renfort) {
        l1 = '+' + _sp(d.envoi) + ' spores';
        l2 = 'renfort \u00b7 ' + cible.name;
        teinte = '#4ADE80';
    } else if (d.cases <= 0) {
        l1 = 'aucun terrain';
        l2 = _sp(d.envoi) + ' spores n\'y suffisent pas';
        teinte = '#F87171';
    } else {
        const part = Math.round(100 * d.cases / Math.max(1, d.total));
        l1 = d.tout ? '\u2248 ' + cible.name + ' EN ENTIER'
                    : '\u2248 ' + d.cases + ' cases  (' + part + '%)';
        l2 = '1 case = ' + Math.round(d.prix) + ' sp' + (d.neutre ? ' \u00b7 sol vierge' : '')
           + ' \u2014 envoi ' + _sp(d.envoi);
        teinte = part >= 50 ? '#4ADE80' : part >= 15 ? '#FACC15' : '#F87171';
    }

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    /* Le devis colle au curseur, mais on le rabat dans l'ecran : pres d'un
       bord il se faisait couper, et c'est justement la qu'on vise. */
    ctx.font = 'bold ' + m + 'px Orbitron';
    const w1 = ctx.measureText(l1).width;
    ctx.font = 'bold ' + (m * 0.72) + 'px Orbitron';
    const larg = Math.max(w1, ctx.measureText(l2).width) * z;
    const cam = gameState.camera, W = gameState.width, H = gameState.height;
    let sx = (gameState.mouseWorldX - cam.x) * z + W / 2 + 16;
    let sy = (gameState.mouseWorldY - cam.y) * z + H / 2 + 14;
    sx = Math.min(Math.max(sx, 12), Math.max(12, W - larg - 12));
    sy = Math.min(Math.max(sy, 46), H - 96);
    const x = (sx - W / 2) / z + cam.x;
    const y = (sy - H / 2) / z + cam.y;

    ctx.font = 'bold ' + m + 'px Orbitron';
    _texteLisible(ctx, l1, x, y, teinte, Math.max(2, m * 0.24));
    ctx.font = 'bold ' + (m * 0.72) + 'px Orbitron';
    _texteLisible(ctx, l2, x, y + m * 1.05, 'rgba(210,220,240,0.85)', Math.max(2, m * 0.2));
    ctx.restore();
}

/* L'astre sous le curseur, pour le devis. Meme regle que le ramassage au
   clic : on mord un peu au-dela du disque. */
function _astreSousCurseur() {
    const bodies = gameState.allBodies || [];
    const wx = gameState.mouseWorldX, wy = gameState.mouseWorldY;
    for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (b.type === 'sun') continue;
        const dx = b.x - wx, dy = b.y - wy;
        const r = b.radius + 8;
        if (dx * dx + dy * dy < r * r) return b;
    }
    return null;
}


