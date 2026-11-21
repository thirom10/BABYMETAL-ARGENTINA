import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import { artSrc } from '../data/images';
import { KIND_LABEL } from '../data/radio';
import { songTitle } from '../data/songs';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { formatTime } from '../lib/format';
import { youtubeWatchUrl } from '../lib/youtube';
import { useRadio, type SlotName } from '../state/radio';
import { Icon } from './Icon';
import { VideoSlot } from './VideoDock';
import './RadioPlayer.css';

function Eq({ on }: { on: boolean }) {
  return (
    <span className={`eq ${on ? 'is-on' : ''}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function statusLabel(r: ReturnType<typeof useRadio>) {
  if (r.status === 'loading' || (r.buffering && !r.playing)) return 'CARGANDO…';
  if (r.status === 'error') return 'SIN CONEXIÓN';
  return r.playing ? 'ON AIR' : 'EN PAUSA';
}

function PlayIcon({ size }: { size: number }) {
  const r = useRadio();
  return <Icon name={r.playing ? 'pause' : 'play'} size={size} />;
}

function Controls({ big = false }: { big?: boolean }) {
  const r = useRadio();
  return (
    <div className={`rp-controls ${big ? 'is-big' : ''}`}>
      <button className="icon-btn" onClick={r.prev} aria-label="Canción anterior">
        <Icon name="prev" size={big ? 26 : 20} />
      </button>
      <button className="rp-play" onClick={r.toggle} aria-label={r.playing ? 'Pausar' : 'Reproducir'}>
        <PlayIcon size={big ? 30 : 22} />
      </button>
      <button className="icon-btn" onClick={r.next} aria-label="Canción siguiente">
        <Icon name="next" size={big ? 26 : 20} />
      </button>
    </div>
  );
}

function Progress() {
  const r = useRadio();
  const known = r.duration > 0;
  const pct = known ? (r.progress / r.duration) * 100 : 0;
  return (
    <div className="rp-progress">
      <input
        type="range"
        min={0}
        max={known ? Math.floor(r.duration) : 1}
        step={1}
        value={known ? Math.floor(r.progress) : 0}
        disabled={!known}
        onChange={(e) => r.seek(Number(e.target.value))}
        aria-label="Progreso de la canción"
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
      <div className="rp-times">
        <span>{known ? formatTime(r.progress) : '0:00'}</span>
        <span>{known ? formatTime(r.duration) : '--:--'}</span>
      </div>
    </div>
  );
}

function Volume() {
  const r = useRadio();
  const v = r.muted ? 0 : r.volume;
  return (
    <div className="rp-volume">
      <button className="icon-btn" onClick={r.toggleMute} aria-label={r.muted ? 'Activar sonido' : 'Silenciar'}>
        <Icon name={v === 0 ? 'mute' : 'volume'} size={18} />
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(v * 100)}
        onChange={(e) => r.setVolume(Number(e.target.value) / 100)}
        aria-label="Volumen"
        style={{ '--pct': `${v * 100}%` } as CSSProperties}
      />
    </div>
  );
}

function Playlist() {
  const r = useRadio();
  return (
    <ol className="rp-list" aria-label="Playlist">
      {r.tracks.map((t, i) => {
        const off = r.unavailable.has(t.youtubeId);
        const current = i === r.index;
        return (
          <li key={t.youtubeId}>
            <button className={`${current ? 'is-current' : ''} ${off ? 'is-off' : ''}`} onClick={() => r.select(i)} disabled={off} aria-current={current ? 'true' : undefined}>
              <img src={artSrc(t.art)} alt="" loading="lazy" width={40} height={40} />
              <span className="rp-list-text">
                <span className="rp-list-title">{songTitle(t.songId)}</span>
                <span className="rp-list-kind">{off ? 'NO DISPONIBLE' : KIND_LABEL[t.kind]}</span>
              </span>
              {current && <Eq on={r.playing} />}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function TrackInfo({ center = false }: { center?: boolean }) {
  const r = useRadio();
  return (
    <div className={`rp-meta ${center ? 'is-center' : ''}`}>
      <span className="rp-status">
        <Eq on={r.playing} /> {statusLabel(r)}
      </span>
      <strong className="rp-title">{songTitle(r.track.songId)}</strong>
      <span className="rp-artist">
        {KIND_LABEL[r.track.kind]} OFICIAL ·{' '}
        <a href={youtubeWatchUrl(r.track.youtubeId)} target="_blank" rel="noopener noreferrer">
          VER EN YOUTUBE
        </a>
      </span>
    </div>
  );
}

/** Big video area. Before YouTube loads it shows our artwork and a play button. */
function BigVideo({ name }: { name: SlotName }) {
  const r = useRadio();
  return (
    <VideoSlot name={name}>
      <img src={artSrc(r.track.art)} alt="" width={400} height={400} />
      {r.status === 'idle' && (
        <button className="vslot-play" onClick={r.toggle} aria-label={`Reproducir ${songTitle(r.track.songId)} (video de YouTube)`}>
          <span>
            <Icon name="play" size={26} />
          </span>
          <span>REPRODUCIR VIDEO</span>
        </button>
      )}
    </VideoSlot>
  );
}

function MiniVideo({ name }: { name: SlotName }) {
  const r = useRadio();
  return (
    <VideoSlot name={name}>
      <img src={artSrc(r.track.art)} alt="" width={96} height={54} />
    </VideoSlot>
  );
}

function YouTubeNote() {
  return <p className="rp-note">Videos oficiales vía YouTube. El reproductor se carga recién cuando das play.</p>;
}

/* ------------------------------------------------------------------ */

function DesktopPlayer() {
  const r = useRadio();
  const [showList, setShowList] = useState(true);
  const open = r.expanded;
  return (
    <aside className={`rp-desk ${open ? 'is-open' : ''}`} aria-label="Kitsune Radio">
      {open ? (
        <>
          <div className="rp-desk-head">
            <span className="rp-brand">
              KITSUNE <b>RADIO</b>
            </span>
            <button className="icon-btn" onClick={() => r.setExpanded(false)} aria-label="Minimizar radio">
              <Icon name="chevronDown" />
            </button>
          </div>
          <BigVideo name="desk-open" />
          <TrackInfo />
          <Progress />
          <div className="rp-row">
            <Volume />
            <Controls />
            <button className={`icon-btn ${showList ? 'is-on' : ''}`} onClick={() => setShowList((v) => !v)} aria-label="Mostrar playlist" aria-pressed={showList}>
              <Icon name="list" />
            </button>
          </div>
          {showList && <Playlist />}
          <YouTubeNote />
        </>
      ) : (
        <div className="rp-desk-mini">
          <button className="rp-mini-open" onClick={() => r.setExpanded(true)} aria-label="Expandir radio">
            <MiniVideo name="desk-mini" />
            <span className="rp-mini-text">
              <span className="rp-status">
                <Eq on={r.playing} /> {statusLabel(r)}
              </span>
              <strong className="rp-title">{songTitle(r.track.songId)}</strong>
            </span>
          </button>
          <button className="rp-play rp-play-sm" onClick={r.toggle} aria-label={r.playing ? 'Pausar' : 'Reproducir'}>
            <PlayIcon size={20} />
          </button>
          <button className="icon-btn" onClick={r.next} aria-label="Canción siguiente">
            <Icon name="next" size={18} />
          </button>
          <button className="icon-btn" onClick={() => r.setExpanded(true)} aria-label="Expandir radio">
            <Icon name="chevronUp" />
          </button>
          <span className="rp-mini-bar" style={{ width: `${r.duration ? (r.progress / r.duration) * 100 : 0}%` }} />
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function MobilePlayer() {
  const r = useRadio();
  const open = r.expanded;
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number; active: boolean }>({ y: 0, dy: 0, active: false });
  const miniDrag = useRef<{ y: number } | null>(null);
  const { setExpanded } = r;

  // Lock page scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setExpanded]);

  const onSheetDown = (e: RPointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { y: e.clientY, dy: 0, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onSheetMove = (e: RPointerEvent) => {
    if (!drag.current.active || !sheetRef.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    drag.current.dy = dy;
    sheetRef.current.style.transition = 'none';
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onSheetUp = () => {
    if (!drag.current.active || !sheetRef.current) return;
    const { dy } = drag.current;
    drag.current.active = false;
    sheetRef.current.style.transition = '';
    sheetRef.current.style.transform = '';
    if (dy > 90) setExpanded(false);
  };

  return (
    <>
      <div
        className={`rp-mob-mini ${open ? 'is-hidden' : ''}`}
        onPointerDown={(e) => (miniDrag.current = { y: e.clientY })}
        onPointerUp={(e) => {
          if (miniDrag.current && miniDrag.current.y - e.clientY > 24) setExpanded(true);
          miniDrag.current = null;
        }}
      >
        <span className="rp-handle-hint" aria-hidden="true" />
        <button className="rp-mini-open" onClick={() => setExpanded(true)} aria-label="Abrir Kitsune Radio" aria-expanded={open}>
          <MiniVideo name="mini" />
          <span className="rp-mini-text">
            <span className="rp-status">
              <Eq on={r.playing} /> {statusLabel(r)}
            </span>
            <strong className="rp-title">{songTitle(r.track.songId)}</strong>
          </span>
        </button>
        <button className="rp-play rp-play-sm" onClick={r.toggle} aria-label={r.playing ? 'Pausar' : 'Reproducir'}>
          <PlayIcon size={20} />
        </button>
        <button className="icon-btn rp-mini-up" onClick={() => setExpanded(true)} aria-label="Abrir Kitsune Radio">
          <Icon name="chevronUp" size={18} />
        </button>
        <span className="rp-mini-bar" style={{ width: `${r.duration ? (r.progress / r.duration) * 100 : 0}%` }} />
      </div>

      <div className={`rp-scrim ${open ? 'is-open' : ''}`} onClick={() => setExpanded(false)} aria-hidden="true" />

      <div ref={sheetRef} className={`rp-sheet ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Kitsune Radio" aria-hidden={!open} inert={!open}>
        <div className="rp-sheet-drag" onPointerDown={onSheetDown} onPointerMove={onSheetMove} onPointerUp={onSheetUp} onPointerCancel={onSheetUp}>
          <span className="rp-handle" aria-hidden="true" />
          <div className="rp-desk-head">
            <span className="rp-brand">
              KITSUNE <b>RADIO</b>
            </span>
            <button className="icon-btn" onClick={() => setExpanded(false)} aria-label="Minimizar radio">
              <Icon name="chevronDown" />
            </button>
          </div>
          <BigVideo name="sheet" />
        </div>
        <div className="rp-sheet-body">
          <TrackInfo center />
          <Progress />
          <Controls big />
          <Volume />
          <p className="rp-list-head">PLAYLIST</p>
          <Playlist />
          <YouTubeNote />
        </div>
      </div>
    </>
  );
}

export function RadioPlayer() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  return desktop ? <DesktopPlayer /> : <MobilePlayer />;
}
