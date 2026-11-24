// Smoke test for the Supabase setup. Does NOT publish anything visible.
//
//   npm run smoke:supabase
//
// Reads VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_ANON_KEY from .env.local.
// Checks that: reads work, the public key cannot touch tables directly, writes
// need a session, anonymous sign-in is enabled, server validations reject bad
// input, and likes toggle (and are undone). Leaves one anonymous auth user behind.
import { createClient } from '@supabase/supabase-js';

try {
  process.loadEnvFile('.env.local');
} catch {
  console.error('No se encontró .env.local en esta carpeta.');
  process.exit(1);
}

const url = process.env.VITE_PUBLIC_SUPABASE_URL;
const key = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Faltan VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let failed = 0;
const check = (name, ok, extra = '') => {
  if (!ok) failed++;
  console.log(`${ok ? '  OK ' : 'FALLÓ'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

console.log('== Sin sesión (rol anon) ==');
const list = await sb.rpc('list_setlists');
check('list_setlists responde', !list.error, list.error?.message);
check('hay setlists (¿corriste seed.sql?)', (list.data?.length ?? 0) > 0, `${list.data?.length ?? 0} setlists`);

const rank = await sb.rpc('people_ranking');
check('people_ranking responde', !rank.error, rank.error?.message);

const direct = await sb.from('setlists').select('*').limit(1);
check('las tablas NO se pueden leer directo', Boolean(direct.error) || (direct.data ?? []).length === 0, direct.error?.code);

const ins = await sb.from('setlists').insert({ name: 'x', author: 'y' });
check('no se puede insertar directo en tablas', Boolean(ins.error), ins.error?.code);

const noSession = await sb.rpc('publish_setlist', { p_name: 'x', p_author: 'y', p_song_ids: [] });
check('publicar sin sesión está bloqueado', Boolean(noSession.error), noSession.error?.code);

console.log('== Con sesión anónima ==');
const auth = await sb.auth.signInAnonymously();
check('inicio de sesión anónimo activado', !auth.error, auth.error?.message);

if (!auth.error) {
  const few = await sb.rpc('publish_setlist', { p_name: 'Prueba', p_author: 'Smoke', p_song_ids: ['megitsune', 'iine'] });
  check('rechaza setlists con menos de 5 canciones', few.error?.message?.includes('INVALID_SONGS'), few.error?.message);

  const unknown = await sb.rpc('publish_setlist', {
    p_name: 'Prueba',
    p_author: 'Smoke',
    p_song_ids: ['no-existe-1', 'no-existe-2', 'no-existe-3', 'no-existe-4', 'no-existe-5'],
  });
  check('rechaza canciones inexistentes', unknown.error?.message?.includes('UNKNOWN_SONG'), unknown.error?.message);

  const dup = await sb.rpc('publish_setlist', {
    p_name: 'Prueba',
    p_author: 'Smoke',
    p_song_ids: ['megitsune', 'megitsune', 'iine', 'karate', 'monochrome'],
  });
  check('rechaza canciones repetidas', dup.error?.message?.includes('INVALID_SONGS'), dup.error?.message);

  const noName = await sb.rpc('publish_setlist', { p_name: '   ', p_author: 'Smoke', p_song_ids: ['megitsune', 'iine', 'karate', 'monochrome', 'ratatata'] });
  check('rechaza nombre vacío', noName.error?.message?.includes('INVALID_NAME'), noName.error?.message);

  const first = list.data?.[0]?.id;
  if (first) {
    const on = await sb.rpc('toggle_reaction', { p_setlist_id: first, p_kind: 'like' });
    const off = await sb.rpc('toggle_reaction', { p_setlist_id: first, p_kind: 'like' });
    check('like se activa y se desactiva', on.data === true && off.data === false, `${on.data} -> ${off.data}`);
    const bad = await sb.rpc('toggle_reaction', { p_setlist_id: first, p_kind: 'otra' });
    check('rechaza tipos de reacción inválidos', Boolean(bad.error), bad.error?.message);
  }
  await sb.auth.signOut();
}

console.log(failed ? `\n${failed} chequeo(s) fallaron.` : '\nTodo en orden.');
process.exit(failed ? 1 : 0);
