// ─────────────────────────────────────────────
// UPDATE (logique de jeu)
// ─────────────────────────────────────────────
// Interpolation locale des jets entre snapshots serveur

function update(dt) {
    gameState.time += dt;
    if (gameState.phase === 'paused') return;
    /* updateLOD, la camera clavier et le suivi d'astre sont passes dans
       avancerImage : ils suivent chaque image, pas les tours de jeu. */
    // En multi : le serveur simule tout, le client applique les snapshots et affiche
if (gameState.isMulti) {
        updateOrbits(dt);
        updateJets(dt);
        // Interpoler les cleaners localement entre snapshots
        for (const cl of gameState.cleaners) {
            if (cl.vx !== undefined && !cl.mort) {
                cl.x += cl.vx * dt;
                cl.y += cl.vy * dt;
            }
        }
        montrerDuels(dt);
        updateCosmicEffects(dt);
        updateConquestEffects(dt);
        updateImpacts(dt);
        majLuttes(dt);
        majOndesSolaires(dt);
        majModeSurface(dt);
        majChargementTir(dt);
        majRafale(dt);
        majBoule(dt);
        majFiletsCharge(dt);
        majPopProduction(dt);
        majSecousse(dt);
        majAlertes(dt);
        majEtincelles(dt);
        if (gameState._hudCounter % 10 === 0) {
            updateHUD();
            updateMultiPanel();
            updateTechPanel();
        }
        if (gameState._hudCounter % 30 === 0) {
            updateMyPlanets();
        }
        gameState._hudCounter = (gameState._hudCounter || 0) + 1;
        gameState.gameStats.timeElapsed += dt;
        return;
    }
    updateOrbits(dt);
    updateCosmicEffects(dt);
    updateSporeGeneration(dt);
    updateComets(dt);
    if ((gameState._hudCounter & 1) === 0) updateAI(dt);
    majDuels(dt);
    majCapitaux(dt);
    majCommerce(dt);
    updateCleaners(dt);
    updateJets(dt);
    updateImpacts(dt);
    updateConquestEffects(dt);
    majLuttes(dt);
    majOndesSolaires(dt);
    majModeSurface(dt);
    /* Les gestes, cote ecran : ils ne touchent pas a la partie, ils donnent
       des ordres. Puis les memes gestes, cote calcul, pour chaque joueur. */
    majChargementTir(dt);
    majRafale(dt);
    majBoule(dt);
    majVisees(dt);
    majAnneaux(dt);
    majRafales(dt);
    majBoules(dt);
    majFiletsCharge(dt);
    majPopProduction(dt);
    majSecousse(dt);
    majAlertes(dt);
    majEtincelles(dt);
    // Mise à jour HUD throttlé (perf)
    gameState.dt = dt;
    gameState._hudCounter = (gameState._hudCounter || 0) + 1;
    if (gameState._hudCounter % 30 === 0) {
        updateMyPlanets();
        if (!gameState.isMulti) checkVictoryAndElimination();
    }
    if (gameState._hudCounter % 10 === 0) {
        updateHUD();
        updateMultiPanel();
        updateTechPanel();
    }
    gameState.gameStats.timeElapsed += dt;
    updateAudioTension();
    updateOrbitHum();
    if (gameState._hudCounter % 60 === 0) updateAmbiance();
}


