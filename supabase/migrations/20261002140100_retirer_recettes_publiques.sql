-- RANGEMENT (suite) : les tables de recettes quittent public ; leur copie
-- verifiee reste dans le schema archive. Comptes rendus et dossiers : intacts.
drop table if exists public.lfs_recipe_votes, public.lfs_meal_plans, public.lfs_recipe_prefs,
    public.lfs_recipes_user, public.lfs_recipes_common, public.lfs_profiles, public.lfs_users;
