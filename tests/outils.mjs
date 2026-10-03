/* Outils communs aux tests de jeu (dans un vrai navigateur, Chromium). */
import { execSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Playwright : celui du projet s'il est installe, sinon celui de la machine. */
export async function chargerPlaywright() {
    try { return await import('playwright'); } catch (e) { /* on essaie ailleurs */ }
    const racine = execSync('npm root -g').toString().trim();
    return createRequire(join(racine, 'noop.js'))('playwright');
}

/* Le relais local, qui sert aussi la page du jeu. */
/* options : arguments de plus pour le relais (ex. ['--carte-essai', fichier]). */
export async function demarrerRelais(options) {
    const port = 9000 + Math.floor(Math.random() * 900);
    const p = spawn(process.execPath, ['outils/relais.mjs', '--port', String(port)].concat(options || []), { cwd: RACINE });
    let journal = '';
    p.stdout.on('data', d => { journal += d; });
    p.stderr.on('data', d => { journal += d; });
    for (let i = 0; i < 50; i++) {
        await new Promise(ok => setTimeout(ok, 100));
        try { const r = await fetch('http://localhost:' + port + '/index.html'); if (r.ok) break; } catch (e) { /* pas encore */ }
    }
    return { port, url: 'http://localhost:' + port, journal: () => journal, arreter: () => p.kill() };
}

/* Un test qui echoue sort en code 1 avec la raison. */
export function verifier(condition, message) {
    if (!condition) { console.error('ECHEC : ' + message); process.exitCode = 1; throw new Error(message); }
    console.log('  ok  ' + message);
}
