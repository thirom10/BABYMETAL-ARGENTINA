/**
 * REAL data: setlists that BABYMETAL actually played on the 2026 tour.
 *
 * Source: setlist.fm (https://www.setlist.fm/setlists/babymetal-5bd19f80.html).
 * Collected on 2026-11-24, copied song by song from each show's page.
 *
 * Only the 8 most recent HEADLINE shows are used (same 14-song format that the
 * Buenos Aires show will most likely follow). The two festival sets in that
 * period (Louder Than Life 2026-09-19, Aftershock 2026-10-03) are excluded:
 * they are shorter (8-10 songs) and not representative of an arena show.
 *
 * These shows are from the US leg; the Latin America leg starts on 2026-11-28,
 * so this is an indication, NOT a confirmed setlist for Buenos Aires.
 * When new shows are played, add them here (newest first) from setlist.fm.
 */
export interface TourShow {
  /** ISO date (YYYY-MM-DD) */
  date: string;
  city: string;
  venue: string;
  /** Page of this exact setlist on setlist.fm */
  url: string;
  /** Song ids (see src/data/songs.ts) in the order they were played, encore included. */
  songIds: string[];
}

export const TOUR_SOURCE = {
  name: 'setlist.fm',
  url: 'https://www.setlist.fm/setlists/babymetal-5bd19f80.html',
  retrievedAt: '2026-11-24',
} as const;

// Shows share most of their structure; these are the three variants seen in the data.
const OPEN = ['babymetal-death', 'from-me-to-u'];
const CLOSE = ['metali', 'iine', 'ratatata', 'gimme-chocolate', 'headbangeeeeerrrrr', 'road-of-resistance'];

export const TOUR_SHOWS: TourShow[] = [
  {
    date: '2026-10-01',
    city: 'Phoenix, AZ',
    venue: 'Talking Stick Resort Amphitheatre',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/talking-stick-resort-amphitheatre-phoenix-az-4b769b42.html',
    songIds: [...OPEN, 'megitsune', 'song-3', 'kawaii', 'my-queen', 'monochrome', 'syncopation', ...CLOSE],
  },
  {
    date: '2026-09-29',
    city: 'Albuquerque, NM',
    venue: 'First Financial Credit Union Amphitheater',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/first-financial-credit-union-amphitheater-albuquerque-nm-43769b43.html',
    songIds: [...OPEN, 'megitsune', 'song-3', 'kawaii', 'sunset-kiss', 'monochrome', 'algorism', ...CLOSE],
  },
  {
    date: '2026-09-26',
    city: 'Austin, TX',
    venue: 'Germania Insurance Amphitheater',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/germania-insurance-amphitheater-austin-tx-4b769b4e.html',
    songIds: [...OPEN, 'pa-pa-ya', 'song-3', 'bxmxc', 'sunset-kiss', 'monochrome', 'syncopation', ...CLOSE],
  },
  {
    date: '2026-09-25',
    city: 'The Woodlands, TX',
    venue: 'Cynthia Woods Mitchell Pavilion',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/cynthia-woods-mitchell-pavilion-the-woodlands-tx-5b769b48.html',
    songIds: [...OPEN, 'pa-pa-ya', 'song-3', 'bxmxc', 'sunset-kiss', 'monochrome', 'syncopation', ...CLOSE],
  },
  {
    date: '2026-09-23',
    city: 'Dallas, TX',
    venue: 'Dos Equis Pavilion',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/dos-equis-pavilion-dallas-tx-53769b49.html',
    songIds: [...OPEN, 'megitsune', 'song-3', 'kawaii', 'sunset-kiss', 'monochrome', 'algorism', ...CLOSE],
  },
  {
    date: '2026-09-21',
    city: 'Maryland Heights, MO',
    venue: 'Hollywood Casino Amphitheatre',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/hollywood-casino-amphitheatre-maryland-heights-mo-43769b4b.html',
    songIds: [...OPEN, 'megitsune', 'song-3', 'kawaii', 'sunset-kiss', 'monochrome', 'algorism', ...CLOSE],
  },
  {
    date: '2026-09-18',
    city: 'Clarkston, MI',
    venue: 'Pine Knob Music Theatre',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/pine-knob-music-theatre-clarkston-mi-4b769b56.html',
    songIds: [...OPEN, 'pa-pa-ya', 'song-3', 'bxmxc', 'sunset-kiss', 'monochrome', 'syncopation', ...CLOSE],
  },
  {
    date: '2026-09-16',
    city: 'Alpharetta, GA',
    venue: 'Ameris Bank Amphitheatre',
    url: 'https://www.setlist.fm/setlist/babymetal/2026/ameris-bank-amphitheatre-alpharetta-ga-5b769b50.html',
    songIds: [...OPEN, 'pa-pa-ya', 'song-3', 'kawaii', 'sunset-kiss', 'monochrome', 'syncopation', ...CLOSE],
  },
];
