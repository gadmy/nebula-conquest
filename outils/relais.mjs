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
     deux navigateurs ne calculent plus la meme chose, il le dit a tous.
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
const PERIODE = 50;                    /* ms entre deux paquets : 3 tours de 1/60 s */

/* Les ordres que le jeu connait (EXECUTER_ORDRE). Le reste est refuse. */
const ORDRES = new Set(['part', 'zone', 'tir', 'tir_surface', 'riposte', 'arret', 'batiment',
    'sacrifice', 'stat', 'techno', 'colonie', 'demol', 'visee', 'visee_fin', 'rafale_debut',
    'rafale_cible', 'rafale_fin', 'boule_debut', 'boule_cible', 'boule_fin', 'boule_lancer']);

/* ── Le jeu, servi par le meme port ── */
const RACINE = resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg',
                '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json' };
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

function rejoindre(ws, m) {
    const nom = String(m.salle || 'essai').slice(0, 40);
    let salle = salles.get(nom);
    if (!salle) {
        salle = {
            nom, clients: [], lancee: false, n: 0, ordres: [], empreintes: new Map(), minuteur: null,
            reglages: {
                joueurs: entier(m.joueurs, 1, 8, 2),
                ia: entier(m.ia, 0, 10, 0),
                carte: entier(m.carte, 0, 14, 6),
                difficulte: ['easy', 'normal', 'hard', 'brutal'].includes(m.difficulte) ? m.difficulte : 'normal',
            },
        };
        salles.set(nom, salle);
    }
    if (salle.lancee || salle.clients.length >= salle.reglages.joueurs) {
        ws.send(JSON.stringify({ t: 'refus', raison: 'salle pleine ou deja lancee' }));
        return null;
    }
    const c = { ws, salle, slot: salle.clients.length, pret: false,
                nom: String(m.nom || ('Joueur ' + (salle.clients.length + 1))).replace(/[<>&"]/g, '').slice(0, 20) };
    salle.clients.push(c);
    aTous(salle, { t: 'attente', presents: salle.clients.length, attendus: salle.reglages.joueurs });
    console.log('[' + nom + '] ' + c.nom + ' arrive (' + salle.clients.length + '/' + salle.reglages.joueurs + ')');
    if (salle.clients.length === salle.reglages.joueurs) {
        salle.lancee = true;
        const graine = 1 + Math.floor(Math.random() * 2147483646);
        const joueurs = salle.clients.map(k => ({ nom: k.nom }));
        for (const k of salle.clients) {
            /* Les reglages d'abord : leur "joueurs" (un nombre) ne doit pas
               ecraser la liste des joueurs. */
            envoyer(k, { t: 'depart', ...salle.reglages, slot: k.slot, graine, joueurs });
        }
        console.log('[' + nom + '] depart, graine ' + graine);
    }
    return c;
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
        salle.ordres = [];
        salle.n++;
    }, PERIODE);
}

/* Les empreintes d'un meme tour doivent etre identiques chez tous. */
function noterEmpreinte(c, m) {
    const salle = c.salle;
    const tour = entier(m.tour, 0, 1e9, -1);
    if (tour < 0) return;
    let e = salle.empreintes.get(tour);
    if (!e) { e = {}; salle.empreintes.set(tour, e); }
    e[c.slot] = { h: String(m.h).slice(0, 16), p: (m.p && typeof m.p === 'object') ? m.p : {} };
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
    } else if (tour % 600 === 0) {
        console.log('[' + salle.nom + '] tour ' + tour + ' : ' + vivants.length + ' joueurs identiques (' + [...valeurs][0] + ')');
    }
    salle.empreintes.delete(tour);
}

const wss = new WebSocketServer({ server: serveur });
wss.on('connection', (ws) => {
    let c = null;
    ws.on('message', (brut) => {
        if (brut.length > 4096) return;            /* un ordre tient en quelques dizaines d'octets */
        let m;
        try { m = JSON.parse(brut); } catch (e) { return; }
        if (!m || typeof m !== 'object') return;
        if (m.t === 'rejoindre' && !c) { c = rejoindre(ws, m); return; }
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
        }
    });
    ws.on('close', () => {
        if (!c) return;
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
        if (salle.clients.every(k => k.ws.readyState !== 1)) {
            clearInterval(salle.minuteur);
            salles.delete(salle.nom);
        }
    });
});

serveur.listen(PORT, () => {
    console.log('Relais d\'ordres sur le port ' + PORT +
                (LATENCE || GIGUE ? ' (latence simulee ' + LATENCE + ' ms + gigue ' + GIGUE + ' ms)' : ''));
    console.log('Essai local : http://localhost:' + PORT + '/?relais=ws://localhost:' + PORT + '&salle=essai&joueurs=2');
});
