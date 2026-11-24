import { useEffect, useRef } from 'react';
import type { ShareCard } from '../hooks/useShareCard';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import './SharePanel.css';

/**
 * Share options for browsers without the native share sheet (most desktops):
 * preview of the image, download, copy link and WhatsApp.
 */
export function SharePanel({ card }: { card: ShareCard }) {
  const { notify } = useStore();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const copy = async () => notify((await card.copyLink()) ? 'Link copiado.' : 'No pudimos copiar el link.', 'success');

  return (
    <section ref={ref} className="share-panel" aria-label="Compartir setlist">
      <h4 className="share-title">COMPARTIR</h4>
      {card.previewUrl && <img className="share-preview" src={card.previewUrl} alt="Vista previa de la imagen para compartir" width={1080} height={1350} />}
      <p className="share-hint">Descargá la imagen y mandala por la app que quieras. El link para que cada uno arme su setlist va incluido en la imagen.</p>
      <div className="share-actions">
        {card.previewUrl && (
          <button className="btn btn-primary btn-sm" onClick={card.download}>
            <Icon name="download" size={16} /> DESCARGAR IMAGEN
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={copy}>
          <Icon name="link" size={16} /> COPIAR LINK
        </button>
        <a className="btn btn-ghost btn-sm" href={card.whatsappUrl} target="_blank" rel="noopener noreferrer">
          WHATSAPP
        </a>
      </div>
    </section>
  );
}
