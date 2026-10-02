-- SECURITE : les 3 alertes du conseiller Supabase (2 octobre 2026).
--
-- 1. Les classements (leaderboard, guild_leaderboard) lisaient les tables
--    avec les droits de leur createur, en contournant les regles d'acces.
--    Ils prennent maintenant les droits de celui qui lit. Rien ne change a
--    l'ecran : profils, parties et guildes sont lisibles par tous.
alter view public.leaderboard set (security_invoker = true);
alter view public.guild_leaderboard set (security_invoker = true);

-- 2. increment_bot_votes : le jeu ne l'appelle pas, n'importe quel compte
--    pouvait gonfler les votes d'une salle. Reservee au serveur.
revoke execute on function public.increment_bot_votes(uuid) from public, anon, authenticated;

-- 3. Les fonctions d'appartenance aux parties longues servent seulement aux
--    regles d'acces des tables long_*. On les sort de l'API (schema prive,
--    non publie) : les regles les retrouvent toutes seules.
create schema if not exists prive;
grant usage on schema prive to authenticated, service_role;
alter function public.nc_membre(uuid) set schema prive;
alter function public.nc_membre_systeme(uuid) set schema prive;
alter function public.nc_membre_corps(uuid) set schema prive;
