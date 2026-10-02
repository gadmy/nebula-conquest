// ─────────────────────────────────────────────
// JETS DE SPORES — Physique
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// CODEX — Panneau latéral
// ─────────────────────────────────────────────

/* Le nombre de batiments de l'astre, dans la fiche (clic droit). */
function _codexBatiments(b) {
    const el = document.getElementById('codexBat');
    if (!el) return;
    if (b.type === 'sun') { el.textContent = '—'; return; }
    let h = iconeBat('alveole', 12) + ' ' + (b.alveoles || 0) + ' &nbsp;' + iconeBat('nid', 12) + ' ' + (b.nids || 0)
          + ' &nbsp;' + iconeBat('biome', 12) + ' ' + (b.biomes || 0);
    if ((b.parasiteSpore || 0) >= 1) h += ' &nbsp;' + iconeBat('parasite', 12) + ' prête';
    else if (b.buildMode === 'parasite') h += ' &nbsp;' + iconeBat('parasite', 12) + ' en cours';
    if (el._h !== h) { el.innerHTML = h; el._h = h; }
}
function openCodex(body) {
    gameState.selectedBody = body;
    gameState.codexOpen = true;
    document.getElementById('codexName').textContent = body.name;

    // Aperçu texture
    const previewEl = document.getElementById('codexPreview');
    previewEl.innerHTML = '';
    if (body._texture) {
        const preview = document.createElement('canvas');
        const size = 80;
        preview.width = size;
        preview.height = size;
        preview.style.cssText = 'border-radius:50%;border:2px solid rgba(100,70,180,0.3);';
        const pctx = preview.getContext('2d');
        pctx.drawImage(body._texture, 0, 0, size, size);
        previewEl.appendChild(preview);
    }

    document.getElementById('codexType').textContent = body.type === 'sun' ? 'Soleil' : body.type === 'planet' ? 'Planète' : 'Lune';
    document.getElementById('codexRadius').textContent = Math.round(body.radius);
    document.getElementById('codexFlore').textContent = body.flore !== undefined ? body.flore : '—';
    document.getElementById('codexFaune').textContent = body.faune !== undefined ? body.faune : '—';
    const owner = body.owner !== null && body.owner !== undefined
        ? gameState.players[body.owner]?.name || 'Inconnu'
        : 'Neutre';
    document.getElementById('codexOwner').textContent = owner;
    document.getElementById('codexSpores').textContent = body.spores !== undefined ? _sp(body.spores) : '—';
    _codexBatiments(body);

    // Symbiose
    const symEl = document.getElementById('codexSymbiose');
    if (body.owner !== null && body.symbiosis !== undefined) {
        symEl.style.display = 'block';
        const pct = Math.floor(body.symbiosis);
        document.getElementById('codexSymVal').textContent = pct + '%';
        document.getElementById('codexSymBar').style.width = pct + '%';
        const bonusMax = body.type === 'planet' ? 20 : 10;
        const bonusCurrent = (pct / 100 * bonusMax).toFixed(1);
        document.getElementById('codexSymBonus').textContent = '+' + bonusCurrent + '% production';
    } else {
        symEl.style.display = 'none';
    }

    // Nids & Biomes
    const buildEl = document.getElementById('codexBuild');
    if (body.owner !== null && body.type !== 'sun') {
        buildEl.style.display = 'block';
        const isLocal = body.owner === localSlot();
        document.querySelectorAll('input[name="buildMode"]').forEach(r => {
            r.checked = (r.value === (body.buildMode || 'off'));
            r.disabled = !isLocal;
        });
        updateCodexBuild(body);
    } else {
        buildEl.style.display = 'none';
    }

    const codexEl = document.getElementById('codex');
    codexEl.classList.add('open');
}

/* INFOBULLE AU SURVOL. Une seule bulle pour toute la page, deplacee sous le
   curseur : dix bulles cachees dans le document coutent plus cher qu'une seule
   qu'on rehabille. Le texte peut etre une fonction, evaluee au moment du
   survol - c'est ce qui permet a une infobulle d'annoncer un niveau ou un
   cout qui a change depuis le chargement de la page. */
function infobulle(el, texte) {
    if (!el) return;
    let bulle = document.getElementById('_bldTooltip');
    if (!bulle) {
        bulle = document.createElement('div');
        bulle.id = '_bldTooltip';
        bulle.style.cssText = 'position:fixed;z-index:200;background:rgba(10,8,35,0.97);border:1px solid rgba(100,70,180,0.5);border-radius:6px;padding:7px 10px;font-family:"Exo 2",sans-serif;font-size:12px;color:#E2D9F3;pointer-events:none;max-width:240px;line-height:1.5;opacity:0;transition:opacity 0.15s;white-space:pre-line;';
        document.body.appendChild(bulle);
    }
    let minuteur = null;
    const placer = function (e) {
        /* Rester dans la fenetre : la bulle passe a gauche du curseur si elle
           deborderait a droite, et remonte si elle deborderait en bas. */
        const l = Math.min(e.clientX + 12, window.innerWidth - bulle.offsetWidth - 8);
        const t = Math.min(e.clientY - 10, window.innerHeight - bulle.offsetHeight - 8);
        bulle.style.left = Math.max(8, l) + 'px';
        bulle.style.top = Math.max(8, t) + 'px';
    };
    el.addEventListener('mouseenter', (e) => {
        clearTimeout(minuteur);
        minuteur = setTimeout(() => {
            bulle.textContent = (typeof texte === 'function') ? texte() : texte;
            bulle.style.opacity = '1';
            placer(e);
        }, 200);
    });
    el.addEventListener('mouseleave', () => {
        clearTimeout(minuteur);
        bulle.style.opacity = '0';
    });
    el.addEventListener('mousemove', placer);
}

