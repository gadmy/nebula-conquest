// ─────────────────────────────────────────────
// HISTOIRE : la cinématique du menu (La Chronique des Spores)
// ─────────────────────────────────────────────
/* Douze images (assets/histoire/sceneNN.jpg) qui se fondent l'une dans
   l'autre, chacune avec un lent zoom (alterne d'une scene a l'autre), son
   titre et son texte. Defile tout seul (le temps de lire), ou au clic,
   Espace, fleches ; Echap ou PASSER pour sortir. Purement de l'affichage :
   la musique du titre continue. Textes : Lore/HISTOIRE.md. */
const HISTOIRE = [
    ['Le futur radieux', "Dans un futur lointain, la France a tout inventé : les villes flottantes, le croissant éternel et le vin bon pour la santé. Hélas, empreinte d'une politique déplorable, la planète fut oubliée."],
    ['La fin du monde', "Les partis politiques, se succédant et empirant les choses, décidèrent de s'unir dans leur médiocrité. Malheureusement, la Terre était morte."],
    ['La découverte', "Au même moment, une équipe de savants découvrit comment transformer des êtres humains en nuées de spores."],
    ["Les partis s'en emparent", "Les partis politiques s'emparèrent de l'idée pour conquérir l'univers, vider la planète de ses occupants et peut-être conquérir de nouveaux espaces."],
    ['Les adhérents font la queue', "Chaque parti politique construisit les machines pour envoyer les spores de ses adhérents à travers l'espace. Ceux qui n'étaient pas encartés prirent leur carte."],
    ['Le grand départ', "Et des milliards de spores quittèrent la Terre, chacune aux couleurs de son camp. Grâce à la publicité, tout le monde était très enthousiaste."],
    ['La Nébuleuse', "Après un très long voyage, elles atteignirent de nouveaux systèmes aux confins de l'univers."],
    ['La première colonie', "Une spore touche un monde, s'y accroche, et pousse. Les planètes sont plus ou moins accueillantes, mais les militants s'y installent coûte que coûte."],
    ['La guerre des partis', "Hélas, accrochées à leur nouvelle planète, les spores politisées n'en eurent pas assez et décidèrent d'envahir lunes, planètes et systèmes alentour."],
    ['Les Anciens', "Les spores rencontrèrent de nouvelles espèces ayant fait le voyage il y a très longtemps. Alliés ou ennemis ?"],
    ["Les alliances d'or", "Certains partis passèrent des accords. Des alliances solides comme une promesse de campagne."],
    ['À toi, Commandant', "L'humanité spore est à son commencement."]
];
let _hist = null;
function _imgHistoire(k) { return 'assets/histoire/scene' + String(k + 1).padStart(2, '0') + '.jpg'; }

function ouvrirHistoire() {
    if (_hist) return;
    const el = document.createElement('div');
    el.id = 'histoire';
    let points = '';
    for (let k = 0; k < HISTOIRE.length; k++) points += '<span data-k="' + k + '"></span>';
    el.innerHTML = '<div class="hi-image"></div><div class="hi-image"></div><div class="hi-voile"></div>' +
        '<div class="hi-bas"><div class="hi-titre"></div><div class="hi-texte"></div><div class="hi-points">' + points + '</div></div>' +
        '<button class="hi-passer">PASSER ✕</button>' +
        '<button class="hi-fleche hi-prec" aria-label="Scène précédente">‹</button><button class="hi-fleche hi-suiv" aria-label="Scène suivante">›</button>' +
        '<div class="hi-fin"><div class="hi-fin-titre">NEBULA CONQUEST</div><button class="btn hi-jouer">FERMER</button></div>';
    document.body.appendChild(el);
    _hist = { el: el, k: -1, couche: 0, minuteur: null, touches: null };
    /* Les images se chargent d'avance, dans l'ordre. */
    _hist.prechargees = HISTOIRE.map(function (_, k) { const im = new Image(); im.src = _imgHistoire(k); return im; });
    el.querySelector('.hi-passer').addEventListener('click', function (e) { e.stopPropagation(); fermerHistoire(); });
    el.querySelector('.hi-jouer').addEventListener('click', function (e) { e.stopPropagation(); fermerHistoire(); });
    el.querySelector('.hi-prec').addEventListener('click', function (e) { e.stopPropagation(); allerScene(_hist.k - 1); });
    el.querySelector('.hi-suiv').addEventListener('click', function (e) { e.stopPropagation(); allerScene(_hist.k + 1); });
    el.querySelectorAll('.hi-points span').forEach(function (p) {
        p.addEventListener('click', function (e) { e.stopPropagation(); allerScene(+p.dataset.k); });
    });
    el.addEventListener('click', function () { allerScene(_hist.k + 1); });
    _hist.touches = function (e) {
        if (!_hist) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermerHistoire(); }
        else if (e.key === 'ArrowRight' || e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); allerScene(_hist.k + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); allerScene(_hist.k - 1); }
    };
    document.addEventListener('keydown', _hist.touches, true);
    requestAnimationFrame(function () { el.classList.add('hi-visible'); allerScene(0); });
}

