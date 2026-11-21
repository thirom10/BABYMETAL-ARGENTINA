import { useStore } from '../state/store';
import { scrollToId } from '../lib/format';
import { Modal } from './Modal';
import { SetlistPoster } from './SetlistPoster';

export function PublishModal({ onClose }: { onClose: () => void }) {
  const { state, publish, notify } = useStore();

  const confirm = () => {
    const created = publish();
    onClose();
    notify(`¡“${created.name}” ya está en la comunidad!`, 'success');
    window.setTimeout(() => scrollToId('comunidad'), 250);
  };

  return (
    <Modal
      title="VISTA PREVIA"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            SEGUIR EDITANDO
          </button>
          <button className="btn btn-primary" onClick={confirm}>
            CONFIRMAR Y PUBLICAR
          </button>
        </>
      }
    >
      <SetlistPoster name={state.setlistName.trim()} author={state.nickname.trim()} songIds={state.songIds} />
      <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--c-steel)' }}>
        Publicación de demostración: el setlist se agrega a la comunidad sólo en esta sesión del navegador.
      </p>
    </Modal>
  );
}
