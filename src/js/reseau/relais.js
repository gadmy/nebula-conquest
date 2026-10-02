function envoyerAuRelais(msg) {
    const L = gameState.lockstep;
    if (L && L.ws && L.ws.readyState === 1) L.ws.send(JSON.stringify(msg));
}

/* Le relais en ligne (Railway). En local, le relais sert lui-meme la page :
   on le trouve a la meme adresse. ?relais=... dans l'adresse l'emporte. */
const RELAIS_EN_LIGNE = 'wss://nebula-conquest-production.up.railway.app';
function adresseRelais() {
    const q = new URLSearchParams(location.search);
    if (q.get('relais')) return q.get('relais');
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return 'ws://' + location.host;
    return RELAIS_EN_LIGNE;
}

/* Adresse avec ?relais=...&salle=... : on rejoint cette salle directement,
   sans passer par le salon (pratique pour les essais). */
function lockstepDepuisAdresse() {
    const q = new URLSearchParams(location.search);
    const url = q.get('relais');
    if (!url || !q.get('salle')) return;
    /* Page rechargee en pleine partie de cette salle : on reprend notre
       place au lieu de rejoindre comme un nouveau joueur. */
    const g = partieReseauGardee();
    if (g && g.salle === q.get('salle')) { reprendrePartieReseau(); return; }
    const reglages = {
        salle: q.get('salle') || 'essai', joueurs: q.get('joueurs'), ia: q.get('ia'),
        carte: q.get('carte'), difficulte: q.get('difficulte'),
        nom: q.get('nom') || (currentProfile && currentProfile.pseudo) || '',
    };
    jetonSession(function (jeton) {
        reglages.jeton = jeton;
        /* Une reprise a demarre pendant qu'on attendait le jeton : on la laisse. */
        if (gameState.lockstep || _repriseEnCours) return;
        rejoindreRelais(url, reglages);
    });
}

/* LA VERSION DU JEU : l'empreinte du code de la page, calculee une fois.
   Le relais ne met ensemble que des joueurs qui ont la meme : deux versions
   differentes ne calculeraient pas la meme partie. */
let _versionJeu = null;
function versionJeu() {
    if (_versionJeu) return _versionJeu;
    let h = 0x811c9dc5;
    for (const sc of document.querySelectorAll('script:not([src])')) {
        const t = sc.textContent;
        for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
    }
    _versionJeu = (h >>> 0).toString(16);
    return _versionJeu;
}

function rejoindreRelais(url, reglages) {
    const L = gameState.lockstep = { ws: null, url: url, slot: null, enJeu: false, joueurs: [], paquets: 0,
                                     tourPermis: PAQUETS_AVANCE * TOURS_PAR_PAQUET, attentes: 0, desync: null };
    ouvrirRelais(L, function () { return Object.assign({ t: 'rejoindre', version: versionJeu() }, reglages); });
    afficherLockstep('Connexion au relais...');
}

/* RECONNEXION. La demande de reprise : notre place (numero + jeton secret)
   et le premier paquet qui nous manque (0 : page rechargee, tout a
   rejouer). */
function demandeReprise(L) {
    return { t: 'reprendre', salle: L.salleNom, slot: L.slot, jeton: L.jeton, depuis: L.enJeu ? L.paquets : 0, version: versionJeu() };
}

