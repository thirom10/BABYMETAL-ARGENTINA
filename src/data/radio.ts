import type { RadioTrack } from '../types';

/**
 * Kitsune Radio playlist — official videos only (channels @BABYMETAL and
 * @BABYMETALVEVO), played through the YouTube IFrame Player.
 * Every id was checked to load via YouTube oEmbed (embedding allowed).
 * If a video becomes unavailable, the player marks it and skips to the next.
 *
 * `art` is our own artwork (src/data/images.ts) shown before YouTube loads,
 * so no request goes to YouTube until the visitor presses play.
 */
export const RADIO_PLAYLIST: RadioTrack[] = [
  { songId: 'babymetal-death', youtubeId: 'DHA_HuGA-Mc', kind: 'LIVE', art: 'hero-fire' },
  { songId: 'from-me-to-u', youtubeId: 'qayP_YUrf9I', kind: 'MV', art: 'live-fist' },
  { songId: 'megitsune', youtubeId: 'cK3NMZAUKGw', kind: 'MV', art: 'trio-red' },
  { songId: 'song-3', youtubeId: 'KEMVgy51kPE', kind: 'MV', art: 'live-arms' },
  { songId: 'sunset-kiss', youtubeId: 'GCMbwc0ZNfE', kind: 'LIVE', art: 'live-spin' },
  { songId: 'monochrome', youtubeId: 'FpPBPQUdFx8', kind: 'LYRIC', art: 'stage-amsterdam' },
  { songId: 'syncopation', youtubeId: '4hSiQHPbsbE', kind: 'LIVE', art: 'live-jump' },
  { songId: 'metali', youtubeId: 'hkij4LvACZ0', kind: 'MV', art: 'pyro-stage' },
  { songId: 'my-queen', youtubeId: '6MWlBf2lhno', kind: 'MV', art: 'trio-red' },
  { songId: 'iine', youtubeId: 'qVdBBOpSoN4', kind: 'MV', art: 'live-fist' },
  { songId: 'ratatata', youtubeId: 'EDnIEWyVIlE', kind: 'MV', art: 'live-spin' },
  { songId: 'kon-kon', youtubeId: 'UxRldWoKlnQ', kind: 'MV', art: 'live-arms' },
  { songId: 'karate', youtubeId: 'GvD3CHA48pA', kind: 'MV', art: 'live-jump' },
  { songId: 'distortion', youtubeId: '1ce456Nnkt8', kind: 'MV', art: 'stage-amsterdam' },
  { songId: 'ijime-dame-zettai', youtubeId: 'nDqaTXqCN-Q', kind: 'MV', art: 'hero-fire' },
  { songId: 'doki-doki-morning', youtubeId: 'cirhQ8iLdbw', kind: 'MV', art: 'trio-red' },
  { songId: 'gimme-chocolate', youtubeId: 'WIKqgE4BwAY', kind: 'MV', art: 'live-fist' },
  { songId: 'headbangeeeeerrrrr', youtubeId: '2IzR_ClTE8Y', kind: 'MV', art: 'live-spin' },
  { songId: 'road-of-resistance', youtubeId: 'zTEYUFgLveY', kind: 'LIVE', art: 'pyro-stage' },
];

export const KIND_LABEL: Record<RadioTrack['kind'], string> = {
  MV: 'VIDEOCLIP',
  LIVE: 'EN VIVO',
  LYRIC: 'LYRIC VIDEO',
};
