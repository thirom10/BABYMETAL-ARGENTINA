import { useMemo, useState } from 'react';
import { CLOSER_ID, OPENER_ID } from '../config/event';
import { imgSrc, imgSrcSet } from '../data/images';
import { PEOPLES_BASE_TOTAL, PEOPLES_BASE_VOTES } from '../data/peoples';
import { songTitle } from '../data/songs';
import { formatNumber } from '../lib/format';
import { useStore } from '../state/store';
import './PeoplesSetlist.css';

type View = 'ranking' | 'average';

export function PeoplesSetlist() {
  const { state } = useStore();
  const [view, setView] = useState<View>('ranking');
  const [expanded, setExpanded] = useState(false);

  const { rows, total, average } = useMemo(() => {
    const votes: Record<string, number> = { ...PEOPLES_BASE_VOTES };
    const posSum: Record<string, { sum: number; n: number }> = {};
    for (const s of state.community) {
      s.songIds.forEach((id, i) => {
        votes[id] = (votes[id] ?? 0) + 1;
        const p = (posSum[id] ??= { sum: 0, n: 0 });
        p.sum += s.songIds.length > 1 ? i / (s.songIds.length - 1) : 0;
        p.n += 1;
      });
    }
    const total = PEOPLES_BASE_TOTAL + state.community.length;
    const rows = Object.entries(votes)
      .map(([id, v]) => ({ id, votes: v, pct: Math.min(100, (v / total) * 100) }))
      .sort((a, b) => b.votes - a.votes);
    const average = rows
      .slice(0, 14)
      .map((r) => ({ ...r, pos: posSum[r.id] ? posSum[r.id].sum / posSum[r.id].n : 0.5 }))
      .sort((a, b) => a.pos - b.pos);
    return { rows, total, average };
  }, [state.community]);

  const list = view === 'ranking' ? rows.slice(0, expanded ? 20 : 10) : average;
  const max = rows[0]?.votes ?? 1;

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
              The People&apos;s <br className="ps-br" />
              Setlist
            </h2>
            <p className="lede">El concierto que la comunidad espera escuchar: las canciones más elegidas en los setlists de los fans.</p>
          </div>

          <div className="ps-stats">
            <div className="ps-stat">
              <strong>{formatNumber(total)}</strong>
              <span>setlists considerados</span>
            </div>
            <div className="ps-stat">
              <strong>{rows.length}</strong>
              <span>canciones votadas</span>
            </div>
            <span className="demo-tag">DATOS DE DEMOSTRACIÓN</span>
          </div>
        </div>

        <div className="ps-tabs" role="tablist" aria-label="Vista del setlist">
          <button role="tab" aria-selected={view === 'ranking'} onClick={() => setView('ranking')}>
            RANKING
          </button>
          <button role="tab" aria-selected={view === 'average'} onClick={() => setView('average')}>
            SETLIST PROMEDIO
          </button>
        </div>

        {view === 'average' && (
          <p className="ps-note">Las 14 canciones más votadas, ordenadas según la posición promedio que les dan los fans.</p>
        )}

        <ol
          className={`ps-list ${view === 'average' ? 'is-average' : ''}`}
          style={{ '--rows': Math.ceil(list.length / 2) } as React.CSSProperties}
        >
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
                      <span style={{ width: `${(r.votes / max) * 100}%` }} />
                    </div>
                    <span className="ps-votes">{formatNumber(r.votes)} votos</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {view === 'ranking' && (
          <button className="btn btn-ghost btn-sm ps-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'VER TOP 10' : 'VER TOP 20'}
          </button>
        )}
      </div>
    </section>
  );
}
