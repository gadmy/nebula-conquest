/* PROTOTYPE LOCKSTEP : LA MEME PARTIE DANS DEUX NAVIGATEURS
   Le multijoueur facon OpenFront ne ferait circuler que les ORDRES des
   joueurs ; chaque navigateur calculerait toute la partie. Ca ne tient que
   si deux navigateurs, partis du meme etat et recevant les memes ordres,
   restent identiques au bit pres, tour apres tour.

   Ce banc d'essai le verifie. Il ouvre le jeu dans deux onglets :
   - meme graine, meme carte, memes IA ;
   - memes ordres pour le joueur 0 (des tirs fixes a l'avance, tour par tour,
     comme les enverrait le serveur) ;
   - tours fixes de 1/20 s, sans la boucle d'affichage du navigateur ;
   - et tout ce qui a le droit d'etre different, different : le vrai hasard
     (Math.random, reserve au decor) n'a pas la meme graine, la fenetre n'a
     pas la meme taille, la camera du second onglet se promene et il dessine
     chaque image, le premier jamais.
   A chaque tour les deux onglets calculent empreinteEtat() ; le premier
   tour ou elles different est signale, avec la famille en cause (astres,
   tirs, joueurs, vaisseaux, cometes).

   Usage : node outils/lockstep-test.mjs [--tours 4000] [--graine 1234]
           [--ia 3] [--carte 6] [--pas-variable]
   --pas-variable : le second onglet avance par pas de 1/60 s au lieu de
   1/20 s (trois fois plus de pas pour le meme temps) - pour voir ce que
   donnerait le pas variable d'aujourd'hui. On compare alors toutes les
   0,05 s de jeu.

   Il faut Playwright et Chromium (npm install -D playwright, ou celui deja
   installe sur la machine). */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (nom, def) => {
    const i = args.indexOf('--' + nom);
    return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : def;
};
const TOURS = opt('tours', 4000);
const GRAINE = opt('graine', 1234);
const IA = opt('ia', 3);
const CARTE = opt('carte', 6);
const PAS_VARIABLE = args.includes('--pas-variable');
const TOUR = 1 / 20;

/* Playwright : celui du projet s'il est installe, sinon celui de la machine. */
async function chargerPlaywright() {
    try { return await import('playwright'); } catch (e) { /* on essaie ailleurs */ }
    const racine = execSync('npm root -g').toString().trim();
    return createRequire(join(racine, 'noop.js'))('playwright');
}

/* Un petit serveur pour la page : le jeu charge ses images par http. */
const RACINE = resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg',
                '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json' };
const serveur = http.createServer(async (req, res) => {
    const chemin = join(RACINE, decodeURIComponent(req.url.split('?')[0]));
    if (!chemin.startsWith(RACINE)) { res.writeHead(403); res.end(); return; }
    try {
        const donnees = await readFile(chemin);
        res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' });
        res.end(donnees);
    } catch (e) { res.writeHead(404); res.end(); }
});
await new Promise(ok => serveur.listen(0, ok));
const URL_JEU = 'http://localhost:' + serveur.address().port + '/index.html';

/* Les ordres du joueur 0, fixes a l'avance : un tir tous les 40 tours,
   depuis son n-ieme astre, dans une direction tiree d'une graine a part.
   Ce sont des donnees, pas un calcul : les deux onglets recoivent
   exactement la meme liste, comme s'ils la tenaient du serveur. */
