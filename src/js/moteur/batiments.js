/* ─────────────────────────────────────────────
   EFFET DES BATIMENTS
   Un seul endroit ou les regler. Ces valeurs etaient recopiees dans la
   simulation, dans trois affichages et dans une dizaine de textes : les
   changer demandait de toutes les retrouver, et il en restait toujours une.
   Les textes sont maintenant fabriques a partir d'elles.
   ───────────────────────────────────────────── */
/* Rendements decroissants, les memes pour les trois genres : le premier
   batiment rapporte 20 %, le deuxieme 15 %, le troisieme 10 %, et chacun des
   suivants 5 %. Un astre a donc tout interet a se diversifier plutot qu'a
   empiler vingt fois le meme batiment. */
/* Les teintes des trois genres, deja utilisees par le compteur sous les
   astres : une seule definition pour que le pop soit de la bonne couleur. */
const BATI_TEINTES = { alveole: '#F5B93B', nid: '#4ADE80', biome: '#60A5FA' };

/* ─────────────────────────────────────────────
   LES ICONES DES BATIMENTS, une seule famille partout : menus, barre de
   construction, liste de gauche, fiche, journal, aide, et sur les astres.
   Style organique : alveole = rayon de miel, nid = oeuf dans son nid,
   biome = dome de vie, parasite = spore infectee a tentacules. Un seul
   dessin (SVG, 32 x 32) : le HTML l'insere tel quel, le canevas en tire
   une image faite une fois pour toutes.
   ───────────────────────────────────────────── */
const BATI_GENRES = ['alveole', 'nid', 'biome', 'parasite'];
function _dessinBat(g) {
    if (g === 'alveole')  return '<polygon points="9.9,3.0 16.0,6.5 16.0,13.5 9.9,17.0 3.8,13.5 3.8,6.5" fill="#F5B93B" stroke="#080614" stroke-width="1.8"/><polygon points="22.1,3.0 28.2,6.5 28.2,13.5 22.1,17.0 16.0,13.5 16.0,6.5" fill="#F5B93B" stroke="#080614" stroke-width="1.8"/><polygon points="16.0,13.5 22.1,17.0 22.1,24.0 16.0,27.5 9.9,24.0 9.9,17.0" fill="#F5B93B" stroke="#080614" stroke-width="1.8"/><circle cx="16" cy="20.5" r="2.4" fill="#7A4B00"/>';
    if (g === 'nid')      return '<ellipse cx="16" cy="12" rx="6" ry="7.5" fill="#E8FFF0" stroke="#080614" stroke-width="2"/><path d="M3 15 Q16 36 29 15 Z" fill="#4ADE80" stroke="#080614" stroke-width="2.2" stroke-linejoin="round"/><path d="M7 19 Q16 24 25 19 M10 23 Q16 26 22 23" stroke="#0E5A2A" stroke-width="1.6" fill="none"/>';
    if (g === 'biome')    return '<path d="M3 25 A13 13 0 0 1 29 25 Z" fill="#60A5FA" stroke="#080614" stroke-width="2.2"/><rect x="2" y="25" width="28" height="4" rx="1.5" fill="#2B5E9E" stroke="#080614" stroke-width="1.8"/><path d="M16 24 C11 22 11 16 16 12 C21 16 21 22 16 24 Z" fill="#BFE3FF"/><path d="M8 18 A9 9 0 0 1 13 13" stroke="#E6F3FF" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    if (g === 'parasite') return '<path d="M23.7 18.1 L28.1 19.2 M18.1 23.7 L19.2 28.1 M10.3 21.7 L7.2 24.8 M8.3 13.9 L3.9 12.8 M13.9 8.3 L12.8 3.9 M21.7 10.3 L24.8 7.2" stroke="#080614" stroke-width="4.4" stroke-linecap="round"/><path d="M23.7 18.1 L28.1 19.2 M18.1 23.7 L19.2 28.1 M10.3 21.7 L7.2 24.8 M8.3 13.9 L3.9 12.8 M13.9 8.3 L12.8 3.9 M21.7 10.3 L24.8 7.2" stroke="#A3E635" stroke-width="2.2" stroke-linecap="round"/><circle cx="28.1" cy="19.2" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="19.2" cy="28.1" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="7.2" cy="24.8" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="3.9" cy="12.8" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="12.8" cy="3.9" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="24.8" cy="7.2" r="2.1" fill="#A3E635" stroke="#080614" stroke-width="1.4"/><circle cx="16" cy="16" r="9.5" fill="#A3E635" stroke="#080614" stroke-width="2.2"/><circle cx="13" cy="13.5" r="2.7" fill="#6B21A8"/><circle cx="19.8" cy="17.2" r="2.1" fill="#6B21A8"/><circle cx="14.2" cy="20.2" r="1.5" fill="#6B21A8"/><path d="M10.5 18 A6 6 0 0 1 12 10.8" stroke="#ECFCCB" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    return '';
}

