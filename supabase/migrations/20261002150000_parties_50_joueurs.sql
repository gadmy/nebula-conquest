-- PARTIES A 50 JOUEURS (2 octobre 2026).
-- 1. Le classement des parties rapides en reseau accepte une 5e taille : 50.
alter table public.elo_reseau drop constraint elo_reseau_taille_check;
alter table public.elo_reseau add constraint elo_reseau_taille_check check ((taille = any (array[2, 4, 8, 16, 50])));

create or replace function public.enregistrer_partie_reseau(p_joueurs jsonb, p_duree integer, p_total integer)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  n integer;
  resultat jsonb;
begin
  if p_duree < 30 or p_total not in (2, 4, 8, 16, 50) then return null; end if;
  drop table if exists pg_temp._r;
  create temp table _r on commit drop as
    select (x->>'id')::uuid as id, (x->>'rang')::int as rang, greatest(0, least(200, coalesce((x->>'astres')::int, 0))) as astres,
           1000 as avant, 0::numeric as delta
    from jsonb_array_elements(p_joueurs) x
    join public.profiles p on p.id = (x->>'id')::uuid;
  select count(*) into n from _r;
  if n < 2 then return null; end if;
  insert into public.elo_reseau (user_id, taille) select id, p_total from _r on conflict do nothing;
  perform 1 from public.elo_reseau where taille = p_total and user_id in (select id from _r) for update;
  update _r set avant = e.elo from public.elo_reseau e where e.user_id = _r.id and e.taille = p_total;
  update _r a set delta = (32.0 / (n - 1)) * (
    select sum((case when a.rang < b.rang then 1.0 when a.rang = b.rang then 0.5 else 0.0 end)
               - 1.0 / (1.0 + power(10.0, (b.avant - a.avant) / 400.0)))
    from _r b where b.id <> a.id);
  update public.elo_reseau e set elo = greatest(100, e.elo + round(_r.delta)::int),
         parties = e.parties + 1, victoires = e.victoires + (case when _r.rang = 1 then 1 else 0 end), maj = now()
    from _r where e.user_id = _r.id and e.taille = p_total;
  insert into public.games (player_id, won, score, planets_captured, duration_seconds, players_count, suns_count, mode, elo_avant, elo_apres)
    select id, rang = 1, astres, astres, p_duree, p_total, null, 'reseau', avant, greatest(100, avant + round(delta)::int) from _r;
  select jsonb_agg(jsonb_build_object('id', id, 'avant', avant, 'apres', greatest(100, avant + round(delta)::int))) into resultat from _r;
  return resultat;
end;
$function$;

-- 2. Le garde-fou des parties enregistrees : jusqu'a 50 joueurs (il refusait
--    au-dela de 16) et 50 soleils (pour les grandes cartes a venir).
create or replace function public.validate_game_insert()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
begin
  if new.score > 200 then raise exception 'Score invalide'; end if;
  if new.planets_captured > 500 then raise exception 'Captures invalides'; end if;
  if new.duration_seconds < 10 then raise exception 'Durée invalide'; end if;
  if new.suns_count > 50 or new.players_count > 50 then raise exception 'Config invalide'; end if;
  return new;
end;
$function$;
