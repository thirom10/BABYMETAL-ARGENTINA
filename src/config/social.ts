import type { SocialNetwork } from '../types';

export interface SocialInfo {
  id: SocialNetwork;
  label: string;
  /** Two/three letter tag for compact UI. */
  short: string;
  url: (handle: string) => string;
}

export const SOCIAL_NETWORKS: SocialInfo[] = [
  { id: 'instagram', label: 'Instagram', short: 'IG', url: (h) => `https://www.instagram.com/${h}/` },
  { id: 'tiktok', label: 'TikTok', short: 'TT', url: (h) => `https://www.tiktok.com/@${h}` },
  { id: 'x', label: 'X (Twitter)', short: 'X', url: (h) => `https://x.com/${h}` },
  { id: 'youtube', label: 'YouTube', short: 'YT', url: (h) => `https://www.youtube.com/@${h}` },
  { id: 'facebook', label: 'Facebook', short: 'FB', url: (h) => `https://www.facebook.com/${h}` },
  { id: 'twitch', label: 'Twitch', short: 'TW', url: (h) => `https://www.twitch.tv/${h}` },
];

export const SOCIAL_BY_ID = Object.fromEntries(SOCIAL_NETWORKS.map((s) => [s.id, s])) as Record<SocialNetwork, SocialInfo>;

/** Same rule as the database: letters, numbers, dot, underscore, hyphen; 1-30 chars. */
export const HANDLE_RE = /^[A-Za-z0-9._-]{1,30}$/;

/** Drops a leading "@", spaces and any character the database would reject. */
export function cleanHandle(value: string): string {
  return value.replace(/^\s*@+/, '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 30);
}

/** Profile URL, or null if the pair is not valid. The handle is validated, so the URL cannot be abused. */
export function socialUrl(network: SocialNetwork | null | undefined, handle: string | null | undefined): string | null {
  if (!network || !handle || !HANDLE_RE.test(handle)) return null;
  const info = SOCIAL_BY_ID[network];
  return info ? info.url(handle) : null;
}
