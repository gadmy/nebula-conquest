-- =====================================================================
-- NEBULA CONQUEST : ETAT DE DEPART DE LA BASE (au 2 octobre 2026)
-- Releve sur la base en ligne (projet hcjajtpbzusqgxkyzbgc), tables de
-- Nebula seulement. Ce fichier suffit a recreer une base vide identique.
-- Les tables d'autres applications qui partagent ce projet (lfs_*,
-- comptes_rendus, dossiers) n'y sont PAS : voir supabase/README.md.
-- Les 5 changements faits avant ce releve sont deja inclus ici ; leur
-- texte d'origine est garde dans supabase/historique/.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LES TABLES
-- ---------------------------------------------------------------------

-- Le profil d'un joueur (un par compte). L'ELO 1 contre 1 n'est jamais
-- ecrit par le jeu : voir les droits en bas de fichier.
create table public.profiles (
    id uuid not null,
    pseudo text not null,
    avatar_color text default '#8B5CF6'::text,
    created_at timestamp with time zone default now(),
    panel_config jsonb default '{}'::jsonb,
    spore_types jsonb default '[{"name": "Type 1", "color": "#C8A0FF", "active": true, "growth": 3, "density": 3, "velocity": 4}, {"name": "Type 2", "color": "#4ADE80", "active": true, "growth": 3, "density": 3, "velocity": 4}, {"name": "Type 3", "color": "#60A5FA", "active": true, "growth": 3, "density": 3, "velocity": 4}, {"name": "Type 4", "color": "#F472B6", "active": false, "growth": 3, "density": 3, "velocity": 4}, {"name": "Type 5", "color": "#FB923C", "active": false, "growth": 3, "density": 3, "velocity": 4}]'::jsonb,
    elo integer default 1000 not null,
    pending_invite jsonb,
    constraint profiles_pseudo_key unique (pseudo),
    constraint profiles_pkey primary key (id)
);

-- Une ligne par joueur et par partie terminee (solo ou reseau).
create table public.games (
    id uuid default gen_random_uuid() not null,
    player_id uuid,
    won boolean default false not null,
    score integer default 0,
    planets_captured integer default 0,
    duration_seconds integer default 0,
    players_count integer default 4,
    suns_count integer default 4,
    created_at timestamp with time zone default now(),
    mode text default 'solo'::text not null,
    elo_avant integer,
    elo_apres integer,
    constraint games_pkey primary key (id)
);

-- Un ELO par taille de partie rapide en reseau (2, 4, 8, 16 joueurs).
-- Ecrit uniquement par le relais (fonction enregistrer_partie_reseau).
create table public.elo_reseau (
    user_id uuid not null,
    taille integer not null,
    elo integer default 1000 not null,
    parties integer default 0 not null,
    victoires integer default 0 not null,
    maj timestamp with time zone default now() not null,
    constraint elo_reseau_pkey primary key (user_id, taille),
    constraint elo_reseau_taille_check check ((taille = any (array[2, 4, 8, 16])))
);

-- Salons de l'ancien multijoueur (serveur 2).
create table public.game_rooms (
    id uuid default gen_random_uuid() not null,
    host_id uuid not null,
    host_pseudo text not null,
    settings jsonb default '{}'::jsonb not null,
    status text default 'waiting'::text not null,
    seed integer default (floor((random() * (2147483647)::double precision)))::integer not null,
    max_players integer default 4 not null,
    created_at timestamp with time zone default now(),
    bot_votes integer default 0,
    constraint game_rooms_pkey primary key (id),
    constraint game_rooms_status_check check ((status = any (array['waiting'::text, 'playing'::text, 'finished'::text])))
);

create table public.game_room_players (
    id uuid default gen_random_uuid() not null,
    room_id uuid not null,
    player_id uuid not null,
    pseudo text not null,
    color text default '#C8A0FF'::text not null,
    slot_number integer not null,
    ready boolean default false not null,
    joined_at timestamp with time zone default now(),
    stats jsonb,
    constraint game_room_players_room_id_player_id_key unique (room_id, player_id),
    constraint game_room_players_room_id_slot_number_key unique (room_id, slot_number),
    constraint game_room_players_pkey primary key (id)
);

-- Guildes (fonction cachee dans le menu actuel, donnees gardees).
create table public.guilds (
    id uuid default gen_random_uuid() not null,
    name text not null,
    tag text not null,
    logo_url text,
    elo integer default 1000 not null,
    created_by uuid,
    created_at timestamp with time zone default now(),
    description text default ''::text,
    constraint guilds_name_key unique (name),
    constraint guilds_tag_key unique (tag),
    constraint guilds_pkey primary key (id),
    constraint guilds_tag_check check ((char_length(tag) <= 3))
);

