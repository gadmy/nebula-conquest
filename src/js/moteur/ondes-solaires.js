/* ─────────────────────────────────────────────
   ONDES SOLAIRES
   Un systeme solaire entierement tenu se met a vivre : son etoile envoie
   toutes les cinq secondes une onde d'energie qui balaie ses planetes et ses
   lunes. Chaque astre la recoit au passage du front - il ne gagne pas ses
   spores a l'instant ou l'onde part, mais quand elle l'atteint, ce qui fait
   du systeme une vague qui s'allume de l'interieur vers l'exterieur.

   Ce que l'onde apporte depend de SENSITIVITY : cinq pour cent de la
   capacite de l'astre par point. A un point, une lune de quatre cents
   reçoit vingt spores - c'est le forfait d'origine, devenu proportionnel.
   ───────────────────────────────────────────── */
const ONDE_PERIODE = 5;
const ONDE_PAR_POINT = 0.05;
const ONDE_VITESSE = 1100;

function gainOnde(body, slot) {
    const j = gameState.players[slot];
    const sens = (j && j.stats) ? (j.stats.sensitivity || 0) : 0;
    return (body.maxSpores || 0) * ONDE_PAR_POINT * sens;
}

function majOndesSolaires(dt) {
    if (!gameState._ondesSolaires) gameState._ondesSolaires = [];

    for (let i = 0; i < gameState.suns.length; i++) {
        const soleil = gameState.suns[i];
        const planetes = soleil.planets || [];
        if (!planetes.length) { soleil._ondeT = 0; continue; }
        const proprio = planetes[0].owner;
        if (proprio === null || proprio === undefined || !isSystemComplete(soleil, proprio)) {
            soleil._ondeT = 0;
            continue;
        }
        soleil._ondeT = (soleil._ondeT || 0) + dt;
        if (soleil._ondeT < ONDE_PERIODE) continue;
        soleil._ondeT = 0;

        /* Portee : le plus lointain astre du systeme, avec de la marge. */
        let portee = soleil.radius;
        const corps = [];
        for (let k = 0; k < planetes.length; k++) {
            const pl = planetes[k];
            corps.push(pl);
            const lunes = pl.moons || [];
            for (let m = 0; m < lunes.length; m++) corps.push(lunes[m]);
        }
        for (let k = 0; k < corps.length; k++) {
            const b = corps[k];
            const d = Math.sqrt((b.x - soleil.x) * (b.x - soleil.x) + (b.y - soleil.y) * (b.y - soleil.y)) + b.radius;
            if (d > portee) portee = d;
        }
        const j = gameState.players[proprio];
        /* L'etoile s'embrase au depart : on doit voir d'ou part l'onde. */
        if (!gameState._ondes) gameState._ondes = [];
        gameState._ondes.push({ x: soleil.x, y: soleil.y, suit: soleil,
                                r0: soleil.radius * 0.9, r1: soleil.radius * 1.6,
                                age: 0, maxAge: 0.7, couleur: '255,235,180', ep: 9 });
        gameState._ondesSolaires.push({
            soleil: soleil, slot: proprio, corps: corps, touches: [],
            r: soleil.radius, portee: portee * 1.08,
            couleur: _rgbDe((j && j.color) || '#FFD27A')
        });
    }

    const os = gameState._ondesSolaires;
    for (let i = os.length - 1; i >= 0; i--) {
        const o = os[i];
        o.r += ONDE_VITESSE * dt;
        for (let k = 0; k < o.corps.length; k++) {
            if (o.touches[k]) continue;
            const b = o.corps[k];
            if (b.owner !== o.slot) { o.touches[k] = 1; continue; }
            const d = Math.sqrt((b.x - o.soleil.x) * (b.x - o.soleil.x) + (b.y - o.soleil.y) * (b.y - o.soleil.y));
            if (o.r < d) continue;
            o.touches[k] = 1;
            const gain = gainOnde(b, o.slot);
            if (gain <= 0) continue;
            ajouterSpores(b, gain);
            if (!gameState._ondes) gameState._ondes = [];
            gameState._ondes.push({ x: b.x, y: b.y, suit: b, r0: b.radius * 0.8, r1: b.radius * 2.4,
                                    age: 0, maxAge: 0.5, couleur: o.couleur, ep: 2.5 });
            if (o.slot === localSlot()) {
                gameState.conquestEffects.push({ x: b.x, y: b.y - b.radius - 12, baseX: b.x,
                                                 text: '+' + Math.round(gain) + ' \u2600',
                                                 color: '#FFD27A', age: 0, maxAge: 2 });
            }
        }
        if (o.r >= o.portee) os.splice(i, 1);
    }
}

