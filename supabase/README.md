# La base de données de Nebula Conquest (Supabase)

Tout ce qui décrit la base (tables, règles d'accès, fonctions, vues, droits) est ici, dans des fichiers relus avant d'être appliqués, au lieu d'être cliqué dans le tableau de bord de Supabase.

Projet en ligne : `hcjajtpbzusqgxkyzbgc` (région eu-west-1).

## Ce que contient ce dossier

| Fichier | Rôle |
|---|---|
| `migrations/20261002120000_etat_initial_nebula.sql` | La base telle qu'elle était le 2 octobre 2026. Rejoué sur une base vide, il la recrée à l'identique. |
| `migrations/2026092…` (5 fichiers vides) | Les 5 changements faits avant ce dossier, déjà inclus dans l'état initial (voir « Historique »). |
| `migrations/…` (suivants) | Chaque changement de la base, un fichier par changement, dans l'ordre. |
| `signature.sql` | Une empreinte de la base (lecture seule). Lancée sur deux bases, elle doit donner les mêmes lignes. |
| `config.toml` | Réglages de l'outil Supabase (CLI). |

### Les tables de Nebula

- `profiles` : un profil par compte (pseudo, couleur, réglages). L'ELO n'y est jamais écrit par le jeu.
- `games` : une ligne par joueur et par partie terminée.
- `elo_reseau` et la vue `classement_reseau` : l'ELO des parties rapides en réseau, par taille (2, 4, 8, 16). Écrit seulement par le relais, avec la fonction `enregistrer_partie_reseau`.
- `game_rooms`, `game_room_players` : salons de l'ancien multijoueur.
- `guilds`, `guild_members` et la vue `guild_leaderboard` : les guildes, cachées dans le menu actuel.
- `long_*` : le mode « partie longue », en sommeil. Ses règles d'accès utilisent les fonctions `prive.nc_membre*`, rangées dans le schéma `prive`, qui n'est pas publié dans l'API.
- La vue `leaderboard` : l'ancien classement 1 contre 1.
- `cartes_joueurs` : les cartes faites dans l'éditeur du jeu (30 par compte ; 40 soleils, 250 planètes, 1000 lunes au plus). Le jeu n'écrit que le nom et le contenu ; votes et statut officiel ne bougent que par `voter_carte`. Une carte officielle ne se modifie plus.
- `cartes_jouees` : qui a joué quelle carte jusqu'au bout en réseau. Écrite seulement par le relais (clé de service) ; aucun accès pour le jeu (l'alerte « RLS sans règle » est voulue).
- `votes_cartes` et la fonction `voter_carte` : un vote par compte et par carte, seulement après avoir joué la carte jusqu'au bout, jamais sur la sienne. À 1000 votes positifs la carte devient officielle (le seuil est dans la fonction).

Les vues lisent les tables avec les droits de celui qui les consulte (`security_invoker`), jamais avec ceux de leur créateur.

### Ce qui n'est pas à Nebula

Le même projet Supabase héberge `comptes_rendus` et `dossiers` : le logiciel de comptes rendus (pisé), toujours utilisé. Ces tables ne sont volontairement pas dans ces fichiers, et aucune migration Nebula ne doit les toucher.

L'ancienne application de recettes (`lfs_*`) a été retirée le 2 octobre 2026 ; une copie complète reste dans le schéma `archive`, qui n'est pas publié dans l'API.

## Règle d'or

**On ne modifie plus la base à la main dans le tableau de bord.** Chaque changement est un nouveau fichier dans `migrations/`, relu, enregistré dans git, puis appliqué. Ainsi, n'importe qui peut recréer la base, voir qui a changé quoi et quand, et revenir en arrière.

## Faire un changement

Avec l'outil Supabase installé (`npm i -g supabase`, ou `npx supabase`) :

```bash
supabase migration new ajout_colonne_xyz      # crée supabase/migrations/<date>_ajout_colonne_xyz.sql
# écrire le SQL dans ce fichier, puis :
supabase start                                 # une base Supabase locale (Docker)
supabase db reset                              # la recrée depuis toutes les migrations : doit passer sans erreur
supabase link --project-ref hcjajtpbzusqgxkyzbgc
supabase db push                               # applique en ligne les migrations pas encore appliquées
```

Sans l'outil, on peut aussi coller le fichier dans l'éditeur SQL du tableau de bord. Il faut alors penser à l'enregistrer dans git.

## Historique : déjà synchronisé

Avant ce dossier, 5 changements avaient été appliqués en ligne (23 et 29 septembre 2026 : règles d'accès des tables `long_*`, votes de bots, parties réseau classées, ELO par taille). Leur effet est déjà inclus dans `etat_initial_nebula.sql`. Leurs fichiers dans `migrations/` sont volontairement vides (`select 1;`), pour que les noms correspondent à l'historique en ligne. Leur texte d'origine reste consultable dans la table `supabase_migrations.schema_migrations`.

Le 2 octobre 2026, l'état initial a été marqué comme appliqué en ligne : la base en ligne et les fichiers listent les mêmes 6 entrées. `supabase migration list` doit donc montrer les deux colonnes identiques. Il n'y a rien à « réparer ».

## Vérifier que la base en ligne n'a pas dérivé

Lancer `signature.sql` dans l'éditeur SQL du tableau de bord, et sur une base recréée avec `supabase db reset`. Les lignes doivent être identiques. Le 2 octobre 2026, les deux donnaient exactement les mêmes 11 empreintes (341 éléments).

## Points à surveiller

- Les vues `guild_leaderboard` et `leaderboard` tournent avec les droits de leur propriétaire (pas `security_invoker`). C'est sans risque aujourd'hui, car les tables qu'elles lisent sont publiques, mais c'est à corriger par une migration.
- Le relais (Railway) écrit les résultats avec la clé de service : variables `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`. Cette clé ne doit jamais apparaître dans le code ni dans git.