create table public.guild_members (
    guild_id uuid not null,
    player_id uuid not null,
    role text default 'member'::text not null,
    joined_at timestamp with time zone default now(),
    constraint guild_members_one_guild unique (player_id),
    constraint guild_members_pkey primary key (guild_id, player_id),
    constraint guild_members_role_check check ((role = any (array['owner'::text, 'member'::text])))
);

-- Mode "partie longue" (long_*), en sommeil.
create table public.long_games (
    id uuid default gen_random_uuid() not null,
    league text not null,
    status text default 'waiting'::text,
    created_at timestamp with time zone default now(),
    ends_at timestamp with time zone,
    seed bigint,
    constraint long_games_pkey primary key (id)
);

create table public.long_players (
    id uuid default gen_random_uuid() not null,
    game_id uuid,
    user_id uuid,
    pseudo text,
    color text,
    slot integer,
    mmr integer default 1000,
    eliminated boolean default false,
    constraint long_players_pkey primary key (id)
);

create table public.long_systems (
    id uuid default gen_random_uuid() not null,
    game_id uuid,
    player_id uuid,
    name text,
    genesis_data jsonb,
    constraint long_systems_pkey primary key (id)
);

create table public.long_bodies (
    id uuid default gen_random_uuid() not null,
    system_id uuid,
    parent_id uuid,
    type text,
    name text,
    orbit_radius double precision,
    orbit_speed double precision,
    radius double precision,
    nids integer default 0,
    biomes integer default 0,
    sporanges integer default 0,
    sclerotes integer default 0,
    constraint long_bodies_pkey primary key (id)
);

create table public.long_spores (
    body_id uuid not null,
    classiques double precision default 0,
    attaque double precision default 0,
    defense double precision default 0,
    constraint long_spores_pkey primary key (body_id)
);

create table public.long_expeditions (
    id uuid default gen_random_uuid() not null,
    game_id uuid,
    from_system uuid,
    to_body uuid,
    spores double precision,
    launched_at timestamp with time zone default now(),
    arrives_at timestamp with time zone,
    status text default 'travelling'::text,
    constraint long_expeditions_pkey primary key (id)
);

create table public.long_diplomacy (
    id uuid default gen_random_uuid() not null,
    game_id uuid,
    player_a uuid,
    player_b uuid,
    type text,
    expires_at timestamp with time zone,
    betrayed boolean default false,
    constraint long_diplomacy_pkey primary key (id)
);

create table public.long_mmr (
    user_id uuid not null,
    league text not null,
    mmr integer default 1000,
    updated_at timestamp with time zone default now(),
    constraint long_mmr_pkey primary key (user_id, league)
);

-- ---------------------------------------------------------------------
-- 2. LES LIENS ENTRE TABLES
-- ---------------------------------------------------------------------
alter table public.profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
alter table public.games add constraint games_player_id_fkey foreign key (player_id) references public.profiles(id) on delete cascade;
alter table public.elo_reseau add constraint elo_reseau_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
alter table public.game_rooms add constraint game_rooms_host_id_fkey foreign key (host_id) references auth.users(id);
alter table public.game_room_players add constraint game_room_players_player_id_fkey foreign key (player_id) references auth.users(id);
alter table public.game_room_players add constraint game_room_players_room_id_fkey foreign key (room_id) references public.game_rooms(id) on delete cascade;
alter table public.guilds add constraint guilds_created_by_fkey foreign key (created_by) references public.profiles(id) on delete set null;
alter table public.guild_members add constraint guild_members_guild_id_fkey foreign key (guild_id) references public.guilds(id) on delete cascade;
alter table public.guild_members add constraint guild_members_player_id_fkey foreign key (player_id) references public.profiles(id) on delete cascade;
alter table public.long_players add constraint long_players_game_id_fkey foreign key (game_id) references public.long_games(id) on delete cascade;
alter table public.long_players add constraint long_players_user_id_fkey foreign key (user_id) references auth.users(id);
alter table public.long_systems add constraint long_systems_game_id_fkey foreign key (game_id) references public.long_games(id) on delete cascade;
alter table public.long_systems add constraint long_systems_player_id_fkey foreign key (player_id) references public.long_players(id);
alter table public.long_bodies add constraint long_bodies_parent_id_fkey foreign key (parent_id) references public.long_bodies(id);
alter table public.long_bodies add constraint long_bodies_system_id_fkey foreign key (system_id) references public.long_systems(id) on delete cascade;
alter table public.long_spores add constraint long_spores_body_id_fkey foreign key (body_id) references public.long_bodies(id) on delete cascade;
alter table public.long_expeditions add constraint long_expeditions_from_system_fkey foreign key (from_system) references public.long_systems(id);
alter table public.long_expeditions add constraint long_expeditions_game_id_fkey foreign key (game_id) references public.long_games(id) on delete cascade;
alter table public.long_expeditions add constraint long_expeditions_to_body_fkey foreign key (to_body) references public.long_bodies(id);
alter table public.long_diplomacy add constraint long_diplomacy_game_id_fkey foreign key (game_id) references public.long_games(id) on delete cascade;
alter table public.long_diplomacy add constraint long_diplomacy_player_a_fkey foreign key (player_a) references public.long_players(id);
alter table public.long_diplomacy add constraint long_diplomacy_player_b_fkey foreign key (player_b) references public.long_players(id);
alter table public.long_mmr add constraint long_mmr_user_id_fkey foreign key (user_id) references auth.users(id);

