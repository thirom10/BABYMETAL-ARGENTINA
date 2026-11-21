import { useState } from 'react';
import { imgSrc, imgSrcSet } from '../data/images';
import { songTitle } from '../data/songs';
import { WILDCARDS } from '../data/wildcards';
import { formatNumber } from '../lib/format';
import { MAX_SONGS, useStore } from '../state/store';
import { Icon } from './Icon';
import './Wildcards.css';

export function Wildcards() {
  const { state, dispatch, notify } = useStore();
  const [wished, setWished] = useState<Record<string, boolean>>({});

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
          <p className="lede">Las canciones sorpresa que la comunidad sueña escuchar. No están confirmadas: son deseos de fans.</p>
        </div>

        <ul className="wc-track" aria-label="Canciones sorpresa deseadas">
          {WILDCARDS.map((w, i) => {
            const on = !!wished[w.songId];
            const inSet = state.songIds.includes(w.songId);
            return (
              <li key={w.songId} className="wc-card" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="wc-glyph" aria-hidden="true">
                  ?
                </span>
                <span className="wc-num">WILDCARD 0{i + 1}</span>
                <h3 className="wc-name">{songTitle(w.songId)}</h3>
                <p className="wc-note">{w.note}</p>
                <span className="wc-wishes">
                  <Icon name="spark" size={13} /> {formatNumber(w.wishes + (on ? 1 : 0))} fans la piden
                </span>
                <div className="wc-actions">
                  <button className={`btn btn-sm ${on ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setWished((x) => ({ ...x, [w.songId]: !on }))} aria-pressed={on}>
                    {on ? 'LA PEDISTE' : 'YO TAMBIÉN'}
                  </button>
                  <button className="icon-btn wc-add" onClick={() => add(w.songId)} aria-label={`Agregar ${songTitle(w.songId)} a mi setlist`} disabled={inSet}>
                    <Icon name={inSet ? 'check' : 'plus'} size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
