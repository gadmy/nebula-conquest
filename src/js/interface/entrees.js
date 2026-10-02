// ─────────────────────────────────────────────
// INPUT — Zoom & Panoramique
// ─────────────────────────────────────────────
function setupInput() {
    const canvas = gameState.canvas;
    const cam = gameState.camera;
    const inp = gameState.input;

    // ── Molette : Zoom ──
    canvas.addEventListener('wheel', (e) => {
        const mpEl = document.getElementById('myPlanets');
        if (mpEl && mpEl.matches(':hover')) return;
        e.preventDefault();
        /* Demolisseur arme : la molette choisit le batiment, pas le zoom. */
        if (gameState._demol && gameState._firePhase === 'aiming') {
            if (e.deltaY) genreDemolisseurSuivant(e.deltaY > 0 ? 1 : -1);
            return;
        }
        /* La molette reprend la main sur le zoom automatique du mode surface. */
        gameState._zoomCible = null;
        const direction = e.deltaY > 0 ? -1 : 1;
        const factor = 1 + cam.zoomSpeed;
        const oldZoom = cam.zoom;
        const newZoom = direction > 0
            ? Math.min(cam.zoom * factor, cam.maxZoom)
            : Math.max(cam.zoom / factor, cam.minZoom);

        // Zoom vers le curseur
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Position monde sous le curseur avant zoom
        const worldX = (mx - gameState.width / 2) / oldZoom + cam.x;
        const worldY = (my - gameState.height / 2) / oldZoom + cam.y;

        cam.zoom = newZoom;

        // Ajuster la caméra pour que le point monde reste sous le curseur
        cam.x = worldX - (mx - gameState.width / 2) / newZoom;
        cam.y = worldY - (my - gameState.height / 2) / newZoom;
    }, { passive: false });

    // ── État du nouveau système de tir ──
    // Phases : null | 'menu' | 'aiming'
    gameState._firePhase = null;
    gameState._fireSource = null;
    gameState._fireType = 'normal';
    gameState._fireCamZoom = null; // zoom sauvegardé avant dézoom

    function _worldPos(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const mx = clientX - rect.left, my = clientY - rect.top;
        return { x: (mx - gameState.width/2)/cam.zoom + cam.x, y: (my - gameState.height/2)/cam.zoom + cam.y };
    }
    /* Planete ou lune sous le curseur (double-clic, clic droit) : la meme
       zone de clic que la selection, soleils exclus. */
    function _bodyAt(wx, wy) {
        const b = findBodyAt(wx, wy);
        return (b && b.type !== 'sun') ? b : null;
    }
    function _cancelFire() {
        gameState._demol = false;
        gameState._firePhase = null;
        gameState._fireSource = null;
        gameState._fireLanceur = null;
        gameState._fireGroupe = null;
        gameState._chargeAcc = 0;
        gameState.launchPreview = [];
        // Remettre zoom
        if (gameState._fireCamZoom !== null) { cam.zoom = gameState._fireCamZoom; gameState._fireCamZoom = null; }
        document.getElementById('sporeTypeMenu').style.display = 'none';
    }

    // ── Clic gauche ──
    let _appui = null;          /* l'appui du clic gauche en cours (voir plus bas) */
    canvas.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || gameState.phase !== 'game') return;
        if (gameState.isSpectator) return;
        const wp = _worldPos(e.clientX, e.clientY);
        /* CE QUI EST SOUS LE CURSEUR A L'APPUI fait foi pour tout le clic.
           Des l'appui la camera glisse vers l'astre choisi ; au relacher,
           0,1 a 0,2 s plus tard, recalculer "ce qu'il y a sous le curseur"
           tombait souvent dans le vide et deselectionnait : 31 clics sur
           120 seulement prenaient du premier coup. */
        _appui = { x: e.clientX, y: e.clientY, wx: wp.x, wy: wp.y, astre: findBodyAt(wp.x, wp.y) };
        /* Cliquer dans l'espace rend la main au jeu : le bouton ou le
           curseur touche juste avant ne garde plus le clavier (Espace, F, A,
           E... repartent au jeu). */
        const _actif = document.activeElement;
        if (_actif && _actif !== document.body && _actif.tagName !== 'TEXTAREA'
            && !(_actif.tagName === 'INPUT' && _actif.type === 'text')) _actif.blur();

        // Fermer tous les menus en jeu si clic hors du menu
        const _openMenus = [
            { id: 'sporeTypeMenu', close: () => { _closeSporMenu(); gameState._firePhase = null; gameState._fireSource = null; } },
            { id: 'codex',    close: () => closeCodex() },
        ].map(m => ({ ...m, el: document.getElementById(m.id) }))
         .filter(m => m.el && m.el.offsetParent !== null);
        /* Un clic hors d'un menu le ferme ET compte : s'il tombe sur un
           astre, celui-ci est choisi dans la foulee - il fallait sinon un
           second clic avant de pouvoir viser (Espace). */
        let _menuFerme = false;
        for (const menu of _openMenus) {
            const mr = menu.el.getBoundingClientRect();
            if (e.clientX < mr.left || e.clientX > mr.right || e.clientY < mr.top || e.clientY > mr.bottom) {
                menu.close();
                _menuFerme = true;
            }
        }
        if (_menuFerme && !findBodyAt(wp.x, wp.y)) return;

        // Phase aiming : maintien gauche → dézoom progressif, relâche → tir
        if (gameState._firePhase === 'aiming') {
            /* Ctrl + clic : la rafale, pas le tir unique (voir demarrerRafale). */
            if (e.ctrlKey) { demarrerRafale(); return; }
            gameState._aimHolding = true;
            gameState._fireCamZoom = cam.zoom;
            return;
        }

        /* Sinon : l'astre sous le clic devient l'astre choisi, tout de suite,
           ou que soit la camera - Espace vise depuis lui. Meme zone de clic
           que la selection au relacher (findBodyAt, plus genereuse pour les
           petites lunes) : un clic un peu a cote d'une lune la manquait ici. */
        const body = findBodyAt(wp.x, wp.y);
        if (body) {
            followingBody = body;
            /* Sur un astre partage, le clic choisit la ZONE sur laquelle il
               tombe : c'est d'elle qu'on tirera. S'il tombe sur celle d'un
               autre, on prend la notre la plus proche plutot que de ne rien
               faire - un clic sur sa planete doit toujours designer quelque
               chose. */
            if (body.lutte && body.lutte.zones) {
                const mien = campDe(body, localSlot());
                const id = zoneA(body, wp.x, wp.y);
                const z = id ? body.lutte.zones[id] : null;
                if (z && z.v === mien) {
                    choisirZone(body, id);
                } else {
                    let best = 0, bd = Infinity;
                    for (const k in body.lutte.zones) {
                        const zz = body.lutte.zones[k];
                        if (zz.v !== mien) continue;
                        const c = zoneCentre(body, zz);
                        const d = (c.x - wp.x) * (c.x - wp.x) + (c.y - wp.y) * (c.y - wp.y);
                        if (d < bd) { bd = d; best = +k; }
                    }
                    if (best) choisirZone(body, best);
                }
            }
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button !== 0 || gameState.phase !== 'game') return;
        /* Fin de rafale : on reste en visee, pret a recommencer. */
        if (gameState._rafale) { arreterRafale(); return; }
        /* Clic relache pendant ou apres une boule : la boule a remplace le
           tir, on ne tire pas un jet de plus. */
        if (gameState._boule || gameState._bouleUtilisee) {
            gameState._bouleUtilisee = false;
            if (gameState._aimHolding) {
                gameState._aimHolding = false;
                if (gameState._fireCamZoom !== null && gameState._fireCamZoom !== undefined) {
                    cam.zoom = gameState._fireCamZoom; gameState._fireCamZoom = null;
                }
            }
            return;
        }

        /* Demolisseur arme : le clic le tire a la place du jet. Refuse (pas
           assez de spores), on reste arme et en visee. */
        if (gameState._firePhase === 'aiming' && gameState._aimHolding && gameState._demol) {
            gameState._aimHolding = false;
            if (gameState._fireCamZoom !== null && gameState._fireCamZoom !== undefined) {
                cam.zoom = gameState._fireCamZoom; gameState._fireCamZoom = null;
            }
            if (!tirDemolisseur()) return;
            gameState._demol = false;
            gameState._firePhase = null;
            gameState._fireSource = null;
            gameState._fireLanceur = null;
            gameState._fireGroupe = null;
            gameState._chargeAcc = 0;
            gameState.launchPreview = [];
            return;
        }

        // Phase aiming : relâche → tir
        const _surf = (gameState._firePhase === 'aiming' && gameState._aimHolding)
                    ? astreTirSurface() : null;
        if (_surf) {
            gameState._aimHolding = false;
            lancerJetSurface(_surf, localSlot(),
                             gameState.mouseWorldX, gameState.mouseWorldY);
            /* On reste en visee : une bataille de surface se mene par rafales. */
            return;
        }
        if (gameState._firePhase === 'aiming' && gameState._aimHolding) {
            gameState._aimHolding = false;
            const src = gameState._fireLanceur || gameState._fireSource;
            if (src) {
                const dx = gameState.mouseWorldX - src.x;
                const dy = gameState.mouseWorldY - src.y;
                const len = Math.sqrt(dx*dx + dy*dy);
                if (len > 10) {
                    const dX = dx/len, dY = dy/len;
                    /* Zone trop petite pour attaquer : l'ecran vibre. En
                       multijoueur c'est le serveur qui refuse, et son refus
                       est muet - on verifie donc aussi de ce cote. */
                    const _zt = src.lutte ? zoneDeTir(src, localSlot()) : null;
                    if (src.lutte && (!_zt || _zt.z.n < ZONE_MIN)) { secouerEcran(8); return; }
                    if (gameState.isMulti) {
                        /* On annonce le POINT de la zone choisie : le serveur
                           n'a pas la meme numerotation, mais il retrouve la
                           zone sous ce point. */
                        const _zt = src.lutte ? zoneDeTir(src, localSlot()) : null;
                        const _zc = _zt ? zoneCentre(src, _zt.z) : null;
                        sendAction('jet', { srcName: src.name, dirX: dX, dirY: dY,
                                            sporeType: gameState._fireType,
                                            zx: _zc ? _zc.x : undefined, zy: _zc ? _zc.y : undefined });
                    } else {
                        donnerOrdre('tir', { src: src.name, dx: dX, dy: dY, t: gameState._fireType });
                    }
                }
            }
            // Remettre zoom
            if (gameState._fireCamZoom !== null) { cam.zoom = gameState._fireCamZoom; gameState._fireCamZoom = null; }
            gameState._firePhase = null;
            gameState._fireSource = null;
            gameState._fireLanceur = null;
            gameState._fireGroupe = null;
            gameState._chargeAcc = 0;
            gameState.launchPreview = [];
        }
    });

    /* Double-clic : on plonge sur l'astre. Le tir (vers un autre astre, ou
       de surface en pointant son disque) ne s'ouvre qu'avec Espace. */
    canvas.addEventListener('dblclick', (e) => {
        if (gameState.phase !== 'game') return;
        const wp = _worldPos(e.clientX, e.clientY);
        const body = _bodyAt(wp.x, wp.y);
        if (body) { e.preventDefault(); cadrerAstre(body); }
    });

    // ── Clic droit ──
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2 || e.button === 1) {
            e.preventDefault();
            if (gameState.phase === 'game') {
                const wp = _worldPos(e.clientX, e.clientY);
                const body = _bodyAt(wp.x, wp.y);
                /* CLIC DROIT : en visee, il annule ; sur un astre, il ouvre sa
                   fiche (infos et batiments). Le menu radial a ete retire :
                   tout passe par les touches (Espace, 1 a 4, F, G, R, T). */
                if (e.button === 2 && gameState._firePhase) { _cancelFire(); return; }
                if (body && e.button === 2) {
                    if (!gameState._spawnLocked) openCodex(body);
                    return;
                }
                if (gameState._firePhase) { _cancelFire(); return; }
            }
            // Panoramique
            inp.isDragging = true;
            inp.dragStartX = e.clientX; inp.dragStartY = e.clientY;
            inp.cameraStartX = cam.x; inp.cameraStartY = cam.y;
            if (typeof followingBody !== 'undefined') { followingBody = null; document.querySelectorAll('.mp-body-row.active').forEach(el => el.classList.remove('active')); }
            canvas.classList.add('grabbing');
        }
    });

    window.addEventListener('mousemove', (e) => {
        inp.mouseX = e.clientX;
        inp.mouseY = e.clientY;
        // Position monde sous la souris
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        gameState.mouseWorldX = (mx - gameState.width / 2) / cam.zoom + cam.x;
        gameState.mouseWorldY = (my - gameState.height / 2) / cam.zoom + cam.y;

        /* Un chiffre pose sous un astre dit combien, sa couleur dit qui - mais
           une couleur n'est pas un nom. Au survol, on le nomme. */
        const c = (gameState.phase === 'game' && e.target === canvas) ? chiffreSous(mx, my) : null;
        if (c) { _stmShowTip(libelleChiffre(c), e.clientX, e.clientY); _bulleChiffre = true; }
        else if (_bulleChiffre) { _stmHideTip(); _bulleChiffre = false; }

        // Prévisualisation de lancement (phase aiming)
        if (gameState._firePhase === 'aiming' && gameState._fireSource) {
            // Preview mise à jour dans la boucle de rendu
        }

        if (inp.isDragging && !gameState.launchCameraLock) {
            const dx = e.clientX - inp.dragStartX;
            const dy = e.clientY - inp.dragStartY;
            cam.x = inp.cameraStartX - dx / cam.zoom;
            cam.y = inp.cameraStartY - dy / cam.zoom;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 2 || e.button === 1) {
            inp.isDragging = false;
            canvas.classList.remove('grabbing');
        }
    }, true);

    // ── Clic gauche : spawn / codex ──
    let justLaunched = false;
    
    canvas.addEventListener('click', (e) => {
        if (e.button !== 0) return;
        if (gameState.phase === 'editor') return;
        if (justLaunched) { justLaunched = false; return; }
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let worldX = (mx - gameState.width / 2) / cam.zoom + cam.x;
        let worldY = (my - gameState.height / 2) / cam.zoom + cam.y;
        /* Un clic (pas un glisse) : on garde ce qui etait vise a l'appui. */
        const appui = _appui;
        _appui = null;
        const clicNet = appui && Math.hypot(e.clientX - appui.x, e.clientY - appui.y) < 10;
        if (clicNet && gameState.phase === 'game') { worldX = appui.wx; worldY = appui.wy; }

        if (gameState.phase === 'spawn' && !gameState._spawnLocked) {
            handleSpawnClick(worldX, worldY);
        } else if (gameState.phase === 'game' && clicNet && appui.astre) {
            /* Un astre sous le curseur a l'appui : c'est lui, meme si un tir
               passait a cote. */
            for (const jet of gameState.jets) jet.selected = false;
            followingBody = appui.astre;
            cam.x = appui.astre.x;
            cam.y = appui.astre.y;
        } else if (gameState.phase === 'game') {
            // Chercher un jet sous le clic
            let clickedJet = false;
            for (const jet of gameState.jets) {
                jet.selected = false;
                const dx = jet.x - worldX, dy = jet.y - worldY;
                if (Math.sqrt(dx*dx+dy*dy) < 20) {
                    jet.selected = true;
                    clickedJet = true;
                }
            }
            if (!clickedJet) {
                // Chercher un astre sous le clic
                const body = findBodyAt(worldX, worldY);
                if (body) {
                    followingBody = body;
                    cam.x = body.x;
                    cam.y = body.y;
                }
                else {
                    closeCodex();
                    /* Un clic dans le vide lache l'astre suivi : la fiche du
                       bas repasse alors au bilan du joueur. */
                    if (gameState._firePhase !== 'aiming') {
                        followingBody = null;
                        gameState.selectedBody = null;
                        document.querySelectorAll('#myPlanetsList .mp-body-row.active')
                                .forEach(function (r) { r.classList.remove('active'); });
                    }
                }
            }
        }
    });

    // Empêcher le menu contextuel
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Fermer les menus en jeu au clic gauche hors du menu (écoute globale)
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || gameState.phase !== 'game') return;
        const _gameMenus = [
            { id: 'sporeTypeMenu', isOpen: () => document.getElementById('sporeTypeMenu').style.display !== 'none', close: () => { _closeSporMenu(); gameState._firePhase = null; gameState._fireSource = null; } },
            { id: 'codex',         isOpen: () => gameState.codexOpen,                                               close: () => closeCodex() },
        ];
        for (const m of _gameMenus) {
            if (!m.isOpen()) continue;
            const el = document.getElementById(m.id);
            if (!el) continue;
            const r = el.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                m.close();
            }
        }
    }, true);

    // ── Touch : zoom pinch, pan, jet ──
    let _touches = {};
    let _pinchDist = 0;
    let _touchPan = false;
    let _touchJet = false;
    let _touchStart = 0;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length === 2) {
            _touchPan = false; _touchJet = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            _pinchDist = Math.sqrt(dx*dx + dy*dy);
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            const mx = t.clientX - rect.left;
            const my = t.clientY - rect.top;
            const wx = (mx - gameState.width / 2) / cam.zoom + cam.x;
            const wy = (my - gameState.height / 2) / cam.zoom + cam.y;
            _touchStart = performance.now();
            _touchJet = false; _touchPan = false;
            _touches = { sx: t.clientX, sy: t.clientY, wx, wy };
            if (gameState.phase === 'game') {
                for (const body of gameState.allBodies) {
                    if (body.owner !== localSlot()) continue;
                    if (Math.sqrt((body.x-wx)**2 + (body.y-wy)**2) < body.radius + 12) {
                        _touchJet = true;
                        gameState.launching = true;
                        gameState.launchSource = body;
                        gameState.launchPreview = [];
                        gameState.launchStartTime = performance.now();
                        gameState.launchCameraLock = false;
                        break;
                    }
                }
            }
            if (!_touchJet) _touchPan = true;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 2 && _pinchDist > 0) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const scale = dist / _pinchDist;
            cam.zoom = Math.max(cam.minZoom, Math.min(cam.maxZoom, cam.zoom * scale));
            _pinchDist = dist;
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            if (_touchPan) {
                cam.x -= (t.clientX - _touches.sx) / cam.zoom;
                cam.y -= (t.clientY - _touches.sy) / cam.zoom;
                _touches.sx = t.clientX; _touches.sy = t.clientY;
            }
            if (_touchJet && gameState.launching) {
                const rect = canvas.getBoundingClientRect();
                gameState.mouseWorldX = (t.clientX - rect.left - gameState.width / 2) / cam.zoom + cam.x;
                gameState.mouseWorldY = (t.clientY - rect.top - gameState.height / 2) / cam.zoom + cam.y;
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (_touchJet && gameState.launching && gameState.launchSource) {
            const elapsed = performance.now() - _touchStart;
            const src = gameState.launchSource;
            if (elapsed < 200) {
                followingBody = src;
            } else {
                const dx = gameState.mouseWorldX - src.x;
                const dy = gameState.mouseWorldY - src.y;
                const len = Math.sqrt(dx*dx + dy*dy);
                if (len > 10) {
                    if (gameState.isMulti) {
                        sendAction('jet', { srcName: src.name, dirX: dx/len, dirY: dy/len, sporeType: gameState._fireType });
                    } else {
                        donnerOrdre('tir', { src: src.name, dx: dx/len, dy: dy/len, t: gameState._fireType });
                    }
                }
            }
            gameState.launching = false;
            gameState.launchSource = null;
            gameState.launchPreview = [];
            gameState.launchCameraLock = false;
        }
        _touchJet = false; _touchPan = false; _pinchDist = 0;
    });
}

