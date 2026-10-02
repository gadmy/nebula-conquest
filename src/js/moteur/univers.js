
function loadMapFromJSON(mapData) {
    gameState.suns = [];
    gameState.planets = [];
    gameState.moons = [];
    gameState.asteroidBelts = [];

    // Trou noir
    gameState.blackHole = {
        x: mapData.blackHole.x,
        y: mapData.blackHole.y,
        radius: mapData.blackHole.radius,
        dangerZone: 300,
        angle: 0
    };

    // Soleils
    for (const sd of mapData.suns) {
        const sun = {
            type: 'sun', name: sd.name, radius: sd.radius,
            orbitRadius: sd.orbitRadius, orbitSpeed: sd.orbitSpeed,
            angle: sd.angle, color: sd.color,
            x: Math.cos(sd.angle) * sd.orbitRadius + gameState.blackHole.x,
            y: Math.sin(sd.angle) * sd.orbitRadius + gameState.blackHole.y,
            planets: []
        };

        // Planètes
        for (const pd of sd.planets) {
            const planet = {
                type: 'planet', name: pd.name, radius: pd.radius,
                flore: pd.flore, faune: pd.faune, _baseFaune: pd.faune,
                symbiosis: 0, symOwnerTime: 0,
                buildMode: 'off', nids: 0, biomes: 0, alveoles: 0, parasiteSpore: 0, parasiteProgress: 0, parasite: null, droneCount: 0,
                orbitRadius: pd.orbitRadius, orbitSpeed: pd.orbitSpeed,
                angle: pd.angle, parent: sun,
                x: sun.x + Math.cos(pd.angle) * pd.orbitRadius,
                y: sun.y + Math.sin(pd.angle) * pd.orbitRadius,
                owner: null, spores: 0, maxSpores: Math.floor(pd.radius * 50),
                moons: []
            };

            // Lunes
            for (const md of (pd.moons || [])) {
                const moon = {
                    type: 'moon', name: md.name, radius: md.radius,
                    flore: md.flore, faune: md.faune,
                    symbiosis: 0, symOwnerTime: 0,
                    buildMode: 'off', nids: 0, biomes: 0, alveoles: 0, parasiteSpore: 0, parasiteProgress: 0, parasite: null, droneCount: 0,
                    orbitRadius: md.orbitRadius, orbitSpeed: md.orbitSpeed,
                    angle: md.angle, parent: planet,
                    x: planet.x + Math.cos(md.angle) * md.orbitRadius,
                    y: planet.y + Math.sin(md.angle) * md.orbitRadius,
                    owner: null, spores: 0, maxSpores: Math.floor(md.radius * 50)
                };
                planet.moons.push(moon);
                gameState.moons.push(moon);
            }

            sun.planets.push(planet);
            gameState.planets.push(planet);
        }

        gameState.suns.push(sun);
    }

    // Ceintures d'astéroïdes — génération aléatoire autour de chaque soleil
    const beltTypes = ['dark', 'red', 'green'];
    /* Amas et vaisseaux sont tires ici : sans graine, worldRandom retombait
       sur Math.random et deux joueurs de la meme carte n'avaient pas les
       memes. Meme regle que generateUniverse : la graine de la partie, ou
       une nouvelle si on n'en a pas. */
    if (!gameState.multiSeed) gameState.multiSeed = Math.floor(Math.random() * 2147483647);
    _worldRng = mulberry32(gameState.multiSeed);
    const _arng = () => worldRandom();
    for (const sun of gameState.suns) {
        const firstPlanet = sun.planets[0];
        const lastPlanet = sun.planets[sun.planets.length - 1];
        const innerRadius = firstPlanet ? sun.radius * 2.5 + (firstPlanet.orbitRadius - sun.radius * 2.5) * (0.3 + _arng() * 0.3) : sun.radius * 4;
        const outerBase = lastPlanet ? lastPlanet.orbitRadius + 100 + _arng() * 60 : sun.radius * 6 + 120;
        const beltRadii = [innerRadius, outerBase, outerBase + 80 + _arng() * 60, outerBase + 180 + _arng() * 80];
        for (let bi = 0; bi < 4; bi++) {
            const isInner = (bi === 0);
            const asteroidCount = isInner ? 1 : (3 + Math.floor(_arng() * 6));
            const rocks = [];
            for (let a = 0; a < asteroidCount; a++) {
                const rockType = beltTypes[Math.floor(_arng() * 3)];
                const aAngle = (a / asteroidCount) * Math.PI * 2 + (_arng() - 0.5) * 0.4;
                const rOff = (_arng() - 0.5) * 25;
                const rockCount = 3 + Math.floor(_arng() * 4);
                const subRocks = [];
                for (let r = 0; r < rockCount; r++) {
                    const bR = 50+Math.floor(_arng()*50), bG = 40+Math.floor(_arng()*40), bB = 35+Math.floor(_arng()*35);
                    let cr=bR, cg=bG, cb=bB;
                    if (r%3===0) { if (rockType==='dark'){cr-=15;cg-=15;cb-=10;} else if (rockType==='red'){cr+=60;cg-=10;cb-=10;} else {cr-=10;cg+=50;cb-=10;} }
                    subRocks.push({ offX:(_arng()-0.5)*16, offY:(_arng()-0.5)*16, size:2+_arng()*4, color:`rgb(${Math.max(0,cr)},${Math.max(0,cg)},${Math.max(0,cb)})` });
                }
                rocks.push({ angle: aAngle, radiusOff: rOff, subRocks: subRocks, type: rockType });
            }
            gameState.asteroidBelts.push({ sun: sun, radius: beltRadii[bi], orbitSpeed: isInner ? (0.012 + _arng() * 0.008) : (0.005 + _arng() * 0.006), rocks: rocks });
        }
    }

    // Vaisseaux nettoyeurs
    gameState.cleaners = [];
    /* En multijoueur, les vaisseaux sont ceux de l'hote, tels que le serveur
       les a retenus : l'invite en fabriquait lui-meme selon SA config (3 par
       defaut), et les instantanes, qui les suivent par leur rang, laissaient
       un vaisseau fantome ou en oubliaient. */
    const _clServeur = gameState.isMulti && Array.isArray(mapData.cleaners) ? mapData.cleaners : null;
    if (_clServeur) {
        for (const k of _clServeur) {
            gameState.cleaners.push({ x: k.x, y: k.y, vx: k.vx || 0, vy: k.vy || 0, angle: k.angle || 0,
                                      turnTimer: 0, _target: null, size: k.size || 8, type: k.type });
        }
    }
    const cleanerCount = _clServeur ? 0 : (gameState.config.cleanerCount ?? 3);
    for (let i = 0; i < cleanerCount; i++) {
        const cType = ['red','green','dark'][i % 3];
        const rSun = gameState.suns[i % gameState.suns.length];
        const cAngle = worldRandom() * Math.PI * 2;
        const cDist = rSun.orbitRadius * 0.5 + worldRandom() * rSun.orbitRadius;
        gameState.cleaners.push({
            type: cType, x: Math.cos(cAngle) * cDist, y: Math.sin(cAngle) * cDist,
            vx: (worldRandom()-0.5)*2, vy: (worldRandom()-0.5)*2,
            angle: worldRandom()*Math.PI*2, speed: CLN_CFG.speedMin + worldRandom()*(CLN_CFG.speedMax-CLN_CFG.speedMin),
            size: 8, targetX: 0, targetY: 0, turnTimer: 0, fireTimer: CLN_CFG.fireRate, _target: null
        });
    }

    // Comètes
    gameState.comets = [];
    gameState.cometTimer = 0;
    nomsUniques();
    creerCapitaux();
    initCommerce();
}