/* Le front de l'onde : un anneau epais qui s'ouvre depuis l'etoile et
   s'amincit en s'eloignant. */
function drawOndesSolaires(ctx) {
    const os = gameState._ondesSolaires;
    if (!os || !os.length) return;
    const ep = 1 / gameState.camera.zoom;
    ctx.save();
    for (let i = 0; i < os.length; i++) {
        const o = os[i];
        const u = Math.min(1, (o.r - o.soleil.radius) / Math.max(1, o.portee - o.soleil.radius));
        const k = 1 - u;
        if (!aLEcran(o.soleil.x, o.soleil.y, o.r)) continue;
        ctx.strokeStyle = 'rgba(' + o.couleur + ',' + (k * 0.32).toFixed(3) + ')';
        ctx.lineWidth = Math.max(3, 22 * ep * k);
        ctx.beginPath();
        ctx.arc(o.soleil.x, o.soleil.y, o.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,242,205,' + (k * 0.82).toFixed(3) + ')';
        ctx.lineWidth = Math.max(1.5, 4 * ep * k);
        ctx.beginPath();
        ctx.arc(o.soleil.x, o.soleil.y, o.r, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

const POP_PROD_PERIODE = 5;

/* LES ASTRES PLEINS CRACHENT DES ETINCELLES. Un astre a sa capacite ne
   produit plus rien : chaque seconde qu'il y reste est perdue. Pour que ca se
   VOIE, il laisse echapper de petits paquets d'etincelles de la couleur de
   son proprietaire, qui jaillissent du bord, ralentissent et s'eteignent.
   Purement visuel : elles ne portent aucune spore et ne touchent rien.
   Hasard de Math.random et non de gameRandom, pour ne jamais decaler la
   simulation. Rien n'est emis hors de l'ecran, et le total est plafonne. */
const ETINCELLES_MAX = 250;

/* La couleur du joueur tiree vers le blanc : une etincelle est chaude, et un
   violet sombre sur le fond bleu ne se voyait pas. Calculee une fois par
   couleur. */
const _couleursEtincelle = {};
function couleurEtincelle(c) {
    if (_couleursEtincelle[c]) return _couleursEtincelle[c];
    let r = 255, g = 255, b = 255;
    if (/^#[0-9a-f]{6}$/i.test(c)) {
        r = parseInt(c.substr(1, 2), 16); g = parseInt(c.substr(3, 2), 16); b = parseInt(c.substr(5, 2), 16);
    }
    const m = (v) => Math.round(v + (255 - v) * 0.45).toString(16).padStart(2, '0');
    return (_couleursEtincelle[c] = '#' + m(r) + m(g) + m(b));
}

function majEtincelles(dt) {
    const liste = gameState._etincelles || (gameState._etincelles = []);

    /* EN ORBITE AUTOUR DE LEUR ASTRE. Lachees dans le vide, elles restaient
       sur place pendant que l'astre filait sur son orbite : on les voyait se
       perdre derriere lui. Elles vivent donc dans le repere de l'astre, en
       coordonnees polaires : la hauteur jaillit du sol puis se pose sur une
       orbite basse, l'angle tourne. Position recalculee a chaque image a
       partir du centre de l'astre, qui peut bouger autant qu'il veut. */
    let n = 0;
    for (let i = 0; i < liste.length; i++) {
        const e = liste[i];
        e.age += dt;
        if (e.age >= e.vie || !e.b) continue;
        const h = e.h0 + (e.h1 - e.h0) * (1 - Math.exp(-e.age * 5));
        const a = e.a0 + e.w * e.age;
        const rx = Math.cos(a) * h, ry = Math.sin(a) * h;
        e.x = e.b.x + rx;
        e.y = e.b.y + ry;
        /* La trainee suit le mouvement AUTOUR de l'astre, pas celui de
           l'astre lui-meme : sinon elle s'etirerait dans son sillage. */
        e.px = e.x - (rx - e.rx);
        e.py = e.y - (ry - e.ry);
        e.rx = rx; e.ry = ry;
        liste[n++] = e;
    }
    liste.length = n;

    // Les astres pleins a l'ecran, pour le clignotement vu de loin.
    const pleins = gameState._astresPleins || (gameState._astresPleins = []);
    pleins.length = 0;
    if (gameState.phase !== 'game') return;
    const bodies = gameState.allBodies || [];
    const bas = gameState.lod === 0;
    for (let bi = 0; bi < bodies.length; bi++) {
        const b = bodies[bi];
        if (b.type === 'sun' || b.owner === null || b.owner === undefined || b.owner < 0) continue;
        if (!(b.maxSpores > 0) || b.spores < b.maxSpores * PART_SATUREE) { b._etinT = 0; continue; }
        if (!aLEcran(b.x, b.y, b.radius * 3)) continue;
        pleins.push(b);
        /* Trop petit a l'ecran, c'est le clignotement qui prend le relais :
           des etincelles de deux pixels n'y ajouteraient rien, et une vue
           d'ensemble en compterait des centaines. */
        if (b.radius * gameState.camera.zoom < 15) continue;
        /* Premier paquet sans attendre : le signal doit tomber des que
           l'astre est plein, pas une seconde apres. */
        b._etinT = (b._etinT || 0) - dt;
        if (b._etinT > 0) continue;
        b._etinT = (bas ? 0.8 : 0.3) + Math.random() * 0.35;
        if (liste.length >= ETINCELLES_MAX) continue;

        const j = gameState.players[b.owner];
        const c = couleurEtincelle((j && j.color) || '#FFFFFF');
        const nb = bas ? 3 : 4 + Math.floor(Math.random() * 3);
        const cap = Math.random() * Math.PI * 2;   // le paquet part d'un cote
        /* Tout un paquet tourne dans le meme sens, sur des orbites un peu
           differentes : il s'etire en arc au lieu de rester en boule. */
        const sens = Math.random() < 0.5 ? -1 : 1;
        for (let k = 0; k < nb && liste.length < ETINCELLES_MAX; k++) {
            const a0 = cap + (Math.random() - 0.5) * 0.9;
            const h0 = b.radius * 0.95;
            liste.push({
                b: b, a0: a0, h0: h0,
                h1: b.radius * (1.2 + Math.random() * 0.45),
                w: sens * (1.2 + Math.random() * 1.2),
                rx: Math.cos(a0) * h0, ry: Math.sin(a0) * h0,
                x: b.x + Math.cos(a0) * h0, y: b.y + Math.sin(a0) * h0,
                px: b.x + Math.cos(a0) * h0, py: b.y + Math.sin(a0) * h0,
                age: 0, vie: 1.1 + Math.random() * 0.9,
                t: b.radius * (0.03 + Math.random() * 0.02),
                c: c
            });
        }
    }
}

/* VU DE LOIN, LES ASTRES PLEINS CLIGNOTENT. Quand un astre ne fait plus que
   quelques pixels, ses etincelles se perdent. Il pulse alors doucement d'une
   lueur de la couleur de son proprietaire - tous ensemble, pour qu'on les
   repere d'un coup d'oeil. L'effet s'installe progressivement en
   dezoomant : rien au-dessus de 30 px de rayon a l'ecran, plein en dessous
   de 15. */
function drawClignotementPleins(ctx, z) {
    const pleins = gameState._astresPleins;
    if (!pleins || !pleins.length) return;
    const puls = 0.5 + 0.5 * Math.sin(gameState.time * 4);
    const op = ctx.globalCompositeOperation;
    const a0 = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < pleins.length; i++) {
        const b = pleins[i];
        const rEc = b.radius * z;                 // rayon a l'ecran, en pixels
        if (rEc >= 30) continue;
        const k = Math.min(1, (30 - rEc) / 15);
        const j = gameState.players[b.owner];
        // Lueur coloree sans coeur blanc : l'astre reste lisible dessous.
        const s = haloSprite(couleurEtincelle((j && j.color) || '#FFFFFF'), 'brume');
        const R = Math.max(b.radius * 1.8, 7 / z);
        ctx.globalAlpha = k * (0.08 + 0.42 * puls);
        ctx.drawImage(s, b.x - R, b.y - R, R * 2, R * 2);
    }
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = a0;
}

function drawEtincelles(ctx) {
    const z = gameState.camera.zoom;
    drawClignotementPleins(ctx, z);
    const liste = gameState._etincelles;
    if (!liste || !liste.length) return;
    const min = 2 / z;            // jamais plus petites que deux pixels
    const cam = gameState.camera;
    const hw = gameState.width / 2 / z + 20, hh = gameState.height / 2 / z + 20;
    const op = ctx.globalCompositeOperation;
    const a0 = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < liste.length; i++) {
        const e = liste[i];
        // Hors de l'ecran : nees d'un astre visible, elles ont pu en sortir.
        if (e.x < cam.x - hw || e.x > cam.x + hw || e.y < cam.y - hh || e.y > cam.y + hh) continue;
        const f = 1 - e.age / e.vie;
        const t = Math.max(min, e.t * (0.4 + 0.6 * f));
        ctx.globalAlpha = f;
        /* Vue de loin, une etincelle ne fait que deux ou trois pixels :
           trainee et halo ne s'y verraient pas. Un simple carre suffit, pour
           une fraction du prix. */
        if (t * z < 3) {
            ctx.fillStyle = e.c;
            ctx.fillRect(e.x - t, e.y - t, t * 2, t * 2);
            continue;
        }
        /* Trainee : deux points de plus en plus petits en arriere, le long
           de la vitesse - on lit le jaillissement. Des sprites plutot qu'un
           trait : un trait arrondi coutait deux fois plus cher a peindre. */
        const s = haloSprite(e.c, 'noyau');
        const dx = (e.x - e.px) * 2, dy = (e.y - e.py) * 2;
        ctx.drawImage(s, e.x - dx * 2 - t * 0.8, e.y - dy * 2 - t * 0.8, t * 1.6, t * 1.6);
        ctx.drawImage(s, e.x - dx - t * 1.1, e.y - dy - t * 1.1, t * 2.2, t * 2.2);
        // Tete : un point chaud, blanc au coeur.
        ctx.drawImage(s, e.x - t * 1.6, e.y - t * 1.6, t * 3.2, t * 3.2);
    }
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = a0;
}

function majPopProduction(dt) {
    const astre = (typeof followingBody !== 'undefined' && followingBody)
                ? followingBody : gameState.selectedBody;
    if (!astre || astre.owner !== localSlot()) {
        gameState._popProdAstre = null;
        return;
    }
    if (gameState._popProdAstre !== astre) {
        gameState._popProdAstre = astre;
        gameState._popProdTimer = 0;
        astre._prodCumul = 0;
        return;
    }
    /* Rien ne rentre quand la reserve est pleine. */
    if (astre.spores < astre.maxSpores) {
        astre._prodCumul = (astre._prodCumul || 0) + debitAstre(astre) * dt;
    }
    gameState._popProdTimer = (gameState._popProdTimer || 0) + dt;
    if (gameState._popProdTimer < POP_PROD_PERIODE) return;
    gameState._popProdTimer = 0;
    const gagne = Math.floor(astre._prodCumul || 0);
    astre._prodCumul = 0;
    if (gagne <= 0) return;
    gameState.conquestEffects.push({
        x: astre.x, y: astre.y - astre.radius - 30, baseX: astre.x,
        text: '+' + gagne, color: '#7DD3FC', age: 0, maxAge: 2.6
    });
}

/* Le debit courant, juste au-dessus de l'astre selectionne. */
function drawDebitAstre(ctx) {
    const astre = gameState._popProdAstre;
    if (!astre || gameState.camera.zoom < 0.3) return;
    const z = gameState.camera.zoom;
    const px = _taillePx(z, 13, astre.radius * z * 0.7, 12, 26);
    const monde = px / z;
    ctx.textAlign = 'center';
    ctx.font = 'bold ' + monde + 'px Orbitron';
    const d = (astre.spores < astre.maxSpores) ? debitAstre(astre) : 0;
    /* Le rendement du moment, en pour cent de ce que l'astre donnerait a
       mi-capacite : c'est la lecture de cette courbe qui fait jouer juste. */
    const rend = Math.round(courbeCroissance(astre.spores / Math.max(1, astre.maxSpores)) * 100);
    /* Au-dessus de l'etiquette du pseudo, qui occupe deja le bord haut de
       l'astre : sans ce decalage les deux se superposent. */
    const etiquette = Math.max(9 / z, Math.min(16 / z, astre.radius * 0.45));
    const haut = astre.y - astre.radius - etiquette * 1.6 - monde * 0.4;
    _texteLisible(ctx, (d > 0 ? d.toFixed(1) : '0') + '/s',
                  astre.x, haut, d > 0 ? '#7DD3FC' : '#94A3B8', Math.max(2, monde * 0.22));
    ctx.font = 'bold ' + (monde * 0.78) + 'px Orbitron';
    const teinte = rend >= 85 ? '#4ADE80' : rend >= 50 ? '#FACC15' : '#F87171';
    _texteLisible(ctx, '\u25D1 ' + rend + '%', astre.x, haut - monde * 0.95,
                  teinte, Math.max(2, monde * 0.2));
}

function updateConquestEffects(dt) {
    // Textes flottants (style MMO : empilement sans superposition)
    for (let i = gameState.conquestEffects.length - 1; i >= 0; i--) {
        const e = gameState.conquestEffects[i];
        e.age += dt;

        // Vitesse de montée : rapide au début, puis ralentit
        if (e.age < 0.3) {
            e.y -= 80 * dt; // burst initial rapide
        } else {
            e.y -= 12 * dt; // lent ensuite
        }

        if (e.age >= e.maxAge) gameState.conquestEffects.splice(i, 1);
    }

    // Mise à jour particules (flag dead, nettoyage groupé toutes les 60 frames)
    for (let i = 0; i < gameState.particles.length; i++) {
        const p = gameState.particles[i];
        if (p.dead) continue;
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.92;
        p.vy *= 0.92;
        if (p.life >= p.maxLife) p.dead = true;
    }
    if (gameState._hudCounter % 60 === 0) {
        gameState.particles = gameState.particles.filter(p => !p.dead);
    }

    // Pousser les anciens vers le haut quand un nouveau apparaît au même endroit
    const effects = gameState.conquestEffects;
    const spacing = 18;
    for (let i = effects.length - 1; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            // Même zone horizontale ?
            if (Math.abs(effects[i].baseX - effects[j].baseX) < 30) {
                const gap = effects[i].y - effects[j].y;
                if (gap > -spacing) {
                    effects[j].y = effects[i].y - spacing;
                }
            }
        }
    }
    // Éclosions
    for (let i = gameState.bloomEffects.length - 1; i >= 0; i--) {
        const e = gameState.bloomEffects[i];
        e.age += dt;
        if (e.age >= e.maxAge) gameState.bloomEffects.splice(i, 1);
    }
}

