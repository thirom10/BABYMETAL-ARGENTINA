import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { artSrc } from '../data/images';
import { songTitle } from '../data/songs';
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery';
import { formatTime } from '../lib/format';
import { useRadio } from '../state/radio';
import { Icon } from './Icon';
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

function Controls({ big = false }: { big?: boolean }) {
  const r = useRadio();
  return (
    <div className={`rp-controls ${big ? 'is-big' : ''}`}>
      <button className="icon-btn" onClick={r.prev} aria-label="Canción anterior">
        <Icon name="prev" size={big ? 26 : 20} />
      </button>
      <button className="rp-play" onClick={r.toggle} aria-label={r.playing ? 'Pausar' : 'Reproducir'}>
        <Icon name={r.playing ? 'pause' : 'play'} size={big ? 30 : 22} />
      </button>
      <button className="icon-btn" onClick={r.next} aria-label="Canción siguiente">
        <Icon name="next" size={big ? 26 : 20} />
      </button>
    </div>
  );
}

function Progress() {
  const r = useRadio();
  const pct = (r.progress / r.track.duration) * 100;
  return (
    <div className="rp-progress">
      <input
        type="range"
        min={0}
        max={r.track.duration}
        value={r.progress}
        onChange={(e) => r.seek(Number(e.target.value))}
        aria-label="Progreso de la canción"
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
      <div className="rp-times">
        <span>{formatTime(r.progress)}</span>
        <span>{formatTime(r.track.duration)}</span>
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
        style={{ '--pct': `${v * 100}%` } as React.CSSProperties}
      />
    </div>
  );
}

function Playlist() {
  const r = useRadio();
  return (
    <ol className="rp-list" aria-label="Playlist">
      {r.tracks.map((t, i) => (
        <li key={t.songId}>
          <button className={i === r.index ? 'is-current' : ''} onClick={() => r.select(i)} aria-current={i === r.index ? 'true' : undefined}>
            <img src={artSrc(t.art)} alt="" loading="lazy" width={40} height={40} />
            <span className="rp-list-title">{songTitle(t.songId)}</span>
            {i === r.index ? <Eq on={r.playing} /> : <span className="rp-list-time">{formatTime(t.duration)}</span>}
          </button>
        </li>
      ))}
    </ol>
  );
}

function NowPlaying({ size }: { size: 'sm' | 'lg' }) {
  const r = useRadio();
  return (
    <div className={`rp-now rp-now-${size}`}>
      <div className={`rp-art ${r.playing ? 'is-playing' : ''}`}>
        <img key={r.track.art} src={artSrc(r.track.art)} alt="" width={400} height={400} />
      </div>
      <div className="rp-meta">
        <span className="rp-status">
          <Eq on={r.playing} /> {r.playing ? 'ON AIR' : 'EN PAUSA'}
        </span>
        <strong className="rp-title">{songTitle(r.track.songId)}</strong>
        <span className="rp-artist">BABYMETAL · KITSUNE RADIO</span>
      </div>
    </div>
  );
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
            <span className="rp-demo">DEMO · SIN AUDIO</span>
            <button className="icon-btn" onClick={() => r.setExpanded(false)} aria-label="Minimizar radio">
              <Icon name="chevronDown" />
            </button>
          </div>
          <NowPlaying size="lg" />
          <Progress />
          <div className="rp-row">
            <Volume />
            <Controls />
            <button className={`icon-btn ${showList ? 'is-on' : ''}`} onClick={() => setShowList((v) => !v)} aria-label="Mostrar playlist" aria-pressed={showList}>
              <Icon name="list" />
            </button>
          </div>
          {showList && <Playlist />}
        </>
      ) : (
        <div className="rp-desk-mini">
          <button className="rp-mini-open" onClick={() => r.setExpanded(true)} aria-label="Expandir radio">
            <NowPlaying size="sm" />
          </button>
          <Controls />
          <button className="icon-btn" onClick={() => r.setExpanded(true)} aria-label="Expandir radio">
            <Icon name="chevronUp" />
          </button>
          <span className="rp-mini-bar" style={{ width: `${(r.progress / r.track.duration) * 100}%` }} />
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

  // Lock page scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && r.setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, r]);

  const onSheetDown = (e: RPointerEvent) => {
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
    if (dy > 90) r.setExpanded(false);
  };

  return (
    <>
      <div
        className={`rp-mob-mini ${open ? 'is-hidden' : ''}`}
        onPointerDown={(e) => (miniDrag.current = { y: e.clientY })}
        onPointerUp={(e) => {
          if (miniDrag.current && miniDrag.current.y - e.clientY > 24) r.setExpanded(true);
          miniDrag.current = null;
        }}
      >
        <span className="rp-handle-hint" aria-hidden="true" />
        <button className="rp-mini-open" onClick={() => r.setExpanded(true)} aria-label="Abrir Kitsune Radio" aria-expanded={open}>
          <NowPlaying size="sm" />
        </button>
        <button className="rp-play rp-play-sm" onClick={r.toggle} aria-label={r.playing ? 'Pausar' : 'Reproducir'}>
          <Icon name={r.playing ? 'pause' : 'play'} size={20} />
        </button>
        <button className="icon-btn rp-mini-up" onClick={() => r.setExpanded(true)} aria-label="Abrir Kitsune Radio">
          <Icon name="chevronUp" size={18} />
        </button>
        <span className="rp-mini-bar" style={{ width: `${(r.progress / r.track.duration) * 100}%` }} />
      </div>

      <div className={`rp-scrim ${open ? 'is-open' : ''}`} onClick={() => r.setExpanded(false)} aria-hidden="true" />

      <div
        ref={sheetRef}
        className={`rp-sheet ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Kitsune Radio"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="rp-sheet-drag" onPointerDown={onSheetDown} onPointerMove={onSheetMove} onPointerUp={onSheetUp} onPointerCancel={onSheetUp}>
          <span className="rp-handle" aria-hidden="true" />
          <div className="rp-desk-head">
            <span className="rp-brand">
              KITSUNE <b>RADIO</b>
            </span>
            <span className="rp-demo">DEMO · SIN AUDIO</span>
            <button className="icon-btn" onClick={() => r.setExpanded(false)} aria-label="Minimizar radio">
              <Icon name="chevronDown" />
            </button>
          </div>
        </div>
        <div className="rp-sheet-body">
          <NowPlaying size="lg" />
          <Progress />
          <Controls big />
          <Volume />
          <p className="rp-list-head">PLAYLIST</p>
          <Playlist />
        </div>
      </div>
    </>
  );
}

export function RadioPlayer() {
  const desktop = useMediaQuery(DESKTOP_QUERY);
  return desktop ? <DesktopPlayer /> : <MobilePlayer />;
}
