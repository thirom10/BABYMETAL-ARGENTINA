-- =====================================================================
-- 0003 — Sólo datos reales
-- Ejecutar en Supabase -> SQL Editor -> Run, DESPUÉS de 0001 y 0002.
-- Es idempotente: se puede volver a correr.
--
--   * Borra los setlists de EJEMPLO que había cargado seed.sql (con sus
--     canciones, likes y votos). Los setlists publicados por personas NO se tocan.
--   * Elimina las columnas que existían sólo para esos ejemplos
--     (is_demo, base_likes, base_votes, base_copies): los contadores pasan a
--     ser 100% reales (cantidad de filas de likes / votos / copias).
--   * Agrega al catálogo dos canciones que sonaron en la gira 2026
--     (Algorism, BxMxC) para poder elegirlas en un setlist.
-- =====================================================================

-- 1) Borrar ejemplos (si la columna todavía existe)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setlists' and column_name = 'is_demo'
  ) then
    delete from public.setlists where is_demo;
  end if;
end $$;

-- 2) list_setlists cambia de forma: se reemplaza antes de quitar las columnas
drop function if exists public.list_setlists();

alter table public.setlists
  drop column if exists is_demo,
  drop column if exists base_likes,
  drop column if exists base_votes,
  drop column if exists base_copies;

create or replace function public.list_setlists()
returns table (
  id uuid, name text, author text, song_ids text[], created_at timestamptz,
  likes bigint, votes bigint, copies bigint,
  liked boolean, voted boolean, is_own boolean,
  openers text[], social_network text, social_handle text
)
language sql stable security definer set search_path = ''
as $$
  select
    s.id, s.name, s.author,
    array(select ss.song_id from public.setlist_songs ss where ss.setlist_id = s.id order by ss.position),
    s.created_at,
    (select count(*) from public.setlist_likes  l where l.setlist_id = s.id),
    (select count(*) from public.setlist_votes  v where v.setlist_id = s.id),
    (select count(*) from public.setlist_copies c where c.setlist_id = s.id),
    exists (select 1 from public.setlist_likes l where l.setlist_id = s.id and l.user_id = auth.uid()),
    exists (select 1 from public.setlist_votes v where v.setlist_id = s.id and v.user_id = auth.uid()),
    coalesce(s.owner = auth.uid(), false),
    s.openers, s.social_network, s.social_handle
  from public.setlists s
  where not s.hidden
  order by s.created_at desc
  limit 300;
$$;

revoke all on function public.list_setlists() from public, anon, authenticated;
grant execute on function public.list_setlists() to anon, authenticated;

-- 3) Canciones que sonaron en la gira 2026 y faltaban en el catálogo
insert into public.songs (id, title, category) values
  ('bxmxc',    'BxMxC',    'FAN FAVORITES'),
  ('algorism', 'Algorism', 'FAN FAVORITES')
on conflict (id) do update set title = excluded.title, category = excluded.category;