function drawConquestEffects(ctx) {
    const z = gameState.camera.zoom;
    const scale = Math.max(1, 1 / z);

    // Particules
    for (const p of gameState.particles) {
        const alpha = 1 - (p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Éclosions (cercle expansif)
    for (const e of gameState.bloomEffects) {
        const progress = e.age / e.maxAge;

        if (e.ring) {
            // Anneau conquête — fin et rapide
            const r = e.body.radius * (1.1 + progress * 2.5);
            const alpha = (1 - progress) * 0.8;
            ctx.strokeStyle = e.color + hexAlpha(alpha);
            ctx.lineWidth = (3 - progress * 2) * scale;
            ctx.beginPath();
            ctx.arc(e.body.x, e.body.y, r, 0, Math.PI * 2);
            ctx.stroke();
            // Deuxième anneau décalé
            const r2 = e.body.radius * (1.05 + progress * 1.5);
            ctx.strokeStyle = e.color + hexAlpha(alpha * 0.4);
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.arc(e.body.x, e.body.y, r2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Bloom classique
            const r = e.body.radius * (1 + progress * 3);
            const alpha = (1 - progress) * 0.4;
            ctx.strokeStyle = e.color + hexAlpha(alpha);
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.arc(e.body.x, e.body.y, r, 0, Math.PI * 2);
            ctx.stroke();

            // Flash interne
            if (progress < 0.3) {
                const flashAlpha = (1 - progress / 0.3) * 0.3;
                const gFlash = ctx.createRadialGradient(e.body.x, e.body.y, 0, e.body.x, e.body.y, e.body.radius);
                gFlash.addColorStop(0, e.color + hexAlpha(flashAlpha));
                gFlash.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gFlash;
                ctx.beginPath();
                ctx.arc(e.body.x, e.body.y, e.body.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Textes flottants
    ctx.textAlign = 'center';
    for (const e of gameState.conquestEffects) {
        const prog = e.age / e.maxAge;
        const alpha = 1 - prog;
        /* une bouffee au depart : le nombre saute puis se pose */
        const bouffee = prog < 0.18 ? (1 + (1 - prog / 0.18) * 0.45) : 1;
        const px = _taillePx(z, 19, 0, 16, 44) * bouffee * (e.petit ? 0.9 : 1);
        const monde = px / z;
        ctx.font = 'bold ' + monde + 'px Orbitron';
        ctx.globalAlpha = alpha;
        _texteLisible(ctx, e.text, e.x, e.y, e.color, Math.max(2.5, monde * 0.24));
        ctx.globalAlpha = 1;
    }
}

/* Le canvas est mis a l'echelle du zoom : une police donnee en unites monde
   change donc de taille a l'ecran. Ces deux fonctions raisonnent en PIXELS
   D'ECRAN, ce qui est la seule mesure qui compte pour la lisibilite, puis
   reconvertissent.

   La taille grandit avec le zoom, et avec la taille de l'astre : un nombre
   colle sous une geante peut etre gros, celui d'une petite lune non. Les
   bornes empechent l'illisible en dezoom et le demesure en zoom. */
function _taillePx(z, base, rayonEcran, mini, maxi) {
    let px = base * Math.sqrt(z);
    const parAstre = rayonEcran * 0.22;
    if (parAstre > px) px = parAstre;
    if (px < mini) px = mini;
    if (px > maxi) px = maxi;
    return px;
}

/* Un liere sombre derriere le texte : sans lui un nombre clair pose sur une
   planete claire disparait. */
function _texteLisible(ctx, txt, x, y, remplissage, epaisseur) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = epaisseur;
    ctx.strokeStyle = 'rgba(6,6,20,0.85)';
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = remplissage;
    ctx.fillText(txt, x, y);
}

/* Un genre de batiment par morceau : son icone (la meme que partout, voir
   iconeBat) puis son nombre, dans sa couleur. */
const BATI_SIGNES = [
    { cle: 'alveoles', genre: 'alveole', couleur: BATI_TEINTES.alveole },
    { cle: 'nids',     genre: 'nid',     couleur: BATI_TEINTES.nid },
    { cle: 'biomes',   genre: 'biome',   couleur: BATI_TEINTES.biome },
];

/* LES CHIFFRES POSES SOUS LES ASTRES. Plusieurs couleurs se cotoient la -
   le defenseur et chacun de ses assaillants - et une couleur ne dit pas un
   nom. On enregistre donc, au trace, le rectangle que chaque nombre occupe
   A L'ECRAN, pour pouvoir le survoler ensuite. La liste est refaite a chaque
   image : les astres orbitent, leurs chiffres avec eux. */
let _chiffresSpores = [];
let _enMesureRendu = false;
/* Vrai quand l'infobulle affichee est la NOTRE : le menu radial se sert du
   meme cadre, et on n'a pas a effacer la sienne. */
let _bulleChiffre = false;

function _noterChiffre(cx, cy, larg, haut, info) {
    if (_enMesureRendu) return;          /* le detail du rendu redessine tout */
    const cam = gameState.camera, z = cam.zoom;
    const sx = (cx - cam.x) * z + gameState.width / 2;
    const sy = (cy - cam.y) * z + gameState.height / 2;
    const w = Math.max(14, larg * z), h = Math.max(10, haut * z);
    _chiffresSpores.push({ x: sx - w / 2, y: sy - h, w: w, h: h * 1.3, info: info });
}

/* Ce qu'il y a sous le curseur, le dernier trace l'emportant : c'est celui
   qui est dessus. */
/* Ce que dit l'infobulle : un nom, ce que ce joueur fait la, et combien. */
function libelleChiffre(c) {
    const j = gameState.players[c.info.slot];
    const nom = (j && j.name) || 'Joueur ' + ((c.info.slot | 0) + 1);
    const tag = (j && j.guildTag) ? ' [' + j.guildTag + ']' : '';
    const quoi = c.info.role === 'assaut' ? 'assaut sur ' : 'tient ';
    return nom + tag + ' \u2014 ' + quoi + c.info.astre + ' \u00b7 ' + _sp(c.info.valeur) + ' spores';
}

function chiffreSous(sx, sy) {
    for (let i = _chiffresSpores.length - 1; i >= 0; i--) {
        const c = _chiffresSpores[i];
        if (sx >= c.x && sx <= c.x + c.w && sy >= c.y && sy <= c.y + c.h) return c;
    }
    return null;
}

function drawSporeCountOnBodies(ctx) {
    const z = gameState.camera.zoom;
    const bodies = gameState.allBodies;
    ctx.textAlign = 'center';
    for (const body of bodies) {
        if (z < 0.3) continue;          /* en plein dezoom, rien */
        if (body.owner === null || body.owner === undefined) continue;
        const col = gameState.players[body.owner]?.color || '#FFF';
        const px = _taillePx(z, 15, body.radius * z, 13, 34);
        const monde = px / z;
        let ligne = body.y + body.radius + monde * 1.05;

        if (body.spores >= 1) {
            ctx.font = 'bold ' + monde + 'px Orbitron';
            /* En surcharge (charge d'un tir) : un chiffre dore, qui dit ce
               qui s'evaporera. */
            const surcharge = body.spores > body.maxSpores + 0.5;
            const txt = _sp(body.spores) + (surcharge ? ' ⚡' : '');
            _texteLisible(ctx, txt, body.x, ligne, surcharge ? '#FFD27A' : col, Math.max(2, monde * 0.22));
            _noterChiffre(body.x, ligne, ctx.measureText(txt).width, monde,
                          { slot: body.owner, valeur: body.spores, astre: body.name, role: 'tient' });
            ligne += monde * 1.05;
        }

        /* Les batiments, juste en dessous. On mesure d'abord la largeur totale
           pour centrer l'ensemble sous l'astre, puis on ecrit chaque genre
           dans sa couleur - un seul textAlign ne suffirait pas, chaque morceau
           ayant sa teinte. */
        const mb = monde * 0.82;
        ctx.font = 'bold ' + mb + 'px Orbitron';
        let largeur = 0;
        const morceaux = [];
        for (let i = 0; i < BATI_SIGNES.length; i++) {
            const d = BATI_SIGNES[i];
            const n = body[d.cle] || 0;
            if (n <= 0) continue;
            const txt = String(n);
            const w = mb * 1.15 + ctx.measureText(txt).width;
            morceaux.push({ txt: txt, genre: d.genre, couleur: d.couleur, w: w });
            largeur += w + mb * 0.45;
        }
        if (!morceaux.length) continue;
        largeur -= mb * 0.45;
        ctx.textAlign = 'left';
        let x = body.x - largeur / 2;
        for (let i = 0; i < morceaux.length; i++) {
            dessinerIconeBat(ctx, morceaux[i].genre, x + mb * 0.5, ligne - mb * 0.36, mb * 1.1);
            _texteLisible(ctx, morceaux[i].txt, x + mb * 1.15, ligne, morceaux[i].couleur, Math.max(2, mb * 0.24));
            x += morceaux[i].w + mb * 0.45;
        }
        ctx.textAlign = 'center';
    }
}


