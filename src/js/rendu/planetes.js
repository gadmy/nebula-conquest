// ─────────────────────────────────────────────
// DESSIN — Planètes & Lunes
// ─────────────────────────────────────────────
function drawPlanets(ctx) {
    const cam = gameState.camera;
    const pxParUnite = cam.zoom * echelleRendu();   // pixels reels du canevas
    const halfW = gameState.width / 2 / cam.zoom;
    const halfH = gameState.height / 2 / cam.zoom;

    for (let i = 0; i < gameState.planets.length; i++) {
        const p = gameState.planets[i];

        // Culling planète + orbite
        const margin = p.orbitRadius + p.radius + 50;
        if (p.parent.x + margin < cam.x - halfW || p.parent.x - margin > cam.x + halfW ||
            p.parent.y + margin < cam.y - halfH || p.parent.y - margin > cam.y + halfH) continue;

        // Orbite (trait fin) — LOD mid+
        if (gameState.lod >= 1) {
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(p.parent.x, p.parent.y, p.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Planète (texture cachée)
        if (p._texture) poserTexture(ctx, p, pxParUnite);
        // Anneau de sélection
        if (gameState.selectedBody === p) {
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + 5, 0, Math.PI*2);
            ctx.stroke();
        }

        // Anneaux (gazeuses) — LOD mid+
        if (p._hasRings && gameState.lod >= 1) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(1, p._ringTilt);
            ctx.strokeStyle = p._ringColor1;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = p._ringColor2;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = p._ringColor1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 2.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Atmosphère (LOD high uniquement) — gradient en cache offscreen
        if (p._hasAtmosphere && gameState.lod >= 2) {
            if (!p._atmoCache) {
                const _ac = document.createElement('canvas');
                const _ar = Math.ceil(p.radius * 1.3);
                _ac.width = _ac.height = _ar * 2;
                const _ax = _ac.getContext('2d');
                const _ag = _ax.createRadialGradient(_ar, _ar, p.radius * 0.85, _ar, _ar, _ar);
                _ag.addColorStop(0, 'rgba(0,0,0,0)');
                _ag.addColorStop(0.5, p._atmoColor);
                _ag.addColorStop(1, 'rgba(0,0,0,0)');
                _ax.fillStyle = _ag;
                _ax.beginPath();
                _ax.arc(_ar, _ar, _ar, 0, Math.PI * 2);
                _ax.fill();
                p._atmoCache = _ac;
                p._atmoCacheR = _ar;
            }
            ctx.drawImage(p._atmoCache, p.x - p._atmoCacheR, p.y - p._atmoCacheR, p._atmoCacheR * 2, p._atmoCacheR * 2);
        }

        // Éclairage directionnel (LOD high uniquement)
        if (p.parent && gameState.lod >= 2) {
            const ldx = p.parent.x - p.x;
            const ldy = p.parent.y - p.y;
            const ldist = Math.sqrt(ldx*ldx + ldy*ldy);
            if (ldist > 0) {
                const lnx = ldx / ldist;
                const lny = ldy / ldist;
                // Le sprite est peint une fois avec la lumiere venant de la
                // gauche ; on le fait simplement tourner vers l'etoile.
                const sp = lumiereSprite();
                const ang = Math.atan2(lny, lnx);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(ang + Math.PI);
                ctx.drawImage(sp, -p.radius, -p.radius, p.radius * 2, p.radius * 2);
                ctx.restore();
            }
        }

        // Halo de propriétaire
        if (p.owner !== null && p.owner !== undefined && p.owner >= 0) {
            const ownerColor = gameState.players[p.owner]?.color || '#FFF';
            const isAlliedPlanet = p.owner !== localSlot() && _isAllied(localSlot(), p.owner);
            ctx.strokeStyle = isAlliedPlanet ? '#4ADE80' : ownerColor;
            ctx.lineWidth = isAlliedPlanet ? 2.5 : 1.5;
            ctx.globalAlpha = 0.5 + Math.sin(gameState.time * 2) * 0.15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            // Symbole alliance 🤝
            if (isAlliedPlanet) {
                ctx.save();
                ctx.font = Math.max(10, p.radius * 0.5) + 'px sans-serif';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('🤝', p.x + p.radius * 0.7, p.y - p.radius * 0.7);
                ctx.restore();
            }

            // Flèches parasite permanentes
            if (p.parasite) {
                // Flèche rouge → direction de la planète source (parasiteur)
                const _psrc = gameState.planets.find(b => b.name === p.parasite.sourceName)
                           || gameState.moons.find(b => b.name === p.parasite.sourceName);
                if (_psrc) {
                    const _dx = _psrc.x - p.x, _dy = _psrc.y - p.y;
                    const _dist = Math.sqrt(_dx*_dx + _dy*_dy);
                    if (_dist > 1) {
                        const _ar = p.radius + 16;
                        ctx.save();
                        ctx.translate(p.x + (_dx/_dist)*_ar, p.y + (_dy/_dist)*_ar);
                        ctx.rotate(Math.atan2(_dy, _dx));
                        ctx.beginPath(); ctx.moveTo(7,0); ctx.lineTo(-4,4); ctx.lineTo(-4,-4); ctx.closePath();
                        ctx.fillStyle = '#F87171'; ctx.globalAlpha = 0.9; ctx.fill();
                        ctx.restore();
                    }
                }
            }
            // Flèches vertes → planètes que cette planète parasite
            const _myParasited = [...gameState.planets, ...gameState.moons]
                .filter(b => b.parasite && b.parasite.sourceName === p.name && b.parasite.ownerSlot === localSlot());
            for (const _pb of _myParasited) {
                const _dx = _pb.x - p.x, _dy = _pb.y - p.y;
                const _dist = Math.sqrt(_dx*_dx + _dy*_dy);
                if (_dist > 1) {
                    const _ar = p.radius + 16;
                    ctx.save();
                    ctx.translate(p.x + (_dx/_dist)*_ar, p.y + (_dy/_dist)*_ar);
                    ctx.rotate(Math.atan2(_dy, _dx));
                    ctx.beginPath(); ctx.moveTo(7,0); ctx.lineTo(-4,4); ctx.lineTo(-4,-4); ctx.closePath();
                    ctx.fillStyle = '#4ADE80'; ctx.globalAlpha = 0.9; ctx.fill();
                    ctx.restore();
                }
            }

            // Flèches parasite permanentes
            {
                const _drawArrow = (tx, ty, fromX, fromY, color, offset) => {
                    const _dx = tx - fromX, _dy = ty - fromY;
                    const _dist = Math.sqrt(_dx*_dx + _dy*_dy);
                    if (_dist < 1) return;
                    const _ang = Math.atan2(_dy, _dx);
                    const _ar = fromX === p.x ? p.radius + 16 : p.radius + 16;
                    const _ax = fromX + Math.cos(_ang + offset) * (_ar);
                    const _ay = fromY + Math.sin(_ang + offset) * (_ar);
                    ctx.save();
                    ctx.translate(_ax, _ay);
                    ctx.rotate(_ang + offset);
                    ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-5,4); ctx.lineTo(-5,-4); ctx.closePath();
                    ctx.fillStyle = color; ctx.globalAlpha = 0.9; ctx.fill();
                    ctx.restore();
                };
                // Flèche rouge : cette planète est parasitée → indique la source
                if (p.parasite) {
                    const _psrc = gameState.planets.find(b => b.name === p.parasite.sourceName)
                               || gameState.moons.find(b => b.name === p.parasite.sourceName);
                    if (_psrc) _drawArrow(_psrc.x, _psrc.y, p.x, p.y, '#F87171', 0);
                }
                // Flèches vertes : cette planète parasite d'autres → une flèche par cible, décalées
                const _targets = [...gameState.planets, ...gameState.moons]
                    .filter(b => b.parasite && b.parasite.sourceName === p.name && b.parasite.ownerSlot === localSlot());
                _targets.forEach((tb, idx) => {
                    const offset = (_targets.length > 1) ? (idx - (_targets.length-1)/2) * 0.25 : 0;
                    _drawArrow(tb.x, tb.y, p.x, p.y, '#4ADE80', offset);
                });
                // Si cette planète est à la fois parasitée ET parasite, décaler la flèche rouge
                if (p.parasite && _targets.length > 0) {
                    const _psrc = gameState.planets.find(b => b.name === p.parasite.sourceName)
                               || gameState.moons.find(b => b.name === p.parasite.sourceName);
                    if (_psrc) _drawArrow(_psrc.x, _psrc.y, p.x, p.y, '#F87171', -0.25);
                }
            }

            // Halo parasite
            if (p.parasite) {
                const _t = gameState.time || 0;
                const _osc = 0.4 + 0.3 * Math.sin(_t * 3.5);
                const _r = p.radius * (1.3 + 0.15 * Math.sin(_t * 2.1));
                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, _r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(34,197,94,${_osc})`;
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(p.x, p.y, _r * 1.2, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(34,197,94,${_osc * 0.4})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                dessinerIconeBat(ctx, 'parasite', p.x, p.y - p.radius - p.radius * 0.35, p.radius * 0.7);
                ctx.restore();
            }


            // Icônes bâtiments sous la planète (si possédée par le joueur local)
            if (p.owner === localSlot() && gameState.lod >= 1) {
                /* L'icone ADN marquait un chantier en attente de spores.
                   Une demande de construction est desormais acceptee ou
                   refusee sur-le-champ, il n'y a plus d'attente a signaler.
                   Seule la spore parasitaire, qui met deux minutes a murir,
                   garde un signe. */
                const _t = gameState.time || 0;
                if (p.buildMode === 'parasite') {
                    ctx.save();
                    ctx.textAlign = 'center';
                    const _pulse = 1 + 0.18 * Math.sin(_t * 3.5);
                    const _alpha = 0.6 + 0.4 * Math.abs(Math.sin(_t * 2.2));
                    const _fs = Math.max(10, p.radius * 0.6);
                    ctx.globalAlpha = _alpha;
                    dessinerIconeBat(ctx, 'parasite', p.x, p.y + p.radius + 14, _fs * 1.2 * _pulse);
                    ctx.globalAlpha = 1;
                    ctx.restore();
                }
            }
        }

        // Lunes
        for (let j = 0; j < p.moons.length; j++) {
            const m = p.moons[j];

            // Culling lune
            if (m.x < cam.x - halfW - 20 || m.x > cam.x + halfW + 20 ||
                m.y < cam.y - halfH - 20 || m.y > cam.y + halfH + 20) continue;

            // Orbite de lune — LOD high
            if (gameState.lod >= 2) {
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, m.orbitRadius, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Lune (texture cachée)
            if (m._texture) {
                poserTexture(ctx, m, pxParUnite);
                /* Jour et nuit, tournes vers le soleil (comme les planetes). */
                if (gameState.lod >= 2 && p.parent && m.radius * cam.zoom > 10) {
                    ctx.save();
                    ctx.translate(m.x, m.y);
                    ctx.rotate(Math.atan2(p.parent.y - m.y, p.parent.x - m.x) + Math.PI);
                    ctx.drawImage(lumiereSprite(), -m.radius, -m.radius, m.radius * 2, m.radius * 2);
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = 'rgba(180, 180, 200, 0.7)';
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Halo propriétaire lune
            if (m.owner !== null && m.owner !== undefined && m.owner >= 0) {
                const ownerColor = gameState.players[m.owner]?.color || '#FFF';
                ctx.strokeStyle = ownerColor;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5 + Math.sin(gameState.time * 2) * 0.15;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius + 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Icônes bâtiments sur lune (joueur local, LOD >= 1)
            if (m.owner === localSlot() && gameState.lod >= 1 && m.buildMode && m.buildMode !== 'off') {
                const _t = gameState.time || 0;
                if (m.buildMode === 'parasite') {
                    ctx.save();
                    ctx.textAlign = 'center';
                    const _pulse = 1 + 0.15 * Math.sin(_t * 3.5);
                    const _alpha = 0.6 + 0.4 * Math.abs(Math.sin(_t * 2.2));
                    const _fs = Math.max(8, m.radius * 0.8);
                    ctx.globalAlpha = _alpha;
                    dessinerIconeBat(ctx, 'parasite', m.x, m.y + m.radius + 9, _fs * 1.2 * _pulse);
                    ctx.globalAlpha = 1;
                    ctx.restore();
                }
            }
        }
    }
}


