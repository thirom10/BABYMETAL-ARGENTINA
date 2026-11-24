export type Category = 'CLASSICS' | 'METAL FORTH' | 'FAN FAVORITES' | 'WILDCARDS';
export type CategoryFilter = 'ALL' | Category;

export interface Song {
  id: string;
  title: string;
  category: Category;
}

export type SocialNetwork = 'instagram' | 'tiktok' | 'x' | 'youtube' | 'facebook' | 'twitch';

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
  /** Opening acts (teloneros) the author imagines for the night. */
  openers: string[];
  /** Author's preferred social network + username (both or neither). */
  socialNetwork?: SocialNetwork | null;
  socialHandle?: string | null;
  /** Flags for the current visitor. */
  liked?: boolean;
  voted?: boolean;
  isOwn?: boolean;
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

/** Data about the signed-in account (null while anonymous / signed out). */
export interface Account {
  nickname: string | null;
  socialNetwork: SocialNetwork | null;
  socialHandle: string | null;
  /** Setlists already published by this account. */
  used: number;
  /** Maximum setlists per account. */
  max: number;
}
