-- RANGEMENT : les tables de l'application de recettes (lfs_*), qui n'est pas
-- Nebula, sont copiees dans le schema archive (non publie dans l'API) avant
-- d'etre retirees de public. Rien n'est perdu : la copie a ete verifiee
-- identique, table par table. Les comptes rendus et dossiers (autre
-- application, toujours utilisee) ne sont PAS concernes.
-- Sur une base neuve (sans tables lfs_*), ce fichier ne fait rien.
create schema if not exists archive;
revoke all on schema archive from public, anon, authenticated;
do $$
declare t text;
begin
    foreach t in array array['lfs_users', 'lfs_profiles', 'lfs_recipes_common', 'lfs_recipes_user',
                             'lfs_recipe_prefs', 'lfs_meal_plans', 'lfs_recipe_votes'] loop
        if to_regclass('public.' || t) is not null and to_regclass('archive.' || t) is null then
            execute format('create table archive.%I as table public.%I', t, t);
        end if;
    end loop;
end $$;