function allerScene(k) {
    const H = _hist;
    if (!H) return;
    clearTimeout(H.minuteur);
    if (k < 0) k = 0;
    if (k >= HISTOIRE.length) { H.el.classList.add('hi-fini'); H.k = HISTOIRE.length; return; }
    H.el.classList.remove('hi-fini');
    if (k === H.k) return;
    const couches = H.el.querySelectorAll('.hi-image');
    const neuve = couches[H.couche ^ 1], vieille = couches[H.couche];
    H.couche ^= 1;
    /* Le zoom repart de zero sur la nouvelle image, dans un sens ou l'autre. */
    neuve.style.backgroundImage = 'url("' + _imgHistoire(k) + '")';
    neuve.classList.remove('hi-zoom-a', 'hi-zoom-b', 'hi-active');
    void neuve.offsetWidth;
    neuve.classList.add(k % 2 ? 'hi-zoom-b' : 'hi-zoom-a', 'hi-active');
    vieille.classList.remove('hi-active');
    const bas = H.el.querySelector('.hi-bas');
    bas.classList.remove('hi-texte-visible');
    void bas.offsetWidth;
    H.el.querySelector('.hi-titre').textContent = (k + 1) + ' · ' + HISTOIRE[k][0];
    H.el.querySelector('.hi-texte').textContent = HISTOIRE[k][1];
    bas.classList.add('hi-texte-visible');
    H.el.querySelectorAll('.hi-points span').forEach(function (p, i) { p.classList.toggle('hi-on', i === k); });
    H.k = k;
    /* Le temps de lire : 4 s, plus un peu par lettre. */
    const duree = 4000 + HISTOIRE[k][1].length * 55;
    H.minuteur = setTimeout(function () { allerScene(k + 1); }, duree);
}

function fermerHistoire() {
    const H = _hist;
    if (!H) return;
    clearTimeout(H.minuteur);
    document.removeEventListener('keydown', H.touches, true);
    H.el.classList.remove('hi-visible');
    setTimeout(function () { H.el.remove(); }, 450);
    _hist = null;
}

document.getElementById('btnHistoire').addEventListener('click', () => { playClickSound(); ouvrirHistoire(); });

/* AU PREMIER LANCEMENT, l'histoire se joue toute seule, des que le menu
   principal est a l'ecran (apres la connexion ou le choix hors ligne).
   Une seule fois par navigateur (nc_histoireVue). Pas quand on arrive par
   un lien d'invitation : on rejoint d'abord la partie, l'histoire attendra
   une prochaine visite. */
const _histParInvitation = /[?&]partie=/.test(location.search);
let _histGuet = null;
function histoirePremiereFois() {
    let vue = false;
    try { vue = localStorage.getItem('nc_histoireVue') === '1'; } catch (e) { vue = true; }
    if (vue || _histParInvitation) { clearInterval(_histGuet); return; }
    if (gameState.phase !== 'title' || _hist) return;
    const titre = document.getElementById('titleScreen'), auth = document.getElementById('authScreen');
    if (!titre || titre.classList.contains('hidden') || (auth && !auth.classList.contains('hidden'))) return;
    const salon = document.getElementById('salonReseau');
    if (salon && salon.style.display === 'flex') return;
    try { localStorage.setItem('nc_histoireVue', '1'); } catch (e) {}
    clearInterval(_histGuet);
    ouvrirHistoire();
}
_histGuet = setInterval(histoirePremiereFois, 800);

/* Apres un repli (photo qui ne collait pas), la page rechargee reprend la
   partie toute seule, depuis le debut. */
function repriseCompleteAuto() {
    let auto = false;
    try { auto = sessionStorage.getItem('nc_repriseComplete') === '1'; sessionStorage.removeItem('nc_repriseComplete'); } catch (e) {}
    if (auto) setTimeout(reprendrePartieReseau, 1200);
}
repriseCompleteAuto();

document.getElementById('btnMission').addEventListener('click', () => {
    if (typeof ensureAudio === 'function') ensureAudio();
    playClickSound();
    startTutorial();
});

