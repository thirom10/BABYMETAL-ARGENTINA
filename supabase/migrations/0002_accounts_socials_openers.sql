-- =====================================================================
-- 0002 — Cuentas reales (Google), tope de 3 setlists, redes sociales y teloneros
-- Ejecutar en Supabase -> SQL Editor -> Run, DESPUÉS de 0001_init.sql.
-- Es idempotente: se puede volver a correr.
--
-- Cambios:
--   * Publicar ahora exige una cuenta real (no anónima). Likes y votos siguen
--     funcionando con sesión anónima.
--   * Máximo 3 setlists publicados por cuenta (se puede borrar uno propio para
--     publicar otro).
--   * Cada setlist puede llevar red social + usuario del autor y hasta 5 teloneros.
--   * Tabla profiles: recuerda nickname y red social para precargarlos.
--   * El email de Google NUNCA se expone: sólo se publica el nickname elegido.
-- =====================================================================

-- ---------- setlists: teloneros y red social ----------
alter table public.setlists
  add column if not exists openers        text[] not null default '{}',
  add column if not exists social_network text,
  add column if not exists social_handle  text;

alter table public.setlists drop constraint if exists setlists_openers_max;
alter table public.setlists add  constraint setlists_openers_max check (cardinality(openers) <= 5);

alter table public.setlists drop constraint if exists setlists_social_pair;
alter table public.setlists add  constraint setlists_social_pair check ((social_network is null) = (social_handle is null));

alter table public.setlists drop constraint if exists setlists_social_network_valid;
alter table public.setlists add  constraint setlists_social_network_valid
  check (social_network is null or social_network in ('instagram', 'tiktok', 'x', 'youtube', 'facebook', 'twitch'));

alter table public.setlists drop constraint if exists setlists_social_handle_valid;
alter table public.setlists add  constraint setlists_social_handle_valid
  check (social_handle is null or social_handle ~ '^[A-Za-z0-9._-]{1,30}$');

-- ---------- profiles (nickname + red preferida por cuenta) ----------
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  nickname       text check (char_length(nickname) between 1 and 24),
  social_network text check (social_network is null or social_network in ('instagram', 'tiktok', 'x', 'youtube', 'facebook', 'twitch')),
  social_handle  text check (social_handle is null or social_handle ~ '^[A-Za-z0-9._-]{1,30}$'),
  updated_at     timestamptz not null default now(),
  check ((social_network is null) = (social_handle is null))
);
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;

-- ---------- Funciones (se reemplazan las de 0001 que cambian de forma) ----------
drop function if exists public.publish_setlist(text, text, text[]);
drop function if exists public.list_setlists();

create or replace function public.list_setlists()
returns table (
  id uuid, name text, author text, song_ids text[], created_at timestamptz,
  likes bigint, votes bigint, copies bigint,
  liked boolean, voted boolean, is_own boolean, is_demo boolean,
  openers text[], social_network text, social_handle text
)
language sql stable security definer set search_path = ''
as $$
  select
    s.id, s.name, s.author,
    array(select ss.song_id from public.setlist_songs ss where ss.setlist_id = s.id order by ss.position),
    s.created_at,
    s.base_likes  + (select count(*) from public.setlist_likes  l where l.setlist_id = s.id),
    s.base_votes  + (select count(*) from public.setlist_votes  v where v.setlist_id = s.id),
    s.base_copies + (select count(*) from public.setlist_copies c where c.setlist_id = s.id),
    exists (select 1 from public.setlist_likes l where l.setlist_id = s.id and l.user_id = auth.uid()),
    exists (select 1 from public.setlist_votes v where v.setlist_id = s.id and v.user_id = auth.uid()),
    coalesce(s.owner = auth.uid(), false),
    s.is_demo,
    s.openers, s.social_network, s.social_handle
  from public.setlists s
  where not s.hidden
  order by s.created_at desc
  limit 300;
$$;

