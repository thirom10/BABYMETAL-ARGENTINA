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
  /** Local-only flags for the current visitor (demo). */
  liked?: boolean;
  voted?: boolean;
  isOwn?: boolean;
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
