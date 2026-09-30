# Sons à créer — Nebula Conquest (v9.7.9)

Dépose chaque fichier dans ce dossier `Audio/` avec **exactement** le nom indiqué,
puis dis-le à Claude : il les branche dans le jeu.

**Vérification du 30 septembre 2026** : les 27 fichiers actuels se chargent
tous correctement. 7 d'entre eux ne sont jamais joués (voir en bas). Les
musiques d'ambiance actuelles ne durent que 27 à 31 secondes et tournent en
boucle : on les entend se répéter, d'où les six nouvelles musiques plus
longues. Les nouveautés (sphères capitales, duels de vaisseaux, démolitions,
jeu en réseau) n'ont pas encore de son à elles : c'est l'objet des
priorités 5 et 6. La priorité 7 redonne un rôle aux 7 fichiers inutilisés.

## Format commun

- **MP3**, 44,1 kHz, mono suffit (stéréo accepté).
- **Aucun silence au début** : le son doit partir dès la première milliseconde,
  sinon il paraît en retard sur l'action.
- Crête à environ -1 dB, sans saturation. Le jeu règle le volume de chaque son.
- Les **boucles** doivent se raccorder sans clic ni trou entre la fin et le début.
- Rester dans l'univers actuel : organique et spatial (spores, vie, cristal),
  pas de sons militaires ni de lasers.

## Priorité 1 — les moments les plus fréquents

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `tir_surface.mp3` | Un tir de surface retombe sur le sol d'une planète | 0,4 à 0,8 s | Impact sourd et mou, comme une poignée de graines qui s'écrase |
| `riposte.mp3` | Touche R : tes zones repartent à l'assaut | 0,8 à 1,2 s | Montée rapide puis élan, un « souffle » collectif |
| `refus.mp3` | Action impossible (l'écran vibre) | 0,2 à 0,3 s | Petit « bonk » grave et étouffé, jamais agressif |
| `astre_perdu.mp3` | Un de tes astres est conquis par l'ennemi | 1 à 1,5 s | Descendant, grave, un peu alarmant |

## Priorité 2 — les récompenses et signaux

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `palier_multiplicite.mp3` | Un point de multiplicité est gagné | 1 à 1,5 s | Carillon cristallin qui monte, gratifiant |
| `astre_sature.mp3` | Un de tes astres devient plein (une seule fois, pas en continu) | 0,5 à 1 s | Grésillement doux d'étincelles |
| `tete_de_pont.mp3` | Tu prends pied sur la planète de quelqu'un d'autre | 0,5 à 0,8 s | Ancrage, un « tchac » organique qui s'accroche |

## Priorité 3 — les boucles d'ambiance de jeu

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `charge_tir.mp3` | En boucle pendant la visée, quand les astres voisins alimentent le lanceur | 1 à 2 s, **boucle** | Bourdonnement qui monte légèrement, énergie qui s'accumule |
| `front_bataille.mp3` | En boucle quand une bataille de surface est à l'écran | 2 à 3 s, **boucle** | Grignotement, fourmillement, très discret sous la musique |

## Priorité 4 — six musiques d'ambiance spatiale

Elles s'ajoutent aux 10 musiques déjà présentes (`amb_calm_1` à `5`,
`amb_tense_1` à `5`). Le jeu choisit la musique selon la tension de la
partie : les lentes quand tout est calme, les rapides pendant les grandes
batailles et quand les sphères capitales sortent du trou noir.

Format propre aux musiques (il remplace le format commun ci-dessus) :

- **MP3 stéréo**, 44,1 kHz, 192 kbit/s ;
- **2 à 4 minutes**, en **boucle** : la fin doit se raccorder au début sans
  trou ni clic ;
- **ni fondu d'entrée ni fondu de sortie** : c'est le jeu qui fait les fondus ;
- même volume perçu pour les six (environ -14 LUFS), pour qu'aucune ne
  saute aux oreilles ;
- de l'espace et du souffle, sans mélodie trop présente : elles tournent
  longtemps sous le jeu.

| Fichier | Titre | Tempo | Quand | Ambiance |
|---|---|---|---|---|
| `amb_espace_1.mp3` | Vide intersidéral | Très lent, sans rythme (environ 60 BPM) | Début de partie, calme plat | Drone grave et profond, longues nappes froides, quelques éclats cristallins très espacés |
| `amb_espace_2.mp3` | Nébuleuse | Lent (environ 70 BPM) | Calme | Nappe chaude qui respire, arpège doux et rare, brume lumineuse |
| `amb_espace_3.mp3` | Dérive des soleils | Modéré (environ 85 BPM) | Calme, partie qui s'installe | Pulsation de basse légère, textures scintillantes, sensation de lent voyage |
| `amb_espace_4.mp3` | Courants gravitationnels | Modéré (environ 100 BPM) | Premières escarmouches | Arpèges de synthé en boucle, percussion feutrée, légère tension |
| `amb_espace_5.mp3` | Tempête de spores | Rapide (environ 115 BPM) | Batailles | Rythme régulier et organique, basses pulsées, montée continue |
| `amb_espace_6.mp3` | L'éveil des sphères | Rapide (environ 130 BPM) | Grands moments : sortie des sphères, grosses batailles, fin de partie serrée | Percussions profondes et organiques, nappes amples et épiques, urgence sans agressivité |

