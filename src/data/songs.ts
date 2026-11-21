import type { Category, CategoryFilter, Song } from '../types';

/**
 * Demo song library. Categories are a fan curation (not official album data)
 * and can be adjusted freely.
 */
const RAW: Array<[id: string, title: string, category: Category]> = [
  // CLASSICS — the backbone of almost every show
  ['babymetal-death', 'BABYMETAL DEATH', 'CLASSICS'],
  ['megitsune', 'Megitsune', 'CLASSICS'],
  ['gimme-chocolate', 'Gimme Chocolate!!', 'CLASSICS'],
  ['iine', 'Iine!', 'CLASSICS'],
  ['headbangeeeeerrrrr', 'Headbangeeeeerrrrr!!!!!', 'CLASSICS'],
  ['road-of-resistance', 'ROAD OF RESISTANCE', 'CLASSICS'],
  ['karate', 'KARATE', 'CLASSICS'],
  ['akatsuki', 'Akatsuki', 'CLASSICS'],
  ['catch-me-if-you-can', 'Catch me if you can', 'CLASSICS'],
  ['awadama-fever', 'Awadama Fever', 'CLASSICS'],

  // METAL FORTH — the current era
  ['from-me-to-u', 'from me to u', 'METAL FORTH'],
  ['song-3', 'Song 3', 'METAL FORTH'],
  ['kawaii', 'KxAxWxAxIxI', 'METAL FORTH'],
  ['sunset-kiss', 'Sunset Kiss', 'METAL FORTH'],
  ['syncopation', 'Syncopation', 'METAL FORTH'],
  ['metali', 'METALI!!', 'METAL FORTH'],
  ['ratatata', 'RATATATA', 'METAL FORTH'],
  ['kon-kon', 'Kon! Kon!', 'METAL FORTH'],

  // FAN FAVORITES
  ['monochrome', 'Monochrome', 'FAN FAVORITES'],
  ['pa-pa-ya', 'PA PA YA!!', 'FAN FAVORITES'],
  ['shanti-shanti-shanti', 'Shanti Shanti Shanti', 'FAN FAVORITES'],
  ['elevator-girl', 'Elevator Girl', 'FAN FAVORITES'],
  ['da-da-dance', 'DA DA DANCE', 'FAN FAVORITES'],
  ['starlight', 'Starlight', 'FAN FAVORITES'],
  ['the-one', 'THE ONE', 'FAN FAVORITES'],
  ['metalizm', 'METALIZM', 'FAN FAVORITES'],
  ['divine-attack', 'Divine Attack', 'FAN FAVORITES'],
  ['mirror-mirror', 'Mirror Mirror', 'FAN FAVORITES'],
  ['meta-taro', 'Meta Taro', 'FAN FAVORITES'],
  ['brand-new-day', 'Brand New Day', 'FAN FAVORITES'],
  ['oh-majinai', 'Oh! MAJINAI', 'FAN FAVORITES'],
  ['yava', 'YAVA!', 'FAN FAVORITES'],
  ['light-and-darkness', 'Light and Darkness', 'FAN FAVORITES'],
  ['future-metal', 'FUTURE METAL', 'FAN FAVORITES'],

  // WILDCARDS — rarely played, dreamed by fans
  ['arkadia', 'Arkadia', 'WILDCARDS'],
  ['ijime-dame-zettai', 'Ijime, Dame, Zettai', 'WILDCARDS'],
  ['distortion', 'Distortion', 'WILDCARDS'],
  ['doki-doki-morning', 'Doki Doki ☆ Morning', 'WILDCARDS'],
  ['uki-uki-midnight', 'Uki Uki ★ Midnight', 'WILDCARDS'],
  ['onedari-daisakusen', 'Onedari Daisakusen', 'WILDCARDS'],
  ['akumu-no-rondo', 'Akumu no Rondo', 'WILDCARDS'],
  ['amore', 'Amore', 'WILDCARDS'],
  ['no-rain-no-rainbow', 'NO RAIN, NO RAINBOW', 'WILDCARDS'],
  ['tales-of-the-destinies', 'Tales of The Destinies', 'WILDCARDS'],
  ['night-night-burn', 'Night Night Burn!', 'WILDCARDS'],
  ['kagerou', 'Kagerou', 'WILDCARDS'],
  ['shine', 'Shine', 'WILDCARDS'],
  ['sis-anger', 'Sis. Anger', 'WILDCARDS'],
];

export const SONGS: Song[] = RAW.map(([id, title, category]) => ({ id, title, category }));

export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(SONGS.map((s) => [s.id, s]));

export const CATEGORY_FILTERS: CategoryFilter[] = ['ALL', 'CLASSICS', 'METAL FORTH', 'FAN FAVORITES', 'WILDCARDS'];

export function songTitle(id: string): string {
  return SONG_BY_ID[id]?.title ?? id;
}

/** Fan hypothesis — NOT a confirmed setlist for Buenos Aires. */
export const DEFAULT_SETLIST: string[] = [
  'babymetal-death',
  'from-me-to-u',
  'megitsune',
  'song-3',
  'kawaii',
  'sunset-kiss',
  'monochrome',
  'syncopation',
  'metali',
  'iine',
  'ratatata',
  'gimme-chocolate',
  'headbangeeeeerrrrr',
  'road-of-resistance',
];
