import { useMemo, useState } from 'react';
import { CLOSER_ID, OPENER_ID } from '../config/event';
import { imgSrc, imgSrcSet } from '../data/images';
import { songTitle } from '../data/songs';
import { TOUR_SHOWS, TOUR_SOURCE } from '../data/tourShows';
import { formatNumber } from '../lib/format';
import { buildRanking } from '../lib/ranking';
import { useStore } from '../state/store';
import './PeoplesSetlist.css';

type View = 'average' | 'ranking';
type Source = 'community' | 'tour';

/** Below this many community setlists the tour data is shown by default (the visitor can switch). */
const MIN_COMMUNITY = 3;
/** Same length as a real arena set (14 songs). */
const AVERAGE_SIZE = 14;

/** REAL data: songs BABYMETAL played in the most recent headline shows (setlist.fm). */
const TOUR_RANKING = buildRanking(TOUR_SHOWS.map((s) => s.songIds));

/** "29/09" and "29/09/2026" from an ISO date (no timezone shifts). */
const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const longDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/**
 * "El setlist de la gente": what is expected to be heard in Buenos Aires, built
 * only from real data — setlists published by fans on this site, and the setlists
 * BABYMETAL actually played on the 2026 tour (setlist.fm).
 */
export function PeoplesSetlist() {
  const { state } = useStore();
  const [view, setView] = useState<View>('average');
  const [picked, setPicked] = useState<Source | null>(null);
  const [expanded, setExpanded] = useState(false);

  const communityTotal = state.ranking.total;
  const source: Source = picked ?? (communityTotal >= MIN_COMMUNITY ? 'community' : 'tour');
  const ranking = source === 'tour' ? TOUR_RANKING : state.ranking;
  const total = ranking.total;

  const { rows, average } = useMemo(() => {
    const rows = ranking.rows.map((r) => ({
      id: r.id,
      picks: r.picks,
      pct: total > 0 ? Math.min(100, (r.picks / total) * 100) : 0,
      pos: r.avgPos,
    }));
    // "Average setlist": the most picked songs, ordered by the position they usually take.
    const average = rows.slice(0, AVERAGE_SIZE).sort((a, b) => a.pos - b.pos || b.picks - a.picks);
    return { rows, average };
  }, [ranking, total]);

  const list = view === 'average' ? average : rows.slice(0, expanded ? 20 : 10);
  const unit = source === 'tour' ? 'shows' : 'setlists';
  const dates = TOUR_SHOWS.map((s) => s.date).sort();

  return (
    <section id="setlist" className="section ps" aria-labelledby="ps-title">
      <div className="ps-bg" aria-hidden="true">
        <img src={imgSrc('stage-red', 1280)} srcSet={imgSrcSet('stage-red')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="ps-top">
          <div className="section-head">
            <span className="eyebrow">Setlist</span>
            <h2 id="ps-title" className="title">
              El setlist <br className="ps-br" />
              de la gente
            </h2>
            <p className="lede">Lo que se espera escuchar en Buenos Aires, con datos reales: los setlists de los fans de este sitio y lo que BABYMETAL tocó en la gira 2026.</p>
          </div>

          <div className="ps-stats">
            <div className="ps-stat">
              <strong>{formatNumber(total)}</strong>
              <span>{source === 'tour' ? 'shows analizados' : 'setlists de fans'}</span>
            </div>
            <div className="ps-stat">
              <strong>{rows.length}</strong>
              <span>canciones distintas</span>
            </div>
          </div>
        </div>

        <div className="chip-row ps-sources" role="group" aria-label="Fuente de los datos">
          <button className="chip" aria-pressed={source === 'community'} onClick={() => setPicked('community')}>
            COMUNIDAD · {formatNumber(communityTotal)} {communityTotal === 1 ? 'SETLIST' : 'SETLISTS'}
          </button>
          <button className="chip" aria-pressed={source === 'tour'} onClick={() => setPicked('tour')}>
            GIRA 2026 · {TOUR_SHOWS.length} SHOWS REALES
          </button>
        </div>

        <p className="ps-source-note">
          {source === 'tour' ? (
            <>
              Datos reales de{' '}
              <a href={TOUR_SOURCE.url} target="_blank" rel="noopener noreferrer">
                {TOUR_SOURCE.name}
              </a>
              : los últimos {TOUR_SHOWS.length} shows propios de la gira (del {longDate(dates[0])} al {longDate(dates[dates.length - 1])}), sin festivales. Actualizado el{' '}
              {longDate(TOUR_SOURCE.retrievedAt)}. Es un indicio de lo que puede sonar, no el setlist confirmado de Buenos Aires.
            </>
          ) : communityTotal < MIN_COMMUNITY ? (
            <>Armado con los setlists que publican los fans en este sitio. Todavía hay pocos: sumá el tuyo.</>
          ) : (
            <>Armado con los setlists que publicaron los fans en este sitio.</>
          )}
        </p>

        <div className="ps-tabs" role="tablist" aria-label="Vista del setlist">
          <button role="tab" aria-selected={view === 'average'} onClick={() => setView('average')}>
            SETLIST PROMEDIO
          </button>
          <button role="tab" aria-selected={view === 'ranking'} onClick={() => setView('ranking')}>
            RANKING
          </button>
        </div>

        {view === 'average' && rows.length > 0 && (
          <p className="ps-note">Las {Math.min(AVERAGE_SIZE, rows.length)} canciones más elegidas, ordenadas según la posición en la que suelen sonar.</p>
        )}

        {rows.length === 0 && (
          <p className="ps-note" role="status">
            {state.status === 'loading' ? 'Cargando…' : 'Todavía no hay setlists publicados. ¡Publicá el primero!'}
          </p>
        )}

        <ol className={`ps-list ${view === 'average' ? 'is-average' : ''}`} style={{ '--rows': Math.ceil(list.length / 2) } as React.CSSProperties}>
          {list.map((r, i) => {
            const special = r.id === OPENER_ID ? 'open' : r.id === CLOSER_ID ? 'close' : null;
            return (
              <li key={r.id} className={`ps-row ${special ? `is-${special}` : ''}`} style={{ animationDelay: `${i * 30}ms` }}>
                <span className="ps-rank">{String(i + 1).padStart(2, '0')}</span>
                <div className="ps-body">
                  <div className="ps-line">
                    <span className="ps-name">{songTitle(r.id)}</span>
                    {special && <span className="ps-badge">{special === 'open' ? 'APERTURA' : 'CIERRE'}</span>}
                    <span className="ps-pct">{r.pct.toFixed(0)}%</span>
                  </div>
                  <div className="ps-barline">
                    <div className="ps-bar" aria-hidden="true">
                      <span style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="ps-votes">
                      {r.picks} de {total} {unit}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {view === 'ranking' && rows.length > 10 && (
          <button className="btn btn-ghost btn-sm ps-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'VER TOP 10' : `VER TOP ${Math.min(20, rows.length)}`}
          </button>
        )}

        {source === 'tour' && (
          <details className="ps-shows">
            <summary>
              Ver los {TOUR_SHOWS.length} shows usados ({shortDate(dates[0])} al {shortDate(dates[dates.length - 1])})
            </summary>
            <ul>
              {TOUR_SHOWS.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {longDate(s.date)} · {s.city} · {s.venue}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
