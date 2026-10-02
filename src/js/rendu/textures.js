// ─────────────────────────────────────────────
// TEXTURES PROCÉDURALES (canvas hors-écran)
// ─────────────────────────────────────────────
/* Les surfaces sont peintes pixel par pixel, UNE FOIS au chargement, sur une
   vraie sphere : chaque pixel du disque retrouve son point de la sphere, et
   la couleur vient d'un bruit 3D pris en ce point. Les motifs se courbent
   donc vers le bord, sans couture ni etirement. Pendant la partie, rien ne
   change : on pose une image deja faite (et sa copie a la bonne taille,
   voir _niveauxTexture), exactement comme avant. L'eclairage (jour / nuit)
   est un calque a part tourne vers le soleil (lumiereSprite) : les textures
   n'ont qu'un assombrissement symetrique du bord. */

/* Bruit de Perlin 3D, a graine : rend entre -1 et 1 environ. */
function _bruitPerlin(seed) {
    const rng = mulberry32(seed);
    const P = new Uint8Array(512);
    for (let i = 0; i < 256; i++) P[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const grad = function (h, x, y, z) {
        switch (h & 15) {
            case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
            case 4: return x + z; case 5: return -x + z; case 6: return x - z; case 7: return -x - z;
            case 8: return y + z; case 9: return -y + z; case 10: return y - z; case 11: return -y - z;
            case 12: return x + y; case 13: return -x + y; case 14: return -y + z; default: return -y - z;
        }
    };
    const n = function (x, y, z) {
        const fx = Math.floor(x), fy = Math.floor(y), fz = Math.floor(z);
        const X = fx & 255, Y = fy & 255, Z = fz & 255;
        x -= fx; y -= fy; z -= fz;
        const u = x * x * x * (x * (x * 6 - 15) + 10);
        const v = y * y * y * (y * (y * 6 - 15) + 10);
        const w = z * z * z * (z * (z * 6 - 15) + 10);
        const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z;
        const B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
        const x1 = x - 1, y1 = y - 1, z1 = z - 1;
        const g000 = grad(P[AA], x, y, z), g100 = grad(P[BA], x1, y, z);
        const g010 = grad(P[AB], x, y1, z), g110 = grad(P[BB], x1, y1, z);
        const g001 = grad(P[AA + 1], x, y, z1), g101 = grad(P[BA + 1], x1, y, z1);
        const g011 = grad(P[AB + 1], x, y1, z1), g111 = grad(P[BB + 1], x1, y1, z1);
        const a0 = g000 + u * (g100 - g000), a1 = g010 + u * (g110 - g010);
        const b0 = g001 + u * (g101 - g001), b1 = g011 + u * (g111 - g011);
        const c0 = a0 + v * (a1 - a0), c1 = b0 + v * (b1 - b0);
        return c0 + w * (c1 - c0);
    };
    /* Somme d'octaves : les grandes formes, puis des details de plus en plus fins. */
    n.fbm = function (x, y, z, oct) {
        let s = 0, a = 0.5, f = 1;
        for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f, z * f); f *= 2.03; a *= 0.5; }
        return s;
    };
    /* Cretes : des lignes fines (failles, fissures, chaines de montagnes). */
    n.cretes = function (x, y, z, oct) {
        let s = 0, a = 0.5, f = 1;
        for (let i = 0; i < oct; i++) { const r = 1 - Math.abs(n(x * f, y * f, z * f)); s += a * r * r; f *= 2.1; a *= 0.5; }
        return s;
    };
    return n;
}

