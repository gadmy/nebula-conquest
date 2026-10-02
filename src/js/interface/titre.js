// ─────────────────────────────────────────────
// ÉCRAN TITRE — Animation
// ─────────────────────────────────────────────
let _titleAnimPlayed = false;
function animateTitleScreen() {
    const title = document.getElementById('titleText');
    if (!_titleAnimPlayed) {
    const text = 'NEBULA CONQUEST';
    title.innerHTML = '';

    // Lettres animées une par une
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.className = 'title-letter';
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        span.style.animationDelay = (i * 0.08) + 's';
        title.appendChild(span);
    }
    _titleAnimPlayed = true;
    }

    // Canvas étoiles filantes en fond
    const canvas = document.getElementById('titleBgCanvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.3,
            alpha: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.3 + 0.05
        });
    }

    const shooters = [];
    let lastShooter = 0;

    function titleLoop(t) {
        if (gameState.phase !== 'title') return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Étoiles scintillantes
        for (const s of stars) {
            const flicker = s.alpha * (0.6 + Math.sin(t * 0.002 * s.speed + s.x) * 0.4);
            ctx.fillStyle = `rgba(200, 215, 255, ${flicker})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Étoiles filantes
        if (t - lastShooter > 2000 + Math.random() * 3000) {
            lastShooter = t;
            const angle = -0.3 + Math.random() * 0.2;
            shooters.push({
                x: Math.random() * canvas.width,
                y: -20,
                vx: Math.cos(angle) * (200 + Math.random() * 300),
                vy: Math.sin(angle + Math.PI/2) * (200 + Math.random() * 300),
                life: 0.8 + Math.random() * 0.6,
                age: 0,
                length: 40 + Math.random() * 60
            });
        }

        for (let i = shooters.length - 1; i >= 0; i--) {
            const s = shooters[i];
            s.age += 0.016;
            s.x += s.vx * 0.016;
            s.y += s.vy * 0.016;

            const progress = s.age / s.life;
            const alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
            const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
            const dx = s.vx / speed;
            const dy = s.vy / speed;

            const g = ctx.createLinearGradient(
                s.x - dx * s.length, s.y - dy * s.length,
                s.x, s.y
            );
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(1, `rgba(200, 220, 255, ${alpha * 0.6})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(s.x - dx * s.length, s.y - dy * s.length);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();

            if (s.age >= s.life) shooters.splice(i, 1);
        }

        requestAnimationFrame(titleLoop);
    }

    requestAnimationFrame(titleLoop);
}


// ── Panneaux draggables & rétractables ──
let _panelsInitialized = false;

function initSidePanel() {
    if (_panelsInitialized) return;
    _panelsInitialized = true;
    poserInfobullesTech();

    // Toggle global show/hide
    const toggle = document.getElementById('sidePanelToggle');
    const stack = document.getElementById('sidePanelStack');
    let stackVisible = true;
    toggle.addEventListener('click', () => {
        stackVisible = !stackVisible;
        stack.style.display = stackVisible ? 'flex' : 'none';
        toggle.textContent = (stackVisible ? '▲' : '▼') + ' PANNEAUX';
    });

    // Chaque bloc : repliable, jamais retirable.
    ['Scores', 'Map', 'Events'].forEach(name => {
        const block = document.getElementById('sp' + name);
        const colBtn = block.querySelector('.sp-collapse');
        block.classList.add('sp-visible');

        const basculer = (e) => {
            e.stopPropagation();
            block.classList.toggle('sp-collapsed');
            colBtn.textContent = block.classList.contains('sp-collapsed') ? '▶' : '▼';
        };
        colBtn.addEventListener('click', basculer);
        block.querySelector('.sp-block-header').addEventListener('click', basculer);
    });

}

function initTopRight() {
    const slider = document.getElementById('uiZoomSlider');
    const val = document.getElementById('uiZoomVal');
    const reset = document.getElementById('uiResetBtn');

    /* Le reglage de finesse. Il est garde d'une partie a l'autre : une
       machine modeste le reste. */
    const qs = document.getElementById('qualiteSel');
    if (qs && !qs._pret) {
        qs._pret = true;
        let garde = null;
        try { garde = localStorage.getItem('nc_qualite'); } catch (e) {}
        if (garde && QUALITES[garde]) gameState.qualite = garde;
        qs.value = gameState.qualite;
        const montrer = function () {
            const v = document.getElementById('qualiteVal');
            if (v) v.textContent = Math.round((gameState.reso || 1) * 100) + '%';
        };
        qs.addEventListener('change', function () {
            gameState.qualite = QUALITES[qs.value] ? qs.value : 'haute';
            try { localStorage.setItem('nc_qualite', gameState.qualite); } catch (e) {}
            gameState._resoRepos = 99;   /* un choix explicite s'applique net */
            majResolution();
            montrer();
        });
        gameState._montrerReso = montrer;
        majResolution();
        montrer();
    }

    if (!slider) return;
    slider.addEventListener('input', () => {
        const v = parseInt(slider.value);
        val.textContent = v + '%';
        const scale = v !== 100 ? `scale(${v / 100})` : '';
        const mp = document.getElementById('myPlanets');
        const sp = document.getElementById('sidePanel');
        const tr = document.getElementById('topRight');
        mp.style.transformOrigin = 'bottom left';
        sp.style.transformOrigin = 'bottom right';
        tr.style.transformOrigin = 'top right';
        mp.style.transform = scale;
        sp.style.transform = scale;
        tr.style.transform = scale;
    });
    if (reset) reset.addEventListener('click', () => {
        slider.value = 100;
        val.textContent = '100%';
        document.getElementById('myPlanets').style.transform = '';
        document.getElementById('sidePanel').style.transform = '';
        document.getElementById('topRight').style.transform = '';
    });
}

// ── Log d'événements ──
function addEvent(cat, icon, text, body, color) {
    const t = gameState.time;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const time = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    gameState.eventLog.unshift({ cat, icon, text, time, body, color: color || '#AAA' });
    if (gameState.eventLog.length > 100) gameState.eventLog.pop();
    refreshEventLog();
}

function refreshEventLog() {
    const logBody = document.getElementById('eventLogBody');
    if (!logBody) return;
    const activeFilter = document.querySelector('#eventLog .log-filter.active');
    const cat = activeFilter ? activeFilter.dataset.cat : 'all';
    const filtered = cat === 'all' ? gameState.eventLog : gameState.eventLog.filter(e => e.cat === cat);
    logBody.innerHTML = filtered.slice(0, 50).map((e, i) =>
        `<div class="log-entry" data-idx="${i}"><span class="log-time">${e.time}</span><span class="log-icon" style="color:${e.color}">${e.icon}</span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${e.color};margin:0 4px;vertical-align:middle;"></span><span class="log-text">${e.text}</span></div>`
    ).join('');
    logBody.querySelectorAll('.log-entry').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.idx);
            const evt = filtered[idx];
            if (evt && evt.body) {
                gameState.camera.x = evt.body.x;
                gameState.camera.y = evt.body.y;
                gameState.camera.zoom = Math.max(gameState.camera.zoom, 0.8);
                openCodex(evt.body);
            }
        });
    });

}
