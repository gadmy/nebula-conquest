// ─────────────────────────────────────────────
// EFFETS COSMIQUES — Particules & étoiles filantes
// ─────────────────────────────────────────────
function updateCosmicEffects(dt) {
    const t = gameState.time;

    // Particules ambiantes
    for (const p of gameState.cosmicDust) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Légère oscillation
        p.x += Math.sin(t * 0.5 + p.phase) * 0.3 * dt;
        p.y += Math.cos(t * 0.4 + p.phase) * 0.3 * dt;
    }

    // Étoiles filantes
    gameState.shootingStarTimer -= dt;
    if (gameState.shootingStarTimer <= 0) {
        gameState.shootingStarTimer = 0.5 + Math.random() * 1.0;
        // Spawner dans la zone visible élargie
        const cam = gameState.camera;
        const range = 5000 / cam.zoom;
        const angle = -0.8 + Math.random() * 0.4;
        const speed = 800 + Math.random() * 1200;
        gameState.shootingStars.push({
            x: cam.x + (Math.random() - 0.5) * range,
            y: cam.y - range * 0.4 + Math.random() * range * 0.2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.8 + Math.random() * 1.5,
            age: 0,
            length: 60 + Math.random() * 120,
            brightness: 0.5 + Math.random() * 0.5
        });
    }

    for (let i = gameState.shootingStars.length - 1; i >= 0; i--) {
        const s = gameState.shootingStars[i];
        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.age >= s.life) gameState.shootingStars.splice(i, 1);
    }
}

// ─────────────────────────────────────────────
// COMÈTES DESTRUCTRICES
// ─────────────────────────────────────────────
function updateComets(dt) {
    gameState.cometTimer -= dt;
    if (gameState.cometTimer <= 0) {
        gameState.cometTimer = COMET_CFG.freq * (0.7 + gameRandom() * 0.6);
        const cam = gameState.camera;
        const range = (gameState.universeRadius || 6000) * 2;
        const angle = gameRandom() * Math.PI * 2;
        const startDist = range * 0.8;
        const cx = Math.cos(angle) * startDist;
        const cy = Math.sin(angle) * startDist;
        // Viser un point aléatoire dans l'univers
        const targetAngle = angle + Math.PI + (gameRandom() - 0.5) * 1.2;
        const spd = COMET_CFG.speed + gameRandom() * COMET_CFG.speed * 0.5;
        gameState.comets.push({
            x: cx, y: cy,
            vx: Math.cos(targetAngle) * spd,
            vy: Math.sin(targetAngle) * spd,
            size: COMET_CFG.size * (0.6 + gameRandom() * 0.8),
            tail: COMET_CFG.tail * (0.7 + gameRandom() * 0.6),
            life: range * 2 / spd,
            age: 0,
            color: ['#88DDFF','#AAEEFF','#FFCC66','#FF9966'][Math.floor(gameRandom()*4)]
        });
    }

    for (let i = gameState.comets.length - 1; i >= 0; i--) {
        const c = gameState.comets[i];
        c.age += dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        if (c.age >= c.life) { gameState.comets.splice(i, 1); continue; }

        // Collision avec planètes et lunes → détruire les spores
        const bodies = gameState.allBodies;
        for (const body of bodies) {
            const dx = body.x - c.x;
            const dy = body.y - c.y;
            if (Math.sqrt(dx*dx + dy*dy) < body.radius + c.size) {
                viderSpores(body);   /* plus d'astre invincible depuis le retrait de la planete mere */
                spawnImpact(c.x, c.y, c.color);
                gameState.comets.splice(i, 1);
                break;
            }
        }
    }
}

function drawComets(ctx) {
    for (const c of gameState.comets) {
        /* Une comete fabrique un degrade lineaire neuf a chaque image ; hors
           champ c'etait du travail entierement perdu. */
        if (!aLEcran(c.x, c.y, (c.tail || 0) + 40)) continue;
        const spd = Math.sqrt(c.vx*c.vx + c.vy*c.vy);
        const dx = -c.vx / spd;
        const dy = -c.vy / spd;

        // Traîne
        const g = ctx.createLinearGradient(c.x, c.y, c.x + dx * c.tail, c.y + dy * c.tail);
        g.addColorStop(0, c.color);
        g.addColorStop(0.3, c.color + '80');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = c.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + dx * c.tail, c.y + dy * c.tail);
        ctx.stroke();

        // Tête
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = c.size * 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// ─────────────────────────────────────────────
// DÉBRIS PREMIER PLAN
// ─────────────────────────────────────────────
function generateForegroundDebris() {
    gameState.foregroundDebris = [];
    const count = COMET_CFG.fgDebris;
    for (let i = 0; i < count; i++) {
        gameState.foregroundDebris.push({
            offX: (Math.random() - 0.5) * 2,
            offY: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 8,
            speed: 0.3 + Math.random() * 0.7,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 2,
            type: ['rock','dust','ice'][Math.floor(Math.random()*3)],
            alpha: 0.15 + Math.random() * 0.25,
            parallax: 1.5 + Math.random() * 1.5
        });
    }
}

function drawForegroundDebris(ctx) {
    const cam = gameState.camera;
    const t = gameState.time;
    const w = gameState.width;
    const h = gameState.height;

    for (const d of gameState.foregroundDebris) {
        // Position relative à la caméra avec forte parallaxe (premier plan)
        const px = ((d.offX * 5000 - cam.x * d.parallax + t * d.speed * 100) % (w / cam.zoom * 2));
        const py = ((d.offY * 5000 - cam.y * d.parallax + t * d.speed * 50) % (h / cam.zoom * 2));
        // Convertir en screen coords
        const sx = w / 2 + px * cam.zoom;
        const sy = h / 2 + py * cam.zoom;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(t * d.rotSpeed);
        ctx.globalAlpha = d.alpha;

        if (d.type === 'rock') {
            ctx.fillStyle = '#665544';
            ctx.beginPath();
            const s = d.size * cam.zoom * 0.5;
            ctx.moveTo(-s, -s*0.6);
            ctx.lineTo(s*0.8, -s);
            ctx.lineTo(s, s*0.5);
            ctx.lineTo(-s*0.3, s);
            ctx.closePath();
            ctx.fill();
        } else if (d.type === 'dust') {
            ctx.fillStyle = 'rgba(180,160,200,0.5)';
            const s = d.size * cam.zoom * 0.4;
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = 'rgba(200,230,255,0.6)';
            const s = d.size * cam.zoom * 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(s*0.3, -s*0.3, s*0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

function drawCosmicEffects(ctx) {
    const t = gameState.time;
    const z = gameState.camera.zoom;

    // Particules ambiantes
    for (const p of gameState.cosmicDust) {
        const flicker = p.alpha * (0.7 + Math.sin(t * 2 + p.phase) * 0.3);
        ctx.fillStyle = `rgba(180, 200, 240, ${flicker})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Étoiles filantes
    for (const s of gameState.shootingStars) {
        const progress = s.age / s.life;
        const alpha = s.brightness * (progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8);
        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const dirX = s.vx / speed;
        const dirY = s.vy / speed;
        const tailX = s.x - dirX * s.length;
        const tailY = s.y - dirY * s.length;

        // Traîne dégradée
        const g = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.7, `rgba(200, 220, 255, ${alpha * 0.3})`);
        g.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        // Point lumineux en tête
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}


