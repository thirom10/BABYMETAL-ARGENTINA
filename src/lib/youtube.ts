/**
 * Minimal loader + types for the YouTube IFrame Player API.
 * Docs: https://developers.google.com/youtube/iframe_api_reference
 *
 * The API script is only requested when the visitor first interacts with the
 * radio, so YouTube is not contacted on a plain page view.
 */

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string, startSeconds?: number): void;
  cueVideoById(id: string, startSeconds?: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerOptions {
  host?: string;
  videoId?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: YTPlayerEvent) => void;
    onStateChange?: (e: YTPlayerEvent) => void;
    onError?: (e: YTPlayerEvent) => void;
  };
}

interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/** Error codes that mean "this video can't be played here" (removed, private, embed disabled). */
export const YT_UNPLAYABLE_ERRORS = new Set([2, 5, 100, 101, 150]);

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      script.remove();
      reject(new Error('No se pudo cargar el reproductor de YouTube.'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}
