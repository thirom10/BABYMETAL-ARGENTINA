import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RADIO_PLAYLIST } from '../data/radio';
import type { RadioTrack } from '../types';

/**
 * Visual-only radio state. No audio is streamed: "progress" is simulated with
 * a timer so the UI behaves like a real player for the demo.
 */
interface Radio {
  tracks: RadioTrack[];
  index: number;
  track: RadioTrack;
  playing: boolean;
  progress: number;
  volume: number;
  muted: boolean;
  expanded: boolean;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (i: number) => void;
  seek: (s: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setExpanded: (v: boolean) => void;
}

const RadioContext = createContext<Radio | null>(null);

export function RadioProvider({ children }: { children: ReactNode }) {
  const tracks = RADIO_PLAYLIST;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const track = tracks[index];

  const select = useCallback((i: number) => {
    setIndex((i + tracks.length) % tracks.length);
    setProgress(0);
    setPlaying(true);
  }, [tracks.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % tracks.length);
    setProgress(0);
  }, [tracks.length]);

  const prev = useCallback(() => {
    // Like real players: restart the track first, go back only near the start.
    if (progress <= 3) setIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setProgress(0);
  }, [progress, tracks.length]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => p + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (progress >= track.duration) next();
  }, [progress, track.duration, next]);

  const value = useMemo<Radio>(
    () => ({
      tracks,
      index,
      track,
      playing,
      progress,
      volume,
      muted,
      expanded,
      toggle: () => setPlaying((p) => !p),
      next,
      prev,
      select,
      seek: (s) => setProgress(Math.max(0, Math.min(track.duration - 1, Math.round(s)))),
      setVolume: (v) => {
        setVolumeState(v);
        setMuted(v === 0);
      },
      toggleMute: () => setMuted((m) => !m),
      setExpanded,
    }),
    [tracks, index, track, playing, progress, volume, muted, expanded, next, prev, select],
  );

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio(): Radio {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('useRadio must be used inside <RadioProvider>');
  return ctx;
}
