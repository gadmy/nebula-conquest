/* ─────────────────────────────────────────────
   DIAGNOSTIC DE PERFORMANCE (touche F3)
   Un ralentissement peut venir du jeu, mais aussi de la fenetre (une page
   deux fois plus large a quatre fois plus de pixels a peindre), de l'ecran
   (devicePixelRatio), ou du navigateur qui a perdu l'acceleration du canvas.
   Ce panneau montre les trois d'un coup, au moment ou ca rame.
   ───────────────────────────────────────────── */
let _diagOuvert = false;
let _diagDernier = 0;
let _diagCumul = { update: 0, render: 0, images: 0 };
let _diagEl = null;
let _diagDetail = null;

function basculerDiagnostic() {
    _diagOuvert = !_diagOuvert;
    if (!_diagEl) {
        _diagEl = document.createElement('div');
        _diagEl.id = 'diagPerf';
        _diagEl.style.cssText = 'position:fixed;top:8px;left:8px;z-index:4000;' +
            'background:rgba(6,8,22,0.92);border:1px solid rgba(139,92,246,0.45);' +
            'border-radius:6px;padding:8px 12px;font-family:monospace;font-size:11px;' +
            'line-height:1.55;color:#D8CFF5;pointer-events:none;white-space:pre;';
        document.body.appendChild(_diagEl);
    }
    _diagEl.style.display = _diagOuvert ? 'block' : 'none';
    _diagCumul = { update: 0, render: 0, images: 0 };
    _diagDetail = null;
}

function majDiagnostic(timestamp) {
    _diagDernier = timestamp;
    const n = Math.max(1, _diagCumul.images);
    const up = _diagCumul.update / n;
    const re = _diagCumul.render / n;
    _diagCumul = { update: 0, render: 0, images: 0 };

    const cv = gameState.canvas;
    const dpr = window.devicePixelRatio || 1;
    const px = (cv.width * cv.height / 1e6).toFixed(2);
    const possedes = (gameState.allBodies || []).filter(function (b) {
        return b.owner !== null && b.owner !== undefined;
    }).length;

    let txt =
        'F3 — DIAGNOSTIC\n' +
        'FPS        ' + gameState.fps + '   (' + (up + re).toFixed(2) + ' ms / image)\n' +
        'simulation ' + up.toFixed(2) + ' ms\n' +
        'rendu      ' + re.toFixed(2) + ' ms\n' +
        '\n' +
        'fenetre    ' + cv.width + ' x ' + cv.height + ' px  (' + px + ' Mpx)\n' +
        'dpr        ' + dpr + '   resolution ' + Math.round((gameState.reso || 1) * 100) + '%' +
        '  (' + (gameState.qualite || 'haute') + ')\n' +
        'zoom       ' + gameState.camera.zoom.toFixed(2) + '   LOD ' + gameState.lod + '\n' +
        '\n' +
        'astres     ' + (gameState.allBodies || []).length + '  dont ' + possedes + ' possedes\n' +
        'joueurs    ' + (gameState.players || []).length +
        '   jets ' + (gameState.jets || []).length +
        '   nettoyeurs ' + (gameState.cleaners || []).length + '\n';

    if (_diagDetail) {
        txt += '\ndetail du rendu (D)\n';
        for (let i = 0; i < _diagDetail.length; i++) {
            const e = _diagDetail[i];
            txt += '  ' + (e[0] + '                    ').slice(0, 22) + e[1].toFixed(2) + ' ms\n';
        }
    } else {
        txt += '\nD : detailler le rendu\n';
    }
    _diagEl.textContent = txt;
}

/* Mesure chaque fonction de dessin separement. C'est lourd (on redessine la
   scene une trentaine de fois par fonction), donc a la demande seulement. */
function detaillerRendu() {
    if (!_diagOuvert || !gameState.ctx) return;
    const ctx = gameState.ctx, cam = gameState.camera;
    const W = gameState.width, H = gameState.height;
    const noms = ['drawBackground', 'drawSuns', 'drawPlanets', 'drawJets', 'drawCleaners',
                  'drawBlackHole', 'drawAsteroidBelts', 'drawCosmicEffects', 'drawComets',
                  'drawImpacts', 'drawConquestEffects', 'drawSporeCountOnBodies',
                  'drawOffscreenIndicators', 'drawMinimap'];
    const res = [];
    _enMesureRendu = true;
    for (let i = 0; i < noms.length; i++) {
        const f = window[noms[i]];
        if (typeof f !== 'function') continue;
        const N = 20;
        for (let k = 0; k < 3; k++) {
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom);
            ctx.translate(-cam.x, -cam.y);
            try { f(ctx); } catch (e) {}
            ctx.restore();
        }
        const t0 = performance.now();
        for (let k = 0; k < N; k++) {
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom);
            ctx.translate(-cam.x, -cam.y);
            try { f(ctx); } catch (e) {}
            ctx.restore();
        }
        ctx.getImageData(0, 0, 1, 1);   /* vider la file du GPU avant de lire l'horloge */
        res.push([noms[i].replace('draw', ''), (performance.now() - t0) / N]);
    }
    _enMesureRendu = false;
    res.sort(function (a, b) { return b[1] - a[1]; });
    _diagDetail = res.slice(0, 8);
}


