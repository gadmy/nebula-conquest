// ─────────────────────────────────────────────
// MINIMAP
// ─────────────────────────────────────────────
function drawMinimap() {
    if (gameState.phase !== 'game' && gameState.phase !== 'paused') return;
    const mc = document.getElementById('minimapCanvas');
    const mctx = mc.getContext('2d');
    const size = 160;

    mctx.fillStyle = 'rgba(6, 8, 26, 0.9)';
    mctx.fillRect(0, 0, size, size);

    // Calcul de l'échelle : trouver l'étendue max
    let maxDist = 500;
    for (const s of gameState.suns) {
        const d = Math.sqrt(s.x * s.x + s.y * s.y) + s.orbitRadius + 500;
        if (d > maxDist) maxDist = d;
    }
    const scale = (size / 2 - 8) / maxDist;
    const cx = size / 2;
    const cy = size / 2;

    // Trou noir
    mctx.fillStyle = '#000';
    mctx.beginPath();
    mctx.arc(cx, cy, 3, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = 'rgba(100,40,180,0.3)';
    mctx.lineWidth = 0.5;
    mctx.stroke();

    // Soleils
    for (const s of gameState.suns) {
        mctx.fillStyle = s.color + '80';
        mctx.beginPath();
        mctx.arc(cx + s.x * scale, cy + s.y * scale, 2, 0, Math.PI * 2);
        mctx.fill();
    }

    // Planètes et lunes
    const bodies = gameState.allBodies;
    for (const b of bodies) {
        if (b.owner !== null && b.owner !== undefined) {
            mctx.fillStyle = gameState.players[b.owner]?.color || '#666';
        } else {
            mctx.fillStyle = 'rgba(150,150,170,0.4)';
        }
        const r = b.type === 'planet' ? 1.5 : 0.8;
        mctx.beginPath();
        mctx.arc(cx + b.x * scale, cy + b.y * scale, r, 0, Math.PI * 2);
        mctx.fill();
    }

    // Jets
    for (const j of gameState.jets) {
        if (!j.alive) continue;
        mctx.fillStyle = j.color;
        mctx.beginPath();
        mctx.arc(cx + j.x * scale, cy + j.y * scale, 1, 0, Math.PI * 2);
        mctx.fill();
    }

    // Nettoyeurs
    for (const cl of gameState.cleaners) {
        mctx.fillStyle = 'rgba(255, 60, 60, 0.6)';
        mctx.fillRect(cx + cl.x * scale - 1, cy + cl.y * scale - 1, 2, 2);
    }

    // Rectangle de vue
    const cam = gameState.camera;
    const vw = gameState.width / cam.zoom * scale;
    const vh = gameState.height / cam.zoom * scale;
    const vx = cx + cam.x * scale - vw / 2;
    const vy = cy + cam.y * scale - vh / 2;
    mctx.strokeStyle = 'rgba(200, 160, 255, 0.5)';
    mctx.lineWidth = 1;
    mctx.strokeRect(vx, vy, vw, vh);
}

function setupMinimap() {
    const mc = document.getElementById('minimapCanvas');
    mc.addEventListener('click', (e) => {
        const rect = mc.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let maxDist = 500;
        for (const s of gameState.suns) {
            const d = Math.sqrt(s.x * s.x + s.y * s.y) + s.orbitRadius + 500;
            if (d > maxDist) maxDist = d;
        }
        const scale = (80 - 8) / maxDist;
        const worldX = (mx - 80) / scale;
        const worldY = (my - 80) / scale;
        gameState.camera.x = worldX;
        gameState.camera.y = worldY;
        if (typeof followingBody !== 'undefined') followingBody = null;
    });
}


// ─────────────────────────────────────────────
// INDICATEURS HORS-ÉCRAN
// ─────────────────────────────────────────────
function drawOffscreenIndicators() {
    if (gameState.phase !== 'game' && gameState.phase !== 'spawn') return;
    const cam = gameState.camera;
    const w = gameState.width;
    const h = gameState.height;
    const ctx = gameState.ctx;
    const margin = 20;

    for (const jet of gameState.jets) {
        if (!jet.alive) continue;
        if (jet.owner === 0) continue; // pas nos propres jets

        // Convertir en coordonnées écran
        const sx = (jet.x - cam.x) * cam.zoom + w / 2;
        const sy = (jet.y - cam.y) * cam.zoom + h / 2;

        // Si visible, pas besoin d'indicateur
        if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) continue;

        // Calculer le point sur le bord de l'écran
        const dx = sx - w / 2;
        const dy = sy - h / 2;
        const angle = Math.atan2(dy, dx);

        // Clamp sur le bord
        let ix = w / 2 + Math.cos(angle) * (w / 2 - margin);
        let iy = h / 2 + Math.sin(angle) * (h / 2 - margin);
        ix = Math.max(margin, Math.min(w - margin, ix));
        iy = Math.max(margin, Math.min(h - margin, iy));

        // Dessiner la flèche (hors transformation caméra)
        ctx.save();
        ctx.translate(ix, iy);
        ctx.rotate(angle);

        ctx.fillStyle = jet.color + '90';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();

        // Lueur
        ctx.fillStyle = jet.color + '20';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ── Flèches hors-écran colonisation (phase spawn) ──
    if (gameState._spawnArrows) {
        const dt = gameState.dt || 0.016;
        for (let i = gameState._spawnArrows.length - 1; i >= 0; i--) {
            const arr = gameState._spawnArrows[i];
            arr.age += dt;
            if (arr.age >= arr.maxAge) { gameState._spawnArrows.splice(i, 1); continue; }
            const b = arr.body;
            const sx = (b.x - cam.x) * cam.zoom + w / 2;
            const sy = (b.y - cam.y) * cam.zoom + h / 2;
            if (sx >= margin && sx <= w - margin && sy >= margin && sy <= h - margin) continue; // visible
            const dx = sx - w / 2, dy = sy - h / 2;
            const angle = Math.atan2(dy, dx);
            let ix = w / 2 + Math.cos(angle) * (w / 2 - margin);
            let iy = h / 2 + Math.sin(angle) * (h / 2 - margin);
            ix = Math.max(margin, Math.min(w - margin, ix));
            iy = Math.max(margin, Math.min(h - margin, iy));
            const alpha = Math.max(0, 1 - arr.age / arr.maxAge);
            const pulse = 0.7 + 0.3 * Math.sin(arr.age * 8);
            ctx.save();
            ctx.translate(ix, iy);
            ctx.rotate(angle);
            ctx.globalAlpha = alpha * pulse;
            ctx.fillStyle = arr.color;
            ctx.beginPath();
            ctx.moveTo(12, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7);
            ctx.closePath(); ctx.fill();
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌍', -14, 0);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }

    // ── Flashs visuels colonisation sur planète (phase spawn) ──
    if (gameState._spawnFlashes) {
        const dt = gameState.dt || 0.016;
        for (let i = gameState._spawnFlashes.length - 1; i >= 0; i--) {
            const fl = gameState._spawnFlashes[i];
            fl.age += dt;
            if (fl.age >= fl.maxAge) { gameState._spawnFlashes.splice(i, 1); continue; }
            const b = fl.body;
            const sx = (b.x - cam.x) * cam.zoom + w / 2;
            const sy = (b.y - cam.y) * cam.zoom + h / 2;
            const alpha = Math.max(0, 1 - fl.age / fl.maxAge) * 0.7;
            const r = (b.radius + 20 + fl.age * 30) * cam.zoom;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = fl.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }
    }
}