/* L'ASTRE SOUS LE CLIC. La marge autour de chaque astre se compte aussi en
   pixels d'ecran : au moins 14 px, quel que soit le zoom. En monde seul, de
   loin (zoom 0,3), une lune n'etait cliquable que sur 5 px et le clic
   tombait a cote. Quand plusieurs astres sont a portee (une lune pres de sa
   planete), c'est celui dont le BORD est le plus pres du clic qui gagne. */
function findBodyAt(wx, wy) {
    const z = gameState.camera.zoom || 1;
    const margePx = 14 / z;
    let meilleur = null, meilleurEcart = Infinity;
    const essayer = function (b, marge) {
        const d = Math.sqrt((b.x - wx) * (b.x - wx) + (b.y - wy) * (b.y - wy)) - b.radius;
        if (d < Math.max(marge, margePx) && d < meilleurEcart) { meilleur = b; meilleurEcart = d; }
    };
    for (const m of gameState.moons) essayer(m, 18);
    for (const p of gameState.planets) essayer(p, 14);
    if (meilleur) return meilleur;
    for (const s of gameState.suns) {
        const dx = s.x - wx, dy = s.y - wy;
        if (dx*dx + dy*dy < (s.radius + 10) * (s.radius + 10)) return s;
    }
    return null;
}


