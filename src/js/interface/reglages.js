const SKY_CFG = { r: 22, g: 38, b: 78, brightness: 100, _hex: '#16264E' };

// ─────────────────────────────────────────────
// FOND SPATIAL — Couches PNG en parallaxe
// ─────────────────────────────────────────────

// ═══ Listener ZOOM UI ═══
document.getElementById('uiZoomSlider').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('uiZoomVal').textContent = val + '%';
    const scale = val / 100;
    // Appliquer le zoom aux éléments HUD
    const els = ['evoPanel', 'myPlanets', 'minimap', 'uiZoomControl', 'scoreBoard', 'sporeCounter', 'eventLog', 'codex'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.transformOrigin = 'top left';
            if (id === 'minimap' || id === 'uiZoomControl') el.style.transformOrigin = 'bottom right';
            if (id === 'scoreBoard' || id === 'sporeCounter') el.style.transformOrigin = 'top right';
            if (id === 'eventLog' || id === 'codex') el.style.transformOrigin = 'bottom left';
            const cur = el.style.transform || '';
            if (cur && cur !== 'none' && /scale\(/.test(cur)) {
                el.style.transform = cur.replace(/scale\([^)]*\)/, `scale(${scale})`);
            } else {
                el.style.transform = scale !== 1 ? `scale(${scale})` : (cur === 'none' ? 'none' : '');
            }
        }
    });
});

// ═══ Listener Jet Ratio ═══
document.getElementById('jetRatioSlider').addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    gameState.jetRatio = v / 100;
    document.getElementById('jetRatioVal').textContent = v + '%';
    /* En multijoueur c'est le serveur qui tire : sans cet envoi il gardait
       50 % quoi que le curseur affiche. */
    if (gameState.isMulti) sendAction('set_jet_ratio', { value: gameState.jetRatio });
    else donnerOrdre('part', { v: gameState.jetRatio });
    majJaugeEnvoi(true);
});

// ═══ Tabs Évolution / Technologies ═══
// ═══════════════════════════════════════════
// LABO DE SPORES
// ═══════════════════════════════════════════

const SPORE_COLORS = ['#C8A0FF','#4ADE80','#60A5FA','#F472B6','#FB923C','#FACC15','#E879F9','#34D399'];


function _applyActiveSpore() { /* spores uniformes — labo supprimé */ }

function _checkSporeReady() { return true; }

// Onglets codex
document.querySelectorAll('#codex .codex-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#codex .codex-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#codex .codex-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.ctab).classList.add('active');
        requestAnimationFrame(() => requestAnimationFrame(() => _clampCodex()));
    });
});

document.querySelectorAll('#evoPanel .evo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#evoPanel .evo-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#evoPanel .evo-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('active');
    });
});
// ═══ Listeners Tech Tree ═══
/* En solo, l'achat est un ordre ('techno') : on verifie seulement qu'il est
   payable, pour ne pas faire cliqueter un bouton qui ne fera rien. */
function acheterTechno(branche) {
    const p = gameState.players?.[localSlot()];
    if (!p) return;
    if (gameState.isMulti) { if (buyTech(p, branche)) { playClickSound(); updateTechPanel(); } return; }
    if (p.totalSpores < getTechCost(p, branche) || p.tech[branche] >= 10) return;
    playClickSound();
    donnerOrdre('techno', { branche: branche });
}
document.getElementById('techHomingBuy').addEventListener('click', () => acheterTechno('homing'));
document.getElementById('techTenacityBuy').addEventListener('click', () => acheterTechno('tenacity'));
document.getElementById('techMimicryBuy').addEventListener('click', () => acheterTechno('mimicry'));

// ═══ Listeners MULTIPLICITÉ ═══
document.body.appendChild(document.getElementById('spawnPopup'));
document.getElementById('spawnPopupBtn').addEventListener('click', () => { playClickSound(); confirmSpawn(); });
document.getElementById('spawnPopupClose').addEventListener('click', () => { playClickSound(); _spawnTarget = null; document.getElementById('spawnPopup').style.display = 'none'; });
document.getElementById('evoSacrifice').addEventListener('input', (e) => {
    const human = gameState.players[localSlot()];
    if (human) {
        const v = parseInt(e.target.value);
        if (gameState.isMulti) {
            human.multiSacrifice = v;
            sendAction('set_sacrifice', { value: v });
        } else {
            donnerOrdre('sacrifice', { v: v });
        }
    }
});
/* Un palier de multiplicite place sur une statistique : ordre 'stat' en solo. */
function choisirStat(stat) {
    const human = gameState.players[localSlot()];
    if (!human || !human._multiPending) return;
    if (gameState.isMulti) { applyMultiChoice(human, stat); sendAction('multi', { stat: stat }); return; }
    donnerOrdre('stat', { stat: stat });
}
document.getElementById('evoGrowth').addEventListener('click', () => choisirStat('growth'));
document.getElementById('evoVelocity').addEventListener('click', () => choisirStat('velocity'));
document.getElementById('evoSensitivity').addEventListener('click', () => choisirStat('sensitivity'));
document.getElementById('evoDensity').addEventListener('click', () => choisirStat('density'));

