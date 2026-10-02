# Le code du jeu (dossier `src/`)

Le jeu est rangé ici par thème. La page que reçoivent les joueurs, `index.html` à la racine, est **fabriquée** à partir de ces fichiers :

```bash
npm run construire                 # refait index.html après une modification
npm run construire -- --verifier   # dit si index.html est à jour
```

**On ne modifie jamais `index.html` à la main** : il serait écrasé à la fabrication suivante.

## Comment c'est assemblé

`page.html` est la page (le HTML). Chacune de ses lignes `<!--#inclure chemin-->` est remplacée par le contenu exact du fichier `src/chemin`, dans l'ordre où elles apparaissent.

- Le **style** (`css/`) est inclus à sa place dans la page.
- Le **code** (`js/`) est recollé en deux scripts, dans l'ordre de la liste de `page.html`. Le résultat est le même code qu'avant le découpage, au caractère près. Une fonction peut donc toujours être appelée depuis un autre fichier, même s'il est placé avant elle.
- L'ordre compte pour le code qui s'exécute au chargement (constantes, `let`) : en cas de doute, ajouter un nouveau fichier à la fin de sa famille.

Le découpage a été vérifié ainsi : le `index.html` refabriqué était identique, octet pour octet, à l'ancien fichier unique.

## Les dossiers

| Dossier | Ce qu'on y trouve |
|---|---|
| `js/noyau/` | L'état de la partie (`gameState`), le démarrage, la boucle de jeu, les ordres des joueurs, le diagnostic (F3). |
| `js/moteur/` | Les règles du jeu : univers, orbites, production de spores, tirs, bataille de surface, zones, vaisseaux, sphères capitales, commerce, IA, bâtiments, ondes solaires, départ (régime, planète), victoire. |
| `js/rendu/` | Le dessin : textures, fond, trou noir, soleils, planètes, territoires, tirs, effets. |
| `js/reseau/` | Le multijoueur en réseau : relais, maths identiques entre navigateurs, empreinte, photo de la partie (reprise), salon. |
| `js/interface/` | Ce que le joueur touche : commandes et souris, visée et tirs spéciaux, panneaux (HUD, NAISSANCE, mes astres, codex, technologies), minimap, alertes, écran titre, histoire, mission tutoriel, raccourcis (K). |
| `js/audio/` | Sons et musiques. |
| `js/comptes/` | Connexion, profils et classements (Supabase). |
| `js/donnees/` | Les cartes (bibliothèque de maps) et les noms d'astres. |
| `css/` | Le style de la page. |

## Ajouter un fichier

1. Créer le fichier dans le bon dossier.
2. Ajouter sa ligne `<!--#inclure js/dossier/fichier.js-->` dans `page.html`, à la place voulue.
3. `npm run construire`, puis tester (`npm run lockstep` pour le réseau).

Le journal des versions est dans `JOURNAL.md`, à la racine.
