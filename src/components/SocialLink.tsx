import { SOCIAL_BY_ID, socialUrl } from '../config/social';
import type { SocialNetwork } from '../types';
import './SocialLink.css';

/**
 * Link to the author's profile. The handle is validated before building the
 * URL, and the link is opened with noopener/nofollow/ugc because it is user content.
 */
export function SocialLink({ network, handle }: { network?: SocialNetwork | null; handle?: string | null }) {
  const url = socialUrl(network, handle);
  if (!url || !network) return null;
  const info = SOCIAL_BY_ID[network];
  return (
    <a className="social-link" href={url} target="_blank" rel="noopener noreferrer nofollow ugc" title={`${info.label}: @${handle}`}>
      <b>{info.short}</b>@{handle}
    </a>
  );
}

/** "TELONERO: nvlo" / "TELONEROS: a · b" */
export function OpenersLine({ openers, className }: { openers: string[]; className?: string }) {
  if (openers.length === 0) return null;
  return (
    <p className={`openers-line ${className ?? ''}`}>
      <b>{openers.length === 1 ? 'TELONERO' : 'TELONEROS'}</b>
      <span>{openers.join(' · ')}</span>
    </p>
  );
}
