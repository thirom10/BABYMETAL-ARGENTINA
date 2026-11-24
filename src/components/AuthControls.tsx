import { useState } from 'react';
import { friendlyError } from '../services/errors';
import { useAuth } from '../state/auth';
import { useStore } from '../state/store';
import { GoogleLogo } from './GoogleLogo';
import './AuthControls.css';

/** Sign-in / sign-out controls for the header (bar) and the mobile menu (sheet). */
export function AuthControls({ variant }: { variant: 'bar' | 'sheet' }) {
  const auth = useAuth();
  const { notify } = useStore();
  const [busy, setBusy] = useState(false);

  if (!auth.enabled || auth.status !== 'ready') return null;

  const login = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await auth.signIn();
    } catch (e) {
      notify(friendlyError(e));
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      notify('Cerraste sesión.');
    } catch (e) {
      notify(friendlyError(e));
    }
  };

  if (auth.user) {
    return (
      <div className={`auth auth-${variant}`}>
        <span className="auth-hello">
          <span className="auth-avatar" aria-hidden="true">
            {(auth.user.firstName ?? 'F').charAt(0).toUpperCase()}
          </span>
          <span className="auth-hello-text">{auth.user.firstName ? `Hola, ${auth.user.firstName}` : 'Sesión iniciada'}</span>
        </span>
        <button className="auth-link" onClick={logout}>
          SALIR
        </button>
      </div>
    );
  }

  return (
    <div className={`auth auth-${variant}`}>
      <button className="auth-login" onClick={login} disabled={busy} aria-busy={busy} aria-label="Ingresar con Google">
        <GoogleLogo size={16} />
        <span className="auth-login-text">{busy ? 'YENDO A GOOGLE…' : 'INGRESAR CON GOOGLE'}</span>
      </button>
    </div>
  );
}
