import { OPENING_ACT, openingSongUrl } from '../data/openingAct';
import { Icon } from './Icon';
import './OpeningAct.css';

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
          <p className="lede">
            {act.tagline}. Escuchá sus temas más vistos antes del show; todos se abren en su canal oficial de YouTube.
          </p>
        </div>

        <ol className="oa-songs" aria-label={`Temas más vistos de ${act.name}`}>
          {act.songs.map((song, i) => (
            <li key={song.videoId}>
              <a className="oa-song" href={openingSongUrl(song.videoId)} target="_blank" rel="noopener noreferrer">
                <span className="oa-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="oa-info">
                  <strong>{song.title}</strong>
                  <small>{act.name} · Video oficial</small>
                </span>
                <span className="oa-play" aria-hidden="true">
                  <Icon name="play" size={20} />
                </span>
                <span className="sr-only"> (se abre en YouTube)</span>
              </a>
            </li>
          ))}
        </ol>

        <a className="btn btn-primary oa-channel" href={act.channelUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="play" size={16} /> VER SU CANAL DE YOUTUBE
          <span className="sr-only"> ({act.channelHandle}, se abre en YouTube)</span>
        </a>
      </div>
    </section>
  );
}
