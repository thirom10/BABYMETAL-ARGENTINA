import { CLOSER_ID, EVENT, OPENER_ID } from '../config/event';
import { songTitle } from '../data/songs';
import type { SocialNetwork } from '../types';
import { OpenersLine, SocialLink } from './SocialLink';
import './SetlistPoster.css';

interface Props {
  name: string;
  author: string;
  songIds: string[];
  meta?: string;
  openers?: string[];
  socialNetwork?: SocialNetwork | null;
  socialHandle?: string | null;
}

/** Poster-style rendering of a setlist, used in the publish preview and the full view. */
export function SetlistPoster({ name, author, songIds, meta, openers = [], socialNetwork, socialHandle }: Props) {
  return (
    <article className="poster">
      <header className="poster-head">
        <span className="poster-event">
          {EVENT.artist} · {EVENT.city} · {EVENT.dateShort}
        </span>
        <h3 className="poster-name">{name}</h3>
        <span className="poster-author">
          por <b>{author}</b>
          {meta && <> · {meta}</>}
        </span>
        <SocialLink network={socialNetwork} handle={socialHandle} />
        <OpenersLine openers={openers} className="poster-openers" />
      </header>
      <ol className="poster-list" style={{ '--rows': Math.ceil(songIds.length / 2) } as React.CSSProperties}>
        {songIds.map((id, i) => {
          const special =
            id === OPENER_ID && i === 0 ? 'APERTURA' : id === CLOSER_ID && i === songIds.length - 1 ? 'CIERRE' : null;
          return (
            <li key={id} className={special ? 'is-special' : ''}>
              <span className="poster-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="poster-song">{songTitle(id)}</span>
              {special && <span className="poster-tag">{special}</span>}
            </li>
          );
        })}
      </ol>
      <footer className="poster-foot">
        {songIds.length} canciones · {EVENT.venue} · FAN PROJECT
      </footer>
    </article>
  );
}
