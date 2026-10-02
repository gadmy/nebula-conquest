/* TEST : UNE PARTIE EN RESEAU A DEUX NAVIGATEURS, par le relais local.
   Les deux joueurs choisissent leur regime, jouent ~45 s ; le relais doit
   les trouver identiques. Puis le joueur 2 recharge sa page et REPREND :
   reprise depuis la photo de la partie, puis toujours identiques.
   Usage : node tests/reseau.mjs   (environ 2 minutes) */
import { chargerPlaywright, demarrerRelais, verifier } from './outils.mjs';

const { chromium } = await chargerPlaywright();
const relais = await demarrerRelais();
const navigateur = await chromium.launch();
const erreurs = [];
const consoleJ2 = [];
const P = [];
try {
    for (let i = 0; i < 2; i++) {
        const ctx = await navigateur.newContext({ viewport: { width: 1100, height: 750 } });
        const p = await ctx.newPage();
        p.on('pageerror', e => erreurs.push((i + 1) + ': ' + e.message));
        if (i === 1) p.on('console', m => consoleJ2.push(m.type() + ' ' + m.text()));
        await p.goto(relais.url + '/?relais=ws://localhost:' + relais.port + '&salle=essai&joueurs=2&ia=2', { waitUntil: 'domcontentloaded' });
        P.push(p);
    }
    for (const p of P) await p.waitForSelector('#ecranRegime .rg-carte', { timeout: 60000 });
    await P[0].click('#ecranRegime .rg-carte[data-id="anarchie_organisee"]');
    await P[1].click('#ecranRegime .rg-carte[data-id="droite_proletaire"]');
    for (const p of P) await p.waitForFunction(() => gameState.phase === 'game', null, { timeout: 90000 });
    verifier(true, 'les deux joueurs sont en partie');
    await P[0].waitForTimeout(45000);
    const identiques = (j) => /joueurs identiques/.test(j);
    verifier(identiques(relais.journal()), 'le relais trouve les deux parties identiques');
    /* Reprise : le joueur 2 recharge sa page et reprend depuis la photo. */
    const tourAvant = await P[0].evaluate(() => gameState.tour);
    await P[1].reload({ waitUntil: 'domcontentloaded' });
    await P[1].waitForFunction(() => typeof reprendrePartieReseau === 'function' && partieReseauGardee());
    await P[1].evaluate(() => { localStorage.setItem('nc_histoireVue', '1'); reprendrePartieReseau(); });
    await P[1].waitForFunction((t) => { const L = gameState.lockstep; return L && L.enJeu && gameState.phase === 'game' && gameState.tour > t && L.tourPermis - gameState.tour < 120; }, tourAvant, { timeout: 120000 });
    verifier(await P[1].evaluate(() => gameState.lockstep.depuisPhoto !== undefined), 'reprise depuis la photo de la partie');
    const nbAvant = (relais.journal().match(/joueurs identiques/g) || []).length;
    await P[0].waitForTimeout(25000);
    const nbApres = (relais.journal().match(/joueurs identiques/g) || []).length;
    verifier(nbApres > nbAvant && !/DESYNCHRONISATION/.test(relais.journal()), 'apres la reprise, toujours identiques');
    const desync = await Promise.all(P.map(p => p.evaluate(() => gameState.lockstep.desync)));
    verifier(desync.every(d => d === null), 'aucune desynchronisation chez les joueurs');
    verifier(erreurs.length === 0, 'aucune erreur de page' + (erreurs.length ? ' : ' + erreurs.slice(0, 3).join(' | ') : ''));
} catch (e) {
    process.exitCode = 1;
    if (!String(e.message).startsWith('ECHEC')) console.error(e);
    /* Ce que voit le joueur 2 (message a l'ecran, etat du lien au relais). */
    try {
        console.error('--- joueur 2 ---\n' + await P[1].evaluate(() => {
            const L = gameState.lockstep, el = document.getElementById('bandeauLockstep');
            return JSON.stringify({ phase: gameState.phase, tour: gameState.tour, message: el && el.textContent,
                lien: L && { ws: L.ws && L.ws.readyState, enJeu: L.enJeu, tourPermis: L.tourPermis, paquets: L.paquets, essais: L.essais } });
        }));
    } catch (x) {}
    console.error('--- console du joueur 2 ---\n' + consoleJ2.slice(-15).join('\n'));
    console.error('--- journal du relais ---\n' + relais.journal().split('\n').slice(-15).join('\n'));
} finally {
    await navigateur.close();
    relais.arreter();
}