-- Publicar: valida todo, exige cuenta real y respeta el tope de 3 por cuenta.
create or replace function public.publish_setlist(
  p_name           text,
  p_author         text,
  p_song_ids       text[],
  p_openers        text[] default '{}',
  p_social_network text   default null,
  p_social_handle  text   default null
)
returns table (new_id uuid, new_created_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_name    text := btrim(regexp_replace(coalesce(p_name,   ''), '[[:cntrl:]]', '', 'g'));
  v_author  text := btrim(regexp_replace(coalesce(p_author, ''), '[[:cntrl:]]', '', 'g'));
  v_n       int  := coalesce(cardinality(p_song_ids), 0);
  v_openers text[];
  v_net     text := nullif(btrim(coalesce(p_social_network, '')), '');
  v_handle  text := nullif(regexp_replace(btrim(regexp_replace(coalesce(p_social_handle, ''), '[[:cntrl:]]', '', 'g')), '^@+', ''), '');
  v_id      uuid;
  v_created timestamptz;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  if char_length(v_name)   not between 1 and 48 then raise exception 'INVALID_NAME';   end if;
  if char_length(v_author) not between 1 and 24 then raise exception 'INVALID_AUTHOR'; end if;
  if v_n < 5 or v_n > 25 then raise exception 'INVALID_SONGS'; end if;
  if (select count(distinct t.s) from unnest(p_song_ids) as t(s)) <> v_n then raise exception 'INVALID_SONGS'; end if;
  if (select count(*) from public.songs so where so.id = any (p_song_ids)) <> v_n then raise exception 'UNKNOWN_SONG'; end if;

  -- Teloneros: limpiar, quitar vacíos y repetidos (conserva el orden). Máx. 5 de hasta 30 caracteres.
  select coalesce(array_agg(d.o order by d.first_ord), '{}')
    into v_openers
  from (
    select t.o, min(t.ord) as first_ord
    from (
      select btrim(regexp_replace(u.x, '[[:cntrl:]]', '', 'g')) as o, u.ord
      from unnest(coalesce(p_openers, '{}'::text[])) with ordinality as u(x, ord)
    ) t
    where t.o <> ''
    group by t.o
  ) d;
  if cardinality(v_openers) > 5 then raise exception 'INVALID_OPENERS'; end if;
  if exists (select 1 from unnest(v_openers) as t(o) where char_length(t.o) > 30) then raise exception 'INVALID_OPENERS'; end if;

  -- Red social: o ambos campos o ninguno.
  if (v_net is null) <> (v_handle is null) then raise exception 'INVALID_SOCIAL'; end if;
  if v_net is not null then
    if v_net not in ('instagram', 'tiktok', 'x', 'youtube', 'facebook', 'twitch') then raise exception 'INVALID_SOCIAL'; end if;
    if v_handle !~ '^[A-Za-z0-9._-]{1,30}$' then raise exception 'INVALID_SOCIAL'; end if;
  end if;

  -- Sólo cuentas reales pueden publicar (las anónimas sirven para likes y votos).
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then raise exception 'LOGIN_REQUIRED'; end if;

  -- Tope por cuenta.
  if (select count(*) from public.setlists x where x.owner = v_uid) >= 3 then raise exception 'LIMIT_TOTAL'; end if;

  insert into public.setlists (owner, name, author, openers, social_network, social_handle)
  values (v_uid, v_name, v_author, v_openers, v_net, v_handle)
  returning public.setlists.id, public.setlists.created_at into v_id, v_created;

  insert into public.setlist_songs (setlist_id, position, song_id)
  select v_id, t.ord::smallint, t.song_id
  from unnest(p_song_ids) with ordinality as t(song_id, ord);

  -- Recordar nickname y red para precargarlos la próxima vez.
  insert into public.profiles (user_id, nickname, social_network, social_handle, updated_at)
  values (v_uid, v_author, v_net, v_handle, now())
  on conflict (user_id) do update
    set nickname = excluded.nickname,
        social_network = excluded.social_network,
        social_handle = excluded.social_handle,
        updated_at = now();

  return query select v_id, v_created;
end;
$$;

-- Datos de la cuenta actual (siempre devuelve una fila).
create or replace function public.my_account()
returns table (nickname text, social_network text, social_handle text, setlists_used integer, setlists_max integer, is_anonymous boolean)
language sql stable security definer set search_path = ''
as $$
  select p.nickname, p.social_network, p.social_handle,
         (select count(*)::int from public.setlists s where s.owner = auth.uid()),
         3,
         coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  from (select 1) d
  left join public.profiles p on p.user_id = auth.uid();
$$;

-- Borrar un setlist propio (para liberar un lugar del tope de 3).
create or replace function public.delete_setlist(p_setlist_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  delete from public.setlists s where s.id = p_setlist_id and s.owner = v_uid;
  if not found then raise exception 'NOT_FOUND'; end if;
end;
$$;

-- ---------- Permisos de ejecución ----------
revoke all on function public.list_setlists()                                         from public, anon, authenticated;
revoke all on function public.publish_setlist(text, text, text[], text[], text, text) from public, anon, authenticated;
revoke all on function public.my_account()                                            from public, anon, authenticated;
revoke all on function public.delete_setlist(uuid)                                    from public, anon, authenticated;

grant execute on function public.list_setlists()                                         to anon, authenticated;
grant execute on function public.publish_setlist(text, text, text[], text[], text, text) to authenticated;
grant execute on function public.my_account()                                            to authenticated;
grant execute on function public.delete_setlist(uuid)                                    to authenticated;
