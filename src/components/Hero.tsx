import { EVENT } from '../config/event';
import { imgSrc, imgSrcSet } from '../data/images';
import { useCountdown } from '../hooks/useCountdown';
import { pad2, scrollToId } from '../lib/format';
import { Embers } from './Embers';
import './Hero.css';

export function Hero() {
  const c = useCountdown(EVENT.startsAt);
  const units = [
    { label: 'DÍAS', value: c.days },
    { label: 'HORAS', value: c.hours },
    { label: 'MIN', value: c.minutes },
    { label: 'SEG', value: c.seconds },
  ];

  return (
    <section id="countdown" className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <img
          src={imgSrc('trio-red', 1280)}
          srcSet={imgSrcSet('trio-red')}
          sizes="100vw"
          alt="BABYMETAL en vivo: las tres integrantes de frente sobre el escenario"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" />
        <div className="diag-lines" />
        <Embers />
      </div>

      <div className="hero-content container">
        <p className="hero-kicker">
          <span className="hero-pulse" aria-hidden="true" /> THE FOX GOD IS COMING
        </p>

        <h1 id="hero-title" className="hero-title">
          <span className="hero-artist">{EVENT.artist}</span>
          <span className="hero-city">{EVENT.city}</span>
        </h1>

        <div className="hero-meta">
          <span>{EVENT.dateLabel}</span>
          <i aria-hidden="true" />
          <span>{EVENT.venue}</span>
          <i aria-hidden="true" />
          <span>21:00 HS</span>
        </div>

        <div className="cd" role="timer" aria-label="Cuenta regresiva al concierto">
          {c.done ? (
            <p className="cd-done">IT&apos;S SHOWTIME — ¡NOS VEMOS EN EL PIT!</p>
          ) : (
            units.map((u, i) => (
              <div className="cd-unit" key={u.label}>
                <span className="cd-value" key={i === 3 ? u.value : undefined}>
                  {pad2(u.value)}
                </span>
                <span className="cd-label">{u.label}</span>
              </div>
            ))
          )}
        </div>

        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => scrollToId('crear')}>
            CREAR MI SETLIST
          </button>
          <button className="btn btn-ghost" onClick={() => scrollToId('comunidad')}>
            EXPLORAR LA COMUNIDAD
          </button>
        </div>
      </div>
    </section>
  );
}
