import { OPENING_ACT, openingSongUrl } from '../data/openingAct';
import { Icon } from './Icon';
import './OpeningAct.css';

const embedUrl = (videoId: string) => `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

export function OpeningAct() {
  const act = OPENING_ACT;
  return (
    <section id="telonera" className="section oa" aria-labelledby="oa-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Telonera</span>
          <h2 id="oa-title" className="title">
            Abre la noche: <span className="oa-name">{act.name}</span>
          </h2>
          <p className="lede">{act.tagline}. Mirá sus temas más vistos antes del show.</p>
        </div>

        {act.photo && (
          <figure className="oa-photo">
            <img src={act.photo.src} alt={`${act.name}`} loading="lazy" decoding="async" />
            <figcaption>{act.photo.credit}</figcaption>
          </figure>
        )}

        <ul className="oa-songs" aria-label={`Temas más vistos de ${act.name}`}>
          {act.songs.map((song, i) => (
            <li key={song.videoId} className="oa-card">
              <div className="oa-frame">
                <iframe
                  src={embedUrl(song.videoId)}
                  title={`${song.title} — ${act.name} (video oficial)`}
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="oa-meta">
                <span className="oa-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="oa-info">
                  <strong>{song.title}</strong>
                  <small>{act.name} · Video oficial</small>
                </span>
                <a className="oa-yt" href={openingSongUrl(song.videoId)} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${song.title} en YouTube`}>
                  <Icon name="link" size={18} />
                </a>
              </div>
            </li>
          ))}
        </ul>

        <a className="btn btn-primary oa-channel" href={act.channelUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="play" size={16} /> VER SU CANAL DE YOUTUBE
          <span className="sr-only"> ({act.channelHandle}, se abre en YouTube)</span>
        </a>
      </div>
    </section>
  );
}