function _bldInfoText(body, mode) {
    /* La construction etant immediate, il n'y a plus de chantier en cours a
       decrire : on annonce le cout du prochain batiment du genre. */
    if (mode==='nid'||mode==='biome'||mode==='alveole') {
        return `Prochain: ${coutBatiment(body, mode)} sp`;
    }
    if (mode==='parasite') {
        if ((body.parasiteSpore||0)>=1) return '✅ Prête à lancer !';
        const pct = Math.floor(Math.min(100,((body.parasiteProgress||0)/Math.max(1,((body.flore||1)/100)*2*120))*100));
        return `Accumulation : ${pct}%`;
    }
    return '';
}

function updateCodexBuild(body) {
    const grid = document.getElementById('codexBldGrid');
    const locked = document.getElementById('codexBuildLocked');
    const buildEl = document.getElementById('codexBuild');
    if (!grid) return;

    if (!body || body.owner === null) {
        buildEl.style.display = 'none';
        if (locked) locked.style.display = 'block';
        return;
    }
    buildEl.style.display = 'block';
    if (locked) locked.style.display = 'none';

    // Ne reconstruire que si le buildMode a changé
    if (grid._lastBody === body && grid._lastMode === body.buildMode && grid.children.length > 0) {
        grid.querySelectorAll('.bld-card').forEach(card => {
            const mode = card.dataset.mode;
            const countEl = card.querySelector('.bld-count');
            const barEl = card.querySelector('.bld-progress');
            if (mode === 'nid' && countEl) countEl.textContent = (body.nids||0) + ' construits';
            if (mode === 'biome' && countEl) countEl.textContent = (body.biomes||0) + ' construits';
            if (mode === 'parasite' && countEl) countEl.textContent = (body.parasiteSpore||0)+' prête';
            if (barEl) {
                if (mode==='parasite') barEl.style.width = (body.parasiteSpore||0)>=1 ? '100%' : '0%';
            }
            // Info active sous la carte
            let infoEl = card.querySelector('.bld-active-info');
            const isActive = body.buildMode === mode && mode !== 'off';
            if (isActive) {
                const txt = _bldInfoText(body, mode);
                if (!infoEl) {
                    infoEl = document.createElement('div');
                    infoEl.className = 'bld-active-info';
                    infoEl.style.cssText = 'font-size:8px;color:rgba(200,160,255,0.7);margin-top:2px;';
                    card.querySelector('.bld-main')?.appendChild(infoEl);
                }
                infoEl.textContent = txt;
            } else if (infoEl) {
                infoEl.remove();
            }
        });
        return;
    }
    grid._lastBody = body;
    grid._lastMode = body.buildMode;

    const _base = body.baseMaxSpores || body.maxSpores || 0;
    const BLD = [
        { mode:'off',     icon:'⬛', name:'OFF',      desc:'Production normale', color:'rgba(100,70,180,0.3)' },
        { mode:'alveole', icon:iconeBat('alveole', 22), name:'ALVÉOLE',  desc:`+${pct(bonusProchain(body.alveoles, 'alveole'))}% stock max · Coût: ${coutBatiment(body,'alveole')} sp`, color:'rgba(234,179,8,0.3)',   tip:'Agrandit la capacité de stockage. Les gains diminuent : +20 %, +15 %, +10 %, puis +5 % par alvéole. Au-delà de trois, le coût monte de 10 % à chaque fois. Total actuel : +'+pct(bonusBatiment(body.alveoles||0, 'alveole'))+' %.' },
        { mode:'nid',     icon:iconeBat('nid', 22), name:'NID',      desc:`+${pct(bonusProchain(body.nids, 'nid'))}% prod · Coût: ${coutBatiment(body,'nid')} sp`,    color:'rgba(34,197,94,0.3)',   tip:'Accélère la production locale. Les gains diminuent : +30 %, +22,5 %, +15 %, puis +7,5 % par nid - il est une fois et demie plus fort que les autres, a cout egal. Au-delà de trois, le coût monte de 10 % à chaque fois. Total actuel : +'+pct(bonusBatiment(body.nids||0, 'nid'))+' %.' },
        { mode:'biome',   icon:iconeBat('biome', 22), name:'BIOME',    desc:`+${pct(bonusProchain(body.biomes, 'biome'))}% défense · Coût: ${coutBatiment(body,'biome')} sp`,   color:'rgba(59,130,246,0.3)',  tip:'Renforce la défense à l\'impact. Les gains diminuent : +20 %, +15 %, +10 %, puis +5 % par biome. Au-delà de trois, le coût monte de 10 % à chaque fois. Total actuel : +'+pct(bonusBatiment(body.biomes||0, 'biome'))+' %.' },
        { mode:'parasite',  icon:iconeBat('parasite', 22), name:'FOYER PUTRIDE',    desc:'2min → 1 spore parasitaire', color:'rgba(10,80,30,0.3)' },

    ];

    grid.innerHTML = '';
    for (const b of BLD) {
        const card = document.createElement('div');
        card.className = 'bld-card' + (body.buildMode === b.mode ? ' active' : '');
        card.style.borderColor = body.buildMode === b.mode ? b.color.replace('0.3','0.8') : '';
const _bldCost = b.mode==='alveole' ? Math.floor(_base*0.10) : b.mode==='nid' ? Math.floor(_base*0.15) : b.mode==='biome' ? Math.floor(_base*0.20) : 0;
        const countTxt = b.mode==='alveole' ? (body.alveoles||0)+' construites'
            : b.mode==='nid' ? (body.nids||0)+' construits'
            : b.mode==='biome' ? (body.biomes||0)+' construits'
            : b.mode==='parasite' ? (body.parasiteSpore||0)+' prête' : '';
        const isActive = body.buildMode === b.mode && b.mode !== 'off';
        const infoTxt = isActive ? _bldInfoText(body, b.mode) : '';
        const notEnough = _bldCost > 0 && body.spores < _bldCost && !isActive;
        card.innerHTML = `
            <div class="bld-icon">${b.icon}</div>
            <div class="bld-main">
                <div class="bld-name">${b.name}</div>
                <div class="bld-desc">${b.desc}</div>
                ${notEnough ? `<div style="font-size:11px;color:#F87171;margin-top:2px;">⚠ Stock insuffisant</div>` : ''}
                ${infoTxt ? `<div class="bld-active-info" style="font-size:11px;color:rgba(200,160,255,0.7);margin-top:2px;">${infoTxt}</div>` : ''}
            </div>
            <div class="bld-count" data-bldcount="${b.mode}">${countTxt}</div>
        `;
        card.dataset.mode = b.mode;
        if (b.mode !== 'off') {
            const prog = document.createElement('div');
            prog.className = 'bld-progress-bg';
            const bar = document.createElement('div');
            bar.className = 'bld-progress';
            /* La barre ne sert plus a suivre un chantier - il n'y en a plus -
               mais a montrer ou en est l'astre par rapport au cout du
               prochain batiment de ce genre. */
            if (b.mode === 'alveole' || b.mode === 'nid' || b.mode === 'biome') {
                const _c = coutBatiment(body, b.mode);
                bar.style.width = (_c > 0 ? Math.min(100, (body.spores / _c) * 100) : 0) + '%';
            } else if (b.mode === 'parasite') {
                bar.style.background = 'linear-gradient(90deg,#22C55E,#86EFAC)';
                bar.style.width = (body.parasiteSpore||0) >= 1 ? '100%' : Math.min(100, ((body.parasiteProgress||0) / 120) * 100) + '%';
            } else { bar.style.width = '0%'; }
            prog.appendChild(bar);
            card.appendChild(prog);
        }
        card.addEventListener('click', () => {
            if (!demanderConstruction(body, b.mode)) return;
            grid._lastMode = null;
            updateCodexBuild(body);
        });
        if (b.tip) infobulle(card, b.tip);
        grid.appendChild(card);
    }
    }