-- ---------------------------------------------------------------------
-- 3. LES INDEX
-- ---------------------------------------------------------------------
create index elo_reseau_taille_elo on public.elo_reseau using btree (taille, elo desc);
create index idx_rooms_status on public.game_rooms using btree (status);
create index idx_room_players_room on public.game_room_players using btree (room_id);
create index idx_long_players_game on public.long_players using btree (game_id);
create index idx_long_players_user on public.long_players using btree (user_id);
create index idx_long_systems_game on public.long_systems using btree (game_id);
create index idx_long_systems_player on public.long_systems using btree (player_id);
create index idx_long_bodies_system on public.long_bodies using btree (system_id);
create index idx_long_bodies_parent on public.long_bodies using btree (parent_id);
create index idx_long_exped_game on public.long_expeditions using btree (game_id);
create index idx_long_exped_from on public.long_expeditions using btree (from_system);
create index idx_long_exped_to on public.long_expeditions using btree (to_body);
create index idx_long_diplo_game on public.long_diplomacy using btree (game_id);
create index idx_long_diplo_a on public.long_diplomacy using btree (player_a);
create index idx_long_diplo_b on public.long_diplomacy using btree (player_b);

-- ---------------------------------------------------------------------
-- 4. LES FONCTIONS
-- ---------------------------------------------------------------------

-- Garde-fou sur les parties enregistrees par le jeu (scores absurdes).
create or replace function public.validate_game_insert()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
begin
  if new.score > 200 then raise exception 'Score invalide'; end if;
  if new.planets_captured > 500 then raise exception 'Captures invalides'; end if;
  if new.duration_seconds < 10 then raise exception 'Durée invalide'; end if;
  if new.suns_count > 20 or new.players_count > 16 then raise exception 'Config invalide'; end if;
  return new;
end;
$function$;

create trigger check_game_insert before insert on public.games
    for each row execute function public.validate_game_insert();

-- Vote "completer avec des IA" dans un salon de l'ancien multijoueur.
create or replace function public.increment_bot_votes(room_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
BEGIN
  UPDATE game_rooms
  SET bot_votes = COALESCE(bot_votes, 0) + 1
  WHERE id = room_id AND status = 'waiting';
END;
$function$;

-- "Ce joueur est-il dans cette partie longue ?" (utilisees par les regles
-- d'acces des tables long_*). SECURITY DEFINER pour ne pas declencher la
-- RLS en boucle sur long_players.
create or replace function public.nc_membre(p_game uuid)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.long_players lp
                 where lp.game_id = p_game and lp.user_id = (select auth.uid()));
$function$;

create or replace function public.nc_membre_systeme(p_system uuid)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.long_systems s
                 join public.long_players lp on lp.game_id = s.game_id
                 where s.id = p_system and lp.user_id = (select auth.uid()));
$function$;

create or replace function public.nc_membre_corps(p_body uuid)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.long_bodies b
                 join public.long_systems s on s.id = b.system_id
                 join public.long_players lp on lp.game_id = s.game_id
                 where b.id = p_body and lp.user_id = (select auth.uid()));
$function$;

