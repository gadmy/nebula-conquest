/* RELAIS D'ORDRES (prototype du multijoueur lockstep)
   Le serveur ne calcule rien de la partie. Il :
   - rassemble les joueurs d'une salle et, quand elle est pleine, donne a
     chacun la meme graine, la meme carte, les memes reglages et son numero ;
   - attend que tous aient fini de charger ;
   - puis, toutes les 50 ms, envoie a tous un PAQUET numerote avec les
     ordres recus depuis le paquet precedent. Chaque navigateur applique le
     paquet n au meme tour de jeu, deux paquets plus tard (le temps que le
     reseau livre), et calcule toute la partie lui-meme ;
   - compare les empreintes de la partie que les joueurs lui envoient : si
     deux navigateurs ne calculent plus la meme chose, il le dit a tous ;
   - verifie le compte de chaque joueur (jeton Supabase) et, en fin de
     partie rapide, enregistre le classement et l'ELO (cle de service dans
     la variable SUPABASE_SERVICE_KEY).
   Le trafic ne depend que du nombre d'ordres, pas du nombre d'objets.

   Il sert aussi le jeu lui-meme, pour essayer en local :
     npm run relais                 puis ouvrir deux fois
     http://localhost:8080/?relais=ws://localhost:8080&salle=essai&joueurs=2
   Parametres de l'adresse (le premier arrive decide) : joueurs (humains,
   2 par defaut), ia (0), carte (6), difficulte (normal).

   Options : --port 8080, --latence 0 --gigue 0 (en ms, retard ajoute a
   chaque envoi vers chaque joueur, pour simuler un reseau lent ou
   irregulier ; l'ordre des messages est garde).

   En ligne (Railway) : un service cree depuis ce depot demarre tout seul
   par "npm start" (ce fichier), sur le port que donne la variable PORT.
   Le jeu s'y connecte en wss:// (chiffre, obligatoire depuis une page en
   https) : ?relais=wss://ADRESSE-DU-SERVICE&salle=nom&joueurs=2 */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, join, resolve } from 'node:path';
import { WebSocketServer } from 'ws';

const args = process.argv.slice(2);
const opt = (nom, def) => {
    const i = args.indexOf('--' + nom);
    return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : def;
};
/* Un hebergeur (Railway...) impose son port par la variable PORT. */
const PORT = opt('port', Number(process.env.PORT) || 8080);
const LATENCE = opt('latence', 0);
const GIGUE = opt('gigue', 0);
const VERSION_DIFFERENTE = "un joueur n'a pas la meme version du jeu : rechargez tous la page (Ctrl+Maj+R)";
const PERIODE = 50;                    /* ms entre deux paquets : 3 tours de 1/60 s */

/* ── Les comptes (Supabase) ──
   L'adresse et la cle publique sont celles du jeu. La cle de service,
   secrete, ne vient que de la variable SUPABASE_SERVICE_KEY (Railway) :
   sans elle, les comptes sont verifies mais rien n'est classe. */
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hcjajtpbzusqgxkyzbgc.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjamFqdHBienVzcWd4a3l6YmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTIwNjgsImV4cCI6MjA4NzY4ODA2OH0.UXiZvC3kQmQzZ4BSWp6X19ISPjlac87YZlLonUqzvic';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';

/* Une requete a Supabase, abandonnee au bout de 5 s. Les nouvelles cles
   (sb_...) ne passent que par apikey ; les anciennes aussi en Bearer. */
