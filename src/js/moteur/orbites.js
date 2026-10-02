// ─────────────────────────────────────────────
// PERFORMANCE — allBodies cache
// ─────────────────────────────────────────────
function rebuildAllBodies() {
    gameState.allBodies = gameState.planets.concat(gameState.moons);
}

// ─────────────────────────────────────────────
// PERFORMANCE — LOD dynamique + FPS adaptatif
// ─────────────────────────────────────────────
function updateLOD(dt) {
    const z = gameState.camera.zoom;
    let zoomLod = 2;
    if (z < 0.35) zoomLod = 0;
    else if (z < 0.6) zoomLod = 1;

    gameState.lodFpsAccum += gameState.fps;
    gameState.lodFpsSamples++;
    gameState.lodAutoTimer += dt;
    let fpsLod = 2;
    if (gameState.lodAutoTimer >= 1.5 && gameState.lodFpsSamples > 0) {
        const avgFps = gameState.lodFpsAccum / gameState.lodFpsSamples;
        if (avgFps < 25) fpsLod = 0;
        else if (avgFps < 40) fpsLod = 1;
        gameState.lodAutoTimer = 0;
        gameState.lodFpsAccum = 0;
        gameState.lodFpsSamples = 0;
    } else {
        fpsLod = gameState.lod;
    }

    /* Le reglage de finesse plafonne aussi le niveau de detail : en "Bas" on
       coupe en plus les scintillements, la brume des jets et les cercles de
       detection, qui coutent sans rien dire d'utile. */
    const capQualite = gameState.qualite === 'basse' ? 1 : 2;
    gameState.lod = Math.min(zoomLod, fpsLod, capQualite);
}

// ─────────────────────────────────────────────
// UPDATE — Orbites
// ─────────────────────────────────────────────
function updateOrbits(dt) {
    // Soleils autour du trou noir
    for (let i = 0; i < gameState.suns.length; i++) {
        const sun = gameState.suns[i];
        sun.angle += sun.orbitSpeed * dt;
        sun.x = Math.cos(sun.angle) * sun.orbitRadius;
        sun.y = Math.sin(sun.angle) * sun.orbitRadius;

        // Planètes autour du soleil
        for (let j = 0; j < sun.planets.length; j++) {
            const planet = sun.planets[j];
            planet.angle += planet.orbitSpeed * dt;
            planet.x = sun.x + Math.cos(planet.angle) * planet.orbitRadius;
            planet.y = sun.y + Math.sin(planet.angle) * planet.orbitRadius;

            // Lunes autour de la planète
            for (let k = 0; k < planet.moons.length; k++) {
                const moon = planet.moons[k];
                moon.angle += moon.orbitSpeed * dt;
                moon.x = planet.x + Math.cos(moon.angle) * moon.orbitRadius;
                moon.y = planet.y + Math.sin(moon.angle) * moon.orbitRadius;
            }
        }
    }

    // Amas de météorites — en multi, piloté par snapshot serveur
    if (!gameState.isMulti) {
        for (const belt of gameState.asteroidBelts) {
            for (const rock of belt.rocks) {
                rock.angle += belt.orbitSpeed * dt;
            }
        }
    }
}


