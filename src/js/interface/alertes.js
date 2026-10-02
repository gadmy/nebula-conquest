/* ─────────────────────────────────────────────
   ALERTES DIRECTIONNELLES
   Trois choses meritent qu'on leve les yeux : un de nos astres qui prend un
   tir, un astre qu'on perd, un groupement qui se referme quelque part. La
   carte etant bien plus grande que l'ecran, dire "il se passe quelque chose"
   ne suffit pas : il faut dire OU. Chaque alerte est donc une balise posee
   sur un astre. Quand cet astre est a l'ecran, la balise est un anneau qui
   bat autour de lui ; quand il est hors-champ, c'est une fleche collee au
   bord de l'ecran, exactement dans sa direction. La perte ajoute en plus un
   eclat lumineux sur le bord concerne et une secousse - c'est la seule des
   trois qu'on ne peut pas se permettre de rater.
   ───────────────────────────────────────────── */
const ALERTE_GENRES = {
    attaque: { duree: 3.0, couleur: '#FF9F43', signe: '⚔', poids: 1 },
    perte:   { duree: 7.0, couleur: '#FF3B55', signe: '💀', poids: 3 },
    groupe:  { duree: 5.0, couleur: '#C084FC', signe: '◈', poids: 2 },
};
const ALERTES_MAX = 14;

function ajouterAlerte(genre, body, couleur) {
    if (!body || (gameState.phase !== 'game' && gameState.phase !== 'spawn')) return;
    const g = ALERTE_GENRES[genre];
    if (!g) return;
    if (!gameState._alertes) gameState._alertes = [];
    const liste = gameState._alertes;
    /* Un astre pilonne prend un tir par seconde : on rallume la balise
       existante plutot que d'en empiler dix au meme endroit. */
    for (let i = 0; i < liste.length; i++) {
        const a = liste[i];
        if (a.genre === genre && a.body === body) {
            a.age = 0;
            if (couleur) a.couleur = couleur;
            return;
        }
    }
    liste.push({ genre: genre, body: body, age: 0, duree: g.duree,
                 couleur: couleur || g.couleur, poids: g.poids });
    /* Debordement : on sacrifie la moins grave, et a gravite egale la plus
       vieille - jamais la perte qu'on vient d'ajouter. */
    while (liste.length > ALERTES_MAX) {
        let pire = 0;
        for (let i = 1; i < liste.length; i++) {
            if (liste[i].poids < liste[pire].poids) pire = i;
            else if (liste[i].poids === liste[pire].poids && liste[i].age > liste[pire].age) pire = i;
        }
        liste.splice(pire, 1);
    }
}

/* Le signal lumineux : le bord de l'ecran s'embrase du cote de l'evenement. */
function eclatBord(body, couleur) {
    gameState._eclatBord = { body: body, couleur: couleur || '#FF3B55', age: 0, duree: 1.2 };
}

function majAlertes(dt) {
    const liste = gameState._alertes;
    if (liste && liste.length) {
        for (let i = liste.length - 1; i >= 0; i--) {
            liste[i].age += dt;
            if (liste[i].age >= liste[i].duree) liste.splice(i, 1);
        }
    }
    const e = gameState._eclatBord;
    if (e) { e.age += dt; if (e.age >= e.duree) gameState._eclatBord = null; }
}

/* Le point du bord de l'ecran que traverse un rayon partant du centre.
   Une simple ellipse collerait la fleche au mauvais endroit dans les coins :
   on cherche vraiment l'intersection avec le rectangle. */
function _bordEcran(angle, w, h, marge) {
    const cx = w / 2, cy = h / 2;
    const c = Math.cos(angle), s = Math.sin(angle);
    const tx = Math.abs(c) > 1e-6 ? (cx - marge) / Math.abs(c) : Infinity;
    const ty = Math.abs(s) > 1e-6 ? (cy - marge) / Math.abs(s) : Infinity;
    const t = Math.min(tx, ty);
    return { x: cx + c * t, y: cy + s * t };
}

function drawAlertes() {
    if (gameState.phase !== 'game' && gameState.phase !== 'spawn') return;
    const ctx = gameState.ctx, cam = gameState.camera;
    const w = gameState.width, h = gameState.height;

    /* L'eclat de bord d'abord : il passe sous les fleches. */
    const e = gameState._eclatBord;
    if (e && e.body) {
        const k = 1 - e.age / e.duree;
        const sx = (e.body.x - cam.x) * cam.zoom + w / 2;
        const sy = (e.body.y - cam.y) * cam.zoom + h / 2;
        const ang = Math.atan2(sy - h / 2, sx - w / 2);
        const foyer = _bordEcran(ang, w, h, 0);
        const portee = Math.max(w, h) * 0.45;
        const deg = ctx.createRadialGradient(foyer.x, foyer.y, 0, foyer.x, foyer.y, portee);
        deg.addColorStop(0, e.couleur);
        deg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.globalAlpha = k * k * 0.55;
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = deg;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }

    const liste = gameState._alertes;
    if (!liste || !liste.length) return;
    const marge = 34;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < liste.length; i++) {
        const a = liste[i];
        const b = a.body;
        if (!b) continue;
        const fondu = 1 - a.age / a.duree;
        const bat = 0.5 + 0.5 * Math.sin(a.age * 9);
        const sx = (b.x - cam.x) * cam.zoom + w / 2;
        const sy = (b.y - cam.y) * cam.zoom + h / 2;
        const dedans = sx > marge && sx < w - marge && sy > marge && sy < h - marge;
        ctx.globalAlpha = fondu * (0.4 + 0.6 * bat);
        if (dedans) {
            /* L'astre est sous les yeux : un anneau qui se resserre suffit.
               Double trait, le sombre dessous : sans lui l'anneau se perd sur
               une planete claire. */
            const r = (b.radius || 10) * cam.zoom + 12 + (1 - bat) * 12;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.strokeStyle = a.couleur;
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            const ang = Math.atan2(sy - h / 2, sx - w / 2);
            const pt = _bordEcran(ang, w, h, marge);
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.fillStyle = a.couleur;
            /* Lueur, puis le fer de fleche tourne vers l'exterieur. */
            ctx.globalAlpha = fondu * 0.16 * bat;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = fondu * (0.45 + 0.55 * bat);
            ctx.rotate(ang);
            ctx.beginPath();
            ctx.moveTo(16, 0);
            ctx.lineTo(-6, -10);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-6, 10);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(-ang);
            /* Le signe se pose en retrait, vers l'interieur de l'ecran. */
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(ALERTE_GENRES[a.genre].signe, -Math.cos(ang) * 20, -Math.sin(ang) * 20);
            ctx.restore();
        }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

/* Demande de construction, quelle que soit la porte d'entree : menu radial,
   barre du panneau, fiche, ou les touches 1 2 3. Le batiment sort a l'image
   suivante si l'astre peut payer ; sinon rien n'est mis en attente et l'ecran
   vibre. Il n'y a donc plus d'etat "chantier en attente" - c'est ce que
   marquait l'icone ADN, qui disparait. */

