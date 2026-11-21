import { artSrc, imgSrc, imgSrcSet } from '../data/images';
import { songTitle } from '../data/songs';
import { useRadio } from '../state/radio';
import { Icon } from './Icon';
import './RadioSection.css';

export function RadioSection() {
  const r = useRadio();
  const upNext = [1, 2, 3].map((k) => r.tracks[(r.index + k) % r.tracks.length]);

  return (
    <section id="radio" className="section rs" aria-labelledby="rs-title">
      <div className="rs-bg" aria-hidden="true">
        <img src={imgSrc('stage-amsterdam', 640)} srcSet={imgSrcSet('stage-amsterdam')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container rs-grid">
        <div className="section-head rs-head">
          <span className="eyebrow">Radio</span>
          <h2 id="rs-title" className="title">
            Kitsune <span className="rs-red">Radio</span>
          </h2>
          <p className="lede">La previa suena acá. Una radio visual que te acompaña mientras recorrés la página, armás tu setlist y esperás el show.</p>
          <span className="demo-tag">DEMO VISUAL · SIN AUDIO</span>
        </div>

        <div className="rs-card">
          <div className="rs-now">
            <div className={`rs-disc ${r.playing ? 'is-spinning' : ''}`}>
              <img src={artSrc(r.track.art)} alt="" width={400} height={400} loading="lazy" />
            </div>
            <div className="rs-info">
              <span className="rs-label">{r.playing ? '● AL AIRE' : 'EN PAUSA'}</span>
              <strong>{songTitle(r.track.songId)}</strong>
              <div className="rs-actions">
                <button className="btn btn-primary btn-sm" onClick={r.toggle}>
                  <Icon name={r.playing ? 'pause' : 'play'} size={16} />
                  {r.playing ? 'PAUSAR' : 'REPRODUCIR'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => r.setExpanded(true)}>
                  ABRIR RADIO
                </button>
              </div>
            </div>
          </div>
          <div className="rs-next">
            <span className="rs-label">A CONTINUACIÓN</span>
            <ol>
              {upNext.map((t) => (
                <li key={t.songId}>
                  <button onClick={() => r.select(r.tracks.indexOf(t))}>
                    <img src={artSrc(t.art)} alt="" width={36} height={36} loading="lazy" />
                    <span>{songTitle(t.songId)}</span>
                    <Icon name="play" size={14} />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
