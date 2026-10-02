/* TEST : UNE PARTIE SOLO, de bout en bout, dans un vrai navigateur.
   Ecran des regimes (9 cartes, logos), choix d'un regime, choix de la
   planete, 3 minutes de jeu en accelere avec dessin, panneau NAISSANCE,
   fiche d'un astre au clic droit, raccourcis (K), aucune erreur de page.
   Usage : node tests/partie-solo.mjs */
import { chargerPlaywright, demarrerRelais, verifier } from './outils.mjs';

const { chromium } = await chargerPlaywright();
const relais = await demarrerRelais();
const navigateur = await chromium.launch();
const erreurs = [];
try {
    const p = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });
    p.on('pageerror', e => erreurs.push(e.message));
    await p.goto(relais.url + '/', { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => typeof startGame === 'function');
    await p.waitForTimeout(800);
    await p.evaluate(() => {
        localStorage.setItem('nc_histoireVue', '1');
        const a = document.getElementById('authScreen'); if (a) a.classList.add('hidden');
        document.getElementById('cfgPlayers').value = '5';
        gameState.multiSeed = 2024;
        startGame();
    });
    await p.waitForSelector('#ecranRegime .rg-carte', { timeout: 60000 });
    verifier(await p.locator('#ecranRegime .rg-carte').count() === 9, 'ecran des regimes : 9 cartes');
    await p.click('#ecranRegime .rg-carte[data-id="ecolo_pas_trop"]');
    await p.waitForFunction(() => gameState.depart && gameState.depart.etape === 'planete', null, { timeout: 10000 });
    verifier(true, 'regime choisi, etape planete');
    await p.evaluate(() => { while (gameState.phase !== 'game') tourSimulation(); });
    verifier(await p.evaluate(() => gameState.players[0].bodies.length > 0 && gameState.players[0].regime === 'ecolo_pas_trop'), 'partie lancee, une planete de depart');
    /* 3 minutes de jeu, avec une image dessinee de temps en temps */
    await p.evaluate(() => { for (let s = 0; s < 180; s++) { for (let i = 0; i < 60; i++) tourSimulation(); render(); } });
    const etat = await p.evaluate(() => ({ tour: gameState.tour, astres: gameState.allBodies.filter(b => b.owner !== null).length, jets: gameState.jets.length }));
    verifier(etat.tour > 10800 && etat.astres > 5, '3 minutes de jeu (' + etat.astres + ' astres pris)');
    /* panneau NAISSANCE et fiche d'un astre */
    await p.evaluate(() => { const m = gameState.players[0].bodies[0] || gameState.planets[0]; gameState.selectedBody = m; followingBody = m; openCodex(m); });
    await p.waitForTimeout(500);
    verifier(await p.evaluate(() => gameState.codexOpen && document.getElementById('codexBat').textContent.length > 0), 'fiche de l\'astre avec ses batiments');
    await p.keyboard.press('KeyK');
    await p.waitForTimeout(300);
    verifier(erreurs.length === 0, 'aucune erreur de page' + (erreurs.length ? ' : ' + erreurs.slice(0, 3).join(' | ') : ''));
} catch (e) {
    process.exitCode = 1;
    if (!String(e.message).startsWith('ECHEC')) console.error(e);
} finally {
    await navigateur.close();
    relais.arreter();
}