/* UN NOM PAR ASTRE. Quatre cartes de la bibliotheque (et parfois le
   generateur) donnaient le meme nom a deux astres - "Synenra" sur la carte
   6. Or un nom sert d'identifiant : les ordres des joueurs designent leurs
   astres par leur nom, le serveur aussi, et le tir reconnait ainsi l'astre
   d'ou il part. Avec un doublon, le demolisseur s'ecrasait sur sa propre
   planete, et un ordre pouvait viser le mauvais astre. Le second devient
   "Synenra II", le troisieme "Synenra III". Toujours dans le meme ordre
   (soleils, planetes, lunes) : tous les joueurs obtiennent les memes noms. */
function nomsUniques() {
    const vus = new Set();
    const chiffres = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
    for (const b of [...gameState.suns, ...gameState.planets, ...gameState.moons]) {
        let nom = b.name, k = 1;
        while (vus.has(nom)) { nom = b.name + (chiffres[k] || ' ' + (k + 1)); k++; }
        b.name = nom;
        vus.add(nom);
    }
}

function generateUniverse() {
    const cfg = gameState.config;
    const seed = gameState.multiSeed || Math.floor(Math.random() * 2147483647);
    gameState.multiSeed = seed;
    _worldRng = mulberry32(seed);
    const sunCount = cfg.sunCount;

    // ── Trou noir central ──
    gameState.blackHole = {
        x: 0, y: 0,
        radius: 300,
        dangerZone: 300,
        gravityRange: 1500,
        gravityStrength: 1260
    };

    // ── Soleils ──
    gameState.suns = [];
    gameState.planets = [];
    gameState.moons = [];

    const _d = window._debugCfg || {};
    const baseOrbitRadius = _d.sunOrbitBase || 100;
    const orbitSpacing = _d.sunOrbitSpacing || 50;
    const MIN_BH_GAP = 50;
    const MIN_SYS_GAP = 10;

    // Orbites partagées : capacité max par anneau
    const orbitSlots = [
        [1, 2], [2, 3], [2, 3]
    ];
    // Répartir les soleils sur les orbites
    let remaining = sunCount;
    let orbitIdx = 0;
    const orbitPlan = []; // [{orbitR, speed, count}]
    while (remaining > 0 && orbitIdx < orbitSlots.length) {
        const [minS, maxS] = orbitSlots[orbitIdx];
        const count = Math.min(remaining, minS + Math.floor(worldRandom() * (maxS - minS + 1)));
        const orbitR = baseOrbitRadius + orbitIdx * orbitSpacing + (worldRandom() - 0.5) * 40;
        const speed = (0.02 + worldRandom() * 0.015) / (1 + orbitIdx * 0.15);
        orbitPlan.push({ orbitR, speed, count });
        remaining -= count;
        orbitIdx++;
    }

    for (const orbit of orbitPlan) {
        // Angle de départ aléatoire pour cette orbite
        const baseAngle = worldRandom() * Math.PI * 2;
        // Espacement angulaire avec variation
        const angleStep = (Math.PI * 2) / orbit.count;
        const angleJitter = angleStep * 0.2; // ±20% de variation

        for (let i = 0; i < orbit.count; i++) {
            const angle = baseAngle + i * angleStep + (worldRandom() - 0.5) * angleJitter;

            const sun = {
                type: 'sun',
                name: generateName(),
                radius: (_d.sunRadMin || 80) + worldRandom() * (_d.sunRadVar || 24),
                orbitRadius: orbit.orbitR,
                orbitSpeed: orbit.speed,
                angle: angle,
                x: 0, y: 0,
                color: ['#FFE44D','#FFB830','#FF8C42','#FF6B6B','#7CB9FF'][Math.floor(worldRandom()*5)],
                planets: []
            };

            // Position initiale
            sun.x = Math.cos(sun.angle) * sun.orbitRadius;
            sun.y = Math.sin(sun.angle) * sun.orbitRadius;

        // ── Planètes pour ce soleil ──
        const planetCount = 2 + Math.floor(worldRandom() * 5); // 2-6
        const pBaseOrbit = sun.radius * 2.5 + (_d.pOrbitBase || 30);
        const pSpacing = (_d.pOrbitSpacing || 95) + worldRandom() * (_d.pOrbitSpacingVar || 15);

        for (let p = 0; p < planetCount; p++) {
            const pOrbitR = pBaseOrbit + p * pSpacing + worldRandom() * 20;
            const pSpeed = (0.08 + worldRandom() * 0.06) / (1 + p * 0.2);
            const pAngle = worldRandom() * Math.PI * 2;
            const pRadius = (_d.pRadMin || 20) + worldRandom() * (_d.pRadVar || 12);

            const planet = {
                type: 'planet',
                name: generateName(),
                radius: pRadius,
                flore: Math.floor(worldRandom() * 101),
                faune: Math.floor(worldRandom() * 101),
                _baseFaune: 0,
                symbiosis: 0,
                symOwnerTime: 0,
                buildMode: 'off',
                nids: 0,
                biomes: 0,
                alveoles: 0,
                parasiteSpore: 0, parasiteProgress: 0, parasite: null, droneCount: 0,
                orbitRadius: pOrbitR,
                orbitSpeed: pSpeed,
                angle: pAngle,
                parent: sun,
                x: 0, y: 0,
                owner: null,
                spores: 0,
                maxSpores: Math.floor(pRadius * 50),
                moons: []
            };

            planet._baseFaune = planet.faune;
            planet.x = sun.x + Math.cos(planet.angle) * planet.orbitRadius;
            planet.y = sun.y + Math.sin(planet.angle) * planet.orbitRadius;

            // ── Lunes (0-3, pas pour toutes) ──
            const hasMoons = worldRandom() > 0.4;
            if (hasMoons) {
                const moonCount = 1 + Math.floor(worldRandom() * 3);
                for (let m = 0; m < moonCount; m++) {
                    const mOrbitR = planet.radius * 2 + (_d.mOrbitBase || 12) + m * (_d.mOrbitSpacing || 14) + worldRandom() * 5;
                    const mSpeed = 0.15 + worldRandom() * 0.2;
                    const mRadius = (_d.mRadMin || 10) + worldRandom() * (_d.mRadVar || 2);

                    const moon = {
                        type: 'moon',
                        name: generateName(),
                        radius: mRadius,
                        flore: Math.floor(worldRandom() * 51),
                        faune: Math.floor(worldRandom() * 61),
                        symbiosis: 0,
                        symOwnerTime: 0,
                        buildMode: 'off',
                        nids: 0,
                        biomes: 0,
                        orbitRadius: mOrbitR,
                        orbitSpeed: mSpeed,
                        angle: worldRandom() * Math.PI * 2,
                        parent: planet,
                        x: 0, y: 0,
                        owner: null,
                        spores: 0,
                        maxSpores: Math.floor(mRadius * 50)
                    };

                    moon.x = planet.x + Math.cos(moon.angle) * moon.orbitRadius;
                    moon.y = planet.y + Math.sin(moon.angle) * moon.orbitRadius;

                    planet.moons.push(moon);
                    gameState.moons.push(moon);
                }
            }

            sun.planets.push(planet);
            gameState.planets.push(planet);
        }

        gameState.suns.push(sun);
        }
    }

    // ── Espacement sécurisé des systèmes solaires ──
    function systemOuterRadius(sun) {
        let maxR = 0;
        for (const p of sun.planets) {
            let pr = p.orbitRadius + p.radius;
            for (const m of p.moons) pr = Math.max(pr, p.orbitRadius + m.orbitRadius + m.radius);
            maxR = Math.max(maxR, pr);
        }
        // Marge pour les ceintures d'astéroïdes extérieures
        if (maxR > 0) maxR += 50;
        return maxR;
    }
    // Trier les soleils par orbitRadius croissant
    gameState.suns.sort((a, b) => a.orbitRadius - b.orbitRadius);
    const bhSafe = gameState.blackHole.dangerZone;
    // Grouper par orbite (soleils à <60 d'écart = même orbite)
    const orbitGroups = [];
    for (const sun of gameState.suns) {
        const last = orbitGroups[orbitGroups.length - 1];
        if (last && Math.abs(sun.orbitRadius - last[0].orbitRadius) < 60) {
            last.push(sun);
        } else {
            orbitGroups.push([sun]);
        }
    }
    // Espacement par groupe d'orbite (pas par soleil individuel)
    for (let g = 0; g < orbitGroups.length; g++) {
        const group = orbitGroups[g];
        const maxSysR = Math.max(...group.map(s => systemOuterRadius(s)));
        // 1) Ne pas toucher le trou noir
        const minFromBH = bhSafe + maxSysR + MIN_BH_GAP;
        const targetR = Math.max(group[0].orbitRadius, minFromBH);
        // 2) Ne pas croiser le groupe précédent
        let finalR = targetR;
        if (g > 0) {
            const prevGroup = orbitGroups[g - 1];
            const prevMaxR = Math.max(...prevGroup.map(s => systemOuterRadius(s)));
            const prevOrbitR = prevGroup[0].orbitRadius;
            const minDist = prevMaxR + maxSysR + MIN_SYS_GAP;
            if (finalR - prevOrbitR < minDist) {
                finalR = prevOrbitR + minDist;
            }
        }
        // Appliquer à tous les soleils du groupe
        for (const sun of group) {
            sun.orbitRadius = finalR;
        }
    }
    // Recalculer positions et repousser les soleils trop proches
    for (let i = 0; i < gameState.suns.length; i++) {
        const sun = gameState.suns[i];
        sun.x = Math.cos(sun.angle) * sun.orbitRadius;
        sun.y = Math.sin(sun.angle) * sun.orbitRadius;
    }
    // Vérifier distances réelles entre tous les soleils et repousser angulairement
    for (let pass = 0; pass < 10; pass++) {
        let moved = false;
        for (let i = 0; i < gameState.suns.length; i++) {
            const a = gameState.suns[i];
            const aR = systemOuterRadius(a);
            for (let j = i + 1; j < gameState.suns.length; j++) {
                const b = gameState.suns[j];
                const bR = systemOuterRadius(b);
                const dx = b.x - a.x, dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = aR + bR + MIN_SYS_GAP;
                if (dist < minDist && dist > 0) {
                    // Même orbite : repousser angulairement
                    if (Math.abs(a.orbitRadius - b.orbitRadius) < 10) {
                        const push = 0.15;
                        b.angle += push;
                    } else {
                        // Orbites différentes : repousser le plus éloigné angulairement
                        const push = 0.1;
                        b.angle += push;
                    }
                    b.x = Math.cos(b.angle) * b.orbitRadius;
                    b.y = Math.sin(b.angle) * b.orbitRadius;
                    moved = true;
                }
            }
        }
        if (!moved) break;
    }
    for (let i = 0; i < gameState.suns.length; i++) {
        const sun = gameState.suns[i];
        sun.x = Math.cos(sun.angle) * sun.orbitRadius;
        sun.y = Math.sin(sun.angle) * sun.orbitRadius;
        for (const p of sun.planets) {
            p.x = sun.x + Math.cos(p.angle) * p.orbitRadius;
            p.y = sun.y + Math.sin(p.angle) * p.orbitRadius;
            for (const m of p.moons) {
                m.x = p.x + Math.cos(m.angle) * m.orbitRadius;
                m.y = p.y + Math.sin(m.angle) * m.orbitRadius;
            }
        }
    }

    // ── Vaisseaux nettoyeurs ──
    gameState.cleaners = [];
    const cleanerCount = gameState.config.cleanerCount ?? 3;

    const clTypes = ['red', 'green', 'dark'];
    for (let c = 0; c < cleanerCount; c++) {
        const angle = (c / cleanerCount) * Math.PI * 2 + worldRandom() * 0.5;
        const dist = 400 + worldRandom() * 2000;
        gameState.cleaners.push({
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            vx: (worldRandom() - 0.5) * 15,
            vy: (worldRandom() - 0.5) * 15,
            angle: angle,
            turnTimer: 0,
            _target: null,
            size: 8,
            type: clTypes[c % 3]
        });
    }

    // ── Amas de météorites (4 ceintures : 1 interne + 3 externes) ──
    gameState.asteroidBelts = [];
    // En multi : les belts viennent de l'hôte via _serverUniverse, on skip la régénération
    if (gameState.isMulti && mapData.asteroidBelts && mapData.asteroidBelts.length > 0) {
        gameState.asteroidBelts = mapData.asteroidBelts.map(b => ({
            ...b,
            sun: gameState.suns[b.sunIndex] || gameState.suns[0],
        }));
    } else if (gameState.config.useAsteroids) {
        const beltTypes = ['dark', 'red', 'green'];
        for (const sun of gameState.suns) {
            const firstPlanet = sun.planets[0];
            const lastPlanet = sun.planets[sun.planets.length - 1];
            // 1 ceinture interne (entre le soleil et la première planète)
            const innerRadius = firstPlanet ? sun.radius * 2.5 + (firstPlanet.orbitRadius - sun.radius * 2.5) * (0.3 + worldRandom() * 0.3) : sun.radius * 4;
            // 3 ceintures externes (après la dernière planète, espacées)
            const outerBase = lastPlanet ? lastPlanet.orbitRadius + 100 + worldRandom() * 60 : sun.radius * 6 + 120;
            const beltRadii = [
                innerRadius,
                outerBase,
                outerBase + 80 + worldRandom() * 60,
                outerBase + 180 + worldRandom() * 80
            ];
            for (let bi = 0; bi < 4; bi++) {
                const isInner = (bi === 0);
                const asteroidCount = isInner ? 1 : (3 + Math.floor(worldRandom() * 6));
                const rocks = [];
                for (let a = 0; a < asteroidCount; a++) {
                    const rockType = beltTypes[Math.floor(worldRandom() * 3)];
                    const aAngle = (a / asteroidCount) * Math.PI * 2 + (worldRandom() - 0.5) * 0.4;
                    const rOff = (worldRandom() - 0.5) * 25;
                    const rockCount = 3 + Math.floor(worldRandom() * 4);
                    const subRocks = [];
                    for (let r = 0; r < rockCount; r++) {
                        const baseR = 50 + Math.floor(worldRandom() * 50);
                        const baseG = 40 + Math.floor(worldRandom() * 40);
                        const baseB = 35 + Math.floor(worldRandom() * 35);
                        let cr = baseR, cg = baseG, cb = baseB;
                        if (r % 3 === 0) {
                            if (rockType === 'dark') { cr -= 15; cg -= 15; cb -= 10; }
                            else if (rockType === 'red') { cr += 60; cg -= 10; cb -= 10; }
                            else { cr -= 10; cg += 50; cb -= 10; }
                        }
                        subRocks.push({
                            offX: (worldRandom() - 0.5) * 16,
                            offY: (worldRandom() - 0.5) * 16,
                            size: 2 + worldRandom() * 4,
                            color: `rgb(${Math.max(0,cr)},${Math.max(0,cg)},${Math.max(0,cb)})`
                        });
                    }
                    rocks.push({
                        angle: aAngle,
                        radiusOff: rOff,
                        subRocks: subRocks,
                        type: rockType
                    });
                }
                gameState.asteroidBelts.push({
                    sun: sun,
                    radius: beltRadii[bi],
                    orbitSpeed: isInner ? (0.012 + worldRandom() * 0.008) : (0.005 + worldRandom() * 0.006),
                    rocks: rocks
                });
            }
        }
    } // fin else if useAsteroids
    nomsUniques();
    creerCapitaux();
    initCommerce();
}