-- Resultat d'une partie en reseau, appele par le relais seul (cle de
-- service). p_joueurs : [{"id": uuid, "rang": 1..n, "astres": int}].
-- ELO multijoueur : chaque paire de joueurs compte comme un duel (K = 32,
-- reparti sur les n-1 adversaires), un ELO par taille de partie.
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
  if p_duree < 30 or p_total not in (2, 4, 8, 16) then return null; end if;
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

-- ---------------------------------------------------------------------
-- 5. LES REGLES D'ACCES (RLS) : qui peut lire, ecrire, effacer quoi
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.elo_reseau enable row level security;
alter table public.game_rooms enable row level security;
alter table public.game_room_players enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_members enable row level security;
alter table public.long_games enable row level security;
alter table public.long_players enable row level security;
alter table public.long_systems enable row level security;
alter table public.long_bodies enable row level security;
alter table public.long_spores enable row level security;
alter table public.long_expeditions enable row level security;
alter table public.long_diplomacy enable row level security;
alter table public.long_mmr enable row level security;

-- profils : lisibles par tous, chacun cree et modifie le sien
create policy "Profiles readable by all" on public.profiles for select to public
    using (true);
create policy "Users insert own profile" on public.profiles for insert to public
    with check ((auth.uid() = id));
create policy "Users update own profile" on public.profiles for update to public
    using ((auth.uid() = id));

-- parties : lisibles par tous, chacun ajoute les siennes, personne ne modifie
create policy "Games readable by all" on public.games for select to public
    using (true);
create policy "Players insert own games" on public.games for insert to public
    with check ((auth.uid() = player_id));
create policy "Interdire modification parties" on public.games for update to public
    using (false);
create policy "Interdire suppression parties" on public.games for delete to public
    using (false);

-- classement reseau : lisible, jamais ecrit par le jeu
create policy "Classement lisible par tous" on public.elo_reseau for select to public
    using (true);

-- salons (ancien multijoueur)
create policy "Rooms readable by all" on public.game_rooms for select to public
    using (true);
create policy "Auth users create rooms" on public.game_rooms for insert to public
    with check ((auth.uid() = host_id));
create policy "Host updates own room" on public.game_rooms for update to public
    using ((auth.uid() = host_id));
create policy "Host deletes own room or cleanup old" on public.game_rooms for delete to public
    using (((auth.uid() = host_id) or ((status = 'waiting'::text) and (created_at < (now() - '00:30:00'::interval)))));

create policy "Room players readable by all" on public.game_room_players for select to public
    using (true);
create policy "Auth users join rooms" on public.game_room_players for insert to public
    with check ((auth.uid() = player_id));
create policy "Players update own slot" on public.game_room_players for update to public
    using ((auth.uid() = player_id));
create policy "Players leave rooms" on public.game_room_players for delete to public
    using ((auth.uid() = player_id));
create policy "Hôte kick joueur" on public.game_room_players for delete to public
    using ((auth.uid() in ( select game_rooms.host_id
   from public.game_rooms
  where (game_rooms.id = game_room_players.room_id))));

-- guildes
create policy guilds_select on public.guilds for select to public
    using (true);
create policy guilds_insert on public.guilds for insert to public
    with check ((auth.uid() = created_by));
create policy guilds_update on public.guilds for update to public
    using ((auth.uid() = created_by));
create policy guilds_delete on public.guilds for delete to public
    using ((auth.uid() = created_by));

create policy guild_members_select on public.guild_members for select to public
    using (true);
create policy guild_members_insert on public.guild_members for insert to public
    with check ((auth.uid() = player_id));
create policy guild_members_delete on public.guild_members for delete to public
    using ((auth.uid() = player_id));

-- parties longues : connecte pour lire, joueur de la partie pour ecrire
create policy nc_games_lire on public.long_games for select to authenticated
    using (true);
create policy nc_games_creer on public.long_games for insert to authenticated
    with check (true);
create policy nc_games_maj on public.long_games for update to authenticated
    using (public.nc_membre(id))
    with check (public.nc_membre(id));
create policy nc_games_suppr on public.long_games for delete to authenticated
    using (public.nc_membre(id));

create policy nc_players_lire on public.long_players for select to authenticated
    using (true);
create policy nc_players_moi on public.long_players for insert to authenticated
    with check ((user_id = ( select auth.uid() as uid)));
create policy nc_players_maj on public.long_players for update to authenticated
    using (public.nc_membre(game_id))
    with check (public.nc_membre(game_id));
create policy nc_players_sortir on public.long_players for delete to authenticated
    using ((user_id = ( select auth.uid() as uid)));