function listeOrdres() {
    let a = GRAINE + 77;
    const alea = () => {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const ordres = [];
    for (let tour = 40; tour < TOURS; tour += 40) {
        ordres.push({ tour, rang: Math.floor(alea() * 8), angle: alea() * Math.PI * 2 });
    }
    return ordres;
}

async function jouer(navigateur, variante, ordres) {
    const page = await navigateur.newPage({
        viewport: variante ? { width: 1600, height: 900 } : { width: 800, height: 600 },
    });
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(e.message));
    /* Le vrai hasard, graine differente dans chaque onglet : s'il servait
       encore quelque part dans la logique du jeu, les parties divergeraient. */
    await page.addInitScript((s) => {
        let a = s;
        Math.random = function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }, variante ? 999 : 1);
    await page.goto(URL_JEU);
    await page.waitForFunction(() => typeof startGame === 'function' && typeof empreinteEtat === 'function');
    await page.waitForTimeout(1000);

    await page.evaluate(([graine, ia, carte]) => {
        document.getElementById('cfgPlayers').value = String(ia);
        document.getElementById('cfgDifficulty').value = 'hard';
        document.getElementById('cfgMap').value = String(carte);
        gameState.multiSeed = graine;
        /* running a vrai AVANT le depart : finishStartGame ne lance pas la
           boucle d'affichage, c'est ce banc qui fait avancer les tours. */
        gameState.running = true;
        startGame();
    }, [GRAINE, IA, CARTE]);
    await page.waitForFunction(() => gameState.phase === 'spawn', null, { timeout: 30000 });

    await page.evaluate((ordres) => {
        /* Le joueur 0 prend la premiere planete libre, les IA suivent. */
        _spawnTarget = gameState.planets.filter(b => b.owner === null)[0];
        confirmSpawn();
        window.__banc = { ordres, k: 0, tirs: 0, tour: 0 };
    }, ordres);
    const empreintes = [await page.evaluate(() => empreinteEtat(true))];

    /* Par tranches de 250 tours, chacune limitee dans le temps : si le jeu
       se fige (une boucle qui ne finit plus, des milliers de tirs), on le
       dit au lieu d'attendre indefiniment. */
    const TRANCHE = 250, DELAI = 60000;
    let gel = null;
    for (let fait = 0; fait < TOURS && !gel; fait += TRANCHE) {
        const n = Math.min(TRANCHE, TOURS - fait);
        let minuteur;
        const tranche = await Promise.race([
            page.evaluate(([n, dt, sousPas, variante]) => {
                const B = window.__banc, ordres = B.ordres, empreintes = [];
                for (let fin = B.tour + n; B.tour < fin;) {
                    const tour = ++B.tour;
                    /* Les ordres du tour s'appliquent avant le calcul du tour. */
                    while (B.k < ordres.length && ordres[B.k].tour === tour) {
                        const o = ordres[B.k++];
                        const miens = gameState.allBodies.filter(b => b.owner === 0 && b.spores >= 10);
                        if (miens.length) {
                            const src = miens[o.rang % miens.length];
                            const n0 = gameState.jets.length;
                            launchJet(src, Math.cos(o.angle), Math.sin(o.angle), 'normal', 0);
                            if (gameState.jets.length > n0) B.tirs++;
                        }
                    }
                    for (let s = 0; s < sousPas; s++) {
                        if (variante) {
                            gameState.camera.zoom = 0.3 + (tour % 50) / 25;
                            gameState.camera.x = Math.sin(tour / 40) * 2000;
                            gameState.camera.y = Math.cos(tour / 55) * 2000;
                        }
                        update(dt);
                        if (variante) render();
                    }
                    empreintes.push(empreinteEtat(true));
                }
                return empreintes;
            }, [n, variante && PAS_VARIABLE ? TOUR / 3 : TOUR, variante && PAS_VARIABLE ? 3 : 1, variante]),
            new Promise(ok => { minuteur = setTimeout(() => ok(null), DELAI); }),
        ]);
        clearTimeout(minuteur);
        if (tranche) { empreintes.push(...tranche); continue; }
        gel = 'le jeu ne repond plus entre les tours ' + fait + ' et ' + (fait + n);
    }
    if (gel) {
        page.close().catch(() => {});      /* la page figee ne repondrait pas */
        return { empreintes, gel, erreurs, bilan: {} };
    }

    const resultat = await page.evaluate(() => {
        const st = gameState.gameStats;
        return {
            bilan: {
                'tirs du joueur 0': window.__banc.tirs,
                'tirs en tout': st.jetsLaunched,
                'conquetes': st.bodiesConquered,
                'tirs neutralises': st.jetsNeutralized,
                'astres possedes': gameState.allBodies.filter(b => b.owner !== null).length,
                'batiments': gameState.allBodies.reduce((n, b) => n + (b.edifices || []).length, 0),
                'astres par joueur': gameState.players.map(p => p.alive ? p.bodies.length : 'elimine').join(' / '),
            },
        };
    });
    resultat.empreintes = empreintes;
    resultat.erreurs = erreurs;
    await page.close();
    return resultat;
}

const { chromium } = await chargerPlaywright();
const navigateur = await chromium.launch();
const ordres = listeOrdres();
console.log('Lockstep : graine ' + GRAINE + ', carte ' + CARTE + ', ' + IA + ' IA, ' + TOURS +
            ' tours de 1/20 s (' + (TOURS * TOUR) + ' s de jeu), ' + ordres.length + ' ordres du joueur 0' +
            (PAS_VARIABLE ? ', second onglet en pas de 1/60 s' : ''));
const t0 = Date.now();
const [A, B] = await Promise.all([jouer(navigateur, false, ordres), jouer(navigateur, true, ordres)]);
if (!A.gel && !B.gel) await navigateur.close();
serveur.close();

for (const [nom, r] of [['A', A], ['B', B]]) {
    if (r.erreurs.length) console.log('Erreurs onglet ' + nom + ' :', r.erreurs.slice(0, 5));
}
if (A.gel || B.gel) {
    console.log('\nGEL : ' + (A.gel ? 'onglet A, ' + A.gel : '') + (A.gel && B.gel ? ' ; ' : '') +
                (B.gel ? 'onglet B, ' + B.gel : '') + '. Relancer avec moins de --tours pour cerner le tour.');
    process.exit(2);
}
console.log('Onglet A (petite fenetre, sans dessin) :', A.bilan);
console.log('Onglet B (grande fenetre, camera mobile, dessin) :', B.bilan);

let ecart = -1;
for (let i = 0; i < A.empreintes.length; i++) {
    if (A.empreintes[i].empreinte !== B.empreintes[i].empreinte) { ecart = i; break; }
}
if (ecart < 0) {
    console.log('\nIDENTIQUE : ' + (A.empreintes.length - 1) + ' tours, meme empreinte a chaque tour (derniere : ' +
                A.empreintes[A.empreintes.length - 1].empreinte + '). ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s.');
    process.exit(0);
}
const pa = A.empreintes[ecart].parts, pb = B.empreintes[ecart].parts;
const familles = Object.keys(pa).filter(f => pa[f] !== pb[f]);
console.log('\nDESYNCHRONISATION au tour ' + ecart + ' (' + (ecart * TOUR).toFixed(2) + ' s de jeu) : ' +
            (familles.length ? familles.join(', ') : 'horloge de la partie'));
process.exit(1);
