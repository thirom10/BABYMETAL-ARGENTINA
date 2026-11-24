import { useState } from 'react';
import { friendlyError } from '../services/errors';
import { useAuth } from '../state/auth';
import { useStore } from '../state/store';
import { GoogleLogo } from './GoogleLogo';
import { Modal } from './Modal';

/** Explains why a Google account is needed to publish, then sends the visitor to Google. */
export function LoginModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuth();
  const { notify } = useStore();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signIn(); // navigates away to Google
    } catch (e) {
      notify(friendlyError(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title="INICIAR SESIÓN"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            AHORA NO
          </button>
          <button className="btn btn-primary btn-google" onClick={go} disabled={busy} aria-busy={busy}>
            <span className="btn-google-logo">
              <GoogleLogo />
            </span>
            {busy ? 'YENDO A GOOGLE…' : 'CONTINUAR CON GOOGLE'}
          </button>
        </>
      }
    >
      <h3 className="login-title">Para publicar tu setlist necesitás una cuenta</h3>
      <ul className="login-points">
        <li>
          <b>Tu email no se muestra.</b> Solo se publica el nickname (y la red social, si querés) que elijas.
        </li>
        <li>
          <b>Hasta 3 setlists por cuenta.</b> Así la comunidad se mantiene liviana y ordenada. Podés borrar uno tuyo para publicar otro.
        </li>
        <li>
          <b>No perdés nada.</b> Tu borrador queda guardado en este navegador mientras vas a Google y volvés.
        </li>
      </ul>
      <p className="login-note">Dar like y votar sigue sin necesitar cuenta.</p>
    </Modal>
  );
}
