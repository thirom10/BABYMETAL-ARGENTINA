import { EVENT, SECTIONS } from '../config/event';
import { PHOTO_CREDITS } from '../data/credits';
import { imgSrc, imgSrcSet } from '../data/images';
import { scrollToId } from '../lib/format';
import './Footer.css';

export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-bg" aria-hidden="true">
        <img src={imgSrc('festival-crowd', 1280)} srcSet={imgSrcSet('festival-crowd')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container ft-inner">
        <div className="ft-brand">
          <span className="ft-name">
            BABYMETAL <b>ARGENTINA</b>
          </span>
          <span className="ft-badge">FAN PROJECT</span>
          <span className="ft-date">
            {EVENT.dateLabel} · {EVENT.venue} · {EVENT.city}
          </span>
        </div>

        <nav className="ft-nav" aria-label="Navegación del pie">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(s.id);
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <p className="ft-disclaimer">
          Proyecto independiente creado por fans. <strong>No es un sitio oficial</strong> y no tiene afiliación con BABYMETAL, Amuse Inc., Movistar Arena ni
          ninguna productora. Los setlists son propuestas de fans (los marcados como EJEMPLO son de demostración) y no anticipan el repertorio real del concierto. La radio reproduce videos oficiales mediante el reproductor de YouTube (modo de privacidad mejorada), que se carga sólo cuando das play.
        </p>

        <details className="ft-credits">
          <summary>Créditos de fotografías (Wikimedia Commons)</summary>
          <ul>
            {PHOTO_CREDITS.map((c) => (
              <li key={c.slug}>
                <a href={c.source} target="_blank" rel="noopener noreferrer">
                  {c.title}
                </a>{' '}
                — {c.author} ·{' '}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer license">
                    {c.license}
                  </a>
                ) : (
                  c.license
                )}
              </li>
            ))}
          </ul>
          <p>Imágenes redimensionadas y editadas para este sitio.</p>
        </details>
      </div>
    </footer>
  );
}
