import { useEffect, useMemo, useState } from 'react';
import { CLOSER_ID, OPENER_ID } from '../config/event';
import { imgSrc, imgSrcSet } from '../data/images';
import { songTitle } from '../data/songs';
import { formatDate, formatNumber, scrollToId } from '../lib/format';
import { useStore } from '../state/store';
import type { CommunitySetlist, CommunitySort } from '../types';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { SetlistPoster } from './SetlistPoster';
import './Community.css';

const SORTS: Array<{ id: CommunitySort; label: string }> = [
  { id: 'popular', label: 'MÁS POPULARES' },
  { id: 'recent', label: 'MÁS RECIENTES' },
  { id: 'votes', label: 'MÁS VOTADOS' },
];

const PAGE_MOBILE = 4;
const PAGE_DESKTOP = 6;

function SetlistCard({ s, highlight, onView, onCopy }: { s: CommunitySetlist; highlight: boolean; onView: () => void; onCopy: () => void }) {
  const { dispatch } = useStore();
  const preview = s.songIds.slice(0, 4);
  const rest = s.songIds.length - preview.length;
  const classicOpen = s.songIds[0] === OPENER_ID;
  const classicClose = s.songIds[s.songIds.length - 1] === CLOSER_ID;

  return (
    <article className={`cc ${highlight ? 'is-new' : ''}`}>
      <header className="cc-head">
        <div className="cc-titles">
          <h3 className="cc-name">{s.name}</h3>
          <span className="cc-author">
            <b>@{s.author}</b> · {formatDate(s.createdAt)}
          </span>
        </div>
        <span className="cc-count">
          <strong>{s.songIds.length}</strong>
          <small>TEMAS</small>
        </span>
      </header>

      <ol className="cc-preview">
        {preview.map((id, i) => (
          <li key={id} className={(i === 0 && id === OPENER_ID) ? 'is-special' : ''}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {songTitle(id)}
          </li>
        ))}
        {rest > 0 && <li className="cc-more">+ {rest} canciones más{classicClose ? ' · cierra con ROAD OF RESISTANCE' : ''}</li>}
      </ol>

      <div className="cc-tags">
        {s.isOwn && <span className="cc-tag is-own">TU SETLIST</span>}
        {classicOpen && classicClose && <span className="cc-tag">ESTRUCTURA CLÁSICA</span>}
        {!classicOpen && <span className="cc-tag is-alt">APERTURA ALTERNATIVA</span>}
      </div>

      <footer className="cc-actions">
        <button className={`cc-stat ${s.liked ? 'is-on' : ''}`} onClick={() => dispatch({ type: 'like', id: s.id })} aria-pressed={!!s.liked} aria-label={`Me gusta (${s.likes})`}>
          <Icon name="heart" size={17} />
          <span>{formatNumber(s.likes)}</span>
        </button>
        <button className={`cc-stat ${s.voted ? 'is-on' : ''}`} onClick={() => dispatch({ type: 'vote', id: s.id })} aria-pressed={!!s.voted} aria-label={`Votar (${s.votes})`}>
          <Icon name="vote" size={17} />
          <span>{formatNumber(s.votes)}</span>
        </button>
        <span className="cc-spacer" />
        <button className="cc-btn" onClick={onCopy} aria-label={`Usar ${s.name} como base`}>
          <Icon name="copy" size={16} />
          <span>USAR DE BASE</span>
        </button>
        <button className="cc-btn is-primary" onClick={onView}>
          <Icon name="eye" size={16} />
          <span>VER</span>
        </button>
      </footer>
    </article>
  );
}

export function Community() {
  const { state, dispatch, notify } = useStore();
  const [sort, setSort] = useState<CommunitySort>('popular');
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const page = desktop ? PAGE_DESKTOP : PAGE_MOBILE;
  const [extra, setExtra] = useState(0);
  const limit = page + extra;
  const [viewing, setViewing] = useState<CommunitySetlist | null>(null);

  // After publishing, show newest first so the visitor sees their setlist.
  useEffect(() => {
    if (state.lastPublishedId) setSort('recent');
  }, [state.lastPublishedId]);

  const sorted = useMemo(() => {
    const list = [...state.community];
    if (sort === 'recent') list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === 'votes') list.sort((a, b) => b.votes - a.votes);
    if (sort === 'popular') list.sort((a, b) => b.likes + b.copies * 3 - (a.likes + a.copies * 3));
    return list;
  }, [state.community, sort]);

  const copy = (s: CommunitySetlist) => {
    dispatch({ type: 'loadBase', setlist: s });
    setViewing(null);
    notify(`Copiaste “${s.name}”. ¡Ahora hacelo tuyo!`, 'success');
    window.setTimeout(() => scrollToId('crear'), 150);
  };

  return (
    <section id="comunidad" className="section cm" aria-labelledby="cm-title">
      <div className="cm-bg" aria-hidden="true">
        <img src={imgSrc('fans', 1280)} srcSet={imgSrcSet('fans')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Comunidad</span>
          <h2 id="cm-title" className="title">
            Los setlists <span className="cm-red">de los fans</span>
          </h2>
          <p className="lede">Cada fan imagina su concierto perfecto. Votá los que más te gustan o usalos como base para armar el tuyo.</p>
          <span className="demo-tag">SETLISTS DE DEMOSTRACIÓN</span>
        </div>

        <div className="chip-row cm-sorts" role="group" aria-label="Ordenar setlists">
          {SORTS.map((s) => (
            <button key={s.id} className="chip" aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>
              {s.label}
            </button>
          ))}
          <span className="cm-total">{state.community.length} setlists</span>
        </div>

        <div className="cm-grid">
          {sorted.slice(0, limit).map((s) => (
            <SetlistCard key={s.id} s={s} highlight={s.id === state.lastPublishedId} onView={() => setViewing(s)} onCopy={() => copy(s)} />
          ))}
        </div>

        {sorted.length > limit && (
          <button className="btn btn-ghost btn-sm cm-more" onClick={() => setExtra((x) => x + page)}>
            VER MÁS SETLISTS
          </button>
        )}
      </div>

      {viewing && (
        <Modal
          title="SETLIST COMPLETO"
          onClose={() => setViewing(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setViewing(null)}>
                CERRAR
              </button>
              <button className="btn btn-primary" onClick={() => copy(viewing)}>
                USAR COMO BASE
              </button>
            </>
          }
        >
          <SetlistPoster
            name={viewing.name}
            author={`@${viewing.author}`}
            songIds={viewing.songIds}
            meta={`${formatDate(viewing.createdAt)} · ♥ ${formatNumber(state.community.find((c) => c.id === viewing.id)?.likes ?? viewing.likes)}`}
          />
        </Modal>
      )}
    </section>
  );
}
