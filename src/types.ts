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
  /** Image slug from src/data/images.ts */
  art: string;
  /** Duration in seconds (demo values for the visual player). */
  duration: number;
}

export type CommunitySort = 'popular' | 'recent' | 'votes';
