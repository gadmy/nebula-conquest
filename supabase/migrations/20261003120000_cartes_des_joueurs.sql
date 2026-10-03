-- CARTES DES JOUEURS (3 octobre 2026).
-- Chaque joueur connecte cree et enregistre ses cartes (editeur du jeu).
-- Les humains qui ont joue une carte JUSQU'AU BOUT dans une partie en
-- reseau peuvent voter (bien / pas bien), une fois par compte. A 1000 votes
-- positifs, la carte devient OFFICIELLE : tout le monde la voit, et les
-- parties rapides peuvent la tirer au sort.
-- Ne touche a rien d'autre (les tables du logiciel de comptes rendus en
-- particulier).

-- 1. Les cartes.
create table public.cartes_joueurs (
    id uuid primary key default gen_random_uuid(),
    auteur uuid not null default auth.uid() references public.profiles(id) on delete cascade,
    nom text not null check (char_length(nom) between 2 and 40),
    donnees jsonb not null,
    soleils integer not null default 0,
    planetes integer not null default 0,
    lunes integer not null default 0,
    votes_pour integer not null default 0,
    votes_contre integer not null default 0,
    officielle boolean not null default false,
    cree_le timestamptz not null default now(),
    maj_le timestamptz not null default now()
);
create index cartes_joueurs_auteur on public.cartes_joueurs (auteur);
create index cartes_joueurs_officielles on public.cartes_joueurs (officielle) where officielle;

-- Le garde-fou : taille et contenu de la carte (au plus 40 soleils, 250
-- planetes, 1000 lunes : au-dela, une partie rame), 30 cartes par joueur,
-- et une carte officielle ne change plus.
create or replace function public.cartes_joueurs_controle()
 returns trigger
 language plpgsql
 set search_path to 'public'
as $function$
declare
  s integer; p integer; l integer;
begin
  if tg_op = 'UPDATE' and old.officielle and new.donnees is distinct from old.donnees then
    raise exception 'Une carte officielle ne se modifie plus';
  end if;
  if octet_length(new.donnees::text) > 400000 then raise exception 'Carte trop lourde'; end if;
  if jsonb_typeof(new.donnees->'suns') is distinct from 'array' then raise exception 'Carte invalide'; end if;
  select count(*) into s from jsonb_array_elements(new.donnees->'suns');
  select count(*) into p from jsonb_array_elements(new.donnees->'suns') x,
    jsonb_array_elements(case when jsonb_typeof(x->'planets') = 'array' then x->'planets' else '[]'::jsonb end) y;
  select count(*) into l from jsonb_array_elements(new.donnees->'suns') x,
    jsonb_array_elements(case when jsonb_typeof(x->'planets') = 'array' then x->'planets' else '[]'::jsonb end) y,
    jsonb_array_elements(case when jsonb_typeof(y->'moons') = 'array' then y->'moons' else '[]'::jsonb end) z;
  if s < 1 or s > 40 then raise exception 'De 1 a 40 soleils'; end if;
  if p < 2 or p > 250 then raise exception 'De 2 a 250 planetes'; end if;
  if l > 1000 then raise exception 'Au plus 1000 lunes'; end if;
  new.soleils := s; new.planetes := p; new.lunes := l;
  if tg_op = 'INSERT' and (select count(*) from public.cartes_joueurs where auteur = new.auteur) >= 30 then
    raise exception 'Au plus 30 cartes par joueur';
  end if;
  new.maj_le := now();
  return new;
end;
$function$;
create trigger cartes_joueurs_controle before insert or update on public.cartes_joueurs
  for each row execute function public.cartes_joueurs_controle();

alter table public.cartes_joueurs enable row level security;
-- Lecture : ses cartes, et les officielles (pour tous, meme sans compte).
create policy "Cartes : les siennes et les officielles" on public.cartes_joueurs for select to anon, authenticated
    using (officielle or auteur = auth.uid());
