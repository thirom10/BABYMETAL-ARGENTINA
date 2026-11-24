-- =====================================================================
-- Setlists de EJEMPLO para que la comunidad no arranque vacía.
-- Ejecutar DESPUÉS de 0001_init.sql. Es idempotente.
-- Para quitarlos: delete from public.setlists where is_demo;
-- =====================================================================

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000001', 'Kitsune en Villa Crespo', 'MoaFoxBA', true, 412, 188, 37, '2026-11-19T01:14:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000001', 1, 'babymetal-death'),
  ('00000000-0000-4000-8000-000000000001', 2, 'megitsune'),
  ('00000000-0000-4000-8000-000000000001', 3, 'from-me-to-u'),
  ('00000000-0000-4000-8000-000000000001', 4, 'pa-pa-ya'),
  ('00000000-0000-4000-8000-000000000001', 5, 'kawaii'),
  ('00000000-0000-4000-8000-000000000001', 6, 'monochrome'),
  ('00000000-0000-4000-8000-000000000001', 7, 'distortion'),
  ('00000000-0000-4000-8000-000000000001', 8, 'song-3'),
  ('00000000-0000-4000-8000-000000000001', 9, 'metali'),
  ('00000000-0000-4000-8000-000000000001', 10, 'gimme-chocolate'),
  ('00000000-0000-4000-8000-000000000001', 11, 'ratatata'),
  ('00000000-0000-4000-8000-000000000001', 12, 'karate'),
  ('00000000-0000-4000-8000-000000000001', 13, 'headbangeeeeerrrrr'),
  ('00000000-0000-4000-8000-000000000001', 14, 'road-of-resistance')
on conflict do nothing;

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000002', 'Full METAL FORTH', 'su.metal.ar', true, 268, 241, 22, '2026-11-19T13:02:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000002', 1, 'babymetal-death'),
  ('00000000-0000-4000-8000-000000000002', 2, 'from-me-to-u'),
  ('00000000-0000-4000-8000-000000000002', 3, 'song-3'),
  ('00000000-0000-4000-8000-000000000002', 4, 'kawaii'),
  ('00000000-0000-4000-8000-000000000002', 5, 'sunset-kiss'),
  ('00000000-0000-4000-8000-000000000002', 6, 'syncopation'),
  ('00000000-0000-4000-8000-000000000002', 7, 'metali'),
  ('00000000-0000-4000-8000-000000000002', 8, 'kon-kon'),
  ('00000000-0000-4000-8000-000000000002', 9, 'ratatata'),
  ('00000000-0000-4000-8000-000000000002', 10, 'gimme-chocolate'),
  ('00000000-0000-4000-8000-000000000002', 11, 'road-of-resistance')
on conflict do nothing;

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000003', 'Los deseos imposibles', 'IjimeDameRosario', true, 351, 97, 54, '2026-11-15T22:40:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000003', 1, 'arkadia'),
  ('00000000-0000-4000-8000-000000000003', 2, 'megitsune'),
  ('00000000-0000-4000-8000-000000000003', 3, 'ijime-dame-zettai'),
  ('00000000-0000-4000-8000-000000000003', 4, 'doki-doki-morning'),
  ('00000000-0000-4000-8000-000000000003', 5, 'akatsuki'),
  ('00000000-0000-4000-8000-000000000003', 6, 'distortion'),
  ('00000000-0000-4000-8000-000000000003', 7, 'karate'),
  ('00000000-0000-4000-8000-000000000003', 8, 'the-one'),
  ('00000000-0000-4000-8000-000000000003', 9, 'iine'),
  ('00000000-0000-4000-8000-000000000003', 10, 'road-of-resistance')
on conflict do nothing;

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000004', 'Primera vez en Argentina (otra vez)', 'MetalResistanceCBA', true, 94, 63, 5, '2026-11-20T11:31:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000004', 1, 'babymetal-death'),
  ('00000000-0000-4000-8000-000000000004', 2, 'distortion'),
  ('00000000-0000-4000-8000-000000000004', 3, 'megitsune'),
  ('00000000-0000-4000-8000-000000000004', 4, 'elevator-girl'),
  ('00000000-0000-4000-8000-000000000004', 5, 'shanti-shanti-shanti'),
  ('00000000-0000-4000-8000-000000000004', 6, 'monochrome'),
  ('00000000-0000-4000-8000-000000000004', 7, 'pa-pa-ya'),
  ('00000000-0000-4000-8000-000000000004', 8, 'karate'),
  ('00000000-0000-4000-8000-000000000004', 9, 'gimme-chocolate'),
  ('00000000-0000-4000-8000-000000000004', 10, 'headbangeeeeerrrrr'),
  ('00000000-0000-4000-8000-000000000004', 11, 'road-of-resistance')
on conflict do nothing;

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000005', 'Headbang hasta el amanecer', 'Kami_Band_Fan', true, 187, 205, 12, '2026-11-13T02:55:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000005', 1, 'babymetal-death'),
  ('00000000-0000-4000-8000-000000000005', 2, 'metalizm'),
  ('00000000-0000-4000-8000-000000000005', 3, 'divine-attack'),
  ('00000000-0000-4000-8000-000000000005', 4, 'kawaii'),
  ('00000000-0000-4000-8000-000000000005', 5, 'song-3'),
  ('00000000-0000-4000-8000-000000000005', 6, 'yava'),
  ('00000000-0000-4000-8000-000000000005', 7, 'karate'),
  ('00000000-0000-4000-8000-000000000005', 8, 'syncopation'),
  ('00000000-0000-4000-8000-000000000005', 9, 'ratatata'),
  ('00000000-0000-4000-8000-000000000005', 10, 'headbangeeeeerrrrr'),
  ('00000000-0000-4000-8000-000000000005', 11, 'gimme-chocolate'),
  ('00000000-0000-4000-8000-000000000005', 12, 'road-of-resistance')
on conflict do nothing;

insert into public.setlists (id, name, author, is_demo, base_likes, base_votes, base_copies, created_at)
values ('00000000-0000-4000-8000-000000000006', 'Sunset en Movistar Arena', 'kitsunegirl_mza', true, 143, 76, 9, '2026-11-17T20:20:00.000Z')
on conflict (id) do nothing;
insert into public.setlist_songs (setlist_id, position, song_id) values
  ('00000000-0000-4000-8000-000000000006', 1, 'from-me-to-u'),
  ('00000000-0000-4000-8000-000000000006', 2, 'babymetal-death'),
  ('00000000-0000-4000-8000-000000000006', 3, 'megitsune'),
  ('00000000-0000-4000-8000-000000000006', 4, 'sunset-kiss'),
  ('00000000-0000-4000-8000-000000000006', 5, 'starlight'),
  ('00000000-0000-4000-8000-000000000006', 6, 'monochrome'),
  ('00000000-0000-4000-8000-000000000006', 7, 'iine'),
  ('00000000-0000-4000-8000-000000000006', 8, 'metali'),
  ('00000000-0000-4000-8000-000000000006', 9, 'ratatata'),
  ('00000000-0000-4000-8000-000000000006', 10, 'road-of-resistance'),
  ('00000000-0000-4000-8000-000000000006', 11, 'the-one')
on conflict do nothing;
