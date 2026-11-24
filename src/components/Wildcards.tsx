import { useMemo } from 'react';
import { imgSrc, imgSrcSet } from '../data/images';
import { songTitle } from '../data/songs';
import { TOUR_SHOWS } from '../data/tourShows';
import { WILDCARDS } from '../data/wildcards';
import { buildRanking } from '../lib/ranking';
import { MAX_SONGS, useStore } from '../state/store';
import { Icon } from './Icon';
import './Wildcards.css';

const TOUR_RANKING = buildRanking(TOUR_SHOWS.map((s) => s.songIds));

export function Wildcards() {
  const { state, dispatch, notify } = useStore();

  // Real numbers only: how many community setlists include each song, and how many real tour shows played it.
  const communityPicks = useMemo(() => new Map(state.ranking.rows.map((r) => [r.id, r.picks])), [state.ranking]);
  const tourPicks = useMemo(() => new Map(TOUR_RANKING.rows.map((r) => [r.id, r.picks])), []);

  const add = (id: string) => {
    if (state.songIds.includes(id)) {
      notify(`${songTitle(id)} ya está en tu setlist.`);
      return;
    }
    if (state.songIds.length >= MAX_SONGS) {
      notify(`Máximo ${MAX_SONGS} canciones por setlist.`);
      return;
    }
    dispatch({ type: 'add', id });
    notify(`${songTitle(id)} se sumó a tu setlist.`, 'success');
  };

  return (
    <section id="wildcards" className="section wc" aria-labelledby="wc-title">
      <div className="wc-bg" aria-hidden="true">
        <img src={imgSrc('crowd-red', 1280)} srcSet={imgSrcSet('crowd-red')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Wildcard tracks</span>
          <h2 id="wc-title" className="title">
            ¿Y si <span className="wc-red">suenan</span>…?
          </h2>
          <p className="lede">
            Canciones sorpresa que los fans sueñan escuchar. No están confirmadas para Buenos Aires: miramos si sonaron en los últimos {TOUR_SHOWS.length} shows de la gira y en cuántos setlists de la
            comunidad aparecen.
          </p>
        </div>

        <ul className="wc-track" aria-label="Canciones sorpresa">
          {WILDCARDS.map((id, i) => {
            const inSet = state.songIds.includes(id);
            const played = tourPicks.get(id) ?? 0;
            const picks = communityPicks.get(id) ?? 0;
            return (
              <li key={id} className="wc-card" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="wc-glyph" aria-hidden="true">
                  ?
                </span>
                <span className="wc-num">WILDCARD 0{i + 1}</span>
                <h3 className="wc-name">{songTitle(id)}</h3>
                <dl className="wc-facts">
                  <div>
                    <dt>GIRA 2026</dt>
                    <dd>{played === 0 ? `No sonó en los últimos ${TOUR_SHOWS.length} shows` : `Sonó en ${played} de ${TOUR_SHOWS.length} shows`}</dd>
                  </div>
                  <div>
                    <dt>COMUNIDAD</dt>
                    <dd>{picks === 0 ? 'Todavía en ningún setlist' : `En ${picks} ${picks === 1 ? 'setlist' : 'setlists'}`}</dd>
                  </div>
                </dl>
                <button className={`btn btn-sm ${inSet ? 'btn-ghost' : 'btn-primary'} wc-add-btn`} onClick={() => add(id)} disabled={inSet}>
                  <Icon name={inSet ? 'check' : 'plus'} size={16} />
                  {inSet ? 'EN TU SETLIST' : 'AGREGAR A MI SETLIST'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