create policy "Cartes : creer les siennes" on public.cartes_joueurs for insert to authenticated
    with check (auteur = auth.uid());
create policy "Cartes : modifier les siennes" on public.cartes_joueurs for update to authenticated
    using (auteur = auth.uid() and not officielle) with check (auteur = auth.uid());
create policy "Cartes : effacer les siennes" on public.cartes_joueurs for delete to authenticated
    using (auteur = auth.uid() and not officielle);
-- Le jeu n'ecrit que le nom et le contenu : ni les votes, ni le statut
-- officiel, ni l'auteur.
revoke insert, update, truncate, references, trigger on public.cartes_joueurs from anon, authenticated;
grant insert (nom, donnees) on public.cartes_joueurs to authenticated;
grant update (nom, donnees) on public.cartes_joueurs to authenticated;
revoke delete on public.cartes_joueurs from anon;

-- 2. Qui a joue quelle carte jusqu'au bout (ecrit par le relais, avec sa
--    cle de service, a la fin d'une partie en reseau).
create table public.cartes_jouees (
    carte uuid not null references public.cartes_joueurs(id) on delete cascade,
    joueur uuid not null references public.profiles(id) on delete cascade,
    le timestamptz not null default now(),
    primary key (carte, joueur)
);
alter table public.cartes_jouees enable row level security;
revoke all on public.cartes_jouees from anon, authenticated;

-- 3. Les votes : un par compte et par carte.
create table public.votes_cartes (
    carte uuid not null references public.cartes_joueurs(id) on delete cascade,
    votant uuid not null references public.profiles(id) on delete cascade,
    positif boolean not null,
    le timestamptz not null default now(),
    primary key (carte, votant)
);
alter table public.votes_cartes enable row level security;
create policy "Votes : les siens" on public.votes_cartes for select to authenticated
    using (votant = auth.uid());
revoke insert, update, delete, truncate, references, trigger on public.votes_cartes from anon, authenticated;
revoke all on public.votes_cartes from anon;

-- 4. Voter. Il faut avoir joue la carte jusqu'au bout (cartes_jouees), ne
--    pas en etre l'auteur, et ne pas avoir deja vote. A 1000 votes positifs,
--    la carte devient officielle.
create or replace function public.voter_carte(p_carte uuid, p_positif boolean)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  moi uuid := auth.uid();
  c public.cartes_joueurs%rowtype;
  seuil constant integer := 1000;
begin
  if moi is null then return jsonb_build_object('ok', false, 'raison', 'connexion requise'); end if;
  select * into c from public.cartes_joueurs where id = p_carte for update;
  if not found then return jsonb_build_object('ok', false, 'raison', 'carte inconnue'); end if;
  if c.auteur = moi then return jsonb_build_object('ok', false, 'raison', 'pas de vote sur sa propre carte'); end if;
  if not exists (select 1 from public.cartes_jouees where carte = p_carte and joueur = moi) then
    return jsonb_build_object('ok', false, 'raison', 'il faut avoir joue la carte jusqu''au bout en reseau');
  end if;
  insert into public.votes_cartes (carte, votant, positif) values (p_carte, moi, p_positif)
    on conflict (carte, votant) do nothing;
  if not found then return jsonb_build_object('ok', false, 'raison', 'deja vote'); end if;
  update public.cartes_joueurs
     set votes_pour = votes_pour + (case when p_positif then 1 else 0 end),
         votes_contre = votes_contre + (case when p_positif then 0 else 1 end),
         officielle = officielle or (votes_pour + (case when p_positif then 1 else 0 end) >= seuil)
   where id = p_carte
   returning * into c;
  return jsonb_build_object('ok', true, 'pour', c.votes_pour, 'contre', c.votes_contre, 'officielle', c.officielle);
end;
$function$;
revoke execute on function public.voter_carte(uuid, boolean) from public, anon;
grant execute on function public.voter_carte(uuid, boolean) to authenticated;
revoke execute on function public.cartes_joueurs_controle() from public, anon, authenticated;
