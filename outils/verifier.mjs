/* VERIFICATIONS RAPIDES (sans navigateur), lancees par npm run verifier et
   par GitHub a chaque modification :
   1. index.html est bien fabrique a partir de src/ (npm run construire) ;
   2. chaque fichier de code de src/js/ se lit seul, sans erreur ;
   3. les scripts assembles dans index.html se lisent sans erreur ;
   4. les outils (relais, banc, fabrication...) se lisent sans erreur.
   Sort en erreur (code 1) au premier probleme, en disant lequel. */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
let erreurs = 0;
const ok = (m) => console.log('  ok  ' + m);
const ko = (m) => { console.error('  KO  ' + m); erreurs++; };

/* Lit un script classique (pas un module) sans l'executer. */
function lire(code, nom) {
    try { new vm.Script(code, { filename: nom }); return true; }
    catch (e) { ko(nom + ' : ' + e.message); return false; }
}
function fichiers(dossier, ext) {
    const r = [];
    for (const f of readdirSync(dossier)) {
        const p = join(dossier, f);
        if (statSync(p).isDirectory()) r.push(...fichiers(p, ext));
        else if (p.endsWith(ext)) r.push(p);
    }
    return r.sort();
}

console.log('1. Fabrication de index.html');
try {
    execFileSync(process.execPath, [join(RACINE, 'outils/construire.mjs'), '--verifier'], { stdio: 'pipe' });
    ok('index.html est a jour');
} catch (e) { ko((e.stderr || '').toString().trim() || 'index.html pas a jour'); }

console.log('2. Fichiers de code (src/js)');
const js = fichiers(join(RACINE, 'src/js'), '.js');
let bons = 0;
for (const f of js) if (lire(readFileSync(f, 'utf8'), relative(RACINE, f))) bons++;
if (bons === js.length) ok(js.length + ' fichiers');

console.log('3. Scripts de index.html');
const page = readFileSync(join(RACINE, 'index.html'), 'utf8');
const scripts = [...page.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
let n = 0;
scripts.forEach((s, i) => { if (lire(s, 'index.html, script ' + (i + 1))) n++; });
if (n === scripts.length) ok(scripts.length + ' scripts');

console.log('4. Outils');
for (const f of [...fichiers(join(RACINE, 'outils'), '.mjs'), ...fichiers(join(RACINE, 'tests'), '.mjs')]) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); ok(relative(RACINE, f)); }
    catch (e) { ko(relative(RACINE, f) + ' : ' + (e.stderr || '').toString().split('\n').slice(0, 4).join(' ')); }
}

if (erreurs) { console.error('\n' + erreurs + ' probleme(s).'); process.exit(1); }
console.log('\nTout est bon.');
