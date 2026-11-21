import { useStore } from '../state/store';
import { Icon } from './Icon';
import './Toasts.css';

export function Toasts() {
  const { state, dispatch } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {state.toasts.map((t) => (
        <div key={t.id} className={`toast is-${t.tone}`}>
          <Icon name={t.tone === 'success' ? 'check' : 'spark'} size={16} />
          <span>{t.message}</span>
          <button className="icon-btn" onClick={() => dispatch({ type: 'dismissToast', id: t.id })} aria-label="Cerrar aviso">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
