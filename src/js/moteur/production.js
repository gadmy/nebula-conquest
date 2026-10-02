// ─────────────────────────────────────────────
// SPORES — Génération passive
// ─────────────────────────────────────────────
function updateSporeGeneration(dt) {
    const bodies = gameState.allBodies;
    for (const body of bodies) {
        /* Trop-plein d'une charge : il s'evapore petit a petit, sauf tant
           qu'on charge encore l'astre. */
        if (body.spores > body.maxSpores && !astreEnCharge(body)) {
            const ex = body.spores - body.maxSpores;
            body.spores -= Math.min(ex, (ex * SURCHARGE_FUITE + SURCHARGE_FUITE_MIN) * dt);
        }
        // Régénération de Faune sur astres neutres non conquis
        if (body.owner === null && body._baseFaune !== undefined && body.faune < body._baseFaune) {
            body.faune += 2 * dt; // régénération lente
            if (body.faune > body._baseFaune) body.faune = body._baseFaune;
        }

        if (body.owner === null) continue;
        /* Paralyse par une sphere capitale (explosion, ecrasement) : rien ne pousse. */
        if (body.panne > gameState.time) continue;

        // Mise à jour symbiose
        body.symOwnerTime += dt;
        const symMaxTime = body.type === 'planet' ? 600 : 300; // 10min planètes, 5min lunes
        body.symbiosis = Math.min(100, (body.symOwnerTime / symMaxTime) * 100);

        /* Astre en pleine bataille de surface : c'est majLutte qui repartit
           sa production entre les camps, au prorata du terrain tenu. On ne
           construit pas non plus sous le siege. */
        if (body.lutte) continue;

        if (body.flore <= 0) continue;
        const player = gameState.players[body.owner];
        if (!player) continue;

        // Bonus symbiose : +20% planètes, +10% lunes à 100%
        const symBonusMax = body.type === 'planet' ? 0.20 : 0.10;
        const symBonus = 1 + (body.symbiosis / 100) * symBonusMax;

        // Bonus nids : +0.2% production locale par nid
        const nidBonus = 1 + bonusBatiment(body.nids || 0, 'nid');
        // Alvéoles : +5% maxSpores par alvéole
        /* Le maximum de base doit toujours exister avant d'appliquer les
           alveoles. Sans lui, la ligne suivante prenait le maximum DEJA
           augmente comme base et le multipliait a nouveau - a chaque image.
           Avec dix alveoles le maximum atteignait 1e109 en quelques secondes.
           Cela ne se produit pas en jeu aujourd'hui, le serveur transmettant
           la valeur, mais un seul champ manquant suffirait. On la reconstitue
           donc a partir du maximum courant, ce qui rend le calcul idempotent. */
        if (body.baseMaxSpores === undefined || body.baseMaxSpores === null) {
            body.baseMaxSpores = Math.round(body.maxSpores / (1 + bonusBatiment(body.alveoles || 0, 'alveole')));
        }
        const _alvMax = Math.floor(body.baseMaxSpores * (1 + bonusBatiment(body.alveoles || 0, 'alveole')));
        if (body.maxSpores !== _alvMax) body.maxSpores = _alvMax;

        // Bonus système complet : +3% si toutes planètes+lunes du soleil au même owner
        let sysBonus = 1;
        const bodySun = body.type === 'planet' ? body.parent : (body.parent.parent || null);
        if (bodySun && isSystemComplete(bodySun, body.owner)) sysBonus = 1.03;

        /* Rendement maximal a mi-capacite : un astre presque vide ou plein
           produit peu. C'est la courbe de croissance. */
        const rate = Math.max(1, body.maxSpores) * TAUX_PROD
                   * (0.4 + (body.flore / 100) * 0.6) * (1 + player.stats.growth * 0.3)
                   * symBonus * nidBonus * sysBonus
                   * courbeCroissance(body.spores / Math.max(1, body.maxSpores));

        if (body.buildMode === 'parasite') {
            // Accumulation parasite : durée fixe 120s (indépendant du rate)
            if ((body.parasiteSpore || 0) < 1) {
                body.parasiteProgress = (body.parasiteProgress || 0) + dt;
                if (body.parasiteProgress >= 120) {
                    body.parasiteSpore = 1;
                    body.parasiteProgress = 0;
                    body.buildMode = 'off';
                    if (body.owner === localSlot()) addEvent('build', iconeBat('parasite', 12), `Spore parasitaire prête sur ${body.name}`, body, gameState.players[localSlot()]?.color);
                }
            } else {
                body.buildMode = 'off';
            }
        } else {
            // Répartir la production entre : jeu et multiplicité
            const multiPct = (player.multiSacrifice || 0) / 100;
            const totalSac = Math.min(multiPct, 0.5);
            const multiSac = totalSac;
            const prodPct = 1 - totalSac;

            const produced = rate * prodPct * dt;
            // Arrêt si max atteint
            if (body.spores < body.maxSpores) { body.spores += produced; gameState.gameStats.sporesProduced += produced; }

            // Accumuler multiplicité - les points pas encore places comptent
            // deja comme des paliers : pour le prix du suivant, et pour le
            // plafond de 10.
            const _atteints = player.multiTier + multiEnAttente(player);
            if (multiSac > 0 && _atteints < 10) {
                player.multiProgress += rate * multiSac * dt;
                const tierCost = getMultiTierCost(_atteints);
                if (player.multiProgress >= tierCost) {
                    player.multiProgress = 0;
                    if (player.isHuman) {
                        player._multiPending = multiEnAttente(player) + 1;
                    } else {
                        aiChooseMultiStat(player);
                    }
                }
            }

            /* La production ne depasse pas le maximum ; un trop-plein de
               charge, lui, reste et s'evapore (voir plus haut). */
            if (body.spores > body.maxSpores && body.spores - produced <= body.maxSpores) body.spores = body.maxSpores;

            /* La construction vient APRES la production, et ne l'interrompt
               plus. Tant que l'astre n'a pas de quoi payer, il continue a
               produire et le chantier attend. Auparavant la construction
               court-circuitait la production : un astre qui n'avait pas les
               spores restait fige pour toujours, puisqu'il ne pouvait plus en
               produire pour se les offrir. Il suffisait de demander un
               batiment sur un astre presque vide pour l'arreter net. */
            if (body.buildMode === 'nid' || body.buildMode === 'biome' || body.buildMode === 'alveole') {
                const _buildType = body.buildMode;
                const _buildCost = coutBatiment(body, _buildType);
                if (body.spores >= _buildCost) {
                    body.spores -= _buildCost;
                    body.buildMode = 'off';
                    if (body.owner === localSlot()) playBuildSound();
                    /* Le gain du batiment qui vient de sortir monte au-dessus
                       de l'astre. Il est relu de la courbe plutot qu'ecrit en
                       dur : sur un astre qui en a deja trois, ce sera +5 %,
                       et le joueur voit ainsi le rendement decroitre. */
                    if (body.owner === localSlot()) {
                        const _n = nbBatiment(body, _buildType);
                        const _gain = bonusProchain(_n, _buildType);
                        gameState.conquestEffects.push({
                            x: body.x, y: body.y - body.radius - 26, baseX: body.x,
                            text: '+' + pct(_gain) + '%',
                            color: BATI_TEINTES[_buildType] || '#FFFFFF',
                            age: 0, maxAge: 2.8
                        });
                    }
                    if (_buildType === 'alveole') body.baseMaxSpores = body.baseMaxSpores || body.maxSpores;
                    poserEdifice(body, _buildType, 0);
                    if (body.owner === localSlot()) {
                        const _sg = { nid: [iconeBat('nid', 12), 'Nid construit', body.nids],
                                      alveole: [iconeBat('alveole', 12), 'Alvéole construite', body.alveoles],
                                      biome: [iconeBat('biome', 12), 'Biome construit', body.biomes] }[_buildType];
                        addEvent('build', _sg[0], `${_sg[1]} sur ${body.name} (×${_sg[2]})`, body, gameState.players[localSlot()]?.color);
                    }
                }
            }
        }

        // ── Drain parasite ──
        if (body.parasite && body.owner !== null) {
            const parasite = body.parasite;
            const srcBody = parasite.sourceBody;
            // Si planète émettrice perdue → parasite disparaît
            if (!srcBody || srcBody.owner !== parasite.ownerSlot) {
                body.parasite = null;
            } else {
                const rawDrain = rate * 0.20;
                const drain = (rate >= 10 ? Math.max(1, Math.round(rawDrain)) : rawDrain) * dt;
                body.spores = Math.max(0, (body.spores || 0) - drain);
                // Envoyer vers planète source via jet auto silencieux
                parasite._accumulator = (parasite._accumulator || 0) + drain;
                if (parasite._accumulator >= 10) {
                    const dx = srcBody.x - body.x, dy = srcBody.y - body.y;
                    const len = Math.sqrt(dx*dx+dy*dy);
                    if (len > 0) {
                        gameState.jets.push({
                            owner: parasite.ownerSlot,
                            color: '#22C55E',
                            spores: parasite._accumulator,
                            sporeType: 'parasite_drain',
                            trajectory: computeTrajectory(body.x, body.y, dx/len, dy/len, 25, 300),
                            posIndex: 0, x: body.x, y: body.y, speed: 25,
                            alive: true, trail: [], sparkles: [], age: 0, selected: false,
                            source: body, _parasiteDrain: true, _targetBody: srcBody
                        });
                        parasite._accumulator = 0;
                    }
                }
            }
        }
    }
}


