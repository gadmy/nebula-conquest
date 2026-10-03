/* ─────────────────────────────────────────────
   LES CARTES DES JOUEURS
   - Bouton EDITEUR DE CARTE du menu : l'editeur s'ouvre sur un espace vide
     (ou sur une de ses cartes). On y nomme la carte, on l'enregistre dans
     son compte (30 au plus), on la rouvre, on la joue en solo.
   - Les cartes OFFICIELLES (1000 votes positifs) et les siennes s'ajoutent
     au choix de carte : partie solo, et partie privee en reseau - c'est le
     createur qui choisit, le relais envoie la carte aux autres.
   - Fin d'une partie en reseau sur une carte de joueur : chaque humain qui
     l'a jouee jusqu'au bout peut voter (bien / pas bien), une fois. C'est la
     base qui verifie (voter_carte) : partie jouee, pas sa propre carte.
   Limites (les memes que la base) : 40 soleils, 250 planetes, 1000 lunes.
   ───────────────────────────────────────────── */
const CARTES_LIMITES = { soleils: 40, planetes: 250, lunes: 1000 };
let _cartesOfficielles = [];   /* { id, nom, planetes, soleils, lunes, auteur, pseudo } */
let _mesCartes = [];
const _cacheCartes = {};       /* id -> donnees nettoyees */
let _carteEditeur = null;      /* donnees de la carte de l'editeur, pour la jouer en solo */
let _editeurMenu = null;       /* { id, nom } : l'editeur ouvert depuis le menu */

/* UNE CARTE PROPRE. Une carte vient d'un autre joueur : on n'en garde que
   les champs attendus, des nombres dans des bornes, des noms faits de
   lettres (un nom s'affiche dans la page : pas de balise possible). Les
   ceintures d'asteroides sont refaites par le jeu, on ne les garde pas. */
