import { isSupabaseConfigured } from '../config/env';
import { MOCK_COMMUNITY } from '../data/community';
import { PEOPLES_BASE_TOTAL, PEOPLES_BASE_VOTES } from '../data/peoples';
import { ensureSession, getSupabase } from '../lib/supabase';
import type { CommunitySetlist, Ranking, ReactionKind } from '../types';
import { RepositoryError, toRepositoryError } from './errors';

export interface PublishInput {
  name: string;
  author: string;
  songIds: string[];
}

/**
 * Data-access boundary for community setlists. UI code never talks to a
 * backend directly:
 *   - Supabase configured (VITE_PUBLIC_SUPABASE_*)  -> real shared data.
 *   - Not configured                                 -> in-memory demo data.
 */
export interface SetlistRepository {
  mode: 'mock' | 'supabase';
  list(): Promise<CommunitySetlist[]>;
  ranking(): Promise<Ranking>;
  publish(input: PublishInput): Promise<CommunitySetlist>;
  /** Toggles a like/vote. Resolves to the final state (true = active). */
  toggleReaction(id: string, kind: ReactionKind): Promise<boolean>;
  registerCopy(id: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Mock (no backend) — used when Supabase is not configured            */
/* ------------------------------------------------------------------ */

function createMockRepository(): SetlistRepository {
  const items: CommunitySetlist[] = MOCK_COMMUNITY.map((s) => ({ ...s, isDemo: true }));
  const reactions = new Set<string>();

  return {
    mode: 'mock',
    list: async () => items.map((s) => ({ ...s })),
    ranking: async () => {
      const votes: Record<string, number> = { ...PEOPLES_BASE_VOTES };
      const pos: Record<string, { sum: number; n: number }> = {};
      for (const s of items) {
        s.songIds.forEach((id, i) => {
          votes[id] = (votes[id] ?? 0) + 1;
          const p = (pos[id] ??= { sum: 0, n: 0 });
          p.sum += s.songIds.length > 1 ? i / (s.songIds.length - 1) : 0.5;
          p.n += 1;
        });
      }
      const rows = Object.entries(votes)
        .map(([id, picks]) => ({ id, picks, avgPos: pos[id] ? pos[id].sum / pos[id].n : 0.5 }))
        .sort((a, b) => b.picks - a.picks);
      return { total: PEOPLES_BASE_TOTAL + items.length, rows };
    },
    publish: async ({ name, author, songIds }) => {
      const created: CommunitySetlist = {
        id: `local-${Date.now().toString(36)}`,
        name,
        author,
        songIds: [...songIds],
        createdAt: new Date().toISOString(),
        likes: 0,
        votes: 0,
        copies: 0,
        isOwn: true,
      };
      items.unshift(created);
      return { ...created };
    },
    toggleReaction: async (id, kind) => {
      const key = `${kind}:${id}`;
      if (reactions.has(key)) {
        reactions.delete(key);
        return false;
      }
      reactions.add(key);
      return true;
    },
    registerCopy: async () => {},
  };
}

/* ------------------------------------------------------------------ */
/* Supabase                                                            */
/* ------------------------------------------------------------------ */

interface FeedRow {
  id: string;
  name: string;
  author: string;
  song_ids: string[];
  created_at: string;
  likes: number;
  votes: number;
  copies: number;
  liked: boolean;
  voted: boolean;
  is_own: boolean;
  is_demo: boolean;
}

interface RankingDbRow {
  song_id: string;
  picks: number;
  avg_pos: number | string | null;
  total_setlists: number;
}

function createSupabaseRepository(): SetlistRepository {
  const rpc = async <T>(fn: string, args?: Record<string, unknown>): Promise<T> => {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc(fn, args);
    if (error) throw toRepositoryError(error);
    return data as T;
  };

  return {
    mode: 'supabase',

    list: async () => {
      const rows = (await rpc<FeedRow[] | null>('list_setlists')) ?? [];
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        author: r.author,
        songIds: r.song_ids,
        createdAt: r.created_at,
        likes: Number(r.likes),
        votes: Number(r.votes),
        copies: Number(r.copies),
        liked: r.liked,
        voted: r.voted,
        isOwn: r.is_own,
        isDemo: r.is_demo,
      }));
    },

    ranking: async () => {
      const rows = (await rpc<RankingDbRow[] | null>('people_ranking')) ?? [];
      return {
        total: rows.length ? Number(rows[0].total_setlists) : 0,
        rows: rows.map((r) => ({ id: r.song_id, picks: Number(r.picks), avgPos: r.avg_pos == null ? 0.5 : Number(r.avg_pos) })),
      };
    },

    publish: async ({ name, author, songIds }) => {
      await ensureSession();
      const rows = await rpc<Array<{ new_id: string; new_created_at: string }> | null>('publish_setlist', {
        p_name: name,
        p_author: author,
        p_song_ids: songIds,
      });
      const row = rows?.[0];
      if (!row) throw new RepositoryError('UNKNOWN', 'publish_setlist no devolvió datos');
      return {
        id: row.new_id,
        name,
        author,
        songIds: [...songIds],
        createdAt: row.new_created_at,
        likes: 0,
        votes: 0,
        copies: 0,
        isOwn: true,
      };
    },

    toggleReaction: async (id, kind) => {
      await ensureSession();
      return Boolean(await rpc<boolean>('toggle_reaction', { p_setlist_id: id, p_kind: kind }));
    },

    registerCopy: async (id) => {
      await ensureSession();
      await rpc<void>('register_copy', { p_setlist_id: id });
    },
  };
}

export const setlistRepository: SetlistRepository = isSupabaseConfigured ? createSupabaseRepository() : createMockRepository();
