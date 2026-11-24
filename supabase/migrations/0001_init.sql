-- =====================================================================
-- BABYMETAL ARGENTINA — esquema inicial
-- Ejecutar completo en Supabase -> SQL Editor -> Run.
-- Es idempotente: se puede volver a correr sin romper nada.
--
-- Modelo de seguridad:
--   * Todas las tablas tienen RLS activado y NINGUNA policy: el navegador
--     (roles anon / authenticated) no puede leerlas ni escribirlas directo.
--   * Todo el acceso pasa por funciones SECURITY DEFINER que validan los datos
--     y limitan el abuso. Se les da EXECUTE sólo a los roles que corresponde.
--   * Escribir requiere sesión (anónima o no) => 1 like / voto por usuario.
-- =====================================================================

-- ---------- Tablas ----------
create table if not exists public.songs (
  id       text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  title    text not null check (char_length(title) between 1 and 80),
  category text not null check (category in ('CLASSICS', 'METAL FORTH', 'FAN FAVORITES', 'WILDCARDS'))
);

create table if not exists public.setlists (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 48),
  author      text not null check (char_length(author) between 1 and 24),
  is_demo     boolean not null default false,
  hidden      boolean not null default false,   -- moderación: ocultar sin borrar
  base_likes  integer not null default 0 check (base_likes  >= 0),
  base_votes  integer not null default 0 check (base_votes  >= 0),
  base_copies integer not null default 0 check (base_copies >= 0),
  created_at  timestamptz not null default now()
);
create index if not exists setlists_created_idx       on public.setlists (created_at desc);
create index if not exists setlists_owner_created_idx on public.setlists (owner, created_at desc);

create table if not exists public.setlist_songs (
  setlist_id uuid     not null references public.setlists(id) on delete cascade,
  position   smallint not null check (position between 1 and 25),
  song_id    text     not null references public.songs(id),
  primary key (setlist_id, position),
  unique (setlist_id, song_id)
);
create index if not exists setlist_songs_song_idx on public.setlist_songs (song_id);

create table if not exists public.setlist_likes (
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  user_id    uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (setlist_id, user_id)
);

create table if not exists public.setlist_votes (
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  user_id    uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (setlist_id, user_id)
);

create table if not exists public.setlist_copies (
  setlist_id uuid not null references public.setlists(id) on delete cascade,
  user_id    uuid not null references auth.users(id)      on delete cascade,
  created_at timestamptz not null default now(),
  primary key (setlist_id, user_id)
);

-- ---------- RLS: activado y sin policies (acceso sólo vía funciones) ----------
alter table public.songs          enable row level security;
alter table public.setlists       enable row level security;
alter table public.setlist_songs  enable row level security;
alter table public.setlist_likes  enable row level security;
alter table public.setlist_votes  enable row level security;
alter table public.setlist_copies enable row level security;

revoke all on table public.songs, public.setlists, public.setlist_songs,
                    public.setlist_likes, public.setlist_votes, public.setlist_copies
  from anon, authenticated;