/* Une rampe de couleurs [[t, r, g, b], ...] en table de 256 teintes. */
function _rampe(points) {
    const T = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
        const t = i / 255;
        let k = 0;
        while (k < points.length - 2 && t > points[k + 1][0]) k++;
        const a = points[k], b = points[k + 1];
        const f = Math.max(0, Math.min(1, (t - a[0]) / ((b[0] - a[0]) || 1)));
        T[i * 3] = a[1] + (b[1] - a[1]) * f;
        T[i * 3 + 1] = a[2] + (b[2] - a[2]) * f;
        T[i * 3 + 2] = a[3] + (b[3] - a[3]) * f;
    }
    return T;
}
function _lissePas(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

/* Des cratères poses sur la sphere : [x, y, z, rayon angulaire (cos), taille]. */
function _crateres(rng, nb, tMin, tMax) {
    const L = [];
    for (let i = 0; i < nb; i++) {
        const z = rng() * 2 - 1, a = rng() * Math.PI * 2, s = Math.sqrt(1 - z * z);
        /* Beaucoup de petits, peu de grands. */
        const t = tMin + (tMax - tMin) * Math.pow(rng(), 2.6);
        L.push([s * Math.cos(a), s * Math.sin(a), z, t]);
    }
    return L;
}
/* Relief d'un cratere a la distance d (en rayons) de son centre :
   fond creuse, rebord clair, ejectas qui s'estompent. */
function _profilCratere(d) {
    if (d < 0.8) return -0.35 + 0.15 * d * d;
    if (d < 1.0) return -0.25 + (d - 0.8) * 3.3;           /* remontee vers le rebord */
    if (d < 1.15) return 0.42 - (d - 1.0) * 2.4;            /* rebord */
    if (d < 1.8) return 0.06 * (1.8 - d);                   /* ejectas */
    return 0;
}

/* Un chantier de peinture d'une sphere : f(X, Y, Z, px, nz) ecrit la couleur
   dans px[0..2] (0-255) pour le point (X, Y, Z) de la sphere, deja tournee
   (nz : 1 au centre du disque, 0 au bord).
   Bord adouci, bord assombri (limbe), teinte d'atmosphere au bord si
   demande. Le chantier avance ligne par ligne : on peut le finir d'un coup,
   ou par petits morceaux entre deux images (voir _peintreFond). */
function _etatSphere(size, seed, f, atmo, limbe, D) {
    const h = size / 2;
    /* Axe du globe un peu incline, different pour chaque astre. */
    const rng = mulberry32(seed ^ 0x5bd1e995);
    const ax = (rng() - 0.5) * 0.9, az = rng() * Math.PI * 2;
    return { size: size, f: f, atmo: atmo, D: D, h: h, r: h - 1, y: 0, px: [0, 0, 0],
             cx: Math.cos(ax), sx: Math.sin(ax), cz: Math.cos(az), sz: Math.sin(az),
             lim: limbe === undefined ? 0.55 : limbe };
}
/* Peint des lignes jusqu'a l'heure limite (ms, performance.now) ; vrai quand c'est fini. */
function _peindreLignes(S, limite) {
    const size = S.size, h = S.h, r = S.r, D = S.D, f = S.f, atmo = S.atmo, px = S.px, lim = S.lim;
    const cx = S.cx, sx = S.sx, cz = S.cz, sz = S.sz;
    for (; S.y < size; S.y++) {
        const y = S.y;
        const ny = (y + 0.5 - h) / r;
        for (let x = 0; x < size; x++) {
            const nx = (x + 0.5 - h) / r;
            const d2 = nx * nx + ny * ny;
            if (d2 > 1.02) continue;
            const nz = Math.sqrt(Math.max(0, 1 - d2));
            /* Rotation : autour de x (inclinaison), puis de l'axe (longitude). */
            const y1 = ny * cx - nz * sx, z1 = ny * sx + nz * cx;
            const X = nx * cz - z1 * sz, Z = nx * sz + z1 * cz, Y = y1;
            f(X, Y, Z, px, nz);
            /* Limbe : le bord recoit la lumiere de biais. */
            const k = (1 - lim) + lim * Math.pow(nz, 0.45);
            let R = px[0] * k, G = px[1] * k, B = px[2] * k;
            if (atmo) {
                const a = Math.pow(1 - nz, 2.2) * atmo[3];
                R += (atmo[0] - R) * a; G += (atmo[1] - G) * a; B += (atmo[2] - B) * a;
            }
            const i = (y * size + x) * 4;
            D[i] = R; D[i + 1] = G; D[i + 2] = B;
            /* Bord anticrenele sur un pixel et demi. */
            D[i + 3] = 255 * Math.max(0, Math.min(1, (1 - Math.sqrt(d2)) * r * 0.7 + 0.5));
        }
        if ((y & 3) === 3 && performance.now() > limite) { S.y++; return false; }
    }
    return true;
}
/* FIREFOX : une seule grande image (128 pixels et plus) suffisait a faire
   disparaitre peu a peu tous les astres (signale par le createur ; les
   petites images, elles, vont tres bien). Firefox confie les grands canevas
   a la carte graphique : on lui demande de garder ceux des textures en
   memoire ordinaire, comme les petits (willReadFrequently). ?tex=gpu pour
   revenir a l'ancien comportement. */
/* Interrupteurs d'essai, dans l'adresse : ?travailleur=0 peint la haute
   definition sans Worker ; ?hd=0 garde les textures legeres ;
   ?tex=memoire / gpu / bitmap : ou vivent les grandes textures. */
const _essaiTex = new URLSearchParams(location.search);
const _texFirefox = /Firefox\//.test(navigator.userAgent);
function _ctxTex(c) {
    if ((_texFirefox || _essaiTex.get('tex') === 'memoire') && _essaiTex.get('tex') !== 'gpu') {
        return c.getContext('2d', { willReadFrequently: true });
    }
    return c.getContext('2d');
}
/* Une image de texture rendue au navigateur (canevas ou ImageBitmap). */
function _libererTex(t) {
    if (!t) return;
    if (t.close) t.close(); else { t.width = 0; t.height = 0; }
}
function _chantierSphere(size, seed, f, atmo, limbe) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = _ctxTex(c);
    const img = ctx.createImageData(size, size);
    const S = _etatSphere(size, seed, f, atmo, limbe, img.data);
    return {
        /* Peint jusqu'a l'heure limite ; rend la toile finie, ou null. */
        avancer: function (limite) {
            if (!_peindreLignes(S, limite)) return null;
            ctx.putImageData(img, 0, 0);
            return c;
        }
    };
}

/* LA HAUTE DEFINITION EN ARRIERE-PLAN. Au chargement, chaque astre recoit
   une texture legere (1,2 pixel par unite, vite peinte). La grande (3 pixels
   par unite, pour plonger sur l'astre) se peint ensuite par petits morceaux,
   seulement quand le navigateur n'a rien d'autre a faire : l'image suivante
   n'attend jamais. Les astres proches de la camera passent d'abord. */
