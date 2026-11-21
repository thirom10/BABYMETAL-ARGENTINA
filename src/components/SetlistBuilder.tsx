import { useEffect, useMemo, useRef, useState } from 'react';
import { CLOSER_ID, OPENER_ID } from '../config/event';
import { imgSrc, imgSrcSet } from '../data/images';
import { CATEGORY_FILTERS, SONGS, SONG_BY_ID, songTitle } from '../data/songs';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { cleanText } from '../lib/format';
import { MAX_SONGS, useStore } from '../state/store';
import type { CategoryFilter } from '../types';
import { Icon } from './Icon';
import { PublishModal } from './PublishModal';
import './SetlistBuilder.css';

const MIN_SONGS = 5;
const MOBILE_PREVIEW = 12;

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/gi, '')
    .toLowerCase();
}

/* ------------------------------------------------------------------ */

function SongLibrary() {
  const { state, dispatch, notify } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [showAll, setShowAll] = useState(false);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const selected = useMemo(() => new Set(state.songIds), [state.songIds]);

  const songs = useMemo(() => {
    const q = normalize(query.trim());
    return SONGS.filter((s) => (filter === 'ALL' || s.category === filter) && (!q || normalize(s.title).includes(q)));
  }, [query, filter]);

  // On phones, keep the library short until the visitor asks for everything.
  const capped = !desktop && !showAll && !query && songs.length > MOBILE_PREVIEW + 2;

  const toggle = (id: string) => {
    if (selected.has(id)) {
      dispatch({ type: 'remove', id });
    } else if (state.songIds.length >= MAX_SONGS) {
      notify(`Máximo ${MAX_SONGS} canciones por setlist.`);
    } else {
      dispatch({ type: 'add', id });
    }
  };

  return (
    <div className="sb-lib">
      <label className="sb-search">
        <Icon name="search" size={18} />
        <span className="sr-only">Buscar canciones</span>
        <input type="search" placeholder="Buscar canción…" value={query} onChange={(e) => setQuery(cleanText(e.target.value, 40))} enterKeyHint="search" />
        {query && (
          <button className="icon-btn" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            <Icon name="close" size={16} />
          </button>
        )}
      </label>

      <div className="chip-row sb-chips" role="group" aria-label="Filtrar por categoría">
        {CATEGORY_FILTERS.map((c) => (
          <button key={c} className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <ul className="sb-songs" aria-label="Canciones disponibles">
        {songs.length === 0 && <li className="sb-empty">No encontramos canciones con “{query}”.</li>}
        {(capped ? songs.slice(0, MOBILE_PREVIEW) : songs).map((s) => {
          const on = selected.has(s.id);
          const special = s.id === OPENER_ID ? 'APERTURA HABITUAL' : s.id === CLOSER_ID ? 'CIERRE HABITUAL' : null;
          return (
            <li key={s.id}>
              <button className={`sb-song ${on ? 'is-on' : ''} ${special ? 'is-special' : ''}`} onClick={() => toggle(s.id)} aria-pressed={on}>
                <span className="sb-song-text">
                  <span className="sb-song-title">{s.title}</span>
                  <span className="sb-song-meta">
                    {special ? <em>{special}</em> : s.category}
                    {on && <> · #{state.songIds.indexOf(s.id) + 1} en tu setlist</>}
                  </span>
                </span>
                <span className="sb-add" aria-hidden="true">
                  <Icon name={on ? 'check' : 'plus'} size={18} />
                </span>
                <span className="sr-only">{on ? 'Quitar del setlist' : 'Agregar al setlist'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {capped && (
        <button className="btn btn-ghost btn-sm sb-showall" onClick={() => setShowAll(true)}>
          VER LAS {songs.length} CANCIONES
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SetlistEditor({ onPublish }: { onPublish: () => void }) {
  const { state, dispatch } = useStore();
  const ids = state.songIds;
  const [moved, setMoved] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ids.length) return;
    dispatch({ type: 'move', from, to });
    setMoved(ids[from]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMoved(null), 600);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const opener = ids[0];
  const closer = ids[ids.length - 1];
  const altOpen = ids.length > 0 && opener !== OPENER_ID;
  const altClose = ids.length > 1 && closer !== CLOSER_ID;

  return (
    <div className="sb-set">
      <div className="sb-set-head">
        <div className="sb-count">
          <strong>{ids.length}</strong>
          <span>
            {ids.length === 1 ? 'canción' : 'canciones'}
            <br />
            de {MAX_SONGS} máx.
          </span>
        </div>
        <div className="sb-set-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'reset' })} title="Volver a la propuesta inicial">
            <Icon name="reset" size={16} /> PROPUESTA
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'clear' })} disabled={ids.length === 0}>
            <Icon name="trash" size={16} /> VACIAR
          </button>
        </div>
      </div>

      {(altOpen || altClose) && (
        <div className="sb-notice" role="note">
          <Icon name="spark" size={14} />
          <span>
            {altOpen && 'Apertura alternativa: BABYMETAL suele abrir con BABYMETAL DEATH. '}
            {altClose && 'Cierre alternativo: el cierre habitual es ROAD OF RESISTANCE.'}
          </span>
        </div>
      )}

      {ids.length === 0 ? (
        <div className="sb-empty-set">
          <p>Tu setlist está vacío.</p>
          <span>Agregá canciones desde la biblioteca o recuperá la propuesta inicial.</span>
        </div>
      ) : (
        <ol className="sb-order" aria-label="Mi setlist">
          {ids.map((id, i) => {
            const isOpenSong = id === OPENER_ID;
            const isCloseSong = id === CLOSER_ID;
            const badge = isOpenSong
              ? i === 0
                ? { t: 'APERTURA', on: true }
                : { t: 'APERTURA HABITUAL', on: false }
              : isCloseSong
                ? i === ids.length - 1
                  ? { t: 'CIERRE', on: true }
                  : { t: 'CIERRE HABITUAL', on: false }
                : null;
            return (
              <li
                key={id}
                className={[
                  'sb-item',
                  isOpenSong || isCloseSong ? 'is-special' : '',
                  moved === id ? 'is-moved' : '',
                  dragIndex === i ? 'is-dragging' : '',
                  overIndex === i && dragIndex !== null && dragIndex !== i ? 'is-over' : '',
                ].join(' ')}
                draggable
                onDragStart={(e) => {
                  setDragIndex(i);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) move(dragIndex, i);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
              >
                <span className="sb-grip" aria-hidden="true">
                  <Icon name="grip" size={16} />
                </span>
                <span className="sb-pos">{String(i + 1).padStart(2, '0')}</span>
                <span className="sb-item-text">
                  <span className="sb-item-title">{songTitle(id)}</span>
                  {badge && <span className={`sb-badge ${badge.on ? 'is-on' : ''}`}>{badge.t}</span>}
                </span>
                <span className="sb-item-ctrl">
                  <button className="icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Subir ${songTitle(id)}`}>
                    <Icon name="up" />
                  </button>
                  <button className="icon-btn" onClick={() => move(i, i + 1)} disabled={i === ids.length - 1} aria-label={`Bajar ${songTitle(id)}`}>
                    <Icon name="down" />
                  </button>
                  <button className="icon-btn sb-remove" onClick={() => dispatch({ type: 'remove', id })} aria-label={`Quitar ${songTitle(id)}`}>
                    <Icon name="close" size={18} />
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <button className="btn btn-primary sb-publish-desk" onClick={onPublish}>
        VISTA PREVIA Y PUBLICAR
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SetlistBuilder() {
  const { state, dispatch, notify } = useStore();
  const [modal, setModal] = useState(false);
  const [errors, setErrors] = useState<{ nick?: boolean; name?: boolean }>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const nickRef = useRef<HTMLInputElement>(null);
  const tab = state.builderTab;

  const switchTab = (t: typeof tab, scroll = false) => {
    dispatch({ type: 'tab', tab: t });
    const panels = document.getElementById('crear-panels');
    if (scroll && panels && tabsRef.current) {
      // Bring the start of the panel right below the sticky tabs.
      const offset = tabsRef.current.getBoundingClientRect().bottom + 8;
      const top = panels.getBoundingClientRect().top;
      if (top < offset - 1 || top > window.innerHeight * 0.5) {
        window.requestAnimationFrame(() => {
          const y = panels.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        });
      }
    }
  };

  const requestPublish = () => {
    const nick = !state.nickname.trim();
    const name = !state.setlistName.trim();
    if (state.songIds.length < MIN_SONGS) {
      notify(`Agregá al menos ${MIN_SONGS} canciones para publicar.`);
      switchTab('songs', true);
      return;
    }
    if (nick || name) {
      setErrors({ nick, name });
      notify('Elegí tu nickname y un nombre para el setlist.');
      document.getElementById('crear-id')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => nickRef.current?.focus({ preventScroll: true }), 400);
      return;
    }
    setErrors({});
    setModal(true);
  };

  const lastSong = state.songIds[state.songIds.length - 1];

  return (
    <section id="crear" className="section sb" aria-labelledby="sb-title">
      <div className="sb-banner" aria-hidden="true">
        <img src={imgSrc('pyro-stage', 1280)} srcSet={imgSrcSet('pyro-stage')} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>

      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Crear mi setlist</span>
          <h2 id="sb-title" className="title">
            Armá tu <span className="sb-red">concierto</span> ideal
          </h2>
          <p className="lede">Elegí las canciones, ordenalas y publicá tu setlist soñado para Buenos Aires. Arrancamos con una propuesta de fans: cambiala como quieras.</p>
          <span className="demo-tag">PROPUESTA INICIAL: HIPÓTESIS DE FANS, NO CONFIRMADA</span>
        </div>

        <div id="crear-id" className="sb-identity">
          <label className={`sb-field ${errors.nick ? 'is-error' : ''}`}>
            <span>NICKNAME</span>
            <input
              ref={nickRef}
              type="text"
              placeholder="Ej: KitsuneDeBoedo"
              value={state.nickname}
              maxLength={24}
              autoComplete="nickname"
              onChange={(e) => {
                dispatch({ type: 'nickname', value: cleanText(e.target.value, 24) });
                if (errors.nick) setErrors((x) => ({ ...x, nick: false }));
              }}
            />
          </label>
          <label className={`sb-field ${errors.name ? 'is-error' : ''}`}>
            <span>NOMBRE DEL SETLIST</span>
            <input
              type="text"
              placeholder="Ej: La noche del Zorro"
              value={state.setlistName}
              maxLength={48}
              autoComplete="off"
              onChange={(e) => {
                dispatch({ type: 'setlistName', value: cleanText(e.target.value, 48) });
                if (errors.name) setErrors((x) => ({ ...x, name: false }));
              }}
            />
          </label>
        </div>

        <div className="sb-tabs" ref={tabsRef} role="tablist" aria-label="Creador de setlist">
          <button role="tab" id="tab-songs" aria-controls="panel-songs" aria-selected={tab === 'songs'} onClick={() => switchTab('songs', true)}>
            CANCIONES
          </button>
          <button role="tab" id="tab-setlist" aria-controls="panel-setlist" aria-selected={tab === 'setlist'} onClick={() => switchTab('setlist', true)}>
            MI SETLIST <span className="sb-tab-count">{state.songIds.length}</span>
          </button>
        </div>

        <div id="crear-panels" className="sb-panels" data-tab={tab}>
          <div id="panel-songs" role="tabpanel" aria-labelledby="tab-songs" className="sb-panel sb-panel-songs">
            <h3 className="sb-col-title">Biblioteca</h3>
            <SongLibrary />
          </div>
          <div id="panel-setlist" role="tabpanel" aria-labelledby="tab-setlist" className="sb-panel sb-panel-set">
            <h3 className="sb-col-title">{state.setlistName.trim() || 'Mi setlist'}</h3>
            <SetlistEditor onPublish={requestPublish} />
          </div>
        </div>

        {/* Mobile quick bar (sticky inside the section, above the radio mini-player) */}
        <div className="sb-bar">
          {tab === 'songs' ? (
            <button className="sb-bar-main" onClick={() => switchTab('setlist', true)}>
              <span className="sb-bar-count">{state.songIds.length}</span>
              <span className="sb-bar-text">
                <strong>VER MI SETLIST</strong>
                <small>{lastSong ? `Último: ${SONG_BY_ID[lastSong]?.title}` : 'Todavía sin canciones'}</small>
              </span>
              <Icon name="chevronUp" />
            </button>
          ) : (
            <>
              <button className="sb-bar-main sb-bar-back" onClick={() => switchTab('songs', true)}>
                <Icon name="plus" />
                <span className="sb-bar-text">
                  <strong>AGREGAR</strong>
                  <small>{state.songIds.length} canciones</small>
                </span>
              </button>
              <button className="btn btn-primary sb-bar-publish" onClick={requestPublish}>
                PUBLICAR
              </button>
            </>
          )}
        </div>
      </div>

      {modal && <PublishModal onClose={() => setModal(false)} />}
    </section>
  );
}
