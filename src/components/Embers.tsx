import type { CSSProperties } from 'react';

// Decorative floating embers (pure CSS animation, hidden with reduced motion).
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 0.9) % 9}s`,
  duration: `${8 + ((i * 3) % 6)}s`,
  dx: `${((i % 5) - 2) * 18}px`,
  size: 2 + (i % 3),
}));

export function Embers() {
  return (
    <div className="embers" aria-hidden="true">
      {EMBERS.map((e, i) => (
        <span
          key={i}
          style={
            {
              left: e.left,
              animationDelay: e.delay,
              animationDuration: e.duration,
              width: e.size,
              height: e.size,
              '--dx': e.dx,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
