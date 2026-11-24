import { isSupabaseConfigured } from '../config/env';
import { getSupabase } from '../lib/supabase';
import { RepositoryError, toRepositoryError } from './errors';

/** A signed-in REAL account. Anonymous sessions (used for likes/votes) are not "users" here. */
export interface AuthUser {
  id: string;
  /** Given name from the Google profile, only used to greet the person in their own browser. */
  firstName: string | null;
}

export interface AuthService {
  /** false when Supabase is not configured: login is not needed (demo mode). */
  enabled: boolean;
  /** Calls back with the current user right away and on every change. Returns the unsubscribe function. */
  onChange(cb: (user: AuthUser | null) => void): () => void;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
}

const DRAFT_FLAG = 'bma:after-login';

/** Remembers that, once the visitor is back from Google, we should take them to the builder. */
export function markReturnToBuilder() {
  try {
    sessionStorage.setItem(DRAFT_FLAG, 'crear');
  } catch {
    /* storage can be unavailable (private mode): the redirect still works */
  }
}

export function consumeReturnToBuilder(): boolean {
  try {
    const v = sessionStorage.getItem(DRAFT_FLAG);
    if (v) sessionStorage.removeItem(DRAFT_FLAG);
    return v === 'crear';
  } catch {
    return false;
  }
}

function createMockAuth(): AuthService {
  const demo: AuthUser = { id: 'demo', firstName: null };
  return {
    enabled: false,
    onChange: (cb) => {
      cb(demo);
      return () => {};
    },
    signInWithGoogle: async () => {},
    signOut: async () => {},
  };
}

function createSupabaseAuth(): AuthService {
  return {
    enabled: true,

    onChange: (cb) => {
      let cancelled = false;
      let unsubscribe = () => {};
      getSupabase()
        .then((sb) => {
          if (cancelled) return;
          // Fires immediately with INITIAL_SESSION (after the OAuth code, if any, has been exchanged).
          const { data } = sb.auth.onAuthStateChange((_event, session) => {
            const u = session?.user;
            if (!u || u.is_anonymous) return cb(null);
            const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
            const full = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : '';
            cb({ id: u.id, firstName: full.split(' ')[0] || null });
          });
          unsubscribe = () => data.subscription.unsubscribe();
        })
        .catch(() => cb(null));
      return () => {
        cancelled = true;
        unsubscribe();
      };
    },

    signInWithGoogle: async () => {
      try {
        const sb = await getSupabase();
        const { error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/`, queryParams: { prompt: 'select_account' } },
        });
        if (error) throw new RepositoryError('AUTH_FAILED', error.message);
      } catch (e) {
        throw toRepositoryError(e);
      }
    },

    signOut: async () => {
      const sb = await getSupabase();
      await sb.auth.signOut();
    },
  };
}

export const authService: AuthService = isSupabaseConfigured ? createSupabaseAuth() : createMockAuth();
