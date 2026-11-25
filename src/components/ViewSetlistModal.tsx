import { useState } from 'react';
import { useShareCard } from '../hooks/useShareCard';
import { formatDate, formatNumber } from '../lib/format';
import { useStore } from '../state/store';
import type { CommunitySetlist } from '../types';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { SetlistPoster } from './SetlistPoster';
import { SharePanel } from './SharePanel';

/** Full view of a community setlist, with sharing (image of the card + link to build your own). */
export function ViewSetlistModal({ setlist: s, onClose, onCopy }: { setlist: CommunitySetlist; onClose: () => void; onCopy: (s: CommunitySetlist) => void }) {
  const { state } = useStore();
  const [panel, setPanel] = useState(false);
  const live = state.community.find((c) => c.id === s.id) ?? s;

  const card = useShareCard(
    { name: s.name, author: s.author, songIds: s.songIds, socialNetwork: s.socialNetwork, socialHandle: s.socialHandle },
    s.id,
  );

  const onShare = async () => {
    // On phones this opens the system share sheet (WhatsApp, Instagram, etc.).
    // Where that is not supported, show download / copy link / WhatsApp instead.
    const result = await card.share();
    if (result === 'fallback') setPanel(true);
  };

  return (
    <Modal
      title="SETLIST COMPLETO"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onShare} disabled={card.status === 'preparing'} aria-busy={card.status === 'preparing'}>
            <Icon name="share" size={16} /> {card.status === 'preparing' ? 'PREPARANDO…' : 'COMPARTIR'}
          </button>
          <button className="btn btn-primary" onClick={() => onCopy(s)}>
            USAR COMO BASE
          </button>
        </>
      }
    >
      <SetlistPoster
        name={s.name}
        author={`@${s.author}`}
        songIds={s.songIds}
        socialNetwork={s.socialNetwork}
        socialHandle={s.socialHandle}
        meta={`${formatDate(s.createdAt)} · ♥ ${formatNumber(live.likes)}`}
      />
      {panel && <SharePanel card={card} />}
    </Modal>
  );
}
