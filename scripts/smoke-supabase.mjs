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
console.log(`  --   hay ${list.data?.length ?? 0} setlist(s) publicados (solo reales: ya no existen los de ejemplo)`);
if (list.data?.[0]) {
  check('ya no hay columnas de datos de ejemplo (¿corriste 0003?)', !('is_demo' in list.data[0]), 'is_demo' in list.data[0] ? 'todavía existe is_demo' : '');
}
check('list_setlists trae teloneros y red social (¿corriste 0002?)', Array.isArray(list.data?.[0]?.openers), list.error?.message);

const profilesDirect = await sb.from('profiles').select('*').limit(1);
check('la tabla profiles NO se puede leer directo', Boolean(profilesDirect.error) || (profilesDirect.data ?? []).length === 0, profilesDirect.error?.code);

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

  const five = ['megitsune', 'iine', 'karate', 'monochrome', 'ratatata'];
  const base = { p_name: 'Prueba', p_author: 'Smoke', p_song_ids: five };

  const manyOpeners = await sb.rpc('publish_setlist', { ...base, p_openers: ['a', 'b', 'c', 'd', 'e', 'f'] });
  check('rechaza más de 5 teloneros', manyOpeners.error?.message?.includes('INVALID_OPENERS'), manyOpeners.error?.message);

  const longOpener = await sb.rpc('publish_setlist', { ...base, p_openers: ['x'.repeat(31)] });
  check('rechaza telonero de más de 30 caracteres', longOpener.error?.message?.includes('INVALID_OPENERS'), longOpener.error?.message);

  const halfSocial = await sb.rpc('publish_setlist', { ...base, p_social_network: 'instagram', p_social_handle: null });
  check('rechaza red social sin usuario', halfSocial.error?.message?.includes('INVALID_SOCIAL'), halfSocial.error?.message);

  const badNet = await sb.rpc('publish_setlist', { ...base, p_social_network: 'myspace', p_social_handle: 'x' });
  check('rechaza red social desconocida', badNet.error?.message?.includes('INVALID_SOCIAL'), badNet.error?.message);

  const badHandle = await sb.rpc('publish_setlist', { ...base, p_social_network: 'instagram', p_social_handle: 'a b/../c' });
  check('rechaza usuario con caracteres inválidos', badHandle.error?.message?.includes('INVALID_SOCIAL'), badHandle.error?.message);

  const anonPublish = await sb.rpc('publish_setlist', {
    ...base,
    p_openers: ['nvlo'],
    p_social_network: 'instagram',
    p_social_handle: 'usuario.demo',
  });
  check('una sesión ANÓNIMA no puede publicar (pide cuenta real)', anonPublish.error?.message?.includes('LOGIN_REQUIRED'), anonPublish.error?.message);

  const acct = await sb.rpc('my_account');
  check('my_account marca la sesión como anónima', acct.data?.[0]?.is_anonymous === true, JSON.stringify(acct.data?.[0] ?? acct.error?.message));

  const delFake = await sb.rpc('delete_setlist', { p_setlist_id: '00000000-0000-4000-8000-0000000000ff' });
  check('borrar un setlist ajeno / inexistente falla', delFake.error?.message?.includes('NOT_FOUND'), delFake.error?.message);

  // 0003 adds Algorism and BxMxC to the catalog: with them the input is valid and only the login is missing.
  const tourSongs = await sb.rpc('publish_setlist', { ...base, p_song_ids: ['algorism', 'bxmxc', 'karate', 'monochrome', 'ratatata'] });
  check('el catálogo incluye Algorism y BxMxC (¿corriste 0003?)', tourSongs.error?.message?.includes('LOGIN_REQUIRED'), tourSongs.error?.message);

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
