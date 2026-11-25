export const EVENT = {
  artist: 'BABYMETAL',
  city: 'BUENOS AIRES',
  venue: 'MOVISTAR ARENA',
  dateLabel: '01 DICIEMBRE 2026',
  dateShort: '01.12.2026',
  /** 21:00 Argentina time (UTC-3, no DST). */
  startsAt: new Date('2026-12-01T21:00:00-03:00'),
} as const;

export const SECTIONS = [
  { id: 'countdown', label: 'COUNTDOWN' },
  { id: 'radio', label: 'RADIO' },
  { id: 'telonera', label: 'TELONERA' },
  { id: 'setlist', label: 'SETLIST' },
  { id: 'comunidad', label: 'COMUNIDAD' },
] as const;

export const OPENER_ID = 'babymetal-death';
export const CLOSER_ID = 'road-of-resistance';