create policy nc_systems_lire on public.long_systems for select to authenticated
    using (true);
create policy nc_systems_ecrire on public.long_systems for all to authenticated
    using (public.nc_membre(game_id))
    with check (public.nc_membre(game_id));

create policy nc_bodies_lire on public.long_bodies for select to authenticated
    using (true);
create policy nc_bodies_ecrire on public.long_bodies for all to authenticated
    using (public.nc_membre_systeme(system_id))
    with check (public.nc_membre_systeme(system_id));

create policy nc_spores_lire on public.long_spores for select to authenticated
    using (true);
create policy nc_spores_ecrire on public.long_spores for all to authenticated
    using (public.nc_membre_corps(body_id))
    with check (public.nc_membre_corps(body_id));

create policy nc_exped_lire on public.long_expeditions for select to authenticated
    using (true);
create policy nc_exped_ecrire on public.long_expeditions for all to authenticated
    using (public.nc_membre(game_id))
    with check (public.nc_membre(game_id));

create policy nc_diplo_lire on public.long_diplomacy for select to authenticated
    using (true);
create policy nc_diplo_ecrire on public.long_diplomacy for all to authenticated
    using (public.nc_membre(game_id))
    with check (public.nc_membre(game_id));

-- MMR des parties longues : lisible, jamais ecrit par le jeu
create policy nc_mmr_lire on public.long_mmr for select to authenticated
    using (true);

-- ---------------------------------------------------------------------
-- 6. LES VUES (classements)
-- ---------------------------------------------------------------------
create or replace view public.classement_reseau with (security_invoker=true) as
 select p.pseudo,
    p.avatar_color,
    e.taille,
    e.elo,
    e.parties,
    e.victoires
   from public.elo_reseau e
     join public.profiles p on p.id = e.user_id;

-- A NOTER : ces deux vues tournent avec les droits de leur proprietaire
-- (pas security_invoker), comme sur la base en ligne. Sans risque tant que
-- les tables lues sont publiques, mais a passer en security_invoker.
create or replace view public.guild_leaderboard as
 select g.id,
    g.name,
    g.tag,
    g.logo_url,
    g.elo,
    g.description,
    g.created_by,
    count(gm.player_id) as member_count
   from public.guilds g
     left join public.guild_members gm on gm.guild_id = g.id
  group by g.id, g.name, g.tag, g.logo_url, g.elo, g.description, g.created_by
  order by g.elo desc;

create or replace view public.leaderboard as
 select p.pseudo,
    p.avatar_color,
    p.elo,
    count(g.id) as total_games,
    sum(
        case
            when g.won then 1
            else 0
        end) as wins,
    round(100.0 * sum(
        case
            when g.won then 1
            else 0
        end)::numeric / nullif(count(g.id), 0)::numeric) as win_rate
   from public.profiles p
     left join public.games g on g.player_id = p.id
  group by p.pseudo, p.avatar_color, p.elo;

-- ---------------------------------------------------------------------
-- 7. LES DROITS (en plus des droits par defaut de Supabase)
-- ---------------------------------------------------------------------

-- L'ELO ne s'ecrit pas depuis le jeu : seules ces colonnes du profil
-- sont modifiables par le joueur.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, pseudo, avatar_color, panel_config, spore_types) on public.profiles to authenticated;
grant update (pseudo, avatar_color, panel_config, spore_types, pending_invite) on public.profiles to authenticated;

-- Classement reseau : lecture seule pour le jeu.
revoke insert, update, delete, truncate on public.elo_reseau from anon, authenticated;
grant select on public.classement_reseau to anon, authenticated;

-- Fonctions : reservees aux comptes connectes...
revoke execute on function public.nc_membre(uuid) from public, anon;
revoke execute on function public.nc_membre_systeme(uuid) from public, anon;
revoke execute on function public.nc_membre_corps(uuid) from public, anon;
revoke execute on function public.increment_bot_votes(uuid) from public, anon;
grant execute on function public.nc_membre(uuid) to authenticated;
grant execute on function public.nc_membre_systeme(uuid) to authenticated;
grant execute on function public.nc_membre_corps(uuid) to authenticated;
grant execute on function public.increment_bot_votes(uuid) to authenticated;

-- ... et au relais seul (cle de service) pour l'enregistrement des parties.
revoke all on function public.enregistrer_partie_reseau(jsonb, integer, integer) from public, anon, authenticated;
grant execute on function public.enregistrer_partie_reseau(jsonb, integer, integer) to service_role;
