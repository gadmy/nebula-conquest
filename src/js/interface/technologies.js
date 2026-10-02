// ─────────────────────────────────────────────
// ARBRE TECHNOLOGIQUE — Spores
// ─────────────────────────────────────────────
/* Les explications ne sont plus ecrites sous chaque branche : elles tenaient
   trois lignes chacune en permanence, pour un texte qu'on lit une fois. Elles
   sont passees en infobulle, au survol de la branche. */
const TECH_BRANCHES = {
    homing: { icon:'🎯', name:'Tête chercheuse', desc:'Les jets dévient d\'eux-mêmes vers les planètes neutres ou ennemies proches de leur trajectoire. Plus le niveau est haut, plus la déviation est forte et lointaine.', levels:['Instinct','Attraction','Magnétisme','Radar','Sonar spatial','Traque','Poursuite','Prédation','Guidage total','Œil omniscient'] },
    tenacity: { icon:'💪', name:'Ténacité', desc:'Les jets séparés gardent davantage de spores en route et visent les systèmes plutôt que les astres isolés. Plus le niveau est haut, moins le voyage coûte cher.', levels:['Résistance','Endurance','Persistance','Résilience','Insubmersible','Régénération','Duplication','Essaim','Prolifération','Hydre cosmique'] },
    mimicry: { icon:'🦎', name:'Mimétisme', desc:'À la conquête d\'une planète, le jet se scinde et part aussi vers ses lunes. Plus le niveau est haut, plus de lunes sont touchées et plus la part qui leur revient est grosse.', levels:['Écho','Résonance','Fragmentation','Propagation','Ramification','Cascade','Nuée','Pandémie','Assimilation','Fléau lunaire'] }
};

/* Posees une seule fois : le contenu est calcule au survol, donc le niveau et
   le cout affiches sont toujours ceux du moment. */
let _infobullesTech = false;
function poserInfobullesTech() {
    if (_infobullesTech) return;
    _infobullesTech = true;
    const branches = { homing: 'techHoming', tenacity: 'techTenacity', mimicry: 'techMimicry' };
    Object.keys(branches).forEach(function (cle) {
        const el = document.getElementById(branches[cle]);
        if (!el) return;
        infobulle(el, function () {
            const info = TECH_BRANCHES[cle];
            const joueur = gameState.players && gameState.players[localSlot()];
            let txt = info.name + ' — ' + info.desc;
            if (joueur && joueur.tech) {
                const n = joueur.tech[cle] || 0;
                txt += '\n\n' + (n > 0 ? 'Niveau ' + n + '/10 : ' + info.levels[n - 1]
                                       : 'Pas encore débloquée.');
                if (n < 10) txt += '\nSuivant : ' + info.levels[n] + ' (' + getTechCost(joueur, cle) + ' spores)';
            }
            return txt;
        });
    });
}
function getTechCost(player, branch) {
    const tech = player.tech; const lvl = tech[branch];
    if (lvl >= 10) return Infinity;
    let order = tech._branchOrder.indexOf(branch);
    if (order === -1) order = tech._branchOrder.length;
    /* Triple depuis la v9.7.9 (choix du createur) : 3 000 / 6 000 / 9 000,
       et 300 / 600 / 900 de plus par niveau. */
    const baseCost = [3000,6000,9000][Math.min(order,2)];
    const increment = [300,600,900][Math.min(order,2)];
    return baseCost + lvl * increment;
}
function buyTech(player, branch) {
    const cost = getTechCost(player, branch);
    if (player.totalSpores < cost || player.tech[branch] >= 10) return false;
    let toDeduct = cost;
    const bodies = player.bodies.slice().sort((a,b) => b.spores - a.spores);
    for (const body of bodies) { const take = Math.min(body.spores, toDeduct); body.spores -= take; toDeduct -= take; if (toDeduct <= 0) break; }
    if (toDeduct > 0) return false;
    if (player.tech[branch] === 0 && !player.tech._branchOrder.includes(branch)) player.tech._branchOrder.push(branch);
    player.tech[branch]++;
    const info = TECH_BRANCHES[branch];
    addEvent('build', info.icon, `${info.name} niv.${player.tech[branch]} — ${info.levels[player.tech[branch]-1]}`, null, player.color);
    return true;
}
function updateTechPanel() {
    const slot = localSlot(); const player = gameState.players?.[slot];
    if (!player) return;
    for (const branch of ['homing','tenacity','mimicry']) {
        const lvl = player.tech[branch]; const info = TECH_BRANCHES[branch];
        const cap = branch.charAt(0).toUpperCase() + branch.slice(1);
        const pipsEl = document.getElementById('tech'+cap+'Pips');
        if (pipsEl && pipsEl.children.length === 0) { for (let i=0;i<10;i++) { const p=document.createElement('div'); p.className='tech-pip'; pipsEl.appendChild(p); } }
        if (pipsEl) { for (let i=0;i<10;i++) pipsEl.children[i].className = 'tech-pip' + (i<lvl?' filled':''); }
        const lvlEl = document.getElementById('tech'+cap+'Lvl');
        if (lvlEl) lvlEl.textContent = lvl+'/10';
        const nameEl = document.getElementById('tech'+cap+'Name');
        if (nameEl) nameEl.textContent = lvl > 0 ? info.levels[lvl-1] : '—';
        const buyEl = document.getElementById('tech'+cap+'Buy');
        if (buyEl) { if (lvl>=10) { buyEl.disabled=true; buyEl.innerHTML='✦ MAX ✦'; } else { const cost=getTechCost(player,branch); buyEl.disabled=player.totalSpores<cost; buyEl.innerHTML='Niv.'+(lvl+1)+' → '+info.levels[lvl]+' <span class="tech-cost">('+cost+')</span>'; } }
    }
}

