import { SOCIAL_BY_ID, cleanHandle } from '../config/social';
import { SONG_BY_ID } from '../data/songs';
import type { SocialNetwork } from '../types';
import { cleanText } from './format';

/**
 * The setlist being built is kept in this browser (localStorage) so that it
 * survives reloads and the round trip to Google when signing in.
 * Nothing here leaves the device.
 */
export interface Draft {
  nickname: string;
  setlistName: string;
  songIds: string[];
  openers: string[];
  socialNetwork: SocialNetwork | '';
  socialHandle: string;
}

const KEY = 'bma:draft:v1';

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Draft>;
    const songIds = Array.isArray(d.songIds) ? [...new Set(d.songIds.filter((id): id is string => typeof id === 'string' && id in SONG_BY_ID))].slice(0, 25) : [];
    const openers = Array.isArray(d.openers)
      ? d.openers.filter((o): o is string => typeof o === 'string').map((o) => cleanText(o, 30).trim()).filter(Boolean).slice(0, 5)
      : [];
    const network = typeof d.socialNetwork === 'string' && d.socialNetwork in SOCIAL_BY_ID ? (d.socialNetwork as SocialNetwork) : '';
    return {
      nickname: typeof d.nickname === 'string' ? cleanText(d.nickname, 24) : '',
      setlistName: typeof d.setlistName === 'string' ? cleanText(d.setlistName, 48) : '',
      songIds,
      openers,
      socialNetwork: network,
      socialHandle: typeof d.socialHandle === 'string' ? cleanHandle(d.socialHandle) : '',
    };
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* storage full / blocked: the draft is only a convenience */
  }
}
