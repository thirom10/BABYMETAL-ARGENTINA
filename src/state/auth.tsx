import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, markReturnToBuilder, type AuthUser } from '../services/auth';

interface Auth {
  /** false in demo mode (no Supabase): publishing needs no account. */
  enabled: boolean;
  status: 'loading' | 'ready';
  /** Signed-in real account, or null. */
  user: AuthUser | null;
  /** Sends the visitor to Google. The page navigates away, so the draft must already be saved. */
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: 'loading' | 'ready'; user: AuthUser | null }>({ status: 'loading', user: null });

  useEffect(
    () =>
      authService.onChange((user) => {
        setState((prev) => (prev.status === 'ready' && prev.user?.id === user?.id ? prev : { status: 'ready', user }));
      }),
    [],
  );

  const signIn = useCallback(async () => {
    markReturnToBuilder();
    await authService.signInWithGoogle();
  }, []);

  const signOut = useCallback(() => authService.signOut(), []);

  const value = useMemo<Auth>(() => ({ enabled: authService.enabled, ...state, signIn, signOut }), [state, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