const _NOM_INTERDIT = /[^A-Za-zÀ-ÖØ-öø-ÿ0-9 '\-]/g;
function _nomPropre(n, def) {
    n = String(n == null ? '' : n).replace(_NOM_INTERDIT, '').trim().slice(0, 24);
    return n.length >= 2 ? n : def;
}
function _borne(v, min, max, def) {
    v = Number(v);
    return isFinite(v) ? Math.max(min, Math.min(max, v)) : def;
}
function nettoyerCarte(d) {
    if (!d || typeof d !== 'object' || !Array.isArray(d.suns)) return null;
    const bh = d.blackHole || {};
    const out = {
        name: _nomPropre(d.name, 'Carte'),
        blackHole: { x: _borne(bh.x, -1e5, 1e5, 0), y: _borne(bh.y, -1e5, 1e5, 0), radius: _borne(bh.radius, 20, 400, 80) },
        suns: [], asteroidBelts: []
    };
    let nPl = 0, nLu = 0, k = 0;
    for (const s of d.suns.slice(0, CARTES_LIMITES.soleils)) {
        if (!s || typeof s !== 'object') continue;
        const sun = { name: _nomPropre(s.name, 'Soleil ' + (++k)), radius: _borne(s.radius, 50, 400, 180),
                      orbitRadius: _borne(s.orbitRadius, 0, 60000, 2000), orbitSpeed: _borne(s.orbitSpeed, -1, 1, 0.01),
                      angle: _borne(s.angle, -1000, 1000, 0),
                      color: /^#[0-9A-Fa-f]{6}$/.test(s.color) ? s.color : '#FFE44D', planets: [] };
        for (const p of (Array.isArray(s.planets) ? s.planets : [])) {
            if (!p || typeof p !== 'object' || nPl >= CARTES_LIMITES.planetes) continue;
            nPl++;
            const pl = { name: _nomPropre(p.name, 'Planete ' + nPl), radius: _borne(p.radius, 10, 200, 90),
                         orbitRadius: _borne(p.orbitRadius, 50, 20000, 600), orbitSpeed: _borne(p.orbitSpeed, -2, 2, 0.05),
                         angle: _borne(p.angle, -1000, 1000, 0),
                         flore: Math.round(_borne(p.flore, 0, 500, 50)), faune: Math.round(_borne(p.faune, 0, 1000, 50)), moons: [] };
            for (const m of (Array.isArray(p.moons) ? p.moons : [])) {
                if (!m || typeof m !== 'object' || nLu >= CARTES_LIMITES.lunes) continue;
                nLu++;
                pl.moons.push({ name: _nomPropre(m.name, 'Lune ' + nLu), radius: _borne(m.radius, 5, 100, 30),
                                orbitRadius: _borne(m.orbitRadius, 10, 3000, 150), orbitSpeed: _borne(m.orbitSpeed, -3, 3, 0.2),
                                angle: _borne(m.angle, -1000, 1000, 0),
                                flore: Math.round(_borne(m.flore, 0, 500, 30)), faune: Math.round(_borne(m.faune, 0, 1000, 30)) });
            }
            sun.planets.push(pl);
        }
        out.suns.push(sun);
    }
    return out;
}

function compterCarte(d) {
    let p = 0, l = 0;
    for (const s of (d && d.suns) || []) for (const pl of s.planets || []) { p++; l += (pl.moons || []).length; }
    return { soleils: ((d && d.suns) || []).length, planetes: p, lunes: l };
}

/* LES LISTES : cartes officielles (tout le monde) et les siennes. */
function chargerListesCartes() {
    if (typeof SERVICES_HORS_LIGNE !== 'undefined' && SERVICES_HORS_LIGNE) return Promise.resolve();
    return Promise.resolve(_supa.from('cartes_joueurs')
        .select('id, nom, soleils, planetes, lunes, votes_pour, officielle, auteur, profiles(pseudo)')
        .order('nom'))
        .then(function (r) {
            if (!r || r.error || !Array.isArray(r.data)) return;
            const moi = currentUser ? currentUser.id : null;
            const ligne = function (x) {
                return { id: x.id, nom: _nomPropre(x.nom, 'Carte'), planetes: x.planetes, soleils: x.soleils, lunes: x.lunes,
                         votes: x.votes_pour, auteur: x.auteur, pseudo: x.profiles ? _nomPropre(x.profiles.pseudo, '?') : '?' };
            };
            _cartesOfficielles = r.data.filter(function (x) { return x.officielle; }).map(ligne);
            _mesCartes = r.data.filter(function (x) { return moi && x.auteur === moi; }).map(ligne);
            remplirChoixCartes();
        })
        .catch(function () {});
}

/* Ajoute les cartes de joueurs aux listes de choix (solo, partie privee). */
function remplirChoixCartes() {
    ['cfgMap', 'salonCarte'].forEach(function (idSel) {
        const sel = document.getElementById(idSel);
        if (!sel) return;
        const garde = sel.value;
        sel.querySelectorAll('optgroup[data-joueurs]').forEach(function (g) { g.remove(); });
        const groupe = function (titre, liste) {
            if (!liste.length) return;
            const g = document.createElement('optgroup');
            g.label = titre;
            g.dataset.joueurs = '1';
            for (const c of liste) {
                const o = document.createElement('option');
                o.value = 'j:' + c.id;
                o.textContent = c.nom + ' · ' + c.planetes + ' planètes' + (c.pseudo && c.auteur !== (currentUser && currentUser.id) ? ' · par ' + c.pseudo : '');
                g.appendChild(o);
            }
            sel.appendChild(g);
        };
        groupe('Cartes officielles des joueurs', _cartesOfficielles);
        groupe('Mes cartes', _mesCartes.filter(function (c) { return !_cartesOfficielles.some(function (o) { return o.id === c.id; }); }));
        /* La carte de l'editeur, pour la jouer tout de suite en solo. */
        if (idSel === 'cfgMap' && _carteEditeur) {
            const o = document.createElement('option');
            o.value = 'e';
            o.textContent = '✏ Carte de l\'éditeur · ' + compterCarte(_carteEditeur).planetes + ' planètes';
            const g = document.createElement('optgroup');
            g.label = 'Éditeur';
            g.dataset.joueurs = '1';
            g.appendChild(o);
            sel.appendChild(g);
        }
        if ([...sel.options].some(function (o) { return o.value === garde; })) sel.value = garde;
    });
}

/* Le nombre de planetes d'un choix de carte de joueur ('j:...' ou 'e'). */
function planetesCarteChoisie(val) {
    if (val === 'e') return _carteEditeur ? compterCarte(_carteEditeur).planetes : null;
    if (typeof val !== 'string' || val.indexOf('j:') !== 0) return null;
    const id = val.slice(2);
    const c = _cartesOfficielles.concat(_mesCartes).find(function (x) { return x.id === id; });
    return c ? c.planetes : null;
}

/* Le contenu d'une carte de joueur (une fois charge, garde). */
function donneesCarteJoueur(id) {
    if (_cacheCartes[id]) return Promise.resolve(_cacheCartes[id]);
    return Promise.resolve(_supa.from('cartes_joueurs').select('donnees').eq('id', id).single())
        .then(function (r) {
            const d = r && !r.error && r.data ? nettoyerCarte(r.data.donnees) : null;
            if (d) _cacheCartes[id] = d;
            return d;
        });
}

/* Avant LANCER (solo) : la carte de joueur choisie, chargee et posee dans
   la config. Puis suite(). */
function preparerCarteChoisie(suite) {
    const val = document.getElementById('cfgMap').value;
    gameState.config.carteDonnees = null;
    if (val === 'e' && _carteEditeur) { gameState.config.carteDonnees = _carteEditeur; suite(); return; }
    if (val.indexOf('j:') !== 0) { suite(); return; }
    donneesCarteJoueur(val.slice(2)).then(function (d) {
        if (!d) { alert('Cette carte n\'a pas pu être chargée.'); return; }
        gameState.config.carteDonnees = d;
        suite();
    }).catch(function () { alert('Cette carte n\'a pas pu être chargée.'); });
}

/* ─────────────────────────────────────────────
   L'EDITEUR DEPUIS LE MENU
   ───────────────────────────────────────────── */
function ouvrirEditeurMenu(id, nom) {
    if (id) {
        donneesCarteJoueur(id).then(function (d) {
            if (d) _lancerEditeur(d, { id: id, nom: nom || d.name });
        });
        return;
    }
    _lancerEditeur(null, null);
}

function _lancerEditeur(donnees, meta) {
    _editeurMenu = { id: meta ? meta.id : null, nom: meta ? meta.nom : '' };
    if (typeof stopTitleMusic === 'function') stopTitleMusic();
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('configScreen').classList.add('hidden');
    document.getElementById('gameCanvas').style.display = 'block';
    if (typeof montrerFondCss === 'function') montrerFondCss(true);
    /* Un espace sans joueurs ni vaisseaux : rien ne bouge que les orbites. */
    gameState.isMulti = false;
    gameState.isTutorial = false;
    gameState.players = [];
    gameState.jets = [];
    gameState.comets = [];
    /* Les effets que le dessin parcourt : vides (rien n'a encore eu lieu). */
    gameState.particles = []; gameState.bloomEffects = []; gameState.conquestEffects = [];
    gameState.impactEffects = []; gameState._etincelles = []; gameState._ondes = []; gameState._ondesSolaires = [];
    gameState._filetsCharge = []; gameState.alliances = [];
    gameState.capitaux = [];
    gameState.commerces = [];
    if (!gameState.multiSeed) gameState.multiSeed = 1 + Math.floor(Math.random() * 2147483646);
    const avant = gameState.config.cleanerCount;
    gameState.config.cleanerCount = 0;
    if (donnees) loadMapFromJSON(donnees);
    else {
        gameState.suns = []; gameState.planets = []; gameState.moons = []; gameState.asteroidBelts = [];
        gameState.blackHole = { x: 0, y: 0, radius: 80, dangerZone: 300, angle: 0 };
    }
    gameState.config.cleanerCount = avant;
    gameState.cleaners = [];
    gameState.capitaux = [];
    gameState.suns.forEach(function (s) { createSunTexture(s); });
    gameState.planets.forEach(function (p) { createPlanetTexture(p); });
    gameState.moons.forEach(function (m) { createMoonTexture(m); });
    rebuildAllBodies();
    buildSunHaloCache();
    if (typeof generateBackground === 'function') generateBackground();
    if (typeof preparerTrouNoir === 'function') preparerTrouNoir();
    gameState.universeRadius = 6000;
    const cam = gameState.camera;
    cam.x = 0; cam.y = 0; cam.zoom = donnees ? 0.08 : 0.25;
    gameState.phase = 'title';
    if (!gameState.running) {
        gameState.running = true;
        gameState.lastTime = performance.now();
        gameState.fpsLastCheck = performance.now();
        requestAnimationFrame(gameLoop);
    }
    const ed = editeurCarte();
    _boutonsEditeurMenu(ed);
    if (!ed.actif()) ed.toggle(true);
    ed.majInfo();
    _majPanneauMenu();
}

/* Les boutons propres a l'editeur ouvert depuis le menu : nom, enregistrer,
   mes cartes, jouer en solo, quitter. Crees une fois. */
function _boutonsEditeurMenu(ed) {
    let bloc = document.getElementById('editeurMenu');
    if (bloc) { bloc.style.display = 'flex'; return; }
    bloc = document.createElement('div');
    bloc.id = 'editeurMenu';
    bloc.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,136,0,0.25);';
    const style = 'padding:6px;border-radius:4px;cursor:pointer;font:12px monospace;';
    bloc.innerHTML =
        '<label style="font-size:10px;color:#aaa;">Nom de la carte</label>' +
        '<input id="edNom" maxlength="40" style="padding:5px;background:#0a1428;color:#fff;border:1px solid #f80;border-radius:4px;font:12px monospace;">' +
        '<button id="edEnregistrer" style="' + style + 'background:#0a2a1a;color:#4f8;border:1px solid #4f8;">💾 Enregistrer dans mon compte</button>' +
        '<button id="edJouer" style="' + style + 'background:#1a1a3a;color:#c9f;border:1px solid #c9f;">▶ Jouer cette carte en solo</button>' +
        '<button id="edQuitter" style="' + style + 'background:#2a0a0a;color:#f88;border:1px solid #f88;">✖ Quitter l\'éditeur</button>' +
        '<div id="edMessage" style="font-size:10px;color:#aaa;min-height:14px;line-height:1.35;"></div>' +
        '<div style="font-size:11px;color:#f80;margin-top:4px;">📂 Mes cartes</div>' +
        '<div id="edListe" style="display:flex;flex-direction:column;gap:3px;font-size:10px;"></div>';
    ed.panneau.appendChild(bloc);
    document.getElementById('edEnregistrer').addEventListener('click', enregistrerCarteEditeur);
    document.getElementById('edJouer').addEventListener('click', jouerCarteEditeur);
    document.getElementById('edQuitter').addEventListener('click', quitterEditeurMenu);
}

function _messageEditeur(txt, couleur) {
    const m = document.getElementById('edMessage');
    if (m) { m.textContent = txt; m.style.color = couleur || '#aaa'; }
}

function _majPanneauMenu() {
    const nom = document.getElementById('edNom');
    if (nom && _editeurMenu) nom.value = _editeurMenu.nom || '';
    const liste = document.getElementById('edListe');
    if (!liste) return;
    liste.innerHTML = '';
    if (!currentUser) { liste.textContent = 'Connectez-vous pour garder vos cartes.'; return; }
    if (!_mesCartes.length) { liste.textContent = 'Aucune carte enregistrée.'; return; }
    for (const c of _mesCartes) {
        const ligne = document.createElement('div');
        ligne.style.cssText = 'display:flex;gap:4px;align-items:center;';
        const t = document.createElement('span');
        t.style.cssText = 'flex:1;color:#eda;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        t.textContent = c.nom + ' (' + c.planetes + ' pl.)' + (_cartesOfficielles.some(function (o) { return o.id === c.id; }) ? ' ★' : '');
        t.title = c.nom + ' : ' + c.soleils + ' soleils, ' + c.planetes + ' planètes, ' + c.lunes + ' lunes, ' + (c.votes || 0) + ' votes positifs';
        const ouvrir = document.createElement('button');
        ouvrir.textContent = 'Ouvrir';
        ouvrir.style.cssText = 'padding:1px 5px;font:10px monospace;cursor:pointer;background:#1a2a3a;color:#9cf;border:1px solid #9cf;border-radius:3px;';
        ouvrir.addEventListener('click', function () { ouvrirEditeurMenu(c.id, c.nom); });
        const effacer = document.createElement('button');
        effacer.textContent = '✖';
        effacer.title = 'Effacer cette carte';
        effacer.style.cssText = 'padding:1px 5px;font:10px monospace;cursor:pointer;background:#3a1a1a;color:#f88;border:1px solid #f88;border-radius:3px;';
        effacer.addEventListener('click', function () { effacerCarte(c.id, c.nom); });
        ligne.appendChild(t); ligne.appendChild(ouvrir); ligne.appendChild(effacer);
        liste.appendChild(ligne);
    }
}

/* La carte de l'editeur, controlee avant de partir : assez de planetes,
   pas trop d'astres. Rend un message d'erreur, ou null. */
function _defautCarte(d) {
    const n = compterCarte(d);
    if (n.soleils < 1) return 'Il faut au moins un soleil.';
    if (n.planetes < 2) return 'Il faut au moins 2 planètes (une par joueur).';
    if (n.soleils > CARTES_LIMITES.soleils) return 'Au plus ' + CARTES_LIMITES.soleils + ' soleils.';
    if (n.planetes > CARTES_LIMITES.planetes) return 'Au plus ' + CARTES_LIMITES.planetes + ' planètes.';
    if (n.lunes > CARTES_LIMITES.lunes) return 'Au plus ' + CARTES_LIMITES.lunes + ' lunes.';
    return null;
}

function enregistrerCarteEditeur() {
    if (!currentUser) { _messageEditeur('Connectez-vous pour enregistrer vos cartes.', '#f88'); return; }
    const nom = _nomPropre(document.getElementById('edNom').value, '');
    if (nom.length < 2) { _messageEditeur('Donnez un nom à la carte (2 lettres au moins).', '#f88'); return; }
    const d = nettoyerCarte(editeurCarte().donnees(nom));
    const defaut = _defautCarte(d);
    if (defaut) { _messageEditeur(defaut, '#f88'); return; }
    _messageEditeur('Enregistrement...', '#aaa');
    const requete = _editeurMenu && _editeurMenu.id
        ? _supa.from('cartes_joueurs').update({ nom: nom, donnees: d }).eq('id', _editeurMenu.id).select('id').single()
        : _supa.from('cartes_joueurs').insert({ nom: nom, donnees: d }).select('id').single();
    Promise.resolve(requete).then(function (r) {
        if (!r || r.error || !r.data) {
            _messageEditeur('Pas enregistrée : ' + ((r && r.error && r.error.message) || 'erreur'), '#f88');
            return;
        }
        _editeurMenu = { id: r.data.id, nom: nom };
        _cacheCartes[r.data.id] = d;
        _messageEditeur('✅ Carte « ' + nom + ' » enregistrée.', '#4f8');
        chargerListesCartes().then(_majPanneauMenu);
    }).catch(function (e) { _messageEditeur('Pas enregistrée : ' + (e && e.message ? e.message : 'réseau'), '#f88'); });
}

function effacerCarte(id, nom) {
    if (!confirm('Effacer la carte « ' + nom + ' » ?')) return;
    Promise.resolve(_supa.from('cartes_joueurs').delete().eq('id', id)).then(function (r) {
        if (r && r.error) { _messageEditeur('Pas effacée : ' + r.error.message, '#f88'); return; }
        delete _cacheCartes[id];
        if (_editeurMenu && _editeurMenu.id === id) _editeurMenu.id = null;
        _messageEditeur('Carte effacée.', '#aaa');
        chargerListesCartes().then(_majPanneauMenu);
    });
}

/* Jouer la carte de l'editeur en solo : on passe a l'ecran de config, la
   carte y est deja choisie. */
function jouerCarteEditeur() {
    const nom = _nomPropre(document.getElementById('edNom').value, 'Ma carte');
    const d = nettoyerCarte(editeurCarte().donnees(nom));
    const defaut = _defautCarte(d);
    if (defaut) { _messageEditeur(defaut, '#f88'); return; }
    _carteEditeur = d;
    _fermerEditeurMenu();
    remplirChoixCartes();
    setPhase('config');
    const sel = document.getElementById('cfgMap');
    sel.value = 'e';
    sel.dispatchEvent(new Event('change'));
}

function _fermerEditeurMenu() {
    const ed = editeurCarte();
    if (ed.actif()) ed.toggle();
    const bloc = document.getElementById('editeurMenu');
    if (bloc) bloc.style.display = 'none';
    _editeurMenu = null;
}

function quitterEditeurMenu() {
    _fermerEditeurMenu();
    setPhase('title');
}

/* ─────────────────────────────────────────────
   LE VOTE, en fin de partie en reseau sur une carte de joueur (message
   'carte_jouee' du relais : il a note que nous l'avons jouee jusqu'au bout).
   ───────────────────────────────────────────── */
function proposerVoteCarte(m) {
    if (!m || !m.id || !currentUser) return;
    const bilan = document.getElementById('endStats');
    if (!bilan || document.getElementById('voteCarte')) return;
    const bloc = document.createElement('div');
    bloc.id = 'voteCarte';
    bloc.className = 'end-stat-row';
    bloc.style.cssText = 'flex-wrap:wrap;gap:6px;align-items:center;';
    const t = document.createElement('span');
    t.textContent = 'La carte « ' + _nomPropre(m.nom, 'Carte') + ' » vous a plu ?';
    const oui = document.createElement('button');
    oui.className = 'btn';
    oui.style.cssText = 'padding:4px 10px;font-size:12px;';
    oui.textContent = '👍 Bien';
    const non = oui.cloneNode(true);
    non.textContent = '👎 Pas bien';
    const res = document.createElement('span');
    res.className = 'end-stat-val';
    const voter = function (positif) {
        oui.disabled = non.disabled = true;
        if (typeof _supa.rpc !== 'function') { res.textContent = 'Vote impossible hors ligne'; return; }
        Promise.resolve(_supa.rpc('voter_carte', { p_carte: m.id, p_positif: positif })).then(function (r) {
            const v = r && r.data;
            if (!v || !v.ok) { res.textContent = 'Vote refusé' + (v && v.raison ? ' : ' + v.raison : ''); return; }
            res.textContent = 'Merci ! ' + v.pour + ' 👍 · ' + v.contre + ' 👎' + (v.officielle ? ' — carte officielle !' : ' (officielle à 1000 👍)');
        }).catch(function () { res.textContent = 'Vote impossible (réseau)'; });
    };
    oui.addEventListener('click', function () { voter(true); });
    non.addEventListener('click', function () { voter(false); });
    bloc.appendChild(t); bloc.appendChild(oui); bloc.appendChild(non); bloc.appendChild(res);
    bilan.appendChild(bloc);
}

function installerCartesJoueurs() {
    const b = document.getElementById('btnEditeur');
    if (b && !b.dataset.pret) {
        b.dataset.pret = '1';
        b.addEventListener('click', function () {
            if (typeof ensureAudio === 'function') ensureAudio();
            if (typeof playClickSound === 'function') playClickSound();
            chargerListesCartes().then(_majPanneauMenu);
            ouvrirEditeurMenu(null);
        });
    }
    chargerListesCartes();
}
