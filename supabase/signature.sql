-- EMPREINTE DE LA BASE NEBULA
-- Une ligne par famille (colonnes, contraintes, index, regles d'acces, fonctions,
-- vues, droits...) avec une empreinte. Lancee sur deux bases, elle doit donner
-- les memes lignes : sinon, la base en ligne a ete modifiee a la main sans
-- migration, ou une migration n'a pas ete appliquee. Lecture seule.
-- Releve du 2 octobre 2026 (base en ligne = migrations) : col 130 35332ec5,
-- con 48 eb1e0aff, idx 36 a88af574, pol 43 73fe78af, fn 6 b5952ee6, vue 3 95b84993.
with t as (
  select c.oid, c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','v') and c.relname not like 'lfs\_%' and c.relname not in ('comptes_rendus','dossiers')
), lignes as (
  select 'col' k, t.relname || '.' || a.attname n,
     format_type(a.atttypid, a.atttypmod) || '|' || a.attnotnull || '|' || coalesce(pg_get_expr(d.adbin, d.adrelid), '') v
  from t join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped
  left join pg_attrdef d on d.adrelid=t.oid and d.adnum=a.attnum
  union all
  select 'con', t.relname || '.' || co.conname, replace(pg_get_constraintdef(co.oid), 'public.', '') from t join pg_constraint co on co.conrelid=t.oid
  union all
  select 'idx', t.relname || '.' || ic.relname, replace(pg_get_indexdef(i.indexrelid), 'public.', '') from t join pg_index i on i.indrelid=t.oid join pg_class ic on ic.oid=i.indexrelid
  union all
  select 'rls', c.relname, c.relrowsecurity::text from pg_class c join t on t.oid=c.oid
  union all
  select 'pol', tablename || '.' || policyname, permissive || '|' || cmd || '|' || array_to_string(roles, ',') || '|' || coalesce(replace(qual, 'public.', ''), '') || '|' || coalesce(replace(with_check, 'public.', ''), '')
  from pg_policies where schemaname='public' and tablename not like 'lfs\_%' and tablename not in ('comptes_rendus','dossiers')
  union all
  select 'fn', p.proname, md5(regexp_replace(pg_get_functiondef(p.oid), '\s+', ' ', 'g')) from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public'
  union all
  select 'trig', tc.relname || '.' || tg.tgname, replace(pg_get_triggerdef(tg.oid), 'public.', '') from pg_trigger tg join pg_class tc on tc.oid=tg.tgrelid join pg_namespace ns on ns.oid=tc.relnamespace where not tg.tgisinternal and ns.nspname='public'
  union all
  select 'vue', c.relname, md5(regexp_replace(replace(pg_get_viewdef(c.oid, true), 'public.', ''), '\s+', ' ', 'g')) || '|' || coalesce(array_to_string(c.reloptions, ','), '') from pg_class c join t on t.oid=c.oid where c.relkind='v'
  union all
  select 'grant', table_name || '.' || grantee, string_agg(privilege_type, ',' order by privilege_type) from information_schema.role_table_grants
  where table_schema='public' and grantee in ('anon','authenticated') and table_name::text not like 'lfs\_%' and table_name not in ('comptes_rendus','dossiers') group by table_name, grantee
  union all
  select 'colgrant', table_name || '.' || privilege_type || '.' || grantee, string_agg(column_name, ',' order by column_name) from information_schema.column_privileges
  where table_schema='public' and grantee in ('anon','authenticated') and table_name in ('profiles','elo_reseau') and privilege_type in ('INSERT','UPDATE') group by table_name, privilege_type, grantee
  union all
  select 'exec', p.proname || '.' || r.rolname, has_function_privilege(r.oid, p.oid, 'EXECUTE')::text
  from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace cross join pg_roles r where ns.nspname='public' and r.rolname in ('anon','authenticated','service_role')
)
select k, count(*) nb, md5(string_agg(n || '=' || md5(v), E'\n' order by n)) h from lignes group by k order by k;