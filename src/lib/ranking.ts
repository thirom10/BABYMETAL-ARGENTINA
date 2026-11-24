import type { Ranking } from '../types';

/**
 * Builds a ranking from a list of setlists (each one an ordered array of song ids).
 * `picks` = in how many setlists the song appears; `avgPos` = average position,
 * 0 (opener) to 1 (closer). Same shape the database function `people_ranking` returns.
 */
export function buildRanking(setlists: string[][]): Ranking {
  const acc = new Map<string, { picks: number; pos: number }>();
  for (const list of setlists) {
    list.forEach((id, i) => {
      const a = acc.get(id) ?? { picks: 0, pos: 0 };
      a.picks += 1;
      a.pos += list.length > 1 ? i / (list.length - 1) : 0.5;
      acc.set(id, a);
    });
  }
  const rows = [...acc.entries()]
    .map(([id, a]) => ({ id, picks: a.picks, avgPos: a.pos / a.picks }))
    .sort((x, y) => y.picks - x.picks || x.avgPos - y.avgPos || x.id.localeCompare(y.id));
  return { total: setlists.length, rows };
}
