import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, publicEnv } from '../config/env';
import { RepositoryError } from '../services/errors';

/**
 * Supabase browser client. Uses ONLY the public URL and the anon (publishable)
 * key. It is safe to ship because every table has RLS enabled with no policies:
 * the browser can only call the vetted functions in supabase/migrations.
 */
let client: Promise<SupabaseClient> | null = null;

/** The SDK is loaded lazily (separate chunk) so it never delays the first paint. */
export function getSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) return Promise.reject(new RepositoryError('UNKNOWN', 'Supabase no está configurado.'));
  client ??= import('@supabase/supabase-js')
    .then(({ createClient }) =>
      createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }),
    )
    .catch((e) => {
      client = null;
      throw e;
    });
  return client;
}

let pendingSession: Promise<void> | null = null;

/**
 * Makes sure there is a session before a write. Visitors get an invisible
 * anonymous session (needs "Anonymous sign-ins" enabled in Supabase Auth), so
 * likes/votes are one per person without asking anyone to register.
 * Browsing never creates a session.
 */
export function ensureSession(): Promise<void> {
  pendingSession ??= (async () => {
    const sb = await getSupabase();
    const { data } = await sb.auth.getSession();
    if (data.session) return;
    const { error } = await sb.auth.signInAnonymously();
    if (error) {
      console.warn('[supabase] anonymous sign-in failed:', error.message);
      throw new RepositoryError('AUTH_FAILED', error.message);
    }
  })().finally(() => {
    // Only de-duplicate concurrent calls; re-check the session on every write.
    pendingSession = null;
  });
  return pendingSession;
}
