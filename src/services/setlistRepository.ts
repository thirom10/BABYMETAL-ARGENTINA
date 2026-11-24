import { isSupabaseConfigured } from '../config/env';
import { MOCK_COMMUNITY } from '../data/community';
import { PEOPLES_BASE_TOTAL, PEOPLES_BASE_VOTES } from '../data/peoples';
import { ensureSession, getSupabase } from '../lib/supabase';
import type { Account, CommunitySetlist, Ranking, ReactionKind, SocialNetwork } from '../types';
import { RepositoryError, toRepositoryError } from './errors';

export const MAX_SETLISTS_PER_ACCOUNT = 3;
export const MAX_OPENERS = 5;

export interface PublishInput {
  name: string;
  author: string;
  songIds: string[];
  openers: string[];
  socialNetwork: SocialNetwork | null;
  socialHandle: string | null;
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
  /** Signed-in account data (nickname, social, usage). Null when there is no real account. */
  account(): Promise<Account | null>;
  publish(input: PublishInput): Promise<CommunitySetlist>;
  /** Deletes a setlist owned by the current account. */
  remove(id: string): Promise<void>;
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
  let profile: Pick<Account, 'nickname' | 'socialNetwork' | 'socialHandle'> = { nickname: null, socialNetwork: null, socialHandle: null };
  const used = () => items.filter((s) => s.isOwn).length;

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
    account: async () => ({ ...profile, used: used(), max: MAX_SETLISTS_PER_ACCOUNT }),
    publish: async ({ name, author, songIds, openers, socialNetwork, socialHandle }) => {
      if (used() >= MAX_SETLISTS_PER_ACCOUNT) throw new RepositoryError('LIMIT_TOTAL');
      profile = { nickname: author, socialNetwork, socialHandle };
      const created: CommunitySetlist = {
        id: `local-${Date.now().toString(36)}`,
        name,
        author,
        songIds: [...songIds],
        openers: [...openers],
        socialNetwork,
        socialHandle,
        createdAt: new Date().toISOString(),
        likes: 0,
        votes: 0,
        copies: 0,
        isOwn: true,
      };
      items.unshift(created);
      return { ...created };
    },
    remove: async (id) => {
      const i = items.findIndex((s) => s.id === id && s.isOwn);
      if (i < 0) throw new RepositoryError('NOT_FOUND');
      items.splice(i, 1);
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
  openers: string[] | null;
  social_network: SocialNetwork | null;
  social_handle: string | null;
}

interface RankingDbRow {
  song_id: string;
  picks: number;
  avg_pos: number | string | null;
  total_setlists: number;
}

interface AccountDbRow {
  nickname: string | null;
  social_network: SocialNetwork | null;
  social_handle: string | null;
  setlists_used: number;
  setlists_max: number;
  is_anonymous: boolean;
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
        openers: r.openers ?? [],
        socialNetwork: r.social_network,
        socialHandle: r.social_handle,
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

    account: async () => {
      const sb = await getSupabase();
      const { data } = await sb.auth.getSession();
      // No session (or only an anonymous one used for likes): there is no account to describe.
      if (!data.session || data.session.user.is_anonymous) return null;
      const rows = await rpc<AccountDbRow[] | null>('my_account');
      const r = rows?.[0];
      if (!r || r.is_anonymous) return null;
      return {
        nickname: r.nickname,
        socialNetwork: r.social_network,
        socialHandle: r.social_handle,
        used: Number(r.setlists_used),
        max: Number(r.setlists_max),
      };
    },

    publish: async ({ name, author, songIds, openers, socialNetwork, socialHandle }) => {
      await ensureSession();
      const rows = await rpc<Array<{ new_id: string; new_created_at: string }> | null>('publish_setlist', {
        p_name: name,
        p_author: author,
        p_song_ids: songIds,
        p_openers: openers,
        p_social_network: socialNetwork,
        p_social_handle: socialHandle,
      });
      const row = rows?.[0];
      if (!row) throw new RepositoryError('UNKNOWN', 'publish_setlist no devolvió datos');
      return {
        id: row.new_id,
        name,
        author,
        songIds: [...songIds],
        openers: [...openers],
        socialNetwork,
        socialHandle,
        createdAt: row.new_created_at,
        likes: 0,
        votes: 0,
        copies: 0,
        isOwn: true,
      };
    },

    remove: async (id) => {
      await rpc<void>('delete_setlist', { p_setlist_id: id });
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
