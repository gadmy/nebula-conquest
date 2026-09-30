# Sons à créer — Nebula Conquest (v9.7.9)

Dépose chaque fichier dans ce dossier `Audio/` avec **exactement** le nom indiqué,
puis dis-le à Claude : il les branche dans le jeu.

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
| `alerte_attaque.mp3` | Un jet ennemi fonce sur un de tes astres | 0,6 à 1 s | Deux bips d'alerte discrets. Écoute d'abord `signal_v1.mp3` : il convient peut-être déjà |

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

## Petits sons d'interface (facultatif)

| Fichier | Quand il joue | Durée | Ambiance |
|---|---|---|---|
| `tab.mp3` | Touche Tab, passage à l'astre suivant | 0,05 à 0,1 s | Tic très léger |
| `envoi_reglage.mp3` | Touches A / E, changement du pourcentage d'envoi | 0,05 à 0,1 s | Cran de molette, légèrement plus aigu vers le haut |

## Déjà dans le dossier mais jamais joués

Ces 7 fichiers sont chargés au démarrage sans jamais servir. Dis à Claude,
pour chacun, à quel moment le jouer, ou s'il faut le supprimer :

- `Alliance_v1.mp3` — une alliance se forme ?
- `Alliance_break_v1.mp3` — une alliance se rompt ?
- `banner_v1.mp3` — le bandeau de début de partie ?
- `signal_v1.mp3` — une alerte (voir `alerte_attaque` plus haut) ?
- `nidification.mp3` — un nid construit ? (`build_complet_v1.mp3` joue déjà pour tous les bâtiments)
- `trade_orb_v1.mp3` — ?
- `intercept.mp3` — un jet intercepté ?

Le fichier `tct` (qui ne contient que le mot « Audio ») semble être un reste :
il peut être supprimé.
