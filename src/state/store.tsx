import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { HANDLE_RE } from '../config/social';
import { DEFAULT_SETLIST } from '../data/songs';
import { loadDraft, saveDraft } from '../lib/draft';
import { friendlyError } from '../services/errors';
import { setlistRepository } from '../services/setlistRepository';
import type { Account, CommunitySetlist, Ranking, ReactionKind, SocialNetwork } from '../types';
import { useAuth } from './auth';

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

export type BuilderTab = 'songs' | 'setlist';
export type LoadStatus = 'loading' | 'ready' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

interface State {
  nickname: string;
  setlistName: string;
  songIds: string[];
  openers: string[];
  socialNetwork: SocialNetwork | '';
  socialHandle: string;
  builderTab: BuilderTab;
  community: CommunitySetlist[];
  ranking: Ranking;
  /** Data of the signed-in account (null if signed out). */
  account: Account | null;
  status: LoadStatus;
  toasts: Toast[];
  /** id of the setlist most recently published by this visitor (for highlight). */
  lastPublishedId: string | null;
}

type Action =
  | { type: 'nickname'; value: string }
  | { type: 'setlistName'; value: string }
  | { type: 'openers'; value: string[] }
  | { type: 'social'; network: SocialNetwork | ''; handle: string }
  | { type: 'add'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'move'; from: number; to: number }
  | { type: 'reset' }
  | { type: 'clear' }
  | { type: 'tab'; tab: BuilderTab }
  | { type: 'status'; status: LoadStatus }
  | { type: 'loaded'; community: CommunitySetlist[]; ranking: Ranking }
  | { type: 'ranking'; ranking: Ranking }
  | { type: 'account'; account: Account | null }
  | { type: 'copyBase'; setlist: CommunitySetlist }
  | { type: 'published'; setlist: CommunitySetlist }
  | { type: 'removed'; id: string }
  | { type: 'setReaction'; id: string; kind: ReactionKind; active: boolean }
  | { type: 'toast'; toast: Toast }
  | { type: 'dismissToast'; id: number };

export const MAX_SONGS = 25;

const initialState = (): State => {
  const draft = loadDraft();
  return {
    nickname: draft?.nickname ?? '',
    setlistName: draft?.setlistName ?? '',
    songIds: draft && draft.songIds.length > 0 ? draft.songIds : [...DEFAULT_SETLIST],
    openers: draft?.openers ?? [],
    socialNetwork: draft?.socialNetwork ?? '',
    socialHandle: draft?.socialHandle ?? '',
    builderTab: 'songs',
    community: [],
    ranking: { total: 0, rows: [] },
    account: null,
    status: 'loading',
    toasts: [],
    lastPublishedId: null,
  };
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'nickname':
      return { ...state, nickname: action.value };
    case 'setlistName':
      return { ...state, setlistName: action.value };
    case 'openers':
      return { ...state, openers: action.value };
    case 'social':
      return { ...state, socialNetwork: action.network, socialHandle: action.handle };
    case 'add':
      if (state.songIds.includes(action.id) || state.songIds.length >= MAX_SONGS) return state;
      return { ...state, songIds: [...state.songIds, action.id] };
    case 'remove':
      return { ...state, songIds: state.songIds.filter((s) => s !== action.id) };
    case 'move': {
      const { from, to } = action;
      if (to < 0 || to >= state.songIds.length || from === to) return state;
      const next = [...state.songIds];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...state, songIds: next };
    }
    case 'reset':
      return { ...state, songIds: [...DEFAULT_SETLIST] };
    case 'clear':
      return { ...state, songIds: [] };
    case 'tab':
      return { ...state, builderTab: action.tab };
    case 'status':
      return { ...state, status: action.status };
    case 'loaded': {
      // Keep anything this visitor published while the list was loading.
      const known = new Set(action.community.map((s) => s.id));
      const mine = state.community.filter((s) => s.isOwn && !known.has(s.id));
      return { ...state, community: [...mine, ...action.community], ranking: action.ranking, status: 'ready' };
    }
    case 'ranking':
      return { ...state, ranking: action.ranking };
    case 'account': {
      const a = action.account;
      if (!a) return { ...state, account: null };
      // Pre-fill what the visitor has not typed yet.
      const noSocial = !state.socialNetwork && !state.socialHandle;
      return {
        ...state,
        account: a,
        nickname: state.nickname || a.nickname || '',
        socialNetwork: noSocial ? (a.socialNetwork ?? '') : state.socialNetwork,
        socialHandle: noSocial ? (a.socialHandle ?? '') : state.socialHandle,
      };
    }
    case 'copyBase':
      return {
        ...state,
        songIds: [...action.setlist.songIds],
        openers: [...action.setlist.openers],
        setlistName: `${action.setlist.name} (remix)`.slice(0, 48),
        builderTab: 'setlist',
        community: state.community.map((s) => (s.id === action.setlist.id && !s.copied ? { ...s, copied: true, copies: s.copies + 1 } : s)),
      };
    case 'published':
      return { ...state, community: [action.setlist, ...state.community], lastPublishedId: action.setlist.id };
    case 'removed':
      return {
        ...state,
        community: state.community.filter((s) => s.id !== action.id),
        lastPublishedId: state.lastPublishedId === action.id ? null : state.lastPublishedId,
      };
    case 'setReaction':
      return {
        ...state,
        community: state.community.map((s) => {
          if (s.id !== action.id) return s;
          const key = action.kind === 'like' ? 'liked' : 'voted';
          const count = action.kind === 'like' ? 'likes' : 'votes';
          if (Boolean(s[key]) === action.active) return s;
          return { ...s, [key]: action.active, [count]: s[count] + (action.active ? 1 : -1) };
        }),
      };
    case 'toast':
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] };
    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