async function supabase(chemin, cle, options = {}) {
    const entetes = { apikey: cle, 'Content-Type': 'application/json' };
    if (cle.startsWith('eyJ')) entetes.Authorization = 'Bearer ' + cle;
    const r = await fetch(SUPABASE_URL + chemin, { ...options, headers: { ...entetes, ...(options.headers || {}) },
                                                  signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error('Supabase ' + r.status + ' ' + chemin.split('?')[0]);
    return r.json();
}

/* LE COMPTE D'UN JOUEUR. Le jeu envoie son jeton de session ; Supabase dit
   a qui il appartient, et le pseudo se lit dans la base. Sans jeton valide
   (pas connecte, jeton perime, Supabase injoignable) : invite, non classe. */
async function verifierJeton(jeton) {
    if (!jeton || typeof jeton !== 'string' || jeton.length > 4000) return null;
    try {
        const u = await supabase('/auth/v1/user', SUPABASE_ANON, { headers: { Authorization: 'Bearer ' + jeton } });
        if (!u || !u.id) return null;
        const p = await supabase('/rest/v1/profiles?select=pseudo,elo&id=eq.' + encodeURIComponent(u.id), SUPABASE_ANON);
        if (!p || !p[0]) return null;
        return { id: u.id, pseudo: String(p[0].pseudo).replace(/[<>&"]/g, '').slice(0, 20), elo: p[0].elo };
    } catch (e) {
        console.log('Compte non verifie : ' + e.message);
        return null;
    }
}

/* Les ordres que le jeu connait (EXECUTER_ORDRE). Le reste est refuse. */
const ORDRES = new Set(['part', 'zone', 'tir', 'tir_surface', 'riposte', 'arret', 'batiment',
    'sacrifice', 'stat', 'techno', 'colonie', 'demol', 'visee', 'visee_fin', 'rafale_debut',
    'rafale_cible', 'rafale_fin', 'boule_debut', 'boule_cible', 'boule_fin', 'boule_lancer', 'capital', 'commerce', 'commerce_reponse', 'regime', 'reserver']);

/* ── Le jeu, servi par le meme port ── */
const RACINE = resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg',
                '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.json': 'application/json' };
const serveur = http.createServer(async (req, res) => {
    let chemin = decodeURIComponent(req.url.split('?')[0]);
    if (chemin === '/') chemin = '/index.html';
    const fichier = join(RACINE, chemin);
    if (!fichier.startsWith(RACINE) || chemin.includes('node_modules')) { res.writeHead(403); res.end(); return; }
    try {
        const donnees = await readFile(fichier);
        res.writeHead(200, { 'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream' });
        res.end(donnees);
    } catch (e) { res.writeHead(404); res.end(); }
});

/* ── Les salles ── */
const salles = new Map();

/* Envoi vers un joueur, avec le retard simule s'il y en a un. Les messages
   partent toujours dans l'ordre : un retard tire au hasard ne passe jamais
   avant celui du message precedent. */
function envoyer(c, msg) {
    const txt = JSON.stringify(msg);
    if (!LATENCE && !GIGUE) { if (c.ws.readyState === 1) c.ws.send(txt); return; }
    const quand = Math.max(c.dernierEnvoi || 0, Date.now() + LATENCE + Math.random() * GIGUE);
    c.dernierEnvoi = quand;
    setTimeout(() => { if (c.ws.readyState === 1) c.ws.send(txt); }, quand - Date.now());
}
const aTous = (salle, msg) => { for (const c of salle.clients) envoyer(c, msg); };

function entier(v, min, max, def) {
    v = Math.round(Number(v));
    return v >= min && v <= max ? v : def;
}

/* Jusqu'a 16 joueurs, humains et IA : le jeu a 16 couleurs. */
const JOUEURS_MAX = 16;
/* Planetes de chaque carte de la bibliotheque du jeu (MAP_LIBRARY), pour en
   choisir une assez grande : au moins deux planetes par joueur. */
const PLANETES_CARTE = [5, 5, 16, 10, 17, 7, 12, 7, 6, 5, 13, 21, 17, 49, 47];
function carteAuHasard(total) {
    const ok = PLANETES_CARTE.map((p, i) => [p, i]).filter(([p]) => p >= total * 2).map(([, i]) => i);
    if (!ok.length) return PLANETES_CARTE.indexOf(Math.max(...PLANETES_CARTE));
    return ok[Math.floor(Math.random() * ok.length)];
}

/* Code de partie privee : 4 lettres, sans celles qu'on confond (I, O). */
function nouveauCode() {
    const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code;
    do { code = ''; for (let i = 0; i < 4; i++) code += L[Math.floor(Math.random() * L.length)]; }
    while (salles.has(code));
    return code;
}
let compteurPublic = 0;

function nouvelleSalle(nom, m, options) {
    const joueurs = entier(m.joueurs, 1, JOUEURS_MAX, 2);
    const ia = entier(m.ia, 0, JOUEURS_MAX - joueurs, 0);
    const salle = {
        nom, clients: [], lancee: false, n: 0, ordres: [], empreintes: new Map(), minuteur: null,
        historique: [], valides: new Map(), abandon: null,
        public: !!options.public,
        reglages: {
            joueurs, ia,
            carte: m.carte !== undefined && m.carte !== null && m.carte !== '' ? entier(m.carte, 0, 14, 6) : carteAuHasard(joueurs + ia),
            difficulte: ['easy', 'normal', 'hard', 'brutal'].includes(m.difficulte) ? m.difficulte : 'normal',
        },
    };
    salles.set(nom, salle);
    return salle;
}

/* Ce compte a deja une place dans cette salle (un seul joueur par compte :
   sinon on se classerait contre soi-meme). */
const dejaLa = (salle, compte) => !!compte && salle.clients.some(k => k.compte && k.compte.id === compte.id);

function rejoindre(ws, m, compte) {
    const version = String(m.version || '').slice(0, 16);
    let salle;
    if (m.public) {
        /* PARTIE RAPIDE : la premiere partie publique de cette taille qui
           attend encore, sinon une nouvelle. */
        const n = entier(m.joueurs, 2, JOUEURS_MAX, 2);
        /* Seulement avec des joueurs qui ont la meme version du jeu. */
        for (const s of salles.values()) {
            if (s.public && !s.lancee && s.reglages.joueurs === n && s.clients.length < n && !dejaLa(s, compte) &&
                (s.version || '') === version) { salle = s; break; }
        }
        if (!salle) salle = nouvelleSalle('public-' + n + '-' + (++compteurPublic), { joueurs: n }, { public: true });
    } else if (m.creer) {
        /* PARTIE PRIVEE : un code a transmettre. */
        salle = nouvelleSalle(nouveauCode(), m, {});
        ws.send(JSON.stringify({ t: 'salle', code: salle.nom }));
    } else if (m.code) {
        salle = salles.get(String(m.code).toUpperCase().slice(0, 4));
        if (!salle || salle.public) {
            ws.send(JSON.stringify({ t: 'refus', raison: 'code inconnu' }));
            return null;
        }
    } else {
        /* Adresse ?relais=...&salle=... : la salle est creee si besoin. */
        const nom = String(m.salle || 'essai').slice(0, 40);
        salle = salles.get(nom) || nouvelleSalle(nom, m, {});
    }
    const nom = salle.nom;
    /* LA MEME VERSION POUR TOUS. Deux versions du jeu ne calculent pas la
       meme partie : elles se separeraient au bout de quelques secondes. Le
       premier arrive fixe la version de la salle. */
    if (!salle.clients.length) salle.version = version;
    else if ((salle.version || '') !== version) {
        ws.send(JSON.stringify({ t: 'refus', raison: VERSION_DIFFERENTE }));
        return null;
    }
    if (salle.lancee || salle.clients.length >= salle.reglages.joueurs) {
        ws.send(JSON.stringify({ t: 'refus', raison: 'partie pleine ou deja lancee' }));
        return null;
    }
    if (dejaLa(salle, compte)) {
        ws.send(JSON.stringify({ t: 'refus', raison: 'ce compte est deja dans la partie' }));
        return null;
    }
    /* Le pseudo verifie ; sans compte, le nom annonce marque "invite" (il ne
       peut pas se faire passer pour un joueur inscrit). */
    const annonce = String(m.nom || ('Joueur ' + (salle.clients.length + 1))).replace(/[<>&"]/g, '').slice(0, 12);
    const c = { ws, salle, slot: salle.clients.length, pret: false, compte,
                nom: compte ? compte.pseudo : annonce + ' (invité)' };
    salle.clients.push(c);
    aTous(salle, { t: 'attente', presents: salle.clients.length, attendus: salle.reglages.joueurs });
    console.log('[' + nom + '] ' + c.nom + ' arrive (' + salle.clients.length + '/' + salle.reglages.joueurs + ')');
    if (salle.clients.length === salle.reglages.joueurs) {
        salle.lancee = true;
        const graine = 1 + Math.floor(Math.random() * 2147483646);
        const joueurs = salle.clients.map(k => ({ nom: k.nom, elo: k.compte ? k.compte.elo : null }));
        /* CLASSEE : partie rapide (pas de partie privee entre amis pour
           gonfler son ELO), au moins deux joueurs avec un compte, et un
           relais qui peut ecrire dans la base. */
        const classee = salle.public && !!SUPABASE_SERVICE && salle.clients.filter(k => k.compte).length >= 2;
        /* Les reglages d'abord : leur "joueurs" (un nombre) ne doit pas
           ecraser la liste des joueurs. Garde pour les reprises. */
        salle.depart = { ...salle.reglages, graine, joueurs, classee, salle: nom };
        for (const k of salle.clients) {
            /* Le jeton, secret et propre a chaque joueur, lui permettra de
               reprendre sa place s'il perd la connexion - et a lui seul. */
            k.jeton = randomUUID();
            envoyer(k, { t: 'depart', ...salle.depart, slot: k.slot, jeton: k.jeton });
        }
        console.log('[' + nom + '] depart, graine ' + graine);
    }
    return c;
}

/* REPRISE : un joueur revient dans une partie lancee, avec son numero et
   son jeton. depuis = le premier paquet qui lui manque (0 : il a tout perdu,
   page rechargee - il rejouera la partie depuis le debut). On lui renvoie
   le depart et les paquets non vides depuis ce numero, et le dernier numero
   envoye : les paquets vides ne sont pas gardes, il les deduit. */
function reprendre(ws, m) {
    const salle = salles.get(String(m.salle || ''));
    const slot = entier(m.slot, 0, JOUEURS_MAX - 1, -1);
    const k = salle && salle.lancee ? salle.clients[slot] : null;
    if (!k || !k.jeton || k.jeton !== String(m.jeton || '')) {
        ws.send(JSON.stringify({ t: 'refus', raison: 'partie introuvable ou terminee', reprise: true }));
        return null;
    }
    /* Page rechargee sur une version plus recente : elle ne pourrait pas
       suivre la partie. */
    if ((salle.version || '') !== String(m.version || '').slice(0, 16)) {
        ws.send(JSON.stringify({ t: 'refus', raison: VERSION_DIFFERENTE, reprise: true }));
        return null;
    }
    const ancien = k.ws;
    k.ws = ws;
    k.dernierEnvoi = 0;
    /* Un joueur revenu repart d'un etat neuf : sa reprise (photo ou partie
       rejouee) sera de nouveau comparee a celle des autres. */
    k.desync = false;
    if (ancien !== ws && ancien.readyState === 1) { try { ancien.close(); } catch (e) {} }
    if (salle.abandon) { clearTimeout(salle.abandon); salle.abandon = null; }
    const depuis = entier(m.depuis, 0, 1e9, 0);
    envoyer(k, { t: 'reprise', depart: { ...salle.depart, slot: k.slot, jeton: k.jeton },
                 n: salle.n - 1, depuis, paquets: salle.historique.filter(p => p.n >= depuis) });
    for (const x of salle.clients) if (x !== k) envoyer(x, { t: 'revenu', slot: k.slot });
    console.log('[' + salle.nom + '] ' + k.nom + ' reprend sa place (depuis le paquet ' + depuis + ')');
    return k;
}

/* Tous ceux qui sont encore la ont fini de charger (et il en reste un). */
function tousPrets(salle) {
    const la = salle.clients.filter(k => k.ws.readyState === 1);
    return la.length > 0 && la.every(k => k.pret);
}

/* Tous charges : les paquets partent. */
function demarrerPaquets(salle) {
    console.log('[' + salle.nom + '] tous prets, premier paquet');
    salle.minuteur = setInterval(() => {
        aTous(salle, { t: 'paquet', n: salle.n, o: salle.ordres });
        /* L'historique, pour les reprises : seulement les paquets qui ont
           des ordres (la plupart sont vides). */
        if (salle.ordres.length) salle.historique.push({ n: salle.n, o: salle.ordres });
        salle.ordres = [];
        salle.n++;
    }, PERIODE);
}

/* Les empreintes d'un meme tour doivent etre identiques chez tous. */
function noterEmpreinte(c, m) {
    const salle = c.salle;
    const tour = entier(m.tour, 0, 1e9, -1);
    if (tour < 0) return;
    const h = String(m.h).slice(0, 16);
    /* Tour deja valide par les autres : c'est un joueur revenu qui rejoue
       la partie, on compare son empreinte a celle qu'ils avaient tous. */
    const valide = salle.valides.get(tour);
    if (valide !== undefined) {
        if (h !== valide && !c.desync) {
            c.desync = true;
            console.log('[' + salle.nom + '] DESYNCHRONISATION de ' + c.nom + ' (reprise) au tour ' + tour);
            envoyer(c, { t: 'desync', tour, familles: [], empreintes: { [c.slot]: h } });
        }
        return;
    }
    for (const t of salle.empreintes.keys()) if (t < tour - 1200) salle.empreintes.delete(t);
    let e = salle.empreintes.get(tour);
    if (!e) { e = {}; salle.empreintes.set(tour, e); }
    e[c.slot] = { h, p: (m.p && typeof m.p === 'object') ? m.p : {} };
    const vivants = salle.clients.filter(k => k.ws.readyState === 1);
    if (Object.keys(e).length < vivants.length) return;
    const valeurs = new Set(Object.values(e).map(x => x.h));
    if (valeurs.size > 1) {
        /* Ce qui differe : astres, tirs, joueurs, vaisseaux, cometes. */
        const liste = Object.values(e);
        const familles = Object.keys(liste[0].p).filter(f => liste.some(x => x.p[f] !== liste[0].p[f]));
        const empreintes = {};
        for (const k in e) empreintes[k] = e[k].h;
        if (!salle.desync) {
            salle.desync = true;
            console.log('[' + salle.nom + '] DESYNCHRONISATION au tour ' + tour + ' (' + familles.join(', ') + ') ' + JSON.stringify(empreintes));
        }
        aTous(salle, { t: 'desync', tour, familles, empreintes });
    } else {
        salle.valides.set(tour, h);
    }
    if (valeurs.size === 1 && tour % 600 === 0) {
        console.log('[' + salle.nom + '] tour ' + tour + ' : ' + vivants.length + ' joueurs identiques (' + [...valeurs][0] + ')');
    }
    salle.empreintes.delete(tour);
}

/* Le detail de la partie au tour de la premiere desynchronisation, envoye
   par chaque joueur : on ecrit dans le journal les valeurs qui different,
   de quoi trouver la cause sans rejouer. */
function noterDetail(c, m) {
    const salle = c.salle;
    if (salle.detailFait || !m.d || typeof m.d !== 'object') return;
    if (!salle.details) salle.details = {};
    salle.details[c.slot] = m.d;
    const vivants = salle.clients.filter(k => k.ws.readyState === 1);
    if (Object.keys(salle.details).length < vivants.length) return;
    salle.detailFait = true;
    const lots = Object.entries(salle.details);
    const [slotA, A] = lots[0];
    const log = (t) => console.log('[' + salle.nom + '] ' + t);
    log('DETAIL au tour ' + m.tour + ' - valeurs generales :');
    for (const [s, D] of lots) {
        const g = Object.keys(D).filter(k => k.indexOf('globaux.') === 0).map(k => k.slice(8) + '=' + D[k]).join(' | ');
        log('  joueur ' + (+s + 1) + ' : ' + g);
    }
    for (const [slotB, B] of lots.slice(1)) {
        const cles = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter(k => k.indexOf('globaux.') !== 0);
        const diff = cles.filter(k => A[k] !== B[k]);
        log('  ' + diff.length + ' valeurs differentes entre joueur ' + (+slotA + 1) + ' et joueur ' + (+slotB + 1) + ' :');
        for (const k of diff.slice(0, 40)) log('    ' + k + ' : ' + A[k] + '  /  ' + B[k]);
    }
}

/* FIN DE PARTIE. Chaque joueur calcule la fin au meme tour et envoie son
   classement : les joueurs humains du premier au dernier, leurs astres, la
   duree. Le relais ne calcule rien, il compare : le resultat retenu est
   celui de la majorite de ceux qui l'ont envoye (un tricheur seul ne peut
   rien imposer). Tous les joueurs encore connectes ont repondu, ou 10 s
   ont passe : on conclut. */
function noterFin(c, m) {
    const salle = c.salle;
    if (!salle.depart || salle.conclue || c.desync) return;
    const n = salle.depart.joueurs.length;
    const rangs = Array.isArray(m.rangs) ? m.rangs.map(Number) : [];
    if (rangs.length !== n || new Set(rangs).size !== n || !rangs.every(s => Number.isInteger(s) && s >= 0 && s < n)) return;
    const astres = rangs.map(s => entier(m.astres && m.astres[s], 0, 500, 0));
    const duree = entier(m.duree, 0, 86400, 0);
    if (!salle.fins) salle.fins = new Map();
    salle.fins.set(c.slot, JSON.stringify([rangs, astres, duree]));
    const la = salle.clients.filter(k => k.ws.readyState === 1 && !k.desync);
    if (la.every(k => salle.fins.has(k.slot))) conclure(salle);
    else if (!salle.minuteurFin) salle.minuteurFin = setTimeout(() => conclure(salle), 10000);
}

async function conclure(salle) {
    if (salle.conclue) return;
    salle.conclue = true;
    clearTimeout(salle.minuteurFin);
    const log = (t) => console.log('[' + salle.nom + '] ' + t);
    const votes = new Map();
    for (const v of salle.fins.values()) votes.set(v, (votes.get(v) || 0) + 1);
    const [cle, voix] = [...votes.entries()].sort((a, b) => b[1] - a[1])[0];
    const refus = (raison) => { log('resultat non classe : ' + raison); aTous(salle, { t: 'resultat', classee: false, raison }); };
    if (voix * 2 <= salle.fins.size) return refus('les joueurs ne sont pas d\'accord sur le resultat');
    if (salle.desync) return refus('partie desynchronisee');
    const [rangs, astres, duree] = JSON.parse(cle);
    log('fin : ' + rangs.map((s, i) => (i + 1) + '. ' + salle.clients[s].nom + ' (' + astres[i] + ' astres)').join(', ') +
        ', ' + duree + ' s, ' + voix + ' voix sur ' + salle.fins.size);
    if (!salle.depart.classee) return refus('partie non classee');
    const classes = rangs.map((s, i) => ({ slot: s, rang: i + 1, astres: astres[i], compte: salle.clients[s].compte }))
                         .filter(x => x.compte);
    try {
        const r = await supabase('/rest/v1/rpc/enregistrer_partie_reseau', SUPABASE_SERVICE, {
            method: 'POST',
            body: JSON.stringify({ p_joueurs: classes.map(x => ({ id: x.compte.id, rang: x.rang, astres: x.astres })),
                                   p_duree: duree, p_total: salle.depart.joueurs.length + salle.depart.ia }),
        });
        if (!Array.isArray(r)) return refus('partie trop courte');
        const elo = {};
        for (const x of classes) {
            const e = r.find(y => y.id === x.compte.id);
            if (e) elo[x.slot] = { avant: e.avant, apres: e.apres };
        }
        log('ELO : ' + classes.map(x => x.compte.pseudo + ' ' + (elo[x.slot] ? elo[x.slot].avant + ' -> ' + elo[x.slot].apres : '?')).join(', '));
        aTous(salle, { t: 'resultat', classee: true, elo });
    } catch (e) {
        refus('enregistrement impossible (' + e.message + ')');
    }
}

const wss = new WebSocketServer({ server: serveur });
wss.on('connection', (ws) => {
    let c = null, verification = false;
    ws.on('message', (brut) => {
        if (brut.length > 400000) return;
        let m;
        try { m = JSON.parse(brut); } catch (e) { return; }
        if (!m || typeof m !== 'object') return;
        /* Un ordre tient en quelques dizaines d'octets ; seul le detail d'une
           desynchronisation (une fois par partie) peut etre gros. */
        if (m.t !== 'detail' && brut.length > 4096) return;
        if (m.t === 'detail' && c) { noterDetail(c, m); return; }
        if (m.t === 'rejoindre' && !c && !verification) {
            /* Le compte d'abord (quelques dizaines de ms), la place ensuite. */
            verification = true;
            verifierJeton(m.jeton).then((compte) => {
                if (ws.readyState === 1) c = rejoindre(ws, m, compte);
            });
            return;
        }
        if (m.t === 'reprendre' && !c) { c = reprendre(ws, m); return; }
        if (!c) return;
        if (m.t === 'pret') {
            c.pret = true;
            if (!c.salle.minuteur && tousPrets(c.salle)) demarrerPaquets(c.salle);
        } else if (m.t === 'ordre') {
            /* Des le depart : ce qui arrive pendant le chargement (la part
               d'envoi reglee avant la partie) part dans le premier paquet. */
            if (!c.salle.lancee || !ORDRES.has(m.type)) return;
            c.salle.ordres.push({ s: c.slot, type: m.type, d: (m.d && typeof m.d === 'object') ? m.d : {} });
        } else if (m.t === 'empreinte') {
            noterEmpreinte(c, m);
        } else if (m.t === 'fin') {
            noterFin(c, m);
        }
    });
    ws.on('close', () => {
        /* Remplace par une reprise : ce n'est plus sa connexion. */
        if (!c || c.ws !== ws) return;
        const salle = c.salle;
        console.log('[' + salle.nom + '] ' + c.nom + ' part');
        /* Avant le depart, celui qui part libere sa place : une page
           rechargee dans l'attente laissait un joueur fantome, la salle se
           croyait pleine et la partie ne demarrait jamais pour de bon. */
        if (!salle.lancee) {
            salle.clients = salle.clients.filter(k => k !== c);
            salle.clients.forEach((k, i) => { k.slot = i; });
            if (!salle.clients.length) { salles.delete(salle.nom); return; }
            aTous(salle, { t: 'attente', presents: salle.clients.length, attendus: salle.reglages.joueurs });
            return;
        }
        /* Parti pendant le chargement : les autres ne l'attendent pas. Ses
           astres restent en jeu, sans ordres - chez tous pareil. */
        if (!salle.minuteur && tousPrets(salle)) demarrerPaquets(salle);
        aTous(salle, { t: 'parti', slot: c.slot });
        /* Plus personne : la salle attend 3 minutes un retour avant de
           disparaitre (les paquets continuent, vides). */
        if (salle.clients.every(k => k.ws.readyState !== 1) && !salle.abandon) {
            salle.abandon = setTimeout(() => {
                clearInterval(salle.minuteur);
                if (salles.get(salle.nom) === salle) salles.delete(salle.nom);
                console.log('[' + salle.nom + '] abandonnee');
            }, 180000);
        }
    });
});

serveur.listen(PORT, () => {
    console.log('Relais d\'ordres sur le port ' + PORT +
                (LATENCE || GIGUE ? ' (latence simulee ' + LATENCE + ' ms + gigue ' + GIGUE + ' ms)' : ''));
    console.log(SUPABASE_SERVICE ? 'Parties rapides classees (ELO)' : 'SUPABASE_SERVICE_KEY absente : aucune partie classee');
    console.log('Essai local : http://localhost:' + PORT + '/?relais=ws://localhost:' + PORT + '&salle=essai&joueurs=2');
});