const _fileHD = [];
let _peintreActif = false;
function _texturer(b, size, seed, f, atmo, limbe) {
    const petit = Math.max(12, Math.min(size, Math.floor(b.radius * 1.2)));
    const c = _chantierSphere(petit, seed, f, atmo, limbe).avancer(Infinity);
    b._texture = c;
    /* Copies reduites pour les soleils seulement (grands et lisses). Pour
       les planetes et les lunes, une seule image, comme avant : Firefox
       supporte mal des centaines de petits canevas (astres invisibles). */
    b._niveaux = b.type === 'sun' ? _niveauxTexture(c) : null;
    b._recetteHD = null; b._petit = null; b._hd = false;
    if (size > petit && _essaiTex.get('hd') !== '0') {
        const R = { size: size, seed: seed, f: f, atmo: atmo, limbe: limbe };
        if (b.type === 'sun') {
            b._travailHD = Object.assign({ chantier: null }, R);
            if (_fileHD.indexOf(b) < 0) _fileHD.push(b);
            _lancerPeintre();
        } else {
            /* Planetes et lunes : la haute definition seulement quand on les
               regarde de pres (majHD), la version legere gardee a cote. */
            b._recetteHD = R;
            b._petit = c;
            b._travailHD = null;
        }
    } else b._travailHD = null;
}

/* LA HAUTE DEFINITION A LA DEMANDE. Firefox n'affiche plus les astres quand
   il y a trop de grandes images a la fois (une par planete : plus de 150
   sur une grande carte ; signale par le createur, planetes qui
   disparaissent une a une). La version legere suffit tant qu'on ne zoome
   pas : la grande ne se peint que pour l'astre a l'ecran affiche plus grand
   que sa version legere, et HD_MAX au plus sont gardees ; au-dela, celles
   hors de l'ecran les plus lointaines repassent en legere. Moins de memoire
   dans tous les navigateurs. */
const HD_MAX = 10;
let _hdTour = 0;
function majHD() {
    if (++_hdTour % 10) return;
    const cam = gameState.camera;
    if (!cam || !gameState.planets || gameState.phase === 'title') return;
    const k = cam.zoom * echelleRendu();
    const liste = gameState.planets.concat(gameState.moons);
    let nbHD = 0;
    for (const b of liste) {
        if (b._hd) { nbHD++; continue; }
        if (!b._recetteHD || b._travailHD || !b._petit) continue;
        if (aLEcran(b.x, b.y, b.radius) && b.radius * 2 * k > b._petit.width * 1.3) {
            b._travailHD = Object.assign({ chantier: null }, b._recetteHD);
            if (_fileHD.indexOf(b) < 0) _fileHD.push(b);
            _lancerPeintre();
        }
    }
    if (nbHD <= HD_MAX) return;
    const hd = [];
    for (const b of liste) if (b._hd && !aLEcran(b.x, b.y, b.radius)) hd.push(b);
    hd.sort(function (u, v) { return Math.hypot(v.x - cam.x, v.y - cam.y) - Math.hypot(u.x - cam.x, u.y - cam.y); });
    for (let i = 0; i < hd.length && nbHD > HD_MAX; i++, nbHD--) {
        const b = hd[i], t = b._texture;
        b._texture = b._petit;
        b._hd = false;
        if (t && t !== b._petit) _libererTex(t);
    }
}
/* LE TRAVAILLEUR. La haute definition se peint dans un Worker : un fil a
   part, qui tourne a cote du jeu sans jamais lui prendre une image. Il
   recoit le code des recettes (createPlanetTexture & co, tels quels : seul
   _texturer y change, il retient la recette au lieu de peindre), refait la
   recette de l'astre et rend les pixels. Navigateur sans Worker, ou erreur :
   on repasse a la peinture par petits morceaux (_peintreFond). */