-- ---------- Catálogo de canciones (validación de ids en el servidor) ----------
insert into public.songs (id, title, category) values
  ('babymetal-death', 'BABYMETAL DEATH', 'CLASSICS'),
  ('megitsune', 'Megitsune', 'CLASSICS'),
  ('gimme-chocolate', 'Gimme Chocolate!!', 'CLASSICS'),
  ('iine', 'Iine!', 'CLASSICS'),
  ('headbangeeeeerrrrr', 'Headbangeeeeerrrrr!!!!!', 'CLASSICS'),
  ('road-of-resistance', 'ROAD OF RESISTANCE', 'CLASSICS'),
  ('karate', 'KARATE', 'CLASSICS'),
  ('akatsuki', 'Akatsuki', 'CLASSICS'),
  ('catch-me-if-you-can', 'Catch me if you can', 'CLASSICS'),
  ('awadama-fever', 'Awadama Fever', 'CLASSICS'),
  ('from-me-to-u', 'from me to u', 'METAL FORTH'),
  ('song-3', 'Song 3', 'METAL FORTH'),
  ('kawaii', 'KxAxWxAxIxI', 'METAL FORTH'),
  ('sunset-kiss', 'Sunset Kiss', 'METAL FORTH'),
  ('metali', 'METALI!!', 'METAL FORTH'),
  ('ratatata', 'RATATATA', 'METAL FORTH'),
  ('kon-kon', 'Kon! Kon!', 'METAL FORTH'),
  ('my-queen', 'My Queen', 'METAL FORTH'),
  ('monochrome', 'Monochrome', 'FAN FAVORITES'),
  ('syncopation', 'Syncopation', 'FAN FAVORITES'),
  ('pa-pa-ya', 'PA PA YA!!', 'FAN FAVORITES'),
  ('shanti-shanti-shanti', 'Shanti Shanti Shanti', 'FAN FAVORITES'),
  ('elevator-girl', 'Elevator Girl', 'FAN FAVORITES'),
  ('da-da-dance', 'DA DA DANCE', 'FAN FAVORITES'),
  ('starlight', 'Starlight', 'FAN FAVORITES'),
  ('the-one', 'THE ONE', 'FAN FAVORITES'),
  ('metalizm', 'METALIZM', 'FAN FAVORITES'),
  ('divine-attack', 'Divine Attack', 'FAN FAVORITES'),
  ('mirror-mirror', 'Mirror Mirror', 'FAN FAVORITES'),
  ('meta-taro', 'Meta Taro', 'FAN FAVORITES'),
  ('brand-new-day', 'Brand New Day', 'FAN FAVORITES'),
  ('oh-majinai', 'Oh! MAJINAI', 'FAN FAVORITES'),
  ('yava', 'YAVA!', 'FAN FAVORITES'),
  ('light-and-darkness', 'Light and Darkness', 'FAN FAVORITES'),
  ('future-metal', 'FUTURE METAL', 'FAN FAVORITES'),
  ('arkadia', 'Arkadia', 'WILDCARDS'),
  ('ijime-dame-zettai', 'Ijime, Dame, Zettai', 'WILDCARDS'),
  ('distortion', 'Distortion', 'WILDCARDS'),
  ('doki-doki-morning', 'Doki Doki ☆ Morning', 'WILDCARDS'),
  ('uki-uki-midnight', 'Uki Uki ★ Midnight', 'WILDCARDS'),
  ('onedari-daisakusen', 'Onedari Daisakusen', 'WILDCARDS'),
  ('akumu-no-rondo', 'Akumu no Rondo', 'WILDCARDS'),
  ('amore', 'Amore', 'WILDCARDS'),
  ('no-rain-no-rainbow', 'NO RAIN, NO RAINBOW', 'WILDCARDS'),
  ('tales-of-the-destinies', 'Tales of The Destinies', 'WILDCARDS'),
  ('night-night-burn', 'Night Night Burn!', 'WILDCARDS'),
  ('kagerou', 'Kagerou', 'WILDCARDS'),
  ('shine', 'Shine', 'WILDCARDS'),
  ('sis-anger', 'Sis. Anger', 'WILDCARDS')
on conflict (id) do update set title = excluded.title, category = excluded.category;

-- ---------- Funciones ----------