/* Pour le HTML : l'icone a la taille voulue, alignee sur le texte. */
function iconeBat(g, px) {
    px = px || 16;
    return '<svg class="ic-bat" width="' + px + '" height="' + px + '" viewBox="0 0 32 32" aria-hidden="true">'
         + _dessinBat(g) + '</svg>';
}

/* Remplace les <i class="ic-bat" data-g="nid"></i> poses dans le HTML
   (aide, onglets) par l'icone du genre. */
function remplirIconesBat(racine) {
    const liste = (racine || document).querySelectorAll('i.ic-bat[data-g]');
    for (let k = 0; k < liste.length; k++) {
        const el = liste[k];
        el.outerHTML = iconeBat(el.dataset.g, +(el.dataset.px || 15));
    }
}

/* Pour le canevas : une image de 192 px par genre, faite au chargement
   (assez pour rester nette au plus fort zoom). */
const _imgBat = {};
function _prepareImagesBat() {
    for (const g of BATI_GENRES) {
        if (_imgBat[g] !== undefined) continue;
        _imgBat[g] = null;
        const im = new Image();
        im.onload = function () {
            const c = document.createElement('canvas');
            c.width = c.height = 192;
            c.getContext('2d').drawImage(im, 0, 0, 192, 192);
            _imgBat[g] = c;
        };
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 32 32">' + _dessinBat(g) + '</svg>');
    }
}
_prepareImagesBat();
remplirIconesBat();

/* Dessine l'icone centree en (x, y), cote 'taille' en unites du canevas.
   Tant que l'image n'est pas prete, une pastille de la bonne couleur. */
function dessinerIconeBat(ctx, g, x, y, taille) {
    const im = _imgBat[g];
    if (im) { ctx.drawImage(im, x - taille / 2, y - taille / 2, taille, taille); return; }
    ctx.fillStyle = BATI_TEINTES[g] || '#A3E635';
    ctx.beginPath();
    ctx.arc(x, y, taille * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

const PALIERS_BATIMENT = [0.20, 0.15, 0.10];
const PALIER_SUIVANT   = 0.05;

/* Le bonus TOTAL apporte par n batiments d'un genre. */
/* Le nid, qui accelere la production, est une fois et demie plus fort que les
   deux autres. Son cout ne change pas : c'est le seul batiment dont le
   rendement compose avec le temps, il merite d'etre le plus rentable. */
const FORCE_GENRE = { alveole: 1, nid: 1.5, biome: 1 };

function bonusBatiment(n, genre) {
    if (!(n > 0)) return 0;
    let t = 0;
    for (let i = 0; i < PALIERS_BATIMENT.length && i < n; i++) t += PALIERS_BATIMENT[i];
    if (n > PALIERS_BATIMENT.length) t += (n - PALIERS_BATIMENT.length) * PALIER_SUIVANT;
    return t * (FORCE_GENRE[genre] || 1);
}

/* Ce que rapporterait le PROCHAIN batiment d'un genre. */
function bonusProchain(n, genre) {
    return bonusBatiment((n || 0) + 1, genre) - bonusBatiment(n || 0, genre);
}

/* Le cout d'un batiment, en spores. A partir du quatrieme d'un meme genre, il
   augmente de 10 % a chaque fois : les premiers restent abordables, empiler
   devient cher. */
const COUT_BATIMENT = { alveole: 0.10, nid: 0.15, biome: 0.20 };
const COUT_MAJORATION = 1.10;

function nbBatiment(body, mode) {
    if (mode === 'alveole') return body.alveoles || 0;
    if (mode === 'nid')     return body.nids || 0;
    if (mode === 'biome')   return body.biomes || 0;
    return 0;
}

function coutBatiment(body, mode) {
    const pctc = COUT_BATIMENT[mode];
    if (!pctc) return 0;
    const base = (body.baseMaxSpores || body.maxSpores) * pctc;
    const rang = nbBatiment(body, mode) + 1;
    const majo = rang > PALIERS_BATIMENT.length
               ? Math.pow(COUT_MAJORATION, rang - PALIERS_BATIMENT.length)
               : 1;
    return Math.floor(base * majo);
}

/* SECOUSSE DE L'ECRAN. Une breve vibration amortie pour dire non sans
   ouvrir de fenetre : la demande est refusee, on le sent tout de suite. */
function secouerEcran(force) {
    gameState._secousse = Math.max(gameState._secousse || 0, force || 7);
}

function majSecousse(dt) {
    if (!gameState._secousse) return;
    gameState._secousse -= dt * 26;
    if (gameState._secousse < 0.15) gameState._secousse = 0;
}

