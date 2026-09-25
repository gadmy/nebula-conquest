/* BROUILLAGE DU JEU POUR LA PUBLICATION
   Fabrique dist/ : la copie que recoivent les joueurs. Le index.html du
   depot reste la version de travail, lisible ; on ne touche jamais a lui.

   Dans la copie :
   - les commentaires HTML disparaissent (journal de developpement compris),
     sauf la mention de droits d'auteur, remise en tete ;
   - les commentaires CSS disparaissent ;
   - chaque script est compacte par Terser, et ses noms LOCAUX sont
     remplaces par des lettres. Les noms de premier niveau (fonctions,
     variables globales) restent tels quels : le HTML les appelle par leur
     nom (onclick="..."), et les trois scripts de la page se les partagent.
   - les dossiers assets/ et Audio/ et le fichier _headers sont recopies.

   Usage : npm install, puis npm run brouiller */

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { minify } from 'terser';

const SOURCE = 'index.html';
const SORTIE = 'dist';

const DROITS =
    '<!-- © 2025 Guillaume de Mauroy — Tous droits réservés\n' +
    '     Nebula Conquest — https://nebulaconquest.com\n' +
    '     Toute reproduction ou distribution sans autorisation expresse est interdite. -->\n';

const html = readFileSync(SOURCE, 'utf8');

/* On decoupe la page en morceaux : les scripts en ligne d'un cote, le reste
   de l'autre. Les commentaires HTML ne sont retires QUE hors des scripts,
   pour ne jamais toucher a une chaine du code qui en contiendrait. */
const reScript = /(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/gi;
const morceaux = [];
let dernier = 0, m;
while ((m = reScript.exec(html))) {
    morceaux.push({ html: html.slice(dernier, m.index) });
    morceaux.push({ ouverture: m[1], code: m[2], fermeture: m[3] });
    dernier = reScript.lastIndex;
}
morceaux.push({ html: html.slice(dernier) });

const nettoyerHtml = (t) => t
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (_, a, css, b) => a + css.replace(/\/\*[\s\S]*?\*\//g, '') + b)
    .replace(/\n\s*\n+/g, '\n');

let sortie = '';
let avant = 0, apres = 0;
for (const p of morceaux) {
    if (p.html !== undefined) { sortie += nettoyerHtml(p.html); continue; }
    const r = await minify(p.code, {
        ecma: 2020,
        toplevel: false,
        compress: true,
        mangle: true,
        format: { comments: false },
    });
    if (r.code === undefined) throw new Error('Terser n\'a rien rendu pour un script');
    avant += p.code.length; apres += r.code.length;
    sortie += p.ouverture + r.code + p.fermeture;
}
sortie = DROITS + sortie.trimStart();

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE);
writeFileSync(SORTIE + '/index.html', sortie);
for (const d of ['assets', 'Audio', '_headers']) {
    if (existsSync(d)) cpSync(d, SORTIE + '/' + d, { recursive: true });
}

const ko = (n) => Math.round(n / 1024) + ' Ko';
console.log('Scripts : ' + ko(avant) + ' -> ' + ko(apres));
console.log('Page    : ' + ko(html.length) + ' -> ' + ko(sortie.length));
console.log('Copie brouillee ecrite dans ' + SORTIE + '/');
