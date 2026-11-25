import { SOCIAL_NETWORKS, cleanHandle } from '../config/social';
import { useAuth } from '../state/auth';
import { useStore } from '../state/store';
import type { SocialNetwork } from '../types';
import { GoogleLogo } from './GoogleLogo';

/** Optional social network for the setlist being built. */
export function BuilderExtras({ socialError }: { socialError: boolean }) {
  const { state, dispatch } = useStore();

  return (
    <div className="sb-extras">
      <div className={`sb-field sb-social ${socialError ? 'is-error' : ''}`}>
        <span id="social-label">RED SOCIAL (OPCIONAL)</span>
        <div className="sb-social-row" role="group" aria-labelledby="social-label">
          <select
            aria-label="Red social"
            value={state.socialNetwork}
            onChange={(e) => {
              const network = e.target.value as SocialNetwork | '';
              dispatch({ type: 'social', network, handle: network ? state.socialHandle : '' });
            }}
          >
            <option value="">Ninguna</option>
            {SOCIAL_NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            aria-label="Tu usuario en esa red"
            placeholder={state.socialNetwork ? '@tuusuario' : 'Elegí una red'}
            value={state.socialHandle}
            disabled={!state.socialNetwork}
            maxLength={31}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => dispatch({ type: 'social', network: state.socialNetwork, handle: cleanHandle(e.target.value) })}
          />
        </div>
        <small className="sb-hint">Se muestra como link en tu setlist. Solo letras, números, punto, guion y guion bajo.</small>
      </div>
    </div>
  );
}

/** Account state shown above the builder: sign-in invitation, or usage of the 3-setlist limit. */
export function AccountCard({ onLogin }: { onLogin: () => void }) {
  const auth = useAuth();
  const { state } = useStore();
  if (!auth.enabled || auth.status !== 'ready') return null;

  if (!auth.user) {
    return (
      <div className="sb-account">
        <div className="sb-account-text">
          <strong>Armalo sin cuenta, publicalo con Google</strong>
          <span>Tu borrador queda guardado en este navegador. Hasta 3 setlists por cuenta; tu email nunca se muestra.</span>
        </div>
        <button className="btn btn-ghost btn-sm sb-account-btn" onClick={onLogin}>
          <GoogleLogo size={16} /> INGRESAR CON GOOGLE
        </button>
      </div>
    );
  }

  const used = state.account?.used;
  const max = state.account?.max ?? 3;
  return (
    <div className="sb-account is-in">
      <div className="sb-account-text">
        <strong>{auth.user.firstName ? `Sesión iniciada · ${auth.user.firstName}` : 'Sesión iniciada'}</strong>
        <span>
          {used == null ? 'Cargando tu cuenta…' : `Publicaste ${used} de ${max} setlists.`}
          {used != null && used >= max ? ' Borrá uno tuyo en la comunidad para publicar otro.' : ''}
        </span>
      </div>
      <div className="sb-account-meter" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <i key={i} className={used != null && i < used ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  );
}