/* Ouvre la connexion au relais ; premier() donne le premier message. */
function ouvrirRelais(L, premier) {
    let ws;
    try { ws = new WebSocket(L.url); } catch (e) { afficherLockstep('Relais injoignable : ' + L.url, true); return; }
    L.ws = ws;
    ws.onopen = function () { ws.send(JSON.stringify(premier())); };
    ws.onclose = function () {
        if (gameState.lockstep !== L || L.ws !== ws) return;
        /* Coupure en pleine partie : on retente toutes les 2 s, pendant
           3 minutes (le temps que le relais garde la partie). La partie
           continue jusqu'au dernier paquet recu, puis attend. */
        if (L.jeton && !L.fini) {
            L.essais = (L.essais || 0) + 1;
            if (L.essais > 90) { afficherLockstep('Connexion perdue. Partie abandonnee.', true); return; }
            afficherLockstep('Connexion perdue — reconnexion (essai ' + L.essais + ')...', true);
            setTimeout(function () { if (gameState.lockstep === L && L.ws === ws) ouvrirRelais(L, function () { return demandeReprise(L); }); }, L.essais === 1 ? 300 : 2000);
            return;
        }
        afficherLockstep('Relais deconnecte', true);
        /* Coupe avant le depart : le salon redevient utilisable. */
        if (gameState.lockstep === L && !L.enJeu && L.slot === null) { gameState.lockstep = null; salonChoixVisibles(true); }
    };
    ws.onerror = function () { salonStatut('Relais injoignable. Reessayez dans un instant.'); };
    ws.onmessage = function (ev) {
        let m;
        try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.t === 'attente') {
            const txt = 'En attente des joueurs : ' + m.presents + ' / ' + m.attendus;
            afficherLockstep(txt);
            if (L.code) afficherInvitation(L.code);
            salonStatut(txt);
        }
        else if (m.t === 'salle') { L.code = m.code; }
        else if (m.t === 'refus' && m.reprise) {
            /* La partie n'existe plus (terminee, ou abandonnee de tous). */
            oublierPartieReseau();
            L.fini = true;
            try { ws.onclose = null; ws.close(); } catch (e) {}
            afficherLockstep('Reprise impossible : ' + m.raison, true);
            if (!L.graine) {
                gameState.lockstep = null;
                const bt = document.getElementById('btnReprendre');
                if (bt) bt.style.display = 'none';
            }
        }
        else if (m.t === 'arret') {
            /* Le relais s'arrete (mise a jour) : la partie est perdue, inutile
               de chercher a la reprendre. */
            oublierPartieReseau();
            L.fini = true;
            try { ws.onclose = null; ws.close(); } catch (e) {}
            afficherLockstep('Partie interrompue : ' + m.raison, true);
        }
        else if (m.t === 'refus') {
            afficherLockstep('Refuse : ' + m.raison, true);
            salonStatut('Impossible : ' + m.raison);
            gameState.lockstep = null;
            salonChoixVisibles(true);
            try { ws.onclose = null; ws.close(); } catch (e) {}
        }
        else if (m.t === 'depart') lancerPartieLockstep(m);
        else if (m.t === 'paquet') recevoirPaquet(m);
        else if (m.t === 'reprise') {
            L.essais = 0;
            /* Le rythme des paquets repart de zero : l'ancienne mesure du
               reseau ferait croire a un retard enorme. */
            L.origine = undefined;
            L.retards = [];
            if (L.enJeu) { appliquerReprise(L, m); afficherLockstep('Reconnecte'); }
            else {
                /* Page rechargee : on relance la partie (meme graine) et on
                   rejouera tous les ordres depuis le debut, en accelere. */
                L.aRejouer = m;
                if (!L.graine) lancerPartieLockstep(m.depart);
            }
        }
        else if (m.t === 'resultat') afficherResultatReseau(m);
        else if (m.t === 'revenu') {
            const j = gameState.players[m.slot];
            if (j) addEvent('neutral', '↩', j.name + ' est de retour', null, '#888888');
        }
        else if (m.t === 'desync') {
            if (L.desync !== null) return;           /* la premiere compte, les suivantes en decoulent */
            L.desync = m.tour;
            /* Repris depuis une photo qui ne colle pas : reprise complete. */
            if (L.depuisPhoto !== undefined) { repliRepriseComplete(); return; }
            /* Le detail de ce tour part au relais, qui notera dans son
               journal les premieres valeurs qui different. */
            const d = L.details && L.details[m.tour];
            if (d) {
                const garde = {};
                const familles = (m.familles || []).concat(['globaux']);
                for (const k in d) if (familles.some(f => k.indexOf(f + '.') === 0)) garde[k] = d[k];
                envoyerAuRelais({ t: 'detail', tour: m.tour, d: garde });
            }
            afficherLockstep('DESYNCHRONISATION au tour ' + m.tour +
                             (m.familles && m.familles.length ? ' (' + m.familles.join(', ') + ')' : ''), true);
        }
        else if (m.t === 'parti') {
            const j = gameState.players[m.slot];
            if (j) addEvent('neutral', '⚠', j.name + ' a quitte la partie', null, '#888888');
        }
    };
}

/* Les paquets manques, remis par le relais (seuls ceux qui ont des ordres ;
   les vides se deduisent du dernier numero, m.n). */
function appliquerReprise(L, m) {
    for (const p of (m.paquets || [])) {
        if (p.n < L.paquets) continue;
        const base = (p.n + PAQUETS_AVANCE) * TOURS_PAR_PAQUET;
        for (const o of (p.o || [])) programmerOrdre({ tour: base + 1, slot: o.s, type: o.type, d: o.d || {} });
    }
    if (m.n + 1 > L.paquets) {
        L.tourPermis = (m.n + PAQUETS_AVANCE) * TOURS_PAR_PAQUET + TOURS_PAR_PAQUET;
        L.paquets = m.n + 1;
    }
}

/* La partie en cours, gardee dans le navigateur : si la page est fermee ou
   rechargee, le bouton REPRENDRE de l'ecran titre y ramene. */
function noterPartieReseau(L) {
    try {
        localStorage.setItem('nc_partieReseau', JSON.stringify({ url: L.url, salle: L.salleNom, slot: L.slot,
                                                                 jeton: L.jeton, t: Date.now() }));
    } catch (e) {}
    L.noteLe = performance.now();
}
function oublierPartieReseau() {
    try { localStorage.removeItem('nc_partieReseau'); } catch (e) {}
    photoEffacer();
}
/* Une partie quittee il y a moins de 30 minutes, sinon rien. */
function partieReseauGardee() {
    try {
        const g = JSON.parse(localStorage.getItem('nc_partieReseau') || 'null');
        if (g && g.jeton && g.url && Date.now() - g.t < 30 * 60 * 1000) return g;
    } catch (e) {}
    return null;
}

function reprendrePartieReseau() {
    const g = partieReseauGardee();
    if (!g || gameState.lockstep || _repriseEnCours) return;
    _repriseEnCours = true;
    /* D'abord la photo de cette partie, si le navigateur en a une. */
    photoLire(function (P) {
        _repriseEnCours = false;
        if (gameState.lockstep) return;
        const bonne = P && P.salle === g.salle && P.slot === g.slot && P.version === versionJeu() && P.n0 > 0;
        const L = gameState.lockstep = { ws: null, url: g.url, slot: null, enJeu: false, joueurs: [], paquets: 0,
                                         tourPermis: PAQUETS_AVANCE * TOURS_PAR_PAQUET, attentes: 0, desync: null,
                                         salleNom: g.salle, jeton: g.jeton, slotGarde: g.slot,
                                         photo: bonne ? P : null };
        ouvrirRelais(L, function () {
            const depuis = L.enJeu ? L.paquets : (L.photo ? L.photo.n0 : 0);
            return { t: 'reprendre', salle: L.salleNom, slot: L.slotGarde, jeton: L.jeton, depuis: depuis, version: versionJeu() };
        });
        afficherLockstep(bonne ? 'Reprise rapide de la partie...' : 'Reprise de la partie...');
    });
}
let _repriseEnCours = false;

