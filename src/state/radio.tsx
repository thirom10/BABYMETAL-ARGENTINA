import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MINIMIZED_PLAYBACK, YOUTUBE_HOST } from '../config/radio';
import { RADIO_PLAYLIST } from '../data/radio';
import { songTitle } from '../data/songs';
import { loadYouTubeApi, YT_STATE, YT_UNPLAYABLE_ERRORS, type YTPlayer } from '../lib/youtube';
import type { RadioTrack } from '../types';
import { useStore } from './store';

/**
 * Kitsune Radio state, backed by a single YouTube IFrame player.
 *
 * The player iframe lives in <VideoDock/> (mounted once) and is visually
 * placed over whichever <VideoSlot/> is currently shown (mini bar, mobile sheet
 * or desktop panel). Moving an iframe in the DOM would reload it, so we move a
 * fixed-position box over the slot instead.
 */

export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SlotName = 'sheet' | 'desk-open' | 'desk-mini' | 'mini';

/** Which slot hosts the video, by priority. */
const SLOT_PRIORITY: SlotName[] = ['sheet', 'desk-open', 'desk-mini', 'mini'];

interface Radio {
  tracks: RadioTrack[];
  index: number;
  track: RadioTrack;
  status: PlayerStatus;
  playing: boolean;
  buffering: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  expanded: boolean;
  unavailable: ReadonlySet<string>;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (i: number) => void;
  seek: (s: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setExpanded: (v: boolean) => void;
  /* video placement */
  hostRef: React.RefObject<HTMLDivElement | null>;
  registerSlot: (name: SlotName, el: HTMLElement | null) => void;
  getActiveSlot: () => { name: SlotName; el: HTMLElement } | null;
}

const RadioContext = createContext<Radio | null>(null);

export function RadioProvider({ children }: { children: ReactNode }) {
  const { notify } = useStore();
  const tracks = RADIO_PLAYLIST;

  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unavailable, setUnavailable] = useState<ReadonlySet<string>>(() => new Set());

  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const indexRef = useRef(index);
  const unavailableRef = useRef(unavailable);
  const volumeRef = useRef({ volume, muted });
  const slots = useRef(new Map<SlotName, HTMLElement>());

  indexRef.current = index;
  unavailableRef.current = unavailable;
  volumeRef.current = { volume, muted };

  const track = tracks[index];

  /** Next playable index in a direction, skipping videos that failed. */
  const step = useCallback(
    (from: number, dir: 1 | -1) => {
      for (let k = 1; k <= tracks.length; k++) {
        const i = (from + dir * k + tracks.length) % tracks.length;
        if (!unavailableRef.current.has(tracks[i].youtubeId)) return i;
      }
      return from;
    },
    [tracks],
  );

  const load = useCallback(
    (i: number) => {
      setIndex(i);
      setProgress(0);
      setDuration(0);
      if (readyRef.current && playerRef.current) playerRef.current.loadVideoById(tracks[i].youtubeId);
    },
    [tracks],
  );

  /** Creates the player on first use. `autoplay` starts the current track once ready. */
  const ensurePlayer = useCallback(async () => {
    if (playerRef.current || !hostRef.current) return;
    setStatus('loading');
    try {
      const YT = await loadYouTubeApi();
      if (playerRef.current || !hostRef.current) return;
      const mount = document.createElement('div');
      hostRef.current.replaceChildren(mount);
      playerRef.current = new YT.Player(mount, {
        host: YOUTUBE_HOST,
        videoId: tracks[indexRef.current].youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 0,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            setStatus('ready');
            const v = volumeRef.current;
            e.target.setVolume(Math.round(v.volume * 100));
            if (v.muted) e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            switch (e.data) {
              case YT_STATE.PLAYING:
                setPlaying(true);
                setBuffering(false);
                setDuration(e.target.getDuration() || 0);
                break;
              case YT_STATE.PAUSED:
              case YT_STATE.CUED:
                setPlaying(false);
                setBuffering(false);
                break;
              case YT_STATE.BUFFERING:
                setBuffering(true);
                break;
              case YT_STATE.ENDED:
                setPlaying(false);
                load(step(indexRef.current, 1));
                break;
            }
          },
          onError: (e) => {
            if (!YT_UNPLAYABLE_ERRORS.has(e.data)) return;
            const bad = tracks[indexRef.current];
            const nextSet = new Set(unavailableRef.current).add(bad.youtubeId);
            unavailableRef.current = nextSet;
            setUnavailable(nextSet);
            notify(`“${songTitle(bad.songId)}” no está disponible en YouTube ahora. Pasamos a la siguiente.`);
            const n = step(indexRef.current, 1);
            if (n !== indexRef.current) load(n);
          },
        },
      });
    } catch {
      setStatus('error');
      notify('No pudimos conectar con YouTube. Revisá tu conexión o bloqueadores de contenido.');
    }
  }, [tracks, load, step, notify]);

  /* Poll position while playing. */
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      setProgress(p.getCurrentTime() || 0);
      const d = p.getDuration();
      if (d) setDuration(d);
    }, 500);
    return () => window.clearInterval(id);
  }, [playing]);

  /* Strict mode: pause when minimized. */
  useEffect(() => {
    if (MINIMIZED_PLAYBACK === 'pause' && !expanded) playerRef.current?.pauseVideo();
  }, [expanded]);

  useEffect(() => () => playerRef.current?.destroy(), []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      void ensurePlayer();
      return;
    }
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing, ensurePlayer]);

  const select = useCallback(
    (i: number) => {
      if (!playerRef.current) {
        setIndex(i);
        void ensurePlayer();
        return;
      }
      load(i);
    },
    [ensurePlayer, load],
  );

  const next = useCallback(() => select(step(indexRef.current, 1)), [select, step]);

  const prev = useCallback(() => {
    const p = playerRef.current;
    if (p && readyRef.current && (p.getCurrentTime() || 0) > 3) {
      p.seekTo(0, true);
      setProgress(0);
      return;
    }
    select(step(indexRef.current, -1));
  }, [select, step]);

  const seek = useCallback((s: number) => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    p.seekTo(s, true);
    setProgress(s);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMuted(v === 0);
    const p = playerRef.current;
    if (p && readyRef.current) {
      p.setVolume(Math.round(v * 100));
      if (v === 0) p.mute();
      else p.unMute();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (p && readyRef.current) {
      if (muted) p.unMute();
      else p.mute();
    }
    setMuted(!muted);
  }, [muted]);

  const registerSlot = useCallback((name: SlotName, el: HTMLElement | null) => {
    if (el) slots.current.set(name, el);
    else slots.current.delete(name);
  }, []);

  const getActiveSlot = useCallback(() => {
    for (const name of SLOT_PRIORITY) {
      const el = slots.current.get(name);
      if (!el || !el.isConnected) continue;
      if (name === 'sheet' && !expanded) continue;
      if (name === 'desk-open' && !expanded) continue;
      return { name, el };
    }
    return null;
  }, [expanded]);

  const value = useMemo<Radio>(
    () => ({
      tracks,
      index,
      track,
      status,
      playing,
      buffering,
      progress,
      duration,
      volume,
      muted,
      expanded,
      unavailable,
      toggle,
      next,
      prev,
      select,
      seek,
      setVolume,
      toggleMute,
      setExpanded,
      hostRef,
      registerSlot,
      getActiveSlot,
    }),
    [tracks, index, track, status, playing, buffering, progress, duration, volume, muted, expanded, unavailable, toggle, next, prev, select, seek, setVolume, toggleMute, registerSlot, getActiveSlot],
  );

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio(): Radio {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used inside <RadioProvider>');
  return ctx;
}
