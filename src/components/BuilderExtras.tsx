import { useState, type KeyboardEvent } from 'react';
import { SOCIAL_NETWORKS, cleanHandle } from '../config/social';
import { cleanText } from '../lib/format';
import { MAX_OPENERS } from '../services/setlistRepository';
import { useAuth } from '../state/auth';
import { useStore } from '../state/store';
import type { SocialNetwork } from '../types';
import { GoogleLogo } from './GoogleLogo';
import { Icon } from './Icon';

/** Social network + opening acts ("teloneros") for the setlist being built. */
export function BuilderExtras({ socialError }: { socialError: boolean }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const full = state.openers.length >= MAX_OPENERS;

  const addOpener = () => {
    const value = cleanText(text, 30).trim();
    if (!value) return;
    if (!full && !state.openers.some((o) => o.toLowerCase() === value.toLowerCase())) {
      dispatch({ type: 'openers', value: [...state.openers, value] });
    }
    setText('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addOpener();
    }
  };

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

      <div className="sb-field sb-openers">
        <span id="openers-label">TELONEROS (OPCIONAL)</span>
        <div className="sb-openers-row">
          <input
            type="text"
            aria-labelledby="openers-label"
            placeholder={full ? `Máximo ${MAX_OPENERS}` : 'Ej: nvlo'}
            value={text}
            maxLength={30}
            disabled={full}
            autoComplete="off"
            enterKeyHint="done"
            onChange={(e) => setText(cleanText(e.target.value, 30))}
            onKeyDown={onKey}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={addOpener} disabled={full || !text.trim()}>
            <Icon name="plus" size={16} /> AGREGAR
          </button>
        </div>
        {state.openers.length > 0 && (
          <ul className="sb-chips-list" aria-label="Teloneros elegidos">
            {state.openers.map((o) => (
              <li key={o} className="sb-opener">
                <span>{o}</span>
                <button type="button" onClick={() => dispatch({ type: 'openers', value: state.openers.filter((x) => x !== o) })} aria-label={`Quitar telonero ${o}`}>
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <small className="sb-hint">Quién te gustaría que abra la noche. Podés sumar hasta {MAX_OPENERS}.</small>
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
