// ─────────────────────────────────────────────
// EFFETS VISUELS — Impacts
// ─────────────────────────────────────────────
function spawnImpact(x, y, color) {
    const particles = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 30 + Math.random() * 50;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.5,
            age: 0,
            size: 1 + Math.random() * 2
        });
    }
    gameState.impactEffects.push({
        x: x, y: y, color: couleurHex(color),
        shockwave: 0,
        particles: particles,
        age: 0, maxAge: 1.2
    });
}

function updateImpacts(dt) {
    for (let i = gameState.impactEffects.length - 1; i >= 0; i--) {
        const imp = gameState.impactEffects[i];
        imp.age += dt;
        imp.shockwave += dt * 80;

        for (const p of imp.particles) {
            p.age += dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.95;
            p.vy *= 0.95;
        }

        if (imp.age >= imp.maxAge) gameState.impactEffects.splice(i, 1);
    }
}

function drawImpacts(ctx) {
    const z = gameState.camera.zoom;
    const scale = Math.max(1, 1 / z);

    for (const imp of gameState.impactEffects) {
        const progress = imp.age / imp.maxAge;
        const alpha = 1 - progress;

        // Onde de choc
        ctx.strokeStyle = imp.color + hexAlpha(alpha * 0.5);
        ctx.lineWidth = 2 * scale * (1 - progress);
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, imp.shockwave, 0, Math.PI * 2);
        ctx.stroke();

        // Flash central
        if (progress < 0.2) {
            const flashA = (1 - progress / 0.2) * 0.5;
            const gFlash = ctx.createRadialGradient(imp.x, imp.y, 0, imp.x, imp.y, 15 * scale);
            gFlash.addColorStop(0, '#FFFFFF' + hexAlpha(flashA));
            gFlash.addColorStop(0.5, imp.color + hexAlpha(flashA * 0.5));
            gFlash.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gFlash;
            ctx.beginPath();
            ctx.arc(imp.x, imp.y, 15 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Particules éclats
        for (const p of imp.particles) {
            if (p.age >= p.life) continue;
            const pAlpha = (1 - p.age / p.life) * 0.8;
            const pSize = p.size * scale * (1 - p.age / p.life);

            ctx.fillStyle = '#FFFFFF' + hexAlpha(pAlpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = imp.color + hexAlpha(pAlpha * 0.5);
            ctx.beginPath();
            ctx.arc(p.x, p.y, pSize + 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}


// ─────────────────────────────────────────────
// EFFETS VISUELS — Conquête & Éclosion
// ─────────────────────────────────────────────
/* Toutes les cinq secondes, ce que l'astre SELECTIONNE a produit sur la
   periode monte au-dessus de sa tete. Un seul astre a la fois : afficher cela
   partout noierait l'ecran. Le cumul repart a chaque changement de selection,
   pour que le premier chiffre corresponde bien a cinq secondes de production
   et pas a un reliquat accumule avant le clic. */
