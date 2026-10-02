# nebula-conquest

Jeu de conquête spatiale en temps réel, dans le navigateur.

- `src/` : le jeu, rangé par thème (page, style, code). Voir [src/LISEZMOI.md](src/LISEZMOI.md).
- `index.html` : la page publiée (https://gadmy.github.io/nebula-conquest/), **fabriquée** à partir de `src/` par `npm run construire`. Ne pas la modifier à la main.
- `JOURNAL.md` : le journal des versions et la liste « À FAIRE ».
- `outils/relais.mjs` : le relais du multijoueur en réseau (hébergé sur Railway).
- `outils/lockstep-test.mjs` : le test « tout le monde voit la même partie » (`npm run lockstep`).
- `supabase/` : la base de données (comptes, classements), décrite en fichiers. Voir [supabase/README.md](supabase/README.md).
- `assets/`, `Audio/`, `Lore/` : images, sons et histoire du jeu.

## Travailler sur le jeu

```bash
npm install
# modifier les fichiers de src/
npm run construire        # refait index.html
npm run lockstep          # vérifie que le multijoueur reste identique chez tous
npm start                 # relais local : le jeu est servi sur http://localhost:8080
```