## Priorité 5 — les sphères capitales

Elles n'ont aucun son à elles pour l'instant : leur sortie et leur
explosion reprennent le petit son d'une seconde des vaisseaux, bien trop
faible pour une apocalypse.

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `sphere_presage.mp3` | 5 s avant qu'une sphère sorte du trou noir, pendant que le trou noir s'agite | 5 s | Grondement sourd qui monte, comme une masse qui remue au fond d'un puits |
| `sphere_sortie.mp3` | La sphère jaillit du trou noir | 2 à 3 s | Déchirure puissante, souffle, puis longue résonance métallique grave |
| `sphere_arrose.mp3` | Chaque balle de la sphère verte sur un astre (+5 spores) | 0,05 à 0,1 s | Petit « plic » cristallin, très discret : il peut sonner 8 fois par seconde |
| `sphere_ronge.mp3` | Chaque balle de la sphère noire sur un astre (-5 spores) | 0,05 à 0,1 s | Petit « tac » sec et sombre, très discret : même fréquence |
| `sphere_canon.mp3` | La sphère riposte contre un petit vaisseau | 0,3 à 0,5 s | Tir lourd et grave, un « boum » étouffé |
| `sphere_capture.mp3` | Un joueur prend le contrôle d'une sphère | 1,5 à 2 s | Verrouillage, puis montée de puissance |
| `sphere_moteur.mp3` | En boucle tant que tu pilotes une sphère | 2 à 3 s, **boucle** | Réacteur lourd et régulier, grave |
| `sphere_apocalypse.mp3` | La sphère s'écrase sur une planète ou un soleil | 4 à 6 s | Énorme déflagration, souffle, débris qui retombent, grave qui s'éteint lentement |
| `sphere_explosion.mp3` | La sphère est abattue par les petits vaisseaux | 2 à 3 s | Grosse explosion, un cran en dessous de l'apocalypse |
| `alerte_sphere.mp3` | Une IA lance une sphère capturée sur un système | 1 à 1,5 s | Sirène grave de deux notes, inquiétante sans être stridente |

## Priorité 6 — combats de vaisseaux, démolitions, réseau

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `laser_duel.mp3` | Tir de laser entre deux petits vaisseaux de couleurs différentes | 0,2 à 0,3 s | Trait bref et léger, discret : il peut sonner souvent |
| `demolition.mp3` | Un bâtiment est détruit (démolisseur, écrasement de sphère) | 0,5 à 0,8 s | Effondrement court, craquement organique |
| `partie_trouvee.mp3` | Salon RÉSEAU : tous les joueurs sont là, la partie démarre | 1 à 1,5 s | Accord qui s'ouvre, promesse de départ |
| `connexion_perdue.mp3` | Réseau : la connexion est coupée (le jeu tente de revenir) | 0,5 s | Deux notes descendantes, discrètes |
| `joueur_revenu.mp3` | Réseau : un joueur revient dans la partie, ou ta reconnexion réussit | 0,5 s | Deux notes montantes, discrètes |

## Petits sons d'interface (facultatif)

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `tab.mp3` | Touche Tab, passage à l'astre suivant | 0,05 à 0,1 s | Tic très léger |
| `envoi_reglage.mp3` | Touches A / E, changement du pourcentage d'envoi | 0,05 à 0,1 s | Cran de molette, légèrement plus aigu vers le haut |

## Priorité 7 — les 7 sons déjà présents, à refaire

Ces 7 fichiers sont dans le dossier mais le jeu ne les joue jamais, et
certains ne correspondent plus à rien (les alliances n'existent plus). On
les **garde sous le même nom** et on les refait pour un nouveau rôle : il
suffira de remplacer les anciens fichiers par les nouveaux.

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `banner_v1.mp3` | Début de partie : le choix des planètes est fini, la partie commence | 1,5 à 2 s | Ouverture ample et lumineuse, comme un rideau qui se lève sur la galaxie |
| `signal_v1.mp3` | Un jet ennemi fonce sur un de tes astres (alerte) | 0,6 à 1 s | Deux bips d'alerte discrets et organiques, qu'on remarque sans sursauter. |
| `intercept.mp3` | Un de tes jets est détruit en vol : vaisseau rouge, comète ou étoile | 0,4 à 0,7 s | Petit éclatement étouffé, une poignée de spores qui se disperse |
| `nidification.mp3` | Un nid est construit. Le son général des bâtiments reste pour les alvéoles et les biomes | 1 à 1,5 s | Organique et chaleureux, quelque chose qui s'installe et commence à pousser |
| `trade_orb_v1.mp3` | Achat d'une mutation : tête chercheuse, ténacité ou mimétisme | 1 à 1,5 s | Transformation : scintillement cristallin qui se referme, sensation de gain |
| `Alliance_v1.mp3` | Tu prends tout un système solaire (bonus de système complet) | 1,5 à 2 s | Accord qui s'élève et s'accomplit, victoire à petite échelle |
| `Alliance_break_v1.mp3` | Tu perds le bonus de système complet (un de ses astres t'échappe) | 0,5 à 1 s | Accord qui se défait, courte chute, sans dramatiser |

Le fichier `tct` (qui ne contient que le mot « Audio ») semble être un reste :
il peut être supprimé.
