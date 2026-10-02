# La base de données de Nebula Conquest (Supabase)

Tout ce qui décrit la base (tables, règles d'accès, fonctions, vues, droits) est ici, dans des fichiers relus avant d'être appliqués, au lieu d'être cliqué dans le tableau de bord de Supabase.

Projet en ligne : `hcjajtpbzusqgxkyzbgc` (région eu-west-1).

## Ce que contient ce dossier

| Fichier | Rôle |
|---|---|
| `migrations/20261002120000_etat_initial_nebula.sql` | La base telle qu'elle était le 2 octobre 2026. Rejoué sur une base vide, il la recrée à l'identique. |
| `migrations/…` (suivants) | Chaque changement de la base, un fichier par changement, dans l'ordre. |
| `signature.sql` | Une empreinte de la base (lecture seule). Lancée sur deux bases, elle doit donner les mêmes lignes. |
| `config.toml` | Réglages de l'outil Supabase (CLI). |

### Les tables de Nebula

- `profiles` : un profil par compte (pseudo, couleur, réglages). L'ELO n'y est jamais écrit par le jeu.
- `games` : une ligne par joueur et par partie terminée.
- `elo_reseau` et la vue `classement_reseau` : l'ELO des parties rapides en réseau, par taille (2, 4, 8, 16). Écrit seulement par le relais, avec la fonction `enregistrer_partie_reseau`.
- `game_rooms`, `game_room_players` : salons de l'ancien multijoueur.
- `guilds`, `guild_members` et la vue `guild_leaderboard` : les guildes, cachées dans le menu actuel.
- `long_*` : le mode « partie longue », en sommeil.
- La vue `leaderboard` : l'ancien classement 1 contre 1.

### Ce qui n'est pas à Nebula

Le même projet Supabase héberge les tables d'autres applications : `lfs_*` (recettes) ainsi que `comptes_rendus` et `dossiers`. Elles ne sont volontairement pas dans ces fichiers. L'idéal est de les déplacer dans leur propre projet Supabase.

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

## Mise en route, une seule fois

Avant ce dossier, 5 changements avaient été appliqués en ligne (23 et 29 septembre 2026 : règles d'accès des tables `long_*`, votes de bots, parties réseau classées, ELO par taille). Ils sont déjà inclus dans `etat_initial_nebula.sql`.

Pour que l'outil Supabase considère la base en ligne comme à jour, on le lui dit une seule fois :

```bash
supabase link --project-ref hcjajtpbzusqgxkyzbgc
supabase migration repair --status reverted 20260923092316 20260923092417 20260929114142 20260929114345 20260929120923
supabase migration repair --status applied 20261002120000
supabase migration list                        # local et en ligne doivent maintenant correspondre
```

## Vérifier que la base en ligne n'a pas dérivé

Lancer `signature.sql` dans l'éditeur SQL du tableau de bord, et sur une base recréée avec `supabase db reset`. Les lignes doivent être identiques. Le 2 octobre 2026, les deux donnaient exactement les mêmes 11 empreintes (341 éléments).

## Points à surveiller

- Les vues `guild_leaderboard` et `leaderboard` tournent avec les droits de leur propriétaire (pas `security_invoker`). C'est sans risque aujourd'hui, car les tables qu'elles lisent sont publiques, mais c'est à corriger par une migration.
- Le relais (Railway) écrit les résultats avec la clé de service : variables `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`. Cette clé ne doit jamais apparaître dans le code ni dans git.