let _travailleur = null, _travailleurKo = _essaiTex.get('travailleur') === '0', _tEnCours = null, _tNumero = 0;
function _texTravailleur() {
    if (_travailleur || _travailleurKo) return _travailleur;
    /* FIREFOX : les textures venues du Worker n'y apparaissent pas (astres
       qui disparaissent un par un, signale par le createur ; avant le
       Worker, tout allait bien). On y garde la peinture par petits morceaux,
       comme avant. */
    if (/Firefox\//.test(navigator.userAgent) && _essaiTex.get('travailleur') !== '1') { _travailleurKo = true; return null; }
    try {
        const outils = [mulberry32, _bruitPerlin, _rampe, _lissePas, _crateres, _profilCratere, _hexRgb,
                        _etatSphere, _peindreLignes, createPlanetTexture, createMoonTexture, createSunTexture];
        const src = outils.map(String).join('\n') + `
let _recette = null;
function _texturer(b, size, seed, f, atmo, limbe) { _recette = { size: size, seed: seed, f: f, atmo: atmo, limbe: limbe }; }
onmessage = function (e) {
    const m = e.data, b = m.astre;
    _recette = null;
    if (b.type === 'sun') createSunTexture(b); else if (b.type === 'moon') createMoonTexture(b); else createPlanetTexture(b);
    const R = _recette, D = new Uint8ClampedArray(R.size * R.size * 4);
    _peindreLignes(_etatSphere(R.size, R.seed, R.f, R.atmo, R.limbe, D), Infinity);
    postMessage({ id: m.id, size: R.size, data: D.buffer }, [D.buffer]);
};`;
        const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        _travailleur = new Worker(url);
        _travailleur.onmessage = _texRecue;
        _travailleur.onerror = function () {
            _travailleurKo = true;
            try { _travailleur.terminate(); } catch (e) {}
            _travailleur = null; _tEnCours = null;
            _lancerPeintre();
        };
    } catch (e) { _travailleurKo = true; _travailleur = null; }
    return _travailleur;
}
/* Le prochain astre a peindre : celui qu'on regarde de pres (le plus grand
   a l'ecran), puis celui deja entame, puis le plus proche de la camera. */
function _choisirTravail(urgent) {
    let k = -1;
    if (urgent.length) {
        let best = null;
        for (const b of urgent) if (_fileHD.indexOf(b) >= 0 && (!best || b.radius > best.radius)) best = b;
        k = best ? _fileHD.indexOf(best) : -1;
    }
    if (k < 0) k = _fileHD.findIndex(function (b) { return b._travailHD && b._travailHD.chantier; });
    if (k < 0) {
        const cam = gameState.camera;
        let bd = Infinity;
        for (let i = 0; i < _fileHD.length; i++) {
            const d = cam ? Math.hypot(_fileHD[i].x - cam.x, _fileHD[i].y - cam.y) : i;
            if (d < bd) { bd = d; k = i; }
        }
    }
    return k;
}
function _astreEnJeu(b) {
    return gameState.planets.indexOf(b) >= 0 || gameState.moons.indexOf(b) >= 0 || gameState.suns.indexOf(b) >= 0;
}
/* La haute definition arrive : elle remplace la version legere, rendue
   aussitot au navigateur. */
function _poserHD(b, c) {
    const ancien = b._texture, anciens = b._niveaux;
    b._texture = c;
    b._niveaux = b.type === 'sun' ? _niveauxTexture(c) : null;
    b._travailHD = null;
    const k = _fileHD.indexOf(b);
    if (k >= 0) _fileHD.splice(k, 1);
    /* Planete ou lune : la version legere reste (retour quand on s'eloigne). */
    if (b._recetteHD) {
        b._hd = true;
        if (ancien && ancien !== c && ancien !== b._petit) _libererTex(ancien);
        /* FIREFOX : la grande image devient une ImageBitmap. En canevas, elle
           s'affichait puis disparaissait, et les autres astres avec (essais
           du createur : seule l'ImageBitmap tient). ?tex=bitmap pour le
           forcer ailleurs, ?tex=canevas pour s'en passer. */
        const bitmap = (_texFirefox || _essaiTex.get('tex') === 'bitmap') && _essaiTex.get('tex') !== 'canevas';
        if (bitmap && window.createImageBitmap && c.getContext) {
            createImageBitmap(c).then(function (bm) {
                if (b._texture === c) { b._texture = bm; _libererTex(c); } else bm.close();
            });
        }
        return;
    }
    if (ancien && ancien !== c) { ancien.width = 0; ancien.height = 0; }
    if (anciens) for (const n of anciens) if (n !== ancien && n !== c) { n.width = 0; n.height = 0; }
}
function _envoyerTravail() {
    while (_fileHD.length) {
        const k = _choisirTravail(_fileHD.filter(_texUrgente));
        const b = _fileHD[k];
        if (!b._travailHD || !_astreEnJeu(b)) { _fileHD.splice(k, 1); continue; }
        const id = ++_tNumero;
        _tEnCours = { id: id, b: b, T: b._travailHD };
        _travailleur.postMessage({ id: id, astre: { type: b.type, name: b.name, radius: b.radius, orbitRadius: b.orbitRadius, color: b.color } });
        return;
    }
}
function _texRecue(e) {
    const m = e.data, en = _tEnCours;
    if (!en || en.id !== m.id) return;
    _tEnCours = null;
    const b = en.b;
    /* Texture refaite entre-temps, ou partie finie : on laisse. */
    if (b._travailHD === en.T && _astreEnJeu(b)) {
        try {
            const c = document.createElement('canvas');
            c.width = c.height = m.size;
            _ctxTex(c).putImageData(new ImageData(new Uint8ClampedArray(m.data), m.size, m.size), 0, 0);
            _poserHD(b, c);
        } catch (err) {
            b._travailHD = null;
            const k = _fileHD.indexOf(b);
            if (k >= 0) _fileHD.splice(k, 1);
        }
    }
    _lancerPeintre();
}

/* Un astre a l'ecran, affiche nettement plus grand que sa texture : on le
   regarde de pres, il passe avant tout le reste. */
function _texUrgente(b) {
    const cam = gameState.camera;
    if (!cam || !b._texture || gameState.phase !== 'game') return false;
    return aLEcran(b.x, b.y, b.radius) && b.radius * 2 * cam.zoom * echelleRendu() > b._texture.width * 1.3;
}
function _lancerPeintre() {
    if (!_fileHD.length) return;
    if (_texTravailleur()) { if (!_tEnCours) _envoyerTravail(); return; }
    if (_peintreActif) return;
    _peintreActif = true;
    /* Un astre regarde de pres attend : on revient a l'image suivante. */
    if (_fileHD.some(_texUrgente)) setTimeout(_peintreFond, 16);
    else if (window.requestIdleCallback) requestIdleCallback(_peintreFond, { timeout: 400 });
    else setTimeout(_peintreFond, 40);
}
function _peintreFond(deadline) {
    _peintreActif = false;
    /* Un temps libre (6 ms au plus) ; pas de temps libre depuis 0,4 s (jeu
       charge) : 3 ms quand meme ; un astre regarde de pres : 8 ms. */
    const urgent = _fileHD.filter(_texUrgente);
    const dispo = urgent.length ? 8 : deadline && deadline.timeRemaining && !deadline.didTimeout ? Math.min(6, deadline.timeRemaining()) : 3;
    const limite = performance.now() + Math.max(1, dispo);
    while (_fileHD.length && performance.now() < limite) {
        /* D'abord l'astre regarde de pres (le plus grand a l'ecran), puis
           celui deja entame, puis le plus proche de la camera. */
        const k = _choisirTravail(urgent);
        const b = _fileHD[k], T = b._travailHD;
        /* Astre d'une partie finie, ou texture refaite depuis : on laisse. */
        if (!T || !_astreEnJeu(b)) { _fileHD.splice(k, 1); continue; }
        let c = null;
        try {
            if (!T.chantier) T.chantier = _chantierSphere(T.size, T.seed, T.f, T.atmo, T.limbe);
            c = T.chantier.avancer(limite);
        } catch (e) {
            /* Le navigateur refuse (memoire) : on garde la version legere. */
            b._travailHD = null;
            _fileHD.splice(k, 1);
            continue;
        }
        if (c) _poserHD(b, c);
    }
    _lancerPeintre();
}

/* Copies de plus en plus petites, pour poser l'image a la bonne taille
   (meme principe que les soleils) : moins cher et sans scintillement. */
function _niveauxTexture(c) {
    const niveaux = [c];
    while (niveaux[niveaux.length - 1].width >= 48) {
        const src = niveaux[niveaux.length - 1];
        const d = document.createElement('canvas');
        d.width = d.height = src.width >> 1;
        d.getContext('2d').drawImage(src, 0, 0, d.width, d.height);
        niveaux.push(d);
    }
    return niveaux;
}
/* Pose un astre avec la copie la plus proche de sa taille a l'ecran. */
const _TEINTE_ASTRE = { ocean: '#2A5F9E', desert: '#C49A5A', gas: '#C9A27A', ice: '#B8D4E8', rocky: '#8B7355',
                        rock: '#9A9AAA', dark: '#4A4A55', volcanic: '#6A4A3A' };
/* Une image posee sur le rectangle (x, y, w, h) du monde, en ne gardant que
   la partie a l'ecran quand elle devient immense : zoome tres fort sur un
   soleil, Firefox n'affichait plus rien. */
function dessinerVisible(ctx, img, x, y, w, h) {
    const m = ctx.getTransform();
    if (Math.abs(w * m.a) < 3000 || m.b !== 0 || m.c !== 0) { ctx.drawImage(img, x, y, w, h); return; }
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const x0 = Math.max(x, -m.e / m.a), x1 = Math.min(x + w, (W - m.e) / m.a);
    const y0 = Math.max(y, -m.f / m.d), y1 = Math.min(y + h, (H - m.f) / m.d);
    if (x1 <= x0 || y1 <= y0) return;
    const iw = img.width, ih = img.height;
    const u0 = (x0 - x) / w * iw, u1 = (x1 - x) / w * iw, v0 = (y0 - y) / h * ih, v1 = (y1 - y) / h * ih;
    ctx.drawImage(img, u0, v0, Math.max(0.01, u1 - u0), Math.max(0.01, v1 - v0), x0, y0, x1 - x0, y1 - y0);
}
function poserTexture(ctx, b, pxParUnite) {
    let img = b._texture;
    const niv = b._niveaux;
    if (niv) {
        const px = b.radius * 2 * pxParUnite;
        let k = 0;
        while (k + 1 < niv.length && niv[k + 1].width >= px) k++;
        img = niv[k];
    }
    try {
        if (!img || !img.width) throw 0;
        dessinerVisible(ctx, img, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
    } catch (e) {
        /* Image indisponible : l'astre reste visible, en couleur unie. */
        ctx.fillStyle = _TEINTE_ASTRE[b.planetType || b.moonType] || '#8888AA';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createPlanetTexture(planet) {
    /* 3 pixels par unite (pour plonger sur l'astre), 512 au plus. */
    const size = Math.min(512, Math.max(Math.floor(planet.radius * 2 * 3), 16));

    // Type de planète basé sur le nom (seed déterministe)
    const _pn = planet.name || '';
    const seed = (_pn.charCodeAt(0)||17) + (_pn.charCodeAt(1)||31) * 7 + Math.round((planet.orbitRadius||100) * 3 + (planet.radius||15) * 11);
    const types = ['rocky','ocean','desert','gas','ice'];
    planet.planetType = types[seed % types.length];
    const rng = mulberry32(seed);
    const N = _bruitPerlin(seed);
    const N2 = _bruitPerlin(seed + 7919);
    const o = rng() * 100;                  /* decalage : deux planetes du meme type different */
    let f, atmo = null, limbe = 0.55;

    if (planet.planetType === 'ocean') {
        const mer = _rampe([[0, 8, 26, 70], [0.55, 16, 62, 128], [0.85, 28, 112, 168], [1, 70, 170, 190]]);
        const terre = _rampe([[0, 200, 184, 130], [0.06, 92, 140, 62], [0.3, 46, 100, 48], [0.55, 110, 98, 66], [0.78, 150, 140, 128], [0.9, 236, 240, 244], [1, 250, 252, 255]]);
        const niveauMer = 0.02 + rng() * 0.08;
        f = function (X, Y, Z, p) {
            const qx = N2.fbm(X * 1.3 + o, Y * 1.3, Z * 1.3, 2) * 0.7;
            const hgt = N.fbm(X * 1.9 + qx + o, Y * 1.9 + qx, Z * 1.9, 6);
            let r, g, b;
            if (hgt < niveauMer) {
                const t = Math.max(0, Math.min(255, 255 + (hgt - niveauMer) * 900)) | 0;
                r = mer[t * 3]; g = mer[t * 3 + 1]; b = mer[t * 3 + 2];
            } else {
                const t = Math.min(255, (hgt - niveauMer) * 560) | 0;
                r = terre[t * 3]; g = terre[t * 3 + 1]; b = terre[t * 3 + 2];
            }
            /* Calottes polaires. */
            const pole = _lissePas(0.74, 0.86, Math.abs(Y) + N.fbm(X * 4, Y * 4, Z * 4, 3) * 0.12);
            r += (238 - r) * pole; g += (244 - g) * pole; b += (250 - b) * pole;
            /* Nuages, etires le long des paralleles. */
            const nu = N2.fbm(X * 2.2 + o, Y * 5.5, Z * 2.2 + qx, 4);
            const a = _lissePas(0.02, 0.32, nu) * 0.88;
            p[0] = r + (245 - r) * a; p[1] = g + (248 - g) * a; p[2] = b + (252 - b) * a;
        };
        atmo = [90, 160, 255, 0.55];
    } else if (planet.planetType === 'desert') {
        const sable = _rampe([[0, 110, 60, 30], [0.35, 176, 118, 60], [0.65, 214, 168, 98], [1, 238, 210, 158]]);
        f = function (X, Y, Z, p) {
            const hgt = N.fbm(X * 1.6 + o, Y * 1.6, Z * 1.6, 5);
            let t = Math.max(0, Math.min(255, (hgt * 0.9 + 0.5) * 255)) | 0;
            let r = sable[t * 3], g = sable[t * 3 + 1], b = sable[t * 3 + 2];
            /* Dunes : de fines ondulations qui suivent le vent. */
            const du = Math.sin((X * 38 + Y * 12 + N2.fbm(X * 3, Y * 3, Z * 3, 3) * 9) ) * 0.5 + 0.5;
            const kd = 0.92 + du * 0.1;
            r *= kd; g *= kd; b *= kd;
            /* Canyons sombres. */
            const ca = _lissePas(0.7, 0.8, N2.cretes(X * 2.4 + o, Y * 2.4, Z * 2.4, 4));
            r += (96 - r) * ca * 0.55; g += (52 - g) * ca * 0.55; b += (30 - b) * ca * 0.55;
            const pole = _lissePas(0.86, 0.94, Math.abs(Y) + hgt * 0.1);
            p[0] = r + (240 - r) * pole; p[1] = g + (232 - g) * pole; p[2] = b + (220 - b) * pole;
        };
        atmo = [230, 170, 110, 0.3];
    } else if (planet.planetType === 'gas') {
        /* Bandes irregulieres : un profil tire au hasard, deforme par la turbulence. */
        const violet = rng() >= 0.5;
        const pal = !violet
            ? _rampe([[0, 120, 72, 42], [0.3, 176, 122, 78], [0.55, 222, 186, 140], [0.8, 240, 222, 190], [1, 196, 150, 104]])
            : _rampe([[0, 90, 88, 120], [0.3, 150, 140, 170], [0.6, 210, 196, 206], [1, 170, 130, 150]]);
        const profil = new Float32Array(64);
        for (let i = 0; i < 64; i++) profil[i] = rng();
        const tl = -0.25 - rng() * 0.3, tg = rng() * Math.PI * 2;   /* latitude, longitude de la tempete */
        const tache = [Math.cos(tg) * Math.sqrt(1 - tl * tl), tl, Math.sin(tg) * Math.sqrt(1 - tl * tl)];
        f = function (X, Y, Z, p) {
            const tu = N.fbm(X * 2.5 + o, Y * 9, Z * 2.5, 4);
            const lat = Y + tu * 0.06;
            let bi = (lat * 0.5 + 0.5) * 22;
            const i0 = Math.max(0, Math.min(63, Math.floor(bi))), i1 = Math.min(63, i0 + 1), fr = bi - Math.floor(bi);
            let v = profil[i0] + (profil[i1] - profil[i0]) * fr * fr * (3 - 2 * fr);
            v += N2.fbm(X * 6 + o, Y * 30, Z * 6, 3) * 0.12;
            /* La grande tempete : un ovale tourbillonnant. */
            /* Distance a la tempete, ecrasee en latitude : un ovale. */
            const dy = (Y - tache[1]) * 2.2;
            const dh = 1 - (X * tache[0] + Z * tache[2]) / (Math.sqrt(1 - tache[1] * tache[1]) * Math.sqrt(Math.max(1e-6, 1 - Y * Y)));
            const dt = Math.sqrt(dy * dy + Math.max(0, dh) * 1.4);
            const dx = Math.sqrt(Math.max(0, dh)) * Math.sign(X * tache[2] - Z * tache[0]);
            if (dt < 0.28) {
                const k = _lissePas(0.28, 0.1, dt);
                v = v * (1 - k) + (0.1 + 0.08 * Math.sin(Math.atan2(dy, dx) * 3 + dt * 40)) * k;
            }
            const t = Math.max(0, Math.min(255, v * 255)) | 0;
            p[0] = pal[t * 3]; p[1] = pal[t * 3 + 1]; p[2] = pal[t * 3 + 2];
        };
        atmo = violet ? [200, 190, 230, 0.25] : [220, 200, 170, 0.25];
        limbe = 0.65;
        planet._anneauViolet = violet;
    } else if (planet.planetType === 'ice') {
        const glace = _rampe([[0, 84, 128, 176], [0.35, 140, 182, 216], [0.7, 200, 224, 240], [1, 244, 250, 255]]);
        f = function (X, Y, Z, p) {
            const hgt = N.fbm(X * 1.7 + o, Y * 1.7, Z * 1.7, 5);
            const t = Math.max(0, Math.min(255, (hgt * 1.1 + 0.5) * 255)) | 0;
            let r = glace[t * 3], g = glace[t * 3 + 1], b = glace[t * 3 + 2];
            /* Failles : de longues lignes bleu profond, et d'autres plus fines. */
            const fa = _lissePas(0.76, 0.88, N2.cretes(X * 2 + o, Y * 2, Z * 2, 3));
            const fb = _lissePas(0.8, 0.9, N.cretes(X * 5, Y * 5 + o, Z * 5, 2));
            const k = Math.min(1, fa * 0.9 + fb * 0.5);
            p[0] = r + (36 - r) * k; p[1] = g + (86 - g) * k; p[2] = b + (140 - b) * k;
        };
        atmo = [170, 220, 255, 0.45];
    } else {
        /* Rocheuse : plaines et hauts plateaux, montagnes et crateres. */
        const roc = rng() < 0.5
            ? _rampe([[0, 60, 38, 28], [0.4, 132, 84, 56], [0.7, 178, 122, 82], [1, 218, 176, 134]])
            : _rampe([[0, 52, 48, 46], [0.4, 118, 104, 90], [0.7, 160, 144, 124], [1, 206, 194, 176]]);
        const cr = _crateres(rng, 40, 0.025, 0.2);
        f = function (X, Y, Z, p) {
            let hgt = N.fbm(X * 1.8 + o, Y * 1.8, Z * 1.8, 6) * 0.9 + 0.5;
            hgt += (N2.cretes(X * 3 + o, Y * 3, Z * 3, 4) - 0.5) * 0.25;
            for (let i = 0; i < cr.length; i++) {
                const q = cr[i];
                const dd = 1 - (X * q[0] + Y * q[1] + Z * q[2]);      /* ~ angle^2 / 2 */
                if (dd > q[3] * q[3] * 1.7) continue;
                hgt += _profilCratere(Math.sqrt(dd * 2) / q[3]) * 0.8;
            }
            const t = Math.max(0, Math.min(255, hgt * 255)) | 0;
            p[0] = roc[t * 3]; p[1] = roc[t * 3 + 1]; p[2] = roc[t * 3 + 2];
        };
        atmo = [200, 150, 110, 0.15];
    }
    _texturer(planet, size, seed, f, atmo, limbe);
    const atmoColors = {
        ocean: 'rgba(60, 140, 255, 0.14)',
        ice: 'rgba(150, 210, 255, 0.12)',
        gas: 'rgba(200, 160, 100, 0.08)',
        rocky: null,
        desert: null
    };
    const atmoCol = atmoColors[planet.planetType];
    if (atmoCol) {
        planet._hasAtmosphere = true;
        planet._atmoColor = atmoCol;
    }
    // Anneaux pour gazeuses
    if (planet.planetType === 'gas') {
        planet._hasRings = true;
        const violet = planet._anneauViolet;
        planet._ringColor1 = violet ? 'rgba(200,186,210,0.28)' : 'rgba(221,190,150,0.28)';
        planet._ringColor2 = violet ? 'rgba(150,130,170,0.14)' : 'rgba(176,130,90,0.14)';
        planet._ringTilt = 0.3 + rng() * 0.4;
    }
}

function createMoonTexture(moon) {
    const size = Math.min(320, Math.max(Math.floor(moon.radius * 2 * 3), 10));
    // Type de lune (seed déterministe)
    const _mn = moon.name || '';
    const seed = (_mn.charCodeAt(0)||13) + (_mn.charCodeAt(1)||29) * 3 + Math.round((moon.orbitRadius||50) * 5 + (moon.radius||8) * 17);
    const rng = mulberry32(seed);
    const moonTypes = ['rock', 'ice', 'dark', 'volcanic'];
    moon.moonType = moonTypes[seed % moonTypes.length];
    const N = _bruitPerlin(seed);
    const o = rng() * 100;
    let f;
    if (moon.moonType === 'volcanic') {
        /* Monde de lave : basalte sombre, fissures et lacs incandescents. */
        const cr = _crateres(rng, 10, 0.05, 0.16);
        f = function (X, Y, Z, p) {
            const hgt = N.fbm(X * 2 + o, Y * 2, Z * 2, 5);
            let v = 0.35 + hgt * 0.5;
            let r = 70 + v * 60, g = 48 + v * 36, b = 38 + v * 26;
            const fi = _lissePas(0.74, 0.88, N.cretes(X * 2.6, Y * 2.6 + o, Z * 2.6, 3));
            let lave = fi;
            for (let i = 0; i < cr.length; i++) {
                const q = cr[i];
                const dd = 1 - (X * q[0] + Y * q[1] + Z * q[2]);
                if (dd > q[3] * q[3] * 0.9) continue;
                lave = Math.max(lave, _lissePas(q[3] * q[3] * 0.9, q[3] * q[3] * 0.3, dd));
            }
            p[0] = r + (255 - r) * lave; p[1] = g + (130 - g) * lave * (0.6 + 0.4 * lave); p[2] = b + (30 - b) * lave;
        };
    } else if (moon.moonType === 'ice') {
        /* Glace striee de longues lignes brun-rouge, peu de crateres. */
        const cr = _crateres(rng, 6, 0.04, 0.12);
        f = function (X, Y, Z, p) {
            const hgt = N.fbm(X * 2 + o, Y * 2, Z * 2, 4);
            let r = 196 + hgt * 50, g = 214 + hgt * 40, b = 230 + hgt * 30;
            const li = _lissePas(0.78, 0.9, N.cretes(X * 2.2 + o, Y * 2.2, Z * 2.2, 3));
            r += (150 - r) * li * 0.9; g += (86 - g) * li * 0.9; b += (70 - b) * li * 0.9;
            let rel = 0;
            for (let i = 0; i < cr.length; i++) {
                const q = cr[i];
                const dd = 1 - (X * q[0] + Y * q[1] + Z * q[2]);
                if (dd > q[3] * q[3] * 1.7) continue;
                rel += _profilCratere(Math.sqrt(dd * 2) / q[3]);
            }
            const k = 1 + rel * 0.4;
            p[0] = r * k; p[1] = g * k; p[2] = b * k;
        };
    } else {
        /* Roche (grise, mers sombres) ou sombre (charbon, crateres a rayons). */
        const sombre = moon.moonType === 'dark';
        const cr = _crateres(rng, sombre ? 22 : 34, 0.03, 0.22);
        f = function (X, Y, Z, p) {
            const hgt = N.fbm(X * 2.2 + o, Y * 2.2, Z * 2.2, 5);
            const mer = sombre ? 0 : _lissePas(0.05, 0.2, N.fbm(X * 1.1, Y * 1.1 + o, Z * 1.1, 3));
            let v = 0.55 + hgt * 0.35 - mer * 0.22;
            let rayons = 0;
            for (let i = 0; i < cr.length; i++) {
                const q = cr[i];
                const dd = 1 - (X * q[0] + Y * q[1] + Z * q[2]);
                if (sombre && i < 3 && dd < q[3] * q[3] * 12) {
                    /* Rayons clairs autour des plus jeunes crateres. */
                    const ang = Math.atan2(Y - q[1], X - q[0]) * 7 + i;
                    rayons += Math.max(0, Math.sin(ang) * Math.sin(ang * 2.3)) * (1 - dd / (q[3] * q[3] * 12)) * 0.5;
                }
                if (dd > q[3] * q[3] * 1.7) continue;
                v += _profilCratere(Math.sqrt(dd * 2) / q[3]) * 0.5;
            }
            v += rayons;
            v = Math.max(0, Math.min(1.1, v));
            if (sombre) { p[0] = 34 + v * 80; p[1] = 34 + v * 78; p[2] = 40 + v * 84; }
            else { p[0] = 50 + v * 150; p[1] = 50 + v * 148; p[2] = 56 + v * 150; }
        };
    }
    _texturer(moon, size, seed, f, null, 0.5);
}

function _hexRgb(h) {
    h = (h || '#FFB830').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/* LA SURFACE D'UN SOLEIL, peinte une fois comme les planetes : granulation
   (cellules de convection), quelques taches (ombre et penombre) entourees
   de facules claires, centre presque blanc et bord plus sombre et plus
   rouge. La granulation teinte au lieu de griser : le sombre tire vers le
   rouge. Copies a la bonne taille (_niveaux) : voir drawSuns. */
function createSunTexture(sun) {
    const size = Math.min(720, Math.max(16, Math.floor(sun.radius * 2 * 3)));
    const seed = (sun.name && sun.name.length > 0) ? sun.name.charCodeAt(0) * 13 : 42;
    const N = _bruitPerlin(seed), N2 = _bruitPerlin(seed + 101);
    const rng = mulberry32(seed);
    const C = _hexRgb(sun.color);
    const taches = [];
    for (let i = 0; i < 4; i++) {
        const z = (rng() - 0.5) * 0.9, a = rng() * Math.PI * 2, s = Math.sqrt(1 - z * z);
        taches.push([s * Math.cos(a), z, s * Math.sin(a), 0.03 + rng() * 0.05]);
    }
    const f = function (X, Y, Z, p, nz) {
        const g = 1 - Math.abs(N(X * 48, Y * 48, Z * 48));
        let k = 0.93 + 0.1 * g * g + N2.fbm(X * 4, Y * 4, Z * 4, 3) * 0.1 + N(X * 110, Y * 110, Z * 110) * 0.025;
        for (let i = 0; i < taches.length; i++) {
            const q = taches[i];
            const dd = 1 - (X * q[0] + Y * q[1] + Z * q[2]);
            if (dd < q[3] * q[3] * 2) {
                const d = Math.sqrt(dd * 2) / q[3];
                k *= d < 0.55 ? 0.32 : d < 1 ? 0.32 + (d - 0.55) * 1.2 : 1 + 0.12 * Math.max(0, 1.4 - d);
            }
        }
        const mu = Math.pow(nz, 0.5);
        const w = Math.pow(Math.max(0, mu - 0.4) / 0.6, 1.5);   /* blanchiment au centre */
        const ld = 0.62 + 0.38 * mu;                          /* assombrissement du bord */
        p[0] = (C[0] + (255 - C[0]) * w * 0.4) * ld * k;
        p[1] = (C[1] + (248 - C[1]) * w * 0.38) * ld * (0.9 + 0.1 * mu) * Math.pow(k, 1.1);
        p[2] = (C[2] + (236 - C[2]) * w * 0.3) * ld * (0.84 + 0.16 * mu) * Math.pow(k, 1.2);
    };
    _texturer(sun, size, seed, f, null, 0);
}

// PRNG global pour génération déterministe
let _worldRng = null;
function worldRandom() { return _worldRng ? _worldRng() : Math.random(); }
let _gameRng = null;
/* _nbAlea compte les tirages : en lockstep, deux joueurs doivent en faire
   exactement autant (voir detailPartie). */
let _nbAlea = 0;
function gameRandom() { _nbAlea++; return _gameRng ? _gameRng() : Math.random(); }

// PRNG déterministe (mulberry32)
/* lire / ecrire : l'etat du generateur, pour la photo de la partie (reprise
   instantanee en reseau). Les tirages sont inchanges. */
function mulberry32(a) {
    const f = function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    f.lire = function () { return a; };
    f.ecrire = function (v) { a = v; };
    return f;
}


