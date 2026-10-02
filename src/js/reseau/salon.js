/* ─────────────────────────────────────────────
   LE SALON RESEAU (bouton RESEAU de l'ecran titre)
   - Partie rapide : 2, 4, 8 ou 16 joueurs. Le relais place le joueur dans
     la premiere partie publique de cette taille qui attend ; elle se lance
     des qu'elle est pleine, les suivants en remplissent une nouvelle.
   - Partie privee : CREER donne un code de 4 lettres a transmettre ;
     REJOINDRE avec ce code. Lancee elle aussi des qu'elle est pleine.
   Jusqu'a 16 joueurs en tout, humains et IA (16 couleurs).
   ───────────────────────────────────────────── */
const JOUEURS_MAX = 16;

function installerSalon() {
    const nb = document.getElementById('salonNb'), ia = document.getElementById('salonIa');
    if (!nb || nb.options.length) return;
    for (let i = 2; i <= JOUEURS_MAX; i++) nb.add(new Option(String(i), String(i)));
    const majIa = function () {
        const garde = +ia.value || 0;
        ia.innerHTML = '';
        for (let i = 0; i <= JOUEURS_MAX - (+nb.value); i++) ia.add(new Option(String(i), String(i)));
        ia.value = String(Math.min(garde, JOUEURS_MAX - (+nb.value)));
    };
    nb.addEventListener('change', majIa);
    majIa();
    document.getElementById('btnSalon').addEventListener('click', function () {
        if (typeof ensureAudio === 'function') ensureAudio();
        if (typeof playClickSound === 'function') playClickSound();
        document.getElementById('salonReseau').style.display = 'flex';
        salonStatut('');
        salonChoixVisibles(true);
        salonClassement();
    });
    document.querySelectorAll('.salon-taille').forEach(function (b) {
        b.addEventListener('click', function () { salonClassement(+b.dataset.n); });
    });
    /* Une partie en reseau quittee (page fermee, rechargee) : on peut y
       revenir. */
    const btR = document.getElementById('btnReprendre');
    if (btR) {
        if (partieReseauGardee()) btR.style.display = '';
        btR.addEventListener('click', function () {
            if (typeof ensureAudio === 'function') ensureAudio();
            if (typeof playClickSound === 'function') playClickSound();
            btR.style.display = 'none';
            reprendrePartieReseau();
        });
    }
    document.querySelectorAll('.salon-rapide').forEach(function (b) {
        b.addEventListener('click', function () {
            salonRejoindre({ public: true, joueurs: +b.dataset.n },
                           'Recherche d\'une partie à ' + b.dataset.n + ' joueurs...');
        });
    });
    document.getElementById('salonCreer').addEventListener('click', function () {
        salonRejoindre({ creer: true, joueurs: +nb.value, ia: +ia.value }, 'Création de la partie...');
    });
    document.getElementById('salonRejoindre').addEventListener('click', function () {
        const code = document.getElementById('salonCode').value.trim().toUpperCase();
        if (!/^[A-Z]{4}$/.test(code)) { salonStatut('Le code fait 4 lettres.'); return; }
        salonRejoindre({ code: code }, 'Connexion à la partie ' + code + '...');
    });
    document.getElementById('salonFermer').addEventListener('click', function () {
        quitterRelais();
        cacherInvitation();
        document.getElementById('salonReseau').style.display = 'none';
    });
}

/* L'INVITATION : le code en grand, et un lien a envoyer. Celui qui ouvre le
   lien arrive directement dans la partie (voir invitationDepuisAdresse). */
