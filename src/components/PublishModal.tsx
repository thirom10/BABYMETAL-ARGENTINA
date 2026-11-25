import { useState } from 'react';
import { scrollToId } from '../lib/format';
import { HANDLE_RE } from '../config/social';
import { friendlyError } from '../services/errors';
import { useStore } from '../state/store';
import { Modal } from './Modal';
import { SetlistPoster } from './SetlistPoster';

export function PublishModal({ onClose }: { onClose: () => void }) {
  const { state, publish, notify, mode } = useStore();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const created = await publish();
      onClose();
      notify(`¡“${created.name}” ya está en la comunidad!`, 'success');
      window.setTimeout(() => scrollToId('comunidad'), 250);
    } catch (e) {
      notify(friendlyError(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title="VISTA PREVIA"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            SEGUIR EDITANDO
          </button>
          <button className="btn btn-primary" onClick={confirm} disabled={busy} aria-busy={busy}>
            {busy ? 'PUBLICANDO…' : 'CONFIRMAR Y PUBLICAR'}
          </button>
        </>
      }
    >
      <SetlistPoster
        name={state.setlistName.trim()}
        author={state.nickname.trim()}
        songIds={state.songIds}
        socialNetwork={state.socialNetwork && HANDLE_RE.test(state.socialHandle) ? state.socialNetwork : null}
        socialHandle={state.socialHandle}
      />
      <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--c-steel)' }}>
        {mode === 'supabase'
          ? 'Al publicar, tu setlist, tu nickname y la red social que elegiste son visibles para todos. Tu email no se muestra.'
          : 'Publicación de demostración: el setlist se agrega a la comunidad sólo en esta sesión del navegador.'}
      </p>
    </Modal>
  );
}
