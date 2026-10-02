/* FABRICATION DE LA PAGE DU JEU
   Le jeu se travaille dans src/ : la page (src/page.html), le style
   (src/css/) et le code (src/js/, range par theme : noyau, moteur, rendu,
   reseau, interface, audio, comptes, donnees). Ce script les rassemble en un
   seul index.html, celui que recoivent les joueurs (GitHub Pages).

   Chaque ligne <!--#inclure chemin--> de src/page.html est remplacee par le
   contenu exact du fichier src/chemin. Le code reste donc UN SEUL script,
   dans le meme ordre qu'avant : memes regles (une fonction peut etre appelee
   avant d'etre ecrite), meme "use strict", meme empreinte de version entre
   joueurs, meme copie brouillee (npm run brouiller).

   Usage :
     npm run construire            fabrique index.html
     npm run construire -- --verifier   dit si index.html est a jour (sans l'ecrire) */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RACINE, 'src');
const SORTIE = join(RACINE, 'index.html');

const page = readFileSync(join(SRC, 'page.html'), 'utf8');
let nb = 0;
const html = page.replace(/^[ \t]*<!--#inclure ([^\s>]+)-->\r?\n/gm, (_, chemin) => {
    nb++;
    return readFileSync(join(SRC, chemin), 'utf8');
});

if (process.argv.includes('--verifier')) {
    let actuel = '';
    try { actuel = readFileSync(SORTIE, 'utf8'); } catch (e) {}
    if (actuel !== html) {
        console.error('index.html n\'est pas a jour : lancer "npm run construire" (et ne jamais modifier index.html a la main).');
        process.exit(1);
    }
    console.log('index.html est a jour (' + nb + ' fichiers).');
} else {
    writeFileSync(SORTIE, html);
    console.log('index.html fabrique : ' + nb + ' fichiers, ' + Math.round(html.length / 1024) + ' Ko.');
}