function lienInvitation(code) { return location.origin + location.pathname + '?partie=' + code; }
function afficherInvitation(code) {
    const el = document.getElementById('salonInvit');
    if (!el) return;
    if (el.dataset.code === code && el.style.display !== 'none') return;
    el.dataset.code = code;
    el.innerHTML = '<div style="font-size:12px; color:#FDE68A;">Votre partie est créée. Invitez vos amis :</div>' +
        '<div class="si-code">' + code + '</div>' +
        '<button class="btn" id="siCopier" style="margin:0; padding:7px 14px; font-size:12px;">📋 COPIER LE LIEN D\'INVITATION</button>' +
        '<div style="font-size:11px; color:#94A3B8; margin-top:6px; word-break:break-all;">' + lienInvitation(code) + '</div>';
    el.style.display = 'block';
    el.querySelector('#siCopier').addEventListener('click', function () {
        const b = this, lien = lienInvitation(code);
        const ok = function () { b.textContent = '✓ LIEN COPIÉ'; setTimeout(function () { b.textContent = '📋 COPIER LE LIEN D\'INVITATION'; }, 2000); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(lien).then(ok, function () { prompt('Copiez ce lien :', lien); });
        else prompt('Copiez ce lien :', lien);
    });
}
function cacherInvitation() {
    const el = document.getElementById('salonInvit');
    if (el) { el.style.display = 'none'; el.dataset.code = ''; el.innerHTML = ''; }
}
/* Arrive par un lien d'invitation (?partie=CODE) : des que l'ecran titre
   s'affiche (compte ouvert), la fenetre MULTIJOUEUR s'ouvre et rejoint. */
let _invitationEnAttente = null;
(function () {
    try {
        const c = new URLSearchParams(location.search).get('partie');
        if (c && /^[A-Za-z]{4}$/.test(c)) _invitationEnAttente = c.toUpperCase();
    } catch (e) {}
})();
function invitationDepuisAdresse() {
    if (!_invitationEnAttente) return;
    const code = _invitationEnAttente;
    _invitationEnAttente = null;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    document.getElementById('salonReseau').style.display = 'flex';
    salonRejoindre({ code: code }, 'Connexion à la partie ' + code + '...');
}

function salonRejoindre(reglages, message) {
    quitterRelais();
    cacherInvitation();
    salonChoixVisibles(false);
    salonStatut(message);
    reglages.nom = (currentProfile && currentProfile.pseudo) || '';
    jetonSession(function (jeton) {
        reglages.jeton = jeton;
        rejoindreRelais(adresseRelais(), reglages);
    });
}

/* LE JETON DE SESSION du compte, pour le relais : il le fait verifier par
   Supabase et prend le pseudo dans la base (sans jeton : invite, non
   classe). suite(null) quoi qu'il arrive, jamais d'attente sans fin. */
function jetonSession(suite) {
    try {
        Promise.resolve(_supa.auth.getSession())
            .then(function (r) { suite(r && r.data && r.data.session ? r.data.session.access_token : null); })
            .catch(function () { suite(null); });
    } catch (e) { suite(null); }
}

/* Quitter une salle avant le depart (ANNULER, ou un autre choix). */
function quitterRelais() {
    const L = gameState.lockstep;
    if (!L || L.enJeu || L.slot !== null) return;
    try { L.ws.onclose = null; L.ws.close(); } catch (e) {}
    gameState.lockstep = null;
    const b = document.getElementById('bandeauLockstep');
    if (b) b.remove();
    salonChoixVisibles(true);
}

/* FIN DE PARTIE EN RESEAU. Elle se decide dans le calcul, donc au meme tour
   chez tous (checkVictoryAndElimination). */
function finPartieLockstep(gagnant) {
    const L = gameState.lockstep;
    if (!L || L.fini) return;
    L.fini = true;
    L.gagnant = gagnant.name;
    oublierPartieReseau();
    envoyerAuRelais(classementFinal(gagnant));
    const bandeauSpect = document.getElementById('bandeauElimine');
    if (bandeauSpect) bandeauSpect.remove();
    showEndScreen(gagnant === gameState.players[localSlot()]);
    afficherLockstep('Partie terminee : ' + gagnant.name + ' l\'emporte');
}

/* Le relais a enregistre la partie : l'ELO avant/apres s'ajoute au bilan
   de fin (ou la raison pour laquelle elle ne compte pas). */
function afficherResultatReseau(m) {
    const L = gameState.lockstep;
    if (!L) return;
    const e = m.elo && m.elo[L.slot];
    let texte = 'Non classée', couleur = '#94A3B8';
    if (m.classee && e) {
        const d = e.apres - e.avant;
        texte = e.avant + ' → ' + e.apres + ' (' + (d >= 0 ? '+' : '') + d + ')';
        couleur = d >= 0 ? '#4ADE80' : '#F87171';
    } else if (m.raison && m.raison !== 'partie non classee') texte += ' (' + m.raison + ')';
    const bilan = document.getElementById('endStats');
    if (!bilan) return;
    const ligne = document.createElement('div');
    ligne.className = 'end-stat-row';
    const nom = document.createElement('span');
    nom.textContent = 'ELO (parties à ' + L.joueurs.length + ')';
    const val = document.createElement('span');
    val.className = 'end-stat-val';
    val.style.color = couleur;
    val.textContent = texte;
    ligne.appendChild(nom);
    ligne.appendChild(val);
    bilan.appendChild(ligne);
}

/* LE CLASSEMENT FINAL, envoye au relais qui le compare entre joueurs et
   l'enregistre (ELO) : le gagnant, puis les survivants par nombre
   d'astres, puis les elimines, le dernier tombe en tete. IA comprises dans
   le tri, seuls les humains (les premiers numeros) sont envoyes. */
function classementFinal(gagnant) {
    const L = gameState.lockstep;
    const cle = function (p) {
        if (p === gagnant) return [0, 0];
        if (p.alive) return [1, -p.bodies.length];
        return [2, -(p.eliminTour || 0)];
    };
    /* Le numero d'un joueur : sa place dans la liste (comme au depart). */
    const js = gameState.players;
    const tries = js.map(function (p, i) { return i; }).sort(function (i, j) {
        const x = cle(js[i]), y = cle(js[j]);
        return x[0] - y[0] || x[1] - y[1] || i - j;
    });
    const humains = L.joueurs.length;
    const rangs = tries.filter(function (i) { return i < humains; });
    const astres = {};
    for (let i = 0; i < humains && i < js.length; i++) astres[i] = js[i].bodies.length;
    return { t: 'fin', tour: gameState.tour, rangs: rangs, astres: astres, duree: Math.floor(gameState.time) };
}

/* Elimine : on reste dans la partie en spectateur. Le calcul continue
   comme chez les autres (il le faut : ils comptent sur nos empreintes, et
   on voit la suite) ; seules les commandes sont coupees. */
function passerSpectateurLockstep() {
    gameState.isSpectator = true;
    gameState._firePhase = null;
    gameState._fireSource = null;
    let el = document.getElementById('bandeauElimine');
    if (el) return;
    el = document.createElement('div');
    el.id = 'bandeauElimine';
    el.style.cssText = 'position:fixed;top:40px;left:50%;transform:translateX(-50%);z-index:5000;' +
        'display:flex;gap:12px;align-items:center;padding:8px 16px;border-radius:20px;' +
        'background:rgba(40,10,20,0.9);border:1px solid rgba(255,77,109,0.6);' +
        'font-family:Orbitron,monospace;font-size:12px;color:#FFB4B4;letter-spacing:1px;';
    el.innerHTML = '💀 ÉLIMINÉ — vous regardez la suite';
    const b = document.createElement('button');
    b.textContent = 'QUITTER';
    b.style.cssText = 'font-family:Orbitron,monospace;font-size:11px;padding:4px 10px;border-radius:10px;' +
        'background:rgba(255,77,109,0.2);border:1px solid rgba(255,77,109,0.6);color:#FFD1D9;cursor:pointer;';
    b.addEventListener('click', quitterPartieLockstep);
    el.appendChild(b);
    document.body.appendChild(el);
}

/* Quitter une partie en reseau : on repart d'une page neuve, ecran titre,
   sans rien garder de la partie (mode lockstep, maths fixes...). */
function quitterPartieLockstep() {
    oublierPartieReseau();
    location.href = location.pathname;
}

/* UN CLASSEMENT PAR TAILLE DE PARTIE (2, 4, 8, 16 joueurs) : les 10
   premiers, et sa propre ligne si on n'y est pas. */
let salonTaille = 2;
function salonClassement(taille) {
    if (taille) salonTaille = taille;
    const el = document.getElementById('salonClassement');
    if (!el) return;
    document.querySelectorAll('.salon-taille').forEach(function (b) {
        const actif = +b.dataset.n === salonTaille;
        b.style.borderColor = actif ? '#D8B4FE' : '';
        b.style.color = actif ? '#F5F3FF' : '';
        b.style.opacity = actif ? '1' : '0.6';
    });
    el.textContent = 'Chargement...';
    const demande = salonTaille;
    const moi = currentProfile && currentProfile.pseudo;
    const ligne = function (rang, x) {
        const soi = x.pseudo === moi;
        return '<div style="display:flex; justify-content:space-between; gap:8px; padding:2px 6px;' +
            (soi ? ' background:rgba(168,85,247,0.18); border-radius:4px;' : '') + '">' +
            '<span>' + rang + '. ' + esc(x.pseudo) + '</span>' +
            '<span><span style="color:#94A3B8; font-size:11px;">' + x.victoires + ' V / ' + x.parties + ' P</span> ' +
            '<span style="font-family:Orbitron,monospace; color:#FDE68A;">' + x.elo + '</span></span></div>';
    };
    const base = function () { return _supa.from('classement_reseau').select('pseudo, elo, parties, victoires').eq('taille', demande); };
    Promise.all([
        Promise.resolve(base().order('elo', { ascending: false }).limit(10)),
        Promise.resolve(moi ? base().eq('pseudo', moi) : { data: [] }),
    ]).then(function (rs) {
        if (demande !== salonTaille) return;           /* un autre onglet a ete choisi entre-temps */
        const r = rs[0];
        if (!r || r.error || !r.data) { el.textContent = 'Classement indisponible.'; return; }
        let html = r.data.map(function (x, i) { return ligne(i + 1, x); }).join('');
        if (!r.data.length) html = '<div style="padding:4px 6px; color:#94A3B8;">Aucune partie classée à ' + demande + ' joueurs pour l\'instant.</div>';
        const mien = rs[1] && rs[1].data && rs[1].data[0];
        if (moi && !r.data.some(function (x) { return x.pseudo === moi; })) {
            html += mien ? ligne('—', mien) : '<div style="padding:4px 6px; color:#94A3B8;">Vous : 1000 (aucune partie à ' + demande + ')</div>';
        }
        if (!moi) html += '<div style="padding:4px 6px; color:#94A3B8;">Connectez-vous pour être classé.</div>';
        el.innerHTML = html;
    }).catch(function () { el.textContent = 'Classement indisponible.'; });
}

function salonStatut(texte) {
    const el = document.getElementById('salonStatut');
    if (el) { el.textContent = texte; el.style.whiteSpace = 'pre-line'; }
}

function salonChoixVisibles(oui) {
    const c = document.getElementById('salonChoix'), f = document.getElementById('salonFermer');
    if (c) c.style.display = oui ? 'block' : 'none';
    if (f) f.textContent = oui ? 'FERMER' : 'ANNULER';
}

/* TOUTE LA PARTIE A PLAT, pour chercher une desynchronisation : chaque
   valeur simple des astres, tirs, joueurs, vaisseaux et cometes, sous un
   nom comme "vaisseaux.2.vx", plus quelques valeurs generales (tour,
   horloge, nombre de tirages du hasard, reglages). */
function detailPartie() {
    const d = {};
    const LOCAUX = { isLocal: 1, selected: 1 };
    const mettre = function (pre, o, prof) {
        if (!o) return;
        for (const k of Object.keys(o)) {
            if (k[0] === '_' || LOCAUX[k]) continue;
            const v = o[k], t = typeof v;
            if (t === 'number' || t === 'string' || t === 'boolean' || v === null) d[pre + k] = v;
            else if (prof > 0 && v && t === 'object' && !Array.isArray(v) && !(v instanceof HTMLElement)
                     && !(typeof v.getContext === 'function') && !ArrayBuffer.isView(v)) mettre(pre + k + '.', v, prof - 1);
        }
    };
    (gameState.allBodies || []).forEach((b, i) => mettre('astres.' + i + '.', b, 0));
    (gameState.jets || []).forEach((b, i) => mettre('jets.' + i + '.', b, 0));
    (gameState.players || []).forEach((b, i) => mettre('joueurs.' + i + '.', b, 1));
    (gameState.cleaners || []).forEach((b, i) => mettre('vaisseaux.' + i + '.', b, 0));
    (gameState.comets || []).forEach((b, i) => mettre('cometes.' + i + '.', b, 0));
    (gameState.capitaux || []).forEach((b, i) => mettre('capitaux.' + i + '.', b, 0));
    (gameState.commerces || []).forEach((b, i) => mettre('commerces.' + i + '.', b, 0));
    (gameState.orbesCommerce || []).forEach((b, i) => mettre('orbes.' + i + '.', b, 0));
    d['globaux.tour'] = gameState.tour;
    d['globaux.time'] = gameState.time;
    d['globaux.alea'] = _nbAlea;
    d['globaux.univers'] = gameState.universeRadius;
    d['globaux.cometTimer'] = gameState.cometTimer;
    d['globaux.maxRange'] = gameState._maxRangeCache;
    d['globaux.nbVaisseaux'] = (gameState.cleaners || []).length;
    d['globaux.nbCometes'] = (gameState.comets || []).length;
    d['globaux.config'] = JSON.stringify(gameState.config);
    d['globaux.graine'] = gameState.multiSeed;
    d['globaux.navigateur'] = navigator.userAgent.slice(-40);
    d['globaux.sin1'] = Math.sin(1);          /* les maths fixes sont-elles bien la ? */
    return d;
}

/* Le bandeau d'etat, en haut de l'ecran. */
function afficherLockstep(texte, alerte) {
    let el = document.getElementById('bandeauLockstep');
    if (!el) {
        el = document.createElement('div');
        el.id = 'bandeauLockstep';
        el.style.cssText = 'position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:5000;' +
            'padding:4px 12px;border-radius:6px;font:11px monospace;pointer-events:none;' +
            'background:rgba(6,8,22,0.85);border:1px solid rgba(139,92,246,0.5);color:#D8CFF5;';
        document.body.appendChild(el);
    }
    el.textContent = 'LOCKSTEP · ' + texte;
    /* Rouge pour une alerte, sinon la couleur normale : le rouge restait
       d'une alerte passee (partie precedente) sur la partie suivante. */
    el.style.color = alerte ? '#FFB4B4' : '#D8CFF5';
    el.style.borderColor = alerte ? '#FF4D6D' : 'rgba(139,92,246,0.5)';
}

function majBandeauLockstep() {
    const L = gameState.lockstep;
    if (!L || !L.enJeu || L.desync !== null) return;
    /* Coupe : le message de reconnexion reste affiche. */
    if (!L.ws || L.ws.readyState !== 1) return;
    /* La date de la partie gardee, rafraichie toutes les 10 s. */
    if (L.jeton && !L.fini && performance.now() - (L.noteLe || 0) > 10000) noterPartieReseau(L);
    const retard = L.tourPermis - (gameState.tour || 0);
    if (retard > 60) {
        afficherLockstep('RATTRAPAGE : ' + Math.round(retard / 60) + ' s de jeu de retard');
        return;
    }
    afficherLockstep('joueur ' + (L.slot + 1) + '/' + L.joueurs.length + ' · tour ' + (gameState.tour || 0) +
                     ' · reserve ' + retard + '/' + (L.cible || RESERVE_MIN) +
                     ' · gigue ' + Math.round(L.gigue || 0) + ' ms · attentes ' + L.attentes);
}

function _mobilesInterpoles() {
    return [gameState.suns, gameState.allBodies, gameState.jets, gameState.cleaners, gameState.comets, gameState.capitaux];
}

function noterPositionsAvant() {
    const listes = _mobilesInterpoles();
    for (let l = 0; l < listes.length; l++) {
        const L = listes[l];
        if (!L) continue;
        for (let i = 0; i < L.length; i++) { const o = L[i]; o._avX = o.x; o._avY = o.y; }
    }
}

/* Place chaque objet a la fraction f du chemin entre les deux derniers
   tours, et retient ou le remettre. Un objet ne depuis le dernier tour n'a
   pas de position precedente : il reste ou il est. */
function interpolerPositions(f) {
    _interpoles.length = 0;
    const listes = _mobilesInterpoles();
    for (let l = 0; l < listes.length; l++) {
        const L = listes[l];
        if (!L) continue;
        for (let i = 0; i < L.length; i++) {
            const o = L[i];
            if (o._avX === undefined) continue;
            o._vraiX = o.x; o._vraiY = o.y;
            o.x = o._avX + (o.x - o._avX) * f;
            o.y = o._avY + (o.y - o._avY) * f;
            _interpoles.push(o);
        }
    }
    gameState._vraiTemps = gameState.time;
    gameState.time -= (1 - f) * TOUR_SIM;
}

function restaurerPositions() {
    for (let i = 0; i < _interpoles.length; i++) {
        const o = _interpoles[i];
        o.x = o._vraiX; o.y = o._vraiY;
    }
    _interpoles.length = 0;
    gameState.time = gameState._vraiTemps;
}

/* La barre de la reprise acceleree (voir avancerImage). null : la cacher. */
let _barreReprise = null;
function majBarreReprise(L) {
    if (!L) { if (_barreReprise) { _barreReprise.remove(); _barreReprise = null; } return; }
    if (!_barreReprise) {
        _barreReprise = document.createElement('div');
        _barreReprise.id = 'barreReprise';
        _barreReprise.style.cssText = 'position:fixed; inset:0; z-index:950; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:rgba(5,8,25,0.82); font-family:Orbitron,sans-serif; color:#E9D5FF; letter-spacing:2px; font-size:14px;';
        _barreReprise.innerHTML = '<div>REPRISE DE LA PARTIE</div><div style="width:min(420px,80vw); height:10px; border-radius:5px; background:rgba(139,92,246,0.2); overflow:hidden;"><div class="br-plein" style="height:100%; width:0; background:linear-gradient(90deg,#8B5CF6,#4ADE80);"></div></div><div class="br-txt" style="font-size:12px; color:#A5B4FC;"></div>';
        document.body.appendChild(_barreReprise);
    }
    const total = Math.max(1, L.tourPermis - (L.rejeuDebut || 0));
    const fait = Math.max(0, gameState.tour - (L.rejeuDebut || 0));
    const pct = Math.min(100, Math.round(100 * fait / total));
    _barreReprise.querySelector('.br-plein').style.width = pct + '%';
    const m = Math.floor(gameState.tour / 3600), sec = Math.floor(gameState.tour / 60) % 60;
    _barreReprise.querySelector('.br-txt').textContent = pct + ' % \u00b7 ' + m + ' min ' + String(sec).padStart(2, '0') + ' de partie recalculées';
}

/* Une image : les tours dus depuis la precedente, puis le dessin. */
function avancerImage(dt, timestamp) {
    const _t0 = performance.now();
    const L = gameState.lockstep;
    let n = 0;
    if (L && L.enJeu) {
        /* En lockstep, on ne depasse jamais le dernier tour permis par les
           paquets recus. L'allure s'ajuste pour garder sous ce plafond la
           reserve voulue (L.cible, voir mesurerReseau) : elle absorbe les
           paquets qui arrivent en retard sans que l'image s'arrete. Tres en
           retard (onglet cache, machine lente), on rattrape a pleine
           vitesse. */
        const ecart = L.tourPermis - gameState.tour;
        const cible = L.cible || RESERVE_MIN;
        const allure = ecart > cible + 3 * TOURS_PAR_PAQUET ? 1.25 : ecart > cible + 3 ? 1.05 : ecart < cible ? 0.9 : 1;
        _accSim += dt * allure;
        /* RATTRAPAGE. Un onglet cache est mis en pause par le navigateur :
           au retour, il peut avoir des minutes de retard. On calcule alors
           autant de tours que possible pendant 10 ms par image (plusieurs
           centaines de tours par seconde), sons coupes. Avant : 6 tours par
           image au plus, un retard de 4 minutes ne se rattrapait jamais. */
        const loin = ecart > cible + 4 * TOURS_PAR_PAQUET;
        gameState._rattrapage = ecart > 60;
        /* LA REPRISE ACCELEREE. Plus de 10 s de retard (retour par
           REPRENDRE, qui rejoue la partie depuis le debut) : on ne dessine
           plus, on calcule 150 ms par image et une barre dit ou l'on en est.
           Avant : 30 ms de calcul puis une image complete, deux fois moins
           vite. */
        const rejeu = ecart > 600;
        gameState._rejeu = rejeu;
        if (rejeu && L.rejeuDebut === undefined) L.rejeuDebut = gameState.tour;
        const debut = performance.now();
        while (gameState.tour < L.tourPermis
               && (n < TOURS_MAX_PAR_IMAGE || (loin && performance.now() - debut < (rejeu ? 150 : 10)))
               && (_accSim >= TOUR_SIM || L.tourPermis - gameState.tour > cible + 4 * TOURS_PAR_PAQUET)) {
            tourSimulation();
            _accSim = Math.max(0, _accSim - TOUR_SIM);
            n++;
        }
        /* Une image ou l'on voulait avancer mais ou le paquet manquait : la
           partie s'est figee un instant. La premiere image de chaque accroc
           ajoute un tour de marge a la reserve (6 au plus). */
        const figee = gameState.tour >= L.tourPermis && _accSim >= TOUR_SIM;
        if (figee) {
            L.attentes = (L.attentes || 0) + 1;
            if (!L.figee && L.bonus !== undefined) { L.bonus = Math.min(6, L.bonus + 1); L.sansAccroc = performance.now(); }
        }
        L.figee = figee;
        if (L.tourPermis - gameState.tour > 600) {
            /* Toujours loin derriere : pas de dessin, seulement la barre. */
            majBarreReprise(L);
            _accSim = 0;
            return;
        }
        if (L.rejeuDebut !== undefined) { L.rejeuDebut = undefined; majBarreReprise(null); }
    } else {
        _accSim += dt;
        while (_accSim >= TOUR_SIM && n < TOURS_MAX_PAR_IMAGE) {
            tourSimulation();
            _accSim -= TOUR_SIM;
            n++;
        }
    }
    if (_accSim > TOUR_SIM) _accSim = TOUR_SIM;
    const _t1 = performance.now();

    updateLOD(dt);
    if (typeof majCameraClavier === 'function') majCameraClavier(dt);
    gameState.dt = dt;     /* les animations tenues par le dessin avancent a l'image */
    interpolerPositions(_accSim / TOUR_SIM);
    try {
        updateCameraFollow();
        render();
    } finally {
        restaurerPositions();
    }

    // Chronometres quand le diagnostic est ouvert (F3)
    if (_diagOuvert) {
        const _t2 = performance.now();
        _diagCumul.update += _t1 - _t0;
        _diagCumul.render += _t2 - _t1;
        _diagCumul.images++;
        if (timestamp !== undefined && timestamp - _diagDernier >= 400) { majDiagnostic(timestamp); }
    }
}