function _clampCodex() {
    const codexEl = document.getElementById('codex');
    if (!codexEl || !gameState.codexOpen || !gameState.selectedBody) return;
    const W = window.innerWidth, H = window.innerHeight;
    const cw = codexEl.offsetWidth || 250;
    const ch = codexEl.offsetHeight || 400;
    // Convertir position monde → écran
    const cam = gameState.camera;
    const scale = Math.min(W, H) / (2 / cam.zoom);
    const sx = W/2 + (gameState.selectedBody.x - cam.x) * cam.zoom * (W / (2 / cam.zoom));
    const sy = H/2 + (gameState.selectedBody.y - cam.y) * cam.zoom * (H / (2 / cam.zoom));
    let x = sx + 20;
    let y = sy - ch / 2;
    if (x + cw > W - 8) x = sx - cw - 20;
    if (x < 8) x = 8;
    if (y + ch > H - 8) y = H - ch - 8;
    if (y < 8) y = 8;
    codexEl.style.left = x + 'px';
    codexEl.style.top = y + 'px';
}

function closeCodex() {
    gameState.codexOpen = false;
    gameState.selectedBody = null;
    document.getElementById('codex').classList.remove('open');
    // Réactiver les radios
    document.querySelectorAll('input[name="buildMode"]').forEach(r => r.disabled = false);
}

// Listener changement mode nid/biome
document.querySelectorAll('input[name="buildMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const body = gameState.selectedBody;
        if (!body || body.owner !== localSlot()) return;
        if (!demanderConstruction(body, e.target.value)) return;
        updateCodexBuild(body);
    });
});


