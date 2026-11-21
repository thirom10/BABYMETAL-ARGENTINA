import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { CommunitySetlist } from '../types';
import { DEFAULT_SETLIST } from '../data/songs';
import { setlistRepository } from '../services/setlistRepository';

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */

export type BuilderTab = 'songs' | 'setlist';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

interface State {
  nickname: string;
  setlistName: string;
  songIds: string[];
  builderTab: BuilderTab;
  community: CommunitySetlist[];
  toasts: Toast[];
  /** id of the setlist most recently published by this visitor (for highlight). */
  lastPublishedId: string | null;
}

type Action =
  | { type: 'nickname'; value: string }
  | { type: 'setlistName'; value: string }
  | { type: 'add'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'move'; from: number; to: number }
  | { type: 'reset' }
  | { type: 'clear' }
  | { type: 'tab'; tab: BuilderTab }
  | { type: 'loadBase'; setlist: CommunitySetlist }
  | { type: 'published'; setlist: CommunitySetlist }
  | { type: 'like'; id: string }
  | { type: 'vote'; id: string }
  | { type: 'toast'; toast: Toast }
  | { type: 'dismissToast'; id: number };

export const MAX_SONGS = 25;

const initialState = (): State => ({
  nickname: '',
  setlistName: '',
  songIds: [...DEFAULT_SETLIST],
  builderTab: 'songs',
  community: setlistRepository.list(),
  toasts: [],
  lastPublishedId: null,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'nickname':
      return { ...state, nickname: action.value };
    case 'setlistName':
      return { ...state, setlistName: action.value };
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
    case 'loadBase':
      return {
        ...state,
        songIds: [...action.setlist.songIds],
        setlistName: `${action.setlist.name} (remix)`.slice(0, 48),
        builderTab: 'setlist',
        community: state.community.map((s) => (s.id === action.setlist.id ? { ...s, copies: s.copies + 1 } : s)),
      };
    case 'published':
      return { ...state, community: [action.setlist, ...state.community], lastPublishedId: action.setlist.id };
    case 'like':
      return {
        ...state,
        community: state.community.map((s) =>
          s.id === action.id ? { ...s, liked: !s.liked, likes: s.likes + (s.liked ? -1 : 1) } : s,
        ),
      };
    case 'vote':
      return {
        ...state,
        community: state.community.map((s) =>
          s.id === action.id ? { ...s, voted: !s.voted, votes: s.votes + (s.voted ? -1 : 1) } : s,
        ),
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
  notify: (message: string, tone?: Toast['tone']) => void;
  publish: () => CommunitySetlist;
}

const StoreContext = createContext<Store | null>(null);

let toastSeq = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = ++toastSeq;
    dispatch({ type: 'toast', toast: { id, message, tone } });
    window.setTimeout(() => dispatch({ type: 'dismissToast', id }), 3600);
  }, []);

  const publish = useCallback(() => {
    const created = setlistRepository.publish({
      name: state.setlistName.trim() || 'Mi setlist soñado',
      author: state.nickname.trim() || 'Fan anónimo',
      songIds: state.songIds,
    });
    dispatch({ type: 'published', setlist: created });
    return created;
  }, [state.setlistName, state.nickname, state.songIds]);

  const value = useMemo(() => ({ state, dispatch, notify, publish }), [state, notify, publish]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
