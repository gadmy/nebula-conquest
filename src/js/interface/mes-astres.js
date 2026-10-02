// ─────────────────────────────────────────────
// MES PLANÈTES — Liste latérale + suivi caméra
// ─────────────────────────────────────────────
let followingBody = null;

/* Recalcule a chaque appel : quelques astres par systeme, c'est negligeable.
   Il y avait un cache (une seule reponse retenue par etoile, effacee a la
   conquete par un tir). Mais une bataille au sol, un vaisseau qui chasse
   un proprietaire ne l'effacaient pas, et l'affichage le remplacait au
   rythme des images en posant la question pour le joueur local : le bonus
   de systeme complet (+3 % de production) tombait un tour plus tot ou plus
   tard selon l'ordinateur - desynchronisation en lockstep. */
function isSystemComplete(sun, ownerID) {
    let result = sun.planets.length > 0;
    for (const planet of sun.planets) {
        if (planet.owner !== ownerID) { result = false; break; }
        for (const moon of planet.moons) {
            if (moon.owner !== ownerID) { result = false; break; }
        }
        if (!result) break;
    }
    return result;
}

function updateMyPlanets() {
    if (gameState.phase !== 'game') return;
    const slot = localSlot();
    const human = gameState.players.find(p => p.id === slot) || gameState.players[slot];
    if (!human) return;

    const container = document.getElementById('myPlanetsList');
    const panel = document.getElementById('myPlanets');
    panel.style.display = 'block';

    const myBodies = gameState.allBodies.filter(b => b.owner === slot);

    const groups = {};
    const groupSuns = {};
    for (const body of myBodies) {
        let sunRef, sunName;
        if (body.type === 'planet') {
            sunRef = body.parent;
            sunName = body.parent.name;
        } else {
            sunRef = body.parent.parent || null;
            sunName = sunRef ? sunRef.name : 'Inconnu';
        }
        if (!groups[sunName]) { groups[sunName] = []; groupSuns[sunName] = sunRef; }
        groups[sunName].push(body);
    }

    function _makeTextureDot(body, size) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        c.className = 'mp-dot';
        c.style.width = size + 'px';
        c.style.height = size + 'px';
        if (body._texture) {
            c.getContext('2d').drawImage(body._texture, 0, 0, size, size);
        } else {
            const ctx = c.getContext('2d');
            ctx.fillStyle = human.color || '#8866cc';
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
            ctx.fill();
        }
        return c;
    }

    if (!container._selectedBodies) container._selectedBodies = new Set();
    const _selectedBodies = container._selectedBodies;

    function _makeBodyRow(body, lunesResumees) {
        const row = document.createElement('div');
        row.className = 'mp-body-row';
        row.dataset.bodyName = body.name;

        const size = body.type === 'planet' ? 18 : 14;
        row.appendChild(_makeTextureDot(body, size));

        const nameEl = document.createElement('span');
        nameEl.className = 'mp-name';
        nameEl.textContent = body.name;
        row.appendChild(nameEl);

        if (body.buildMode && BATI_GENRES.indexOf(body.buildMode) >= 0) {
            const bi = document.createElement('span');
            bi.className = 'mp-build-icon';
            bi.innerHTML = iconeBat(body.buildMode, 12);
            row.appendChild(bi);
        }
        if ((body.parasiteSpore || 0) >= 1) {
            const pi = document.createElement('span');
            pi.className = 'mp-build-icon';
            pi.innerHTML = iconeBat('parasite', 12);
            pi.title = 'Spore parasitaire prête';
            row.appendChild(pi);
        }

        /* Quand la planete et toutes ses lunes sont tenues, elles forment un
           bloc : on n'ecrit plus une ligne par lune, seulement leur nombre.
           Sans cela la liste faisait trois kilometres de long. */
        if (lunesResumees > 0) {
            const lu = document.createElement('span');
            /* classe propre : mp-build-icon est reecrite par le rafraichissement
               periodique, qui effacerait ce compteur */
            lu.className = 'mp-lunes';
            lu.style.cssText = 'font-size:9px;opacity:0.75;letter-spacing:0.5px;margin-left:2px;';
            lu.textContent = '\u25CF' + lunesResumees;
            lu.title = lunesResumees + (lunesResumees > 1 ? ' lunes tenues' : ' lune tenue');
            row.appendChild(lu);
        }

        const sporesEl = document.createElement('span');
        sporesEl.className = 'mp-spores';
        sporesEl.textContent = Math.floor(body.spores || 0);
        row.appendChild(sporesEl);

        {

            // Clic gauche : sélection unique + caméra
            row.addEventListener('click', (e) => {
                if (e.button !== 0) return;
                container.querySelectorAll('.mp-body-row.active').forEach(el => el.classList.remove('active'));
                _selectedBodies.clear();
                _selectedBodies.add(body);
                row.classList.add('active');
                followingBody = body;
                gameState.camera.x = body.x;
                gameState.camera.y = body.y;
                gameState.camera.zoom = Math.max(gameState.camera.zoom, 0.8);
            });

            // Clic droit : sélection multiple
            let _lastRightClick = 0;
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const now = Date.now();
                const isDouble = (now - _lastRightClick) < 350;
                _lastRightClick = now;

                if (isDouble) {
                    // Double clic droit sur planète → sélectionne toutes ses lunes
                    // Double clic droit sur lune → sélectionne lune + planète mère
                    if (body.type === 'planet') {
                        const slot2 = localSlot();
                        const moons = (body.moons || []).filter(m => m.owner === slot2);
                        for (const m of moons) { _selectedBodies.add(m); }
                    } else if (body.type === 'moon') {
                        _selectedBodies.add(body);
                        if (body.parent && body.parent.owner === localSlot()) _selectedBodies.add(body.parent);
                    }
                } else {
                    // Simple clic droit : toggle dans la sélection
                    if (_selectedBodies.has(body)) _selectedBodies.delete(body);
                    else _selectedBodies.add(body);
                }

                // Mettre à jour le visuel
                container.querySelectorAll('.mp-body-row').forEach(el => {
                    const bn = el.dataset.bodyName;
                    const b = gameState.allBodies.find(x => x.name === bn);
                    if (b && _selectedBodies.has(b)) el.classList.add('active');
                    else if (followingBody !== b) el.classList.remove('active');
                });
            });

            if (followingBody === body || _selectedBodies.has(body)) row.classList.add('active');
        }
        return row;
    }

    const _hash = myBodies.map(b => b.name).join(',');
    const _openGroup = container.dataset.openGroup || null;

    if (container.dataset.hash !== _hash) {
        container.dataset.hash = _hash;
        container.innerHTML = '';
        // Ne pas vider _selectedBodies ici — on conserve la sélection

        const sunNames = Object.keys(groups);
        let defaultOpen = _openGroup || (sunNames.length > 0 ? sunNames[0] : null);

        for (const sunName of sunNames) {
            const sunRef = groupSuns[sunName];
            const complete = sunRef && isSystemComplete(sunRef, slot);
            const isOpen = (sunName === defaultOpen);

            const groupEl = document.createElement('div');
            groupEl.className = 'mp-sun-group';
            groupEl.dataset.sunName = sunName;

            const sunLabel = document.createElement('div');
            sunLabel.className = 'mp-sun-label' + (isOpen ? ' open' : '');
            const leftSpan = document.createElement('span');
            leftSpan.style.cssText = 'display:flex;align-items:center;gap:4px;';
            leftSpan.textContent = '☀ ' + sunName;
            if (complete) {
                const badge = document.createElement('span');
                badge.className = 'sys-complete';
                badge.title = 'Système complet : +3% production';
                badge.textContent = '★ +3%';
                leftSpan.appendChild(badge);
            }
            const chevron = document.createElement('span');
            chevron.className = 'mp-chevron';
            chevron.textContent = '▶';
            sunLabel.appendChild(leftSpan);
            sunLabel.appendChild(chevron);
            sunLabel.addEventListener('click', () => {
                const bodyEl = groupEl.querySelector('.mp-sun-body');
                const wasOpen = container.dataset.openGroup === sunName;
                container.querySelectorAll('.mp-sun-label').forEach(l => l.classList.remove('open'));
                container.querySelectorAll('.mp-sun-body').forEach(b => b.classList.remove('open'));
                if (!wasOpen) {
                    sunLabel.classList.add('open');
                    bodyEl.classList.add('open');
                    container.dataset.openGroup = sunName;
                } else {
                    container.dataset.openGroup = '';
                }
            });
            groupEl.appendChild(sunLabel);

            const bodyEl = document.createElement('div');
            bodyEl.className = 'mp-sun-body' + (isOpen ? ' open' : '');
            if (isOpen) container.dataset.openGroup = sunName;

            const buildBar = document.createElement('div');
            buildBar.className = 'mp-build-bar';
            const modeDefs = [
                { mode: 'off',     icon: '⬛', title: 'Désactivé — production normale' },
                { mode: 'alveole', icon: iconeBat('alveole', 16), title: 'Alvéole — stock max (+20, 15, 10 puis 5 %)' },
                { mode: 'nid',     icon: iconeBat('nid', 16), title: 'Nid — production (+30, 22,5, 15 puis 7,5 %)' },
                { mode: 'biome',   icon: iconeBat('biome', 16), title: 'Biome — défense (+20, 15, 10 puis 5 %)' },
            ];
            const bodies = groups[sunName];

            let _ttEl = document.getElementById('_buildTooltip');
            if (!_ttEl) {
                _ttEl = document.createElement('div');
                _ttEl.id = '_buildTooltip';
                _ttEl.className = 'build-mode-tooltip';
                document.body.appendChild(_ttEl);
            }
            let _ttTimer = null;

            modeDefs.forEach(({ mode, icon, title }) => {
                const btn = document.createElement('span');
                btn.className = 'mp-bbtn' + (mode === 'off' ? ' active' : '');
                btn.innerHTML = icon;
                btn.dataset.mode = mode;
                btn.addEventListener('mouseenter', (e) => {
                    clearTimeout(_ttTimer);
                    _ttTimer = setTimeout(() => {
                        _ttEl.textContent = title;
                        _ttEl.style.left = (e.clientX + 8) + 'px';
                        _ttEl.style.top = (e.clientY - 28) + 'px';
                        _ttEl.classList.add('visible');
                    }, 200);
                });
                btn.addEventListener('mouseleave', () => { clearTimeout(_ttTimer); _ttEl.classList.remove('visible'); });
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targets = _selectedBodies.size > 0 ? [..._selectedBodies] : [];
                    if (targets.length === 0) {
                        gameState.conquestEffects.push({
                            x: gameState.camera.x, y: gameState.camera.y - 40, baseX: gameState.camera.x,
                            text: '⚠ Aucun astre sélectionné', color: '#FFD700', age: 0, maxAge: 2
                        });
                        return;
                    }
                    let accepte = 0;
                    for (const b of targets) {
                        if (demanderConstruction(b, mode)) accepte++;
                    }
                    if (accepte === 0) return;
                    buildBar.querySelectorAll('.mp-bbtn').forEach(s => s.classList.remove('active'));
                    btn.classList.add('active');
                });
                buildBar.appendChild(btn);
            });
            bodyEl.appendChild(buildBar);

            const planetsInGroup = sunRef ? sunRef.planets.filter(p => p.owner === slot) : bodies.filter(b => b.type === 'planet');
            const orphans = bodies.filter(b => b.type !== 'planet' && (!b.parent || b.parent.owner !== slot));

            for (const planet of planetsInGroup) {
                const planetBlock = document.createElement('div');
                planetBlock.className = 'mp-planet-block';
                const toutesLunes = planet.moons || [];
                const moons = toutesLunes.filter(m => m.owner === slot);
                const bloc = toutesLunes.length > 0 && moons.length === toutesLunes.length;

                planetBlock.appendChild(_makeBodyRow(planet, bloc ? moons.length : 0));

                for (let mi = 0; bloc ? false : mi < moons.length; mi++) {
                    const isLast = mi === moons.length - 1;
                    const indent = document.createElement('div');
                    indent.className = 'mp-moon-indent';
                    const treeLine = document.createElement('div');
                    treeLine.className = 'mp-tree-line' + (isLast ? ' last' : '');
                    indent.appendChild(treeLine);
                    const moonWrap = document.createElement('div');
                    moonWrap.style.flex = '1';
                    moonWrap.appendChild(_makeBodyRow(moons[mi]));
                    indent.appendChild(moonWrap);
                    planetBlock.appendChild(indent);
                }
                bodyEl.appendChild(planetBlock);
            }

            for (const b of orphans) {
                bodyEl.appendChild(_makeBodyRow(b));
            }

            groupEl.appendChild(bodyEl);
            container.appendChild(groupEl);
        }

    } else {
        container.querySelectorAll('.mp-sun-group').forEach(grpEl => {
            const sn = grpEl.dataset.sunName;
            if (!sn || !groups[sn]) return;
            const sunRef = groupSuns[sn];
            const complete = sunRef && isSystemComplete(sunRef, slot);
            const badge = grpEl.querySelector('.sys-complete');
            if (complete && !badge) {
                const lb = grpEl.querySelector('.mp-sun-label span');
                if (lb) { const b = document.createElement('span'); b.className='sys-complete'; b.textContent='★ +3%'; lb.appendChild(b); }
            } else if (!complete && badge) { badge.remove(); }
        });
        container.querySelectorAll('.mp-body-row').forEach(row => {
            const bn = row.dataset.bodyName;
            if (!bn) return;
            const body = gameState.allBodies.find(b => b.name === bn);
            if (!body) return;
            const spEl = row.querySelector('.mp-spores');
            if (spEl) spEl.textContent = Math.floor(body.spores || 0);
            if (followingBody === body || _selectedBodies.has(body)) row.classList.add('active');
            else row.classList.remove('active');
            // Mettre à jour l'icône build
            let biEl = row.querySelector('.mp-build-icon');
            const newIcon = BATI_GENRES.indexOf(body.buildMode) >= 0 ? body.buildMode : '';
            if (newIcon) {
                if (!biEl) {
                    biEl = document.createElement('span');
                    biEl.className = 'mp-build-icon';
                    const spEl2 = row.querySelector('.mp-spores');
                    if (spEl2) row.insertBefore(biEl, spEl2);
                    else row.appendChild(biEl);
                }
                /* Redessinee seulement quand le genre change : cette mise a
                   jour tourne en continu. */
                if (biEl.dataset.g !== newIcon) { biEl.dataset.g = newIcon; biEl.innerHTML = iconeBat(newIcon, 12); }
            } else if (biEl) {
                biEl.remove();
            }
        });
    }
}

function updateCameraFollow() {
    // Verrouillage caméra pendant le tir
    if (gameState.launchCameraLock && gameState.launchSource) {
        const cam = gameState.camera;
        cam.x += (gameState.launchSource.x - cam.x) * 0.5;
        cam.y += (gameState.launchSource.y - cam.y) * 0.5;
        return;
    }
    if (!followingBody) return;
    // Arrêter le suivi uniquement si le body n'existe plus
    if (!followingBody) return;
    // Suivre en douceur
    const cam = gameState.camera;
    const lerp = 0.15;
    cam.x += (followingBody.x - cam.x) * lerp;
    cam.y += (followingBody.y - cam.y) * lerp;
}
