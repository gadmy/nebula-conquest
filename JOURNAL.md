# Journal de Nebula Conquest

Le journal des versions (ce qui a été fait, version par version) et la liste « À FAIRE ». Il était autrefois en tête de `index.html` ; il vit ici depuis le découpage du jeu en fichiers (v9.7.9).

La version en cours est rappelée dans le bloc « SUIVI DE PROJET » en tête de `src/page.html`. Chaque travail ajoute une ligne à la version en cours, dans le même style que les précédentes.

```text
   NEBULA CONQUEST — JAVASCRIPT
   Version: 1.1.0

   ══════════════════════════════════════════════════════════════════════

    METHODE DE TRAVAIL
    - pour chaque travail demandé par l'utilisateur :
    - Claude établie un plan en plusieurs (si besoins) "cherche + ligne" et "remplace"
    - Claude donne le premier "cherche + la ligne" et "remplace par"
    - l'utilisateur fait le cherche et remplace sur le fichier.
    - L'utilisateur dit ok à Claude.
    - Claude renvoie le deuxième cherche et remplace qui concerne ce même travail.
    - Ainsi de suite jusqu'à ce que le travail paticulier soit fini.
	- Qd le travail est fini, Claude écrit une nouvelle ligne dans le log en regardant toujours le numéro
	de version contenue dans le fichier ici :  <div class="subtitle">CONQUÊTE SPATIALE EN TEMPS RÉEL (vx.x.x) </div>
    - Puis l'utilisateur donne un nouveau travail à Claude.

	- Jamais claude n'écrit ou ne modifie un fichier entier de lui même avec pithon ou autre, sauf si l'utilisateur le demande.
	- Dès que Claude sens que sa mémoire sature, il fait un résumé de ce qui a été fait, de ce qu'on veut faire pour une nouvelle conversation.


 DEV LOG — Nebula Conquest
══════════════════════════════════════════════════════════════════════

── PHASE 1 : Prototype solo (24–25 fév. 2026) ────────────────────────

v0.1.0 | 2026-02-24 | Squelette & Canvas
  - Structure HTML/CSS single file, canvas plein écran, fond étoilé
  - Boucle de jeu (requestAnimationFrame + delta time)
  - Caméra : zoom molette, panoramique clic droit + drag
  - Objet gameState centralisé, compteur FPS

v0.2.0 | 2026-02-24 | Univers & Corps célestes
  - Génération procédurale : trou noir, soleils, planètes, lunes
  - Orbites elliptiques animées, textures canvas (cratères, halos)
  - Paramètres : flore, faune, symbiose

v0.3.0 | 2026-02-24 | Jets de spores
  - Lancer de jet via clic droit drag, trajectoire courbée (gravité)
  - Calcul de trajectoire avec attraction trou noir + soleils
  - Conquête : combat de spores, changement de propriétaire

v0.4.0 | 2026-02-25 | IA & Gameplay
  - IA avec 3 niveaux (easy/normal/brutal), aiTimer, prédiction orbite
  - Génération de spores selon flore, bonus symbiose
  - Sélection planète active, panneau info, journal d'événements

v0.5.0 | 2026-02-25 | Polish solo
  - Effets visuels : impacts, conquête, textes flottants
  - Minimap, score, timer, écran fin de partie
  - Astéroïdes (dark/red/green) avec effets sur jets

── PHASE 2 : Multijoueur (mars 2026) ────────────────────────────────

v6.x-v9.x | 2026-03 | Refonte multijoueur → simulation autoritaire serveur
  - Migration vers architecture serveur-autoritaire (gameLoop.js sur Railway)
  - Clients pure display/input, snapshots 100ms
  - Modes : SOLO vs IA, MULTI matchmaking, LOCAL invitation
  - Système de tournoi 32 joueurs (tournamentManager.js)
  - Auth Supabase, profils, ELO
  - Fix cascadants : CORS, room prolifération, sync spawn, parasite, multiplicité

v9.4 | 2026-04-02 | Refonte panneau Mes Astres
  - Nouveau panneau latéral gauche avec groupes par système solaire
  - Barre de construction par système, indicateur symbiose
  - Suivi de corps (caméra suit la planète sélectionnée)
  - Indicateur système complet (+3%)

v9.5.4 | 2026-04-06 | Alignement solo/multi
     - 🛡️ INVINCIBLE : effet visuel + event journal ajoutés en solo (était silencieux)
     - multiProgress : reset à 0 à chaque palier (au lieu de soustraire le coût)
     - Spores au-dessus du max : Math.min sec au lieu du lerp doux
     - checkJetNeutralization : ajouté dans gameLoop.js (serveur) + fix récursion infinie
     - Collision source : solo ignore la source 0.5s (comme le serveur, au lieu de toujours)
     - Drain parasite : arrondi aligné sur le serveur (Math.round si rate >= 10)
     - Logique perte planète mère : unifiée solo/serveur (direct via isMotherPlanet, sans dictionnaire)
     - Suppression ⚠️ panneau latéral droit (résolu)

v9.5.5 | 2026-04-06 | Nettoyage code mort
     - Suppression _snapPanel + PANEL_IDS (bug latent ReferenceError)
     - Suppression debounceSavePanels / loadPanelConfig / savePanelConfig (panneaux draggables supprimés)
     - Suppression stubs inutilisés : _tradeOpen, _diplomacyOpen, _triggerNidification, updateTradeOrbs, drawTradeOrbs, drawFloatingBubbles
     - Suppression labo de spores désactivé : SPORE_LAB_DEFAULT, _sporeLabRender, _slToggleActive, _slAdj, _sporeLabSave, _applyActiveSpore_UNUSED, _checkSporeReady_UNUSED
     - Guildes et leaderboard conservés (code désactivé, réactivation possible)
     - 142 lignes supprimées au total

v9.5.6 | 2026-04-09 | Tournoi 32 joueurs — câblage complet
     - tournamentManager.js : _buildBracket() retourne les matchs pour création des rooms
     - roomManager.js : createTournamentRoom() ajouté
     - server.js : lancement auto des 16 rooms + countdown 10s après 32 inscrits
     - Client : countdown affiché, lancement automatique du match (fadeTransition)
     - Client : generateTournamentUniverse() + TOURNAMENT_POOLS (5 configs par round)
     - Client : _renderBracket() refondu — affiche bracket réel multi-tours, gagnants en vert
     - Client : _refreshTournamentUI() — affiche le round courant, pas juste la liste d'attente
     - Client : bouton "Voir le bracket" en fin de match tournoi → retour à l'écran
     - Client : setPhase('tournament') émet tournament_state pour rafraîchir depuis le serveur

v9.5.7 | 2026-04-09 | Tournoi — cartes fixes par round
     - TOURNAMENT_MAPS : structure cycle1/cycle2 pour sets de cartes
     - Round 1 cycle1 : carte "Sigisnis-Lyrirnis" intégrée (3 systèmes, 2×~400 flore + pivot 94)
     - Rounds 2-5 cycle1 : à définir (null)
     - getTournamentMap(round) : retourne la carte du round courant
     - generateTournamentUniverse() : clone la map, reconstruit allBodies, injecte les 2 joueurs
     - _startTournamentMatch() : utilise getTournamentMap au lieu de generateUniverse aléatoire

v9.5.8 | 2026-04-09 | Tournoi — Cycle 1 complet (5 cartes)
     - Round 1 : Sigisnis-Lyrirnis (3 systèmes, ~400 flore chacun + pivot 94)
     - Round 2 : Lyrith-Nebipha (5 systèmes, 2×285 + 2×500 + pivot 450)
     - Round 3 : Celanlux-Velarbus (3 systèmes, ~700 flore chacun)
     - Round 4 : Draarlux-Xorirnis (5 systèmes, 4×500 + pivot 65)
     - Round 5 : Pyxaxmir-Omielpha (6 systèmes, carte épique finale)

v9.5.9 | 2026-04-09 | Fix jets — sourceName manquant
     - launchJet solo : ajout sourceName sur le jet principal (bug jet retournait sur source)
     - Jet mimicry (astéroïde vert → lunes) : ajout sourceName
     - Jet éclatement (astéroïde vert × 5) : propagation sourceName du jet parent

v9.6.0 | 2026-04-09 | Panneau Mes Astres — sélection multiple
     - Clic gauche : sélection unique + caméra centrée (comportement inchangé)
     - Clic droit : toggle sélection multiple (sans désélectionner les autres)
     - Double clic droit sur planète : sélectionne toutes ses lunes
     - Double clic droit sur lune : sélectionne lune + planète mère
     - Boutons construction : agissent uniquement sur la sélection active
     - Si aucune sélection : message d'avertissement ⚠
     - Sélection persistante entre les refreshs du panneau

v9.6.3 | 2026-04-09 | Mode Compétition — menu + 1vs1 ranked
     - Nouveau menu Compétition (remplace bouton Tournoi direct)
     - Écran ranked 1vs1 : adversaire aléatoire ou invitation par pseudo
     - 2 manches gagnantes (3 matchs max) sur cartes aléatoires des cycles
     - Écran score entre les manches avec bouton "Manche suivante"
     - server.js : ranked_queue, ranked_invite, ranked_result câblés
     - roomManager.js : joinRankedQueue, leaveRankedQueue, pickRankedMaps
     - Tournoi 32j déplacé dans le menu Compétition (inchangé)

v9.7.1 | 2026-04-26 | Mode Compétition — 1vs1 ranked fonctionnel
     - Fix : tous les sockets rejoignent la room avant game_start (server.js)
     - Fix : listener game_start enregistré dès ranked_matched (pas dans _startRankedManche)
     - Fix : isHost défini correctement pour le ranked
     - Fix : _pendingRoomId + _serverUniverse transmis pour que finishStartGame envoie l'univers
     - Fix : setPhase masque competitionScreen et rankedScreen
     - Fix : connectSocket() appelé explicitement dans setPhase('ranked')
     - Suppression console.log debug ranked (3 lignes)
     - Suppression listener btnTournament orphelin (ancien bouton titre)
     - Suppression _leftRoom (déclaré mais jamais lu)
     - Suppression _rankedMatchId (assigné mais jamais utilisé)

v9.7.2 | 2026-04-26 | Anti-triche
     - Rate limiting jets : max 5/seconde par joueur (server.js)
     - Validation propriété planète source avant jet (gameLoop.js)
     - ranked_result supprimé côté client — serveur détermine le gagnant via game_over
     - ranked_manche_result émis par le serveur (gameLoop.js) pour domination + last_standing
     - Anti-déconnexion volontaire : 3 décos en ranked → cooldown 5 minutes
     - Numéro de manche stocké côté serveur et transmis au GameLoop

v9.7.3 | 2026-09-23 | Performance du rendu
     - Fond spatial : le degrade (60000 unites) et les tuiles d'etoiles (8000)
       sont des canvas de 2048 px agrandis de 10 a 30 fois. Le filtrage
       bilineaire coutait quatre lectures par pixel d'ecran, sur tout l'ecran,
       a chaque image : drawBackground pesait a lui seul ~50 % du rendu.
       Dessin sans lissage, etat d'origine rendu a l'appelant.
     - Source du degrade floutee une fois a la generation : sans cela le
       tramage, invisible a l'echelle 1, devenait un quadrillage une fois
       agrandi. Grain local mesure : 0,306 avant, 0,009 apres.
     - Tuiles d'etoiles : les bornes utilisaient 5000 / zoom en dur (un ecran
       suppose de 10000 px) et couvraient 25 fois trop de surface. Elles
       suivent maintenant la taille reelle de la fenetre.
     - Halos des jets et lumiere directionnelle des planetes : degrades
       radiaux mis en cache dans des sprites, poses au drawImage avec
       modulation du globalAlpha (equivalent exact, 0 pixel d'ecart).
     - Audio : _playBuffer et playBuildSound ne debranchaient jamais leur
       GainNode. Chaque son joue laissait un noeud permanent sur le master.
       300 sons = 300 noeuds ; il n'en reste aucun.
     - Mesures : image complete 13,4 / 15,0 / 14,4 ms -> 4,8 / 5,6 / 4,1 ms
       aux zooms 0,3 / 0,6 / 1. Constate en jeu : 50 FPS stables apres
       10 minutes, des centaines de planetes, 25 IA et 25 vaisseaux ennemis.
     - Recherche de fuite : aucune trouvee hors l'audio. Sur 2 min 30 en
       reglages maximum, jets / particules / effets / impacts reviennent tous
       a zero, eventLog plafonne a 100, le nombre de canvas ne bouge pas et le
       tas JS reste a 9,5 Mo. La degradation ressentie venait du plafond trop
       bas, pas d'une accumulation.
     - Securite (hors rendu) : RLS activee sur les 8 tables long_*, trois
       fonctions SECURITY DEFINER pour eviter la recursion, long_mmr en
       lecture seule cote client, search_path fige sur increment_bot_votes,
       EXECUTE revoque a anon, 12 index de cles etrangeres.

v9.7.4 | 2026-09-23 | Bataille de surface, zones, production, livre des regles
     ── GAMEPLAY ──
     - UN SEUL TYPE DE SPORE. Les spores d'attaque et de defense (modes Ruche
       et Mare) disparaissent, ainsi que la nidification et la planete mere.
       Restent les spores et le parasite.
     - TERRITOIRES. Une planete dont toutes les lunes sont tenues forme un
       territoire ; un soleil entierement tenu en forme un plus grand, qui
       remplace les precedents et inclut l'etoile. La frontiere est
       l'enveloppe tendue des astres, tracee en courbes. Deux frontieres d'un
       meme joueur qui se croisent n'en font plus qu'une - la fusion se
       decide a chaque image, les astres orbitant.
     - UNE TETE DE PONT NE CASSE PLUS UN GROUPEMENT : un astre envahi a moins
       de moitie compte toujours comme tenu. Au-dela, il en sort.
     - ONDES SOLAIRES. Un systeme entierement tenu s'embrase toutes les cinq
       secondes et envoie une onde qui balaie ses astres. Chacun la recoit au
       PASSAGE DU FRONT, pas au depart : le systeme s'allume de l'interieur
       vers l'exterieur.
     - SENSITIVITY, quatrieme voie d'evolution : elle regle ce que l'onde
       apporte, cinq pour cent de la capacite de l'astre par point.
     - TIR GROUPE. Pendant la visee, c'est l'astre du groupe le plus proche de
       la cible QUI VOIT LA CIBLE qui tirera ; les autres lui envoient leurs
       spores par paquets de 100 le long d'arcs lumineux. Changer de cible
       remet le chargement a zero. On ne tire pas a travers une etoile ni un
       trou noir : quand aucun astre n'a la vue, le trait passe au rouge au
       lieu de laisser croire la cible invulnerable - c'etait la vraie cause
       des "planetes inattaquables", l'impact n'ayant jamais resiste.
     - CONSTRUCTION IMMEDIATE, refusee sur-le-champ avec une secousse si
       l'astre ne peut pas payer. Rendements decroissants par genre : 20, 15,
       10 puis 5 % (le nid une fois et demie plus fort), et a partir du
       quatrieme un cout majore de 10 % a chaque fois.
     - LES BATIMENTS SONT POSES SUR LE SOL. Chacun occupe une case de la
       surface. Quand la frontiere passe dessus il change de mains avec le
       terrain : la conquete ne detruit plus rien, elle recupere - le reglage
       Detruire / Conserver disparait. Seuls comptent les nids qu'on tient,
       et les biomes qui defendent sont ceux que l'assaillant ne tient pas.
       On batit aussi sur une simple tete de pont, paye sur place.

     ── BATAILLE DE SURFACE ──
     - Une conquete ne se joue plus en un choc. Les spores qui touchent un
       astre y prennent pied sur UNE case, du cote d'ou vient le tir, et
       s'etalent sur le disque. Le serveur livre la meme bataille et n'envoie
       que des resumes de zones : le client peint la tache.
     - ON ACHETE LE SOL. La planete vaut sa capacite en spores, donc une case
       coute cette capacite divisee par le nombre de cases. Attaquer avec X
       spores rapporte X cases, puis le front s'arrete net. Il n'y a donc plus
       besoin d'etre le plus fort pour attaquer. Personne ne repousse tout
       seul : il faut relancer. Le sol vierge se prend a 15 % du prix -
       coloniser n'est pas conquerir. Ce modele remplace un duel de pressions
       qui avait resiste a cinq equilibrages : l'usure absolue balayait le
       plus petit stock, l'usure proportionnelle figeait le rapport a jamais,
       et la pression ramenee aux cases faisait tenir cinq spores sur trois
       cases contre cinq cents.
     - LE TERRAIN CONQUIS RESTE. Une attaque qui s'essouffle ne s'evapore
       plus : l'assaillant garde ce qu'il a pris et continue d'y produire.
     - LE FRONT S'ENDORT quand plus personne n'a de quoi pousser ; le partage
       tient jusqu'au prochain debarquement.
     - LE FRONT AVANCE PAR LOBES : huit voisins au lieu de quatre - a quatre
       une tache pousse en croix et finit carree - et un grain du sol tire une
       fois par bataille puis lisse, qui fait ceder certains endroits plus
       vite que d'autres.
     - LA FRONTIERE SE DESSINE. Grille de 32 cases de cote, chaque camp avec
       son propre lisere : a une couture on voit les deux. Le bord qui donne
       sur un autre camp est net, celui qui donne sur le vide reste discret.
       Le sol que personne ne tient a aussi sa frontiere, en gris.
     - CHAQUE TIR OUVRE SON PROPRE FRONT la ou il touche : deux attaques sur
       la meme planete font deux taches. Les spores ne renforcent une tache
       que si le tir retombe sur du terrain deja tenu.
     - TIR DE SURFACE. Un double-clic plonge sur l'astre et l'on vise sa
       surface : le tir part du bout de terrain qu'on y tient le plus proche
       du curseur et suit une cloche deviee vers le centre - plus on vise
       loin, plus il faut corriger. Il passe au-dessus du disque, dans
       l'atmosphere, et seul le point de chute revient sur la planete. On y
       reste tant que l'astre garde 70 pixels de rayon a l'ecran : une geante
       se bombarde de loin, une lune demande qu'on s'approche.
     - LA TOUCHE R RIPOSTE. Elle engage, sur chaque astre ou plusieurs camps
       se partagent le sol et ou l'on tient une zone d'au moins dix cases -
       chez soi, chez l'autre, ou sur un neutre entame -, juste la facture du
       terrain etranger, repartie entre nos zones au prorata de leurs
       reserves. LA SOURIS DESIGNE LA CIBLE : sur un astre survole, la riposte
       s'y limite ; dans le vide, toute la galaxie repart. Rien a nettoyer,
       l'ecran vibre. Le serveur fait le meme calcul.

     ── LES ZONES ──
     - Une tache sur une planete n'est pas un morceau de camp : c'est une
       ZONE, avec SES spores et SON rendement. Deux taches du meme joueur
       vivent chacune leur vie et ne mettent leurs reserves en commun que si
       le terrain les soude ; une zone coupee en deux partage les siennes au
       prorata des cases. Perdre du sol, c'est perdre les spores qui etaient
       dessus - elles sont sur le terrain, pas dans un coffre. body.spores et
       les totaux d'assaut ne sont plus que des sommes.
     - ON CLIQUE UNE ZONE pour choisir d'ou l'on tire et ou l'on batit. Elle
       se cerne d'un trait double - sombre dessous, clair dessus, sans quoi il
       se perdait parmi les liseres - et se signe d'un "TIR". Chaque zone
       porte en son milieu sa reserve et son rendement. Un clic qui tombe sur
       le terrain d'un autre prend la notre la plus proche.
     - Sous dix cases, une zone ne peut plus ni attaquer ni batir, et une fois
       son elan retombe elle s'effrite case par case jusqu'a disparaitre. Le
       refus fait vibrer l'ecran, en solo comme en multijoueur - la ou le
       refus du serveur etait muet.

     ── PRODUCTION ──
     - LA PRODUCTION SUIT LA CAPACITE, en part par seconde et non plus en
       nombre fixe de spores. Une geante de vingt mille mettait des heures a
       se remplir au meme rythme qu'une lune de quatre cents : tout le monde
       stagnait faute de pouvoir accumuler de quoi relancer une attaque.
       Mesure : 80 secondes pour le quart de la capacite, trois minutes et
       demie pour le grand pic, quelle que soit la taille de l'astre.
     - COURBE A DEUX REGIMES : une bosse modeste au quart, un creux a
       mi-chemin qui punit qui reste a moitie plein, un PIC franc aux sept
       dixiemes, puis l'extinction a saturation. Il y a donc deux rendements
       a connaitre - le petit, facile a tenir, et le gros, qui demande de
       rester juste sous le plafond au risque qu'un renfort vous y pousse.
       La courbe multiplie le reste : flore, symbiose, nids et Growth.
     - Une alveole augmente aussi la production, puisqu'un plus grand silo
       nourrit plus de monde. Dans une bataille, la capacite d'un camp suit la
       surface qu'il tient : perdre du terrain abaisse aussi son plafond.

     ── INTERFACE ──
     - ALERTES DIRECTIONNELLES. La carte est bien plus grande que l'ecran :
       dire qu'il se passe quelque chose ne suffit pas, il faut dire OU.
       Trois evenements posent une balise sur l'astre concerne - on se fait
       tirer dessus, on perd un astre, un groupement se referme. L'astre a
       l'ecran recoit un anneau qui bat ; hors-champ, c'est une fleche collee
       au bord, dans sa direction. La perte y ajoute un eclat lumineux du bon
       cote et une secousse.
     - LES CHIFFRES SOUS UN ASTRE SE NOMMENT AU SURVOL. Sous un astre dispute
       s'empilent celui qui le tient et un compteur par assaillant, chacun a
       sa couleur - mais une couleur n'est pas un nom. Chaque nombre
       enregistre au trace le rectangle qu'il occupe a l'ecran ; la souris
       dessus, une infobulle donne le joueur, sa guilde, ce qu'il fait la et
       combien il a.
     - LE PANNEAU NAISSANCE, au-dessus d'Evolution : la courbe de production
       en entier et un point qui dit ou en est la zone choisie, avec son nom,
       sa taille, son remplissage et son rendement. Pas de zone choisie, pas
       de panneau. Dessine d'abord sur le canevas a cote de la zone, il se
       cachait derriere les scores des qu'on visait un bord ; dans la colonne
       il est toujours au meme endroit. Le plafond d'une zone ne voyage pas
       sur le reseau, il se recalcule cote client a l'identique du serveur.
     - LE LIVRE DES REGLES REFAIT, ET OUVERT A LA PAUSE. Il en restait deux
       versions empilees dans le meme panneau, la seconde d'avant la refonte :
       spores d'attaque et de defense, faune a vaincre, nidification,
       terminaux de commerce, diplomatie et signaux - tout cela n'existe plus.
       La copie morte est supprimee et les chapitres refaits, douze au lieu de
       dix, chacun avec son lien en tete, et les controles listent enfin tout
       le clavier. Echap l'affiche entier dans le menu de pause : on cherche
       une regle au moment ou la question se pose. Le livre n'existe qu'a un
       exemplaire, DEPLACE entre l'ecran AIDE et la pause, pour qu'il n'y ait
       jamais deux textes a tenir a jour.
     - Le panneau d'evolution ne s'ouvre plus au clic droit : il est toujours
       la, empile au-dessus de Mes Astres dans une colonne a largeur fixe. Les
       trois panneaux de droite se replient mais ne se retirent plus - la case
       a cocher les faisait disparaitre avec elle-meme.
     - LE CONVOI DE CHARGE ne se voyait pas : un trait droit qui palissait.
       Chaque envoi est desormais un arc le long duquel filent trois grains
       lumineux, avec un anneau de choc a l'arrivee, et l'astre qui charge
       porte deux anneaux tournants dont l'eclat monte avec la charge.
     - Raccourcis : 1 2 3 construisent (& é " en azerty, lues a leur
       position), Espace passe en visee, Tab suit la liste de gauche, ZQSD et
       les fleches deplacent la camera, A et E reglent l'envoi par crans de
       5 %, R riposte, F3 puis D diagnostiquent.
     - La jauge d'envoi gagne une barre et le nombre de spores qui partiront,
       en gros et en vert, en bas au centre : il se reglait au curseur, ecrit
       en onze pixels dans un coin. Les nombres de spores sont agrandis et
       cernes - ils faisaient 6 a 8 pixels.
     - Le rendement du moment s'affiche au-dessus de l'astre selectionne, en
       vert, jaune ou rouge. Compteur de batiments sous chaque astre et dans
       le HUD.
     - Les explications des mutations passent en infobulle au survol : elles
       tenaient trois lignes chacune en permanence, pour un texte qu'on lit
       une fois.
     - Le secteur "Normal" du menu de tir s'appelle desormais "Spores".

     ── RENDU ──
     - LES LUEURS S'AJOUTENT AU FOND AU LIEU DE SE POSER DESSUS. Un vaisseau,
       un rocher ou un jet qui passait devant une planete perdait ses effets :
       reacteur, feux d'aile, cercle de detection, halo de groupe, reflet,
       brume et trainee etaient peints en transparence simple, donc plus
       sombres qu'une planete eclairee - ils s'y effacaient. Ces elements sont
       de la lumiere : ils passent en composition additive. Mesure sur une
       planete eclairee : la trainee d'un jet passe de 155 a 242 de luminosite
       pour un fond a 75 ; dans le vide elle ne gagne que 96 -> 130, donc rien
       n'est crame. Aucun cout mesurable (2,8 ms par image avant comme apres).
     - Fond spatial sans filtrage bilineaire, etoiles en repere ecran, halos
       de soleil et lueur du trou noir cuits en sprites : image complete
       13-15 ms -> 4-6 ms.
     - Culling ajoute aux six fonctions de dessin qui n'en avaient aucune.
       Nettoyeurs : 0,83 -> 0,06 ms par image.
     - Diagnostic integre : F3 affiche FPS, simulation, rendu, taille de la
       fenetre et dpr ; D detaille le rendu fonction par fonction.

     ── CORRECTIONS ──
     - VISER CHEZ SOI NE CHANGE PLUS LE LANCEUR. Traverser sa propre frontiere
       pour aller chercher une cible derriere faisait sauter le tir d'une lune
       a l'autre, et chaque saut remettait la charge a zero : elle ne montait
       jamais. Meme regle sur le serveur.
     - Un astre a qui l'on demandait un batiment hors de ses moyens restait
       fige pour toujours : la construction court-circuitait la production,
       donc il ne pouvait plus gagner de quoi payer.
     - Calcul du stockage des alveoles blinde : sans le maximum de base, le
       maximum deja augmente servait de base et se remultipliait a chaque
       image - 1e109 en quelques secondes.
     - Une zone perdait deux fois les spores du terrain cede : le prorata se
       faisait sur un compte deja decremente. Fige a l'entree du calcul.
     - Ouvrir une bataille effacait la reserve du defenseur, la premiere zone
       naissant vide. Elle herite desormais des spores de l'astre.
     - Noeuds audio des sons termines debranches (300 sons = 300 noeuds).
     - Barres de chantier retirees ou reaffectees : elles suivaient une
       construction devenue immediate.

     ── SECURITE (serveur) ──
     - spawn : le slot venait du client et l'astre vise n'etait pas verifie.
       On pouvait s'emparer de n'importe quelle planete a tout moment.
     - multi : aucun controle de palier, les statistiques etaient gratuites.
     - set_sacrifice : valeur non bornee, une valeur negative multipliait la
       production par dix.
     - Ratio de tir enfin transmis au serveur, et par joueur.

v9.7.5 | 2026-09-24 | Rendu adaptatif, fond hors canevas, visee unifiee
     ── PERFORMANCE ──
     - LA RESOLUTION DE RENDU SUIT LE ZOOM. Le canevas est affiche en plein
       ecran par le CSS, mais rien n'oblige a le PEINDRE a cette taille : on
       le dessine plus petit et le navigateur l'agrandit. Le cout du rendu
       est presque exactement proportionnel au nombre de pixels peints -
       mesure precedente : le fond passe de 1,4 ms a 1,3 Mpx a 11,5 ms a
       8,3 Mpx -, c'est donc le seul levier qui vaille sur une machine
       modeste.
       Cinq paliers : 50 % sous un zoom de 0,25, puis 62, 75, 88 et 100 % a
       partir de 1,2. Plus on dezoome, plus les astres sont petits et moins
       la finesse se voit ; plus on zoome, moins il y a d'objets et plus le
       detail compte. Les paliers ont une marge de 6 %, sinon un zoom pose
       pile sur un seuil redimensionnerait le canevas a chaque image - et un
       redimensionnement efface tout. Verifie : 200 allers-retours autour
       d'un seuil ne provoquent qu'une seule bascule.
       Mesure en 1920x1080, partie chargee, zoom 0,30 : une image complete
       passe de 9,1 ms a 5,6 ms sans rien changer aux reglages. L'interface
       n'y perd rien - les panneaux sont du HTML, pas du canevas.
     - REGLAGE GRAPH, en haut a droite : Eleve, Moyen, Bas decalent toute
       l'echelle (x1, x0,8, x0,62) pour qui n'a pas la machine. Meme scene :
       5,6 / 4,4 / 3,8 ms. En Bas, le niveau de detail est en plus plafonne -
       scintillements, brume des jets et cercles de detection coupes. Le
       choix est garde d'une partie a l'autre.
     - LA BASCULE DE PALIER ATTEND QUE LE ZOOM SE POSE. Redimensionner le
       canevas coute une image plus lourde - mesure : 2 a 5 ms de plus sur
       celle-la -, indolore isolement mais pas au milieu d'une molette qui
       tourne. On ne change donc de palier qu'un sixieme de seconde apres le
       dernier cran ; un choix explicite dans GRAPH, lui, s'applique net.
       Cote image, la marche est invisible : a zoom identique, l'ecart moyen
       entre deux paliers voisins est de 2,3 sur 255 quand le temoin - deux
       captures a resolution EGALE, la scene ayant seulement tourne entre les
       deux - est deja a 2,2. Ce qu'on voit bouger, c'est le jeu, pas la
       resolution.
     - LE FOND SPATIAL SORT DU CANEVAS. Le degrade et le champ d'etoiles ne
       dependent que de la camera : ce sont deux images qui glissent et
       s'agrandissent. Les repeindre a chaque image coutait un tiers du temps
       de rendu pour un remplissage plein ecran qui n'apprend rien a
       personne. Ils deviennent deux couches que le compositeur deplace par
       transform : le degrade est un element canvas peint UNE fois, les
       etoiles un motif repete par le CSS. drawBackground passe de 1,2 ms a
       zero, et l'image complete de 5,9 a 3,1 ms a resolution egale.
       Piege rencontre : html porte un fond noir, donc celui du body ne
       remonte pas a la racine et se peint APRES les couches a z-index
       negatif - il les recouvrait entierement, fond parfaitement uni. Elles
       sont passees a z-index 0, sous le canevas de jeu qui monte a 1.
       Verifie au pixel : fond d'avant contre fond d'apres, meme carte, meme
       camera, ecart moyen 0,11 sur 255 et 0,1 % de pixels franchement
       differents - les bords d'etoiles, a un demi-pixel pres.
     - BILAN DE LA CHAINE, meme scene en 1920x1080 a zoom 0,30 : une image
       complete passe de 10,3 ms (v9.7.4) a 5,9 ms (resolution adaptative)
       puis a 3,1 ms (fond hors canevas). Trois fois plus rapide.

     ── GAMEPLAY ──
     - LES DEUX TIRS N'EN FONT PLUS QU'UN. Il fallait entrer dans un "mode
       surface" par double-clic, et en sortir en dezoomant : deux visees pour
       un seul geste, et un mode dont on ne savait jamais s'il etait actif.
       Desormais il n'y a qu'une visee, et c'est le CURSEUR qui decide. Pose
       sur le disque de l'astre d'ou l'on tire, le tir devient un tir de
       surface ; partout ailleurs, c'est un jet ordinaire. Rien a activer,
       rien a quitter.
       Le plancher des soixante-dix pixels reste, mais change de sens : sous
       cette taille on ne distingue plus les cases, donc viser l'astre veut
       dire le prendre pour cible et non le bombarder.
       Le bandeau ne dit plus dans quel mode on est - il n'y en a plus qu'un -
       mais ce que le tir fera si on lache maintenant, et il invite a viser le
       sol quand on ne le fait pas. Le double-clic survit comme simple
       raccourci de cadrage : il plonge sur l'astre et met en visee.
       gameState._modeSurface, entrerModeSurface et sortirModeSurface
       disparaissent - l'etat n'existe plus, il se deduit de la position de la
       souris a chaque image.
     ── INTERFACE ──
     - LA COURBE NE DEPEND PLUS D'UNE BATAILLE. Les zones n'existent que
       pendant un conflit : sans bataille il n'y avait aucune zone a choisir,
       donc pas de panneau - c'est-a-dire la plupart du temps, et il
       disparaissait aussi des que la bataille se terminait. Un astre
       tranquille suit pourtant exactement la meme courbe. Le panneau prend
       donc la zone choisie quand il y en a une, et a defaut l'astre
       selectionne, avec sa reserve et sa capacite. Verifie sur les quatre
       cas : astre a soi sans bataille, apres un clic, pendant une bataille,
       et une fois la bataille finie.
     - LE DEVIS, SOUS LE CURSEUR PENDANT LA VISEE. Tout le jeu tient dans
       "X spores valent X cases", mais ce chiffre ne se voyait nulle part :
       on tirait au juge sans savoir si l'envoi prendrait cinq cases ou trois
       cents. Le devis refait a l'identique le trajet d'un jet - densite en
       plus, faune et biomes adverses en moins - puis divise par le prix du
       sol vise : "~ 216 cases (27 %)" et "1 case = 25 sp". Le sol vierge
       affiche son rabais, un astre a soi affiche un renfort, et quand
       l'envoi depasse le disque entier il annonce l'astre EN ENTIER.
       Verifie : 2000 de faune font tomber 216 cases a 137, trois biomes a
       149, et le devis suit la jauge d'envoi au prorata exact.
     - LE PANNEAU NAISSANCE DIT QUAND. La courbe disait ou l'on etait, jamais
       combien de temps il restait - et comme le rendement varie tout du
       long, aucune regle de trois ne le donne. On integre donc la montee pas
       a pas, quatre cents crans, chacun a la vitesse du moment. Avant le pic
       on annonce le pic, apres on annonce la saturation, ou l'astre cesse de
       produire. Verifie contre une simulation de la vraie production : 147 s
       annonces, 147 s mesures, zero pour cent d'ecart.
       Le cas "jamais" est desormais nomme : production a l'arret quand le
       debit est nul, plus d'une heure quand c'est seulement tres long -
       "hors d'atteinte" ne disait pas laquelle des deux.

v9.7.6 | 2026-09-25 | Tirs speciaux, demolisseur, icones, decor spatial, IA, multi
     ── PERFORMANCE ──
     - LES SOLEILS COUTENT DEUX FOIS MOINS. Le coupable n'etait pas le halo,
       mais la texture : 1000 a 1500 px, posee avec lissage sur un soleil qui
       en fait quelques centaines a l'ecran. Reduire autant a chaque image
       coutait jusqu'a 3 ms a elle seule en zoom fort.
       On fabrique au chargement des copies de plus en plus petites (moitie,
       quart...) et on pose la plus petite encore plus grande que le soleil a
       l'ecran, sans lissage. Le lissage revient seulement au-dela de la
       grande texture, en zoom tres fort, ou il faut agrandir.
       Mesure, carte a 9 soleils : drawSuns passe de 0,49 a 0,25 ms en vue
       normale, de 0,96 a 0,62 ms a zoom 1 et de 1,91 a 0,84 ms a zoom 2 sur
       un soleil. L'image n'a pas bouge : ecart moyen de 0,02 a 0,33 sur 255,
       et en dezoomant la copie est meme plus fidele qu'avant. Cout au
       chargement : environ 0,1 s de plus pour 9 soleils.
     - LES HALOS DES SOLEILS SORTENT DU CANEVAS. Un halo est un grand carre
       transparent, trois fois le rayon du soleil, que le canevas remplissait
       a chaque image. Comme le fond, il ne depend que de la camera : chaque
       halo devient une couche de la page, entre le fond et le canevas, que
       le compositeur deplace et agrandit. Il passe donc sous les frontieres,
       les cometes et le trou noir, dessines avant lui jusqu'ici - sans
       difference visible, le halo est tres pale.
       Mesure, meme carte : drawSuns passe de 0,26 ms a presque rien en vue
       normale, de 0,60 a 0,27 ms a zoom 1 et de 0,88 a 0,35 ms a zoom 2 ; a
       zoom 2 l'image complete passe de 1,40 a 0,96 ms. Cache au menu,
       remplace proprement au changement de carte. Si le fond n'a pas pu
       passer en CSS, le halo reste peint dans le canevas comme avant.
       Sur les deux passes, drawSuns en zoom 2 : de 1,91 a 0,35 ms.

     ── CORRECTIONS ──
     - LA COURBE DE VISEE MENTAIT DEPUIS UNE TETE DE PONT. Sur un astre qu'on
       ne tient qu'en partie, l'apercu du jet prenait la vitesse du
       PROPRIETAIRE de l'astre, alors que le vrai jet part a la vitesse du
       tireur : la gravite ne courbe pas pareil un jet lent et un jet rapide,
       le trait montrait donc une autre trajectoire que celle du tir. Le trait
       prend desormais la vitesse - et la couleur - du joueur local, comme
       launchJet (le serveur le faisait deja). Le tir de surface n'etait pas
       concerne. Verifie : a vitesses differentes, l'ecart au centieme point
       passe de 3000 unites a zero.
     - LE JEU NE DEMARRAIT PAS SANS LES SERVICES EN LIGNE. Supabase et
       socket.io viennent de CDN : bloqueur de publicite, reseau d'ecole ou
       d'entreprise, panne - et la creation du client Supabase plantait tout
       le second script. L'ecran de connexion s'affichait, mais ses boutons
       etaient morts : impossible d'aller plus loin, solo compris.
       Desormais un client factice repond "indisponible" a tout, l'ecran de
       connexion l'explique et propose JOUER EN SOLO HORS LIGNE : menu avec
       Multi, Local et Competition grises, mention HORS LIGNE sous le menu,
       joueur nomme Commandant. Meme bouton quand la bibliotheque est la
       mais que le serveur ne repond pas : on ne dit plus "mot de passe
       incorrect" pour une panne reseau. connectSocket ne plante plus si
       socket.io manque.
       Verifie, les deux CDN bloques : message, bouton, menu, partie a 4
       lancee et jouee, aucune erreur. Le parcours normal est inchange.
     - ZQSD PENDANT LE CHOIX DE LA PLANETE. Les touches de camera n'etaient
       ecoutees qu'en partie : au choix du depart, seules les fleches
       marchaient. Verifie : D, S, fleches, ~1 800 unites en 0,6 s.

     ── GAMEPLAY : ECONOMIE ──
     - LA RIPOSTE SUIT LE POURCENTAGE D'ENVOI. La touche R engageait "juste
       la facture" du terrain etranger, quel que soit le reglage : le joueur
       n'avait aucune prise sur ce qu'il mettait dans la balance. Desormais
       chaque zone engage le pourcentage regle avec A et E, comme un jet.
       C'est un budget, pas une depense : chaque case reprise se paie au prix
       du sol et le reste demeure dans la zone - riposter a 100 % pour trois
       cases ne vide pas la planete. A 0 %, la riposte refuse et le dit.
       Verifie, ennemi tenant ~175 cases sur notre planete : a 0 % il
       continue d'avancer, a 20 % on en reprend la moitie, a 50 et 100 % on
       reprend tout, pour la meme depense. Livre des regles et aide des
       touches mis a jour.
       Soupcon leve ensuite : "la riposte laisse un tiers du terrain". Faux,
       le test s'arretait trop tot. Suivi case par case : l'ennemi finit
       d'abord de depenser son elan (1,5 s), puis la reprise avance au
       rythme de l'animation, ~30 cases/s ; 175 cases sont reprises en
       8 s et la bataille se clot d'elle-meme.
       A FAIRE COTE SERVEUR : en multijoueur c'est le serveur qui applique la
       riposte, avec l'ancien calcul. Il connait deja le pourcentage de
       chaque joueur (set_jet_ratio) ; son code n'est pas dans ce depot.
     - TOUCHE T : ARRET DES ATTAQUES, le pendant de R. Sur l'astre sous le
       curseur, ou partout si le curseur est dans le vide, nos zones perdent
       leur elan et cessent de pousser (riposte, jet ou tir de surface).
       Rien n'est perdu : l'elan n'est qu'un budget, les spores restent dans
       la zone. Serveur : action « arret » (arreterAttaques). Aide : ligne
       des touches et paragraphe. Verifie : elan 999 -> 0, « ✋ ARRET ».
     - LES POINTS DE MULTIPLICITE S'EMPILENT. Un palier atteint attendait le
       choix du joueur sous la forme d'un simple oui/non : si un deuxieme
       tombait avant qu'on ait choisi, il etait PERDU. C'est desormais un
       compteur. Les points en attente comptent deja comme des paliers - pour
       le prix du suivant et pour le plafond de 10 -, brillent dans la
       rangee de pastilles, et le titre annonce "N POINTS A PLACER".
       Verifie : trois paliers atteints sans choisir donnent trois points,
       places ensuite un par un ; a 9 + 1 en attente, plus rien ne s'ajoute.
       En multijoueur, chaque avis du serveur ajoute un point au compteur ;
       reste a verifier que le serveur, lui, ne perd pas les siens.
     - LE LIVRE DES REGLES SE TROMPAIT SUR LE PRIX DE LA MULTIPLICITE. Il
       annoncait 500 x 1,8^N spores par palier ; le jeu demande 100, 200,
       300... jusqu'a 1 000 pour le dixieme. Texte corrige, et il dit
       desormais que les points s'empilent.

     ── GAMEPLAY : TIRS ──
     - LA VISEE : ESPACE, ET RIEN D'AUTRE. Apres un essai du « clic = visee »,
       retour a la regle d'avant, durcie : sans Espace, aucun tir. Le clic,
       Tab et le double-clic choisissent ou cadrent l'astre ; Espace ouvre
       les deux tirs d'un coup - vers un autre astre, et sur son propre sol
       en pointant son disque (viserDepuisSelection). F (demolisseur) reste
       une touche volontaire : elle ouvre la visee si besoin. Aide et
       didacticiel ajustes.
     - LA RAFALE : CTRL + CLIC GAUCHE EN VISEE. L'astre crache des paquets
       de 10 spores, 8 par seconde, vers le curseur a plus ou moins 20
       degres - une mitrailleuse imprecise. Il se vide tant qu'on maintient,
       s'arrete au relacher (Ctrl ou clic), en quittant la fenetre, ou quand
       il n'a plus de quoi faire un paquet ; on reste en visee. Un son de
       lancer sur trois, la jauge ENVOI affiche RAFALE 10 x 8/s. launchJet
       accepte un nombre fixe de spores.
       En multijoueur, le SERVEUR cadence et tire (dispersion tiree de son
       cote) : le client annonce debut, cible et fin - impossible
       d'accelerer la mitrailleuse. Sans nouvelles du client 2 s, arret.
       Verifie : solo, 18 paquets de 10 en 2 s, tous dans le cone, arret
       seul a vide ; multi sur serveur local, l'adversaire voit 16 paquets
       de 10 et plus rien apres le relacher. Aide des touches et livre des
       regles mis a jour.
     - LA BOULE : SHIFT EN VISEE. L'astre agglutine des spores dans son
       atmosphere, 25/s jusqu'a 500, chaque spore chargee lui en coutant
       deux, sans remboursement. La boule flotte a 1,35 rayon et tourne
       lentement vers la souris (0,6 rad/s) ; au lacher de Shift elle part
       dans l'axe centre -> boule. Vitesse x1,4, deux fois la portee d'un
       jet, un quart de la gravite (computeTrajectory accepte desormais une
       part de gravite), insensible aux vaisseaux et amas rouges et noirs ;
       a l'arrivee, un jet ordinaire. Sa premiere seconde, elle traverse sa
       planete et les lunes de celle-ci - elle partait de l'atmosphere et
       s'ecrasait sur une lune proche. Aperçu de trajectoire propre a la
       boule pendant la charge, jauge ENVOI : BOULE n / 500.
       En multijoueur, le serveur charge (et fait payer), tourne et tire ;
       l'instantane transmet les boules en charge pour que tous les voient.
       Verifie : solo, 25/s, depart dans l'axe (0 degre d'ecart), vitesse
       x1,4, portee 6950 contre 3110 ; multi sur serveur local, boule vue en
       charge par l'adversaire, jet de 75 spores recu avec sa portee.
       Retouches : rotation ramenee a 0,25 rad/s (un demi-tour en 12 s),
       puis a 0,15 rad/s au zoom 1, ralentie en dezoomant (le quart au zoom
       0,25) - dezoome, le bout de la longue trajectoire prevue balayait
       l'ecran et la boule paraissait tourner vite ; le zoom est transmis au
       serveur, qui borne lui-meme la vitesse ;
       la boule REMPLACE le tir normal - un clic relache pendant ou apres la
       charge ne tire plus de jet en plus, quel que soit l'ordre des gestes
       (un clic normal apres coup tire toujours) ; charge spectaculaire :
       filets de spores aspires du sol en spirale, halo qui s'etend avec la
       charge, deux anneaux contrarotatifs, coeur blanc qui bat, eclair
       regulier et MAX une fois pleine ; bandeau de tir de surface masque.
     - TROIS TIRS, TROIS ALLURES EN VOL. Les paquets de rafale sont des
       balles tracantes (trait court et net, petit coeur vif, sans brume ni
       scintillements - elles sont nombreuses) ; la boule est une comete
       (gros coeur blanc a sa taille, traine epaisse qui s'effile, ses deux
       anneaux qui tournent encore). Le jet normal ne change pas. Valable
       pour les tirs de l'adversaire en multijoueur (marques rafale et
       boule transmis par le serveur).
     - L'ONDE DE CHOC DE LA BOULE. Au lacher, l'ecran du tireur tremble
       (recul) et trois anneaux s'ecartent depuis la boule : eclair blanc
       rapide, couleur du tireur, large anneau lent. A l'impact, la meme
       onde est visible de tous, mais seul l'ecran du joueur TOUCHE tremble
       (proprietaire de l'astre, ou qui y tient du terrain). La force suit
       le contenu : de 6 a 20 au depart, de 8 a 26 a l'arrivee, une boule
       pleine secoue le plus. Verifie : depart plein 20, frappe chez moi
       18,8, ma boule chez l'ennemi 0 chez moi, trois anneaux a chaque fois.
     - LE DEMOLISSEUR : TOUCHE F. F arme le tir (ou le desarme) : le
       trait de visee rougeoie et pulse, trois icones suivent le curseur
       (alveole, nid, biome) ; la molette choisit le batiment au lieu de
       zoomer, et le nombre que l'astre pointe en possede s'affiche. Le clic
       tire 250 spores, vitesse x0,6 pour la meme portee (trajectoire de 333
       pas, apercu identique). A l'impact, un batiment DU GENRE CHOISI, au
       hasard parmi ceux qui ne sont pas au tireur, explose (eclair, boule
       de feu, debris a sa couleur, a sa place sur l'astre) ; s'il n'y en a
       pas, rien ne casse. Les spores attaquent ensuite comme un jet. Sans
       250 spores (astre ou zone) : l'ecran vibre, on reste arme. En vol :
       un boulet sombre herisse, cerne de feu, avec une traine de braises.
       Jauge ENVOI : DEMOLISSEUR 250 et le batiment choisi.
       En multijoueur, le serveur verifie le genre, tire les 250 spores et
       casse ; les clients alignent leur liste de batiments sur les
       compteurs de l'instantane (accorderEdifices : un compteur qui baisse
       fait exploser un batiment, un compteur qui monte en pose un - la
       liste restait figee jusque-la).
       Verifie : solo, arme / molette / tir 250 / nid casse / alveole
       absente sans effet / refus sans spores ; multi sur serveur local,
       nid casse (3 -> 2) et vu par la victime.

     ── GAMEPLAY : ESPACE ──
     - LES ETOILES BRULENT LES TIRS QUI LES FROLENT. A moins de 2,2 rayons
       du centre d'une etoile, un tir perd 1 spore/s ; a moins de 1,5 rayon,
       5/s ; a zero, il s'eteint. Tirs de surface et jets renvoyes exclus.
       Client (solo) et serveur (multi), memes constantes BRULURE_*.
       Verifie : 3 rayons 0 perte, 1,9 rayon -1/s, 1,3 rayon -5/s.
     - LA FRONDE DU TROU NOIR. Un tir qui le frole en ressort plus rapide
       et le garde : rien a 2,5 fois la zone de danger, jusqu'a +80 % au ras
       de la zone qui detruit. Le trajet ne change pas, il est parcouru plus
       vite. Au plus pres, quand le tir repart, « ⚡ +N % vitesse » saute en
       bleu. Client et serveur (FRONDE_PORTEE, FRONDE_MAX). Verifie : passage
       a 200 du centre, 44 -> 74,7 des deux cotes, « +70 % ».
     - LES AMAS NE TOUCHENT PLUS UN TIR A SON DEPART. Un amas de meteorites
       qui passe devant ou derriere l'astre de depart n'agit pas sur le tir
       tant que celui-ci est a moins de 1,6 rayon + 40 de sa planete. Client
       et serveur.
     - DUELS DE VAISSEAUX. Deux vaisseaux de couleurs differentes qui
       passent a moins de 380 se prennent en chasse : ils se contournent en
       tournant l'un autour de l'autre et se tirent dessus (lasers a leur
       couleur, 70 % au but, 7 a 15 degats, 100 points de vie, barre de vie
       au-dessus). Le perdant explose (eclats, deux ondes) ; un vaisseau de
       sa couleur reapparait ailleurs 6 a 12 s plus tard. Le vainqueur se
       repare de 2 pv/s. Au-dela de 950, le duel est rompu. Solo : majDuels ;
       serveur : majDuels dans updateCleaners, et l'instantane transmet vie,
       mort et adversaire - le client dessine les lasers (montrerDuels) et
       fait exploser le vaisseau qui tombe.
     - LES GAINS ET PERTES EN VOL SAUTENT EN CHIFFRE. +N vert, -N rouge, a
       l'endroit du jet (popSpores, noterVariationJet) : amas noir, vaisseau
       rouge, vaisseau vert (+N au lieu de « x2 »), brulure d'etoile. Les
       petites pertes continues sont cumulees et affichees une fois par
       seconde. En multijoueur, le client ne touche plus lui-meme aux spores
       de ces jets : il fait sauter l'ecart entre deux instantanes du
       serveur - le chiffre vu est donc celui du serveur.

     ── IA ──
     - LES IA SE SERVENT DE TOUT L'ARSENAL. Batiments : les trois genres
       (biome quand l'astre est dispute, alveole quand il deborde, nids
       d'abord) et des foyers putrides. Tirs : parasite des qu'une spore
       est prete, demolisseur sur le genre le plus present chez l'ennemi,
       boule (chargee a 25/s en tournant vers la cible, onde de choc au
       depart, visible en charge), rafale (jusqu'a 16 paquets). Gout pour
       les tirs speciaux : 15 % facile, 35 % normal, 50 % brutal. Avec un
       parasite pret ou de quoi demolir, l'IA va chercher un astre ennemi a
       portee (3 000) meme si sa cible du moment est neutre. creerJetBoule
       sort de lancerBoule pour servir aux IA ; aiLaunchAt prend le type et
       les options de tir. Meme logique cote serveur (multi avec bots).
       CORRIGE AU PASSAGE : en multijoueur, les tirs des IA du serveur
       n'etaient jamais annonces (pas de jet_fired) - ils etaient
       invisibles. annoncerJet les annonce tous (normal, rafale, boule,
       demolisseur, parasite).
       Verifie : solo brutal 60 s, 159 jets, 124 paquets de rafale, 4
       boules, alveoles et nids bâtis, foyers en cours ; tirage force :
       parasite, rafale, boule, demolisseur (visant les biomes, les plus
       nombreux) ; serveur, 3 IA sur 400 s : 35 jets, 176 paquets, 7
       boules, 1 demolisseur, 1 parasite, tous annonces, aucune erreur.

     ── INTERFACE ──
     - PLUS DE LISERE BLANC AUTOUR DES ZONES. Les cases de bord etaient
       tirees a 60 % vers le blanc : un anneau de pixels clairs autour de
       chaque zone et du sol du defenseur. La frontiere se lit par la
       difference de couleur ; le bord d'une zone attaquante est juste un
       peu plus opaque que son interieur. Livre des regles ajuste.
     - LA FICHE, SOUS LA JAUGE D'ENVOI. Tout ce qu'on sait de l'astre choisi,
       d'un coup d'oeil : spores et plafond, remplissage (rouge une fois
       sature), production, rendement de la courbe, flore, faune, symbiose,
       batiments, et selon le cas la part du sol qu'on tient sur un astre
       partage, un parasite, les lunes ou la planete mere. Rien de choisi :
       le bilan du joueur - astres, spores, production totale, stats,
       multiplicite (et points en attente), sacrifice, technos, systemes
       complets, jets lances et prises. Un clic dans le vide lache l'astre
       suivi et ramene au bilan. Hauteur fixe pour que la jauge posee dessus
       ne saute pas ; elle laisse passer les clics. Six mises a jour par
       seconde, reecrites seulement si le texte change.
     - TAB, DEUX FACONS DE PARCOURIR. Bouton ⇄ dans le titre de MES ASTRES :
       de planete en planete (lunes sautees), ou d'astre en astre (chaque
       planete puis ses lunes), soleil par soleil. Depuis une lune en mode
       planetes, Tab mene a la planete SUIVANTE et non a la premiere. Choix
       garde d'une partie a l'autre. Aide des touches mise a jour.
     - ICONES DES BATIMENTS UNIFIEES (famille « organique »). Les astres
       montraient hexagone / triangle / rond, les menus 🍯 🏗️ 🛡️ 🦠 : on ne
       s'y retrouvait pas. Un seul dessin SVG par genre (_dessinBat) :
       alveole = rayon de miel, nid = oeuf dans son nid, biome = dome de vie,
       parasite = spore infectee a tentacules (nouvelle). iconeBat() pour le
       HTML, dessinerIconeBat() pour le canevas (image de 192 px faite au
       chargement), remplirIconesBat() pour les <i class="ic-bat"> poses dans
       l'aide et l'onglet du codex. Remplaces partout : astres, compteurs
       sous les astres, menu radial, codex, barre de construction et liste
       de gauche, compteur du haut, fiche, journal (y compris les avis
       build_complete du serveur, traduits), selecteur et jauge du
       demolisseur, marque du parasite sur les astres, didacticiel, aide.
     - Aide : paragraphe des icones, et la conquete « ne detruit rien, sauf
       le demolisseur ».

     ── DECOR ──
     - LES ASTRES PLEINS CRACHENT DES ETINCELLES. Un astre a sa capacite ne
       produit plus rien, et rien ne le montrait. Il laisse maintenant
       echapper, toutes les demi-secondes environ, un paquet de 4 a 6
       etincelles de la couleur de son proprietaire eclaircie : elles
       jaillissent du bord, freinent et s'eteignent en une seconde. Tete
       chaude et petite trainee, simple point vu de loin. Purement visuel :
       aucune spore, aucun effet, hasard hors simulation (pas de decalage en
       multijoueur). Visible pour tous les camps, donc aussi chez l'ennemi.
       Rien n'est emis hors de l'ecran, 250 etincelles au plus, moins en
       reglage Bas. Cout mesure : 0,02 ms en vue normale, 0,18 ms dans le
       pire cas (57 astres pleins a l'ecran). Elles cessent des que l'astre
       se vide.
       Vue de loin, les etincelles se perdent : les astres pleins y
       CLIGNOTENT doucement, tous ensemble, d'une lueur de la couleur de leur
       proprietaire (sans coeur blanc, l'astre reste lisible). L'effet monte
       en dezoomant : rien au-dessus de 30 px de rayon a l'ecran, plein en
       dessous de 15.
       Seuil corrige ensuite : les etincelles attendaient 99,5 % alors que le
       panneau NAISSANCE annonce "sature" des 98,5 % - la production
       s'eteint si doucement qu'un astre met une minute de plus a franchir
       le dernier pour cent. Un seul chiffre pour les deux, PART_SATUREE.
       Verifie sans rien forcer : astre rempli par sa seule production,
       premieres etincelles a 98,5 %, au bout de 3 min 26.
       Puis EN ORBITE : lachees dans le vide, elles restaient sur place
       pendant que l'astre filait et se perdaient derriere lui. Elles vivent
       desormais dans le repere de l'astre - elles jaillissent du sol, se
       posent sur une orbite basse (1,2 a 1,65 rayon) et tournent en arc,
       tout un paquet dans le meme sens, 1 a 2 s. La trainee suit la
       rotation, pas le deplacement de l'astre. Plus emises quand l'astre
       fait moins de 15 px de rayon a l'ecran : le clignotement y suffit.
       Cout au pire (46 astres pleins, vue d'ensemble) : 0,46 ms.
     - LES NIDS CRACHENT LEURS SPORES. Tout pres (icone de 18 px et plus a
       l'ecran), un nid d'un astre qui produit lance de petits jets : douze
       grains a la couleur du proprietaire qui jaillissent du nid, s'ecartent,
       retombent et s'eteignent, chacun laissant un court trait. Sans etat
       (angle tire d'un hachage du cycle), rien a stocker par nid.
     - LES ETOILES NE SONT PLUS VOILEES. Leur degrade finissait a 53 %
       d'opacite au bord : tout le disque paraissait semi-transparent. Disque
       opaque, et seul un fin fondu sur les 12 derniers % du rayon (jusqu'a
       15 % d'opacite au bord) le fond dans son halo.
     - ERUPTIONS SOLAIRES (decor). Toutes les 2 a 8 s, une etoile a l'ecran
       crache une gerbe de feu d'un point de sa surface : 40 a 65 grains a
       depart echelonne, en eventail qui peut pencher, montent en parabole
       et retombent (traits courts, blanc -> or -> orange -> rouge sombre,
       un sur quatre luit), eclat au pied et panache orange qui monte avec
       la gerbe. Hauteur 0,25 a 0,7 rayon, 1,6 a 3,2 s. LOD moyen et plus.
     - RAYONNEMENT DE HAWKING (decor). Au bord de l'horizon du trou noir,
       26 paires de grains : l'un est avale en un instant, l'autre
       s'echappe lentement (jusqu'a 1,9 rayon) en palissant, bleu pale ou
       mauve ; trois arcs tres pales frissonnent sur l'horizon. Sans etat
       (hachage du cycle). LOD moyen et plus.
     - PARALLAXE : UNE SECONDE COUCHE D'ETOILES. Etoiles proches (tuile de
       1 536 px, 260 etoiles plus grosses et plus vives, halo doux, une sur
       huit avec un eclat en croix) qui defilent a 0,4 contre 0,15 pour les
       lointaines, et grossissent un peu avec le zoom (0,75 a 1,5). Couche
       CSS confiee au compositeur comme la premiere (#fondEtoiles2) : zero
       cout de dessin, 60 images/s mesurees. Repli canevas sans le
       grossissement. Tirage a part (graine 4242), le reste du decor ne
       change pas.
     - PARALLAXE : TROISIEME COUCHE. Le tout premier plan du fond : 42
       grosses etoiles floues et six voiles de poussiere a peine colores
       (tuile de 1 024 px), defilement 0,85, grossissement franc au zoom (0,6
       a 2,2). _placerCoucheEtoiles pose les couches 2 et 3. 58-60 images/s.

     ── MULTIJOUEUR ──
     - VERIFICATION COMPLETE DU MULTI. Le serveur de production n'est pas
       joignable depuis l'environnement de travail : le serveur
       (gadmy/nebula-conquest-server2) a ete lance en local et deux joueurs
       y ont joue une partie reelle. File d'attente, salle, univers partage,
       apparitions vues des deux cotes, jets relayes : tout fonctionne. Le
       trait de visee colle au jet calcule par le serveur (0 d'ecart).
     - CE QUI N'ETAIT PAS PASSE COTE SERVEUR, corrige et teste en local :
       riposte au pourcentage d'envoi (avant : 1846 spores engagees quel que
       soit le reglage, meme a 0 % ; apres : 0 / 800 / 2000 / 4000 a
       0 / 20 / 50 / 100 %), points de multiplicite qui s'empilent (deux
       paliers atteints sans choisir = deux points, places ensuite un par
       un), tireur annonce depuis une tete de pont (c'etait le proprietaire
       de l'astre), plafond et symbiose des lunes dans l'instantane.
       Acces au depot du serveur obtenu ensuite : corrections poussees sur
       main de nebula-conquest-server2 (redeploiement Railway automatique,
       non verifiable depuis l'environnement de travail). Le fichier
       outils/correctifs-serveur.patch en garde la trace.
     - SECURITE ANTI-TRICHE DU MULTI (serveur, nouveau fichier securite.js).
       Audit de chaque message qu'un joueur peut envoyer, puis attaques
       reelles contre le serveur lance en local : 13 sur 13 bloquees, le
       serveur reste debout. Avec l'ancien, UNE invitation mal formee
       faisait tomber tout le serveur - toutes les parties avec.
       - Identite : le jeu envoie son jeton de session Supabase, le serveur
         le fait verifier et lit le pseudo dans la base. Avant, pseudo et
         identifiant etaient crus sur parole : on jouait sous le nom d'un
         autre et on faisait bouger SON classement. Sans jeton : invite,
         ni classe ni tournoi.
       - Univers de depart (envoye par l'hote) : statistiques, technologies,
         proprietaires, spores et batiments remis a zero, tailles et trou
         noir bornes, nombre d'astres plafonne. L'hote ne se donne plus
         growth 8 ni une planete geante pleine.
       - Lancement reserve a l'hote de SA salle, une seule fois ; faux etat
         et fausse fin de partie ne sont plus relayes a l'adversaire ;
         vainqueur de tournoi constate par le serveur ; match classe
         seulement sur invitation reelle ; salle privee sur invitation ;
         plus d'usurpation de pseudo pour detourner une invitation ;
         pseudos limites aux caracteres surs (et echappes a l'affichage).
       - Classe : la victoire au temps et l'abandon comptent enfin.
       - Tous les messages : debit limite, charges controlees, exclusion en
         cas d'inondation ; une exception n'abat plus le serveur.
       Partie a deux rejouee ensuite sur le serveur renforce : tout marche.
     - SUPABASE ENFIN BRANCHE SUR LE SERVEUR. Le journal Railway le montrait :
       SUPABASE_URL et SUPABASE_SERVICE_KEY n'avaient jamais ete renseignes -
       l'ELO n'a donc jamais ete mis a jour, et l'identite n'etait pas
       verifiee. Une fois les deux variables ajoutees, le serveur ne
       demarrait plus : supabase-js exige un WebSocket que Node 20 n'a pas.
       Corrige : WebSocket du paquet ws fourni au client, passage a Node 22,
       et un echec de Supabase ne coupe plus le serveur (ELO desactive
       seulement). Verifie en local avec et sans WebSocket natif.
     - COTE JEU : la fiche affichait 0 spore en multi (l'instantane ecrase
       totalSpores) - recompte depuis les astres ; un jet recu du serveur
       n'ecrase plus un autre jet si sa creation locale echoue, et prend le
       tireur annonce ; les lunes lisent plafond et symbiose quand le
       serveur les envoie.
     - FIN DU CLIGNOTEMENT EN MULTIJOUEUR. A chaque instantane (dix par
       seconde) l'horloge et les angles d'orbite etaient remis d'un coup sur
       ceux du serveur : l'horloge reculait par moments (3 a 5 fois en 180
       images, mesure) et les astres sautaient d'une dizaine d'unites en
       arriere avant de repartir - de pres, un effet stroboscopique. Le
       recalage se fait desormais en douceur (20 % de l'ecart par
       instantane pour les orbites, 15 % pour l'horloge, qui ne recule
       jamais de plus de 4 ms) ; un ecart franc se recale d'un coup.
       Verifie sur serveur local, deux joueurs : 0 recul d'horloge.
     - NOMBRE DE VAISSEAUX EN PARTIE LOCALE. L'ecran de la partie locale a
       un curseur « Vaisseaux » (0 a 12, le maximum du serveur) ; c'est
       celui de l'hote qui compte. Le matchmaking garde 2. Corrige au
       passage : un reglage a 0 donnait 3 vaisseaux (« || 3 »). Et surtout :
       l'invite fabriquait ses vaisseaux selon SA config (3 par defaut) au
       lieu de reprendre ceux de l'hote - avec 2 cote serveur, il voyait un
       vaisseau fantome que rien ne corrigeait. loadMapFromJSON reprend
       desormais la liste du serveur en multijoueur. Verifie : hote et invite
       ont les memes 8 vaisseaux, aux memes places.
     - SERVEUR : CHARGE MESUREE ET COMPRESSION. Banc de charge (salle de 2 a
       16 joueurs joues par l'IA, rafales sans arret, jusqu'a 320 tirs en
       vol) : 1,2 a 4,6 ms de calcul par pas sur 50 (9 % au pire, pire pas
       12 ms). La limite etait le debit : l'instantane (18 a 58 Ko, 10 fois
       par seconde et par joueur) partait non compresse. Compression
       WebSocket activee cote serveur (perMessageDeflate, au-dela de 1 Ko) :
       2 a 6 Ko mesures, environ huit fois moins. Rien a changer cote jeu,
       les navigateurs decompressent. Verifie : extension negociee, partie a
       deux sur serveur local sans ecart.

     ── NETTOYAGE ──
     - buildProgress RETIRE. Reste de l'epoque ou construire prenait du
       temps : depuis que la construction est immediate, on le remettait a
       zero a 15 endroits sans jamais le lire. Trompeur pour qui relit le
       code - on croyait a une jauge de construction qui n'existe plus.
       Verifie : plus aucune occurrence, aucune lecture n'existait.

     ── PUBLICATION ──
     - COPIE BROUILLEE POUR LES JOUEURS. Le navigateur recoit la page entiere :
       n'importe qui pouvait lire le code, les commentaires et ce journal par
       "Afficher le code source" - et un depot prive n'y change rien. Nouvel
       outil, npm run brouiller (outils/brouiller.mjs) : il fabrique dans
       dist/ la copie a publier. Commentaires HTML et CSS retires (journal
       compris, droits d'auteur conserves en tete), scripts compactes par
       Terser, noms locaux remplaces par des lettres. Les noms de premier
       niveau restent : le HTML les appelle par leur nom (onclick) et les
       trois scripts se les partagent. assets/, Audio/ et _headers suivent.
       Ce index.html reste la version de travail : on ne touche jamais a dist/.
       Mesure : page de 882 a 499 Ko, donc chargement plus rapide aussi.
       Verifie sur une partie a 5 joueurs : meme deroulement que l'original,
       60 images/s, aucune erreur. Ca ralentit la copie, ca ne l'empeche
       pas : le navigateur doit pouvoir lire le code pour le faire tourner.

v9.7.7 | 2026-09-29 | Multijoueur lockstep : tours fixes, ordres, relais, salon
     ── LE PRINCIPE ──
     - LOCKSTEP (facon OpenFront) : chaque navigateur calcule toute la
       partie, le serveur ne fait que relayer les ORDRES des joueurs. Le
       trafic ne depend plus du nombre d'objets : moins de 1 Ko/s par
       joueur, contre 20 a 60 Ko/s pour les instantanes du serveur 2.
       Condition : deux navigateurs partis du meme etat et recevant les
       memes ordres restent identiques au bit pres, tour apres tour.

     ── LA MEME PARTIE PARTOUT (determinisme) ──
     - HASARD DU JEU SUR UNE GRAINE COMMUNE : quatre fuites vers le vrai
       hasard bouchees (amas et vaisseaux des cartes de la bibliotheque,
       noms des IA, cometes, ecart de la rafale). Au passage, une partie
       solo sur carte de la bibliotheque a enfin sa propre graine (elle
       avait toujours la graine 42).
     - TOURS FIXES DE 1/60 s quel que soit l'ecran (tourSimulation,
       avancerImage) ; image interpolee entre deux tours sur les ecrans
       rapides (258 images figees sur 580 a 144 Hz sans, aucune avec) ;
       camera et niveau de detail suivent chaque image. 60 et pas 20 :
       la cadence pour laquelle le jeu est regle.
     - MATHS IDENTIQUES DANS TOUS LES NAVIGATEURS (MATHS_FIXES, d'apres
       fdlibm) : sin, cos, atan2, exp, hypot, pow refaits avec les seules
       operations exactes partout. Chrome et Firefox ne donnaient pas le
       meme dernier chiffre : desynchronisation en 4 s. Ecart avec les
       fonctions natives 1e-16, cout 40 ns par appel. Installees au depart
       d'une partie en reseau.
     - NOMS D'ASTRES UNIQUES (nomsUniques) : 4 cartes sur 15 avaient deux
       astres du meme nom ("Synenra" deux fois sur la carte 6) ; or le nom
       sert d'identifiant aux ordres et au serveur. Le second devient
       "Synenra II".
     - PLUS DE CACHE LU PAR LE CALCUL ET REMPLI PAR L'AFFICHAGE : le bonus
       de systeme complet (+3 %) tombait un tour plus tot ou plus tard
       selon l'ordinateur (isSystemComplete recalcule a chaque appel). Le
       compteur qui cadence l'IA et la victoire repart de zero a chaque
       partie. Le champ isLocal et la selection d'un tir n'entrent plus
       dans l'empreinte.
     - EMPREINTE DE L'ETAT (empreinteEtat) : toute la partie resumee en un
       nombre, comparee chaque seconde entre les joueurs.

     ── LES GESTES DEVIENNENT DES ORDRES ──
     - Un clic n'agit plus sur la partie : il donne un ordre, date d'un
       tour, qui ne contient que des donnees (noms d'astres, directions,
       nombres), jamais la souris ni la camera. donnerOrdre,
       programmerOrdre, appliquerOrdres, EXECUTER_ORDRE ; tous les ordres
       appliques sont gardes (gameState.journalOrdres).
     - 21 ORDRES, verifies a l'execution (un ordre truque ne passe pas) :
       part, zone, tir, tir_surface, riposte, arret, batiment, sacrifice,
       stat, techno, colonie, demol, et les gestes continus visee /
       visee_fin, rafale_debut / cible / fin, boule_debut / cible / fin /
       lancer. La charge, la rafale et la boule vivent chez chaque joueur
       (majVisees, majRafales, majBoules) ; un seul choix du lanceur pour
       l'ecran et le calcul (choisirLanceur).
     - CHAQUE JOUEUR A SA PART D'ENVOI ET SA ZONE : les IA lisaient le
       curseur du joueur (le monter les faisait tirer plus gros) ; elles
       gardent 50 %.

     ── LE RELAIS ET LE SALON ──
     - RELAIS D'ORDRES (outils/relais.mjs, npm run relais), heberge sur
       Railway (service nebula-conquest, nebula-conquest-production.up.
       railway.app). Il reunit les joueurs, donne graine et reglages,
       attend que tous aient charge, puis envoie toutes les 50 ms un paquet
       numerote ; le paquet n s'applique au tour (n + 2) x 3 + 1 chez tous.
       Une page rechargee dans l'attente libere sa place ; un joueur parti
       pendant le chargement n'est plus attendu.
     - RESERVE ADAPTEE AU RESEAU (mesurerReseau) : le calcul garde sous le
       dernier paquet assez de tours pour couvrir la gigue mesuree. Gigue
       60 ms : de ~20 images figees en 40 s a 0 ; 150 ms : de ~65 a 0-2.
     - LA PARTIE CONTINUE PAGE CACHEE (avancerEnFond) : chaque paquet recu
       fait les tours dus, sans dessin ni son. Rattrapage rapide apres un
       gel du navigateur (10 ms de calcul par image, sons coupes).
     - UNE PARTIE EN RESEAU NE REPASSE PLUS PAR L'ECRAN TITRE : la
       connexion au compte y renvoyait en plein chargement et effacait la
       graine (vaisseaux et cometes differents).
     - SALON (bouton RESEAU de l'ecran titre) : partie rapide a 2, 4, 8 ou
       16 joueurs, lancee des qu'elle est pleine ; partie privee avec code
       de 4 lettres, joueurs et IA au choix. JUSQU'A 16 JOUEURS (16
       couleurs), carte choisie selon le nombre. Une partie a 16 sur la
       plus grande carte coute 0,56 ms de calcul par tour (3 % d'un
       ordinateur).
     - FIN DE PARTIE : l'elimine reste en spectateur (bandeau, bouton
       QUITTER) ; victoire a 80 % des astres ou au dernier joueur en vie,
       decidee au meme tour chez tous ; MENU repart d'une page neuve.
       Parties en reseau non enregistrees dans les statistiques (beta) -
       elles le sont depuis la v9.7.9.
     - Bandeau d'etat en haut de l'ecran : joueur, tour, reserve, gigue,
       images figees, alertes.

     ── CORRECTIFS DU JEU ──
     - LE MIMETISME POUVAIT FIGER LE JEU : un eclat ramene sur sa planete
       se scindait encore (2, 4, 8... jusqu'a 16 000 tirs). Un eclat ne se
       scinde plus. Le serveur 2 a sans doute le meme defaut (A FAIRE).
     - LE DEMOLISSEUR N'ATTEIGNAIT JAMAIS SA CIBLE : trop lent, il
       retombait sur sa propre planete (31 tirs sur 32). L'astre de depart
       ignore son tir tant qu'il n'en est pas degage.
     - UN CLIC CHOISIT L'ASTRE DU PREMIER COUP, puis Espace vise : zone de
       clic d'au moins 14 px a l'ecran (de loin : 2 clics sur 8 avant, 8
       sur 8 apres), clic hors du panneau central qui choisit aussi
       l'astre, curseurs qui ne bloquent plus le clavier.

     ── OUTILS ──
     - npm run lockstep (outils/lockstep-test.mjs) : la meme partie dans
       deux onglets, avec de vrais ordres, empreintes comparees a chaque
       tour ; signale aussi un gel. npm run relais : le relais, qui sert
       aussi le jeu pour essayer en local (?relais=...&salle=...).
     - DIAGNOSTIC DE DESYNCHRONISATION : a la premiere alerte, chaque joueur
       envoie au relais toute la partie a plat (detailPartie) ; le journal
       Railway donne les valeurs generales (dont le nombre de tirages du
       hasard) et les premieres valeurs qui different.

     ── ESSAIS EN LIGNE, CHROME CONTRE FIREFOX ──
     - Quatre essais : desynchronisation au tour 240 (maths), puis au tour
       60 (retour au titre), puis REUSSI : 3 min puis pres de 5 min
       identiques, memes scores et evenements, reserve 5 a 6 tours.
       Salon, fin de partie et 16 joueurs verifies avec des navigateurs
       pilotes.

v9.7.8 | 2026-09-29 | Reseau : la reconnexion
     ── MULTIJOUEUR RESEAU : LA RECONNEXION ──
     - COUPURE BREVE (page ouverte) : le jeu retente aussitot, puis toutes
       les 2 s pendant 3 minutes ; le relais renvoie les paquets manques
       et la partie repart. Bandeau "Connexion perdue - reconnexion".
     - PAGE FERMEE OU RECHARGEE : la partie est gardee dans le navigateur
       (30 minutes) ; l'ecran titre affiche "REPRENDRE LA PARTIE". Le
       relais renvoie le depart et tous les ordres : la partie est relancee
       avec la meme graine et rejouee en accelere (30 s de jeu en moins de
       2 s), puis le joueur reprend la main.
     - Un jeton secret par joueur : lui seul peut reprendre sa place.
     - Le relais garde les empreintes validees : le joueur qui rejoue est
       verifie tour par tour contre ce que les autres avaient.
     - Partie abandonnee de tous : gardee 3 minutes avant d'etre effacee.
     - Essai pilote : coupure puis rechargement en pleine partie, aucune
       desynchronisation, memes astres chez les deux joueurs.

v9.7.9 | 2026-09-29 | (en cours) Reseau : identite des joueurs et classement
     ── IDENTITE ──
     - Le jeu envoie au relais son jeton de session Supabase ; le relais le
       fait verifier et prend le pseudo dans la base. Sans compte : le nom
       annonce suivi de "(invité)" - plus moyen de jouer sous le pseudo
       d'un inscrit. Un compte n'a qu'une place par partie.
     ── CLASSEMENT (ELO) ──
     - Parties rapides seulement, entre joueurs connectes (au moins deux) ;
       les parties privees ne comptent pas (pas d'ELO gonfle entre amis).
     - Fin de partie : chaque joueur envoie le classement qu'il a calcule
       (gagnant, survivants par astres, elimines du dernier au premier -
       le tour de l'elimination est garde dans la partie). Le relais
       retient celui de la majorite ; desaccord ou desynchronisation : non
       classee. Le perdant qui quitte avant la fin perd quand meme.
     - ELO a plusieurs : chaque paire de joueurs compte comme un duel
       (K = 32 reparti). A deux joueurs de meme niveau : +16 / -16.
       Partie de moins de 30 s : non classee.
     - UN CLASSEMENT PAR TAILLE : parties a 2, 4, 8 et 16 joueurs, chacune
       son ELO (table elo_reseau, avec parties jouees et victoires). L'ELO
       du 1 contre 1 de l'ancien multijoueur n'est pas touche.
     - Ecran de fin : ligne "ELO 1000 → 1016 (+16)" (ou la raison si la
       partie ne compte pas). Salon RESEAU : onglets 2 / 4 / 8 / 16 J,
       les 10 premiers (ELO, victoires, parties) et sa propre ligne.
     ── BASE DE DONNEES ──
     - Fonction enregistrer_partie_reseau (appelable par le relais seul) :
       ELO et parties (colonnes mode, elo_avant, elo_apres) en une fois.
       Parties jusqu'a 16 joueurs acceptees.
     - FAILLE FERMEE : tout joueur connecte pouvait ecrire son propre ELO
       dans son profil. L'ELO ne s'ecrit plus que par le serveur.
     ── ESSAIS ──
     - Deux navigateurs, relais local, faux Supabase : pseudos verifies,
       partie identique jusqu'a la fin, +16 / -16 affiches, classement
       transmis. Cas limites verifies : meme compte deux fois, invite
       usurpateur, partie privee, desaccord, perdant parti, envoi en
       double, classement truque. npm run lockstep : toujours identique.
     - SUPABASE_SERVICE_KEY ajoutee au relais sur Railway.
     ── SPHERES CAPITALES (design F retenu) ──
     - Trois spheres-carapaces (vert, noir, rouge), rayon 40 comme une
       lune, en orbite autour du trou noir : un tour en 8 minutes, entre
       le trou noir et les soleils. Plaques de blindage qui tombent avec
       la vie, coeur lumineux visible par les trous ; de loin, un disque.
     - Seuls les petits vaisseaux d'une autre couleur les attaquent
       (tournent autour en tirant) ; la sphere riposte sans quitter son
       orbite. 4 000 PV : environ 700 perdus en 2 min d'attaques.
     - Detruite : explosion, astres a moins de 700 a 0 spore et sans
       production 1 min (champ "panne" des astres). Retour 3 min apres.
     - Verte : +5 spores toutes les 0,12 s sur l'astre le plus proche
       (240 du bord), tous camps ; noire : -5. Rouge : rien.
     - Tirs de spores absorbes par les spheres ; 20 000 spores d'un meme
       joueur en 30 s = capture (5 000 pour l'instant), anneau de
       progression a sa couleur.
       Pilotage 1 min en ZQSD (ordre "capital", camera qui suit), lourd,
       ne sort pas de la zone de jeu. Planete ou lune touchee : batiments
       detruits, 0 spore, production coupee 1 min. Soleil : tout le
       systeme. Trou noir : la sphere est perdue.
     - Solo et reseau ; pas dans l'ancien multijoueur ni le tutoriel.
       Section "Spheres capitales" dans l'aide.
     - Essais : orbite, mitrailleuses (+40 / -35 spores en 1 s),
       capture, pilotage au clavier, ecrasement planete et soleil,
       explosion, retour ; npm run lockstep identique ; deux navigateurs
       en reseau, capture et pilotage ZQSD : empreintes identiques.
     - CORRIGE : le jeu plantait a la capture d'une sphere. Prise en
       frolant un astre, elle s'y ecrasait aussitot, et son explosion
       passait une couleur "rgb(...)" a l'eclat d'impact, qui n'accepte
       que "#RRGGBB" : erreur a chaque image. Les eclats convertissent
       desormais toute couleur (couleurHex), et l'astre touche au moment
       de la capture est ignore tant qu'on ne s'en est pas ecarte.
     - Pilotee, la sphere n'est plus attaquee par les petits vaisseaux.
     - Capture a 5 000 spores pour les essais (20 000 prevu).
     - LES SPHERES DOMINENT LES PETITS VAISSEAUX (du spectacle : ce sont
       les joueurs qui doivent les prendre). Riposte 35 a 55 degats, 85 %
       de reussite, trait epais ; les petits ne font que 20 % de leurs
       degats et la sphere se repare (25 PV/s apres 5 s de calme). En
       5 min : 5 petits vaisseaux abattus, spheres intactes.
     - Mitrailleuses : chaque balle s'ecrase sur la face de l'astre
       tournee vers la sphere (etincelles) et fait sauter +5 ou -5.
     - L'APOCALYPSE a l'ecrasement : eclair blanc, boule de feu, trois
       ondes de choc, 160 etincelles, 42 nuages de gaz ejectes qui
       derivent 4 a 7 s, eclats de blindage, ecran qui tremble. Sur un
       soleil, chaque planete et lune du systeme s'embrase ensuite a son
       tour. Explosion aussi quand les petits vaisseaux l'abattent.
     - EXPLOSION ALLEGEE (elle faisait ramer) : nuages et boule de feu
       dessines a partir de taches preparees une fois (tacheDouce) au lieu
       de degrades refaits a chaque image, etincelles et debris traces par
       paquets, explosions secondaires du systeme en petit format. Mesure
       sur un ecrasement de soleil : 3,6 ms par image en moyenne -> 0,4 ms,
       16 ms au pire -> 5 ms.
     - ASTRES PARALYSES SIGNALES : sol assombri, anneau rouge en pointille
       qui tourne et palpite, et "PARALYSE 53 s" sous l'astre.
     - TRAINEE derriere la sphere pilotee, a la couleur du pilote, qui
       s'efface en 2,5 s.
     - LA SELECTION D'UN ASTRE AU PREMIER CLIC, POUR DE BON. Des l'appui la
       camera glisse vers l'astre ; au relacher (0,1 a 0,3 s plus tard) le
       jeu recalculait ce qu'il y avait sous le curseur, tombait souvent
       dans le vide et deselectionnait. Mesure avec de vrais clics (appui
       0,15 s) : 31 sur 120 prenaient. Maintenant l'astre sous le curseur
       a l'appui fait foi (un tir qui passe ne vole plus le clic) : 120 sur
       120, et 120 sur 120 avec un appui de 0,3 s et la souris qui bouge.
     - SPHERES : capture remise a 20 000 spores en 30 s.
     - SORTIE DU TROU NOIR : elles n'existent pas avant 3 min de jeu, puis
       sortent l'une apres l'autre (3:00, 3:08, 3:16). 5 s avant, le trou
       noir s'agite (bras de lumiere a leur couleur, lueur qui palpite) ;
       puis eclair, deux ondes, jet de lumiere et particules, la sphere
       grossit en s'eloignant (6 s), ecran qui tremble. Intouchable pendant
       la sortie. Detruite, elle ressort de meme 3 min plus tard.
     - PLUS D'ORBITE, UNE ROUTE : croisiere lente (40, 85 loin du but), cap
       qui tourne doucement, s'ecarte des astres et du trou noir.
       Verte : vers le joueur le plus faible ; noire : vers le meilleur
       (astres, puis spores) ; elles gardent leur joueur tant qu'un autre
       n'est pas nettement plus faible / plus fort (20-25 %), sinon demi-
       tour toutes les 4 s entre deux joueurs egaux. Rouge : pres d'un
       soleil, au point le plus eloigne des astres des joueurs.
     - npm run lockstep sur 20 000 tours (sortie et routes comprises) :
       identique.
     - PASSAGES AU LIEU DE POURSUITE (collees a leur joueur, la noire
       devenait une arme offerte au meilleur). Verte et noire errent vers
       des points au hasard (etapes de 50 s) ; a la fin d'une etape, 35 %
       de chances de partir en PASSAGE : droit sur l'astre le plus proche
       du joueur vise, a pleine vitesse ; a portee de tir, elle bifurque et
       file 900 plus loin, de l'autre cote, en mitraillant au passage, puis
       reprend son errance. Passage abandonne apres 90 s, puis 60 s sans
       nouveau passage. Mesure sur 10 min : 3 passages (verte), 4 (noire),
       tous reussis ; la noire a portee du meilleur joueur 12 % du temps
       (presque tout le temps avant). Rouge inchangee.
     - npm run lockstep sur 30 000 tours : identique.
     - VERIFICATION DES SONS : les 27 fichiers se chargent tous (verifie
       dans le navigateur, durees relevees) ; 7 jamais joues ; musiques
       d'ambiance de 27 a 31 s seulement (repetitives). CORRIGE : la
       tension qui fait passer la musique en mode agite prenait le joueur
       0 pour soi - en reseau, ses propres tirs agitaient la musique.
       SONS_A_CREER : priorite 5 (10 sons des spheres : presage, sortie,
       balles verte et noire, canon, capture, moteur en boucle,
       apocalypse, explosion, alerte) et priorite 6 (laser des duels,
       demolition, reseau : partie trouvee, connexion perdue, joueur
       revenu) ; propositions pour les 7 fichiers inutilises ; PDF
       regenere.
     - SONS : six musiques d'ambiance spatiale ajoutees a
       Audio/SONS_A_CREER.md, du plus lent au plus rapide (amb_espace_1 a
       6) ; PDF regenere.
     - LES IA CAPTURENT LES SPHERES. Toutes les 5 s, une IA dont les astres
       peuvent contenir 26 000 spores peut se mettre a ECONOMISER (chance
       selon la difficulte : 3 % facile, 12 % normal, 25-30 % difficile et
       brutal ; une seule IA a la fois) : plus de tirs ni d'achats (chaque
       achat de technologie vidait ses astres), 5 min au plus. Des qu'une
       sphere libre passe avec 24 000 spores a portee (3 200), elle la
       bombarde 30 s : jusqu'a 3 tirs toutes les 0,6 s, visee calculee sur
       la vraie courbe des tirs et la route de la sphere, tir seulement si
       le calcul touche. Capturee : elle la lance sur le systeme solaire
       ou la planete adverse qui fera le plus de degats, message a tous.
       Mesure : 50 a 85 % des spores tirees touchent la sphere ; en
       35 min, une capture sur deux parties (Nex, 29 min, 19 969 spores).
       npm run lockstep sur 24 000 tours : identique.
     - SPHERE PILOTEE : elle tirait sur l'astre le plus proche, quel qu'il
       soit (souvent un neutre, ou un astre du pilote). Pilotee, elle tire
       maintenant pour son pilote, a 350 au lieu de 240 : la verte n'arrose
       que ses astres, la noire ne ronge que ceux de ses adversaires. La
       rouge ne tire toujours pas. Verifie sur les 7 cas.
     - SURCHARGE DE CHARGE : l'astre qui charge un tir peut depasser son
       maximum sans limite (tout ce que le groupe envoie s'accumule) ;
       chiffre dore avec un eclair.
       Apres, le trop-plein s'evapore : 15 % de l'excedent par seconde
       (5 au moins), sauf tant qu'on le charge encore. Les renforts
       (jets amis, ondes solaires, debarquement) ne le ramenent plus d'un
       coup au maximum (ajouterSpores). Mesure (avec l'ancien plafond de 2
       fois) : lune de 2 000 chargee a 4 000, puis 3 136 a +2 s, 2 318 a
       +10 s, 2 000 a +30 s. Plafond retire ensuite.
     - MISSION TUTORIEL "PREMIERS PAS" (bouton MISSION TUTORIEL de l'ecran
       titre, et dans le livre des regles), a la place de l'ancien
       tutoriel en bulles (en partie perime). 9 objectifs, chacun valide
       quand le geste est vraiment fait : selectionner, regarder (ZQSD +
       molette), part d'envoi a 70 %, conquerir une planete neutre, nid,
       tir groupe (la planete de depart a peu de lunes, la mission les lui
       donne toutes, batailles et faune effacees), rafale, boule, defi
       final contre l'IA. L'astre vise est entoure ("ICI") ; l'IA dort
       jusqu'au defi ; boutons Passer l'etape / Arreter ; ecran de fin.
       Jouee de bout en bout dans le navigateur avec de vrais clics et de
       vraies touches.
     - TOUCHE K : tous les raccourcis en transparence par-dessus la partie
       (clavier, souris, en visee), sans bloquer la souris ; K referme.
     - OBSTACLES : petits vaisseaux et spheres capitales contournent le
       trou noir et les soleils (regard devant, ecart lateral) ; ceux qui
       les traversent quand meme sont detruits. Reapparition hors des
       obstacles. Mesure : 15 min sur 2 cartes, aucune perte.
     - CLIC DROIT SUR UN NOM (liste des joueurs) : Info (planetes, lunes,
       batiments, spores, production, commerces, mis a jour en direct) ou
       Commerce, 3 niveaux (grises avec la raison s'ils sont impossibles) :
       planete contre planete 10 spores / 20 s, systeme planetaire 100 /
       30 s, systeme solaire 1 000 / 40 s. Chaque cote envoie une boule
       doree (15 s de voyage au plus) ; le don passe au-dela du maximum.
       Fin uniquement a la premiere attaque entre les deux (fenetre
       "Alliance arretee avec X") ; pas de limite de duree. Un astre du
       commerce perdu est remplace par un autre (fin s'il n'en reste
       aucun). L'IA refuse si on l'a attaquee dans la
       minute ou si le demandeur est 2 fois plus fort. En reseau : ordres
       commerce / commerce_reponse (relais mis a jour), un humain accepte
       ou refuse dans une fenetre. Banc lockstep avec commerces : identique.
     - GRAPHISMES REFAITS (montres avant / apres, valides) :
       - planetes et lunes peintes pixel par pixel sur une vraie sphere
         (bruit de Perlin 3D) : oceans (continents, cotes, nuages, poles),
         deserts (dunes, canyons), gazeuses (bandes, tempete), glace
         (failles), rocheuses et lunes (crateres a rebord, mers, rayons,
         lave incandescente). Calque jour / nuit refait, lunes eclairees
         (si assez grandes a l'ecran) ;
       - soleils : granulation, taches, bord assombri ; couronne de jets
         peinte dans le halo, qui tourne lentement (couche CSS) ;
       - trou noir : disque d'accretion vu de biais, arriere devie
         au-dessus du trou, anneau de photons ; deux images qui se
         relaient (tourbillon), a la place des 3 ellipses ;
       - fond : nebuleuse discrete (voiles violets et bleus) ;
       - asteroides : rochers en relief peints d'avance, tournes vers leur
         soleil.
       Cout : rien de plus par image pour les textures (images toutes
       faites, avec copies a la bonne taille) ; asteroides aussi rapides ou
       plus ; planetes + lunes < 0,1 ms de plus a zoom moyen, plus rapides
       en zoom fort. Chargement : version legere (1,2 px par unite, ~1 s
       de dessin en tout), la haute definition se peint ensuite par petits
       morceaux quand le navigateur est libre (requestIdleCallback), les
       astres proches de la camera d'abord. Purement visuel : rien ne
       change dans la partie (reseau identique).
     - CORRECTIF (Firefox : planetes invisibles ou reduites a leur cercle
       en zoomant) : trop de petits canevas (9 par astre avec les copies
       reduites). Maintenant une seule image par planete et par lune, comme
       avant (copies reduites pour les soleils seulement), la version
       legere est liberee des que la haute definition arrive, tailles
       plafonnees (planetes 512, lunes 320, soleils 720), et si une image
       est refusee l'astre s'affiche en couleur unie au lieu de
       disparaitre. Haute definition : l'astre qu'on regarde de pres passe
       avant tout (8 ms par image jusqu'a ce qu'il soit net, ~1 s sur la
       machine d'essai), sinon 3 ms toutes les 0,4 s meme sans temps libre.
     - MESURES D'OPTIMISATION (rien change, gains trop faibles) : textes a
       l'ecran 0,15 ms par image ; empreinte reseau + detail ~1-2 ms une
       fois par seconde sur une vraie machine ; simulation < 1 ms par tour
       meme a 45 batailles (majLuttes = 40 %). Le reste du cout est cote
       carte graphique : a mesurer chez le joueur avec F3 puis D.
     - OPTIMISATIONS (mesurees, resultat identique) :
       - batailles : zonesRecalculer refaisait toutes les zones de chaque
         astre en lutte 5 fois par seconde, meme quand rien n'avait bouge
         (41 batailles sur 42 dorment) - un tiers du calcul de la partie.
         Il compare maintenant les cases a une photo et s'arrete si rien n'a
         change. Partie de 8 joueurs : 0,51 -> 0,37 ms par tour (-28 %).
         Preuve : empreintes identiques a 5, 10 et 15 min sur deux parties,
         avant et apres ;
       - empreinte reseau (chaque seconde) : les valeurs sont melangees
         directement (nombres par leurs 64 bits, -0 et NaN ramenes a un
         code, noms de champs codes une fois, cases 4 par 4) au lieu
         d'ecrire toute la partie en texte : 3,1 -> 1,6 ms. Meme empreinte
         pour un tableau ordinaire ou des champs dans un autre ordre ;
       - npm run lockstep sur 30 000 tours : identique.
       Tous les joueurs d'une partie doivent avoir la meme version (recharger
       la page) : l'empreinte a change de calcul.
     - CONTROLE DE VERSION en reseau : le jeu calcule l'empreinte de son
       propre code (versionJeu) et l'envoie en rejoignant ou en reprenant.
       Le relais ne met ensemble que des joueurs de meme version (parties
       rapides regroupees par version) ; sinon refus clair : "un joueur n'a
       pas la meme version du jeu : rechargez tous la page (Ctrl+Maj+R)".
       Reprise refusee aussi apres rechargement sur une nouvelle version.
       Essais : relais seul (4 cas) et vraie partie a 2 navigateurs.
       Le relais est modifie : a redeployer sur Railway.
     - HAUTE DEFINITION DANS UN WORKER : les textures HD se peignent dans
       un fil a part (le code des recettes lui est passe tel quel, seul
       _texturer y retient la recette au lieu de peindre) ; le jeu n'est
       plus interrompu du tout. Repli automatique sur la peinture par petits
       morceaux si le navigateur refuse. Essai de zoom sur 12 planetes :
       toutes nettes (11 restaient floues avant) ; copie publiee (dist,
       compactee) verifiee aussi.
     - REACTIVITE RESEAU : le delai ordre -> tir est deja presque minimal
       (la reserve suit la gigue du reseau) ; passer les paquets de 50 a
       33 ms ne gagnerait que ~8 ms en moyenne, pour un changement de
       protocole risque : laisse tel quel. A la place, le TIR REPOND AU
       CLIC : en reseau, le son et un bref eclair partent tout de suite
       (echoTir, purement local) ; le vrai tir suit sans rejouer le son.
       Essai a 2 navigateurs : son immediat, tir 82 ms apres, un seul son,
       pas de desynchronisation.
     - LE DEPART REFAIT (solo et reseau ; le tutoriel et l'ancien
       multijoueur gardent l'ancien) :
       - REGIME POLITIQUE d'abord : 9 cartes (image assets/regimes/<id>.jpg,
         icone tant qu'elle manque, nom, texte provisoire, stats en bas),
         3 points d'evolution offerts. Regimes parodiques (noms voulus) :
         Centre collaborateur G1 V1 D1, Gauche non solidaire G1 D1 S1,
         Dictature eclairee V1 D1 S1, Royaute a plusieurs G1 D2, Fascisme
         sympa V2 D1, Anarchie tres organisee V3, Ecolo mais pas trop G1
         S2, Communisme neoliberal G2 S1, Droite proletaire G3 (plafond 8).
         Chaque carte dit aussi, en italique, pourquoi ce regime a dissous
         ses adherents en spores pour conquerir l'univers ; le sous-titre
         rappelle le lore (la Terre detruite, seules des spores peuvent
         partir). Ordre 'regime'. En reseau 15 s,
         compteur "x / y joueurs ont choisi", hasard pour les retardataires ;
         les IA tirent le leur ;
       - PUIS LA PLANETE en 15 s pour tous : ordre 'reserver' (astre libre
         non reserve par un autre, changement possible jusqu'au bout,
         message si deja pris), anneau pointille a la couleur du joueur et
         son nom sur l'astre reserve, IA qui reservent entre 2 et 11 s ; a
         zero, chacun s'installe, astre au hasard sans reservation. En solo,
         bouton LANCER LA PARTIE (ordre depart_vite). Tout en tours : meme
         chose chez tous. Relais : ordres regime et reserver ajoutes.
       Essais : solo avec vrais clics (regime, reservation, changement, IA,
       installation), reseau a 2 navigateurs (regime au hasard, conflit sur
       la meme planete, depart au hasard, pas de desynchronisation),
       tutoriel inchange, npm run lockstep (adapte au depart) identique.
     - LORE REECRIT (Lore/HISTOIRE.md + PDF) d'apres l'idee de depart : en
       2387 la technologie est fantastique mais la Terre est detruite ; le
       seul moyen de partir est de devenir spore ; tous les partis
       politiques francais y transforment leurs adherents pour conquerir
       l'univers. 12 scenes (texte, prompt d'image, mouvement), images
       sans logos ni drapeaux de vrais partis.
     - HISTOIRE : bouton du menu (sous MISSION TUTORIEL) qui lance la
       cinematique : les 12 images (Lore/*.png envoyees par le createur,
       converties en JPG 1672 px, 34 Mo -> 5 Mo, assets/histoire/sceneNN.jpg)
       se fondent l'une dans l'autre avec un lent zoom alterne ; titre et
       texte de chaque scene en bas ; defilement seul (4 s + 55 ms par
       lettre), clic / Espace / fleches / points pour naviguer, PASSER ou
       Echap pour sortir ; ecran final NEBULA CONQUEST. La musique du titre
       continue.
     - MENU REORGANISE : deux grands boutons (JOUER SEUL contre l'IA,
       MULTIJOUEUR au hasard ou entre amis), REPRENDRE si une partie reseau
       est en cours, puis une rangee TUTORIEL / HISTOIRE / REGLES. Les trois
       modes de l'ancien serveur (MULTI matchmaking, LOCAL, COMPETITION)
       sont caches (code garde) : tout le multijoueur passe par le relais.
       Fenetre MULTIJOUEUR en deux cartes : AU HASARD (2/4/8/16, classee) et
       ENTRE AMIS (creer avec IA, ou rejoindre par code) ; la partie creee
       affiche son code en grand et un bouton COPIER LE LIEN D'INVITATION
       (?partie=CODE) : l'ami qui l'ouvre arrive directement dans la partie.
       Essai : creation, copie du lien, arrivee par le lien, depart a deux.
     - LORE : Lore/HISTOIRE.md (+ PDF), "La Chronique des Spores" en 12
       scenes (texte a l'ecran, prompt d'image IA, mouvement), style commun,
       couleurs ; les trois spheres deviennent les Jardiniers (verte), les
       Niveleurs (noire) et les Veilleurs (rouge). A venir : bouton
       HISTOIRE et cinematique dans le menu, quand les images seront faites.
     - UNE COURBE DE CROISSANCE PAR REGIME (COURBES_REGIME) : bosses
       (centre, largeur, hauteur), plancher 0,2, pic propre (0,8 Centre a
       1,25 Dictature), extinction pres du plein. Sans regime (tutoriel,
       ancien multijoueur) : la courbe commune. Calculee a chaque appel
       avec Math.* (pas de table), identique en reseau. Partout : production,
       zones de bataille, debit, fiche de l'astre, etiquette de rendement.
       Panneau NAISSANCE : la courbe du proprietaire (pic, temps et points
       gardes par regime), echelle jusqu'a 1,25, couleur jugee par rapport
       a son propre pic. Carte de regime : petite courbe + une phrase.
       IA (normale et brutale) : tire seulement des astres arrives dans leur
       bande de bon rendement (>= 90 % du pic, zone ecrite en dur), batit
       au-dessus de cette bande, et n'achete une technologie qu'avec le
       surplus (sinon l'achat vidait l'astre qui montait vers son pic).
       Essais : rendement moyen des IA sur 10 min, 3 parties, ancienne
       contre nouvelle IA : meilleur pour 6 des 8 regimes tires, egal pour
       Centre et Droite (ex. Ecolo 0,24 -> 0,56, Anarchie 0,2 -> 0,44) ; reseau a 2 navigateurs sans
       desynchronisation ; npm run lockstep 30 000 tours identique (deux
       graines). CORRIGE dans le banc lockstep : il choisissait un regime
       qui n'existe plus, la partie ne demarrait jamais (0 tir) ; il joue
       maintenant vraiment (719 tirs, 5 conquetes).
     - LOGOS DES REGIMES : 9 logos ironiques dessines en vectoriel
       (assets/regimes/<id>.svg, valides par le createur) : girouette a
       poignee de main, coeur casse a cadenas, ampoule couronnee, pile de
       couronnes, botte souriante a marguerite, gribouillis en grille,
       feuille a usine, piece d'or a casquette, cle a molette et cravate.
       Carte : logo entier et centre (plus de recadrage), l'icone se cache
       quand il est charge. Serveurs locaux (relais, banc) : type SVG ajoute.
     - LIVRE DES REGLES REMIS A JOUR : sections DEPART & REGIMES et
       COMMERCE & ALLIANCES (avant, caches dans Territoires) ; MULTIJOUEUR
       reecrit (AU HASARD classe, ENTRE AMIS avec code et lien, meme version
       exigee, REPRENDRE ; les anciens modes, guildes et equipes retires) ;
       Evolution corrigee (depart 3/4/2/1 + 3 points du regime, 8 max ;
       Growth +30 % par point, Velocity +6 de vitesse par point) ; clic
       droit sur un nom dans les controles ; mot sur l'HISTOIRE ; REGARDER
       en solo ; pied de page v9.7.9.
     - REPRISE ACCELEREE (REPRENDRE rejoue la partie depuis le debut) : plus
       de 10 s de retard, on ne dessine plus, 150 ms de calcul par image et
       une barre "REPRISE DE LA PARTIE : x %" ; pendant ce rejeu, empreinte
       toutes les 10 s seulement (le relais la compare toujours a celle des
       autres) et pas de detail de diagnostic. Mesure en vrai (relais, 2
       navigateurs, 6 IA) : 4,2 min de partie reprises en 13,6 s avant,
       7,4 s apres ; aucune desynchronisation.
       Maths identiques : sinus et cosinus sans petit tableau neuf a chaque
       appel (moins de memoire a ramasser), resultat identique au bit pres
       (npm run lockstep : meme empreinte finale qu'avant, 8885b2d5).
       Mesures 16 joueurs, 6 min : calcul ~1 ms par tour, image ~2 ms.
     - REPRISE INSTANTANEE (photo de la partie) : toutes les 30 s de jeu, le
       navigateur range dans IndexedDB une photo de tout ce que le calcul
       utilise (objets simples, tableaux, liens entre objets, etat du
       hasard) ; ce qui est propre a l'ecran (taille, camera, son, visee,
       textures) n'y entre jamais. REPRENDRE : la page refait la carte, pose
       la photo par-dessus (les astres existants sont remplis, pas
       remplaces : textures gardees) et ne demande au relais que les paquets
       suivants. Filet : au moindre ecart d'empreinte, photo effacee et page
       rechargee pour une reprise complete automatique. Relais : un joueur
       revenu est de nouveau compare aux autres (a redeployer sur Railway).
       Le generateur de hasard expose son etat (memes tirages).
       CORRIGE en essai : une page fraiche n'avait pas les grilles des
       batailles de surface (preparees au premier combat) : le dessin
       plantait apres la reprise ; elles sont preparees a la restauration.
       Essais : banc photo -> rechargement -> reprise sur 9 parties de 5 a
       12 min, valeur par valeur : identique ; reseau a 2 navigateurs,
       7,2 min de partie reprises en 4,5 s (13,6 s pour 4 min avant), relais
       "identiques" ensuite ; photo volontairement abimee : ecart vu au tour
       suivant, rechargement et reprise complete automatiques, identiques
       ensuite ; npm run lockstep identique (8885b2d5). Photo : ~3 000
       objets, 3 ms, ~1 Mo.
     - FIREFOX : planetes qui disparaissent apres le choix du regime
       (signale par le createur ; Chrome normal, Firefox introuvable ici).
       Interrupteurs d'essai dans l'adresse pour trouver la cause :
       ?travailleur=0 (haute definition sans Worker) et ?hd=0 (textures
       legeres seulement). Resultat Firefox : hd=0 bon, travailleur=0 non
       (la cause n'est pas le Worker). Puis ?tex=logiciel / bitmap / garder,
       et 4 anciennes versions publiees dans essais/1 a 4 pour trouver le
       patch fautif (a retirer ensuite). Bilan : version 1 (avant le Worker)
       bonne, versions 2 a 4 (Worker) mauvaises. CORRIGE : sous Firefox, pas
       de Worker, la haute definition se peint par petits morceaux comme
       avant (?travailleur=1 pour le forcer quand meme). Et dessinerVisible :
       zoome tres fort, seule la partie a l'ecran d'un astre est posee
       (Firefox n'affichait plus les soleils quand l'image devenait immense).
       Pas suffisant (la plupart des planetes disparaissaient encore) : la
       vraie cause est le NOMBRE de grandes images (une par planete, plus de
       150 sur une grande carte). HAUTE DEFINITION A LA DEMANDE (majHD) :
       planetes et lunes gardent leur version legere, la grande ne se peint
       que pour l'astre zoome (environ 1,5 s), 10 au plus, les plus
       lointaines hors ecran repassent en legere. Memoire des textures :
       56 Mo -> 7 Mo. Soleils inchanges. Modes ?tex= retires.
       Toujours pas (zoomer sur une planete fait tout disparaitre peu a
       peu, alors que hd=0 va bien) : sous Firefox, les canevas des textures
       sont crees en memoire ordinaire (willReadFrequently), pas sur la
       carte graphique ; ?tex=gpu pour l'ancien comportement, ?tex=bitmap
       pour essayer des ImageBitmap. RESULTAT Firefox : seule l'ImageBitmap
       tient. CORRIGE : sous Firefox, chaque grande texture de planete ou de
       lune devient une ImageBitmap (?tex=canevas pour s'en passer). Les 4
       versions d'essai (essais/) sont retirees.
     - UNE SEULE COURBE DE CROISSANCE (choix du createur) : les courbes par
       regime sont retirees (cartes, panneau NAISSANCE, IA). Nouvelle courbe
       a la facon d'OpenFront : (0,08 + remplissage^0,75) x (1 - remplissage),
       pic vers 40 % (9/10 du pic des 22 % aux 57 %), puis ralentissement
       jusqu'au plein. Puissance 0,75 par deux racines carrees : exacte
       partout, identique en reseau. Plus genereuse que l'ancienne au milieu
       (de 10 a 50 % : 2,5 fois plus vite). IA : tire au-dessus de 22 %,
       batit au-dessus de 57 %. Regles mises a jour.
     - RACCOURCIS DU PARASITE : 4 construit un foyer putride (refuse, ecran
       qui vibre, si une spore attend deja) ; G arme / desarme la spore
       parasitaire pendant la visee (armerParasite), le clic la lance.
       Regles, touche K et commentaires des touches mis a jour.
     - MUTATIONS TROIS FOIS PLUS CHERES : 1re branche 3 000 + 300 par
       niveau, 2e 6 000 + 600, 3e 9 000 + 900 (avant 1 000 / 2 000 / 3 000
       et +100 / +200 / +300). Regles mises a jour.
     - CLIC DROIT SUR UN ASTRE = SA FICHE : le menu radial est retire (tout
       passe par les touches : Espace, 1 a 4, F, G, R, T) ; en visee, le
       clic droit annule toujours. La fiche (INFOS) montre en plus les
       batiments de l'astre : alveoles, nids, biomes, et le parasite (pret
       ou en cours), mise a jour en direct. Regles et touche K a jour.
     - BASE SUPABASE EN FICHIERS (dossier supabase/) : etat initial des
       tables de Nebula releve sur la base en ligne (15 tables, 3 vues,
       6 fonctions, 1 declencheur, 43 regles d'acces, droits), dans
       supabase/migrations/20261002120000_etat_initial_nebula.sql. Verifie :
       rejoue sur un Postgres vide, puis empreinte (supabase/signature.sql)
       identique a la base en ligne sur 341 elements. README : regle d'or
       (plus de changement a la main), comment faire un changement, mise en
       route unique (migration repair), tables d'autres applis (lfs_*,
       comptes_rendus, dossiers) laissees dehors. README du depot complete.
       Historique en ligne synchronise (autorise par le createur) : etat
       initial marque comme applique dans supabase_migrations (rien
       execute, rien efface) ; les 5 anciens changements ont un fichier
       vide de meme nom. En ligne et fichiers : les memes 6 entrees.
     - LE JEU DECOUPE EN FICHIERS (dossier src/) : la page (src/page.html),
       le style (src/css/, 2 fichiers) et le code (src/js/, 60 fichiers
       ranges en noyau, moteur, rendu, reseau, interface, audio, comptes,
       donnees). index.html est FABRIQUE par npm run construire
       (outils/construire.mjs) : chaque ligne <!--#inclure ...--> est
       remplacee par le fichier, le code reste un seul script dans le meme
       ordre (meme "use strict", memes regles, meme version entre joueurs).
       Verifie : le index.html refabrique etait identique octet pour octet
       a l'ancien ; chaque fichier de code se lit seul (node --check).
       Le journal (ce texte) passe de l'en-tete de index.html a JOURNAL.md ;
       la page garde un court bloc SUIVI DE PROJET. Guide : src/LISEZMOI.md.
     - TESTS AUTOMATIQUES SUR GITHUB (.github/workflows/verifications.yml),
       a chaque envoi : 1) fabrication et code (npm run verifier :
       index.html a jour, chaque fichier de src/js et les scripts assembles
       se lisent, outils et tests aussi) ; 2) base : les migrations rejouees
       sur un Postgres 17 vide (supabase/tests/rejouer.sh, avec une
       imitation de Supabase) ; 3) parties dans Chromium : banc lockstep,
       tests/partie-solo.mjs (regimes, 3 min de jeu, fiche, K, aucune
       erreur), tests/reseau.mjs (deux navigateurs par le relais, identiques,
       rechargement et reprise depuis la photo, toujours identiques).
       npm test lance tout en local. Essais ici : tout passe ; un index.html
       pas refabrique est bien refuse. Premier passage sur GitHub : vert.
     - PUBLICATION PROTEGEE : le site n'est plus publie directement depuis
       main ; un 4e job « Publication du site » le publie seulement si les
       3 verifications sont vertes (sur main uniquement). Sinon le site
       garde la version precedente. Reglage : Pages > Source = GitHub Actions.
       Premier essai : le test reseau a echoue, publication bien bloquee.
     - CORRECTIF REPRISE (adresse ?relais=...&salle=...) : une page
       rechargee en pleine partie rejoignait AUSSI la salle comme un nouveau
       joueur ; selon la vitesse de la machine, ca annulait la reprise.
       Maintenant elle reprend sa place, et ne rejoint plus si une reprise
       a demarre. Le test reseau affiche ce que voit le joueur 2 s'il echoue.
     - SECURITE SUPABASE (migration 20261002130000_securite_vues_fonctions) :
       les 3 alertes du conseiller Supabase sont reglees. 1) leaderboard et
       guild_leaderboard lisent avec les droits du lecteur (security_invoker),
       classement identique avant/apres ; 2) increment_bot_votes reservee au
       serveur (le jeu ne l'appelait pas) ; 3) nc_membre* rangees dans le
       schema prive, hors API, les regles des tables long_* marchent toujours
       (essai : membre oui, intrus non). Base en ligne = fichiers (empreinte,
       11 familles). Protection des mots de passe fuites activee (tableau de
       bord) : le conseiller Supabase ne signale plus aucune alerte.
     - Reglages Claude (.claude/settings.json) : outils Supabase autorises
       sans confirmation, sauf actions sur le projet entier.
     - RANGEMENT SUPABASE : les 7 tables de l'appli de recettes (lfs_*) sont
       copiees dans le schema archive (non publie), copie verifiee identique
       (migration 20261002140000_archiver_recettes), puis retirees de public
       (20261002140100, lance par l'utilisateur dans l'editeur SQL). Comptes
       rendus et dossiers (appli pise, toujours utilisee) : non touches,
       donnees, regles, droits et colonnes identiques avant/apres.
     - PARTIES COUPEES PAR LES MISES A JOUR : Railway relancait le relais a
       CHAQUE envoi sur main (meme pour le site ou le journal) ; les parties
       ne vivant qu'en memoire, elles disparaissaient (« Reprise impossible :
       partie introuvable »). railway.json : le relais ne se relance plus que
       si relais.mjs, package*.json ou railway.json changent. Et a l'arret,
       le relais previent les joueurs (« Partie interrompue : le serveur a
       redemarre ») au lieu de les laisser chercher la partie.
     - HISTOIRE : les textes des scenes 1 a 6 remplaces par ceux de
       l'utilisateur (villes flottantes, vin bon pour la sante, partis unis
       dans leur mediocrite, savants, machines, publicite), orthographe
       corrigee. Jeu (histoire.js) et Lore/HISTOIRE.md. Le temps d'affichage
       suit la longueur du texte ; la scene 1 tient sur 3 lignes.
       Puis scenes 7 a 12 aussi (confins de l'univers, militants coute que
       coute, nouvelles especes, « L'humanite spore est a son commencement »).
     - AUDIT ATTAQUE / DEFENSE : carte complete du systeme + 3 parties de
       40 min entre IA en accelere, chaque combat releve (avant/apres).
       Corrige :
       1) RENFORTS PERDUS : des spores envoyees a son propre astre assiege
          disparaissaient (body.spores ecrase par la somme des zones au pas
          de lutte suivant) - essai a l'identique : +300 = rien. Maintenant
          elles vont dans la plus grande zone du proprietaire et poussent
          contre l'envahisseur. Meme correction (ajouterSpores /
          retirerSpores / viderSpores) pour ondes solaires, commerce,
          spheres verte/noire, comete, sphere ecrasee, achat de techno
          (gratuit sur un astre assiege). Renforts perdus : 77 % -> ~12 %
          (le reste = combats simultanes).
       2) PARASITE INCURABLE : la regle « 500 spores normales l'eliminent »
          ne marchait jamais (branche jamais atteinte). Essai : 300 puis
          600 -> parasite elimine. Et le maitre du parasite qui prend l'astre
          n'y garde plus son propre parasite.
       3) SACRIFICE INUTILE : apres les 10 paliers de multiplicite, le
          reglage continuait de couper la production (IA : 15 a 34 % toute
          la partie). Plus de sacrifice une fois les 10 paliers atteints, ni
          dans les zones de lutte (ou il ne rapportait rien).
       4) VOL DE SPORES : un debarquement (tir de surface) ou une zone qui
          fond versait au nouveau venu les spores de la zone ennemie (prorata
          sans verifier le camp). Le prorata ne suit plus que son camp.
       5) VISEE DES IA : temps de vol estime 5x trop long et gravite ignoree
          -> 24 % des tirs touchaient leur cible, 56 % finissaient dans le
          vide. Visee par la vraie trajectoire (angles essayes autour de la
          cible, trajet croisant un soleil ecarte) : 72 % touchent, 9 % dans
          le vide (sauf difficulte facile, inchangee). Les IA normales et
          difficiles sont donc nettement plus fortes.
       Constate, pas change (a decider) : fin de partie souvent bloquee a
       3-4 joueurs sans atteindre 80 % des astres (parties de 40 min sans
       vainqueur) ; IA faibles qui ne tirent presque plus une fois assiegees
       ; la tenacite (ceinture verte) et le mimetisme creent des spores (x5
       au niveau 10) ; les stats peuvent depasser 8 par la multiplicite ;
       la defense d'un astre ne vient que de la faune, des biomes, des
       alveoles et des contre-poussees (le stock du defenseur ne freine pas
       l'attaque, chaque case a un prix fixe). Tests : banc lockstep
       identique (4c0f74cc), solo et reseau ok.
     - LA DEFENSE PAR LES SPORES (demande du createur) : avant de prendre une
       case, l'attaquant doit tuer ses defenseurs = les spores de la zone
       reparties sur ses cases. Prix d'une case = prix du sol + defenseurs
       (le defenseur les perd aussi), et temps = sol + 2 x defenseurs : le
       front ralentit d'autant (LUTTE_CADENCE devient un budget de temps par
       zone, z.travail). Essai, 4000 spores sur une planete de 4900 : contre
       100 defenseurs ~25 cases/s, contre 3000 ~10, contre une planete pleine
       ~5. Le devis de visee compte les defenseurs ; l'IA normale evite les
       astres pleins. Regles mises a jour (ON ACHETE LE SOL).
     - IA FAIBLES (2 astres ou moins) un peu remontees : +30 % de production,
       riposte des 20 % de remplissage (au lieu de 50), et ne tirent plus que
       sur ce qu'elles peuvent prendre d'un coup (elles se vidaient sur des
       planetes trop cheres, ex. depart sur une lune de 1000). Sur 4 parties
       de 30 min : elles tiennent en moyenne 2 a 4 min de plus et tirent plus.
       Humains non concernes.
     - MIMETISME : deux fois plus cher a chaque palier. Regles mises a jour.
       Banc lockstep identique (4c869494), solo et reseau ok.
     - LA GARNISON (demande du createur) : le pourcentage d'envoi d'un tir
       decide de sa part d'attaque. A l'arrivee, toutes ses spores entrent
       dans la zone, mais seule cette part pousse (elan) ; le reste tient le
       terrain pris et le defend (30 % envoyes = 30 % attaquent, 70 % en
       garnison ; 100 % = assaut total ; rafale/demolisseur = tout attaque).
       jet.part, engagerLutte(..., part), renforts d'un astre assiege pareil,
       devis de visee aussi. Essai 3000 sur planete pleine : a 50 %, 1500
       spores gardent ~200 cases, l'IA ne les reprend que lentement.
     - Pas de riposte automatique pour les joueurs (choix du createur).
     - TOUCHES : A / E reglent l'envoi de 10 en 10 (cale sur la dizaine) ;
       Shift + A / Shift + E reglent le sacrifice (multiplicite) de 5 en 5,
       0 a 50 %. Parasite : G arme, G encore (ou G en pleine visee) la lance
       vers le curseur ; Shift + G = construire le foyer putride (comme 4).
       Regles et aide des touches mises a jour.
     - Panneau EVOLUTION : les onglets Evolution et Mutations sur la meme
       ligne (icone a cote du texte, plus de retour a la ligne).
       Banc lockstep identique (72eefb0c), solo et reseau ok.
     - HISTOIRE AU PREMIER LANCEMENT : la cinematique se lance toute seule
       des que le menu principal est a l'ecran (apres connexion ou choix
       hors ligne), une seule fois par navigateur (nc_histoireVue). Pas
       quand on arrive par un lien d'invitation. Une partie qui demarre la
       ferme. Essai : navigateur neuf, Echap, deuxieme visite, invitation.

   À FAIRE
  🎯 SERVEUR 2 (gameLoop.js, depot a part) : reporter le correctif du
     mimetisme - un eclat (tir parti vers une lune) ne doit pas se scinder
     a son tour. Sans ca, une partie multi peut s'emballer jusqu'au gel.
  🎯 MULTIJOUEUR RESEAU (lockstep, bouton RESEAU) - la suite :
     - verifier l'ELO en ligne : une partie rapide a deux comptes ;
     - tester Safari (maths fixes deja en place) ;
     - remplacer a terme le multijoueur actuel (serveur 2), puis l'arreter
       - un seul moteur de jeu au lieu de deux (index.html et gameLoop.js) ;
     - duree de partie a revoir pour les grandes parties (16 joueurs).
  🎯 VAISSEAUX CAPITAUX : faits en v9.7.9 (spheres), IA comprise.
     Equilibrage a voir en partie : a 20 000 spores la capture est rare
     (une IA y arrive vers 25-30 min) - 12 000 a 15 000 la rendrait plus
     frequente pour tous.
     Idee d'origine : 3 grands vaisseaux, memes
     couleurs que les petits (vert, noir, rouge), qui tournent tres
     lentement autour du trou noir sans jamais devier de leur course.
     - Beaucoup de points de vie ; ils se defendent contre les petits
       vaisseaux des autres couleurs, seuls capables de les detruire.
     - Detruit : enorme explosion - spores a zero et production coupee
       1 minute sur tous les astres alentour.
     - Vert : en passant pres d'un astre, tire en mitrailleuse des paquets
       de 5 spores qui s'AJOUTENT (quel que soit le camp). Noir : tirs en
       mitrailleuse qui DETRUISENT 5 spores. Rouge : ne fait rien.
     - Capture : 20 000 spores envoyees sur lui en moins de 30 s. Le
       joueur le pilote 1 minute (ZQSD). Ecrase sur une planete : tous ses
       batiments detruits, spores a zero pendant 1 min. Ecrase sur un
       soleil : toutes les planetes du systeme a zero spore et zero
       production pendant 1 min.
     - En reseau, tout cela passe par des ordres (pilotage ZQSD compris).
  🎯 Hebergement : le relais est tres leger (moins de 1 Ko/s par joueur) ;
     Railway suffit. Un serveur Hetzner (~5,50 €/mois) reste une option
     si le trafic grossit. Dans Railway, garder "Watch Paths" sur
     outils/relais.mjs pour ne pas couper les parties a chaque mise a jour.
  🎯 Sons (à faire à la maison) : la liste precise est dans
     Audio/SONS_A_CREER.md (et .pdf) - 12 sons (noms de fichiers, moments,
     durees, ambiance), 6 musiques d'ambiance spatiale du plus lent au plus
     rapide (amb_espace_1 a 6, 2 a 4 min en boucle), 10 sons des spheres,
     5 sons de duels / demolition / reseau, et les 7 fichiers inutilises a
     refaire sous le meme nom pour un nouveau role (priorite 7 : debut de
     partie, alerte, jet detruit, nid, mutation, systeme complet gagne /
     perdu). Un professionnel va les faire ; les brancher a reception.
  🎯 Page itch.io avec screenshots
  🎯 Au moment de publier : faire servir dist/ par l'hebergeur, apres
     npm install puis npm run brouiller - jamais le index.html du depot.
  🎯 Contacter des YouTubers
```