-- Lista de setlists visibles con contadores y estado del usuario actual.
create or replace function public.list_setlists()
returns table (
  id uuid, name text, author text, song_ids text[], created_at timestamptz,
  likes bigint, votes bigint, copies bigint,
  liked boolean, voted boolean, is_own boolean, is_demo boolean
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
    s.is_demo
  from public.setlists s
  where not s.hidden
  order by s.created_at desc
  limit 300;
$$;

-- Ranking de "The People's Setlist": veces elegida y posición promedio (0 = apertura, 1 = cierre).
create or replace function public.people_ranking()
returns table (song_id text, picks bigint, avg_pos numeric, total_setlists bigint)
language sql stable security definer set search_path = ''
as $$
  with pos as (
    select ss.song_id, ss.position,
           count(*) over (partition by ss.setlist_id) as n
    from public.setlist_songs ss
    join public.setlists s on s.id = ss.setlist_id
    where not s.hidden
  )
  select p.song_id,
         count(*)::bigint,
         avg(case when p.n > 1 then (p.position - 1)::numeric / (p.n - 1) else 0.5 end),
         (select count(*) from public.setlists where not hidden)::bigint
  from pos p
  group by p.song_id
  order by 2 desc, 1;
$$;

-- Publicar un setlist. Valida todo y limita el abuso.
create or replace function public.publish_setlist(p_name text, p_author text, p_song_ids text[])
returns table (new_id uuid, new_created_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_name    text := btrim(regexp_replace(coalesce(p_name,   ''), '[[:cntrl:]]', '', 'g'));
  v_author  text := btrim(regexp_replace(coalesce(p_author, ''), '[[:cntrl:]]', '', 'g'));
  v_n       int  := coalesce(cardinality(p_song_ids), 0);
  v_id      uuid;
  v_created timestamptz;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if char_length(v_name)   not between 1 and 48 then raise exception 'INVALID_NAME';   end if;
  if char_length(v_author) not between 1 and 24 then raise exception 'INVALID_AUTHOR'; end if;
  if v_n < 5 or v_n > 25 then raise exception 'INVALID_SONGS'; end if;
  if (select count(distinct t.s) from unnest(p_song_ids) as t(s)) <> v_n then raise exception 'INVALID_SONGS'; end if;
  if (select count(*) from public.songs so where so.id = any (p_song_ids)) <> v_n then raise exception 'UNKNOWN_SONG'; end if;

  -- Límites por usuario: 5 por hora y 25 en total.
  if (select count(*) from public.setlists x where x.owner = v_uid and x.created_at > now() - interval '1 hour') >= 5
    then raise exception 'RATE_LIMIT'; end if;
  if (select count(*) from public.setlists x where x.owner = v_uid) >= 25
    then raise exception 'LIMIT_TOTAL'; end if;

  insert into public.setlists (owner, name, author)
  values (v_uid, v_name, v_author)
  returning public.setlists.id, public.setlists.created_at into v_id, v_created;

  insert into public.setlist_songs (setlist_id, position, song_id)
  select v_id, t.ord::smallint, t.song_id
  from unnest(p_song_ids) with ordinality as t(song_id, ord);

  return query select v_id, v_created;
end;
$$;

-- Like / voto: alterna y devuelve el estado final (true = activo).
create or replace function public.toggle_reaction(p_setlist_id uuid, p_kind text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_deleted int;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_kind not in ('like', 'vote') then raise exception 'INVALID_KIND'; end if;
  if not exists (select 1 from public.setlists s where s.id = p_setlist_id and not s.hidden)
    then raise exception 'NOT_FOUND'; end if;

  if p_kind = 'like' then
    delete from public.setlist_likes l where l.setlist_id = p_setlist_id and l.user_id = v_uid;
    get diagnostics v_deleted = row_count;
    if v_deleted = 0 then
      insert into public.setlist_likes (setlist_id, user_id) values (p_setlist_id, v_uid);
      return true;
    end if;
    return false;
  else
    delete from public.setlist_votes l where l.setlist_id = p_setlist_id and l.user_id = v_uid;
    get diagnostics v_deleted = row_count;
    if v_deleted = 0 then
      insert into public.setlist_votes (setlist_id, user_id) values (p_setlist_id, v_uid);
      return true;
    end if;
    return false;
  end if;
end;
$$;

-- "Usar de base": una vez por usuario y setlist.
create or replace function public.register_copy(p_setlist_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if not exists (select 1 from public.setlists s where s.id = p_setlist_id and not s.hidden)
    then raise exception 'NOT_FOUND'; end if;
  insert into public.setlist_copies (setlist_id, user_id) values (p_setlist_id, v_uid)
  on conflict do nothing;
end;
$$;

-- ---------- Permisos de ejecución ----------
revoke all on function public.list_setlists()                     from public, anon, authenticated;
revoke all on function public.people_ranking()                    from public, anon, authenticated;
revoke all on function public.publish_setlist(text, text, text[]) from public, anon, authenticated;
revoke all on function public.toggle_reaction(uuid, text)         from public, anon, authenticated;
revoke all on function public.register_copy(uuid)                 from public, anon, authenticated;

grant execute on function public.list_setlists()                     to anon, authenticated;
grant execute on function public.people_ranking()                    to anon, authenticated;
grant execute on function public.publish_setlist(text, text, text[]) to authenticated;
grant execute on function public.toggle_reaction(uuid, text)         to authenticated;
grant execute on function public.register_copy(uuid)                 to authenticated;
