import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useRadio, type SlotName } from '../state/radio';
import './VideoDock.css';

/**
 * Placeholder where the YouTube video should appear. Shows `children`
 * (our artwork) until the player has been created.
 */
export function VideoSlot({ name, className, children }: { name: SlotName; className?: string; children?: ReactNode }) {
  const { registerSlot, status } = useRadio();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    registerSlot(name, ref.current);
    return () => registerSlot(name, null);
  }, [name, registerSlot]);
  return (
    <div ref={ref} className={`vslot vslot-${name} ${className ?? ''}`} data-live={status !== 'idle' || undefined}>
      {children}
    </div>
  );
}

/**
 * Hosts the single YouTube iframe and keeps it positioned over the active slot.
 * Mounted once at the app root so the iframe never reloads.
 */
export function VideoDock() {
  const { hostRef, getActiveSlot, status, playing, toggle } = useRadio();
  const boxRef = useRef<HTMLDivElement>(null);
  const live = status !== 'idle';
  const pausedForNoSlot = useRef(false);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const tick = () => {
      const box = boxRef.current;
      const slot = getActiveSlot();
      if (box) {
        if (slot) {
          const r = slot.el.getBoundingClientRect();
          box.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
          box.style.width = `${r.width}px`;
          box.style.height = `${r.height}px`;
          box.style.visibility = r.width > 0 ? 'visible' : 'hidden';
          box.dataset.slot = slot.name;
          pausedForNoSlot.current = false;
        } else {
          box.style.visibility = 'hidden';
          // Never play audio with a hidden player.
          if (playing && !pausedForNoSlot.current) {
            pausedForNoSlot.current = true;
            toggle();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, getActiveSlot, playing, toggle]);

  return (
    <div ref={boxRef} className={`vdock ${live ? 'is-live' : ''}`} aria-hidden={!live}>
      <div ref={hostRef} className="vdock-host" />
    </div>
  );
}
