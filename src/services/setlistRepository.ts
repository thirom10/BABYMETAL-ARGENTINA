import type { CommunitySetlist } from '../types';
import { MOCK_COMMUNITY } from '../data/community';

export interface PublishInput {
  name: string;
  author: string;
  songIds: string[];
}

/**
 * Data-access boundary for community setlists.
 *
 * Today it is backed by in-memory demo data (nothing leaves the browser).
 * A future Supabase implementation should implement this same interface and be
 * swapped in here — UI components never talk to a backend directly.
 */
export interface SetlistRepository {
  list(): CommunitySetlist[];
  publish(input: PublishInput): CommunitySetlist;
}

function createMockRepository(): SetlistRepository {
  return {
    list: () => MOCK_COMMUNITY.map((s) => ({ ...s })),
    publish: ({ name, author, songIds }) => ({
      id: `local-${Date.now().toString(36)}`,
      name,
      author,
      songIds: [...songIds],
      createdAt: new Date().toISOString(),
      likes: 0,
      votes: 0,
      copies: 0,
      isOwn: true,
    }),
  };
}

export const setlistRepository: SetlistRepository = createMockRepository();
