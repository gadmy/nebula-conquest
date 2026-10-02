# nebula-conquest

Jeu de conquête spatiale en temps réel, dans le navigateur.

- `src/` : le jeu, rangé par thème (page, style, code). Voir [src/LISEZMOI.md](src/LISEZMOI.md).
- `index.html` : la page publiée (https://gadmy.github.io/nebula-conquest/), **fabriquée** à partir de `src/` par `npm run construire`. Ne pas la modifier à la main.
- `JOURNAL.md` : le journal des versions et la liste « À FAIRE ».
- `outils/relais.mjs` : le relais du multijoueur en réseau (hébergé sur Railway). Railway ne le relance que si `outils/relais.mjs`, `package*.json` ou `railway.json` changent (`railway.json`) : chaque relance coupe les parties en cours, à envoyer quand personne ne joue.
- `outils/lockstep-test.mjs` : le test « tout le monde voit la même partie » (`npm run lockstep`).
- `supabase/` : la base de données (comptes, classements), décrite en fichiers. Voir [supabase/README.md](supabase/README.md).
- `assets/`, `Audio/`, `Lore/` : images, sons et histoire du jeu.

## Travailler sur le jeu

```bash
npm install
# modifier les fichiers de src/
npm run construire        # refait index.html
npm run verifier          # vérifications rapides (page à jour, code lisible)
npm test                  # tout : vérifications, multijoueur identique, partie solo, partie en réseau
npm start                 # relais local : le jeu est servi sur http://localhost:8080
```

## Tests automatiques

À chaque envoi sur GitHub, l'onglet **Actions** lance les vérifications (`.github/workflows/verifications.yml`) :

- **Fabrication et code** : `index.html` est à jour, et chaque fichier de code se lit sans erreur.
- **Base de données** : toutes les migrations de `supabase/` se rejouent sur un Postgres vide.
- **Parties de jeu**, dans un vrai navigateur :
  - le banc « multijoueur identique » ;
  - une partie solo de 3 minutes (`tests/partie-solo.mjs`) ;
  - une partie en réseau à deux, avec rechargement et reprise (`tests/reseau.mjs`).

Une croix rouge signale quelque chose à corriger avant de publier.

**Publication protégée** : sur `main`, le site n'est mis à jour (job « Publication du site ») que si les trois vérifications sont vertes. Une erreur détectée bloque donc la mise en ligne, et le site garde la version précédente. Réglage GitHub nécessaire : *Settings > Pages > Source = GitHub Actions*.
