export type Category = 'CLASSICS' | 'METAL FORTH' | 'FAN FAVORITES' | 'WILDCARDS';
export type CategoryFilter = 'ALL' | Category;

export interface Song {
  id: string;
  title: string;
  category: Category;
}

export interface CommunitySetlist {
  id: string;
  name: string;
  author: string;
  songIds: string[];
  /** ISO date string */
  createdAt: string;
  likes: number;
  votes: number;
  copies: number;
  /** Flags for the current visitor. */
  liked?: boolean;
  voted?: boolean;
  isOwn?: boolean;
  /** Marks example setlists seeded by the project (not written by a visitor). */
  isDemo?: boolean;
  /** Local flag: this visitor already used it as a base (avoids double counting). */
  copied?: boolean;
}

export interface RadioTrack {
  songId: string;
  /** Official YouTube video id. */
  youtubeId: string;
  kind: 'MV' | 'LIVE' | 'LYRIC';
  /** Image slug from src/data/images.ts (shown before YouTube loads). */
  art: string;
}

export type CommunitySort = 'popular' | 'recent' | 'votes';

export interface RankingRow {
  id: string;
  /** In how many setlists the song appears. */
  picks: number;
  /** Average position, 0 (opener) to 1 (closer). */
  avgPos: number;
}

export interface Ranking {
  total: number;
  rows: RankingRow[];
}

export type ReactionKind = 'like' | 'vote';