interface Store {
  state: State;
  dispatch: React.Dispatch<Action>;
  /** 'mock' = demo data in memory, 'supabase' = shared real data. */
  mode: 'mock' | 'supabase';
  notify: (message: string, tone?: Toast['tone']) => void;
  reload: () => void;
  publish: () => Promise<CommunitySetlist>;
  removeSetlist: (id: string) => Promise<void>;
  react: (id: string, kind: ReactionKind) => void;
  copyAsBase: (setlist: CommunitySetlist) => void;
}

const StoreContext = createContext<Store | null>(null);

let toastSeq = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pending = useRef(new Set<string>());

  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = ++toastSeq;
    dispatch({ type: 'toast', toast: { id, message, tone } });
    window.setTimeout(() => dispatch({ type: 'dismissToast', id }), 3600);
  }, []);

  // Keep the draft in this browser (survives reloads and the trip to Google).
  useEffect(() => {
    saveDraft({
      nickname: state.nickname,
      setlistName: state.setlistName,
      songIds: state.songIds,
      openers: state.openers,
      socialNetwork: state.socialNetwork,
      socialHandle: state.socialHandle,
    });
  }, [state.nickname, state.setlistName, state.songIds, state.openers, state.socialNetwork, state.socialHandle]);

  const load = useCallback(async () => {
    dispatch({ type: 'status', status: 'loading' });
    try {
      const [community, ranking] = await Promise.all([setlistRepository.list(), setlistRepository.ranking()]);
      dispatch({ type: 'loaded', community, ranking });
    } catch (e) {
      console.warn('[store] no se pudo cargar la comunidad:', e);
      dispatch({ type: 'status', status: 'error' });
    }
  }, []);

  const loadAccount = useCallback(async () => {
    try {
      dispatch({ type: 'account', account: await setlistRepository.account() });
    } catch (e) {
      console.warn('[store] no se pudo cargar la cuenta:', e);
    }
  }, []);

  // (Re)load once auth is known, and again whenever the account changes (login / logout).
  useEffect(() => {
    if (auth.status !== 'ready') return;
    void load();
    if (userId) void loadAccount();
    else dispatch({ type: 'account', account: null });
  }, [auth.status, userId, load, loadAccount]);

  const publish = useCallback(async () => {
    const s = stateRef.current;
    const handle = s.socialHandle.trim();
    const hasSocial = Boolean(s.socialNetwork) && HANDLE_RE.test(handle);
    const created = await setlistRepository.publish({
      name: s.setlistName.trim() || 'Mi setlist soñado',
      author: s.nickname.trim() || 'Fan anónimo',
      songIds: s.songIds,
      openers: s.openers,
      socialNetwork: hasSocial && s.socialNetwork ? s.socialNetwork : null,
      socialHandle: hasSocial ? handle : null,
    });
    dispatch({ type: 'published', setlist: created });
    // Background refreshes; failing here is not worth bothering the visitor.
    void setlistRepository
      .ranking()
      .then((ranking) => dispatch({ type: 'ranking', ranking }))
      .catch(() => {});
    void loadAccount();
    return created;
  }, [loadAccount]);

  const removeSetlist = useCallback(
    async (id: string) => {
      await setlistRepository.remove(id);
      dispatch({ type: 'removed', id });
      void setlistRepository
        .ranking()
        .then((ranking) => dispatch({ type: 'ranking', ranking }))
        .catch(() => {});
      void loadAccount();
    },
    [loadAccount],
  );

  const react = useCallback(
    (id: string, kind: ReactionKind) => {
      const key = `${kind}:${id}`;
      if (pending.current.has(key)) return;
      const current = stateRef.current.community.find((s) => s.id === id);
      if (!current) return;
      const want = !(kind === 'like' ? current.liked : current.voted);

      pending.current.add(key);
      dispatch({ type: 'setReaction', id, kind, active: want }); // optimistic
      setlistRepository
        .toggleReaction(id, kind)
        .then((active) => {
          if (active !== want) dispatch({ type: 'setReaction', id, kind, active });
        })
        .catch((e) => {
          dispatch({ type: 'setReaction', id, kind, active: !want }); // revert
          notify(friendlyError(e));
        })
        .finally(() => pending.current.delete(key));
    },
    [notify],
  );

  const copyAsBase = useCallback((setlist: CommunitySetlist) => {
    dispatch({ type: 'copyBase', setlist });
    // Best effort: the visitor already got their copy, the counter can fail silently.
    void setlistRepository.registerCopy(setlist.id).catch(() => {});
  }, []);

  const value = useMemo<Store>(
    () => ({ state, dispatch, mode: setlistRepository.mode, notify, reload: () => void load(), publish, removeSetlist, react, copyAsBase }),
    [state, notify, load, publish, removeSetlist, react, copyAsBase],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
